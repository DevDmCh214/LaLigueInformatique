import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/match.dto';

@Injectable()
export class MatchsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.match.findMany({
      include: {
        evenement: { include: { sport: { select: { id: true, nom: true } } } },
        equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
        equipeGagnante: { select: { id: true, nom: true } },
      },
      orderBy: { evenement: { dateHeure: 'asc' } },
    });
  }

  async findOne(id: number) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        evenement: {
          include: {
            sport: true,
            reponses: {
              include: {
                utilisateur: { select: { id: true, nom: true, prenom: true } },
              },
            },
          },
        },
        equipesParticipantes: {
          include: {
            equipe: {
              select: {
                id: true, nom: true, nombrePlaces: true,
                membres: { select: { utilisateurId: true } },
              },
            },
          },
        },
        equipeGagnante: { select: { id: true, nom: true } },
      },
    });
    if (!match) throw new NotFoundException('Match non trouve');
    return match;
  }

  async create(dto: CreateMatchDto) {
    if (dto.equipe1Id === dto.equipe2Id) {
      throw new BadRequestException('Les deux equipes doivent etre differentes');
    }

    if (dto.participants % 2 !== 0) {
      throw new BadRequestException('Le nombre de participants doit etre pair');
    }

    // Validate nb participants <= min team size * 2
    const [equipe1, equipe2] = await Promise.all([
      this.prisma.equipe.findUnique({ where: { id: dto.equipe1Id }, select: { nombrePlaces: true } }),
      this.prisma.equipe.findUnique({ where: { id: dto.equipe2Id }, select: { nombrePlaces: true } }),
    ]);
    if (!equipe1 || !equipe2) {
      throw new BadRequestException('Equipe non trouvee');
    }
    const minTeamSize = Math.min(equipe1.nombrePlaces, equipe2.nombrePlaces);
    if (dto.participants / 2 > minTeamSize) {
      throw new BadRequestException(
        `Le nombre de participants par equipe (${dto.participants / 2}) ne peut pas depasser la taille de la plus petite equipe (${minTeamSize})`,
      );
    }

    return this.prisma.evenement.create({
      data: {
        entitule: dto.entitule,
        participants: dto.participants,
        dateHeure: new Date(dto.dateHeure),
        description: dto.description,
        sportId: dto.sportId,
        match: {
          create: {
            equipesParticipantes: {
              createMany: {
                data: [
                  { equipeId: dto.equipe1Id },
                  { equipeId: dto.equipe2Id },
                ],
              },
            },
          },
        },
      },
      include: {
        sport: true,
        match: {
          include: {
            equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
          },
        },
      },
    });
  }

  async setWinner(id: number, equipeGagnanteId: number | null) {
    const existingMatch = await this.prisma.match.findUnique({
      where: { id },
      include: { evenement: { select: { id: true, participants: true } } },
    });
    if (!existingMatch) throw new NotFoundException('Match non trouve');

    if (existingMatch.equipeGagnanteId) {
      throw new BadRequestException('Le resultat de ce match est deja defini et ne peut plus etre modifie');
    }

    if (equipeGagnanteId !== null && equipeGagnanteId !== undefined) {
      const participation = await this.prisma.equipeParticipante.findFirst({
        where: { matchId: id, equipeId: equipeGagnanteId },
      });
      if (!participation) {
        throw new BadRequestException("L'equipe gagnante doit participer au match");
      }

      const presentCount = await this.prisma.reponse.count({
        where: { evenementId: existingMatch.evenement.id, reponse: 'present' },
      });
      if (presentCount < existingMatch.evenement.participants) {
        throw new BadRequestException(
          `Impossible de definir le gagnant: ${presentCount}/${existingMatch.evenement.participants} participants presents`,
        );
      }
    }

    return this.prisma.match.update({
      where: { id },
      data: { equipeGagnanteId: equipeGagnanteId ?? null },
      include: {
        evenement: { include: { sport: true } },
        equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
        equipeGagnante: { select: { id: true, nom: true } },
      },
    });
  }

  async remove(id: number) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      select: { evenementId: true },
    });
    if (!match) throw new NotFoundException('Match non trouve');

    await this.prisma.evenement.delete({ where: { id: match.evenementId } });
    return { message: 'Match supprime' };
  }
}

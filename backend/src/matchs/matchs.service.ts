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
            equipe: { select: { id: true, nom: true, nombrePlaces: true } },
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
    if (equipeGagnanteId !== null && equipeGagnanteId !== undefined) {
      const participation = await this.prisma.equipeParticipante.findFirst({
        where: { matchId: id, equipeId: equipeGagnanteId },
      });
      if (!participation) {
        throw new BadRequestException("L'equipe gagnante doit participer au match");
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

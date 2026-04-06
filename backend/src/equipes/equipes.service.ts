import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateEquipeDto } from './dto/equipe.dto';

@Injectable()
export class EquipesService {
  constructor(private prisma: PrismaService, private auditService: AuditService) {}

  async findAll() {
    return this.prisma.equipe.findMany({
      include: {
        sport: { select: { id: true, nom: true } },
        _count: { select: { membres: true, participations: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: number) {
    const equipe = await this.prisma.equipe.findUnique({
      where: { id },
      include: {
        sport: { select: { id: true, nom: true } },
        membres: {
          include: {
            utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
          },
        },
        participations: {
          include: {
            match: {
              include: {
                evenement: true,
                equipeGagnante: { select: { id: true, nom: true } },
                equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
              },
            },
          },
          take: 10,
        },
        _count: { select: { membres: true } },
      },
    });
    if (!equipe) throw new NotFoundException('Equipe non trouvee');
    return equipe;
  }

  async create(dto: CreateEquipeDto, userId: number) {
    const equipe = await this.prisma.equipe.create({
      data: {
        nom: dto.nom,
        nombrePlaces: dto.nombrePlaces,
        sportId: dto.sportId,
        membres: { create: { utilisateurId: userId } },
      },
      include: { sport: { select: { id: true, nom: true } } },
    });
    await this.auditService.log({ tableName: 'Equipe', action: 'INSERT', recordId: String(equipe.id), newState: equipe });
    return equipe;
  }

  async update(id: number, dto: CreateEquipeDto) {
    const old = await this.prisma.equipe.findUnique({ where: { id } });
    const equipe = await this.prisma.equipe.update({
      where: { id },
      data: { nom: dto.nom, nombrePlaces: dto.nombrePlaces, sportId: dto.sportId },
    });
    await this.auditService.log({ tableName: 'Equipe', action: 'UPDATE', recordId: String(id), oldState: old, newState: equipe });
    return equipe;
  }

  async remove(id: number) {
    const old = await this.prisma.equipe.findUnique({ where: { id } });
    if (!old) throw new NotFoundException('Equipe non trouvee');

    // Delete all matches this team participates in (via their parent evenement for cascade)
    const participations = await this.prisma.equipeParticipante.findMany({
      where: { equipeId: id },
      select: { match: { select: { evenementId: true } } },
    });
    const evenementIds = participations.map((p) => p.match.evenementId);
    if (evenementIds.length > 0) {
      await this.prisma.evenement.deleteMany({ where: { id: { in: evenementIds } } });
    }

    await this.prisma.equipe.delete({ where: { id } });
    await this.auditService.log({ tableName: 'Equipe', action: 'DELETE', recordId: String(id), oldState: old });
    return { message: 'Equipe supprimee' };
  }

  async addMembre(equipeId: number, email: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { email } });
    if (!utilisateur) throw new NotFoundException('Utilisateur non trouve');

    const existing = await this.prisma.appartenir.findUnique({
      where: { utilisateurId_equipeId: { utilisateurId: utilisateur.id, equipeId } },
    });
    if (existing) throw new ConflictException('Deja membre de cette equipe');

    const equipe = await this.prisma.equipe.findUnique({
      where: { id: equipeId },
      include: { _count: { select: { membres: true } } },
    });
    if (!equipe) throw new NotFoundException('Equipe non trouvee');
    if (equipe._count.membres >= equipe.nombrePlaces) {
      throw new BadRequestException('Equipe complete (plus de places)');
    }

    return this.prisma.appartenir.create({
      data: { utilisateurId: utilisateur.id, equipeId },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } },
    });
  }

  async joinEquipe(equipeId: number, utilisateurId: number) {
    const equipe = await this.prisma.equipe.findUnique({
      where: { id: equipeId },
      include: { _count: { select: { membres: true } } },
    });
    if (!equipe) throw new NotFoundException('Equipe non trouvee');
    if (equipe._count.membres >= equipe.nombrePlaces) {
      throw new BadRequestException('Equipe complete (plus de places)');
    }

    const existing = await this.prisma.appartenir.findUnique({
      where: { utilisateurId_equipeId: { utilisateurId, equipeId } },
    });
    if (existing) throw new ConflictException('Deja membre de cette equipe');

    return this.prisma.appartenir.create({
      data: { utilisateurId, equipeId },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } },
    });
  }

  async leaveEquipe(equipeId: number, utilisateurId: number) {
    await this.prisma.appartenir.delete({
      where: { utilisateurId_equipeId: { utilisateurId, equipeId } },
    });
    return { message: 'Vous avez quitte l\'equipe' };
  }

  async removeMembre(equipeId: number, utilisateurId: number) {
    await this.prisma.appartenir.delete({
      where: { utilisateurId_equipeId: { utilisateurId, equipeId } },
    });
    return { message: 'Membre retire' };
  }
}

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipeDto } from './dto/equipe.dto';

@Injectable()
export class EquipesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.equipe.findMany({
      include: {
        _count: { select: { membres: true, participations: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: number) {
    const equipe = await this.prisma.equipe.findUnique({
      where: { id },
      include: {
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
    return this.prisma.equipe.create({
      data: {
        nom: dto.nom,
        nombrePlaces: dto.nombrePlaces,
        membres: { create: { utilisateurId: userId } },
      },
    });
  }

  async update(id: number, dto: CreateEquipeDto) {
    return this.prisma.equipe.update({
      where: { id },
      data: { nom: dto.nom, nombrePlaces: dto.nombrePlaces },
    });
  }

  async remove(id: number) {
    await this.prisma.equipe.delete({ where: { id } });
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

  async removeMembre(equipeId: number, utilisateurId: number) {
    await this.prisma.appartenir.delete({
      where: { utilisateurId_equipeId: { utilisateurId, equipeId } },
    });
    return { message: 'Membre retire' };
  }
}

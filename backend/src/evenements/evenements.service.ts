import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvenementDto } from './dto/evenement.dto';

@Injectable()
export class EvenementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(sportId?: number, userId?: number) {
    return this.prisma.evenement.findMany({
      where: sportId ? { sportId } : undefined,
      include: {
        sport: { select: { id: true, nom: true } },
        match: {
          include: {
            equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
            equipeGagnante: { select: { id: true, nom: true } },
          },
        },
        reponses: userId ? { where: { utilisateurId: userId }, select: { reponse: true } } : undefined,
        _count: { select: { reponses: true } },
      },
      orderBy: { dateHeure: 'asc' },
    });
  }

  async findOne(id: number) {
    const evenement = await this.prisma.evenement.findUnique({
      where: { id },
      include: {
        sport: true,
        reponses: {
          include: {
            utilisateur: { select: { id: true, nom: true, prenom: true } },
          },
        },
        match: {
          include: {
            equipesParticipantes: { include: { equipe: { select: { id: true, nom: true } } } },
            equipeGagnante: { select: { id: true, nom: true } },
          },
        },
      },
    });
    if (!evenement) throw new NotFoundException('Evenement non trouve');
    return evenement;
  }

  async create(dto: CreateEvenementDto) {
    return this.prisma.evenement.create({
      data: {
        entitule: dto.entitule,
        participants: dto.participants,
        dateHeure: new Date(dto.dateHeure),
        description: dto.description,
        sportId: dto.sportId,
      },
      include: { sport: true },
    });
  }

  async update(id: number, dto: CreateEvenementDto) {
    return this.prisma.evenement.update({
      where: { id },
      data: {
        entitule: dto.entitule,
        participants: dto.participants,
        dateHeure: new Date(dto.dateHeure),
        description: dto.description,
        sportId: dto.sportId,
      },
    });
  }

  async remove(id: number) {
    await this.prisma.evenement.delete({ where: { id } });
    return { message: 'Evenement supprime' };
  }
}

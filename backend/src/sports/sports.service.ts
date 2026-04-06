import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateSportDto } from './dto/sport.dto';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService, private auditService: AuditService) {}

  async findAll() {
    return this.prisma.sport.findMany({
      include: {
        _count: { select: { evenements: true, inscriptions: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: number) {
    const sport = await this.prisma.sport.findUnique({
      where: { id },
      include: {
        evenements: { orderBy: { dateHeure: 'asc' }, include: { match: true } },
        inscriptions: {
          include: {
            utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
          },
        },
      },
    });
    if (!sport) throw new NotFoundException('Sport non trouve');
    return sport;
  }

  async create(dto: CreateSportDto) {
    const sport = await this.prisma.sport.create({ data: { nom: dto.nom } });
    await this.auditService.log({ tableName: 'Sport', action: 'INSERT', recordId: String(sport.id), newState: sport });
    return sport;
  }

  async update(id: number, dto: CreateSportDto) {
    const old = await this.prisma.sport.findUnique({ where: { id } });
    const sport = await this.prisma.sport.update({ where: { id }, data: { nom: dto.nom } });
    await this.auditService.log({ tableName: 'Sport', action: 'UPDATE', recordId: String(id), oldState: old, newState: sport });
    return sport;
  }

  async remove(id: number) {
    // Find all events for this sport, then delete matches, responses, and events
    const evenements = await this.prisma.evenement.findMany({
      where: { sportId: id },
      select: { id: true },
    });
    const eventIds = evenements.map((e) => e.id);

    // Find all teams for this sport
    const equipes = await this.prisma.equipe.findMany({
      where: { sportId: id },
      select: { id: true },
    });
    const equipeIds = equipes.map((e) => e.id);

    // Delete in correct order to avoid FK violations
    if (eventIds.length > 0) {
      // Delete match-related data for these events
      const matchs = await this.prisma.match.findMany({
        where: { evenementId: { in: eventIds } },
        select: { id: true },
      });
      const matchIds = matchs.map((m) => m.id);
      if (matchIds.length > 0) {
        await this.prisma.equipeParticipante.deleteMany({ where: { matchId: { in: matchIds } } });
        await this.prisma.match.deleteMany({ where: { id: { in: matchIds } } });
      }
      await this.prisma.reponse.deleteMany({ where: { evenementId: { in: eventIds } } });
      await this.prisma.evenement.deleteMany({ where: { id: { in: eventIds } } });
    }

    if (equipeIds.length > 0) {
      // Clear equipeGagnanteId references before deleting teams
      await this.prisma.match.updateMany({
        where: { equipeGagnanteId: { in: equipeIds } },
        data: { equipeGagnanteId: null },
      });
      await this.prisma.equipeParticipante.deleteMany({ where: { equipeId: { in: equipeIds } } });
      await this.prisma.appartenir.deleteMany({ where: { equipeId: { in: equipeIds } } });
      await this.prisma.equipe.deleteMany({ where: { sportId: id } });
    }

    // Delete sport inscriptions and the sport itself
    await this.prisma.sportInscription.deleteMany({ where: { sportId: id } });
    const sport = await this.prisma.sport.findUnique({ where: { id } });
    await this.prisma.sport.delete({ where: { id } });
    await this.auditService.log({ tableName: 'Sport', action: 'DELETE', recordId: String(id), oldState: sport });
    return { message: 'Sport supprime' };
  }
}

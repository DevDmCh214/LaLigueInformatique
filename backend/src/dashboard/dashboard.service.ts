import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: number) {
    const [equipes, evenements, reponseCount, sportsInscrits] = await Promise.all([
      this.prisma.equipe.findMany({
        where: { membres: { some: { utilisateurId: userId } } },
        include: { sport: { select: { id: true, nom: true } }, _count: { select: { membres: true } } },
      }),
      this.prisma.evenement.findMany({
        where: { dateHeure: { gte: new Date() } },
        include: {
          sport: { select: { id: true, nom: true } },
          match: {
            include: {
              equipesParticipantes: { include: { equipe: { select: { nom: true } } } },
            },
          },
        },
        orderBy: { dateHeure: 'asc' },
        take: 5,
      }),
      this.prisma.reponse.count({ where: { utilisateurId: userId } }),
      this.prisma.sportInscription.count({ where: { utilisateurId: userId } }),
    ]);

    return { equipes, evenements, reponseCount, sportsInscrits };
  }
}

import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InscriptionsService {
  constructor(private prisma: PrismaService) {}

  async findByUser(utilisateurId: number) {
    return this.prisma.sportInscription.findMany({
      where: { utilisateurId },
      include: { sport: true },
    });
  }

  async subscribe(utilisateurId: number, sportId: number) {
    const existing = await this.prisma.sportInscription.findUnique({
      where: { utilisateurId_sportId: { utilisateurId, sportId } },
    });
    if (existing) throw new ConflictException('Deja inscrit a ce sport');

    return this.prisma.sportInscription.create({
      data: { utilisateurId, sportId },
      include: { sport: true },
    });
  }

  async unsubscribe(utilisateurId: number, sportId: number) {
    await this.prisma.sportInscription.delete({
      where: { utilisateurId_sportId: { utilisateurId, sportId } },
    });
    return { message: 'Desinscrit du sport' };
  }
}

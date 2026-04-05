import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSportDto } from './dto/sport.dto';

@Injectable()
export class SportsService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.sport.create({ data: { nom: dto.nom } });
  }

  async update(id: number, dto: CreateSportDto) {
    return this.prisma.sport.update({
      where: { id },
      data: { nom: dto.nom },
    });
  }

  async remove(id: number) {
    await this.prisma.sport.delete({ where: { id } });
    return { message: 'Sport supprime' };
  }
}

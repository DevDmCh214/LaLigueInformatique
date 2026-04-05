import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReponseDto } from './dto/reponse.dto';

@Injectable()
export class ReponsesService {
  constructor(private prisma: PrismaService) {}

  async upsert(dto: CreateReponseDto, utilisateurId: number) {
    return this.prisma.reponse.upsert({
      where: {
        utilisateurId_evenementId: {
          utilisateurId,
          evenementId: dto.evenementId,
        },
      },
      update: { reponse: dto.reponse },
      create: {
        utilisateurId,
        evenementId: dto.evenementId,
        reponse: dto.reponse,
      },
    });
  }
}

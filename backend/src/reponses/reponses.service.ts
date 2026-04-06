import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReponseDto } from './dto/reponse.dto';

@Injectable()
export class ReponsesService {
  constructor(private prisma: PrismaService) {}

  async upsert(dto: CreateReponseDto, utilisateurId: number) {
    // Check if marking "present" would exceed participant limit
    if (dto.reponse === 'present') {
      const evenement = await this.prisma.evenement.findUnique({
        where: { id: dto.evenementId },
        select: { participants: true },
      });
      if (evenement) {
        const currentPresent = await this.prisma.reponse.count({
          where: {
            evenementId: dto.evenementId,
            reponse: 'present',
            utilisateurId: { not: utilisateurId },
          },
        });
        if (currentPresent >= evenement.participants) {
          throw new BadRequestException('Le nombre maximum de participants presents est atteint');
        }
      }
    }

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

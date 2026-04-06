import { Test, TestingModule } from '@nestjs/testing';
import { ReponsesService } from './reponses.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('ReponsesService', () => {
  let service: ReponsesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      reponse: { upsert: jest.fn(), count: jest.fn() },
      evenement: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReponsesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReponsesService>(ReponsesService);
  });

  it('should upsert a response', async () => {
    prisma.evenement.findUnique.mockResolvedValue({ participants: 10 });
    prisma.reponse.count.mockResolvedValue(5);
    prisma.reponse.upsert.mockResolvedValue({ id: 1, reponse: 'present' });

    const result = await service.upsert({ evenementId: 1, reponse: 'present' }, 1);
    expect(result.reponse).toBe('present');
  });

  it('should block present when event is full', async () => {
    prisma.evenement.findUnique.mockResolvedValue({ participants: 5 });
    prisma.reponse.count.mockResolvedValue(5);

    await expect(
      service.upsert({ evenementId: 1, reponse: 'present' }, 99),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow absent even when event is full', async () => {
    prisma.reponse.upsert.mockResolvedValue({ id: 1, reponse: 'absent' });

    const result = await service.upsert({ evenementId: 1, reponse: 'absent' }, 1);
    expect(result.reponse).toBe('absent');
  });
});

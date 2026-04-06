import { Test, TestingModule } from '@nestjs/testing';
import { MatchsService } from './matchs.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('MatchsService', () => {
  let service: MatchsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      match: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      evenement: { create: jest.fn(), delete: jest.fn() },
      equipe: { findUnique: jest.fn() },
      equipeParticipante: { findFirst: jest.fn() },
      reponse: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MatchsService>(MatchsService);
  });

  describe('create', () => {
    it('should reject same team for both sides', async () => {
      await expect(
        service.create({
          entitule: 'Test', participants: 4, dateHeure: '2026-01-01', sportId: 1,
          equipe1Id: 1, equipe2Id: 1, description: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject odd participant count', async () => {
      await expect(
        service.create({
          entitule: 'Test', participants: 3, dateHeure: '2026-01-01', sportId: 1,
          equipe1Id: 1, equipe2Id: 2, description: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject participants exceeding smaller team size', async () => {
      prisma.equipe.findUnique
        .mockResolvedValueOnce({ nombrePlaces: 5 })
        .mockResolvedValueOnce({ nombrePlaces: 3 });

      await expect(
        service.create({
          entitule: 'Test', participants: 8, dateHeure: '2026-01-01', sportId: 1,
          equipe1Id: 1, equipe2Id: 2, description: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept valid match creation', async () => {
      prisma.equipe.findUnique
        .mockResolvedValueOnce({ nombrePlaces: 5 })
        .mockResolvedValueOnce({ nombrePlaces: 5 });
      prisma.evenement.create.mockResolvedValue({ id: 1, match: { id: 1 } });

      const result = await service.create({
        entitule: 'Test', participants: 4, dateHeure: '2026-01-01', sportId: 1,
        equipe1Id: 1, equipe2Id: 2, description: '',
      });

      expect(result).toBeDefined();
    });
  });

  describe('setWinner', () => {
    it('should reject winner when not all participants present', async () => {
      prisma.equipeParticipante.findFirst.mockResolvedValue({ id: 1 });
      prisma.match.findUnique.mockResolvedValue({
        id: 1, evenement: { id: 10, participants: 6 },
      });
      prisma.reponse.count.mockResolvedValue(4);

      await expect(service.setWinner(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should allow winner when all participants present', async () => {
      prisma.equipeParticipante.findFirst.mockResolvedValue({ id: 1 });
      prisma.match.findUnique.mockResolvedValue({
        id: 1, evenement: { id: 10, participants: 6 },
      });
      prisma.reponse.count.mockResolvedValue(6);
      prisma.match.update.mockResolvedValue({ id: 1, equipeGagnanteId: 1 });

      const result = await service.setWinner(1, 1);
      expect(result.equipeGagnanteId).toBe(1);
    });

    it('should allow removing winner (null)', async () => {
      prisma.match.update.mockResolvedValue({ id: 1, equipeGagnanteId: null });

      const result = await service.setWinner(1, null);
      expect(result.equipeGagnanteId).toBeNull();
    });
  });
});

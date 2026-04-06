import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SessionService', () => {
  let service: SessionService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      connexion: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  describe('createSession', () => {
    it('should create a session with 30min expiry', async () => {
      prisma.session.create.mockResolvedValue({ id: 'uuid-1', utilisateurId: 1 });

      const result = await service.createSession(1, '127.0.0.1');

      expect(prisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            utilisateurId: 1,
            ipAddress: '127.0.0.1',
          }),
        }),
      );
      expect(result.id).toBe('uuid-1');
    });
  });

  describe('validateSession', () => {
    it('should return true for active non-expired session', async () => {
      prisma.session.findUnique.mockResolvedValue({
        id: 'uuid-1',
        isActive: true,
        expiresAt: new Date(Date.now() + 60000),
      });

      expect(await service.validateSession('uuid-1')).toBe(true);
    });

    it('should return false for inactive session', async () => {
      prisma.session.findUnique.mockResolvedValue({
        id: 'uuid-1',
        isActive: false,
        expiresAt: new Date(Date.now() + 60000),
      });

      expect(await service.validateSession('uuid-1')).toBe(false);
    });

    it('should return false and deactivate expired session', async () => {
      prisma.session.findUnique.mockResolvedValue({
        id: 'uuid-1',
        isActive: true,
        expiresAt: new Date(Date.now() - 60000),
      });
      prisma.session.update.mockResolvedValue({});

      expect(await service.validateSession('uuid-1')).toBe(false);
      expect(prisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'uuid-1' }, data: { isActive: false } }),
      );
    });

    it('should return false for non-existent session', async () => {
      prisma.session.findUnique.mockResolvedValue(null);
      expect(await service.validateSession('non-existent')).toBe(false);
    });
  });

  describe('isRateLimited', () => {
    it('should return true when 5+ failures in window', async () => {
      prisma.connexion.count.mockResolvedValue(5);
      expect(await service.isRateLimited('127.0.0.1')).toBe(true);
    });

    it('should return false when under 5 failures', async () => {
      prisma.connexion.count.mockResolvedValue(3);
      expect(await service.isRateLimited('127.0.0.1')).toBe(false);
    });
  });

  describe('logConnexion', () => {
    it('should log a connection attempt', async () => {
      prisma.connexion.create.mockResolvedValue({});
      await service.logConnexion('127.0.0.1', 1, true);
      expect(prisma.connexion.create).toHaveBeenCalledWith({
        data: { ipAddress: '127.0.0.1', utilisateurId: 1, success: true },
      });
    });
  });

  describe('deactivateSession', () => {
    it('should set isActive to false', async () => {
      prisma.session.update.mockResolvedValue({});
      await service.deactivateSession('uuid-1');
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { isActive: false },
      });
    });
  });
});

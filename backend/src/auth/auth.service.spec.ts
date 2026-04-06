import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from '../session/session.service';
import { AuditService } from '../audit/audit.service';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let sessionService: any;
  let auditService: any;

  beforeEach(async () => {
    prisma = {
      utilisateur: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue('test-token') };
    sessionService = {
      isRateLimited: jest.fn().mockResolvedValue(false),
      createSession: jest.fn().mockResolvedValue({ id: 'session-123' }),
      logConnexion: jest.fn().mockResolvedValue(undefined),
      deactivateSession: jest.fn().mockResolvedValue(undefined),
    };
    auditService = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: SessionService, useValue: sessionService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);
      prisma.utilisateur.create.mockResolvedValue({
        id: 1, nom: 'Test', prenom: 'User', email: 'test@example.com', role: 'utilisateur',
      });

      const result = await service.signup({
        nom: 'Test', prenom: 'User', email: 'test@example.com', password: 'Password1!',
      });

      expect(result.userId).toBe(1);
      expect(prisma.utilisateur.create).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ tableName: 'Utilisateur', action: 'INSERT' }),
      );
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.utilisateur.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        service.signup({ nom: 'Test', prenom: 'User', email: 'test@example.com', password: 'Password1!' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const hashedPwd = bcrypt.hashSync('Password1!', 10);

    it('should return access_token on valid credentials', async () => {
      prisma.utilisateur.findUnique.mockResolvedValue({
        id: 1, nom: 'Test', prenom: 'User', email: 'test@example.com', mdp: hashedPwd, role: 'utilisateur',
      });

      const result = await service.login({ email: 'test@example.com', password: 'Password1!' }, '127.0.0.1');

      expect(result.access_token).toBe('test-token');
      expect(sessionService.createSession).toHaveBeenCalledWith(1, '127.0.0.1');
      expect(sessionService.logConnexion).toHaveBeenCalledWith('127.0.0.1', 1, true);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      prisma.utilisateur.findUnique.mockResolvedValue({
        id: 1, email: 'test@example.com', mdp: hashedPwd,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
      expect(sessionService.logConnexion).toHaveBeenCalledWith('127.0.0.1', 1, false);
    });

    it('should throw UnauthorizedException on unknown email', async () => {
      prisma.utilisateur.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'Password1!' }, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
      expect(sessionService.logConnexion).toHaveBeenCalledWith('127.0.0.1', null, false);
    });

    it('should throw ForbiddenException when rate-limited', async () => {
      sessionService.isRateLimited.mockResolvedValue(true);

      await expect(
        service.login({ email: 'test@example.com', password: 'Password1!' }, '127.0.0.1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('logout', () => {
    it('should deactivate session', async () => {
      await service.logout('session-123');
      expect(sessionService.deactivateSession).toHaveBeenCalledWith('session-123');
    });
  });
});

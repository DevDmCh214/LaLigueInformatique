import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SessionService } from '../session/session.service';
import { AuditService } from '../audit/audit.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private auditService: AuditService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe deja');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.utilisateur.create({
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
        email: dto.email,
        mdp: hashedPassword,
      },
    });

    await this.auditService.log({
      tableName: 'Utilisateur',
      action: 'INSERT',
      recordId: String(user.id),
      newState: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
    });

    return { message: 'Compte cree avec succes', userId: user.id };
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const ip = ipAddress || 'unknown';

    // Rate limiting check
    if (await this.sessionService.isRateLimited(ip)) {
      throw new ForbiddenException('Trop de tentatives. Reessayez dans 30 secondes.');
    }

    const user = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      await this.sessionService.logConnexion(ip, null, false);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const valid = await bcrypt.compare(dto.password, user.mdp);
    if (!valid) {
      await this.sessionService.logConnexion(ip, user.id, false);
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Create server-side session
    const session = await this.sessionService.createSession(user.id, ip);

    // Log successful connection
    await this.sessionService.logConnexion(ip, user.id, true);

    // JWT contains minimal data — just user id and session id
    const payload = { sub: user.id, email: user.email, role: user.role, sessionId: session.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(sessionId: string) {
    if (sessionId) {
      await this.sessionService.deactivateSession(sessionId);
    }
    return { message: 'Deconnexion reussie' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      include: {
        sportsInscrits: { include: { sport: true } },
        appartenances: { include: { equipe: true } },
      },
    });
    if (!user) return null;

    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      sportsInscrits: user.sportsInscrits,
      appartenances: user.appartenances,
    };
  }
}

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    return { message: 'Compte cree avec succes', userId: user.id };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const valid = await bcrypt.compare(dto.password, user.mdp);
    if (!valid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
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

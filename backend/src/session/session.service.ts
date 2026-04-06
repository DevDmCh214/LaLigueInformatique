import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30 seconds
const MAX_FAILED_ATTEMPTS = 5;

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  /** Create a new session for a user */
  async createSession(utilisateurId: number, ipAddress?: string) {
    return this.prisma.session.create({
      data: {
        utilisateurId,
        ipAddress: ipAddress ?? null,
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      },
    });
  }

  /** Validate that a session exists, is active, and has not expired */
  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session || !session.isActive) return false;
    if (session.expiresAt < new Date()) {
      // Mark expired session as inactive
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { isActive: false },
      });
      return false;
    }
    return true;
  }

  /** Deactivate a session (logout) */
  async deactivateSession(sessionId: string) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  /** Deactivate all sessions for a user */
  async deactivateAllSessions(utilisateurId: number) {
    await this.prisma.session.updateMany({
      where: { utilisateurId, isActive: true },
      data: { isActive: false },
    });
  }

  /** Log a connection attempt (success or failure) */
  async logConnexion(ipAddress: string, utilisateurId: number | null, success: boolean) {
    await this.prisma.connexion.create({
      data: {
        ipAddress,
        utilisateurId,
        success,
      },
    });
  }

  /** Check if an IP is rate-limited (too many failed attempts) */
  async isRateLimited(ipAddress: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const failedAttempts = await this.prisma.connexion.count({
      where: {
        ipAddress,
        success: false,
        attemptedAt: { gte: windowStart },
      },
    });
    return failedAttempts >= MAX_FAILED_ATTEMPTS;
  }

  /** Get recent connexion logs */
  async getRecentConnexions(limit = 50) {
    return this.prisma.connexion.findMany({
      orderBy: { attemptedAt: 'desc' },
      take: limit,
      include: {
        utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
      },
    });
  }

  /** Clean up expired sessions */
  async cleanExpiredSessions() {
    await this.prisma.session.updateMany({
      where: { expiresAt: { lt: new Date() }, isActive: true },
      data: { isActive: false },
    });
  }
}

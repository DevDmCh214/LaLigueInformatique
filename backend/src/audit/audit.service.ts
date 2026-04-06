import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    utilisateurId?: number;
    tableName: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    recordId: string;
    oldState?: unknown;
    newState?: unknown;
  }) {
    await this.prisma.auditLog.create({
      data: {
        utilisateurId: params.utilisateurId ?? null,
        tableName: params.tableName,
        action: params.action,
        recordId: params.recordId,
        oldState: params.oldState ? JSON.stringify(params.oldState) : null,
        newState: params.newState ? JSON.stringify(params.newState) : null,
      },
    });
  }

  async findAll(limit = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { AuditModule } from './audit/audit.module';
import { SportsModule } from './sports/sports.module';
import { EquipesModule } from './equipes/equipes.module';
import { EvenementsModule } from './evenements/evenements.module';
import { MatchsModule } from './matchs/matchs.module';
import { ReponsesModule } from './reponses/reponses.module';
import { InscriptionsModule } from './inscriptions/inscriptions.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    SessionModule,
    AuditModule,
    AuthModule,
    SportsModule,
    EquipesModule,
    EvenementsModule,
    MatchsModule,
    ReponsesModule,
    InscriptionsModule,
    DashboardModule,
  ],
})
export class AppModule {}

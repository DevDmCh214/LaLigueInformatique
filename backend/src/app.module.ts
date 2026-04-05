import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
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

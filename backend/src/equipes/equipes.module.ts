import { Module } from '@nestjs/common';
import { EquipesController } from './equipes.controller';
import { EquipesService } from './equipes.service';

@Module({
  controllers: [EquipesController],
  providers: [EquipesService],
})
export class EquipesModule {}

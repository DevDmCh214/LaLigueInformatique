import { Module } from '@nestjs/common';
import { ReponsesController } from './reponses.controller';
import { ReponsesService } from './reponses.service';

@Module({
  controllers: [ReponsesController],
  providers: [ReponsesService],
})
export class ReponsesModule {}

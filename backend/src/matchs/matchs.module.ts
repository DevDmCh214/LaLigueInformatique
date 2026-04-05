import { Module } from '@nestjs/common';
import { MatchsController } from './matchs.controller';
import { MatchsService } from './matchs.service';

@Module({
  controllers: [MatchsController],
  providers: [MatchsService],
})
export class MatchsModule {}

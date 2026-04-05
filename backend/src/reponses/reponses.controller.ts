import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReponsesService } from './reponses.service';
import { CreateReponseDto } from './dto/reponse.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reponses')
export class ReponsesController {
  constructor(private reponsesService: ReponsesService) {}

  @Post()
  upsert(@Body() dto: CreateReponseDto, @Request() req) {
    return this.reponsesService.upsert(dto, req.user.userId);
  }
}

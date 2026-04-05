import { Controller, Get, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { InscriptionsService } from './inscriptions.service';
import { InscriptionDto } from './dto/inscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inscriptions')
export class InscriptionsController {
  constructor(private inscriptionsService: InscriptionsService) {}

  @Get()
  findByUser(@Request() req) {
    return this.inscriptionsService.findByUser(req.user.userId);
  }

  @Post()
  subscribe(@Body() dto: InscriptionDto, @Request() req) {
    return this.inscriptionsService.subscribe(req.user.userId, dto.sportId);
  }

  @Delete()
  unsubscribe(@Body() dto: InscriptionDto, @Request() req) {
    return this.inscriptionsService.unsubscribe(req.user.userId, dto.sportId);
  }
}

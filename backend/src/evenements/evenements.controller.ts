import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { EvenementsService } from './evenements.service';
import { CreateEvenementDto } from './dto/evenement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('evenements')
export class EvenementsController {
  constructor(private evenementsService: EvenementsService) {}

  @Get()
  findAll(@Query('sportId') sportId?: string, @Request() req?) {
    return this.evenementsService.findAll(
      sportId ? Number(sportId) : undefined,
      req?.user?.userId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.evenementsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEvenementDto) {
    return this.evenementsService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateEvenementDto) {
    return this.evenementsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.evenementsService.remove(id);
  }
}

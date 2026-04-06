import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { EvenementsService } from './evenements.service';
import { CreateEvenementDto } from './dto/evenement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles('admin')
  create(@Body() dto: CreateEvenementDto) {
    return this.evenementsService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateEvenementDto) {
    return this.evenementsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.evenementsService.remove(id);
  }
}

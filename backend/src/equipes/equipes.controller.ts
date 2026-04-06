import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { EquipesService } from './equipes.service';
import { CreateEquipeDto } from './dto/equipe.dto';
import { AddMembreDto, RemoveMembreDto } from './dto/membre.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipes')
export class EquipesController {
  constructor(private equipesService: EquipesService) {}

  @Get()
  findAll() {
    return this.equipesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipesService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateEquipeDto, @Request() req) {
    return this.equipesService.create(dto, req.user.userId);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateEquipeDto) {
    return this.equipesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.equipesService.remove(id);
  }

  @Post(':id/membres')
  @Roles('admin')
  addMembre(@Param('id', ParseIntPipe) id: number, @Body() dto: AddMembreDto) {
    return this.equipesService.addMembre(id, dto.email);
  }

  @Delete(':id/membres')
  @Roles('admin')
  removeMembre(@Param('id', ParseIntPipe) id: number, @Body() dto: RemoveMembreDto) {
    return this.equipesService.removeMembre(id, dto.utilisateurId);
  }
}

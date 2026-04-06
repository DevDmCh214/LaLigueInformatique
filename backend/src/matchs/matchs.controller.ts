import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MatchsService } from './matchs.service';
import { CreateMatchDto } from './dto/match.dto';
import { SetWinnerDto } from './dto/set-winner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('matchs')
export class MatchsController {
  constructor(private matchsService: MatchsService) {}

  @Get()
  findAll() {
    return this.matchsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateMatchDto) {
    return this.matchsService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  setWinner(@Param('id', ParseIntPipe) id: number, @Body() dto: SetWinnerDto) {
    return this.matchsService.setWinner(id, dto.equipeGagnanteId ?? null);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchsService.remove(id);
  }
}

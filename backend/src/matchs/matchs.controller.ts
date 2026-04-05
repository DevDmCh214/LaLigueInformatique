import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MatchsService } from './matchs.service';
import { CreateMatchDto } from './dto/match.dto';
import { SetWinnerDto } from './dto/set-winner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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
  create(@Body() dto: CreateMatchDto) {
    return this.matchsService.create(dto);
  }

  @Put(':id')
  setWinner(@Param('id', ParseIntPipe) id: number, @Body() dto: SetWinnerDto) {
    return this.matchsService.setWinner(id, dto.equipeGagnanteId ?? null);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchsService.remove(id);
  }
}

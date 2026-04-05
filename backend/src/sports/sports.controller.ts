import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SportsService } from './sports.service';
import { CreateSportDto } from './dto/sport.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sports')
export class SportsController {
  constructor(private sportsService: SportsService) {}

  @Get()
  findAll() {
    return this.sportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sportsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSportDto) {
    return this.sportsService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateSportDto) {
    return this.sportsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sportsService.remove(id);
  }
}

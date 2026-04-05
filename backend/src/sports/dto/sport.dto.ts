import { IsString, MinLength } from 'class-validator';

export class CreateSportDto {
  @IsString()
  @MinLength(2, { message: 'Le nom du sport doit contenir au moins 2 caracteres' })
  nom: string;
}

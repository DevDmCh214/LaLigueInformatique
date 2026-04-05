import { IsString, MinLength, IsInt, Min, IsOptional, IsDateString } from 'class-validator';

export class CreateEvenementDto {
  @IsString()
  @MinLength(2, { message: 'Le titre doit contenir au moins 2 caracteres' })
  entitule: string;

  @IsInt()
  @Min(1, { message: 'Le nombre de participants doit etre au moins 1' })
  participants: number;

  @IsString()
  dateHeure: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  sportId: number;
}

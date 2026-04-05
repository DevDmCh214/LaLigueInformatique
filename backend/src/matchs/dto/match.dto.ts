import { IsString, MinLength, IsInt, Min, IsOptional } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @MinLength(2, { message: 'Le titre doit contenir au moins 2 caracteres' })
  entitule: string;

  @IsInt()
  @Min(1)
  participants: number;

  @IsString()
  dateHeure: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  sportId: number;

  @IsInt()
  equipe1Id: number;

  @IsInt()
  equipe2Id: number;
}

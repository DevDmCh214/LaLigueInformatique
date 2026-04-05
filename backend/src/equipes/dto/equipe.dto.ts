import { IsString, MinLength, IsInt, Min } from 'class-validator';

export class CreateEquipeDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caracteres' })
  nom: string;

  @IsInt()
  @Min(1, { message: 'Le nombre de places doit etre au moins 1' })
  nombrePlaces: number;
}

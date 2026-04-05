import { IsInt } from 'class-validator';

export class InscriptionDto {
  @IsInt()
  sportId: number;
}

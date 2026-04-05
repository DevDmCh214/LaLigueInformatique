import { IsInt, IsOptional } from 'class-validator';

export class SetWinnerDto {
  @IsOptional()
  @IsInt()
  equipeGagnanteId?: number | null;
}

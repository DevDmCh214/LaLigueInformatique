import { IsInt, IsIn } from 'class-validator';

export class CreateReponseDto {
  @IsInt()
  evenementId: number;

  @IsIn(['present', 'absent', 'peut-etre'], { message: 'La reponse doit etre present, absent ou peut-etre' })
  reponse: string;
}

import { IsEmail, IsInt, IsOptional } from 'class-validator';

export class AddMembreDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;
}

export class RemoveMembreDto {
  @IsInt()
  utilisateurId: number;
}

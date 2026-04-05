import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caracteres' })
  nom: string;

  @IsString()
  @MinLength(2, { message: 'Le prenom doit contenir au moins 2 caracteres' })
  prenom: string;

  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une majuscule' })
  @Matches(/[a-z]/, { message: 'Le mot de passe doit contenir au moins une minuscule' })
  @Matches(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Le mot de passe doit contenir au moins un caractere special' })
  password: string;
}

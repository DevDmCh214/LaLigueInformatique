import { z } from "zod";

// Validation du mot de passe : min 8 caracteres, 1 majuscule, 1 minuscule, 1 chiffre, 1 special
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caracteres")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractere special");

export const signupSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  prenom: z.string().min(2, "Le prenom doit contenir au moins 2 caracteres"),
  email: z.string().email("Email invalide"),
  password: passwordSchema,
});

export const sportSchema = z.object({
  nom: z.string().min(2, "Le nom du sport doit contenir au moins 2 caracteres"),
});

export const equipeSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  nombrePlaces: z.number().int().min(1, "Le nombre de places doit etre au moins 1"),
});

export const evenementSchema = z.object({
  entitule: z.string().min(2, "Le titre doit contenir au moins 2 caracteres"),
  participants: z.number().int().min(1, "Le nombre de participants doit etre au moins 1"),
  dateHeure: z.string().min(1, "La date est requise"),
  description: z.string().optional(),
  sportId: z.number().int(),
});

export const matchSchema = z.object({
  entitule: z.string().min(2, "Le titre doit contenir au moins 2 caracteres"),
  participants: z.number().int().min(1),
  dateHeure: z.string().min(1, "La date est requise"),
  description: z.string().optional(),
  sportId: z.number().int(),
  equipe1Id: z.number().int(),
  equipe2Id: z.number().int(),
});

export const reponseSchema = z.object({
  evenementId: z.number().int(),
  reponse: z.enum(["present", "absent", "peut-etre"]),
});

export const appartenirSchema = z.object({
  email: z.string().email("Email invalide"),
  equipeId: z.number().int(),
});

export const sportInscriptionSchema = z.object({
  sportId: z.number().int(),
});

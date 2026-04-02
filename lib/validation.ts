import { z } from "zod";

// Validation du mot de passe : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial");

export const signupSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: passwordSchema,
});

export const teamSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  sport: z.string().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["admin", "member"]).default("member"),
  position: z.string().optional(),
  phone: z.string().optional(),
  teamId: z.number(),
});

export const updateMemberSchema = z.object({
  role: z.enum(["admin", "member"]).optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  type: z.enum(["game", "practice"]),
  date: z.string().min(1, "La date est requise"),
  location: z.string().optional(),
  opponent: z.string().optional(),
  description: z.string().optional(),
  teamId: z.number(),
});

import { z } from "zod";

export const emailSchema = z
  .string()
  .transform((e) => e.trim().toLowerCase())
  .pipe(z.string().email().max(254));

export const passwordSchema = z
  .string()
  .min(16, "Password must be at least 16 characters")
  .max(256, "Password must be at most 256 characters");

export const displayNameSchema = z.string().trim().min(1).max(100);

export const loginInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

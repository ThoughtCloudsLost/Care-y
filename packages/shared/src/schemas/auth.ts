import { z } from "zod";

export const emailSchema = z
  .string()
  .transform((e) => e.trim().toLowerCase())
  .pipe(z.email().max(254));

export const notificationEmailSchema = emailSchema.optional();

export const passwordSchema = z
  .string()
  .min(16, "Password must be at least 16 characters")
  .max(256, "Password must be at most 256 characters");

export const displayNameSchema = z.string().trim().min(1).max(100);

// Opaque username for login. Lowercase alphanumeric with dots, hyphens, underscores.
// Must start with a letter, end with a letter or digit, 3-64 chars.
export const identifierSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(3, "Identifier must be at least 3 characters")
      .max(64, "Identifier must be at most 64 characters")
      .regex(
        /^[a-z][a-z0-9._-]*[a-z0-9]$/,
        "Identifier must start with a letter, end with a letter or digit, and contain only lowercase letters, digits, dots, hyphens, or underscores",
      ),
  );

export const loginInputSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
});

export const registerInputSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  notificationEmail: notificationEmailSchema,
});

import { z } from "zod";
import { ROLE_ID_VALUES_TUPLE } from "../roles.js";

export const emailSchema = z
  .string()
  .transform((e) => e.trim().toLowerCase())
  .pipe(z.email().max(254));

export const notificationEmailSchema = emailSchema.optional();

export const PASSWORD_MIN_LENGTH = 16;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "Password must be at least 16 characters")
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

export const getSaltInputSchema = z.object({
  identifier: identifierSchema,
});

export const getSaltOutputSchema = z.object({
  salt: z.string(),
  userId: z.uuid(),
});

export const assignRoleInputSchema = z.object({
  userId: z.uuid(),
  roleId: z.enum(ROLE_ID_VALUES_TUPLE),
});

export const setPiiRetentionInputSchema = z.object({
  days: z.number().int().min(1).max(3650).nullable(),
});

export const setUserActiveInputSchema = z.object({
  userId: z.uuid(),
  isActive: z.boolean(),
});

export const listUsersOutputItemSchema = z.object({
  id: z.uuid(),
  identifier: z.string(),
  encryptedDisplayName: z.string(),
  roleId: z.string(),
  isActive: z.boolean(),
  hasKeys: z.boolean(),
  hasOrgKeyWrap: z.boolean(),
  volPublic: z.string().nullable(),
});

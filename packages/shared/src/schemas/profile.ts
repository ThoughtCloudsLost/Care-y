import { z } from "zod";
import { identifierSchema, passwordSchema } from "./auth.js";
import { passwordChangeKeysSchema } from "./keys.js";
import { userIdSchema } from "../ids.js";

/** Self-service display name update. Server stores ciphertext only (org-key sealed box). */
export const updateDisplayNameSchema = z.object({
  encryptedDisplayName: z.string().min(1),
});

/** Admin updates another user's display name. Same sealed-box ciphertext. */
export const adminUpdateDisplayNameSchema = z.object({
  userId: userIdSchema,
  encryptedDisplayName: z.string().min(1),
});

/** Self-service username change. Requires current password for identity confirmation. */
export const updateUsernameSchema = z.object({
  currentPassword: passwordSchema,
  newIdentifier: identifierSchema,
});

/** Admin changes another user's username. No password required (admin authority). */
export const adminUpdateUsernameSchema = z.object({
  userId: userIdSchema,
  newIdentifier: identifierSchema,
});

/** Self-service password hash update. Crypto key rotation handled separately via keys.rotateKeys. */
export const updatePasswordHashSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export type UpdateDisplayNameInput = z.infer<typeof updateDisplayNameSchema>;
export type AdminUpdateDisplayNameInput = z.infer<
  typeof adminUpdateDisplayNameSchema
>;
export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;
export type AdminUpdateUsernameInput = z.infer<
  typeof adminUpdateUsernameSchema
>;
export type UpdatePasswordHashInput = z.infer<typeof updatePasswordHashSchema>;

/** Atomic password change: verify old, hash new, rotate keys, kill sessions. */
export const changePasswordSchema = passwordChangeKeysSchema.extend({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

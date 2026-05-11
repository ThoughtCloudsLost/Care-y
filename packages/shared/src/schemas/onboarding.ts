import { z } from "zod";
import { identifierSchema, passwordSchema, displayNameSchema } from "./auth.js";
import { base64String, base64Bytes } from "./validators.js";
import { ROLE_ID_VALUES_TUPLE } from "../roles.js";

/** Bootstrap the first admin account for an org with zero active users.
 *  orgPublicKey: the client generates the Curve25519 keypair before calling
 *  this endpoint. The server stores it in org_config and uses it to seal the
 *  display name and session data at the correct encryption tier from the start. */
export const bootstrapAdminInputSchema = z.object({
  identifier: identifierSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  orgPublicKey: base64Bytes(32, "orgPublicKey (Curve25519)"),
});

/** Update org basics during setup (step 2). */
export const updateOrgBasicsInputSchema = z.object({
  encryptedOrgName: base64String("encryptedOrgName"),
  defaultLanguage: z.string().min(2).max(10),
  countryCode: z.string().min(1).max(5),
});

/** Validate an invite token without consuming it. */
export const validateInviteInputSchema = z.object({
  token: z.string().min(1),
});

/** Register a new volunteer from an invite link. */
export const registerFromInviteInputSchema = z.object({
  token: z.string().min(1),
  identifier: identifierSchema,
  password: passwordSchema,
  displayName: displayNameSchema.optional(),
});

/** Generate a new invite token (admin-only). */
export const generateInviteInputSchema = z.object({
  roleId: z.enum(ROLE_ID_VALUES_TUPLE),
  encryptedEmail: base64String("encryptedEmail").optional(),
});

/** Save telephony mode choice during setup (step 5). */
export const saveTelephonyChoiceInputSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("byot"),
    accountSid: z.string().min(1),
    authToken: z.string().min(1),
  }),
  z.object({ mode: z.literal("managed") }),
  z.object({ mode: z.literal("skip") }),
]);

/** Wrap the org secret key for a specific user (admin auto-wrap). */
export const wrapOrgKeyForUserSchema = z.object({
  userId: z.uuid(),
  ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
  nonce: base64Bytes(24, "nonce"),
  wrappedKey: base64String("wrappedKey"),
});

/** Response from listUnwrappedUsers: users who need org key wrapping. */
export const unwrappedUserSchema = z.object({
  userId: z.uuid(),
  volPublic: base64String("volPublic"),
});

export type BootstrapAdminInput = z.infer<typeof bootstrapAdminInputSchema>;
export type UpdateOrgBasicsInput = z.infer<typeof updateOrgBasicsInputSchema>;
export type ValidateInviteInput = z.infer<typeof validateInviteInputSchema>;
export type RegisterFromInviteInput = z.infer<
  typeof registerFromInviteInputSchema
>;
export type GenerateInviteInput = z.infer<typeof generateInviteInputSchema>;
export type SaveTelephonyChoiceInput = z.infer<
  typeof saveTelephonyChoiceInputSchema
>;
export type WrapOrgKeyForUserInput = z.infer<typeof wrapOrgKeyForUserSchema>;
export type UnwrappedUser = z.infer<typeof unwrappedUserSchema>;

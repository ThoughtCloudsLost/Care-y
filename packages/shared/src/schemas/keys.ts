import { z } from "zod";
import { base64Bytes, base64String } from "./validators.js";

/** Initial crypto key setup: salt + volPublic (account creation, first-time only). */
export const initCryptoKeysSchema = z.object({
  salt: base64Bytes(16, "Argon2id salt"),
  volPublic: base64Bytes(32, "volPublic (ristretto255 point)"),
});

/** volPublic update (password change re-derives volPublic without changing salt separately). */
export const uploadVolPublicSchema = z.object({
  volPublic: base64Bytes(32, "volPublic (ristretto255 point)"),
});

/** Single re-wrapped ticket key entry (ECIES wrapping output). */
const reWrappedKeySchema = z.object({
  ticketId: z.uuid(),
  keyGeneration: z.uuid(),
  ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
  nonce: base64Bytes(24, "nonce"),
  wrappedKey: base64String("wrappedKey"),
});

/** ECIES-wrapped org key fields (same shape as wrapped_org_keys DB columns). */
const reWrappedOrgKeySchema = z.object({
  ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
  nonce: base64Bytes(24, "nonce"),
  wrappedKey: base64String("wrappedKey"),
});

/** Password change: new salt + new volPublic + re-wrapped ticket keys + optional org key re-wrap */
export const passwordChangeKeysSchema = z.object({
  saltNew: base64Bytes(16, "Salt"),
  volPublicNew: base64Bytes(32, "volPublic"),
  reWrappedKeys: z.array(reWrappedKeySchema),
  reWrappedOrgKey: reWrappedOrgKeySchema.optional(),
});

/** Org public key upload (first admin onboarding). ECIES wrap fields match wrapped_org_keys DB columns. */
export const uploadOrgPublicKeySchema = z.object({
  orgPublicKey: base64Bytes(32, "orgPublicKey (Curve25519)"),
  ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
  nonce: base64Bytes(24, "nonce"),
  wrappedKey: base64String("wrappedKey"),
});

/** Per-volunteer wrapped org secret key entry (used in org key rotation). */
const wrappedOrgKeyEntrySchema = z.object({
  userId: z.uuid(),
  ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
  nonce: base64Bytes(24, "nonce"),
  wrappedKey: base64String("wrappedKey"),
});

/** Org key rotation: new public key + re-wrapped secrets for all active volunteers. */
export const rotateOrgKeySchema = z.object({
  newOrgPublicKey: base64Bytes(32, "newOrgPublicKey (Curve25519)"),
  wrappedKeys: z.array(wrappedOrgKeyEntrySchema).min(1),
});

/**
 * Admin-initiated crypto bootstrap: sets up user_keys AND wrapped_org_keys
 * for a manually created user whose password the admin knows. Combines
 * initCryptoKeys + wrapOrgKeyForUser into one call so the new user is
 * fully bootstrapped before the admin's creation flow completes.
 */
export const adminBootstrapUserKeysSchema = z.object({
  userId: z.uuid(),
  salt: base64Bytes(16, "Argon2id salt"),
  volPublic: base64Bytes(32, "volPublic (ristretto255 point)"),
  wrappedOrgKey: z.object({
    ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
    nonce: base64Bytes(24, "nonce"),
    wrappedKey: base64String("wrappedKey"),
  }),
});

export type InitCryptoKeysInput = z.infer<typeof initCryptoKeysSchema>;
export type UploadVolPublicInput = z.infer<typeof uploadVolPublicSchema>;
export type PasswordChangeKeysInput = z.infer<typeof passwordChangeKeysSchema>;
export type UploadOrgPublicKeyInput = z.infer<typeof uploadOrgPublicKeySchema>;
export type RotateOrgKeyInput = z.infer<typeof rotateOrgKeySchema>;
export type AdminBootstrapUserKeysInput = z.infer<
  typeof adminBootstrapUserKeysSchema
>;

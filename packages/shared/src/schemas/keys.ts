import { z } from "zod";

/** Compute decoded byte length from a base64 string without Buffer (isomorphic). */
function base64ByteLength(s: string): number {
  const stripped = s.replace(/=+$/, "");
  return Math.floor((stripped.length * 3) / 4);
}

/** Reusable base64 string with exact byte length check. */
function base64Bytes(expectedLength: number, label: string): z.ZodType<string> {
  return z
    .string()
    .regex(/^[A-Za-z0-9+/=]+$/, "Must be base64-encoded")
    .refine((s) => base64ByteLength(s) === expectedLength, {
      message: `${label} must be exactly ${String(expectedLength)} bytes`,
    });
}

/** Initial crypto key setup: salt + volPublic (account creation, first-time only). */
export const initCryptoKeysSchema = z.object({
  salt: base64Bytes(16, "Argon2id salt"),
  volPublic: base64Bytes(32, "volPublic (ristretto255 point)"),
});

/** volPublic update (password change re-derives volPublic without changing salt separately). */
export const uploadVolPublicSchema = z.object({
  volPublic: base64Bytes(32, "volPublic (ristretto255 point)"),
});

/** Password change: new salt + new volPublic + re-wrapped ticket keys */
export const passwordChangeKeysSchema = z.object({
  saltNew: base64Bytes(16, "Salt"),
  volPublicNew: base64Bytes(32, "volPublic"),
  reWrappedKeys: z.array(
    z.object({
      ticketId: z.uuid(),
      keyGeneration: z.uuid(),
      ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
      nonce: base64Bytes(24, "nonce"),
      wrappedKey: z
        .string()
        .regex(/^[A-Za-z0-9+/=]+$/, "Must be base64-encoded"),
    }),
  ),
});

/** Org public key upload (first admin onboarding) */
export const uploadOrgPublicKeySchema = z.object({
  orgPublicKey: base64Bytes(32, "orgPublicKey (Curve25519)"),
  wrappedOrgSecretBlob: z
    .string()
    .regex(/^[A-Za-z0-9+/=]+$/, "Must be base64-encoded"),
});

export type InitCryptoKeysInput = z.infer<typeof initCryptoKeysSchema>;
export type UploadVolPublicInput = z.infer<typeof uploadVolPublicSchema>;
export type PasswordChangeKeysInput = z.infer<typeof passwordChangeKeysSchema>;
export type UploadOrgPublicKeyInput = z.infer<typeof uploadOrgPublicKeySchema>;

import { z } from "zod";
import { base64Bytes, base64String } from "./validators.js";
import { ticketIdSchema, userIdSchema, keyGenerationSchema } from "../ids.js";

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
  ticketId: ticketIdSchema,
  keyGeneration: keyGenerationSchema,
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
  userId: userIdSchema,
  ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
  nonce: base64Bytes(24, "nonce"),
  wrappedKey: base64String("wrappedKey"),
});

/**
 * Org key rotation: new public key, generation chain entry, and re-wrapped
 * secrets for all active volunteers.
 *
 * `chainedFrom` carries the outgoing secret sealed under the incoming one, so
 * a holder of the new secret can still open pre-rotation ciphertext. It is
 * null only when the outgoing key has no data left under it and no holder
 * needs it again: the dev bootstrap, which replaces a throwaway seed keypair
 * whose rows the seeder reseals immediately afterwards. A null here makes the
 * outgoing generation permanently unreadable, which is why it is a named,
 * deliberate field rather than an omission. The server cannot verify that a
 * present chain entry is correct either, so this shape documents intent; the
 * reseal, not the schema, is what keeps data readable.
 */
export const rotateOrgKeySchema = z.object({
  newOrgPublicKey: base64Bytes(32, "newOrgPublicKey (Curve25519)"),
  newGeneration: z.number().int().min(2),
  chainedFrom: z
    .object({
      prevSecretCt: base64Bytes(48, "prevSecretCt (secretbox of org secret)"),
      prevNonce: base64Bytes(24, "prevNonce"),
    })
    .nullable(),
  wrappedKeys: z.array(wrappedOrgKeyEntrySchema).min(1),
});

/**
 * Admin-initiated crypto bootstrap: sets up user_keys AND wrapped_org_keys
 * for a manually created user whose password the admin knows. Combines
 * initCryptoKeys + wrapOrgKeyForUser into one call so the new user is
 * fully bootstrapped before the admin's creation flow completes.
 */
export const adminBootstrapUserKeysSchema = z.object({
  userId: userIdSchema,
  salt: base64Bytes(16, "Argon2id salt"),
  volPublic: base64Bytes(32, "volPublic (ristretto255 point)"),
  wrappedOrgKey: z.object({
    ephemeralPoint: base64Bytes(32, "ephemeralPoint (ristretto255)"),
    nonce: base64Bytes(24, "nonce"),
    wrappedKey: base64String("wrappedKey"),
  }),
});

/**
 * Closed list of org-sealed table names for the reseal mechanism.
 * Shared between client (input validation) and server (column allowlist).
 * The server's RESEAL_TABLES map keys must be exactly this set, enforced
 * by the type system via satisfies Record<ResealTableName, ...>.
 */
export const RESEAL_TABLE_NAMES = [
  "queues",
  "note_types",
  "kb_categories",
  "kb_items",
  "kb_attachments",
  "preset_replies",
  "clients",
  "users",
  "sessions",
  "org_config",
  "merge_candidate_dismissals",
  "consultants",
  "phone_blocklist",
  "invite_tokens",
  "voicemail_quarantine",
  "phones",
  "intake_key_wraps",
  "portal_reply_key_wraps",
  "intake_forms",
  "intake_form_fields",
  "client_merge_events",
] as const;

export type ResealTableName = (typeof RESEAL_TABLE_NAMES)[number];

const resealTableNameSchema = z.enum(RESEAL_TABLE_NAMES);

/** A single row's re-encrypted column values. */
const resealRowSchema = z.object({
  id: z.union([z.string().min(1), z.number().int()]),
  columns: z
    .record(z.string(), base64String("column ciphertext"))
    .refine((r) => Object.keys(r).length >= 1, {
      message: "At least one column must be provided",
    }),
});

/** Input for the resealRows mutation. */
export const resealRowsSchema = z.object({
  table: resealTableNameSchema,
  rows: z.array(resealRowSchema).min(1).max(100),
  skippedIds: z.array(z.union([z.string(), z.number().int()])).default([]),
});

export type ResealRowsInput = z.infer<typeof resealRowsSchema>;

// ---------------------------------------------------------------------------
// Blind-index re-derivation after org key rotation
// ---------------------------------------------------------------------------

/**
 * Closed list of tables with browser-computed blind-index hash columns.
 * Shared between client (input validation) and server (column allowlist).
 * The server's INDEX_TABLES map keys must be exactly this set, enforced
 * by the type system via satisfies Record<IndexTableName, ...>.
 */
export const INDEX_TABLE_NAMES = ["clients", "phones", "emails"] as const;

export type IndexTableName = (typeof INDEX_TABLE_NAMES)[number];

const indexTableNameSchema = z.enum(INDEX_TABLE_NAMES);

/**
 * Hex-encoded 128-character HMAC hash, matching the branded hash schemas
 * (AliasHash, PhoneMatchHash, EmailMatchHash).
 */
const indexHashSchema = z.string().regex(/^[0-9a-f]{128}$/);

/** A single row's re-derived blind-index hash. */
const reindexRowSchema = z.object({
  id: z.union([z.string().min(1), z.number().int()]),
  hash: indexHashSchema,
});

/** Input for the reindexRows mutation. */
export const reindexRowsSchema = z.object({
  table: indexTableNameSchema,
  rows: z.array(reindexRowSchema).min(1).max(100),
  skippedIds: z.array(z.union([z.string(), z.number().int()])).default([]),
});

export type ReindexRowsInput = z.infer<typeof reindexRowsSchema>;

export type InitCryptoKeysInput = z.infer<typeof initCryptoKeysSchema>;
export type UploadVolPublicInput = z.infer<typeof uploadVolPublicSchema>;
export type PasswordChangeKeysInput = z.infer<typeof passwordChangeKeysSchema>;
export type UploadOrgPublicKeyInput = z.infer<typeof uploadOrgPublicKeySchema>;
export type RotateOrgKeyInput = z.infer<typeof rotateOrgKeySchema>;
export type AdminBootstrapUserKeysInput = z.infer<
  typeof adminBootstrapUserKeysSchema
>;

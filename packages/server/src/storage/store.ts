// BlobStore: opaque byte store. The store never encrypts or decrypts;
// callers decide per category. Public-facing categories are plaintext,
// anything carrying client content is sealed before it reaches the store.
// No content-type validation, size limits, or access control at this layer.

import type { BlobKey, OrgSchema } from "@care-y/shared";

/** Categories partition blobs by purpose. Storage key includes category. */
export type BlobCategory =
  | "attachment"
  | "recording"
  | "greeting"
  | "export"
  | "kb-attachment"
  | "branding"
  | "quarantine"
  | "form-asset";

/**
 * Encryption expectation for each blob category.
 *
 * - `"plaintext"`: public-facing content stored unencrypted.
 * - `"sealed"`: callers encrypt under the org key (ECIES or file-key
 *   envelope) before calling put(). The store receives only ciphertext.
 * - `"branding-key"`: callers encrypt under the deterministic branding
 *   key (derived from the org public key) before calling put().
 *
 * This map is declarative: the store never enforces it. Its purpose is
 * to make each category's contract explicit at the type level so that
 * adding a BlobCategory member without declaring its encryption side
 * is a compile error (via the `satisfies` clause).
 */
export const BLOB_CATEGORY_ENCRYPTION = {
  branding: "plaintext",
  greeting: "plaintext",
  attachment: "sealed",
  recording: "sealed",
  quarantine: "sealed",
  "kb-attachment": "sealed",
  export: "sealed",
  "form-asset": "branding-key",
} as const satisfies Record<
  BlobCategory,
  "plaintext" | "sealed" | "branding-key"
>;

export type BlobEncryptionExpectation =
  (typeof BLOB_CATEGORY_ENCRYPTION)[BlobCategory];

/** Dumb byte store. Callers handle encryption, validation, and access control. */
export interface BlobStore {
  /** Store a blob. Returns a stable storage key. */
  put(
    orgSchema: OrgSchema,
    category: BlobCategory,
    blob: Buffer,
  ): Promise<BlobKey>;

  /** Retrieve a blob by key. Returns null if not found. */
  get(key: BlobKey): Promise<Buffer | null>;

  /** Delete a blob. Idempotent: no error if already gone. */
  delete(key: BlobKey): Promise<void>;

  /** Check existence without fetching content. */
  exists(key: BlobKey): Promise<boolean>;
}

export class BlobStoreError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BlobStoreError";
  }
}

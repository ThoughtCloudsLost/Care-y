// BlobStore interface for encrypted blob storage.
// All blobs are opaque encrypted bytes. No content-type validation,
// size limits, or access control at this layer.

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

/** Dumb byte store. Callers handle encryption, validation, and access control. */
export interface BlobStore {
  /** Store an encrypted blob. Returns a stable storage key. */
  put(
    orgSchema: OrgSchema,
    category: BlobCategory,
    blob: Buffer,
  ): Promise<BlobKey>;

  /** Retrieve an encrypted blob by key. Returns null if not found. */
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

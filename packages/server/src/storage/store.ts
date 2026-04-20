// BlobStore interface for encrypted blob storage.
// All blobs are opaque encrypted bytes. No content-type validation,
// size limits, or access control at this layer.

/** Categories partition blobs by purpose. Storage key includes category. */
export type BlobCategory =
  | "attachment"
  | "recording"
  | "greeting"
  | "export"
  | "kb-attachment"
  | "branding";

/** Dumb byte store. Callers handle encryption, validation, and access control. */
export interface BlobStore {
  /** Store an encrypted blob. Returns a stable storage key. */
  put(orgSchema: string, category: BlobCategory, blob: Buffer): Promise<string>;

  /** Retrieve an encrypted blob by key. Returns null if not found. */
  get(key: string): Promise<Buffer | null>;

  /** Delete a blob. Idempotent: no error if already gone. */
  delete(key: string): Promise<void>;

  /** Check existence without fetching content. */
  exists(key: string): Promise<boolean>;
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

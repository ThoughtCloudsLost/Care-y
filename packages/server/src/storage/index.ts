// BlobStore factory.
// Selects the storage backend based on BLOB_STORE_TYPE env var.
// Telephony is the first consumer. Future: add S3 backend here.

export type { BlobStore, BlobCategory } from "./store.js";
export { BlobStoreError } from "./store.js";

import type { BlobStore } from "./store.js";
import { createLocalBlobStore } from "./local.js";

export type BlobStoreType = "local";

// Adding a backend? Add it to BlobStoreType and this record.
// TS enforces exhaustiveness: a missing key is a compile error.
const factories: Record<BlobStoreType, (basePath: string) => BlobStore> = {
  local: createLocalBlobStore,
};

/** Creates a BlobStore for the given backend type. */
export function createBlobStore(
  type: BlobStoreType,
  basePath: string,
): BlobStore {
  // `type` is a closed Zod-validated union from env.ts, not user input
  // eslint-disable-next-line security/detect-object-injection
  return factories[type](basePath);
}

/**
 * Stub for $lib/utils/fetch-blob.js.
 *
 * The demo is a static SPA with no /api handler. Real blob downloads
 * would 404. This stub intercepts fetchBlob calls, parses the path
 * the same way the server's blob-download route does, and reads
 * ciphertext bytes from the engine's in-memory blob store via a
 * resolver callback. Bytes are returned as-is (ciphertext); the
 * client crypto worker handles decryption.
 */

import { BlobFetchError } from "$lib/errors.js";

// Re-export so consumer modules that import BlobFetchError from this
// path still resolve. The real fetch-blob.ts does not export it, but
// the alias is drop-in for everything the real module DOES export.

// -----------------------------------------------------------------------
// Resolver interface + engine slot
// -----------------------------------------------------------------------

export type BlobCategory = "recordings" | "attachments" | "kb-attachments";

export interface DemoBlobResolver {
  resolveBlob(category: BlobCategory, id: string): Promise<Uint8Array | null>;
}

let resolverPromise: Promise<DemoBlobResolver> | null = null;

/**
 * Store the engine's blob resolver. Called after engine boot completes.
 * Accepts the resolver directly or a Promise that resolves to it.
 * Calls made before the promise resolves will await it transparently.
 */
export function setEngineBlobResolver(
  r: DemoBlobResolver | Promise<DemoBlobResolver>,
): void {
  resolverPromise = Promise.resolve(r);
}

/**
 * Reset the blob resolver. Intended for tests only.
 */
export function resetEngineBlobResolver(): void {
  resolverPromise = null;
}

class DemoBlobResolverNotReadyError extends Error {
  override readonly name = "DemoBlobResolverNotReadyError";
  constructor() {
    super(
      "Blob resolver not set. Cannot call fetchBlob before setEngineBlobResolver() is called.",
    );
  }
}

export { DemoBlobResolverNotReadyError };

async function getResolver(): Promise<DemoBlobResolver> {
  if (resolverPromise === null) {
    throw new DemoBlobResolverNotReadyError();
  }
  return resolverPromise;
}

// -----------------------------------------------------------------------
// Path parsing (mirrors server blob-download.ts)
// -----------------------------------------------------------------------

const PATH_PREFIX = "/api/blobs/";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_CATEGORIES: ReadonlySet<string> = new Set<BlobCategory>([
  "recordings",
  "attachments",
  "kb-attachments",
]);

interface ParsedBlobPath {
  category: BlobCategory;
  id: string;
}

function parseBlobPath(path: string): ParsedBlobPath {
  if (!path.startsWith(PATH_PREFIX)) {
    throw new BlobFetchError(404);
  }

  const pathAfterPrefix = path.slice(PATH_PREFIX.length);
  const slashIdx = pathAfterPrefix.indexOf("/");
  if (slashIdx === -1) {
    throw new BlobFetchError(404);
  }

  const category = pathAfterPrefix.slice(0, slashIdx);
  const id = pathAfterPrefix.slice(slashIdx + 1);

  if (!VALID_CATEGORIES.has(category)) {
    throw new BlobFetchError(404);
  }

  if (!UUID_RE.test(id)) {
    throw new BlobFetchError(404);
  }

  return { category: category as BlobCategory, id };
}

// -----------------------------------------------------------------------
// fetchBlob (matches real module signature exactly)
// -----------------------------------------------------------------------

export async function fetchBlob(
  path: string,
  signal?: AbortSignal,
): Promise<ArrayBuffer> {
  // Read through a call, not `signal.aborted` directly: TypeScript
  // narrows the flag after the first guard and cannot see that an
  // await may flip it (same idiom as the search providers).
  const aborted = (): boolean => signal?.aborted ?? false;
  const throwIfAborted = (): void => {
    if (aborted()) {
      throw signal?.reason;
    }
  };

  // Honor abort if already aborted before we start
  throwIfAborted();

  const { category, id } = parseBlobPath(path);

  const resolver = await getResolver();

  // Check abort after awaiting the resolver (may have taken time)
  throwIfAborted();

  let bytes: Uint8Array | null;
  try {
    bytes = await resolver.resolveBlob(category, id);
  } catch {
    // Resolver internal failure maps to 500
    throwIfAborted();
    throw new BlobFetchError(500);
  }

  throwIfAborted();

  if (bytes === null) {
    throw new BlobFetchError(404);
  }

  // Copy into a fresh ArrayBuffer: the view's backing buffer is typed
  // ArrayBuffer | SharedArrayBuffer, and callers expect a plain one.
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

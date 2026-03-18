// Local filesystem BlobStore implementation.
// Stores blobs at: <basePath>/<orgSchema>/<category>/<uuid>
// Storage key format: <orgSchema>/<category>/<uuid>

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import type { BlobCategory, BlobStore } from "./store.js";
import { BlobStoreError } from "./store.js";

const VALID_ORG_SCHEMA = /^org_[0-9a-f-]+$/;
const VALID_CATEGORIES: ReadonlySet<string> = new Set<BlobCategory>([
  "attachment",
  "recording",
  "greeting",
  "export",
]);
// Storage keys returned by put() are always <orgSchema>/<category>/<uuid>
const VALID_KEY =
  /^org_[0-9a-f-]+\/(attachment|recording|greeting|export)\/[0-9a-f-]+$/;

/** Validates that a storage key won't escape the base directory. */
function assertSafeKey(key: string): void {
  if (!VALID_KEY.test(key)) {
    throw new BlobStoreError(`Invalid storage key: ${key}`);
  }
}

/** Validates orgSchema and category inputs to put(). */
function assertSafeInputs(orgSchema: string, category: string): void {
  if (!VALID_ORG_SCHEMA.test(orgSchema)) {
    throw new BlobStoreError(`Invalid org schema: ${orgSchema}`);
  }
  if (!VALID_CATEGORIES.has(category)) {
    throw new BlobStoreError(`Invalid blob category: ${category}`);
  }
}

export function createLocalBlobStore(basePath: string): BlobStore {
  const resolved = path.resolve(basePath);

  function keyToPath(key: string): string {
    return path.join(resolved, ...key.split("/"));
  }

  return {
    async put(
      orgSchema: string,
      category: BlobCategory,
      blob: Buffer,
    ): Promise<string> {
      assertSafeInputs(orgSchema, category);
      const id = randomUUID();
      const key = `${orgSchema}/${category}/${id}`;
      const filePath = keyToPath(key);

      try {
        // Path components are regex-validated by assertSafeInputs above
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(filePath, blob);
      } catch (err: unknown) {
        throw new BlobStoreError(`Failed to write blob: ${key}`, err);
      }

      return key;
    },

    async get(key: string): Promise<Buffer | null> {
      assertSafeKey(key);
      try {
        // Key format is regex-validated by assertSafeKey above
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        return await fs.readFile(keyToPath(key));
      } catch (err: unknown) {
        if (isNotFound(err)) return null;
        throw new BlobStoreError(`Failed to read blob: ${key}`, err);
      }
    },

    async delete(key: string): Promise<void> {
      assertSafeKey(key);
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.unlink(keyToPath(key));
      } catch (err: unknown) {
        if (isNotFound(err)) return; // idempotent
        throw new BlobStoreError(`Failed to delete blob: ${key}`, err);
      }
    },

    async exists(key: string): Promise<boolean> {
      assertSafeKey(key);
      try {
        await fs.access(keyToPath(key));
        return true;
      } catch {
        return false;
      }
    },
  };
}

function isNotFound(err: unknown): boolean {
  if (!(err instanceof Error) || !("code" in err)) return false;
  // After "code" in err, TS narrows to Error & Record<"code", unknown>
  const code: unknown = err.code;
  return code === "ENOENT";
}

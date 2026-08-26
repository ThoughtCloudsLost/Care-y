/**
 * Tests for form asset service: upload validation and resolve logic.
 *
 * The unit suite covers size, content-type, and declared-size validation.
 * The DB suite covers the full upload + resolve round-trip with a real
 * form_assets table.
 */

import { randomUUID } from "node:crypto";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { uploadFormAsset, resolveFormAsset } from "./form-asset-service.js";
import { ValidationError, AttachmentValidationError } from "../errors.js";
import { KB_ATTACHMENT_MAX_BYTES, newFormAssetId } from "@care-y/shared";
import type { BlobKey, OrgSchema } from "@care-y/shared";
import type { BlobStore } from "../storage/store.js";
import { createTestDb, seedOrgPublicKey, type TestDb } from "../test-utils.js";

// ---------------------------------------------------------------------------
// Unit tests (no DB)
// ---------------------------------------------------------------------------

describe("uploadFormAsset validation", () => {
  const orgSchema = "org_test" as OrgSchema;

  function mockBlobStore(returnKey: BlobKey): BlobStore {
    return {
      put: vi.fn(async () => returnKey),
      get: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      exists: vi.fn(async () => false),
    };
  }

  // Stub tDb that will not be reached by validation-only tests
  const noopDb = {} as Parameters<typeof uploadFormAsset>[0];

  it("rejects blobs exceeding KB_ATTACHMENT_MAX_BYTES", async () => {
    const oversized = Buffer.alloc(KB_ATTACHMENT_MAX_BYTES + 1);
    const store = mockBlobStore("key" as BlobKey);

    await expect(
      uploadFormAsset(
        noopDb,
        store,
        orgSchema,
        oversized,
        oversized.byteLength,
        "image/png",
      ),
    ).rejects.toThrow(ValidationError);
  });

  it("rejects when declared size does not match actual size", async () => {
    const blob = Buffer.alloc(100);
    const store = mockBlobStore("key" as BlobKey);

    await expect(
      uploadFormAsset(noopDb, store, orgSchema, blob, 200, "image/png"),
    ).rejects.toThrow(ValidationError);
  });

  it("rejects disallowed content types", async () => {
    const blob = Buffer.alloc(100);
    const store = mockBlobStore("key" as BlobKey);

    await expect(
      uploadFormAsset(noopDb, store, orgSchema, blob, 100, "application/pdf"),
    ).rejects.toThrow(AttachmentValidationError);
  });

  it("rejects content type with semicolon-separated parameters", async () => {
    const blob = Buffer.alloc(100);
    const store = mockBlobStore("key" as BlobKey);

    // "text/html; charset=utf-8" should be blocked even though the
    // full string does not match the enum
    await expect(
      uploadFormAsset(
        noopDb,
        store,
        orgSchema,
        blob,
        100,
        "text/html; charset=utf-8",
      ),
    ).rejects.toThrow(AttachmentValidationError);
  });
});

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "uploadFormAsset + resolveFormAsset round-trip (DB)",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("stores a blob and resolves it back", async () => {
      const blob = Buffer.alloc(256);
      const assetUuid = randomUUID();
      const blobKey = `${testDb.schemaName}/form-asset/${assetUuid}` as BlobKey;

      const store: BlobStore = {
        put: vi.fn(async () => blobKey),
        get: vi.fn(async () => null),
        delete: vi.fn(async () => undefined),
        exists: vi.fn(async () => false),
      };

      const result = await uploadFormAsset(
        testDb.db,
        store,
        testDb.schemaName as OrgSchema,
        blob,
        blob.byteLength,
        "image/png",
      );

      expect(result.blobKey).toBe(blobKey);
      expect(String(result.blobId)).toBe(assetUuid);

      // Resolve it back
      const meta = await resolveFormAsset(testDb.db, result.blobId);

      expect(meta).not.toBeNull();
      expect(meta?.blobKey).toBe(blobKey);
      expect(meta?.contentType).toBe("image/png");
      expect(meta?.orgPublicKey).toBeTruthy();
    });

    it("resolveFormAsset returns null for unknown blob ID", async () => {
      const unknownId = newFormAssetId();
      const meta = await resolveFormAsset(testDb.db, unknownId);
      expect(meta).toBeNull();
    });

    it("resolveFormAsset returns null for non-UUID blob ID", async () => {
      const meta = await resolveFormAsset(testDb.db, "not-a-uuid");
      expect(meta).toBeNull();
    });

    it("resolveFormAsset returns null when blob key is outside form-asset prefix", async () => {
      // Manually insert a row with a non-form-asset key
      const badPrefixId = newFormAssetId();
      await testDb.db
        .insertInto("form_assets")
        .values({
          blob_id: badPrefixId,
          blob_key:
            `${testDb.schemaName}/kb-attachment/${badPrefixId}` as BlobKey,
          content_type: "image/jpeg",
        })
        .execute();

      const meta = await resolveFormAsset(testDb.db, badPrefixId);
      expect(meta).toBeNull();
    });

    it("resolveFormAsset returns null when content type is not in allowlist", async () => {
      const badTypeId = newFormAssetId();
      await testDb.db
        .insertInto("form_assets")
        .values({
          blob_id: badTypeId,
          blob_key: `${testDb.schemaName}/form-asset/${badTypeId}` as BlobKey,
          content_type: "application/pdf",
        })
        .execute();

      const meta = await resolveFormAsset(testDb.db, badTypeId);
      expect(meta).toBeNull();
    });
  },
);

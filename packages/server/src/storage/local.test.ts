import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { createLocalBlobStore } from "./local.js";
import { BlobStoreError, BLOB_CATEGORY_ENCRYPTION } from "./store.js";
import type { BlobCategory } from "./store.js";
import type { BlobKey, OrgSchema } from "@care-y/shared";
import { blobKeySchema, orgSchemaNameSchema } from "@care-y/shared";

const ORG_SCHEMA = orgSchemaNameSchema.parse(
  "org_abc00000-0000-4000-8000-000000000123",
);
const ORG_SCHEMA_2 = orgSchemaNameSchema.parse(
  "org_def00000-0000-4000-8000-000000000456",
);

describe("LocalBlobStore", () => {
  let tmpDir: string;
  let store: ReturnType<typeof createLocalBlobStore>;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "blobstore-test-"));
    store = createLocalBlobStore(tmpDir);
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("put", () => {
    it("stores a blob and returns a key matching the expected format", async () => {
      const blob = Buffer.from("encrypted-content");
      const key = await store.put(ORG_SCHEMA, "attachment", blob);

      // Contract: key format is persisted in DB (blob_key column) and used for blob retrieval.
      expect(key).toMatch(
        /^org_abc00000-0000-4000-8000-000000000123\/attachment\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it("creates nested directories on first write", async () => {
      const blob = Buffer.from("test");
      const key = await store.put(ORG_SCHEMA_2, "recording", blob);

      const filePath = path.join(tmpDir, ...key.split("/"));
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const fileStat = await fs.stat(filePath);
      expect(fileStat.isFile()).toBe(true);
    });

    it("rejects invalid org schema", async () => {
      await expect(
        store.put("../escape" as OrgSchema, "attachment", Buffer.from("x")),
      ).rejects.toThrow(BlobStoreError);
    });

    it("rejects invalid category", async () => {
      await expect(
        store.put(ORG_SCHEMA, "malicious" as "attachment", Buffer.from("x")),
      ).rejects.toThrow(BlobStoreError);
    });
  });

  describe("get", () => {
    it("returns the stored blob content", async () => {
      const blob = Buffer.from("round-trip-test");
      const key = await store.put(ORG_SCHEMA, "greeting", blob);

      const result = await store.get(key);
      expect(result).toEqual(blob);
    });

    it("returns null for a nonexistent key", async () => {
      const key = blobKeySchema.parse(
        "org_abc00000-0000-4000-8000-000000000123/attachment/00000000-0000-0000-0000-000000000000",
      );
      const result = await store.get(key);
      expect(result).toBeNull();
    });

    it("rejects a malformed key", async () => {
      await expect(store.get("../../etc/passwd" as BlobKey)).rejects.toThrow(
        BlobStoreError,
      );
    });
  });

  describe("delete", () => {
    it("removes an existing blob", async () => {
      const blob = Buffer.from("to-delete");
      const key = await store.put(ORG_SCHEMA, "export", blob);

      await store.delete(key);

      const result = await store.get(key);
      expect(result).toBeNull();
    });

    it("is idempotent (no error for already-deleted blob)", async () => {
      const key = blobKeySchema.parse(
        "org_abc00000-0000-4000-8000-000000000123/attachment/00000000-0000-0000-0000-000000000000",
      );

      // Should not throw even though the file doesn't exist
      await expect(store.delete(key)).resolves.toBeUndefined();
    });

    it("rejects a malformed key", async () => {
      await expect(store.delete("bad/key" as BlobKey)).rejects.toThrow(
        BlobStoreError,
      );
    });
  });

  describe("exists", () => {
    it("returns true for an existing blob", async () => {
      const blob = Buffer.from("check-exists");
      const key = await store.put(ORG_SCHEMA, "attachment", blob);

      expect(await store.exists(key)).toBe(true);
    });

    it("returns false for a nonexistent blob", async () => {
      const key = blobKeySchema.parse(
        "org_abc00000-0000-4000-8000-000000000123/recording/00000000-0000-0000-0000-000000000000",
      );
      expect(await store.exists(key)).toBe(false);
    });

    it("rejects a malformed key", async () => {
      await expect(store.exists("../traversal" as BlobKey)).rejects.toThrow(
        BlobStoreError,
      );
    });
  });

  describe("quarantine category", () => {
    it("round-trips a blob through put and get", async () => {
      const blob = Buffer.from("quarantine-audio-content");
      const key = await store.put(ORG_SCHEMA, "quarantine", blob);

      expect(key).toMatch(
        /^org_abc00000-0000-4000-8000-000000000123\/quarantine\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );

      const result = await store.get(key);
      expect(result).toEqual(blob);
    });
  });

  describe("BLOB_CATEGORY_ENCRYPTION map", () => {
    it("covers every BlobCategory member", () => {
      // The satisfies clause enforces this at compile time; this test
      // pins it at runtime so a category added to the union but missing
      // from the map is caught by both paths.
      const declared = Object.keys(BLOB_CATEGORY_ENCRYPTION).sort();
      const allCategories: BlobCategory[] = [
        "attachment",
        "recording",
        "greeting",
        "export",
        "kb-attachment",
        "branding",
        "quarantine",
        "form-asset",
      ];
      expect(declared).toEqual(allCategories.sort());
    });

    it("every value is a recognized encryption expectation", () => {
      const valid = new Set(["plaintext", "sealed", "branding-key"]);
      for (const [category, expectation] of Object.entries(
        BLOB_CATEGORY_ENCRYPTION,
      )) {
        expect(valid.has(expectation), `${category}: ${expectation}`).toBe(
          true,
        );
      }
    });
  });

  describe("deleteOrg", () => {
    const ERASED_SCHEMA = orgSchemaNameSchema.parse(
      "org_0e0e0000-0000-4000-8000-000000000789",
    );
    const KEPT_SCHEMA = orgSchemaNameSchema.parse(
      "org_0f0f0000-0000-4000-8000-000000000987",
    );

    it("removes the org's directory across categories and leaves other orgs alone", async () => {
      const attachment = await store.put(
        ERASED_SCHEMA,
        "attachment",
        Buffer.from("a"),
      );
      const recording = await store.put(
        ERASED_SCHEMA,
        "recording",
        Buffer.from("r"),
      );
      const kept = await store.put(KEPT_SCHEMA, "attachment", Buffer.from("k"));

      await store.deleteOrg(ERASED_SCHEMA);

      expect(await store.exists(attachment)).toBe(false);
      expect(await store.exists(recording)).toBe(false);
      await expect(
        fs.access(path.join(tmpDir, ERASED_SCHEMA)),
      ).rejects.toThrow();
      expect(await store.get(kept)).toEqual(Buffer.from("k"));
    });

    it("is idempotent (no error when the org has no directory)", async () => {
      await store.deleteOrg(ERASED_SCHEMA);
      await expect(store.deleteOrg(ERASED_SCHEMA)).resolves.toBeUndefined();
    });

    it("refuses an invalid schema name before touching the filesystem", async () => {
      // A sibling of the base directory that a traversal would reach.
      const outside = await fs.mkdtemp(
        path.join(os.tmpdir(), "blobstore-outside-"),
      );
      try {
        const traversal = path.relative(tmpDir, outside);
        await expect(store.deleteOrg(traversal as OrgSchema)).rejects.toThrow(
          BlobStoreError,
        );
        await expect(store.deleteOrg("" as OrgSchema)).rejects.toThrow(
          BlobStoreError,
        );
        await expect(
          store.deleteOrg("org_abc/../.." as OrgSchema),
        ).rejects.toThrow(BlobStoreError);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const outsideStat = await fs.stat(outside);
        expect(outsideStat.isDirectory()).toBe(true);
      } finally {
        await fs.rm(outside, { recursive: true, force: true });
      }
    });
  });

  describe("path traversal defense", () => {
    it("rejects org schema with path separators", async () => {
      await expect(
        store.put(
          "org_abc/../../etc" as OrgSchema,
          "attachment",
          Buffer.from("x"),
        ),
      ).rejects.toThrow(BlobStoreError);
    });

    it("rejects key with double dots", async () => {
      await expect(
        store.get(
          "org_abc00000-0000-4000-8000-000000000123/../../../etc/passwd" as BlobKey,
        ),
      ).rejects.toThrow(BlobStoreError);
    });
  });
});

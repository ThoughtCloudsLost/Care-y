import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { createLocalBlobStore } from "./local.js";
import { BlobStoreError } from "./store.js";

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
      const key = await store.put("org_abc-123", "attachment", blob);

      expect(key).toMatch(
        /^org_abc-123\/attachment\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it("creates nested directories on first write", async () => {
      const blob = Buffer.from("test");
      const key = await store.put("org_def-456", "recording", blob);

      const filePath = path.join(tmpDir, ...key.split("/"));
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const fileStat = await fs.stat(filePath);
      expect(fileStat.isFile()).toBe(true);
    });

    it("rejects invalid org schema", async () => {
      await expect(
        store.put("../escape", "attachment", Buffer.from("x")),
      ).rejects.toThrow(BlobStoreError);
    });

    it("rejects invalid category", async () => {
      await expect(
        store.put("org_abc-123", "malicious" as "attachment", Buffer.from("x")),
      ).rejects.toThrow(BlobStoreError);
    });
  });

  describe("get", () => {
    it("returns the stored blob content", async () => {
      const blob = Buffer.from("round-trip-test");
      const key = await store.put("org_abc-123", "greeting", blob);

      const result = await store.get(key);
      expect(result).toEqual(blob);
    });

    it("returns null for a nonexistent key", async () => {
      const result = await store.get(
        "org_abc-123/attachment/00000000-0000-0000-0000-000000000000",
      );
      expect(result).toBeNull();
    });

    it("rejects a malformed key", async () => {
      await expect(store.get("../../etc/passwd")).rejects.toThrow(
        BlobStoreError,
      );
    });
  });

  describe("delete", () => {
    it("removes an existing blob", async () => {
      const blob = Buffer.from("to-delete");
      const key = await store.put("org_abc-123", "export", blob);

      await store.delete(key);

      const result = await store.get(key);
      expect(result).toBeNull();
    });

    it("is idempotent (no error for already-deleted blob)", async () => {
      const key = "org_abc-123/attachment/00000000-0000-0000-0000-000000000000";

      // Should not throw even though the file doesn't exist
      await expect(store.delete(key)).resolves.toBeUndefined();
    });

    it("rejects a malformed key", async () => {
      await expect(store.delete("bad/key")).rejects.toThrow(BlobStoreError);
    });
  });

  describe("exists", () => {
    it("returns true for an existing blob", async () => {
      const blob = Buffer.from("check-exists");
      const key = await store.put("org_abc-123", "attachment", blob);

      expect(await store.exists(key)).toBe(true);
    });

    it("returns false for a nonexistent blob", async () => {
      expect(
        await store.exists(
          "org_abc-123/recording/00000000-0000-0000-0000-000000000000",
        ),
      ).toBe(false);
    });

    it("rejects a malformed key", async () => {
      await expect(store.exists("../traversal")).rejects.toThrow(
        BlobStoreError,
      );
    });
  });

  describe("path traversal defense", () => {
    it("rejects org schema with path separators", async () => {
      await expect(
        store.put("org_abc/../../etc", "attachment", Buffer.from("x")),
      ).rejects.toThrow(BlobStoreError);
    });

    it("rejects key with double dots", async () => {
      await expect(
        store.get("org_abc-123/../../../etc/passwd"),
      ).rejects.toThrow(BlobStoreError);
    });
  });
});

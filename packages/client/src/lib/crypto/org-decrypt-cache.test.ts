/**
 * Tests for OrgDecryptCache (async batched Worker pattern).
 *
 * Uses a mock CryptoBridge to verify batch behavior, cache hits,
 * null handling, and whenSettled() synchronization.
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { getSodium, requireSodium, encode } from "@care-y/crypto";
import { OrgKeyManager } from "./org-key.js";
import { OrgDecryptCache } from "./org-decrypt-cache.js";
import { cacheRegistry } from "./cache-registry.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

beforeAll(async () => {
  await getSodium();
});

function createMockBridge(): CryptoBridge & {
  orgDecryptBatch: ReturnType<typeof vi.fn>;
} {
  return {
    orgDecryptBatch: vi.fn(
      async (items: readonly { cacheKey: string; ciphertext: string }[]) => {
        return items.map((item) => ({
          cacheKey: item.cacheKey,
          plaintext: `decrypted:${item.cacheKey}`,
        }));
      },
    ),
    orgEncrypt: vi.fn(),
    orgDecrypt: vi.fn(),
    exportOrgSecretKey: vi.fn(),
    getOrgPublicKey: vi.fn(),
  } as unknown as CryptoBridge & {
    orgDecryptBatch: ReturnType<typeof vi.fn>;
  };
}

describe("OrgDecryptCache", () => {
  let manager: OrgKeyManager;
  let bridge: ReturnType<typeof createMockBridge>;
  let cache: OrgDecryptCache;
  let pkBase64: string;

  beforeEach(() => {
    cacheRegistry.reset();
    bridge = createMockBridge();
    manager = new OrgKeyManager(bridge as unknown as CryptoBridge);
    const backend = requireSodium();
    const sk = backend.randombytes_buf(backend.crypto_box_SECRETKEYBYTES);
    const pk = backend.crypto_scalarmult_base(sk);
    pkBase64 = encode(pk);
    manager.load(pkBase64);
    cache = new OrgDecryptCache(manager, bridge as unknown as CryptoBridge);
  });

  /** Returns a deterministic base64 string for test ciphertext. */
  function fakeData(content: string): string {
    const bytes = new TextEncoder().encode(content);
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  describe("decrypt", () => {
    it("returns null on first call (pending Worker response)", () => {
      const result = cache.decrypt("kb-001", fakeData("test"));
      expect(result).toBeNull();
    });

    it("returns cached value after batch resolves", async () => {
      cache.decrypt("kb-001", fakeData("test"));
      await cache.whenSettled();
      const result = cache.decrypt("kb-001", fakeData("test"));
      expect(result).toBe("decrypted:kb-001");
    });

    it("batches multiple calls in a single microtask", async () => {
      cache.decrypt("kb-001", fakeData("one"));
      cache.decrypt("kb-002", fakeData("two"));
      cache.decrypt("kb-003", fakeData("three"));
      await cache.whenSettled();

      expect(bridge.orgDecryptBatch).toHaveBeenCalledOnce();
      expect(bridge.orgDecryptBatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ cacheKey: "kb-001" }),
          expect.objectContaining({ cacheKey: "kb-002" }),
          expect.objectContaining({ cacheKey: "kb-003" }),
        ]),
      );
    });

    it("returns null for null data", () => {
      const result = cache.decrypt("kb-005", null);
      expect(result).toBeNull();
    });

    it("returns null when org key is not loaded", () => {
      manager.zero();
      const result = cache.decrypt("kb-004", fakeData("test"));
      expect(result).toBeNull();
    });

    it("does not re-queue a pending item", async () => {
      cache.decrypt("kb-001", fakeData("test"));
      cache.decrypt("kb-001", fakeData("test"));
      await cache.whenSettled();

      expect(bridge.orgDecryptBatch).toHaveBeenCalledOnce();
      const items = bridge.orgDecryptBatch.mock.calls[0]?.[0] as unknown[];
      expect(items).toHaveLength(1);
    });

    it("does not cache null results (allows retry)", async () => {
      bridge.orgDecryptBatch.mockResolvedValueOnce([
        { cacheKey: "kb-fail", plaintext: null },
      ]);

      cache.decrypt("kb-fail", fakeData("bad"));
      await cache.whenSettled();

      // Not cached, so next call returns null (pending) and re-queues
      expect(cache.has("kb-fail")).toBe(false);
    });
  });

  describe("has", () => {
    it("returns false for unseen ID", () => {
      expect(cache.has("kb-missing")).toBe(false);
    });

    it("returns true after batch resolves", async () => {
      cache.decrypt("kb-020", fakeData("check"));
      await cache.whenSettled();
      expect(cache.has("kb-020")).toBe(true);
    });
  });

  describe("get", () => {
    it("returns undefined for unseen ID", () => {
      expect(cache.get("kb-missing")).toBeUndefined();
    });

    it("returns cached plaintext after batch resolves", async () => {
      cache.decrypt("kb-030", fakeData("get test"));
      await cache.whenSettled();
      expect(cache.get("kb-030")).toBe("decrypted:kb-030");
    });
  });

  describe("delete", () => {
    it("removes a single cached entry", async () => {
      cache.decrypt("kb-del-1", fakeData("val1"));
      cache.decrypt("kb-del-2", fakeData("val2"));
      await cache.whenSettled();
      expect(cache.size).toBe(2);

      cache.delete("kb-del-1");
      expect(cache.size).toBe(1);
      expect(cache.has("kb-del-1")).toBe(false);
      expect(cache.has("kb-del-2")).toBe(true);
    });

    it("returns false for non-existent key", () => {
      expect(cache.delete("nonexistent")).toBe(false);
    });
  });

  describe("clear", () => {
    it("empties the cache", async () => {
      cache.decrypt("kb-040", fakeData("clear test"));
      await cache.whenSettled();
      expect(cache.size).toBe(1);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has("kb-040")).toBe(false);
    });

    it("clears pending batch queue", () => {
      cache.decrypt("kb-pending", fakeData("queued"));
      cache.clear();
      expect(cache.size).toBe(0);
    });
  });

  describe("size", () => {
    it("returns 0 for empty cache", () => {
      expect(cache.size).toBe(0);
    });

    it("increments after batch resolves", async () => {
      cache.decrypt("kb-050", fakeData("one"));
      cache.decrypt("kb-051", fakeData("two"));
      await cache.whenSettled();
      expect(cache.size).toBe(2);
    });
  });

  describe("whenSettled", () => {
    it("resolves immediately when no pending work", async () => {
      await expect(cache.whenSettled()).resolves.toBeUndefined();
    });

    it("resolves after batch completes", async () => {
      cache.decrypt("kb-060", fakeData("settle test"));
      await cache.whenSettled();
      expect(cache.has("kb-060")).toBe(true);
    });
  });

  describe("decryptAsync", () => {
    it("returns cached value without Worker call", async () => {
      cache.decrypt("kb-async-1", fakeData("warm"));
      await cache.whenSettled();

      bridge.orgDecryptBatch.mockClear();
      const result = await cache.decryptAsync("kb-async-1", fakeData("warm"));
      expect(result).toBe("decrypted:kb-async-1");
      expect(bridge.orgDecryptBatch).not.toHaveBeenCalled();
    });

    it("awaits Worker response on cache miss", async () => {
      const result = await cache.decryptAsync("kb-async-2", fakeData("cold"));
      expect(result).toBe("decrypted:kb-async-2");
      expect(bridge.orgDecryptBatch).toHaveBeenCalledWith([
        expect.objectContaining({ cacheKey: "kb-async-2" }),
      ]);
    });

    it("populates sync cache after async resolve", async () => {
      await cache.decryptAsync("kb-async-3", fakeData("populate"));
      expect(cache.decrypt("kb-async-3", fakeData("populate"))).toBe(
        "decrypted:kb-async-3",
      );
    });

    it("returns null for null data", async () => {
      const result = await cache.decryptAsync("kb-async-4", null);
      expect(result).toBeNull();
    });

    it("returns null when org key is not loaded", async () => {
      manager.zero();
      const result = await cache.decryptAsync("kb-async-5", fakeData("test"));
      expect(result).toBeNull();
    });

    it("returns null on bridge failure", async () => {
      bridge.orgDecryptBatch.mockRejectedValueOnce(new Error("Worker crash"));
      const result = await cache.decryptAsync("kb-async-6", fakeData("fail"));
      expect(result).toBeNull();
    });

    it("returns null when Worker returns null plaintext", async () => {
      bridge.orgDecryptBatch.mockResolvedValueOnce([
        { cacheKey: "kb-async-7", plaintext: null },
      ]);
      const result = await cache.decryptAsync("kb-async-7", fakeData("nil"));
      expect(result).toBeNull();
    });
  });

  describe("error handling", () => {
    it("clears pending on bridge failure (allows retry)", async () => {
      bridge.orgDecryptBatch.mockRejectedValueOnce(new Error("Worker crash"));

      cache.decrypt("kb-err", fakeData("test"));
      await cache.whenSettled();

      expect(cache.has("kb-err")).toBe(false);
    });
  });

  describe("cache registry", () => {
    it("registers with cacheRegistry on construction", () => {
      expect(cacheRegistry.registered).toContain("OrgDecryptCache");
    });
  });
});

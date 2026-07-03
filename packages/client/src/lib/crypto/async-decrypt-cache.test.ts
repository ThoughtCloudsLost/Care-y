/**
 * Tests for AsyncDecryptCache.
 *
 * Uses a mock CryptoBridge. Tests verify that the base class auto-registers
 * with the cache registry, delegates to bridge.decrypt(), caches results,
 * and handles errors.
 *
 * Since AsyncDecryptCache.decrypt() is protected, tests use a thin
 * concrete subclass that exposes it.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import {
  AsyncDecryptCache,
  DECRYPT_ERROR_SENTINEL,
  isDecryptError,
} from "./async-decrypt-cache.js";
import { cacheRegistry } from "./cache-registry.js";

class TestDecryptCache extends AsyncDecryptCache {
  /** Expose the protected decrypt() for testing. */
  testDecrypt(
    cacheKey: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): string | undefined {
    return this.decrypt(
      cacheKey,
      "ticket-test",
      "title",
      ephemeralPoint,
      nonce,
      wrappedKey,
      ciphertext,
    );
  }

  testSetError(key: string): void {
    this.setError(key);
  }

  /** Expose the protected decryptAndRewrap() for testing. */
  testDecryptAndRewrap(
    cacheKey: string,
    followUpId: string,
    ticketId: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): string | undefined {
    return this.decryptAndRewrap(
      cacheKey,
      followUpId,
      ticketId,
      ephemeralPoint,
      nonce,
      wrappedKey,
      ciphertext,
    );
  }
}

const CACHE_KEY = "item-001";
const EP = "ep-base64";
const NONCE = "nonce-base64";
const WK = "wk-base64";
const CT = "ciphertext-base64";

function createMockBridge(): {
  bridge: CryptoBridge;
  mockDecrypt: ReturnType<typeof vi.fn>;
  mockDecryptAndRewrap: ReturnType<typeof vi.fn>;
} {
  const mockDecrypt =
    vi.fn<
      (
        id: string,
        ep: string,
        nonce: string,
        wk: string,
        ct: string,
      ) => Promise<string>
    >();
  mockDecrypt.mockResolvedValue("decrypted-text");

  const mockDecryptAndRewrap =
    vi.fn<
      (
        followUpId: string,
        ticketId: string,
        ep: string,
        nonce: string,
        wk: string,
        ct: string,
      ) => Promise<string>
    >();
  mockDecryptAndRewrap.mockResolvedValue("rewrap-decrypted-text");

  return {
    bridge: {
      decrypt: mockDecrypt,
      decryptAndRewrap: mockDecryptAndRewrap,
    } as unknown as CryptoBridge,
    mockDecrypt,
    mockDecryptAndRewrap,
  };
}

describe("AsyncDecryptCache", () => {
  let cache: TestDecryptCache;
  let mockDecrypt: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cacheRegistry.reset();
    const { bridge, mockDecrypt: md } = createMockBridge();
    mockDecrypt = md;
    cache = new TestDecryptCache(bridge, `TestCache-${Date.now()}`);
  });

  it("auto-registers with cacheRegistry on construction", () => {
    const label = `AutoReg-${Date.now()}`;
    const { bridge } = createMockBridge();
    new TestDecryptCache(bridge, label);
    expect(cacheRegistry.registered).toContain(label);
  });

  describe("decrypt", () => {
    it("returns undefined on first call and triggers bridge.decrypt()", () => {
      const result = cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);
      expect(result).toBeUndefined();
      expect(mockDecrypt).toHaveBeenCalledOnce();
      expect(mockDecrypt).toHaveBeenCalledWith(
        "ticket-test",
        "title",
        CACHE_KEY,
        EP,
        NONCE,
        WK,
        CT,
      );
    });

    it("returns cached plaintext after async resolve", async () => {
      cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);

      await vi.waitFor(() => {
        expect(cache.has(CACHE_KEY)).toBe(true);
      });

      const result = cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);
      expect(result).toBe("decrypted-text");
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });

    it("de-duplicates concurrent calls for the same key", () => {
      cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);
      cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);
      cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);
      expect(mockDecrypt).toHaveBeenCalledOnce();
    });

    it("stores error sentinel on decrypt failure", async () => {
      mockDecrypt.mockRejectedValueOnce(new Error("decrypt failed"));

      const result = cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);
      expect(result).toBeUndefined();

      await vi.waitFor(() => {
        expect(cache.has(CACHE_KEY)).toBe(true);
      });

      expect(cache.get(CACHE_KEY)).toBe(DECRYPT_ERROR_SENTINEL);
      expect(isDecryptError(cache.get(CACHE_KEY))).toBe(true);
    });

    it("isDecryptError returns false for valid plaintext", () => {
      expect(isDecryptError("hello world")).toBe(false);
      expect(isDecryptError(undefined)).toBe(false);
    });
  });

  describe("decryptAndRewrap", () => {
    it("returns undefined on first call and triggers bridge.decryptAndRewrap()", () => {
      const { bridge, mockDecryptAndRewrap } = createMockBridge();
      const c = new TestDecryptCache(bridge, `RewrapTest-${Date.now()}`);

      const result = c.testDecryptAndRewrap(
        CACHE_KEY,
        "fu-1",
        "ticket-1",
        EP,
        NONCE,
        WK,
        CT,
      );
      expect(result).toBeUndefined();
      expect(mockDecryptAndRewrap).toHaveBeenCalledOnce();
      expect(mockDecryptAndRewrap).toHaveBeenCalledWith(
        "fu-1",
        "ticket-1",
        EP,
        NONCE,
        WK,
        CT,
      );
    });

    it("returns cached plaintext after async resolve", async () => {
      const { bridge, mockDecryptAndRewrap } = createMockBridge();
      const c = new TestDecryptCache(bridge, `RewrapCache-${Date.now()}`);

      c.testDecryptAndRewrap(CACHE_KEY, "fu-1", "ticket-1", EP, NONCE, WK, CT);

      await vi.waitFor(() => {
        expect(c.has(CACHE_KEY)).toBe(true);
      });

      const result = c.testDecryptAndRewrap(
        CACHE_KEY,
        "fu-1",
        "ticket-1",
        EP,
        NONCE,
        WK,
        CT,
      );
      expect(result).toBe("rewrap-decrypted-text");
      expect(mockDecryptAndRewrap).toHaveBeenCalledOnce();
    });

    it("stores error sentinel on failure", async () => {
      const { bridge, mockDecryptAndRewrap } = createMockBridge();
      mockDecryptAndRewrap.mockRejectedValueOnce(new Error("rewrap failed"));
      const c = new TestDecryptCache(bridge, `RewrapErr-${Date.now()}`);

      c.testDecryptAndRewrap(CACHE_KEY, "fu-1", "ticket-1", EP, NONCE, WK, CT);

      await vi.waitFor(() => {
        expect(c.has(CACHE_KEY)).toBe(true);
      });

      expect(c.get(CACHE_KEY)).toBe(DECRYPT_ERROR_SENTINEL);
    });
  });

  describe("has / get / size", () => {
    it("has() returns false for unknown key", () => {
      expect(cache.has("unknown")).toBe(false);
    });

    it("get() returns undefined for unknown key", () => {
      expect(cache.get("unknown")).toBeUndefined();
    });

    it("size is 0 initially", () => {
      expect(cache.size).toBe(0);
    });

    it("size reflects cached entries", async () => {
      cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);
      await vi.waitFor(() => {
        expect(cache.size).toBe(1);
      });
    });
  });

  describe("clear", () => {
    it("empties cache and pending set", async () => {
      cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);
      await vi.waitFor(() => {
        expect(cache.size).toBe(1);
      });

      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has(CACHE_KEY)).toBe(false);
    });

    it("resolves outstanding settlers on clear", async () => {
      cache.testDecrypt(CACHE_KEY, EP, NONCE, WK, CT);
      const settled = cache.whenSettled();
      cache.clear();
      await expect(settled).resolves.toBeUndefined();
    });
  });

  describe("seed", () => {
    it("pre-populates the cache with a known plaintext", () => {
      cache.seed("optimistic-key", "typed by user");
      expect(cache.get("optimistic-key")).toBe("typed by user");
      expect(cache.has("optimistic-key")).toBe(true);
    });
  });

  describe("setError", () => {
    it("stores the error sentinel for a cache key", () => {
      cache.testSetError("broken-key");
      expect(cache.get("broken-key")).toBe(DECRYPT_ERROR_SENTINEL);
      expect(isDecryptError(cache.get("broken-key"))).toBe(true);
    });
  });

  describe("deleteByPrefix", () => {
    it("removes entries matching the prefix", async () => {
      cache.seed("fu:t1:a", "val-a");
      cache.seed("fu:t1:b", "val-b");
      cache.seed("title:t1", "title");
      expect(cache.size).toBe(3);

      cache.deleteByPrefix("fu:t1:");
      expect(cache.size).toBe(1);
      expect(cache.has("title:t1")).toBe(true);
      expect(cache.has("fu:t1:a")).toBe(false);
    });

    it("is a no-op when no entries match", () => {
      cache.seed("key1", "val");
      cache.deleteByPrefix("no-match:");
      expect(cache.size).toBe(1);
    });
  });

  describe("entries", () => {
    it("iterates all cached key-value pairs", () => {
      cache.seed("k1", "v1");
      cache.seed("k2", "v2");
      const result = [...cache.entries()];
      expect(result).toEqual(
        expect.arrayContaining([
          ["k1", "v1"],
          ["k2", "v2"],
        ]),
      );
    });
  });

  describe("whenSettled", () => {
    it("resolves immediately when nothing is pending", async () => {
      await expect(cache.whenSettled()).resolves.toBeUndefined();
    });

    it("resolves after all pending decrypts complete", async () => {
      cache.testDecrypt("k1", EP, NONCE, WK, CT);
      cache.testDecrypt("k2", EP, NONCE, WK, CT);
      await cache.whenSettled();
      expect(cache.size).toBe(2);
    });
  });
});

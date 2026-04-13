/**
 * Tests for OrgDecryptCache.
 *
 * Uses the real @care-y/crypto WASM backend for crypto correctness.
 * Round-trip test: seal with crypto_box_seal (server side), then
 * decrypt via OrgDecryptCache (wrapping OrgKeyManager). This verifies
 * the full wire path from server ciphertext to client plaintext.
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getSodium, requireSodium } from "@care-y/crypto";
import sodium from "libsodium-wrappers-sumo";
import { OrgKeyManager } from "./org-key.js";
import { OrgDecryptCache } from "./org-decrypt-cache.js";
import { cacheRegistry } from "./cache-registry.js";

beforeAll(async () => {
  await getSodium();
  await sodium.ready;
});

describe("OrgDecryptCache", () => {
  let manager: OrgKeyManager;
  let cache: OrgDecryptCache;
  let sk: Uint8Array;
  let pk: Uint8Array;

  beforeEach(() => {
    manager = new OrgKeyManager();
    const backend = requireSodium();
    sk = backend.randombytes_buf(backend.crypto_box_SECRETKEYBYTES);
    pk = backend.crypto_scalarmult_base(sk);
    manager.load(sk.buffer);
    cache = new OrgDecryptCache(manager);
  });

  /** Seal a string the same way the server does (crypto_box_seal). */
  function seal(plaintext: string): Uint8Array {
    return sodium.crypto_box_seal(new TextEncoder().encode(plaintext), pk);
  }

  /** Convert Uint8Array to tRPC JSON serialized Buffer format. */
  function toSerializedBuffer(data: Uint8Array): {
    type: "Buffer";
    data: number[];
  } {
    return { type: "Buffer", data: Array.from(data) };
  }

  describe("decrypt", () => {
    it("decrypts a sealed box ciphertext (round-trip)", () => {
      const ct = seal("Housing referral contacts");
      const result = cache.decrypt("kb-001", ct);
      expect(result).toBe("Housing referral contacts");
    });

    it("decrypts from serialized Buffer format (tRPC wire format)", () => {
      const ct = toSerializedBuffer(seal("Legal aid directory"));
      const result = cache.decrypt("kb-002", ct);
      expect(result).toBe("Legal aid directory");
    });

    it("returns cached value on second call (no re-decrypt)", () => {
      const ct = seal("Safety planning template");
      cache.decrypt("kb-003", ct);

      // Zero the key to prove second call uses cache, not decrypt
      manager.zero();
      const result = cache.decrypt("kb-003", ct);
      expect(result).toBe("Safety planning template");
    });

    it("returns null when org key is not loaded", () => {
      manager.zero();
      const ct = seal("Should not decrypt");
      // Re-create cache after zero so it sees the unloaded state
      const unloadedCache = new OrgDecryptCache(manager);
      const result = unloadedCache.decrypt("kb-004", ct);
      expect(result).toBeNull();
    });

    it("returns null for null data", () => {
      const result = cache.decrypt("kb-005", null);
      expect(result).toBeNull();
    });

    it("returns null on decryption failure (wrong key)", () => {
      const backend = requireSodium();
      const wrongSk = backend.randombytes_buf(
        backend.crypto_box_SECRETKEYBYTES,
      );
      const wrongPk = backend.crypto_scalarmult_base(wrongSk);
      const ct = sodium.crypto_box_seal(
        new TextEncoder().encode("wrong key test"),
        wrongPk,
      );
      const result = cache.decrypt("kb-006", ct);
      expect(result).toBeNull();
    });

    it("returns null on truncated ciphertext", () => {
      const ct = seal("truncation test");
      const truncated = ct.slice(0, Math.floor(ct.length / 2));
      const result = cache.decrypt("kb-007", truncated);
      expect(result).toBeNull();
    });

    it("caches different IDs independently", () => {
      const ct1 = seal("Article One");
      const ct2 = seal("Article Two");
      cache.decrypt("kb-010", ct1);
      cache.decrypt("kb-011", ct2);
      expect(cache.get("kb-010")).toBe("Article One");
      expect(cache.get("kb-011")).toBe("Article Two");
    });
  });

  describe("has", () => {
    it("returns false for unseen ID", () => {
      expect(cache.has("kb-missing")).toBe(false);
    });

    it("returns true after successful decrypt", () => {
      const ct = seal("check");
      cache.decrypt("kb-020", ct);
      expect(cache.has("kb-020")).toBe(true);
    });
  });

  describe("get", () => {
    it("returns undefined for unseen ID", () => {
      expect(cache.get("kb-missing")).toBeUndefined();
    });

    it("returns cached plaintext after decrypt", () => {
      const ct = seal("get test");
      cache.decrypt("kb-030", ct);
      expect(cache.get("kb-030")).toBe("get test");
    });
  });

  describe("clear", () => {
    it("empties the cache", () => {
      const ct = seal("clear test");
      cache.decrypt("kb-040", ct);
      expect(cache.size).toBe(1);
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has("kb-040")).toBe(false);
    });
  });

  describe("size", () => {
    it("returns 0 for empty cache", () => {
      expect(cache.size).toBe(0);
    });

    it("increments after each successful decrypt", () => {
      cache.decrypt("kb-050", seal("one"));
      cache.decrypt("kb-051", seal("two"));
      expect(cache.size).toBe(2);
    });

    it("does not increment on decrypt failure", () => {
      const backend = requireSodium();
      const wrongSk = backend.randombytes_buf(
        backend.crypto_box_SECRETKEYBYTES,
      );
      const wrongPk = backend.crypto_scalarmult_base(wrongSk);
      const ct = sodium.crypto_box_seal(
        new TextEncoder().encode("bad"),
        wrongPk,
      );
      cache.decrypt("kb-052", ct);
      expect(cache.size).toBe(0);
    });
  });

  describe("cache registry", () => {
    it("registers with cacheRegistry on construction", () => {
      expect(cacheRegistry.registered).toContain("OrgDecryptCache");
    });
  });
});

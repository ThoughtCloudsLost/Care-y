/**
 * Tests for OrgKeyManager (async facade over crypto Worker).
 *
 * Uses a mock CryptoBridge since the real Worker is not available in
 * unit tests. Verifies the facade correctly delegates to bridge methods,
 * manages local public key state, and handles error conditions.
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { getSodium, requireSodium, encode } from "@care-y/crypto";
import { OrgKeyManager, OrgKeyNotLoadedError } from "./org-key.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

beforeAll(async () => {
  await getSodium();
});

function createMockBridge(): CryptoBridge {
  return {
    orgEncrypt: vi.fn(async (plaintextB64: string) => {
      // Simulate: seal(plaintext) -> ciphertext. Just prefix for identification.
      return encode(new TextEncoder().encode(`sealed:${plaintextB64}`));
    }),
    orgDecrypt: vi.fn(async (ciphertextB64: string) => {
      // Simulate: unseal(ciphertext) -> raw bytes as base64.
      // Return the input ciphertext base64 as-is (identity decrypt for testing).
      return ciphertextB64;
    }),
    orgDecryptBatch: vi.fn(),
    exportOrgSecretKey: vi.fn(async () => {
      const sodium = requireSodium();
      const sk = sodium.randombytes_buf(32);
      return sk.buffer as ArrayBuffer;
    }),
    getOrgPublicKey: vi.fn(),
  } as unknown as CryptoBridge;
}

describe("OrgKeyManager", () => {
  let manager: OrgKeyManager;
  let bridge: CryptoBridge;
  let pk: Uint8Array;
  let pkBase64: string;

  beforeEach(() => {
    bridge = createMockBridge();
    manager = new OrgKeyManager(bridge);
    const backend = requireSodium();
    const sk = backend.randombytes_buf(backend.crypto_box_SECRETKEYBYTES);
    pk = backend.crypto_scalarmult_base(sk);
    pkBase64 = encode(pk);
  });

  describe("load", () => {
    it("sets isLoaded to true", () => {
      expect(manager.isLoaded).toBe(false);
      manager.load(pkBase64);
      expect(manager.isLoaded).toBe(true);
    });

    it("replaces previous key on re-load", () => {
      manager.load(pkBase64);
      const backend = requireSodium();
      const newSk = backend.randombytes_buf(backend.crypto_box_SECRETKEYBYTES);
      const newPk = backend.crypto_scalarmult_base(newSk);
      const newPkB64 = encode(newPk);

      manager.load(newPkB64);
      expect(manager.isLoaded).toBe(true);
      expect(manager.getPublicKey()).toEqual(newPk);
    });
  });

  describe("encrypt", () => {
    it("delegates to bridge.orgEncrypt", async () => {
      manager.load(pkBase64);
      const plaintext = new TextEncoder().encode("test payload");
      await manager.encrypt(plaintext);
      expect(bridge.orgEncrypt).toHaveBeenCalledOnce();
    });

    it("throws OrgKeyNotLoadedError when key is not loaded", async () => {
      const plaintext = new TextEncoder().encode("test");
      await expect(manager.encrypt(plaintext)).rejects.toThrow(
        OrgKeyNotLoadedError,
      );
    });

    it("returns Uint8Array result from bridge", async () => {
      manager.load(pkBase64);
      const plaintext = new TextEncoder().encode("test");
      const result = await manager.encrypt(plaintext);
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe("encryptText", () => {
    it("encrypts a UTF-8 string and returns base64 ciphertext", async () => {
      manager.load(pkBase64);
      const result = await manager.encryptText("hello world");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("throws OrgKeyNotLoadedError when key is not loaded", async () => {
      await expect(manager.encryptText("fail")).rejects.toThrow(
        OrgKeyNotLoadedError,
      );
    });
  });

  describe("decrypt", () => {
    it("delegates to bridge.orgDecrypt", async () => {
      manager.load(pkBase64);
      const ciphertext = new Uint8Array([1, 2, 3, 4]);
      await manager.decrypt(ciphertext);
      expect(bridge.orgDecrypt).toHaveBeenCalledOnce();
    });

    it("throws OrgKeyNotLoadedError when key is not loaded", async () => {
      const ciphertext = new TextEncoder().encode("test");
      await expect(manager.decrypt(ciphertext)).rejects.toThrow(
        OrgKeyNotLoadedError,
      );
    });

    it("returns raw Uint8Array bytes from bridge response (binary-safe)", async () => {
      manager.load(pkBase64);
      const inputBytes = new Uint8Array([0x00, 0x89, 0x50, 0x4e, 0x47]);
      const result = await manager.decrypt(inputBytes);
      expect(result).toBeInstanceOf(Uint8Array);
      // Mock returns ciphertext as-is (identity), so output equals input
      expect(result).toEqual(inputBytes);
    });
  });

  describe("getSecretKey", () => {
    it("returns null when key is not loaded", async () => {
      const result = await manager.getSecretKey();
      expect(result).toBeNull();
    });

    it("delegates to bridge.exportOrgSecretKey when loaded", async () => {
      manager.load(pkBase64);
      const result = await manager.getSecretKey();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(bridge.exportOrgSecretKey).toHaveBeenCalledOnce();
    });
  });

  describe("getPublicKey", () => {
    it("returns null when not loaded", () => {
      expect(manager.getPublicKey()).toBeNull();
    });

    it("returns a copy of the public key when loaded", () => {
      manager.load(pkBase64);
      const result = manager.getPublicKey();
      expect(result).toEqual(pk);
      expect(result).not.toBe(pk);
    });
  });

  describe("zero", () => {
    it("clears the key and sets isLoaded to false", () => {
      manager.load(pkBase64);
      expect(manager.isLoaded).toBe(true);

      manager.zero();
      expect(manager.isLoaded).toBe(false);
    });

    it("makes subsequent encrypt throw OrgKeyNotLoadedError", async () => {
      manager.load(pkBase64);
      manager.zero();

      const plaintext = new TextEncoder().encode("test");
      await expect(manager.encrypt(plaintext)).rejects.toThrow(
        OrgKeyNotLoadedError,
      );
    });

    it("is idempotent (no error when called on null key)", () => {
      expect(() => {
        manager.zero();
      }).not.toThrow();
    });

    it("is idempotent (no error when called twice after load)", () => {
      manager.load(pkBase64);
      manager.zero();
      expect(() => {
        manager.zero();
      }).not.toThrow();
    });
  });

  describe("isLoaded", () => {
    it("returns false initially", () => {
      expect(manager.isLoaded).toBe(false);
    });

    it("returns true after load", () => {
      manager.load(pkBase64);
      expect(manager.isLoaded).toBe(true);
    });

    it("returns false after zero", () => {
      manager.load(pkBase64);
      manager.zero();
      expect(manager.isLoaded).toBe(false);
    });
  });
});

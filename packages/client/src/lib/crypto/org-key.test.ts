/**
 * Tests for OrgKeyManager.
 *
 * Uses the real @care-y/crypto WASM backend for crypto correctness.
 * Generates Curve25519 keypairs via SodiumBackend and creates sealed
 * boxes via libsodium-wrappers-sumo (devDep) for crypto_box_seal
 * (the seal direction, which SodiumBackend intentionally omits since
 * sealing is a server-side operation done via sodium-native).
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getSodium, requireSodium } from "@care-y/crypto";
import sodium from "libsodium-wrappers-sumo";
import { OrgKeyManager, OrgKeyNotLoadedError } from "./org-key.js";

beforeAll(async () => {
  await getSodium();
  await sodium.ready;
});

describe("OrgKeyManager", () => {
  let manager: OrgKeyManager;
  let sk: Uint8Array;
  let pk: Uint8Array;

  beforeEach(() => {
    manager = new OrgKeyManager();
    const backend = requireSodium();
    sk = backend.randombytes_buf(backend.crypto_box_SECRETKEYBYTES);
    pk = backend.crypto_scalarmult_base(sk);
  });

  describe("load", () => {
    it("sets isLoaded to true", () => {
      expect(manager.isLoaded).toBe(false);
      manager.load(sk.buffer);
      expect(manager.isLoaded).toBe(true);
    });

    it("zeros previous key when loading a replacement", () => {
      // Create a buffer and wrap it as Uint8Array so we can observe zeroing.
      // Loading the ArrayBuffer directly (no copy) means the manager's
      // internal Uint8Array and our view share the same backing memory.
      // When the manager calls memzero on the old key during replacement,
      // our view sees the zeroed bytes.
      const backend = requireSodium();
      const buf = new ArrayBuffer(backend.crypto_box_SECRETKEYBYTES);
      const view = new Uint8Array(buf);
      view.set(sk);
      manager.load(buf);

      // Load a different key (simulates re-login without logout)
      const newSk = backend.randombytes_buf(backend.crypto_box_SECRETKEYBYTES);
      manager.load(newSk.buffer);

      expect(view.every((b) => b === 0)).toBe(true);

      manager.zero();
    });
  });

  describe("decrypt", () => {
    it("unseals a sealed box (roundtrip)", () => {
      const message = new TextEncoder().encode("org branding payload");
      const ciphertext = sodium.crypto_box_seal(message, pk);

      manager.load(sk.buffer);
      const decrypted = manager.decrypt(ciphertext);

      expect(decrypted).toEqual(message);
      manager.zero();
    });

    it("decrypts different messages with same key", () => {
      manager.load(sk.buffer);

      const msg1 = new TextEncoder().encode("branding name");
      const msg2 = new TextEncoder().encode("branding color: #ff5733");

      const ct1 = sodium.crypto_box_seal(msg1, pk);
      const ct2 = sodium.crypto_box_seal(msg2, pk);

      expect(manager.decrypt(ct1)).toEqual(msg1);
      expect(manager.decrypt(ct2)).toEqual(msg2);
      manager.zero();
    });

    it("throws OrgKeyNotLoadedError when key is not loaded", () => {
      const ciphertext = sodium.crypto_box_seal(
        new TextEncoder().encode("test"),
        pk,
      );
      expect(() => manager.decrypt(ciphertext)).toThrow(OrgKeyNotLoadedError);
    });

    it("throws on wrong key (ciphertext sealed with different keypair)", () => {
      const backend = requireSodium();
      const wrongSk = backend.randombytes_buf(
        backend.crypto_box_SECRETKEYBYTES,
      );
      const wrongPk = backend.crypto_scalarmult_base(wrongSk);

      const ciphertext = sodium.crypto_box_seal(
        new TextEncoder().encode("secret"),
        wrongPk,
      );

      manager.load(sk.buffer);
      expect(() => manager.decrypt(ciphertext)).toThrow();
      manager.zero();
    });

    it("throws on truncated ciphertext", () => {
      const message = new TextEncoder().encode("test message");
      const ciphertext = sodium.crypto_box_seal(message, pk);

      manager.load(sk.buffer);
      const truncated = ciphertext.slice(0, Math.floor(ciphertext.length / 2));
      expect(() => manager.decrypt(truncated)).toThrow();
      manager.zero();
    });

    it("throws on empty ciphertext", () => {
      manager.load(sk.buffer);
      expect(() => manager.decrypt(new Uint8Array(0))).toThrow();
      manager.zero();
    });

    it("throws on flipped bits in ciphertext", () => {
      const message = new TextEncoder().encode("authentic message");
      const ciphertext = sodium.crypto_box_seal(message, pk);

      const tampered = new Uint8Array(ciphertext);
      // Sealed box ciphertext is always >= SEALBYTES (48) bytes,
      // so length - 1 is always a valid index.
      const lastIdx = tampered.length - 1;
      tampered[lastIdx] = (tampered[lastIdx] ?? 0) ^ 0x01;

      manager.load(sk.buffer);
      expect(() => manager.decrypt(tampered)).toThrow();
      manager.zero();
    });
  });

  describe("zero", () => {
    it("clears the key and sets isLoaded to false", () => {
      manager.load(sk.buffer);
      expect(manager.isLoaded).toBe(true);

      manager.zero();
      expect(manager.isLoaded).toBe(false);
    });

    it("makes subsequent decrypt throw OrgKeyNotLoadedError", () => {
      manager.load(sk.buffer);
      manager.zero();

      const ciphertext = sodium.crypto_box_seal(
        new TextEncoder().encode("test"),
        pk,
      );
      expect(() => manager.decrypt(ciphertext)).toThrow(OrgKeyNotLoadedError);
    });

    it("is idempotent (no error when called on null key)", () => {
      expect(() => {
        manager.zero();
      }).not.toThrow();
    });

    it("is idempotent (no error when called twice after load)", () => {
      manager.load(sk.buffer);
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
      manager.load(sk.buffer);
      expect(manager.isLoaded).toBe(true);
      manager.zero();
    });

    it("returns false after zero", () => {
      manager.load(sk.buffer);
      manager.zero();
      expect(manager.isLoaded).toBe(false);
    });
  });
});

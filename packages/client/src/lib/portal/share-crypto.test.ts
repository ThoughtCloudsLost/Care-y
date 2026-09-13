import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { getSodium, decode, DecryptionError } from "@care-y/crypto";
import { encryptShare, decryptShare } from "./share-crypto.js";

beforeAll(async () => {
  await getSodium();
});

describe("share-crypto", () => {
  describe("roundtrip", () => {
    it("decryptShare recovers the original text", () => {
      const id = crypto.randomUUID();
      const text = "Here is a safe address: 123 Main St.";
      const { ciphertext, fragmentKey } = encryptShare(id, text);
      expect(decryptShare(id, ciphertext, fragmentKey)).toBe(text);
    });

    it("roundtrips multi-line text", () => {
      const id = crypto.randomUUID();
      const text = "Line 1\nLine 2\nLine 3";
      const { ciphertext, fragmentKey } = encryptShare(id, text);
      expect(decryptShare(id, ciphertext, fragmentKey)).toBe(text);
    });

    it("roundtrips emoji text", () => {
      const id = crypto.randomUUID();
      const text =
        "Safe house directions \u{1F3E0}\u{1F449} turn left at \u{1F6A6}";
      const { ciphertext, fragmentKey } = encryptShare(id, text);
      expect(decryptShare(id, ciphertext, fragmentKey)).toBe(text);
    });

    it("roundtrips empty string", () => {
      const id = crypto.randomUUID();
      const { ciphertext, fragmentKey } = encryptShare(id, "");
      expect(decryptShare(id, ciphertext, fragmentKey)).toBe("");
    });
  });

  describe("AAD binding", () => {
    it("throws when shareId does not match (AAD mismatch)", () => {
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();
      const { ciphertext, fragmentKey } = encryptShare(id1, "secret");
      expect(() => decryptShare(id2, ciphertext, fragmentKey)).toThrow(
        DecryptionError,
      );
    });
  });

  describe("tampered ciphertext", () => {
    it("throws DecryptionError on bit-flipped ciphertext", () => {
      const id = crypto.randomUUID();
      const { ciphertext, fragmentKey } = encryptShare(id, "secret content");
      const bytes = decode(ciphertext);
      bytes[bytes.length - 1] = (bytes[bytes.length - 1] ?? 0) ^ 0xff;
      // Re-encode the tampered bytes manually
      let binary = "";
      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }
      const tampered = btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      expect(() => decryptShare(id, tampered, fragmentKey)).toThrow(
        DecryptionError,
      );
    });

    it("throws on truncated ciphertext", () => {
      const id = crypto.randomUUID();
      const { ciphertext, fragmentKey } = encryptShare(id, "hello");
      // Take only the first 10 chars of base64
      const truncated = ciphertext.slice(0, 10);
      expect(() => decryptShare(id, truncated, fragmentKey)).toThrow();
    });
  });

  describe("key properties", () => {
    it("fragmentKey decodes to exactly 32 bytes", () => {
      const id = crypto.randomUUID();
      const { fragmentKey } = encryptShare(id, "test");
      const keyBytes = decode(fragmentKey);
      expect(keyBytes).toHaveLength(32);
    });

    it("two encrypts of the same text yield different ciphertexts", () => {
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();
      const text = "same content";
      const r1 = encryptShare(id1, text);
      const r2 = encryptShare(id2, text);
      expect(r1.ciphertext).not.toBe(r2.ciphertext);
      expect(r1.fragmentKey).not.toBe(r2.fragmentKey);
    });

    it("two encrypts with the same shareId yield different ciphertexts (fresh key + nonce)", () => {
      const id = crypto.randomUUID();
      const text = "same content same id";
      const r1 = encryptShare(id, text);
      const r2 = encryptShare(id, text);
      expect(r1.ciphertext).not.toBe(r2.ciphertext);
      expect(r1.fragmentKey).not.toBe(r2.fragmentKey);
    });
  });

  describe("malformed inputs", () => {
    it("throws on malformed base64url ciphertext", () => {
      const id = crypto.randomUUID();
      const { fragmentKey } = encryptShare(id, "test");
      expect(() => decryptShare(id, "!!!not-valid!!!", fragmentKey)).toThrow();
    });

    it("throws on malformed base64url fragment key", () => {
      const id = crypto.randomUUID();
      const { ciphertext } = encryptShare(id, "test");
      expect(() => decryptShare(id, ciphertext, "!!!bad-key!!!")).toThrow();
    });

    it("throws on wrong-length fragment key (too short)", () => {
      const id = crypto.randomUUID();
      const { ciphertext } = encryptShare(id, "test");
      // 16 bytes instead of 32
      const shortKey = new Uint8Array(16);
      crypto.getRandomValues(shortKey);
      let binary = "";
      for (const byte of shortKey) {
        binary += String.fromCharCode(byte);
      }
      const encoded = btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      // toSymmetricKey rejects non-32-byte keys before decryption starts
      expect(() => decryptShare(id, ciphertext, encoded)).toThrow(RangeError);
    });

    it("throws on wrong-length fragment key (too long)", () => {
      const id = crypto.randomUUID();
      const { ciphertext } = encryptShare(id, "test");
      // 64 bytes instead of 32
      const longKey = new Uint8Array(64);
      crypto.getRandomValues(longKey);
      let binary = "";
      for (const byte of longKey) {
        binary += String.fromCharCode(byte);
      }
      const encoded = btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      // toSymmetricKey rejects non-32-byte keys before decryption starts
      expect(() => decryptShare(id, ciphertext, encoded)).toThrow(RangeError);
    });

    it("throws on completely wrong key (correct length, random bytes)", () => {
      const id = crypto.randomUUID();
      const { ciphertext } = encryptShare(id, "test");
      const wrongKey = new Uint8Array(32);
      crypto.getRandomValues(wrongKey);
      let binary = "";
      for (const byte of wrongKey) {
        binary += String.fromCharCode(byte);
      }
      const encoded = btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      expect(() => decryptShare(id, ciphertext, encoded)).toThrow(
        DecryptionError,
      );
    });
  });

  describe("fast-check properties", () => {
    it("roundtrips arbitrary unicode text", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 5_000 }), (text) => {
          const id = crypto.randomUUID();
          const { ciphertext, fragmentKey } = encryptShare(id, text);
          expect(decryptShare(id, ciphertext, fragmentKey)).toBe(text);
        }),
        { numRuns: 20 },
      );
    });
  });
});

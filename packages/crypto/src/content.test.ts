import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import {
  generateContentKey,
  encryptContent,
  decryptContent,
} from "./content.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError, InvalidKeyError } from "./errors.js";
import type { SymmetricKey, Ciphertext } from "./types.js";

describe("content encryption", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("generateContentKey", () => {
    it("returns a 32-byte key", () => {
      const key = generateContentKey();
      expect(key.length).toBe(sodium.crypto_secretbox_KEYBYTES);
    });

    it("is not all zeros", () => {
      const key = generateContentKey();
      expect(key.every((b) => b === 0)).toBe(false);
    });

    it("returns different keys on successive calls", () => {
      const a = generateContentKey();
      const b = generateContentKey();
      expect(a).not.toEqual(b);
    });
  });

  describe("encryptContent -> decryptContent roundtrip", () => {
    it("recovers original plaintext", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("ticket content here");

      const encrypted = encryptContent(plaintext, key);
      const decrypted = decryptContent(encrypted, key);

      expect(decrypted).toEqual(plaintext);
    });

    it("works with empty plaintext", () => {
      const key = generateContentKey();
      const plaintext = new Uint8Array(0);

      const encrypted = encryptContent(plaintext, key);
      const decrypted = decryptContent(encrypted, key);

      expect(decrypted).toEqual(plaintext);
    });

    it("works with large plaintext", () => {
      const key = generateContentKey();
      const plaintext = sodium.randombytes_buf(10_000);

      const encrypted = encryptContent(plaintext, key);
      const decrypted = decryptContent(encrypted, key);

      expect(decrypted).toEqual(plaintext);
    });
  });

  // Wire format tests guard backward compatibility with ciphertext already
  // stored in the DB. The nonce||ciphertext layout is a contract: changing
  // it would make all persisted encrypted content undecryptable.
  describe("ciphertext format", () => {
    it("output is nonce + MAC + plaintext length", () => {
      const key = generateContentKey();
      const plaintext = new Uint8Array(64);

      const encrypted = encryptContent(plaintext, key);
      const expectedLen =
        sodium.crypto_secretbox_NONCEBYTES +
        sodium.crypto_secretbox_MACBYTES +
        plaintext.length;
      expect(encrypted.length).toBe(expectedLen);
    });

    it("different encryptions of same plaintext produce different blobs", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("same content");

      const a = encryptContent(plaintext, key);
      const b = encryptContent(plaintext, key);

      expect(a).not.toEqual(b);
    });
  });

  describe("decryption failures", () => {
    it("throws DecryptionError with wrong key", () => {
      const key = generateContentKey();
      const wrongKey = generateContentKey();
      const plaintext = new TextEncoder().encode("secret");

      const encrypted = encryptContent(plaintext, key);
      expect(() => decryptContent(encrypted, wrongKey)).toThrow(
        DecryptionError,
      );
    });

    it("throws DecryptionError with tampered ciphertext (flipped byte in ciphertext portion)", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("tamper-test");

      const encrypted = encryptContent(plaintext, key);
      const tampered = new Uint8Array(encrypted);
      // Flip a byte in the ciphertext portion (after the 24-byte nonce)
      const idx = sodium.crypto_secretbox_NONCEBYTES + 1;
      tampered[idx] = (tampered[idx] ?? 0) ^ 0xff;

      expect(() => decryptContent(tampered as Ciphertext, key)).toThrow(
        DecryptionError,
      );
    });

    it("throws DecryptionError with truncated blob (shorter than nonce + MAC)", () => {
      const key = generateContentKey();
      const truncated = new Uint8Array(10) as Ciphertext;

      expect(() => decryptContent(truncated, key)).toThrow(DecryptionError);
    });
  });

  describe("boundary sizes", () => {
    it("works with single-byte plaintext", () => {
      const key = generateContentKey();
      const plaintext = new Uint8Array([0x42]);

      const encrypted = encryptContent(plaintext, key);
      const decrypted = decryptContent(encrypted, key);

      expect(decrypted).toEqual(plaintext);
    });

    it("rejects blob that is exactly nonce-length (no MAC, no ciphertext)", () => {
      const key = generateContentKey();
      const tooShort = new Uint8Array(
        sodium.crypto_secretbox_NONCEBYTES,
      ) as Ciphertext;

      expect(() => decryptContent(tooShort, key)).toThrow(DecryptionError);
    });

    it("accepts blob that is exactly nonce + MAC length (zero-length plaintext)", () => {
      const key = generateContentKey();
      const plaintext = new Uint8Array(0);
      const encrypted = encryptContent(plaintext, key);

      // Verify the blob is exactly nonce + MAC bytes
      expect(encrypted.length).toBe(
        sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES,
      );

      const decrypted = decryptContent(encrypted, key);
      expect(decrypted).toEqual(plaintext);
    });
  });

  describe("input validation", () => {
    it("throws InvalidKeyError for wrong-length key on encrypt", () => {
      const shortKey = new Uint8Array(16) as SymmetricKey;
      const plaintext = new TextEncoder().encode("test");

      expect(() => encryptContent(plaintext, shortKey)).toThrow(
        InvalidKeyError,
      );
    });

    it("throws InvalidKeyError for wrong-length key on decrypt", () => {
      const key = generateContentKey();
      const shortKey = new Uint8Array(16) as SymmetricKey;
      const plaintext = new TextEncoder().encode("test");

      const encrypted = encryptContent(plaintext, key);
      expect(() => decryptContent(encrypted, shortKey)).toThrow(
        InvalidKeyError,
      );
    });
  });

  describe("property-based", () => {
    it("roundtrip recovers arbitrary plaintext", () => {
      const key = generateContentKey();
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 10_000 }),
          (plaintext) => {
            const encrypted = encryptContent(plaintext, key);
            const decrypted = decryptContent(encrypted, key);
            expect(decrypted).toEqual(plaintext);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});

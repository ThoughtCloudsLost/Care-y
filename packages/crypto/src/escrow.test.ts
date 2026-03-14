import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import {
  encryptWithPassphrase,
  decryptWithPassphrase,
  serializeEscrowBlob,
  deserializeEscrowBlob,
} from "./escrow.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError, InvalidInputError } from "./errors.js";

describe("escrow encryption", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("encryptWithPassphrase -> decryptWithPassphrase roundtrip", () => {
    it("recovers original data", () => {
      const data = sodium.randombytes_buf(32);
      const passphrase = new TextEncoder().encode("escrow-test-passphrase");

      const blob = encryptWithPassphrase(data, passphrase);
      const recovered = decryptWithPassphrase(blob, passphrase);

      expect(recovered).toEqual(data);
    }, 30_000);

    it("works with empty data", () => {
      const data = new Uint8Array(0);
      const passphrase = new TextEncoder().encode("empty-data-test");

      const blob = encryptWithPassphrase(data, passphrase);
      const recovered = decryptWithPassphrase(blob, passphrase);

      expect(recovered).toEqual(data);
    }, 30_000);
  });

  describe("escrow blob structure", () => {
    it("salt is 16 bytes, nonce is 24 bytes", () => {
      const data = sodium.randombytes_buf(32);
      const passphrase = new TextEncoder().encode("structure-test");

      const blob = encryptWithPassphrase(data, passphrase);

      expect(blob.salt.length).toBe(sodium.crypto_pwhash_SALTBYTES);
      expect(blob.nonce.length).toBe(sodium.crypto_secretbox_NONCEBYTES);
      expect(blob.ciphertext.length).toBe(
        data.length + sodium.crypto_secretbox_MACBYTES,
      );
    }, 30_000);

    it("different encryptions produce different salt and nonce", () => {
      const data = sodium.randombytes_buf(32);
      const passphrase = new TextEncoder().encode("uniqueness-test");

      const a = encryptWithPassphrase(data, passphrase);
      const b = encryptWithPassphrase(data, passphrase);

      expect(a.salt).not.toEqual(b.salt);
      expect(a.nonce).not.toEqual(b.nonce);
    }, 60_000);
  });

  describe("decryption failures", () => {
    it("throws DecryptionError with wrong passphrase", () => {
      const data = sodium.randombytes_buf(32);
      const passphrase = new TextEncoder().encode("correct-passphrase");
      const wrongPassphrase = new TextEncoder().encode("wrong-passphrase");

      const blob = encryptWithPassphrase(data, passphrase);
      expect(() => decryptWithPassphrase(blob, wrongPassphrase)).toThrow(
        DecryptionError,
      );
    }, 60_000);
  });

  describe("input validation", () => {
    it("throws InvalidInputError for empty passphrase", () => {
      const data = sodium.randombytes_buf(32);
      const emptyPassphrase = new Uint8Array(0);

      expect(() => encryptWithPassphrase(data, emptyPassphrase)).toThrow(
        InvalidInputError,
      );
    });
  });

  describe("serialization", () => {
    it("serializeEscrowBlob -> deserializeEscrowBlob roundtrip", () => {
      const data = sodium.randombytes_buf(64);
      const passphrase = new TextEncoder().encode("serialize-test");

      const blob = encryptWithPassphrase(data, passphrase);
      const serialized = serializeEscrowBlob(blob);
      const deserialized = deserializeEscrowBlob(serialized);

      // Deserialized blob should decrypt to original data
      const recovered = decryptWithPassphrase(deserialized, passphrase);
      expect(recovered).toEqual(data);
    }, 30_000);

    it("serialized format is salt || nonce || ciphertext", () => {
      const data = sodium.randombytes_buf(32);
      const passphrase = new TextEncoder().encode("format-test");

      const blob = encryptWithPassphrase(data, passphrase);
      const serialized = serializeEscrowBlob(blob);

      const expectedLen =
        blob.salt.length + blob.nonce.length + blob.ciphertext.length;
      expect(serialized.length).toBe(expectedLen);

      // Verify byte layout
      const saltPart = serialized.subarray(0, blob.salt.length);
      const noncePart = serialized.subarray(
        blob.salt.length,
        blob.salt.length + blob.nonce.length,
      );
      const ctPart = serialized.subarray(blob.salt.length + blob.nonce.length);

      expect(saltPart).toEqual(blob.salt);
      expect(noncePart).toEqual(blob.nonce);
      expect(ctPart).toEqual(blob.ciphertext);
    }, 30_000);

    it("throws InvalidInputError for truncated serialized blob", () => {
      const truncated = new Uint8Array(10);
      expect(() => deserializeEscrowBlob(truncated)).toThrow(InvalidInputError);
    });
  });

  describe("property-based", () => {
    it("roundtrip recovers arbitrary data with arbitrary passphrase", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.uint8Array({ minLength: 8, maxLength: 32 }),
          (data, passphrase) => {
            const blob = encryptWithPassphrase(data, passphrase);
            const recovered = decryptWithPassphrase(blob, passphrase);
            expect(recovered).toEqual(data);
          },
        ),
        { numRuns: 3 }, // Heavy Argon2id, keep run count low
      );
    }, 120_000);
  });
});

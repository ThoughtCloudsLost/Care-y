import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_HEAVY } from "./fc-config.js";
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

    // code is part of the @care-y/crypto public API; server tRPC error mapping depends on specific string values
    it("empty passphrase error has correct code", () => {
      const data = sodium.randombytes_buf(32);
      try {
        encryptWithPassphrase(data, new Uint8Array(0));
        expect.fail("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidInputError);
        expect((e as InvalidInputError).code).toBe("INVALID_INPUT");
      }
    });

    it("wrong passphrase error has correct code", () => {
      const data = sodium.randombytes_buf(32);
      const passphrase = new TextEncoder().encode("correct");
      const wrong = new TextEncoder().encode("wrong");

      const blob = encryptWithPassphrase(data, passphrase);
      try {
        decryptWithPassphrase(blob, wrong);
        expect.fail("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(DecryptionError);
        expect((e as DecryptionError).code).toBe("DECRYPTION_FAILED");
      }
    }, 60_000);

    it("truncated blob error has correct code", () => {
      const truncated = new Uint8Array(10);
      truncated[0] = 0x01; // valid version, but too short
      try {
        deserializeEscrowBlob(truncated);
        expect.fail("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidInputError);
        expect((e as InvalidInputError).code).toBe("INVALID_INPUT");
      }
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

    it("serialized format is version || salt || nonce || ciphertext", () => {
      const data = sodium.randombytes_buf(32);
      const passphrase = new TextEncoder().encode("format-test");

      const blob = encryptWithPassphrase(data, passphrase);
      const serialized = serializeEscrowBlob(blob);

      const expectedLen =
        1 + blob.salt.length + blob.nonce.length + blob.ciphertext.length;
      expect(serialized.length).toBe(expectedLen);

      // Verify byte layout
      expect(serialized[0]).toBe(0x01); // version byte
      const saltPart = serialized.subarray(1, 1 + blob.salt.length);
      const noncePart = serialized.subarray(
        1 + blob.salt.length,
        1 + blob.salt.length + blob.nonce.length,
      );
      const ctPart = serialized.subarray(
        1 + blob.salt.length + blob.nonce.length,
      );

      expect(saltPart).toEqual(blob.salt);
      expect(noncePart).toEqual(blob.nonce);
      expect(ctPart).toEqual(blob.ciphertext);
    }, 30_000);

    it("throws InvalidInputError for truncated serialized blob", () => {
      // Needs version byte + enough data. 10 bytes with valid version is too short.
      const truncated = new Uint8Array(10);
      truncated[0] = 0x01; // valid version
      expect(() => deserializeEscrowBlob(truncated)).toThrow(InvalidInputError);
    });

    it("throws InvalidInputError for unknown version", () => {
      const badVersion = new Uint8Array(100);
      badVersion[0] = 0xff;
      expect(() => deserializeEscrowBlob(badVersion)).toThrow(
        InvalidInputError,
      );
      expect(() => deserializeEscrowBlob(badVersion)).toThrow(
        /Unknown escrow version/,
      );
    });

    it("throws InvalidInputError for empty blob", () => {
      expect(() => deserializeEscrowBlob(new Uint8Array(0))).toThrow(
        InvalidInputError,
      );
    });

    it("rejects version 0x00 (no valid escrow format uses version 0)", () => {
      const zeroVersion = new Uint8Array(100);
      zeroVersion[0] = 0x00;
      expect(() => deserializeEscrowBlob(zeroVersion)).toThrow(
        InvalidInputError,
      );
      expect(() => deserializeEscrowBlob(zeroVersion)).toThrow(
        /Unknown escrow version: 0/,
      );
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
        { numRuns: FC_HEAVY },
      );
    }, 120_000);

    it("encrypt -> serialize -> deserialize -> decrypt roundtrip", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.uint8Array({ minLength: 8, maxLength: 32 }),
          (data, passphrase) => {
            const blob = encryptWithPassphrase(data, passphrase);
            const serialized = serializeEscrowBlob(blob);
            const deserialized = deserializeEscrowBlob(serialized);
            const recovered = decryptWithPassphrase(deserialized, passphrase);
            expect(recovered).toEqual(data);
          },
        ),
        { numRuns: FC_HEAVY },
      );
    }, 120_000);
  });
});

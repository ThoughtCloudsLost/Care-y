import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import { eciesEncrypt, eciesDecrypt } from "./ecies.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import {
  DecryptionError,
  InvalidKeyError,
  InvalidInputError,
} from "./errors.js";
import type { Scalar, RistrettoPoint, Nonce } from "./types.js";

/**
 * Test helper: generate a ristretto255 keypair (private scalar + public point).
 */
function generateKeypair(sodium: SodiumBackend): {
  priv: Scalar;
  pub: RistrettoPoint;
} {
  const priv = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
  const pub = sodium.crypto_scalarmult_ristretto255_base(
    priv,
  ) as RistrettoPoint;
  return { priv, pub };
}

describe("ECIES per-volunteer wrapping", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("eciesEncrypt -> eciesDecrypt roundtrip", () => {
    it("recovers original plaintext", () => {
      const { priv, pub } = generateKeypair(sodium);
      const plaintext = new TextEncoder().encode("ticket-key-material-32b");

      const encrypted = eciesEncrypt(plaintext, pub);
      const decrypted = eciesDecrypt(
        encrypted.ephemeralPoint,
        encrypted.nonce,
        encrypted.ciphertext,
        priv,
      );

      expect(decrypted).toEqual(plaintext);
    });

    it("works with empty plaintext", () => {
      const { priv, pub } = generateKeypair(sodium);
      const plaintext = new Uint8Array(0);

      const encrypted = eciesEncrypt(plaintext, pub);
      const decrypted = eciesDecrypt(
        encrypted.ephemeralPoint,
        encrypted.nonce,
        encrypted.ciphertext,
        priv,
      );

      expect(decrypted).toEqual(plaintext);
    });

    it("works with exactly 32-byte ticket key", () => {
      const { priv, pub } = generateKeypair(sodium);
      const plaintext = sodium.randombytes_buf(32);

      const encrypted = eciesEncrypt(plaintext, pub);
      const decrypted = eciesDecrypt(
        encrypted.ephemeralPoint,
        encrypted.nonce,
        encrypted.ciphertext,
        priv,
      );

      expect(decrypted).toEqual(plaintext);
    });
  });

  describe("decryption failures", () => {
    it("throws DecryptionError with wrong private key", () => {
      const { pub } = generateKeypair(sodium);
      const wrongPriv =
        sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const plaintext = new TextEncoder().encode("secret");

      const encrypted = eciesEncrypt(plaintext, pub);
      expect(() =>
        eciesDecrypt(
          encrypted.ephemeralPoint,
          encrypted.nonce,
          encrypted.ciphertext,
          wrongPriv,
        ),
      ).toThrow(DecryptionError);
    });

    it("throws DecryptionError with tampered ciphertext (flipped byte)", () => {
      const { priv, pub } = generateKeypair(sodium);
      const plaintext = new TextEncoder().encode("tamper-test");

      const encrypted = eciesEncrypt(plaintext, pub);
      const tampered = new Uint8Array(encrypted.ciphertext);
      // Ciphertext from secretbox is always at least MACBYTES (16), so index 0 exists
      tampered[0] = (tampered[0] ?? 0) ^ 0xff;

      expect(() =>
        eciesDecrypt(encrypted.ephemeralPoint, encrypted.nonce, tampered, priv),
      ).toThrow(DecryptionError);
    });

    it("throws DecryptionError with truncated ciphertext", () => {
      const { priv, pub } = generateKeypair(sodium);
      const plaintext = new TextEncoder().encode("truncate-test");

      const encrypted = eciesEncrypt(plaintext, pub);
      const truncated = encrypted.ciphertext.slice(0, 4);

      expect(() =>
        eciesDecrypt(
          encrypted.ephemeralPoint,
          encrypted.nonce,
          truncated,
          priv,
        ),
      ).toThrow(DecryptionError);
    });

    it("throws DecryptionError with wrong ephemeral point", () => {
      const { priv, pub } = generateKeypair(sodium);
      const plaintext = new TextEncoder().encode("wrong-ephemeral");

      const encrypted = eciesEncrypt(plaintext, pub);

      // Generate a different ephemeral point
      const wrongEphemeral = sodium.crypto_scalarmult_ristretto255_base(
        sodium.crypto_core_ristretto255_scalar_random(),
      ) as RistrettoPoint;

      expect(() =>
        eciesDecrypt(
          wrongEphemeral,
          encrypted.nonce,
          encrypted.ciphertext,
          priv,
        ),
      ).toThrow(DecryptionError);
    });
  });

  describe("input validation", () => {
    it("throws InvalidKeyError for wrong-length recipient public key", () => {
      const plaintext = new TextEncoder().encode("test");
      const shortKey = new Uint8Array(16) as RistrettoPoint;

      expect(() => eciesEncrypt(plaintext, shortKey)).toThrow(InvalidKeyError);
    });

    it("throws InvalidKeyError for 64-byte recipient public key", () => {
      const plaintext = new TextEncoder().encode("test");
      const longKey = new Uint8Array(64) as RistrettoPoint;

      expect(() => eciesEncrypt(plaintext, longKey)).toThrow(InvalidKeyError);
    });

    it("throws InvalidKeyError for zero-length recipient public key", () => {
      const plaintext = new TextEncoder().encode("test");
      const emptyKey = new Uint8Array(0) as RistrettoPoint;

      expect(() => eciesEncrypt(plaintext, emptyKey)).toThrow(InvalidKeyError);
    });

    it("throws InvalidKeyError for wrong-length ephemeral point on decrypt", () => {
      const { priv, pub } = generateKeypair(sodium);
      const encrypted = eciesEncrypt(new Uint8Array(32), pub);
      const shortPoint = new Uint8Array(16) as RistrettoPoint;

      expect(() =>
        eciesDecrypt(shortPoint, encrypted.nonce, encrypted.ciphertext, priv),
      ).toThrow(InvalidKeyError);
    });

    it("throws InvalidInputError for wrong-length nonce on decrypt", () => {
      const { priv, pub } = generateKeypair(sodium);
      const encrypted = eciesEncrypt(new Uint8Array(32), pub);
      const shortNonce = new Uint8Array(12) as Nonce;

      expect(() =>
        eciesDecrypt(
          encrypted.ephemeralPoint,
          shortNonce,
          encrypted.ciphertext,
          priv,
        ),
      ).toThrow(InvalidInputError);
    });
  });

  describe("ephemeral uniqueness", () => {
    it("produces different ephemeral points for same plaintext and key", () => {
      const { pub } = generateKeypair(sodium);
      const plaintext = new TextEncoder().encode("same-plaintext");

      const a = eciesEncrypt(plaintext, pub);
      const b = eciesEncrypt(plaintext, pub);

      expect(a.ephemeralPoint).not.toEqual(b.ephemeralPoint);
    });

    it("produces different ciphertext for same plaintext and key", () => {
      const { pub } = generateKeypair(sodium);
      const plaintext = new TextEncoder().encode("same-plaintext");

      const a = eciesEncrypt(plaintext, pub);
      const b = eciesEncrypt(plaintext, pub);

      expect(a.ciphertext).not.toEqual(b.ciphertext);
    });
  });

  // Output shape tests guard the wire format that gets persisted or
  // transmitted. The sizes (32-byte point, 24-byte nonce, plaintext+MAC
  // ciphertext) are cryptographic contracts: changing them breaks
  // interoperability with existing wrapped keys stored in the DB.
  describe("output shape", () => {
    it("ephemeralPoint is 32 bytes", () => {
      const { pub } = generateKeypair(sodium);
      const encrypted = eciesEncrypt(new Uint8Array(32), pub);
      expect(encrypted.ephemeralPoint.length).toBe(
        sodium.crypto_core_ristretto255_BYTES,
      );
    });

    it("nonce is 24 bytes", () => {
      const { pub } = generateKeypair(sodium);
      const encrypted = eciesEncrypt(new Uint8Array(32), pub);
      expect(encrypted.nonce.length).toBe(sodium.crypto_secretbox_NONCEBYTES);
    });

    it("ciphertext is plaintext + MACBYTES", () => {
      const { pub } = generateKeypair(sodium);
      const plaintext = new Uint8Array(32);
      const encrypted = eciesEncrypt(plaintext, pub);
      expect(encrypted.ciphertext.length).toBe(
        plaintext.length + sodium.crypto_secretbox_MACBYTES,
      );
    });
  });

  describe("property-based", () => {
    it("roundtrip recovers arbitrary plaintext", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 256 }),
          (plaintext) => {
            const { priv, pub } = generateKeypair(sodium);
            const encrypted = eciesEncrypt(plaintext, pub);
            const decrypted = eciesDecrypt(
              encrypted.ephemeralPoint,
              encrypted.nonce,
              encrypted.ciphertext,
              priv,
            );
            expect(decrypted).toEqual(plaintext);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("unique ephemeral point per wrap for same key", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          (plaintext) => {
            const { pub } = generateKeypair(sodium);
            const a = eciesEncrypt(plaintext, pub);
            const b = eciesEncrypt(plaintext, pub);
            expect(a.ephemeralPoint).not.toEqual(b.ephemeralPoint);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});

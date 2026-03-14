import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import { wrapKey, unwrapKey } from "./keywrap.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError, InvalidKeyError } from "./errors.js";
import type { Scalar, RistrettoPoint } from "./types.js";

/**
 * Test helper: generate a ristretto255 keypair.
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

describe("key wrapping", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("wrapKey -> unwrapKey roundtrip", () => {
    it("recovers original key material", () => {
      const { priv, pub } = generateKeypair(sodium);
      const keyMaterial = sodium.randombytes_buf(32);

      const wrapped = wrapKey(keyMaterial, pub);
      const unwrapped = unwrapKey(
        wrapped.ephemeralPoint,
        wrapped.nonce,
        wrapped.ciphertext,
        priv,
      );

      expect(unwrapped).toEqual(keyMaterial);
    });

    it("works with arbitrary-length key material", () => {
      const { priv, pub } = generateKeypair(sodium);
      const keyMaterial = sodium.randombytes_buf(64);

      const wrapped = wrapKey(keyMaterial, pub);
      const unwrapped = unwrapKey(
        wrapped.ephemeralPoint,
        wrapped.nonce,
        wrapped.ciphertext,
        priv,
      );

      expect(unwrapped).toEqual(keyMaterial);
    });
  });

  describe("unwrap failures", () => {
    it("throws DecryptionError with wrong private key", () => {
      const { pub } = generateKeypair(sodium);
      const wrongPriv =
        sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const keyMaterial = sodium.randombytes_buf(32);

      const wrapped = wrapKey(keyMaterial, pub);
      expect(() =>
        unwrapKey(
          wrapped.ephemeralPoint,
          wrapped.nonce,
          wrapped.ciphertext,
          wrongPriv,
        ),
      ).toThrow(DecryptionError);
    });
  });

  describe("input validation", () => {
    it("throws InvalidKeyError for wrong-length recipient public key", () => {
      const shortKey = new Uint8Array(16) as RistrettoPoint;
      const keyMaterial = sodium.randombytes_buf(32);

      expect(() => wrapKey(keyMaterial, shortKey)).toThrow(InvalidKeyError);
    });
  });

  describe("ephemeral uniqueness", () => {
    it("wrapping same key for same recipient produces different ciphertext", () => {
      const { pub } = generateKeypair(sodium);
      const keyMaterial = sodium.randombytes_buf(32);

      const a = wrapKey(keyMaterial, pub);
      const b = wrapKey(keyMaterial, pub);

      expect(a.ephemeralPoint).not.toEqual(b.ephemeralPoint);
      expect(a.ciphertext).not.toEqual(b.ciphertext);
    });
  });

  describe("property-based", () => {
    it("roundtrip recovers arbitrary key material", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 256 }),
          (keyMaterial) => {
            const { priv, pub } = generateKeypair(sodium);
            const wrapped = wrapKey(keyMaterial, pub);
            const unwrapped = unwrapKey(
              wrapped.ephemeralPoint,
              wrapped.nonce,
              wrapped.ciphertext,
              priv,
            );
            expect(unwrapped).toEqual(keyMaterial);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});

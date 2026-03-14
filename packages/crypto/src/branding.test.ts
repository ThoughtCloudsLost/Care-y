import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import {
  deriveClientBrandingKey,
  encryptClientBranding,
  decryptClientBranding,
} from "./branding.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError, InvalidKeyError } from "./errors.js";
import type { RistrettoPoint } from "./types.js";

/**
 * Test helper: generate a ristretto255 public key (for org).
 */
function generateOrgPublicKey(sodium: SodiumBackend): RistrettoPoint {
  const scalar = sodium.crypto_core_ristretto255_scalar_random();
  return sodium.crypto_scalarmult_ristretto255_base(scalar) as RistrettoPoint;
}

describe("branding encryption", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("deriveClientBrandingKey", () => {
    it("returns a 32-byte key", () => {
      const orgPub = generateOrgPublicKey(sodium);
      const key = deriveClientBrandingKey(orgPub);
      expect(key.length).toBe(32);
    });

    it("is deterministic for same org public key", () => {
      const orgPub = generateOrgPublicKey(sodium);
      const a = deriveClientBrandingKey(orgPub);
      const b = deriveClientBrandingKey(orgPub);
      expect(a).toEqual(b);
    });

    it("produces different keys for different org public keys", () => {
      const orgPub1 = generateOrgPublicKey(sodium);
      const orgPub2 = generateOrgPublicKey(sodium);
      const key1 = deriveClientBrandingKey(orgPub1);
      const key2 = deriveClientBrandingKey(orgPub2);
      expect(key1).not.toEqual(key2);
    });

    it("throws InvalidKeyError for wrong-length org public key", () => {
      const shortKey = new Uint8Array(16) as RistrettoPoint;
      expect(() => deriveClientBrandingKey(shortKey)).toThrow(InvalidKeyError);
    });

    it("throws InvalidKeyError for 64-byte org public key", () => {
      const longKey = new Uint8Array(64) as RistrettoPoint;
      expect(() => deriveClientBrandingKey(longKey)).toThrow(InvalidKeyError);
    });
  });

  describe("encryptClientBranding -> decryptClientBranding roundtrip", () => {
    it("recovers original payload", () => {
      const orgPub = generateOrgPublicKey(sodium);
      const payload = new TextEncoder().encode(
        '{"name":"Test Org","color":"#ff0000"}',
      );

      const encrypted = encryptClientBranding(payload, orgPub);
      const decrypted = decryptClientBranding(encrypted, orgPub);

      expect(decrypted).toEqual(payload);
    });

    it("works with empty payload", () => {
      const orgPub = generateOrgPublicKey(sodium);
      const payload = new Uint8Array(0);

      const encrypted = encryptClientBranding(payload, orgPub);
      const decrypted = decryptClientBranding(encrypted, orgPub);

      expect(decrypted).toEqual(payload);
    });

    it("produces different ciphertext on successive encryptions", () => {
      const orgPub = generateOrgPublicKey(sodium);
      const payload = new TextEncoder().encode("same payload");

      const a = encryptClientBranding(payload, orgPub);
      const b = encryptClientBranding(payload, orgPub);

      expect(a).not.toEqual(b);
    });
  });

  describe("decryption failures", () => {
    it("throws DecryptionError with wrong org public key", () => {
      const orgPub1 = generateOrgPublicKey(sodium);
      const orgPub2 = generateOrgPublicKey(sodium);
      const payload = new TextEncoder().encode("secret branding");

      const encrypted = encryptClientBranding(payload, orgPub1);
      expect(() => decryptClientBranding(encrypted, orgPub2)).toThrow(
        DecryptionError,
      );
    });
  });

  describe("property-based", () => {
    it("roundtrip recovers arbitrary payload", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 1024 }),
          (payload) => {
            const orgPub = generateOrgPublicKey(sodium);
            const encrypted = encryptClientBranding(payload, orgPub);
            const decrypted = decryptClientBranding(encrypted, orgPub);
            expect(decrypted).toEqual(payload);
          },
        ),
        { numRuns: 20 },
      );
    });
  });
});

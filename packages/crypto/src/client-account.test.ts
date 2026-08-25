import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import { deriveClientAccountKeys } from "./client-account.js";
import { hashChannelAuth } from "./portal.js";
import { eciesEncrypt, eciesDecrypt } from "./ecies.js";
import { encodeLabel } from "./bytes.js";
import { hkdf } from "./hkdf.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { InvalidKeyError } from "./errors.js";
import { HKDF_LABELS } from "./types.js";

describe("client-account key derivation", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  /** Generate a random 64-byte buffer simulating an OPRF finalize output. */
  function randomOprfOutput(): Uint8Array {
    return sodium.randombytes_buf(64);
  }

  describe("deriveClientAccountKeys", () => {
    it("returns a 32-byte scalar, 32-byte point, and 32-byte auth token", () => {
      const oprfOutput = randomOprfOutput();
      const keys = deriveClientAccountKeys(oprfOutput);
      expect(keys.keypair.clientPrivate.length).toBe(32);
      expect(keys.keypair.clientPublic.length).toBe(32);
      expect(keys.authToken.length).toBe(32);
    });

    it("is deterministic for the same oprfOutput", () => {
      const oprfOutput = randomOprfOutput();
      const keys1 = deriveClientAccountKeys(oprfOutput);
      const keys2 = deriveClientAccountKeys(oprfOutput);
      expect(keys1.keypair.clientPrivate).toEqual(keys2.keypair.clientPrivate);
      expect(keys1.keypair.clientPublic).toEqual(keys2.keypair.clientPublic);
      expect(keys1.authToken).toEqual(keys2.authToken);
    });

    it("different oprfOutputs produce different keys", () => {
      const a = deriveClientAccountKeys(randomOprfOutput());
      const b = deriveClientAccountKeys(randomOprfOutput());
      expect(a.keypair.clientPrivate).not.toEqual(b.keypair.clientPrivate);
      expect(a.keypair.clientPublic).not.toEqual(b.keypair.clientPublic);
      expect(a.authToken).not.toEqual(b.authToken);
    });
  });

  describe("label independence", () => {
    it("authToken never equals any 32-byte slice of the private-key expansion", () => {
      const oprfOutput = randomOprfOutput();
      const keys = deriveClientAccountKeys(oprfOutput);

      // Reconstruct the 64-byte expansion used for the scalar derivation
      const expanded = hkdf(
        oprfOutput,
        encodeLabel(HKDF_LABELS.CLIENT_ACCOUNT_ECIES),
        64,
      );

      // Check every aligned 32-byte window
      for (let offset = 0; offset <= 32; offset++) {
        const slice = expanded.subarray(offset, offset + 32);
        expect(keys.authToken).not.toEqual(slice);
      }
    });

    it("client labels differ from volunteer labels", () => {
      expect(HKDF_LABELS.CLIENT_ACCOUNT_ECIES).not.toBe(
        HKDF_LABELS.ECIES_PRIVATE,
      );
      expect(HKDF_LABELS.CLIENT_ACCOUNT_AUTH).not.toBe(HKDF_LABELS.MASTER_KEY);
      expect(HKDF_LABELS.CLIENT_ACCOUNT_ECIES).not.toBe(
        HKDF_LABELS.PORTAL_ECIES,
      );
    });
  });

  describe("ECIES roundtrip", () => {
    it("keypair roundtrips through eciesEncrypt/eciesDecrypt", () => {
      const oprfOutput = randomOprfOutput();
      const keys = deriveClientAccountKeys(oprfOutput);
      const plaintext = new TextEncoder().encode("account message content");

      const encrypted = eciesEncrypt(plaintext, keys.keypair.clientPublic);
      const decrypted = eciesDecrypt(
        encrypted.ephemeralPoint,
        encrypted.nonce,
        encrypted.ciphertext,
        keys.keypair.clientPrivate,
      );

      expect(decrypted).toEqual(plaintext);
    });
  });

  describe("wrong-length oprfOutput", () => {
    it("throws InvalidKeyError for 32-byte input", () => {
      expect(() => deriveClientAccountKeys(new Uint8Array(32))).toThrow(
        InvalidKeyError,
      );
    });

    it("throws InvalidKeyError for 63-byte input", () => {
      expect(() => deriveClientAccountKeys(new Uint8Array(63))).toThrow(
        InvalidKeyError,
      );
    });

    it("throws InvalidKeyError for 65-byte input", () => {
      expect(() => deriveClientAccountKeys(new Uint8Array(65))).toThrow(
        InvalidKeyError,
      );
    });

    it("throws InvalidKeyError for empty input", () => {
      expect(() => deriveClientAccountKeys(new Uint8Array(0))).toThrow(
        InvalidKeyError,
      );
    });
  });

  describe("scalar canonicality", () => {
    it("derived scalar is a canonical reduced ristretto255 scalar", () => {
      const oprfOutput = randomOprfOutput();
      const keys = deriveClientAccountKeys(oprfOutput);

      // A canonical scalar, when reduced again, equals itself.
      const padded = new Uint8Array(64);
      padded.set(keys.keypair.clientPrivate);
      const reReduced = sodium.crypto_core_ristretto255_scalar_reduce(padded);
      expect(keys.keypair.clientPrivate).toEqual(reReduced);
    });

    it("derived scalar is non-zero", () => {
      const oprfOutput = randomOprfOutput();
      const keys = deriveClientAccountKeys(oprfOutput);
      expect(keys.keypair.clientPrivate.every((b) => b === 0)).toBe(false);
    });

    it("clientPublic equals scalarmult_base(clientPrivate)", () => {
      const oprfOutput = randomOprfOutput();
      const keys = deriveClientAccountKeys(oprfOutput);
      const recomputed = sodium.crypto_scalarmult_ristretto255_base(
        keys.keypair.clientPrivate,
      );
      expect(keys.keypair.clientPublic).toEqual(recomputed);
    });
  });

  describe("hashChannelAuth stability", () => {
    it("hashChannelAuth(authToken) is 32 bytes and deterministic", () => {
      const oprfOutput = randomOprfOutput();
      const keys = deriveClientAccountKeys(oprfOutput);

      const hash1 = hashChannelAuth(keys.authToken);
      const hash2 = hashChannelAuth(keys.authToken);
      expect(hash1.length).toBe(32);
      expect(hash1).toEqual(hash2);
    });

    it("hashChannelAuth(authToken) matches independent crypto_generichash", () => {
      const oprfOutput = randomOprfOutput();
      const keys = deriveClientAccountKeys(oprfOutput);

      const hash = hashChannelAuth(keys.authToken);
      const expected = sodium.crypto_generichash(32, keys.authToken);
      expect(hash).toEqual(expected);
    });
  });

  describe("HKDF_LABELS constants", () => {
    it("client account labels have the expected values", () => {
      // Contract: every stored client-account-derived key depends on these
      // literals; changing one invalidates all previously derived keys.
      expect(HKDF_LABELS.CLIENT_ACCOUNT_ECIES).toBe("care-y-client-ecies-v1");
      expect(HKDF_LABELS.CLIENT_ACCOUNT_AUTH).toBe("care-y-client-auth-v1");
    });
  });

  describe("property-based", () => {
    it("for random 64-byte inputs, keypairs encrypt/decrypt", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          fc.uint8Array({ minLength: 1, maxLength: 256 }),
          (oprfOutput, plaintext) => {
            const keys = deriveClientAccountKeys(oprfOutput);
            const encrypted = eciesEncrypt(
              plaintext,
              keys.keypair.clientPublic,
            );
            const decrypted = eciesDecrypt(
              encrypted.ephemeralPoint,
              encrypted.nonce,
              encrypted.ciphertext,
              keys.keypair.clientPrivate,
            );
            expect(decrypted).toEqual(plaintext);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("two distinct inputs never collide on public key or auth token", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          (input1, input2) => {
            // Skip identical inputs
            if (input1.every((b, i) => b === input2[i])) return;

            const keys1 = deriveClientAccountKeys(input1);
            const keys2 = deriveClientAccountKeys(input2);
            expect(keys1.keypair.clientPublic).not.toEqual(
              keys2.keypair.clientPublic,
            );
            expect(keys1.authToken).not.toEqual(keys2.authToken);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("scalar is canonically reduced for all random inputs", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          (oprfOutput) => {
            const keys = deriveClientAccountKeys(oprfOutput);
            const padded = new Uint8Array(64);
            padded.set(keys.keypair.clientPrivate);
            const reReduced =
              sodium.crypto_core_ristretto255_scalar_reduce(padded);
            expect(keys.keypair.clientPrivate).toEqual(reReduced);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});

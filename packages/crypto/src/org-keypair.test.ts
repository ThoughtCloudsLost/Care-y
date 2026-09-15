import { describe, it, expect, beforeAll } from "vitest";
import {
  generateOrgKeypair,
  sealForOrgKey,
  sealPrevGeneration,
  openPrevGeneration,
} from "./org-keypair.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { CryptoError, DecryptionError, InvalidKeyError } from "./errors.js";

describe("org keypair", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("generateOrgKeypair", () => {
    it("returns 32-byte public and secret keys", () => {
      const { publicKey, secretKey } = generateOrgKeypair();
      expect(publicKey).toHaveLength(sodium.crypto_box_PUBLICKEYBYTES);
      expect(secretKey).toHaveLength(sodium.crypto_box_SECRETKEYBYTES);
    });

    it("produces different keypairs on each call", () => {
      const a = generateOrgKeypair();
      const b = generateOrgKeypair();
      expect(a.publicKey).not.toEqual(b.publicKey);
      expect(a.secretKey).not.toEqual(b.secretKey);
    });
  });

  describe("sealForOrgKey", () => {
    it("produces ciphertext of correct length", () => {
      const { publicKey } = generateOrgKeypair();
      const plaintext = new TextEncoder().encode("test article title");
      const ciphertext = sealForOrgKey(plaintext, publicKey);
      expect(ciphertext).toHaveLength(
        plaintext.length + sodium.crypto_box_SEALBYTES,
      );
    });

    it("roundtrips with crypto_box_seal_open", () => {
      const { publicKey, secretKey } = generateOrgKeypair();
      const plaintext = new TextEncoder().encode("KB article body content");
      const ciphertext = sealForOrgKey(plaintext, publicKey);
      const decrypted = sodium.crypto_box_seal_open(
        ciphertext,
        publicKey,
        secretKey,
      );
      expect(decrypted).toEqual(plaintext);
    });

    it("produces different ciphertext for same plaintext (randomized)", () => {
      const { publicKey } = generateOrgKeypair();
      const plaintext = new TextEncoder().encode("same content");
      const a = sealForOrgKey(plaintext, publicKey);
      const b = sealForOrgKey(plaintext, publicKey);
      expect(a).not.toEqual(b);
    });

    it("throws CryptoError for wrong-length public key", () => {
      const badKey = new Uint8Array(16);
      const plaintext = new TextEncoder().encode("test");
      expect(() => sealForOrgKey(plaintext, badKey)).toThrow(CryptoError);
    });
  });

  describe("generation chain (sealPrevGeneration / openPrevGeneration)", () => {
    it("round-trips a sealed previous-generation secret", () => {
      const gen1 = generateOrgKeypair();
      const gen2 = generateOrgKeypair();

      const sealed = sealPrevGeneration(gen1.secretKey, gen2.secretKey);
      const recovered = openPrevGeneration(
        sealed.ciphertext,
        sealed.nonce,
        gen2.secretKey,
      );

      expect(recovered).toEqual(gen1.secretKey);
    });

    it("throws DecryptionError when opened with an unrelated key", () => {
      const gen1 = generateOrgKeypair();
      const gen2 = generateOrgKeypair();
      const gen3 = generateOrgKeypair();

      const sealed = sealPrevGeneration(gen1.secretKey, gen2.secretKey);

      expect(() =>
        openPrevGeneration(sealed.ciphertext, sealed.nonce, gen3.secretKey),
      ).toThrow(DecryptionError);
    });

    it("enforces old-under-new direction: old secret cannot open the chain entry", () => {
      const gen1 = generateOrgKeypair();
      const gen2 = generateOrgKeypair();

      // gen1 sealed under gen2 (correct direction)
      const sealed = sealPrevGeneration(gen1.secretKey, gen2.secretKey);

      // Attempting to open with gen1 (the old secret) must fail
      expect(() =>
        openPrevGeneration(sealed.ciphertext, sealed.nonce, gen1.secretKey),
      ).toThrow(DecryptionError);
    });

    it("produces different nonces and ciphertexts for identical inputs", () => {
      const gen1 = generateOrgKeypair();
      const gen2 = generateOrgKeypair();

      const a = sealPrevGeneration(gen1.secretKey, gen2.secretKey);
      const b = sealPrevGeneration(gen1.secretKey, gen2.secretKey);

      expect(a.nonce).not.toEqual(b.nonce);
      expect(a.ciphertext).not.toEqual(b.ciphertext);
    });

    it("throws InvalidKeyError for a 31-byte prevSecret", () => {
      const gen2 = generateOrgKeypair();
      const shortKey = new Uint8Array(31);

      expect(() => sealPrevGeneration(shortKey, gen2.secretKey)).toThrow(
        InvalidKeyError,
      );
    });

    it("throws InvalidKeyError for a 31-byte nextSecret", () => {
      const gen1 = generateOrgKeypair();
      const shortKey = new Uint8Array(31);

      expect(() => sealPrevGeneration(gen1.secretKey, shortKey)).toThrow(
        InvalidKeyError,
      );
    });
  });
});

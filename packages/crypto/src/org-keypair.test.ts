import { describe, it, expect, beforeAll } from "vitest";
import { generateOrgKeypair, sealForOrgKey } from "./org-keypair.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { CryptoError } from "./errors.js";

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
});

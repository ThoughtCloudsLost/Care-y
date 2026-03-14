import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { encryptBlob, decryptBlob } from "./blob.js";
import { generateContentKey, decryptContent } from "./content.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError } from "./errors.js";
import type { Ciphertext } from "./types.js";

describe("blob encryption", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("encryptBlob -> decryptBlob roundtrip", () => {
    it("recovers original binary data", () => {
      const key = generateContentKey();
      const data = sodium.randombytes_buf(256);

      const encrypted = encryptBlob(data, key);
      const decrypted = decryptBlob(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it("works with empty data", () => {
      const key = generateContentKey();
      const data = new Uint8Array(0);

      const encrypted = encryptBlob(data, key);
      const decrypted = decryptBlob(encrypted, key);

      expect(decrypted).toEqual(data);
    });
  });

  describe("interop with content encryption", () => {
    it("blob encrypted data is decryptable via decryptContent", () => {
      const key = generateContentKey();
      const data = new TextEncoder().encode("cross-module-test");

      const encrypted = encryptBlob(data, key);
      const decrypted = decryptContent(encrypted, key);

      expect(decrypted).toEqual(data);
    });
  });

  describe("decryption failures", () => {
    it("throws DecryptionError with wrong key", () => {
      const key = generateContentKey();
      const wrongKey = generateContentKey();
      const data = sodium.randombytes_buf(64);

      const encrypted = encryptBlob(data, key);
      expect(() => decryptBlob(encrypted, wrongKey)).toThrow(DecryptionError);
    });

    it("throws DecryptionError with truncated blob", () => {
      const key = generateContentKey();
      const truncated = new Uint8Array(10) as Ciphertext;

      expect(() => decryptBlob(truncated, key)).toThrow(DecryptionError);
    });
  });

  describe("property-based", () => {
    it("roundtrip recovers arbitrary binary data", () => {
      const key = generateContentKey();
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 5_000 }),
          (data) => {
            const encrypted = encryptBlob(data, key);
            const decrypted = decryptBlob(encrypted, key);
            expect(decrypted).toEqual(data);
          },
        ),
        { numRuns: 20 },
      );
    });
  });
});

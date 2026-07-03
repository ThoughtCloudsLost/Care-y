import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import {
  generateContentKey,
  encryptContent,
  decryptContent,
  buildContentAad,
  followupSlot,
  blobSlot,
  filenameSlot,
  cursorSlot,
  fieldSlot,
} from "./content.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError, InvalidKeyError } from "./errors.js";
import type { SymmetricKey, Ciphertext } from "./types.js";

const TICKET_ID = "11111111-2222-4333-8444-555555555555";
const AAD = buildContentAad(TICKET_ID, "title");

describe("content encryption", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("generateContentKey", () => {
    it("returns a 32-byte key", () => {
      const key = generateContentKey();
      expect(key.length).toBe(
        sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
      );
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

  describe("buildContentAad", () => {
    it("encodes ticketId and slot as UTF-8 with a colon separator", () => {
      const aad = buildContentAad("ticket-1", "followup:fu-9");
      expect(new TextDecoder().decode(aad)).toBe("ticket-1:followup:fu-9");
    });

    it("produces different bytes for different slots", () => {
      expect(buildContentAad("t", "title")).not.toEqual(
        buildContentAad("t", "description"),
      );
    });

    it("slot helpers produce the canonical identifiers", () => {
      expect(followupSlot("fu-1")).toBe("followup:fu-1");
      expect(blobSlot("att-1")).toBe("blob:att-1");
      expect(filenameSlot("att-1")).toBe("filename:att-1");
      expect(cursorSlot("u-1")).toBe("cursor:u-1");
      expect(fieldSlot("summary")).toBe("field:summary");
    });
  });

  describe("encryptContent -> decryptContent roundtrip", () => {
    it("recovers original plaintext", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("ticket content here");

      const encrypted = encryptContent(plaintext, key, AAD);
      const decrypted = decryptContent(encrypted, key, AAD);

      expect(decrypted).toEqual(plaintext);
    });

    it("works with empty plaintext", () => {
      const key = generateContentKey();
      const plaintext = new Uint8Array(0);

      const encrypted = encryptContent(plaintext, key, AAD);
      const decrypted = decryptContent(encrypted, key, AAD);

      expect(decrypted).toEqual(plaintext);
    });

    it("works with large plaintext", () => {
      const key = generateContentKey();
      const plaintext = sodium.randombytes_buf(10_000);

      const encrypted = encryptContent(plaintext, key, AAD);
      const decrypted = decryptContent(encrypted, key, AAD);

      expect(decrypted).toEqual(plaintext);
    });
  });

  // Wire format tests guard the storage layout. The nonce||ciphertext
  // layout is a contract: the decryptor slices the first 24 bytes as the
  // nonce and hands the rest (plaintext + 16-byte tag) to the AEAD.
  describe("ciphertext format", () => {
    it("output is nonce + tag + plaintext length", () => {
      const key = generateContentKey();
      const plaintext = new Uint8Array(64);

      const encrypted = encryptContent(plaintext, key, AAD);
      const expectedLen =
        sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES +
        sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES +
        plaintext.length;
      expect(encrypted.length).toBe(expectedLen);
    });

    it("different encryptions of same plaintext produce different blobs", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("same content");

      const a = encryptContent(plaintext, key, AAD);
      const b = encryptContent(plaintext, key, AAD);

      expect(a).not.toEqual(b);
    });
  });

  describe("associated data binding", () => {
    it("fails when the slot differs (cross-slot relocation)", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("the ticket title");

      const encrypted = encryptContent(
        plaintext,
        key,
        buildContentAad(TICKET_ID, "title"),
      );

      expect(() =>
        decryptContent(
          encrypted,
          key,
          buildContentAad(TICKET_ID, "description"),
        ),
      ).toThrow(DecryptionError);
    });

    it("fails when the ticket id differs", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("cross-ticket move");

      const encrypted = encryptContent(
        plaintext,
        key,
        buildContentAad(TICKET_ID, "title"),
      );

      expect(() =>
        decryptContent(
          encrypted,
          key,
          buildContentAad("other-ticket", "title"),
        ),
      ).toThrow(DecryptionError);
    });

    it("fails when a follow-up ciphertext is moved to another follow-up slot", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("message for follow-up A");

      const encrypted = encryptContent(
        plaintext,
        key,
        buildContentAad(TICKET_ID, "followup:fu-a"),
      );

      expect(() =>
        decryptContent(
          encrypted,
          key,
          buildContentAad(TICKET_ID, "followup:fu-b"),
        ),
      ).toThrow(DecryptionError);
    });

    it("succeeds when the same AAD bytes are rebuilt independently", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("rebuilt aad");

      const encrypted = encryptContent(
        plaintext,
        key,
        buildContentAad(TICKET_ID, "blob:blob-key-1"),
      );
      const decrypted = decryptContent(
        encrypted,
        key,
        buildContentAad(TICKET_ID, "blob:blob-key-1"),
      );

      expect(decrypted).toEqual(plaintext);
    });
  });

  describe("decryption failures", () => {
    it("throws DecryptionError with wrong key", () => {
      const key = generateContentKey();
      const wrongKey = generateContentKey();
      const plaintext = new TextEncoder().encode("secret");

      const encrypted = encryptContent(plaintext, key, AAD);
      expect(() => decryptContent(encrypted, wrongKey, AAD)).toThrow(
        DecryptionError,
      );
    });

    it("throws DecryptionError with tampered ciphertext (flipped byte in ciphertext portion)", () => {
      const key = generateContentKey();
      const plaintext = new TextEncoder().encode("tamper-test");

      const encrypted = encryptContent(plaintext, key, AAD);
      const tampered = new Uint8Array(encrypted);
      // Flip a byte in the ciphertext portion (after the 24-byte nonce)
      const idx = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES + 1;
      tampered[idx] = (tampered[idx] ?? 0) ^ 0xff;

      expect(() => decryptContent(tampered as Ciphertext, key, AAD)).toThrow(
        DecryptionError,
      );
    });

    it("throws DecryptionError with truncated blob (shorter than nonce + tag)", () => {
      const key = generateContentKey();
      const truncated = new Uint8Array(10) as Ciphertext;

      expect(() => decryptContent(truncated, key, AAD)).toThrow(
        DecryptionError,
      );
    });
  });

  describe("boundary sizes", () => {
    it("works with single-byte plaintext", () => {
      const key = generateContentKey();
      const plaintext = new Uint8Array([0x42]);

      const encrypted = encryptContent(plaintext, key, AAD);
      const decrypted = decryptContent(encrypted, key, AAD);

      expect(decrypted).toEqual(plaintext);
    });

    it("rejects blob that is exactly nonce-length (no tag, no ciphertext)", () => {
      const key = generateContentKey();
      const tooShort = new Uint8Array(
        sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
      ) as Ciphertext;

      expect(() => decryptContent(tooShort, key, AAD)).toThrow(DecryptionError);
    });

    it("accepts blob that is exactly nonce + tag length (zero-length plaintext)", () => {
      const key = generateContentKey();
      const plaintext = new Uint8Array(0);
      const encrypted = encryptContent(plaintext, key, AAD);

      // Verify the blob is exactly nonce + tag bytes
      expect(encrypted.length).toBe(
        sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES +
          sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES,
      );

      const decrypted = decryptContent(encrypted, key, AAD);
      expect(decrypted).toEqual(plaintext);
    });
  });

  describe("input validation", () => {
    it("throws InvalidKeyError for wrong-length key on encrypt", () => {
      const shortKey = new Uint8Array(16) as SymmetricKey;
      const plaintext = new TextEncoder().encode("test");

      expect(() => encryptContent(plaintext, shortKey, AAD)).toThrow(
        InvalidKeyError,
      );
    });

    it("throws InvalidKeyError for wrong-length key on decrypt", () => {
      const key = generateContentKey();
      const shortKey = new Uint8Array(16) as SymmetricKey;
      const plaintext = new TextEncoder().encode("test");

      const encrypted = encryptContent(plaintext, key, AAD);
      expect(() => decryptContent(encrypted, shortKey, AAD)).toThrow(
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
            const encrypted = encryptContent(plaintext, key, AAD);
            const decrypted = decryptContent(encrypted, key, AAD);
            expect(decrypted).toEqual(plaintext);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("roundtrip holds for arbitrary ticket ids and slots", () => {
      const key = generateContentKey();
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 512 }),
          fc.string({ minLength: 1, maxLength: 64 }),
          fc.string({ minLength: 1, maxLength: 64 }),
          (plaintext, ticketId, slot) => {
            const aad = buildContentAad(ticketId, slot);
            const encrypted = encryptContent(plaintext, key, aad);
            expect(decryptContent(encrypted, key, aad)).toEqual(plaintext);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import {
  generateContentKey,
  encryptContent,
  decryptContent,
  buildContentAad,
} from "./content.js";
import { encryptBlob, decryptBlob } from "./blob.js";
import { concatBytes } from "./bytes.js";
import { getSodium, _resetSodiumForTesting } from "./sodium.js";
import { DecryptionError } from "./errors.js";
import type { Ciphertext, SymmetricKey } from "./types.js";

const AAD = buildContentAad("sec-invariant-ticket", "title");

/**
 * Property-based security invariants for content and blob encryption.
 *
 * Ticket content, message text, and attachments all flow through these two
 * modules. The invariants locked here are the fail-closed guarantees a
 * refactor could silently weaken while every roundtrip test stays green:
 *
 *   1. Cross-key isolation: ciphertext under one key never decrypts under
 *      any other key, even a key differing in a single bit. A partial
 *      key comparison or truncated key schedule would break this.
 *   2. Tamper evidence at every position: flipping any single bit anywhere
 *      in the stored blob (nonce or ciphertext portion) fails closed. A MAC
 *      that covers only part of the blob would break this.
 *   3. Truncation and extension always fail: no prefix, and no extended
 *      blob, ever decrypts.
 *   4. Confidentiality canary: the stored blob never contains the plaintext
 *      or the key as a contiguous byte run. Catches catastrophic
 *      regressions (encryption becoming a passthrough, key material copied
 *      into the output).
 *   5. Callers keep ownership of their buffers: encrypt and decrypt never
 *      mutate plaintext, key, or blob arguments.
 *   6. Context binding: a ciphertext never decrypts under a different
 *      associated data value (ticket or slot change), for any pair of
 *      distinct contexts (ADR-053).
 *
 * These complement the roundtrip and single-example negative tests in
 * content.test.ts and blob.test.ts (SEC-052 libsodium crypto_secretbox).
 */

/** Copy buf and flip one bit, addressed by absolute bit index. */
function flipBit(buf: Uint8Array, bitIndex: number): Uint8Array {
  const out = buf.slice();
  const byteIndex = Math.floor(bitIndex / 8);
  out[byteIndex] = (out[byteIndex] ?? 0) ^ (1 << (bitIndex % 8));
  return out;
}

/** True when needle occurs as a contiguous byte run inside haystack. */
function containsSubarray(haystack: Uint8Array, needle: Uint8Array): boolean {
  for (let i = 0; i + needle.length <= haystack.length; i++) {
    let match = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

describe("content encryption security invariants", () => {
  beforeAll(async () => {
    _resetSodiumForTesting();
    await getSodium();
  });

  describe("cross-key isolation", () => {
    it("never decrypts under an independent key (fails with DecryptionError)", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 512 }),
          (plaintext) => {
            const key = generateContentKey();
            const otherKey = generateContentKey();
            const blob = encryptContent(plaintext, key, AAD);
            expect(() => decryptContent(blob, otherKey, AAD)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("never decrypts under a key differing in a single bit", () => {
      // Stronger than an independent random key: a truncated key schedule
      // or partial key comparison could accept near-miss keys while still
      // rejecting fully random ones.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 256 }),
          fc.integer({ min: 0, max: 255 }),
          (plaintext, keyBit) => {
            const key = generateContentKey();
            const nearKey = flipBit(key, keyBit) as SymmetricKey;
            const blob = encryptContent(plaintext, key, AAD);
            expect(() => decryptContent(blob, nearKey, AAD)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("blob API inherits cross-key isolation", () => {
      // blob.ts delegates to content.ts today, but its confidentiality
      // contract is its own: attachments must keep failing closed even if
      // the implementations later diverge (e.g. streaming encryption).
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 512 }), (data) => {
          const key = generateContentKey();
          const otherKey = generateContentKey();
          const blob = encryptBlob(data, key, AAD);
          expect(() => decryptBlob(blob, otherKey, AAD)).toThrow(
            DecryptionError,
          );
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("tamper evidence", () => {
    it("rejects a single flipped bit at any position in the blob", () => {
      // Covers the nonce bytes and the ciphertext+MAC bytes uniformly. A
      // regression that authenticated only part of the blob would let some
      // positions through.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.integer({ min: 0, max: 1_000_000 }),
          (plaintext, bitSeed) => {
            const key = generateContentKey();
            const blob = encryptContent(plaintext, key, AAD);
            const bit = bitSeed % (blob.length * 8);
            const tampered = flipBit(blob, bit) as Ciphertext;
            expect(() => decryptContent(tampered, key, AAD)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("rejects truncation to any shorter length", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.integer({ min: 0, max: 1_000_000 }),
          (plaintext, cutSeed) => {
            const key = generateContentKey();
            const blob = encryptContent(plaintext, key, AAD);
            const cut = cutSeed % blob.length;
            const truncated = blob.subarray(0, cut) as Ciphertext;
            expect(() => decryptContent(truncated, key, AAD)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("rejects a blob extended with trailing bytes", () => {
      // The MAC must cover the exact ciphertext length. A decryptor that
      // reads only the expected number of bytes would accept padded blobs,
      // letting an attacker smuggle data alongside valid ciphertext.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.uint8Array({ minLength: 1, maxLength: 32 }),
          (plaintext, extra) => {
            const key = generateContentKey();
            const blob = encryptContent(plaintext, key, AAD);
            const extended = concatBytes(blob, extra) as Ciphertext;
            expect(() => decryptContent(extended, key, AAD)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("confidentiality canary", () => {
    it("blob never contains the plaintext as a contiguous run", () => {
      // A 16-byte minimum keeps the accidental-match probability at 2^-128
      // per position. This is the property version of "stored bytes differ
      // from plaintext": it fails if encryption ever degrades into a
      // passthrough or an identity transform on any code path.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 16, maxLength: 512 }),
          (plaintext) => {
            const key = generateContentKey();
            const blob = encryptContent(plaintext, key, AAD);
            expect(containsSubarray(blob, plaintext)).toBe(false);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("blob never contains key material as a contiguous run", () => {
      // Catches key/nonce confusion, e.g. a refactor that seeds the nonce
      // from the key. Checked via a 16-byte key prefix so even partial key
      // copies at any offset trip the test.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 512 }),
          (plaintext) => {
            const key = generateContentKey();
            const blob = encryptContent(plaintext, key, AAD);
            expect(containsSubarray(blob, key.subarray(0, 16))).toBe(false);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("context binding", () => {
    it("never decrypts under a different ticket/slot AAD", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.string({ minLength: 1, maxLength: 48 }),
          fc.string({ minLength: 1, maxLength: 48 }),
          fc.string({ minLength: 1, maxLength: 48 }),
          fc.string({ minLength: 1, maxLength: 48 }),
          (plaintext, ticketA, slotA, ticketB, slotB) => {
            fc.pre(`${ticketA}:${slotA}` !== `${ticketB}:${slotB}`);
            const key = generateContentKey();
            const blob = encryptContent(
              plaintext,
              key,
              buildContentAad(ticketA, slotA),
            );
            expect(() =>
              decryptContent(blob, key, buildContentAad(ticketB, slotB)),
            ).toThrow(DecryptionError);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("blob API inherits context binding", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (data) => {
          const key = generateContentKey();
          const blob = encryptBlob(
            data,
            key,
            buildContentAad("t1", "blob:key-a"),
          );
          expect(() =>
            decryptBlob(blob, key, buildContentAad("t1", "blob:key-b")),
          ).toThrow(DecryptionError);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("caller buffer ownership", () => {
    it("encrypt never mutates the plaintext or the key", () => {
      // The crypto package zeroes only buffers it owns. Zeroing or
      // encrypting in place would corrupt caller state (drafts, session
      // keys held for reuse) in ways no roundtrip test notices.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          (plaintext) => {
            const key = generateContentKey();
            const plaintextSnapshot = plaintext.slice();
            const keySnapshot = key.slice();
            encryptContent(plaintext, key, AAD);
            expect(plaintext).toEqual(plaintextSnapshot);
            expect(key).toEqual(keySnapshot);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("decrypt never mutates the blob or the key", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          (plaintext) => {
            const key = generateContentKey();
            const blob = encryptContent(plaintext, key, AAD);
            const blobSnapshot = blob.slice();
            const keySnapshot = key.slice();
            decryptContent(blob, key, AAD);
            expect(blob).toEqual(blobSnapshot);
            expect(key).toEqual(keySnapshot);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});

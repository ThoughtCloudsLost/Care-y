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
 *      mutate plaintext, key, blob, or aad arguments.
 *   6. Context binding: a ciphertext never decrypts under a different
 *      associated data value, whether the ticket id, the slot, or any
 *      single AAD bit differs; empty AAD is a context of its own, never
 *      a wildcard that skips verification (ADR-053).
 *   7. Context encoding is injective: buildContentAad maps distinct
 *      (ticketId, slot) pairs to distinct AAD bytes for fully arbitrary
 *      ids and slots, so no two storage contexts ever share a binding.
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

/**
 * Every canonical slot shape from content.ts, with arbitrary embedded ids.
 * Relocation properties draw pairs from here so every run exercises the
 * slot forms production rows actually use, not just random strings.
 */
const canonicalSlot = fc.oneof(
  fc.constant("title"),
  fc.constant("description"),
  fc.string({ minLength: 1, maxLength: 24 }).map(followupSlot),
  fc.string({ minLength: 1, maxLength: 24 }).map(blobSlot),
  fc.string({ minLength: 1, maxLength: 24 }).map(filenameSlot),
  fc.string({ minLength: 1, maxLength: 24 }).map(cursorSlot),
  fc.string({ minLength: 1, maxLength: 24 }).map(fieldSlot),
);

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
      // Pair inequality is the whole precondition: the injective encoding
      // (ADR-054) guarantees distinct pairs never share AAD bytes, so
      // colon-shifted pairs like ("a:b", "c") vs ("a", "b:c") must fail
      // too. Under the original colon-joined encoding they collided.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.string({ minLength: 1, maxLength: 48 }),
          fc.string({ minLength: 1, maxLength: 48 }),
          fc.string({ minLength: 1, maxLength: 48 }),
          fc.string({ minLength: 1, maxLength: 48 }),
          (plaintext, ticketA, slotA, ticketB, slotB) => {
            fc.pre(ticketA !== ticketB || slotA !== slotB);
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

    it("never relocates between canonical slots of the same ticket", () => {
      // The attack the AEAD exists for (ADR-053): every slot of a ticket
      // shares one key, so an attacker with database write access could
      // swap two ciphertexts within a row (title <-> description) or
      // reorder follow-ups without touching key material. Only the slot
      // half of the AAD separates these contexts. The generic property
      // above rarely samples same-ticket pairs; this one does every run,
      // across the canonical slot shapes.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.uuid(),
          canonicalSlot,
          canonicalSlot,
          (plaintext, ticketId, slotA, slotB) => {
            fc.pre(slotA !== slotB);
            const key = generateContentKey();
            const blob = encryptContent(
              plaintext,
              key,
              buildContentAad(ticketId, slotA),
            );
            expect(() =>
              decryptContent(blob, key, buildContentAad(ticketId, slotB)),
            ).toThrow(DecryptionError);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("never relocates to another ticket in the same slot", () => {
      // Cross-ticket move: an attacker who relocates a ciphertext together
      // with its wrapped key row would otherwise get a clean decrypt on
      // the destination ticket. The ticket half of the AAD, rebuilt from
      // the row the ciphertext is read from, fails it closed.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.uuid(),
          fc.uuid(),
          canonicalSlot,
          (plaintext, ticketA, ticketB, slot) => {
            fc.pre(ticketA !== ticketB);
            const key = generateContentKey();
            const blob = encryptContent(
              plaintext,
              key,
              buildContentAad(ticketA, slot),
            );
            expect(() =>
              decryptContent(blob, key, buildContentAad(ticketB, slot)),
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

  describe("associated data strictness", () => {
    it("roundtrips with arbitrary matching AAD bytes, even empty ones", () => {
      // AAD is opaque bytes to the cipher: no canonicalization, no
      // parsing, and empty AAD is a valid context in its own right. The
      // two sides need nothing but byte equality, whatever produced the
      // bytes.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.uint8Array({ minLength: 0, maxLength: 64 }),
          (plaintext, aad) => {
            const key = generateContentKey();
            const blob = encryptContent(plaintext, key, aad);
            expect(decryptContent(blob, key, aad)).toEqual(plaintext);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("rejects a single flipped bit anywhere in the AAD", () => {
      // Authentication must cover every AAD bit. An implementation that
      // authenticated only a prefix, or only the AAD length, would let
      // near-miss contexts through while every exact-mismatch test above
      // stays green.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.integer({ min: 0, max: 1_000_000 }),
          (plaintext, aad, bitSeed) => {
            const key = generateContentKey();
            const blob = encryptContent(plaintext, key, aad);
            const perturbed = flipBit(aad, bitSeed % (aad.length * 8));
            expect(() => decryptContent(blob, key, perturbed)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("treats empty AAD as its own context, never a wildcard", () => {
      // A compatibility shim that skipped AAD verification when the
      // decryptor supplies empty bytes would make every stored ciphertext
      // relocatable. Both directions must fail closed: bound at encrypt
      // but not supplied at decrypt, and supplied at decrypt but not
      // bound at encrypt.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          (plaintext, aad) => {
            const key = generateContentKey();
            const empty = new Uint8Array(0);
            const bound = encryptContent(plaintext, key, aad);
            expect(() => decryptContent(bound, key, empty)).toThrow(
              DecryptionError,
            );
            const unbound = encryptContent(plaintext, key, empty);
            expect(() => decryptContent(unbound, key, aad)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("buildContentAad maps distinct (ticketId, slot) pairs to distinct bytes", () => {
      // If two storage contexts encoded to the same AAD, the binding
      // would silently vanish for that pair. The length-prefixed encoding
      // (ADR-054) is injective by construction, so this holds for fully
      // arbitrary ids and slots, colons included; ids are deliberately
      // NOT constrained to UUIDs because the decrypt path builds AADs
      // from server-supplied strings and the server is untrusted. The
      // sameTicket flag biases half the runs into the slot-only subspace.
      fc.assert(
        fc.property(
          fc.string({ maxLength: 48 }),
          fc.string({ maxLength: 48 }),
          fc.boolean(),
          fc.string({ maxLength: 48 }),
          fc.string({ maxLength: 48 }),
          (idA, idB, sameTicket, slotA, slotB) => {
            const ticketA = idA;
            const ticketB = sameTicket ? idA : idB;
            fc.pre(ticketA !== ticketB || slotA !== slotB);
            expect(buildContentAad(ticketA, slotA)).not.toEqual(
              buildContentAad(ticketB, slotB),
            );
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("caller buffer ownership", () => {
    it("encrypt never mutates the plaintext, key, or aad", () => {
      // The crypto package zeroes only buffers it owns. Zeroing or
      // encrypting in place would corrupt caller state (drafts, session
      // keys held for reuse, AAD values built once and shared across
      // slots) in ways no roundtrip test notices.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.uint8Array({ minLength: 0, maxLength: 64 }),
          (plaintext, aad) => {
            const key = generateContentKey();
            const plaintextSnapshot = plaintext.slice();
            const keySnapshot = key.slice();
            const aadSnapshot = aad.slice();
            encryptContent(plaintext, key, aad);
            expect(plaintext).toEqual(plaintextSnapshot);
            expect(key).toEqual(keySnapshot);
            expect(aad).toEqual(aadSnapshot);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("decrypt never mutates the blob, key, or aad", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 0, maxLength: 256 }),
          fc.uint8Array({ minLength: 0, maxLength: 64 }),
          (plaintext, aad) => {
            const key = generateContentKey();
            const blob = encryptContent(plaintext, key, aad);
            const blobSnapshot = blob.slice();
            const keySnapshot = key.slice();
            const aadSnapshot = aad.slice();
            decryptContent(blob, key, aad);
            expect(blob).toEqual(blobSnapshot);
            expect(key).toEqual(keySnapshot);
            expect(aad).toEqual(aadSnapshot);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});

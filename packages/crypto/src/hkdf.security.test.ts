import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_LIGHT } from "./fc-config.js";
import { hkdf, hkdfDerive32 } from "./hkdf.js";
import { getSodium, _resetSodiumForTesting } from "./sodium.js";

/**
 * Property-based security invariants for the hand-rolled HKDF-SHA512.
 *
 * Every key in the derivation tree and every ECIES wrap key passes through
 * this module, and it is built from raw HMAC primitives rather than a
 * library HKDF, so its block chaining and buffer handling are ours to get
 * wrong (SEC-004, RFC 5869). Invariants locked here:
 *
 *   1. Expand chaining correctness: shorter outputs are exact prefixes of
 *      longer ones for the same inputs, across the 64-byte block boundary.
 *      This is a structural consequence of RFC 5869 Section 2.3; it fails
 *      if the T(i) feedback, counter, or the intermediate-block zeroing
 *      added for memory hygiene ever corrupts a block before it is copied
 *      out.
 *   2. Full-input sensitivity: every bit of ikm and info influences the
 *      output. Fails if either input is truncated or partially consumed.
 *   3. Label separation: distinct info labels always produce distinct keys,
 *      for arbitrary labels, not just the four registered ones (SEC-017,
 *      NIST SP 800-108 context binding).
 *   4. Standalone output buffer: the returned bytes own their entire
 *      backing ArrayBuffer. Callers zero derived keys after use; if the
 *      result were a view into a larger scratch buffer, that zeroing would
 *      leave sibling bytes of key material alive (SEC-054).
 *   5. Live output: the result is never the zeroed scratch buffer. Catches
 *      a reordering where the cleanup runs before the output copy is taken.
 */

/** Copy buf and flip one bit, addressed by absolute bit index. */
function flipBit(buf: Uint8Array, bitIndex: number): Uint8Array {
  const out = buf.slice();
  const byteIndex = Math.floor(bitIndex / 8);
  out[byteIndex] = (out[byteIndex] ?? 0) ^ (1 << (bitIndex % 8));
  return out;
}

describe("HKDF security invariants", () => {
  beforeAll(async () => {
    _resetSodiumForTesting();
    await getSodium();
  });

  describe("expand chaining correctness", () => {
    it("shorter outputs are exact prefixes of longer outputs", () => {
      // Length pairs are generated so many runs straddle the 64-byte
      // SHA-512 block boundary, exercising the multi-block T(i) chain.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.uint8Array({ minLength: 0, maxLength: 32 }),
          fc.integer({ min: 1, max: 128 }),
          fc.integer({ min: 1, max: 128 }),
          (ikm, info, shortLen, extraLen) => {
            const longLen = shortLen + extraLen;
            const short = hkdf(ikm, info, shortLen);
            const long = hkdf(ikm, info, longLen);
            expect(long.subarray(0, shortLen)).toEqual(short);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });
  });

  describe("full-input sensitivity", () => {
    it("flipping any single bit of the ikm changes the output", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.integer({ min: 0, max: 1_000_000 }),
          (ikm, bitSeed) => {
            const info = new TextEncoder().encode("sensitivity-check");
            const bit = bitSeed % (ikm.length * 8);
            const original = hkdf(ikm, info, 32);
            const perturbed = hkdf(flipBit(ikm, bit), info, 32);
            expect(perturbed).not.toEqual(original);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });

    it("flipping any single bit of the info changes the output", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 32, maxLength: 32 }),
          fc.uint8Array({ minLength: 1, maxLength: 48 }),
          fc.integer({ min: 0, max: 1_000_000 }),
          (ikm, info, bitSeed) => {
            const bit = bitSeed % (info.length * 8);
            const original = hkdf(ikm, info, 32);
            const perturbed = hkdf(ikm, flipBit(info, bit), 32);
            expect(perturbed).not.toEqual(original);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });

    it("distinct labels always produce distinct 32-byte keys", () => {
      // The second label extends the first, so the pair is always distinct
      // without filtering. Locks domain separation for arbitrary label
      // shapes, not only the registered HKDF_LABELS values.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.string({ minLength: 1, maxLength: 32 }),
          (ikm, label) => {
            const a = hkdfDerive32(ikm, label);
            const b = hkdfDerive32(ikm, `${label}#`);
            expect(a).not.toEqual(b);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });
  });

  describe("output buffer hygiene", () => {
    it("output owns its entire backing buffer at any length", () => {
      // Generalizes the fixed-length examples in hkdf.test.ts across
      // arbitrary lengths, including non-multiples of the hash size. A view
      // into a larger scratch buffer would make caller-side zeroing
      // incomplete (SEC-054).
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.integer({ min: 1, max: 256 }),
          (ikm, length) => {
            const info = new TextEncoder().encode("buffer-hygiene");
            const out = hkdf(ikm, info, length);
            expect(out.length).toBe(length);
            expect(out.byteOffset).toBe(0);
            expect(out.buffer.byteLength).toBe(length);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });

    it("output is never all zeros", () => {
      // The expand scratch buffer is zeroed before hkdf returns. If a
      // refactor reordered that cleanup ahead of the output copy, every
      // derived key would silently become zeros and all roundtrip tests
      // would still pass (both sides would derive the same zero key).
      // 16 bytes minimum keeps the legitimate all-zero probability at
      // 2^-128.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          fc.integer({ min: 16, max: 256 }),
          (ikm, length) => {
            const info = new TextEncoder().encode("liveness");
            const out = hkdf(ikm, info, length);
            expect(out.every((b) => b === 0)).toBe(false);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_LIGHT, FC_HEAVY } from "./fc-config.js";
import {
  encryptWithPassphrase,
  decryptWithPassphrase,
  serializeEscrowBlob,
  deserializeEscrowBlob,
} from "./escrow.js";
import { getSodium, _resetSodiumForTesting } from "./sodium.js";
import { DecryptionError, InvalidInputError } from "./errors.js";
import type { EscrowBlob } from "./types.js";

/**
 * Property-based security invariants for passphrase escrow.
 *
 * Escrow blobs protect the OPRF key and org key offline; they are the
 * disaster-recovery root of trust and the one artifact designed to leave
 * the system (SEC-009, SEC-041). Invariants locked here:
 *
 *   1. Full-passphrase sensitivity: a passphrase differing in any single
 *      bit fails to decrypt. Fails if the passphrase is ever truncated or
 *      partially consumed before key derivation, which a correct-passphrase
 *      roundtrip can never notice.
 *   2. Tamper evidence across the serialized format: flipping any bit of
 *      the stored salt, nonce, or ciphertext fails closed.
 *   3. Fail-closed parsing: unknown version bytes and short bodies are
 *      rejected with a typed error before any expensive key derivation.
 *   4. The serialized blob never contains passphrase bytes.
 *
 * Argon2id at escrow parameters is intentionally slow, so the expensive
 * properties reuse one fixture blob and run at the heavy tier, matching
 * the existing escrow property tests.
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

describe("escrow security invariants", () => {
  const passphrase = new TextEncoder().encode(
    "escrow-invariant-fixture-passphrase",
  );
  const secret = new Uint8Array(48);
  let blob: EscrowBlob;
  let serialized: Uint8Array;

  beforeAll(async () => {
    _resetSodiumForTesting();
    await getSodium();
    secret.fill(0x42);
    // One fixture encryption shared by every property below keeps the
    // Argon2id cost bounded: each property run pays for one derivation
    // (the decrypt attempt), not two.
    blob = encryptWithPassphrase(secret, passphrase);
    serialized = serializeEscrowBlob(blob);
  }, 60_000);

  describe("full-passphrase sensitivity", () => {
    it("a passphrase differing in any single bit fails with DecryptionError", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: passphrase.length * 8 - 1 }),
          (bit) => {
            const nearMiss = flipBit(passphrase, bit);
            expect(() => decryptWithPassphrase(blob, nearMiss)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_HEAVY },
      );
    }, 120_000);
  });

  describe("tamper evidence", () => {
    it("a single flipped bit anywhere after the version byte fails with DecryptionError", () => {
      // Byte 0 is the format version: flipping it is rejected earlier by
      // deserializeEscrowBlob (covered in escrow.test.ts). From byte 1 on,
      // the flip lands in salt, nonce, or ciphertext; a salt flip derives
      // the wrong key and a nonce or ciphertext flip fails the MAC. All
      // must surface as the same typed failure.
      fc.assert(
        fc.property(
          fc.integer({ min: 8, max: serialized.length * 8 - 1 }),
          (bit) => {
            const tampered = flipBit(serialized, bit);
            const parsed = deserializeEscrowBlob(tampered);
            expect(() => decryptWithPassphrase(parsed, passphrase)).toThrow(
              DecryptionError,
            );
          },
        ),
        { numRuns: FC_HEAVY },
      );
    }, 120_000);
  });

  describe("fail-closed parsing", () => {
    it("rejects any version byte other than 1 with InvalidInputError", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 255 }).filter((v) => v !== 1),
          (version) => {
            const wrongVersion = serialized.slice();
            wrongVersion[0] = version;
            expect(() => deserializeEscrowBlob(wrongVersion)).toThrow(
              InvalidInputError,
            );
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });

    it("rejects any version-1 body shorter than the minimum with InvalidInputError", () => {
      // Minimum is version (1) + salt (16) + nonce (24) + MAC (16) = 57
      // bytes. Every shorter body must be rejected during parsing, before
      // the passphrase or Argon2id is ever touched.
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 1, maxLength: 56 }), (bytes) => {
          const short = bytes.slice();
          short[0] = 0x01;
          expect(() => deserializeEscrowBlob(short)).toThrow(InvalidInputError);
        }),
        { numRuns: FC_LIGHT },
      );
    });
  });

  describe("confidentiality canary", () => {
    it("the serialized blob never contains the passphrase", () => {
      // The passphrase must only ever feed Argon2id. Any appearance in the
      // output would mean it leaked into salt, nonce, or ciphertext
      // assembly.
      expect(containsSubarray(serialized, passphrase)).toBe(false);
    });

    it("the serialized blob never contains the escrowed secret", () => {
      expect(containsSubarray(serialized, secret.subarray(0, 16))).toBe(false);
    });
  });
});

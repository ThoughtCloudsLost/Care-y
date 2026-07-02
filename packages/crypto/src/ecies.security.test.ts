import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import { eciesEncrypt, eciesDecrypt } from "./ecies.js";
import { wrapKey, unwrapKey } from "./keywrap.js";
import { hkdfDerive32 } from "./hkdf.js";
import { concatBytes } from "./bytes.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { DecryptionError } from "./errors.js";
import { HKDF_LABELS } from "./types.js";
import type { Scalar, RistrettoPoint, Nonce } from "./types.js";

/**
 * Property-based security invariants for ECIES per-volunteer wrapping.
 *
 * ECIES wraps ticket keys and the org private key to individual volunteers.
 * If any of these invariants regresses, a volunteer (or an attacker holding
 * the database) could open wraps addressed to someone else:
 *
 *   1. Cross-recipient isolation: a wrap for recipient A never decrypts
 *      under any other private key.
 *   2. KDF binding completeness: the wrap key is derived from exactly
 *      (shared || ephemeralPoint || recipientPublic) in that order
 *      (SEC-040, NIST SP 800-56A Rev. 3 OtherInfo binding). Any variant
 *      that drops a component or reorders them must fail to decrypt, so a
 *      refactor cannot quietly loosen the binding while roundtrips pass.
 *   3. Tamper evidence across the full wire triple: flipping any bit of
 *      ephemeralPoint, nonce, or ciphertext fails closed, and an ephemeral
 *      point transplanted from another wrap is rejected.
 *   4. Caller buffer ownership: encrypt/decrypt never mutate caller
 *      arguments. The internal zeroing (SEC-054) must only ever touch
 *      buffers the module itself allocated; an aliasing regression here
 *      would silently zero a caller's session key.
 *
 * Complements the example-based KDF binding tests in ecies.test.ts.
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

/** Generate a ristretto255 keypair (private scalar + public point). */
function generateKeypair(sodium: SodiumBackend): {
  priv: Scalar;
  pub: RistrettoPoint;
} {
  const priv = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
  const pub = sodium.crypto_scalarmult_ristretto255_base(
    priv,
  ) as RistrettoPoint;
  return { priv, pub };
}

describe("ECIES security invariants", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("cross-recipient isolation", () => {
    it("a wrap for one recipient never decrypts under another private key", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 128 }),
          (plaintext) => {
            const recipient = generateKeypair(sodium);
            const other = generateKeypair(sodium);
            const wrap = eciesEncrypt(plaintext, recipient.pub);
            expect(() =>
              eciesDecrypt(
                wrap.ephemeralPoint,
                wrap.nonce,
                wrap.ciphertext,
                other.priv,
              ),
            ).toThrow(DecryptionError);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("keywrap inherits cross-recipient isolation", () => {
      // wrapKey/unwrapKey distribute the org private key. The semantic
      // wrapper must keep the same isolation contract even if it stops
      // delegating to eciesEncrypt verbatim.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 32, maxLength: 64 }),
          (keyMaterial) => {
            const recipient = generateKeypair(sodium);
            const other = generateKeypair(sodium);
            const wrapped = wrapKey(keyMaterial, recipient.pub);
            expect(() =>
              unwrapKey(
                wrapped.ephemeralPoint,
                wrapped.nonce,
                wrapped.ciphertext,
                other.priv,
              ),
            ).toThrow(DecryptionError);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("KDF binding completeness", () => {
    it("rejects wraps built from any weakened or reordered KDF input", () => {
      // Reconstructs the wrap independently with every plausible wrong ikm
      // a refactor could introduce: dropping one bound component, dropping
      // both, or swapping their order. All must fail against the real
      // decryptor. Only the canonical (shared || E || recipientPublic)
      // derivation may succeed, which ecies.test.ts verifies separately.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          (plaintext) => {
            const { priv, pub } = generateKeypair(sodium);
            const ephemeral = sodium.crypto_core_ristretto255_scalar_random();
            const ephemeralPoint = sodium.crypto_scalarmult_ristretto255_base(
              ephemeral,
            ) as RistrettoPoint;
            const shared = sodium.crypto_scalarmult_ristretto255(
              ephemeral,
              pub,
            );

            const weakenedIkms = [
              shared, // no binding at all (legacy construction)
              concatBytes(shared, ephemeralPoint), // recipient key dropped
              concatBytes(shared, pub), // ephemeral point dropped
              concatBytes(shared, pub, ephemeralPoint), // components reordered
            ];

            for (const ikm of weakenedIkms) {
              const wrapKeyBytes = hkdfDerive32(ikm, HKDF_LABELS.ECIES_WRAP);
              const nonce = sodium.randombytes_buf(
                sodium.crypto_secretbox_NONCEBYTES,
              ) as Nonce;
              const ciphertext = sodium.crypto_secretbox_easy(
                plaintext,
                nonce,
                wrapKeyBytes,
              );
              expect(() =>
                eciesDecrypt(ephemeralPoint, nonce, ciphertext, priv),
              ).toThrow(DecryptionError);
            }
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("tamper evidence", () => {
    it("rejects a single flipped bit anywhere in ephemeralPoint, nonce, or ciphertext", () => {
      // The three stored fields form one logical wrap. Whichever field the
      // flip lands in, decryption must fail closed: a corrupted point either
      // fails scalarmult or derives a wrong shared secret, and nonce or
      // ciphertext damage fails the MAC.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 128 }),
          fc.integer({ min: 0, max: 1_000_000 }),
          (plaintext, bitSeed) => {
            const { priv, pub } = generateKeypair(sodium);
            const wrap = eciesEncrypt(plaintext, pub);
            const wire = concatBytes(
              wrap.ephemeralPoint,
              wrap.nonce,
              wrap.ciphertext,
            );
            const bit = bitSeed % (wire.length * 8);
            const tampered = flipBit(wire, bit);

            const ephemeralPoint = tampered.subarray(0, 32) as RistrettoPoint;
            const nonce = tampered.subarray(32, 56) as Nonce;
            const ciphertext = tampered.subarray(56);

            expect(() =>
              eciesDecrypt(ephemeralPoint, nonce, ciphertext, priv),
            ).toThrow(DecryptionError);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("rejects an ephemeral point transplanted from another wrap", () => {
      // Two valid wraps to the same recipient must not be mixable. This is
      // the wrap-level analog of ciphertext relocation: every stored field
      // must belong to the same encryption or the wrap fails.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          (plaintext) => {
            const { priv, pub } = generateKeypair(sodium);
            const wrapA = eciesEncrypt(plaintext, pub);
            const wrapB = eciesEncrypt(plaintext, pub);
            expect(() =>
              eciesDecrypt(
                wrapB.ephemeralPoint,
                wrapA.nonce,
                wrapA.ciphertext,
                priv,
              ),
            ).toThrow(DecryptionError);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("confidentiality canary", () => {
    it("wrap output never contains the plaintext as a contiguous run", () => {
      // 16-byte minimum keeps the accidental-match probability negligible.
      // Fails if the wrap ever degrades into a passthrough on any path.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 16, maxLength: 128 }),
          (plaintext) => {
            const { pub } = generateKeypair(sodium);
            const wrap = eciesEncrypt(plaintext, pub);
            const wire = concatBytes(
              wrap.ephemeralPoint,
              wrap.nonce,
              wrap.ciphertext,
            );
            expect(containsSubarray(wire, plaintext)).toBe(false);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("caller buffer ownership", () => {
    it("encrypt never mutates the plaintext or the recipient public key", () => {
      // eciesEncrypt zeroes its ephemeral scalar, shared secret, ikm, and
      // wrap key in a finally block. None of those may alias a caller
      // buffer; a regression here would zero live caller key material.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 128 }),
          (plaintext) => {
            const { pub } = generateKeypair(sodium);
            const plaintextSnapshot = plaintext.slice();
            const pubSnapshot = pub.slice();
            eciesEncrypt(plaintext, pub);
            expect(plaintext).toEqual(plaintextSnapshot);
            expect(pub).toEqual(pubSnapshot);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });

    it("decrypt never mutates the wrap fields or the recipient private key", () => {
      // The private scalar is the volunteer's long-lived login-derived key,
      // reused across every unwrap in a session. Zeroing or overwriting it
      // inside one decrypt would break every later operation.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 128 }),
          (plaintext) => {
            const { priv, pub } = generateKeypair(sodium);
            const wrap = eciesEncrypt(plaintext, pub);
            const pointSnapshot = wrap.ephemeralPoint.slice();
            const nonceSnapshot = wrap.nonce.slice();
            const ciphertextSnapshot = wrap.ciphertext.slice();
            const privSnapshot = priv.slice();
            eciesDecrypt(
              wrap.ephemeralPoint,
              wrap.nonce,
              wrap.ciphertext,
              priv,
            );
            expect(wrap.ephemeralPoint).toEqual(pointSnapshot);
            expect(wrap.nonce).toEqual(nonceSnapshot);
            expect(wrap.ciphertext).toEqual(ciphertextSnapshot);
            expect(priv).toEqual(privSnapshot);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});

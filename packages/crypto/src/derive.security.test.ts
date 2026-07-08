import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_LIGHT, FC_HEAVY } from "./fc-config.js";
import {
  deriveAccountKey,
  deriveMasterKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  deriveOrgUnwrapKey,
} from "./derive.js";
import { getSodium, _resetSodiumForTesting } from "./sodium.js";
import {
  ARGON2_MIN_PARAMS,
  ARGON2_ESCROW_PARAMS,
  type Salt,
  type SymmetricKey,
} from "./types.js";

/**
 * Property-based security invariants for the key derivation tree.
 *
 * Every key in CARE-Y descends from the OPRF output through this module
 * (crypto-architecture-v2.md). The invariants locked here:
 *
 *   1. Parameter floor tripwire: the Argon2id minimums may only ever go up.
 *      At launch a single server seizure yields the OPRF key and database,
 *      so offline password cracking cost IS the PII security margin
 *      (SEC-009, RFC 9106 Section 4). A silent constant edit must fail here.
 *   2. Caller buffer ownership: derivation functions never mutate their
 *      inputs. deriveMasterKey copies the OPRF output into an owned ikm and
 *      zeroes only the copy; regressing to aliasing would zero or corrupt
 *      the caller's buffer.
 *   3. Full-input sensitivity: every bit of the 64-byte OPRF output (and of
 *      pqShared when present) influences the master key. A regression that
 *      truncated the ikm would leave some bit positions dead and quietly
 *      halve the derived-key entropy.
 *   4. Domain separation: master key, volunteer private key, and org unwrap
 *      key are pairwise distinct for arbitrary inputs, and the master key
 *      never echoes raw OPRF output (SEC-004, RFC 5869 label separation).
 *   5. Chain determinism: the same OPRF output always reproduces the same
 *      tree. If this breaks, volunteers lose access to everything they
 *      could previously decrypt.
 */

/** Copy buf and flip one bit, addressed by absolute bit index. */
function flipBit(buf: Uint8Array, bitIndex: number): Uint8Array {
  const out = buf.slice();
  const byteIndex = Math.floor(bitIndex / 8);
  out[byteIndex] = (out[byteIndex] ?? 0) ^ (1 << (bitIndex % 8));
  return out;
}

describe("key derivation security invariants", () => {
  beforeAll(async () => {
    _resetSodiumForTesting();
    await getSodium();
  });

  describe("Argon2id parameter floor tripwire", () => {
    it("login floor stays at or above 64 MiB / 4 iterations", () => {
      // Lower bounds, not exact values: raising the floor is a legitimate
      // hardening change, lowering it silently weakens every password in
      // the field (SEC-009, RFC 9106 Section 4 second-recommended profile
      // plus the raised iteration count).
      expect(ARGON2_MIN_PARAMS.memoryKiB).toBeGreaterThanOrEqual(65536);
      expect(ARGON2_MIN_PARAMS.iterations).toBeGreaterThanOrEqual(4);
    });

    it("escrow floor stays at or above 256 MiB / 4 iterations", () => {
      expect(ARGON2_ESCROW_PARAMS.memoryKiB).toBeGreaterThanOrEqual(262144);
      expect(ARGON2_ESCROW_PARAMS.iterations).toBeGreaterThanOrEqual(4);
    });

    it("escrow params are at least as strong as the login floor", () => {
      expect(ARGON2_ESCROW_PARAMS.memoryKiB).toBeGreaterThanOrEqual(
        ARGON2_MIN_PARAMS.memoryKiB,
      );
      expect(ARGON2_ESCROW_PARAMS.iterations).toBeGreaterThanOrEqual(
        ARGON2_MIN_PARAMS.iterations,
      );
    });
  });

  describe("caller buffer ownership", () => {
    it("deriveMasterKey never mutates the OPRF output, with or without pqShared", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          fc.option(fc.uint8Array({ minLength: 32, maxLength: 32 }), {
            nil: undefined,
          }),
          (oprfOutput, pqShared) => {
            const oprfSnapshot = oprfOutput.slice();
            const pqSnapshot = pqShared?.slice();
            deriveMasterKey(oprfOutput, pqShared);
            expect(oprfOutput).toEqual(oprfSnapshot);
            if (pqShared && pqSnapshot) {
              expect(pqShared).toEqual(pqSnapshot);
            }
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });

    it("deriveAccountKey never mutates the password or the salt", () => {
      // Argon2id at the enforced floor is expensive, so this runs at the
      // heavy tier. The invariant matters most for the password buffer:
      // the login flow reuses it between stretching and zeroing it
      // deliberately, so an in-place edit here would corrupt that flow.
      const salt = new Uint8Array(16) as Salt;
      salt.fill(0x5a);
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 64 }),
          (password) => {
            const passwordSnapshot = password.slice();
            const saltSnapshot = salt.slice();
            const stretched = deriveAccountKey(password, salt);
            expect(password).toEqual(passwordSnapshot);
            expect(salt).toEqual(saltSnapshot);
            // Liveness canary at no extra Argon2 cost: a cleanup regression
            // that zeroed the stretched key before returning would still
            // pass every determinism test (both sides would be zero).
            expect(stretched.every((b) => b === 0)).toBe(false);
          },
        ),
        { numRuns: FC_HEAVY },
      );
    }, 120_000);
  });

  describe("full-input sensitivity", () => {
    it("flipping any single bit of the OPRF output changes the master key", () => {
      // Covers all 512 bit positions across runs. Fails if the ikm is ever
      // truncated or partially consumed, which no roundtrip test notices.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          fc.integer({ min: 0, max: 511 }),
          (oprfOutput, bit) => {
            const flipped = flipBit(oprfOutput, bit);
            const original = deriveMasterKey(oprfOutput);
            const perturbed = deriveMasterKey(flipped);
            expect(perturbed).not.toEqual(original);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });

    it("pqShared always contributes: absent, present, and perturbed all differ", () => {
      // Locks the hybrid extension point: when a post-quantum share is
      // supplied it must actually strengthen the ikm, not be ignored.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          fc.uint8Array({ minLength: 32, maxLength: 32 }),
          fc.integer({ min: 0, max: 255 }),
          (oprfOutput, pqShared, bit) => {
            const withoutPq = deriveMasterKey(oprfOutput);
            const withPq = deriveMasterKey(oprfOutput, pqShared);
            const withPerturbedPq = deriveMasterKey(
              oprfOutput,
              flipBit(pqShared, bit),
            );
            expect(withPq).not.toEqual(withoutPq);
            expect(withPerturbedPq).not.toEqual(withPq);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });
  });

  describe("domain separation across the tree", () => {
    it("master, volunteer private, and org unwrap keys are pairwise distinct and never echo the ikm", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          (oprfOutput) => {
            const masterKey = deriveMasterKey(oprfOutput);
            const volPrivate = deriveVolunteerPrivateKey(masterKey);
            const orgUnwrap = deriveOrgUnwrapKey(masterKey);

            expect(masterKey).not.toEqual(volPrivate);
            expect(masterKey).not.toEqual(orgUnwrap);
            expect(volPrivate).not.toEqual(orgUnwrap);

            // The master key must be a derived value, not a window into the
            // OPRF output. Catches HKDF degrading into an identity or copy.
            expect(masterKey).not.toEqual(oprfOutput.subarray(0, 32));
            expect(masterKey).not.toEqual(oprfOutput.subarray(32, 64));
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });
  });

  describe("chain determinism", () => {
    it("the same OPRF output reproduces the identical key tree", () => {
      // Login-stability invariant: volunteers derive keys fresh at every
      // login. Any nondeterminism (hidden state, stray randomness) makes
      // previously encrypted data unreachable.
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 64, maxLength: 64 }),
          (oprfOutput) => {
            const masterA = deriveMasterKey(oprfOutput);
            const volPrivA = deriveVolunteerPrivateKey(masterA);
            const volPubA = deriveVolunteerPublicKey(volPrivA);
            const orgUnwrapA = deriveOrgUnwrapKey(masterA);

            const masterB = deriveMasterKey(oprfOutput);
            const volPrivB = deriveVolunteerPrivateKey(masterB);
            const volPubB = deriveVolunteerPublicKey(volPrivB);
            const orgUnwrapB = deriveOrgUnwrapKey(masterB);

            expect(masterA).toEqual(masterB);
            expect(volPrivA).toEqual(volPrivB);
            expect(volPubA).toEqual(volPubB);
            expect(orgUnwrapA).toEqual(orgUnwrapB);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });

    it("volunteer public key derivation is a pure function of the private scalar", () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 32, maxLength: 32 }),
          (mkBytes) => {
            const masterKey = mkBytes as SymmetricKey;
            const volPriv = deriveVolunteerPrivateKey(masterKey);
            const privSnapshot = volPriv.slice();
            const pubA = deriveVolunteerPublicKey(volPriv);
            const pubB = deriveVolunteerPublicKey(volPriv);
            expect(pubA).toEqual(pubB);
            // The scalar survives public key derivation untouched.
            expect(volPriv).toEqual(privSnapshot);
          },
        ),
        { numRuns: FC_LIGHT },
      );
    });
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import fc from "fast-check";
import { FC_MEDIUM } from "./fc-config.js";
import { oprfBlind, oprfFinalize } from "./oprf.js";
import { concatBytes } from "./bytes.js";
import {
  getSodium,
  _resetSodiumForTesting,
  type SodiumBackend,
} from "./sodium.js";
import { InvalidInputError } from "./errors.js";
import type { Scalar, RistrettoPoint, EvaluatedElement } from "./types.js";

/**
 * Property-based security invariants for the client-side OPRF.
 *
 * The OPRF output is the root of every volunteer's key tree, so these
 * invariants carry the whole login flow (SEC-012, RFC 9497):
 *
 *   1. Blind-session independence: the finalize output depends only on the
 *      input and the server key, never on the random blinding scalar. Two
 *      logins blind differently by design; if the blind ever leaked into
 *      the output, every user would derive a different master key per
 *      login and lose access to their data.
 *   2. PRF behavior: different inputs and different server keys produce
 *      different outputs. A collapse here would let one password unlock
 *      another account's key tree.
 *   3. Fail-closed server trust boundary: a server response of any wrong
 *      length is rejected with a typed error before any group arithmetic,
 *      for arbitrary lengths, not just the sampled examples.
 *   4. Caller buffer ownership: blind and finalize never mutate their
 *      arguments. The blind state in particular is reused by the login
 *      flow on retry, so consuming it in place would break retries.
 *
 * Complements the fixed-input determinism examples, adversarial-response
 * tests, and RFC 9497 known-answer vectors in oprf.test.ts.
 */

/**
 * Simulates server-side BlindEvaluate: evaluated = key * blindedElement.
 * Mirrors the helper in oprf.test.ts (the server package implements this
 * with sodium-native).
 */
function blindEvaluate(
  sodium: SodiumBackend,
  key: Scalar,
  blindedElement: RistrettoPoint,
): EvaluatedElement {
  return sodium.crypto_scalarmult_ristretto255(
    key,
    blindedElement,
  ) as EvaluatedElement;
}

describe("OPRF security invariants", () => {
  let sodium: SodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  describe("blind-session independence", () => {
    it("independent blind sessions produce the identical output for the same input and key", () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 1, maxLength: 64 }), (input) => {
          const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;

          const sessionA = oprfBlind(input);
          const evaluatedA = blindEvaluate(
            sodium,
            key,
            sessionA.blindedElement,
          );
          const outputA = oprfFinalize(sessionA.blindState, evaluatedA, input);

          const sessionB = oprfBlind(input);
          const evaluatedB = blindEvaluate(
            sodium,
            key,
            sessionB.blindedElement,
          );
          const outputB = oprfFinalize(sessionB.blindState, evaluatedB, input);

          // The wire messages differ (random blinds) while the final
          // output agrees: obliviousness and stability at once.
          expect(sessionA.blindedElement).not.toEqual(sessionB.blindedElement);
          expect(outputA).toEqual(outputB);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("PRF behavior", () => {
    it("different inputs never collide under the same key", () => {
      // The second input extends the first, so the pair is always distinct
      // without filtering. Length-prefixed hashing (buildFinalizeInput)
      // must keep extension pairs apart.
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 1, maxLength: 64 }), (input) => {
          const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
          const extended = concatBytes(input, new Uint8Array([0x01]));

          const sessionA = oprfBlind(input);
          const outputA = oprfFinalize(
            sessionA.blindState,
            blindEvaluate(sodium, key, sessionA.blindedElement),
            input,
          );

          const sessionB = oprfBlind(extended);
          const outputB = oprfFinalize(
            sessionB.blindState,
            blindEvaluate(sodium, key, sessionB.blindedElement),
            extended,
          );

          expect(outputA).not.toEqual(outputB);
        }),
        { numRuns: FC_MEDIUM },
      );
    });

    it("different server keys never collide for the same input", () => {
      // If this collapsed, the threshold servers' key separation (and any
      // future key rotation) would stop mattering.
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 1, maxLength: 64 }), (input) => {
          const keyA =
            sodium.crypto_core_ristretto255_scalar_random() as Scalar;
          const keyB =
            sodium.crypto_core_ristretto255_scalar_random() as Scalar;

          const session = oprfBlind(input);
          const outputA = oprfFinalize(
            session.blindState,
            blindEvaluate(sodium, keyA, session.blindedElement),
            input,
          );
          const outputB = oprfFinalize(
            session.blindState,
            blindEvaluate(sodium, keyB, session.blindedElement),
            input,
          );

          expect(outputA).not.toEqual(outputB);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("fail-closed server trust boundary", () => {
    it("rejects an evaluated element of any wrong length with InvalidInputError", () => {
      // The server response is attacker-influenced by definition. Length
      // validation happens at this trust boundary rather than deep inside
      // scalarmult, and it must hold for every wrong length.
      fc.assert(
        fc.property(
          fc
            .uint8Array({ minLength: 0, maxLength: 64 })
            .filter((bytes) => bytes.length !== 32),
          (badElement) => {
            const input = new TextEncoder().encode("boundary-check");
            const { blindState } = oprfBlind(input);
            expect(() =>
              oprfFinalize(blindState, badElement as EvaluatedElement, input),
            ).toThrow(InvalidInputError);
          },
        ),
        { numRuns: FC_MEDIUM },
      );
    });
  });

  describe("caller buffer ownership", () => {
    it("blind and finalize never mutate input, blind state, or evaluated element", () => {
      // The login flow holds the blind state across the network roundtrip
      // and may retry finalize after a transport error. Consuming or
      // zeroing these buffers in place would break that flow invisibly.
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 1, maxLength: 64 }), (input) => {
          const key = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
          const inputSnapshot = input.slice();

          const session = oprfBlind(input);
          expect(input).toEqual(inputSnapshot);

          const evaluated = blindEvaluate(sodium, key, session.blindedElement);
          const blindStateSnapshot = session.blindState.slice();
          const evaluatedSnapshot = evaluated.slice();

          oprfFinalize(session.blindState, evaluated, input);

          expect(input).toEqual(inputSnapshot);
          expect(session.blindState).toEqual(blindStateSnapshot);
          expect(evaluated).toEqual(evaluatedSnapshot);
        }),
        { numRuns: FC_MEDIUM },
      );
    });
  });
});

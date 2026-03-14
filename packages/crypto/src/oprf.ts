/**
 * Client-side OPRF operations per RFC 9497 using ristretto255.
 *
 * Implements Blind, Finalize, Lagrange interpolation for threshold OPRF
 * (2-of-2 Shamir split), and proactive share refresh. Server-side
 * BlindEvaluate is in packages/server (not isomorphic, uses sodium-native).
 *
 * References:
 *   RFC 9497 Section 3 (OPRF Protocol)
 *   https://datatracker.ietf.org/doc/html/rfc9497#section-3
 *   liboprf C reference implementation (SEC-140)
 */

/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> Scalar, RistrettoPoint) are the standard
   pattern for phantom-branded newtypes. The __brand field never exists at
   runtime; casts are validated by length checks at the consumption boundary. */

import { requireSodium } from "./sodium.js";
import { InvalidInputError } from "./errors.js";
import { concatBytes, scalarFromInt } from "./bytes.js";
import type {
  Scalar,
  RistrettoPoint,
  BlindResult,
  EvaluatedElement,
} from "./types.js";

/**
 * Blind the input for OPRF evaluation.
 *
 * 1. HashToGroup: expand input to 64 bytes via BLAKE2b, then map to ristretto255
 * 2. Generate random blinding scalar r
 * 3. Blinded element B = r * P
 *
 * @param input - Stretched password (Argon2id output) or other input to evaluate
 * @returns Blinded element to send to server, and blind state to keep locally
 * @throws InvalidInputError if input is empty
 */
export function oprfBlind(input: Uint8Array): BlindResult {
  const sodium = requireSodium();
  if (input.length === 0) {
    throw new InvalidInputError("OPRF input must not be empty");
  }

  // HashToGroup: expand input to 64 bytes for ristretto255_from_hash
  const expanded = sodium.crypto_generichash(
    sodium.crypto_core_ristretto255_HASHBYTES, // 64
    input,
  );
  const point = sodium.crypto_core_ristretto255_from_hash(expanded);

  // Random blinding scalar
  const blindScalar = sodium.crypto_core_ristretto255_scalar_random();

  // Blinded element = blindScalar * point
  const blindedElement = sodium.crypto_scalarmult_ristretto255(
    blindScalar,
    point,
  );

  return {
    blindedElement: blindedElement as RistrettoPoint,
    blindState: blindScalar as Scalar,
  };
}

/**
 * Finalize the OPRF output after receiving the server's evaluation.
 *
 * 1. Unblind: output_point = r^{-1} * evaluated
 * 2. Hash to fixed-length: oprfOutput = H(input || unblinded)
 *
 * @param blindState - The blinding scalar from oprfBlind
 * @param evaluatedElement - The server's response (key * blindedElement)
 * @param input - The original input (same bytes passed to oprfBlind)
 * @returns 32-byte OPRF output (deterministic for same input + server key)
 */
export function oprfFinalize(
  blindState: Scalar,
  evaluatedElement: EvaluatedElement,
  input: Uint8Array,
): Uint8Array {
  const sodium = requireSodium();

  // Unblind: r^{-1} * evaluated
  const rInverse = sodium.crypto_core_ristretto255_scalar_invert(blindState);
  const unblinded = sodium.crypto_scalarmult_ristretto255(
    rInverse,
    evaluatedElement,
  );

  // Hash to output: H(input || unblinded) per RFC 9497 Section 4.1
  const hashInput = concatBytes(input, unblinded);
  const oprfOutput = sodium.crypto_generichash(32, hashInput);

  // Zero intermediates (derived from key material)
  sodium.memzero(rInverse);
  sodium.memzero(unblinded);
  sodium.memzero(hashInput);

  return oprfOutput;
}

/**
 * Cached Lagrange coefficients for 2-of-2 threshold at x=0.
 * Computed lazily on first call (sodium must be initialized).
 *
 *   L_A(0) = (0 - 2) / (1 - 2) = 2
 *   L_B(0) = (0 - 1) / (2 - 1) = -1 mod group_order
 */
let lagrangeCoeffA: Uint8Array | null = null;
let lagrangeCoeffB: Uint8Array | null = null;

/** @internal Visible for testing: clear cached Lagrange coefficients when sodium is reset. */
export function _resetLagrangeCacheForTesting(): void {
  lagrangeCoeffA = null;
  lagrangeCoeffB = null;
}

function getLagrangeCoefficients(): {
  coeffA: Uint8Array;
  coeffB: Uint8Array;
} {
  if (lagrangeCoeffA && lagrangeCoeffB) {
    return { coeffA: lagrangeCoeffA, coeffB: lagrangeCoeffB };
  }
  const sodium = requireSodium();
  lagrangeCoeffA = scalarFromInt(2);
  lagrangeCoeffB = sodium.crypto_core_ristretto255_scalar_sub(
    new Uint8Array(32), // zero
    scalarFromInt(1),
  );
  return { coeffA: lagrangeCoeffA, coeffB: lagrangeCoeffB };
}

/**
 * Lagrange interpolation for threshold OPRF (2-of-2).
 * Combines partial evaluations from two servers into a single evaluated element.
 *
 * For evaluation points x_A=1, x_B=2, reconstruction at x=0:
 *   L_A(0) = (0 - 2) / (1 - 2) = -2 / -1 = 2
 *   L_B(0) = (0 - 1) / (2 - 1) = -1 / 1  = -1
 *   combined = 2 * partial_A + (-1) * partial_B
 *
 * @param partialA - Server A's evaluation (share_A * blindedElement)
 * @param partialB - Server B's evaluation (share_B * blindedElement)
 * @returns Combined evaluation equivalent to fullKey * blindedElement
 */
export function lagrangeInterpolate(
  partialA: RistrettoPoint,
  partialB: RistrettoPoint,
): RistrettoPoint {
  const sodium = requireSodium();
  const { coeffA, coeffB } = getLagrangeCoefficients();

  const scaledA = sodium.crypto_scalarmult_ristretto255(coeffA, partialA);
  const scaledB = sodium.crypto_scalarmult_ristretto255(coeffB, partialB);

  return sodium.crypto_core_ristretto255_add(
    scaledA,
    scaledB,
  ) as RistrettoPoint;
}

// --- Proactive Share Refresh (tested here, deployed later) ---
//
// Polynomial-aware refresh per SEC-201 (Herzberg et al. CRYPTO 1995).
// Each refresh generates a random "sharing of zero": a degree-(t-1)
// polynomial g(x) with g(0)=0. Adding g(x_i) to each share re-randomizes
// without changing the reconstructed secret at x=0. For our 2-of-2
// (t=2, degree-1): g(x) = b*x, so delta_A = b*1, delta_B = b*2.
// See also SEC-202 (Baron et al. 2015) for the formal "0-hole polynomial"
// construction.

/**
 * Generate a random scalar for proactive share refresh.
 * This scalar `b` defines a degree-1 zero polynomial g(x) = b*x where g(0)=0.
 * Each server's share delta is g(x_i), so the reconstructed secret (y-intercept)
 * is unchanged after refresh.
 */
export function generateRefreshScalar(): Scalar {
  const sodium = requireSodium();
  return sodium.crypto_core_ristretto255_scalar_random() as Scalar;
}

/**
 * Compute the refresh delta for a server at a given evaluation point.
 *
 * For a degree-1 zero polynomial g(x) = b*x:
 *   Server at x=1: delta = b
 *   Server at x=2: delta = 2b
 *
 * @param refreshScalar - The random scalar b (shared between both servers)
 * @param evaluationPoint - The server's Shamir evaluation point (1 or 2)
 * @returns The delta to add to this server's share
 */
export function computeRefreshDelta(
  refreshScalar: Scalar,
  evaluationPoint: number,
): Scalar {
  const sodium = requireSodium();
  if (evaluationPoint < 1 || evaluationPoint > 255) {
    throw new InvalidInputError(
      `Evaluation point must be 1..255, got ${String(evaluationPoint)}`,
    );
  }

  // Multiply scalar by the evaluation point: delta = b * x_i
  return sodium.crypto_core_ristretto255_scalar_mul(
    refreshScalar,
    scalarFromInt(evaluationPoint),
  ) as Scalar;
}

/**
 * Apply proactive refresh to a share.
 *   share_new = share_old + delta
 *
 * Invariant: Lagrange interpolation at x=0 of the refreshed shares still
 * recovers the original key k. This works because the deltas lie on a
 * degree-1 polynomial through the origin: g(0)=0.
 *
 * @param currentShare - The server's current key share
 * @param delta - The refresh delta for this server's evaluation point
 * @returns Updated share
 */
export function applyRefresh(currentShare: Scalar, delta: Scalar): Scalar {
  const sodium = requireSodium();
  return sodium.crypto_core_ristretto255_scalar_add(
    currentShare,
    delta,
  ) as Scalar;
}

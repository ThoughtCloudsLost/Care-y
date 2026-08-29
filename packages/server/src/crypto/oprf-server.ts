import {
  requireSodium,
  toRistrettoPoint,
  deriveTaggedShare,
  type RistrettoPoint,
  type Scalar,
} from "@care-y/crypto";
import { CryptoError } from "../errors.js";

const RISTRETTO_POINT_BYTES = 32;
const SCALAR_BYTES = 32;

/**
 * Performs server-side OPRF BlindEvaluate: share * blindedElement.
 *
 * Pure function: takes a share scalar and a blinded ristretto255 point,
 * returns the evaluated point. No side effects, no state.
 *
 * Uses libsodium-wrappers-sumo (WASM) via @care-y/crypto. sodium-native
 * does not expose ristretto255 primitives (no crypto_scalarmult_ristretto255).
 *
 * @param share - OPRF key share (ristretto255 scalar, 32 bytes)
 * @param blindedElement - Client's blinded element (ristretto255 point, 32 bytes)
 * @returns Evaluated element (branded RistrettoPoint, 32 bytes)
 * @throws CryptoError if inputs have wrong length or scalarmult fails
 */
export function blindEvaluate(
  share: Uint8Array,
  blindedElement: Uint8Array,
): RistrettoPoint {
  if (share.length !== SCALAR_BYTES) {
    throw new CryptoError(
      `OPRF share must be ${String(SCALAR_BYTES)} bytes, got ${String(share.length)}`,
    );
  }
  if (blindedElement.length !== RISTRETTO_POINT_BYTES) {
    throw new CryptoError(
      `Blinded element must be ${String(RISTRETTO_POINT_BYTES)} bytes, got ${String(blindedElement.length)}`,
    );
  }

  const sodium = requireSodium();
  try {
    return toRistrettoPoint(
      sodium.crypto_scalarmult_ristretto255(share, blindedElement),
    );
  } catch (err) {
    throw new CryptoError(
      `OPRF BlindEvaluate failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * Tagged OPRF BlindEvaluate: derives a per-tag working share from the
 * master share, evaluates, and zeroes the derived scalar.
 *
 * The master share never leaves this function. The derived scalar exists
 * only for the duration of the scalarmult and is zeroed in a finally block.
 *
 * @param masterShare - Master OPRF key share (ristretto255 scalar, 32 bytes)
 * @param tag - Public tag string (e.g. "volunteer:<userId>")
 * @param blindedElement - Client's blinded element (ristretto255 point, 32 bytes)
 * @returns Evaluated element (branded RistrettoPoint, 32 bytes)
 * @throws CryptoError if inputs have wrong length or scalarmult fails
 */
export function taggedBlindEvaluate(
  masterShare: Uint8Array,
  tag: string,
  blindedElement: Uint8Array,
): RistrettoPoint {
  if (masterShare.length !== SCALAR_BYTES) {
    throw new CryptoError(
      `OPRF master share must be ${String(SCALAR_BYTES)} bytes, got ${String(masterShare.length)}`,
    );
  }
  if (blindedElement.length !== RISTRETTO_POINT_BYTES) {
    throw new CryptoError(
      `Blinded element must be ${String(RISTRETTO_POINT_BYTES)} bytes, got ${String(blindedElement.length)}`,
    );
  }

  const derivedScalar: Scalar = deriveTaggedShare(masterShare, tag);
  try {
    return blindEvaluate(derivedScalar, blindedElement);
  } finally {
    // Zero the derived scalar so it never outlives the evaluation
    (derivedScalar as Uint8Array).fill(0);
  }
}

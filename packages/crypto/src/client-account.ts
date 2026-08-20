/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> Scalar, RistrettoPoint) are the
   standard pattern for phantom-branded newtypes. The __brand field never
   exists at runtime; length is validated at each function boundary. */

/**
 * Client-account key derivation for Encrypted Account channels.
 *
 * Maps a 64-byte OPRF output (the same pipeline volunteers use:
 * password -> Argon2id -> threshold OPRF -> finalize) to an account
 * keypair and a bearer auth token under client-specific HKDF labels.
 *
 * Derivation tree:
 *   oprfOutput (64 bytes, OPRF.Finalize output, RFC 9497 SHA-512)
 *     |- clientPrivate = ristretto255 scalar_reduce(
 *     |    hkdf(oprfOutput, "care-y-client-ecies-v1", 64))
 *     |- clientPublic  = clientPrivate * G
 *     |- authToken     = hkdf(oprfOutput, "care-y-client-auth-v1", 32)
 *
 * The keypair and auth token derive independently from the OPRF output
 * so neither reveals the other.
 *
 * References:
 *   SEC-004  RFC 5869 (HKDF for domain-separated key derivation)
 *   SEC-011  RFC 9496 (ristretto255 group, HashToScalar 64-byte reduce)
 *   SEC-053  libsodium ristretto255 API (scalar_reduce, scalarmult_base)
 *   SEC-054  libsodium memory management (memzero for intermediates)
 */

import { requireSodium } from "./sodium.js";
import { hkdf } from "./hkdf.js";
import { encodeLabel } from "./bytes.js";
import { zeroAll } from "./mem.js";
import { InvalidKeyError } from "./errors.js";
import { type Scalar, type RistrettoPoint, HKDF_LABELS } from "./types.js";
import type { PortalKeypair } from "./portal.js";

/** Derived keys for a client account: a ristretto255 keypair and a bearer auth token. */
export interface ClientAccountKeys {
  readonly keypair: PortalKeypair;
  readonly authToken: Uint8Array;
}

const OPRF_OUTPUT_BYTES = 64;

/**
 * Derive a client account keypair and auth token from an OPRF output.
 *
 * The OPRF output must be exactly 64 bytes (SHA-512 finalize output per
 * RFC 9497). The scalar is derived via the HashToScalar construction:
 * expand to 64 bytes via HKDF, then reduce modulo the group order. The
 * 64-byte expansion prevents modular reduction bias.
 *
 * The 64-byte HKDF expansion is zeroed in a finally block. The CALLER
 * zeroes oprfOutput, clientPrivate, and authToken when done.
 *
 * @param oprfOutput - 64-byte OPRF finalize output
 * @returns Account keypair and 32-byte bearer auth token
 * @throws InvalidKeyError if oprfOutput is not exactly 64 bytes
 */
export function deriveClientAccountKeys(
  oprfOutput: Uint8Array,
): ClientAccountKeys {
  if (oprfOutput.length !== OPRF_OUTPUT_BYTES) {
    throw new InvalidKeyError(
      `OPRF output must be ${String(OPRF_OUTPUT_BYTES)} bytes, got ${String(oprfOutput.length)}`,
    );
  }

  const sodium = requireSodium();
  let expanded: Uint8Array | null = null;

  try {
    // Keypair: 64-byte HKDF expansion + scalar reduce (deriveUniformScalar
    // construction under a client-specific label).
    expanded = hkdf(
      oprfOutput,
      encodeLabel(HKDF_LABELS.CLIENT_ACCOUNT_ECIES),
      64,
    );
    const clientPrivate = sodium.crypto_core_ristretto255_scalar_reduce(
      expanded,
    ) as Scalar;
    const clientPublic = sodium.crypto_scalarmult_ristretto255_base(
      clientPrivate,
    ) as RistrettoPoint;

    // Auth token: independent 32-byte HKDF derivation. Neither output
    // reveals the other because they use distinct labels.
    const authToken = hkdf(
      oprfOutput,
      encodeLabel(HKDF_LABELS.CLIENT_ACCOUNT_AUTH),
      32,
    );

    return {
      keypair: { clientPrivate, clientPublic },
      authToken,
    };
  } finally {
    zeroAll(expanded);
  }
}

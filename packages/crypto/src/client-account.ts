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

import { hkdf } from "./hkdf.js";
import { encodeLabel } from "./bytes.js";
import { zeroAll } from "./mem.js";
import { HKDF_LABELS } from "./types.js";
import { keypairFromOprfOutput, type PortalKeypair } from "./portal.js";

/** Derived keys for a client account: a ristretto255 keypair and a bearer auth token. */
export interface ClientAccountKeys {
  readonly keypair: PortalKeypair;
  readonly authToken: Uint8Array;
}

/**
 * Derive a client account keypair and auth token from an OPRF output.
 *
 * The OPRF output must be exactly 64 bytes (SHA-512 finalize output per
 * RFC 9497). The keypair is derived via keypairFromOprfOutput under the
 * client-account ECIES label. The auth token is an independent 32-byte
 * HKDF derivation under a separate label so neither reveals the other.
 *
 * clientPrivate is zeroed in the finally block if the auth token
 * derivation throws. The CALLER zeroes oprfOutput, clientPrivate, and
 * authToken when done.
 *
 * @param oprfOutput - 64-byte OPRF finalize output
 * @returns Account keypair and 32-byte bearer auth token
 * @throws InvalidInputError if oprfOutput is not exactly 64 bytes
 */
export function deriveClientAccountKeys(
  oprfOutput: Uint8Array,
): ClientAccountKeys {
  // keypairFromOprfOutput validates the 64-byte length and zeroes its
  // own HKDF expansion internally. clientPrivate must be zeroed here
  // if the subsequent auth token derivation throws.
  let clientPrivate: Uint8Array | null = null;

  try {
    const keypair = keypairFromOprfOutput(
      oprfOutput,
      HKDF_LABELS.CLIENT_ACCOUNT_ECIES,
    );
    clientPrivate = keypair.clientPrivate;

    const authToken = hkdf(
      oprfOutput,
      encodeLabel(HKDF_LABELS.CLIENT_ACCOUNT_AUTH),
      32,
    );

    // Success: caller takes ownership of clientPrivate, clear our ref
    clientPrivate = null;

    return { keypair, authToken };
  } finally {
    zeroAll(clientPrivate);
  }
}

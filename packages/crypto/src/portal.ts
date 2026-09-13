/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> Scalar, RistrettoPoint) are the
   standard pattern for phantom-branded newtypes. The __brand field never
   exists at runtime; length is validated at each function boundary. */

/**
 * Portal key derivation for Secure Link channels (ADR-091).
 *
 * Derives a channel identifier, bearer auth token, and the OPRF
 * pre-blind input from a 24-byte seed that lives only in the URL
 * fragment (RFC 3986: never sent to the server). The keypair is
 * derived from the OPRF finalize output, not from the seed directly.
 *
 * Derivation tree:
 *   seed (24 bytes, volunteer browser)
 *     |- channel_id  = hex(crypto_hash_sha512(seed)[0:24])
 *     |- auth        = hkdf(seed, "care-y-portal-auth-v1", 32)
 *     |- argonSalt   = hkdf(seed, "care-y-portal-salt-v1", 16)
 *     |- oprf input  = seed (no passphrase)
 *     |             or seed || Argon2id(passphrase, argonSalt)
 *     |- (blind, evaluate under channel tag, finalize) -> 64-byte oprf output
 *     |- clientPrivate = ristretto255 scalar_reduce(
 *     |                    hkdf(oprfOutput, "care-y-portal-ecies-v1", 64))
 *     |- clientPublic  = clientPrivate * G
 *
 * References:
 *   SEC-004  RFC 5869 (HKDF for domain-separated key derivation)
 *   SEC-009  RFC 9106 Section 4 (Argon2id SECOND RECOMMENDED parameters)
 *   SEC-011  RFC 9496 (ristretto255 group, HashToScalar 64-byte reduce)
 *   SEC-053  libsodium ristretto255 API (scalar_reduce, scalarmult_base)
 *   SEC-054  libsodium memory management (memzero for intermediates)
 */

import { requireSodium } from "./sodium.js";
import { hkdf } from "./hkdf.js";
import { concatBytes, encodeLabel } from "./bytes.js";
import { deriveAccountKey } from "./derive.js";
import { zeroAll } from "./mem.js";
import { InvalidInputError } from "./errors.js";
import { normalizeAlias } from "@care-y/shared";
import {
  type Scalar,
  type RistrettoPoint,
  toSalt,
  HKDF_LABELS,
} from "./types.js";

/** Seed size in bytes. 24 bytes = 192 bits, base64url encodes to 32 chars. */
export const PORTAL_SEED_BYTES = 24;

/** Known plaintext encrypted to clientPublic for key-check verification. */
export const PORTAL_KEY_CHECK = "care-y-portal-check-v1";

/** Minimum accepted seed length (the spec allows >= 18). */
const MIN_SEED_BYTES = 18;

/**
 * Normalize a passphrase string and encode it to bytes.
 *
 * Delegates to the shared normalizeAlias pipeline (NFKC, casefold,
 * trim, collapse whitespace) so a spoken passphrase retyped with
 * different casing, unicode form, or word spacing derives the same
 * keypair. Whitespace carries no entropy in a diceware phrase; word
 * identity and order are untouched.
 */
function normalizePassphrase(passphrase: string): Uint8Array {
  return encodeLabel(normalizeAlias(passphrase));
}

/**
 * Validate that a seed meets the minimum length requirement.
 * Throws InvalidInputError for truncated fragments.
 */
function assertSeedLength(seed: Uint8Array): void {
  if (seed.length < MIN_SEED_BYTES) {
    throw new InvalidInputError(
      `Portal seed must be at least ${String(MIN_SEED_BYTES)} bytes, got ${String(seed.length)}`,
    );
  }
}

/**
 * Generate a cryptographically random portal seed.
 *
 * @returns 24-byte random seed (PORTAL_SEED_BYTES)
 */
export function generatePortalSeed(): Uint8Array {
  const sodium = requireSodium();
  return sodium.randombytes_buf(PORTAL_SEED_BYTES);
}

/**
 * Derive the channel identifier from a portal seed.
 *
 * channel_id = hex(crypto_hash_sha512(seed)[0:24]), producing a
 * 48-character lowercase hex string. This is the parent-plan formula,
 * byte for byte.
 *
 * @param seed - Portal seed (>= 18 bytes)
 * @returns 48-char lowercase hex string
 * @throws InvalidInputError if seed is too short
 */
export function deriveChannelId(seed: Uint8Array): string {
  assertSeedLength(seed);
  const sodium = requireSodium();
  const hash = sodium.crypto_hash_sha512(seed);
  const prefix = hash.subarray(0, 24);
  const hex = sodium.to_hex(prefix);
  sodium.memzero(hash);
  return hex;
}

/**
 * Derive the channel auth token from a portal seed.
 *
 * auth = hkdf(seed, "care-y-portal-auth-v1", 32). Presented by the
 * portal page on every server call as proof of URL possession.
 *
 * @param seed - Portal seed (>= 18 bytes)
 * @returns 32-byte auth token
 * @throws InvalidInputError if seed is too short
 */
export function deriveChannelAuth(seed: Uint8Array): Uint8Array {
  assertSeedLength(seed);
  return hkdf(seed, encodeLabel(HKDF_LABELS.PORTAL_AUTH), 32);
}

/**
 * Hash a channel auth token for server-side storage and comparison.
 *
 * Uses unkeyed BLAKE2b (crypto_generichash with hash length 32).
 * The raw token is 32 random bytes, so preimage resistance holds
 * without a key. Computed browser-side at registration and server-side
 * per request for timing-safe comparison.
 *
 * @param auth - 32-byte auth token from deriveChannelAuth
 * @returns 32-byte BLAKE2b hash
 */
export function hashChannelAuth(auth: Uint8Array): Uint8Array {
  const sodium = requireSodium();
  return sodium.crypto_generichash(32, auth);
}

/** The portal keypair: a ristretto255 scalar and its corresponding point. */
export interface PortalKeypair {
  readonly clientPrivate: Scalar;
  readonly clientPublic: RistrettoPoint;
}

/**
 * Stretch a passphrase using Argon2id with a seed-derived salt.
 *
 * Used by portalOprfInput to fold the passphrase into the OPRF
 * pre-blind input (ADR-091).
 *
 * @param seed - Portal seed (>= 18 bytes, already validated by caller)
 * @param passphrase - Non-empty passphrase string
 * @returns Argon2id output (32 bytes). Caller must zero when done.
 */
function stretchPassphrase(seed: Uint8Array, passphrase: string): Uint8Array {
  let passphraseBytes: Uint8Array | null = null;
  let saltRaw: Uint8Array | null = null;

  try {
    passphraseBytes = normalizePassphrase(passphrase);
    saltRaw = hkdf(seed, encodeLabel(HKDF_LABELS.PORTAL_SALT), 16);
    const salt = toSalt(saltRaw);
    return deriveAccountKey(passphraseBytes, salt);
  } finally {
    zeroAll(passphraseBytes, saltRaw);
  }
}

// --- ADR-091: OPRF-routed portal derivation ---

const OPRF_OUTPUT_BYTES = 64;

/**
 * Build the OPRF pre-blind input for a portal channel.
 *
 * For plain links: returns a copy of the seed.
 * For passphrase links: returns seed || Argon2id(normalized passphrase, argonSalt),
 * using the same salt derivation, normalization, and Argon2id stretch as
 * stretchPassphrase.
 *
 * The returned buffer is owned by the caller, who must zero it after
 * passing it to oprfBlind. The Argon2id intermediate (if any) is zeroed
 * in a finally block.
 *
 * @param seed - Portal seed (>= 18 bytes)
 * @param passphrase - Optional passphrase spoken on the verification call
 * @returns Pre-blind input buffer. Caller zeroes after use.
 * @throws InvalidInputError if seed is too short
 */
export function portalOprfInput(
  seed: Uint8Array,
  passphrase?: string,
): Uint8Array {
  assertSeedLength(seed);

  let stretched: Uint8Array | null = null;

  try {
    if (passphrase !== undefined && passphrase.length > 0) {
      stretched = stretchPassphrase(seed, passphrase);
      return concatBytes(seed, stretched);
    }
    return seed.slice();
  } finally {
    zeroAll(stretched);
  }
}

/**
 * Derive a ristretto255 keypair from a 64-byte OPRF finalize output
 * under the given HKDF label.
 *
 * Shared implementation behind derivePortalKeypairFromOprf and
 * deriveClientAccountKeys. The label provides HKDF domain separation
 * so identical OPRF outputs under different labels produce independent
 * keypairs.
 *
 * The 64-byte HKDF expansion is zeroed in a finally block. The CALLER
 * zeroes oprfOutput and clientPrivate when done.
 *
 * @param oprfOutput - 64-byte OPRF finalize output (SHA-512 per RFC 9497)
 * @param label - HKDF info label for domain separation
 * @returns ristretto255 keypair (clientPrivate, clientPublic)
 * @throws InvalidInputError if oprfOutput is not exactly 64 bytes
 */
export function keypairFromOprfOutput(
  oprfOutput: Uint8Array,
  label: string,
): PortalKeypair {
  if (oprfOutput.length !== OPRF_OUTPUT_BYTES) {
    throw new InvalidInputError(
      `OPRF output must be ${String(OPRF_OUTPUT_BYTES)} bytes, got ${String(oprfOutput.length)}`,
    );
  }

  const sodium = requireSodium();
  let expanded: Uint8Array | null = null;

  try {
    expanded = hkdf(oprfOutput, encodeLabel(label), 64);
    const clientPrivate = sodium.crypto_core_ristretto255_scalar_reduce(
      expanded,
    ) as Scalar;
    const clientPublic = sodium.crypto_scalarmult_ristretto255_base(
      clientPrivate,
    ) as RistrettoPoint;

    return { clientPrivate, clientPublic };
  } finally {
    zeroAll(expanded);
  }
}

/**
 * Derive a ristretto255 keypair from a 64-byte OPRF finalize output
 * under the portal ECIES label.
 *
 * The HKDF label "care-y-portal-ecies-v1" provides domain separation
 * from the client-account derivation, which uses a distinct label for
 * the same construction. Changing the label invalidates all previously
 * derived portal keypairs.
 *
 * @param oprfOutput - 64-byte OPRF finalize output (SHA-512 per RFC 9497)
 * @returns ristretto255 keypair (clientPrivate, clientPublic)
 * @throws InvalidInputError if oprfOutput is not exactly 64 bytes
 */
export function derivePortalKeypairFromOprf(
  oprfOutput: Uint8Array,
): PortalKeypair {
  return keypairFromOprfOutput(oprfOutput, HKDF_LABELS.PORTAL_ECIES);
}

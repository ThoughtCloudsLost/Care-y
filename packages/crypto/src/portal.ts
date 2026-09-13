/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> Scalar, RistrettoPoint) are the
   standard pattern for phantom-branded newtypes. The __brand field never
   exists at runtime; length is validated at each function boundary. */

/**
 * Portal key derivation for Secure Link channels.
 *
 * Derives a channel identifier, bearer auth token, and ristretto255
 * keypair from a single 24-byte seed that lives only in the URL
 * fragment (RFC 3986: never sent to the server).
 *
 * Derivation tree:
 *   seed (24 bytes, volunteer browser)
 *     |- channel_id  = hex(crypto_hash_sha512(seed)[0:24])
 *     |- auth        = hkdf(seed, "care-y-portal-auth-v1", 32)
 *     |- argonSalt   = hkdf(seed, "care-y-portal-salt-v1", 16)
 *     |- keypair ikm = seed (no passphrase)
 *     |             or seed || Argon2id(passphrase, argonSalt) (with passphrase)
 *     |- clientPrivate = ristretto255 scalar_reduce(
 *     |                    hkdf(ikm, "care-y-portal-ecies-v1", 64))
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
 * NFKC-normalize, lowercase, trim, and collapse whitespace in a
 * passphrase string. Mirrors the full normalization in
 * shared/src/utils/normalize-alias.ts so a spoken passphrase retyped
 * with different casing, unicode form, or word spacing still derives
 * the same keypair. Whitespace carries no entropy in a diceware
 * phrase; word identity and order are untouched.
 */
function normalizePassphrase(passphrase: string): Uint8Array {
  const normalized = passphrase
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
  return encodeLabel(normalized);
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
  const hex = Array.from(prefix, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
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
 * Derive a ristretto255 keypair from a portal seed and optional passphrase.
 *
 * Without passphrase: ikm = seed.
 * With passphrase: ikm = seed || Argon2id(normalizedPassphrase, argonSalt)
 * where argonSalt = toSalt(hkdf(seed, "care-y-portal-salt-v1", 16)).
 *
 * The scalar is derived via the HashToScalar construction (RFC 9497
 * Section 4.1): expand to 64 bytes via HKDF, then reduce modulo the
 * group order. The 64-byte expansion prevents modular reduction bias.
 *
 * Intermediate key material (ikm, Argon2id output, 64-byte expansion)
 * is zeroed in a finally block. The CALLER zeroes seed and clientPrivate.
 *
 * @param seed - Portal seed (>= 18 bytes)
 * @param passphrase - Optional passphrase spoken on the verification call
 * @returns ristretto255 keypair (clientPrivate, clientPublic)
 * @throws InvalidInputError if seed is too short
 */
export function derivePortalKeypair(
  seed: Uint8Array,
  passphrase?: string,
): PortalKeypair {
  assertSeedLength(seed);
  const sodium = requireSodium();

  let ikm: Uint8Array | null = null;
  let argon2Output: Uint8Array | null = null;
  let expanded: Uint8Array | null = null;

  try {
    if (passphrase !== undefined && passphrase.length > 0) {
      const passphraseBytes = normalizePassphrase(passphrase);
      const saltRaw = hkdf(seed, encodeLabel(HKDF_LABELS.PORTAL_SALT), 16);
      const salt = toSalt(saltRaw);
      argon2Output = deriveAccountKey(passphraseBytes, salt);
      ikm = concatBytes(seed, argon2Output);
    } else {
      ikm = seed.slice();
    }

    expanded = hkdf(ikm, encodeLabel(HKDF_LABELS.PORTAL_ECIES), 64);
    const clientPrivate = sodium.crypto_core_ristretto255_scalar_reduce(
      expanded,
    ) as Scalar;
    const clientPublic = sodium.crypto_scalarmult_ristretto255_base(
      clientPrivate,
    ) as RistrettoPoint;

    return { clientPrivate, clientPublic };
  } finally {
    zeroAll(ikm, argon2Output, expanded);
  }
}

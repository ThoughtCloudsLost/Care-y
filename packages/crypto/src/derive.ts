/* eslint-disable @typescript-eslint/no-unsafe-type-assertion --
   Branded type casts (Uint8Array -> SymmetricKey, Scalar, etc.) are the
   standard pattern for phantom-branded newtypes. The __brand field never
   exists at runtime; length is validated at each function boundary. */

/**
 * Key derivation tree for CARE-Y's split-key E2EE.
 *
 * password -> Argon2id(salt) -> stretched -> OPRF -> oprfOutput
 *   -> HKDF("care-y-master-v2") -> masterKey
 *      -> HKDF("care-y-ecies-private-v1") -> volPrivate -> volPublic
 *      -> HKDF("care-y-org-key-unwrap-v1") -> orgUnwrapKey
 *
 * Each HKDF step uses a distinct label for cryptographic domain separation.
 * The pqShared parameter in deriveMasterKey is a future extension point
 * for ML-KEM-768 hybrid key agreement (H-016).
 *
 * References:
 *   SEC-004  RFC 5869 (HKDF for domain-separated key derivation)
 *   SEC-008  RFC 9106 Section 3.1 (Argon2id salt requirements)
 *   SEC-009  RFC 9106 Section 4 (Argon2id SECOND RECOMMENDED parameters)
 *   SEC-011  RFC 9496 (ristretto255 group for volunteer keypair)
 *   SEC-053  libsodium ristretto255 API (scalar_reduce, scalarmult_base)
 *   SEC-054  libsodium memory management (memzero for expanded key material)
 *   SEC-155  Jarecki et al., TOPPSS (ACNS 2017, threshold OPRF key derivation)
 *   SEC-164  Argon2 reference specification (brute-force cost analysis)
 *   docs/design-ref/crypto-architecture-v2.md
 */

import { requireSodium } from "./sodium.js";
import { hkdf, hkdfDerive32 } from "./hkdf.js";
import { zeroAll } from "./mem.js";
import { InvalidKeyError } from "./errors.js";
import { assertInputLength } from "./validation.js";
import { concatBytes, encodeLabel } from "./bytes.js";
import {
  type Scalar,
  type RistrettoPoint,
  type SymmetricKey,
  type Salt,
  type Argon2Params,
  ARGON2_MIN_PARAMS,
  ARGON2_TEST_PARAMS,
  HKDF_LABELS,
} from "./types.js";

/**
 * Enforce minimum Argon2id parameters to prevent server-side downgrades.
 * A compromised server could send weaker params to make brute-force cheaper.
 * Each field is clamped to at least the RFC 9106 Section 4 SECOND RECOMMENDED value.
 *
 * When VITE_E2E_FAST_KDF is set at build time, the floor drops to ARGON2_TEST_PARAMS
 * (1 MB / 1 iter) so E2E tests finish in seconds instead of minutes.
 * Vite statically replaces the env check; the production minifier eliminates
 * the test branch entirely (SEC-009, RFC 9106 Section 4).
 */
function enforceArgon2Floor(serverParams?: Argon2Params): Argon2Params {
  const floor =
    /* v8 ignore next -- build-time branch: Vite replaces statically */
    import.meta.env.VITE_E2E_FAST_KDF === "1"
      ? ARGON2_TEST_PARAMS
      : ARGON2_MIN_PARAMS;

  return {
    memoryKiB: Math.max(
      serverParams?.memoryKiB ?? floor.memoryKiB,
      floor.memoryKiB,
    ),
    iterations: Math.max(
      serverParams?.iterations ?? floor.iterations,
      floor.iterations,
    ),
  };
}

/**
 * Argon2id key derivation (password stretching).
 *
 * Enforces hardcoded minimum params (RFC 9106 Section 4, SECOND RECOMMENDED).
 * If serverParams are weaker than the floor, the floor is used instead.
 * This prevents a compromised server from downgrading key derivation strength.
 *
 * @param password  - Raw password bytes (caller converts from string via TextEncoder)
 * @param salt      - 16-byte Argon2id salt
 * @param serverParams - Optional server-suggested params (floor-enforced)
 * @returns 32-byte stretched key
 * @throws InvalidInputError if salt is wrong length
 */
export function deriveAccountKey(
  password: Uint8Array,
  salt: Salt,
  serverParams?: Argon2Params,
): Uint8Array {
  const sodium = requireSodium();

  assertInputLength(salt, sodium.crypto_pwhash_SALTBYTES, "Salt");

  const params = enforceArgon2Floor(serverParams);

  return sodium.crypto_pwhash(
    32,
    password,
    salt,
    params.iterations,
    params.memoryKiB * 1024, // libsodium expects bytes, not KiB
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  );
}

/**
 * Derive masterKey from OPRF output.
 * masterKey = HKDF-SHA512(oprfOutput [|| pqShared], "care-y-master-v2")
 *
 * @param oprfOutput - 64-byte OPRF finalize output (SHA-512 per RFC 9497)
 * @param pqShared   - Optional ML-KEM shared secret for hybrid (future, H-016)
 * @returns 32-byte master key
 * @throws InvalidKeyError if oprfOutput is wrong length
 */
export function deriveMasterKey(
  oprfOutput: Uint8Array,
  pqShared?: Uint8Array,
): SymmetricKey {
  if (oprfOutput.length !== 64) {
    throw new InvalidKeyError("OPRF output must be 64 bytes");
  }

  // Always derive from an owned ikm copy so this function alone zeroes it,
  // whether or not pqShared is present. slice() copies the OPRF output rather
  // than aliasing it, so the caller keeps ownership of oprfOutput (and pqShared)
  // and zeroes those buffers itself.
  const ikm = pqShared ? concatBytes(oprfOutput, pqShared) : oprfOutput.slice();

  try {
    return hkdfDerive32(ikm, HKDF_LABELS.MASTER_KEY) as SymmetricKey;
  } finally {
    zeroAll(ikm);
  }
}

/**
 * Derive a uniformly distributed ristretto255 scalar from key material.
 *
 * Expands to 64 bytes via HKDF then reduces modulo the group order.
 * The 64-byte expansion (double the scalar size) prevents modular
 * reduction bias, matching the HashToScalar construction in
 * RFC 9497 Section 4.1.
 */
function deriveUniformScalar(ikm: Uint8Array, label: string): Scalar {
  const sodium = requireSodium();
  const expanded = hkdf(ikm, encodeLabel(label), 64);
  const scalar = sodium.crypto_core_ristretto255_scalar_reduce(expanded);
  sodium.memzero(expanded);
  return scalar as Scalar;
}

/**
 * Derive volunteer private key (ristretto255 scalar) from masterKey.
 */
export function deriveVolunteerPrivateKey(masterKey: SymmetricKey): Scalar {
  return deriveUniformScalar(masterKey, HKDF_LABELS.ECIES_PRIVATE);
}

/**
 * Derive volunteer public key from private key.
 * volPublic = volPrivate * G (ristretto255 base point multiplication)
 */
export function deriveVolunteerPublicKey(volPrivate: Scalar): RistrettoPoint {
  const sodium = requireSodium();
  return sodium.crypto_scalarmult_ristretto255_base(
    volPrivate,
  ) as RistrettoPoint;
}

/**
 * Derive org unwrap key from masterKey.
 * orgUnwrapKey = HKDF-SHA512(masterKey, "care-y-org-key-unwrap-v1")
 */
export function deriveOrgUnwrapKey(masterKey: SymmetricKey): SymmetricKey {
  return hkdfDerive32(masterKey, HKDF_LABELS.ORG_UNWRAP) as SymmetricKey;
}

/**
 * Generate a random 16-byte Argon2id salt.
 */
export function generateSalt(): Salt {
  const sodium = requireSodium();
  return sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES) as Salt;
}

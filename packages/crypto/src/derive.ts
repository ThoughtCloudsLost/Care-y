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
 *   RFC 9106 Section 4 (Argon2id recommended parameters)
 *   RFC 5869 (HKDF)
 *   docs/design-ref/crypto-architecture-v2.md
 */

import { requireSodium } from "./sodium.js";
import { hkdfDerive32 } from "./hkdf.js";
import { InvalidKeyError, InvalidInputError } from "./errors.js";
import {
  type Scalar,
  type RistrettoPoint,
  type SymmetricKey,
  type Salt,
  type Argon2Params,
  ARGON2_MIN_PARAMS,
  HKDF_LABELS,
} from "./types.js";

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

  if (salt.length !== sodium.crypto_pwhash_SALTBYTES) {
    throw new InvalidInputError(
      `Salt must be ${String(sodium.crypto_pwhash_SALTBYTES)} bytes`,
    );
  }

  // Enforce minimums: use max(server, minimum) for each param
  const params: Argon2Params = {
    memoryKiB: Math.max(
      serverParams?.memoryKiB ?? ARGON2_MIN_PARAMS.memoryKiB,
      ARGON2_MIN_PARAMS.memoryKiB,
    ),
    iterations: Math.max(
      serverParams?.iterations ?? ARGON2_MIN_PARAMS.iterations,
      ARGON2_MIN_PARAMS.iterations,
    ),
    parallelism: Math.max(
      serverParams?.parallelism ?? ARGON2_MIN_PARAMS.parallelism,
      ARGON2_MIN_PARAMS.parallelism,
    ),
  };

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
 * @param oprfOutput - 32-byte OPRF finalize output
 * @param pqShared   - Optional ML-KEM shared secret for hybrid (future, H-016)
 * @returns 32-byte master key
 * @throws InvalidKeyError if oprfOutput is wrong length
 */
export function deriveMasterKey(
  oprfOutput: Uint8Array,
  pqShared?: Uint8Array,
): SymmetricKey {
  if (oprfOutput.length !== 32) {
    throw new InvalidKeyError("OPRF output must be 32 bytes");
  }

  let ikm: Uint8Array;
  if (pqShared) {
    ikm = new Uint8Array(oprfOutput.length + pqShared.length);
    ikm.set(oprfOutput, 0);
    ikm.set(pqShared, oprfOutput.length);
  } else {
    ikm = oprfOutput;
  }

  const result = hkdfDerive32(ikm, HKDF_LABELS.MASTER_KEY);

  if (pqShared) {
    const sodium = requireSodium();
    sodium.memzero(ikm);
  }

  return result as SymmetricKey;
}

/**
 * Derive volunteer private key (ristretto255 scalar) from masterKey.
 * volPrivate = HKDF-SHA512(masterKey, "care-y-ecies-private-v1")
 */
export function deriveVolunteerPrivateKey(masterKey: SymmetricKey): Scalar {
  return hkdfDerive32(
    masterKey,
    HKDF_LABELS.ECIES_PRIVATE,
  ) as unknown as Scalar;
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
  return hkdfDerive32(
    masterKey,
    HKDF_LABELS.ORG_UNWRAP,
  ) as unknown as SymmetricKey;
}

/**
 * Generate a random 16-byte Argon2id salt.
 */
export function generateSalt(): Salt {
  const sodium = requireSodium();
  return sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES) as Salt;
}

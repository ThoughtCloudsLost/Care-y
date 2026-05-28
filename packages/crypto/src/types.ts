/**
 * Branded Uint8Array newtypes for type safety across the crypto API.
 *
 * Phantom-branded: the __brand field never exists at runtime.
 * Casting is via `as Scalar`, validated at the boundary by length checks
 * in each consuming function.
 */

/** 32-byte ristretto255 scalar (private key, OPRF share, blinding factor) */
export type Scalar = Uint8Array & { readonly __brand: "Scalar" };

/** 32-byte ristretto255 compressed point (public key, blinded element, ephemeral point) */
export type RistrettoPoint = Uint8Array & {
  readonly __brand: "RistrettoPoint";
};

/** 32-byte symmetric key (masterKey, tk, orgUnwrapKey, branding key) */
export type SymmetricKey = Uint8Array & { readonly __brand: "SymmetricKey" };

/** 16-byte Argon2id salt */
export type Salt = Uint8Array & { readonly __brand: "Salt" };

/** 24-byte crypto_secretbox nonce */
export type Nonce = Uint8Array & { readonly __brand: "Nonce" };

/** Opaque ciphertext blob (nonce || ciphertext) */
export type Ciphertext = Uint8Array & { readonly __brand: "Ciphertext" };

/** OPRF Blind output: the blinded element + state needed for Finalize */
export interface BlindResult {
  readonly blindedElement: RistrettoPoint;
  readonly blindState: Scalar;
}

/** OPRF server evaluation output (used by the OPRF server infrastructure) */
export type EvaluatedElement = RistrettoPoint;

/** ECIES encrypted wrap: ephemeral point + nonce + ciphertext */
export interface EciesOutput {
  readonly ephemeralPoint: RistrettoPoint;
  readonly nonce: Nonce;
  readonly ciphertext: Uint8Array;
}

/** Escrow encrypted blob: salt + nonce + ciphertext */
export interface EscrowBlob {
  readonly salt: Salt;
  readonly nonce: Nonce;
  readonly ciphertext: Uint8Array;
}

/** Argon2id parameters (hardcoded minimums enforced at use site) */
export interface Argon2Params {
  readonly memoryKiB: number;
  readonly iterations: number;
  readonly parallelism: number;
}

/** Minimum Argon2id params (SECOND RECOMMENDED, RFC 9106 Section 4) */
export const ARGON2_MIN_PARAMS: Argon2Params = {
  memoryKiB: 65536, // 64 MB
  iterations: 3,
  parallelism: 4,
} as const;

/** Minimal Argon2id params for E2E tests (gated by VITE_E2E_FAST_KDF, dead-code eliminated in prod) */
export const ARGON2_TEST_PARAMS: Argon2Params = {
  memoryKiB: 1024, // 1 MB
  iterations: 1,
  parallelism: 1,
} as const;

/** Escrow-specific Argon2id params (heavier, admin workstation only) */
export const ARGON2_ESCROW_PARAMS: Argon2Params = {
  memoryKiB: 262144, // 256 MB
  iterations: 4,
  parallelism: 4,
} as const;

/** HKDF domain separation labels (centralized to prevent typos) */
export const HKDF_LABELS = {
  MASTER_KEY: "care-y-master-v2",
  ECIES_PRIVATE: "care-y-ecies-private-v1",
  ORG_UNWRAP: "care-y-org-key-unwrap-v1",
  ECIES_WRAP: "care-y-ecies-wrap-v1",
} as const;

/** BLAKE2b domain separation label for branding key derivation */
export const BRANDING_LABEL = "care-y-branding-v1";

// --- Branded type constructors ---
// Validate byte length and return the branded type. Use these at trust
// boundaries (IPC, deserialization) instead of raw `as` casts.

const RISTRETTO_POINT_BYTES = 32;
const SCALAR_BYTES = 32;
const SYMMETRIC_KEY_BYTES = 32;
const SALT_BYTES = 16;
const NONCE_BYTES = 24;

/** Validates a 32-byte buffer and returns it as a branded RistrettoPoint. */
export function toRistrettoPoint(buf: Uint8Array): RistrettoPoint {
  if (buf.length !== RISTRETTO_POINT_BYTES) {
    throw new RangeError(
      `RistrettoPoint must be ${String(RISTRETTO_POINT_BYTES)} bytes, got ${String(buf.length)}`,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- length-checked branded newtype constructor
  return buf as RistrettoPoint;
}

/** Validates a 32-byte buffer and returns it as a branded Scalar. */
export function toScalar(buf: Uint8Array): Scalar {
  if (buf.length !== SCALAR_BYTES) {
    throw new RangeError(
      `Scalar must be ${String(SCALAR_BYTES)} bytes, got ${String(buf.length)}`,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- length-checked branded newtype constructor
  return buf as Scalar;
}

/** Validates a 32-byte buffer and returns it as a branded SymmetricKey. */
export function toSymmetricKey(buf: Uint8Array): SymmetricKey {
  if (buf.length !== SYMMETRIC_KEY_BYTES) {
    throw new RangeError(
      `SymmetricKey must be ${String(SYMMETRIC_KEY_BYTES)} bytes, got ${String(buf.length)}`,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- length-checked branded newtype constructor
  return buf as SymmetricKey;
}

/** Validates a 16-byte buffer and returns it as a branded Salt. */
export function toSalt(buf: Uint8Array): Salt {
  if (buf.length !== SALT_BYTES) {
    throw new RangeError(
      `Salt must be ${String(SALT_BYTES)} bytes, got ${String(buf.length)}`,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- length-checked branded newtype constructor
  return buf as Salt;
}

/** Validates a 24-byte buffer and returns it as a branded Nonce. */
export function toNonce(buf: Uint8Array): Nonce {
  if (buf.length !== NONCE_BYTES) {
    throw new RangeError(
      `Nonce must be ${String(NONCE_BYTES)} bytes, got ${String(buf.length)}`,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- length-checked branded newtype constructor
  return buf as Nonce;
}

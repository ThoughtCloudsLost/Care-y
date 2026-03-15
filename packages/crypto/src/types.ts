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

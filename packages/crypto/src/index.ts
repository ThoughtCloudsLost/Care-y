// @care-y/crypto - barrel export
// Isomorphic encryption library (browser + Node) using libsodium.

// --- Initialization ---
// Test-only helpers (_resetSodiumForTesting, etc.) are in "./testing.js"
export { getSodium, requireSodium, type SodiumBackend } from "./sodium.js";

// --- Types ---
export type {
  Scalar,
  RistrettoPoint,
  SymmetricKey,
  Salt,
  Nonce,
  Ciphertext,
  BlindResult,
  EvaluatedElement,
  EciesOutput,
  EscrowBlob,
  Argon2Params,
} from "./types.js";
export {
  ARGON2_MIN_PARAMS,
  ARGON2_ESCROW_PARAMS,
  HKDF_LABELS,
  BRANDING_LABEL,
} from "./types.js";

// --- Errors ---
export {
  CryptoError,
  DecryptionError,
  InvalidKeyError,
  InvalidInputError,
  SodiumNotReadyError,
} from "./errors.js";

// --- Serialization ---
export { encode, decode } from "./serialize.js";

// --- HKDF ---
export { hkdf, hkdfDerive32 } from "./hkdf.js";

// --- OPRF (client-side) ---
export {
  oprfBlind,
  oprfFinalize,
  lagrangeInterpolate,
  generateRefreshScalar,
  computeRefreshDelta,
  applyRefresh,
} from "./oprf.js";

// --- Key Derivation ---
export {
  deriveAccountKey,
  deriveMasterKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  deriveOrgUnwrapKey,
  generateSalt,
} from "./derive.js";

// --- ECIES ---
export { eciesEncrypt, eciesDecrypt } from "./ecies.js";

// --- Content Encryption ---
export {
  generateContentKey,
  encryptContent,
  decryptContent,
} from "./content.js";

// --- Blob Encryption ---
export { encryptBlob, decryptBlob } from "./blob.js";

// --- Org Key Wrapping ---
export { wrapKey, unwrapKey } from "./keywrap.js";

// --- Branding ---
export {
  deriveClientBrandingKey,
  encryptClientBranding,
  decryptClientBranding,
} from "./branding.js";

// --- Escrow ---
export {
  encryptWithPassphrase,
  decryptWithPassphrase,
  serializeEscrowBlob,
  deserializeEscrowBlob,
} from "./escrow.js";

// --- RFC 9497 / 9380 internals (testing + server-side OPRF) ---
export {
  expandMessageXMD,
  HASH_TO_GROUP_DST,
  buildFinalizeInput,
} from "./rfc.js";

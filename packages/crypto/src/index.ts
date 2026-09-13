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
  ARGON2_TEST_PARAMS,
  HKDF_LABELS,
  BRANDING_LABEL,
  toRistrettoPoint,
  toScalar,
  toSymmetricKey,
  toSalt,
  toNonce,
} from "./types.js";

// --- Errors ---
export {
  CryptoError,
  DecryptionError,
  InvalidKeyError,
  InvalidInputError,
  SodiumNotReadyError,
} from "./errors.js";

// --- Validation ---
export { assertKeyLength, assertInputLength } from "./validation.js";

// --- Memory management ---
export { zeroAll } from "./mem.js";

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
  buildContentAad,
  followupSlot,
  blobSlot,
  filenameSlot,
  cursorSlot,
  fieldSlot,
} from "./content.js";

// --- Blob Encryption ---
export { encryptBlob, decryptBlob } from "./blob.js";

// --- Org Key Wrapping ---
export { wrapKey, unwrapKey } from "./keywrap.js";

// --- Org Keypair + Sealed Box ---
export { generateOrgKeypair, sealForOrgKey } from "./org-keypair.js";

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

// --- Portal Key Derivation ---
export {
  PORTAL_SEED_BYTES,
  PORTAL_KEY_CHECK,
  generatePortalSeed,
  deriveChannelId,
  deriveChannelAuth,
  hashChannelAuth,
  derivePortalKeypair,
  type PortalKeypair,
} from "./portal.js";

// --- Client Account Key Derivation ---
export {
  deriveClientAccountKeys,
  type ClientAccountKeys,
} from "./client-account.js";

// --- RFC 9497 / 9380 internals (testing + server-side OPRF) ---
export {
  expandMessageXMD,
  HASH_TO_GROUP_DST,
  buildFinalizeInput,
} from "./rfc.js";

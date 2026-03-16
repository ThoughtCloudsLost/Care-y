import { describe, it, expect, beforeAll } from "vitest";
import {
  // Initialization
  getSodium,
  requireSodium,

  // Types (runtime values)
  ARGON2_MIN_PARAMS,
  ARGON2_ESCROW_PARAMS,
  HKDF_LABELS,
  BRANDING_LABEL,

  // Errors
  CryptoError,
  DecryptionError,
  InvalidKeyError,
  InvalidInputError,
  SodiumNotReadyError,

  // Serialization
  encode,
  decode,

  // HKDF
  hkdf,
  hkdfDerive32,

  // OPRF
  oprfBlind,
  oprfFinalize,
  lagrangeInterpolate,
  generateRefreshScalar,
  computeRefreshDelta,
  applyRefresh,

  // Key Derivation
  deriveAccountKey,
  deriveMasterKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  deriveOrgUnwrapKey,
  generateSalt,

  // ECIES
  eciesEncrypt,
  eciesDecrypt,

  // Content
  generateContentKey,
  encryptContent,
  decryptContent,

  // Blob
  encryptBlob,
  decryptBlob,

  // Key Wrapping
  wrapKey,
  unwrapKey,

  // Branding
  deriveClientBrandingKey,
  encryptClientBranding,
  decryptClientBranding,

  // Escrow
  encryptWithPassphrase,
  decryptWithPassphrase,
  serializeEscrowBlob,
  deserializeEscrowBlob,
} from "./index.js";
import {
  _resetSodiumForTesting,
  type SodiumBackend as DirectSodiumBackend,
} from "./sodium.js";
import type { Scalar, RistrettoPoint, SymmetricKey } from "./types.js";

describe("barrel export", () => {
  let sodium: DirectSodiumBackend;

  beforeAll(async () => {
    _resetSodiumForTesting();
    sodium = await getSodium();
  });

  // These existence checks guard the public API surface of @care-y/crypto.
  // Justified: consumers import these symbols by name. Accidental removal
  // of a re-export during refactoring silently breaks downstream packages
  // at runtime (TypeScript catches it at build, but only if someone builds).
  describe("exported functions are defined", () => {
    it("initialization functions", () => {
      expect(typeof getSodium).toBe("function");
      expect(typeof requireSodium).toBe("function");
    });

    it("serialization functions", () => {
      expect(typeof encode).toBe("function");
      expect(typeof decode).toBe("function");
    });

    it("HKDF functions", () => {
      expect(typeof hkdf).toBe("function");
      expect(typeof hkdfDerive32).toBe("function");
    });

    it("OPRF functions", () => {
      expect(typeof oprfBlind).toBe("function");
      expect(typeof oprfFinalize).toBe("function");
      expect(typeof lagrangeInterpolate).toBe("function");
      expect(typeof generateRefreshScalar).toBe("function");
      expect(typeof computeRefreshDelta).toBe("function");
      expect(typeof applyRefresh).toBe("function");
    });

    it("key derivation functions", () => {
      expect(typeof deriveAccountKey).toBe("function");
      expect(typeof deriveMasterKey).toBe("function");
      expect(typeof deriveVolunteerPrivateKey).toBe("function");
      expect(typeof deriveVolunteerPublicKey).toBe("function");
      expect(typeof deriveOrgUnwrapKey).toBe("function");
      expect(typeof generateSalt).toBe("function");
    });

    it("ECIES functions", () => {
      expect(typeof eciesEncrypt).toBe("function");
      expect(typeof eciesDecrypt).toBe("function");
    });

    it("content encryption functions", () => {
      expect(typeof generateContentKey).toBe("function");
      expect(typeof encryptContent).toBe("function");
      expect(typeof decryptContent).toBe("function");
    });

    it("blob encryption functions", () => {
      expect(typeof encryptBlob).toBe("function");
      expect(typeof decryptBlob).toBe("function");
    });

    it("key wrapping functions", () => {
      expect(typeof wrapKey).toBe("function");
      expect(typeof unwrapKey).toBe("function");
    });

    it("branding functions", () => {
      expect(typeof deriveClientBrandingKey).toBe("function");
      expect(typeof encryptClientBranding).toBe("function");
      expect(typeof decryptClientBranding).toBe("function");
    });

    it("escrow functions", () => {
      expect(typeof encryptWithPassphrase).toBe("function");
      expect(typeof decryptWithPassphrase).toBe("function");
      expect(typeof serializeEscrowBlob).toBe("function");
      expect(typeof deserializeEscrowBlob).toBe("function");
    });

    it("error classes", () => {
      expect(typeof CryptoError).toBe("function");
      expect(typeof DecryptionError).toBe("function");
      expect(typeof InvalidKeyError).toBe("function");
      expect(typeof InvalidInputError).toBe("function");
      expect(typeof SodiumNotReadyError).toBe("function");
    });
  });

  // These constant-value checks guard cryptographic parameter contracts.
  // Justified: Argon2 params and HKDF labels are baked into persisted
  // key material. Changing them silently would make all existing derived
  // keys unrecoverable. These tests catch accidental edits.
  describe("exported constants have correct values", () => {
    it("ARGON2_MIN_PARAMS", () => {
      expect(ARGON2_MIN_PARAMS.memoryKiB).toBe(65536);
      expect(ARGON2_MIN_PARAMS.iterations).toBe(3);
      expect(ARGON2_MIN_PARAMS.parallelism).toBe(4);
    });

    it("ARGON2_ESCROW_PARAMS", () => {
      expect(ARGON2_ESCROW_PARAMS.memoryKiB).toBe(262144);
      expect(ARGON2_ESCROW_PARAMS.iterations).toBe(4);
      expect(ARGON2_ESCROW_PARAMS.parallelism).toBe(4);
    });

    it("HKDF_LABELS", () => {
      expect(HKDF_LABELS.MASTER_KEY).toBe("care-y-master-v2");
      expect(HKDF_LABELS.ECIES_PRIVATE).toBe("care-y-ecies-private-v1");
      expect(HKDF_LABELS.ORG_UNWRAP).toBe("care-y-org-key-unwrap-v1");
      expect(HKDF_LABELS.ECIES_WRAP).toBe("care-y-ecies-wrap-v1");
    });

    it("BRANDING_LABEL", () => {
      expect(BRANDING_LABEL).toBe("care-y-branding-v1");
    });
  });

  describe("end-to-end integration", () => {
    it("full key derivation chain through ECIES wrapping and content encryption", () => {
      // 1. Password stretching
      const password = new TextEncoder().encode("integration-test-password");
      const salt = generateSalt();
      const stretched = deriveAccountKey(password, salt);

      // 2. Simulate OPRF (blind, server eval, finalize)
      const { blindedElement, blindState } = oprfBlind(stretched);
      const serverKey =
        sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const evaluated = sodium.crypto_scalarmult_ristretto255(
        serverKey,
        blindedElement,
      ) as RistrettoPoint;
      const oprfOutput = oprfFinalize(blindState, evaluated, stretched);

      // 3. Derive master key and volunteer keypair
      const masterKey = deriveMasterKey(oprfOutput);
      const volPrivate = deriveVolunteerPrivateKey(masterKey);
      const volPublic = deriveVolunteerPublicKey(volPrivate);

      // 4. Generate ticket key and wrap it for the volunteer
      const tk = generateContentKey();
      const wrapped = eciesEncrypt(tk, volPublic);

      // 5. Volunteer unwraps the ticket key
      const unwrappedTk = eciesDecrypt(
        wrapped.ephemeralPoint,
        wrapped.nonce,
        wrapped.ciphertext,
        volPrivate,
      ) as SymmetricKey;
      expect(unwrappedTk).toEqual(tk);

      // 6. Encrypt and decrypt content with the ticket key
      const ticketContent = new TextEncoder().encode(
        "Sensitive ticket content for integration test",
      );
      const encrypted = encryptContent(ticketContent, tk);
      const decrypted = decryptContent(encrypted, unwrappedTk);
      expect(decrypted).toEqual(ticketContent);

      // 7. Verify org unwrap key is different from volunteer key
      const orgUnwrapKey = deriveOrgUnwrapKey(masterKey);
      expect(orgUnwrapKey).not.toEqual(volPrivate);
    }, 30_000);

    it("threshold OPRF (2-of-2) produces same master key as single-server", () => {
      // Fixed input for determinism
      const password = new TextEncoder().encode("threshold-e2e-test");
      const salt = generateSalt();
      const stretched = deriveAccountKey(password, salt);

      // Full OPRF key
      const fullKey = sodium.crypto_core_ristretto255_scalar_random() as Scalar;

      // Split into 2-of-2 Shamir shares: f(x) = k + a*x
      const a = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
      const shareA = sodium.crypto_core_ristretto255_scalar_add(
        fullKey,
        a,
      ) as Scalar;
      const twoA = sodium.crypto_core_ristretto255_scalar_add(a, a);
      const shareB = sodium.crypto_core_ristretto255_scalar_add(
        fullKey,
        twoA,
      ) as Scalar;

      // Client blinds once
      const { blindedElement, blindState } = oprfBlind(stretched);

      // Path A: single-server evaluation
      const fullEval = sodium.crypto_scalarmult_ristretto255(
        fullKey,
        blindedElement,
      ) as RistrettoPoint;
      const outputFull = oprfFinalize(blindState, fullEval, stretched);
      const masterFull = deriveMasterKey(outputFull);

      // Path B: threshold evaluation with Lagrange reconstruction
      const partialA = sodium.crypto_scalarmult_ristretto255(
        shareA,
        blindedElement,
      ) as RistrettoPoint;
      const partialB = sodium.crypto_scalarmult_ristretto255(
        shareB,
        blindedElement,
      ) as RistrettoPoint;
      const combined = lagrangeInterpolate(partialA, partialB);
      const outputThreshold = oprfFinalize(blindState, combined, stretched);
      const masterThreshold = deriveMasterKey(outputThreshold);

      // Both paths must produce identical master keys
      expect(masterThreshold).toEqual(masterFull);

      // Derive volunteer keys from threshold path and verify ECIES roundtrip
      const volPrivate = deriveVolunteerPrivateKey(masterThreshold);
      const volPublic = deriveVolunteerPublicKey(volPrivate);
      const tk = generateContentKey();
      const wrapped = eciesEncrypt(tk, volPublic);
      const unwrapped = eciesDecrypt(
        wrapped.ephemeralPoint,
        wrapped.nonce,
        wrapped.ciphertext,
        volPrivate,
      ) as SymmetricKey;
      expect(unwrapped).toEqual(tk);
    }, 30_000);

    it("same password + same server key = deterministic master key", () => {
      const password = new TextEncoder().encode("determinism-test");
      const salt = generateSalt();
      const stretched = deriveAccountKey(password, salt);
      const serverKey =
        sodium.crypto_core_ristretto255_scalar_random() as Scalar;

      // Run the full chain twice with the same inputs
      const masterKeys: Uint8Array[] = [];
      for (let i = 0; i < 2; i++) {
        const { blindedElement, blindState } = oprfBlind(stretched);
        const evaluated = sodium.crypto_scalarmult_ristretto255(
          serverKey,
          blindedElement,
        ) as RistrettoPoint;
        const oprfOutput = oprfFinalize(blindState, evaluated, stretched);
        masterKeys.push(deriveMasterKey(oprfOutput));
      }

      // Different blinding scalars, but same OPRF output after unblinding
      expect(masterKeys[0]).toEqual(masterKeys[1]);
    }, 30_000);
  });
});

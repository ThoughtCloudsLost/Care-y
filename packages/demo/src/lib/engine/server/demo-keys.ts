/**
 * Demo OPRF key derivation and service.
 *
 * Provides a deterministic OPRF scalar k for the demo, a function to
 * run the full client key derivation pipeline locally (Argon2id,
 * blind, evaluate via k, finalize, derive master/vol keys), and a
 * demo OprfEvaluateService whose evaluate/adminEvaluate simply
 * multiplies the blinded element by k and returns the result in the
 * encoding the real service emits (STANDARD base64 via Buffer, see
 * oprf-evaluate-service.ts:251; the client decodes the evaluated
 * element with decodeStandardBase64, not the URL-safe decode).
 *
 * The OPRF scalar is derived deterministically at runtime via
 * scalar_reduce(SHA-512("care-y-demo-oprf-scalar-v1")) so no
 * literal hex key material appears in the source (gitleaks safe).
 */

import _sodium from "libsodium-wrappers-sumo";
import {
  decode,
  deriveAccountKey,
  oprfBlind,
  oprfFinalize,
  deriveMasterKey,
  deriveVolunteerPrivateKey,
  deriveVolunteerPublicKey,
  eciesEncrypt,
  type Salt,
  type RistrettoPoint,
  type EciesOutput,
} from "@care-y/crypto";

import type { OprfEvaluateService } from "../../../../../server/src/crypto/oprf-evaluate-service.js";
import { DemoEngineError } from "../errors.js";

// ── Deterministic OPRF scalar ──────────────────────────────────────

const DEMO_OPRF_SEED = "care-y-demo-oprf-scalar-v1";

/**
 * Derive the fixed demo OPRF scalar deterministically.
 * k = scalar_reduce(SHA-512(utf8(DEMO_OPRF_SEED)))
 *
 * Must be called after sodium is ready.
 */
export function deriveDemoOprfScalar(): Uint8Array {
  const encoder = new TextEncoder();
  const seedBytes = encoder.encode(DEMO_OPRF_SEED);
  const hash = _sodium.crypto_hash_sha512(seedBytes);
  return _sodium.crypto_core_ristretto255_scalar_reduce(hash);
}

// ── Full client pipeline (server-side prediction) ──────────────────

export interface DemoKeyDerivationResult {
  readonly volPublic: Uint8Array;
}

/**
 * Run the exact client key derivation pipeline with a local
 * OPRF evaluate step (scalarmult by k) standing in for the server
 * hop. Returns volPublic only; volPrivate is NOT exported or stored,
 * matching the crypto v2 rule that no client private keys exist
 * server-side.
 *
 * @param password  - The demo admin password (plaintext string)
 * @param salt      - 16-byte Argon2id salt
 * @param oprfScalar - The demo OPRF scalar k
 */
export function deriveDemoVolPublic(
  password: string,
  salt: Uint8Array,
  oprfScalar: Uint8Array,
): DemoKeyDerivationResult {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  // 1. Argon2id stretch
  const stretched = deriveAccountKey(passwordBytes, salt as Salt);

  // 2. OPRF blind
  const { blindedElement, blindState } = oprfBlind(stretched);

  // 3. Local evaluate: evaluated = k * blindedElement
  const evaluated = _sodium.crypto_scalarmult_ristretto255(
    oprfScalar,
    blindedElement,
  );

  // 4. Finalize
  const oprfOutput = oprfFinalize(
    blindState,
    evaluated as RistrettoPoint,
    stretched,
  );

  // 5. Derive master -> vol keys
  const masterKey = deriveMasterKey(oprfOutput);
  const volPrivate = deriveVolunteerPrivateKey(masterKey);
  const volPublic = deriveVolunteerPublicKey(volPrivate);

  // Zero intermediate material
  _sodium.memzero(stretched);
  _sodium.memzero(evaluated);
  _sodium.memzero(oprfOutput);
  _sodium.memzero(masterKey);
  _sodium.memzero(volPrivate);
  _sodium.memzero(passwordBytes);

  return { volPublic };
}

// ── Wrap org secret key for volunteer ──────────────────────────────

/**
 * ECIES-wrap the org secret key to the volunteer's ristretto255
 * public key. Returns the wrap components as raw byte arrays ready
 * for DB insertion.
 */
export function wrapOrgKeyForVolunteer(
  orgSecretKey: Uint8Array,
  volPublic: Uint8Array,
): EciesOutput {
  return eciesEncrypt(orgSecretKey, volPublic as RistrettoPoint);
}

// ── Demo OprfEvaluateService ───────────────────────────────────────

/**
 * Create a demo-only OprfEvaluateService that evaluates the blinded
 * element by multiplying with the fixed demo scalar k. No rate
 * limiting, no PoW gating.
 *
 * The blindedElement arrives as URL-safe base64 (the client worker
 * calls encode() from @care-y/crypto). The response returns
 * evaluated in the same encoding.
 */
export function createDemoOprfService(
  oprfScalar: Uint8Array,
): OprfEvaluateService {
  async function evaluate(request: {
    readonly blindedElement: string;
  }): Promise<{ evaluated: string }> {
    await Promise.resolve();
    const blindedBytes = decode(request.blindedElement);

    if (blindedBytes.length !== _sodium.crypto_core_ristretto255_BYTES) {
      throw new DemoEngineError(
        `Invalid blinded element length: expected ${String(_sodium.crypto_core_ristretto255_BYTES)}, got ${String(blindedBytes.length)}`,
      );
    }

    const evaluatedBytes = _sodium.crypto_scalarmult_ristretto255(
      oprfScalar,
      blindedBytes,
    );

    // Standard base64 to match the real service's Buffer encoding
    // (login-crypto decodes this field with decodeStandardBase64).
    return { evaluated: Buffer.from(evaluatedBytes).toString("base64") };
  }

  return {
    evaluate,
    adminEvaluate: evaluate,
  };
}

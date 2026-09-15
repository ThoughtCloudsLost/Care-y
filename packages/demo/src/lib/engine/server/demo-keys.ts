/**
 * Demo OPRF key derivation and service.
 *
 * Provides a deterministic OPRF scalar k for the demo, a function to
 * run the full client key derivation pipeline locally (Argon2id,
 * blind, evaluate via k, finalize, derive master/vol keys), and a
 * demo OprfEvaluateService whose evaluate/adminEvaluate derive a
 * per-tag working share from k via deriveTaggedShare and multiply the
 * blinded element by that share, matching production's per-identity
 * key derivation (ADR-091). The result is encoded as base64url, the
 * same encoding the real service emits (oprf-evaluate-service.ts:290).
 *
 * The OPRF scalar is derived deterministically at runtime via
 * scalar_reduce(SHA-512("care-y-demo-oprf-scalar-v1")) so no
 * literal hex key material appears in the source (gitleaks safe).
 */

import _sodium from "libsodium-wrappers-sumo";
import {
  decode,
  deriveAccountKey,
  deriveTaggedShare,
  encode,
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

import type {
  OprfEvaluateService,
  OprfEvaluateRequest,
  ChannelEvaluateRequest,
  OprfEvaluateResult,
} from "../../../../../server/src/crypto/oprf-evaluate-service.js";
import {
  volunteerTag,
  accountTag,
  channelTag,
} from "../../../../../server/src/crypto/oprf-tags.js";
import type { Kysely } from "kysely";
import type { UserId } from "@care-y/shared";
import { clientAccountIdSchema } from "@care-y/shared";
import type { TenantDatabase } from "../../../../../server/src/db/types.js";
import { DemoEngineError } from "../errors.js";
import {
  traceFlowLocal,
  buildFlowDetail,
  describeFlowBytes,
} from "../../flow-events.js";
import { assertSodiumReady } from "./sodium-ready.js";

// ── Deterministic OPRF scalar ──────────────────────────────────────

const DEMO_OPRF_SEED = "care-y-demo-oprf-scalar-v1";

/**
 * Derive the fixed demo OPRF scalar deterministically.
 * k = scalar_reduce(SHA-512(utf8(DEMO_OPRF_SEED)))
 *
 * Must be called after sodium is ready.
 */
export function deriveDemoOprfScalar(): Uint8Array {
  assertSodiumReady();
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
 * The evaluate step must use the same per-tag share the evaluate service
 * uses (ADR-091), not the master scalar. Login goes through the service
 * under volunteerTag(userId); if this derived under k directly, the
 * seeded volPublic would not be the key the visitor's login produces.
 *
 * @param password  - The demo admin password (plaintext string)
 * @param salt      - 16-byte Argon2id salt
 * @param oprfScalar - The demo OPRF master scalar k
 * @param userId - The volunteer whose tag scopes the evaluation
 */
export function deriveDemoVolPublic(
  password: string,
  salt: Uint8Array,
  oprfScalar: Uint8Array,
  userId: UserId,
): DemoKeyDerivationResult {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);

  // 1. Argon2id stretch
  const stretched = deriveAccountKey(passwordBytes, salt as Salt);

  // 2. OPRF blind
  const { blindedElement, blindState } = oprfBlind(stretched);

  // 3. Local evaluate under the volunteer tag, mirroring the service
  const taggedScalar = deriveTaggedShare(oprfScalar, volunteerTag(userId));
  const evaluated = _sodium.crypto_scalarmult_ristretto255(
    taggedScalar,
    blindedElement,
  );
  _sodium.memzero(taggedScalar);

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
 * Evaluate a blinded element under a per-tag working share derived from
 * the master scalar. Mirrors production, where each share process derives
 * its per-tag share via deriveTaggedShare and the combined evaluation is
 * what the client finalizes.
 *
 * Returns the base64url-encoded evaluated point, matching the real
 * service's encoding (oprf-evaluate-service.ts:290). The decode() call
 * at the top tolerates both base64url and standard base64 input (the
 * client sends base64url via encode()).
 */
function evaluateUnderTag(
  masterScalar: Uint8Array,
  blindedElement: string,
  tag: string,
): OprfEvaluateResult {
  const blindedBytes = decode(blindedElement);

  if (blindedBytes.length !== _sodium.crypto_core_ristretto255_BYTES) {
    throw new DemoEngineError(
      `Invalid blinded element length: expected ${String(_sodium.crypto_core_ristretto255_BYTES)}, got ${String(blindedBytes.length)}`,
    );
  }

  const taggedScalar = deriveTaggedShare(masterScalar, tag);
  try {
    const evaluatedBytes = _sodium.crypto_scalarmult_ristretto255(
      taggedScalar,
      blindedBytes,
    );
    // base64url, matching the real service (oprf-evaluate-service.ts:290).
    return { evaluated: encode(evaluatedBytes) };
  } finally {
    _sodium.memzero(taggedScalar);
  }
}

/**
 * Build the tag string for a volunteer or account evaluate request,
 * mirroring tagForEvaluateRequest in oprf-evaluate-service.ts.
 */
function tagForRequest(req: OprfEvaluateRequest): string {
  switch (req.kind) {
    case "volunteer":
      return volunteerTag(req.userId);
    case "account":
      // The evaluate wire reuses the UserId-branded slot for account ids,
      // so re-parse to mint the right brand rather than casting. Mirrors
      // tagForEvaluateRequest in oprf-evaluate-service.ts.
      return accountTag(clientAccountIdSchema.parse(req.userId));
  }
}

/**
 * Create a demo-only OprfEvaluateService that derives per-tag working
 * shares from the master scalar k and evaluates the blinded element
 * under that share. No rate limiting, no PoW gating.
 *
 * The blindedElement arrives as base64url (the client worker calls
 * encode() from @care-y/crypto). The response returns evaluated in
 * base64url, the same encoding the real service uses.
 */
export function createDemoOprfService(
  oprfScalar: Uint8Array,
): OprfEvaluateService {
  async function evaluate(
    request: OprfEvaluateRequest,
  ): Promise<OprfEvaluateResult> {
    // Badged as a seam: production splits this evaluation across two
    // OPRF servers in separate jurisdictions.
    return traceFlowLocal(
      {
        lane: "crypto",
        label: "oprf evaluate",
        seamKey: "oprf-evaluator",
        resultDetail: () => {
          const pointSize = _sodium.crypto_core_ristretto255_BYTES;
          return buildFlowDetail({
            input: [
              {
                name: "blinded point",
                value: describeFlowBytes(pointSize),
                kind: "key-material",
                bytes: pointSize,
              },
            ],
            result: [
              {
                name: "evaluated point",
                value: describeFlowBytes(pointSize),
                kind: "key-material",
                bytes: pointSize,
              },
            ],
          });
        },
      },
      async () => {
        await Promise.resolve();
        const tag = tagForRequest(request);
        return evaluateUnderTag(oprfScalar, request.blindedElement, tag);
      },
    );
  }

  async function evaluateChannel(
    _db: Kysely<TenantDatabase>,
    request: ChannelEvaluateRequest,
  ): Promise<OprfEvaluateResult> {
    await Promise.resolve();
    const tag = channelTag(request.orgUuid, request.channelId);
    return evaluateUnderTag(oprfScalar, request.blindedElement, tag);
  }

  return {
    evaluate,
    adminEvaluate: evaluate,
    evaluateChannel,
  };
}

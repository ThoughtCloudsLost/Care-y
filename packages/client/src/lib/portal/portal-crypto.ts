/**
 * Client-side portal cryptography utilities that remain on the main thread.
 *
 * ADR-091 posture: key custody lives in the portal Worker (portal-core.ts).
 * The main thread holds no channel or account key material after session
 * start. This module retains only:
 *
 *   - parseFragment: URL fragment parsing (no secrets, runs before the worker)
 *   - performChannelOprf: channel OPRF pipeline wrapping tRPC + PoW plumbing
 *     (now used only by mint paths; channel sessions use the bridge)
 *   - decodeEciesTriple: base64url wire decode (used by upgrade re-encrypt)
 *   - Type exports consumed by callers
 *
 * Functions that moved into the portal worker and are consumed via the
 * bridge: verifyKeyCheck, decryptPortalMessage, encryptReply,
 * encryptAttachment, decryptAttachmentKey, decryptAttachmentBlob,
 * createPortalSession.
 */

import {
  deriveChannelId,
  deriveChannelAuth,
  portalOprfInput,
  oprfBlind,
  oprfFinalize,
  derivePortalKeypairFromOprf,
  encode,
  decode,
  zeroAll,
  type PortalKeypair,
  toRistrettoPoint,
  type RistrettoPoint,
} from "@care-y/crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Decoded ECIES triple (binary form, ready for eciesDecrypt). */
export interface EciesTripleDecoded {
  readonly ephemeralPoint: RistrettoPoint;
  readonly nonce: Uint8Array;
  readonly ciphertext: Uint8Array;
}

/** ECIES triple in the base64url form the wire uses. */
export interface EciesTripleWire {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

// ---------------------------------------------------------------------------
// Channel OPRF round (ADR-091)
// ---------------------------------------------------------------------------

/**
 * Callback that sends a blinded element to the server's
 * evaluateChannelOprf procedure and returns the evaluated element
 * as a base64url string. The caller wires this to the tRPC mutation;
 * this module stays free of tRPC.
 */
export type ChannelEvaluateCallback = (
  channelId: string,
  blindedElementB64: string,
  auth?: string,
  pow?: { challenge: string; solution: string },
) => Promise<{ evaluated: string }>;

/** Options for performChannelOprf. */
export interface ChannelOprfOptions {
  /** Passphrase spoken on the verification call (omit for plain links). */
  readonly passphrase?: string;
  /** Base64url channel auth token (required for active rows). */
  readonly auth?: string;
  /** Server evaluate callback (tRPC wiring). */
  readonly evaluate: ChannelEvaluateCallback;
  /** PoW callback matching the evaluateWithPowRetry pattern. */
  readonly onPowRequired: (
    challenge: string,
    difficulty: number,
  ) => Promise<string>;
}

/**
 * Type guard for tRPC errors carrying a PoW challenge.
 * Mirrors the guard in crypto-helpers.ts for the channel evaluate path.
 */
function isChannelPowRequired(
  err: unknown,
): err is { data: { code: string; challenge: string; difficulty: number } } {
  if (typeof err !== "object" || err === null || !("data" in err)) {
    return false;
  }
  const { data } = err;
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return (
    "code" in data &&
    data.code === "POW_REQUIRED" &&
    "challenge" in data &&
    typeof data.challenge === "string" &&
    "difficulty" in data &&
    typeof data.difficulty === "number"
  );
}

/**
 * Run the full channel OPRF round: portalOprfInput, blind,
 * evaluate (with PoW retry), finalize, derive keypair.
 *
 * The module stays tRPC-free by accepting the evaluate callback
 * as a parameter, the same pattern evaluateWithPowRetry uses for
 * its onPowRequired callback.
 *
 * All intermediate key material is zeroed in a finally block.
 * The returned PortalKeypair is owned by the caller, who must
 * zero clientPrivate when done.
 *
 * @param seed - Portal seed (>= 18 bytes)
 * @param channelId - Hex channel identifier derived from the seed
 * @param opts - Evaluate callback, optional passphrase, optional auth
 * @returns PortalKeypair derived through the OPRF pipeline
 */
export async function performChannelOprf(
  seed: Uint8Array,
  channelId: string,
  opts: ChannelOprfOptions,
): Promise<PortalKeypair> {
  let input: Uint8Array | null = null;
  let oprfOutput: Uint8Array | null = null;

  try {
    // 1. Build pre-blind input (seed, or seed || Argon2id(passphrase))
    input = portalOprfInput(seed, opts.passphrase);

    // 2. Blind
    const { blindedElement, blindState } = oprfBlind(input);

    // 3. Evaluate with PoW retry
    const result = await evaluateChannelWithPowRetry(
      channelId,
      encode(blindedElement),
      opts.auth,
      opts.evaluate,
      opts.onPowRequired,
    );

    // 4. Finalize
    const evaluatedBytes = decode(result);
    oprfOutput = oprfFinalize(
      blindState,
      toRistrettoPoint(evaluatedBytes),
      input,
    );

    // 5. Derive keypair from OPRF output
    return derivePortalKeypairFromOprf(oprfOutput);
  } finally {
    zeroAll(input, oprfOutput);
  }
}

/**
 * Channel evaluate with PoW retry, mirroring the pattern in
 * crypto-helpers.ts for volunteer/account OPRF.
 */
async function evaluateChannelWithPowRetry(
  channelId: string,
  blindedElementB64: string,
  auth: string | undefined,
  evaluate: ChannelEvaluateCallback,
  onPowRequired: (challenge: string, difficulty: number) => Promise<string>,
): Promise<string> {
  try {
    const result = await evaluate(channelId, blindedElementB64, auth);
    return result.evaluated;
  } catch (err: unknown) {
    if (!isChannelPowRequired(err)) throw err;

    // Solve the PoW challenge, then retry with the solved fields.
    const solution = await onPowRequired(
      err.data.challenge,
      err.data.difficulty,
    );
    const result = await evaluate(channelId, blindedElementB64, auth, {
      challenge: err.data.challenge,
      solution,
    });
    return result.evaluated;
  }
}

// ---------------------------------------------------------------------------
// Fragment parsing
// ---------------------------------------------------------------------------

/**
 * Parse location.hash: strip "#", decode base64url, length-check.
 * Derive auth eagerly. Keypair derivation is deferred until
 * hasPassphrase is known (bootstrap runs on auth alone).
 *
 * Returns null on missing or malformed fragment.
 */
export function parseFragment(
  hash: string,
): { seed: Uint8Array; auth: Uint8Array; channelId: string } | null {
  if (!hash || hash === "#") return null;
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (raw.length === 0) return null;

  let seed: Uint8Array;
  try {
    seed = decode(raw);
  } catch {
    return null;
  }

  // Minimum 18 bytes enforced by the crypto module; guard early so the
  // derive calls never throw for a truncated fragment.
  if (seed.length < 18) return null;

  try {
    const channelId = deriveChannelId(seed);
    const auth = deriveChannelAuth(seed);
    return { seed, auth, channelId };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Wire decode helper
// ---------------------------------------------------------------------------

/**
 * Decode a base64url ECIES triple from the wire into binary form.
 */
export function decodeEciesTriple(wire: {
  ephemeralPoint: string;
  nonce: string;
  ciphertext: string;
}): EciesTripleDecoded {
  return {
    ephemeralPoint: toRistrettoPoint(decode(wire.ephemeralPoint)),
    nonce: decode(wire.nonce),
    ciphertext: decode(wire.ciphertext),
  };
}

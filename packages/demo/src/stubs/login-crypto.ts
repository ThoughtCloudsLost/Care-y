/**
 * Stub for $lib/auth/login-crypto.
 *
 * Reproduces the real module's exported surface. The loginCrypto
 * function plays callbacks on timers at narratable speed (~4.2s total)
 * while the real key derivation runs concurrently via ensureKeyed().
 * Resolves when BOTH pacing and derivation are done, returning the
 * REAL LoginCryptoResult.
 */

import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { ensureKeyed, getEnsureKeyedResult } from "./crypto-context.svelte.js";
import { emitFlowEvent, flowNow } from "../lib/flow-events.js";

// -----------------------------------------------------------------------
// Exported types (mirror the real module exactly)
// -----------------------------------------------------------------------

export interface LoginCryptoResult {
  /** Base64-encoded volunteer public key (for display or upload). */
  volPublic: string;
  /** Org public key (base64). Worker retains the secret. Null if org not onboarded. */
  orgPublicKey: string | null;
}

export interface CryptoPhaseCallbacks {
  onArgon2idStart: () => void;
  onArgon2idDone: () => void;
  onOprfStart: () => void;
  onOprfDone: () => void;
  onDeriveStart: () => void;
  onDone: () => void;
}

export interface LoginCryptoCallbacks extends CryptoPhaseCallbacks {
  onPowRequired: (challenge: string, difficulty: number) => Promise<string>;
}

// -----------------------------------------------------------------------
// Error type
// -----------------------------------------------------------------------

class DemoLoginCryptoError extends Error {
  override readonly name = "DemoLoginCryptoError";
}

// -----------------------------------------------------------------------
// Demo implementation
// -----------------------------------------------------------------------

async function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Stage listener: the login stage tracker subscribes to know when
 * each phase starts. Module-level so LoginMount can register one.
 */
let stageListener: ((stage: string) => void) | null = null;

export function setLoginCryptoStageListener(
  listener: ((stage: string) => void) | null,
): void {
  stageListener = listener;
}

/**
 * Report a paced phase to the flow band. The durations are the demo's
 * narratable timings, not the real derivation, which is why every phase
 * event carries the login-pacing seam.
 */
function emitPhase(label: string, startedAt: number | null): void {
  emitFlowEvent({
    lane: "crypto",
    direction: "local",
    label,
    seamKey: "login-pacing",
    durationMs: startedAt === null ? null : flowNow() - startedAt,
  });
}

/**
 * Demo loginCrypto: plays callbacks on timers at narratable speed
 * (~4.2s total) while the real derivation runs concurrently.
 * Resolves when BOTH the pacing sequence and the real derivation
 * are complete. Returns the REAL LoginCryptoResult from ensureKeyed.
 *
 * Never calls onPowRequired.
 */
export async function loginCrypto(
  _identifier: string,
  _password: string,
  _bridge: CryptoBridge,
  callbacks: LoginCryptoCallbacks,
): Promise<LoginCryptoResult> {
  // Start the real derivation concurrently with the pacing sequence.
  const realDerivation = ensureKeyed();

  // Pacing sequence: fire callbacks at narratable speed
  // Argon2id phase (~1.5s)
  callbacks.onArgon2idStart();
  stageListener?.("argon2id");
  const argon2idStartedAt = flowNow();
  emitPhase("argon2id start", null);
  await wait(1500);
  callbacks.onArgon2idDone();
  emitPhase("argon2id done", argon2idStartedAt);

  // OPRF phase (~1.5s)
  callbacks.onOprfStart();
  stageListener?.("oprf");
  const oprfStartedAt = flowNow();
  emitPhase("oprf start", null);
  await wait(1500);
  callbacks.onOprfDone();
  emitPhase("oprf done", oprfStartedAt);

  // Derive phase (~1.2s)
  callbacks.onDeriveStart();
  stageListener?.("derive");
  const deriveStartedAt = flowNow();
  emitPhase("derive start", null);
  await wait(1200);

  // Wait for the real derivation to finish (it almost certainly
  // completed before the 4.2s pacing, but if not, we wait).
  await realDerivation;

  // Done
  callbacks.onDone();
  stageListener?.("done");
  emitPhase("derive done", deriveStartedAt);

  // Return the REAL result from ensureKeyed
  const result = getEnsureKeyedResult();
  if (result === null) {
    throw new DemoLoginCryptoError(
      "ensureKeyed completed but no result was cached",
    );
  }
  return result;
}

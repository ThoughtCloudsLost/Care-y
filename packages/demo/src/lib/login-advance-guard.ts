/**
 * Pure decision logic for the login-advance chain.
 *
 * Extracted from PhoneApp so the rewind-gating invariant can be pinned
 * by unit tests without mounting Svelte components.
 */

import type { LoginStage, LoginAdvanceTarget } from "./bridge.js";

// -----------------------------------------------------------------------
// Rank tables (match PhoneApp's STAGE_RANK / TARGET_RANK exactly)
// -----------------------------------------------------------------------

const STAGE_RANK: Record<LoginStage, number> = {
  form: 0,
  "twofa-picker": 1,
  "twofa-method": 2,
  deriving: 3,
};

const TARGET_RANK: Record<LoginAdvanceTarget, number> = {
  form: 0,
  "twofa-picker": 1,
  "method-totp": 2,
  "method-passkey": 2,
  "method-email": 2,
  "method-sms": 2,
  "method-push": 2,
  "method-backup": 2,
  deriving: 3,
  done: 4,
};

/** Whether a target is a specific 2FA method (not a stage target). */
function isMethodTarget(target: LoginAdvanceTarget): boolean {
  return target.startsWith("method-");
}

// -----------------------------------------------------------------------
// Advance decision
// -----------------------------------------------------------------------

/**
 * Result of evaluating whether an advance target should proceed.
 *
 *   "rewind"    - the flow must be reset and replayed forward
 *   "proceed"   - continue the advance chain from the current stage
 *   "already"   - the flow is already at the target, nothing to do
 *   "drop"      - the target is stale or blocked; discard it silently
 */
export type AdvanceDecision = "rewind" | "proceed" | "already" | "drop";

/**
 * Decide what a login advance chain should do given the current stage,
 * the requested target, and whether a crypto derivation is in flight.
 *
 * The crypto in-flight signal is true from the moment ensureKeyed()
 * is first called (covering the gap before the login-stage callback
 * fires "deriving") and stays true after success; it clears only on
 * rejection. Rewinds are therefore refused over a running derivation
 * AND over a keyed worker, both of which a replayed submit's zeroAll
 * would corrupt.
 */
export function evaluateAdvance(
  currentStage: LoginStage,
  target: LoginAdvanceTarget,
  cryptoInFlight: boolean,
): AdvanceDecision {
  // eslint-disable-next-line security/detect-object-injection -- key is a typed LoginAdvanceTarget union member
  const targetRank = TARGET_RANK[target];
  // eslint-disable-next-line security/detect-object-injection -- key is a typed LoginStage union member
  const stageRank = STAGE_RANK[currentStage];

  if (stageRank > targetRank) {
    // A lower-rank target while the derivation is running means a
    // stale scroll-derived intent leaked through. The running pipeline
    // owns the scene; rewinding would splice a zeroAll into the worker
    // queue and corrupt it.
    if (cryptoInFlight) return "drop";
    return "rewind";
  }

  if (stageRank === targetRank && !isMethodTarget(target)) {
    // Method targets at equal rank may still need a method switch;
    // everything else at its own rank is already there.
    if (target !== "done") return "already";
  }

  return "proceed";
}

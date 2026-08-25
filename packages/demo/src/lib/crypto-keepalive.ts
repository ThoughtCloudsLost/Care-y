/**
 * Pure decision logic for the crypto worker idle keepalive.
 *
 * The product's crypto worker zeroes all key material after 30 idle
 * minutes (IDLE_SELF_ZERO_MS). In the demo's dedicated-worker mode
 * this zero is silent: the main-thread bridge still reports KEYED,
 * decrypts fail with NOT_READY, and poisoned error sentinels
 * permanently cache in AsyncDecryptCache. This module provides
 * the decision function for the keepalive/recovery loop and the
 * interval constant, keeping DOM and side effects out so the
 * logic is testable with plain vitest.
 */

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

/**
 * Interval between keepalive pings (ms). Well under the 30-minute
 * idle timeout so normal ticks always re-arm the worker timer.
 */
export const KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000;

// -----------------------------------------------------------------------
// Decision function
// -----------------------------------------------------------------------

/** Actions the keepalive loop can take after a ping attempt. */
export type KeepaliveAction = "none" | "recover";

export interface KeepaliveInputs {
  /** Whether the keepalive ping (getVolPublic) rejected. */
  readonly pingFailed: boolean;
  /** Whether the main-thread bridge still believes the worker is KEYED. */
  readonly believedKeyed: boolean;
  /** Whether a recovery sequence is already in flight. */
  readonly recoveryInFlight: boolean;
  /** Whether the initial keying has ever completed successfully. */
  readonly hasEverKeyed: boolean;
}

/**
 * Decide whether the keepalive tick requires recovery.
 *
 * Recovery triggers exactly once per incident: when the ping fails
 * while the bridge still believes KEYED (the worker zeroed silently
 * on wake from sleep). No recovery fires before the first successful
 * keying (boot failures are not idle-zero events) or while a previous
 * recovery is still in flight.
 */
export function keepaliveDecision(inputs: KeepaliveInputs): KeepaliveAction {
  if (!inputs.pingFailed) return "none";
  if (!inputs.hasEverKeyed) return "none";
  if (!inputs.believedKeyed) return "none";
  if (inputs.recoveryInFlight) return "none";
  return "recover";
}

/**
 * In-memory cache of accepted TOTP codes, used to reject replays.
 *
 * RFC 6238 Section 5.2: "The verifier MUST NOT accept the second attempt
 * of the OTP after the successful validation has been issued for the first
 * OTP." verifyTotpCode() is a pure function of (secret, code, time), so
 * this cache holds the state that requirement needs: every accepted code
 * is remembered until it can no longer verify, and a repeat inside that
 * span is rejected.
 *
 * Entries hold a SHA-256 hash of the code, never the code itself. With a
 * six-digit code space the hash is memory hygiene (no literal codes in a
 * heap dump), not secrecy.
 *
 * A process restart empties the cache, reopening the replay window for
 * codes accepted in the previous TOTP_REPLAY_TTL_MS. Accepted risk for the
 * single-VPS deployment: exploiting it requires an already-intercepted
 * valid code plus a restart landing inside that code's 90s acceptance
 * span, while persisting used codes would cost a DB write on every 2FA
 * login. Revisit if the deployment model changes.
 *
 * A shared-store implementation (same TotpReplayCache interface) must back
 * any multi-instance deployment; see assertSingleInstanceTotpReplayCache.
 */

import { createHash } from "node:crypto";
import { createCleanupInterval } from "../utils/intervals.js";
import { ConfigError } from "../errors.js";
import { TOTP_PERIOD, TOTP_VERIFY_WINDOW } from "./totp.js";

const CLEANUP_INTERVAL_MS = 60_000;

/**
 * How long an accepted code stays rejected.
 *
 * verifyTotpCode() accepts the code for time step t while the verifier
 * clock is within TOTP_VERIFY_WINDOW steps of t, an interval spanning
 * (2 * window + 1) steps: 90 seconds at the defaults. Acceptance happens
 * inside that interval, so no replay of an accepted code can verify more
 * than the full span after the acceptance. Expiring entries after exactly
 * that span satisfies RFC 6238 Section 5.2 for the whole time the code
 * remains acceptable.
 */
export const TOTP_REPLAY_TTL_MS =
  (2 * TOTP_VERIFY_WINDOW + 1) * TOTP_PERIOD * 1000;

export interface TotpReplayCache {
  /** True when this exact code was already accepted for this user recently. */
  isUsed(orgId: string, userId: string, code: string): boolean;
  /** Records an accepted code so repeats inside the TTL are rejected. */
  markUsed(orgId: string, userId: string, code: string): void;
}

/**
 * Refuse to boot when the process-local in-memory cache would run across
 * more than one app instance. A code accepted on one instance would not be
 * recorded on the others, so each extra instance reopens the replay window
 * RFC 6238 Section 5.2 requires closed. A shared-store TotpReplayCache
 * (same interface) must back multi-instance deployments; until one is
 * wired, multi-instance is unsupported.
 */
export function assertSingleInstanceTotpReplayCache(
  multiInstance: boolean,
): void {
  if (multiInstance) {
    throw new ConfigError(
      "In-memory TOTP replay rejection is not safe across multiple app " +
        "instances. Configure a shared-store TotpReplayCache before " +
        "enabling APP_MULTI_INSTANCE.",
    );
  }
}

export function createInMemoryTotpReplayCache(
  now: () => number = Date.now,
): TotpReplayCache {
  /** Entry key ("orgId:userId:codeHash") to expiry timestamp in ms. */
  const used = new Map<string, number>();

  function entryKey(orgId: string, userId: string, code: string): string {
    const codeHash = createHash("sha256").update(code).digest("hex");
    return `${orgId}:${userId}:${codeHash}`;
  }

  createCleanupInterval(CLEANUP_INTERVAL_MS, () => {
    const cutoff = now();
    for (const [key, expiresAt] of used) {
      if (expiresAt <= cutoff) {
        used.delete(key);
      }
    }
  });

  return {
    isUsed(orgId: string, userId: string, code: string): boolean {
      const key = entryKey(orgId, userId, code);
      const expiresAt = used.get(key);
      if (expiresAt === undefined) {
        return false;
      }
      if (expiresAt <= now()) {
        used.delete(key);
        return false;
      }
      return true;
    },

    markUsed(orgId: string, userId: string, code: string): void {
      used.set(entryKey(orgId, userId, code), now() + TOTP_REPLAY_TTL_MS);
    },
  };
}

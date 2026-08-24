import { createHmac, hkdfSync } from "node:crypto";
import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import { createCleanupInterval } from "../utils/intervals.js";
import type { UserId, HashedIp } from "@care-y/shared";

const AUDIT_KEY_INFO = "care-y-oprf-audit-v1";
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export type OprfFailureReason =
  | "rate_limited"
  | "pow_required"
  | "pow_invalid"
  | "oprf_failed"
  | "session_mismatch";

export interface OprfAuditLogger {
  /** Log a failed OPRF evaluation. Never call on success. */
  logFailure(
    userId: UserId,
    ipAddress: string,
    reason: OprfFailureReason,
  ): Promise<void>;
  /** Stop the cleanup interval (for tests). */
  dispose(): void;
}

/**
 * Derives a daily HMAC key for IP hashing from OPS_SECRETS_KEY.
 * Key rotates daily (UTC date in the info string).
 * Cross-day IP correlation requires both days' keys.
 */
function deriveDailyKey(opsSecretsKey: Buffer, today: string): Buffer {
  return Buffer.from(
    hkdfSync(
      "sha256",
      opsSecretsKey,
      Buffer.alloc(0),
      `${AUDIT_KEY_INFO}:${today}`,
      32,
    ),
  );
}

function hashIp(dailyKey: Buffer, ipAddress: string): HashedIp {
  return createHmac("sha256", dailyKey)
    .update(ipAddress)
    .digest("hex") as HashedIp;
}

export function createOprfAuditLogger(
  db: Kysely<PlatformDatabase>,
  opsSecretsKey: Buffer,
  now: () => number = Date.now,
): OprfAuditLogger {
  let dailyCacheDate = "";
  let dailyCacheKey: Buffer = Buffer.alloc(0);

  function getDailyKey(): Buffer {
    const today = new Date(now()).toISOString().slice(0, 10);
    if (today !== dailyCacheDate) {
      dailyCacheKey = deriveDailyKey(opsSecretsKey, today);
      dailyCacheDate = today;
    }
    return dailyCacheKey;
  }

  const dispose = createCleanupInterval(CLEANUP_INTERVAL_MS, () => {
    const cutoff = new Date(now() - RETENTION_MS);
    db.deleteFrom("oprf_audit_log")
      .where("timestamp", "<", cutoff)
      .execute()
      .catch((err: unknown) => {
        console.error(
          "OPRF audit log cleanup failed:",
          err instanceof Error ? err.message : String(err),
        );
      });
  });

  return {
    async logFailure(
      userId: UserId,
      ipAddress: string,
      reason: OprfFailureReason,
    ): Promise<void> {
      const hashedIp = hashIp(getDailyKey(), ipAddress);

      await db
        .insertInto("oprf_audit_log")
        .values({
          user_id: userId,
          hashed_ip: hashedIp,
          reason,
        })
        .execute();
    },

    dispose,
  };
}

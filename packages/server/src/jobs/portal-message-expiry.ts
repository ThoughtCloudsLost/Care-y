/**
 * Portal message expiry job.
 *
 * Recurring daily job that deletes portal_messages ciphertext for
 * channels whose last activity (COALESCE(last_seen_at, created_at))
 * exceeds the 30-day boundary. Iterates all active tenant schemas
 * via the same pattern as the escalation rules checker.
 *
 * Deletes ciphertext only. Logs row counts per org schema and
 * nothing else (no channel ids, no PII).
 */

import { sql } from "kysely";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { JobQueue } from "./queue.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PORTAL_EXPIRY_QUEUE = "portal-message-expiry";
export const DEFAULT_PORTAL_EXPIRY_INTERVAL_MS = 24 * 60 * 60 * 1000; // daily

// ---------------------------------------------------------------------------
// Per-tenant expiry
// ---------------------------------------------------------------------------

/**
 * Delete portal_messages for channels inactive longer than 30 days.
 * Returns the number of rows deleted.
 */
export async function expirePortalMessages(
  db: Kysely<TenantDatabase>,
): Promise<number> {
  // Kind-agnostic: expiry applies to all channel kinds uniformly
  const result = await db
    .deleteFrom("portal_messages")
    .where(
      "channel_id",
      "in",
      db
        .selectFrom("portal_channels")
        .select("id")
        .where(
          sql`COALESCE(last_seen_at, created_at)`,
          "<",
          sql`now() - interval '30 days'`,
        ),
    )
    .executeTakeFirst();

  return Number(result.numDeletedRows);
}

// ---------------------------------------------------------------------------
// Job handler registration
// ---------------------------------------------------------------------------

/**
 * Register the portal message expiry handler. Called once at startup.
 *
 * The runForAllTenants callback iterates active org schemas and calls
 * expirePortalMessages for each. The handler re-enqueues itself with
 * the configured delay in a finally block so the chain never breaks.
 */
export function registerPortalExpiryHandler(
  jobQueue: JobQueue,
  runForAllTenants: () => Promise<void>,
  intervalMs: number = DEFAULT_PORTAL_EXPIRY_INTERVAL_MS,
): void {
  jobQueue.process(PORTAL_EXPIRY_QUEUE, async () => {
    try {
      await runForAllTenants();
    } finally {
      await jobQueue.enqueue(PORTAL_EXPIRY_QUEUE, {}, { delay: intervalMs });
    }
  });
}

/**
 * Portal expiry job.
 *
 * Recurring daily job that deletes portal_messages, portal_attachments,
 * and portal_recordings for channels whose last activity
 * (COALESCE(last_seen_at, created_at)) exceeds the 30-day boundary.
 * Iterates all active tenant schemas via the shared recurring handler.
 *
 * Deletes portal copies only (wraps and message ciphertext). The
 * org-side rows and blobs stay. Logs row counts per org schema and
 * nothing else (no channel ids, no PII).
 */

import { sql } from "kysely";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { JobQueue } from "./queue.js";
import { registerRecurringHandler } from "./ensure-recurring.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PORTAL_EXPIRY_QUEUE = "portal-message-expiry";
export const DEFAULT_PORTAL_EXPIRY_INTERVAL_MS = 24 * 60 * 60 * 1000; // daily

// ---------------------------------------------------------------------------
// Per-tenant expiry
// ---------------------------------------------------------------------------

/**
 * Delete portal_messages, portal_attachments, and portal_recordings for
 * channels inactive longer than 30 days. Returns the number of
 * portal_messages rows deleted (the primary metric the registered
 * handler uses).
 */
export async function expirePortalMessages(
  db: Kysely<TenantDatabase>,
): Promise<number> {
  // Kind-agnostic: expiry applies to all channel kinds uniformly.
  // The expired channel subquery is shared across all three deletes.
  const expiredChannels = db
    .selectFrom("portal_channels")
    .select("id")
    .where(
      sql`COALESCE(last_seen_at, created_at)`,
      "<",
      sql`now() - interval '30 days'`,
    );

  return await db.transaction().execute(async (trx) => {
    // Delete attachment wraps and recording wraps first (no FK to
    // portal_messages, but the same expired channel set).
    await trx
      .deleteFrom("portal_attachments")
      .where("channel_id", "in", expiredChannels)
      .execute();

    await trx
      .deleteFrom("portal_recordings")
      .where("channel_id", "in", expiredChannels)
      .execute();

    const result = await trx
      .deleteFrom("portal_messages")
      .where("channel_id", "in", expiredChannels)
      .executeTakeFirst();

    return Number(result.numDeletedRows);
  });
}

// ---------------------------------------------------------------------------
// Job handler registration
// ---------------------------------------------------------------------------

/**
 * Register the portal message expiry handler. Called once at startup.
 *
 * The runForAllTenants callback iterates active org schemas and calls
 * expirePortalMessages for each. The handler re-enqueues itself with
 * the configured delay so the chain never breaks.
 */
export function registerPortalExpiryHandler(
  jobQueue: JobQueue,
  runForAllTenants: () => Promise<void>,
  intervalMs: number = DEFAULT_PORTAL_EXPIRY_INTERVAL_MS,
): void {
  registerRecurringHandler(
    jobQueue,
    PORTAL_EXPIRY_QUEUE,
    runForAllTenants,
    intervalMs,
  );
}

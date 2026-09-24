/**
 * PII retention purge job.
 *
 * Recurring daily job that hard-deletes closed tickets whose last activity
 * (latest followups.created_at) is older than org_config.pii_retention_days.
 *
 * A client row (along with phone, email, portal channel, and account) is
 * deleted only when that client's last ticket is the one being purged:
 * clients with any open or recently-active ticket are untouched.
 *
 * Deletion order: blobs first (recordings, attachments), then tracked_calls
 * rows (no FK), then ticket rows (DB cascades handle child tables), then
 * orphaned clients.
 *
 * Provider-side call/message/recording logs for purged tickets are enqueued
 * onto the "log-deletion" queue so telephony provider records are cleaned up
 * asynchronously.
 *
 * Logs row counts per org schema and nothing else (no IDs, no PII).
 */

import { sql } from "kysely";
import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "./queue.js";
import type { OrgSchema, OrgId, TicketId, ClientId } from "@care-y/shared";
import { registerRecurringHandler } from "./ensure-recurring.js";
import { enqueueLogDeletion } from "./log-deletion.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PII_RETENTION_QUEUE = "pii-retention-purge";
export const PII_RETENTION_INTERVAL_MS = 24 * 60 * 60 * 1000; // daily

// ---------------------------------------------------------------------------
// Per-ticket cascade (reusable by manual delete features)
// ---------------------------------------------------------------------------

export interface TicketPurgeCounts {
  readonly blobsDeleted: number;
  readonly logDeletionsEnqueued: number;
}

/**
 * Hard-delete a single ticket and all associated data.
 *
 * Call within a transaction. Blobs must be deleted BEFORE rows, because an
 * orphaned blob is harmless while a dangling DB row causes 404s on reads.
 *
 * Cascade from the tickets FK handles: followups, recordings, attachments,
 * ticket_key_wraps, ticket_dependencies, share_links, intake_form_responses,
 * intake_key_wraps, notification_outbox, email_reply_tokens,
 * escalation_rule_firings, ticket_read_cursors, ticket_watchers,
 * portal_messages, portal_attachments, portal_recordings (via followups or
 * channel cascade), portal_reply_key_wraps (via followups cascade),
 * followup_reactions (via followups cascade).
 *
 * Tracked_calls has no FK constraint and must be cleared explicitly.
 * Audit_log.ticket_id has no FK (soft reference) and is left as-is.
 */
export async function purgeTicket(
  trx: Transaction<TenantDatabase>,
  ticketId: TicketId,
  blobStore: BlobStore,
  jobQueue: JobQueue,
  orgId: OrgId,
): Promise<TicketPurgeCounts> {
  let blobsDeleted = 0;
  let logDeletionsEnqueued = 0;

  // 1. Collect blob keys for recordings and attachments (before row cascade)
  const recordings = await trx
    .selectFrom("recordings")
    .select(["blob_key"])
    .where("ticket_id", "=", ticketId)
    .execute();

  const attachments = await trx
    .selectFrom("attachments")
    .select(["blob_key"])
    .where("ticket_id", "=", ticketId)
    .execute();

  // 2. Delete blobs first (orphaned blob is harmless, dangling row is not)
  for (const rec of recordings) {
    await blobStore.delete(rec.blob_key);
    blobsDeleted++;
  }
  for (const att of attachments) {
    await blobStore.delete(att.blob_key);
    blobsDeleted++;
  }

  // 3. Enqueue provider-side log deletion for tracked calls/messages
  const trackedCalls = await trx
    .selectFrom("tracked_calls")
    .select(["call_sid"])
    .where("ticket_id", "=", ticketId)
    .execute();

  for (const call of trackedCalls) {
    await enqueueLogDeletion(jobQueue, {
      orgId,
      resourceType: "call",
      resourceId: call.call_sid,
    });
    logDeletionsEnqueued++;
  }

  // 4. Clear tracked_calls (no FK, must delete explicitly)
  await trx
    .deleteFrom("tracked_calls")
    .where("ticket_id", "=", ticketId)
    .execute();

  // 5. Delete the ticket row. DB cascades handle all FK children.
  await trx.deleteFrom("tickets").where("id", "=", ticketId).execute();

  return { blobsDeleted, logDeletionsEnqueued };
}

// ---------------------------------------------------------------------------
// Per-client cascade (reusable by manual client delete feature)
// ---------------------------------------------------------------------------

export interface ClientPurgeCounts {
  readonly ticketsPurged: number;
  readonly blobsDeleted: number;
  readonly logDeletionsEnqueued: number;
}

/**
 * Hard-delete a client and all their data: tickets (with blob and log
 * cleanup), portal channels, client account, phone row, and email row.
 *
 * The client_merge_events table has RESTRICT on both client_id columns.
 * Merge events referencing this client must be deleted before the client
 * row. This function handles that.
 *
 * Callers must ensure this is appropriate (all tickets are eligible for
 * purge, or this is a manual full-delete). This function does NOT check
 * ticket status or retention eligibility.
 */
export async function purgeClient(
  trx: Transaction<TenantDatabase>,
  clientId: ClientId,
  blobStore: BlobStore,
  jobQueue: JobQueue,
  orgId: OrgId,
): Promise<ClientPurgeCounts> {
  let ticketsPurged = 0;
  let blobsDeleted = 0;
  let logDeletionsEnqueued = 0;

  // 1. Purge all tickets for this client
  const tickets = await trx
    .selectFrom("tickets")
    .select("id")
    .where("client_id", "=", clientId)
    .execute();

  for (const ticket of tickets) {
    const counts = await purgeTicket(
      trx,
      ticket.id,
      blobStore,
      jobQueue,
      orgId,
    );
    ticketsPurged++;
    blobsDeleted += counts.blobsDeleted;
    logDeletionsEnqueued += counts.logDeletionsEnqueued;
  }

  // 2. Clear client_merge_events (RESTRICT FK, must delete before client)
  await trx
    .deleteFrom("client_merge_events")
    .where((eb) =>
      eb.or([
        eb("primary_client_id", "=", clientId),
        eb("secondary_client_id", "=", clientId),
      ]),
    )
    .execute();

  // 3. Capture phone_id and email_id before deleting client
  const clientRow = await trx
    .selectFrom("clients")
    .select(["phone_id", "email_id"])
    .where("id", "=", clientId)
    .executeTakeFirst();

  // 4. Delete the client row. DB cascades handle:
  //    portal_channels (and their portal_messages, portal_attachments,
  //    portal_recordings), client_accounts (and client_account_sessions).
  await trx.deleteFrom("clients").where("id", "=", clientId).execute();

  // 5. Delete orphaned phone and email rows (no other client references them)
  if (clientRow?.phone_id != null) {
    const otherPhoneRef = await trx
      .selectFrom("clients")
      .select("id")
      .where("phone_id", "=", clientRow.phone_id)
      .executeTakeFirst();
    if (otherPhoneRef === undefined) {
      await trx
        .deleteFrom("phones")
        .where("id", "=", clientRow.phone_id)
        .execute();
    }
  }

  if (clientRow?.email_id != null) {
    const otherEmailRef = await trx
      .selectFrom("clients")
      .select("id")
      .where("email_id", "=", clientRow.email_id)
      .executeTakeFirst();
    if (otherEmailRef === undefined) {
      await trx
        .deleteFrom("emails")
        .where("id", "=", clientRow.email_id)
        .execute();
    }
  }

  return { ticketsPurged, blobsDeleted, logDeletionsEnqueued };
}

// ---------------------------------------------------------------------------
// Anchor query: tickets eligible for purge
// ---------------------------------------------------------------------------

/**
 * Returns ticket IDs for closed tickets whose most recent follow-up
 * created_at is older than the cutoff date. The followups_ticket_activity_idx
 * (migration 044) makes this lateral max efficient.
 *
 * Tickets with no follow-ups at all use tickets.created_at as their last
 * activity (a ticket with no activity is as old as it gets).
 */
export async function findPurgeableTickets(
  db: Kysely<TenantDatabase>,
  cutoff: Date,
): Promise<readonly { ticketId: TicketId; clientId: ClientId }[]> {
  const rows = await db
    .selectFrom("tickets as t")
    .leftJoin(
      (eb) =>
        eb
          .selectFrom("followups")
          .select(["ticket_id", eb.fn.max("created_at").as("last_activity")])
          .groupBy("ticket_id")
          .as("fa"),
      (join) => join.onRef("fa.ticket_id", "=", "t.id"),
    )
    .select(["t.id as ticketId", "t.client_id as clientId"])
    .where("t.status", "=", "closed")
    .where(sql`COALESCE(fa.last_activity, t.created_at)`, "<", cutoff)
    .execute();

  return rows;
}

// ---------------------------------------------------------------------------
// Per-tenant sweep
// ---------------------------------------------------------------------------

export interface TenantPurgeResult {
  readonly ticketsPurged: number;
  readonly clientsPurged: number;
  readonly blobsDeleted: number;
  readonly logDeletionsEnqueued: number;
}

/**
 * Runs the PII retention purge for a single tenant. Returns counts for
 * logging (never IDs or PII).
 *
 * After purging eligible tickets, identifies clients whose entire ticket
 * set was purged (no remaining tickets) and purges those clients.
 */
export async function purgeTenant(
  tDb: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  jobQueue: JobQueue,
  orgId: OrgId,
): Promise<TenantPurgeResult> {
  // Read retention config
  const config = await tDb
    .selectFrom("org_config")
    .select("pii_retention_days")
    .executeTakeFirst();

  // NULL, 0, or negative: skip this tenant
  if (config?.pii_retention_days == null || config.pii_retention_days <= 0) {
    return {
      ticketsPurged: 0,
      clientsPurged: 0,
      blobsDeleted: 0,
      logDeletionsEnqueued: 0,
    };
  }

  const cutoff = new Date(
    Date.now() - config.pii_retention_days * 24 * 60 * 60 * 1000,
  );

  const purgeableTickets = await findPurgeableTickets(tDb, cutoff);
  if (purgeableTickets.length === 0) {
    return {
      ticketsPurged: 0,
      clientsPurged: 0,
      blobsDeleted: 0,
      logDeletionsEnqueued: 0,
    };
  }

  let totalTicketsPurged = 0;
  let totalBlobsDeleted = 0;
  let totalLogDeletions = 0;
  let totalClientsPurged = 0;

  // Collect unique client IDs whose tickets are being purged
  const affectedClientIds = new Set<ClientId>();
  for (const ticket of purgeableTickets) {
    affectedClientIds.add(ticket.clientId);
  }

  // Purge tickets in a transaction
  await tDb.transaction().execute(async (trx) => {
    for (const ticket of purgeableTickets) {
      const counts = await purgeTicket(
        trx,
        ticket.ticketId,
        blobStore,
        jobQueue,
        orgId,
      );
      totalTicketsPurged++;
      totalBlobsDeleted += counts.blobsDeleted;
      totalLogDeletions += counts.logDeletionsEnqueued;
    }

    // For each affected client, check if they have any remaining tickets.
    // If not, purge the client entirely.
    for (const clientId of affectedClientIds) {
      const remaining = await trx
        .selectFrom("tickets")
        .select("id")
        .where("client_id", "=", clientId)
        .limit(1)
        .executeTakeFirst();

      if (remaining === undefined) {
        const clientCounts = await purgeClient(
          trx,
          clientId,
          blobStore,
          jobQueue,
          orgId,
        );
        totalClientsPurged++;
        // purgeClient already counted its own tickets, but those were
        // already deleted above, so the additional counts come from
        // the client-level cleanup (merge events, phone, email, etc.)
        totalBlobsDeleted += clientCounts.blobsDeleted;
        totalLogDeletions += clientCounts.logDeletionsEnqueued;
      }
    }
  });

  return {
    ticketsPurged: totalTicketsPurged,
    clientsPurged: totalClientsPurged,
    blobsDeleted: totalBlobsDeleted,
    logDeletionsEnqueued: totalLogDeletions,
  };
}

// ---------------------------------------------------------------------------
// Job handler registration
// ---------------------------------------------------------------------------

/**
 * Register the PII retention purge handler. Called once at startup.
 *
 * Iterates all active tenant schemas, reads each tenant's retention config,
 * and purges eligible data. One bad tenant does not kill the sweep (per-tenant
 * try/catch). Logs counts per tenant and nothing else.
 */
export function registerPiiRetentionHandler(
  jobQueue: JobQueue,
  getTenantDb: (orgSchema: OrgSchema) => Kysely<TenantDatabase>,
  blobStore: BlobStore,
  listActiveOrgs: () => Promise<readonly { id: OrgId; schema: OrgSchema }[]>,
): void {
  registerRecurringHandler(
    jobQueue,
    PII_RETENTION_QUEUE,
    async () => {
      const orgs = await listActiveOrgs();

      for (const org of orgs) {
        try {
          const tDb = getTenantDb(org.schema);
          const result = await purgeTenant(tDb, blobStore, jobQueue, org.id);

          if (result.ticketsPurged > 0 || result.clientsPurged > 0) {
            console.log(
              `PII retention purge: ${String(result.ticketsPurged)} tickets, ` +
                `${String(result.clientsPurged)} clients purged in ${org.schema}`,
            );
          }
        } catch (err: unknown) {
          console.error(
            `PII retention purge failed for schema ${org.schema}:`,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
    },
    PII_RETENTION_INTERVAL_MS,
  );
}

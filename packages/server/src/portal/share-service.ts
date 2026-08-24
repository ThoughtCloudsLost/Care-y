/**
 * Share link service.
 *
 * Creates, consumes, lists, and cleans up one-time encrypted share links.
 * The server stores ciphertext only. The share key lives exclusively in
 * the URL fragment (RFC 3986: never sent to the server). The plaintext
 * never reaches the server.
 *
 * Each share row is paired with a `share_link` follow-up in the same
 * transaction so the case record keeps the content (encrypted under the
 * ticket key, decryptable by volunteers via the org key path).
 */

import { type Kysely, sql } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { JobQueue } from "../jobs/queue.js";
import { ValidationError } from "../errors.js";
import type {
  ShareId,
  TicketId,
  FollowupId,
  UserId,
  OrgSchema,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SHARE_EXPIRY_MS = 72 * 60 * 60 * 1000;
export const SHARE_CLEANUP_QUEUE = "share-cleanup";
export const SHARE_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

/**
 * Thrown when the ticket referenced by a share link does not exist in the
 * tenant schema. The route maps this to a 4xx tRPC error with no internals
 * leaked.
 */
export class ShareTicketNotFoundError extends ValidationError {
  constructor() {
    super("Ticket not found");
  }
}

// ---------------------------------------------------------------------------
// Input / output types
// ---------------------------------------------------------------------------

export interface CreateShareRow {
  readonly shareId: ShareId;
  readonly ticketId: TicketId;
  readonly ciphertext: Buffer;
  readonly followUpId: FollowupId;
  readonly encryptedFollowUp: Buffer;
  readonly createdBy: UserId;
}

export type OpenShareResult =
  | { status: "ready"; ciphertext: Buffer }
  | { status: "opened" }
  | { status: "expired" }
  | { status: "not_found" };

export interface ShareStatusRow {
  readonly id: ShareId;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly readAt: Date | null;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Inserts a share link row and a `share_link` follow-up in one transaction.
 * The follow-up carries the content encrypted under the ticket key so
 * the case record stays complete even after the share link expires.
 */
export async function createShare(
  db: Kysely<TenantDatabase>,
  input: CreateShareRow,
): Promise<{ expiresAt: Date }> {
  // Verify the ticket exists before opening the transaction
  const ticket = await db
    .selectFrom("tickets")
    .select("id")
    .where("id", "=", input.ticketId)
    .executeTakeFirst();

  if (!ticket) {
    throw new ShareTicketNotFoundError();
  }

  const expiresAt = new Date(Date.now() + SHARE_EXPIRY_MS);

  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("share_links")
      .values({
        id: input.shareId,
        ticket_id: input.ticketId,
        ciphertext: input.ciphertext,
        expires_at: expiresAt,
      })
      .execute();

    await trx
      .insertInto("followups")
      .values({
        id: input.followUpId,
        ticket_id: input.ticketId,
        source: "volunteer",
        type: "share_link",
        encrypted_content: input.encryptedFollowUp,
        created_by: input.createdBy,
        key_generation: null,
        event_params: { shareId: input.shareId },
      })
      .execute();
  });

  return { expiresAt };
}

/**
 * Atomic one-time consume. Exactly one of N racing callers gets the
 * ciphertext; the rest see "opened". The `UPDATE ... WHERE read_at IS
 * NULL` predicate is the race gate.
 */
export async function openShare(
  db: Kysely<TenantDatabase>,
  shareId: ShareId,
): Promise<OpenShareResult> {
  return db.transaction().execute(async (trx) => {
    // Gate: only one racing caller matches read_at IS NULL.
    // RETURNING yields the (unmodified) ciphertext column value.
    const row = await trx
      .updateTable("share_links")
      .set({ read_at: sql<Date>`now()` })
      .where("id", "=", shareId)
      .where("read_at", "is", null)
      .where("expires_at", ">", sql<Date>`now()`)
      .returning("ciphertext")
      .executeTakeFirst();

    if (row?.ciphertext != null) {
      // Winner clears the blob; tombstone keeps read_at until expiry cleanup
      await trx
        .updateTable("share_links")
        .set({ ciphertext: null })
        .where("id", "=", shareId)
        .execute();
      return { status: "ready" as const, ciphertext: row.ciphertext };
    }

    // Classify for honest client messaging
    const existing = await trx
      .selectFrom("share_links")
      .select(["read_at", "expires_at"])
      .where("id", "=", shareId)
      .executeTakeFirst();

    if (existing === undefined) return { status: "not_found" as const };
    if (existing.read_at !== null) return { status: "opened" as const };
    return { status: "expired" as const };
  });
}

/**
 * Lists share link status rows for a ticket. Never returns ciphertext.
 */
export async function listSharesByTicket(
  db: Kysely<TenantDatabase>,
  ticketId: TicketId,
): Promise<ShareStatusRow[]> {
  const rows = await db
    .selectFrom("share_links")
    .select(["id", "created_at", "expires_at", "read_at"])
    .where("ticket_id", "=", ticketId)
    .orderBy("created_at", "desc")
    .execute();

  return rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    readAt: r.read_at,
  }));
}

/**
 * Daily cross-tenant cleanup. Deletes share rows whose expiry has passed.
 * Follows the `registerMediaCleanupHandler` precedent: iterate org
 * schemas, delete expired rows, self-enqueue in `finally` so the chain
 * survives a failing run.
 */
export function registerShareCleanupHandler(
  jobQueue: JobQueue,
  getTenantDb: (orgSchema: OrgSchema) => Kysely<TenantDatabase>,
  listOrgSchemas: () => Promise<OrgSchema[]>,
): void {
  jobQueue.process(SHARE_CLEANUP_QUEUE, async () => {
    try {
      const schemas = await listOrgSchemas();

      for (const schema of schemas) {
        await getTenantDb(schema)
          .deleteFrom("share_links")
          .where("expires_at", "<", sql<Date>`now()`)
          .execute();
      }
    } finally {
      await jobQueue.enqueue(
        SHARE_CLEANUP_QUEUE,
        {},
        { delay: SHARE_CLEANUP_INTERVAL_MS },
      );
    }
  });
}

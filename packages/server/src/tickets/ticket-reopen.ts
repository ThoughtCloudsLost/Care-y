/**
 * Shared reopen helper for closed tickets.
 *
 * Extracted from resolveOrCreateTicket's reopen branch so that both the
 * telephony/intake path and the portal client-reply path share one
 * reopen implementation. Two copies would inevitably drift.
 *
 * Sets status to "open" and inserts a status_opened system follow-up
 * in a single call pair (caller provides the surrounding transaction).
 */

import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";

/**
 * Reopen a closed ticket and record the status_opened system event.
 *
 * The caller must provide a transactional context when atomicity with
 * other writes is needed. Both `Kysely` and
 * `Transaction` satisfy the type; pass whichever scope is appropriate.
 *
 * Returns the ticket id (same as the input, for chaining convenience).
 */
export async function reopenClosedTicket(
  trxOrDb: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  ticketId: string,
): Promise<string> {
  await trxOrDb
    .updateTable("tickets")
    .set({ status: "open" })
    .where("id", "=", ticketId)
    .execute();

  await trxOrDb
    .insertInto("followups")
    .values({
      ticket_id: ticketId,
      source: "system",
      type: "status_opened",
      encrypted_content: Buffer.alloc(0),
    })
    .execute();

  return ticketId;
}

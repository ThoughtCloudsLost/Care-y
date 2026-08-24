/**
 * Per-object ticket access control (defense-in-depth).
 *
 * Encryption prevents external attackers from reading ticket data.
 * This module prevents internal lateral access between volunteers:
 * a volunteer with the org key cannot access tickets outside their
 * assignment/queue scope.
 *
 * Three-level check (short-circuits on first match):
 * 1. Direct assignment (tickets.assigned_to === userId)
 * 2. CC/ticket watcher (ticket_watchers row exists)
 * 3. Queue membership (queue_assignments row exists for ticket's queue)
 *
 * A volunteer removed from a queue retains access to tickets directly
 * assigned to them (check 1). They need to finish or release those tickets.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { ForbiddenError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import type { TicketId, UserId } from "@care-y/shared";

export interface TicketAccessChecker {
  assertAccess(userId: UserId, ticketId: TicketId): Promise<void>;
  canAccess(userId: UserId, ticketId: TicketId): Promise<boolean>;
}

export function createTicketAccessChecker(
  db: Kysely<TenantDatabase>,
): TicketAccessChecker {
  async function canAccess(
    userId: UserId,
    ticketId: TicketId,
  ): Promise<boolean> {
    // 1. Ticket must exist
    const ticket = await db
      .selectFrom("tickets")
      .select(["id", "assigned_to", "queue_id"])
      .where("id", "=", ticketId)
      .executeTakeFirst();

    if (!ticket) return false;

    // 2. Direct assignment check
    if (ticket.assigned_to === userId) return true;

    // 3. CC/watcher check
    const watcher = await db
      .selectFrom("ticket_watchers")
      .select("user_id")
      .where("ticket_id", "=", ticketId)
      .where("user_id", "=", userId)
      .executeTakeFirst();

    if (watcher) return true;

    // 4. Queue membership check
    const queueMember = await db
      .selectFrom("queue_assignments")
      .select("user_id")
      .where("queue_id", "=", ticket.queue_id)
      .where("user_id", "=", userId)
      .executeTakeFirst();

    return queueMember !== undefined;
  }

  async function assertAccess(
    userId: UserId,
    ticketId: TicketId,
  ): Promise<void> {
    const allowed = await canAccess(userId, ticketId);
    if (!allowed) {
      throw new ForbiddenError(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }
  }

  return { assertAccess, canAccess };
}

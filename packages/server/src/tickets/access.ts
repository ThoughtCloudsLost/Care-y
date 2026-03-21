/**
 * Per-object ticket access control (defense-in-depth).
 *
 * Encryption prevents external attackers from reading ticket data.
 * This module prevents internal lateral access between volunteers:
 * a volunteer with the org key cannot access tickets outside their
 * assignment/queue scope.
 *
 * Currently all authenticated volunteers can access all tickets
 * (no queue-level permissions yet). A future change tightens this with
 * queue_assignments and CC list checks.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { ForbiddenError } from "../errors.js";

export interface TicketAccessChecker {
  assertAccess(userId: string, ticketId: string): Promise<void>;
  canAccess(userId: string, ticketId: string): Promise<boolean>;
}

export function createTicketAccessChecker(
  db: Kysely<TenantDatabase>,
): TicketAccessChecker {
  async function canAccess(userId: string, ticketId: string): Promise<boolean> {
    // Check ticket exists. All authenticated volunteers can access all tickets.
    // Future: tighten to assigned_to match OR queue membership OR CC list.
    const ticket = await db
      .selectFrom("tickets")
      .select(["id"])
      .where("id", "=", ticketId)
      .executeTakeFirst();

    return ticket !== undefined;
  }

  async function assertAccess(userId: string, ticketId: string): Promise<void> {
    const allowed = await canAccess(userId, ticketId);
    if (!allowed) {
      throw new ForbiddenError("Access denied to this ticket");
    }
  }

  return { assertAccess, canAccess };
}

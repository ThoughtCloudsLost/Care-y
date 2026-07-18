/**
 * Ticket assignment service.
 *
 * - Round-robin: assign to shift volunteer with fewest open tickets
 * - Take: volunteer self-assigns an unassigned ticket
 * - Release: volunteer self-unassigns, ticket returns to unassigned
 *
 * All operations are plaintext metadata. No decryption.
 * Optimistic concurrency via WHERE assigned_to IS NULL guards TOCTOU races.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { ShiftProvider } from "./shift-provider.js";
import type { TicketAccessChecker } from "./access.js";
import { ForbiddenError, NotFoundError, TicketError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";

export interface AssignmentService {
  /**
   * Round-robin assignment: find the volunteer on shift with the fewest
   * open tickets and assign. Falls back to next-future-shift if no one
   * is currently on shift. Returns the assigned user ID (null if no
   * candidates available or lost a race).
   */
  assignRoundRobin(ticketId: string): Promise<{ assignedTo: string | null }>;

  /** Self-assign: volunteer takes an unassigned ticket. */
  take(userId: string, ticketId: string): Promise<void>;

  /** Self-unassign: volunteer releases their assigned ticket. */
  release(userId: string, ticketId: string): Promise<void>;

  /**
   * Assign a ticket to a specific volunteer, or unassign if targetUserId is null.
   * Validates that the actor has access and that the target user is an active
   * volunteer in the same org. Replaces the separate take/release client flows.
   */
  assignTo(
    actorId: string,
    ticketId: string,
    targetUserId: string | null,
  ): Promise<void>;
}

export function createAssignmentService(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
  shiftProvider: ShiftProvider,
): AssignmentService {
  async function countOpenTickets(
    userIds: string[],
  ): Promise<Map<string, number>> {
    if (userIds.length === 0) return new Map();

    const rows = await db
      .selectFrom("tickets")
      .select(["assigned_to"])
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .where("assigned_to", "in", userIds)
      .where("status", "=", "open")
      .groupBy("assigned_to")
      .execute();

    // Initialize all candidates to 0 (volunteers with no open tickets
    // won't appear in the GROUP BY result).
    const counts = new Map<string, number>();
    for (const uid of userIds) counts.set(uid, 0);
    for (const row of rows) {
      if (row.assigned_to !== null) {
        counts.set(row.assigned_to, Number(row.count));
      }
    }
    return counts;
  }

  function pickFewest(counts: Map<string, number>): string | null {
    let best: string | null = null;
    let bestCount = Infinity;
    for (const [uid, count] of counts) {
      if (count < bestCount) {
        bestCount = count;
        best = uid;
      }
    }
    return best;
  }

  async function createSystemFollowUp(
    ticketId: string,
    type: string,
    eventParams?: Record<string, unknown>,
  ): Promise<void> {
    await db
      .insertInto("followups")
      .values({
        ticket_id: ticketId,
        source: "system",
        type,
        encrypted_content: Buffer.alloc(0),
        event_params: eventParams ?? null,
      })
      .execute();
  }

  return {
    async assignRoundRobin(ticketId) {
      const ticket = await db
        .selectFrom("tickets")
        .select(["id", "queue_id", "status"])
        .where("id", "=", ticketId)
        .executeTakeFirst();

      if (!ticket) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
      if (ticket.status !== "open") {
        throw new TicketError(ErrorCode.CANNOT_ASSIGN_CLOSED_TICKET);
      }

      // Try current shift first
      let candidates = await shiftProvider.getCurrentShiftVolunteers(
        ticket.queue_id,
      );

      if (candidates.length === 0) {
        // No-coverage: fall back to next future shift
        candidates = await shiftProvider.getNextShiftVolunteers(
          ticket.queue_id,
        );
      }

      if (candidates.length === 0) {
        return { assignedTo: null };
      }

      const counts = await countOpenTickets(candidates);
      const chosen = pickFewest(counts);

      if (chosen === null) {
        return { assignedTo: null };
      }

      // Optimistic concurrency: only assign if still unassigned.
      // If another request raced us, numUpdatedRows === 0n.
      const result = await db
        .updateTable("tickets")
        .set({ assigned_to: chosen })
        .where("id", "=", ticketId)
        .where("assigned_to", "is", null)
        .executeTakeFirst();

      if (result.numUpdatedRows === BigInt(0)) {
        return { assignedTo: null };
      }

      await createSystemFollowUp(ticketId, "volunteer_assigned", {
        userId: chosen,
      });
      return { assignedTo: chosen };
    },

    async take(userId, ticketId) {
      await access.assertAccess(userId, ticketId);

      const ticket = await db
        .selectFrom("tickets")
        .select(["id", "assigned_to", "status"])
        .where("id", "=", ticketId)
        .executeTakeFirst();

      if (!ticket) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
      if (ticket.status !== "open") {
        throw new TicketError(ErrorCode.CANNOT_TAKE_CLOSED_TICKET);
      }
      if (ticket.assigned_to !== null) {
        throw new TicketError(ErrorCode.TICKET_ALREADY_ASSIGNED);
      }

      // Optimistic concurrency: WHERE assigned_to IS NULL guards the TOCTOU race.
      const result = await db
        .updateTable("tickets")
        .set({ assigned_to: userId })
        .where("id", "=", ticketId)
        .where("assigned_to", "is", null)
        .executeTakeFirst();

      if (result.numUpdatedRows === BigInt(0)) {
        throw new TicketError(ErrorCode.TICKET_ALREADY_ASSIGNED);
      }

      await createSystemFollowUp(ticketId, "volunteer_assigned", { userId });
    },

    async release(userId, ticketId) {
      await access.assertAccess(userId, ticketId);

      const ticket = await db
        .selectFrom("tickets")
        .select(["id", "assigned_to"])
        .where("id", "=", ticketId)
        .executeTakeFirst();

      if (!ticket) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
      if (ticket.assigned_to !== userId) {
        throw new TicketError(ErrorCode.NOT_ASSIGNED_TO_TICKET);
      }

      await db
        .updateTable("tickets")
        .set({ assigned_to: null })
        .where("id", "=", ticketId)
        .execute();

      await createSystemFollowUp(ticketId, "volunteer_unassigned", { userId });
    },

    async assignTo(actorId, ticketId, targetUserId) {
      await access.assertAccess(actorId, ticketId);

      const ticket = await db
        .selectFrom("tickets")
        .select(["id", "status", "assigned_to"])
        .where("id", "=", ticketId)
        .executeTakeFirst();

      if (!ticket) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
      if (ticket.status !== "open") {
        throw new TicketError(ErrorCode.CANNOT_ASSIGN_CLOSED_TICKET);
      }

      if (targetUserId !== null) {
        // Verify target is an active user in this tenant schema
        const targetUser = await db
          .selectFrom("users")
          .select(["id", "is_active"])
          .where("id", "=", targetUserId)
          .executeTakeFirst();

        if (targetUser?.is_active !== true) {
          throw new ForbiddenError(ErrorCode.INVALID_TARGET_USER);
        }
      }

      // Skip DB write if assignment is already in the desired state
      if (ticket.assigned_to === targetUserId) return;

      await db
        .updateTable("tickets")
        .set({ assigned_to: targetUserId })
        .where("id", "=", ticketId)
        .execute();

      if (targetUserId !== null) {
        await createSystemFollowUp(ticketId, "volunteer_assigned", {
          userId: targetUserId,
        });
      } else if (ticket.assigned_to !== null) {
        await createSystemFollowUp(ticketId, "volunteer_unassigned", {
          userId: ticket.assigned_to,
        });
      }
    },
  };
}

/**
 * Ticket dependency service.
 *
 * Manages "depends on" links between tickets. A ticket cannot be
 * closed until all its dependencies are resolved (status = 'closed').
 * Only direct cycle detection (depth 1) is implemented. Deep cycles
 * are unlikely at mutual-aid scale (200-2,000 tickets).
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TicketAccessChecker } from "./access.js";
import { TicketError, NotFoundError, ValidationError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";

export interface DependencyRecord {
  readonly ticketId: string;
  readonly dependsOnTicketId: string;
  readonly createdAt: Date;
}

export interface DependencyService {
  add(
    userId: string,
    ticketId: string,
    dependsOnTicketId: string,
  ): Promise<DependencyRecord>;
  remove(
    userId: string,
    ticketId: string,
    dependsOnTicketId: string,
  ): Promise<void>;
  listForTicket(ticketId: string): Promise<DependencyRecord[]>;
  allResolved(ticketId: string): Promise<boolean>;
}

function toRecord(row: {
  ticket_id: string;
  depends_on_ticket_id: string;
  created_at: Date;
}): DependencyRecord {
  return {
    ticketId: row.ticket_id,
    dependsOnTicketId: row.depends_on_ticket_id,
    createdAt: row.created_at,
  };
}

export function createDependencyService(
  db: Kysely<TenantDatabase>,
  access?: TicketAccessChecker,
): DependencyService {
  return {
    async add(userId, ticketId, dependsOnTicketId): Promise<DependencyRecord> {
      // Verify the caller has access to both tickets
      if (access) {
        await access.assertAccess(userId, ticketId);
        await access.assertAccess(userId, dependsOnTicketId);
      }

      // Reject self-dependency
      if (ticketId === dependsOnTicketId) {
        throw new ValidationError(ErrorCode.SELF_DEPENDENCY);
      }

      // Verify both tickets exist
      const [ticket, dep] = await Promise.all([
        db
          .selectFrom("tickets")
          .select("id")
          .where("id", "=", ticketId)
          .executeTakeFirst(),
        db
          .selectFrom("tickets")
          .select("id")
          .where("id", "=", dependsOnTicketId)
          .executeTakeFirst(),
      ]);

      if (!ticket) throw new NotFoundError(ErrorCode.TICKET_NOT_FOUND);
      if (!dep) throw new NotFoundError(ErrorCode.DEPENDENCY_TICKET_NOT_FOUND);

      // Check for direct circular dependency (A->B and B->A)
      const reverse = await db
        .selectFrom("ticket_dependencies")
        .select("ticket_id")
        .where("ticket_id", "=", dependsOnTicketId)
        .where("depends_on_ticket_id", "=", ticketId)
        .executeTakeFirst();

      if (reverse) {
        throw new TicketError(ErrorCode.CIRCULAR_DEPENDENCY);
      }

      const row = await db
        .insertInto("ticket_dependencies")
        .values({
          ticket_id: ticketId,
          depends_on_ticket_id: dependsOnTicketId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async remove(userId, ticketId, dependsOnTicketId): Promise<void> {
      // Verify the caller has access to the source ticket
      if (access) {
        await access.assertAccess(userId, ticketId);
      }

      // Idempotent: no error if dependency doesn't exist
      await db
        .deleteFrom("ticket_dependencies")
        .where("ticket_id", "=", ticketId)
        .where("depends_on_ticket_id", "=", dependsOnTicketId)
        .execute();
    },

    async listForTicket(ticketId): Promise<DependencyRecord[]> {
      const rows = await db
        .selectFrom("ticket_dependencies")
        .selectAll()
        .where("ticket_id", "=", ticketId)
        .orderBy("created_at", "asc")
        .execute();

      return rows.map(toRecord);
    },

    async allResolved(ticketId): Promise<boolean> {
      // Join ticket_dependencies with tickets to check all deps are closed
      const unresolved = await db
        .selectFrom("ticket_dependencies")
        .innerJoin(
          "tickets",
          "tickets.id",
          "ticket_dependencies.depends_on_ticket_id",
        )
        .select("ticket_dependencies.depends_on_ticket_id")
        .where("ticket_dependencies.ticket_id", "=", ticketId)
        .where("tickets.status", "!=", "closed")
        .executeTakeFirst();

      return unresolved === undefined;
    },
  };
}

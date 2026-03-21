/**
 * Ticket CRUD service.
 *
 * Implements the one-ticket-per-client model (ADR-018):
 * - Each client has at most one open ticket
 * - Creating a ticket for a client with a closed ticket reopens it
 * - Close checks unresolved dependencies
 * - Status transitions are recorded as system follow-ups
 * - No activity timestamps on the ticket row (ADR-018 section 7)
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TicketAccessChecker } from "./access.js";
import { NotFoundError, TicketError, MergeError } from "../errors.js";
import { createDependencyService } from "./dependency-service.js";

export interface TicketRecord {
  readonly id: string;
  readonly clientId: string;
  readonly queueId: string;
  readonly status: string;
  readonly priority: string;
  readonly onHold: boolean;
  readonly assignedTo: string | null;
  readonly encryptedTitle: Buffer;
  readonly encryptedDescription: Buffer;
  readonly keyGeneration: string;
  readonly createdAt: Date;
}

export interface CreateTicketInput {
  readonly clientId: string;
  readonly queueId: string;
  readonly encryptedTitle: Buffer;
  readonly encryptedDescription: Buffer;
  readonly priority: string;
  readonly keyGeneration: string;
}

export interface UpdateTicketInput {
  readonly ticketId: string;
  readonly status?: string;
  readonly priority?: string;
  readonly queueId?: string;
  readonly onHold?: boolean;
}

export interface TicketService {
  create(userId: string, input: CreateTicketInput): Promise<TicketRecord>;
  findById(ticketId: string, userId: string): Promise<TicketRecord>;
  list(opts: {
    queueId?: string;
    status?: string;
    limit: number;
    cursor?: string;
  }): Promise<TicketRecord[]>;
  update(userId: string, input: UpdateTicketInput): Promise<TicketRecord>;
  close(userId: string, ticketId: string): Promise<TicketRecord>;
  reopen(
    userId: string,
    ticketId: string,
    newKeyGeneration: string,
  ): Promise<TicketRecord>;
}

function toRecord(row: {
  id: string;
  client_id: string;
  queue_id: string;
  status: string;
  priority: string;
  on_hold: boolean;
  assigned_to: string | null;
  encrypted_title: Buffer;
  encrypted_description: Buffer;
  key_generation: string;
  created_at: Date;
}): TicketRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    queueId: row.queue_id,
    status: row.status,
    priority: row.priority,
    onHold: row.on_hold,
    assignedTo: row.assigned_to,
    encryptedTitle: row.encrypted_title,
    encryptedDescription: row.encrypted_description,
    keyGeneration: row.key_generation,
    createdAt: row.created_at,
  };
}

export function createTicketService(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
): TicketService {
  const depService = createDependencyService(db);

  async function createSystemFollowUp(
    ticketId: string,
    type: string,
  ): Promise<void> {
    await db
      .insertInto("followups")
      .values({
        ticket_id: ticketId,
        source: "system",
        type,
        encrypted_content: Buffer.from("system"),
        encrypted_read_state: Buffer.from("unread"),
      })
      .execute();
  }

  return {
    async create(userId, input) {
      // Validate queue exists
      const queue = await db
        .selectFrom("queues")
        .select("id")
        .where("id", "=", input.queueId)
        .where("is_active", "=", true)
        .executeTakeFirst();
      if (!queue) throw new NotFoundError("Queue not found");

      // Validate client exists and is not merged
      const client = await db
        .selectFrom("clients")
        .select(["id", "merged_into"])
        .where("id", "=", input.clientId)
        .executeTakeFirst();
      if (!client) throw new NotFoundError("Client not found");
      if (client.merged_into !== null) {
        throw new MergeError("Client has been merged into another client");
      }

      // One-ticket-per-client: check for existing ticket
      const existing = await db
        .selectFrom("tickets")
        .selectAll()
        .where("client_id", "=", input.clientId)
        .executeTakeFirst();

      if (existing) {
        if (existing.status === "open") {
          // Already has an open ticket, return it
          return toRecord(existing);
        }
        // Closed ticket exists: reopen it (ADR-018 section 2)
        const reopened = await db
          .updateTable("tickets")
          .set({
            status: "open",
            key_generation: input.keyGeneration,
            encrypted_title: input.encryptedTitle,
            encrypted_description: input.encryptedDescription,
            queue_id: input.queueId,
            priority: input.priority,
          })
          .where("id", "=", existing.id)
          .returningAll()
          .executeTakeFirstOrThrow();

        await createSystemFollowUp(existing.id, "status_change");
        return toRecord(reopened);
      }

      // No existing ticket: create new
      const row = await db
        .insertInto("tickets")
        .values({
          client_id: input.clientId,
          queue_id: input.queueId,
          encrypted_title: input.encryptedTitle,
          encrypted_description: input.encryptedDescription,
          priority: input.priority,
          key_generation: input.keyGeneration,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async findById(ticketId, userId) {
      await access.assertAccess(userId, ticketId);

      const row = await db
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", ticketId)
        .executeTakeFirst();

      if (!row) throw new NotFoundError("Ticket not found");
      return toRecord(row);
    },

    async list(opts) {
      let query = db.selectFrom("tickets").selectAll();

      if (opts.queueId !== undefined) {
        query = query.where("queue_id", "=", opts.queueId);
      }
      if (opts.status !== undefined) {
        query = query.where("status", "=", opts.status);
      }
      if (opts.cursor !== undefined) {
        // Keyset pagination: skip past the cursor row.
        // Uses subquery to keep timestamp comparison in PostgreSQL,
        // avoiding JS Date millisecond precision loss (PostgreSQL
        // stores timestamptz with microsecond precision).
        const cursorId = opts.cursor;
        const cursorCreatedAt = db
          .selectFrom("tickets")
          .select("created_at")
          .where("id", "=", cursorId);

        query = query.where((eb) =>
          eb.or([
            eb("created_at", ">", cursorCreatedAt),
            eb.and([
              eb("created_at", "=", cursorCreatedAt),
              eb("id", ">", cursorId),
            ]),
          ]),
        );
      }

      const rows = await query
        .orderBy("created_at", "asc")
        .orderBy("id", "asc")
        .limit(opts.limit)
        .execute();

      return rows.map(toRecord);
    },

    async update(userId, input) {
      await access.assertAccess(userId, input.ticketId);

      const updates: Record<string, unknown> = {};
      if (input.status !== undefined) updates.status = input.status;
      if (input.priority !== undefined) updates.priority = input.priority;
      if (input.queueId !== undefined) updates.queue_id = input.queueId;
      if (input.onHold !== undefined) updates.on_hold = input.onHold;

      if (Object.keys(updates).length === 0) {
        const existing = await db
          .selectFrom("tickets")
          .selectAll()
          .where("id", "=", input.ticketId)
          .executeTakeFirst();
        if (!existing) throw new NotFoundError("Ticket not found");
        return toRecord(existing);
      }

      const row = await db
        .updateTable("tickets")
        .set(updates)
        .where("id", "=", input.ticketId)
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError("Ticket not found");

      // Create system follow-ups for state changes
      if (input.onHold !== undefined) {
        await createSystemFollowUp(input.ticketId, "hold_change");
      }
      if (input.priority !== undefined) {
        await createSystemFollowUp(input.ticketId, "priority_change");
      }
      if (input.status !== undefined) {
        await createSystemFollowUp(input.ticketId, "status_change");
      }

      return toRecord(row);
    },

    async close(userId, ticketId) {
      await access.assertAccess(userId, ticketId);

      // Check unresolved dependencies
      const resolved = await depService.allResolved(ticketId);
      if (!resolved) {
        throw new TicketError(
          "Cannot close ticket with unresolved dependencies",
        );
      }

      const row = await db
        .updateTable("tickets")
        .set({ status: "closed" })
        .where("id", "=", ticketId)
        .where("status", "=", "open")
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError("Ticket not found or already closed");

      await createSystemFollowUp(ticketId, "status_change");
      return toRecord(row);
    },

    async reopen(userId, ticketId, newKeyGeneration) {
      await access.assertAccess(userId, ticketId);

      const row = await db
        .updateTable("tickets")
        .set({
          status: "open",
          key_generation: newKeyGeneration,
        })
        .where("id", "=", ticketId)
        .where("status", "=", "closed")
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError("Ticket not found or already open");

      await createSystemFollowUp(ticketId, "status_change");
      return toRecord(row);
    },
  };
}

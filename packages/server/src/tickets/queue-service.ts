/**
 * Queue CRUD service.
 *
 * Queues are plaintext organizational containers. Queue names are not
 * sensitive (05-tickets.md section 5.1). Each queue has an escalate_days
 * threshold used by the auto-escalation job.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { NotFoundError } from "../errors.js";

export interface QueueRecord {
  readonly id: string;
  readonly name: string;
  readonly escalateDays: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
}

export interface QueueService {
  create(input: { name: string; escalateDays?: number }): Promise<QueueRecord>;
  listActive(): Promise<QueueRecord[]>;
  update(
    queueId: string,
    input: { name?: string; escalateDays?: number },
  ): Promise<QueueRecord>;
  /** Returns the queue name for a given ID, or "unknown" if not found. */
  getQueueName(queueId: string): Promise<string>;
}

function toRecord(row: {
  id: string;
  name: string;
  escalate_days: number;
  is_active: boolean;
  created_at: Date;
}): QueueRecord {
  return {
    id: row.id,
    name: row.name,
    escalateDays: row.escalate_days,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function createQueueService(db: Kysely<TenantDatabase>): QueueService {
  return {
    async create(input) {
      const row = await db
        .insertInto("queues")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- queue names are plaintext by design (05-tickets.md section 5.1)
          name: input.name,
          ...(input.escalateDays !== undefined
            ? { escalate_days: input.escalateDays }
            : {}),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return toRecord(row);
    },

    async listActive() {
      const rows = await db
        .selectFrom("queues")
        .selectAll()
        .where("is_active", "=", true)
        .orderBy("created_at", "asc")
        .execute();

      return rows.map(toRecord);
    },

    async update(queueId, input) {
      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.escalateDays !== undefined)
        updates.escalate_days = input.escalateDays;

      if (Object.keys(updates).length === 0) {
        // No fields to update, just return current
        const existing = await db
          .selectFrom("queues")
          .selectAll()
          .where("id", "=", queueId)
          .executeTakeFirst();

        if (!existing) throw new NotFoundError("Queue not found");
        return toRecord(existing);
      }

      const row = await db
        .updateTable("queues")
        .set(updates)
        .where("id", "=", queueId)
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError("Queue not found");
      return toRecord(row);
    },

    async getQueueName(queueId) {
      const row = await db
        .selectFrom("queues")
        .select("name")
        .where("id", "=", queueId)
        .executeTakeFirst();
      return row?.name ?? "unknown";
    },
  };
}

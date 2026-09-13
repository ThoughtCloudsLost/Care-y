/**
 * Queue CRUD service.
 *
 * Queue names, colors, and icons are encrypted with the org key (org-key
 * tier) before storage. The server never sees the plaintext values. Each
 * queue carries a sort_order for client-controlled ordering and an
 * escalate_days threshold used by the auto-escalation job. Color and icon
 * are nullable: queues created before migration 078 have no value and the
 * client renders defaults.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import type { QueueId } from "@care-y/shared";

export interface QueueRecord {
  readonly id: QueueId;
  readonly encryptedName: Buffer;
  readonly encryptedColor: Buffer | null;
  readonly encryptedIcon: Buffer | null;
  readonly sortOrder: number;
  readonly escalateDays: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly openCount: string;
  readonly closedCount: string;
  readonly holdCount: string;
  readonly memberCount: string;
  readonly urgentCount: string;
}

export interface QueueService {
  create(input: {
    encryptedName: Buffer;
    encryptedColor: Buffer;
    encryptedIcon: Buffer;
    escalateDays?: number;
  }): Promise<QueueRecord>;
  listActive(): Promise<QueueRecord[]>;
  update(
    queueId: QueueId,
    input: {
      encryptedName?: Buffer;
      encryptedColor?: Buffer;
      encryptedIcon?: Buffer;
      escalateDays?: number;
    },
  ): Promise<QueueRecord>;
  reorder(items: { queueId: QueueId; sortOrder: number }[]): Promise<void>;
  delete(queueId: QueueId, reassignTo?: QueueId): Promise<void>;
}

interface QueueRow {
  id: QueueId;
  encrypted_name: Buffer;
  encrypted_color: Buffer | null;
  encrypted_icon: Buffer | null;
  sort_order: number;
  escalate_days: number;
  is_active: boolean;
  created_at: Date;
}

interface QueueCounts {
  openCount?: string;
  closedCount?: string;
  holdCount?: string;
  memberCount?: string;
  urgentCount?: string;
}

function toRecord(row: QueueRow, counts: QueueCounts = {}): QueueRecord {
  return {
    id: row.id,
    encryptedName: row.encrypted_name,
    encryptedColor: row.encrypted_color,
    encryptedIcon: row.encrypted_icon,
    sortOrder: row.sort_order,
    escalateDays: row.escalate_days,
    isActive: row.is_active,
    createdAt: row.created_at,
    openCount: counts.openCount ?? "0",
    closedCount: counts.closedCount ?? "0",
    holdCount: counts.holdCount ?? "0",
    memberCount: counts.memberCount ?? "0",
    urgentCount: counts.urgentCount ?? "0",
  };
}

// Named parameters: both sides are QueueId, and swapping them moves every
// ticket into the queue being deleted.
async function reassignTickets(
  tx: Kysely<TenantDatabase>,
  params: { fromQueueId: QueueId; toQueueId: QueueId },
): Promise<void> {
  const target = await tx
    .selectFrom("queues")
    .select("id")
    .where("id", "=", params.toQueueId)
    .executeTakeFirst();
  if (!target) {
    throw new NotFoundError(ErrorCode.QUEUE_NOT_FOUND);
  }
  await tx
    .updateTable("tickets")
    .set({ queue_id: params.toQueueId })
    .where("queue_id", "=", params.fromQueueId)
    .execute();
}

export function createQueueService(db: Kysely<TenantDatabase>): QueueService {
  return {
    async create(input) {
      const { max } = await db
        .selectFrom("queues")
        .select((eb) =>
          eb.fn.coalesce(eb.fn.max("sort_order"), eb.lit(0)).as("max"),
        )
        .executeTakeFirstOrThrow();

      const nextSortOrder = max + 1;

      const row = await db
        .insertInto("queues")
        .values({
          encrypted_name: input.encryptedName,
          encrypted_color: input.encryptedColor,
          encrypted_icon: input.encryptedIcon,
          sort_order: nextSortOrder,
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
        .selectFrom("queues as q")
        .select([
          "q.id",
          "q.encrypted_name",
          "q.encrypted_color",
          "q.encrypted_icon",
          "q.sort_order",
          "q.escalate_days",
          "q.is_active",
          "q.created_at",
        ])
        .select((eb) => [
          eb
            .selectFrom("tickets as t")
            .select((sb) => sb.fn.countAll<string>().as("cnt"))
            .whereRef("t.queue_id", "=", "q.id")
            .where("t.status", "=", "open")
            .as("openCount"),
          eb
            .selectFrom("tickets as t")
            .select((sb) => sb.fn.countAll<string>().as("cnt"))
            .whereRef("t.queue_id", "=", "q.id")
            .where("t.status", "=", "closed")
            .as("closedCount"),
          eb
            .selectFrom("tickets as t")
            .select((sb) => sb.fn.countAll<string>().as("cnt"))
            .whereRef("t.queue_id", "=", "q.id")
            .where("t.status", "=", "open")
            .where("t.on_hold", "=", true)
            .as("holdCount"),
          eb
            .selectFrom("queue_assignments as qa")
            .select((sb) => sb.fn.countAll<string>().as("cnt"))
            .whereRef("qa.queue_id", "=", "q.id")
            .as("memberCount"),
          eb
            .selectFrom("tickets as t")
            .select((sb) => sb.fn.countAll<string>().as("cnt"))
            .whereRef("t.queue_id", "=", "q.id")
            .where("t.status", "=", "open")
            .where("t.on_hold", "=", false)
            .where("t.priority", "=", "urgent")
            .as("urgentCount"),
        ])
        .where("q.is_active", "=", true)
        .orderBy("q.sort_order", "asc")
        .execute();

      return rows.map((r) =>
        toRecord(r, {
          openCount: String(r.openCount ?? 0),
          closedCount: String(r.closedCount ?? 0),
          holdCount: String(r.holdCount ?? 0),
          memberCount: String(r.memberCount ?? 0),
          urgentCount: String(r.urgentCount ?? 0),
        }),
      );
    },

    async update(queueId, input) {
      const updates: Record<string, unknown> = {};
      if (input.encryptedName !== undefined)
        updates.encrypted_name = input.encryptedName;
      if (input.encryptedColor !== undefined)
        updates.encrypted_color = input.encryptedColor;
      if (input.encryptedIcon !== undefined)
        updates.encrypted_icon = input.encryptedIcon;
      if (input.escalateDays !== undefined)
        updates.escalate_days = input.escalateDays;

      if (Object.keys(updates).length === 0) {
        // No fields to update, just return current
        const existing = await db
          .selectFrom("queues")
          .selectAll()
          .where("id", "=", queueId)
          .executeTakeFirst();

        if (!existing) throw new NotFoundError(ErrorCode.QUEUE_NOT_FOUND);
        return toRecord(existing);
      }

      const row = await db
        .updateTable("queues")
        .set(updates)
        .where("id", "=", queueId)
        .returningAll()
        .executeTakeFirst();

      if (!row) throw new NotFoundError(ErrorCode.QUEUE_NOT_FOUND);
      return toRecord(row);
    },

    async reorder(items) {
      await db.transaction().execute(async (trx) => {
        // Set all targeted sort_orders to negative values first to avoid
        // unique constraint conflicts during the swap.
        for (const item of items) {
          await trx
            .updateTable("queues")
            .set({ sort_order: -item.sortOrder })
            .where("id", "=", item.queueId)
            .execute();
        }

        // Now set the actual positive values.
        for (const item of items) {
          await trx
            .updateTable("queues")
            .set({ sort_order: item.sortOrder })
            .where("id", "=", item.queueId)
            .execute();
        }
      });
    },

    async delete(queueId, reassignTo) {
      await db.transaction().execute(async (tx) => {
        const queueCount = await tx
          .selectFrom("queues")
          .select(db.fn.countAll<string>().as("count"))
          .executeTakeFirstOrThrow();
        if (Number(queueCount.count) <= 1) {
          throw new ValidationError(ErrorCode.CANNOT_DELETE_LAST_QUEUE);
        }

        const exists = await tx
          .selectFrom("queues")
          .select("id")
          .where("id", "=", queueId)
          .executeTakeFirst();
        if (!exists) {
          throw new NotFoundError(ErrorCode.QUEUE_NOT_FOUND);
        }

        const ticketCount = await tx
          .selectFrom("tickets")
          .select(db.fn.countAll<string>().as("count"))
          .where("queue_id", "=", queueId)
          .executeTakeFirstOrThrow();

        if (Number(ticketCount.count) > 0) {
          if (reassignTo === undefined) {
            throw new ValidationError(ErrorCode.QUEUE_HAS_TICKETS);
          }
          await reassignTickets(tx, {
            fromQueueId: queueId,
            toQueueId: reassignTo,
          });
        }

        await tx
          .deleteFrom("queue_assignments")
          .where("queue_id", "=", queueId)
          .execute();
        await tx
          .deleteFrom("queue_watchers")
          .where("queue_id", "=", queueId)
          .execute();
        await tx.deleteFrom("queues").where("id", "=", queueId).execute();
      });
    },
  };
}

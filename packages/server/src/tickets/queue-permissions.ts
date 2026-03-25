/**
 * Queue membership management.
 *
 * Controls which volunteers can see tickets in which queues.
 * Plain join table, no roles. Idempotent add/remove via ON CONFLICT DO NOTHING.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

export interface QueuePermissionsService {
  /** Get all queue IDs this user is assigned to. */
  getUserQueues(userId: string): Promise<string[]>;
  /** Check if user is assigned to a specific queue. */
  isMember(userId: string, queueId: string): Promise<boolean>;
  /** Add user to queue. Idempotent (no-op if already member). */
  addMember(queueId: string, userId: string): Promise<void>;
  /** Remove user from queue. Idempotent (no-op if not member). */
  removeMember(queueId: string, userId: string): Promise<void>;
  /** List all members of a queue. Returns user IDs. */
  getQueueMembers(queueId: string): Promise<string[]>;
}

export function createQueuePermissionsService(
  db: Kysely<TenantDatabase>,
): QueuePermissionsService {
  return {
    async getUserQueues(userId) {
      const rows = await db
        .selectFrom("queue_assignments")
        .select("queue_id")
        .where("user_id", "=", userId)
        .execute();
      return rows.map((r) => r.queue_id);
    },

    async isMember(userId, queueId) {
      const row = await db
        .selectFrom("queue_assignments")
        .select("queue_id")
        .where("queue_id", "=", queueId)
        .where("user_id", "=", userId)
        .executeTakeFirst();
      return row !== undefined;
    },

    async addMember(queueId, userId) {
      await db
        .insertInto("queue_assignments")
        .values({ queue_id: queueId, user_id: userId })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();
    },

    async removeMember(queueId, userId) {
      await db
        .deleteFrom("queue_assignments")
        .where("queue_id", "=", queueId)
        .where("user_id", "=", userId)
        .execute();
    },

    async getQueueMembers(queueId) {
      const rows = await db
        .selectFrom("queue_assignments")
        .select("user_id")
        .where("queue_id", "=", queueId)
        .execute();
      return rows.map((r) => r.user_id);
    },
  };
}

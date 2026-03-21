/**
 * CC/Watcher management for tickets and queues.
 *
 * Per-ticket watchers: volunteers subscribe/unsubscribe to ticket updates.
 * Queue watchers: admin-configured per-queue notification subscriptions.
 *
 * Watchers are not the same as assignment. The ticket owner (assigned_to)
 * is tracked on the ticket row. The notification recipient builder
 * deduplicates owner + watchers + mentions.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { TicketAccessChecker } from "./access.js";

export interface WatchersService {
  /** Subscribe a user to ticket updates (CC). Idempotent. */
  subscribe(userId: string, ticketId: string): Promise<void>;
  /** Unsubscribe a user from ticket updates. Idempotent. */
  unsubscribe(userId: string, ticketId: string): Promise<void>;
  /** Get all watcher user IDs for a specific ticket. */
  getTicketWatchers(ticketId: string): Promise<string[]>;
  /** Check if user is watching a ticket. */
  isWatching(userId: string, ticketId: string): Promise<boolean>;

  // Queue-level watchers (admin-configured)
  /** Add a user as a queue watcher. Idempotent. Admin action. */
  addQueueWatcher(queueId: string, userId: string): Promise<void>;
  /** Remove a user from queue watchers. Idempotent. Admin action. */
  removeQueueWatcher(queueId: string, userId: string): Promise<void>;
  /** Get all queue watcher user IDs for a queue. */
  getQueueWatchers(queueId: string): Promise<string[]>;
}

export function createWatchersService(
  db: Kysely<TenantDatabase>,
  access: TicketAccessChecker,
): WatchersService {
  return {
    async subscribe(userId, ticketId) {
      await access.assertAccess(userId, ticketId);
      await db
        .insertInto("ticket_watchers")
        .values({ ticket_id: ticketId, user_id: userId })
        .onConflict((oc) => oc.columns(["ticket_id", "user_id"]).doNothing())
        .execute();
    },

    async unsubscribe(userId, ticketId) {
      // No access check on unsubscribe: a user should always be able to
      // remove themselves from a watch list even if their queue access was
      // revoked (stale subscription row).
      await db
        .deleteFrom("ticket_watchers")
        .where("ticket_id", "=", ticketId)
        .where("user_id", "=", userId)
        .execute();
    },

    async getTicketWatchers(ticketId) {
      const rows = await db
        .selectFrom("ticket_watchers")
        .select("user_id")
        .where("ticket_id", "=", ticketId)
        .execute();
      return rows.map((r) => r.user_id);
    },

    async isWatching(userId, ticketId) {
      const row = await db
        .selectFrom("ticket_watchers")
        .select("user_id")
        .where("ticket_id", "=", ticketId)
        .where("user_id", "=", userId)
        .executeTakeFirst();
      return row !== undefined;
    },

    async addQueueWatcher(queueId, userId) {
      await db
        .insertInto("queue_watchers")
        .values({ queue_id: queueId, user_id: userId })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();
    },

    async removeQueueWatcher(queueId, userId) {
      await db
        .deleteFrom("queue_watchers")
        .where("queue_id", "=", queueId)
        .where("user_id", "=", userId)
        .execute();
    },

    async getQueueWatchers(queueId) {
      const rows = await db
        .selectFrom("queue_watchers")
        .select("user_id")
        .where("queue_id", "=", queueId)
        .execute();
      return rows.map((r) => r.user_id);
    },
  };
}

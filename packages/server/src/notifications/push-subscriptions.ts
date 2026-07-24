// Push subscription lifecycle management (subscribe, unsubscribe, list).
// Delivery is handled by push.ts; this module manages the subscription records.

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

export interface PushSubscriptionRecord {
  readonly endpoint: string;
  readonly createdAt: Date;
}

export interface PushSubscriptionService {
  /** Upsert a push subscription. Idempotent on endpoint. */
  subscribe(
    userId: string,
    endpoint: string,
    keyP256dh: string,
    keyAuth: string,
  ): Promise<void>;

  /** Remove a push subscription by endpoint, scoped to the requesting user. */
  unsubscribe(userId: string, endpoint: string): Promise<void>;

  /** List current user's push subscriptions (endpoints + timestamps). */
  listForUser(userId: string): Promise<readonly PushSubscriptionRecord[]>;
}

export function createPushSubscriptionService(
  db: Kysely<TenantDatabase>,
): PushSubscriptionService {
  return {
    async subscribe(userId, endpoint, keyP256dh, keyAuth): Promise<void> {
      await db
        .insertInto("push_subscriptions")
        .values({
          user_id: userId,
          endpoint,
          key_p256dh: keyP256dh,
          key_auth: keyAuth,
        })
        .onConflict((oc) =>
          oc.column("endpoint").doUpdateSet({
            user_id: userId,
            key_p256dh: keyP256dh,
            key_auth: keyAuth,
          }),
        )
        .execute();
    },

    async unsubscribe(userId, endpoint): Promise<void> {
      await db
        .deleteFrom("push_subscriptions")
        .where("endpoint", "=", endpoint)
        .where("user_id", "=", userId)
        .execute();
    },

    async listForUser(userId): Promise<readonly PushSubscriptionRecord[]> {
      const rows = await db
        .selectFrom("push_subscriptions")
        .select(["endpoint", "created_at"])
        .where("user_id", "=", userId)
        .execute();
      return rows.map((r) => ({
        endpoint: r.endpoint,
        createdAt: r.created_at,
      }));
    },
  };
}

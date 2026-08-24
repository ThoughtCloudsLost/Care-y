// Web Push notification delivery (DIY, metadata-only, no payload encryption).
// Sends empty-body POST requests to push service endpoints.
// Expired/invalid subscriptions are cleaned up automatically.

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { VapidKeys } from "./vapid.js";
import { signVapidJwt } from "./push-crypto.js";
import type { UserId } from "@care-y/shared";

export interface PushNotificationSender {
  /** Sends an empty-body push to all subscriptions for the given user IDs. */
  sendToUsers(
    tDb: Kysely<TenantDatabase>,
    userIds: readonly UserId[],
    ttlSeconds?: number,
  ): Promise<void>;

  /** Removes a subscription that the push service reports as expired/invalid. */
  removeSubscription(
    tDb: Kysely<TenantDatabase>,
    endpoint: string,
  ): Promise<void>;
}

export function createPushNotificationSender(
  vapidKeys: VapidKeys,
  contactEmail: string,
): PushNotificationSender {
  const subject = `mailto:${contactEmail}`;

  async function sendToEndpoint(
    endpoint: string,
    ttlSeconds: number,
  ): Promise<{ ok: boolean; status: number }> {
    const url = new URL(endpoint);
    const audience = url.origin;

    const { authorization } = signVapidJwt({
      audience,
      subject,
      publicKey: vapidKeys.publicKey,
      privateKeyPem: vapidKeys.privateKeyPem,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authorization,
        TTL: String(ttlSeconds),
        "Content-Length": "0",
        Urgency: "normal",
      },
    });

    return { ok: response.ok, status: response.status };
  }

  return {
    async sendToUsers(tDb, userIds, ttlSeconds = 86400) {
      if (userIds.length === 0) return;

      const subscriptions = await tDb
        .selectFrom("push_subscriptions")
        .select(["endpoint", "user_id"])
        .where("user_id", "in", [...userIds])
        .execute();

      const expiredEndpoints: string[] = [];

      await Promise.allSettled(
        subscriptions.map(async (sub) => {
          const result = await sendToEndpoint(sub.endpoint, ttlSeconds);
          // 404 or 410 means the subscription is expired/invalid
          if (result.status === 404 || result.status === 410) {
            expiredEndpoints.push(sub.endpoint);
          }
        }),
      );

      // Clean up expired subscriptions
      if (expiredEndpoints.length > 0) {
        await tDb
          .deleteFrom("push_subscriptions")
          .where("endpoint", "in", expiredEndpoints)
          .execute();
      }
    },

    async removeSubscription(tDb, endpoint) {
      await tDb
        .deleteFrom("push_subscriptions")
        .where("endpoint", "=", endpoint)
        .execute();
    },
  };
}

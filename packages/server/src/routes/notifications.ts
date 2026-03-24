/**
 * Notification tRPC router.
 *
 * Push subscription CRUD and VAPID public key retrieval.
 * SSE stream is a raw HTTP handler (not tRPC, see index.ts).
 */

import { router, volunteerProcedure, withErrorWrapping } from "../trpc/trpc.js";
import type { PushNotificationSender } from "../notifications/push.js";
import {
  pushSubscriptionInputSchema,
  unsubscribePushInputSchema,
} from "@care-y/shared";

export interface NotificationRouterDeps {
  readonly pushSender: PushNotificationSender;
  readonly vapidPublicKey: string;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createNotificationRouter(deps: NotificationRouterDeps) {
  return router({
    /** Returns the VAPID public key for push subscription. */
    vapidPublicKey: volunteerProcedure.query(() => {
      return { publicKey: deps.vapidPublicKey };
    }),

    /** Subscribe this device for push notifications. */
    subscribePush: volunteerProcedure
      .input(pushSubscriptionInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          await ctx.org.tenantDb
            .insertInto("push_subscriptions")
            .values({
              user_id: ctx.user.id,
              endpoint: input.endpoint,
              key_p256dh: input.keys.p256dh,
              key_auth: input.keys.auth,
            })
            .onConflict((oc) =>
              oc.column("endpoint").doUpdateSet({
                user_id: ctx.user.id,
                key_p256dh: input.keys.p256dh,
                key_auth: input.keys.auth,
              }),
            )
            .execute();
          return { subscribed: true };
        }),
      ),

    /** Unsubscribe a push endpoint. */
    unsubscribePush: volunteerProcedure
      .input(unsubscribePushInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          await deps.pushSender.removeSubscription(
            ctx.org.tenantDb,
            input.endpoint,
          );
          return { unsubscribed: true };
        }),
      ),

    /** List current user's push subscriptions (endpoints only, for settings UI). */
    listPushSubscriptions: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const subs = await ctx.org.tenantDb
          .selectFrom("push_subscriptions")
          .select(["endpoint", "created_at"])
          .where("user_id", "=", ctx.user.id)
          .execute();
        return { subscriptions: subs };
      }),
    ),
  });
}

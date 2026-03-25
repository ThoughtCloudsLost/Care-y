/**
 * Notification tRPC router.
 *
 * Push subscription CRUD and VAPID public key retrieval.
 * SSE stream is a raw HTTP handler (not tRPC, see index.ts).
 */

import { router, volunteerProcedure, withErrorWrapping } from "../trpc/trpc.js";
import type { PushSubscriptionService } from "../notifications/push-subscriptions.js";
import type { OrgContext } from "../trpc/context.js";
import {
  pushSubscriptionInputSchema,
  unsubscribePushInputSchema,
} from "@care-y/shared";

export interface NotificationRouterDeps {
  readonly createPushSubSvc: (
    tDb: OrgContext["tenantDb"],
  ) => PushSubscriptionService;
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
          const svc = deps.createPushSubSvc(ctx.org.tenantDb);
          await svc.subscribe(
            ctx.user.id,
            input.endpoint,
            input.keys.p256dh,
            input.keys.auth,
          );
          return { subscribed: true };
        }),
      ),

    /** Unsubscribe a push endpoint. */
    unsubscribePush: volunteerProcedure
      .input(unsubscribePushInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = deps.createPushSubSvc(ctx.org.tenantDb);
          await svc.unsubscribe(input.endpoint);
          return { unsubscribed: true };
        }),
      ),

    /** List current user's push subscriptions (endpoints only, for settings UI). */
    listPushSubscriptions: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const svc = deps.createPushSubSvc(ctx.org.tenantDb);
        const subscriptions = await svc.listForUser(ctx.user.id);
        return { subscriptions };
      }),
    ),
  });
}

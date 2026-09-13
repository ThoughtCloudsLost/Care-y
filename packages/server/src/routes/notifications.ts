/**
 * Notification tRPC router.
 *
 * Push subscription CRUD, VAPID public key retrieval, and notification
 * preference management (get/set/reset with scope cascade).
 * SSE stream is a raw HTTP handler (not tRPC, see index.ts).
 */

import { router, volunteerProcedure, withErrorWrapping } from "../trpc/trpc.js";
import type { PushSubscriptionService } from "../notifications/push-subscriptions.js";
import type { NotificationPreferencesService } from "../notifications/preferences.js";
import type { OrgContext } from "../trpc/context.js";
import {
  pushSubscriptionInputSchema,
  unsubscribePushInputSchema,
  setPreferenceInputSchema,
  resetPreferencesInputSchema,
} from "@care-y/shared";

export interface NotificationRouterDeps {
  readonly createPushSubSvc: (
    tDb: OrgContext["tenantDb"],
  ) => PushSubscriptionService;
  readonly vapidPublicKey: string;
  readonly preferencesService: NotificationPreferencesService;
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
          await svc.unsubscribe(ctx.user.id, input.endpoint);
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

    /** Returns all notification preference rows for the calling user. */
    getPreferences: volunteerProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const rows = await deps.preferencesService.listForUser(
          ctx.org.tenantDb,
          ctx.user.id,
        );
        return { preferences: rows };
      }),
    ),

    /**
     * Upserts a single notification preference row. The subject is always
     * the session user (never accepted from input). Scope referent validation
     * runs before the write: queue must exist, ticket requires a key wrap
     * for the caller. Both failures produce NOT_FOUND to prevent existence
     * oracles.
     */
    setPreference: volunteerProcedure.input(setPreferenceInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const scope = {
          scopeType: input.scopeType,
          scopeId: input.scopeId,
        } as const;

        await deps.preferencesService.assertScopeAccessible(
          ctx.org.tenantDb,
          ctx.user.id,
          scope,
        );

        await deps.preferencesService.set(
          ctx.org.tenantDb,
          ctx.user.id,
          scope,
          input.eventType,
          input.channel,
          input.enabled,
        );

        return { saved: true };
      }),
    ),

    /** Deletes preference override rows for the calling user. */
    resetPreferences: volunteerProcedure
      .input(resetPreferencesInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const scope =
            input.scopeType !== undefined
              ? ({
                  scopeType: input.scopeType,
                  scopeId: input.scopeId ?? null,
                } as const)
              : undefined;

          await deps.preferencesService.reset(
            ctx.org.tenantDb,
            ctx.user.id,
            scope,
          );

          return { reset: true };
        }),
      ),
  });
}

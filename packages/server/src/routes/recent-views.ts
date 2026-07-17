import { putRecentViewsSchema } from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { router, authedProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { createRecentViewsService } from "../users/recent-views-service.js";

/**
 * Recently-viewed history: a single opaque ECIES envelope per user,
 * sealed client-side to the user's own vol_public. Self-service only;
 * no admin surface, no cross-user reads.
 */
// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createRecentViewsRouter() {
  return router({
    get: authedProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const service = createRecentViewsService(ctx.org.tenantDb);
        const envelope = await service.get(ctx.session.userId);
        if (!envelope) return { envelope: null };
        return {
          envelope: {
            ephemeralPoint: encode(envelope.ephemeralPoint),
            nonce: encode(envelope.nonce),
            wrappedPayload: encode(envelope.wrappedPayload),
          },
        };
      }),
    ),

    put: authedProcedure.input(putRecentViewsSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const service = createRecentViewsService(ctx.org.tenantDb);
        await service.put(ctx.session.userId, {
          ephemeralPoint: Buffer.from(input.ephemeralPoint, "base64"),
          nonce: Buffer.from(input.nonce, "base64"),
          wrappedPayload: Buffer.from(input.wrappedPayload, "base64"),
        });
        return { success: true as const };
      }),
    ),
  });
}

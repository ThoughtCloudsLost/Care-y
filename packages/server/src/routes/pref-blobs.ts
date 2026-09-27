import { prefBlobGetInputSchema, prefBlobPutInputSchema } from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { router, authedProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { createPrefBlobService } from "../users/pref-blob-service.js";

/**
 * Per-user preference documents: one opaque ECIES envelope per
 * (user, kind), sealed client-side to the user's own vol_public.
 * Self-service only; the user id comes from the session, so there is
 * no admin surface and no cross-user read.
 */
// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createPrefBlobsRouter() {
  return router({
    get: authedProcedure.input(prefBlobGetInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const service = createPrefBlobService(ctx.org.tenantDb);
        const envelope = await service.get(ctx.session.userId, input.kind);
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

    put: authedProcedure.input(prefBlobPutInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const service = createPrefBlobService(ctx.org.tenantDb);
        await service.put(ctx.session.userId, input.kind, {
          ephemeralPoint: Buffer.from(input.envelope.ephemeralPoint, "base64"),
          nonce: Buffer.from(input.envelope.nonce, "base64"),
          wrappedPayload: Buffer.from(input.envelope.wrappedPayload, "base64"),
        });
        return { success: true as const };
      }),
    ),
  });
}

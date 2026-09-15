/**
 * CRUD routes for PhoneGreeting and SMSResponse content.
 *
 * Greeting endpoints require WRITE_CALL_GREETINGS permission.
 * SMS auto-reply endpoints require WRITE_AUTOMATIC_REPLIES permission.
 * Business logic is delegated to TelephonyContentService, which
 * creates repositories internally from the tenant-scoped DB.
 */

import { Permission } from "@care-y/shared";
import {
  router,
  authed2faProcedure,
  requireRole,
  withErrorWrapping,
} from "../trpc/trpc.js";
import {
  createTelephonyContentService,
  type TelephonyContentService,
} from "../telephony/telephony-content-service.js";
import type { OrgContext } from "../trpc/context.js";
import {
  createGreetingInputSchema,
  updateGreetingInputSchema,
  deleteGreetingInputSchema,
  listGreetingsInputSchema,
  uploadGreetingAudioInputSchema,
  createAudioGreetingInputSchema,
  getGreetingAudioInputSchema,
  createSmsResponseInputSchema,
  updateSmsResponseInputSchema,
  deleteSmsResponseInputSchema,
  listSmsResponsesInputSchema,
} from "@care-y/shared";
import type { BlobStore } from "../storage/store.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import { InternalError } from "../errors.js";
import { TRPCError } from "@trpc/server";

const writeCallGreetingsProcedure = authed2faProcedure.use(
  requireRole(Permission.WRITE_CALL_GREETINGS),
);

const writeAutomaticRepliesProcedure = authed2faProcedure.use(
  requireRole(Permission.WRITE_AUTOMATIC_REPLIES),
);

export interface TelephonyContentRouterDeps {
  readonly createService: (
    tenantDb: OrgContext["tenantDb"],
  ) => TelephonyContentService;
  readonly blobStore?: BlobStore;
  readonly uploadLimiter?: RateLimiter;
}

const defaultDeps: TelephonyContentRouterDeps = {
  createService: createTelephonyContentService,
};

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createTelephonyContentRouter(
  deps: TelephonyContentRouterDeps = defaultDeps,
) {
  const { createService, blobStore, uploadLimiter } = deps;

  return router({
    listGreetings: writeCallGreetingsProcedure
      .input(listGreetingsInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createService(ctx.org.tenantDb);
          return svc.listGreetings(input.phoneNumber);
        }),
      ),

    getGreetingAudio: writeCallGreetingsProcedure
      .input(getGreetingAudioInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          if (!blobStore) {
            throw new InternalError("BlobStore not configured");
          }
          const svc = createService(ctx.org.tenantDb);
          return svc.getGreetingAudio(blobStore, input.greetingId);
        }),
      ),

    createGreeting: writeCallGreetingsProcedure
      .input(createGreetingInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createService(ctx.org.tenantDb);
          return svc.createGreeting(input);
        }),
      ),

    updateGreeting: writeCallGreetingsProcedure
      .input(updateGreetingInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createService(ctx.org.tenantDb);
          return svc.updateGreeting(input.id, {
            phoneNumber: input.phoneNumber,
            text: input.text,
            isAudio: input.isAudio,
          });
        }),
      ),

    deleteGreeting: writeCallGreetingsProcedure
      .input(deleteGreetingInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createService(ctx.org.tenantDb);
          await svc.deleteGreeting(input.id);
          return { success: true as const };
        }),
      ),

    uploadGreetingAudio: writeCallGreetingsProcedure
      .input(uploadGreetingAudioInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          if (uploadLimiter) {
            const rateResult = uploadLimiter.check(ctx.user.id);
            if (!rateResult.allowed) {
              throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message: `Upload rate limited. Retry after ${String(Math.ceil(rateResult.retryAfterMs / 1000))}s`,
              });
            }
          }
          if (!blobStore) {
            throw new InternalError("BlobStore not configured");
          }
          const svc = createService(ctx.org.tenantDb);
          return svc.uploadGreetingAudio(
            blobStore,
            ctx.org.orgSchema,
            input.greetingId,
            input.audioBase64,
            input.contentType,
          );
        }),
      ),

    createAudioGreeting: writeCallGreetingsProcedure
      .input(createAudioGreetingInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          if (uploadLimiter) {
            const rateResult = uploadLimiter.check(ctx.user.id);
            if (!rateResult.allowed) {
              throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message: `Upload rate limited. Retry after ${String(Math.ceil(rateResult.retryAfterMs / 1000))}s`,
              });
            }
          }
          if (!blobStore) {
            throw new InternalError("BlobStore not configured");
          }
          const svc = createService(ctx.org.tenantDb);
          return svc.createAudioGreeting(blobStore, ctx.org.orgSchema, input);
        }),
      ),

    listSmsResponses: writeAutomaticRepliesProcedure
      .input(listSmsResponsesInputSchema)
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createService(ctx.org.tenantDb);
          return svc.listSmsResponses(input.locale);
        }),
      ),

    createSmsResponse: writeAutomaticRepliesProcedure
      .input(createSmsResponseInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createService(ctx.org.tenantDb);
          return svc.createSmsResponse(input);
        }),
      ),

    updateSmsResponse: writeAutomaticRepliesProcedure
      .input(updateSmsResponseInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createService(ctx.org.tenantDb);
          return svc.updateSmsResponse(input.id, { text: input.text });
        }),
      ),

    deleteSmsResponse: writeAutomaticRepliesProcedure
      .input(deleteSmsResponseInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createService(ctx.org.tenantDb);
          await svc.deleteSmsResponse(input.id);
          return { success: true as const };
        }),
      ),
  });
}

/**
 * Client-portal tRPC router: public-facing endpoints for the intake form.
 *
 * All procedures use orgProcedure (org-scoped, no auth required).
 * Routes call services only; no DB access or business logic in handlers.
 * Never log input payloads or ciphertext on any path.
 *
 * Later portal features (secure link, client accounts, share links) append
 * procedures here following the append-only convention.
 */

import { z } from "zod";
import { router, orgProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { TRPCError } from "@trpc/server";
import { intakeSubmissionInputSchema } from "@care-y/shared";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { PowVerifier } from "../crypto/pow.js";
import type { IntakeFormService } from "../portal/intake-form-service.js";
import type { NotificationService } from "../notifications/service.js";
import {
  createIntakeTicket,
  IntakeQueueNotConfiguredError,
  IntakeDisabledError,
} from "../portal/intake-service.js";
import { extractClientIp } from "../http/request-utils.js";

export interface ClientPortalRouterDeps {
  readonly submissionLimiter: RateLimiter;
  readonly challengeLimiter: RateLimiter;
  readonly powVerifier: PowVerifier | null;
  readonly intakeFormService: IntakeFormService;
  readonly notificationService: NotificationService;
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createClientPortalRouter(deps: ClientPortalRouterDeps) {
  return router({
    getIntakeConfig: orgProcedure.query(() => ({
      powRequired: deps.powVerifier !== null,
    })),

    getIntakeForm: orgProcedure
      .input(
        z.object({ slug: z.string().min(1).max(80).optional() }).optional(),
      )
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          return deps.intakeFormService.resolvePublicForm(
            ctx.org.tenantDb,
            input?.slug ?? null,
          );
        }),
      ),

    getIntakeChallenge: orgProcedure.query(
      withErrorWrapping(({ ctx }) => {
        if (deps.powVerifier === null) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Proof-of-work is not enabled",
          });
        }

        const ip = extractClientIp(ctx.req);
        const limitResult = deps.challengeLimiter.check(ip);
        if (!limitResult.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Rate limited. Retry after ${String(Math.ceil(limitResult.retryAfterMs / 1000))}s`,
          });
        }

        return deps.powVerifier.createChallenge(ip, 0);
      }),
    ),

    submitIntake: orgProcedure.input(intakeSubmissionInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);

        // 1. Rate limit check
        const limitResult = deps.submissionLimiter.check(ip);
        if (!limitResult.allowed) {
          const retryAfterSeconds = Math.ceil(limitResult.retryAfterMs / 1000);
          console.warn("Intake submission rate limited", {
            orgSlug: ctx.org.orgSlug,
            ip,
            reason: "rate_limit",
          });
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Rate limited. Retry after ${String(retryAfterSeconds)}s`,
          });
        }

        // 2. PoW gate (when enabled)
        if (deps.powVerifier !== null) {
          if (!input.pow) {
            console.warn("Intake submission missing PoW", {
              orgSlug: ctx.org.orgSlug,
              ip,
              reason: "pow_missing",
            });
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Proof-of-work challenge required",
            });
          }

          const verified = deps.powVerifier.verify(
            ip,
            input.pow.challenge,
            input.pow.solution,
          );
          if (!verified) {
            console.warn("Intake submission PoW verification failed", {
              orgSlug: ctx.org.orgSlug,
              ip,
              reason: "pow_failed",
            });
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Proof-of-work challenge failed",
            });
          }
        }

        // 3. Use the org's sealedBox from ctx (resolved by the context
        //    factory from org_config.org_public_key; guaranteed non-null
        //    because orgProcedure returns NOT_FOUND for pre-onboarding orgs)

        // 4. Decode base64 fields to Buffers
        const encryptedTitle = Buffer.from(input.encryptedTitle, "base64");
        const encryptedDescription = Buffer.from(
          input.encryptedDescription,
          "base64",
        );
        const encryptedMessage =
          input.encryptedMessage !== undefined
            ? Buffer.from(input.encryptedMessage, "base64")
            : null;
        const encryptedFormResponse = Buffer.from(
          input.encryptedFormResponse,
          "base64",
        );
        const wrappedTk = Buffer.from(input.wrappedTk, "base64");

        // 5. Delegate to service
        try {
          const result = await createIntakeTicket(
            ctx.org.tenantDb,
            {
              notificationService: deps.notificationService,
              sealedBox: ctx.org.sealedBox,
              orgSchema: ctx.org.orgSchema,
              orgSlug: ctx.org.orgSlug,
            },
            {
              ticketId: input.ticketId,
              followUpId: input.followUpId ?? null,
              encryptedTitle,
              encryptedDescription,
              encryptedMessage,
              encryptedFormResponse,
              formId: input.formId ?? null,
              wrappedTk,
              resolvedQueueId: input.resolvedQueueId ?? null,
              resolvedPriority: input.resolvedPriority ?? null,
              resolvedEscalationLevel: input.resolvedEscalationLevel ?? null,
            },
          );

          return { reference: result.clientAlias };
        } catch (err: unknown) {
          if (err instanceof IntakeQueueNotConfiguredError) {
            console.warn("Intake queue not configured", {
              orgSlug: ctx.org.orgSlug,
              ip,
              reason: "no_intake_queue",
            });
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Service temporarily unavailable",
            });
          }
          if (err instanceof IntakeDisabledError) {
            console.warn("Intake submission rejected (disabled)", {
              orgSlug: ctx.org.orgSlug,
              ip,
              reason: "intake_disabled",
            });
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Web intake is not available",
            });
          }
          throw err;
        }
      }),
    ),
  });
}

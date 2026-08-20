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
import {
  intakeSubmissionInputSchema,
  portalBootstrapInputSchema,
  portalReplyInputSchema,
} from "@care-y/shared";
import type { IncomingMessage } from "node:http";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { PowVerifier } from "../crypto/pow.js";
import type { IntakeFormService } from "../portal/intake-form-service.js";
import type { NotificationService } from "../notifications/service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type { TelephonyProvider } from "../telephony/provider.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { PortalChannelRow } from "../portal/channel-service.js";
import type {
  PortalBootstrapResult,
  PortalReplyServiceInput,
  PortalMessageServiceDeps,
} from "../portal/portal-message-service.js";
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
  readonly fieldEncryptor?: FieldEncryptor;

  // Secure Link portal deps (appended by 8b)
  readonly portalChannelService?: {
    readonly resolveAuthedChannel: (
      db: Kysely<TenantDatabase>,
      channelId: string,
      auth: Buffer,
    ) => Promise<PortalChannelRow | null>;
  };
  readonly portalMessageService?: {
    readonly bootstrap: (
      db: Kysely<TenantDatabase>,
      channel: PortalChannelRow,
    ) => Promise<PortalBootstrapResult>;
    readonly clientReply: (
      db: Kysely<TenantDatabase>,
      deps: PortalMessageServiceDeps,
      channel: PortalChannelRow,
      input: PortalReplyServiceInput,
    ) => Promise<void>;
  };
  /** 60 req/hour per IP. Budget: 5-minute polling interval (12/hr) plus
   *  refetchOnWindowFocus headroom, leaving margin for CGNAT-shared IPs
   *  where multiple clients behind the same NAT share one public IP. */
  readonly portalReadLimiter?: RateLimiter;
  /** 30 req/hour per IP. Reply is a heavier operation (3 DB rows per call). */
  readonly portalReplyLimiter?: RateLimiter;
  /** Provider factory for portal nudge SMS (fire-and-forget after reply). */
  readonly portalGetProvider?: (
    orgId: string,
  ) => Promise<TelephonyProvider | null>;
  /** Phone purpose resolver for portal nudge caller ID. */
  readonly portalResolveCallerId?: (
    orgSchema: string,
    purpose: "outbound" | "system",
  ) => Promise<string | null>;
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
              fieldEncryptor: deps.fieldEncryptor,
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

    // -----------------------------------------------------------------
    // Secure Link portal procedures (appended by 8b)
    // -----------------------------------------------------------------

    portalBootstrap: orgProcedure.input(portalBootstrapInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);

        if (deps.portalReadLimiter) {
          const limitResult = deps.portalReadLimiter.check(ip);
          if (!limitResult.allowed) {
            console.warn("Portal read rate limited", {
              orgSlug: ctx.org.orgSlug,
              ip,
              reason: "rate_limit",
            });
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Rate limited. Retry after ${String(Math.ceil(limitResult.retryAfterMs / 1000))}s`,
            });
          }
        }

        const { channel, portalMessageService } = await requirePortalChannel(
          deps,
          ctx,
          input,
        );

        return portalMessageService.bootstrap(ctx.org.tenantDb, channel);
      }),
    ),

    portalMessages: orgProcedure.input(portalBootstrapInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);

        if (deps.portalReadLimiter) {
          const limitResult = deps.portalReadLimiter.check(ip);
          if (!limitResult.allowed) {
            console.warn("Portal read rate limited", {
              orgSlug: ctx.org.orgSlug,
              ip,
              reason: "rate_limit",
            });
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Rate limited. Retry after ${String(Math.ceil(limitResult.retryAfterMs / 1000))}s`,
            });
          }
        }

        const { channel, portalMessageService } = await requirePortalChannel(
          deps,
          ctx,
          input,
        );

        // Reuse bootstrap (stamps last_seen_at, lazy expiry, returns
        // messages); strip the keyCheck and hasPassphrase fields so
        // the polling endpoint returns only the message list.
        const result = await portalMessageService.bootstrap(
          ctx.org.tenantDb,
          channel,
        );

        return {
          ticketId: result.ticketId,
          messages: result.messages,
          messagesExpireDays: result.messagesExpireDays,
        };
      }),
    ),

    portalReply: orgProcedure.input(portalReplyInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);

        if (deps.portalReplyLimiter) {
          const limitResult = deps.portalReplyLimiter.check(ip);
          if (!limitResult.allowed) {
            console.warn("Portal reply rate limited", {
              orgSlug: ctx.org.orgSlug,
              ip,
              reason: "rate_limit",
            });
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Rate limited. Retry after ${String(Math.ceil(limitResult.retryAfterMs / 1000))}s`,
            });
          }
        }

        const { channel, portalMessageService } = await requirePortalChannel(
          deps,
          ctx,
          input,
        );
        const fieldEncryptor = deps.fieldEncryptor;
        if (!fieldEncryptor) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: PORTAL_NOT_FOUND_MSG,
          });
        }

        // Decode base64 fields to Buffers for the service layer
        const serviceInput: PortalReplyServiceInput = {
          ticketId: input.ticketId,
          followUpId: input.followUpId,
          keyGeneration: input.keyGeneration,
          encryptedContent: Buffer.from(input.encryptedContent, "base64"),
          wrappedTkTemp: Buffer.from(input.wrappedTkTemp, "base64"),
          selfCopy: {
            ephemeralPoint: Buffer.from(
              input.selfCopy.ephemeralPoint,
              "base64",
            ),
            nonce: Buffer.from(input.selfCopy.nonce, "base64"),
            ciphertext: Buffer.from(input.selfCopy.ciphertext, "base64"),
          },
        };

        await portalMessageService.clientReply(
          ctx.org.tenantDb,
          {
            getProvider:
              deps.portalGetProvider ?? (async () => Promise.resolve(null)),
            resolveCallerIdByPurpose:
              deps.portalResolveCallerId ?? (async () => Promise.resolve(null)),
            fieldEncryptor,
            notificationService: deps.notificationService,
            orgSchema: ctx.org.orgSchema,
            orgSlug: ctx.org.orgSlug,
          },
          channel,
          serviceInput,
        );

        return {};
      }),
    ),
  });
}

// ---------------------------------------------------------------------------
// Portal auth resolution helper
// ---------------------------------------------------------------------------

/** The ONE generic error message for unknown, revoked, or bad-auth channels.
 *  All three paths return this identical shape (enumeration resistance). */
const PORTAL_NOT_FOUND_MSG = "Channel not found or not available";

/**
 * Resolve an authenticated portal channel from the input's channelId + auth.
 * Throws the generic NOT_FOUND error when the channel does not resolve
 * (unknown id, revoked status, or bad auth are indistinguishable).
 *
 * Logs only { orgSlug, ip, reason }, never channelId or auth.
 */
async function requirePortalChannel(
  deps: ClientPortalRouterDeps,
  ctx: {
    org: { tenantDb: Kysely<TenantDatabase>; orgSlug: string };
    req: IncomingMessage;
  },
  input: { channelId: string; auth: string },
): Promise<{
  channel: PortalChannelRow;
  portalMessageService: NonNullable<
    ClientPortalRouterDeps["portalMessageService"]
  >;
}> {
  const { portalChannelService, portalMessageService } = deps;
  if (!portalChannelService || !portalMessageService) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PORTAL_NOT_FOUND_MSG,
    });
  }

  const authBuf = Buffer.from(input.auth, "base64");

  const channel = await portalChannelService.resolveAuthedChannel(
    ctx.org.tenantDb,
    input.channelId,
    authBuf,
  );

  if (channel === null) {
    const ip = extractClientIp(ctx.req);
    console.warn("Portal channel resolution failed", {
      orgSlug: ctx.org.orgSlug,
      ip,
      reason: "auth_failed",
    });
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PORTAL_NOT_FOUND_MSG,
    });
  }

  return { channel, portalMessageService };
}

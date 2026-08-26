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
import {
  router,
  orgProcedure,
  volunteerProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { TRPCError } from "@trpc/server";
import {
  intakeSubmissionInputSchema,
  portalBootstrapInputSchema,
  portalReplyInputSchema,
  createShareInputSchema,
  openShareInputSchema,
  getAccountSaltInputSchema,
  accountLoginInputSchema,
  accountUpgradeInputSchema,
  accountChangePasswordInputSchema,
  ErrorCode,
} from "@care-y/shared";
import type {
  OrgId,
  OrgSchema,
  OrgSlug,
  E164,
  TicketId,
  FollowupId,
  KeyGeneration,
  ClientAccountId,
  PortalMessageId,
} from "@care-y/shared";
import { ticketIdSchema } from "@care-y/shared";
import type { ChannelSecret } from "@care-y/shared";
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
import type {
  AccountServiceDeps,
  AccountRegistrationInput,
  ClientAccountRow,
  RewrappedMessageInput,
} from "../portal/account-service.js";
import * as accountService from "../portal/account-service.js";
import {
  UsernameTakenError,
  StaleThreadError,
} from "../portal/portal-errors.js";
import { hashChannelAuth } from "@care-y/crypto";
import {
  createIntakeTicket,
  IntakeQueueNotConfiguredError,
  IntakeDisabledError,
  IntakeFormClosedError,
} from "../portal/intake-service.js";
import type {
  IntakeAccountInput,
  IntakeContinuationInput,
} from "../portal/intake-service.js";
import { extractClientIp } from "../http/request-utils.js";
import {
  createShare,
  openShare,
  listSharesByTicket,
} from "../portal/share-service.js";

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
      channelId: ChannelSecret,
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
    orgId: OrgId,
  ) => Promise<TelephonyProvider | null>;
  /** Phone purpose resolver for portal nudge caller ID. */
  readonly portalResolveCallerId?: (
    org: { readonly orgId: OrgId; readonly orgSchema: OrgSchema },
    purpose: "outbound" | "system",
  ) => Promise<E164 | null>;

  // Share link deps (appended by 8d)
  /** 10 req/min per IP on the public openShare endpoint. */
  readonly shareLimiter?: RateLimiter;

  // Encrypted Account deps (appended by 8c)
  /** Startup-scoped deps (indexer + fakeSaltKey); orgUuid resolved per-request. */
  readonly accountServiceDeps?: Omit<AccountServiceDeps, "orgUuid">;
  /** 10 req/hour per IP on getAccountSalt. Bounds salt-endpoint scraping. */
  readonly accountSaltLimiter?: RateLimiter;
  /** 10 req/hour per IP on accountLogin. Bounds login spam. */
  readonly accountLoginLimiter?: RateLimiter;
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

        // 5. Decode optional account branch
        let accountInput: IntakeAccountInput | null = null;
        if (input.account != null) {
          const reg = decodeAccountRegistration(input.account);
          const selfCopy =
            input.account.selfCopy != null
              ? {
                  ephemeralPoint: Buffer.from(
                    input.account.selfCopy.ephemeralPoint,
                    "base64",
                  ),
                  nonce: Buffer.from(input.account.selfCopy.nonce, "base64"),
                  ciphertext: Buffer.from(
                    input.account.selfCopy.ciphertext,
                    "base64",
                  ),
                }
              : null;
          accountInput = { registration: reg, selfCopy };
        }

        // 6. Decode optional continuation branch
        let continuationInput: IntakeContinuationInput | null = null;
        if (input.continuation != null) {
          const contSelfCopy =
            input.continuation.selfCopy != null
              ? {
                  ephemeralPoint: Buffer.from(
                    input.continuation.selfCopy.ephemeralPoint,
                    "base64",
                  ),
                  nonce: Buffer.from(
                    input.continuation.selfCopy.nonce,
                    "base64",
                  ),
                  ciphertext: Buffer.from(
                    input.continuation.selfCopy.ciphertext,
                    "base64",
                  ),
                }
              : null;
          continuationInput = {
            channelId: input.continuation.channelId,
            authHash: Buffer.from(input.continuation.authHash, "base64"),
            clientPublic: Buffer.from(
              input.continuation.clientPublic,
              "base64",
            ),
            keyCheck: {
              ephemeralPoint: Buffer.from(
                input.continuation.keyCheck.ephemeralPoint,
                "base64",
              ),
              nonce: Buffer.from(input.continuation.keyCheck.nonce, "base64"),
              ciphertext: Buffer.from(
                input.continuation.keyCheck.ciphertext,
                "base64",
              ),
            },
            selfCopy: contSelfCopy,
          };
        }

        // 7. Delegate to service
        try {
          const acctDeps =
            input.account != null
              ? requireAccountDeps(deps, ctx.org.orgId)
              : undefined;

          const result = await createIntakeTicket(
            ctx.org.tenantDb,
            {
              notificationService: deps.notificationService,
              sealedBox: ctx.org.sealedBox,
              fieldEncryptor: deps.fieldEncryptor,
              orgId: ctx.org.orgId,
              orgSchema: ctx.org.orgSchema,
              orgSlug: ctx.org.orgSlug,
              accountServiceDeps: acctDeps,
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
              account: accountInput,
              continuation: continuationInput,
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
          if (err instanceof IntakeFormClosedError) {
            console.warn("Intake submission rejected (form closed)", {
              orgSlug: ctx.org.orgSlug,
              ip,
              reason: "form_closed",
            });
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Web intake is not available",
            });
          }
          if (err instanceof UsernameTakenError) {
            throw new TRPCError({
              code: "CONFLICT",
              message: ErrorCode.ACCOUNT_USERNAME_TAKEN,
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

        const serviceInput = decodeReplyInput(input);
        const msgDeps = buildPortalMessageDeps(deps, ctx);

        await portalMessageService.clientReply(
          ctx.org.tenantDb,
          msgDeps,
          channel,
          serviceInput,
        );

        return {};
      }),
    ),

    // -----------------------------------------------------------------
    // Share link procedures (appended by 8d)
    // -----------------------------------------------------------------

    createShare: volunteerProcedure.input(createShareInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const result = await createShare(ctx.org.tenantDb, {
          shareId: input.shareId,
          ticketId: input.ticketId,
          ciphertext: Buffer.from(input.ciphertext, "base64"),
          followUpId: input.followUpId,
          encryptedFollowUp: Buffer.from(input.encryptedFollowUp, "base64"),
          createdBy: ctx.session.userId,
        });
        return { expiresAt: result.expiresAt.toISOString() };
      }),
    ),

    listShares: volunteerProcedure
      .input(z.object({ ticketId: ticketIdSchema }))
      .query(
        withErrorWrapping(async ({ ctx, input }) => {
          const rows = await listSharesByTicket(
            ctx.org.tenantDb,
            input.ticketId,
          );
          return rows.map((r) => ({
            id: r.id,
            createdAt: r.createdAt.toISOString(),
            expiresAt: r.expiresAt.toISOString(),
            readAt: r.readAt?.toISOString() ?? null,
          }));
        }),
      ),

    openShare: orgProcedure.input(openShareInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        if (deps.shareLimiter) {
          const ip = extractClientIp(ctx.req);
          const limit = deps.shareLimiter.check(ip);
          if (!limit.allowed) {
            console.warn("Share open rate limited", {
              orgSlug: ctx.org.orgSlug,
              reason: "rate_limit",
            });
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: `Rate limited. Retry after ${String(Math.ceil(limit.retryAfterMs / 1000))}s`,
            });
          }
        }

        const result = await openShare(ctx.org.tenantDb, input.shareId);
        if (result.status === "ready") {
          return {
            status: "ready" as const,
            ciphertext: result.ciphertext.toString("base64url"),
          };
        }
        return { status: result.status };
      }),
    ),

    // -----------------------------------------------------------------
    // Encrypted Account procedures (appended by 8c)
    // -----------------------------------------------------------------

    getAccountSalt: orgProcedure.input(getAccountSaltInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);

        if (deps.accountSaltLimiter) {
          const limitResult = deps.accountSaltLimiter.check(ip);
          if (!limitResult.allowed) {
            console.warn("Account salt rate limited", {
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

        const acctDeps = requireAccountDeps(deps, ctx.org.orgId);
        const result = await accountService.getSaltForUsername(
          ctx.org.tenantDb,
          acctDeps,
          input.username,
        );

        return {
          salt: result.salt.toString("base64url"),
          accountId: result.accountId,
        };
      }),
    ),

    accountLogin: orgProcedure.input(accountLoginInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);

        if (deps.accountLoginLimiter) {
          const limitResult = deps.accountLoginLimiter.check(ip);
          if (!limitResult.allowed) {
            console.warn("Account login rate limited", {
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

        const authTokenBuf = Buffer.from(input.authToken, "base64");
        const result = await accountService.login(
          ctx.org.tenantDb,
          input.accountId,
          authTokenBuf,
        );

        if (result === null) {
          console.warn("Account login failed", {
            orgSlug: ctx.org.orgSlug,
            ip,
            reason: "auth_failed",
          });
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: ACCOUNT_AUTH_FAILED_MSG,
          });
        }

        const isSecure = ctx.req.headers["x-forwarded-proto"] === "https";
        ctx.res.setHeader(
          "Set-Cookie",
          buildClientSessionCookie(
            result.sessionToken,
            result.expiresAt,
            isSecure,
          ),
        );

        return {};
      }),
    ),

    accountBootstrap: orgProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const session = await requireAccountSession(ctx);

        const msgService = requirePortalMessageService(deps);
        const result = await msgService.bootstrap(
          ctx.org.tenantDb,
          session.channel,
        );

        return {
          ...result,
          accountCreatedAt: session.account.created_at.toISOString(),
        };
      }),
    ),

    accountMessages: orgProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const session = await requireAccountSession(ctx);

        const msgService = requirePortalMessageService(deps);
        const result = await msgService.bootstrap(
          ctx.org.tenantDb,
          session.channel,
        );

        return {
          ticketId: result.ticketId,
          messages: result.messages,
          messagesExpireDays: result.messagesExpireDays,
        };
      }),
    ),

    accountReply: orgProcedure.input(accountReplyInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);

        if (deps.portalReplyLimiter) {
          const limitResult = deps.portalReplyLimiter.check(ip);
          if (!limitResult.allowed) {
            console.warn("Account reply rate limited", {
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

        const session = await requireAccountSession(ctx);

        const serviceInput = decodeReplyInput(input);
        const msgDeps = buildPortalMessageDeps(deps, ctx);

        const msgService = requirePortalMessageService(deps);
        await msgService.clientReply(
          ctx.org.tenantDb,
          msgDeps,
          session.channel,
          serviceInput,
        );

        return {};
      }),
    ),

    accountUpgrade: orgProcedure.input(accountUpgradeInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);

        if (deps.portalReplyLimiter) {
          const limitResult = deps.portalReplyLimiter.check(ip);
          if (!limitResult.allowed) {
            console.warn("Account upgrade rate limited", {
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

        const { channel } = await requirePortalChannel(deps, ctx, input);
        const acctDeps = requireAccountDeps(deps, ctx.org.orgId);

        const reg = decodeAccountRegistration(input.account);
        const rewrapped = decodeRewrappedMessages(input.rewrappedMessages);

        try {
          await accountService.upgradeFromSecureLink(
            ctx.org.tenantDb,
            acctDeps,
            channel,
            reg,
            rewrapped,
          );
        } catch (err: unknown) {
          if (err instanceof UsernameTakenError) {
            throw new TRPCError({
              code: "CONFLICT",
              message: ErrorCode.ACCOUNT_USERNAME_TAKEN,
            });
          }
          if (err instanceof StaleThreadError) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Thread state changed; retry after refetch",
            });
          }
          throw err;
        }

        return {};
      }),
    ),

    accountChangePassword: orgProcedure
      .input(accountChangePasswordInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const session = await requireAccountSession(ctx);

          const currentAuthTokenBuf = Buffer.from(
            input.currentAuthToken,
            "base64",
          );
          const currentTokenHash = Buffer.from(
            hashChannelAuth(currentAuthTokenBuf),
          );

          const acctInput = {
            salt: Buffer.from(input.account.salt, "base64"),
            publicKey: Buffer.from(input.account.publicKey, "base64"),
            authHash: Buffer.from(input.account.authHash, "base64"),
            keyCheck: {
              ephemeralPoint: Buffer.from(
                input.account.keyCheck.ephemeralPoint,
                "base64",
              ),
              nonce: Buffer.from(input.account.keyCheck.nonce, "base64"),
              ciphertext: Buffer.from(
                input.account.keyCheck.ciphertext,
                "base64",
              ),
            },
            rewrappedMessages: decodeRewrappedMessages(input.rewrappedMessages),
          };

          let changed: boolean;
          try {
            changed = await accountService.changePassword(
              ctx.org.tenantDb,
              session.account,
              session.channel,
              currentTokenHash,
              session.tokenHash,
              acctInput,
            );
          } catch (err: unknown) {
            if (err instanceof StaleThreadError) {
              throw new TRPCError({
                code: "CONFLICT",
                message: "Thread state changed; retry after refetch",
              });
            }
            throw err;
          }

          if (!changed) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: ACCOUNT_AUTH_FAILED_MSG,
            });
          }

          return {};
        }),
      ),

    accountLogout: orgProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        // Gate on valid session (throws UNAUTHORIZED if invalid)
        await requireAccountSession(ctx);

        const cookieHeader = ctx.req.headers.cookie ?? null;
        const cookies = parseClientCookies(cookieHeader);
        const sessionToken = cookies.get(CLIENT_SESSION_COOKIE);

        if (sessionToken !== undefined && sessionToken !== "") {
          await accountService.logout(ctx.org.tenantDb, sessionToken);
        }

        ctx.res.setHeader("Set-Cookie", buildExpiredClientSessionCookie());

        return {};
      }),
    ),
  });
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CLIENT_SESSION_COOKIE = "care_y_client_session";

/** The ONE generic error message for unknown, revoked, or bad-auth channels.
 *  All three paths return this identical shape (enumeration resistance). */
const PORTAL_NOT_FOUND_MSG = "Channel not found or not available";

/** The ONE generic error for any account auth failure: unknown account,
 *  wrong token, expired session, missing cookie. Never branch on why. */
const ACCOUNT_AUTH_FAILED_MSG = "Sign-in failed";

// ---------------------------------------------------------------------------
// Account reply input schema (no channelId/auth, session-gated)
// ---------------------------------------------------------------------------

/** Account reply: same fields as portalReply minus channelId/auth
 *  (the session cookie is the credential). */
const accountReplyInputSchema = portalReplyInputSchema.omit({
  channelId: true,
  auth: true,
});

// ---------------------------------------------------------------------------
// Cookie parsing (duplicated locally; auth/cookies.ts imports
// SESSION_COOKIE_NAME from auth/service.js, which pulls volunteer
// session code transitively, violating the isolation anti-pattern)
// ---------------------------------------------------------------------------

/**
 * Parses a raw Cookie header string into a Map of name-value pairs.
 * Local duplicate of auth/cookies.ts parseCookies to avoid importing
 * volunteer session code.
 */
function parseClientCookies(
  header: string | null | undefined,
): Map<string, string> {
  const cookies = new Map<string, string>();
  if (header == null || header === "") return cookies;

  for (const pair of header.split(";")) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) continue;

    const name = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    if (name) {
      cookies.set(name, value);
    }
  }

  return cookies;
}

/**
 * Builds a Set-Cookie header for the client session cookie.
 * HttpOnly, SameSite=Strict, Path=/, no Domain attribute (GAP-12).
 * Secure flag only when behind TLS.
 */
function buildClientSessionCookie(
  token: string,
  expiresAt: Date,
  isSecure: boolean,
): string {
  const maxAge = Math.max(
    0,
    Math.floor((expiresAt.getTime() - Date.now()) / 1000),
  );
  const parts = [
    `${CLIENT_SESSION_COOKIE}=${token}`,
    `Max-Age=${String(maxAge)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
  ];

  if (isSecure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/** Builds a Set-Cookie header that expires the client session cookie immediately. */
function buildExpiredClientSessionCookie(): string {
  return `${CLIENT_SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`;
}

// ---------------------------------------------------------------------------
// Account session resolution helper
// ---------------------------------------------------------------------------

/**
 * Resolves the client account session from the cookie header.
 * Throws one generic UNAUTHORIZED on any failure: missing cookie,
 * garbage token, expired session, no active channel.
 *
 * Logs only { orgSlug, ip, reason }, never the token or account id.
 */
async function requireAccountSession(ctx: {
  org: { tenantDb: Kysely<TenantDatabase>; orgSlug: string };
  req: IncomingMessage;
}): Promise<{
  account: ClientAccountRow;
  channel: PortalChannelRow;
  tokenHash: Buffer;
}> {
  const cookieHeader = ctx.req.headers.cookie ?? null;
  const cookies = parseClientCookies(cookieHeader);
  const sessionToken = cookies.get(CLIENT_SESSION_COOKIE);

  if (sessionToken === undefined || sessionToken === "") {
    const ip = extractClientIp(ctx.req);
    console.warn("Account session missing", {
      orgSlug: ctx.org.orgSlug,
      ip,
      reason: "no_cookie",
    });
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ACCOUNT_AUTH_FAILED_MSG,
    });
  }

  const session = await accountService.resolveAccountSession(
    ctx.org.tenantDb,
    sessionToken,
  );

  if (session === null) {
    const ip = extractClientIp(ctx.req);
    console.warn("Account session resolution failed", {
      orgSlug: ctx.org.orgSlug,
      ip,
      reason: "session_invalid",
    });
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ACCOUNT_AUTH_FAILED_MSG,
    });
  }

  return session;
}

// ---------------------------------------------------------------------------
// Portal auth resolution helper
// ---------------------------------------------------------------------------

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
  input: { channelId: ChannelSecret; auth: string },
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

// ---------------------------------------------------------------------------
// Shared decode helpers
// ---------------------------------------------------------------------------

/** Combines startup-scoped account deps with the per-request orgId. */
function requireAccountDeps(
  deps: ClientPortalRouterDeps,
  orgId: OrgId,
): AccountServiceDeps {
  if (!deps.accountServiceDeps) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ACCOUNT_AUTH_FAILED_MSG,
    });
  }
  return { ...deps.accountServiceDeps, orgUuid: orgId };
}

/** Requires portal message service or throws. */
function requirePortalMessageService(
  deps: ClientPortalRouterDeps,
): NonNullable<ClientPortalRouterDeps["portalMessageService"]> {
  if (!deps.portalMessageService) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PORTAL_NOT_FOUND_MSG,
    });
  }
  return deps.portalMessageService;
}

/**
 * Decode base64 reply fields to Buffers. Shared between portalReply
 * and accountReply to avoid duplicating the decode logic.
 */
function decodeReplyInput(input: {
  ticketId: TicketId;
  followUpId: FollowupId;
  keyGeneration: KeyGeneration;
  encryptedContent: string;
  wrappedTkTemp: string;
  selfCopy: {
    ephemeralPoint: string;
    nonce: string;
    ciphertext: string;
  };
  kind?: "message" | "contact_correction";
}): PortalReplyServiceInput {
  return {
    ticketId: input.ticketId,
    followUpId: input.followUpId,
    keyGeneration: input.keyGeneration,
    encryptedContent: Buffer.from(input.encryptedContent, "base64"),
    wrappedTkTemp: Buffer.from(input.wrappedTkTemp, "base64"),
    selfCopy: {
      ephemeralPoint: Buffer.from(input.selfCopy.ephemeralPoint, "base64"),
      nonce: Buffer.from(input.selfCopy.nonce, "base64"),
      ciphertext: Buffer.from(input.selfCopy.ciphertext, "base64"),
    },
    kind: input.kind,
  };
}

/** Builds PortalMessageServiceDeps from the router deps and context. */
function buildPortalMessageDeps(
  deps: ClientPortalRouterDeps,
  ctx: {
    org: {
      tenantDb: Kysely<TenantDatabase>;
      orgId: OrgId;
      orgSlug: OrgSlug;
      orgSchema: OrgSchema;
    };
  },
): PortalMessageServiceDeps {
  const fieldEncryptor = deps.fieldEncryptor;
  if (!fieldEncryptor) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PORTAL_NOT_FOUND_MSG,
    });
  }
  return {
    getProvider: deps.portalGetProvider ?? (async () => Promise.resolve(null)),
    resolveCallerIdByPurpose:
      deps.portalResolveCallerId ?? (async () => Promise.resolve(null)),
    fieldEncryptor,
    notificationService: deps.notificationService,
    orgId: ctx.org.orgId,
    orgSchema: ctx.org.orgSchema,
    orgSlug: ctx.org.orgSlug,
  };
}

/** Decode account registration from wire base64 to Buffers. */
function decodeAccountRegistration(input: {
  accountId: ClientAccountId;
  username: string;
  salt: string;
  publicKey: string;
  authHash: string;
  keyCheck: {
    ephemeralPoint: string;
    nonce: string;
    ciphertext: string;
  };
}): AccountRegistrationInput {
  return {
    accountId: input.accountId,
    username: input.username,
    salt: Buffer.from(input.salt, "base64"),
    publicKey: Buffer.from(input.publicKey, "base64"),
    authHash: Buffer.from(input.authHash, "base64"),
    keyCheck: {
      ephemeralPoint: Buffer.from(input.keyCheck.ephemeralPoint, "base64"),
      nonce: Buffer.from(input.keyCheck.nonce, "base64"),
      ciphertext: Buffer.from(input.keyCheck.ciphertext, "base64"),
    },
  };
}

/** Decode rewrapped message array from wire base64 to Buffers. */
function decodeRewrappedMessages(
  messages: readonly {
    id: PortalMessageId;
    copy: {
      ephemeralPoint: string;
      nonce: string;
      ciphertext: string;
    };
  }[],
): RewrappedMessageInput[] {
  return messages.map((msg) => ({
    id: msg.id,
    copy: {
      ephemeralPoint: Buffer.from(msg.copy.ephemeralPoint, "base64"),
      nonce: Buffer.from(msg.copy.nonce, "base64"),
      ciphertext: Buffer.from(msg.copy.ciphertext, "base64"),
    },
  }));
}

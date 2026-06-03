/**
 * Onboarding router: first-admin bootstrap, invite management, org setup.
 *
 * The bootstrap and invite-registration endpoints run before the org keypair
 * exists. During this pre-onboarding state, the normal context factory returns
 * ctx.org = null (no sealed box). These endpoints resolve the org manually
 * and use the field encryptor for columns that will later be re-encrypted
 * with the org's sealed box.
 *
 * Business logic is delegated to AuthService (register/login) and
 * InviteService (token lifecycle). Route handlers only map inputs.
 */

import { TRPCError } from "@trpc/server";
import {
  bootstrapAdminInputSchema,
  loginInputSchema,
  updateOrgGeneralInputSchema,
  validateInviteInputSchema,
  registerFromInviteInputSchema,
  generateInviteInputSchema,
  revokeInviteInputSchema,
  saveTelephonyChoiceInputSchema,
  ErrorCode,
  Permission,
} from "@care-y/shared";
import {
  router,
  publicProcedure,
  authedProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { requirePermission } from "../auth/roles.js";
import { createInviteService } from "../onboarding/invite-service.js";
import {
  createOnboardingService,
  resolveOrgPublicKey,
  type OnboardingServiceDeps,
} from "../onboarding/onboarding-service.js";
import { RateLimitError } from "../errors.js";
import { extractClientIp } from "../http/request-utils.js";
import { buildSessionCookie } from "../auth/cookies.js";
import { SESSION_MAX_AGE_MS } from "../auth/service.js";
import { extractOrgSlug } from "../org/slug-resolver.js";
import type { OrgService } from "../org/service.js";
import type { SessionTokenizer } from "../crypto/session-tokenizer.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import { getEnrolledMethodTypes } from "../auth/two-factor-service.js";
import {
  createScopedAuthService,
  createTenantSessions,
  type OrgContext,
} from "../trpc/context.js";
import type { IncomingMessage, ServerResponse } from "node:http";

export interface OnboardingRouterDeps extends OnboardingServiceDeps {
  readonly orgService: OrgService;
  readonly tokenizer: SessionTokenizer;
  readonly bootstrapLimiter: RateLimiter;
  readonly isSecureCookie: boolean;
  readonly tenantDbFactory: (
    schema: string,
  ) => Parameters<typeof createOnboardingService>[0];
}

interface ResolvedOrg {
  orgId: string;
  orgSlug: string;
  orgSchema: string;
  tenantDb: Parameters<typeof createOnboardingService>[0];
  sealedBox: SealedBoxEncryptor | null;
}

async function resolveOrgForOnboarding(
  req: IncomingMessage,
  orgService: OrgService,
  tenantDbFactory: OnboardingRouterDeps["tenantDbFactory"],
): Promise<ResolvedOrg | null> {
  const slug = extractOrgSlug(req);
  if (slug === null) return null;

  const org = await orgService.findBySlug(slug);
  if (org?.isActive !== true) return null;

  const tDb = tenantDbFactory(org.schemaName);
  const sealedBox = await resolveOrgPublicKey(tDb);

  return {
    orgId: org.id,
    orgSlug: org.slug,
    orgSchema: org.schemaName,
    tenantDb: tDb,
    sealedBox,
  };
}

async function requireOrgForOnboarding(
  req: IncomingMessage,
  orgService: OrgService,
  tenantDbFactory: OnboardingRouterDeps["tenantDbFactory"],
): Promise<ResolvedOrg> {
  const result = await resolveOrgForOnboarding(
    req,
    orgService,
    tenantDbFactory,
  );
  if (!result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }
  return result;
}

function setSessionCookie(
  res: ServerResponse,
  token: string,
  isSecure: boolean,
): void {
  const maxAgeSeconds = Math.floor(SESSION_MAX_AGE_MS / 1000);
  res.setHeader(
    "Set-Cookie",
    buildSessionCookie(token, maxAgeSeconds, isSecure),
  );
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createOnboardingRouter(deps: OnboardingRouterDeps) {
  const {
    orgService,
    tokenizer,
    bootstrapLimiter,
    isSecureCookie,
    tenantDbFactory,
  } = deps;

  return router({
    getStatus: publicProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        const org = await requireOrgForOnboarding(
          ctx.req,
          orgService,
          tenantDbFactory,
        );

        const service = createOnboardingService(org.tenantDb, deps);
        return service.getSetupStatus();
      }),
    ),

    bootstrapAdmin: publicProcedure.input(bootstrapAdminInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);
        const result = bootstrapLimiter.check(ip);
        if (!result.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: ErrorCode.BOOTSTRAP_RATE_LIMITED,
            cause: new RateLimitError(
              ErrorCode.BOOTSTRAP_RATE_LIMITED,
              Math.ceil(result.retryAfterMs / 1000),
            ),
          });
        }

        const org = await requireOrgForOnboarding(
          ctx.req,
          orgService,
          tenantDbFactory,
        );

        const tokenValid = await orgService.validateSetupToken(
          org.orgId,
          input.setupToken,
        );
        if (!tokenValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: ErrorCode.INVALID_SETUP_TOKEN,
          });
        }

        const service = createOnboardingService(org.tenantDb, deps);
        const { userId, sessionToken } = await service.bootstrapAdmin({
          identifier: input.identifier,
          password: input.password,
          displayName: input.displayName,
          preferredLocale: input.preferredLocale,
          orgPublicKey: Buffer.from(input.orgPublicKey, "base64"),
          ipAddress: ip,
          userAgent: ctx.req.headers["user-agent"] ?? "unknown",
          orgId: org.orgId,
        });

        setSessionCookie(ctx.res, sessionToken, isSecureCookie);
        await orgService.consumeSetupToken(org.orgId);

        return { userId };
      }),
    ),

    validateInvite: publicProcedure.input(validateInviteInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const org = await requireOrgForOnboarding(
          ctx.req,
          orgService,
          tenantDbFactory,
        );

        const inviteService = createInviteService(org.tenantDb);
        const invite = await inviteService.validate(input.token);

        if (!invite) {
          return { valid: false as const };
        }

        return {
          valid: true as const,
          expiresAt: invite.expiresAt.toISOString(),
        };
      }),
    ),

    registerFromInvite: publicProcedure
      .input(registerFromInviteInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const org = await requireOrgForOnboarding(
            ctx.req,
            orgService,
            tenantDbFactory,
          );

          const inviteService = createInviteService(org.tenantDb);
          const invite = await inviteService.validate(input.token);

          if (!invite) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: ErrorCode.INVALID_INVITE_TOKEN,
            });
          }

          if (!org.sealedBox) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Org keypair not configured",
            });
          }

          const service = createOnboardingService(org.tenantDb, deps);
          const { userId, sessionToken } = await service.registerFromInvite(
            {
              identifier: input.identifier,
              password: input.password,
              displayName: input.displayName ?? input.identifier,
              preferredLocale: input.preferredLocale,
              ipAddress: extractClientIp(ctx.req),
              userAgent: ctx.req.headers["user-agent"] ?? "unknown",
              invite: { id: invite.id, roleId: invite.roleId },
            },
            org.sealedBox,
            {
              orgId: org.orgId,
              orgSlug: org.orgSlug,
              orgSchema: org.orgSchema,
            },
          );

          setSessionCookie(ctx.res, sessionToken, isSecureCookie);

          return { userId };
        }),
      ),

    generateInvite: authedProcedure.input(generateInviteInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

        const inviteService = createInviteService(ctx.org.tenantDb);

        const encryptedEmail =
          input.encryptedEmail !== undefined
            ? Buffer.from(input.encryptedEmail, "base64")
            : undefined;

        const { rawToken, expiresAt } = await inviteService.generate({
          invitedBy: ctx.session.userId,
          roleId: input.roleId,
          encryptedEmail,
          seal: (token: string) => ctx.org.sealedBox.seal(token),
        });

        const inviteUrl = `/first-login/${rawToken}`;

        return {
          inviteUrl,
          expiresAt: expiresAt.toISOString(),
        };
      }),
    ),

    listPendingInvites: authedProcedure.query(
      withErrorWrapping(async ({ ctx }) => {
        requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

        const inviteService = createInviteService(ctx.org.tenantDb);
        const invites = await inviteService.listPending();

        return invites.map((inv) => ({
          id: inv.id,
          roleId: inv.roleId,
          invitedBy: inv.invitedBy,
          expiresAt: inv.expiresAt.toISOString(),
          createdAt: inv.createdAt.toISOString(),
          encryptedToken: inv.encryptedToken?.toString("base64") ?? null,
        }));
      }),
    ),

    revokeInvite: authedProcedure.input(revokeInviteInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

        const inviteService = createInviteService(ctx.org.tenantDb);
        await inviteService.revoke(input.tokenId);

        return { success: true as const };
      }),
    ),

    updateOrgGeneral: authedProcedure
      .input(updateOrgGeneralInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

          const service = createOnboardingService(ctx.org.tenantDb, deps);
          await service.updateOrgGeneral(input);

          return { success: true as const };
        }),
      ),

    saveTelephonyChoice: authedProcedure
      .input(saveTelephonyChoiceInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

          const service = createOnboardingService(ctx.org.tenantDb, deps);
          const result = await service.saveTelephonyChoice(input);

          return { success: true as const, mode: result.mode };
        }),
      ),

    reauthenticate: publicProcedure.input(loginInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const org = await requireOrgForOnboarding(
          ctx.req,
          orgService,
          tenantDbFactory,
        );
        if (!org.sealedBox) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: ErrorCode.ORG_KEYPAIR_MISSING,
          });
        }

        const orgCtx: OrgContext = {
          orgId: org.orgId,
          orgSlug: org.orgSlug,
          orgSchema: org.orgSchema,
          tenantDb: org.tenantDb,
          sealedBox: org.sealedBox,
        };

        const sessions = createTenantSessions(orgCtx, tokenizer);
        const authService = createScopedAuthService(orgCtx, sessions, deps);

        const ip = extractClientIp(ctx.req);
        const ua = ctx.req.headers["user-agent"] ?? "unknown";

        const { user, session } = await authService.login({
          identifier: input.identifier,
          password: input.password,
          ipAddress: ip,
          userAgent: ua,
        });

        const enrolledMethods = await getEnrolledMethodTypes(
          org.tenantDb,
          user.id,
        );

        if (enrolledMethods.length > 0) {
          setSessionCookie(ctx.res, session.token, isSecureCookie);
          return {
            userId: user.id,
            encryptedPreferredLocale: user.encryptedPreferredLocale,
            hasSeenBriefing: user.hasSeenBriefing,
            requiresTwoFactor: true as const,
            enrolledMethods,
          };
        }

        await sessions.markTwoFactorVerified(session.token);
        setSessionCookie(ctx.res, session.token, isSecureCookie);

        return {
          userId: user.id,
          encryptedPreferredLocale: user.encryptedPreferredLocale,
          hasSeenBriefing: user.hasSeenBriefing,
          requiresTwoFactor: false as const,
          enrolledMethods: [] as string[],
        };
      }),
    ),

    markBriefingSeen: authedProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        const sessions = createTenantSessions(ctx.org, tokenizer);
        const authService = createScopedAuthService(ctx.org, sessions, deps);
        await authService.markBriefingSeen(ctx.session.userId);
        return { success: true as const };
      }),
    ),

    completeSetup: authedProcedure.mutation(
      withErrorWrapping(async ({ ctx }) => {
        requirePermission(ctx.user.roleId, Permission.MANAGE_ROLES);

        const sessions = createTenantSessions(ctx.org, tokenizer);
        const authService = createScopedAuthService(ctx.org, sessions, deps);
        await authService.markSetupCompleted();

        return { success: true as const };
      }),
    ),
  });
}

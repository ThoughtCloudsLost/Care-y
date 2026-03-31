/**
 * Auth router: login, register, logout, me.
 *
 * Login and register create per-request AuthService instances from the
 * resolved org's tenant DB. The rate limiter and hasher are singletons
 * injected at startup via the factory.
 *
 * Login is rate-limited per IP. Register requires an authenticated caller
 * (invite-only). Logout clears the session cookie. me returns the current
 * user's non-sensitive profile.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import {
  loginInputSchema,
  registerInputSchema,
  getSaltInputSchema,
  assignRoleInputSchema,
  setPiiRetentionInputSchema,
  RoleId,
  Permission,
  ErrorCode,
} from "@care-y/shared";
import { TRPCError } from "@trpc/server";
import {
  router,
  orgProcedure,
  authedProcedure,
  adminProcedure,
  withErrorWrapping,
} from "../trpc/trpc.js";
import { hasPermission, getDefaultRoleId } from "../auth/roles.js";
import { ForbiddenError, NotFoundError, RateLimitError } from "../errors.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { UserRecord } from "../auth/service.js";
import { SESSION_MAX_AGE_MS } from "../auth/service.js";
import {
  buildSessionCookie,
  buildClearSessionCookie,
} from "../auth/cookies.js";
import { extractClientIp } from "../http/request-utils.js";
import {
  createScopedAuthService,
  createTenantSessions,
  type AuthServiceDeps,
} from "../trpc/context.js";
import { createSaltDefense } from "../auth/salt-defense.js";
import { encode } from "@care-y/crypto";
import type { OrgContext } from "../trpc/context.js";
import type { EmailSender } from "../email/email-sender.js";
import { createScopedTwoFactorServices } from "./two-factor.js";
import type { ProviderFactory } from "../telephony/factory.js";
import type { CallerIdResolver } from "../auth/sms-code.js";

export interface AuthRouterDeps extends AuthServiceDeps {
  readonly loginLimiter: RateLimiter;
  readonly saltLimiter: RateLimiter;
  readonly fakeSaltKey: Buffer;
  readonly isSecureCookie: boolean;
  readonly emailSender: EmailSender;
  readonly providerFactory: ProviderFactory;
  readonly resolveCallerId: CallerIdResolver;
}

/** Safe response shape: no password_hash, no internal fields. */
export interface UserResponse {
  readonly id: string;
  readonly identifier: string;
  readonly encryptedDisplayName: string; // base64 ciphertext, client decrypts
  readonly roleId: string;
}

/** Projects a UserRecord to a safe response shape (no password_hash, no internal fields). */
function toUserResponse(user: UserRecord): UserResponse {
  return {
    id: user.id,
    identifier: user.identifier,
    encryptedDisplayName: user.encryptedDisplayName,
    roleId: user.roleId,
  };
}

/**
 * Enforces per-IP rate limiting. Throws TOO_MANY_REQUESTS if the limit is
 * exceeded. The key parameter allows separate rate limit buckets (e.g.
 * raw IP for login, "salt:<ip>" for the salt endpoint). Never reveals
 * whether the limit was hit due to IP saturation or a specific username.
 */
function enforceRateLimit(
  limiter: RateLimiter,
  key: string,
  errorCode: string,
): void {
  const result = limiter.check(key);
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: errorCode,
      cause: new RateLimitError(
        errorCode,
        Math.ceil(result.retryAfterMs / 1000),
      ),
    });
  }
}

/** Sets the session cookie on the response after a successful login. */
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

/**
 * Enforces rate limiting, then delegates salt lookup to the SaltDefense
 * module. Returns the salt as url-safe base64 (no padding) and the userId
 * (real or deterministic fake) for the OPRF endpoint.
 */
async function handleGetSalt(
  org: OrgContext,
  deps: AuthServiceDeps,
  fakeSaltKey: Buffer,
  saltLimiter: RateLimiter,
  req: IncomingMessage,
  identifier: string,
): Promise<{ salt: string; userId: string }> {
  enforceRateLimit(
    saltLimiter,
    `salt:${extractClientIp(req)}`,
    ErrorCode.REQUEST_RATE_LIMITED,
  );
  const saltDefense = createSaltDefense(
    org.tenantDb,
    { fakeSaltKey, orgUuid: org.orgId },
    deps.indexer,
  );
  const result = await saltDefense.getSalt(identifier);
  return { salt: encode(result.salt), userId: result.userId };
}

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createAuthRouter(deps: AuthRouterDeps) {
  const { loginLimiter, saltLimiter, fakeSaltKey, isSecureCookie } = deps;

  return router({
    getSalt: orgProcedure
      .input(getSaltInputSchema)
      .query(async ({ ctx, input }) =>
        handleGetSalt(
          ctx.org,
          deps,
          fakeSaltKey,
          saltLimiter,
          ctx.req,
          input.identifier,
        ),
      ),

    login: orgProcedure.input(loginInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);
        enforceRateLimit(loginLimiter, ip, ErrorCode.LOGIN_RATE_LIMITED);

        const sessions = createTenantSessions(ctx.org, deps.tokenizer);
        const authService = createScopedAuthService(ctx.org, sessions, deps);

        const { user, session } = await authService.login({
          identifier: input.identifier,
          password: input.password,
          ipAddress: ip,
          userAgent: ctx.req.headers["user-agent"] ?? "unknown",
        });

        setSessionCookie(ctx.res, session.token, isSecureCookie);

        // Query enrolled 2FA methods. Reuses the same sessions instance
        // created above to avoid redundant construction.
        const { twoFactor } = await createScopedTwoFactorServices(
          ctx.org,
          sessions,
          {
            emailSender: deps.emailSender,
            encryptor: deps.encryptor,
            indexer: deps.indexer,
            tokenizer: deps.tokenizer,
            providerFactory: deps.providerFactory,
            resolveCallerId: deps.resolveCallerId,
            pushSender: null,
            pushHmacKey: null,
          },
        );
        const enrolledMethods = await twoFactor.getEnrolledMethodTypes(user.id);

        return {
          user: toUserResponse(user),
          requiresTwoFactor: enrolledMethods.length > 0,
          enrolledMethods,
        };
      }),
    ),

    register: authedProcedure
      .input(
        registerInputSchema.extend({
          roleId: assignRoleInputSchema.shape.roleId.optional(),
        }),
      )
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const effectiveRoleId = input.roleId ?? getDefaultRoleId();

          // Non-default roles require MANAGE_ROLES permission.
          if (
            effectiveRoleId !== getDefaultRoleId() &&
            !hasPermission(ctx.user.roleId, Permission.MANAGE_ROLES)
          ) {
            throw new ForbiddenError(ErrorCode.ONLY_ADMINS_CAN_ASSIGN_ROLES);
          }

          const sessions = createTenantSessions(ctx.org, deps.tokenizer);
          const authService = createScopedAuthService(ctx.org, sessions, deps);
          const user = await authService.register({
            identifier: input.identifier,
            password: input.password,
            displayName: input.displayName,
            ...(input.notificationEmail !== undefined && {
              notificationEmail: input.notificationEmail,
            }),
            roleId: effectiveRoleId,
          });

          return { user: toUserResponse(user) };
        }),
      ),

    logout: authedProcedure.mutation(async ({ ctx }) => {
      const sessions = createTenantSessions(ctx.org, deps.tokenizer);
      const authService = createScopedAuthService(ctx.org, sessions, deps);
      await authService.logout(ctx.session.token);
      ctx.res.setHeader("Set-Cookie", buildClearSessionCookie());

      return { success: true as const };
    }),

    me: authedProcedure.query(({ ctx }) => {
      return { user: toUserResponse(ctx.user) };
    }),

    assignRole: adminProcedure.input(assignRoleInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        // Self-assignment protection: admins cannot change their own role.
        if (input.userId === ctx.user.id) {
          throw new ForbiddenError(ErrorCode.CANNOT_CHANGE_OWN_ROLE);
        }

        const sessions = createTenantSessions(ctx.org, deps.tokenizer);
        const authService = createScopedAuthService(ctx.org, sessions, deps);
        const targetUser = await authService.findUserById(input.userId);
        if (!targetUser) {
          throw new NotFoundError(ErrorCode.USER_NOT_FOUND);
        }

        // Last-admin protection: if demoting an admin, ensure at least one other remains.
        if (
          targetUser.roleId === RoleId.ADMIN &&
          input.roleId !== RoleId.ADMIN
        ) {
          const adminCount = await authService.countActiveAdmins();
          if (adminCount <= 1) {
            throw new ForbiddenError(ErrorCode.CANNOT_DEMOTE_LAST_ADMIN);
          }
        }

        const updated = await authService.updateUserRole(
          input.userId,
          input.roleId,
        );
        return { user: toUserResponse(updated) };
      }),
    ),

    setPiiRetention: adminProcedure.input(setPiiRetentionInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const sessions = createTenantSessions(ctx.org, deps.tokenizer);
        const authService = createScopedAuthService(ctx.org, sessions, deps);
        await authService.setPiiRetentionDays(input.days);
        return { success: true as const };
      }),
    ),
  });
}

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
  type AuthServiceDeps,
} from "../trpc/context.js";
import { createSaltDefense } from "../auth/salt-defense.js";
import type { OrgContext } from "../trpc/context.js";
import type { EmailSender } from "../email/email-sender.js";
import { createScopedTwoFactorServices } from "./two-factor.js";

export interface AuthRouterDeps extends AuthServiceDeps {
  readonly loginLimiter: RateLimiter;
  readonly saltLimiter: RateLimiter;
  readonly fakeSaltKey: Buffer;
  readonly isSecureCookie: boolean;
  readonly emailSender: EmailSender;
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
  userMessage: string,
): void {
  const result = limiter.check(key);
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `${userMessage}. Try again later.`,
      cause: new RateLimitError(
        userMessage,
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
 * module. Returns the salt as a base64-encoded string for JSON transport.
 */
async function handleGetSalt(
  org: OrgContext,
  deps: AuthServiceDeps,
  fakeSaltKey: Buffer,
  saltLimiter: RateLimiter,
  req: IncomingMessage,
  identifier: string,
): Promise<{ salt: string }> {
  enforceRateLimit(
    saltLimiter,
    `salt:${extractClientIp(req)}`,
    "Too many requests",
  );
  const saltDefense = createSaltDefense(
    org.tenantDb,
    { fakeSaltKey, orgUuid: org.orgId },
    deps.indexer,
  );
  const result = await saltDefense.getSalt(identifier);
  return { salt: result.salt.toString("base64") };
}

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
        enforceRateLimit(loginLimiter, ip, "Too many login attempts");

        const authService = createScopedAuthService(ctx.org, deps);

        const { user, session } = await authService.login({
          identifier: input.identifier,
          password: input.password,
          ipAddress: ip,
          userAgent: ctx.req.headers["user-agent"] ?? "unknown",
        });

        setSessionCookie(ctx.res, session.token, isSecureCookie);

        // Query enrolled 2FA methods via service to inform client redirect.
        const { twoFactor } = createScopedTwoFactorServices(ctx.org, {
          emailSender: deps.emailSender,
          encryptor: deps.encryptor,
          tokenizer: deps.tokenizer,
          sealedBox: deps.sealedBox,
        });
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
            throw new ForbiddenError(
              "Only admins can register users with non-default roles",
            );
          }

          const authService = createScopedAuthService(ctx.org, deps);
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
      const authService = createScopedAuthService(ctx.org, deps);
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
          throw new ForbiddenError("Cannot change your own role");
        }

        const authService = createScopedAuthService(ctx.org, deps);
        const targetUser = await authService.findUserById(input.userId);
        if (!targetUser) {
          throw new NotFoundError("User not found");
        }

        // Last-admin protection: if demoting an admin, ensure at least one other remains.
        if (
          targetUser.roleId === RoleId.ADMIN &&
          input.roleId !== RoleId.ADMIN
        ) {
          const adminCount = await authService.countActiveAdmins();
          if (adminCount <= 1) {
            throw new ForbiddenError("Cannot demote the last admin");
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
        const authService = createScopedAuthService(ctx.org, deps);
        await authService.setPiiRetentionDays(input.days);
        return { success: true as const };
      }),
    ),
  });
}

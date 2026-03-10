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

import type { ServerResponse } from "node:http";
import { loginInputSchema, registerInputSchema } from "@care-y/shared";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  router,
  orgProcedure,
  authedProcedure,
  throwAsTrpc,
} from "../trpc/trpc.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { UserRecord } from "../auth/service.js";
import { SESSION_MAX_AGE_MS } from "../auth/service.js";
import {
  buildSessionCookie,
  buildClearSessionCookie,
} from "../auth/cookies.js";
import { RateLimitError } from "../errors.js";
import { extractClientIp } from "../http/request-utils.js";
import {
  createScopedAuthService,
  type AuthServiceDeps,
} from "../trpc/context.js";

export interface AuthRouterDeps extends AuthServiceDeps {
  readonly loginLimiter: RateLimiter;
  readonly isSecureCookie: boolean;
}

/** Projects a UserRecord to a safe response shape (no password_hash, no internal fields). */
function toUserResponse(user: UserRecord): {
  id: string;
  identifier: string;
  displayName: string;
  roleId: string;
} {
  return {
    id: user.id,
    identifier: user.identifier,
    displayName: user.displayName,
    roleId: user.roleId,
  };
}

/**
 * Enforces per-IP rate limiting. Throws TOO_MANY_REQUESTS if the limit is
 * exceeded. Never reveals whether the limit was hit due to IP saturation
 * or a specific username (timing-safe).
 */
function enforceLoginRateLimit(limiter: RateLimiter, ip: string): void {
  const result = limiter.check(ip);
  if (!result.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many login attempts. Try again later.",
      cause: new RateLimitError(
        "Too many login attempts",
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

export function createAuthRouter(deps: AuthRouterDeps) {
  const { loginLimiter, isSecureCookie } = deps;

  return router({
    login: orgProcedure
      .input(loginInputSchema)
      .mutation(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);
        enforceLoginRateLimit(loginLimiter, ip);

        const authService = createScopedAuthService(ctx.org, deps);

        try {
          const { user, session } = await authService.login({
            identifier: input.identifier,
            password: input.password,
            ipAddress: ip,
            userAgent: ctx.req.headers["user-agent"] ?? "unknown",
          });

          setSessionCookie(ctx.res, session.token, isSecureCookie);
          return { user: toUserResponse(user) };
        } catch (err: unknown) {
          throwAsTrpc(err);
        }
      }),

    register: authedProcedure
      .input(registerInputSchema.extend({ roleId: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const authService = createScopedAuthService(ctx.org, deps);

        try {
          const user = await authService.register({
            identifier: input.identifier,
            password: input.password,
            displayName: input.displayName,
            ...(input.notificationEmail !== undefined && {
              notificationEmail: input.notificationEmail,
            }),
            roleId: input.roleId,
          });

          return { user: toUserResponse(user) };
        } catch (err: unknown) {
          throwAsTrpc(err);
        }
      }),

    logout: authedProcedure.mutation(async ({ ctx }) => {
      const authService = createScopedAuthService(ctx.org, deps);
      await authService.logout(ctx.session.token);
      ctx.res.setHeader("Set-Cookie", buildClearSessionCookie());

      return { success: true as const };
    }),

    me: authedProcedure.query(({ ctx }) => {
      return { user: toUserResponse(ctx.user) };
    }),
  });
}

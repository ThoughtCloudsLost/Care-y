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

import type { IncomingMessage } from "node:http";
import { loginInputSchema, registerInputSchema } from "@care-y/shared";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  router,
  orgProcedure,
  authedProcedure,
  throwAsTrpc,
} from "../trpc/trpc.js";
import type { PasswordHasher } from "../auth/password.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import type { UserRecord } from "../auth/service.js";
import { createAuthService, SESSION_MAX_AGE_MS } from "../auth/service.js";
import {
  buildSessionCookie,
  buildClearSessionCookie,
} from "../auth/cookies.js";
import { RateLimitError } from "../errors.js";

export interface AuthRouterDeps {
  readonly hasher: PasswordHasher;
  readonly loginLimiter: RateLimiter;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
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

function extractClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.socket.remoteAddress ?? "unknown";
}

export function createAuthRouter(deps: AuthRouterDeps) {
  const { hasher, loginLimiter, encryptor, indexer, isSecureCookie } = deps;

  return router({
    login: orgProcedure
      .input(loginInputSchema)
      .mutation(async ({ ctx, input }) => {
        const ip = extractClientIp(ctx.req);

        // Rate limit by IP. Never reveal whether limit was hit due to IP or username.
        const limitResult = loginLimiter.check(ip);
        if (!limitResult.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many login attempts. Try again later.",
            cause: new RateLimitError(
              "Too many login attempts",
              Math.ceil(limitResult.retryAfterMs / 1000),
            ),
          });
        }

        const sessions = createDbSessionRepository(ctx.org.tenantDb, encryptor);
        const authService = createAuthService(
          ctx.org.tenantDb,
          hasher,
          sessions,
          encryptor,
          indexer,
        );

        try {
          const { user, session } = await authService.login({
            identifier: input.identifier,
            password: input.password,
            ipAddress: ip,
            userAgent: ctx.req.headers["user-agent"] ?? "unknown",
          });

          const maxAgeSeconds = Math.floor(SESSION_MAX_AGE_MS / 1000);
          const cookie = buildSessionCookie(
            session.token,
            maxAgeSeconds,
            isSecureCookie,
          );
          ctx.res.setHeader("Set-Cookie", cookie);

          return { user: toUserResponse(user) };
        } catch (err: unknown) {
          throwAsTrpc(err);
        }
      }),

    register: authedProcedure
      .input(registerInputSchema.extend({ roleId: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const sessions = createDbSessionRepository(ctx.org.tenantDb, encryptor);
        const authService = createAuthService(
          ctx.org.tenantDb,
          hasher,
          sessions,
          encryptor,
          indexer,
        );

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
      const sessions = createDbSessionRepository(ctx.org.tenantDb, encryptor);
      const authService = createAuthService(
        ctx.org.tenantDb,
        hasher,
        sessions,
        encryptor,
        indexer,
      );

      await authService.logout(ctx.session.token);
      ctx.res.setHeader("Set-Cookie", buildClearSessionCookie());

      return { success: true as const };
    }),

    me: authedProcedure.query(({ ctx }) => {
      return { user: toUserResponse(ctx.user) };
    }),
  });
}

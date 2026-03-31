/**
 * tRPC initialization and middleware.
 *
 * Exports the router builder, procedure types, and auth middleware.
 * The error formatter maps AppError subtypes to tRPC error codes so
 * the client receives typed, structured error responses without
 * internal details (stack traces, file paths, DB schema references).
 */

import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context.js";
import { Permission } from "@care-y/shared";
import { hasPermission } from "../auth/roles.js";
import {
  isAppError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  PowRequiredError,
} from "../errors.js";

const t = initTRPC.context<Context>().create({
  // Tested via caller round-trip in trpc.test.ts (errorFormatter suite).
  // V8 can't trace execution through tRPC's internal callback invocation.
  /* v8 ignore start */
  errorFormatter({ shape, error }) {
    const cause = error.cause;

    // Map AppError subtypes to tRPC error shape.
    // Internal details stay in server logs; only code + message go to the client.
    if (isAppError(cause)) {
      return {
        ...shape,
        data: {
          ...shape.data,
          code: cause.code,
          // Non-operational errors (bugs) get a generic message.
          // Operational errors (bad input, auth failures) pass through.
          ...(cause.isOperational ? {} : { message: "Internal server error" }),
          // PoW challenge data forwarded so the client can solve and retry.
          ...(cause instanceof PowRequiredError
            ? { challenge: cause.challenge, difficulty: cause.difficulty }
            : {}),
        },
      };
    }

    return shape;
  },
  /* v8 ignore stop */
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

/** Creates a type-safe caller for testing routers without HTTP. */
export const createCallerFactory = t.createCallerFactory;

/**
 * Maps AppError to the closest tRPC error code.
 * Used by procedures that catch AppErrors and need to re-throw as TRPCError.
 */
export function appErrorToTrpcCode(err: unknown): TRPCError["code"] {
  if (err instanceof AuthError) return "UNAUTHORIZED";
  if (err instanceof ForbiddenError) return "FORBIDDEN";
  if (err instanceof NotFoundError) return "NOT_FOUND";
  if (err instanceof ValidationError) return "BAD_REQUEST";
  if (err instanceof ConflictError) return "CONFLICT";
  if (err instanceof RateLimitError) return "TOO_MANY_REQUESTS";
  return "INTERNAL_SERVER_ERROR";
}

/** Re-throws an AppError as a TRPCError with the correct code. */
export function throwAsTrpc(err: unknown): never {
  if (isAppError(err)) {
    throw new TRPCError({
      code: appErrorToTrpcCode(err),
      message: err.isOperational ? err.message : "Internal server error",
      cause: err,
    });
  }
  throw err;
}

/** Middleware: requires resolved org context. Throws NOT_FOUND if ctx.org is null. */
const requireOrg = middleware(async ({ ctx, next }) => {
  if (!ctx.org) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }

  return next({
    ctx: { ...ctx, org: ctx.org },
  });
});

/**
 * Middleware: requires authenticated session (session + user both non-null).
 * Always chained after requireOrg (via orgProcedure), so ctx.org is guaranteed
 * non-null at runtime. The non-null assertion satisfies TypeScript without
 * duplicating the org check that requireOrg already performed.
 */
const requireSession = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  // org is guaranteed non-null by requireOrg in the middleware chain.
  return next({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- requireOrg middleware guards ctx.org; duplicating the check here adds dead code
    ctx: { ...ctx, org: ctx.org!, session: ctx.session, user: ctx.user },
  });
});

/** Procedure that requires a resolved org but no auth. */
export const orgProcedure = publicProcedure.use(requireOrg);

/** Procedure that requires both a resolved org and an authenticated session. */
export const authedProcedure = orgProcedure.use(requireSession);

/**
 * Middleware: requires completed 2FA verification on the current session.
 * Chained after requireSession, so session and user are guaranteed non-null.
 *
 * Enrollment and verification routes use plain authedProcedure instead,
 * since the user needs access before completing 2FA.
 */
const require2fa = middleware(async ({ ctx, next }) => {
  // Runtime guards narrow the types for TypeScript. These checks are
  // redundant at runtime (requireSession + requireOrg already ran), but
  // the middleware framework re-widens ctx to the base Context type.
  if (!ctx.session || !ctx.user || !ctx.org) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  if (!ctx.session.twofaVerified) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Two-factor verification required",
    });
  }

  return next({
    ctx: { ...ctx, org: ctx.org, session: ctx.session, user: ctx.user },
  });
});

/** Procedure that requires org + auth + completed 2FA verification. */
export const authed2faProcedure = authedProcedure.use(require2fa);

/**
 * Creates a tRPC middleware that requires the authenticated user to have
 * the specified permission. Must be chained after requireSession + require2fa.
 *
 * Throws a generic FORBIDDEN error that does not reveal which permission
 * was required or what role the user has (prevents role enumeration).
 */
// care-y-ignore-next-line missing-return-type -- tRPC's MiddlewareBuilder is an internal generic not exported for annotation; requireOrg/requireSession in this file use the same pattern
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- same reason as above
export function requireRole(permission: Permission) {
  return middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.user || !ctx.org) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    if (!hasPermission(ctx.user.roleId, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    }

    return next({
      ctx: { ...ctx, org: ctx.org, session: ctx.session, user: ctx.user },
    });
  });
}

/** Procedure that requires org + auth + 2FA + at least volunteer-level permissions. */
export const volunteerProcedure = authed2faProcedure.use(
  requireRole(Permission.VIEW_TICKETS),
);

/** Procedure that requires org + auth + 2FA + manager-level permissions. */
export const managerProcedure = authed2faProcedure.use(
  requireRole(Permission.MANAGE_USERS),
);

/** Procedure that requires org + auth + 2FA + admin-level permissions. */
export const adminProcedure = authed2faProcedure.use(
  requireRole(Permission.MANAGE_ROLES),
);

/**
 * Wraps a resolver function so that AppErrors thrown by the resolver are
 * caught and re-thrown as TRPCError with the correct code. Non-AppErrors
 * propagate unchanged.
 *
 * Note: this must be a resolver-level wrapper, not a tRPC middleware.
 * tRPC v11's internal pipeline catches resolver errors before middleware
 * catch blocks execute, so middleware-based error wrapping never fires.
 * A resolver wrapper runs inside the resolver call itself, before tRPC's
 * error handler, so the TRPCError propagates correctly.
 */
export function withErrorWrapping<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult> | TResult,
): (args: TArgs) => Promise<TResult> {
  return async (args: TArgs): Promise<TResult> => {
    try {
      return await fn(args);
    } catch (err: unknown) {
      throwAsTrpc(err);
    }
  };
}

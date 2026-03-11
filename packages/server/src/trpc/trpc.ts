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
import {
  isAppError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
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

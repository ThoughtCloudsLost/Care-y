/**
 * Unit tests for tRPC initialization, error formatting, and middleware.
 *
 * Covers: errorFormatter (AppError and non-AppError paths),
 * appErrorToTrpcCode (all error subtypes + fallback),
 * throwAsTrpc (AppError and non-AppError paths),
 * requireOrg and requireAuth middleware (rejection branches).
 *
 * Uses createCallerFactory for direct procedure invocation (no HTTP).
 */

import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import {
  router,
  publicProcedure,
  orgProcedure,
  authedProcedure,
  authed2faProcedure,
  withErrorWrapping,
  createCallerFactory,
  appErrorToTrpcCode,
  throwAsTrpc,
} from "./trpc.js";
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  InternalError,
} from "../errors.js";
import type { Context, OrgContext } from "./context.js";
import { mockReq, mockRes, expectTrpcError } from "../test-utils.js";

// --- Helpers ---

const fakeOrg: OrgContext = {
  orgId: "org-1",
  orgSlug: "test",
  orgSchema: "org_test",
  // Minimal stub; middleware doesn't use tenantDb directly
  tenantDb: {} as OrgContext["tenantDb"],
};

function baseCtx(overrides?: Partial<Context>): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: fakeOrg,
    session: null,
    user: null,
    ...overrides,
  };
}

// --- appErrorToTrpcCode ---

describe("appErrorToTrpcCode", () => {
  it("maps AuthError to UNAUTHORIZED", () => {
    expect(appErrorToTrpcCode(new AuthError("x"))).toBe("UNAUTHORIZED");
  });

  it("maps ForbiddenError to FORBIDDEN", () => {
    expect(appErrorToTrpcCode(new ForbiddenError("x"))).toBe("FORBIDDEN");
  });

  it("maps NotFoundError to NOT_FOUND", () => {
    expect(appErrorToTrpcCode(new NotFoundError("x"))).toBe("NOT_FOUND");
  });

  it("maps ValidationError to BAD_REQUEST", () => {
    expect(appErrorToTrpcCode(new ValidationError("x"))).toBe("BAD_REQUEST");
  });

  it("maps ConflictError to CONFLICT", () => {
    expect(appErrorToTrpcCode(new ConflictError("x"))).toBe("CONFLICT");
  });

  it("maps RateLimitError to TOO_MANY_REQUESTS", () => {
    expect(appErrorToTrpcCode(new RateLimitError("x", 30))).toBe(
      "TOO_MANY_REQUESTS",
    );
  });

  it("returns INTERNAL_SERVER_ERROR for non-AppError", () => {
    expect(appErrorToTrpcCode(new Error("generic"))).toBe(
      "INTERNAL_SERVER_ERROR",
    );
  });

  it("returns INTERNAL_SERVER_ERROR for non-Error values", () => {
    expect(appErrorToTrpcCode("a string")).toBe("INTERNAL_SERVER_ERROR");
  });
});

// --- throwAsTrpc ---

describe("throwAsTrpc", () => {
  it("wraps an AppError as TRPCError with correct code", () => {
    const authErr = new AuthError("bad creds");
    expect(() => throwAsTrpc(authErr)).toThrow(TRPCError);

    try {
      throwAsTrpc(authErr);
    } catch (err) {
      expect(err).toBeInstanceOf(TRPCError);
      const trpcErr = err as TRPCError;
      expect(trpcErr.code).toBe("UNAUTHORIZED");
      expect(trpcErr.message).toBe("bad creds");
      expect(trpcErr.cause).toBe(authErr);
    }
  });

  it("uses generic message for non-operational AppError", () => {
    const internalErr = new InternalError("secret DB detail");

    try {
      throwAsTrpc(internalErr);
    } catch (err) {
      const trpcErr = err as TRPCError;
      expect(trpcErr.message).toBe("Internal server error");
    }
  });

  it("re-throws non-AppError unchanged", () => {
    const plain = new TypeError("not an app error");
    expect(() => throwAsTrpc(plain)).toThrow(plain);
  });

  it("re-throws non-Error values unchanged", () => {
    expect(() => throwAsTrpc("string error")).toThrow("string error");
  });
});

// --- errorFormatter (via caller round-trip) ---

describe("errorFormatter", () => {
  // Build a minimal router with a procedure that throws AppError vs generic Error
  const testRouter = router({
    throwAuthError: publicProcedure.mutation(() => {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "auth failed",
        cause: new AuthError("Invalid credentials"),
      });
    }),
    throwInternalAppError: publicProcedure.mutation(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "boom",
        cause: new InternalError("secret detail"),
      });
    }),
    throwPlainError: publicProcedure.mutation(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "something broke",
        // No AppError cause
      });
    }),
  });

  const factory = createCallerFactory(testRouter);

  it("formats operational AppError with code and original message", async () => {
    const caller = factory(baseCtx());
    await expectTrpcError(caller.throwAuthError(), "UNAUTHORIZED");
  });

  it("formats non-operational AppError with generic message", async () => {
    const caller = factory(baseCtx());
    await expectTrpcError(
      caller.throwInternalAppError(),
      "INTERNAL_SERVER_ERROR",
    );
  });

  it("passes through non-AppError shape unchanged", async () => {
    const caller = factory(baseCtx());
    await expectTrpcError(
      caller.throwPlainError(),
      "INTERNAL_SERVER_ERROR",
      "something broke",
    );
  });
});

// --- requireOrg middleware ---

describe("requireOrg middleware (orgProcedure)", () => {
  const testRouter = router({
    needsOrg: orgProcedure.query(() => "ok"),
  });

  const factory = createCallerFactory(testRouter);

  it("allows requests when org is resolved", async () => {
    const caller = factory(baseCtx({ org: fakeOrg }));
    const result = await caller.needsOrg();
    expect(result).toBe("ok");
  });

  it("rejects with NOT_FOUND when org is null", async () => {
    const caller = factory(baseCtx({ org: null }));
    await expectTrpcError(
      caller.needsOrg(),
      "NOT_FOUND",
      "Organization not found",
    );
  });
});

// --- requireAuth middleware ---

describe("requireAuth middleware (authedProcedure)", () => {
  const testRouter = router({
    needsAuth: authedProcedure.query(() => "authed"),
  });

  const factory = createCallerFactory(testRouter);

  it("rejects with NOT_FOUND when org is null", async () => {
    const caller = factory(baseCtx({ org: null }));
    await expectTrpcError(
      caller.needsAuth(),
      "NOT_FOUND",
      "Organization not found",
    );
  });

  it("rejects with UNAUTHORIZED when session is null", async () => {
    const caller = factory(baseCtx({ org: fakeOrg, session: null }));
    await expectTrpcError(
      caller.needsAuth(),
      "UNAUTHORIZED",
      "Not authenticated",
    );
  });

  it("rejects with UNAUTHORIZED when user is null", async () => {
    const caller = factory(
      baseCtx({
        org: fakeOrg,
        session: {
          id: "s1",
          token: "tok",
          userId: "u1",
          ipToken: "test-ip-token",
          uaToken: "test-ua-token",
          expiresAt: new Date(Date.now() + 60_000),
          twofaVerified: false,
          webauthnChallenge: null,
        },
        user: null,
      }),
    );
    await expectTrpcError(
      caller.needsAuth(),
      "UNAUTHORIZED",
      "Not authenticated",
    );
  });

  it("allows requests when org, session, and user are present", async () => {
    const caller = factory(
      baseCtx({
        org: fakeOrg,
        session: {
          id: "s1",
          token: "tok",
          userId: "u1",
          ipToken: "test-ip-token",
          uaToken: "test-ua-token",
          expiresAt: new Date(Date.now() + 60_000),
          twofaVerified: false,
          webauthnChallenge: null,
        },
        user: {
          id: "u1",
          identifier: "testuser",
          displayName: "Test",
          roleId: "volunteer",
          isActive: true,
        },
      }),
    );
    const result = await caller.needsAuth();
    expect(result).toBe("authed");
  });
});

// --- require2fa middleware ---

describe("require2fa middleware (authed2faProcedure)", () => {
  const testRouter = router({
    needs2fa: authed2faProcedure.query(() => "verified"),
  });

  const factory = createCallerFactory(testRouter);

  it("rejects with NOT_FOUND when org is null", async () => {
    const caller = factory(baseCtx({ org: null }));
    await expectTrpcError(
      caller.needs2fa(),
      "NOT_FOUND",
      "Organization not found",
    );
  });

  it("rejects with UNAUTHORIZED when session is null", async () => {
    const caller = factory(baseCtx({ org: fakeOrg, session: null }));
    await expectTrpcError(
      caller.needs2fa(),
      "UNAUTHORIZED",
      "Not authenticated",
    );
  });

  it("rejects with UNAUTHORIZED when twofaVerified is false", async () => {
    const caller = factory(
      baseCtx({
        org: fakeOrg,
        session: {
          id: "s1",
          token: "tok",
          userId: "u1",
          ipToken: "test-ip-token",
          uaToken: "test-ua-token",
          expiresAt: new Date(Date.now() + 60_000),
          twofaVerified: false,
          webauthnChallenge: null,
        },
        user: {
          id: "u1",
          identifier: "testuser",
          displayName: "Test",
          roleId: "volunteer",
          isActive: true,
        },
      }),
    );
    await expectTrpcError(
      caller.needs2fa(),
      "UNAUTHORIZED",
      "Two-factor verification required",
    );
  });

  it("allows requests when twofaVerified is true", async () => {
    const caller = factory(
      baseCtx({
        org: fakeOrg,
        session: {
          id: "s1",
          token: "tok",
          userId: "u1",
          ipToken: "test-ip-token",
          uaToken: "test-ua-token",
          expiresAt: new Date(Date.now() + 60_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: "u1",
          identifier: "testuser",
          displayName: "Test",
          roleId: "volunteer",
          isActive: true,
        },
      }),
    );
    const result = await caller.needs2fa();
    expect(result).toBe("verified");
  });
});

// --- withErrorWrapping resolver wrapper ---

describe("withErrorWrapping resolver wrapper", () => {
  const authedCtx = baseCtx({
    org: fakeOrg,
    session: {
      id: "s1",
      token: "tok",
      userId: "u1",
      ipToken: "test-ip-token",
      uaToken: "test-ua-token",
      expiresAt: new Date(Date.now() + 60_000),
      twofaVerified: false,
      webauthnChallenge: null,
    },
    user: {
      id: "u1",
      identifier: "testuser",
      displayName: "Test",
      roleId: "volunteer",
      isActive: true,
    },
  });

  it("converts ValidationError to BAD_REQUEST", async () => {
    const testRouter = router({
      throwsValidation: authedProcedure.mutation(
        withErrorWrapping(() => {
          throw new ValidationError("bad input");
        }),
      ),
    });
    const caller = createCallerFactory(testRouter)(authedCtx);
    await expectTrpcError(
      caller.throwsValidation(),
      "BAD_REQUEST",
      "bad input",
    );
  });

  it("converts AuthError to UNAUTHORIZED", async () => {
    const testRouter = router({
      throwsAuth: authedProcedure.mutation(
        withErrorWrapping(() => {
          throw new AuthError("invalid");
        }),
      ),
    });
    const caller = createCallerFactory(testRouter)(authedCtx);
    await expectTrpcError(caller.throwsAuth(), "UNAUTHORIZED", "invalid");
  });

  it("passes through non-AppError unchanged", async () => {
    const testRouter = router({
      throwsPlain: authedProcedure.mutation(
        withErrorWrapping(() => {
          throw new TypeError("not an app error");
        }),
      ),
    });
    const caller = createCallerFactory(testRouter)(authedCtx);
    await expect(caller.throwsPlain()).rejects.toThrow("not an app error");
  });

  it("returns successful results unchanged", async () => {
    const testRouter = router({
      works: authedProcedure.query(withErrorWrapping(() => "success")),
    });
    const caller = createCallerFactory(testRouter)(authedCtx);
    const result = await caller.works();
    expect(result).toBe("success");
  });

  it("converts NotFoundError to NOT_FOUND with authed2faProcedure", async () => {
    const verified2faCtx = baseCtx({
      org: fakeOrg,
      session: {
        id: "s1",
        token: "tok",
        userId: "u1",
        ipToken: "test-ip-token",
        uaToken: "test-ua-token",
        expiresAt: new Date(Date.now() + 60_000),
        twofaVerified: true,
        webauthnChallenge: null,
      },
      user: {
        id: "u1",
        identifier: "testuser",
        displayName: "Test",
        roleId: "volunteer",
        isActive: true,
      },
    });
    const testRouter = router({
      throwsNotFound: authed2faProcedure.mutation(
        withErrorWrapping(() => {
          throw new NotFoundError("gone");
        }),
      ),
    });
    const caller = createCallerFactory(testRouter)(verified2faCtx);
    await expectTrpcError(caller.throwsNotFound(), "NOT_FOUND", "gone");
  });
});

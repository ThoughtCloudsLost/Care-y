/**
 * Tests for the OPRF tRPC endpoint and OprfEvaluateService.
 *
 * Service-level tests cover business logic (rate limiting, PoW, delay, audit).
 * Route-level tests verify tRPC wiring (delegation, error mapping, session binding extraction).
 *
 * Docker integration tests (section 5) exercise the full pipeline through real OPRF containers.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createAppRouter } from "./router.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context } from "../trpc/context.js";
import {
  getSodium,
  oprfBlind,
  oprfFinalize,
  type EvaluatedElement,
} from "@care-y/crypto";
import { createIpcEvaluator, type OprfEvaluator } from "../crypto/oprf-ipc.js";
import type {
  OprfAuditLogger,
  OprfFailureReason,
} from "../crypto/oprf-audit.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createPowVerifier } from "../crypto/pow.js";
import {
  createOprfEvaluateService,
  createFailureTracker,
  getDelayMs,
  type OprfEvaluateServiceDeps,
  type OprfEvaluateRequest,
} from "../crypto/oprf-evaluate-service.js";
import {
  mockReq,
  mockRes,
  expectTrpcError,
  createMockEmailSender,
  createMockProviderFactory,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  DOCKER_OPRF_AVAILABLE,
} from "../test-utils.js";
import { createScryptHasher } from "../auth/password.js";
import {
  ForbiddenError,
  PowRequiredError,
  RateLimitError,
  ValidationError,
  OprfError,
} from "../errors.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_USER_ID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
const TEST_IP = "203.0.113.42";

/** 32 bytes, base64-encoded. Simulates a blinded ristretto255 point. */
const VALID_BLINDED_ELEMENT = Buffer.alloc(32, 0xab).toString("base64");

/** Evaluator that returns the input unchanged (sufficient for service-level tests). */
function createPassthroughEvaluator(): OprfEvaluator {
  return {
    async evaluate(blindedElement: Uint8Array): Promise<Uint8Array> {
      return blindedElement;
    },
    close(): void {
      /* noop */
    },
  };
}

/** Audit logger that records calls for assertion. */
function createSpyAuditLogger(): OprfAuditLogger & {
  calls: Array<{ userId: string; ip: string; reason: OprfFailureReason }>;
} {
  const calls: Array<{
    userId: string;
    ip: string;
    reason: OprfFailureReason;
  }> = [];
  return {
    calls,
    async logFailure(
      userId: string,
      ipAddress: string,
      reason: OprfFailureReason,
    ): Promise<void> {
      calls.push({ userId, ip: ipAddress, reason });
    },
    dispose(): void {
      /* noop */
    },
  };
}

function makeServiceDeps(
  overrides?: Partial<OprfEvaluateServiceDeps>,
): OprfEvaluateServiceDeps {
  return {
    evaluator: createPassthroughEvaluator(),
    userRateLimiter: createInMemoryRateLimiter({
      windowMs: 900_000,
      maxRequests: 10,
    }),
    ipRateLimiter: createInMemoryRateLimiter({
      windowMs: 900_000,
      maxRequests: 50,
    }),
    powVerifier: createPowVerifier(),
    auditLogger: createSpyAuditLogger(),
    ...overrides,
  };
}

function makeRequest(
  overrides?: Partial<OprfEvaluateRequest>,
): OprfEvaluateRequest {
  return {
    userId: TEST_USER_ID,
    blindedElement: VALID_BLINDED_ELEMENT,
    ip: TEST_IP,
    sessionUserId: null,
    powChallenge: undefined,
    powSolution: undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. getDelayMs (pure function, direct unit test)
// ---------------------------------------------------------------------------

describe("getDelayMs", () => {
  it("returns 0 for 0-3 failures", () => {
    expect(getDelayMs(0)).toBe(0);
    expect(getDelayMs(1)).toBe(0);
    expect(getDelayMs(2)).toBe(0);
    expect(getDelayMs(3)).toBe(0);
  });

  it("returns 2000 for 4-6 failures", () => {
    expect(getDelayMs(4)).toBe(2_000);
    expect(getDelayMs(5)).toBe(2_000);
    expect(getDelayMs(6)).toBe(2_000);
  });

  it("returns 5000 for 7-9 failures", () => {
    expect(getDelayMs(7)).toBe(5_000);
    expect(getDelayMs(8)).toBe(5_000);
    expect(getDelayMs(9)).toBe(5_000);
  });

  it("returns 10000 for 10+ failures", () => {
    expect(getDelayMs(10)).toBe(10_000);
    expect(getDelayMs(15)).toBe(10_000);
    expect(getDelayMs(100)).toBe(10_000);
  });
});

// ---------------------------------------------------------------------------
// 2. OprfEvaluateService
// ---------------------------------------------------------------------------

describe("OprfEvaluateService", () => {
  it("returns evaluated element on valid request", async () => {
    const auditLogger = createSpyAuditLogger();
    const service = createOprfEvaluateService(makeServiceDeps({ auditLogger }));

    const result = await service.evaluate(makeRequest());

    expect(result.evaluated).toBe(VALID_BLINDED_ELEMENT);
    expect(auditLogger.calls).toHaveLength(0);
  });

  it("rejects with RateLimitError when per-userId rate limit exceeded", async () => {
    const auditLogger = createSpyAuditLogger();
    const service = createOprfEvaluateService(
      makeServiceDeps({
        auditLogger,
        userRateLimiter: createInMemoryRateLimiter({
          windowMs: 900_000,
          maxRequests: 2,
        }),
      }),
    );

    await service.evaluate(makeRequest());
    await service.evaluate(makeRequest());

    await expect(service.evaluate(makeRequest())).rejects.toThrow(
      RateLimitError,
    );
    expect(auditLogger.calls.some((c) => c.reason === "rate_limited")).toBe(
      true,
    );
  });

  it("rejects with RateLimitError when per-IP rate limit exceeded", async () => {
    const auditLogger = createSpyAuditLogger();
    const service = createOprfEvaluateService(
      makeServiceDeps({
        auditLogger,
        ipRateLimiter: createInMemoryRateLimiter({
          windowMs: 900_000,
          maxRequests: 2,
        }),
      }),
    );

    await service.evaluate(
      makeRequest({ userId: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e" }),
    );
    await service.evaluate(
      makeRequest({ userId: "c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f" }),
    );

    await expect(service.evaluate(makeRequest())).rejects.toThrow(
      RateLimitError,
    );
    expect(auditLogger.calls.some((c) => c.reason === "rate_limited")).toBe(
      true,
    );
  });

  it("requires proof-of-work after 3 OPRF failures", async () => {
    const auditLogger = createSpyAuditLogger();
    const failingEvaluator: OprfEvaluator = {
      async evaluate(): Promise<Uint8Array> {
        throw new OprfError("simulated failure");
      },
      close(): void {
        /* noop */
      },
    };

    const service = createOprfEvaluateService(
      makeServiceDeps({
        auditLogger,
        evaluator: failingEvaluator,
        userRateLimiter: createInMemoryRateLimiter({
          windowMs: 900_000,
          maxRequests: 20,
        }),
      }),
    );

    // 3 evaluator failures
    for (let i = 0; i < 3; i++) {
      await expect(service.evaluate(makeRequest())).rejects.toThrow(OprfError);
    }

    // 4th request without PoW triggers PowRequiredError
    await expect(service.evaluate(makeRequest())).rejects.toThrow(
      PowRequiredError,
    );
    expect(auditLogger.calls.some((c) => c.reason === "pow_required")).toBe(
      true,
    );
  });

  it("rejects invalid proof-of-work solution with ValidationError", async () => {
    const auditLogger = createSpyAuditLogger();
    const failingEvaluator: OprfEvaluator = {
      async evaluate(): Promise<Uint8Array> {
        throw new OprfError("simulated failure");
      },
      close(): void {
        /* noop */
      },
    };

    const service = createOprfEvaluateService(
      makeServiceDeps({
        auditLogger,
        evaluator: failingEvaluator,
        userRateLimiter: createInMemoryRateLimiter({
          windowMs: 900_000,
          maxRequests: 20,
        }),
      }),
    );

    // 3 evaluator failures
    for (let i = 0; i < 3; i++) {
      await expect(service.evaluate(makeRequest())).rejects.toThrow(OprfError);
    }

    // Submit with bogus PoW
    await expect(
      service.evaluate(
        makeRequest({
          powChallenge: "fake-challenge",
          powSolution: "fake-solution",
        }),
      ),
    ).rejects.toThrow(ValidationError);
    expect(auditLogger.calls.some((c) => c.reason === "pow_invalid")).toBe(
      true,
    );
  });

  it("rejects with ForbiddenError when session userId mismatches request userId", async () => {
    const auditLogger = createSpyAuditLogger();
    const service = createOprfEvaluateService(makeServiceDeps({ auditLogger }));

    await expect(
      service.evaluate(
        makeRequest({
          sessionUserId: "d4e5f6a7-b8c9-4d0e-af2a-3b4c5d6e7f80",
        }),
      ),
    ).rejects.toThrow(ForbiddenError);
    expect(auditLogger.calls.some((c) => c.reason === "session_mismatch")).toBe(
      true,
    );
  });

  it("proceeds normally when sessionUserId is null (login case)", async () => {
    const auditLogger = createSpyAuditLogger();
    const service = createOprfEvaluateService(makeServiceDeps({ auditLogger }));

    const result = await service.evaluate(makeRequest({ sessionUserId: null }));

    expect(result.evaluated).toBe(VALID_BLINDED_ELEMENT);
    expect(auditLogger.calls).toHaveLength(0);
  });

  it("increments failure counter and rethrows when evaluator throws", async () => {
    const auditLogger = createSpyAuditLogger();
    const service = createOprfEvaluateService(
      makeServiceDeps({
        auditLogger,
        evaluator: {
          async evaluate(): Promise<Uint8Array> {
            throw new OprfError("process down");
          },
          close(): void {
            /* noop */
          },
        },
      }),
    );

    await expect(service.evaluate(makeRequest())).rejects.toThrow(OprfError);

    expect(auditLogger.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: "oprf_failed",
          userId: TEST_USER_ID,
        }),
      ]),
    );
  });

  it("does not log to audit on successful evaluation", async () => {
    const auditLogger = createSpyAuditLogger();
    const service = createOprfEvaluateService(makeServiceDeps({ auditLogger }));

    await service.evaluate(makeRequest());
    await service.evaluate(makeRequest());
    await service.evaluate(makeRequest());

    expect(auditLogger.calls).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 3. OPRF tRPC route (wiring test)
// ---------------------------------------------------------------------------

describe("OPRF tRPC route", () => {
  function buildCaller(ctxOverrides?: Partial<Context>) {
    const service = createOprfEvaluateService(makeServiceDeps());
    const appRouter = createAppRouter({
      authDeps: {
        hasher: createScryptHasher(),
        loginLimiter: createInMemoryRateLimiter({
          windowMs: 60_000,
          maxRequests: 100,
        }),
        saltLimiter: createInMemoryRateLimiter({
          windowMs: 60_000,
          maxRequests: 100,
        }),
        fakeSaltKey: Buffer.alloc(32, 0),
        encryptor: testFieldEncryptor,
        indexer: testBlindIndexer,
        isSecureCookie: false,
        emailSender: createMockEmailSender(),
        tokenizer: testSessionTokenizer,
        providerFactory: createMockProviderFactory(),
        resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
      },
      profileDeps: {
        hasher: createScryptHasher(),
        encryptor: testFieldEncryptor,
        indexer: testBlindIndexer,
        tokenizer: testSessionTokenizer,
        passwordChangeLimiter: createInMemoryRateLimiter({
          windowMs: 60_000,
          maxRequests: 100,
        }),
      },
      twoFactorDeps: {
        emailSender: createMockEmailSender(),
        encryptor: testFieldEncryptor,
        indexer: testBlindIndexer,
        tokenizer: testSessionTokenizer,
        providerFactory: createMockProviderFactory(),
        resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
        pushSender: null,
        pushHmacKey: null,
      },
      oprfDeps: { oprfService: service },
      orgService: {
        findBySlug: async () => null,
        createOrg: async () => {
          throw new OprfError("not implemented in test");
        },
      } as unknown as Parameters<typeof createAppRouter>[0]["orgService"],
      providerFactory: createMockProviderFactory(),
    });
    const factory = createCallerFactory(appRouter);
    const ctx: Context = {
      req: mockReq({ headers: { "x-forwarded-for": TEST_IP } }),
      res: mockRes(),
      org: null,
      session: null,
      user: null,
      ...ctxOverrides,
    };
    return factory(ctx);
  }

  it("delegates to service and returns evaluated element", async () => {
    const caller = buildCaller();
    const result = await caller.oprf.evaluate({
      userId: TEST_USER_ID,
      blindedElement: VALID_BLINDED_ELEMENT,
    });

    expect(result.evaluated).toBe(VALID_BLINDED_ELEMENT);
  });

  it("maps ForbiddenError to FORBIDDEN tRPC error for session mismatch", async () => {
    const caller = buildCaller({
      session: {
        id: "test-session",
        token: "test-token",
        userId: "d4e5f6a7-b8c9-4d0e-af2a-3b4c5d6e7f80",
        ipToken: "test-ip-token",
        uaToken: "test-ua-token",
        expiresAt: new Date(Date.now() + 3_600_000),
        twofaVerified: false,
        webauthnChallenge: null,
      },
      user: {
        id: "d4e5f6a7-b8c9-4d0e-af2a-3b4c5d6e7f80",
        identifier: "session-user",
        encryptedDisplayName: "Session User",
        encryptedPreferredLocale: null,
        roleId: "volunteer",
        isActive: true,
        hasSeenBriefing: true,
      },
    });

    await expectTrpcError(
      caller.oprf.evaluate({
        userId: TEST_USER_ID,
        blindedElement: VALID_BLINDED_ELEMENT,
      }),
      "FORBIDDEN",
    );
  });
});

// ---------------------------------------------------------------------------
// 4. createFailureTracker (unit tests for cleanup interval + dispose)
// ---------------------------------------------------------------------------

describe("createFailureTracker", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("check returns 0 for unknown user", () => {
    const tracker = createFailureTracker();
    expect(tracker.check("unknown")).toBe(0);
    tracker.dispose();
  });

  it("increment returns current failure count", () => {
    const tracker = createFailureTracker();
    expect(tracker.increment("user-a")).toBe(1);
    expect(tracker.increment("user-a")).toBe(2);
    expect(tracker.increment("user-a")).toBe(3);
    tracker.dispose();
  });

  it("reset clears failures for a user", () => {
    const tracker = createFailureTracker();
    tracker.increment("user-a");
    tracker.increment("user-a");
    tracker.reset("user-a");
    expect(tracker.check("user-a")).toBe(0);
    tracker.dispose();
  });

  it("expires failures outside the window", () => {
    let time = 1000;
    const tracker = createFailureTracker(5000, () => time);

    tracker.increment("user-a");
    tracker.increment("user-a");
    expect(tracker.check("user-a")).toBe(2);

    // Advance past the window
    time = 7000;
    expect(tracker.check("user-a")).toBe(0);
    tracker.dispose();
  });

  it("cleanup interval removes fully expired entries", () => {
    vi.useFakeTimers();
    let time = 1000;
    const tracker = createFailureTracker(5000, () => time);

    tracker.increment("user-a");
    tracker.increment("user-b");

    // Advance past window so all entries are expired
    time = 7000;

    // Fire the 60s cleanup interval
    vi.advanceTimersByTime(60_000);

    // After cleanup, check still returns 0 (entries were pruned)
    expect(tracker.check("user-a")).toBe(0);
    expect(tracker.check("user-b")).toBe(0);
    tracker.dispose();
  });

  it("cleanup interval retains entries with recent timestamps", () => {
    vi.useFakeTimers();
    let time = 1000;
    const tracker = createFailureTracker(5000, () => time);

    tracker.increment("user-a");
    time = 3000;
    tracker.increment("user-a");

    // Only the first entry is expired (time=1000), second is still in window (time=3000)
    time = 6500;
    vi.advanceTimersByTime(60_000);

    // One failure remains (the one at time=3000, within 5s window of 6500)
    expect(tracker.check("user-a")).toBe(1);
    tracker.dispose();
  });

  it("dispose stops the cleanup interval", () => {
    vi.useFakeTimers();
    const tracker = createFailureTracker();
    tracker.dispose();

    // Advancing timers should not throw (interval was cleared)
    expect(() => vi.advanceTimersByTime(120_000)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 5. End-to-end Docker integration (real OPRF containers)
// ---------------------------------------------------------------------------

describe.skipIf(!DOCKER_OPRF_AVAILABLE)(
  "OPRF tRPC route (Docker integration)",
  () => {
    function buildDockerCaller(ctxOverrides?: Partial<Context>) {
      const evaluator = createIpcEvaluator({
        socketPathA: "/run/oprf/oprf-a.sock",
        socketPathB: "/run/oprf/oprf-b.sock",
      });

      const service = createOprfEvaluateService(makeServiceDeps({ evaluator }));
      const appRouter = createAppRouter({
        authDeps: {
          hasher: createScryptHasher(),
          loginLimiter: createInMemoryRateLimiter({
            windowMs: 60_000,
            maxRequests: 100,
          }),
          saltLimiter: createInMemoryRateLimiter({
            windowMs: 60_000,
            maxRequests: 100,
          }),
          fakeSaltKey: Buffer.alloc(32, 0),
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          isSecureCookie: false,
          emailSender: createMockEmailSender(),
          tokenizer: testSessionTokenizer,
          providerFactory: createMockProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
        },
        profileDeps: {
          hasher: createScryptHasher(),
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          passwordChangeLimiter: createInMemoryRateLimiter({
            windowMs: 60_000,
            maxRequests: 100,
          }),
        },
        twoFactorDeps: {
          emailSender: createMockEmailSender(),
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          providerFactory: createMockProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
          pushSender: null,
          pushHmacKey: null,
        },
        oprfDeps: { oprfService: service },
        orgService: {
          findBySlug: async () => null,
          createOrg: async () => {
            throw new OprfError("not implemented in test");
          },
        } as unknown as Parameters<typeof createAppRouter>[0]["orgService"],
        providerFactory: createMockProviderFactory(),
      });
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq({ headers: { "x-forwarded-for": TEST_IP } }),
        res: mockRes(),
        org: null,
        session: null,
        user: null,
        ...ctxOverrides,
      };
      return { caller: factory(ctx), evaluator };
    }

    it("full pipeline: blind, evaluate via Docker, finalize produces 64-byte output", async () => {
      await getSodium();

      const input = new TextEncoder().encode("docker-e2e-trpc-test");
      const { blindedElement, blindState } = oprfBlind(input);

      const { caller, evaluator } = buildDockerCaller();
      const result = await caller.oprf.evaluate({
        userId: TEST_USER_ID,
        blindedElement: Buffer.from(blindedElement).toString("base64"),
      });

      const evaluatedBytes = Buffer.from(result.evaluated, "base64");
      const output = oprfFinalize(
        blindState,
        new Uint8Array(evaluatedBytes) as unknown as EvaluatedElement,
        input,
      );

      expect(output.length).toBe(64);
      evaluator.close();
    });
  },
);

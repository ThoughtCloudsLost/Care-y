/**
 * Router-level tests for the client-portal tRPC router.
 *
 * Uses mocked services and createCallerFactory to verify:
 * - Rate limiter enforcement on submitIntake and getIntakeChallenge
 * - PoW gate (enabled/disabled, missing/invalid/reused solutions)
 * - Service delegation and response shape
 * - Generic error responses (no org internals leaked)
 *
 * Service-layer logic is tested in intake-service.test.ts.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createClientPortalRouter,
  type ClientPortalRouterDeps,
} from "./client-portal.js";
import { createCallerFactory } from "../trpc/trpc.js";
import {
  mockReq,
  mockRes,
  stubTenantDbDefaultRoles,
  expectTrpcError,
  testSealedBox,
} from "../test-utils.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { PowVerifier } from "../crypto/pow.js";
import type { IntakeFormService } from "../portal/intake-form-service.js";
import type { NotificationService } from "../notifications/service.js";
import { IntakeQueueNotConfiguredError } from "../portal/intake-service.js";
import type * as IntakeServiceModule from "../portal/intake-service.js";
import type { IntakeSubmissionInput } from "@care-y/shared";

// --- Mock intake service ---

const mockCreateIntakeTicket = vi.fn();

// vi.mock required: intake-service.ts imports DB modules (Kysely, alias-generator)
// that trigger side effects and type errors when imported directly in a non-DB test.
vi.mock("../portal/intake-service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IntakeServiceModule>()),
  createIntakeTicket: (...args: unknown[]) =>
    (mockCreateIntakeTicket as (...a: unknown[]) => unknown)(...args),
}));

// --- Helpers ---

function createMockOrgContext(): OrgContext {
  return {
    orgId: "org-portal-test",
    orgSlug: "test-org",
    orgSchema: "org_test",
    tenantDb: stubTenantDbDefaultRoles(),
    sealedBox: testSealedBox,
  };
}

function makeContext(overrides?: { remoteAddress?: string }): Context {
  return {
    req: mockReq({ remoteAddress: overrides?.remoteAddress ?? "10.0.0.1" }),
    res: mockRes(),
    org: createMockOrgContext(),
    session: null,
    user: null,
  };
}

function allowLimiter(): RateLimiter {
  return {
    check: () => ({ allowed: true, remaining: 10, retryAfterMs: 0 }),
    reset: () => undefined,
  };
}

function denyLimiter(retryAfterMs = 3000): RateLimiter {
  return {
    check: () => ({ allowed: false, remaining: 0, retryAfterMs }),
    reset: () => undefined,
  };
}

function mockIntakeFormService(): IntakeFormService {
  return {
    getPublicForm: vi.fn().mockResolvedValue(null),
    getForm: vi.fn(),
    saveForm: vi.fn(),
    listForms: vi.fn(),
    deleteForm: vi.fn(),
    setActive: vi.fn(),
    isWebIntakeEnabled: vi.fn().mockResolvedValue(true),
    setWebIntakeEnabled: vi.fn(),
    resolvePublicForm: vi.fn().mockResolvedValue({
      formId: null,
      slug: null,
      fields: null,
      intakeDisabled: false,
    }),
  };
}

function mockNotificationService(): NotificationService {
  return {
    dispatch: vi.fn().mockResolvedValue(undefined),
  } as unknown as NotificationService;
}

function buildDeps(
  overrides?: Partial<ClientPortalRouterDeps>,
): ClientPortalRouterDeps {
  return {
    submissionLimiter: allowLimiter(),
    challengeLimiter: allowLimiter(),
    powVerifier: null,
    intakeFormService: mockIntakeFormService(),
    notificationService: mockNotificationService(),
    ...overrides,
  };
}

/** 80 bytes of valid base64 for the wrappedTk field. */
const VALID_WRAPPED_TK = Buffer.alloc(80, 0xab).toString("base64");
const VALID_BASE64 = Buffer.from("test-ciphertext").toString("base64");

function makeSubmitInput(
  overrides?: Partial<IntakeSubmissionInput>,
): IntakeSubmissionInput {
  return {
    ticketId: crypto.randomUUID(),
    followUpId: crypto.randomUUID(),
    formId: null,
    encryptedTitle: VALID_BASE64,
    encryptedDescription: VALID_BASE64,
    encryptedMessage: VALID_BASE64,
    encryptedFormResponse: VALID_BASE64,
    wrappedTk: VALID_WRAPPED_TK,
    ...overrides,
  };
}

function buildCaller(deps?: ClientPortalRouterDeps, ctx?: Context) {
  const routerInstance = createClientPortalRouter(deps ?? buildDeps());
  return createCallerFactory(routerInstance)(ctx ?? makeContext());
}

// --- Tests ---

describe("client-portal router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateIntakeTicket.mockResolvedValue({
      ticketId: "t-1",
      clientAlias: "calm-pebble-7",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getIntakeConfig", () => {
    it("returns powRequired false when verifier is null", async () => {
      const caller = buildCaller(buildDeps({ powVerifier: null }));
      const result = await caller.getIntakeConfig();
      expect(result).toEqual({ powRequired: false });
    });

    it("returns powRequired true when verifier is present", async () => {
      const mockVerifier: PowVerifier = {
        createChallenge: vi.fn(),
        verify: vi.fn(),
        dispose: vi.fn(),
      };
      const caller = buildCaller(buildDeps({ powVerifier: mockVerifier }));
      const result = await caller.getIntakeConfig();
      expect(result).toEqual({ powRequired: true });
    });
  });

  describe("getIntakeForm", () => {
    it("returns null fields when no form resolves (built-in fallback signal)", async () => {
      const caller = buildCaller();
      const result = await caller.getIntakeForm();
      expect(result).toEqual({
        formId: null,
        slug: null,
        fields: null,
        intakeDisabled: false,
      });
    });

    it("passes the resolved form through as-is", async () => {
      const formService = mockIntakeFormService();
      const formData = {
        formId: "f-1",
        slug: "general-help",
        fields: [
          {
            id: "field-1",
            fieldType: "text",
            role: null,
            encryptedLabel: VALID_BASE64,
            encryptedConfig: VALID_BASE64,
            isRequired: true,
          },
        ],
        intakeDisabled: false,
      };
      (
        formService.resolvePublicForm as ReturnType<typeof vi.fn>
      ).mockResolvedValue(formData);
      const caller = buildCaller(buildDeps({ intakeFormService: formService }));
      const result = await caller.getIntakeForm({ slug: "general-help" });
      expect(result).toEqual(formData);
      expect(formService.resolvePublicForm).toHaveBeenCalledWith(
        expect.anything(),
        "general-help",
      );
    });
  });

  describe("getIntakeChallenge", () => {
    it("returns NOT_FOUND when PoW is disabled", async () => {
      const caller = buildCaller(buildDeps({ powVerifier: null }));
      await expectTrpcError(caller.getIntakeChallenge(), "NOT_FOUND");
    });

    it("returns a challenge when PoW is enabled", async () => {
      const mockVerifier: PowVerifier = {
        createChallenge: vi.fn().mockReturnValue({
          challenge: "abc123",
          difficulty: 16,
          expiresAt: new Date().toISOString(),
        }),
        verify: vi.fn(),
        dispose: vi.fn(),
      };
      const caller = buildCaller(buildDeps({ powVerifier: mockVerifier }));
      const result = await caller.getIntakeChallenge();
      expect(result.challenge).toBe("abc123");
      expect(result.difficulty).toBe(16);
    });

    it("rejects when challenge rate limit is exceeded", async () => {
      const mockVerifier: PowVerifier = {
        createChallenge: vi.fn(),
        verify: vi.fn(),
        dispose: vi.fn(),
      };
      const caller = buildCaller(
        buildDeps({
          powVerifier: mockVerifier,
          challengeLimiter: denyLimiter(),
        }),
      );
      await expectTrpcError(caller.getIntakeChallenge(), "TOO_MANY_REQUESTS");
    });
  });

  describe("submitIntake", () => {
    it("returns alias on successful submission", async () => {
      const caller = buildCaller();
      const result = await caller.submitIntake(makeSubmitInput());
      expect(result).toEqual({ reference: "calm-pebble-7" });
      expect(mockCreateIntakeTicket).toHaveBeenCalledOnce();
    });

    it("rejects the 4th submission from same IP within the window", async () => {
      let callCount = 0;
      const trackingLimiter: RateLimiter = {
        check: () => {
          callCount++;
          if (callCount > 3) {
            return { allowed: false, remaining: 0, retryAfterMs: 2400_000 };
          }
          return { allowed: true, remaining: 3 - callCount, retryAfterMs: 0 };
        },
        reset: () => undefined,
      };

      const deps = buildDeps({ submissionLimiter: trackingLimiter });
      const ctx = makeContext();
      const routerInstance = createClientPortalRouter(deps);
      const factory = createCallerFactory(routerInstance);

      // First 3 succeed
      for (let i = 0; i < 3; i++) {
        const caller = factory(ctx);
        const result = await caller.submitIntake(makeSubmitInput());
        expect(result.reference).toBe("calm-pebble-7");
      }

      // 4th is rejected
      const caller = factory(ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.submitIntake(makeSubmitInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
    });

    it("rejects when PoW is enabled but pow field is missing", async () => {
      const mockVerifier: PowVerifier = {
        createChallenge: vi.fn(),
        verify: vi.fn(),
        dispose: vi.fn(),
      };
      const caller = buildCaller(buildDeps({ powVerifier: mockVerifier }));

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.submitIntake(makeSubmitInput()),
        "BAD_REQUEST",
        "challenge required",
      );
      warnSpy.mockRestore();
    });

    it("rejects when PoW solution is invalid", async () => {
      const mockVerifier: PowVerifier = {
        createChallenge: vi.fn(),
        verify: vi.fn().mockReturnValue(false),
        dispose: vi.fn(),
      };
      const caller = buildCaller(buildDeps({ powVerifier: mockVerifier }));

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.submitIntake(
          makeSubmitInput({
            pow: { challenge: "bad-challenge", solution: "bad-solution" },
          }),
        ),
        "BAD_REQUEST",
        "challenge failed",
      );
      warnSpy.mockRestore();
    });

    it("succeeds with valid PoW when enabled", async () => {
      const mockVerifier: PowVerifier = {
        createChallenge: vi.fn(),
        verify: vi.fn().mockReturnValue(true),
        dispose: vi.fn(),
      };
      const caller = buildCaller(buildDeps({ powVerifier: mockVerifier }));

      const result = await caller.submitIntake(
        makeSubmitInput({
          pow: { challenge: "good-challenge", solution: "good-solution" },
        }),
      );
      expect(result).toEqual({ reference: "calm-pebble-7" });
    });

    it("ignores a supplied pow object when PoW is disabled", async () => {
      const caller = buildCaller(buildDeps({ powVerifier: null }));

      const result = await caller.submitIntake(
        makeSubmitInput({
          pow: { challenge: "irrelevant", solution: "irrelevant" },
        }),
      );
      expect(result).toEqual({ reference: "calm-pebble-7" });
    });

    it("returns generic error when intake queue is not configured", async () => {
      mockCreateIntakeTicket.mockRejectedValue(
        new IntakeQueueNotConfiguredError(),
      );
      const caller = buildCaller();

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.submitIntake(makeSubmitInput()),
        "INTERNAL_SERVER_ERROR",
      );
      warnSpy.mockRestore();
    });

    it("response contains exactly { reference }", async () => {
      const caller = buildCaller();
      const result = await caller.submitIntake(makeSubmitInput());
      expect(Object.keys(result)).toEqual(["reference"]);
      expect(typeof result.reference).toBe("string");
    });
  });
});

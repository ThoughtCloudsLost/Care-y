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
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import { IntakeQueueNotConfiguredError } from "../portal/intake-service.js";
import type * as IntakeServiceModule from "../portal/intake-service.js";
import type { IntakeSubmissionInput } from "@care-y/shared";
import type { PortalChannelRow } from "../portal/channel-service.js";
import type {
  PortalBootstrapResult,
  PortalReplyServiceInput,
} from "../portal/portal-message-service.js";

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

  // -----------------------------------------------------------------
  // Secure Link portal procedures (appended by 8b)
  // -----------------------------------------------------------------

  describe("portalBootstrap", () => {
    const VALID_CHANNEL_ID = "a".repeat(48);
    const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

    function makeBootstrapInput(): { channelId: string; auth: string } {
      return { channelId: VALID_CHANNEL_ID, auth: VALID_AUTH };
    }

    function fakeChannelRow(): PortalChannelRow {
      return {
        id: crypto.randomUUID(),
        client_id: crypto.randomUUID(),
        channel_id: VALID_CHANNEL_ID,
        auth_hash: Buffer.alloc(32, 0xaa),
        client_public: Buffer.alloc(32, 0xbb),
        has_passphrase: false,
        key_check_ephemeral_point: Buffer.alloc(32),
        key_check_nonce: Buffer.alloc(24),
        key_check_ciphertext: Buffer.alloc(48),
        status: "active",
        created_at: new Date(),
        last_seen_at: null,
        last_notified_at: null,
        revoked_at: null,
      };
    }

    function fakeBootstrapResult(): PortalBootstrapResult {
      return {
        hasPassphrase: false,
        keyCheck: {
          ephemeralPoint: Buffer.alloc(32).toString("base64"),
          nonce: Buffer.alloc(24).toString("base64"),
          ciphertext: Buffer.alloc(48).toString("base64"),
        },
        ticketId: crypto.randomUUID(),
        messages: [],
        messagesExpireDays: 30,
        safeExitUrl: null,
      };
    }

    function buildPortalDeps(
      overrides?: Partial<ClientPortalRouterDeps>,
    ): ClientPortalRouterDeps {
      const channel = fakeChannelRow();
      return buildDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(channel),
        },
        portalMessageService: {
          bootstrap: vi.fn().mockResolvedValue(fakeBootstrapResult()),
          clientReply: vi.fn().mockResolvedValue(undefined),
        },
        portalReadLimiter: allowLimiter(),
        portalReplyLimiter: allowLimiter(),
        fieldEncryptor: {
          encrypt: vi.fn(),
          decrypt: vi.fn(),
        } as unknown as FieldEncryptor,
        ...overrides,
      });
    }

    it("returns bootstrap result with valid auth", async () => {
      const portalDeps = buildPortalDeps();
      const caller = buildCaller(portalDeps);
      const result = await caller.portalBootstrap(makeBootstrapInput());
      expect(result.messagesExpireDays).toBe(30);
      expect(result.keyCheck).toBeDefined();
      expect(result.hasPassphrase).toBe(false);
      expect(
        portalDeps.portalChannelService!.resolveAuthedChannel,
      ).toHaveBeenCalledOnce();
    });

    it("returns NOT_FOUND for wrong auth (null from resolveAuthedChannel)", async () => {
      const portalDeps = buildPortalDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
      });
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const caller = buildCaller(portalDeps);
      const err = await expectTrpcError(
        caller.portalBootstrap(makeBootstrapInput()),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
      // Verify generic message (enumeration resistance)
      expect(err.message).toBe("Channel not found or not available");
    });

    it("returns NOT_FOUND for unknown channel (same shape as wrong auth)", async () => {
      const portalDeps = buildPortalDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
      });
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const caller = buildCaller(portalDeps);
      const unknownErr = await expectTrpcError(
        caller.portalBootstrap({
          channelId: "b".repeat(48),
          auth: VALID_AUTH,
        }),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
      expect(unknownErr.message).toBe("Channel not found or not available");
    });

    it("returns NOT_FOUND for revoked channel (same shape as wrong auth)", async () => {
      const portalDeps = buildPortalDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
      });
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const caller = buildCaller(portalDeps);
      const revokedErr = await expectTrpcError(
        caller.portalBootstrap(makeBootstrapInput()),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
      // All three error paths produce byte-identical shapes
      expect(revokedErr.message).toBe("Channel not found or not available");
      expect(revokedErr.code).toBe("NOT_FOUND");
    });

    it("rejects the 61st read with TOO_MANY_REQUESTS", async () => {
      let callCount = 0;
      const trackingLimiter: RateLimiter = {
        check: () => {
          callCount++;
          if (callCount > 60) {
            return { allowed: false, remaining: 0, retryAfterMs: 1800_000 };
          }
          return {
            allowed: true,
            remaining: 60 - callCount,
            retryAfterMs: 0,
          };
        },
        reset: () => undefined,
      };

      const portalDeps = buildPortalDeps({
        portalReadLimiter: trackingLimiter,
      });
      const ctx = makeContext();
      const routerInstance = createClientPortalRouter(portalDeps);
      const factory = createCallerFactory(routerInstance);

      // First 60 succeed
      for (let i = 0; i < 60; i++) {
        const caller = factory(ctx);
        const result = await caller.portalBootstrap(makeBootstrapInput());
        expect(result.messagesExpireDays).toBe(30);
      }

      // 61st is rejected
      const caller = factory(ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.portalBootstrap(makeBootstrapInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
    });

    it("returns NOT_FOUND when portal deps are not configured", async () => {
      // No portal deps at all (intake-only configuration)
      const caller = buildCaller(buildDeps());
      await expectTrpcError(
        caller.portalBootstrap(makeBootstrapInput()),
        "NOT_FOUND",
      );
    });
  });

  describe("portalMessages", () => {
    const VALID_CHANNEL_ID = "a".repeat(48);
    const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

    function makeMessagesInput(): { channelId: string; auth: string } {
      return { channelId: VALID_CHANNEL_ID, auth: VALID_AUTH };
    }

    function fakeChannelRow(): PortalChannelRow {
      return {
        id: crypto.randomUUID(),
        client_id: crypto.randomUUID(),
        channel_id: VALID_CHANNEL_ID,
        auth_hash: Buffer.alloc(32, 0xaa),
        client_public: Buffer.alloc(32, 0xbb),
        has_passphrase: false,
        key_check_ephemeral_point: Buffer.alloc(32),
        key_check_nonce: Buffer.alloc(24),
        key_check_ciphertext: Buffer.alloc(48),
        status: "active",
        created_at: new Date(),
        last_seen_at: null,
        last_notified_at: null,
        revoked_at: null,
      };
    }

    it("returns messages without keyCheck or hasPassphrase", async () => {
      const channel = fakeChannelRow();
      const bootstrapResult: PortalBootstrapResult = {
        hasPassphrase: true,
        keyCheck: {
          ephemeralPoint: "ep",
          nonce: "n",
          ciphertext: "ct",
        },
        ticketId: crypto.randomUUID(),
        messages: [
          {
            direction: "to_client",
            ephemeralPoint: "ep1",
            nonce: "n1",
            ciphertext: "ct1",
            createdAt: new Date().toISOString(),
            editedAt: null,
          },
        ],
        messagesExpireDays: 30,
        safeExitUrl: null,
      };

      const portalDeps = buildDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(channel),
        },
        portalMessageService: {
          bootstrap: vi.fn().mockResolvedValue(bootstrapResult),
          clientReply: vi.fn(),
        },
        portalReadLimiter: allowLimiter(),
        portalReplyLimiter: allowLimiter(),
        fieldEncryptor: {
          encrypt: vi.fn(),
          decrypt: vi.fn(),
        } as unknown as FieldEncryptor,
      });

      const caller = buildCaller(portalDeps);
      const result = await caller.portalMessages(makeMessagesInput());

      // Should NOT include keyCheck or hasPassphrase
      expect(result).not.toHaveProperty("keyCheck");
      expect(result).not.toHaveProperty("hasPassphrase");
      // Should include messages, ticketId, messagesExpireDays
      expect(result.messages).toHaveLength(1);
      expect(result.ticketId).toBe(bootstrapResult.ticketId);
      expect(result.messagesExpireDays).toBe(30);
    });
  });

  describe("portalReply", () => {
    const VALID_CHANNEL_ID = "a".repeat(48);
    const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

    function fakeChannelRow(): PortalChannelRow {
      return {
        id: crypto.randomUUID(),
        client_id: crypto.randomUUID(),
        channel_id: VALID_CHANNEL_ID,
        auth_hash: Buffer.alloc(32, 0xaa),
        client_public: Buffer.alloc(32, 0xbb),
        has_passphrase: false,
        key_check_ephemeral_point: Buffer.alloc(32),
        key_check_nonce: Buffer.alloc(24),
        key_check_ciphertext: Buffer.alloc(48),
        status: "active",
        created_at: new Date(),
        last_seen_at: null,
        last_notified_at: null,
        revoked_at: null,
      };
    }

    function makeReplyInput(): {
      channelId: string;
      auth: string;
      ticketId: string;
      followUpId: string;
      keyGeneration: string;
      encryptedContent: string;
      wrappedTkTemp: string;
      selfCopy: {
        ephemeralPoint: string;
        nonce: string;
        ciphertext: string;
      };
    } {
      return {
        channelId: VALID_CHANNEL_ID,
        auth: VALID_AUTH,
        ticketId: crypto.randomUUID(),
        followUpId: crypto.randomUUID(),
        keyGeneration: crypto.randomUUID(),
        encryptedContent: Buffer.from("test-content").toString("base64"),
        wrappedTkTemp: Buffer.alloc(80, 0xdd).toString("base64"),
        selfCopy: {
          ephemeralPoint: Buffer.alloc(32, 0xee).toString("base64"),
          nonce: Buffer.alloc(24, 0xff).toString("base64"),
          ciphertext: Buffer.from("self-copy-ct").toString("base64"),
        },
      };
    }

    function buildReplyDeps(
      overrides?: Partial<ClientPortalRouterDeps>,
    ): ClientPortalRouterDeps {
      const channel = fakeChannelRow();
      return buildDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(channel),
        },
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: vi.fn().mockResolvedValue(undefined),
        },
        portalReadLimiter: allowLimiter(),
        portalReplyLimiter: allowLimiter(),
        fieldEncryptor: {
          encrypt: vi.fn(),
          decrypt: vi.fn(),
        } as unknown as FieldEncryptor,
        ...overrides,
      });
    }

    it("returns empty object on successful reply", async () => {
      const replyDeps = buildReplyDeps();
      const caller = buildCaller(replyDeps);
      const result = await caller.portalReply(makeReplyInput());
      expect(result).toEqual({});
      expect(
        replyDeps.portalMessageService!.clientReply,
      ).toHaveBeenCalledOnce();
    });

    it("decodes base64 fields to Buffers before delegating to service", async () => {
      const mockClientReply = vi.fn().mockResolvedValue(undefined);
      const replyDeps = buildReplyDeps({
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: mockClientReply,
        },
      });
      const caller = buildCaller(replyDeps);
      const input = makeReplyInput();
      await caller.portalReply(input);

      // Verify the service received Buffer types for ciphertext fields
      const serviceInput = mockClientReply.mock
        .calls[0]?.[3] as PortalReplyServiceInput;
      expect(Buffer.isBuffer(serviceInput.encryptedContent)).toBe(true);
      expect(Buffer.isBuffer(serviceInput.wrappedTkTemp)).toBe(true);
      expect(Buffer.isBuffer(serviceInput.selfCopy.ephemeralPoint)).toBe(true);
      expect(Buffer.isBuffer(serviceInput.selfCopy.nonce)).toBe(true);
      expect(Buffer.isBuffer(serviceInput.selfCopy.ciphertext)).toBe(true);
    });

    it("rejects oversized ciphertext via schema before any DB touch", async () => {
      const replyDeps = buildReplyDeps();
      const caller = buildCaller(replyDeps);
      const input = makeReplyInput();
      // Exceed the 28_000 char limit on encryptedContent
      input.encryptedContent = "A".repeat(28_001);

      await expectTrpcError(caller.portalReply(input), "BAD_REQUEST");
      // Service should never have been called
      expect(
        replyDeps.portalMessageService!.clientReply,
      ).not.toHaveBeenCalled();
    });

    it("returns generic error after revocation", async () => {
      const replyDeps = buildReplyDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
      });
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const caller = buildCaller(replyDeps);
      const err = await expectTrpcError(
        caller.portalReply(makeReplyInput()),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Channel not found or not available");
    });

    it("rejects the 31st reply with TOO_MANY_REQUESTS", async () => {
      let callCount = 0;
      const trackingLimiter: RateLimiter = {
        check: () => {
          callCount++;
          if (callCount > 30) {
            return { allowed: false, remaining: 0, retryAfterMs: 1800_000 };
          }
          return {
            allowed: true,
            remaining: 30 - callCount,
            retryAfterMs: 0,
          };
        },
        reset: () => undefined,
      };

      const replyDeps = buildReplyDeps({
        portalReplyLimiter: trackingLimiter,
      });
      const ctx = makeContext();
      const routerInstance = createClientPortalRouter(replyDeps);
      const factory = createCallerFactory(routerInstance);

      // First 30 succeed
      for (let i = 0; i < 30; i++) {
        const caller = factory(ctx);
        const result = await caller.portalReply(makeReplyInput());
        expect(result).toEqual({});
      }

      // 31st is rejected
      const caller = factory(ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.portalReply(makeReplyInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
    });
  });
});

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

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import { getSodium } from "@care-y/crypto";
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
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { IntakeFormService } from "../portal/intake-form-service.js";
import type { NotificationService } from "../notifications/service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import { IntakeQueueNotConfiguredError } from "../portal/intake-service.js";
import type * as IntakeServiceModule from "../portal/intake-service.js";
import type * as ShareServiceModule from "../portal/share-service.js";
import type { IntakeSubmissionInput } from "@care-y/shared";
import { RoleId, clientAccountIdSchema } from "@care-y/shared";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  OrgId,
  OrgSlug,
  OrgSchema,
  ChannelRowId,
  ClientId,
  ClientAccountId,
  ChannelSecret,
  TicketId,
  FollowupId,
} from "@care-y/shared";
import type { SessionData } from "../auth/session-repository.js";
import type { PortalChannelRow } from "../portal/channel-service.js";
import type {
  PortalBootstrapResult,
  PortalReplyServiceInput,
} from "../portal/portal-message-service.js";
import type * as AccountServiceModule from "../portal/account-service.js";
import {
  UsernameTakenError,
  StaleThreadError,
} from "../portal/portal-errors.js";
import type { MockResWithCookies } from "../test-utils.js";

// --- Mock intake service ---

const mockCreateIntakeTicket = vi.fn();

// vi.mock required: intake-service.ts imports DB modules (Kysely, alias-generator)
// that trigger side effects and type errors when imported directly in a non-DB test.
vi.mock("../portal/intake-service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof IntakeServiceModule>()),
  createIntakeTicket: (...args: unknown[]) =>
    (mockCreateIntakeTicket as (...a: unknown[]) => unknown)(...args),
}));

// --- Mock account service ---

const mockGetSaltForUsername = vi.fn();
const mockAccountLogin = vi.fn();
const mockResolveAccountSession = vi.fn();
const mockAccountLogout = vi.fn();
const mockUpgradeFromSecureLink = vi.fn();
const mockChangePassword = vi.fn();

vi.mock("../portal/account-service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AccountServiceModule>()),
  getSaltForUsername: (...args: unknown[]) =>
    (mockGetSaltForUsername as (...a: unknown[]) => unknown)(...args),
  login: (...args: unknown[]) =>
    (mockAccountLogin as (...a: unknown[]) => unknown)(...args),
  resolveAccountSession: (...args: unknown[]) =>
    (mockResolveAccountSession as (...a: unknown[]) => unknown)(...args),
  logout: (...args: unknown[]) =>
    (mockAccountLogout as (...a: unknown[]) => unknown)(...args),
  upgradeFromSecureLink: (...args: unknown[]) =>
    (mockUpgradeFromSecureLink as (...a: unknown[]) => unknown)(...args),
  changePassword: (...args: unknown[]) =>
    (mockChangePassword as (...a: unknown[]) => unknown)(...args),
}));

// --- Mock share service ---

const mockCreateShare = vi.fn();
const mockOpenShare = vi.fn();
const mockListSharesByTicket = vi.fn();

vi.mock("../portal/share-service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShareServiceModule>()),
  createShare: (...args: unknown[]) =>
    (mockCreateShare as (...a: unknown[]) => unknown)(...args),
  openShare: (...args: unknown[]) =>
    (mockOpenShare as (...a: unknown[]) => unknown)(...args),
  listSharesByTicket: (...args: unknown[]) =>
    (mockListSharesByTicket as (...a: unknown[]) => unknown)(...args),
}));

// --- Helpers ---

function createMockOrgContext(): OrgContext {
  return {
    orgId: "a0000000-0000-4000-8000-000000000002" as OrgId,
    orgSlug: "test-org" as OrgSlug,
    orgSchema: "org_a0000000-0000-4000-8000-000000000002" as OrgSchema,
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
    isBuiltinDefaultEnabled: vi.fn().mockResolvedValue(true),
    setBuiltinDefaultEnabled: vi.fn(),
    resolvePublicForm: vi.fn().mockResolvedValue({
      formId: null,
      slug: null,
      encryptedFormMeta: null,
      fields: null,
      intakeDisabled: false,
      formClosed: false,
      builtinFormDisabled: false,
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
    shareLimiter: allowLimiter(),
    ...overrides,
  };
}

function makeVolunteerSession(): SessionData {
  return {
    id: crypto.randomUUID() as SessionId,
    token: crypto.randomUUID() as SessionToken,
    userId: "vol-user-1" as UserId,
    ipToken: "ip-tok" as IpToken,
    uaToken: "ua-tok" as UaToken,
    expiresAt: new Date(Date.now() + 3_600_000),
    twofaVerified: true,
    webauthnChallenge: null,
  };
}

function makeVolunteerContext(): Context {
  return {
    req: mockReq({ remoteAddress: "10.0.0.1" }),
    res: mockRes(),
    org: createMockOrgContext(),
    session: makeVolunteerSession(),
    user: {
      id: "vol-user-1" as UserId,
      encryptedIdentifier: "enc-id",
      encryptedDisplayName: "enc-name",
      encryptedPreferredLocale: null,
      roleId: RoleId.VOLUNTEER,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

/** 80 bytes of valid base64 for the wrappedTk field. */
const VALID_WRAPPED_TK = Buffer.alloc(80, 0xab).toString("base64");
const VALID_BASE64 = Buffer.from("test-ciphertext").toString("base64");

function makeSubmitInput(
  overrides?: Partial<IntakeSubmissionInput>,
): IntakeSubmissionInput {
  return {
    ticketId: crypto.randomUUID() as TicketId,
    followUpId: crypto.randomUUID() as FollowupId,
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
  beforeAll(async () => {
    // Account procedures hash tokens at the router layer
    await getSodium();
  });

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
        encryptedFormMeta: null,
        fields: null,
        intakeDisabled: false,
        formClosed: false,
        builtinFormDisabled: false,
      });
    });

    it("passes the resolved form through as-is", async () => {
      const formService = mockIntakeFormService();
      const formData = {
        formId: "f-1",
        slug: "general-help",
        encryptedFormMeta: VALID_BASE64,
        fields: [
          {
            id: "field-1",
            fieldKey: crypto.randomUUID(),
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

    it("passes decoded continuation branch to the service", async () => {
      const caller = buildCaller();
      const VALID_CHANNEL_ID = "a".repeat(48);
      const contInput = makeSubmitInput({
        continuation: {
          channelId: VALID_CHANNEL_ID,
          authHash: Buffer.alloc(32, 0x01).toString("base64"),
          clientPublic: Buffer.alloc(32, 0x02).toString("base64"),
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32, 0x03).toString("base64"),
            nonce: Buffer.alloc(24, 0x04).toString("base64"),
            ciphertext: Buffer.from("kc-ct").toString("base64"),
          },
        },
      } as Partial<IntakeSubmissionInput>);

      await caller.submitIntake(contInput);

      expect(mockCreateIntakeTicket).toHaveBeenCalledOnce();
      const serviceInput = mockCreateIntakeTicket.mock.calls[0]![2] as Record<
        string,
        unknown
      >;
      expect(serviceInput.continuation).not.toBeNull();
      const cont = serviceInput.continuation as {
        channelId: string;
        authHash: Buffer;
        clientPublic: Buffer;
        selfCopy: unknown;
      };
      expect(cont.channelId).toBe(VALID_CHANNEL_ID);
      expect(Buffer.isBuffer(cont.authHash)).toBe(true);
      expect(Buffer.isBuffer(cont.clientPublic)).toBe(true);
      expect(cont.selfCopy).toBeNull();
    });

    it("passes null continuation when the branch is absent", async () => {
      const caller = buildCaller();
      await caller.submitIntake(makeSubmitInput());

      const serviceInput = mockCreateIntakeTicket.mock.calls[0]![2] as Record<
        string,
        unknown
      >;
      expect(serviceInput.continuation).toBeNull();
    });

    it("strips continuation at schema level when both account and continuation are present", async () => {
      const caller = buildCaller(
        buildDeps({
          accountServiceDeps: {
            indexer: {
              hash: vi.fn().mockReturnValue("hashed"),
            } as unknown as BlindIndexer,
            fakeSaltKey: Buffer.alloc(32, 0xab),
          },
        }),
      );
      const bothInput = makeSubmitInput({
        account: {
          accountId: clientAccountIdSchema.parse(crypto.randomUUID()),
          username: "testuser",
          salt: Buffer.alloc(16, 0x01).toString("base64"),
          publicKey: Buffer.alloc(32, 0x02).toString("base64"),
          authHash: Buffer.alloc(32, 0x03).toString("base64"),
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32, 0x04).toString("base64"),
            nonce: Buffer.alloc(24, 0x05).toString("base64"),
            ciphertext: Buffer.from("kc-ct").toString("base64"),
          },
        },
        continuation: {
          channelId: "b".repeat(48),
          authHash: Buffer.alloc(32, 0x06).toString("base64"),
          clientPublic: Buffer.alloc(32, 0x07).toString("base64"),
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32, 0x08).toString("base64"),
            nonce: Buffer.alloc(24, 0x09).toString("base64"),
            ciphertext: Buffer.from("kc-ct2").toString("base64"),
          },
        },
      } as Partial<IntakeSubmissionInput>);

      await caller.submitIntake(bothInput);

      const serviceInput = mockCreateIntakeTicket.mock.calls[0]![2] as Record<
        string,
        unknown
      >;
      // Schema transform strips continuation when account is present
      expect(serviceInput.continuation).toBeNull();
      expect(serviceInput.account).not.toBeNull();
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
        id: crypto.randomUUID() as ChannelRowId,
        client_id: crypto.randomUUID() as ClientId,
        channel_id: VALID_CHANNEL_ID as ChannelSecret,
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
        kind: "secure_link",
        account_offer: false,
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
        ticketId: crypto.randomUUID() as TicketId,
        messages: [],
        messagesExpireDays: 30,
        safeExitUrl: null,
        accountOffer: false,
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
        id: crypto.randomUUID() as ChannelRowId,
        client_id: crypto.randomUUID() as ClientId,
        channel_id: VALID_CHANNEL_ID as ChannelSecret,
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
        kind: "secure_link",
        account_offer: false,
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
        ticketId: crypto.randomUUID() as TicketId,
        messages: [
          {
            id: crypto.randomUUID(),
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
        accountOffer: false,
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
        id: crypto.randomUUID() as ChannelRowId,
        client_id: crypto.randomUUID() as ClientId,
        channel_id: VALID_CHANNEL_ID as ChannelSecret,
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
        kind: "secure_link",
        account_offer: false,
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

    it("passes kind through decodeReplyInput to the service", async () => {
      const mockClientReply = vi.fn().mockResolvedValue(undefined);
      const replyDeps = buildReplyDeps({
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: mockClientReply,
        },
      });
      const caller = buildCaller(replyDeps);
      const input = {
        ...makeReplyInput(),
        kind: "contact_correction" as const,
      };
      await caller.portalReply(input);

      const serviceInput = mockClientReply.mock
        .calls[0]?.[3] as PortalReplyServiceInput;
      expect(serviceInput.kind).toBe("contact_correction");
    });

    it("passes undefined kind when omitted", async () => {
      const mockClientReply = vi.fn().mockResolvedValue(undefined);
      const replyDeps = buildReplyDeps({
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: mockClientReply,
        },
      });
      const caller = buildCaller(replyDeps);
      await caller.portalReply(makeReplyInput());

      const serviceInput = mockClientReply.mock
        .calls[0]?.[3] as PortalReplyServiceInput;
      expect(serviceInput.kind).toBeUndefined();
    });
  });

  // -----------------------------------------------------------------
  // Share link procedures (appended by 8d)
  // -----------------------------------------------------------------

  describe("createShare", () => {
    const VALID_SHARE_CT = Buffer.alloc(64, 0xab).toString("base64");

    function makeCreateShareInput(): {
      shareId: string;
      ticketId: string;
      ciphertext: string;
      followUpId: string;
      encryptedFollowUp: string;
    } {
      return {
        shareId: crypto.randomUUID(),
        ticketId: crypto.randomUUID(),
        ciphertext: VALID_SHARE_CT,
        followUpId: crypto.randomUUID(),
        encryptedFollowUp: VALID_SHARE_CT,
      };
    }

    beforeEach(() => {
      mockCreateShare.mockResolvedValue({
        expiresAt: new Date("2026-08-22T00:00:00Z"),
      });
    });

    it("rejects unauthenticated callers", async () => {
      const caller = buildCaller(buildDeps(), makeContext());
      await expectTrpcError(
        caller.createShare(makeCreateShareInput()),
        "UNAUTHORIZED",
      );
    });

    it("returns expiresAt as ISO string on success", async () => {
      const caller = buildCaller(buildDeps(), makeVolunteerContext());
      const result = await caller.createShare(makeCreateShareInput());
      expect(result.expiresAt).toBe("2026-08-22T00:00:00.000Z");
      expect(mockCreateShare).toHaveBeenCalledOnce();
    });

    it("passes createdBy from session userId", async () => {
      const caller = buildCaller(buildDeps(), makeVolunteerContext());
      await caller.createShare(makeCreateShareInput());
      const serviceInput = mockCreateShare.mock.calls[0]?.[1] as {
        createdBy: string;
      };
      expect(serviceInput.createdBy).toBe("vol-user-1");
    });

    it("decodes base64 ciphertext to Buffer before delegating to service", async () => {
      const caller = buildCaller(buildDeps(), makeVolunteerContext());
      await caller.createShare(makeCreateShareInput());
      const serviceInput = mockCreateShare.mock.calls[0]?.[1] as {
        ciphertext: Buffer;
        encryptedFollowUp: Buffer;
      };
      expect(Buffer.isBuffer(serviceInput.ciphertext)).toBe(true);
      expect(Buffer.isBuffer(serviceInput.encryptedFollowUp)).toBe(true);
    });

    it("rejects oversized ciphertext via Zod", async () => {
      const input = makeCreateShareInput();
      input.ciphertext = "A".repeat(88_001);
      const caller = buildCaller(buildDeps(), makeVolunteerContext());
      await expectTrpcError(
        caller.createShare(input),
        "BAD_REQUEST",
        "ciphertext too large",
      );
      expect(mockCreateShare).not.toHaveBeenCalled();
    });

    it("maps ShareTicketNotFoundError to BAD_REQUEST", async () => {
      const { ShareTicketNotFoundError } =
        await import("../portal/share-service.js");
      mockCreateShare.mockRejectedValue(new ShareTicketNotFoundError());
      const caller = buildCaller(buildDeps(), makeVolunteerContext());
      const err = await expectTrpcError(
        caller.createShare(makeCreateShareInput()),
        "BAD_REQUEST",
      );
      // Message should not leak internal details
      expect(err.message).toBe("Ticket not found");
    });
  });

  describe("listShares", () => {
    it("rejects unauthenticated callers", async () => {
      const caller = buildCaller(buildDeps(), makeContext());
      await expectTrpcError(
        caller.listShares({ ticketId: crypto.randomUUID() }),
        "UNAUTHORIZED",
      );
    });

    it("returns status rows with ISO date strings and no ciphertext", async () => {
      const now = new Date("2026-08-19T12:00:00Z");
      const expires = new Date("2026-08-22T12:00:00Z");
      mockListSharesByTicket.mockResolvedValue([
        {
          id: crypto.randomUUID(),
          createdAt: now,
          expiresAt: expires,
          readAt: null,
        },
      ]);
      const caller = buildCaller(buildDeps(), makeVolunteerContext());
      const result = await caller.listShares({
        ticketId: crypto.randomUUID(),
      });
      expect(result).toHaveLength(1);
      expect(result[0]!.createdAt).toBe(now.toISOString());
      expect(result[0]!.expiresAt).toBe(expires.toISOString());
      expect(result[0]!.readAt).toBeNull();
      // Must never include ciphertext in the response
      expect(result[0]).not.toHaveProperty("ciphertext");
    });
  });

  describe("openShare", () => {
    function makeOpenInput(): { shareId: string } {
      return { shareId: crypto.randomUUID() };
    }

    it("returns ready status with base64url ciphertext", async () => {
      const raw = Buffer.from("encrypted-share-content");
      mockOpenShare.mockResolvedValue({
        status: "ready",
        ciphertext: raw,
      });
      const caller = buildCaller();
      const result = await caller.openShare(makeOpenInput());
      expect(result.status).toBe("ready");
      if (result.status === "ready") {
        expect(result.ciphertext).toBe(raw.toString("base64url"));
        // Verify it's a string, not a Buffer
        expect(typeof result.ciphertext).toBe("string");
      }
    });

    it("returns opened status", async () => {
      mockOpenShare.mockResolvedValue({ status: "opened" });
      const caller = buildCaller();
      const result = await caller.openShare(makeOpenInput());
      expect(result.status).toBe("opened");
      expect(result).not.toHaveProperty("ciphertext");
    });

    it("returns expired status", async () => {
      mockOpenShare.mockResolvedValue({ status: "expired" });
      const caller = buildCaller();
      const result = await caller.openShare(makeOpenInput());
      expect(result.status).toBe("expired");
    });

    it("returns not_found status", async () => {
      mockOpenShare.mockResolvedValue({ status: "not_found" });
      const caller = buildCaller();
      const result = await caller.openShare(makeOpenInput());
      expect(result.status).toBe("not_found");
    });

    it("returns TOO_MANY_REQUESTS when share rate limit is exceeded", async () => {
      const deps = buildDeps({ shareLimiter: denyLimiter(5000) });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.openShare(makeOpenInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
      expect(err.message).toContain("Retry after");
      expect(mockOpenShare).not.toHaveBeenCalled();
    });

    it("warn log does not contain the share id", async () => {
      const deps = buildDeps({ shareLimiter: denyLimiter(5000) });
      const caller = buildCaller(deps);
      const input = makeOpenInput();
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(caller.openShare(input), "TOO_MANY_REQUESTS");
      expect(warnSpy).toHaveBeenCalled();
      for (const call of warnSpy.mock.calls) {
        const serialized = JSON.stringify(call);
        expect(serialized).not.toContain(input.shareId);
      }
      warnSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------
  // Encrypted Account procedures (appended by 8c)
  // -----------------------------------------------------------------

  describe("getAccountSalt", () => {
    function buildAccountDeps(
      overrides?: Partial<ClientPortalRouterDeps>,
    ): ClientPortalRouterDeps {
      return buildDeps({
        accountServiceDeps: {
          indexer: {
            hash: vi.fn().mockReturnValue("hashed"),
          } as unknown as BlindIndexer,
          fakeSaltKey: Buffer.alloc(32, 0xab),
        },
        accountSaltLimiter: allowLimiter(),
        accountLoginLimiter: allowLimiter(),
        ...overrides,
      });
    }

    it("returns a 16-byte salt for unknown usernames", async () => {
      const fakeSalt = Buffer.alloc(16, 0xcc);
      mockGetSaltForUsername.mockResolvedValue({
        salt: fakeSalt,
        accountId: "fake-uuid-1234",
      });

      const acctDeps = buildAccountDeps();
      const caller = buildCaller(acctDeps);
      const result = await caller.getAccountSalt({ username: "unknown-user" });

      expect(result.salt).toBe(fakeSalt.toString("base64url"));
      expect(result.accountId).toBe("fake-uuid-1234");
      expect(Buffer.from(result.salt, "base64url")).toHaveLength(16);
    });

    it("rate limits the 11th call in an hour", async () => {
      mockGetSaltForUsername.mockResolvedValue({
        salt: Buffer.alloc(16),
        accountId: crypto.randomUUID(),
      });

      let callCount = 0;
      const trackingLimiter: RateLimiter = {
        check: () => {
          callCount++;
          if (callCount > 10) {
            return { allowed: false, remaining: 0, retryAfterMs: 3600_000 };
          }
          return {
            allowed: true,
            remaining: 10 - callCount,
            retryAfterMs: 0,
          };
        },
        reset: () => undefined,
      };

      const acctDeps = buildAccountDeps({
        accountSaltLimiter: trackingLimiter,
      });
      const ctx = makeContext();
      const routerInstance = createClientPortalRouter(acctDeps);
      const factory = createCallerFactory(routerInstance);

      // First 10 succeed
      for (let i = 0; i < 10; i++) {
        const caller = factory(ctx);
        await caller.getAccountSalt({ username: "test-user" });
      }

      // 11th is rejected
      const caller = factory(ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.getAccountSalt({ username: "test-user" }),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
    });
  });

  describe("accountLogin", () => {
    const VALID_ACCOUNT_ID = crypto.randomUUID();
    const VALID_AUTH_TOKEN = Buffer.alloc(32, 0xdd).toString("base64");

    function buildAccountDeps(
      overrides?: Partial<ClientPortalRouterDeps>,
    ): ClientPortalRouterDeps {
      return buildDeps({
        accountServiceDeps: {
          indexer: {
            hash: vi.fn().mockReturnValue("hashed"),
          } as unknown as BlindIndexer,
          fakeSaltKey: Buffer.alloc(32, 0xab),
        },
        accountSaltLimiter: allowLimiter(),
        accountLoginLimiter: allowLimiter(),
        ...overrides,
      });
    }

    it("sets Set-Cookie header and returns empty body on success", async () => {
      const expiresAt = new Date(Date.now() + 86400_000);
      mockAccountLogin.mockResolvedValue({
        sessionToken: "session-tok-abc",
        expiresAt,
      });

      const acctDeps = buildAccountDeps();
      const ctx = makeContext();
      const routerInstance = createClientPortalRouter(acctDeps);
      const factory = createCallerFactory(routerInstance);
      const caller = factory(ctx);

      const result = await caller.accountLogin({
        accountId: VALID_ACCOUNT_ID,
        authToken: VALID_AUTH_TOKEN,
      });

      // Body is empty
      expect(result).toEqual({});

      // Set-Cookie header present
      const res = ctx.res as MockResWithCookies;
      const cookies = res.getCapturedCookies();
      expect(cookies).toHaveLength(1);
      const cookie = cookies[0]!;
      expect(cookie).toContain("care_y_client_session=session-tok-abc");
      expect(cookie).toContain("Path=/");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Strict");
      expect(cookie).toContain("Max-Age=");
      // No Domain attribute (GAP-12)
      expect(cookie).not.toContain("Domain");
    });

    it("wrong-token and unknown-id produce identical error shapes", async () => {
      mockAccountLogin.mockResolvedValue(null);

      const acctDeps = buildAccountDeps();
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);

      // Wrong token
      const caller1 = buildCaller(acctDeps);
      const err1 = await expectTrpcError(
        caller1.accountLogin({
          accountId: VALID_ACCOUNT_ID,
          authToken: VALID_AUTH_TOKEN,
        }),
        "UNAUTHORIZED",
      );

      // Unknown id
      const caller2 = buildCaller(acctDeps);
      const err2 = await expectTrpcError(
        caller2.accountLogin({
          accountId: crypto.randomUUID(),
          authToken: VALID_AUTH_TOKEN,
        }),
        "UNAUTHORIZED",
      );

      warnSpy.mockRestore();

      // Both produce identical message
      expect(err1.message).toBe("Sign-in failed");
      expect(err2.message).toBe("Sign-in failed");
      expect(err1.code).toBe(err2.code);
    });
  });

  describe("accountBootstrap", () => {
    const SESSION_TOKEN = "valid-session-token";
    const ACCOUNT_ROW = {
      id: crypto.randomUUID() as ClientAccountId,
      client_id: crypto.randomUUID() as ClientId,
      username_hash: "hash",
      salt: Buffer.alloc(16),
      public_key: Buffer.alloc(32),
      auth_hash: Buffer.alloc(32),
      created_at: new Date("2026-08-01T00:00:00Z"),
    };

    function fakeChannelRow(): PortalChannelRow {
      return {
        id: crypto.randomUUID() as ChannelRowId,
        client_id: ACCOUNT_ROW.client_id,
        channel_id: "c".repeat(48) as ChannelSecret,
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
        kind: "secure_link",
        account_offer: false,
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
        ticketId: crypto.randomUUID() as TicketId,
        messages: [],
        messagesExpireDays: 30,
        safeExitUrl: null,
        accountOffer: false,
      };
    }

    function buildAccountSessionDeps(
      overrides?: Partial<ClientPortalRouterDeps>,
    ): ClientPortalRouterDeps {
      return buildDeps({
        accountServiceDeps: {
          indexer: {
            hash: vi.fn().mockReturnValue("hashed"),
          } as unknown as BlindIndexer,
          fakeSaltKey: Buffer.alloc(32, 0xab),
        },
        accountSaltLimiter: allowLimiter(),
        accountLoginLimiter: allowLimiter(),
        portalMessageService: {
          bootstrap: vi.fn().mockResolvedValue(fakeBootstrapResult()),
          clientReply: vi.fn().mockResolvedValue(undefined),
        },
        portalReplyLimiter: allowLimiter(),
        fieldEncryptor: {
          encrypt: vi.fn(),
          decrypt: vi.fn(),
        } as unknown as FieldEncryptor,
        ...overrides,
      });
    }

    function makeContextWithCookie(token: string): Context {
      return {
        req: mockReq({
          remoteAddress: "10.0.0.1",
          headers: { cookie: `care_y_client_session=${token}` },
        }),
        res: mockRes(),
        org: createMockOrgContext(),
        session: null,
        user: null,
      };
    }

    it("succeeds with a valid session cookie", async () => {
      mockResolveAccountSession.mockResolvedValue({
        account: ACCOUNT_ROW,
        channel: fakeChannelRow(),
      });

      const acctDeps = buildAccountSessionDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const routerInstance = createClientPortalRouter(acctDeps);
      const factory = createCallerFactory(routerInstance);
      const caller = factory(ctx);

      const result = await caller.accountBootstrap();
      expect(result.messagesExpireDays).toBe(30);
      expect(result.accountCreatedAt).toBe("2026-08-01T00:00:00.000Z");
    });

    it("fails with generic UNAUTHORIZED without a cookie", async () => {
      const acctDeps = buildAccountSessionDeps();
      const ctx = makeContext(); // no cookie
      const routerInstance = createClientPortalRouter(acctDeps);
      const factory = createCallerFactory(routerInstance);
      const caller = factory(ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.accountBootstrap(),
        "UNAUTHORIZED",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Sign-in failed");
    });

    it("fails with generic UNAUTHORIZED for a garbage token", async () => {
      mockResolveAccountSession.mockResolvedValue(null);

      const acctDeps = buildAccountSessionDeps();
      const ctx = makeContextWithCookie("garbage-token-xyz");
      const routerInstance = createClientPortalRouter(acctDeps);
      const factory = createCallerFactory(routerInstance);
      const caller = factory(ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.accountBootstrap(),
        "UNAUTHORIZED",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Sign-in failed");
    });
  });

  describe("accountReply", () => {
    const SESSION_TOKEN = "valid-session-token";
    const ACCOUNT_ROW = {
      id: crypto.randomUUID() as ClientAccountId,
      client_id: crypto.randomUUID() as ClientId,
      username_hash: "hash",
      salt: Buffer.alloc(16),
      public_key: Buffer.alloc(32),
      auth_hash: Buffer.alloc(32),
      created_at: new Date(),
    };

    function fakeChannelRow(): PortalChannelRow {
      return {
        id: crypto.randomUUID() as ChannelRowId,
        client_id: ACCOUNT_ROW.client_id,
        channel_id: "c".repeat(48) as ChannelSecret,
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
        kind: "secure_link",
        account_offer: false,
      };
    }

    function makeAccountReplyInput(): {
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

    function makeContextWithCookie(token: string): Context {
      return {
        req: mockReq({
          remoteAddress: "10.0.0.1",
          headers: { cookie: `care_y_client_session=${token}` },
        }),
        res: mockRes(),
        org: createMockOrgContext(),
        session: null,
        user: null,
      };
    }

    function buildAccountReplyDeps(): ClientPortalRouterDeps {
      return buildDeps({
        accountServiceDeps: {
          indexer: {
            hash: vi.fn().mockReturnValue("hashed"),
          } as unknown as BlindIndexer,
          fakeSaltKey: Buffer.alloc(32, 0xab),
        },
        accountSaltLimiter: allowLimiter(),
        accountLoginLimiter: allowLimiter(),
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: vi.fn().mockResolvedValue(undefined),
        },
        portalReplyLimiter: allowLimiter(),
        fieldEncryptor: {
          encrypt: vi.fn(),
          decrypt: vi.fn(),
        } as unknown as FieldEncryptor,
      });
    }

    it("succeeds with a valid session cookie", async () => {
      mockResolveAccountSession.mockResolvedValue({
        account: ACCOUNT_ROW,
        channel: fakeChannelRow(),
      });

      const replyDeps = buildAccountReplyDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const routerInstance = createClientPortalRouter(replyDeps);
      const factory = createCallerFactory(routerInstance);
      const caller = factory(ctx);

      const result = await caller.accountReply(makeAccountReplyInput());
      expect(result).toEqual({});
      expect(
        replyDeps.portalMessageService!.clientReply,
      ).toHaveBeenCalledOnce();
    });

    it("fails with generic UNAUTHORIZED without a cookie", async () => {
      const replyDeps = buildAccountReplyDeps();
      const ctx = makeContext(); // no cookie
      const routerInstance = createClientPortalRouter(replyDeps);
      const factory = createCallerFactory(routerInstance);
      const caller = factory(ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.accountReply(makeAccountReplyInput()),
        "UNAUTHORIZED",
      );
      warnSpy.mockRestore();
    });
  });

  describe("accountUpgrade", () => {
    const VALID_CHANNEL_ID = "a".repeat(48);
    const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

    function fakeChannelRow(): PortalChannelRow {
      return {
        id: crypto.randomUUID() as ChannelRowId,
        client_id: crypto.randomUUID() as ClientId,
        channel_id: VALID_CHANNEL_ID as ChannelSecret,
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
        kind: "secure_link",
        account_offer: false,
      };
    }

    function buildUpgradeDeps(
      overrides?: Partial<ClientPortalRouterDeps>,
    ): ClientPortalRouterDeps {
      return buildDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(fakeChannelRow()),
        },
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: vi.fn(),
        },
        portalReplyLimiter: allowLimiter(),
        accountServiceDeps: {
          indexer: {
            hash: vi.fn().mockReturnValue("hashed"),
          } as unknown as BlindIndexer,
          fakeSaltKey: Buffer.alloc(32, 0xab),
        },
        accountSaltLimiter: allowLimiter(),
        accountLoginLimiter: allowLimiter(),
        ...overrides,
      });
    }

    function makeUpgradeInput(): {
      channelId: string;
      auth: string;
      account: {
        accountId: string;
        username: string;
        salt: string;
        publicKey: string;
        authHash: string;
        keyCheck: {
          ephemeralPoint: string;
          nonce: string;
          ciphertext: string;
        };
      };
      rewrappedMessages: never[];
    } {
      return {
        channelId: VALID_CHANNEL_ID,
        auth: VALID_AUTH,
        account: {
          accountId: crypto.randomUUID(),
          username: "test-user",
          salt: Buffer.alloc(16, 0xaa).toString("base64"),
          publicKey: Buffer.alloc(32, 0xbb).toString("base64"),
          authHash: Buffer.alloc(32, 0xcc).toString("base64"),
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32, 0xdd).toString("base64"),
            nonce: Buffer.alloc(24, 0xee).toString("base64"),
            ciphertext: Buffer.from("key-check-ct").toString("base64"),
          },
        },
        rewrappedMessages: [],
      };
    }

    it("creates account via valid Secure Link auth", async () => {
      mockUpgradeFromSecureLink.mockResolvedValue(undefined);
      const upgradeDeps = buildUpgradeDeps();
      const caller = buildCaller(upgradeDeps);

      const result = await caller.accountUpgrade(makeUpgradeInput());
      expect(result).toEqual({});
      expect(mockUpgradeFromSecureLink).toHaveBeenCalledOnce();
    });

    it("maps UsernameTakenError to CONFLICT with ACCOUNT_USERNAME_TAKEN", async () => {
      mockUpgradeFromSecureLink.mockRejectedValue(new UsernameTakenError());
      const upgradeDeps = buildUpgradeDeps();
      const caller = buildCaller(upgradeDeps);

      const err = await expectTrpcError(
        caller.accountUpgrade(makeUpgradeInput()),
        "CONFLICT",
      );
      expect(err.message).toBe("ACCOUNT_USERNAME_TAKEN");
    });

    it("maps StaleThreadError to CONFLICT", async () => {
      mockUpgradeFromSecureLink.mockRejectedValue(new StaleThreadError());
      const upgradeDeps = buildUpgradeDeps();
      const caller = buildCaller(upgradeDeps);

      await expectTrpcError(
        caller.accountUpgrade(makeUpgradeInput()),
        "CONFLICT",
      );
    });
  });

  describe("accountChangePassword", () => {
    const SESSION_TOKEN = "valid-session-token";
    const ACCOUNT_ROW = {
      id: crypto.randomUUID() as ClientAccountId,
      client_id: crypto.randomUUID() as ClientId,
      username_hash: "hash",
      salt: Buffer.alloc(16),
      public_key: Buffer.alloc(32),
      auth_hash: Buffer.alloc(32),
      created_at: new Date(),
    };

    function fakeChannelRow(): PortalChannelRow {
      return {
        id: crypto.randomUUID() as ChannelRowId,
        client_id: ACCOUNT_ROW.client_id,
        channel_id: "c".repeat(48) as ChannelSecret,
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
        kind: "secure_link",
        account_offer: false,
      };
    }

    function makeChangePasswordInput(): {
      currentAuthToken: string;
      account: {
        salt: string;
        publicKey: string;
        authHash: string;
        keyCheck: {
          ephemeralPoint: string;
          nonce: string;
          ciphertext: string;
        };
      };
      rewrappedMessages: never[];
    } {
      return {
        currentAuthToken: Buffer.alloc(32, 0xaa).toString("base64"),
        account: {
          salt: Buffer.alloc(16, 0xbb).toString("base64"),
          publicKey: Buffer.alloc(32, 0xcc).toString("base64"),
          authHash: Buffer.alloc(32, 0xdd).toString("base64"),
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32, 0xee).toString("base64"),
            nonce: Buffer.alloc(24, 0xff).toString("base64"),
            ciphertext: Buffer.from("kc-ct").toString("base64"),
          },
        },
        rewrappedMessages: [],
      };
    }

    function makeContextWithCookie(token: string): Context {
      return {
        req: mockReq({
          remoteAddress: "10.0.0.1",
          headers: { cookie: `care_y_client_session=${token}` },
        }),
        res: mockRes(),
        org: createMockOrgContext(),
        session: null,
        user: null,
      };
    }

    function buildChangePasswordDeps(): ClientPortalRouterDeps {
      return buildDeps({
        accountServiceDeps: {
          indexer: {
            hash: vi.fn().mockReturnValue("hashed"),
          } as unknown as BlindIndexer,
          fakeSaltKey: Buffer.alloc(32, 0xab),
        },
        accountSaltLimiter: allowLimiter(),
        accountLoginLimiter: allowLimiter(),
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: vi.fn(),
        },
        portalReplyLimiter: allowLimiter(),
      });
    }

    it("succeeds with valid session and currentAuthToken", async () => {
      mockResolveAccountSession.mockResolvedValue({
        account: ACCOUNT_ROW,
        channel: fakeChannelRow(),
        tokenHash: Buffer.alloc(32, 0xdd),
      });
      mockChangePassword.mockResolvedValue(true);

      const changeDeps = buildChangePasswordDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const routerInstance = createClientPortalRouter(changeDeps);
      const caller = createCallerFactory(routerInstance)(ctx);

      const result = await caller.accountChangePassword(
        makeChangePasswordInput(),
      );
      expect(result).toEqual({});
      expect(mockChangePassword).toHaveBeenCalledOnce();
    });

    it("fails generically without a session cookie", async () => {
      const changeDeps = buildChangePasswordDeps();
      const ctx = makeContext(); // no cookie
      const routerInstance = createClientPortalRouter(changeDeps);
      const caller = createCallerFactory(routerInstance)(ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.accountChangePassword(makeChangePasswordInput()),
        "UNAUTHORIZED",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Sign-in failed");
    });
  });

  describe("accountLogout", () => {
    const SESSION_TOKEN = "valid-session-token";
    const ACCOUNT_ROW = {
      id: crypto.randomUUID() as ClientAccountId,
      client_id: crypto.randomUUID() as ClientId,
      username_hash: "hash",
      salt: Buffer.alloc(16),
      public_key: Buffer.alloc(32),
      auth_hash: Buffer.alloc(32),
      created_at: new Date(),
    };

    function fakeChannelRow(): PortalChannelRow {
      return {
        id: crypto.randomUUID() as ChannelRowId,
        client_id: ACCOUNT_ROW.client_id,
        channel_id: "c".repeat(48) as ChannelSecret,
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
        kind: "secure_link",
        account_offer: false,
      };
    }

    function makeContextWithCookie(token: string): Context {
      return {
        req: mockReq({
          remoteAddress: "10.0.0.1",
          headers: { cookie: `care_y_client_session=${token}` },
        }),
        res: mockRes(),
        org: createMockOrgContext(),
        session: null,
        user: null,
      };
    }

    function buildLogoutDeps(): ClientPortalRouterDeps {
      return buildDeps({
        accountServiceDeps: {
          indexer: {
            hash: vi.fn().mockReturnValue("hashed"),
          } as unknown as BlindIndexer,
          fakeSaltKey: Buffer.alloc(32, 0xab),
        },
        accountSaltLimiter: allowLimiter(),
        accountLoginLimiter: allowLimiter(),
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: vi.fn(),
        },
      });
    }

    it("expires the cookie with Max-Age=0", async () => {
      mockResolveAccountSession.mockResolvedValue({
        account: ACCOUNT_ROW,
        channel: fakeChannelRow(),
      });
      mockAccountLogout.mockResolvedValue(undefined);

      const logoutDeps = buildLogoutDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const routerInstance = createClientPortalRouter(logoutDeps);
      const caller = createCallerFactory(routerInstance)(ctx);

      const result = await caller.accountLogout();
      expect(result).toEqual({});

      const res = ctx.res as MockResWithCookies;
      const cookies = res.getCapturedCookies();
      expect(cookies).toHaveLength(1);
      const cookie = cookies[0]!;
      expect(cookie).toContain("care_y_client_session=");
      expect(cookie).toContain("Max-Age=0");
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Strict");
      expect(cookie).not.toContain("Domain");

      expect(mockAccountLogout).toHaveBeenCalledOnce();
    });
  });
});

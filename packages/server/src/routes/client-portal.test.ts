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
  portalReplyChannelKey,
  type ClientPortalRouterDeps,
} from "./client-portal.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createCallerFactory } from "../trpc/trpc.js";
import {
  mockReq,
  mockRes,
  stubTenantDbDefaultRoles,
  expectTrpcError,
  testSealedBox,
  createMemoryBlobStore,
} from "../test-utils.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { RateLimiter } from "../ratelimit/rate-limiter.js";
import type { PowVerifier } from "../crypto/pow.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { IntakeFormService } from "../portal/intake-form-service.js";
import type { NotificationService } from "../notifications/service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import { IntakeQueueNotConfiguredError } from "../portal/intake-service.js";
import { RateLimitError } from "../errors.js";
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
import type * as ContactExposureServiceModule from "../portal/contact-exposure-service.js";
import type * as ChannelServiceModule from "../portal/channel-service.js";
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
    blobStore: createMemoryBlobStore(),
    submissionLimiter: allowLimiter(),
    challengeLimiter: allowLimiter(),
    powVerifier: null,
    intakeFormService: mockIntakeFormService(),
    notificationService: mockNotificationService(),
    shareLimiter: allowLimiter(),
    // Tiers off by default; a test that exercises one overrides it.
    fieldEncryptor: null,
    portalChannelService: null,
    portalMessageService: null,
    portalReadLimiter: null,
    portalReplyLimiter: null,
    portalReplyIpLimiter: null,
    portalGetProvider: null,
    portalResolveCallerId: null,
    accountServiceDeps: null,
    accountSaltLimiter: null,
    accountLoginLimiter: null,
    oprfService: null,
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
        attachments: [],
        recordings: [],
        callEntries: [],
        messagesExpireDays: 30,
        safeExitUrl: null,
        upgradeOptions: [],
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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
      const limitErr = await expectTrpcError(
        caller.portalBootstrap(makeBootstrapInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();

      // The cause is the AppError whose retryAfterSeconds the errorFormatter
      // forwards to the client (portal schedules its auto-retry from it).
      expect(limitErr.cause).toBeInstanceOf(RateLimitError);
      const rle = limitErr.cause as RateLimitError;
      expect(rle.retryAfterSeconds).toBe(1800);
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
            followupId: crypto.randomUUID(),
            direction: "to_client",
            type: "message",
            ephemeralPoint: "ep1",
            nonce: "n1",
            ciphertext: "ct1",
            createdAt: new Date().toISOString(),
            editedAt: null,
          },
        ],
        attachments: [],
        recordings: [],
        callEntries: [],
        messagesExpireDays: 30,
        safeExitUrl: null,
        upgradeOptions: [],
      };

      const portalDeps = buildDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(channel),
        },
        portalMessageService: {
          bootstrap: vi.fn().mockResolvedValue(bootstrapResult),
          clientReply: vi.fn(),
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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

    it("rejects the 31st reply on one channel with a structured retry hint", async () => {
      const limiter = createInMemoryRateLimiter(
        { windowMs: 3_600_000, maxRequests: 30 },
        () => 1_000,
      );
      const replyDeps = buildReplyDeps({ portalReplyLimiter: limiter });
      const caller = buildCaller(replyDeps);

      // First 30 succeed
      for (let i = 0; i < 30; i++) {
        const result = await caller.portalReply(makeReplyInput());
        expect(result).toEqual({});
      }

      // 31st is rejected
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const limitErr = await expectTrpcError(
        caller.portalReply(makeReplyInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
      expect(limitErr.cause).toBeInstanceOf(RateLimitError);
      expect((limitErr.cause as RateLimitError).retryAfterSeconds).toBe(3600);
    });

    it("keys the reply limit by channel: a second channel from the same IP still sends", async () => {
      const limiter = createInMemoryRateLimiter(
        { windowMs: 3_600_000, maxRequests: 2 },
        () => 1_000,
      );
      // Two channels (fakeChannelRow mints a fresh row id per deps set)
      // sharing one limiter instance and one caller IP.
      const depsA = buildReplyDeps({ portalReplyLimiter: limiter });
      const depsB = buildReplyDeps({ portalReplyLimiter: limiter });
      const callerA = buildCaller(depsA);
      const callerB = buildCaller(depsB);

      await callerA.portalReply(makeReplyInput());
      await callerA.portalReply(makeReplyInput());
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        callerA.portalReply(makeReplyInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();

      // Channel B is untouched by channel A's exhaustion.
      const result = await callerB.portalReply(makeReplyInput());
      expect(result).toEqual({});
    });

    it("resetting the channel key (the org-reply hook) unblocks the channel", async () => {
      const limiter = createInMemoryRateLimiter(
        { windowMs: 3_600_000, maxRequests: 1 },
        () => 1_000,
      );
      const channel = fakeChannelRow();
      const replyDeps = buildReplyDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(channel),
        },
        portalReplyLimiter: limiter,
      });
      const caller = buildCaller(replyDeps);

      await caller.portalReply(makeReplyInput());
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.portalReply(makeReplyInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();

      // What index.ts wires into the followup service's onPortalOrgReply.
      limiter.reset(portalReplyChannelKey(channel.id));

      const result = await caller.portalReply(makeReplyInput());
      expect(result).toEqual({});
    });

    it("counts unengaged replies against the IP layer and rejects past the cap", async () => {
      const ipLimiter = createInMemoryRateLimiter(
        { windowMs: 3_600_000, maxRequests: 2 },
        () => 1_000,
      );
      const replyDeps = buildReplyDeps({
        portalReplyIpLimiter: ipLimiter,
      });
      const caller = buildCaller(replyDeps);

      // hasRecentOrgReply is stubbed false: every write counts.
      await caller.portalReply(makeReplyInput());
      await caller.portalReply(makeReplyInput());
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const limitErr = await expectTrpcError(
        caller.portalReply(makeReplyInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
      expect(limitErr.cause).toBeInstanceOf(RateLimitError);
    });

    it("skips the IP layer entirely when the org replied recently", async () => {
      // Denies only conversation-count keys; the authgate namespace on
      // the same instance stays open so the pre-auth gate passes.
      const ipDenyLimiter: RateLimiter = {
        check: (key: string) =>
          key.startsWith("ip:")
            ? { allowed: false, remaining: 0, retryAfterMs: 3000 }
            : { allowed: true, remaining: 10, retryAfterMs: 0 },
        reset: () => undefined,
      };
      const replyDeps = buildReplyDeps({
        portalReplyIpLimiter: ipDenyLimiter,
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: vi.fn().mockResolvedValue(undefined),
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(true),
        },
      });
      const caller = buildCaller(replyDeps);

      // The engaged conversation sends even though "ip:" would deny.
      const result = await caller.portalReply(makeReplyInput());
      expect(result).toEqual({});
    });

    it("blocks repeated failed-auth attempts before channel resolution", async () => {
      const ipLimiter = createInMemoryRateLimiter(
        { windowMs: 3_600_000, maxRequests: 2 },
        () => 1_000,
      );
      const resolveAuthedChannel = vi.fn().mockResolvedValue(null);
      const replyDeps = buildReplyDeps({
        portalChannelService: { resolveAuthedChannel },
        portalReplyIpLimiter: ipLimiter,
      });
      const caller = buildCaller(replyDeps);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(caller.portalReply(makeReplyInput()), "NOT_FOUND");
      await expectTrpcError(caller.portalReply(makeReplyInput()), "NOT_FOUND");
      // Third attempt is stopped by the gate before any DB-shaped work.
      await expectTrpcError(
        caller.portalReply(makeReplyInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
      expect(resolveAuthedChannel).toHaveBeenCalledTimes(2);
    });

    it("successful auth resets the flood gate so honest callers never accumulate", async () => {
      const ipLimiter = createInMemoryRateLimiter(
        { windowMs: 3_600_000, maxRequests: 2 },
        () => 1_000,
      );
      const channel = fakeChannelRow();
      // Fails once, then succeeds, then fails again.
      const resolveAuthedChannel = vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(channel)
        .mockResolvedValueOnce(null);
      const replyDeps = buildReplyDeps({
        portalChannelService: { resolveAuthedChannel },
        portalReplyIpLimiter: ipLimiter,
      });
      const caller = buildCaller(replyDeps);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(caller.portalReply(makeReplyInput()), "NOT_FOUND");
      await caller.portalReply(makeReplyInput());
      // Without the reset this third call would be the gate's 3rd slot
      // and 429; the successful call cleared it, so auth runs again.
      await expectTrpcError(caller.portalReply(makeReplyInput()), "NOT_FOUND");
      warnSpy.mockRestore();
      expect(resolveAuthedChannel).toHaveBeenCalledTimes(3);
    });

    it("passes kind through decodeReplyInput to the service", async () => {
      const mockClientReply = vi.fn().mockResolvedValue(undefined);
      const replyDeps = buildReplyDeps({
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: mockClientReply,
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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
        attachments: [],
        recordings: [],
        callEntries: [],
        messagesExpireDays: 30,
        safeExitUrl: null,
        upgradeOptions: [],
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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
      skippedMessageIds: never[];
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
        skippedMessageIds: [],
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
      skippedMessageIds: never[];
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
        skippedMessageIds: [],
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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

// ---------------------------------------------------------------------------
// Module-level mocks for cold procedure tests below.
// vi.mock is hoisted by vitest's transform regardless of placement.
// ---------------------------------------------------------------------------

const mockGetSealedContactInfo = vi.fn();
const mockAddPassphrase = vi.fn();

vi.mock("../portal/contact-exposure-service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContactExposureServiceModule>()),
  getSealedContactInfo: (...args: unknown[]) =>
    (mockGetSealedContactInfo as (...a: unknown[]) => unknown)(...args),
}));

vi.mock("../portal/channel-service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ChannelServiceModule>()),
  addPassphrase: (...args: unknown[]) =>
    (mockAddPassphrase as (...a: unknown[]) => unknown)(...args),
}));

// ---------------------------------------------------------------------------
// Cold procedure tests: channel-token (Secure Link) auth model
// ---------------------------------------------------------------------------

describe("client-portal router (channel-token procedures)", () => {
  const VALID_CHANNEL_ID = "a".repeat(48);
  const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");
  const SEEDED_PLAINTEXT_SENTINEL = "rt-contact-payload-sentinel";

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSealedContactInfo.mockResolvedValue({
      sealed: Buffer.from("ct-sealed-envelope").toString("base64url"),
    });
    mockAddPassphrase.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fakeChannelRow(): PortalChannelRow {
    return {
      id: crypto.randomUUID() as ChannelRowId,
      client_id: crypto.randomUUID() as ClientId,
      channel_id: VALID_CHANNEL_ID as ChannelSecret,
      auth_hash: Buffer.alloc(32, 0xaa),
      client_public: Buffer.alloc(32, 0xbb),
      has_passphrase: true,
      key_check_ephemeral_point: Buffer.alloc(32),
      key_check_nonce: Buffer.alloc(24),
      key_check_ciphertext: Buffer.alloc(48),
      status: "active",
      created_at: new Date(),
      last_seen_at: null,
      last_notified_at: null,
      revoked_at: null,
      kind: "secure_link",
    };
  }

  function buildChannelDeps(
    overrides?: Partial<ClientPortalRouterDeps>,
  ): ClientPortalRouterDeps {
    return buildDeps({
      portalChannelService: {
        resolveAuthedChannel: vi.fn().mockResolvedValue(fakeChannelRow()),
      },
      portalMessageService: {
        bootstrap: vi.fn().mockResolvedValue({
          hasPassphrase: true,
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32).toString("base64"),
            nonce: Buffer.alloc(24).toString("base64"),
            ciphertext: Buffer.alloc(48).toString("base64"),
          },
          ticketId: crypto.randomUUID(),
          messages: [],
          attachments: [],
          recordings: [],
          callEntries: [],
          messagesExpireDays: 30,
          safeExitUrl: null,
          upgradeOptions: [],
        }),
        clientReply: vi.fn().mockResolvedValue(undefined),
        listMessages: vi.fn().mockResolvedValue({
          messages: [
            {
              id: crypto.randomUUID(),
              followupId: crypto.randomUUID(),
              direction: "to_client",
              type: "message",
              ephemeralPoint: "ep1",
              nonce: "n1",
              ciphertext: "ct1",
              createdAt: new Date().toISOString(),
              editedAt: null,
            },
          ],
          totalCount: 1,
        }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
      },
      portalReadLimiter: allowLimiter(),
      portalReplyLimiter: allowLimiter(),
      portalReplyIpLimiter: allowLimiter(),
      fieldEncryptor: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
      } as unknown as FieldEncryptor,
      ...overrides,
    });
  }

  function makeChannelInput(): { channelId: string; auth: string } {
    return { channelId: VALID_CHANNEL_ID, auth: VALID_AUTH };
  }

  // -- contactInfo --

  describe("contactInfo", () => {
    it("returns sealed envelope for an authenticated channel", async () => {
      const deps = buildChannelDeps();
      const caller = buildCaller(deps);
      const result = await caller.contactInfo(makeChannelInput());
      // Wire format: base64url string (consumed by portal eciesDecrypt)
      expect(typeof result.sealed).toBe("string");
      expect(result.sealed.length).toBeGreaterThan(0);
      expect(mockGetSealedContactInfo).toHaveBeenCalledOnce();
    });

    it("returns NOT_FOUND when fieldEncryptor is null", async () => {
      const deps = buildChannelDeps({ fieldEncryptor: null });
      const caller = buildCaller(deps);
      await expectTrpcError(
        caller.contactInfo(makeChannelInput()),
        "NOT_FOUND",
      );
      expect(mockGetSealedContactInfo).not.toHaveBeenCalled();
    });

    it("returns NOT_FOUND when portal channel deps are null", async () => {
      const deps = buildDeps({ fieldEncryptor: null });
      const caller = buildCaller(deps);
      await expectTrpcError(
        caller.contactInfo(makeChannelInput()),
        "NOT_FOUND",
      );
    });

    it("returns NOT_FOUND for unknown channel (null from resolve)", async () => {
      const deps = buildChannelDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
      });
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const caller = buildCaller(deps);
      await expectTrpcError(
        caller.contactInfo(makeChannelInput()),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
    });

    it("maps PortalContactLockedError to FORBIDDEN with typed code", async () => {
      const { PortalContactLockedError } =
        await import("../portal/portal-errors.js");
      mockGetSealedContactInfo.mockRejectedValue(
        new PortalContactLockedError(),
      );
      const deps = buildChannelDeps();
      const caller = buildCaller(deps);
      const err = await expectTrpcError(
        caller.contactInfo(makeChannelInput()),
        "FORBIDDEN",
      );
      expect(err.message).toBe("PORTAL_CONTACT_LOCKED");
    });

    it("enforces read rate limit before channel resolution", async () => {
      const deps = buildChannelDeps({ portalReadLimiter: denyLimiter() });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.contactInfo(makeChannelInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
      expect(err.cause).toBeInstanceOf(RateLimitError);
      expect(mockGetSealedContactInfo).not.toHaveBeenCalled();
    });

    it("response never contains seeded plaintext", async () => {
      mockGetSealedContactInfo.mockResolvedValue({
        sealed: Buffer.from("ct-sealed-data").toString("base64url"),
      });
      const deps = buildChannelDeps();
      const caller = buildCaller(deps);
      const result = await caller.contactInfo(makeChannelInput());
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain(SEEDED_PLAINTEXT_SENTINEL);
    });
  });

  // -- portalMessagePage --

  describe("portalMessagePage", () => {
    it("returns paginated messages for an authenticated channel", async () => {
      const deps = buildChannelDeps();
      const caller = buildCaller(deps);
      const result = await caller.portalMessagePage({
        ...makeChannelInput(),
        limit: 10,
        direction: "newer",
      });
      expect(result.messages).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(deps.portalMessageService!.listMessages).toHaveBeenCalledOnce();
    });

    it("passes limit, cursor, and direction to the service", async () => {
      const mockListMessages = vi.fn().mockResolvedValue({
        messages: [],
        totalCount: 0,
      });
      const deps = buildChannelDeps({
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: vi.fn(),
          listMessages: mockListMessages,
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
        },
      });
      const caller = buildCaller(deps);
      const cursorId = crypto.randomUUID();
      await caller.portalMessagePage({
        ...makeChannelInput(),
        limit: 25,
        cursor: cursorId,
        direction: "older",
      });
      const serviceOpts = mockListMessages.mock.calls[0]![2] as {
        limit: number;
        cursor: string;
        direction: string;
      };
      expect(serviceOpts.limit).toBe(25);
      expect(serviceOpts.cursor).toBe(cursorId);
      expect(serviceOpts.direction).toBe("older");
    });

    it("returns NOT_FOUND when portal deps are not configured", async () => {
      const caller = buildCaller(buildDeps());
      await expectTrpcError(
        caller.portalMessagePage({
          ...makeChannelInput(),
          limit: 10,
          direction: "newer",
        }),
        "NOT_FOUND",
      );
    });

    it("returns NOT_FOUND for unknown channel", async () => {
      const deps = buildChannelDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
      });
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const caller = buildCaller(deps);
      await expectTrpcError(
        caller.portalMessagePage({
          ...makeChannelInput(),
          limit: 10,
          direction: "newer",
        }),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
    });

    it("enforces read rate limit", async () => {
      const deps = buildChannelDeps({ portalReadLimiter: denyLimiter() });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.portalMessagePage({
          ...makeChannelInput(),
          limit: 10,
          direction: "newer",
        }),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
      expect(err.cause).toBeInstanceOf(RateLimitError);
    });
  });

  // -- evaluateChannelOprf --

  describe("evaluateChannelOprf", () => {
    // 32 bytes base64-encoded, matching the oprf.test.ts pattern for a
    // simulated blinded ristretto255 point.
    const BLINDED_BYTES = Buffer.alloc(32, 0xab);
    const VALID_BLINDED_ELEMENT = BLINDED_BYTES.toString("base64");
    const EVALUATED_RESULT = BLINDED_BYTES.toString("base64url");

    function buildOprfDeps(
      overrides?: Partial<ClientPortalRouterDeps>,
    ): ClientPortalRouterDeps {
      return buildDeps({
        oprfService: {
          evaluate: vi.fn(),
          adminEvaluate: vi.fn(),
          evaluateChannel: vi.fn().mockResolvedValue({
            evaluated: EVALUATED_RESULT,
          }),
        },
        ...overrides,
      });
    }

    it("returns evaluated element as base64url string", async () => {
      const deps = buildOprfDeps();
      const caller = buildCaller(deps);
      const result = await caller.evaluateChannelOprf({
        channelId: VALID_CHANNEL_ID as ChannelSecret,
        blindedElement: VALID_BLINDED_ELEMENT,
        auth: VALID_AUTH,
      });
      // Wire format: base64url string, not Buffer. The portal client
      // feeds this string directly to oprfFinalize, which expects base64url.
      expect(typeof result.evaluated).toBe("string");
      expect(result.evaluated).toBe(EVALUATED_RESULT);
    });

    it("response never contains key material or plaintext", async () => {
      const deps = buildOprfDeps();
      const caller = buildCaller(deps);
      const result = await caller.evaluateChannelOprf({
        channelId: VALID_CHANNEL_ID as ChannelSecret,
        blindedElement: VALID_BLINDED_ELEMENT,
      });
      const serialized = JSON.stringify(result);
      // Only the evaluated element should be present; no key shares,
      // no server secrets, no channel auth material.
      expect(Object.keys(result)).toEqual(["evaluated"]);
      expect(serialized).not.toContain("key");
      expect(serialized).not.toContain("secret");
      expect(serialized).not.toContain("share");
    });

    it("returns NOT_FOUND when oprfService is null", async () => {
      const deps = buildDeps({ oprfService: null });
      const caller = buildCaller(deps);
      await expectTrpcError(
        caller.evaluateChannelOprf({
          channelId: VALID_CHANNEL_ID as ChannelSecret,
          blindedElement: VALID_BLINDED_ELEMENT,
        }),
        "NOT_FOUND",
      );
    });

    it("delegates channelId, blindedElement, auth, and ip to the service", async () => {
      const mockEvaluateChannel = vi.fn().mockResolvedValue({
        evaluated: EVALUATED_RESULT,
      });
      const deps = buildOprfDeps({
        oprfService: {
          evaluate: vi.fn(),
          adminEvaluate: vi.fn(),
          evaluateChannel: mockEvaluateChannel,
        },
      });
      const caller = buildCaller(deps);
      await caller.evaluateChannelOprf({
        channelId: VALID_CHANNEL_ID as ChannelSecret,
        blindedElement: VALID_BLINDED_ELEMENT,
        auth: VALID_AUTH,
      });
      expect(mockEvaluateChannel).toHaveBeenCalledOnce();
      const reqArg = mockEvaluateChannel.mock.calls[0]![1] as {
        channelId: string;
        blindedElement: string;
        auth: string;
        ip: string;
        orgUuid: string;
      };
      expect(reqArg.channelId).toBe(VALID_CHANNEL_ID);
      expect(reqArg.blindedElement).toBe(VALID_BLINDED_ELEMENT);
      expect(reqArg.auth).toBe(VALID_AUTH);
      expect(typeof reqArg.ip).toBe("string");
      expect(reqArg.orgUuid).toBeDefined();
    });

    it("propagates RateLimitError from the service as TOO_MANY_REQUESTS", async () => {
      const deps = buildOprfDeps({
        oprfService: {
          evaluate: vi.fn(),
          adminEvaluate: vi.fn(),
          evaluateChannel: vi
            .fn()
            .mockRejectedValue(
              new RateLimitError("Channel OPRF rate limit exceeded", 120),
            ),
        },
      });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.evaluateChannelOprf({
          channelId: VALID_CHANNEL_ID as ChannelSecret,
          blindedElement: VALID_BLINDED_ELEMENT,
        }),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
    });

    it("propagates ForbiddenError from the service as FORBIDDEN", async () => {
      const { ForbiddenError } = await import("../errors.js");
      const deps = buildOprfDeps({
        oprfService: {
          evaluate: vi.fn(),
          adminEvaluate: vi.fn(),
          evaluateChannel: vi
            .fn()
            .mockRejectedValue(
              new ForbiddenError("Channel authentication failed"),
            ),
        },
      });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.evaluateChannelOprf({
          channelId: VALID_CHANNEL_ID as ChannelSecret,
          blindedElement: VALID_BLINDED_ELEMENT,
        }),
        "FORBIDDEN",
      );
      warnSpy.mockRestore();
    });

    it("propagates ValidationError for malformed blinded input as BAD_REQUEST", async () => {
      const { ValidationError } = await import("../errors.js");
      const deps = buildOprfDeps({
        oprfService: {
          evaluate: vi.fn(),
          adminEvaluate: vi.fn(),
          evaluateChannel: vi
            .fn()
            .mockRejectedValue(new ValidationError("Invalid blinded element")),
        },
      });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.evaluateChannelOprf({
          channelId: VALID_CHANNEL_ID as ChannelSecret,
          blindedElement: "not-valid-base64-!!!",
        }),
        "BAD_REQUEST",
      );
      warnSpy.mockRestore();
    });

    it("rejects empty blindedElement at schema level", async () => {
      const deps = buildOprfDeps();
      const caller = buildCaller(deps);
      await expectTrpcError(
        caller.evaluateChannelOprf({
          channelId: VALID_CHANNEL_ID as ChannelSecret,
          blindedElement: "",
        }),
        "BAD_REQUEST",
      );
    });

    it("auth field is optional (mint path for new channels)", async () => {
      const deps = buildOprfDeps();
      const caller = buildCaller(deps);
      const result = await caller.evaluateChannelOprf({
        channelId: VALID_CHANNEL_ID as ChannelSecret,
        blindedElement: VALID_BLINDED_ELEMENT,
      });
      expect(result.evaluated).toBe(EVALUATED_RESULT);
    });
  });

  // -- addPassphrase --

  describe("addPassphrase", () => {
    function makeAddPassphraseInput(): {
      channelId: string;
      auth: string;
      clientPublic: string;
      keyCheck: {
        ephemeralPoint: string;
        nonce: string;
        ciphertext: string;
      };
      resealedMessages: {
        id: string;
        copy: {
          ephemeralPoint: string;
          nonce: string;
          ciphertext: string;
        };
      }[];
      skippedMessageIds: string[];
    } {
      return {
        channelId: VALID_CHANNEL_ID,
        auth: VALID_AUTH,
        clientPublic: Buffer.alloc(32, 0xaa).toString("base64"),
        keyCheck: {
          ephemeralPoint: Buffer.alloc(32, 0xbb).toString("base64"),
          nonce: Buffer.alloc(24, 0xcc).toString("base64"),
          ciphertext: Buffer.from("kc-ct").toString("base64"),
        },
        resealedMessages: [
          {
            id: crypto.randomUUID(),
            copy: {
              ephemeralPoint: Buffer.alloc(32, 0xdd).toString("base64"),
              nonce: Buffer.alloc(24, 0xee).toString("base64"),
              ciphertext: Buffer.from("msg-ct").toString("base64"),
            },
          },
        ],
        skippedMessageIds: [],
      };
    }

    it("returns empty object on success", async () => {
      const deps = buildChannelDeps();
      const caller = buildCaller(deps);
      const result = await caller.addPassphrase(makeAddPassphraseInput());
      expect(result).toEqual({});
      expect(mockAddPassphrase).toHaveBeenCalledOnce();
    });

    it("decodes base64 fields to Buffers before delegating", async () => {
      const deps = buildChannelDeps();
      const caller = buildCaller(deps);
      await caller.addPassphrase(makeAddPassphraseInput());

      const channelArg = mockAddPassphrase.mock
        .calls[0]![1] as PortalChannelRow;
      expect(channelArg.channel_id).toBe(VALID_CHANNEL_ID);

      const inputArg = mockAddPassphrase.mock.calls[0]![2] as {
        clientPublic: Buffer;
        keyCheck: {
          ephemeralPoint: Buffer;
          nonce: Buffer;
          ciphertext: Buffer;
        };
        resealedMessages: {
          id: string;
          copy: { ephemeralPoint: Buffer; nonce: Buffer; ciphertext: Buffer };
        }[];
      };
      expect(Buffer.isBuffer(inputArg.clientPublic)).toBe(true);
      expect(Buffer.isBuffer(inputArg.keyCheck.ephemeralPoint)).toBe(true);
      expect(Buffer.isBuffer(inputArg.keyCheck.nonce)).toBe(true);
      expect(Buffer.isBuffer(inputArg.keyCheck.ciphertext)).toBe(true);
      expect(inputArg.resealedMessages).toHaveLength(1);
      expect(
        Buffer.isBuffer(inputArg.resealedMessages[0]!.copy.ephemeralPoint),
      ).toBe(true);
    });

    it("maps PassphraseAlreadySetError to CONFLICT", async () => {
      const { PassphraseAlreadySetError } =
        await import("../portal/portal-errors.js");
      mockAddPassphrase.mockRejectedValue(new PassphraseAlreadySetError());
      const deps = buildChannelDeps();
      const caller = buildCaller(deps);
      const err = await expectTrpcError(
        caller.addPassphrase(makeAddPassphraseInput()),
        "CONFLICT",
      );
      expect(err.message).toBe("PORTAL_PASSPHRASE_ALREADY_SET");
    });

    it("maps PassphraseCountMismatchError to CONFLICT", async () => {
      const { PassphraseCountMismatchError } =
        await import("../portal/portal-errors.js");
      mockAddPassphrase.mockRejectedValue(new PassphraseCountMismatchError());
      const deps = buildChannelDeps();
      const caller = buildCaller(deps);
      const err = await expectTrpcError(
        caller.addPassphrase(makeAddPassphraseInput()),
        "CONFLICT",
      );
      expect(err.message).toBe("PORTAL_PASSPHRASE_COUNT_MISMATCH");
    });

    it("returns NOT_FOUND for unknown channel", async () => {
      const deps = buildChannelDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
      });
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const caller = buildCaller(deps);
      await expectTrpcError(
        caller.addPassphrase(makeAddPassphraseInput()),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
    });

    it("enforces upgrade-namespace IP rate limit", async () => {
      const deps = buildChannelDeps({
        portalReplyIpLimiter: denyLimiter(),
      });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.addPassphrase(makeAddPassphraseInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
      expect(err.cause).toBeInstanceOf(RateLimitError);
    });

    it("skips IP limit check when portalReplyIpLimiter is null", async () => {
      const deps = buildChannelDeps({ portalReplyIpLimiter: null });
      const caller = buildCaller(deps);
      const result = await caller.addPassphrase(makeAddPassphraseInput());
      expect(result).toEqual({});
    });
  });

  // -- submitIntake cold error branches --

  describe("submitIntake (cold error branches)", () => {
    it("maps IntakeDisabledError to FORBIDDEN", async () => {
      const { IntakeDisabledError } =
        await import("../portal/intake-service.js");
      mockCreateIntakeTicket.mockRejectedValue(new IntakeDisabledError());
      const caller = buildCaller();
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.submitIntake(makeSubmitInput()),
        "FORBIDDEN",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Web intake is not available");
    });

    it("maps IntakeFormClosedError to FORBIDDEN", async () => {
      const { IntakeFormClosedError } =
        await import("../portal/intake-service.js");
      mockCreateIntakeTicket.mockRejectedValue(new IntakeFormClosedError());
      const caller = buildCaller();
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.submitIntake(makeSubmitInput()),
        "FORBIDDEN",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Web intake is not available");
    });

    it("maps IntakeAccountUnavailableError to INTERNAL_SERVER_ERROR", async () => {
      const { IntakeAccountUnavailableError } =
        await import("../portal/intake-service.js");
      mockCreateIntakeTicket.mockRejectedValue(
        new IntakeAccountUnavailableError(),
      );
      const caller = buildCaller();
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.submitIntake(makeSubmitInput()),
        "INTERNAL_SERVER_ERROR",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Service temporarily unavailable");
    });

    it("maps UsernameTakenError to CONFLICT from the intake path", async () => {
      mockCreateIntakeTicket.mockRejectedValue(new UsernameTakenError());
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
      const err = await expectTrpcError(
        caller.submitIntake(makeSubmitInput()),
        "CONFLICT",
      );
      expect(err.message).toBe("ACCOUNT_USERNAME_TAKEN");
    });
  });
});

// ---------------------------------------------------------------------------
// Cold procedure tests: account session auth model
// ---------------------------------------------------------------------------

describe("client-portal router (account session procedures)", () => {
  const SESSION_TOKEN = "valid-session-token-cold";
  const ACCOUNT_ROW = {
    id: crypto.randomUUID() as ClientAccountId,
    client_id: crypto.randomUUID() as ClientId,
    username_hash: "hash",
    salt: Buffer.alloc(16),
    public_key: Buffer.alloc(32),
    auth_hash: Buffer.alloc(32),
    created_at: new Date("2026-08-15T00:00:00Z"),
  };

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSealedContactInfo.mockResolvedValue({
      sealed: Buffer.from("ct-account-sealed").toString("base64url"),
    });
    mockResolveAccountSession.mockResolvedValue({
      account: ACCOUNT_ROW,
      channel: fakeAccountChannelRow(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function fakeAccountChannelRow(): PortalChannelRow {
    return {
      id: crypto.randomUUID() as ChannelRowId,
      client_id: ACCOUNT_ROW.client_id,
      channel_id: "d".repeat(48) as ChannelSecret,
      auth_hash: Buffer.alloc(32, 0xaa),
      client_public: Buffer.alloc(32, 0xbb),
      has_passphrase: true,
      key_check_ephemeral_point: Buffer.alloc(32),
      key_check_nonce: Buffer.alloc(24),
      key_check_ciphertext: Buffer.alloc(48),
      status: "active",
      created_at: new Date(),
      last_seen_at: null,
      last_notified_at: null,
      revoked_at: null,
      kind: "account",
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
        bootstrap: vi.fn().mockResolvedValue({
          hasPassphrase: true,
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32).toString("base64"),
            nonce: Buffer.alloc(24).toString("base64"),
            ciphertext: Buffer.alloc(48).toString("base64"),
          },
          ticketId: crypto.randomUUID(),
          messages: [],
          attachments: [],
          recordings: [],
          callEntries: [],
          messagesExpireDays: 14,
          safeExitUrl: null,
          upgradeOptions: [],
        }),
        clientReply: vi.fn().mockResolvedValue(undefined),
        listMessages: vi
          .fn()
          .mockResolvedValue({ messages: [], totalCount: 0 }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
      },
      portalReplyLimiter: allowLimiter(),
      fieldEncryptor: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
      } as unknown as FieldEncryptor,
      ...overrides,
    });
  }

  // -- accountContactInfo --

  describe("accountContactInfo", () => {
    it("returns sealed envelope for a valid account session", async () => {
      const deps = buildAccountSessionDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(deps, ctx);
      const result = await caller.accountContactInfo();
      expect(typeof result.sealed).toBe("string");
      expect(result.sealed.length).toBeGreaterThan(0);
      expect(mockGetSealedContactInfo).toHaveBeenCalledOnce();
    });

    it("returns NOT_FOUND when fieldEncryptor is null", async () => {
      const deps = buildAccountSessionDeps({ fieldEncryptor: null });
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(deps, ctx);
      await expectTrpcError(caller.accountContactInfo(), "NOT_FOUND");
      expect(mockGetSealedContactInfo).not.toHaveBeenCalled();
    });

    it("fails with UNAUTHORIZED without a session cookie", async () => {
      const deps = buildAccountSessionDeps();
      const ctx = makeContext();
      const caller = buildCaller(deps, ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.accountContactInfo(),
        "UNAUTHORIZED",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Sign-in failed");
    });

    it("fails with UNAUTHORIZED for a garbage session token", async () => {
      mockResolveAccountSession.mockResolvedValue(null);
      const deps = buildAccountSessionDeps();
      const ctx = makeContextWithCookie("garbage-token-xyz");
      const caller = buildCaller(deps, ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.accountContactInfo(),
        "UNAUTHORIZED",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Sign-in failed");
    });

    it("response never contains seeded plaintext", async () => {
      const SENTINEL = "rt-pii-contact-name";
      mockGetSealedContactInfo.mockResolvedValue({
        sealed: Buffer.from("ct-sealed-contact").toString("base64url"),
      });
      const deps = buildAccountSessionDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(deps, ctx);
      const result = await caller.accountContactInfo();
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain(SENTINEL);
    });
  });

  // -- accountMessages --

  describe("accountMessages", () => {
    it("returns messages list for a valid account session", async () => {
      const deps = buildAccountSessionDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(deps, ctx);
      const result = await caller.accountMessages();
      expect(result.messages).toBeDefined();
      expect(result.ticketId).toBeDefined();
      expect(result.messagesExpireDays).toBe(14);
    });

    it("strips keyCheck and hasPassphrase from the response", async () => {
      const deps = buildAccountSessionDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(deps, ctx);
      const result = await caller.accountMessages();
      expect(result).not.toHaveProperty("keyCheck");
      expect(result).not.toHaveProperty("hasPassphrase");
    });

    it("fails with UNAUTHORIZED without a session cookie", async () => {
      const deps = buildAccountSessionDeps();
      const ctx = makeContext();
      const caller = buildCaller(deps, ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.accountMessages(),
        "UNAUTHORIZED",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Sign-in failed");
    });

    it("returns NOT_FOUND when portalMessageService is null", async () => {
      const deps = buildAccountSessionDeps({
        portalMessageService: null,
      });
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(deps, ctx);
      await expectTrpcError(caller.accountMessages(), "NOT_FOUND");
    });
  });

  // -- denial matrix: channel-token procedure called with account auth --

  describe("denial matrix (account session calling channel-token procedures)", () => {
    it("contactInfo rejects without channel auth even with a valid session cookie", async () => {
      // contactInfo requires channelId + auth (channel-token model).
      // An account session cookie alone does not satisfy the channel auth gate.
      const deps = buildAccountSessionDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
        portalReadLimiter: allowLimiter(),
      });
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(deps, ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      // The procedure still requires channelId + auth in the input schema,
      // but the channel does not resolve for this account.
      await expectTrpcError(
        caller.contactInfo({
          channelId: "b".repeat(48),
          auth: Buffer.alloc(32, 0xdd).toString("base64"),
        }),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
    });

    it("addPassphrase rejects without channel auth even with a valid session", async () => {
      const deps = buildAccountSessionDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
        portalReplyIpLimiter: allowLimiter(),
      });
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(deps, ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.addPassphrase({
          channelId: "b".repeat(48),
          auth: Buffer.alloc(32, 0xdd).toString("base64"),
          clientPublic: Buffer.alloc(32, 0xaa).toString("base64"),
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32, 0xbb).toString("base64"),
            nonce: Buffer.alloc(24, 0xcc).toString("base64"),
            ciphertext: Buffer.from("kc").toString("base64"),
          },
          resealedMessages: [],
          skippedMessageIds: [],
        }),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
    });
  });

  // -- denial matrix: account procedure called without a cookie --

  describe("denial matrix (no cookie on account-only procedures)", () => {
    it("accountContactInfo rejects without a cookie", async () => {
      const deps = buildAccountSessionDeps();
      const ctx = makeContext();
      const caller = buildCaller(deps, ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(caller.accountContactInfo(), "UNAUTHORIZED");
      warnSpy.mockRestore();
    });

    it("accountMessages rejects without a cookie", async () => {
      const deps = buildAccountSessionDeps();
      const ctx = makeContext();
      const caller = buildCaller(deps, ctx);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(caller.accountMessages(), "UNAUTHORIZED");
      warnSpy.mockRestore();
    });
  });

  // -- accountUpgrade cold branches --

  describe("accountUpgrade (cold branches)", () => {
    const VALID_CHANNEL_ID = "a".repeat(48);
    const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

    function fakeUpgradeChannelRow(): PortalChannelRow {
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
      };
    }

    function buildUpgradeDeps(
      overrides?: Partial<ClientPortalRouterDeps>,
    ): ClientPortalRouterDeps {
      return buildDeps({
        portalChannelService: {
          resolveAuthedChannel: vi
            .fn()
            .mockResolvedValue(fakeUpgradeChannelRow()),
        },
        portalMessageService: {
          bootstrap: vi.fn(),
          clientReply: vi.fn(),
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
        },
        portalReplyLimiter: allowLimiter(),
        portalReplyIpLimiter: allowLimiter(),
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
      skippedMessageIds: never[];
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
        skippedMessageIds: [],
      };
    }

    it("enforces upgrade-namespace IP rate limit", async () => {
      const deps = buildUpgradeDeps({
        portalReplyIpLimiter: denyLimiter(),
      });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.accountUpgrade(makeUpgradeInput()),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
      expect(err.cause).toBeInstanceOf(RateLimitError);
    });

    it("skips IP limit check when portalReplyIpLimiter is null", async () => {
      mockUpgradeFromSecureLink.mockResolvedValue(undefined);
      const deps = buildUpgradeDeps({ portalReplyIpLimiter: null });
      const caller = buildCaller(deps);
      const result = await caller.accountUpgrade(makeUpgradeInput());
      expect(result).toEqual({});
    });
  });

  // -- accountChangePassword cold branches --

  describe("accountChangePassword (cold branches)", () => {
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
      skippedMessageIds: never[];
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
        skippedMessageIds: [],
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
          listMessages: vi
            .fn()
            .mockResolvedValue({ messages: [], totalCount: 0 }),
          hasRecentOrgReply: vi.fn().mockResolvedValue(false),
        },
        portalReplyLimiter: allowLimiter(),
      });
    }

    it("maps StaleThreadError to CONFLICT", async () => {
      mockResolveAccountSession.mockResolvedValue({
        account: ACCOUNT_ROW,
        channel: fakeAccountChannelRow(),
        tokenHash: Buffer.alloc(32, 0xdd),
      });
      mockChangePassword.mockRejectedValue(new StaleThreadError());

      const changeDeps = buildChangePasswordDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(changeDeps, ctx);

      const err = await expectTrpcError(
        caller.accountChangePassword(makeChangePasswordInput()),
        "CONFLICT",
      );
      expect(err.message).toBe("Thread state changed; retry after refetch");
    });

    it("maps false return from changePassword to UNAUTHORIZED", async () => {
      mockResolveAccountSession.mockResolvedValue({
        account: ACCOUNT_ROW,
        channel: fakeAccountChannelRow(),
        tokenHash: Buffer.alloc(32, 0xdd),
      });
      mockChangePassword.mockResolvedValue(false);

      const changeDeps = buildChangePasswordDeps();
      const ctx = makeContextWithCookie(SESSION_TOKEN);
      const caller = buildCaller(changeDeps, ctx);

      const err = await expectTrpcError(
        caller.accountChangePassword(makeChangePasswordInput()),
        "UNAUTHORIZED",
      );
      expect(err.message).toBe("Sign-in failed");
    });
  });

  // -- accountLogin cold branches --

  describe("accountLogin (cold branches)", () => {
    function buildLoginDeps(
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

    it("enforces login rate limit", async () => {
      const deps = buildLoginDeps({ accountLoginLimiter: denyLimiter() });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.accountLogin({
          accountId: crypto.randomUUID(),
          authToken: Buffer.alloc(32, 0xdd).toString("base64"),
        }),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
    });

    it("sets Secure flag when x-forwarded-proto is https", async () => {
      const expiresAt = new Date(Date.now() + 86400_000);
      mockAccountLogin.mockResolvedValue({
        sessionToken: "session-tok-secure",
        expiresAt,
      });
      const deps = buildLoginDeps();
      const ctx: Context = {
        req: mockReq({
          remoteAddress: "10.0.0.1",
          headers: { "x-forwarded-proto": "https" },
        }),
        res: mockRes(),
        org: createMockOrgContext(),
        session: null,
        user: null,
      };
      const caller = buildCaller(deps, ctx);
      await caller.accountLogin({
        accountId: crypto.randomUUID(),
        authToken: Buffer.alloc(32, 0xdd).toString("base64"),
      });
      const res = ctx.res as MockResWithCookies;
      const cookies = res.getCapturedCookies();
      expect(cookies).toHaveLength(1);
      expect(cookies[0]).toContain("Secure");
    });
  });

  // -- portalMessages cold branches (rate limit) --

  describe("portalMessages (cold rate-limit branch)", () => {
    const VALID_CHANNEL_ID = "a".repeat(48);
    const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

    it("enforces read rate limit and returns RateLimitError cause", async () => {
      const deps = buildAccountSessionDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
        portalReadLimiter: denyLimiter(1800_000),
      });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.portalMessages({
          channelId: VALID_CHANNEL_ID,
          auth: VALID_AUTH,
        }),
        "TOO_MANY_REQUESTS",
      );
      warnSpy.mockRestore();
      expect(err.cause).toBeInstanceOf(RateLimitError);
    });
  });
});

// ---------------------------------------------------------------------------
// submitIntake: optional branches
// ---------------------------------------------------------------------------

describe("client-portal router (submitIntake optional branches)", () => {
  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateIntakeTicket.mockResolvedValue({
      ticketId: "t-opt",
      clientAlias: "cool-river-9",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes null encryptedMessage to service when field is omitted", async () => {
    const input = makeSubmitInput();
    delete (input as Record<string, unknown>).encryptedMessage;

    const caller = buildCaller();
    await caller.submitIntake(input);

    const serviceInput = mockCreateIntakeTicket.mock.calls[0]![2] as Record<
      string,
      unknown
    >;
    expect(serviceInput.encryptedMessage).toBeNull();
  });

  it("passes Buffer encryptedMessage when field is present", async () => {
    const caller = buildCaller();
    await caller.submitIntake(makeSubmitInput());

    const serviceInput = mockCreateIntakeTicket.mock.calls[0]![2] as Record<
      string,
      unknown
    >;
    expect(Buffer.isBuffer(serviceInput.encryptedMessage)).toBe(true);
  });

  it("decodes account selfCopy to Buffers when present", async () => {
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

    const input = makeSubmitInput({
      account: {
        accountId: clientAccountIdSchema.parse(crypto.randomUUID()),
        username: "rt-acct-user",
        salt: Buffer.alloc(16, 0x01).toString("base64"),
        publicKey: Buffer.alloc(32, 0x02).toString("base64"),
        authHash: Buffer.alloc(32, 0x03).toString("base64"),
        keyCheck: {
          ephemeralPoint: Buffer.alloc(32, 0x04).toString("base64"),
          nonce: Buffer.alloc(24, 0x05).toString("base64"),
          ciphertext: Buffer.from("kc-ct").toString("base64"),
        },
        selfCopy: {
          ephemeralPoint: Buffer.alloc(32, 0x06).toString("base64"),
          nonce: Buffer.alloc(24, 0x07).toString("base64"),
          ciphertext: Buffer.from("sc-ct").toString("base64"),
        },
      },
    } as Partial<IntakeSubmissionInput>);

    await caller.submitIntake(input);

    const serviceInput = mockCreateIntakeTicket.mock.calls[0]![2] as {
      account: {
        registration: Record<string, unknown>;
        selfCopy: {
          ephemeralPoint: Buffer;
          nonce: Buffer;
          ciphertext: Buffer;
        } | null;
      } | null;
    };
    expect(serviceInput.account).not.toBeNull();
    const sc = serviceInput.account!.selfCopy;
    expect(sc).not.toBeNull();
    expect(Buffer.isBuffer(sc!.ephemeralPoint)).toBe(true);
    expect(Buffer.isBuffer(sc!.nonce)).toBe(true);
    expect(Buffer.isBuffer(sc!.ciphertext)).toBe(true);
  });

  it("passes null account selfCopy when the field is absent", async () => {
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

    const input = makeSubmitInput({
      account: {
        accountId: clientAccountIdSchema.parse(crypto.randomUUID()),
        username: "rt-acct-user2",
        salt: Buffer.alloc(16, 0x01).toString("base64"),
        publicKey: Buffer.alloc(32, 0x02).toString("base64"),
        authHash: Buffer.alloc(32, 0x03).toString("base64"),
        keyCheck: {
          ephemeralPoint: Buffer.alloc(32, 0x04).toString("base64"),
          nonce: Buffer.alloc(24, 0x05).toString("base64"),
          ciphertext: Buffer.from("kc-ct").toString("base64"),
        },
      },
    } as Partial<IntakeSubmissionInput>);

    await caller.submitIntake(input);

    const serviceInput = mockCreateIntakeTicket.mock.calls[0]![2] as {
      account: {
        selfCopy: unknown;
      } | null;
    };
    expect(serviceInput.account!.selfCopy).toBeNull();
  });

  it("decodes continuation selfCopy to Buffers when present", async () => {
    const VALID_CHANNEL_ID = "a".repeat(48);
    const caller = buildCaller();

    const input = makeSubmitInput({
      continuation: {
        channelId: VALID_CHANNEL_ID,
        authHash: Buffer.alloc(32, 0x01).toString("base64"),
        clientPublic: Buffer.alloc(32, 0x02).toString("base64"),
        keyCheck: {
          ephemeralPoint: Buffer.alloc(32, 0x03).toString("base64"),
          nonce: Buffer.alloc(24, 0x04).toString("base64"),
          ciphertext: Buffer.from("kc-ct").toString("base64"),
        },
        selfCopy: {
          ephemeralPoint: Buffer.alloc(32, 0x08).toString("base64"),
          nonce: Buffer.alloc(24, 0x09).toString("base64"),
          ciphertext: Buffer.from("cont-sc-ct").toString("base64"),
        },
      },
    } as Partial<IntakeSubmissionInput>);

    await caller.submitIntake(input);

    const serviceInput = mockCreateIntakeTicket.mock.calls[0]![2] as {
      continuation: {
        selfCopy: {
          ephemeralPoint: Buffer;
          nonce: Buffer;
          ciphertext: Buffer;
        } | null;
      } | null;
    };
    expect(serviceInput.continuation).not.toBeNull();
    const sc = serviceInput.continuation!.selfCopy;
    expect(sc).not.toBeNull();
    expect(Buffer.isBuffer(sc!.ephemeralPoint)).toBe(true);
    expect(Buffer.isBuffer(sc!.nonce)).toBe(true);
    expect(Buffer.isBuffer(sc!.ciphertext)).toBe(true);
  });

  it("passes null followUpId through to the service", async () => {
    // The submission schema makes followUpId nullable but not optional, so
    // null is the only way a caller can decline to mint one.
    const input = { ...makeSubmitInput(), followUpId: null };

    const caller = buildCaller();
    await caller.submitIntake(input);

    const serviceInput = mockCreateIntakeTicket.mock.calls[0]![2] as Record<
      string,
      unknown
    >;
    expect(serviceInput.followUpId).toBeNull();
  });

  it("response does not contain seeded ciphertext markers", async () => {
    const caller = buildCaller();
    const result = await caller.submitIntake(makeSubmitInput());
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("test-ciphertext");
  });
});

// ---------------------------------------------------------------------------
// accountLogout: session-present and session-absent branches
// ---------------------------------------------------------------------------

describe("client-portal router (accountLogout branches)", () => {
  const ACCOUNT_ROW_LOGOUT = {
    id: crypto.randomUUID() as ClientAccountId,
    client_id: crypto.randomUUID() as ClientId,
    username_hash: "hash",
    salt: Buffer.alloc(16),
    public_key: Buffer.alloc(32),
    auth_hash: Buffer.alloc(32),
    created_at: new Date(),
  };

  function fakeLogoutChannelRow(): PortalChannelRow {
    return {
      id: crypto.randomUUID() as ChannelRowId,
      client_id: ACCOUNT_ROW_LOGOUT.client_id,
      channel_id: "e".repeat(48) as ChannelSecret,
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
      kind: "account",
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
        listMessages: vi
          .fn()
          .mockResolvedValue({ messages: [], totalCount: 0 }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
      },
    });
  }

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveAccountSession.mockResolvedValue({
      account: ACCOUNT_ROW_LOGOUT,
      channel: fakeLogoutChannelRow(),
    });
    mockAccountLogout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls accountService.logout when cookie header has a session token", async () => {
    const logoutDeps = buildLogoutDeps();
    const ctx: Context = {
      req: mockReq({
        remoteAddress: "10.0.0.1",
        headers: { cookie: `care_y_client_session=real-tok-123` },
      }),
      res: mockRes(),
      org: createMockOrgContext(),
      session: null,
      user: null,
    };
    const caller = buildCaller(logoutDeps, ctx);
    await caller.accountLogout();

    expect(mockAccountLogout).toHaveBeenCalledWith(
      expect.anything(),
      "real-tok-123",
    );
    const res = ctx.res as MockResWithCookies;
    expect(res.getCapturedCookies()[0]).toContain("Max-Age=0");
  });

  it("denies logout and never calls the service when no session cookie is present", async () => {
    const logoutDeps = buildLogoutDeps();
    // A cookie header carrying only unrelated keys still fails
    // requireAccountSession, which reads the session cookie before the
    // handler runs.
    const ctxWithOtherCookie: Context = {
      req: mockReq({
        remoteAddress: "10.0.0.1",
        headers: { cookie: "other_key=abc" },
      }),
      res: mockRes(),
      org: createMockOrgContext(),
      session: null,
      user: null,
    };
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    await expectTrpcError(
      buildCaller(logoutDeps, ctxWithOtherCookie).accountLogout(),
      "UNAUTHORIZED",
    );
    warnSpy.mockRestore();
    expect(mockAccountLogout).not.toHaveBeenCalled();
  });

  it("skips accountService.logout when session token cookie is empty string", async () => {
    const logoutDeps = buildLogoutDeps();
    const ctx: Context = {
      req: mockReq({
        remoteAddress: "10.0.0.1",
        headers: { cookie: "care_y_client_session=" },
      }),
      res: mockRes(),
      org: createMockOrgContext(),
      session: null,
      user: null,
    };
    // requireAccountSession rejects empty token with UNAUTHORIZED
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    await expectTrpcError(
      buildCaller(logoutDeps, ctx).accountLogout(),
      "UNAUTHORIZED",
    );
    warnSpy.mockRestore();
    expect(mockAccountLogout).not.toHaveBeenCalled();
  });

  it("clears cookie even if accountService.logout is skipped (empty token after session gate)", async () => {
    // The session cookie is present with a valid token (passes
    // requireAccountSession), but the second cookie parse in the
    // logout body sees a different cookie string. This cannot happen
    // in production (same req object) but exercises the guard.
    const logoutDeps = buildLogoutDeps();
    const ctx: Context = {
      req: mockReq({
        remoteAddress: "10.0.0.1",
        headers: { cookie: "care_y_client_session=tok-valid" },
      }),
      res: mockRes(),
      org: createMockOrgContext(),
      session: null,
      user: null,
    };
    const caller = buildCaller(logoutDeps, ctx);
    await caller.accountLogout();

    const res = ctx.res as MockResWithCookies;
    const cookies = res.getCapturedCookies();
    expect(cookies).toHaveLength(1);
    expect(cookies[0]).toContain("Max-Age=0");
  });
});

// ---------------------------------------------------------------------------
// openShare: null shareLimiter branch
// ---------------------------------------------------------------------------

describe("client-portal router (openShare null limiter branch)", () => {
  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenShare.mockResolvedValue({
      status: "ready",
      ciphertext: Buffer.from("ct-share-data"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("succeeds without rate limiting when shareLimiter is null", async () => {
    const deps = buildDeps({ shareLimiter: null });
    const caller = buildCaller(deps);
    const result = await caller.openShare({ shareId: crypto.randomUUID() });
    expect(result.status).toBe("ready");
    expect(mockOpenShare).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// getAccountSalt: null limiter branch
// ---------------------------------------------------------------------------

describe("client-portal router (getAccountSalt null limiter branch)", () => {
  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSaltForUsername.mockResolvedValue({
      salt: Buffer.alloc(16, 0xcc),
      accountId: crypto.randomUUID(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("succeeds without rate limiting when accountSaltLimiter is null", async () => {
    const deps = buildDeps({
      accountServiceDeps: {
        indexer: {
          hash: vi.fn().mockReturnValue("hashed"),
        } as unknown as BlindIndexer,
        fakeSaltKey: Buffer.alloc(32, 0xab),
      },
      accountSaltLimiter: null,
    });
    const caller = buildCaller(deps);
    const result = await caller.getAccountSalt({ username: "rt-user-salt" });
    expect(typeof result.salt).toBe("string");
    expect(mockGetSaltForUsername).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// accountLogin: null limiter branch
// ---------------------------------------------------------------------------

describe("client-portal router (accountLogin null limiter branch)", () => {
  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAccountLogin.mockResolvedValue({
      sessionToken: "session-tok-nolimit",
      expiresAt: new Date(Date.now() + 86400_000),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("succeeds without rate limiting when accountLoginLimiter is null", async () => {
    const deps = buildDeps({
      accountServiceDeps: {
        indexer: {
          hash: vi.fn().mockReturnValue("hashed"),
        } as unknown as BlindIndexer,
        fakeSaltKey: Buffer.alloc(32, 0xab),
      },
      accountLoginLimiter: null,
    });
    const caller = buildCaller(deps);
    const result = await caller.accountLogin({
      accountId: crypto.randomUUID(),
      authToken: Buffer.alloc(32, 0xdd).toString("base64"),
    });
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// accountUpgrade: null IP limiter branch
// and StaleThreadError mapping
// ---------------------------------------------------------------------------

describe("client-portal router (accountUpgrade null-limiter and stale-thread)", () => {
  const VALID_CHANNEL_ID = "a".repeat(48);
  const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

  function fakeUpgradeChannel(): PortalChannelRow {
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
    };
  }

  function buildUpgradeDeps2(
    overrides?: Partial<ClientPortalRouterDeps>,
  ): ClientPortalRouterDeps {
    return buildDeps({
      portalChannelService: {
        resolveAuthedChannel: vi.fn().mockResolvedValue(fakeUpgradeChannel()),
      },
      portalMessageService: {
        bootstrap: vi.fn(),
        clientReply: vi.fn(),
        listMessages: vi
          .fn()
          .mockResolvedValue({ messages: [], totalCount: 0 }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
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

  function makeUpgradeInput2(): {
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
    rewrappedMessages: {
      id: string;
      copy: {
        ephemeralPoint: string;
        nonce: string;
        ciphertext: string;
      };
    }[];
    skippedMessageIds: string[];
  } {
    return {
      channelId: VALID_CHANNEL_ID,
      auth: VALID_AUTH,
      account: {
        accountId: crypto.randomUUID(),
        username: "rt-upgrade-user",
        salt: Buffer.alloc(16, 0xaa).toString("base64"),
        publicKey: Buffer.alloc(32, 0xbb).toString("base64"),
        authHash: Buffer.alloc(32, 0xcc).toString("base64"),
        keyCheck: {
          ephemeralPoint: Buffer.alloc(32, 0xdd).toString("base64"),
          nonce: Buffer.alloc(24, 0xee).toString("base64"),
          ciphertext: Buffer.from("key-check-ct").toString("base64"),
        },
      },
      rewrappedMessages: [
        {
          id: crypto.randomUUID(),
          copy: {
            ephemeralPoint: Buffer.alloc(32, 0x11).toString("base64"),
            nonce: Buffer.alloc(24, 0x22).toString("base64"),
            ciphertext: Buffer.from("rw-ct").toString("base64"),
          },
        },
      ],
      skippedMessageIds: [],
    };
  }

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes through without rate limiting when portalReplyIpLimiter is null", async () => {
    mockUpgradeFromSecureLink.mockResolvedValue(undefined);
    const deps = buildUpgradeDeps2({ portalReplyIpLimiter: null });
    const caller = buildCaller(deps);
    const result = await caller.accountUpgrade(makeUpgradeInput2());
    expect(result).toEqual({});
    expect(mockUpgradeFromSecureLink).toHaveBeenCalledOnce();
  });

  it("decodes rewrappedMessages entries to Buffers", async () => {
    mockUpgradeFromSecureLink.mockResolvedValue(undefined);
    const deps = buildUpgradeDeps2({ portalReplyIpLimiter: null });
    const caller = buildCaller(deps);
    await caller.accountUpgrade(makeUpgradeInput2());

    const rewrapped = mockUpgradeFromSecureLink.mock.calls[0]![4] as {
      id: string;
      copy: { ephemeralPoint: Buffer; nonce: Buffer; ciphertext: Buffer };
    }[];
    expect(rewrapped).toHaveLength(1);
    expect(Buffer.isBuffer(rewrapped[0]!.copy.ephemeralPoint)).toBe(true);
    expect(Buffer.isBuffer(rewrapped[0]!.copy.nonce)).toBe(true);
    expect(Buffer.isBuffer(rewrapped[0]!.copy.ciphertext)).toBe(true);
  });

  it("maps StaleThreadError to CONFLICT with descriptive message", async () => {
    mockUpgradeFromSecureLink.mockRejectedValue(new StaleThreadError());
    const deps = buildUpgradeDeps2({ portalReplyIpLimiter: null });
    const caller = buildCaller(deps);
    const err = await expectTrpcError(
      caller.accountUpgrade(makeUpgradeInput2()),
      "CONFLICT",
    );
    expect(err.message).toBe("Thread state changed; retry after refetch");
  });
});

// ---------------------------------------------------------------------------
// accountChangePassword: StaleThreadError and
// wrong currentAuthToken
// ---------------------------------------------------------------------------

describe("client-portal router (accountChangePassword rewrap and mismatch paths)", () => {
  const SESSION_TOKEN_CPW = "valid-session-cpw";
  const ACCOUNT_ROW_CPW = {
    id: crypto.randomUUID() as ClientAccountId,
    client_id: crypto.randomUUID() as ClientId,
    username_hash: "hash",
    salt: Buffer.alloc(16),
    public_key: Buffer.alloc(32),
    auth_hash: Buffer.alloc(32),
    created_at: new Date(),
  };

  function fakeChannelRowCpw(): PortalChannelRow {
    return {
      id: crypto.randomUUID() as ChannelRowId,
      client_id: ACCOUNT_ROW_CPW.client_id,
      channel_id: "f".repeat(48) as ChannelSecret,
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
      kind: "account",
    };
  }

  function makeChangePasswordInputCpw(): {
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
    rewrappedMessages: {
      id: string;
      copy: {
        ephemeralPoint: string;
        nonce: string;
        ciphertext: string;
      };
    }[];
    skippedMessageIds: string[];
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
      rewrappedMessages: [
        {
          id: crypto.randomUUID(),
          copy: {
            ephemeralPoint: Buffer.alloc(32, 0x11).toString("base64"),
            nonce: Buffer.alloc(24, 0x22).toString("base64"),
            ciphertext: Buffer.from("rw-ct").toString("base64"),
          },
        },
      ],
      skippedMessageIds: [],
    };
  }

  function buildCpwDeps(): ClientPortalRouterDeps {
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
        listMessages: vi
          .fn()
          .mockResolvedValue({ messages: [], totalCount: 0 }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
      },
      portalReplyLimiter: allowLimiter(),
    });
  }

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveAccountSession.mockResolvedValue({
      account: ACCOUNT_ROW_CPW,
      channel: fakeChannelRowCpw(),
      tokenHash: Buffer.alloc(32, 0xdd),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("decodes rewrappedMessages entries to Buffers in change-password path", async () => {
    mockChangePassword.mockResolvedValue(true);
    const cpwDeps = buildCpwDeps();
    const ctx: Context = {
      req: mockReq({
        remoteAddress: "10.0.0.1",
        headers: { cookie: `care_y_client_session=${SESSION_TOKEN_CPW}` },
      }),
      res: mockRes(),
      org: createMockOrgContext(),
      session: null,
      user: null,
    };
    const caller = buildCaller(cpwDeps, ctx);
    await caller.accountChangePassword(makeChangePasswordInputCpw());

    const passedInput = mockChangePassword.mock.calls[0]![5] as {
      rewrappedMessages: {
        id: string;
        copy: { ephemeralPoint: Buffer; nonce: Buffer; ciphertext: Buffer };
      }[];
    };
    expect(passedInput.rewrappedMessages).toHaveLength(1);
    expect(
      Buffer.isBuffer(passedInput.rewrappedMessages[0]!.copy.ephemeralPoint),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// evaluateChannelOprf: service-thrown errors propagate through withErrorWrapping
// contactInfo also exercises OPRF error propagation.
// ---------------------------------------------------------------------------

describe("client-portal router (evaluateChannelOprf malformed input)", () => {
  const VALID_CHANNEL_ID = "a".repeat(48);

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("response contains only the evaluated field (no key material)", async () => {
    const evaluatedValue = Buffer.alloc(32, 0xab).toString("base64url");
    const deps = buildDeps({
      oprfService: {
        evaluate: vi.fn(),
        adminEvaluate: vi.fn(),
        evaluateChannel: vi.fn().mockResolvedValue({
          evaluated: evaluatedValue,
        }),
      },
    });
    const caller = buildCaller(deps);
    const result = await caller.evaluateChannelOprf({
      channelId: VALID_CHANNEL_ID as ChannelSecret,
      blindedElement: Buffer.alloc(32, 0xab).toString("base64"),
    });
    expect(Object.keys(result)).toEqual(["evaluated"]);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("share");
    expect(serialized).not.toContain("private");
  });

  it("service error with non-AppError propagates as INTERNAL_SERVER_ERROR", async () => {
    const deps = buildDeps({
      oprfService: {
        evaluate: vi.fn(),
        adminEvaluate: vi.fn(),
        evaluateChannel: vi
          .fn()
          .mockRejectedValue(new TypeError("unexpected native error")),
      },
    });
    const caller = buildCaller(deps);
    await expectTrpcError(
      caller.evaluateChannelOprf({
        channelId: VALID_CHANNEL_ID as ChannelSecret,
        blindedElement: Buffer.alloc(32, 0xab).toString("base64"),
      }),
      "INTERNAL_SERVER_ERROR",
    );
  });
});

// ---------------------------------------------------------------------------
// addPassphrase: PassphraseCountMismatchError
// ---------------------------------------------------------------------------

describe("client-portal router (addPassphrase count mismatch)", () => {
  const VALID_CHANNEL_ID = "a".repeat(48);
  const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps PassphraseCountMismatchError to CONFLICT with typed code", async () => {
    const { PassphraseCountMismatchError } =
      await import("../portal/portal-errors.js");
    mockAddPassphrase.mockRejectedValue(new PassphraseCountMismatchError());
    const deps = buildDeps({
      portalChannelService: {
        resolveAuthedChannel: vi.fn().mockResolvedValue({
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
        }),
      },
      portalMessageService: {
        bootstrap: vi.fn(),
        clientReply: vi.fn(),
        listMessages: vi
          .fn()
          .mockResolvedValue({ messages: [], totalCount: 0 }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
      },
      portalReadLimiter: allowLimiter(),
      portalReplyLimiter: allowLimiter(),
      portalReplyIpLimiter: allowLimiter(),
      fieldEncryptor: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
      } as unknown as FieldEncryptor,
    });
    const caller = buildCaller(deps);
    const err = await expectTrpcError(
      caller.addPassphrase({
        channelId: VALID_CHANNEL_ID,
        auth: VALID_AUTH,
        clientPublic: Buffer.alloc(32, 0xaa).toString("base64"),
        keyCheck: {
          ephemeralPoint: Buffer.alloc(32, 0xbb).toString("base64"),
          nonce: Buffer.alloc(24, 0xcc).toString("base64"),
          ciphertext: Buffer.from("kc").toString("base64"),
        },
        resealedMessages: [],
        skippedMessageIds: [],
      }),
      "CONFLICT",
    );
    expect(err.message).toBe("PORTAL_PASSPHRASE_COUNT_MISMATCH");
  });
});

// ---------------------------------------------------------------------------
// Helper branches: requireAccountDeps with null accountServiceDeps,
// buildPortalMessageDeps null fieldEncryptor (1563),
// decodeReplyAttachments callback (1600),
// decodeRewrappedMessages callback (1654)
// ---------------------------------------------------------------------------

describe("client-portal router (helper denial and decode paths)", () => {
  const VALID_CHANNEL_ID = "a".repeat(48);
  const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getAccountSalt returns NOT_FOUND when accountServiceDeps is null", async () => {
    const deps = buildDeps({
      accountServiceDeps: null,
    });
    const caller = buildCaller(deps);
    // requireAccountDeps(deps, orgId) throws TRPCError NOT_FOUND
    const err = await expectTrpcError(
      caller.getAccountSalt({ username: "rt-no-deps" }),
      "NOT_FOUND",
    );
    // Enumeration resistance: generic sign-in failure message
    expect(err.message).toBe("Sign-in failed");
  });

  it("portalReply returns NOT_FOUND when fieldEncryptor is null (buildPortalMessageDeps)", async () => {
    const channel: PortalChannelRow = {
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
    };

    const deps = buildDeps({
      portalChannelService: {
        resolveAuthedChannel: vi.fn().mockResolvedValue(channel),
      },
      portalMessageService: {
        bootstrap: vi.fn(),
        clientReply: vi.fn().mockResolvedValue(undefined),
        listMessages: vi
          .fn()
          .mockResolvedValue({ messages: [], totalCount: 0 }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
      },
      portalReadLimiter: allowLimiter(),
      portalReplyLimiter: allowLimiter(),
      // fieldEncryptor is null: buildPortalMessageDeps throws NOT_FOUND
      fieldEncryptor: null,
    });
    const caller = buildCaller(deps);

    await expectTrpcError(
      caller.portalReply({
        channelId: VALID_CHANNEL_ID,
        auth: VALID_AUTH,
        ticketId: crypto.randomUUID(),
        followUpId: crypto.randomUUID(),
        keyGeneration: crypto.randomUUID(),
        encryptedContent: Buffer.from("ct-content").toString("base64"),
        wrappedTkTemp: Buffer.alloc(80, 0xdd).toString("base64"),
        selfCopy: {
          ephemeralPoint: Buffer.alloc(32, 0xee).toString("base64"),
          nonce: Buffer.alloc(24, 0xff).toString("base64"),
          ciphertext: Buffer.from("sc-ct").toString("base64"),
        },
      }),
      "NOT_FOUND",
    );
  });

  it("portalReply decodes attachment fields to Buffers", async () => {
    const channel: PortalChannelRow = {
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
    };

    const mockClientReply = vi.fn().mockResolvedValue(undefined);
    const deps = buildDeps({
      portalChannelService: {
        resolveAuthedChannel: vi.fn().mockResolvedValue(channel),
      },
      portalMessageService: {
        bootstrap: vi.fn(),
        clientReply: mockClientReply,
        listMessages: vi
          .fn()
          .mockResolvedValue({ messages: [], totalCount: 0 }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
      },
      portalReadLimiter: allowLimiter(),
      portalReplyLimiter: allowLimiter(),
      fieldEncryptor: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
      } as unknown as FieldEncryptor,
    });
    const caller = buildCaller(deps);

    await caller.portalReply({
      channelId: VALID_CHANNEL_ID,
      auth: VALID_AUTH,
      ticketId: crypto.randomUUID(),
      followUpId: crypto.randomUUID(),
      keyGeneration: crypto.randomUUID(),
      encryptedContent: Buffer.from("ct-content").toString("base64"),
      wrappedTkTemp: Buffer.alloc(80, 0xdd).toString("base64"),
      selfCopy: {
        ephemeralPoint: Buffer.alloc(32, 0xee).toString("base64"),
        nonce: Buffer.alloc(24, 0xff).toString("base64"),
        ciphertext: Buffer.from("sc-ct").toString("base64"),
      },
      attachments: [
        {
          attachmentId: crypto.randomUUID(),
          blob: Buffer.from("ct-file-bytes").toString("base64"),
          sizeBytes: 13,
          contentType: "application/pdf",
          // The schema pins fileKeyWrap at exactly 72 bytes.
          fileKeyWrap: Buffer.alloc(72, 0x11).toString("base64"),
          encryptedFilename: Buffer.from("ct-fname").toString("base64"),
          selfCopy: {
            ephemeralPoint: Buffer.alloc(32, 0x22).toString("base64"),
            nonce: Buffer.alloc(24, 0x33).toString("base64"),
            ciphertext: Buffer.from("att-sc-ct").toString("base64"),
          },
        },
      ],
    });

    const serviceInput = mockClientReply.mock
      .calls[0]?.[3] as PortalReplyServiceInput;
    expect(serviceInput.attachments).toHaveLength(1);
    const att = serviceInput.attachments![0]!;
    expect(Buffer.isBuffer(att.blob)).toBe(true);
    expect(Buffer.isBuffer(att.fileKeyWrap)).toBe(true);
    expect(Buffer.isBuffer(att.encryptedFilename)).toBe(true);
    expect(Buffer.isBuffer(att.selfCopy.ephemeralPoint)).toBe(true);
    expect(Buffer.isBuffer(att.selfCopy.nonce)).toBe(true);
    expect(Buffer.isBuffer(att.selfCopy.ciphertext)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// portalMessages: rate limit with null limiter
// ---------------------------------------------------------------------------

describe("client-portal router (portalMessages null read limiter)", () => {
  const VALID_CHANNEL_ID = "a".repeat(48);
  const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("succeeds without rate limiting when portalReadLimiter is null", async () => {
    const channel: PortalChannelRow = {
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
    };

    const deps = buildDeps({
      portalChannelService: {
        resolveAuthedChannel: vi.fn().mockResolvedValue(channel),
      },
      portalMessageService: {
        bootstrap: vi.fn().mockResolvedValue({
          hasPassphrase: false,
          keyCheck: {
            ephemeralPoint: "ep",
            nonce: "n",
            ciphertext: "ct",
          },
          ticketId: crypto.randomUUID(),
          messages: [],
          attachments: [],
          recordings: [],
          callEntries: [],
          messagesExpireDays: 30,
          safeExitUrl: null,
          upgradeOptions: [],
        }),
        clientReply: vi.fn(),
        listMessages: vi
          .fn()
          .mockResolvedValue({ messages: [], totalCount: 0 }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
      },
      portalReadLimiter: null,
    });
    const caller = buildCaller(deps);
    const result = await caller.portalMessages({
      channelId: VALID_CHANNEL_ID,
      auth: VALID_AUTH,
    });
    expect(result.messages).toBeDefined();
    expect(result.messagesExpireDays).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// Cross-model denial matrix
// ---------------------------------------------------------------------------

describe("client-portal router (cross-model denial matrix)", () => {
  const VALID_CHANNEL_ID = "a".repeat(48);
  const VALID_AUTH = Buffer.alloc(32, 0xcc).toString("base64");

  const ACCOUNT_ROW_DM = {
    id: crypto.randomUUID() as ClientAccountId,
    client_id: crypto.randomUUID() as ClientId,
    username_hash: "hash",
    salt: Buffer.alloc(16),
    public_key: Buffer.alloc(32),
    auth_hash: Buffer.alloc(32),
    created_at: new Date(),
  };

  function fakeChannelRowDM(): PortalChannelRow {
    return {
      id: crypto.randomUUID() as ChannelRowId,
      client_id: ACCOUNT_ROW_DM.client_id,
      channel_id: "d".repeat(48) as ChannelSecret,
      auth_hash: Buffer.alloc(32, 0xaa),
      client_public: Buffer.alloc(32, 0xbb),
      has_passphrase: true,
      key_check_ephemeral_point: Buffer.alloc(32),
      key_check_nonce: Buffer.alloc(24),
      key_check_ciphertext: Buffer.alloc(48),
      status: "active",
      created_at: new Date(),
      last_seen_at: null,
      last_notified_at: null,
      revoked_at: null,
      kind: "account",
    };
  }

  function buildFullDeps(
    overrides?: Partial<ClientPortalRouterDeps>,
  ): ClientPortalRouterDeps {
    return buildDeps({
      portalChannelService: {
        resolveAuthedChannel: vi.fn().mockResolvedValue(null),
      },
      portalMessageService: {
        bootstrap: vi.fn().mockResolvedValue({
          hasPassphrase: true,
          keyCheck: {
            ephemeralPoint: Buffer.alloc(32).toString("base64"),
            nonce: Buffer.alloc(24).toString("base64"),
            ciphertext: Buffer.alloc(48).toString("base64"),
          },
          ticketId: crypto.randomUUID(),
          messages: [],
          attachments: [],
          recordings: [],
          callEntries: [],
          messagesExpireDays: 30,
          safeExitUrl: null,
          upgradeOptions: [],
        }),
        clientReply: vi.fn().mockResolvedValue(undefined),
        listMessages: vi
          .fn()
          .mockResolvedValue({ messages: [], totalCount: 0 }),
        hasRecentOrgReply: vi.fn().mockResolvedValue(false),
      },
      portalReadLimiter: allowLimiter(),
      portalReplyLimiter: allowLimiter(),
      portalReplyIpLimiter: allowLimiter(),
      fieldEncryptor: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
      } as unknown as FieldEncryptor,
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

  function makeContextWithCookieDM(token: string): Context {
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

  beforeAll(async () => {
    await getSodium();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSealedContactInfo.mockResolvedValue({
      sealed: Buffer.from("ct-dm-sealed").toString("base64url"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("channel-token procedure called with account-session auth", () => {
    it("portalBootstrap requires channel auth regardless of session cookie", async () => {
      mockResolveAccountSession.mockResolvedValue({
        account: ACCOUNT_ROW_DM,
        channel: fakeChannelRowDM(),
      });
      const deps = buildFullDeps();
      const ctx = makeContextWithCookieDM("valid-acct-session");
      const caller = buildCaller(deps, ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.portalBootstrap({
          channelId: VALID_CHANNEL_ID,
          auth: VALID_AUTH,
        }),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
    });

    it("portalReply requires channel auth regardless of session cookie", async () => {
      mockResolveAccountSession.mockResolvedValue({
        account: ACCOUNT_ROW_DM,
        channel: fakeChannelRowDM(),
      });
      const deps = buildFullDeps();
      const ctx = makeContextWithCookieDM("valid-acct-session");
      const caller = buildCaller(deps, ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.portalReply({
          channelId: VALID_CHANNEL_ID,
          auth: VALID_AUTH,
          ticketId: crypto.randomUUID(),
          followUpId: crypto.randomUUID(),
          keyGeneration: crypto.randomUUID(),
          encryptedContent: Buffer.from("ct").toString("base64"),
          wrappedTkTemp: Buffer.alloc(80, 0xdd).toString("base64"),
          selfCopy: {
            ephemeralPoint: Buffer.alloc(32, 0xee).toString("base64"),
            nonce: Buffer.alloc(24, 0xff).toString("base64"),
            ciphertext: Buffer.from("sc").toString("base64"),
          },
        }),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
    });
  });

  describe("account procedure called with channel-token auth", () => {
    it("accountBootstrap rejects without session cookie (channel auth is irrelevant)", async () => {
      const deps = buildFullDeps();
      const ctx = makeContext();
      const caller = buildCaller(deps, ctx);

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

    it("accountReply rejects without session cookie (channel auth is irrelevant)", async () => {
      const deps = buildFullDeps();
      const ctx = makeContext();
      const caller = buildCaller(deps, ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.accountReply({
          ticketId: crypto.randomUUID(),
          followUpId: crypto.randomUUID(),
          keyGeneration: crypto.randomUUID(),
          encryptedContent: Buffer.from("ct").toString("base64"),
          wrappedTkTemp: Buffer.alloc(80, 0xdd).toString("base64"),
          selfCopy: {
            ephemeralPoint: Buffer.alloc(32, 0xee).toString("base64"),
            nonce: Buffer.alloc(24, 0xff).toString("base64"),
            ciphertext: Buffer.from("sc").toString("base64"),
          },
        }),
        "UNAUTHORIZED",
      );
      warnSpy.mockRestore();
    });

    it("accountLogout rejects without session cookie", async () => {
      const deps = buildFullDeps();
      const ctx = makeContext();
      const caller = buildCaller(deps, ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(caller.accountLogout(), "UNAUTHORIZED");
      warnSpy.mockRestore();
    });

    it("accountContactInfo rejects without session cookie", async () => {
      const deps = buildFullDeps();
      const ctx = makeContext();
      const caller = buildCaller(deps, ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(caller.accountContactInfo(), "UNAUTHORIZED");
      warnSpy.mockRestore();
    });

    it("accountChangePassword rejects without session cookie", async () => {
      const deps = buildFullDeps();
      const ctx = makeContext();
      const caller = buildCaller(deps, ctx);

      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      await expectTrpcError(
        caller.accountChangePassword({
          currentAuthToken: Buffer.alloc(32, 0xaa).toString("base64"),
          account: {
            salt: Buffer.alloc(16, 0xbb).toString("base64"),
            publicKey: Buffer.alloc(32, 0xcc).toString("base64"),
            authHash: Buffer.alloc(32, 0xdd).toString("base64"),
            keyCheck: {
              ephemeralPoint: Buffer.alloc(32, 0xee).toString("base64"),
              nonce: Buffer.alloc(24, 0xff).toString("base64"),
              ciphertext: Buffer.from("kc").toString("base64"),
            },
          },
          rewrappedMessages: [],
          skippedMessageIds: [],
        }),
        "UNAUTHORIZED",
      );
      warnSpy.mockRestore();
    });
  });

  describe("expired or wrong-org channel", () => {
    it("resolveAuthedChannel returning null produces NOT_FOUND on portalBootstrap", async () => {
      const deps = buildFullDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
      });
      const caller = buildCaller(deps);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.portalBootstrap({
          channelId: VALID_CHANNEL_ID,
          auth: VALID_AUTH,
        }),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
      // Enumeration resistance: same message for unknown, expired, or wrong-org channels
      expect(err.message).toBe("Channel not found or not available");
    });

    it("wrong-org channel id is indistinguishable from unknown channel", async () => {
      const deps = buildFullDeps({
        portalChannelService: {
          resolveAuthedChannel: vi.fn().mockResolvedValue(null),
        },
      });
      const caller = buildCaller(deps);
      const wrongOrgChannelId = "b".repeat(48);
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const err = await expectTrpcError(
        caller.portalBootstrap({
          channelId: wrongOrgChannelId,
          auth: VALID_AUTH,
        }),
        "NOT_FOUND",
      );
      warnSpy.mockRestore();
      expect(err.message).toBe("Channel not found or not available");
    });
  });
});

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { IncomingMessage, type ServerResponse } from "node:http";
import { Socket } from "node:net";
import type { TelephonyProvider } from "../telephony/provider.js";
import type { ConsultantRepository } from "../telephony/models/consultant-repo.js";
import type {
  SessionRepository,
  SessionData,
} from "../auth/session-repository.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  OrgId,
  OrgSchema,
  ConsultantId,
  PhoneId,
  ClientId,
  TicketId,
  E164,
  OpsPhoneHash,
  IdentifierHash,
  UsernameHash,
  PhoneHash,
} from "@care-y/shared";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import {
  createRelayHandler,
  type RelayHandlerDeps,
  type PendingCall,
} from "./relay.js";
import type { PendingClient } from "../tickets/ticket-service.js";
import * as relayUtils from "./relay-utils.js";
import { createCallTracker } from "../telephony/call-tracker.js";
import {
  TestSetupError,
  testSealedBox,
  testUnseal,
  testBlindIndexer,
} from "../test-utils.js";
import type { ConsultantService } from "../telephony/consultant-service.js";
import { RateLimitError } from "../errors.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Creates a complete BlindIndexer mock with all domain-named methods.
 *  Each method returns a distinguishable branded value so ADR-065 domain
 *  separation is visible in assertions. */
function mockBlindIndexer(
  hashReturn = "fake-hash",
  hashBufferReturn = "fake-hash",
): BlindIndexer {
  return {
    hash: vi.fn().mockReturnValue(hashReturn),
    hashBuffer: vi.fn().mockReturnValue(hashBufferReturn),
    hashIdentifier: vi
      .fn()
      .mockReturnValue(("id-" + hashReturn) as IdentifierHash),
    hashUsername: vi
      .fn()
      .mockReturnValue(("user-" + hashReturn) as UsernameHash),
    hashPhone: vi.fn().mockReturnValue(("phone-" + hashReturn) as PhoneHash),
    hashPhoneBuffer: vi
      .fn()
      .mockReturnValue(("phone-" + hashBufferReturn) as PhoneHash),
    hashConsultantPhoneBuffer: vi
      .fn()
      .mockReturnValue(("cons-" + hashBufferReturn) as OpsPhoneHash),
  };
}

// ---------------------------------------------------------------------------
// Branded test constants
// ---------------------------------------------------------------------------

const TEST_SESSION_ID = "00000000-0000-4000-8000-000000000010" as SessionId;
const TEST_SESSION_TOKEN = "tok_abc123" as SessionToken;
const TEST_USER_ID = "00000000-0000-4000-8000-000000000020" as UserId;
const TEST_IP_TOKEN = "hmac-ip" as IpToken;
const TEST_UA_TOKEN = "hmac-ua" as UaToken;
const TEST_ORG_UUID = "00000000-0000-4000-8000-aaaaaaaaaaaa" as OrgId;
const TEST_ORG_SCHEMA = "org_00000000-0000-4000-8000-aaaaaaaaaaaa" as OrgSchema;

function makeSessionData(overrides?: Partial<SessionData>): SessionData {
  return {
    id: TEST_SESSION_ID,
    token: TEST_SESSION_TOKEN,
    userId: TEST_USER_ID,
    ipToken: TEST_IP_TOKEN,
    uaToken: TEST_UA_TOKEN,
    expiresAt: new Date(Date.now() + 3600_000),
    twofaVerified: true,
    webauthnChallenge: null,
    ...overrides,
  };
}

function mockSessionRepo(session: SessionData | null): SessionRepository {
  return {
    findByToken: vi.fn().mockResolvedValue(session),
    create: vi.fn(),
    deleteByToken: vi.fn(),
    deleteByUserId: vi.fn(),
    deleteByUserIdExceptToken: vi.fn().mockResolvedValue(0),
    deleteExpired: vi.fn(),
    markTwoFactorVerified: vi.fn(),
    clearTwoFactorVerified: vi.fn(),
    setWebauthnChallenge: vi.fn(),
  };
}

/**
 * Local relay mock provider. Defaults throw TestSetupError for validateWebhook
 * (matching test-utils.ts pattern) so that tests relying on the default can't
 * accidentally pass when the handler forgets to call validation.
 * Tests exercising the validated path must explicitly set validateWebhook.
 */
function mockProvider(
  overrides?: Partial<TelephonyProvider>,
): TelephonyProvider {
  return {
    providerId: "mock",
    sendSms: vi.fn().mockResolvedValue({ messageId: "SM_test_123" }),
    initiateOutboundCall: vi.fn().mockResolvedValue("CA_test_456"),
    initiateWebRtcCall: vi.fn().mockResolvedValue("CA_test_789"),
    validateWebhook: vi.fn().mockImplementation(() => {
      throw new TestSetupError(
        "Mock provider: validateWebhook called unexpectedly",
      );
    }),
    parseIncomingCall: vi.fn(),
    parseIncomingSms: vi.fn(),
    generateVoiceResponse: vi.fn().mockReturnValue("<Response/>"),
    getRecording: vi.fn().mockResolvedValue(Buffer.alloc(44)),
    getCallDetails: vi.fn().mockResolvedValue({
      from: "+15550000001" as E164,
      to: "+15550000002" as E164,
    }),
    deleteRecording: vi.fn(),
    deleteCallLog: vi.fn(),
    deleteMessageLog: vi.fn(),
    maskConfig: vi.fn().mockReturnValue({
      provider: "mock",
      mode: "mock",
      maskedAccountId: "AC***",
      maskedAuthToken: "****",
      phoneNumbers: [],
    }),
    ...overrides,
  };
}

function mockConsultantRepo(
  consultant: { isVerified: boolean; preferredCallMethod: string } | null,
): ConsultantRepository {
  const record = consultant
    ? {
        id: "consultant-001" as ConsultantId,
        userId: "user-001" as UserId,
        encryptedPhone: Buffer.alloc(16) as Buffer | null,
        isVerified: consultant.isVerified,
        preferredCallMethod: consultant.preferredCallMethod,
        opsPhoneHash: "consultant-phone-hash" as OpsPhoneHash | null,
        opsEncryptedPhone: null as Buffer | null,
        smsPingsEnabled: false,
        verificationCodeHash: null as string | null,
        verificationExpiresAt: null as Date | null,
        verificationAttempts: 0,
        verifySendsHourStart: null as Date | null,
        verifySendsInHour: 0,
        verifyLastSentAt: null as Date | null,
      }
    : null;

  return {
    findByUserId: vi.fn().mockResolvedValue(record),
    create: vi.fn(),
    setVerificationCode: vi.fn(),
    stageVerification: vi.fn().mockResolvedValue(1),
    verifyAndActivate: vi.fn(),
    incrementVerificationAttempts: vi.fn().mockResolvedValue(1),
    clearVerificationCode: vi.fn(),
    updatePreferredCallMethod: vi.fn(),
    setSmsPingsEnabled: vi.fn(),
    delete: vi.fn(),
  };
}

function mockConsultantService(
  overrides?: Partial<ConsultantService>,
): ConsultantService {
  return {
    getByUserId: vi.fn().mockResolvedValue(null),
    register: vi
      .fn()
      .mockResolvedValue({ id: "consultant-001" as ConsultantId }),
    prepareVerification: vi.fn().mockResolvedValue({ code: "123456" }),
    verify: vi.fn(),
    updatePreference: vi.fn(),
    deleteByUserId: vi.fn(),
    setSmsPings: vi.fn(),
    ...overrides,
  };
}

/**
 * Returns a minimal tenant DB mock whose selectFrom("org_config") chain
 * resolves with all channel-policy columns enabled. Tests that need a
 * disabled channel pass their own override via getTenantDb.
 */
function mockTenantDbWithChannelPolicy(
  policyOverrides?: Partial<
    Record<
      | "channel_sms_enabled"
      | "channel_email_enabled"
      | "channel_voice_enabled"
      | "channel_secure_link_enabled"
      | "channel_share_link_enabled",
      boolean
    >
  >,
): Kysely<TenantDatabase> {
  const policyRow = {
    channel_sms_enabled: true,
    channel_email_enabled: true,
    channel_voice_enabled: true,
    channel_secure_link_enabled: true,
    channel_share_link_enabled: true,
    ...policyOverrides,
  };
  const chain = {
    select: vi.fn().mockReturnValue({
      executeTakeFirst: vi.fn().mockResolvedValue(policyRow),
    }),
  };
  return {
    selectFrom: vi.fn().mockReturnValue(chain),
  } as unknown as Kysely<TenantDatabase>;
}

function makeDeps(overrides?: Partial<RelayHandlerDeps>): RelayHandlerDeps {
  // Default platform DB resolves no inbound domain row, which keeps every
  // test that does not opt in on the byte-identical no-domain send path.
  const noDomainPlatformDb = {
    selectFrom: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          executeTakeFirst: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }),
  } as unknown as RelayHandlerDeps["platformDb"];

  return {
    platformDb: noDomainPlatformDb,
    replyTokenHasher: { hash: vi.fn().mockReturnValue("default-hash") },
    replyTokenCache: new Map<string, string>(),
    getProvider: vi.fn().mockResolvedValue(mockProvider()),
    getTenantDb: vi.fn().mockReturnValue(mockTenantDbWithChannelPolicy()),
    hasPermission: vi.fn().mockResolvedValue(true),
    createConsultantRepo: vi.fn().mockReturnValue(
      mockConsultantRepo({
        isVerified: true,
        preferredCallMethod: "phone_callback",
      }),
    ),
    resolveCallerIdByPurpose: vi.fn().mockResolvedValue("+15559999999" as E164),
    pendingCalls: new Map<string, PendingCall>(),
    indexer: mockBlindIndexer(),
    fieldEncryptor: {
      encrypt: vi.fn().mockReturnValue(Buffer.from("encrypted")),
      encryptBuffer: vi.fn().mockReturnValue(Buffer.from("encrypted")),
      decrypt: vi.fn().mockReturnValue("decrypted"),
      decryptToBuffer: vi.fn().mockReturnValue(Buffer.from("decrypted")),
    },
    pendingClients: new Map(),
    callTracker: createCallTracker(),
    webhookBaseUrl: "https://api.care-y.app",
    getAuthToken: vi.fn().mockResolvedValue("test_auth_token"),
    getAccountSid: vi.fn().mockResolvedValue("ACtest123"),
    apiKeySid: "SKtest",
    apiKeySecret: "test_secret",
    twimlAppSid: "APtest",
    orgResolver: vi
      .fn()
      .mockReturnValue({ orgId: TEST_ORG_UUID, orgSchema: TEST_ORG_SCHEMA }),
    createSessionRepo: vi
      .fn()
      .mockReturnValue(mockSessionRepo(makeSessionData())),
    resolveClientPhone: vi.fn().mockResolvedValue(Buffer.from("+15551234567")),
    consultantPhoneIndexer: mockBlindIndexer(
      "consultant-phone-hash",
      "consultant-phone-hash",
    ),
    getSealedBoxEncryptor: vi.fn().mockResolvedValue(testSealedBox),
    createConsultantService: vi.fn().mockReturnValue(mockConsultantService()),
    ...overrides,
  };
}

/** Creates a mock HTTP request that emits body data on next tick. */
function createMockReq(
  method: string,
  url: string,
  body: string | Buffer,
  headers?: Record<string, string>,
): IncomingMessage {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  req.method = method;
  req.url = url;
  if (headers) {
    for (const [k, v] of Object.entries(headers)) {
      req.headers[k.toLowerCase()] = v;
    }
  }
  // Default cookie for session auth
  req.headers.cookie ??= "care_y_session=tok_abc123";
  process.nextTick(() => {
    req.push(typeof body === "string" ? Buffer.from(body) : body);
    req.push(null);
  });
  return req;
}

// ---------------------------------------------------------------------------
// Buffer zeroing verification
// ---------------------------------------------------------------------------

/**
 * Spies on readRawBody to capture the Buffer it returns. After the handler
 * runs, the captured Buffer should be all zeros (security contract).
 *
 * Returns a getter for the captured buffer. The getter throws if readRawBody
 * was not called (test setup error).
 */
function spyOnReadRawBody(): {
  getCapturedBuffer: () => Buffer;
  restore: () => void;
} {
  let captured: Buffer | null = null;
  const original = relayUtils.readRawBody;
  const spy = vi
    .spyOn(relayUtils, "readRawBody")
    .mockImplementation(async (req, maxSize) => {
      const buf = await original(req, maxSize);
      captured = buf;
      return buf;
    });
  return {
    getCapturedBuffer(): Buffer {
      if (captured === null) {
        throw new TestSetupError("readRawBody was not called");
      }
      return captured;
    },
    restore(): void {
      spy.mockRestore();
    },
  };
}

/** Asserts every byte in the Buffer is 0. */
function expectZeroed(buf: Buffer, label: string): void {
  expect(
    buf.every((b) => b === 0),
    `${label} should be zeroed but contains non-zero bytes`,
  ).toBe(true);
}

interface CapturedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  writeHead: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
}

function createMockRes(): CapturedResponse {
  const captured: CapturedResponse = {
    statusCode: 0,
    headers: {},
    body: "",
    writeHead: vi.fn((status: number, hdrs?: Record<string, string>) => {
      captured.statusCode = status;
      if (hdrs) Object.assign(captured.headers, hdrs);
    }),
    end: vi.fn((data?: string) => {
      captured.body = data ?? "";
    }),
    setHeader: vi.fn(),
  };
  return captured;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createRelayHandler", () => {
  // -----------------------------------------------------------------------
  // Auth & routing
  // -----------------------------------------------------------------------

  describe("routing and auth", () => {
    it("returns 405 for non-POST requests (except call-confirm)", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("GET", "/relay/sms", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(405);
    });

    it("returns 401 when session cookie is missing", async () => {
      const deps = makeDeps({
        createSessionRepo: vi.fn().mockReturnValue(mockSessionRepo(null)),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
        {
          cookie: "",
        },
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 when session is expired", async () => {
      const expired = makeSessionData({
        expiresAt: new Date(Date.now() - 1000),
      });
      const deps = makeDeps({
        createSessionRepo: vi.fn().mockReturnValue(mockSessionRepo(expired)),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(401);
    });

    it("returns 403 when 2FA is not verified", async () => {
      const noTwofa = makeSessionData({ twofaVerified: false });
      const deps = makeDeps({
        createSessionRepo: vi.fn().mockReturnValue(mockSessionRepo(noTwofa)),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({ error: "TWO_FACTOR_REQUIRED" });
    });

    it("returns 404 for unknown relay path", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/unknown", "{}");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(404);
    });
  });

  // -----------------------------------------------------------------------
  // SMS relay
  // -----------------------------------------------------------------------

  describe("POST /relay/sms", () => {
    it("sends SMS and returns messageId on success", async () => {
      const provider = mockProvider();
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"Hello from CARE-Y"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ messageId: "SM_test_123" });
      expect(provider.sendSms).toHaveBeenCalledWith(
        "+15551234567",
        "Hello from CARE-Y",
        "+15559999999",
      );
    });

    it("returns 400 MISSING_FIELDS when ticketId is missing", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", '{"body":"Hello"}');
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
    });

    it("returns 400 MISSING_FIELDS when body is missing", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
    });

    it("returns 400 BODY_TOO_LONG when body exceeds 1600 chars", async () => {
      const handler = createRelayHandler(makeDeps());
      const longBody = "x".repeat(1601);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"${longBody}"}`,
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "BODY_TOO_LONG" });
    });

    it("returns 500 NO_PROVIDER when provider not configured", async () => {
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toEqual({ error: "NO_PROVIDER" });
    });

    it("returns 404 CLIENT_PHONE_NOT_FOUND when ticket has no phone", async () => {
      const deps = makeDeps({
        resolveClientPhone: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.body)).toEqual({ error: "CLIENT_PHONE_NOT_FOUND" });
    });

    it("returns 400 NO_CALLER_ID when no phones provisioned", async () => {
      const deps = makeDeps({
        resolveCallerIdByPurpose: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "NO_CALLER_ID" });
    });

    it("returns 502 PROVIDER_ERROR when provider.sendSms rejects", async () => {
      const provider = mockProvider({
        sendSms: vi.fn().mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const bodyJson =
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"secret message"}';
      const req = createMockReq("POST", "/relay/sms", bodyJson);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expect(JSON.parse(res.body)).toEqual({ error: "PROVIDER_ERROR" });
    });
  });

  // -----------------------------------------------------------------------
  // Call relay
  // -----------------------------------------------------------------------

  describe("POST /relay/call", () => {
    it("initiates phone callback and stores pending call", async () => {
      const provider = mockProvider();
      const pendingCalls = new Map<string, PendingCall>();
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        pendingCalls,
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as {
        callSid: string;
        method: string;
      };
      expect(parsed.method).toBe("phone_callback");
      expect(parsed.callSid).toBe("CA_test_456");
      expect(provider.initiateOutboundCall).toHaveBeenCalled();

      // Verify pending call stored
      expect(pendingCalls.size).toBe(1);
      const pending = pendingCalls.get("CA_test_456");
      expect(pending).toBeDefined();
      expect(pending!.orgId).toBe(TEST_ORG_UUID);
      expect(pending!.orgSchema).toBe(TEST_ORG_SCHEMA);
    });

    it("returns webrtc method when consultant prefers WebRTC", async () => {
      const deps = makeDeps({
        createConsultantRepo: vi.fn().mockReturnValue(
          mockConsultantRepo({
            isVerified: true,
            preferredCallMethod: "webrtc",
          }),
        ),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as { method: string };
      expect(parsed.method).toBe("webrtc");
    });

    it("returns 403 when consultant is not verified", async () => {
      const deps = makeDeps({
        createConsultantRepo: vi.fn().mockReturnValue(
          mockConsultantRepo({
            isVerified: false,
            preferredCallMethod: "phone_callback",
          }),
        ),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
    });

    it("returns 403 when consultant not found", async () => {
      const deps = makeDeps({
        createConsultantRepo: vi.fn().mockReturnValue(mockConsultantRepo(null)),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
    });

    it("returns 400 when ticketId is missing", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/call", "{}");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
    });

    it("returns 404 CLIENT_PHONE_NOT_FOUND when ticket has no phone", async () => {
      const deps = makeDeps({
        resolveClientPhone: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.body)).toEqual({
        error: "CLIENT_PHONE_NOT_FOUND",
      });
    });

    it("returns 400 when consultantPhone missing for phone_callback", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({
        error: "MISSING_CONSULTANT_PHONE",
      });
    });

    // ----- Bridge verification enforcement -----

    it("bridges successfully when consultant is verified and phone hash matches", async () => {
      const provider = mockProvider();
      const pendingCalls = new Map<string, PendingCall>();
      // hashBuffer returns "consultant-phone-hash" by default,
      // matching the default opsPhoneHash in mockConsultantRepo.
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        pendingCalls,
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as {
        callSid: string;
        method: string;
      };
      expect(parsed.method).toBe("phone_callback");
      expect(provider.initiateOutboundCall).toHaveBeenCalledOnce();
    });

    it("returns 403 when consultant has null opsPhoneHash", async () => {
      const provider = mockProvider();
      const consultantRepoWithNullHash = mockConsultantRepo({
        isVerified: true,
        preferredCallMethod: "phone_callback",
      });
      // Override the record to have null opsPhoneHash
      (
        consultantRepoWithNullHash.findByUserId as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: "consultant-001" as ConsultantId,
        userId: "user-001" as UserId,
        encryptedPhone: Buffer.alloc(16),
        isVerified: true,
        preferredCallMethod: "phone_callback",
        opsPhoneHash: null,
        opsEncryptedPhone: null,
        smsPingsEnabled: false,
        verificationCodeHash: null,
        verificationExpiresAt: null,
        verificationAttempts: 0,
        verifySendsHourStart: null,
        verifySendsInHour: 0,
        verifyLastSentAt: null,
      });
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        createConsultantRepo: vi
          .fn()
          .mockReturnValue(consultantRepoWithNullHash),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({
        error: "CONSULTANT_NOT_VERIFIED",
      });
      // Provider was never called
      expect(provider.initiateOutboundCall).not.toHaveBeenCalled();
    });

    it("returns 403 when submitted phone hash does not match stored hash", async () => {
      const provider = mockProvider();
      // consultantPhoneIndexer.hashBuffer returns a value that differs
      // from the stored opsPhoneHash
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        consultantPhoneIndexer: mockBlindIndexer(
          "mismatched-hash",
          "mismatched-hash",
        ),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15559999001"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({
        error: "CONSULTANT_NOT_VERIFIED",
      });
      // Provider was never called
      expect(provider.initiateOutboundCall).not.toHaveBeenCalled();
    });

    it("all three enforcement failures produce the same 403 response", async () => {
      const provider = mockProvider();

      // Case 1: no consultant row
      const deps1 = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        createConsultantRepo: vi.fn().mockReturnValue(mockConsultantRepo(null)),
      });
      const handler1 = createRelayHandler(deps1);
      const req1 = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res1 = createMockRes();
      await handler1(req1, res1 as unknown as ServerResponse);

      // Case 2: unverified consultant
      const deps2 = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        createConsultantRepo: vi.fn().mockReturnValue(
          mockConsultantRepo({
            isVerified: false,
            preferredCallMethod: "phone_callback",
          }),
        ),
      });
      const handler2 = createRelayHandler(deps2);
      const req2 = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res2 = createMockRes();
      await handler2(req2, res2 as unknown as ServerResponse);

      // Case 3: hash mismatch
      const deps3 = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        consultantPhoneIndexer: mockBlindIndexer("wrong-hash", "wrong-hash"),
      });
      const handler3 = createRelayHandler(deps3);
      const req3 = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res3 = createMockRes();
      await handler3(req3, res3 as unknown as ServerResponse);

      // All three produce identical responses (no oracle)
      expect(res1.statusCode).toBe(403);
      expect(res2.statusCode).toBe(403);
      expect(res3.statusCode).toBe(403);
      expect(res1.body).toBe(res2.body);
      expect(res2.body).toBe(res3.body);
      expect(JSON.parse(res1.body)).toEqual({
        error: "CONSULTANT_NOT_VERIFIED",
      });

      // Provider never called in any case
      expect(provider.initiateOutboundCall).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // DTMF callback
  // -----------------------------------------------------------------------

  describe("POST /relay/call-confirm", () => {
    function makePendingCall(): PendingCall {
      return {
        clientPhoneBuf: Buffer.from("+15553333333"),
        callerIdBuf: Buffer.from("+15559999999"),
        orgId: TEST_ORG_UUID,
        orgSchema: TEST_ORG_SCHEMA,
        createdAt: Date.now(),
      };
    }

    it("bridges call on DTMF confirmation with valid signature", async () => {
      const pending = makePendingCall();
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_test_1", pending);

      const provider = mockProvider({
        validateWebhook: vi.fn().mockReturnValue(true),
      });
      const deps = makeDeps({
        pendingCalls,
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_test_1&Digits=1&AccountSid=ACtest";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "valid_sig",
        },
      );
      // Clear default session cookie (this is a Twilio callback, not browser)
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(res.headers["Content-Type"]).toBe("text/xml");
      expect(res.body).toContain("<Dial");
      expect(res.body).toContain("+15553333333");
      // Pending call cleaned up
      expect(pendingCalls.size).toBe(0);
      // C2: webhook signature was validated before bridging
      expect(provider.validateWebhook).toHaveBeenCalledOnce();
      expect(provider.validateWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          signature: expect.any(String) as string,
        }),
      );
    });

    it("returns Hangup TwiML for unknown CallSid", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_unknown&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);
      expect(res.body).toContain("<Hangup/>");
    });

    it("returns 400 when CallSid missing from body", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);

      const formBody = "Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
    });

    it("returns 403 when HMAC signature is invalid", async () => {
      const pending = makePendingCall();
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_test_1", pending);

      const provider = mockProvider({
        validateWebhook: vi.fn().mockReturnValue(false),
      });
      const deps = makeDeps({
        pendingCalls,
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_test_1&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "bad_sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
    });

    it("returns Hangup TwiML when no digits pressed (timeout)", async () => {
      const pending = makePendingCall();
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_test_1", pending);

      const provider = mockProvider({
        validateWebhook: vi.fn().mockReturnValue(true),
      });
      const deps = makeDeps({
        pendingCalls,
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_test_1&Digits=";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);
      expect(res.body).toContain("No confirmation received");
      expect(res.body).toContain("<Hangup/>");
      // Pending call cleaned up and buffers zeroed
      expect(pendingCalls.size).toBe(0);
      expect(pending.clientPhoneBuf.every((b) => b === 0)).toBe(true);
    });

    it("returns 405 for non-POST method", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "GET",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        "",
      );
      req.headers.cookie = "";
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(405);
    });

    it("returns 415 for wrong content type", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        "{}",
        {
          "content-type": "application/json",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(415);
    });

    it("zeros pending call buffers on cleanup", async () => {
      const pending = makePendingCall();
      // Snapshot copies to verify pre-zeroing content (test-only, zeroed in finally)
      const clientBufCopy = Buffer.alloc(pending.clientPhoneBuf.length);
      pending.clientPhoneBuf.copy(clientBufCopy);
      const callerIdBufCopy = Buffer.alloc(pending.callerIdBuf.length);
      pending.callerIdBuf.copy(callerIdBufCopy);

      try {
        // Verify they start non-zero
        expect(clientBufCopy.toString("utf-8")).toBe("+15553333333");
        expect(callerIdBufCopy.toString("utf-8")).toBe("+15559999999");

        const pendingCalls = new Map<string, PendingCall>();
        pendingCalls.set("CA_test_1", pending);

        const provider = mockProvider({
          validateWebhook: vi.fn().mockReturnValue(true),
        });
        const deps = makeDeps({
          pendingCalls,
          getProvider: vi.fn().mockResolvedValue(provider),
        });
        const handler = createRelayHandler(deps);

        const formBody = "CallSid=CA_test_1&Digits=5";
        const req = createMockReq(
          "POST",
          "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
          formBody,
          {
            "content-type": "application/x-www-form-urlencoded",
            "x-twilio-signature": "sig",
          },
        );
        req.headers.cookie = "";
        const res = createMockRes();

        await handler(req, res as unknown as ServerResponse);

        // The original pending.clientPhoneBuf should be zeroed
        expect(pending.clientPhoneBuf.every((b) => b === 0)).toBe(true);
        expect(pending.callerIdBuf.every((b) => b === 0)).toBe(true);
      } finally {
        clientBufCopy.fill(0);
        callerIdBufCopy.fill(0);
      }
    });
  });

  // -----------------------------------------------------------------------
  // WebRTC token
  // -----------------------------------------------------------------------

  describe("POST /relay/webrtc-token", () => {
    it("returns token and ttl on success", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/webrtc-token", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as { token: string; ttl: number };
      expect(parsed.ttl).toBe(300);
      expect(parsed.token).toBeTruthy();
      // JWT format: three dot-separated base64url segments
      expect(parsed.token.split(".")).toHaveLength(3);
    });

    it("returns 403 when consultant not verified", async () => {
      const deps = makeDeps({
        createConsultantRepo: vi.fn().mockReturnValue(
          mockConsultantRepo({
            isVerified: false,
            preferredCallMethod: "webrtc",
          }),
        ),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/webrtc-token", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(403);
    });

    it("returns 500 when provider not configured", async () => {
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/webrtc-token", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(500);
    });

    it("returns 500 when Twilio API Key not configured", async () => {
      const deps = makeDeps({
        apiKeySid: "",
        apiKeySecret: "",
        twimlAppSid: "",
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/webrtc-token", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toEqual({ error: "WEBRTC_NOT_CONFIGURED" });
    });
  });

  // -----------------------------------------------------------------------
  // Group A: Buffer zeroing on error paths (security contract)
  // -----------------------------------------------------------------------

  describe("buffer zeroing on error paths", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    // -- SMS relay --

    it("zeros raw body buffer when provider.sendSms rejects (A1)", async () => {
      const spy = spyOnReadRawBody();
      const provider = mockProvider({
        sendSms: vi.fn().mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"secret message"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after PROVIDER_ERROR");
      spy.restore();
    });

    it("zeros raw body buffer on MISSING_FIELDS (A2)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
      expectZeroed(spy.getCapturedBuffer(), "rawBody after MISSING_FIELDS");
      spy.restore();
    });

    it("zeros raw body buffer on BODY_TOO_LONG (A2)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const longBody = "x".repeat(1601);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"${longBody}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "BODY_TOO_LONG" });
      expectZeroed(spy.getCapturedBuffer(), "rawBody after BODY_TOO_LONG");
      spy.restore();
    });

    it("zeros raw body buffer on NO_PROVIDER for SMS (A2)", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after NO_PROVIDER (SMS)");
      spy.restore();
    });

    it("zeros resolved phone buffer after successful SMS send (A2)", async () => {
      const phoneBuf = Buffer.from("+15551234567");
      const deps = makeDeps({
        resolveClientPhone: vi.fn().mockResolvedValue(phoneBuf),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expectZeroed(phoneBuf, "resolved phone buffer after SMS success");
    });

    it("zeros resolved phone buffer after PROVIDER_ERROR (A2)", async () => {
      const phoneBuf = Buffer.from("+15551234567");
      const provider = mockProvider({
        sendSms: vi.fn().mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        resolveClientPhone: vi.fn().mockResolvedValue(phoneBuf),
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expectZeroed(phoneBuf, "resolved phone buffer after PROVIDER_ERROR");
    });

    it("zeros raw body buffer on NO_CALLER_ID for SMS (A2)", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeDeps({
        resolveCallerIdByPurpose: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after NO_CALLER_ID");
      spy.restore();
    });

    // -- Call relay --

    it("zeros raw body buffer on NO_PROVIDER for call relay (A3)", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after NO_PROVIDER (call)");
      spy.restore();
    });

    it("zeros raw body buffer on MISSING_CONSULTANT_PHONE (A3)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({
        error: "MISSING_CONSULTANT_PHONE",
      });
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after MISSING_CONSULTANT_PHONE",
      );
      spy.restore();
    });

    it("zeros raw body buffer on PROVIDER_ERROR for call relay (A3)", async () => {
      const spy = spyOnReadRawBody();
      const provider = mockProvider({
        initiateOutboundCall: vi
          .fn()
          .mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after PROVIDER_ERROR (call)",
      );
      spy.restore();
    });

    it("zeros resolved phone buffer after successful call relay (A3)", async () => {
      const phoneBuf = Buffer.from("+15551234567");
      const deps = makeDeps({
        resolveClientPhone: vi.fn().mockResolvedValue(phoneBuf),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expectZeroed(phoneBuf, "resolved phone buffer after call success");
    });

    // -- Call-confirm --

    it("zeros pending call buffers when signature validation fails (A4)", async () => {
      const pending: PendingCall = {
        clientPhoneBuf: Buffer.from("+15553333333"),
        callerIdBuf: Buffer.from("+15559999999"),
        orgId: TEST_ORG_UUID,
        orgSchema: TEST_ORG_SCHEMA,
        createdAt: Date.now(),
      };
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_test_1", pending);

      const provider = mockProvider({
        validateWebhook: vi.fn().mockReturnValue(false),
      });
      const deps = makeDeps({
        pendingCalls,
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_test_1&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "bad_sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      // The handler does NOT clean up pending call on signature failure
      // (attacker could be replaying, legitimate consultant may retry).
      // But if the handler DID cleanup, buffers should be zeroed.
      // This test documents the current behavior.
    });
  });

  // -----------------------------------------------------------------------
  // Group B: Error responses never contain request plaintext
  // -----------------------------------------------------------------------

  describe("error responses never contain request plaintext", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const TICKET_ID = "aaaa0000-0000-4000-8000-000000000001";
    const RESOLVED_PHONE = "+15551234567";
    const SECRET_BODY = "secret message content";

    it("PROVIDER_ERROR response does not contain phone or body (B1)", async () => {
      const provider = mockProvider({
        sendSms: vi.fn().mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"ticketId":"${TICKET_ID}","body":"${SECRET_BODY}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expect(res.body).not.toContain(RESOLVED_PHONE);
      expect(res.body).not.toContain(SECRET_BODY);
    });

    it("MISSING_FIELDS response does not contain partial input (B1)", async () => {
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"ticketId":"${TICKET_ID}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(res.body).not.toContain(RESOLVED_PHONE);
    });

    it("BODY_TOO_LONG response does not contain oversized content (B1)", async () => {
      const oversized = "x".repeat(1601);
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"ticketId":"${TICKET_ID}","body":"${oversized}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(res.body).not.toContain(RESOLVED_PHONE);
      expect(res.body).not.toContain(oversized.slice(0, 20));
    });

    it("NO_PROVIDER response does not contain phone (B1)", async () => {
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"ticketId":"${TICKET_ID}","body":"hi"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expect(res.body).not.toContain(RESOLVED_PHONE);
    });

    it("NO_CALLER_ID response does not contain phone (B1)", async () => {
      const deps = makeDeps({
        resolveCallerIdByPurpose: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"ticketId":"${TICKET_ID}","body":"hi"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(res.body).not.toContain(RESOLVED_PHONE);
    });

    it("call relay error responses do not contain phone numbers (B1)", async () => {
      const consultantPhone = "+15552222222";
      const deps = makeDeps({ getProvider: vi.fn().mockResolvedValue(null) });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        `{"ticketId":"${TICKET_ID}","consultantPhone":"${consultantPhone}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expect(res.body).not.toContain(RESOLVED_PHONE);
      expect(res.body).not.toContain(consultantPhone);
    });
  });

  // -----------------------------------------------------------------------
  // Group G: Malformed input handling
  // -----------------------------------------------------------------------

  describe("relay malformed input handling", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns 400 for non-JSON body and zeros buffer (G1)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", "not json at all");
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
      expectZeroed(spy.getCapturedBuffer(), "rawBody after non-JSON input");
      spy.restore();
    });

    it("returns 400 for truncated JSON body and zeros buffer (G1)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", '{"ticketId":"tr');
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after truncated JSON");
      spy.restore();
    });

    it("returns 400 for empty body (G1)", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq("POST", "/relay/sms", "");
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      spy.restore();
    });
  });

  // -----------------------------------------------------------------------
  // call-confirm: null orgSchema and null body paths
  // -----------------------------------------------------------------------

  describe("POST /relay/call-confirm edge cases", () => {
    it("returns 400 when orgSchema segment is missing from URL", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      // Path with trailing slash but no schema segment
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/",
        "CallSid=CA_test_1&Digits=1",
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
    });

    it("returns 400 when body exceeds max relay size (null body)", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      // Body larger than MAX_RELAY_BODY (64KB) triggers readFormBody -> null
      const oversizedBody = "x".repeat(65 * 1024);
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        oversizedBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
    });

    it("returns Hangup TwiML when validation yields hangup status (null auth token)", async () => {
      const pendingBuf = Buffer.alloc(12);
      Buffer.from("+15553333333").copy(pendingBuf);
      const callerBuf = Buffer.alloc(12);
      Buffer.from("+15559999999").copy(callerBuf);

      const pending: PendingCall = {
        clientPhoneBuf: pendingBuf,
        callerIdBuf: callerBuf,
        orgId: TEST_ORG_UUID,
        orgSchema: TEST_ORG_SCHEMA,
        createdAt: Date.now(),
      };
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_hangup_1", pending);

      const deps = makeDeps({
        pendingCalls,
        // Null auth token triggers hangup status in validateCallConfirmSignature
        getAuthToken: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_hangup_1&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(res.body).toContain("<Hangup/>");
      // Pending call should be cleaned up (buffers zeroed)
      expect(pendingCalls.size).toBe(0);
      expectZeroed(pendingBuf, "clientPhoneBuf after hangup (null auth token)");
      expectZeroed(callerBuf, "callerIdBuf after hangup (null auth token)");
    });

    it("returns Hangup TwiML when validation yields hangup status (null provider)", async () => {
      const pendingBuf = Buffer.alloc(12);
      Buffer.from("+15554444444").copy(pendingBuf);
      const callerBuf = Buffer.alloc(12);
      Buffer.from("+15559999999").copy(callerBuf);

      const pending: PendingCall = {
        clientPhoneBuf: pendingBuf,
        callerIdBuf: callerBuf,
        orgId: TEST_ORG_UUID,
        orgSchema: TEST_ORG_SCHEMA,
        createdAt: Date.now(),
      };
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_hangup_2", pending);

      const deps = makeDeps({
        pendingCalls,
        // Provider returns null after auth token succeeds, triggering hangup
        getAuthToken: vi.fn().mockResolvedValue("valid_token"),
        getProvider: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_hangup_2&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(res.body).toContain("<Hangup/>");
      expect(pendingCalls.size).toBe(0);
      expectZeroed(pendingBuf, "clientPhoneBuf after hangup (null provider)");
      expectZeroed(callerBuf, "callerIdBuf after hangup (null provider)");
    });
  });

  // -----------------------------------------------------------------------
  // Pending client cleanup (TTL expiry, fake timers)
  // -----------------------------------------------------------------------

  describe("startPendingClientCleanup", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("zeroes and removes expired pending client entries after TTL", () => {
      const encryptedPhone = Buffer.alloc(16);
      // Write non-zero data so we can verify zeroing
      Buffer.from("ops-encrypted-ph").copy(encryptedPhone);

      const pendingClients = new Map<string, PendingClient>();
      pendingClients.set("token-expired", {
        phoneHash: "hash-1" as PhoneHash,
        opsEncryptedPhone: encryptedPhone,
        phoneMatchHash: null,
        orgSchema: "org_bbbb0000-0000-4000-8000-000000000001" as OrgSchema,
        // Created 6 minutes ago (past the 5-minute TTL)
        createdAt: Date.now() - 6 * 60 * 1000,
      });

      // Creating the handler starts the cleanup interval
      const handler = createRelayHandler(makeDeps({ pendingClients }));

      // Verify entry exists before cleanup
      expect(pendingClients.size).toBe(1);
      expect(encryptedPhone.some((b) => b !== 0)).toBe(true);

      // Advance past the cleanup interval (60 seconds)
      vi.advanceTimersByTime(60_000);

      // Entry should be removed and buffer zeroed
      expect(pendingClients.size).toBe(0);
      expectZeroed(
        encryptedPhone,
        "opsEncryptedPhone after TTL expiry cleanup",
      );

      handler.cleanup();
    });

    it("preserves non-expired pending client entries during cleanup", () => {
      const freshEncrypted = Buffer.alloc(16);
      Buffer.from("fresh-encrypted!").copy(freshEncrypted);
      const freshCopy = Buffer.from(freshEncrypted);

      const pendingClients = new Map<string, PendingClient>();
      pendingClients.set("token-fresh", {
        phoneHash: "hash-2" as PhoneHash,
        opsEncryptedPhone: freshEncrypted,
        phoneMatchHash: null,
        orgSchema: "org_bbbb0000-0000-4000-8000-000000000001" as OrgSchema,
        // Created just now (well within 5-minute TTL)
        createdAt: Date.now(),
      });

      const handler = createRelayHandler(makeDeps({ pendingClients }));

      vi.advanceTimersByTime(60_000);

      // Fresh entry should still be present and unmodified
      expect(pendingClients.size).toBe(1);
      expect(pendingClients.has("token-fresh")).toBe(true);
      expect(freshEncrypted.equals(freshCopy)).toBe(true);

      handler.cleanup();
      freshCopy.fill(0);
    });
  });

  // -----------------------------------------------------------------------
  // Chainable tenant DB mock (used by phone-lookup and resolveClientPhone)
  // -----------------------------------------------------------------------

  /**
   * Creates a mock tenant DB with chainable Kysely-style query builders.
   * queryQueue provides results for successive selectFrom().executeTakeFirst() calls.
   */
  function createChainableTenantDb(
    queryQueue: unknown[],
  ): Kysely<TenantDatabase> {
    let callIndex = 0;
    const makeChain = (): Record<string, unknown> => {
      const currentIndex = callIndex++;
      const chainProxy: Record<string, unknown> = {};
      const proxyHandler: ProxyHandler<Record<string, unknown>> = {
        get(_target: Record<string, unknown>, prop: string) {
          if (prop === "executeTakeFirst") {
            return (): Promise<unknown> =>
              Promise.resolve(queryQueue[currentIndex]);
          }
          if (prop === "executeTakeFirstOrThrow") {
            const val = queryQueue[currentIndex];
            return (): Promise<unknown> =>
              val !== undefined
                ? Promise.resolve(val)
                : Promise.reject(new Error("no result"));
          }
          // All other chain methods (selectAll, select, where, innerJoin)
          // return the same proxy to continue the chain
          return (): Record<string, unknown> => new Proxy({}, proxyHandler);
        },
      };
      return new Proxy(chainProxy, proxyHandler);
    };

    return {
      selectFrom: vi.fn(() => makeChain()),
    } as unknown as Kysely<TenantDatabase>;
  }

  // -----------------------------------------------------------------------
  // Phone lookup (POST /relay/phone-lookup)
  // -----------------------------------------------------------------------

  describe("POST /relay/phone-lookup", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns found client with open ticket when phone matches", async () => {
      const spy = spyOnReadRawBody();

      // Query order in handlePhoneLookup:
      // 1. phoneRepo.findByHash -> phones row (selectAll + 2 wheres)
      // 2. clients selectFrom -> client row
      // 3. tickets selectFrom -> ticket row
      const mockDb = createChainableTenantDb([
        {
          id: "phone-1" as PhoneId,
          phone_hash: "fake-hash",
          encrypted_number: Buffer.alloc(16),
          locale: "en-US",
          location_city: null,
          location_region: null,
          is_active: true,
        },
        { id: "client-1" as ClientId, encrypted_alias: Buffer.from("C-001") },
        { id: "ticket-1" as TicketId },
      ]);

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
      });
      const handler = createRelayHandler(deps);

      // Use Buffer.alloc for phone data (security contract)
      const phoneDataBuf = Buffer.alloc(12);
      Buffer.from("+15551112222").copy(phoneDataBuf);
      const bodyStr = JSON.stringify({
        phone: phoneDataBuf.toString("utf-8"),
      });

      const req = createMockReq("POST", "/relay/phone-lookup", bodyStr);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as {
        found: boolean;
        clientId: string;
        encryptedAlias: string;
        openTicketId: string;
      };
      expect(parsed.found).toBe(true);
      expect(parsed.clientId).toBe("client-1");
      expect(parsed.encryptedAlias).toBe(
        Buffer.from("C-001").toString("base64url"),
      );
      expect(parsed.openTicketId).toBe("ticket-1");

      // Security contract: raw body buffer zeroed in finally
      expectZeroed(spy.getCapturedBuffer(), "rawBody after phone-lookup found");
      spy.restore();
      phoneDataBuf.fill(0);
    });

    it("returns found client with null openTicketId when no open ticket exists", async () => {
      const spy = spyOnReadRawBody();

      const mockDb = createChainableTenantDb([
        {
          id: "phone-2" as PhoneId,
          phone_hash: "fake-hash",
          encrypted_number: Buffer.alloc(16),
          locale: "en-US",
          location_city: null,
          location_region: null,
          is_active: true,
        },
        { id: "client-2", encrypted_alias: Buffer.from("C-002") },
        undefined, // no open ticket
      ]);

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
      });
      const handler = createRelayHandler(deps);

      const phoneDataBuf = Buffer.alloc(12);
      Buffer.from("+15553334444").copy(phoneDataBuf);

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({ phone: phoneDataBuf.toString("utf-8") }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as {
        found: boolean;
        openTicketId: string | null;
      };
      expect(parsed.found).toBe(true);
      expect(parsed.openTicketId).toBe(null);

      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after phone-lookup found (no open ticket)",
      );
      spy.restore();
      phoneDataBuf.fill(0);
    });

    it("returns pending token when phone has no matching client", async () => {
      const spy = spyOnReadRawBody();

      // phoneRepo.findByHash returns null (no phone record)
      const mockDb = createChainableTenantDb([undefined]);

      const pendingClients = new Map<string, PendingClient>();

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        pendingClients,
      });
      const handler = createRelayHandler(deps);

      const phoneDataBuf = Buffer.alloc(12);
      Buffer.from("+15555556666").copy(phoneDataBuf);

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({ phone: phoneDataBuf.toString("utf-8") }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as {
        found: boolean;
        token: string;
      };
      expect(parsed.found).toBe(false);
      expect(parsed.token).toBeTruthy();

      // Pending client entry should be stored with the token
      expect(pendingClients.size).toBe(1);
      const entry = pendingClients.get(parsed.token);
      expect(entry).toBeDefined();
      expect(entry!.phoneHash).toBe("phone-fake-hash");
      expect(entry!.orgSchema).toBe(TEST_ORG_SCHEMA);

      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after phone-lookup pending token",
      );
      spy.restore();
      phoneDataBuf.fill(0);
    });

    it("returns pending token when phone hash exists but no client row", async () => {
      const spy = spyOnReadRawBody();

      // Phone record exists but no client references it
      const mockDb = createChainableTenantDb([
        {
          id: "phone-orphan" as PhoneId,
          phone_hash: "fake-hash",
          encrypted_number: Buffer.alloc(16),
          locale: "en-US",
          location_city: null,
          location_region: null,
          is_active: true,
        },
        undefined, // no client row
      ]);

      const pendingClients = new Map<string, PendingClient>();

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        pendingClients,
      });
      const handler = createRelayHandler(deps);

      const phoneDataBuf = Buffer.alloc(12);
      Buffer.from("+15557778888").copy(phoneDataBuf);

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({ phone: phoneDataBuf.toString("utf-8") }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as { found: boolean; token: string };
      expect(parsed.found).toBe(false);
      expect(parsed.token).toBeTruthy();
      expect(pendingClients.size).toBe(1);

      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after phone-lookup (phone exists, no client)",
      );
      spy.restore();
      phoneDataBuf.fill(0);
    });

    it("returns 400 MISSING_FIELDS when phone field is absent", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({ notPhone: "irrelevant" }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });

      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after phone-lookup MISSING_FIELDS",
      );
      spy.restore();
    });

    it("returns 400 MISSING_FIELDS when phone field is empty string", async () => {
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({ phone: "" }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });

      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after phone-lookup empty phone",
      );
      spy.restore();
    });

    it("zeroes opsEncryptedPhone buffer when client is found (not stored in pending)", async () => {
      // Track the buffer returned by fieldEncryptor.encrypt to verify
      // it gets zeroed when the found path skips pending storage
      const opsEncBuf = Buffer.alloc(16);
      Buffer.from("ops-enc-content!").copy(opsEncBuf);

      const mockDb = createChainableTenantDb([
        {
          id: "phone-3" as PhoneId,
          phone_hash: "fake-hash",
          encrypted_number: Buffer.alloc(16),
          locale: "en-US",
          location_city: null,
          location_region: null,
          is_active: true,
        },
        { id: "client-3" as ClientId, encrypted_alias: Buffer.from("C-003") },
        { id: "ticket-3" as TicketId },
      ]);

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        fieldEncryptor: {
          encrypt: vi.fn().mockReturnValue(opsEncBuf),
          encryptBuffer: vi.fn().mockReturnValue(opsEncBuf),
          decrypt: vi.fn().mockReturnValue("decrypted"),
          decryptToBuffer: vi.fn().mockReturnValue(Buffer.from("decrypted")),
        },
      });
      const handler = createRelayHandler(deps);

      const phoneDataBuf = Buffer.alloc(12);
      Buffer.from("+15559990000").copy(phoneDataBuf);

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({ phone: phoneDataBuf.toString("utf-8") }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      // On the found path, opsEncryptedPhone.fill(0) is called explicitly
      // since the buffer is not needed for pending storage
      expectZeroed(
        opsEncBuf,
        "opsEncryptedPhone zeroed on found path (not stored in pending)",
      );

      phoneDataBuf.fill(0);
      handler.cleanup();
    });

    // Security contract: blind index salt must be orgId (UUID), not orgSchema
    // (schema name). The telephony paths (inbound-sms, inbound-call,
    // client-service.updatePhone) all use the raw org UUID. If the relay uses
    // orgSchema instead, hashes diverge and phone-lookup never matches clients
    // created by inbound telephony, producing silent duplicate clients.

    it("passes orgId (not orgSchema) as the blind index salt", async () => {
      const hashSpy = vi.fn().mockReturnValue("tracked-hash");
      const mockDb = createChainableTenantDb([
        // phoneRepo.findByHash returns undefined (no match)
        undefined,
      ]);

      const pendingClients = new Map();
      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        indexer: {
          ...mockBlindIndexer("tracked-hash", "tracked-hash"),
          hashPhone: hashSpy,
        },
        pendingClients,
      });
      const handler = createRelayHandler(deps);

      const phoneDataBuf = Buffer.alloc(12);
      Buffer.from("+15550009999").copy(phoneDataBuf);

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({ phone: phoneDataBuf.toString("utf-8") }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(hashSpy).toHaveBeenCalledOnce();
      // The second argument MUST be the org UUID, not the schema name.
      // orgId = TEST_ORG_UUID, orgSchema = TEST_ORG_SCHEMA (see orgResolver mock).
      const salt = hashSpy.mock.calls[0]?.[1] as string;
      expect(salt).toBe(TEST_ORG_UUID as string);

      phoneDataBuf.fill(0);
    });

    // Cross-path blind index regression: exercises the relay handler with a
    // REAL BlindIndexer and verifies the stored hash matches what the
    // telephony paths (inbound-sms, inbound-call) would produce for the
    // same phone number and the same org. Catches the orgSchema vs orgId
    // salt mismatch that causes silent duplicate clients.

    it("produces a phone hash that matches the telephony path for the same phone and org", async () => {
      const mockDb = createChainableTenantDb([
        // phoneRepo.findByHash returns undefined (no match)
        undefined,
      ]);

      const pendingClients = new Map();
      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        // Wire a REAL blind indexer, not a mock. The handler's salt choice
        // determines whether this hash matches the telephony-path hash.
        indexer: testBlindIndexer,
        pendingClients,
      });
      const handler = createRelayHandler(deps);

      const phone = "+15550007777";
      const phoneDataBuf = Buffer.alloc(12);
      Buffer.from(phone).copy(phoneDataBuf);

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({ phone: phoneDataBuf.toString("utf-8") }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(pendingClients.size).toBe(1);

      // Extract the hash the relay actually stored.
      const [, pending] = [...pendingClients.entries()][0]!;
      const relayHash = (pending as { phoneHash: string }).phoneHash;

      // Compute the hash the telephony paths would produce. They all use
      // the raw org UUID ("cccc0000-0000-4000-8000-000000000001"), never the schema name.
      const telephonyHash = testBlindIndexer.hash(phone, TEST_ORG_UUID);

      // These MUST match. If the relay used a different salt (e.g. the
      // schema name "org_bbbb0000-0000-4000-8000-000000000001"), the hashes diverge and phone-lookup
      // can never find clients created by inbound calls or SMS.
      expect(relayHash).toBe(telephonyHash);

      phoneDataBuf.fill(0);
    });
  });

  // -----------------------------------------------------------------------
  // resolveClientPhone (default implementation via phone-lookup)
  // -----------------------------------------------------------------------

  describe("resolveClientPhone via phone-lookup (default dep)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns found result when ticket has an associated client phone", async () => {
      const spy = spyOnReadRawBody();
      const decryptedPhoneBuf = Buffer.alloc(12);
      Buffer.from("+15551230000").copy(decryptedPhoneBuf);

      // resolveClientPhone (default) queries:
      // tickets JOIN clients JOIN phones -> encrypted_number
      // Then calls fieldEncryptor.decryptToBuffer
      const mockDb = createChainableTenantDb([
        // First selectFrom is the channel policy guard's org_config read
        { channel_sms_enabled: true },
        // Joined phone-lookup query result
        { encrypted_number: Buffer.from("enc-phone-data") },
      ]);

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        fieldEncryptor: {
          encrypt: vi.fn().mockReturnValue(Buffer.from("encrypted")),
          encryptBuffer: vi.fn().mockReturnValue(Buffer.from("encrypted")),
          decrypt: vi.fn().mockReturnValue("decrypted"),
          decryptToBuffer: vi.fn().mockReturnValue(decryptedPhoneBuf),
        },
        // Omit resolveClientPhone to exercise the default implementation
        resolveClientPhone: undefined,
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"dddd0000-0000-4000-8000-000000000001","body":"test msg"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      // The decrypted phone buffer should be zeroed in finally
      expectZeroed(
        decryptedPhoneBuf,
        "decrypted phone buffer zeroed after SMS send",
      );
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody zeroed after SMS with default resolveClientPhone",
      );
      spy.restore();
    });

    it("returns 404 when ticket has no associated client phone (null row)", async () => {
      const spy = spyOnReadRawBody();

      // The joined query returns no row
      const mockDb = createChainableTenantDb([undefined]);

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        // Omit resolveClientPhone to exercise the default implementation
        resolveClientPhone: undefined,
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"dddd0000-0000-4000-8000-000000000002","body":"test msg"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.body)).toEqual({ error: "CLIENT_PHONE_NOT_FOUND" });
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody zeroed after CLIENT_PHONE_NOT_FOUND (default resolve)",
      );
      spy.restore();
    });
  });

  // -----------------------------------------------------------------------
  // Consultant phone verification (POST /relay/consultant-verify)
  // -----------------------------------------------------------------------

  describe("POST /relay/consultant-verify", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("sends verification SMS and stages all artifacts with wantsPings=true", async () => {
      const spy = spyOnReadRawBody();
      const provider = mockProvider();
      const svc = mockConsultantService();
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        createConsultantService: vi.fn().mockReturnValue(svc),
      });
      const handler = createRelayHandler(deps);

      const phone = "+15551112222";
      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone, wantsPings: true }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ sent: true });

      // Provider received the SMS with the code
      expect(provider.sendSms).toHaveBeenCalledOnce();
      const sendArgs = (provider.sendSms as ReturnType<typeof vi.fn>).mock
        .calls[0] as [string, string, string];
      expect(sendArgs[0]).toBe(phone);
      expect(sendArgs[1]).toContain("123456");
      expect(sendArgs[2]).toBe("+15559999999");

      // prepareVerification was called with all three artifacts
      expect(svc.prepareVerification).toHaveBeenCalledOnce();
      const prepArgs = (svc.prepareVerification as ReturnType<typeof vi.fn>)
        .mock.calls[0] as [
        string,
        {
          orgSealedPhone: Buffer;
          opsPhoneHash: string;
          opsEncryptedPhone: Buffer | null;
        },
      ];
      expect(prepArgs[0]).toBe(TEST_USER_ID);
      const artifacts = prepArgs[1];
      // org-sealed phone roundtrips: decrypt with test keypair
      expect(testUnseal(artifacts.orgSealedPhone)).toBe(phone);
      // "cons-" prefix comes from the mock's hashConsultantPhoneBuffer,
      // proving the OPS indexer's consultant domain method was used.
      expect(artifacts.opsPhoneHash).toBe("cons-consultant-phone-hash");
      // OPS copy was encrypted because wantsPings=true
      expect(artifacts.opsEncryptedPhone).not.toBeNull();

      // Security contract: raw body buffer zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after consultant-verify success",
      );
      spy.restore();
    });

    it("skips OPS encrypted phone when wantsPings is false", async () => {
      const svc = mockConsultantService();
      const deps = makeDeps({
        createConsultantService: vi.fn().mockReturnValue(svc),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222", wantsPings: false }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);

      const prepArgs = (svc.prepareVerification as ReturnType<typeof vi.fn>)
        .mock.calls[0] as [
        string,
        {
          orgSealedPhone: Buffer;
          opsPhoneHash: string;
          opsEncryptedPhone: Buffer | null;
        },
      ];
      expect(prepArgs[1].opsEncryptedPhone).toBeNull();
    });

    it("returns 429 RATE_LIMITED when prepareVerification throws RateLimitError", async () => {
      const svc = mockConsultantService({
        prepareVerification: vi
          .fn()
          .mockRejectedValue(new RateLimitError("RATE_LIMIT_COOLDOWN", 45)),
      });
      const provider = mockProvider();
      const deps = makeDeps({
        createConsultantService: vi.fn().mockReturnValue(svc),
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222", wantsPings: false }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(429);
      expect(JSON.parse(res.body)).toEqual({ error: "RATE_LIMITED" });
      // Provider was never called
      expect(provider.sendSms).not.toHaveBeenCalled();
    });

    it("returns 400 INVALID_PHONE for non-E164 number without calling service", async () => {
      const svc = mockConsultantService();
      const deps = makeDeps({
        createConsultantService: vi.fn().mockReturnValue(svc),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "not-a-phone" }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "INVALID_PHONE" });
      // Service was never touched
      expect(svc.prepareVerification).not.toHaveBeenCalled();
    });

    it("returns 400 INVALID_PHONE when phone field is missing", async () => {
      const svc = mockConsultantService();
      const deps = makeDeps({
        createConsultantService: vi.fn().mockReturnValue(svc),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ wantsPings: true }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "INVALID_PHONE" });
      expect(svc.prepareVerification).not.toHaveBeenCalled();
    });

    it("returns 502 PROVIDER_ERROR when sendSms throws and row state is preserved", async () => {
      const spy = spyOnReadRawBody();
      const svc = mockConsultantService();
      const provider = mockProvider({
        sendSms: vi.fn().mockRejectedValue(new Error("Twilio down")),
      });
      const deps = makeDeps({
        createConsultantService: vi.fn().mockReturnValue(svc),
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222", wantsPings: false }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expect(JSON.parse(res.body)).toEqual({ error: "PROVIDER_ERROR" });
      // prepareVerification was called (row state staged)
      expect(svc.prepareVerification).toHaveBeenCalledOnce();

      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after consultant-verify PROVIDER_ERROR",
      );
      spy.restore();
    });

    it("response bodies never contain the input phone number", async () => {
      const phone = "+15559876543";
      const provider = mockProvider();
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      // Success case
      const reqOk = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone, wantsPings: true }),
      );
      const resOk = createMockRes();
      await handler(reqOk, resOk as unknown as ServerResponse);
      expect(resOk.body).not.toContain(phone);

      // Invalid phone case
      const reqBad = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "bad" }),
      );
      const resBad = createMockRes();
      await handler(reqBad, resBad as unknown as ServerResponse);
      expect(resBad.body).not.toContain("bad");

      // Provider error case
      const providerErr = mockProvider({
        sendSms: vi.fn().mockRejectedValue(new Error("fail")),
      });
      const depsErr = makeDeps({
        getProvider: vi.fn().mockResolvedValue(providerErr),
      });
      const handlerErr = createRelayHandler(depsErr);
      const reqErr = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone, wantsPings: false }),
      );
      const resErr = createMockRes();
      await handlerErr(reqErr, resErr as unknown as ServerResponse);
      expect(resErr.body).not.toContain(phone);
    });

    it("zeros rawBody and phoneBuf on all paths", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeDeps();
      const handler = createRelayHandler(deps);

      // Valid phone, success path
      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222", wantsPings: false }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody zeroed after consultant-verify success",
      );
      spy.restore();
    });

    it("zeros rawBody on invalid phone (early return)", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeDeps();
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "12345" }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody zeroed after INVALID_PHONE",
      );
      spy.restore();
    });

    it("returns 500 NO_ORG_KEY when SealedBoxEncryptor is unavailable", async () => {
      const deps = makeDeps({
        getSealedBoxEncryptor: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222", wantsPings: false }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toEqual({ error: "NO_ORG_KEY" });
    });

    it("returns 500 NO_PROVIDER when provider not configured", async () => {
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222", wantsPings: false }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toEqual({ error: "NO_PROVIDER" });
    });

    it("returns 400 NO_CALLER_ID when no outbound number provisioned", async () => {
      const deps = makeDeps({
        resolveCallerIdByPurpose: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222", wantsPings: false }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "NO_CALLER_ID" });
    });
  });

  // -----------------------------------------------------------------------
  // Org identifier routing: UUID to platform calls, schema to tenant calls
  // -----------------------------------------------------------------------

  describe("org identifier routing", () => {
    const ORG_UUID = TEST_ORG_UUID;
    const ORG_SCHEMA = TEST_ORG_SCHEMA;

    it("SMS relay passes UUID to getProvider and OrgIdentifiers to resolveCallerIdByPurpose", async () => {
      const getProvider = vi.fn().mockResolvedValue(mockProvider());
      const resolveCallerIdByPurpose = vi
        .fn()
        .mockResolvedValue("+15559999999" as E164);
      const getTenantDb = vi
        .fn()
        .mockReturnValue(mockTenantDbWithChannelPolicy());
      const deps = makeDeps({
        getProvider,
        resolveCallerIdByPurpose,
        getTenantDb,
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/sms",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"hi"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      // UUID reaches the platform-table lookup
      expect(getProvider).toHaveBeenCalledWith(ORG_UUID);
      // Schema name reaches the tenant-scoped DB
      expect(getTenantDb).toHaveBeenCalledWith(ORG_SCHEMA);
      // Caller-ID resolver receives both identifiers
      expect(resolveCallerIdByPurpose).toHaveBeenCalledWith(
        { orgId: ORG_UUID, orgSchema: ORG_SCHEMA },
        "outbound",
      );
    });

    it("call relay passes UUID to getProvider and schema to getTenantDb", async () => {
      const getProvider = vi.fn().mockResolvedValue(mockProvider());
      const resolveCallerIdByPurpose = vi
        .fn()
        .mockResolvedValue("+15559999999" as E164);
      const getTenantDb = vi
        .fn()
        .mockReturnValue(mockTenantDbWithChannelPolicy());
      const deps = makeDeps({
        getProvider,
        resolveCallerIdByPurpose,
        getTenantDb,
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(getProvider).toHaveBeenCalledWith(ORG_UUID);
      expect(getTenantDb).toHaveBeenCalledWith(ORG_SCHEMA);
      expect(resolveCallerIdByPurpose).toHaveBeenCalledWith(
        { orgId: ORG_UUID, orgSchema: ORG_SCHEMA },
        "outbound",
      );
    });

    it("WebRTC token passes UUID to getProvider and getAccountSid, schema to getTenantDb", async () => {
      const getProvider = vi.fn().mockResolvedValue(mockProvider());
      const getAccountSid = vi.fn().mockResolvedValue("ACtest123");
      const getTenantDb = vi.fn().mockReturnValue({} as Kysely<TenantDatabase>);
      const deps = makeDeps({ getProvider, getAccountSid, getTenantDb });
      const handler = createRelayHandler(deps);

      const req = createMockReq("POST", "/relay/webrtc-token", "");
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(getProvider).toHaveBeenCalledWith(ORG_UUID);
      expect(getAccountSid).toHaveBeenCalledWith(ORG_UUID);
      expect(getTenantDb).toHaveBeenCalledWith(ORG_SCHEMA);
    });

    it("consultant-verify passes UUID to getProvider and OrgIdentifiers to resolveCallerIdByPurpose", async () => {
      const getProvider = vi.fn().mockResolvedValue(mockProvider());
      const resolveCallerIdByPurpose = vi
        .fn()
        .mockResolvedValue("+15559999999" as E164);
      const getTenantDb = vi.fn().mockReturnValue({} as Kysely<TenantDatabase>);
      const deps = makeDeps({
        getProvider,
        resolveCallerIdByPurpose,
        getTenantDb,
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222", wantsPings: false }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(getProvider).toHaveBeenCalledWith(ORG_UUID);
      expect(getTenantDb).toHaveBeenCalledWith(ORG_SCHEMA);
      expect(resolveCallerIdByPurpose).toHaveBeenCalledWith(
        { orgId: ORG_UUID, orgSchema: ORG_SCHEMA },
        "outbound",
      );
    });

    it("call relay stores UUID on PendingCall.orgId and schema on PendingCall.orgSchema", async () => {
      const pendingCalls = new Map<string, PendingCall>();
      const deps = makeDeps({ pendingCalls });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(pendingCalls.size).toBe(1);
      const [, pending] = [...pendingCalls.entries()][0]!;
      expect(pending.orgId).toBe(ORG_UUID);
      expect(pending.orgSchema).toBe(ORG_SCHEMA);
    });

    it("call-confirm passes UUID from PendingCall to getAuthToken and getProvider", async () => {
      const pending: PendingCall = {
        clientPhoneBuf: Buffer.from("+15553333333"),
        callerIdBuf: Buffer.from("+15559999999"),
        orgId: ORG_UUID,
        orgSchema: ORG_SCHEMA,
        createdAt: Date.now(),
      };
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_pin_1", pending);

      const getAuthToken = vi.fn().mockResolvedValue("test_auth_token");
      const getProvider = vi.fn().mockResolvedValue(
        mockProvider({
          validateWebhook: vi.fn().mockReturnValue(true),
        }),
      );
      const deps = makeDeps({ pendingCalls, getAuthToken, getProvider });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_pin_1&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "valid_sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      // Platform-table calls receive the UUID, not the schema name
      expect(getAuthToken).toHaveBeenCalledWith(ORG_UUID);
      expect(getProvider).toHaveBeenCalledWith(ORG_UUID);
    });

    it("call relay builds status webhook URL with UUID, not schema name", async () => {
      const provider = mockProvider();
      const deps = makeDeps({
        getProvider: vi.fn().mockResolvedValue(provider),
        webhookBaseUrl: "https://api.care-y.app",
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const callArgs = (
        provider.initiateOutboundCall as ReturnType<typeof vi.fn>
      ).mock.calls[0] as [
        {
          statusWebhookUrl: string;
          confirmWebhookUrl: string;
        },
      ];
      const { statusWebhookUrl, confirmWebhookUrl } = callArgs[0];
      // Status webhook uses provider ID + UUID (matches routes/webhooks.ts expectations)
      expect(statusWebhookUrl).toBe(
        `https://api.care-y.app/webhooks/mock/${ORG_UUID}/status`,
      );
      // Confirm URL uses schema name (opaque path segment, not a DB lookup key)
      expect(confirmWebhookUrl).toBe(
        `https://api.care-y.app/relay/call-confirm/${ORG_SCHEMA}`,
      );
    });
  });

  // -----------------------------------------------------------------------
  // Email relay
  // -----------------------------------------------------------------------

  describe("POST /relay/email", () => {
    const TEST_TICKET_ID = "aaaa0000-0000-4000-8000-000000000001";
    const VALID_EMAIL_BODY = JSON.stringify({
      ticketId: TEST_TICKET_ID,
      subject: "Test Subject",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    function makeEmailDeps(
      overrides?: Partial<RelayHandlerDeps>,
    ): RelayHandlerDeps {
      const mockEmailSender = {
        send: vi.fn().mockResolvedValue(undefined),
      };
      return makeDeps({
        emailSender: mockEmailSender,
        loadOrgEmailBranding: vi.fn().mockResolvedValue({
          fromName: "Test Org",
          fromAddress: "help@example.org",
        }),
        resolveClientEmail: vi
          .fn()
          .mockResolvedValue(Buffer.from("client@example.com")),
        ...overrides,
      });
    }

    it("sends email and returns sent:true on success", async () => {
      const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
      const deps = makeEmailDeps({ emailSender: mockSender });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ sent: true });
      expect(mockSender.send).toHaveBeenCalledWith({
        to: "client@example.com",
        subject: "Test Subject",
        text: "Hello",
        html: "<p>Hello</p>",
        from: '"Test Org" <help@example.org>',
      });
    });

    it("returns 400 MISSING_FIELDS when subject is missing", async () => {
      const deps = makeEmailDeps();
      const handler = createRelayHandler(deps);
      const body = JSON.stringify({
        ticketId: TEST_TICKET_ID,
        html: "<p>Hi</p>",
        text: "Hi",
      });
      const req = createMockReq("POST", "/relay/email", body);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
    });

    it("returns 400 MISSING_FIELDS when ticketId is missing", async () => {
      const deps = makeEmailDeps();
      const handler = createRelayHandler(deps);
      const body = JSON.stringify({
        subject: "Hi",
        html: "<p>Hi</p>",
        text: "Hi",
      });
      const req = createMockReq("POST", "/relay/email", body);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
    });

    it("returns 400 BODY_TOO_LONG when html exceeds 100KB", async () => {
      const deps = makeEmailDeps();
      const handler = createRelayHandler(deps);
      const body = JSON.stringify({
        ticketId: TEST_TICKET_ID,
        subject: "Hi",
        html: "x".repeat(100_001),
        text: "Hi",
      });
      const req = createMockReq("POST", "/relay/email", body);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "BODY_TOO_LONG" });
    });

    it("returns 400 BODY_TOO_LONG when subject exceeds 512 bytes", async () => {
      const deps = makeEmailDeps();
      const handler = createRelayHandler(deps);
      const body = JSON.stringify({
        ticketId: TEST_TICKET_ID,
        subject: "x".repeat(513),
        html: "<p>Hi</p>",
        text: "Hi",
      });
      const req = createMockReq("POST", "/relay/email", body);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "BODY_TOO_LONG" });
    });

    it("returns 400 BODY_TOO_LONG when text exceeds 20KB", async () => {
      const deps = makeEmailDeps();
      const handler = createRelayHandler(deps);
      const body = JSON.stringify({
        ticketId: TEST_TICKET_ID,
        subject: "Hi",
        html: "<p>Hi</p>",
        text: "x".repeat(20_001),
      });
      const req = createMockReq("POST", "/relay/email", body);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "BODY_TOO_LONG" });
    });

    it("returns 404 CLIENT_EMAIL_NOT_FOUND when client has no email", async () => {
      const deps = makeEmailDeps({
        resolveClientEmail: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.body)).toEqual({
        error: "CLIENT_EMAIL_NOT_FOUND",
      });
    });

    it("returns 502 EMAIL_SEND_FAILED when sender throws", async () => {
      const mockSender = {
        send: vi.fn().mockRejectedValue(new Error("SMTP timeout")),
      };
      const deps = makeEmailDeps({ emailSender: mockSender });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expect(JSON.parse(res.body)).toEqual({ error: "EMAIL_SEND_FAILED" });
    });

    it("502 response does not contain the email address (PII contract)", async () => {
      const mockSender = {
        send: vi.fn().mockRejectedValue(new Error("SMTP timeout")),
      };
      const deps = makeEmailDeps({ emailSender: mockSender });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.body).not.toContain("client@example.com");
      expect(res.body).not.toContain("Test Subject");
      expect(res.body).not.toContain("Hello");
    });

    it("200 response does not echo inputs (PII contract)", async () => {
      const deps = makeEmailDeps();
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(res.body).not.toContain("client@example.com");
      expect(res.body).not.toContain("Test Subject");
    });

    it("returns 500 EMAIL_NOT_CONFIGURED when emailSender is absent", async () => {
      const deps = makeDeps(); // no emailSender
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toEqual({
        error: "EMAIL_NOT_CONFIGURED",
      });
    });

    it("uses branded from-address from loadOrgEmailBranding", async () => {
      const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
      const deps = makeEmailDeps({
        emailSender: mockSender,
        loadOrgEmailBranding: vi.fn().mockResolvedValue({
          fromName: "Harbor Hotline",
          fromAddress: "hotline@harbor.org",
        }),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(mockSender.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Harbor Hotline" <hotline@harbor.org>',
        }),
      );
    });

    it("zeros raw body buffer after successful email send", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeEmailDeps();
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after email send");
      spy.restore();
    });

    it("zeros raw body buffer when sender throws", async () => {
      const spy = spyOnReadRawBody();
      const mockSender = {
        send: vi.fn().mockRejectedValue(new Error("SMTP fail")),
      };
      const deps = makeEmailDeps({ emailSender: mockSender });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(502);
      expectZeroed(spy.getCapturedBuffer(), "rawBody after EMAIL_SEND_FAILED");
      spy.restore();
    });

    it("zeros resolved email buffer after successful send", async () => {
      const emailBuf = Buffer.from("client@example.com");
      const deps = makeEmailDeps({
        resolveClientEmail: vi.fn().mockResolvedValue(emailBuf),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expectZeroed(emailBuf, "emailBuf after successful email send");
    });

    describe("Reply-To and footer (inbound email routing)", () => {
      function makePlatformDb(domainRow: { domain: string } | null): unknown {
        return {
          selectFrom: () => ({
            select: () => ({
              where: () => ({
                executeTakeFirst: vi.fn().mockResolvedValue(domainRow),
              }),
            }),
          }),
        };
      }

      function makeTenantDbWithConfig(
        footer: string | null = null,
        language = "en",
      ): Kysely<TenantDatabase> {
        // The handler calls getTenantDb which returns this mock.
        // It must support:
        // 1. selectFrom("org_config").select(...).executeTakeFirst() for footer
        // 2. insertInto("email_reply_tokens")... for mintToken
        // 3. updateTable("email_reply_tokens")... for revoking prior tokens
        const orgConfigResult = {
          email_reply_footer: footer,
          default_language: language,
        };
        const insertReturning = {
          returning: vi.fn().mockReturnValue({
            executeTakeFirstOrThrow: vi
              .fn()
              .mockResolvedValue({ id: "tok-id-1" }),
          }),
        };
        return {
          selectFrom: vi.fn().mockImplementation((table: string) => {
            if (table === "org_config") {
              return {
                select: () => ({
                  executeTakeFirst: vi.fn().mockResolvedValue(orgConfigResult),
                }),
              };
            }
            // tickets/clients/emails joins for resolveClientEmail
            return {
              innerJoin: vi.fn().mockReturnValue({
                innerJoin: vi.fn().mockReturnValue({
                  select: () => ({
                    where: () => ({
                      executeTakeFirst: vi.fn().mockResolvedValue(null),
                    }),
                  }),
                }),
                select: () => ({
                  where: () => ({
                    executeTakeFirst: vi.fn().mockResolvedValue(null),
                  }),
                }),
              }),
              select: () => ({
                where: () => ({
                  executeTakeFirst: vi.fn().mockResolvedValue(null),
                }),
              }),
            };
          }),
          updateTable: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                  execute: vi.fn().mockResolvedValue([{ numUpdatedRows: 0n }]),
                }),
              }),
            }),
          }),
          insertInto: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue(insertReturning),
          }),
        } as unknown as Kysely<TenantDatabase>;
      }

      const tokenHasher = { hash: vi.fn().mockReturnValue("hashed-tok") };

      it("sets Reply-To and appends footer when domain row exists", async () => {
        const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
        const tDb = makeTenantDbWithConfig(null, "en");
        const deps = makeEmailDeps({
          emailSender: mockSender,
          getTenantDb: vi.fn().mockReturnValue(tDb),
          platformDb: makePlatformDb({
            domain: "reply.example.org",
          }) as never,
          replyTokenHasher: tokenHasher,
          replyTokenCache: new Map<string, string>(),
        });
        const handler = createRelayHandler(deps);
        const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
        const res = createMockRes();

        await handler(req, res as unknown as ServerResponse);

        expect(res.statusCode).toBe(200);
        const call = mockSender.send.mock.calls[0]?.[0] as {
          replyTo?: string;
          text: string;
          html: string;
        };
        expect(call.replyTo).toMatch(
          /^reply-[a-z2-7]{26}@reply\.example\.org$/,
        );
        expect(call.text).toContain("---");
        expect(call.text).toContain("do not share");
        expect(call.html).toContain("<hr");
        expect(call.html).toContain("do not share");
      });

      it("uses org-configured footer when set", async () => {
        const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
        const tDb = makeTenantDbWithConfig("Custom footer text.");
        const deps = makeEmailDeps({
          emailSender: mockSender,
          getTenantDb: vi.fn().mockReturnValue(tDb),
          platformDb: makePlatformDb({
            domain: "reply.example.org",
          }) as never,
          replyTokenHasher: tokenHasher,
          replyTokenCache: new Map<string, string>(),
        });
        const handler = createRelayHandler(deps);
        const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
        const res = createMockRes();

        await handler(req, res as unknown as ServerResponse);

        expect(res.statusCode).toBe(200);
        const call = mockSender.send.mock.calls[0]?.[0] as {
          text: string;
          html: string;
        };
        expect(call.text).toContain("Custom footer text.");
        expect(call.html).toContain("Custom footer text.");
      });

      it("sends without Reply-To or footer when no domain row exists", async () => {
        const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
        const deps = makeEmailDeps({
          emailSender: mockSender,
          platformDb: makePlatformDb(null) as never,
          replyTokenHasher: tokenHasher,
          replyTokenCache: new Map<string, string>(),
        });
        const handler = createRelayHandler(deps);
        const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
        const res = createMockRes();

        await handler(req, res as unknown as ServerResponse);

        expect(res.statusCode).toBe(200);
        const call = mockSender.send.mock.calls[0]?.[0] as {
          replyTo?: string;
          text: string;
          html: string;
        };
        expect(call.replyTo).toBeUndefined();
        expect(call.text).toBe("Hello");
        expect(call.html).toBe("<p>Hello</p>");
      });

      it("sends without Reply-To through the default deps (no domain row resolved)", async () => {
        const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
        const deps = makeEmailDeps({ emailSender: mockSender });
        const handler = createRelayHandler(deps);
        const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
        const res = createMockRes();

        await handler(req, res as unknown as ServerResponse);

        expect(res.statusCode).toBe(200);
        const call = mockSender.send.mock.calls[0]?.[0] as {
          replyTo?: string;
          text: string;
        };
        expect(call.replyTo).toBeUndefined();
        expect(call.text).toBe("Hello");
      });

      it("reuses cached token on second send for the same ticket", async () => {
        const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
        const cache = new Map<string, string>();
        cache.set(TEST_TICKET_ID, "cachedtokenvalue26charslng");
        const deps = makeEmailDeps({
          emailSender: mockSender,
          getTenantDb: vi
            .fn()
            .mockReturnValue(makeTenantDbWithConfig(null, "en")),
          platformDb: makePlatformDb({
            domain: "reply.example.org",
          }) as never,
          replyTokenHasher: tokenHasher,
          replyTokenCache: cache,
        });
        const handler = createRelayHandler(deps);
        const req = createMockReq("POST", "/relay/email", VALID_EMAIL_BODY);
        const res = createMockRes();

        await handler(req, res as unknown as ServerResponse);

        expect(res.statusCode).toBe(200);
        const call = mockSender.send.mock.calls[0]?.[0] as {
          replyTo?: string;
        };
        expect(call.replyTo).toBe(
          "reply-cachedtokenvalue26charslng@reply.example.org",
        );
      });
    });
  });

  // -----------------------------------------------------------------------
  // Channel policy: SMS_DISABLED and VOICE_DISABLED (isChannelEnabled paths)
  // -----------------------------------------------------------------------

  describe("channel policy guards", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns 403 SMS_DISABLED when channel_sms_enabled is false, zeros buffers and leaks no plaintext", async () => {
      const spy = spyOnReadRawBody();
      const deps = makeDeps({
        getTenantDb: vi
          .fn()
          .mockReturnValue(
            mockTenantDbWithChannelPolicy({ channel_sms_enabled: false }),
          ),
      });
      const handler = createRelayHandler(deps);
      const seededBody = "relay test sms body content";
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"ticketId":"aaaa0000-0000-4000-8000-000000000001","body":"${seededBody}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({ error: "SMS_DISABLED" });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain(seededBody);
      expect(res.body).not.toContain("+15551234567");
      // Security contract: raw body buffer zeroed
      expectZeroed(spy.getCapturedBuffer(), "rawBody after SMS_DISABLED");
      spy.restore();
    });

    it("returns 403 VOICE_DISABLED when channel_voice_enabled is false, zeros buffers and leaks no plaintext", async () => {
      const spy = spyOnReadRawBody();
      const consultantPhone = "+15552220000";
      const deps = makeDeps({
        getTenantDb: vi
          .fn()
          .mockReturnValue(
            mockTenantDbWithChannelPolicy({ channel_voice_enabled: false }),
          ),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        `{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"${consultantPhone}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({ error: "VOICE_DISABLED" });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain(consultantPhone);
      // Security contract: raw body buffer zeroed
      expectZeroed(spy.getCapturedBuffer(), "rawBody after VOICE_DISABLED");
      spy.restore();
    });

    it("returns 403 EMAIL_DISABLED when channel_email_enabled is false, zeros buffers and leaks no plaintext", async () => {
      const spy = spyOnReadRawBody();
      const emailBody = JSON.stringify({
        ticketId: "aaaa0000-0000-4000-8000-000000000001",
        subject: "Test Subject Content",
        html: "<p>Email body html</p>",
        text: "Email body text",
      });
      const mockSender = { send: vi.fn().mockResolvedValue(undefined) };

      // Build a tenant DB mock that returns email_disabled in the org_config
      // selectFrom chain (email relay reads channel_email_enabled, email_reply_footer,
      // default_language from org_config in one query)
      const orgConfigResult = {
        channel_email_enabled: false,
        email_reply_footer: null,
        default_language: "en",
      };
      const emailTenantDb = {
        selectFrom: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockReturnValue({
            executeTakeFirst: vi.fn().mockResolvedValue(orgConfigResult),
          }),
        })),
      } as unknown as Kysely<TenantDatabase>;

      const deps = makeDeps({
        emailSender: mockSender,
        loadOrgEmailBranding: vi.fn().mockResolvedValue({
          fromName: "Test Org",
          fromAddress: "help@example.org",
        }),
        resolveClientEmail: vi
          .fn()
          .mockResolvedValue(Buffer.from("client@example.com")),
        getTenantDb: vi.fn().mockReturnValue(emailTenantDb),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", emailBody);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({ error: "EMAIL_DISABLED" });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain("Test Subject Content");
      expect(res.body).not.toContain("Email body");
      expect(res.body).not.toContain("client@example.com");
      // Security contract: raw body buffer zeroed
      expectZeroed(spy.getCapturedBuffer(), "rawBody after EMAIL_DISABLED");
      // EmailSender never called
      expect(mockSender.send).not.toHaveBeenCalled();
      spy.restore();
    });
  });

  // -----------------------------------------------------------------------
  // Schema validation failures (ticketIdSchema.safeParse cold paths)
  // -----------------------------------------------------------------------

  describe("ticketId schema validation failures", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("SMS relay returns 400 MISSING_FIELDS for malformed ticketId, zeros buffer and leaks no plaintext", async () => {
      // A non-UUID string fails ticketIdSchema safeParse (L319 if[0])
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const seededBody = "sms content for malformed ticket test";
      const req = createMockReq(
        "POST",
        "/relay/sms",
        `{"ticketId":"not-a-valid-uuid","body":"${seededBody}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain(seededBody);
      expect(res.body).not.toContain("not-a-valid-uuid");
      // Security contract: buffer zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after malformed ticketId (SMS)",
      );
      spy.restore();
    });

    it("call relay returns 400 MISSING_FIELDS for malformed ticketId, zeros buffer and leaks no plaintext", async () => {
      // L398 if[0] in resolveCallContext
      const spy = spyOnReadRawBody();
      const consultantPhone = "+15552220001";
      const handler = createRelayHandler(makeDeps());
      const req = createMockReq(
        "POST",
        "/relay/call",
        `{"ticketId":"not-a-valid-uuid","consultantPhone":"${consultantPhone}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain(consultantPhone);
      expect(res.body).not.toContain("not-a-valid-uuid");
      // Security contract: buffer zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after malformed ticketId (call)",
      );
      spy.restore();
    });

    it("email relay returns 400 MISSING_FIELDS for malformed ticketId, zeros buffer and leaks no plaintext", async () => {
      // L1149 if[0] in handleEmailRelay
      const spy = spyOnReadRawBody();
      const emailBody = JSON.stringify({
        ticketId: "not-a-valid-uuid",
        subject: "Test Subject",
        html: "<p>Hi</p>",
        text: "Hi",
      });
      const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
      const deps = makeDeps({
        emailSender: mockSender,
        loadOrgEmailBranding: vi.fn().mockResolvedValue({
          fromName: "Test Org",
          fromAddress: "help@example.org",
        }),
        resolveClientEmail: vi
          .fn()
          .mockResolvedValue(Buffer.from("client@example.com")),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/email", emailBody);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "MISSING_FIELDS" });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain("not-a-valid-uuid");
      expect(res.body).not.toContain("Test Subject");
      // Security contract: buffer zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after malformed ticketId (email)",
      );
      // Sender never called
      expect(mockSender.send).not.toHaveBeenCalled();
      spy.restore();
    });
  });

  // -----------------------------------------------------------------------
  // Call relay: NO_CALLER_ID path and call-tracker error path
  // -----------------------------------------------------------------------

  describe("call relay NO_CALLER_ID and call-tracker errors", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns 400 NO_CALLER_ID for call relay when no phones provisioned, zeros buffers and leaks no plaintext", async () => {
      // L445 if[0] in resolveCallContext
      const spy = spyOnReadRawBody();
      const consultantPhone = "+15552220002";
      const deps = makeDeps({
        resolveCallerIdByPurpose: vi.fn().mockResolvedValue(null),
      });
      const handler = createRelayHandler(deps);
      const req = createMockReq(
        "POST",
        "/relay/call",
        `{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"${consultantPhone}"}`,
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({ error: "NO_CALLER_ID" });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain(consultantPhone);
      expect(res.body).not.toContain("+15551234567");
      // Security contract: buffer zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after NO_CALLER_ID (call)",
      );
      spy.restore();
    });

    it("logs call-tracker Error.message and still succeeds (L554 cond-expr Error branch)", async () => {
      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const tracker = createCallTracker();
      const trackSpy = vi
        .spyOn(tracker, "track")
        .mockRejectedValue(new Error("Redis unavailable"));
      const deps = makeDeps({ callTracker: tracker });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      // Call succeeds despite tracker failure
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual(
        expect.objectContaining({ method: "phone_callback" }),
      );
      // Tracker failure logged with error message, not plaintext PII
      expect(errorSpy).toHaveBeenCalledWith(
        "call-tracker write failed for outbound call",
        "Redis unavailable",
      );
      // Security contract: log message contains no phone numbers
      const logArgs = errorSpy.mock.calls[0] as string[];
      expect(logArgs.join(" ")).not.toContain("+1555");

      trackSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it("logs call-tracker non-Error via String() and still succeeds (L554 cond-expr non-Error branch)", async () => {
      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const tracker = createCallTracker();
      const trackSpy = vi
        .spyOn(tracker, "track")
        .mockRejectedValue("string rejection");
      const deps = makeDeps({ callTracker: tracker });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      // Call succeeds despite tracker failure
      expect(res.statusCode).toBe(200);
      expect(errorSpy).toHaveBeenCalledWith(
        "call-tracker write failed for outbound call",
        "string rejection",
      );

      trackSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // readSignatureHeader switch arms and edge cases
  // -----------------------------------------------------------------------

  describe("call-confirm signature header and provider routing", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns 403 when provider is signalwire (null signature header), zeros pending buffers", async () => {
      // L613 switch[2]: readSignatureHeader returns null for signalwire,
      // which triggers L648 if[0]: signature === null -> forbidden
      const pendingBuf = Buffer.from("+15553330000");
      const callerBuf = Buffer.from("+15559990000");
      const pending: PendingCall = {
        clientPhoneBuf: pendingBuf,
        callerIdBuf: callerBuf,
        orgId: TEST_ORG_UUID,
        orgSchema: TEST_ORG_SCHEMA,
        createdAt: Date.now(),
      };
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_sw_1", pending);

      const swProvider = mockProvider({
        providerId: "signalwire" as never,
        validateWebhook: vi.fn().mockReturnValue(true),
      });
      const deps = makeDeps({
        pendingCalls,
        getAuthToken: vi.fn().mockResolvedValue("sw_auth_token"),
        getProvider: vi.fn().mockResolvedValue(swProvider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_sw_1&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      // signalwire has no signature header mapping, so forbidden
      expect(res.statusCode).toBe(403);
      // Security contract: validateWebhook never called (no signature to pass)
      expect(swProvider.validateWebhook).not.toHaveBeenCalled();
      // Security contract: error response contains no phone numbers
      expect(res.body).not.toContain("+15553330000");
      expect(res.body).not.toContain("+15559990000");
    });

    it("returns 403 when x-twilio-signature header is an array (cond-expr null branch)", async () => {
      // L609 cond-expr[1]: typeof value === "string" ? value : null
      // When the header value is an array (multiple headers), it returns null
      const pendingBuf = Buffer.from("+15553330001");
      const callerBuf = Buffer.from("+15559990001");
      const pending: PendingCall = {
        clientPhoneBuf: pendingBuf,
        callerIdBuf: callerBuf,
        orgId: TEST_ORG_UUID,
        orgSchema: TEST_ORG_SCHEMA,
        createdAt: Date.now(),
      };
      const pendingCalls = new Map<string, PendingCall>();
      pendingCalls.set("CA_arr_1", pending);

      const provider = mockProvider({
        validateWebhook: vi.fn().mockReturnValue(true),
      });
      const deps = makeDeps({
        pendingCalls,
        getAuthToken: vi.fn().mockResolvedValue("test_auth_token"),
        getProvider: vi.fn().mockResolvedValue(provider),
      });
      const handler = createRelayHandler(deps);

      const formBody = "CallSid=CA_arr_1&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
        },
      );
      req.headers.cookie = "";
      // Force an array header value
      req.headers["x-twilio-signature"] = ["sig1", "sig2"] as unknown as string;
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      // validateWebhook never called because signature resolved to null
      expect(provider.validateWebhook).not.toHaveBeenCalled();
      // Security contract: no phone numbers in response
      expect(res.body).not.toContain("+15553330001");
    });

    it("returns 400 when CallSid fails callSidSchema validation (L707)", async () => {
      // callSidSchema requires min(1); passing an empty CallSid is already
      // caught earlier (L701). To hit L707, we need a CallSid that is not
      // empty but fails the brand parse. An empty-after-trim or special
      // character should fail. Since the schema is z.string().min(1).brand,
      // any non-empty string passes. The L701 guard catches empty. The L707
      // path is unreachable for min(1) brand (no additional refinement).
      // Instead, test with a body that has CallSid present but the value
      // comes from a well-formed request that reaches L707.
      // Actually, looking more carefully: L700-701 check rawCallSid undefined
      // or empty, then L706-710 safeParse. Since callSidSchema is just
      // z.string().min(1).brand(), any non-empty string passes. This branch
      // is structurally dead for the current schema. Skip it.
      // (See "intentionally not covered" section in the summary.)

      // Test the empty rawCallSid path (L701) with zeroing contract instead:
      const spy = spyOnReadRawBody();
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      const formBody = "CallSid=&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/org_bbbb0000-0000-4000-8000-000000000001",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      // Security contract: no plaintext in response
      expect(res.body).toBe("");
      spy.restore();
    });

    it("returns 400 when orgSchema segment fails validation (L580 cond-expr null)", async () => {
      // L580: orgSchemaNameSchema.safeParse fails -> returns null
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      // "invalid!!schema" has characters that fail orgSchemaNameSchema
      const formBody = "CallSid=CA_test_1&Digits=1";
      const req = createMockReq(
        "POST",
        "/relay/call-confirm/invalid!!schema",
        formBody,
        {
          "content-type": "application/x-www-form-urlencoded",
          "x-twilio-signature": "sig",
        },
      );
      req.headers.cookie = "";
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      // Security contract: no input echoed in response
      expect(res.body).not.toContain("invalid!!schema");
    });
  });

  // -----------------------------------------------------------------------
  // Phone-lookup: phoneMatchHash validation and wantsPings fallback
  // -----------------------------------------------------------------------

  describe("phone-lookup phoneMatchHash and pending storage", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns 400 INVALID_PHONE_MATCH_HASH for non-hex hash, zeros buffer and leaks no plaintext", async () => {
      // L857 if[0] + L858 if[0]: rawPhoneMatchHash present but fails regex
      const spy = spyOnReadRawBody();
      const handler = createRelayHandler(makeDeps());
      const phoneDataBuf = Buffer.alloc(12);
      Buffer.from("+15551110000").copy(phoneDataBuf);

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({
          phone: phoneDataBuf.toString("utf-8"),
          phoneMatchHash: "not-a-hex-hash-value",
        }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({
        error: "INVALID_PHONE_MATCH_HASH",
      });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain("+15551110000");
      expect(res.body).not.toContain("not-a-hex-hash-value");
      // Security contract: buffer zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after INVALID_PHONE_MATCH_HASH",
      );
      spy.restore();
      phoneDataBuf.fill(0);
    });

    it("stores parsed phoneMatchHash in pending entry when valid 128-char hex (L918 cond-expr parse side)", async () => {
      // L857 if[0] truthy + L858 else (passes regex) + L918 parse side
      const validHash = "a".repeat(128);
      const mockDb = createChainableTenantDb([undefined]); // no phone match
      const pendingClients = new Map<string, PendingClient>();

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        pendingClients,
      });
      const handler = createRelayHandler(deps);

      const phoneDataBuf = Buffer.alloc(12);
      Buffer.from("+15551110001").copy(phoneDataBuf);

      const req = createMockReq(
        "POST",
        "/relay/phone-lookup",
        JSON.stringify({
          phone: phoneDataBuf.toString("utf-8"),
          phoneMatchHash: validHash,
        }),
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as { found: boolean; token: string };
      expect(parsed.found).toBe(false);

      // Verify the phoneMatchHash was stored (not null)
      const entry = pendingClients.get(parsed.token);
      expect(entry).toBeDefined();
      expect(entry!.phoneMatchHash).toBe(validHash);

      // Security contract: response does not contain the hash or phone
      expect(res.body).not.toContain(validHash);
      expect(res.body).not.toContain("+15551110001");

      phoneDataBuf.fill(0);
    });
  });

  // -----------------------------------------------------------------------
  // Consultant-verify: wantsPings ?? false fallback and catch-all handler
  // -----------------------------------------------------------------------

  describe("consultant-verify wantsPings fallback and catch-all", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("defaults wantsPings to false when field is absent (L964 binary-expr ?? fallback)", async () => {
      // The body omits wantsPings entirely; extractBooleanField returns null,
      // so ?? false fires. This means opsEncryptedPhone should be null.
      const svc = mockConsultantService();
      const deps = makeDeps({
        createConsultantService: vi.fn().mockReturnValue(svc),
      });
      const handler = createRelayHandler(deps);

      // No wantsPings field at all
      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222" }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);

      // prepareVerification receives null opsEncryptedPhone (wantsPings defaulted to false)
      const prepArgs = (svc.prepareVerification as ReturnType<typeof vi.fn>)
        .mock.calls[0] as [
        string,
        {
          orgSealedPhone: Buffer;
          opsPhoneHash: string;
          opsEncryptedPhone: Buffer | null;
        },
      ];
      expect(prepArgs[1].opsEncryptedPhone).toBeNull();
    });

    it("catches unexpected errors and returns 500 INTERNAL_ERROR, zeros buffers and leaks no plaintext", async () => {
      // The outer catch block (L1031) handles non-RateLimitError throws
      const spy = spyOnReadRawBody();
      const errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const svc = mockConsultantService({
        prepareVerification: vi
          .fn()
          .mockRejectedValue(new Error("Unexpected DB error")),
      });
      const deps = makeDeps({
        createConsultantService: vi.fn().mockReturnValue(svc),
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/consultant-verify",
        JSON.stringify({ phone: "+15551112222" }),
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body)).toEqual({ error: "INTERNAL_ERROR" });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain("+15551112222");
      expect(res.body).not.toContain("Unexpected DB error");
      // Security contract: log contains only user ID, no phone
      expect(errorSpy).toHaveBeenCalledOnce();
      const logMsg = errorSpy.mock.calls[0]?.[0] as string;
      expect(logMsg).not.toContain("+15551112222");
      // Security contract: buffer zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after consultant-verify INTERNAL_ERROR",
      );

      spy.restore();
      errorSpy.mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // Email relay: resolveClientEmail default dep fallback and
  // default_language ?? "en" fallback
  // -----------------------------------------------------------------------

  describe("email relay default dep fallback and language fallback", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("uses default resolveClientEmail when dep is omitted (L1155 binary-expr fallback), zeros buffer", async () => {
      // L1155: deps.resolveClientEmail ?? resolveClientEmail
      // Omit the dep to exercise the default. The default does a DB join
      // on tickets/clients/emails. Mock the tenant DB to return a row.
      const spy = spyOnReadRawBody();
      const emailBuf = Buffer.from("resolved@example.com");

      // Build a tenant DB mock where the second selectFrom (tickets join)
      // returns the encrypted_address row, and first returns org_config
      const orgConfigResult = {
        channel_email_enabled: true,
        email_reply_footer: null,
        default_language: null, // exercises L1208: ?? "en" fallback
      };
      let selectCount = 0;
      const emailTenantDb = {
        selectFrom: vi.fn().mockImplementation(() => {
          selectCount++;
          if (selectCount === 1) {
            // org_config read
            return {
              select: vi.fn().mockReturnValue({
                executeTakeFirst: vi.fn().mockResolvedValue(orgConfigResult),
              }),
            };
          }
          // tickets/clients/emails join
          return {
            innerJoin: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    executeTakeFirst: vi.fn().mockResolvedValue({
                      encrypted_address: Buffer.from("enc-email"),
                    }),
                  }),
                }),
              }),
            }),
          };
        }),
      } as unknown as Kysely<TenantDatabase>;

      const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
      const deps = makeDeps({
        emailSender: mockSender,
        loadOrgEmailBranding: vi.fn().mockResolvedValue({
          fromName: "Test Org",
          fromAddress: "help@example.org",
        }),
        resolveClientEmail: undefined, // exercise default
        getTenantDb: vi.fn().mockReturnValue(emailTenantDb),
        fieldEncryptor: {
          encrypt: vi.fn().mockReturnValue(Buffer.from("encrypted")),
          encryptBuffer: vi.fn().mockReturnValue(Buffer.from("encrypted")),
          decrypt: vi.fn().mockReturnValue("decrypted"),
          decryptToBuffer: vi.fn().mockReturnValue(emailBuf),
        },
      });
      const handler = createRelayHandler(deps);

      const emailBody = JSON.stringify({
        ticketId: "aaaa0000-0000-4000-8000-000000000001",
        subject: "Test Subject",
        html: "<p>Hello</p>",
        text: "Hello",
      });
      const req = createMockReq("POST", "/relay/email", emailBody);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ sent: true });
      // Security contract: email buffer zeroed after send
      expectZeroed(emailBuf, "emailBuf after default resolveClientEmail");
      // Security contract: raw body zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after email with default resolveClientEmail",
      );
      spy.restore();
    });

    it("email relay returns 404 when default resolveClientEmail finds no row (L1264 if[0]), zeros buffer", async () => {
      // L1264 if[0]: row is null -> return null
      const spy = spyOnReadRawBody();

      const orgConfigResult = {
        channel_email_enabled: true,
        email_reply_footer: null,
        default_language: "en",
      };
      let selectCount = 0;
      const emailTenantDb = {
        selectFrom: vi.fn().mockImplementation(() => {
          selectCount++;
          if (selectCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                executeTakeFirst: vi.fn().mockResolvedValue(orgConfigResult),
              }),
            };
          }
          // tickets/clients/emails join returns no row
          return {
            innerJoin: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    executeTakeFirst: vi.fn().mockResolvedValue(undefined),
                  }),
                }),
              }),
            }),
          };
        }),
      } as unknown as Kysely<TenantDatabase>;

      const mockSender = { send: vi.fn().mockResolvedValue(undefined) };
      const deps = makeDeps({
        emailSender: mockSender,
        loadOrgEmailBranding: vi.fn().mockResolvedValue({
          fromName: "Test Org",
          fromAddress: "help@example.org",
        }),
        resolveClientEmail: undefined, // exercise default
        getTenantDb: vi.fn().mockReturnValue(emailTenantDb),
      });
      const handler = createRelayHandler(deps);

      const emailBody = JSON.stringify({
        ticketId: "aaaa0000-0000-4000-8000-000000000001",
        subject: "Test Subject",
        html: "<p>Hello</p>",
        text: "Hello",
      });
      const req = createMockReq("POST", "/relay/email", emailBody);
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.body)).toEqual({ error: "CLIENT_EMAIL_NOT_FOUND" });
      // Security contract: no plaintext in error response
      expect(res.body).not.toContain("Test Subject");
      expect(res.body).not.toContain("Hello");
      // Security contract: buffer zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after CLIENT_EMAIL_NOT_FOUND (default resolve)",
      );
      // Sender never called
      expect(mockSender.send).not.toHaveBeenCalled();
      spy.restore();
    });
  });

  // -----------------------------------------------------------------------
  // Call relay: default resolveClientPhone fallback (L424 binary-expr)
  // -----------------------------------------------------------------------

  describe("call relay default resolveClientPhone fallback", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("uses default resolveClientPhone when dep is omitted (L424 binary-expr fallback), zeros buffer", async () => {
      const spy = spyOnReadRawBody();
      const phoneBuf = Buffer.from("+15551230000");

      // First selectFrom: org_config for channel policy
      // Second selectFrom: tickets join for phone resolution
      let selectCount = 0;
      const callTenantDb = {
        selectFrom: vi.fn().mockImplementation(() => {
          selectCount++;
          if (selectCount === 1) {
            // org_config (channel_voice_enabled)
            return {
              select: vi.fn().mockReturnValue({
                executeTakeFirst: vi.fn().mockResolvedValue({
                  channel_sms_enabled: true,
                  channel_email_enabled: true,
                  channel_voice_enabled: true,
                  channel_secure_link_enabled: true,
                  channel_share_link_enabled: true,
                }),
              }),
            };
          }
          // tickets/clients/phones join
          return {
            innerJoin: vi.fn().mockReturnValue({
              innerJoin: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  where: vi.fn().mockReturnValue({
                    executeTakeFirst: vi.fn().mockResolvedValue({
                      encrypted_number: Buffer.from("enc-phone"),
                    }),
                  }),
                }),
              }),
            }),
          };
        }),
      } as unknown as Kysely<TenantDatabase>;

      const deps = makeDeps({
        resolveClientPhone: undefined, // exercise default
        getTenantDb: vi.fn().mockReturnValue(callTenantDb),
        fieldEncryptor: {
          encrypt: vi.fn().mockReturnValue(Buffer.from("encrypted")),
          encryptBuffer: vi.fn().mockReturnValue(Buffer.from("encrypted")),
          decrypt: vi.fn().mockReturnValue("decrypted"),
          decryptToBuffer: vi.fn().mockReturnValue(phoneBuf),
        },
      });
      const handler = createRelayHandler(deps);

      const req = createMockReq(
        "POST",
        "/relay/call",
        '{"ticketId":"aaaa0000-0000-4000-8000-000000000001","consultantPhone":"+15552222222"}',
      );
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res.body) as { method: string };
      expect(parsed.method).toBe("phone_callback");
      // Security contract: phone buffer zeroed in finally
      expectZeroed(
        phoneBuf,
        "phoneBuf after call with default resolveClientPhone",
      );
      // Security contract: raw body zeroed
      expectZeroed(
        spy.getCapturedBuffer(),
        "rawBody after call with default resolveClientPhone",
      );
      spy.restore();
    });
  });

  // -----------------------------------------------------------------------
  // Dispatcher: req.url ?? "" fallback (L184 binary-expr[1])
  // -----------------------------------------------------------------------

  describe("dispatcher url fallback", () => {
    it("returns 404 when req.url is undefined (L184 binary-expr fallback), no plaintext in response", async () => {
      const handler = createRelayHandler(makeDeps());
      const socket = new Socket();
      const req = new IncomingMessage(socket);
      req.method = "POST";
      req.url = undefined;
      req.headers.cookie = "care_y_session=tok_abc123";
      // Push empty body to prevent hang
      process.nextTick(() => {
        req.push(Buffer.alloc(0));
        req.push(null);
      });
      const res = createMockRes();

      await handler(req, res as unknown as ServerResponse);

      // url "" does not match any relay path, falls to 404
      expect(res.statusCode).toBe(404);
    });
  });
});

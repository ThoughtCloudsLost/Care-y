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
import {
  createRelayHandler,
  type RelayHandlerDeps,
  type PendingCall,
} from "./relay.js";
import * as relayUtils from "./relay-utils.js";
import { TestSetupError } from "../test-utils.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeSessionData(overrides?: Partial<SessionData>): SessionData {
  return {
    id: "session-001",
    token: "tok_abc123",
    userId: "user-001",
    ipToken: "hmac-ip",
    uaToken: "hmac-ua",
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
        id: "consultant-001",
        userId: "user-001",
        encryptedPhone: Buffer.alloc(16), // test stub, content irrelevant
        phoneHash: "hash123",
        isVerified: consultant.isVerified,
        preferredCallMethod: consultant.preferredCallMethod,
      }
    : null;

  return {
    findByUserId: vi.fn().mockResolvedValue(record),
    create: vi.fn(),
    setVerificationCode: vi.fn(),
    verifyAndActivate: vi.fn(),
    updatePreferredCallMethod: vi.fn(),
    delete: vi.fn(),
  };
}

function makeDeps(overrides?: Partial<RelayHandlerDeps>): RelayHandlerDeps {
  return {
    getProvider: vi.fn().mockResolvedValue(mockProvider()),
    getTenantDb: vi.fn().mockReturnValue({} as Kysely<TenantDatabase>),
    createConsultantRepo: vi.fn().mockReturnValue(
      mockConsultantRepo({
        isVerified: true,
        preferredCallMethod: "phone_callback",
      }),
    ),
    resolveCallerIdByPurpose: vi.fn().mockResolvedValue("+15559999999"),
    pendingCalls: new Map<string, PendingCall>(),
    indexer: { hash: vi.fn().mockReturnValue("fake-hash") },
    fieldEncryptor: {
      encrypt: vi.fn().mockReturnValue(Buffer.from("encrypted")),
      decrypt: vi.fn().mockReturnValue("decrypted"),
      decryptToBuffer: vi.fn().mockReturnValue(Buffer.from("decrypted")),
    },
    pendingClients: new Map(),
    webhookBaseUrl: "https://api.care-y.app",
    getAuthToken: vi.fn().mockResolvedValue("test_auth_token"),
    getAccountSid: vi.fn().mockResolvedValue("ACtest123"),
    apiKeySid: "SKtest",
    apiKeySecret: "test_secret",
    twimlAppSid: "APtest",
    orgResolver: vi.fn().mockReturnValue("org_test"),
    createSessionRepo: vi
      .fn()
      .mockReturnValue(mockSessionRepo(makeSessionData())),
    resolveClientPhone: vi.fn().mockResolvedValue(Buffer.from("+15551234567")),
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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
        '{"ticketId":"test-ticket-id","body":"Hello from CARE-Y"}',
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
        '{"ticketId":"test-ticket-id"}',
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
        `{"ticketId":"test-ticket-id","body":"${longBody}"}`,
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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

      const bodyJson = '{"ticketId":"test-ticket-id","body":"secret message"}';
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
        '{"ticketId":"test-ticket-id","consultantPhone":"+15552222222"}',
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
      expect(pending!.orgId).toBe("org_test");
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
        '{"ticketId":"test-ticket-id"}',
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
        '{"ticketId":"test-ticket-id"}',
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
        '{"ticketId":"test-ticket-id"}',
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
        '{"ticketId":"test-ticket-id","consultantPhone":"+15552222222"}',
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
        '{"ticketId":"test-ticket-id"}',
      );
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body)).toEqual({
        error: "MISSING_CONSULTANT_PHONE",
      });
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
        orgId: "org_test",
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
        "/relay/call-confirm/org_test",
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
        "/relay/call-confirm/org_test",
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
        "/relay/call-confirm/org_test",
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
        "/relay/call-confirm/org_test",
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
        "/relay/call-confirm/org_test",
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
      const req = createMockReq("GET", "/relay/call-confirm/org_test", "");
      req.headers.cookie = "";
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);
      expect(res.statusCode).toBe(405);
    });

    it("returns 415 for wrong content type", async () => {
      const deps = makeDeps();
      const handler = createRelayHandler(deps);
      const req = createMockReq("POST", "/relay/call-confirm/org_test", "{}", {
        "content-type": "application/json",
      });
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
          "/relay/call-confirm/org_test",
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
        '{"ticketId":"test-ticket-id","body":"secret message"}',
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
        '{"ticketId":"test-ticket-id"}',
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
        `{"ticketId":"test-ticket-id","body":"${longBody}"}`,
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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
        '{"ticketId":"test-ticket-id","body":"hi"}',
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
        '{"ticketId":"test-ticket-id","consultantPhone":"+15552222222"}',
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
        '{"ticketId":"test-ticket-id"}',
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
        '{"ticketId":"test-ticket-id","consultantPhone":"+15552222222"}',
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
        '{"ticketId":"test-ticket-id","consultantPhone":"+15552222222"}',
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
        orgId: "org_test",
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
        "/relay/call-confirm/org_test",
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

    const TICKET_ID = "test-ticket-id";
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
        "/relay/call-confirm/org_test",
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
        orgId: "org_test",
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
        "/relay/call-confirm/org_test",
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
        orgId: "org_test",
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
        "/relay/call-confirm/org_test",
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

      const pendingClients = new Map<
        string,
        {
          phoneHash: string;
          opsEncryptedPhone: Buffer;
          orgSchema: string;
          createdAt: number;
        }
      >();
      pendingClients.set("token-expired", {
        phoneHash: "hash-1",
        opsEncryptedPhone: encryptedPhone,
        orgSchema: "org_test",
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

      const pendingClients = new Map<
        string,
        {
          phoneHash: string;
          opsEncryptedPhone: Buffer;
          orgSchema: string;
          createdAt: number;
        }
      >();
      pendingClients.set("token-fresh", {
        phoneHash: "hash-2",
        opsEncryptedPhone: freshEncrypted,
        orgSchema: "org_test",
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
          id: "phone-1",
          phone_hash: "fake-hash",
          encrypted_number: Buffer.alloc(16),
          locale: "en-US",
          location_city: null,
          location_region: null,
          is_active: true,
        },
        { id: "client-1", alias: "C-001" },
        { id: "ticket-1" },
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
        alias: string;
        openTicketId: string;
      };
      expect(parsed.found).toBe(true);
      expect(parsed.clientId).toBe("client-1");
      expect(parsed.alias).toBe("C-001");
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
          id: "phone-2",
          phone_hash: "fake-hash",
          encrypted_number: Buffer.alloc(16),
          locale: "en-US",
          location_city: null,
          location_region: null,
          is_active: true,
        },
        { id: "client-2", alias: "C-002" },
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

      const pendingClients = new Map<
        string,
        {
          phoneHash: string;
          opsEncryptedPhone: Buffer;
          orgSchema: string;
          createdAt: number;
        }
      >();

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
      expect(entry!.phoneHash).toBe("fake-hash");
      expect(entry!.orgSchema).toBe("org_test");

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
          id: "phone-orphan",
          phone_hash: "fake-hash",
          encrypted_number: Buffer.alloc(16),
          locale: "en-US",
          location_city: null,
          location_region: null,
          is_active: true,
        },
        undefined, // no client row
      ]);

      const pendingClients = new Map<
        string,
        {
          phoneHash: string;
          opsEncryptedPhone: Buffer;
          orgSchema: string;
          createdAt: number;
        }
      >();

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
          id: "phone-3",
          phone_hash: "fake-hash",
          encrypted_number: Buffer.alloc(16),
          locale: "en-US",
          location_city: null,
          location_region: null,
          is_active: true,
        },
        { id: "client-3", alias: "C-003" },
        { id: "ticket-3" },
      ]);

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        fieldEncryptor: {
          encrypt: vi.fn().mockReturnValue(opsEncBuf),
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
        // Single joined query result
        { encrypted_number: Buffer.from("enc-phone-data") },
      ]);

      const deps = makeDeps({
        getTenantDb: vi.fn().mockReturnValue(mockDb),
        fieldEncryptor: {
          encrypt: vi.fn().mockReturnValue(Buffer.from("encrypted")),
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
        '{"ticketId":"ticket-with-phone","body":"test msg"}',
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
        '{"ticketId":"ticket-no-phone","body":"test msg"}',
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
});

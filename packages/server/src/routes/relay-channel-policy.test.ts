/**
 * Tests for channel policy guards on outbound relay handlers.
 *
 * When a channel is disabled via org_config, the relay returns 403
 * with the corresponding error code and never invokes the provider
 * or email sender.
 */

import { describe, it, expect, vi } from "vitest";
import { IncomingMessage, type ServerResponse } from "node:http";
import { Socket } from "node:net";
import type { TelephonyProvider } from "../telephony/provider.js";
import type { SessionData } from "../auth/session-repository.js";
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
import { createCallTracker } from "../telephony/call-tracker.js";
import { testSealedBox } from "../test-utils.js";
import type { ConsultantService } from "../telephony/consultant-service.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEST_ORG_UUID = "00000000-0000-4000-8000-aaaaaaaaaaaa" as OrgId;
const TEST_ORG_SCHEMA = "org_00000000-0000-4000-8000-aaaaaaaaaaaa" as OrgSchema;

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

function mockBlindIndexer(): BlindIndexer {
  return {
    hash: vi.fn().mockReturnValue("fake-hash"),
    hashBuffer: vi.fn().mockReturnValue("fake-hash"),
    hashIdentifier: vi.fn().mockReturnValue("id-hash" as IdentifierHash),
    hashUsername: vi.fn().mockReturnValue("user-hash" as UsernameHash),
    hashPhone: vi.fn().mockReturnValue("phone-hash" as PhoneHash),
    hashPhoneBuffer: vi.fn().mockReturnValue("phone-hash" as PhoneHash),
    hashConsultantPhoneBuffer: vi
      .fn()
      .mockReturnValue("cons-hash" as OpsPhoneHash),
  };
}

function mockProvider(): TelephonyProvider {
  return {
    providerId: "mock",
    sendSms: vi.fn().mockResolvedValue({ messageId: "SM_test" }),
    initiateOutboundCall: vi.fn().mockResolvedValue("CA_test"),
    initiateWebRtcCall: vi.fn().mockResolvedValue("CA_test"),
    validateWebhook: vi.fn().mockReturnValue(true),
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
  };
}

function mockTenantDb(
  policyOverrides?: Record<string, boolean>,
): Kysely<TenantDatabase> {
  const policyRow = {
    channel_sms_enabled: true,
    channel_email_enabled: true,
    channel_voice_enabled: true,
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

function makeDeps(
  tenantDb: Kysely<TenantDatabase>,
  providerInstance?: TelephonyProvider,
): RelayHandlerDeps {
  const provider = providerInstance ?? mockProvider();
  const sessionData: SessionData = {
    id: "00000000-0000-4000-8000-000000000010" as SessionId,
    token: "tok_abc123" as SessionToken,
    userId: "00000000-0000-4000-8000-000000000020" as UserId,
    ipToken: "hmac-ip" as IpToken,
    uaToken: "hmac-ua" as UaToken,
    expiresAt: new Date(Date.now() + 3600_000),
    twofaVerified: true,
    webauthnChallenge: null,
  };

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
    replyTokenHasher: { hash: vi.fn().mockReturnValue("hash") },
    replyTokenCache: new Map<string, string>(),
    getProvider: vi.fn().mockResolvedValue(provider),
    getTenantDb: vi.fn().mockReturnValue(tenantDb),
    createConsultantRepo: vi.fn().mockReturnValue({
      findByUserId: vi.fn().mockResolvedValue({
        id: "c-1" as ConsultantId,
        userId: sessionData.userId,
        encryptedPhone: Buffer.alloc(16),
        isVerified: true,
        preferredCallMethod: "phone_callback",
        opsPhoneHash: "cons-hash" as OpsPhoneHash,
        opsEncryptedPhone: null,
        smsPingsEnabled: false,
        verificationCodeHash: null,
        verificationExpiresAt: null,
        verificationAttempts: 0,
        verifySendsHourStart: null,
        verifySendsInHour: 0,
        verifyLastSentAt: null,
      }),
      create: vi.fn(),
      setVerificationCode: vi.fn(),
      stageVerification: vi.fn(),
      verifyAndActivate: vi.fn(),
      incrementVerificationAttempts: vi.fn(),
      clearVerificationCode: vi.fn(),
      updatePreferredCallMethod: vi.fn(),
      setSmsPingsEnabled: vi.fn(),
      delete: vi.fn(),
    }),
    resolveCallerIdByPurpose: vi.fn().mockResolvedValue("+15559999999" as E164),
    pendingCalls: new Map<string, PendingCall>(),
    indexer: mockBlindIndexer(),
    fieldEncryptor: {
      // care-y-ignore-next-line relay-buffer-zero -- test mock return value, not production plaintext
      encrypt: vi.fn().mockReturnValue(Buffer.from("enc")),
      // care-y-ignore-next-line relay-buffer-zero -- test mock return value, not production plaintext
      encryptBuffer: vi.fn().mockReturnValue(Buffer.from("enc")),
      decrypt: vi.fn().mockReturnValue("dec"),
      // care-y-ignore-next-line relay-buffer-zero -- test mock return value, not production plaintext
      decryptToBuffer: vi.fn().mockReturnValue(Buffer.from("dec")),
    },
    pendingClients: new Map(),
    callTracker: createCallTracker(),
    webhookBaseUrl: "https://api.care-y.app",
    getAuthToken: vi.fn().mockResolvedValue("auth"),
    getAccountSid: vi.fn().mockResolvedValue("ACtest"),
    apiKeySid: "SKtest",
    apiKeySecret: "secret",
    twimlAppSid: "APtest",
    orgResolver: vi
      .fn()
      .mockReturnValue({ orgId: TEST_ORG_UUID, orgSchema: TEST_ORG_SCHEMA }),
    createSessionRepo: vi.fn().mockReturnValue({
      findByToken: vi.fn().mockResolvedValue(sessionData),
      create: vi.fn(),
      deleteByToken: vi.fn(),
      deleteByUserId: vi.fn(),
      deleteByUserIdExceptToken: vi.fn().mockResolvedValue(0),
      deleteExpired: vi.fn(),
      markTwoFactorVerified: vi.fn(),
      clearTwoFactorVerified: vi.fn(),
      setWebauthnChallenge: vi.fn(),
    }),
    // care-y-ignore-next-line relay-buffer-zero -- test mock return value, not production plaintext
    resolveClientPhone: vi.fn().mockResolvedValue(Buffer.from("+15551234567")),
    consultantPhoneIndexer: mockBlindIndexer(),
    getSealedBoxEncryptor: vi.fn().mockResolvedValue(testSealedBox),
    createConsultantService: vi.fn().mockReturnValue({
      getByUserId: vi.fn().mockResolvedValue(null),
      register: vi.fn().mockResolvedValue({ id: "c-1" as ConsultantId }),
      prepareVerification: vi.fn().mockResolvedValue({ code: "123456" }),
      verify: vi.fn(),
      updatePreference: vi.fn(),
      deleteByUserId: vi.fn(),
      setSmsPings: vi.fn(),
    } satisfies ConsultantService),
  };
}

function createMockReq(url: string, body: string): IncomingMessage {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  req.method = "POST";
  req.url = url;
  req.headers.cookie = "care_y_session=tok_abc123";
  // care-y-ignore-next-line relay-buffer-zero -- test fixture data (hardcoded JSON), not production plaintext
  const chunk = Buffer.from(body);
  process.nextTick(() => {
    req.push(chunk);
    req.push(null);
  });
  return req;
}

interface CapturedResponse {
  statusCode: number;
  body: string;
  writeHead: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  setHeader: ReturnType<typeof vi.fn>;
}

function createMockRes(): CapturedResponse {
  const captured: CapturedResponse = {
    statusCode: 0,
    body: "",
    writeHead: vi.fn((status: number) => {
      captured.statusCode = status;
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

describe("relay channel policy guards", () => {
  const smsBody = JSON.stringify({
    ticketId: "aaaa0000-0000-4000-8000-000000000001",
    body: "Hello",
  });

  describe("SMS relay", () => {
    it("returns 403 SMS_DISABLED when channel_sms_enabled is false", async () => {
      const tDb = mockTenantDb({ channel_sms_enabled: false });
      const provider = mockProvider();
      const deps = makeDeps(tDb, provider);
      const handler = createRelayHandler(deps);

      const req = createMockReq("/relay/sms", smsBody);
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({ error: "SMS_DISABLED" });
      expect(provider.sendSms).not.toHaveBeenCalled();
    });

    it("proceeds past guard when channel_sms_enabled is true", async () => {
      const tDb = mockTenantDb({ channel_sms_enabled: true });
      const deps = makeDeps(tDb);
      const handler = createRelayHandler(deps);

      const req = createMockReq("/relay/sms", smsBody);
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      // Should not be 403 SMS_DISABLED (may be another error due to
      // incomplete mocks, but the policy guard is passed).
      const parsed = JSON.parse(res.body) as { error?: string };
      expect(parsed.error).not.toBe("SMS_DISABLED");
    });
  });

  describe("email relay", () => {
    const emailBody = JSON.stringify({
      ticketId: "aaaa0000-0000-4000-8000-000000000001",
      subject: "Subject",
      html: "<p>Hi</p>",
      text: "Hi",
    });

    it("returns 403 EMAIL_DISABLED when channel_email_enabled is false", async () => {
      const tDb = mockTenantDb({ channel_email_enabled: false });
      // The handler checks for a configured email transport before the
      // policy guard, so the guard is only reachable with these present.
      const deps: RelayHandlerDeps = {
        ...makeDeps(tDb),
        emailSender: { send: vi.fn() } as unknown as NonNullable<
          RelayHandlerDeps["emailSender"]
        >,
        loadOrgEmailBranding: vi
          .fn()
          .mockResolvedValue(null) as unknown as NonNullable<
          RelayHandlerDeps["loadOrgEmailBranding"]
        >,
      };
      const handler = createRelayHandler(deps);

      const req = createMockReq("/relay/email", emailBody);
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({ error: "EMAIL_DISABLED" });
    });
  });

  describe("call relay", () => {
    const callBody = JSON.stringify({
      ticketId: "aaaa0000-0000-4000-8000-000000000001",
      consultantPhone: "+15559998888",
    });

    it("returns 403 VOICE_DISABLED when channel_voice_enabled is false", async () => {
      const tDb = mockTenantDb({ channel_voice_enabled: false });
      const provider = mockProvider();
      const deps = makeDeps(tDb, provider);
      const handler = createRelayHandler(deps);

      const req = createMockReq("/relay/call", callBody);
      const res = createMockRes();
      await handler(req, res as unknown as ServerResponse);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body)).toEqual({ error: "VOICE_DISABLED" });
      expect(provider.initiateOutboundCall).not.toHaveBeenCalled();
    });
  });
});

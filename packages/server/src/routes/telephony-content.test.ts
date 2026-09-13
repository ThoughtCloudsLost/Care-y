/**
 * Unit tests for the telephony content tRPC router.
 *
 * Tests CRUD wiring for PhoneGreeting and SMSResponse endpoints.
 * Service layer is injected via deps; these verify that the router
 * delegates correctly and returns expected shapes.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTelephonyContentRouter } from "./telephony-content.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { TelephonyContentService } from "../telephony/telephony-content-service.js";
import type { GreetingRecord } from "../telephony/models/greeting-repo.js";
import type { SmsResponseRecord } from "../telephony/models/sms-response-repo.js";
import { RoleId } from "@care-y/shared";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  OrgId,
  OrgSlug,
  OrgSchema,
  E164,
  PhoneGreetingId,
  SmsResponseId,
  BlobKey,
} from "@care-y/shared";
import { expectTrpcError, stubTenantDbDefaultRoles } from "../test-utils.js";

// --- Mock service ---

function createMockService(): TelephonyContentService {
  return {
    listGreetings: vi.fn(),
    createGreeting: vi.fn(),
    updateGreeting: vi.fn(),
    deleteGreeting: vi.fn(),
    uploadGreetingAudio: vi.fn(),
    createAudioGreeting: vi.fn(),
    getGreetingAudio: vi.fn(),
    listSmsResponses: vi.fn(),
    createSmsResponse: vi.fn(),
    updateSmsResponse: vi.fn(),
    deleteSmsResponse: vi.fn(),
  };
}

function createMockBlobStore() {
  return {
    put: vi.fn().mockResolvedValue("blob-key-123" as BlobKey),
    get: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
  };
}

// --- Fixtures ---

const PHONE_NUMBER = "+15551234567" as E164;
const GREETING_ID = "00000000-0000-4000-8000-000000000010" as PhoneGreetingId;
const SMS_RESPONSE_ID = "00000000-0000-4000-8000-000000000020" as SmsResponseId;

const GREETING_RECORD: GreetingRecord = {
  id: GREETING_ID,
  phoneNumber: PHONE_NUMBER,
  greetingType: "answer",
  locale: "en",
  text: "Welcome to CARE-Y",
  isAudio: false,
  audioBlobKey: null,
  audioContentType: null,
};

const SMS_RESPONSE_RECORD: SmsResponseRecord = {
  id: SMS_RESPONSE_ID,
  responseType: "new_client",
  locale: "en",
  text: "Thank you for contacting us.",
};

// --- Context helpers ---

const FIXTURE_USER_ID = "00000000-0000-4000-8000-000000000f01" as UserId;
const FIXTURE_ORG_ID = "00000000-0000-4000-8000-00000000ff00" as OrgId;
const FIXTURE_ORG_SCHEMA =
  "org_00000000-0000-4000-8000-00000000ff00" as OrgSchema;

function createMockOrgContext(): OrgContext {
  return {
    orgId: FIXTURE_ORG_ID,
    orgSlug: "test-org" as OrgSlug,
    orgSchema: FIXTURE_ORG_SCHEMA,
    tenantDb: stubTenantDbDefaultRoles(),
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function createAdminContext(): Context {
  return {
    req: {} as Context["req"],
    res: {} as Context["res"],
    org: createMockOrgContext(),
    session: {
      id: "00000000-0000-4000-8000-0000000f0010" as SessionId,
      token: "tok-1" as SessionToken,
      userId: FIXTURE_USER_ID,
      ipToken: "ip-tok" as IpToken,
      uaToken: "ua-tok" as UaToken,
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: FIXTURE_USER_ID,
      encryptedIdentifier: "admin",
      encryptedDisplayName: "encrypted",
      encryptedPreferredLocale: null,
      roleId: RoleId.ADMIN,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

// --- Tests ---

function buildCaller(
  mockService: TelephonyContentService,
  blobStore = createMockBlobStore(),
) {
  const routerInstance = createTelephonyContentRouter({
    createService: () => mockService,
    blobStore,
  });
  return createCallerFactory(routerInstance)(createAdminContext());
}

describe("createTelephonyContentRouter", () => {
  let mockService: TelephonyContentService;
  let caller: ReturnType<typeof buildCaller>;

  beforeEach(() => {
    mockService = createMockService();
    caller = buildCaller(mockService);
  });

  describe("listGreetings", () => {
    it("returns greetings for a phone number", async () => {
      vi.mocked(mockService.listGreetings).mockResolvedValue([GREETING_RECORD]);

      const result = await caller.listGreetings({
        phoneNumber: PHONE_NUMBER,
      });

      expect(result).toEqual([GREETING_RECORD]);
      expect(mockService.listGreetings).toHaveBeenCalledWith(PHONE_NUMBER);
    });

    it("returns all greetings when phoneNumber is omitted", async () => {
      vi.mocked(mockService.listGreetings).mockResolvedValue([GREETING_RECORD]);

      const result = await caller.listGreetings({});

      expect(result).toEqual([GREETING_RECORD]);
      expect(mockService.listGreetings).toHaveBeenCalledWith(undefined);
    });
  });

  describe("getGreetingAudio", () => {
    it("returns audio data from service", async () => {
      const audioResult = {
        audioBase64: "QUFBQQ==",
        contentType: "audio/wav",
      };
      vi.mocked(mockService.getGreetingAudio).mockResolvedValue(audioResult);

      const result = await caller.getGreetingAudio({
        greetingId: GREETING_ID,
      });

      expect(result).toEqual(audioResult);
      expect(mockService.getGreetingAudio).toHaveBeenCalled();
    });

    it("rejects with INTERNAL_SERVER_ERROR when blobStore is not configured", async () => {
      const noBlobRouter = createTelephonyContentRouter({
        createService: () => mockService,
        blobStore: undefined,
      });
      const noBlobCaller =
        createCallerFactory(noBlobRouter)(createAdminContext());

      await expectTrpcError(
        noBlobCaller.getGreetingAudio({ greetingId: GREETING_ID }),
        "INTERNAL_SERVER_ERROR",
      );
    });
  });

  describe("createGreeting", () => {
    it("creates a greeting", async () => {
      vi.mocked(mockService.createGreeting).mockResolvedValue(GREETING_RECORD);

      const result = await caller.createGreeting({
        phoneNumber: PHONE_NUMBER,
        greetingType: "answer",
        locale: "en",
        text: "Welcome to CARE-Y",
      });

      expect(result).toEqual(GREETING_RECORD);
      expect(mockService.createGreeting).toHaveBeenCalledWith({
        phoneNumber: PHONE_NUMBER,
        greetingType: "answer",
        locale: "en",
        text: "Welcome to CARE-Y",
        isAudio: false,
      });
    });
  });

  describe("updateGreeting", () => {
    it("updates text", async () => {
      const updated = { ...GREETING_RECORD, text: "Updated greeting" };
      vi.mocked(mockService.updateGreeting).mockResolvedValue(updated);

      const result = await caller.updateGreeting({
        id: GREETING_ID,
        text: "Updated greeting",
      });

      expect(result).toEqual(updated);
      expect(mockService.updateGreeting).toHaveBeenCalledWith(GREETING_ID, {
        phoneNumber: undefined,
        text: "Updated greeting",
        isAudio: undefined,
      });
    });

    it("updates phoneNumber (reassignment)", async () => {
      const newNumber = "+15559999999" as E164;
      const updated = { ...GREETING_RECORD, phoneNumber: newNumber };
      vi.mocked(mockService.updateGreeting).mockResolvedValue(updated);

      const result = await caller.updateGreeting({
        id: GREETING_ID,
        phoneNumber: newNumber,
      });

      expect(result).toEqual(updated);
      expect(mockService.updateGreeting).toHaveBeenCalledWith(GREETING_ID, {
        phoneNumber: newNumber,
        text: undefined,
        isAudio: undefined,
      });
    });
  });

  describe("deleteGreeting", () => {
    it("removes a greeting", async () => {
      vi.mocked(mockService.deleteGreeting).mockResolvedValue(undefined);

      const result = await caller.deleteGreeting({ id: GREETING_ID });

      expect(result).toEqual({ success: true });
      expect(mockService.deleteGreeting).toHaveBeenCalledWith(GREETING_ID);
    });
  });

  describe("listSmsResponses", () => {
    it("returns responses", async () => {
      vi.mocked(mockService.listSmsResponses).mockResolvedValue([
        SMS_RESPONSE_RECORD,
      ]);

      const result = await caller.listSmsResponses({ locale: "en" });

      expect(result).toEqual([SMS_RESPONSE_RECORD]);
      expect(mockService.listSmsResponses).toHaveBeenCalledWith("en");
    });
  });

  describe("createSmsResponse", () => {
    it("creates a response", async () => {
      vi.mocked(mockService.createSmsResponse).mockResolvedValue(
        SMS_RESPONSE_RECORD,
      );

      const result = await caller.createSmsResponse({
        responseType: "new_client",
        locale: "en",
        text: "Thank you for contacting us.",
      });

      expect(result).toEqual(SMS_RESPONSE_RECORD);
      expect(mockService.createSmsResponse).toHaveBeenCalledWith({
        responseType: "new_client",
        locale: "en",
        text: "Thank you for contacting us.",
      });
    });
  });

  describe("updateSmsResponse", () => {
    it("updates text", async () => {
      const updated = { ...SMS_RESPONSE_RECORD, text: "Updated response" };
      vi.mocked(mockService.updateSmsResponse).mockResolvedValue(updated);

      const result = await caller.updateSmsResponse({
        id: SMS_RESPONSE_ID,
        text: "Updated response",
      });

      expect(result).toEqual(updated);
      expect(mockService.updateSmsResponse).toHaveBeenCalledWith(
        SMS_RESPONSE_ID,
        { text: "Updated response" },
      );
    });
  });

  describe("deleteSmsResponse", () => {
    it("removes a response", async () => {
      vi.mocked(mockService.deleteSmsResponse).mockResolvedValue(undefined);

      const result = await caller.deleteSmsResponse({ id: SMS_RESPONSE_ID });

      expect(result).toEqual({ success: true });
      expect(mockService.deleteSmsResponse).toHaveBeenCalledWith(
        SMS_RESPONSE_ID,
      );
    });
  });

  describe("uploadGreetingAudio", () => {
    it("calls service with correct params", async () => {
      const audioResult = {
        ...GREETING_RECORD,
        isAudio: true,
        audioBlobKey: "blob-key-abc" as BlobKey,
        audioContentType: "audio/mpeg",
      };
      vi.mocked(mockService.uploadGreetingAudio).mockResolvedValue(audioResult);

      const result = await caller.uploadGreetingAudio({
        greetingId: GREETING_ID,
        audioBase64: "AAAA",
        contentType: "audio/mpeg",
      });

      expect(result).toEqual(audioResult);
      expect(mockService.uploadGreetingAudio).toHaveBeenCalled();
    });

    it("rejects with TOO_MANY_REQUESTS when rate limiter denies", async () => {
      const limitedRouter = createTelephonyContentRouter({
        createService: () => mockService,
        blobStore: createMockBlobStore(),
        uploadLimiter: {
          check: () => ({ allowed: false, remaining: 0, retryAfterMs: 5000 }),
          reset: () => undefined,
        },
      });
      const limitedCaller =
        createCallerFactory(limitedRouter)(createAdminContext());

      await expectTrpcError(
        limitedCaller.uploadGreetingAudio({
          greetingId: GREETING_ID,
          audioBase64: "AAAA",
          contentType: "audio/mpeg",
        }),
        "TOO_MANY_REQUESTS",
      );
    });

    it("rejects with INTERNAL_SERVER_ERROR when blobStore is not configured", async () => {
      const noBlobRouter = createTelephonyContentRouter({
        createService: () => mockService,
        blobStore: undefined,
      });
      const noBlobCaller =
        createCallerFactory(noBlobRouter)(createAdminContext());

      await expectTrpcError(
        noBlobCaller.uploadGreetingAudio({
          greetingId: GREETING_ID,
          audioBase64: "AAAA",
          contentType: "audio/mpeg",
        }),
        "INTERNAL_SERVER_ERROR",
      );
    });

    it("proceeds to service when rate limiter allows", async () => {
      const audioResult = {
        ...GREETING_RECORD,
        isAudio: true,
        audioBlobKey: "blob-key-allowed" as BlobKey,
        audioContentType: "audio/mpeg",
      };
      vi.mocked(mockService.uploadGreetingAudio).mockResolvedValue(audioResult);

      const allowedRouter = createTelephonyContentRouter({
        createService: () => mockService,
        blobStore: createMockBlobStore(),
        uploadLimiter: {
          check: () => ({ allowed: true, remaining: 4, retryAfterMs: 0 }),
          reset: () => undefined,
        },
      });
      const allowedCaller =
        createCallerFactory(allowedRouter)(createAdminContext());

      const result = await allowedCaller.uploadGreetingAudio({
        greetingId: GREETING_ID,
        audioBase64: "AAAA",
        contentType: "audio/mpeg",
      });

      expect(result).toEqual(audioResult);
      expect(mockService.uploadGreetingAudio).toHaveBeenCalled();
    });
  });

  describe("createAudioGreeting", () => {
    it("creates an audio greeting via service", async () => {
      const audioResult = {
        ...GREETING_RECORD,
        isAudio: true,
        audioBlobKey: "blob-key-new" as BlobKey,
        audioContentType: "audio/wav",
      };
      vi.mocked(mockService.createAudioGreeting).mockResolvedValue(audioResult);

      const result = await caller.createAudioGreeting({
        phoneNumber: PHONE_NUMBER,
        locale: "en",
        greetingType: "answer",
        audioBase64: "AAAA",
        contentType: "audio/wav",
      });

      expect(result).toEqual(audioResult);
      expect(mockService.createAudioGreeting).toHaveBeenCalled();
    });

    it("rejects with TOO_MANY_REQUESTS when rate limiter denies", async () => {
      const limitedRouter = createTelephonyContentRouter({
        createService: () => mockService,
        blobStore: createMockBlobStore(),
        uploadLimiter: {
          check: () => ({ allowed: false, remaining: 0, retryAfterMs: 12000 }),
          reset: () => undefined,
        },
      });
      const limitedCaller =
        createCallerFactory(limitedRouter)(createAdminContext());

      await expectTrpcError(
        limitedCaller.createAudioGreeting({
          phoneNumber: PHONE_NUMBER,
          locale: "en",
          greetingType: "answer",
          audioBase64: "AAAA",
          contentType: "audio/wav",
        }),
        "TOO_MANY_REQUESTS",
      );
    });

    it("rejects with INTERNAL_SERVER_ERROR when blobStore is not configured", async () => {
      const noBlobRouter = createTelephonyContentRouter({
        createService: () => mockService,
        blobStore: undefined,
      });
      const noBlobCaller =
        createCallerFactory(noBlobRouter)(createAdminContext());

      await expectTrpcError(
        noBlobCaller.createAudioGreeting({
          phoneNumber: PHONE_NUMBER,
          locale: "en",
          greetingType: "answer",
          audioBase64: "AAAA",
          contentType: "audio/wav",
        }),
        "INTERNAL_SERVER_ERROR",
      );
    });

    it("proceeds to service when rate limiter allows", async () => {
      const audioResult = {
        ...GREETING_RECORD,
        isAudio: true,
        audioBlobKey: "blob-key-allowed-audio" as BlobKey,
        audioContentType: "audio/wav",
      };
      vi.mocked(mockService.createAudioGreeting).mockResolvedValue(audioResult);

      const allowedRouter = createTelephonyContentRouter({
        createService: () => mockService,
        blobStore: createMockBlobStore(),
        uploadLimiter: {
          check: () => ({ allowed: true, remaining: 4, retryAfterMs: 0 }),
          reset: () => undefined,
        },
      });
      const allowedCaller =
        createCallerFactory(allowedRouter)(createAdminContext());

      const result = await allowedCaller.createAudioGreeting({
        phoneNumber: PHONE_NUMBER,
        locale: "en",
        greetingType: "answer",
        audioBase64: "AAAA",
        contentType: "audio/wav",
      });

      expect(result).toEqual(audioResult);
      expect(mockService.createAudioGreeting).toHaveBeenCalled();
    });
  });
});

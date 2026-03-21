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

// --- Mock service ---

function createMockService(): TelephonyContentService {
  return {
    listGreetings: vi.fn(),
    createGreeting: vi.fn(),
    updateGreeting: vi.fn(),
    deleteGreeting: vi.fn(),
    listSmsResponses: vi.fn(),
    createSmsResponse: vi.fn(),
    updateSmsResponse: vi.fn(),
    deleteSmsResponse: vi.fn(),
  };
}

// --- Fixtures ---

const PHONE_ID = "00000000-0000-4000-8000-000000000001";
const GREETING_ID = "00000000-0000-4000-8000-000000000010";
const SMS_RESPONSE_ID = "00000000-0000-4000-8000-000000000020";

const GREETING_RECORD: GreetingRecord = {
  id: GREETING_ID,
  phoneId: PHONE_ID,
  greetingType: "answer",
  locale: "en",
  text: "Welcome to CARE-Y",
  isAudio: false,
  audioBlobKey: null,
};

const SMS_RESPONSE_RECORD: SmsResponseRecord = {
  id: SMS_RESPONSE_ID,
  responseType: "new_client",
  locale: "en",
  text: "Thank you for contacting us.",
};

// --- Context helpers ---

function createMockOrgContext(): OrgContext {
  return {
    orgId: "org-content-test",
    orgSlug: "test-org",
    orgSchema: "org_test",
    tenantDb: {} as OrgContext["tenantDb"],
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function createAdminContext(): Context {
  return {
    req: {} as Context["req"],
    res: {} as Context["res"],
    org: createMockOrgContext(),
    session: {
      id: "sess-1",
      token: "tok-1",
      userId: "user-1",
      ipToken: "ip-tok",
      uaToken: "ua-tok",
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: "user-1",
      identifier: "admin",
      encryptedDisplayName: "encrypted",
      roleId: RoleId.ADMIN,
      isActive: true,
    },
  };
}

// --- Tests ---

function buildCaller(mockService: TelephonyContentService) {
  const routerInstance = createTelephonyContentRouter({
    createService: () => mockService,
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
    it("returns greetings for a phone", async () => {
      vi.mocked(mockService.listGreetings).mockResolvedValue([GREETING_RECORD]);

      const result = await caller.listGreetings({ phoneId: PHONE_ID });

      expect(result).toEqual([GREETING_RECORD]);
      expect(mockService.listGreetings).toHaveBeenCalledWith(PHONE_ID);
    });
  });

  describe("createGreeting", () => {
    it("creates a greeting", async () => {
      vi.mocked(mockService.createGreeting).mockResolvedValue(GREETING_RECORD);

      const result = await caller.createGreeting({
        phoneId: PHONE_ID,
        greetingType: "answer",
        locale: "en",
        text: "Welcome to CARE-Y",
      });

      expect(result).toEqual(GREETING_RECORD);
      expect(mockService.createGreeting).toHaveBeenCalledWith({
        phoneId: PHONE_ID,
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
        text: "Updated greeting",
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
});

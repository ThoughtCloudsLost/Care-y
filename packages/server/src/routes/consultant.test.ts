/**
 * Unit tests for the consultant tRPC router.
 *
 * Tests volunteer self-service phone registration endpoints.
 * Service layer is injected via deps; these verify that the router
 * delegates correctly and returns expected shapes.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { createConsultantRouter } from "./consultant.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { ConsultantService } from "../telephony/consultant-service.js";
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
  ConsultantId,
} from "@care-y/shared";
import { AuthError, NotFoundError } from "../errors.js";

// --- Mock service ---

function createMockService(): ConsultantService {
  return {
    getByUserId: vi.fn(),
    register: vi.fn(),
    prepareVerification: vi.fn(),
    verify: vi.fn(),
    updatePreference: vi.fn(),
    deleteByUserId: vi.fn(),
    setSmsPings: vi.fn(),
  };
}

// --- Context helpers ---

const USER_ID = "00000000-0000-4000-8000-000000000d01" as UserId;
const FIXTURE_ORG_ID = "00000000-0000-4000-8000-00000000dd00" as OrgId;
const FIXTURE_ORG_SCHEMA =
  "org_00000000-0000-4000-8000-00000000dd00" as OrgSchema;

function createMockOrgContext(): OrgContext {
  return {
    orgId: FIXTURE_ORG_ID,
    orgSlug: "test-org" as OrgSlug,
    orgSchema: FIXTURE_ORG_SCHEMA,
    tenantDb: {} as OrgContext["tenantDb"],
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function createAuthed2faContext(): Context {
  return {
    req: {} as Context["req"],
    res: {} as Context["res"],
    org: createMockOrgContext(),
    session: {
      id: "00000000-0000-4000-8000-0000000d0010" as SessionId,
      token: "tok-1" as SessionToken,
      userId: USER_ID,
      ipToken: "ip-tok" as IpToken,
      uaToken: "ua-tok" as UaToken,
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: USER_ID,
      encryptedIdentifier: "volunteer",
      encryptedDisplayName: "encrypted",
      encryptedPreferredLocale: null,
      roleId: RoleId.VOLUNTEER,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

// --- Tests ---

function buildCaller(mockService: ConsultantService) {
  const routerInstance = createConsultantRouter({
    createService: () => mockService,
  });
  return createCallerFactory(routerInstance)(createAuthed2faContext());
}

describe("createConsultantRouter", () => {
  let mockService: ConsultantService;
  let caller: ReturnType<typeof buildCaller>;

  beforeEach(() => {
    mockService = createMockService();
    caller = buildCaller(mockService);
  });

  describe("get", () => {
    it("returns null when no consultant exists", async () => {
      vi.mocked(mockService.getByUserId).mockResolvedValue(null);

      const result = await caller.get();

      expect(result).toBeNull();
      expect(mockService.getByUserId).toHaveBeenCalledWith(USER_ID);
    });

    it("returns consultant info after registration", async () => {
      const info = {
        id: "consultant-1" as ConsultantId,
        isVerified: false,
        preferredCallMethod: "phone_callback",
        encryptedPhone: null as string | null,
        smsPingsEnabled: false,
        hasOpsPhone: false,
      };
      vi.mocked(mockService.getByUserId).mockResolvedValue(info);

      const result = await caller.get();

      expect(result).toEqual(info);
    });
  });

  describe("register", () => {
    it("creates consultant with metadata only (ADR-065), returns id", async () => {
      vi.mocked(mockService.register).mockResolvedValue({
        id: "consultant-1" as ConsultantId,
      });

      const result = await caller.register({
        preferredCallMethod: "phone_callback",
      });

      expect(result).toEqual({ id: "consultant-1" });
      expect(mockService.register).toHaveBeenCalledWith(
        USER_ID,
        "phone_callback",
        false, // smsPingsOptIn defaults to false
      );
    });

    it("passes smsPingsOptIn flag to service", async () => {
      vi.mocked(mockService.register).mockResolvedValue({
        id: "consultant-2" as ConsultantId,
      });

      await caller.register({
        preferredCallMethod: "webrtc",
        smsPingsOptIn: true,
      });

      expect(mockService.register).toHaveBeenCalledWith(
        USER_ID,
        "webrtc",
        true,
      );
    });
  });

  describe("verify", () => {
    it("returns success with correct code", async () => {
      vi.mocked(mockService.verify).mockResolvedValue(undefined);

      const result = await caller.verify({ code: "123456" });

      expect(result).toEqual({ success: true });
      expect(mockService.verify).toHaveBeenCalledWith(USER_ID, "123456");
    });

    it("throws on wrong code", async () => {
      vi.mocked(mockService.verify).mockRejectedValue(
        new AuthError("INVALID_VERIFICATION_CODE"),
      );

      await expect(caller.verify({ code: "000000" })).rejects.toThrow(
        TRPCError,
      );
    });
  });

  describe("updatePreference", () => {
    it("changes method", async () => {
      vi.mocked(mockService.updatePreference).mockResolvedValue(undefined);

      const result = await caller.updatePreference({
        preferredCallMethod: "webrtc",
      });

      expect(result).toEqual({ success: true });
      expect(mockService.updatePreference).toHaveBeenCalledWith(
        USER_ID,
        "webrtc",
      );
    });

    it("skips service call when preferredCallMethod is undefined", async () => {
      const result = await caller.updatePreference({});

      expect(result).toEqual({ success: true });
      expect(mockService.updatePreference).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("removes consultant", async () => {
      vi.mocked(mockService.deleteByUserId).mockResolvedValue(undefined);

      const result = await caller.delete();

      expect(result).toEqual({ success: true });
      expect(mockService.deleteByUserId).toHaveBeenCalledWith(USER_ID);
    });

    it("throws when no consultant exists", async () => {
      vi.mocked(mockService.deleteByUserId).mockRejectedValue(
        new NotFoundError("NO_CONSULTANT_REGISTRATION"),
      );

      await expect(caller.delete()).rejects.toThrow(TRPCError);
    });
  });
});

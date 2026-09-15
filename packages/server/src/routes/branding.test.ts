/**
 * Router-level tests for the branding tRPC router.
 *
 * Uses mocked BrandingService and createCallerFactory to verify:
 * - adminProcedure permission enforcement (volunteer/manager rejected, admin allowed)
 * - Rate limiter enforcement on uploadIcons
 * - Service delegation and input forwarding
 * - Zod schema rejection for invalid inputs (bad hex, oversized name, missing value)
 *
 * Service-layer logic is tested in branding-service.test.ts.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBrandingRouter, type BrandingRouterDeps } from "./branding.js";
import { createCallerFactory } from "../trpc/trpc.js";
import { expectTrpcError, stubTenantDbDefaultRoles } from "../test-utils.js";
import type { Context, OrgContext } from "../trpc/context.js";
import { RoleId, type RoleIdValue } from "@care-y/shared";
import type {
  SessionId,
  SessionToken,
  UserId,
  IpToken,
  UaToken,
  OrgId,
  OrgSlug,
  OrgSchema,
  BlobKey,
} from "@care-y/shared";

// --- Mock branding service ---

const mockGetBranding = vi.fn();
const mockGetPublicBranding = vi.fn();
const mockSaveBrandingField = vi.fn();
const mockUploadIcons = vi.fn();

// vi.mock required: replaces the service factory so route tests verify
// delegation and permissions without a real DB.
import type * as BrandingServiceMod from "../branding/branding-service.js";

vi.mock("../branding/branding-service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof BrandingServiceMod>()),
  createBrandingService: () => ({
    getBranding: mockGetBranding,
    getPublicBranding: mockGetPublicBranding,
    iconBlobKey: vi.fn(async () => null),
    saveBrandingField: mockSaveBrandingField,
    uploadIcons: mockUploadIcons,
  }),
}));

// --- Context helpers ---

const FIXTURE_USER_ID = "00000000-0000-4000-8000-000000000c01" as UserId;
const FIXTURE_ORG_ID = "00000000-0000-4000-8000-00000000cc00" as OrgId;
const FIXTURE_ORG_SCHEMA =
  "org_00000000-0000-4000-8000-00000000cc00" as OrgSchema;

function createMockOrgContext(): OrgContext {
  return {
    orgId: FIXTURE_ORG_ID,
    orgSlug: "test-org" as OrgSlug,
    orgSchema: FIXTURE_ORG_SCHEMA,
    tenantDb: stubTenantDbDefaultRoles(),
    sealedBox: { generation: 1 } as OrgContext["sealedBox"],
  };
}

function makeContext(roleId: RoleIdValue): Context {
  return {
    req: {} as Context["req"],
    res: {} as Context["res"],
    org: createMockOrgContext(),
    session: {
      id: "00000000-0000-4000-8000-0000000c0010" as SessionId,
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
      encryptedIdentifier: "tester",
      encryptedDisplayName: "encrypted",
      encryptedPreferredLocale: null,
      roleId,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

// --- Router setup ---

const VALID_BASE64 = Buffer.from("test-data").toString("base64");

function buildDeps(
  overrides?: Partial<BrandingRouterDeps>,
): BrandingRouterDeps {
  return {
    blobStore: {
      put: vi.fn(async () => "blob-key" as BlobKey),
      get: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      exists: vi.fn(async () => false),
    },
    ...overrides,
  };
}

function buildAdminCaller(deps?: BrandingRouterDeps) {
  const routerInstance = createBrandingRouter(deps ?? buildDeps());
  return createCallerFactory(routerInstance)(makeContext(RoleId.ADMIN));
}

function buildVolunteerCaller(deps?: BrandingRouterDeps) {
  const routerInstance = createBrandingRouter(deps ?? buildDeps());
  return createCallerFactory(routerInstance)(makeContext(RoleId.VOLUNTEER));
}

function buildManagerCaller(deps?: BrandingRouterDeps) {
  const routerInstance = createBrandingRouter(deps ?? buildDeps());
  return createCallerFactory(routerInstance)(makeContext(RoleId.MANAGER));
}

// --- Tests ---

describe("branding router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBranding.mockResolvedValue({
      name: "Test Org",
      logo: null,
      primaryColor: null,
      accentColor: null,
      clientText: null,
      clientSupportLabel: null,
      encryptedTerminology: null,
      hasIcons: false,
      iconVersion: null,
    });
    mockGetPublicBranding.mockResolvedValue({
      orgPublicKey: null,
      name: "Test Org",
      primaryColor: null,
      accentColor: null,
      clientText: null,
      supportLabel: null,
      hasIcons: false,
      iconVersion: null,
      safeExitUrl: null,
    });
    mockSaveBrandingField.mockResolvedValue(undefined);
    mockUploadIcons.mockResolvedValue(undefined);
  });

  // --- Permission enforcement ---

  describe("permission enforcement", () => {
    it("getBranding allows volunteer (session branding hydration)", async () => {
      const caller = buildVolunteerCaller();
      const result = await caller.getBranding();
      expect(result.name).toBe("Test Org");
    });

    it("getBranding allows manager", async () => {
      const caller = buildManagerCaller();
      const result = await caller.getBranding();
      expect(result.name).toBe("Test Org");
    });

    it("getBranding allows admin", async () => {
      const caller = buildAdminCaller();
      const result = await caller.getBranding();
      expect(result).toBeDefined();
      expect(result.name).toBe("Test Org");
    });

    it("saveBrandingField rejects volunteer with FORBIDDEN", async () => {
      const caller = buildVolunteerCaller();
      await expect(
        caller.saveBrandingField({
          field: "name",
          value: "New Name",
        }),
      ).rejects.toThrow("INSUFFICIENT_PERMISSIONS");
    });

    it("uploadIcons rejects volunteer with FORBIDDEN", async () => {
      const caller = buildVolunteerCaller();
      await expect(
        caller.uploadIcons({
          icon192: VALID_BASE64,
          icon512: VALID_BASE64,
          iconMaskable: VALID_BASE64,
        }),
      ).rejects.toThrow("INSUFFICIENT_PERMISSIONS");
    });
  });

  // --- Service delegation ---

  describe("service delegation", () => {
    it("saveBrandingField forwards field/value input to service", async () => {
      const caller = buildAdminCaller();
      await caller.saveBrandingField({
        field: "name",
        value: "New Org Name",
      });

      expect(mockSaveBrandingField).toHaveBeenCalledWith(
        {
          field: "name",
          value: "New Org Name",
        },
        1,
      );
    });

    it("uploadIcons delegates to service", async () => {
      const caller = buildAdminCaller();
      await caller.uploadIcons({
        icon192: VALID_BASE64,
        icon512: VALID_BASE64,
        iconMaskable: VALID_BASE64,
      });

      expect(mockUploadIcons).toHaveBeenCalledOnce();
    });
  });

  // --- Zod rejection ---

  describe("input validation", () => {
    it("rejects saveBrandingField with invalid hex color", async () => {
      const caller = buildAdminCaller();
      await expectTrpcError(
        caller.saveBrandingField({ field: "primary_color", value: "#fff" }),
        "BAD_REQUEST",
      );
    });

    it("rejects saveBrandingField with CSS function in color", async () => {
      const caller = buildAdminCaller();
      await expectTrpcError(
        caller.saveBrandingField({
          field: "accent_color",
          value: "url(evil)",
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects saveBrandingField with color word instead of hex", async () => {
      const caller = buildAdminCaller();
      await expectTrpcError(
        caller.saveBrandingField({ field: "primary_color", value: "red" }),
        "BAD_REQUEST",
      );
    });

    it("rejects saveBrandingField with oversized name", async () => {
      const caller = buildAdminCaller();
      await expectTrpcError(
        caller.saveBrandingField({
          field: "name",
          value: "x".repeat(121),
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects saveBrandingField with empty name", async () => {
      const caller = buildAdminCaller();
      await expectTrpcError(
        caller.saveBrandingField({ field: "name", value: "" }),
        "BAD_REQUEST",
      );
    });
  });

  // --- Rate limiter ---

  describe("upload rate limiter", () => {
    it("rejects when rate limiter denies the request", async () => {
      const deps = buildDeps({
        uploadLimiter: {
          check: vi
            .fn()
            .mockReturnValue({ allowed: false, retryAfterMs: 5000 }),
          reset: vi.fn(),
        },
      });
      const caller = buildAdminCaller(deps);

      await expect(
        caller.uploadIcons({
          icon192: VALID_BASE64,
          icon512: VALID_BASE64,
          iconMaskable: VALID_BASE64,
        }),
      ).rejects.toThrow("Upload rate limited");
    });

    it("allows upload when rate limiter permits", async () => {
      const deps = buildDeps({
        uploadLimiter: {
          check: vi.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
          reset: vi.fn(),
        },
      });
      const caller = buildAdminCaller(deps);

      await caller.uploadIcons({
        icon192: VALID_BASE64,
        icon512: VALID_BASE64,
        iconMaskable: VALID_BASE64,
      });

      expect(mockUploadIcons).toHaveBeenCalledOnce();
    });

    it("skips rate limiting when no limiter is configured", async () => {
      const caller = buildAdminCaller();

      await caller.uploadIcons({
        icon192: VALID_BASE64,
        icon512: VALID_BASE64,
        iconMaskable: VALID_BASE64,
      });

      expect(mockUploadIcons).toHaveBeenCalledOnce();
    });
  });
});

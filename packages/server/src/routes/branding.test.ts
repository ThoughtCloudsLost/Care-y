/**
 * Router-level tests for the branding tRPC router.
 *
 * Uses mocked BrandingService and createCallerFactory to verify:
 * - adminProcedure permission enforcement (volunteer/manager rejected, admin allowed)
 * - Rate limiter enforcement on uploadIcons
 * - Service delegation and input forwarding
 *
 * Service-layer logic is tested in branding-service.test.ts.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBrandingRouter, type BrandingRouterDeps } from "./branding.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import { RoleId } from "@care-y/shared";

// --- Mock branding service ---

const mockGetBranding = vi.fn();
const mockSaveBrandingField = vi.fn();
const mockUploadIcons = vi.fn();

vi.mock("../branding/branding-service.js", () => ({
  createBrandingService: () => ({
    getBranding: mockGetBranding,
    saveBrandingField: mockSaveBrandingField,
    uploadIcons: mockUploadIcons,
  }),
}));

// --- Context helpers ---

function createMockOrgContext(): OrgContext {
  return {
    orgId: "org-branding-test",
    orgSlug: "test-org",
    orgSchema: "org_test",
    tenantDb: {} as OrgContext["tenantDb"],
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function makeContext(roleId: string): Context {
  return {
    req: {} as Context["req"],
    res: {} as Context["res"],
    org: createMockOrgContext(),
    session: {
      id: "sess-1",
      token: "tok-1",
      userId: "user-branding-1",
      ipToken: "ip-tok",
      uaToken: "ua-tok",
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: "user-branding-1",
      identifier: "tester",
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
      put: vi.fn(async () => "blob-key"),
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
      encryptedName: "dGVzdA==",
      encryptedLogo: null,
      encryptedPrimaryColor: null,
      encryptedAccentColor: null,
      encryptedClientText: null,
      clientEncryptedBranding: null,
      hasIcons: false,
      iconVersion: null,
    });
    mockSaveBrandingField.mockResolvedValue(undefined);
    mockUploadIcons.mockResolvedValue(undefined);
  });

  // --- Permission enforcement ---

  describe("permission enforcement", () => {
    it("getBranding rejects volunteer with FORBIDDEN", async () => {
      const caller = buildVolunteerCaller();
      await expect(caller.getBranding()).rejects.toThrow(
        "INSUFFICIENT_PERMISSIONS",
      );
    });

    it("getBranding rejects manager with FORBIDDEN", async () => {
      const caller = buildManagerCaller();
      await expect(caller.getBranding()).rejects.toThrow(
        "INSUFFICIENT_PERMISSIONS",
      );
    });

    it("getBranding allows admin", async () => {
      const caller = buildAdminCaller();
      const result = await caller.getBranding();
      expect(result).toBeDefined();
      expect(result.encryptedName).toBe("dGVzdA==");
    });

    it("saveBrandingField rejects volunteer with FORBIDDEN", async () => {
      const caller = buildVolunteerCaller();
      await expect(
        caller.saveBrandingField({
          field: "name",
          encryptedValue: VALID_BASE64,
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
    it("saveBrandingField forwards input to service", async () => {
      const caller = buildAdminCaller();
      await caller.saveBrandingField({
        field: "name",
        encryptedValue: VALID_BASE64,
        clientEncryptedBranding: "Y2xpZW50",
      });

      expect(mockSaveBrandingField).toHaveBeenCalledWith({
        field: "name",
        encryptedValue: VALID_BASE64,
        clientEncryptedBranding: "Y2xpZW50",
      });
    });

    it("uploadIcons delegates to service with blobStore and orgSchema", async () => {
      const caller = buildAdminCaller();
      const input = {
        icon192: VALID_BASE64,
        icon512: VALID_BASE64,
        iconMaskable: VALID_BASE64,
      };
      await caller.uploadIcons(input);

      expect(mockUploadIcons).toHaveBeenCalledWith(
        expect.objectContaining({ put: expect.any(Function) }),
        "org_test",
        input,
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

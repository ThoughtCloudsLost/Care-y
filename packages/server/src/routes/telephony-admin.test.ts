/**
 * Unit tests for the telephony admin tRPC router.
 *
 * Tests router structure and procedure wiring with mock configService.
 * Full integration tests (DB + real encryption) run inside Docker
 * via pnpm test:server:db.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MaskedTelephonyConfig } from "../telephony/provider.js";
import type { TelephonyConfigService } from "../telephony/config-service.js";
import {
  createTelephonyAdminRouter,
  type TelephonyAdminRouterDeps,
} from "./telephony-admin.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import { RoleId } from "@care-y/shared";

// --- Stubs and mock factories ---

const TEST_ORG_ID = "org-telephony-test";

const MASKED_CONFIG: MaskedTelephonyConfig = {
  provider: "twilio",
  mode: "byot",
  maskedAccountId: "AC***",
  maskedAuthToken: "********",
  phoneNumbers: [{ number: "+15551234567" }],
};

function createMockConfigService(
  overrides?: Partial<TelephonyConfigService>,
): TelephonyConfigService {
  return {
    saveConfig: vi.fn().mockResolvedValue({ success: true as const }),
    getMaskedConfig: vi.fn().mockResolvedValue(MASKED_CONFIG),
    provisionWebhooks: vi
      .fn()
      .mockResolvedValue({ success: true as const, phoneNumberCount: 2 }),
    lookupWebhookConfig: vi.fn().mockResolvedValue(null),
    lookupProvisionedPhones: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function createMockOrgContext(): OrgContext {
  return {
    orgId: TEST_ORG_ID,
    orgSlug: "test-org",
    orgSchema: "org_test",
    tenantDb: {} as OrgContext["tenantDb"],
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function createMockContext(): Context {
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

describe("createTelephonyAdminRouter", () => {
  let mockConfigService: TelephonyConfigService;

  beforeEach(() => {
    mockConfigService = createMockConfigService();
  });

  const mockIndexer = {
    hash: vi.fn((input: string, orgId: string) => `hash_${orgId}_${input}`),
  };

  function buildDeps(
    serviceOverride?: TelephonyConfigService,
  ): TelephonyAdminRouterDeps {
    return {
      configService: serviceOverride ?? mockConfigService,
      webhookBaseUrl: "https://example.com",
      indexer: mockIndexer,
    };
  }

  it("creates a router without errors", () => {
    const routerInstance = createTelephonyAdminRouter(buildDeps());
    expect(routerInstance).toBeDefined();
  });

  it("router exposes all expected procedures", () => {
    const routerInstance = createTelephonyAdminRouter(buildDeps());
    const def = routerInstance._def;
    expect(def.procedures).toBeDefined();
    const keys = Object.keys(def.procedures);
    expect(keys).toContain("saveConfig");
    expect(keys).toContain("getConfig");
    expect(keys).toContain("provisionWebhooks");
    expect(keys).toContain("addToBlacklist");
    expect(keys).toContain("removeFromBlacklist");
    expect(keys).toContain("listBlacklist");
    expect(keys).toContain("setPhonePurpose");
  });

  describe("saveConfig", () => {
    it("delegates to configService.saveConfig with org context", async () => {
      const saveSpy = vi.fn().mockResolvedValue({ success: true as const });
      const service = createMockConfigService({ saveConfig: saveSpy });
      const appRouter = createTelephonyAdminRouter(buildDeps(service));
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.saveConfig({
        provider: "twilio",
        accountId: "ACtest123",
        authToken: "tok123",
      });

      expect(result).toEqual({ success: true });
      expect(saveSpy).toHaveBeenCalledWith({
        orgId: TEST_ORG_ID,
        provider: "twilio",
        accountId: "ACtest123",
        authToken: "tok123",
      });
    });
  });

  describe("getConfig", () => {
    it("returns masked config from configService", async () => {
      const appRouter = createTelephonyAdminRouter(buildDeps());
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.getConfig();

      expect(result).toEqual(MASKED_CONFIG);
    });

    it("returns null when configService returns null", async () => {
      const service = createMockConfigService({
        getMaskedConfig: vi.fn().mockResolvedValue(null),
      });
      const appRouter = createTelephonyAdminRouter(buildDeps(service));
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.getConfig();

      expect(result).toBeNull();
    });
  });

  describe("provisionWebhooks", () => {
    it("delegates to configService.provisionWebhooks with orgId and baseUrl", async () => {
      const provisionSpy = vi
        .fn()
        .mockResolvedValue({ success: true as const, phoneNumberCount: 3 });
      const service = createMockConfigService({
        provisionWebhooks: provisionSpy,
      });
      const appRouter = createTelephonyAdminRouter(buildDeps(service));
      const caller = createCallerFactory(appRouter)(createMockContext());

      const result = await caller.provisionWebhooks();

      expect(result).toEqual({ success: true, phoneNumberCount: 3 });
      expect(provisionSpy).toHaveBeenCalledWith(
        TEST_ORG_ID,
        "https://example.com",
      );
    });
  });
});

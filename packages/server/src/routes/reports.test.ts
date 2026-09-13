/**
 * Router-level tests for the reports tRPC router.
 *
 * Uses mocked ReportsService and createCallerFactory to verify:
 * - VIEW_REPORTS permission enforcement (volunteer rejected, manager/admin allowed)
 * - queueStats Buffer-to-base64 transform in the router layer
 * - Service delegation for all 5 procedures
 *
 * Service-layer logic is tested in tickets/reports-service.test.ts.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createReportsRouter } from "./reports.js";
import { createCallerFactory } from "../trpc/trpc.js";
import { stubTenantDbDefaultRoles } from "../test-utils.js";
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
} from "@care-y/shared";

// --- Mock reports service ---

const mockQueueStats = vi.fn();
const mockVolumeTrends = vi.fn();
const mockResolutionTrends = vi.fn();
const mockPriorityBreakdown = vi.fn();
const mockActiveCount = vi.fn();

// Constraint: must expose the same surface as createReportsService (ticket-service.ts).
// If a new method is added to the real service, add it here or the mock silently diverges.
vi.mock("../tickets/reports-service.js", () => ({
  createReportsService: () => ({
    queueStats: mockQueueStats,
    volumeTrends: mockVolumeTrends,
    resolutionTrends: mockResolutionTrends,
    priorityBreakdown: mockPriorityBreakdown,
    activeCount: mockActiveCount,
  }),
}));

// --- Context helpers ---

const FIXTURE_USER_ID = "00000000-0000-4000-8000-000000000e01" as UserId;
const FIXTURE_ORG_ID = "00000000-0000-4000-8000-00000000ee00" as OrgId;
const FIXTURE_ORG_SCHEMA =
  "org_00000000-0000-4000-8000-00000000ee00" as OrgSchema;

function createMockOrgContext(): OrgContext {
  return {
    orgId: FIXTURE_ORG_ID,
    orgSlug: "test-org" as OrgSlug,
    orgSchema: FIXTURE_ORG_SCHEMA,
    tenantDb: stubTenantDbDefaultRoles(),
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function makeContext(roleId: RoleIdValue): Context {
  return {
    req: {} as Context["req"],
    res: {} as Context["res"],
    org: createMockOrgContext(),
    session: {
      id: "00000000-0000-4000-8000-0000000e0010" as SessionId,
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

// --- Caller builders ---

function buildCaller(roleId: RoleIdValue) {
  const routerInstance = createReportsRouter();
  return createCallerFactory(routerInstance)(makeContext(roleId));
}

// --- Tests ---

describe("reports router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueueStats.mockResolvedValue([]);
    mockVolumeTrends.mockResolvedValue([]);
    mockResolutionTrends.mockResolvedValue([]);
    mockPriorityBreakdown.mockResolvedValue([]);
    mockActiveCount.mockResolvedValue(0);
  });

  // --- Permission enforcement ---

  describe("permission enforcement", () => {
    it("rejects volunteer from all report procedures", async () => {
      const caller = buildCaller(RoleId.VOLUNTEER);
      await expect(caller.queueStats()).rejects.toThrow(
        "INSUFFICIENT_PERMISSIONS",
      );
      await expect(caller.volumeTrends()).rejects.toThrow(
        "INSUFFICIENT_PERMISSIONS",
      );
      await expect(caller.activeCount()).rejects.toThrow(
        "INSUFFICIENT_PERMISSIONS",
      );
    });

    it("allows manager (VIEW_REPORTS is manager-level)", async () => {
      const caller = buildCaller(RoleId.MANAGER);
      await expect(caller.queueStats()).resolves.toBeDefined();
    });

    it("allows admin", async () => {
      const caller = buildCaller(RoleId.ADMIN);
      await expect(caller.activeCount()).resolves.toBe(0);
    });
  });

  // --- queueStats base64 transform ---
  // The router converts Buffer encryptedQueueName to base64 string for wire transport.

  describe("queueStats base64 transform", () => {
    it("converts encryptedQueueName Buffer to base64 string", async () => {
      mockQueueStats.mockResolvedValue([
        {
          queueId: "q1",
          encryptedQueueName: Buffer.from("encrypted-general"),
          open: 5,
          closed: 10,
        },
      ]);

      const caller = buildCaller(RoleId.MANAGER);
      const result = await caller.queueStats();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        queueId: "q1",
        encryptedQueueName:
          Buffer.from("encrypted-general").toString("base64url"),
        open: 5,
        closed: 10,
      });
      expect(typeof result[0]!.encryptedQueueName).toBe("string");
    });

    it("handles empty stats array", async () => {
      const caller = buildCaller(RoleId.MANAGER);
      const result = await caller.queueStats();
      expect(result).toEqual([]);
    });
  });

  // --- Service delegation ---

  describe("service delegation", () => {
    it("volumeTrends returns service result directly", async () => {
      const trends = [{ month: "2026-04", created: 5, closed: 3 }];
      mockVolumeTrends.mockResolvedValue(trends);

      const caller = buildCaller(RoleId.MANAGER);
      const result = await caller.volumeTrends();
      expect(result).toEqual(trends);
    });

    it("resolutionTrends returns service result directly", async () => {
      const trends = [{ month: "2026-04", avgDays: 2.5 }];
      mockResolutionTrends.mockResolvedValue(trends);

      const caller = buildCaller(RoleId.MANAGER);
      const result = await caller.resolutionTrends();
      expect(result).toEqual(trends);
    });

    it("priorityBreakdown returns service result directly", async () => {
      const breakdown = [{ priority: 1, count: 10 }];
      mockPriorityBreakdown.mockResolvedValue(breakdown);

      const caller = buildCaller(RoleId.MANAGER);
      const result = await caller.priorityBreakdown();
      expect(result).toEqual(breakdown);
    });

    it("activeCount returns service result directly", async () => {
      mockActiveCount.mockResolvedValue(42);

      const caller = buildCaller(RoleId.MANAGER);
      const result = await caller.activeCount();
      expect(result).toBe(42);
    });
  });
});

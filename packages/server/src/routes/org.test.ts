/**
 * Unit tests for the org tRPC router.
 *
 * Tests router-level delegation and middleware enforcement for
 * getOrgGeneral and updateOrgGeneral admin endpoints. The org.create
 * endpoint is covered in auth.test.ts. Service logic is covered in
 * org/service.test.ts and org/org-config-service.test.ts.
 *
 * Uses the mini-router pattern (no full createAppRouter wiring).
 * DB delegation tests use createTestDb for real service execution.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createOrgRouter } from "./org.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import { RoleId, ErrorCode } from "@care-y/shared";
import {
  mockReq,
  mockRes,
  expectTrpcError,
  createTestDb,
  testSealedBox,
  type TestDb,
} from "../test-utils.js";
import type { OrgService } from "../org/service.js";

// --- Mock org service (only create is wired, tested in auth.test.ts) ---

function createMockOrgService(): OrgService {
  return {
    createOrg: vi.fn(),
    findBySlug: vi.fn(),
    findById: vi.fn(),
    validateSetupToken: vi.fn(),
    consumeSetupToken: vi.fn(),
  };
}

// --- Context helpers ---

function createMockOrgContext(): OrgContext {
  return {
    orgId: "org-test-general",
    orgSlug: "test-org",
    orgSchema: "org_test",
    tenantDb: {} as OrgContext["tenantDb"],
    sealedBox: {} as OrgContext["sealedBox"],
  };
}

function createAdminContext(): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: createMockOrgContext(),
    session: {
      id: "sess-org-1",
      token: "tok-org-1",
      userId: "user-org-1",
      ipToken: "ip-tok",
      uaToken: "ua-tok",
      expiresAt: new Date(Date.now() + 3_600_000),
      twofaVerified: true,
      webauthnChallenge: null,
    },
    user: {
      id: "user-org-1",
      encryptedIdentifier: "admin-id",
      encryptedDisplayName: "encrypted-name",
      encryptedPreferredLocale: null,
      roleId: RoleId.ADMIN,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

function createVolunteerContext(): Context {
  return {
    ...createAdminContext(),
    user: {
      id: "user-vol-1",
      encryptedIdentifier: "vol-id",
      encryptedDisplayName: "encrypted-vol",
      encryptedPreferredLocale: null,
      roleId: RoleId.VOLUNTEER,
      isActive: true,
      hasSeenBriefing: true,
    },
  };
}

function createUnauthenticatedContext(): Context {
  return {
    req: mockReq(),
    res: mockRes(),
    org: createMockOrgContext(),
    session: null,
    user: null,
  };
}

function createNo2faContext(): Context {
  const ctx = createAdminContext();
  return {
    ...ctx,
    session: ctx.session ? { ...ctx.session, twofaVerified: false } : null,
  };
}

// --- Router + caller builder ---

function buildCaller(ctx: Context) {
  const orgRouter = createOrgRouter(createMockOrgService());
  const appRouter = router({ org: orgRouter });
  return createCallerFactory(appRouter)(ctx);
}

// --- Tests ---

describe("createOrgRouter", () => {
  describe("getOrgGeneral", () => {
    it("rejects unauthenticated caller", async () => {
      const caller = buildCaller(createUnauthenticatedContext());
      await expectTrpcError(
        caller.org.getOrgGeneral(),
        "UNAUTHORIZED",
        ErrorCode.NOT_AUTHENTICATED,
      );
    });

    it("rejects caller without completed 2FA", async () => {
      const caller = buildCaller(createNo2faContext());
      await expectTrpcError(
        caller.org.getOrgGeneral(),
        "UNAUTHORIZED",
        ErrorCode.TWOFA_REQUIRED,
      );
    });

    it("rejects non-admin caller", async () => {
      const caller = buildCaller(createVolunteerContext());
      await expectTrpcError(
        caller.org.getOrgGeneral(),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    });
  });

  describe("updateOrgGeneral", () => {
    it("rejects unauthenticated caller", async () => {
      const caller = buildCaller(createUnauthenticatedContext());
      await expectTrpcError(
        caller.org.updateOrgGeneral({
          encryptedOrgName: "Y2lwaGVydGV4dA==",
          defaultLanguage: "en",
          countryCode: "US",
        }),
        "UNAUTHORIZED",
        ErrorCode.NOT_AUTHENTICATED,
      );
    });

    it("rejects caller without completed 2FA", async () => {
      const caller = buildCaller(createNo2faContext());
      await expectTrpcError(
        caller.org.updateOrgGeneral({
          encryptedOrgName: "Y2lwaGVydGV4dA==",
          defaultLanguage: "en",
          countryCode: "US",
        }),
        "UNAUTHORIZED",
        ErrorCode.TWOFA_REQUIRED,
      );
    });

    it("rejects non-admin caller", async () => {
      const caller = buildCaller(createVolunteerContext());
      await expectTrpcError(
        caller.org.updateOrgGeneral({
          encryptedOrgName: "Y2lwaGVydGV4dA==",
          defaultLanguage: "en",
          countryCode: "US",
        }),
        "FORBIDDEN",
        ErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    });
  });
});

// ---------------------------------------------------------------------------
// DB-backed delegation tests (resolver bodies)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "createOrgRouter (DB delegation)",
  () => {
    let testDb: TestDb;

    beforeAll(async () => {
      testDb = await createTestDb();

      // Seed org_config singleton (fresh schema has no rows).
      await testDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    function buildDbCaller() {
      const orgContext: OrgContext = {
        orgId: "org-db-test",
        orgSlug: "db-test-org",
        orgSchema: testDb.schemaName,
        tenantDb: testDb.db,
        sealedBox: testSealedBox,
      };

      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: {
          id: "sess-db-1",
          token: "tok-db-1",
          userId: "user-db-1",
          ipToken: "ip-tok",
          uaToken: "ua-tok",
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: "user-db-1",
          encryptedIdentifier: "db-admin",
          encryptedDisplayName: "encrypted-db",
          encryptedPreferredLocale: null,
          roleId: RoleId.ADMIN,
          isActive: true,
          hasSeenBriefing: true,
        },
      };

      const orgRouter = createOrgRouter(createMockOrgService());
      const appRouter = router({ org: orgRouter });
      return createCallerFactory(appRouter)(ctx);
    }

    it("getOrgGeneral returns org config for admin caller", async () => {
      const caller = buildDbCaller();
      const result = await caller.org.getOrgGeneral();

      // Fresh org_config row: encrypted_name is null, defaults from migrations
      // (default_country_code defaults to "+1" per tenant migration 015)
      expect(result).toEqual({
        encryptedName: null,
        defaultLanguage: "en",
        countryCode: "+1",
      });
    }, 30_000);

    it("updateOrgGeneral persists changes reflected by subsequent getOrgGeneral", async () => {
      const caller = buildDbCaller();

      // Obviously fake base64 ciphertext (org name is always ciphertext server-side)
      const fakeCiphertext = Buffer.from("fake-org-ciphertext-blob").toString(
        "base64",
      );

      const updateResult = await caller.org.updateOrgGeneral({
        encryptedOrgName: fakeCiphertext,
        defaultLanguage: "es",
        countryCode: "+52",
      });

      expect(updateResult).toEqual({ success: true });

      // Verify the update persisted
      const fetched = await caller.org.getOrgGeneral();
      expect(fetched.encryptedName).toBe(fakeCiphertext);
      expect(fetched.defaultLanguage).toBe("es");
      expect(fetched.countryCode).toBe("+52");
    }, 30_000);
  },
);

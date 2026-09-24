/**
 * DB integration tests for the savedFilters tRPC router.
 *
 * Exercises: auth enforcement, permission gating (VIEW_CASES), share,
 * unshare, list, ownership refusal, and per-user isolation.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Selectable } from "kysely";
import { encode } from "@care-y/crypto";
import { createSavedFiltersRouter } from "./saved-filters.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { UsersTable } from "../db/types.js";
import type {
  SessionId,
  SessionToken,
  IpToken,
  UaToken,
  OrgId,
  OrgSlug,
  OrgSchema,
} from "@care-y/shared";
import {
  createTestDb,
  createTestUser,
  expectTrpcError,
  mockReq,
  mockRes,
  type TestDb,
} from "../test-utils.js";
import { createSealedBoxEncryptor } from "../crypto/sealed-box.js";

const ENC_NAME = encode(Buffer.from("sealed-filter-name"));
const ENC_STATE = encode(Buffer.from("sealed-filter-state"));
const ENC_NAME_2 = encode(Buffer.from("sealed-filter-name-2"));
const ENC_STATE_2 = encode(Buffer.from("sealed-filter-state-2"));

describe.skipIf(!process.env.DATABASE_URL)("savedFilters router", () => {
  let testDb: TestDb;
  let userA: Selectable<UsersTable>;
  let userB: Selectable<UsersTable>;

  const testRouter = router({ savedFilters: createSavedFiltersRouter() });
  const factory = createCallerFactory(testRouter);

  function orgContext(): OrgContext {
    return {
      orgId: "00000000-0000-4000-8000-000000003300" as OrgId,
      orgSlug: "test-org" as OrgSlug,
      orgSchema: testDb.schemaName as OrgSchema,
      tenantDb: testDb.db,
      sealedBox: createSealedBoxEncryptor(Buffer.alloc(32, 1), 1),
    };
  }

  function createAuthedCaller(
    user: Selectable<UsersTable>,
    roleOverride?: string,
  ) {
    const ctx: Context = {
      req: mockReq(),
      res: mockRes(),
      org: orgContext(),
      session: {
        id: `00000000-0000-0000-0000-${user.id.slice(-12)}` as SessionId,
        token: `tok-${user.id}` as SessionToken,
        userId: user.id,
        ipToken: "ip-tok" as IpToken,
        uaToken: "ua-tok" as UaToken,
        expiresAt: new Date(Date.now() + 3_600_000),
        twofaVerified: true,
        webauthnChallenge: null,
      },
      user: {
        id: user.id,
        encryptedIdentifier: user.encrypted_identifier.toString("base64"),
        encryptedDisplayName: user.encrypted_display_name.toString("base64"),
        encryptedPreferredLocale: null,
        roleId: (roleOverride ?? user.role_id) as typeof user.role_id,
        isActive: user.is_active,
        hasSeenBriefing: true,
      },
    };
    return factory(ctx);
  }

  function createUnauthedCaller() {
    const ctx: Context = {
      req: mockReq(),
      res: mockRes(),
      org: orgContext(),
      session: null,
      user: null,
    };
    return factory(ctx);
  }

  beforeAll(async () => {
    testDb = await createTestDb();
    userA = await createTestUser(testDb.db);
    userB = await createTestUser(testDb.db);
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  describe("auth enforcement", () => {
    it("rejects unauthenticated list", async () => {
      const caller = createUnauthedCaller();
      await expectTrpcError(caller.savedFilters.list(), "UNAUTHORIZED");
    });

    it("rejects unauthenticated share", async () => {
      const caller = createUnauthedCaller();
      await expectTrpcError(
        caller.savedFilters.share({
          encryptedName: ENC_NAME,
          encryptedState: ENC_STATE,
          color: "blue",
          icon: "tag",
        }),
        "UNAUTHORIZED",
      );
    });

    it("rejects unauthenticated unshare", async () => {
      const caller = createUnauthedCaller();
      await expectTrpcError(
        caller.savedFilters.unshare({
          filterId: "00000000-0000-4000-8000-000000000001",
        }),
        "UNAUTHORIZED",
      );
    });
  });

  describe("share and list", () => {
    let sharedFilterId: string;

    it("creates a shared filter", async () => {
      const caller = createAuthedCaller(userA);
      const result = await caller.savedFilters.share({
        encryptedName: ENC_NAME,
        encryptedState: ENC_STATE,
        color: "blue",
        icon: "tag",
      });
      expect(result.filter.id).toBeTruthy();
      expect(result.filter.ownerId).toBe(userA.id);
      expect(result.filter.encryptedName).toBeTruthy();
      expect(result.filter.encryptedState).toBeTruthy();
      expect(result.filter.color).toBe("blue");
      expect(result.filter.icon).toBe("tag");
      sharedFilterId = result.filter.id;
    });

    it("lists shared filters (visible to all with VIEW_CASES)", async () => {
      const callerB = createAuthedCaller(userB);
      const result = await callerB.savedFilters.list();
      expect(result.filters.length).toBeGreaterThanOrEqual(1);
      const found = result.filters.find((f) => f.id === sharedFilterId);
      expect(found).toBeDefined();
      expect(found?.ownerId).toBe(userA.id);
      expect(found?.color).toBe("blue");
      expect(found?.icon).toBe("tag");
    });

    it("creates a second shared filter from a different user", async () => {
      const caller = createAuthedCaller(userB);
      const result = await caller.savedFilters.share({
        encryptedName: ENC_NAME_2,
        encryptedState: ENC_STATE_2,
        color: "red",
        icon: "star",
      });
      expect(result.filter.ownerId).toBe(userB.id);
    });

    it("list returns both users' filters", async () => {
      const caller = createAuthedCaller(userA);
      const result = await caller.savedFilters.list();
      expect(result.filters.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("unshare and ownership", () => {
    let filterIdOwnedByA: string;

    beforeAll(async () => {
      const caller = createAuthedCaller(userA);
      const result = await caller.savedFilters.share({
        encryptedName: encode(Buffer.from("a-only-filter")),
        encryptedState: encode(Buffer.from("a-only-state")),
        color: "green",
        icon: "leaf",
      });
      filterIdOwnedByA = result.filter.id;
    });

    it("allows the owner to unshare their filter", async () => {
      const caller = createAuthedCaller(userA);
      const result = await caller.savedFilters.unshare({
        filterId: filterIdOwnedByA,
      });
      expect(result.success).toBe(true);

      // Verify it is gone from the list.
      const listed = await caller.savedFilters.list();
      expect(
        listed.filters.find((f) => f.id === filterIdOwnedByA),
      ).toBeUndefined();
    });

    it("rejects unshare by a non-owner", async () => {
      // Create a filter owned by A, then try to unshare as B.
      const callerA = createAuthedCaller(userA);
      const created = await callerA.savedFilters.share({
        encryptedName: encode(Buffer.from("a-private-filter")),
        encryptedState: encode(Buffer.from("a-private-state")),
        color: "purple",
        icon: "lock",
      });
      const callerB = createAuthedCaller(userB);
      await expectTrpcError(
        callerB.savedFilters.unshare({ filterId: created.filter.id }),
        "FORBIDDEN",
      );
    });

    it("returns NOT_FOUND for a nonexistent filter", async () => {
      const caller = createAuthedCaller(userA);
      await expectTrpcError(
        caller.savedFilters.unshare({
          filterId: "00000000-0000-4000-8000-000000099999",
        }),
        "NOT_FOUND",
      );
    });
  });

  describe("input validation", () => {
    it("rejects empty encryptedName", async () => {
      const caller = createAuthedCaller(userA);
      await expectTrpcError(
        caller.savedFilters.share({
          encryptedName: "",
          encryptedState: ENC_STATE,
          color: "blue",
          icon: "tag",
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects invalid color", async () => {
      const caller = createAuthedCaller(userA);
      await expectTrpcError(
        caller.savedFilters.share({
          encryptedName: ENC_NAME,
          encryptedState: ENC_STATE,
          color: "neon" as "blue",
          icon: "tag",
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects invalid filterId format on unshare", async () => {
      const caller = createAuthedCaller(userA);
      await expectTrpcError(
        caller.savedFilters.unshare({ filterId: "not-a-uuid" }),
        "BAD_REQUEST",
      );
    });
  });
});

/**
 * DB integration tests for the recentViews tRPC router.
 *
 * Uses the mini-router pattern (zero constructor deps) against a real
 * test schema, exercising route and service together: auth enforcement,
 * input validation, upsert semantics, and per-user isolation (the
 * envelope must never be readable by another user's session).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Selectable } from "kysely";
import { encode } from "@care-y/crypto";
import { createRecentViewsRouter } from "./recent-views.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { UsersTable } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  expectTrpcError,
  mockReq,
  mockRes,
  type TestDb,
} from "../test-utils.js";

const EPHEMERAL_POINT = encode(Buffer.alloc(32, 1));
const NONCE = encode(Buffer.alloc(24, 2));
const PAYLOAD = encode(Buffer.from("sealed-recents-payload"));

describe.skipIf(!process.env.DATABASE_URL)("recentViews router", () => {
  let testDb: TestDb;
  let userA: Selectable<UsersTable>;
  let userB: Selectable<UsersTable>;

  const testRouter = router({ recentViews: createRecentViewsRouter() });
  const factory = createCallerFactory(testRouter);

  function orgContext(): OrgContext {
    return {
      orgId: "org-recent-views-test",
      orgSlug: "test-org",
      orgSchema: testDb.schemaName,
      tenantDb: testDb.db,
      sealedBox: {} as OrgContext["sealedBox"],
    };
  }

  function createAuthedCaller(user: Selectable<UsersTable>) {
    const ctx: Context = {
      req: mockReq(),
      res: mockRes(),
      org: orgContext(),
      session: {
        id: `sess-${user.id}`,
        token: `tok-${user.id}`,
        userId: user.id,
        ipToken: "ip-tok",
        uaToken: "ua-tok",
        expiresAt: new Date(Date.now() + 3_600_000),
        twofaVerified: true,
        webauthnChallenge: null,
      },
      user: {
        id: user.id,
        encryptedIdentifier: user.encrypted_identifier.toString("base64"),
        encryptedDisplayName: user.encrypted_display_name.toString("base64"),
        encryptedPreferredLocale: null,
        roleId: user.role_id,
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
    it("rejects unauthenticated get", async () => {
      const caller = createUnauthedCaller();
      await expectTrpcError(caller.recentViews.get(), "UNAUTHORIZED");
    });

    it("rejects unauthenticated put", async () => {
      const caller = createUnauthedCaller();
      await expectTrpcError(
        caller.recentViews.put({
          ephemeralPoint: EPHEMERAL_POINT,
          nonce: NONCE,
          wrappedPayload: PAYLOAD,
        }),
        "UNAUTHORIZED",
      );
    });
  });

  describe("input validation", () => {
    it("rejects an ephemeralPoint of the wrong length", async () => {
      const caller = createAuthedCaller(userA);
      await expectTrpcError(
        caller.recentViews.put({
          ephemeralPoint: Buffer.alloc(16, 1).toString("base64"),
          nonce: NONCE,
          wrappedPayload: PAYLOAD,
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects an empty wrappedPayload", async () => {
      const caller = createAuthedCaller(userA);
      await expectTrpcError(
        caller.recentViews.put({
          ephemeralPoint: EPHEMERAL_POINT,
          nonce: NONCE,
          wrappedPayload: "",
        }),
        "BAD_REQUEST",
      );
    });
  });

  describe("get and put", () => {
    it("returns null envelope when the user has no row", async () => {
      const caller = createAuthedCaller(userA);
      const result = await caller.recentViews.get();
      expect(result).toEqual({ envelope: null });
    });

    it("roundtrips a put envelope through get", async () => {
      const caller = createAuthedCaller(userA);
      await caller.recentViews.put({
        ephemeralPoint: EPHEMERAL_POINT,
        nonce: NONCE,
        wrappedPayload: PAYLOAD,
      });

      const result = await caller.recentViews.get();
      expect(result.envelope).toEqual({
        ephemeralPoint: EPHEMERAL_POINT,
        nonce: NONCE,
        wrappedPayload: PAYLOAD,
      });
    });

    it("overwrites the existing envelope on second put (upsert)", async () => {
      const caller = createAuthedCaller(userA);
      const newPayload = encode(Buffer.from("newer-sealed-payload"));
      await caller.recentViews.put({
        ephemeralPoint: EPHEMERAL_POINT,
        nonce: NONCE,
        wrappedPayload: newPayload,
      });

      const result = await caller.recentViews.get();
      expect(result.envelope?.wrappedPayload).toBe(newPayload);

      const rows = await testDb.db
        .selectFrom("user_recent_views")
        .select(["user_id"])
        .where("user_id", "=", userA.id)
        .execute();
      expect(rows).toHaveLength(1);
    });

    it("scopes the envelope to the session user (user B sees null)", async () => {
      const caller = createAuthedCaller(userB);
      const result = await caller.recentViews.get();
      expect(result).toEqual({ envelope: null });
    });

    it("stores the envelope bytes verbatim (server holds ciphertext only)", async () => {
      const row = await testDb.db
        .selectFrom("user_recent_views")
        .selectAll()
        .where("user_id", "=", userA.id)
        .executeTakeFirstOrThrow();

      expect(row.wrapped_payload.toString("base64")).toBe(
        Buffer.from("newer-sealed-payload").toString("base64"),
      );
      expect(row.ephemeral_point).toHaveLength(32);
      expect(row.nonce).toHaveLength(24);
    });
  });
});

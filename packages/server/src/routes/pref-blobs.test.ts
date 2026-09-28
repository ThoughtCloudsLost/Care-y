/**
 * DB integration tests for the prefBlobs tRPC router.
 *
 * Uses the mini-router pattern (zero constructor deps) against a real
 * test schema, exercising route and service together: auth enforcement,
 * input validation, upsert semantics, and per-user isolation (an envelope
 * must never be readable by another user's session).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Selectable } from "kysely";
import { encode } from "@care-y/crypto";
import { PREF_BLOB_MAX_PAYLOAD_BYTES } from "@care-y/shared";
import { createPrefBlobsRouter } from "./pref-blobs.js";
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

const KIND = "dashboard_filters";
const EPHEMERAL_POINT = encode(Buffer.alloc(32, 1));
const NONCE = encode(Buffer.alloc(24, 2));
const PAYLOAD = encode(Buffer.from("sealed-dashboard-filters"));

describe.skipIf(!process.env.DATABASE_URL)("prefBlobs router", () => {
  let testDb: TestDb;
  let userA: Selectable<UsersTable>;
  let userB: Selectable<UsersTable>;

  const testRouter = router({ prefBlobs: createPrefBlobsRouter() });
  const factory = createCallerFactory(testRouter);

  function orgContext(): OrgContext {
    return {
      orgId: "00000000-0000-4000-8000-000000003400" as OrgId,
      orgSlug: "test-org" as OrgSlug,
      orgSchema: testDb.schemaName as OrgSchema,
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
        roleId: user.role_id,
        isActive: user.is_active,
        hasSeenBriefing: true,
        mustChangePassword: false,
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
      await expectTrpcError(
        caller.prefBlobs.get({ kind: KIND }),
        "UNAUTHORIZED",
      );
    });

    it("rejects unauthenticated put", async () => {
      const caller = createUnauthedCaller();
      await expectTrpcError(
        caller.prefBlobs.put({
          kind: KIND,
          envelope: {
            ephemeralPoint: EPHEMERAL_POINT,
            nonce: NONCE,
            wrappedPayload: PAYLOAD,
          },
        }),
        "UNAUTHORIZED",
      );
    });
  });

  describe("input validation", () => {
    it("rejects an ephemeralPoint of the wrong length", async () => {
      const caller = createAuthedCaller(userA);
      await expectTrpcError(
        caller.prefBlobs.put({
          kind: KIND,
          envelope: {
            ephemeralPoint: Buffer.alloc(16, 1).toString("base64"),
            nonce: NONCE,
            wrappedPayload: PAYLOAD,
          },
        }),
        "BAD_REQUEST",
      );
    });

    it("rejects an empty wrappedPayload", async () => {
      const caller = createAuthedCaller(userA);
      await expectTrpcError(
        caller.prefBlobs.put({
          kind: KIND,
          envelope: {
            ephemeralPoint: EPHEMERAL_POINT,
            nonce: NONCE,
            wrappedPayload: "",
          },
        }),
        "BAD_REQUEST",
      );
    });

    it("refuses a wrappedPayload above the size cap and stores nothing", async () => {
      const caller = createAuthedCaller(userA);
      await expectTrpcError(
        caller.prefBlobs.put({
          kind: KIND,
          envelope: {
            ephemeralPoint: EPHEMERAL_POINT,
            nonce: NONCE,
            wrappedPayload: encode(
              Buffer.alloc(PREF_BLOB_MAX_PAYLOAD_BYTES + 1, 3),
            ),
          },
        }),
        "BAD_REQUEST",
      );

      const rows = await testDb.db
        .selectFrom("user_pref_blobs")
        .select(["user_id"])
        .where("user_id", "=", userA.id)
        .execute();
      expect(rows).toHaveLength(0);
    });
  });

  describe("get and put", () => {
    it("returns null envelope when the user has no row", async () => {
      const caller = createAuthedCaller(userA);
      const result = await caller.prefBlobs.get({ kind: KIND });
      expect(result).toEqual({ envelope: null });
    });

    it("roundtrips a put envelope through get", async () => {
      const caller = createAuthedCaller(userA);
      await caller.prefBlobs.put({
        kind: KIND,
        envelope: {
          ephemeralPoint: EPHEMERAL_POINT,
          nonce: NONCE,
          wrappedPayload: PAYLOAD,
        },
      });

      const result = await caller.prefBlobs.get({ kind: KIND });
      expect(result.envelope).toEqual({
        ephemeralPoint: EPHEMERAL_POINT,
        nonce: NONCE,
        wrappedPayload: PAYLOAD,
      });
    });

    it("overwrites the existing envelope on second put (upsert)", async () => {
      const caller = createAuthedCaller(userA);
      const newPayload = encode(Buffer.from("newer-sealed-filters"));
      await caller.prefBlobs.put({
        kind: KIND,
        envelope: {
          ephemeralPoint: EPHEMERAL_POINT,
          nonce: NONCE,
          wrappedPayload: newPayload,
        },
      });

      const result = await caller.prefBlobs.get({ kind: KIND });
      expect(result.envelope?.wrappedPayload).toBe(newPayload);

      const rows = await testDb.db
        .selectFrom("user_pref_blobs")
        .select(["user_id"])
        .where("user_id", "=", userA.id)
        .where("kind", "=", KIND)
        .execute();
      expect(rows).toHaveLength(1);
    });

    it("scopes the envelope to the session user (user B sees null)", async () => {
      const caller = createAuthedCaller(userB);
      const result = await caller.prefBlobs.get({ kind: KIND });
      expect(result).toEqual({ envelope: null });
    });

    it("keeps user B's write separate from user A's row", async () => {
      const callerB = createAuthedCaller(userB);
      const payloadB = encode(Buffer.from("user-b-sealed-filters"));
      await callerB.prefBlobs.put({
        kind: KIND,
        envelope: {
          ephemeralPoint: EPHEMERAL_POINT,
          nonce: NONCE,
          wrappedPayload: payloadB,
        },
      });

      const resultA = await createAuthedCaller(userA).prefBlobs.get({
        kind: KIND,
      });
      const resultB = await callerB.prefBlobs.get({ kind: KIND });
      expect(resultA.envelope?.wrappedPayload).toBe(
        encode(Buffer.from("newer-sealed-filters")),
      );
      expect(resultB.envelope?.wrappedPayload).toBe(payloadB);
    });

    it("stores the envelope bytes verbatim (server holds ciphertext only)", async () => {
      const row = await testDb.db
        .selectFrom("user_pref_blobs")
        .selectAll()
        .where("user_id", "=", userA.id)
        .where("kind", "=", KIND)
        .executeTakeFirstOrThrow();

      expect(row.wrapped_payload.toString("base64")).toBe(
        Buffer.from("newer-sealed-filters").toString("base64"),
      );
      // DB contract: ephemeral_point is ristretto255 (32 bytes), nonce is XSalsa20 (24 bytes).
      expect(row.ephemeral_point).toHaveLength(32);
      expect(row.nonce).toHaveLength(24);
    });
  });
});

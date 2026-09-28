/**
 * DB integration tests for PrefBlobService: get/put against a real test
 * schema, upsert on (user_id, kind), and per-user isolation.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Selectable } from "kysely";
import type { UsersTable } from "../db/types.js";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";
import {
  createPrefBlobService,
  type PrefBlobEnvelope,
  type PrefBlobService,
} from "./pref-blob-service.js";

function envelope(payload: string): PrefBlobEnvelope {
  return {
    ephemeralPoint: Buffer.alloc(32, 1),
    nonce: Buffer.alloc(24, 2),
    wrappedPayload: Buffer.from(payload),
  };
}

describe.skipIf(!process.env.DATABASE_URL)("PrefBlobService (DB)", () => {
  let testDb: TestDb;
  let svc: PrefBlobService;
  let userA: Selectable<UsersTable>;
  let userB: Selectable<UsersTable>;

  beforeAll(async () => {
    testDb = await createTestDb();
    svc = createPrefBlobService(testDb.db);
    userA = await createTestUser(testDb.db);
    userB = await createTestUser(testDb.db);
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("returns null when the user has no row for the kind", async () => {
    expect(await svc.get(userA.id, "dashboard_filters")).toBeNull();
  });

  it("returns the stored envelope after put", async () => {
    await svc.put(userA.id, "dashboard_filters", envelope("sealed-a-1"));

    const result = await svc.get(userA.id, "dashboard_filters");
    expect(result).not.toBeNull();
    expect(result?.ephemeralPoint.equals(Buffer.alloc(32, 1))).toBe(true);
    expect(result?.nonce.equals(Buffer.alloc(24, 2))).toBe(true);
    expect(result?.wrappedPayload.toString()).toBe("sealed-a-1");
  });

  it("overwrites the row on a second put (upsert, last write wins)", async () => {
    await svc.put(userA.id, "dashboard_filters", envelope("sealed-a-2"));

    const result = await svc.get(userA.id, "dashboard_filters");
    expect(result?.wrappedPayload.toString()).toBe("sealed-a-2");

    const rows = await testDb.db
      .selectFrom("user_pref_blobs")
      .select(["user_id"])
      .where("user_id", "=", userA.id)
      .where("kind", "=", "dashboard_filters")
      .execute();
    expect(rows).toHaveLength(1);
  });

  it("does not return another user's row", async () => {
    expect(await svc.get(userB.id, "dashboard_filters")).toBeNull();
  });

  it("keeps two users' rows of the same kind separate", async () => {
    await svc.put(userB.id, "dashboard_filters", envelope("sealed-b-1"));

    const a = await svc.get(userA.id, "dashboard_filters");
    const b = await svc.get(userB.id, "dashboard_filters");
    expect(a?.wrappedPayload.toString()).toBe("sealed-a-2");
    expect(b?.wrappedPayload.toString()).toBe("sealed-b-1");

    const rows = await testDb.db
      .selectFrom("user_pref_blobs")
      .select(["user_id"])
      .where("kind", "=", "dashboard_filters")
      .where("user_id", "in", [userA.id, userB.id])
      .execute();
    expect(rows).toHaveLength(2);
  });

  it("removes the user's rows when the user is deleted (cascade)", async () => {
    const userC = await createTestUser(testDb.db);
    await svc.put(userC.id, "dashboard_filters", envelope("sealed-c-1"));

    await testDb.db.deleteFrom("users").where("id", "=", userC.id).execute();

    const rows = await testDb.db
      .selectFrom("user_pref_blobs")
      .select(["user_id"])
      .where("user_id", "=", userC.id)
      .execute();
    expect(rows).toHaveLength(0);
  });
});

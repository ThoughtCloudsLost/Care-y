import * as crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import { createMentionsService, type MentionsService } from "./mentions.js";
import type { UserId } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("MentionsService (DB)", () => {
  let testDb: TestDb;
  let svc: MentionsService;
  let validUserId: UserId;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    svc = createMentionsService(testDb.db);

    const user = await createTestUser(testDb.db);
    validUserId = user.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("returns valid user IDs", async () => {
    const result = await svc.resolveValidMentions([validUserId]);
    expect(result).toEqual([validUserId]);
  });

  it("silently drops nonexistent user IDs", async () => {
    const fakeId = crypto.randomUUID() as UserId;
    const result = await svc.resolveValidMentions([fakeId]);
    expect(result).toEqual([]);
  });

  it("returns empty array for empty input", async () => {
    const result = await svc.resolveValidMentions([]);
    expect(result).toEqual([]);
  });

  it("returns only valid IDs from a mixed list", async () => {
    const fakeId = crypto.randomUUID() as UserId;
    const result = await svc.resolveValidMentions([validUserId, fakeId]);
    expect(result).toEqual([validUserId]);
  });

  it("handles multiple valid IDs", async () => {
    const user2 = await createTestUser(testDb.db);
    const result = await svc.resolveValidMentions([validUserId, user2.id]);
    expect(result).toHaveLength(2);
    expect(result).toContain(validUserId);
    expect(result).toContain(user2.id);
  });
});

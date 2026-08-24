import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  type TestDb,
  TEST_ORG_ID,
  testBlindIndexer,
  createTestUser,
} from "../../test-utils.js";
import {
  createBlocklistRepository,
  type BlocklistRepository,
} from "./blocklist-repo.js";
import type { PhoneHash, UserId } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("BlocklistRepository", () => {
  let testDb: TestDb;
  let repo: BlocklistRepository;
  let adminUserId: UserId;

  beforeAll(async () => {
    testDb = await createTestDb();
    repo = createBlocklistRepository(testDb.db);
    const user = await createTestUser(testDb.db);
    adminUserId = user.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  function phoneHash(raw: string): PhoneHash {
    return testBlindIndexer.hash(raw, TEST_ORG_ID) as PhoneHash;
  }

  function fakeEncrypted(raw: string): Buffer {
    return Buffer.from(raw, "utf-8");
  }

  it("add inserts an entry and returns it", async () => {
    const hash = phoneHash("+15551110001");
    const entry = await repo.add(
      hash,
      fakeEncrypted("+15551110001"),
      adminUserId,
    );

    expect(entry.id).toBeDefined();
    expect(entry.phoneHash).toBe(hash);
    expect(entry.addedBy).toBe(adminUserId);
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it("exists returns true for a blocked hash", async () => {
    const hash = phoneHash("+15551110002");
    await repo.add(hash, fakeEncrypted("x"), adminUserId);

    expect(await repo.exists(hash)).toBe(true);
  });

  it("exists returns false for an unknown hash", async () => {
    expect(await repo.exists(phoneHash("+19999999999"))).toBe(false);
  });

  it("list returns all entries ordered by created_at desc", async () => {
    const hash1 = phoneHash("+15551110003");
    const hash2 = phoneHash("+15551110004");

    await repo.add(hash1, fakeEncrypted("x"), adminUserId);
    await repo.add(hash2, fakeEncrypted("x"), adminUserId);

    const all = await repo.list();
    expect(all.length).toBeGreaterThanOrEqual(2);

    const hashes = all.map((e) => e.phoneHash);
    expect(hashes).toContain(hash1);
    expect(hashes).toContain(hash2);

    for (let i = 1; i < all.length; i++) {
      const prev = all[i - 1]!;
      const curr = all[i]!;
      expect(prev.createdAt.getTime()).toBeGreaterThanOrEqual(
        curr.createdAt.getTime(),
      );
    }
  });

  it("remove deletes an entry", async () => {
    const hash = phoneHash("+15551110005");
    const entry = await repo.add(hash, fakeEncrypted("x"), adminUserId);

    await repo.remove(entry.id);

    expect(await repo.exists(hash)).toBe(false);
  });

  it("duplicate phone_hash insert throws unique violation", async () => {
    const hash = phoneHash("+15551110006");
    await repo.add(hash, fakeEncrypted("x"), adminUserId);

    await expect(
      repo.add(hash, fakeEncrypted("x"), adminUserId),
    ).rejects.toThrow();
  });
});

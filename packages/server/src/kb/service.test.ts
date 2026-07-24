// care-y-ignore db-write-no-crypto-import -- test writes synthetic Buffers as pre-encrypted ciphertext (org key tier). No server-side crypto needed.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, createTestUser, type TestDb } from "../test-utils.js";
import {
  createKBCategoryService,
  createKBItemService,
  createKBVoteService,
  wilsonScore,
  type KBCategoryService,
  type KBItemService,
  type KBVoteService,
} from "./service.js";
import { NotFoundError } from "../errors.js";

/** Helper: wrap a label string as a Buffer (test-only, not real org-key encryption). */
function encName(label: string): Buffer {
  return Buffer.from(label);
}

// --- Wilson score unit tests (no DB needed) ---

describe("wilsonScore", () => {
  it("returns 0 for zero votes", () => {
    expect(wilsonScore(0, 0)).toBe(0);
  });

  it("returns value between 0 and 1 for all upvotes", () => {
    const score = wilsonScore(10, 0);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it("returns 0 for all downvotes", () => {
    const score = wilsonScore(0, 10);
    expect(score).toBe(0);
  });

  it("returns lower score for fewer votes at same ratio", () => {
    // 1 up / 0 down should score lower than 10 up / 0 down
    // because the confidence interval is wider with fewer votes
    const fewVotes = wilsonScore(1, 0);
    const manyVotes = wilsonScore(10, 0);
    expect(manyVotes).toBeGreaterThan(fewVotes);
  });

  it("ranks mixed votes lower than pure upvotes", () => {
    const mixed = wilsonScore(8, 2);
    const pure = wilsonScore(10, 0);
    expect(pure).toBeGreaterThan(mixed);
  });
});

// --- DB integration tests ---

describe.skipIf(!process.env.DATABASE_URL)("KBCategoryService (DB)", () => {
  let testDb: TestDb;
  let svc: KBCategoryService;

  beforeAll(async () => {
    testDb = await createTestDb();
    svc = createKBCategoryService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("creates a category with encrypted name only", async () => {
    const cat = await svc.create({ encryptedName: encName("Protocols") });
    expect(cat.id).toBeTruthy();
    expect(cat.encryptedName.toString()).toBe("Protocols");
    expect(cat.encryptedDescription).toBeNull();
    expect(cat.sortOrder).toBeGreaterThan(0);
    expect(cat.createdAt).toBeInstanceOf(Date);
  });

  it("creates a category with encrypted description", async () => {
    const desc = Buffer.from("encrypted-desc");
    const cat = await svc.create({
      encryptedName: encName("Resources"),
      encryptedDescription: desc,
    });
    expect(Buffer.isBuffer(cat.encryptedDescription)).toBe(true);
  });

  it("lists categories sorted by sort_order", async () => {
    const list = await svc.list();
    expect(list.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < list.length; i++) {
      expect(list[i]!.sortOrder).toBeGreaterThanOrEqual(list[i - 1]!.sortOrder);
    }
  });

  it("updates category encrypted name", async () => {
    const cat = await svc.create({ encryptedName: encName("Old Name") });
    const updated = await svc.update(cat.id, {
      encryptedName: encName("New Name"),
    });
    expect(updated.encryptedName.toString()).toBe("New Name");
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      cat.updatedAt.getTime(),
    );
  });

  it("updates category encrypted description", async () => {
    const cat = await svc.create({ encryptedName: encName("Desc Test") });
    const desc = Buffer.from("new-encrypted-desc");
    const updated = await svc.update(cat.id, { encryptedDescription: desc });
    expect(Buffer.isBuffer(updated.encryptedDescription)).toBe(true);
  });

  it("no-op update returns existing category", async () => {
    const cat = await svc.create({ encryptedName: encName("No-op") });
    const same = await svc.update(cat.id, {});
    expect(same.id).toBe(cat.id);
    expect(same.encryptedName.toString()).toBe("No-op");
  });

  it("update throws NotFoundError for non-existent category", async () => {
    await expect(
      svc.update("00000000-0000-0000-0000-000000000099", {
        encryptedName: encName("X"),
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("deletes an empty category", async () => {
    const cat = await svc.create({ encryptedName: encName("Deletable") });
    await svc.delete(cat.id);
    const list = await svc.list();
    expect(list.find((c) => c.id === cat.id)).toBeUndefined();
  });

  it("delete throws NotFoundError for non-existent category", async () => {
    await expect(
      svc.delete("00000000-0000-0000-0000-000000000099"),
    ).rejects.toThrow(NotFoundError);
  });

  it("reorder swaps sort_order values", async () => {
    const c1 = await svc.create({ encryptedName: encName("ReorderA") });
    const c2 = await svc.create({ encryptedName: encName("ReorderB") });

    await svc.reorder([
      { categoryId: c1.id, sortOrder: c2.sortOrder },
      { categoryId: c2.id, sortOrder: c1.sortOrder },
    ]);

    const list = await svc.list();
    const r1 = list.find((c) => c.id === c1.id);
    const r2 = list.find((c) => c.id === c2.id);
    expect(r1?.sortOrder).toBe(c2.sortOrder);
    expect(r2?.sortOrder).toBe(c1.sortOrder);
  });
});

describe.skipIf(!process.env.DATABASE_URL)("KBItemService (DB)", () => {
  let testDb: TestDb;
  let catSvc: KBCategoryService;
  let svc: KBItemService;
  let categoryId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    catSvc = createKBCategoryService(testDb.db);
    svc = createKBItemService(testDb.db);

    const cat = await catSvc.create({
      encryptedName: encName("Test Category"),
    });
    categoryId = cat.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("creates an article", async () => {
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("title-enc"),
      encryptedBody: Buffer.from("body-enc"),
    });
    expect(item.id).toBeTruthy();
    expect(item.categoryId).toBe(categoryId);
    expect(Buffer.isBuffer(item.encryptedTitle)).toBe(true);
    expect(item.createdBy).toBe("user-1");
    expect(item.voteUpCount).toBe(0);
    expect(item.voteDownCount).toBe(0);
    expect(item.rating).toBe(0);
  });

  it("throws NotFoundError for non-existent category", async () => {
    await expect(
      svc.create("user-1", {
        categoryId: "00000000-0000-0000-0000-000000000099",
        encryptedTitle: Buffer.from("t"),
        encryptedBody: Buffer.from("b"),
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("findById returns article", async () => {
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("find-me"),
      encryptedBody: Buffer.from("body"),
    });
    const found = await svc.findById(item.id);
    expect(found.id).toBe(item.id);
  });

  it("findById throws NotFoundError for non-existent article", async () => {
    await expect(
      svc.findById("00000000-0000-0000-0000-000000000099"),
    ).rejects.toThrow(NotFoundError);
  });

  it("lists with pagination", async () => {
    // Create 5 articles
    for (let i = 0; i < 5; i++) {
      await svc.create("user-1", {
        categoryId,
        encryptedTitle: Buffer.from(`page-test-${String(i)}`),
        encryptedBody: Buffer.from(`body-${String(i)}`),
      });
    }

    // Request first page of 2
    const page1 = await svc.list({
      limit: 2,
      sortBy: "created_at",
      sortDirection: "desc",
    });
    expect(page1.items.length).toBe(2);
    expect(page1.nextCursor).not.toBeNull();

    // Request second page
    const page2 = await svc.list({
      limit: 2,
      sortBy: "created_at",
      sortDirection: "desc",
      cursor: page1.nextCursor!,
    });
    expect(page2.items.length).toBe(2);

    // Items should not overlap
    const page1Ids = new Set(page1.items.map((i) => i.id));
    for (const item of page2.items) {
      expect(page1Ids.has(item.id)).toBe(false);
    }
  });

  it("lists filtered by categoryId", async () => {
    const cat2 = await catSvc.create({
      encryptedName: encName("Other Category"),
    });
    await svc.create("user-1", {
      categoryId: cat2.id,
      encryptedTitle: Buffer.from("other-cat"),
      encryptedBody: Buffer.from("other-body"),
    });

    const filtered = await svc.list({
      categoryId: cat2.id,
      limit: 50,
      sortBy: "created_at",
      sortDirection: "desc",
    });
    expect(filtered.items.length).toBe(1);
    expect(filtered.items[0]!.categoryId).toBe(cat2.id);
  });

  it("updates article fields", async () => {
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("old-title"),
      encryptedBody: Buffer.from("old-body"),
    });
    const updated = await svc.update(item.id, {
      encryptedTitle: Buffer.from("new-title"),
    });
    expect(updated.encryptedTitle.toString()).toBe("new-title");
    // Body unchanged
    expect(updated.encryptedBody.toString()).toBe("old-body");
  });

  it("update moves article to different category", async () => {
    const cat2 = await catSvc.create({
      encryptedName: encName("Move Target"),
    });
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("movable"),
      encryptedBody: Buffer.from("body"),
    });
    const updated = await svc.update(item.id, { categoryId: cat2.id });
    expect(updated.categoryId).toBe(cat2.id);
  });

  it("update throws NotFoundError for non-existent article", async () => {
    await expect(
      svc.update("00000000-0000-0000-0000-000000000099", {
        encryptedTitle: Buffer.from("x"),
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("deletes article", async () => {
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("delete-me"),
      encryptedBody: Buffer.from("body"),
    });
    await svc.delete(item.id);
    await expect(svc.findById(item.id)).rejects.toThrow(NotFoundError);
  });

  it("delete throws NotFoundError for non-existent article", async () => {
    await expect(
      svc.delete("00000000-0000-0000-0000-000000000099"),
    ).rejects.toThrow(NotFoundError);
  });

  it("category delete fails when articles exist (RESTRICT FK)", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("Has Articles"),
    });
    await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("blocker"),
      encryptedBody: Buffer.from("body"),
    });
    // RESTRICT FK prevents category deletion
    await expect(catSvc.delete(cat.id)).rejects.toThrow();
  });

  it("listRecentlyUpdated returns encryptedTitle as Buffer, not plaintext string", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("Encrypt Check"),
    });
    const ciphertext = Buffer.from([0xde, 0xad, 0xbe, 0xef, 0x01, 0x02]);
    await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: ciphertext,
      encryptedBody: Buffer.from("body-cipher"),
    });

    const recent = await svc.listRecentlyUpdated(1);
    expect(recent.length).toBeGreaterThanOrEqual(1);
    const item = recent[0]!;

    // encryptedTitle must be a Buffer (ciphertext), not a decoded string.
    expect(Buffer.isBuffer(item.encryptedTitle)).toBe(true);

    // The raw bytes must match what was stored (no transformation).
    expect(item.encryptedTitle.equals(ciphertext)).toBe(true);
  });

  // --- Excerpt tests ---

  it("creates an article with encryptedExcerpt", async () => {
    const excerpt = Buffer.from("excerpt-cipher");
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("with-excerpt"),
      encryptedBody: Buffer.from("full-body"),
      encryptedExcerpt: excerpt,
    });
    expect(item.encryptedExcerpt).not.toBeNull();
    expect(Buffer.isBuffer(item.encryptedExcerpt)).toBe(true);
    expect(item.encryptedExcerpt!.toString()).toBe("excerpt-cipher");
  });

  it("creates an article without encryptedExcerpt (null)", async () => {
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("no-excerpt"),
      encryptedBody: Buffer.from("body"),
    });
    expect(item.encryptedExcerpt).toBeNull();
  });

  it("update sets encryptedExcerpt", async () => {
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("update-excerpt"),
      encryptedBody: Buffer.from("body"),
    });
    expect(item.encryptedExcerpt).toBeNull();

    const updated = await svc.update(item.id, {
      encryptedExcerpt: Buffer.from("new-excerpt"),
    });
    expect(updated.encryptedExcerpt).not.toBeNull();
    expect(updated.encryptedExcerpt!.toString()).toBe("new-excerpt");
  });

  it("list returns encryptedExcerpt but not encryptedBody", async () => {
    const excerpt = Buffer.from("list-excerpt");
    await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("list-test"),
      encryptedBody: Buffer.from("list-body"),
      encryptedExcerpt: excerpt,
    });

    const page = await svc.list({
      limit: 50,
      sortBy: "created_at",
      sortDirection: "desc",
    });
    const found = page.items.find(
      (i) => i.encryptedTitle.toString() === "list-test",
    );
    expect(found).toBeDefined();
    expect(found!.encryptedExcerpt).not.toBeNull();
    expect(found!.encryptedExcerpt!.toString()).toBe("list-excerpt");
    // Summary type has no encryptedBody property
    expect("encryptedBody" in found!).toBe(false);
  });

  it("findById returns both encryptedBody and encryptedExcerpt", async () => {
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("detail-test"),
      encryptedBody: Buffer.from("detail-body"),
      encryptedExcerpt: Buffer.from("detail-excerpt"),
    });

    const found = await svc.findById(item.id);
    expect(found.encryptedBody.toString()).toBe("detail-body");
    expect(found.encryptedExcerpt).not.toBeNull();
    expect(found.encryptedExcerpt!.toString()).toBe("detail-excerpt");
  });

  it("listRecentlyUpdated returns encryptedExcerpt but not encryptedBody", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("Recent Excerpt"),
    });
    await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("recent-test"),
      encryptedBody: Buffer.from("recent-body"),
      encryptedExcerpt: Buffer.from("recent-excerpt"),
    });

    const recent = await svc.listRecentlyUpdated(1);
    expect(recent.length).toBeGreaterThanOrEqual(1);
    const item = recent[0]!;
    expect(item.encryptedExcerpt).not.toBeNull();
    expect("encryptedBody" in item).toBe(false);
  });

  // --- Sort + filter tests ---

  it("sorts by rating descending", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("Rating Sort"),
    });
    const voteSvc = createKBVoteService(testDb.db);

    const low = await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("low-rated"),
      encryptedBody: Buffer.from("body"),
    });
    const high = await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("high-rated"),
      encryptedBody: Buffer.from("body"),
    });

    // Give "high" 3 upvotes to push its rating above "low"
    await voteSvc.castVote("v1", { itemId: high.id, direction: "up" });
    await voteSvc.castVote("v2", { itemId: high.id, direction: "up" });
    await voteSvc.castVote("v3", { itemId: high.id, direction: "up" });

    const page = await svc.list({
      categoryId: cat.id,
      limit: 10,
      sortBy: "rating",
      sortDirection: "desc",
    });
    const ids = page.items.map((i) => i.id);
    expect(ids.indexOf(high.id)).toBeLessThan(ids.indexOf(low.id));
  });

  it("sorts by updated_at ascending", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("UpdatedAt Sort"),
    });

    const first = await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("first"),
      encryptedBody: Buffer.from("body"),
    });
    const second = await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("second"),
      encryptedBody: Buffer.from("body"),
    });

    // Small delay so updated_at is distinct (PG now() is transaction-start time)
    await new Promise((r) => setTimeout(r, 50));
    await svc.update(first.id, {
      encryptedTitle: Buffer.from("first-updated"),
    });

    const page = await svc.list({
      categoryId: cat.id,
      limit: 10,
      sortBy: "updated_at",
      sortDirection: "asc",
    });
    const ids = page.items.map((i) => i.id);
    // "second" was not updated, so it should come before "first" in asc order
    expect(ids.indexOf(second.id)).toBeLessThan(ids.indexOf(first.id));
  });

  it("filters by minRating", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("MinRating Filter"),
    });
    const voteSvc = createKBVoteService(testDb.db);

    const noVotes = await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("no-votes"),
      encryptedBody: Buffer.from("body"),
    });
    const upvoted = await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("upvoted"),
      encryptedBody: Buffer.from("body"),
    });
    await voteSvc.castVote("v1", { itemId: upvoted.id, direction: "up" });

    const page = await svc.list({
      categoryId: cat.id,
      limit: 50,
      sortBy: "created_at",
      sortDirection: "desc",
      minRating: 0.01,
    });
    const ids = page.items.map((i) => i.id);
    expect(ids).toContain(upvoted.id);
    expect(ids).not.toContain(noVotes.id);
  });

  it("filters by createdBy", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("CreatedBy Filter"),
    });

    await svc.create("author-a", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("by-a"),
      encryptedBody: Buffer.from("body"),
    });
    await svc.create("author-b", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("by-b"),
      encryptedBody: Buffer.from("body"),
    });

    const page = await svc.list({
      categoryId: cat.id,
      limit: 50,
      sortBy: "created_at",
      sortDirection: "desc",
      createdBy: "author-a",
    });
    expect(page.items.every((i) => i.createdBy === "author-a")).toBe(true);
    expect(page.items.length).toBe(1);
  });

  it("filters by date range", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("Date Range Filter"),
    });

    // All items created "now", so filtering with a future range should return none
    await svc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("in-range"),
      encryptedBody: Buffer.from("body"),
    });

    const futureDate = new Date(Date.now() + 86_400_000).toISOString();
    const farFuture = new Date(Date.now() + 172_800_000).toISOString();

    const page = await svc.list({
      categoryId: cat.id,
      limit: 50,
      sortBy: "created_at",
      sortDirection: "desc",
      createdAfter: futureDate,
      createdBefore: farFuture,
    });
    expect(page.items.length).toBe(0);

    // Filtering with a past range should include the item
    const pastDate = new Date(Date.now() - 86_400_000).toISOString();
    const nowIsh = new Date(Date.now() + 1_000).toISOString();

    const page2 = await svc.list({
      categoryId: cat.id,
      limit: 50,
      sortBy: "created_at",
      sortDirection: "desc",
      createdAfter: pastDate,
      createdBefore: nowIsh,
    });
    expect(page2.items.length).toBeGreaterThanOrEqual(1);
  });

  it("combines sort + filter correctly", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("Combined Sort+Filter"),
    });
    const voteSvc = createKBVoteService(testDb.db);

    const itemA = await svc.create("target-author", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("combo-a"),
      encryptedBody: Buffer.from("body"),
    });
    const itemB = await svc.create("target-author", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("combo-b"),
      encryptedBody: Buffer.from("body"),
    });
    // Different author, should be filtered out
    await svc.create("other-author", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("combo-c"),
      encryptedBody: Buffer.from("body"),
    });

    // Give itemA more votes
    await voteSvc.castVote("v1", { itemId: itemA.id, direction: "up" });
    await voteSvc.castVote("v2", { itemId: itemA.id, direction: "up" });

    const page = await svc.list({
      categoryId: cat.id,
      limit: 50,
      sortBy: "rating",
      sortDirection: "desc",
      createdBy: "target-author",
    });

    expect(page.items.length).toBe(2);
    expect(page.items[0]!.id).toBe(itemA.id);
    expect(page.items[1]!.id).toBe(itemB.id);
  });

  // --- Cursor keyset tests for sort modes ---

  it("paginates with rating sort cursor without skips or duplication", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("Rating Cursor"),
    });
    const voteSvc = createKBVoteService(testDb.db);

    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const item = await svc.create("user-1", {
        categoryId: cat.id,
        encryptedTitle: Buffer.from(`rating-cursor-${String(i)}`),
        encryptedBody: Buffer.from("body"),
      });
      ids.push(item.id);
      // Give each item a different number of upvotes for varied ratings
      for (let v = 0; v <= i; v++) {
        await voteSvc.castVote(`cursor-voter-${String(i)}-${String(v)}`, {
          itemId: item.id,
          direction: "up",
        });
      }
    }

    // Page through with limit 2, sorted by rating desc
    const page1 = await svc.list({
      categoryId: cat.id,
      limit: 2,
      sortBy: "rating",
      sortDirection: "desc",
    });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await svc.list({
      categoryId: cat.id,
      limit: 2,
      sortBy: "rating",
      sortDirection: "desc",
      cursor: page1.nextCursor!,
    });
    expect(page2.items).toHaveLength(2);

    const page3 = await svc.list({
      categoryId: cat.id,
      limit: 2,
      sortBy: "rating",
      sortDirection: "desc",
      cursor: page2.nextCursor!,
    });

    // All 5 items appear exactly once across pages
    const allReturned = [
      ...page1.items.map((i) => i.id),
      ...page2.items.map((i) => i.id),
      ...page3.items.map((i) => i.id),
    ];
    const ours = allReturned.filter((id) => ids.includes(id));
    expect(new Set(ours).size).toBe(5);
  });

  it("paginates with updated_at sort cursor", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("UpdatedAt Cursor"),
    });

    const ids: string[] = [];
    for (let i = 0; i < 4; i++) {
      const item = await svc.create("user-1", {
        categoryId: cat.id,
        encryptedTitle: Buffer.from(`upd-cursor-${String(i)}`),
        encryptedBody: Buffer.from("body"),
      });
      ids.push(item.id);
    }

    // Page through with limit 2 sorted by updated_at asc
    const page1 = await svc.list({
      categoryId: cat.id,
      limit: 2,
      sortBy: "updated_at",
      sortDirection: "asc",
    });
    expect(page1.nextCursor).not.toBeNull();
    // The cursor should contain an ISO date (not a number)
    expect(page1.nextCursor!).toContain("|");

    const page2 = await svc.list({
      categoryId: cat.id,
      limit: 2,
      sortBy: "updated_at",
      sortDirection: "asc",
      cursor: page1.nextCursor!,
    });

    const allReturned = [
      ...page1.items.map((i) => i.id),
      ...page2.items.map((i) => i.id),
    ];
    const ours = allReturned.filter((id) => ids.includes(id));
    expect(new Set(ours).size).toBe(4);
  });

  it("cursor pagination with asc direction pages forward correctly", async () => {
    const cat = await catSvc.create({
      encryptedName: encName("Asc Cursor"),
    });

    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const item = await svc.create("user-1", {
        categoryId: cat.id,
        encryptedTitle: Buffer.from(`asc-cursor-${String(i)}`),
        encryptedBody: Buffer.from("body"),
      });
      ids.push(item.id);
    }

    const page1 = await svc.list({
      categoryId: cat.id,
      limit: 1,
      sortBy: "created_at",
      sortDirection: "asc",
    });
    expect(page1.items).toHaveLength(1);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await svc.list({
      categoryId: cat.id,
      limit: 1,
      sortBy: "created_at",
      sortDirection: "asc",
      cursor: page1.nextCursor!,
    });

    expect(page2.items).toHaveLength(1);
    expect(page2.items[0]!.id).not.toBe(page1.items[0]!.id);
  });

  // --- listBodies tests ---

  it("listBodies returns bodies for requested IDs", async () => {
    const a = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("body-a-title"),
      encryptedBody: Buffer.from("body-a-content"),
    });
    const b = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("body-b-title"),
      encryptedBody: Buffer.from("body-b-content"),
    });
    const c = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("body-c-title"),
      encryptedBody: Buffer.from("body-c-content"),
    });

    const results = await svc.listBodies([a.id, c.id]);
    expect(results).toHaveLength(2);

    const ids = results.map((r) => r.id);
    expect(ids).toContain(a.id);
    expect(ids).toContain(c.id);
    expect(ids).not.toContain(b.id);

    const foundA = results.find((r) => r.id === a.id)!;
    expect(Buffer.isBuffer(foundA.encryptedBody)).toBe(true);
    expect(foundA.encryptedBody.toString()).toBe("body-a-content");
  });

  it("listBodies returns empty array for non-existent IDs", async () => {
    const results = await svc.listBodies([
      "00000000-0000-0000-0000-000000000099",
    ]);
    expect(results).toHaveLength(0);
  });

  it("listBodies handles single item", async () => {
    const item = await svc.create("user-1", {
      categoryId,
      encryptedTitle: Buffer.from("single-body"),
      encryptedBody: Buffer.from("single-content"),
    });

    const results = await svc.listBodies([item.id]);
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe(item.id);
    expect(results[0]!.encryptedBody.toString()).toBe("single-content");
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "KBItemService.listAuthors (DB)",
  () => {
    let testDb: TestDb;
    let catSvc: KBCategoryService;
    let svc: KBItemService;
    let categoryId: string;

    beforeAll(async () => {
      testDb = await createTestDb();
      catSvc = createKBCategoryService(testDb.db);
      svc = createKBItemService(testDb.db);

      const cat = await catSvc.create({
        encryptedName: encName("Authors Category"),
      });
      categoryId = cat.id;
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("returns authors who have written articles", async () => {
      const user = await createTestUser(testDb.db);
      await svc.create(user.id, {
        categoryId,
        encryptedTitle: Buffer.from("author-test"),
        encryptedBody: Buffer.from("body"),
      });

      const authors = await svc.listAuthors();
      const found = authors.find((a) => a.id === user.id);
      expect(found).toBeDefined();
      expect(Buffer.isBuffer(found!.encryptedDisplayName)).toBe(true);
    });

    it("returns each author only once even with multiple articles", async () => {
      const user = await createTestUser(testDb.db);
      await svc.create(user.id, {
        categoryId,
        encryptedTitle: Buffer.from("multi-1"),
        encryptedBody: Buffer.from("body"),
      });
      await svc.create(user.id, {
        categoryId,
        encryptedTitle: Buffer.from("multi-2"),
        encryptedBody: Buffer.from("body"),
      });

      const authors = await svc.listAuthors();
      const matches = authors.filter((a) => a.id === user.id);
      expect(matches).toHaveLength(1);
    });

    it("excludes users who have not written any articles", async () => {
      const nonAuthor = await createTestUser(testDb.db);

      const authors = await svc.listAuthors();
      const found = authors.find((a) => a.id === nonAuthor.id);
      expect(found).toBeUndefined();
    });

    it("includes authors from different categories", async () => {
      const cat2 = await catSvc.create({
        encryptedName: encName("Authors Cat 2"),
      });
      const userA = await createTestUser(testDb.db);
      const userB = await createTestUser(testDb.db);

      await svc.create(userA.id, {
        categoryId,
        encryptedTitle: Buffer.from("cat1-article"),
        encryptedBody: Buffer.from("body"),
      });
      await svc.create(userB.id, {
        categoryId: cat2.id,
        encryptedTitle: Buffer.from("cat2-article"),
        encryptedBody: Buffer.from("body"),
      });

      const authors = await svc.listAuthors();
      expect(authors.find((a) => a.id === userA.id)).toBeDefined();
      expect(authors.find((a) => a.id === userB.id)).toBeDefined();
    });
  },
);

describe.skipIf(!process.env.DATABASE_URL)("KBVoteService (DB)", () => {
  let testDb: TestDb;
  let catSvc: KBCategoryService;
  let itemSvc: KBItemService;
  let svc: KBVoteService;
  let itemId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    catSvc = createKBCategoryService(testDb.db);
    itemSvc = createKBItemService(testDb.db);
    svc = createKBVoteService(testDb.db);

    const cat = await catSvc.create({
      encryptedName: encName("Vote Category"),
    });
    const item = await itemSvc.create("user-1", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("vote-article"),
      encryptedBody: Buffer.from("body"),
    });
    itemId = item.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("casts an upvote", async () => {
    await svc.castVote("voter-1", { itemId, direction: "up" });
    const item = await itemSvc.findById(itemId);
    expect(item.voteUpCount).toBe(1);
    expect(item.voteDownCount).toBe(0);
    expect(item.rating).toBeGreaterThan(0);
  });

  it("casts a downvote from a different voter", async () => {
    await svc.castVote("voter-2", { itemId, direction: "down" });
    const item = await itemSvc.findById(itemId);
    expect(item.voteUpCount).toBe(1);
    expect(item.voteDownCount).toBe(1);
  });

  it("same direction vote is a no-op", async () => {
    await svc.castVote("voter-1", { itemId, direction: "up" });
    const item = await itemSvc.findById(itemId);
    // Counts unchanged from previous test
    expect(item.voteUpCount).toBe(1);
    expect(item.voteDownCount).toBe(1);
  });

  it("changes vote direction", async () => {
    // voter-1 changes from up to down
    await svc.castVote("voter-1", { itemId, direction: "down" });
    const item = await itemSvc.findById(itemId);
    expect(item.voteUpCount).toBe(0);
    expect(item.voteDownCount).toBe(2);
  });

  it("getUserVote returns existing vote", async () => {
    const vote = await svc.getUserVote("voter-1", itemId);
    expect(vote).not.toBeNull();
    expect(vote!.direction).toBe("down");
  });

  it("getUserVote returns null for no vote", async () => {
    const vote = await svc.getUserVote("no-vote-user", itemId);
    expect(vote).toBeNull();
  });

  it("removes a vote and adjusts counts", async () => {
    await svc.removeVote("voter-1", itemId);
    const item = await itemSvc.findById(itemId);
    expect(item.voteDownCount).toBe(1); // voter-2's downvote remains
    expect(item.voteUpCount).toBe(0);

    // Vote record should be gone
    const vote = await svc.getUserVote("voter-1", itemId);
    expect(vote).toBeNull();
  });

  it("removeVote is idempotent", async () => {
    // Already removed voter-1's vote above
    await svc.removeVote("voter-1", itemId);
    const item = await itemSvc.findById(itemId);
    expect(item.voteDownCount).toBe(1); // unchanged
  });

  it("castVote throws NotFoundError for non-existent article", async () => {
    await expect(
      svc.castVote("voter-1", {
        itemId: "00000000-0000-0000-0000-000000000099",
        direction: "up",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("deleting article cascades votes", async () => {
    // Create a fresh article with a vote
    const cat = await catSvc.create({
      encryptedName: encName("Cascade Test"),
    });
    const fresh = await itemSvc.create("u", {
      categoryId: cat.id,
      encryptedTitle: Buffer.from("t"),
      encryptedBody: Buffer.from("b"),
    });
    await svc.castVote("voter-x", { itemId: fresh.id, direction: "up" });

    // Delete the article
    await itemSvc.delete(fresh.id);

    // Vote should be gone (no orphaned rows)
    const vote = await svc.getUserVote("voter-x", fresh.id);
    expect(vote).toBeNull();
  });
});

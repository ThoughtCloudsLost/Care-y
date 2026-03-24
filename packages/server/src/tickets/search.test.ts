import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import { createSearchService, type SearchService } from "./search.js";
import { createQueuePermissionsService } from "./queue-permissions.js";

describe.skipIf(!process.env.DATABASE_URL)("SearchService (DB)", () => {
  let testDb: TestDb;
  let svc: SearchService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    const qps = createQueuePermissionsService(testDb.db);
    svc = createSearchService(testDb.db, (userId) => qps.getUserQueues(userId));
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function createFixture() {
    const fix = await createTestTicketFixture(testDb.db, { createUser: true });
    return {
      userId: fix.userId!,
      clientId: fix.clientId,
      queueId: fix.queueId,
      ticketId: fix.ticketId,
    };
  }

  // -----------------------------------------------------------------------
  // metadataSearch
  // -----------------------------------------------------------------------

  it("metadataSearch returns tickets filtered by status", async () => {
    const { userId, ticketId } = await createFixture();

    // Default status is "open"
    const openResult = await svc.metadataSearch(
      { status: "open", page: 1, pageSize: 50 },
      userId,
    );
    expect(openResult.tickets.some((t) => t.id === ticketId)).toBe(true);
    expect(openResult.tickets.every((t) => t.status === "open")).toBe(true);

    // Mark the ticket as closed
    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", ticketId)
      .execute();

    const closedResult = await svc.metadataSearch(
      { status: "closed", page: 1, pageSize: 50 },
      userId,
    );
    expect(closedResult.tickets.some((t) => t.id === ticketId)).toBe(true);
    expect(closedResult.tickets.every((t) => t.status === "closed")).toBe(true);

    // Original "open" query should no longer include this ticket
    const openAgain = await svc.metadataSearch(
      { status: "open", page: 1, pageSize: 50 },
      userId,
    );
    expect(openAgain.tickets.some((t) => t.id === ticketId)).toBe(false);
  });

  it("metadataSearch returns tickets filtered by queueId", async () => {
    const fix1 = await createFixture();
    const fix2 = await createFixture();

    const result = await svc.metadataSearch(
      { queueId: fix1.queueId, page: 1, pageSize: 50 },
      fix1.userId,
    );

    expect(result.tickets.some((t) => t.id === fix1.ticketId)).toBe(true);
    expect(result.tickets.every((t) => t.queueId === fix1.queueId)).toBe(true);
    // fix2 is in a different queue, should not appear
    expect(result.tickets.some((t) => t.id === fix2.ticketId)).toBe(false);
  });

  it("metadataSearch returns empty results for user with no queue access", async () => {
    await createFixture(); // seed at least one ticket
    const outsider = await createTestUser(testDb.db);

    const result = await svc.metadataSearch(
      { page: 1, pageSize: 50 },
      outsider.id,
    );

    expect(result.tickets).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("metadataSearch filters by date range", async () => {
    const { userId, ticketId } = await createFixture();

    // Set the ticket's created_at to a known timestamp
    const pastDate = new Date("2025-01-15T12:00:00Z");
    await testDb.db
      .updateTable("tickets")
      .set({ created_at: pastDate })
      .where("id", "=", ticketId)
      .execute();

    // Query with a range that includes the date
    const inRange = await svc.metadataSearch(
      {
        dateFrom: "2025-01-01T00:00:00Z",
        dateTo: "2025-02-01T00:00:00Z",
        page: 1,
        pageSize: 50,
      },
      userId,
    );
    expect(inRange.tickets.some((t) => t.id === ticketId)).toBe(true);

    // Query with a range that excludes the date
    const outOfRange = await svc.metadataSearch(
      {
        dateFrom: "2025-03-01T00:00:00Z",
        dateTo: "2025-04-01T00:00:00Z",
        page: 1,
        pageSize: 50,
      },
      userId,
    );
    expect(outOfRange.tickets.some((t) => t.id === ticketId)).toBe(false);
  });

  it("metadataSearch paginates results", async () => {
    // Create a queue and user, then add multiple tickets
    const first = await createFixture();
    // Add two more tickets to the same queue so the user can see them all
    await createTestTicketFixture(testDb.db, { queueId: first.queueId });
    await createTestTicketFixture(testDb.db, { queueId: first.queueId });

    // Get total count for this queue
    const all = await svc.metadataSearch(
      { queueId: first.queueId, page: 1, pageSize: 100 },
      first.userId,
    );
    expect(all.total).toBeGreaterThanOrEqual(3);

    // Page 1 with pageSize 2
    const page1 = await svc.metadataSearch(
      { queueId: first.queueId, page: 1, pageSize: 2 },
      first.userId,
    );
    expect(page1.tickets).toHaveLength(2);
    expect(page1.page).toBe(1);
    expect(page1.pageSize).toBe(2);
    expect(page1.total).toBeGreaterThanOrEqual(3);

    // Page 2 with pageSize 2
    const page2 = await svc.metadataSearch(
      { queueId: first.queueId, page: 2, pageSize: 2 },
      first.userId,
    );
    expect(page2.tickets.length).toBeGreaterThanOrEqual(1);
    expect(page2.page).toBe(2);

    // No overlap between pages
    const page1Ids = new Set(page1.tickets.map((t) => t.id));
    for (const t of page2.tickets) {
      expect(page1Ids.has(t.id)).toBe(false);
    }
  });

  // -----------------------------------------------------------------------
  // contentSearch
  // -----------------------------------------------------------------------

  it("contentSearch returns encrypted ticket data as base64 strings", async () => {
    const { userId, ticketId, queueId } = await createFixture();

    const result = await svc.contentSearch(
      { queueId, page: 1, pageSize: 50 },
      userId,
    );

    const match = result.tickets.find((t) => t.id === ticketId);
    expect(match).toBeDefined();
    expect(typeof match!.encryptedTitle).toBe("string");
    expect(typeof match!.encryptedDescription).toBe("string");

    // Verify the strings are valid base64
    expect(() => Buffer.from(match!.encryptedTitle, "base64")).not.toThrow();
    expect(() =>
      Buffer.from(match!.encryptedDescription, "base64"),
    ).not.toThrow();
    // Non-empty ciphertext
    expect(Buffer.from(match!.encryptedTitle, "base64").length).toBeGreaterThan(
      0,
    );
  });

  it("contentSearch scopes to accessible queues only", async () => {
    const fix = await createFixture();
    const outsider = await createTestUser(testDb.db);

    // Outsider has no queue assignments
    const result = await svc.contentSearch(
      { page: 1, pageSize: 50 },
      outsider.id,
    );
    expect(result.tickets).toHaveLength(0);
    expect(result.total).toBe(0);

    // The fixture user can see their own queue's tickets
    const userResult = await svc.contentSearch(
      { queueId: fix.queueId, page: 1, pageSize: 50 },
      fix.userId,
    );
    expect(userResult.tickets.some((t) => t.id === fix.ticketId)).toBe(true);
  });
});

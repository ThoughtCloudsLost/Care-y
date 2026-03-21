import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import {
  createFollowUpService,
  type FollowUpService,
} from "./followup-service.js";
import {
  createTicketAccessChecker,
  type TicketAccessChecker,
} from "./access.js";
import { ForbiddenError, NotFoundError } from "../errors.js";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)("FollowUpService (DB)", () => {
  let testDb: TestDb;
  let access: TicketAccessChecker;
  let svc: FollowUpService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    access = createTicketAccessChecker(testDb.db);
    svc = createFollowUpService(testDb.db, access);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function createTicketFixture() {
    const fix = await createTestTicketFixture(testDb.db, { createUser: true });
    return {
      userId: fix.userId!,
      clientId: fix.clientId,
      queueId: fix.queueId,
      ticketId: fix.ticketId,
      phoneId: fix.phoneId,
    };
  }

  it("create inserts follow-up with encrypted_content and encrypted_read_state", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("content-blob"),
      encryptedReadState: Buffer.from("read-state-blob"),
      source: "volunteer",
      type: "note",
      isPrivate: false,
      mentionedPseudonyms: ["alice"],
    });

    expect(fu.id).toBeTruthy();
    expect(fu.ticketId).toBe(ticketId);
    expect(fu.source).toBe("volunteer");
    expect(fu.type).toBe("note");
    expect(fu.isPrivate).toBe(false);
    expect(fu.mentionedPseudonyms).toEqual(["alice"]);
    expect(Buffer.isBuffer(fu.encryptedContent)).toBe(true);
    expect(Buffer.isBuffer(fu.encryptedReadState)).toBe(true);
    expect(fu.createdAt).toBeInstanceOf(Date);
  });

  it("create throws ForbiddenError for inaccessible ticket", async () => {
    const user = await createTestUser(testDb.db);

    await expect(
      svc.create(user.id, {
        ticketId: crypto.randomUUID(),
        encryptedContent: Buffer.from("c"),
        encryptedReadState: Buffer.from("r"),
        source: "volunteer",
        type: "note",
        isPrivate: false,
        mentionedPseudonyms: [],
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("create rejects adding follow-up to closed ticket", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Close the ticket directly
    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", ticketId)
      .execute();

    await expect(
      svc.create(userId, {
        ticketId,
        encryptedContent: Buffer.from("c"),
        encryptedReadState: Buffer.from("r"),
        source: "volunteer",
        type: "note",
        isPrivate: false,
        mentionedPseudonyms: [],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("listByTicket returns follow-ups in creation order with pagination", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Insert 3 follow-ups
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const fu = await svc.create(userId, {
        ticketId,
        encryptedContent: Buffer.from(`content-${String(i)}`),
        encryptedReadState: Buffer.from("unread"),
        source: "volunteer",
        type: "note",
        isPrivate: false,
        mentionedPseudonyms: [],
      });
      ids.push(fu.id);
    }

    // First page
    const page1 = await svc.listByTicket(userId, ticketId, { limit: 2 });
    expect(page1).toHaveLength(2);

    // Second page using cursor
    const page2 = await svc.listByTicket(userId, ticketId, {
      limit: 2,
      cursor: page1[1]!.id,
    });
    expect(page2).toHaveLength(1);

    // All 3 IDs covered with no duplicates
    const allIds = [...page1.map((f) => f.id), ...page2.map((f) => f.id)];
    expect(new Set(allIds).size).toBe(3);
    expect(new Set(allIds)).toEqual(new Set(ids));
  });

  it("markRead updates encrypted_read_state column", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("content"),
      encryptedReadState: Buffer.from("unread"),
      source: "volunteer",
      type: "note",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    const newReadState = Buffer.from("read-by-user");
    await svc.markRead(userId, fu.id, newReadState);

    // Verify by reading it back
    const list = await svc.listByTicket(userId, ticketId, { limit: 100 });
    const updated = list.find((f) => f.id === fu.id);
    expect(updated).toBeDefined();
    expect(updated!.encryptedReadState.toString()).toBe("read-by-user");
  });

  it("markRead does not create a new row", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const fu = await svc.create(userId, {
      ticketId,
      encryptedContent: Buffer.from("content"),
      encryptedReadState: Buffer.from("unread"),
      source: "volunteer",
      type: "note",
      isPrivate: false,
      mentionedPseudonyms: [],
    });

    const countBefore = await testDb.db
      .selectFrom("followups")
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .where("ticket_id", "=", ticketId)
      .executeTakeFirstOrThrow();

    await svc.markRead(userId, fu.id, Buffer.from("read"));

    const countAfter = await testDb.db
      .selectFrom("followups")
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .where("ticket_id", "=", ticketId)
      .executeTakeFirstOrThrow();

    expect(countAfter.count).toBe(countBefore.count);
  });

  it("markRead throws NotFoundError for non-existent follow-up", async () => {
    const user = await createTestUser(testDb.db);

    await expect(
      svc.markRead(user.id, crypto.randomUUID(), Buffer.from("read")),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import {
  createReadCursorService,
  type ReadCursorService,
} from "./read-cursor-service.js";
import {
  createTicketAccessChecker,
  type TicketAccessChecker,
} from "./access.js";
import { ForbiddenError } from "../errors.js";

describe.skipIf(!process.env.DATABASE_URL)("ReadCursorService (DB)", () => {
  let testDb: TestDb;
  let access: TicketAccessChecker;
  let svc: ReadCursorService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    access = createTicketAccessChecker(testDb.db);
    svc = createReadCursorService(testDb.db, access);
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
    };
  }

  it("getOrCreate creates a dummy row on first access", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const cursor = await svc.getOrCreate(userId, ticketId);

    expect(cursor.ticketId).toBe(ticketId);
    expect(cursor.userId).toBe(userId);
    expect(Buffer.isBuffer(cursor.encryptedReadCursor)).toBe(true);
    expect(cursor.encryptedReadCursor.length).toBe(85);
  });

  it("getOrCreate returns the same row on subsequent calls", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const first = await svc.getOrCreate(userId, ticketId);
    const second = await svc.getOrCreate(userId, ticketId);

    expect(first.encryptedReadCursor.equals(second.encryptedReadCursor)).toBe(
      true,
    );
  });

  it("getOrCreate creates separate rows per volunteer", async () => {
    const { userId: userAId, ticketId, queueId } = await createTicketFixture();
    const userB = await createTestUser(testDb.db);

    // Grant userB queue access so they can access the ticket
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: userB.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    const cursorA = await svc.getOrCreate(userAId, ticketId);
    const cursorB = await svc.getOrCreate(userB.id, ticketId);

    expect(cursorA.userId).not.toBe(cursorB.userId);
    // Different random bytes for each volunteer
    expect(
      cursorA.encryptedReadCursor.equals(cursorB.encryptedReadCursor),
    ).toBe(false);
  });

  it("update replaces the encrypted cursor blob", async () => {
    const { userId, ticketId } = await createTicketFixture();

    await svc.getOrCreate(userId, ticketId);

    const newCursor = Buffer.from("updated-cursor-blob-for-testing");
    await svc.update(userId, ticketId, newCursor);

    const updated = await svc.getOrCreate(userId, ticketId);
    expect(updated.encryptedReadCursor.toString()).toBe(
      "updated-cursor-blob-for-testing",
    );
  });

  it("update does not affect other volunteers' cursors", async () => {
    const { userId, ticketId, queueId } = await createTicketFixture();
    const userB = await createTestUser(testDb.db);

    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: userB.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    const cursorA = await svc.getOrCreate(userId, ticketId);
    await svc.getOrCreate(userB.id, ticketId);

    const originalA = Buffer.from(cursorA.encryptedReadCursor);

    await svc.update(userB.id, ticketId, Buffer.from("user-b-read-state"));

    const refetchA = await svc.getOrCreate(userId, ticketId);
    expect(refetchA.encryptedReadCursor.equals(originalA)).toBe(true);
  });

  it("deleteForTicket removes all cursors for that ticket", async () => {
    const { userId, ticketId, queueId } = await createTicketFixture();
    const userB = await createTestUser(testDb.db);

    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: userB.id })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();

    await svc.getOrCreate(userId, ticketId);
    await svc.getOrCreate(userB.id, ticketId);

    await svc.deleteForTicket(ticketId);

    // After deletion, getOrCreate should create fresh dummy rows
    const freshCursor = await svc.getOrCreate(userId, ticketId);
    expect(freshCursor.encryptedReadCursor.length).toBe(85);
  });

  it("deleteForTicket does not affect cursors on other tickets", async () => {
    const fixA = await createTicketFixture();
    const fixB = await createTicketFixture();

    await svc.getOrCreate(fixA.userId, fixA.ticketId);
    const cursorB = await svc.getOrCreate(fixB.userId, fixB.ticketId);
    const originalB = Buffer.from(cursorB.encryptedReadCursor);

    await svc.deleteForTicket(fixA.ticketId);

    const refetchB = await svc.getOrCreate(fixB.userId, fixB.ticketId);
    expect(refetchB.encryptedReadCursor.equals(originalB)).toBe(true);
  });

  it("getOrCreate rejects user without ticket access", async () => {
    const { ticketId } = await createTicketFixture();
    const stranger = await createTestUser(testDb.db);

    await expect(svc.getOrCreate(stranger.id, ticketId)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("update rejects user without ticket access", async () => {
    const { ticketId } = await createTicketFixture();
    const stranger = await createTestUser(testDb.db);

    await expect(
      svc.update(stranger.id, ticketId, Buffer.from("nope")),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

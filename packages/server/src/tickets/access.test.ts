import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  createTestTicketFixture,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import {
  createTicketAccessChecker,
  type TicketAccessChecker,
} from "./access.js";
import { ForbiddenError } from "../errors.js";
import {
  newTicketId,
  type UserId,
  type TicketId,
  type QueueId,
} from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("TicketAccessChecker (DB)", () => {
  let testDb: TestDb;
  let access: TicketAccessChecker;
  let assignedUser: UserId;
  let queueMember: UserId;
  let watcherUser: UserId;
  let outsiderUser: UserId;
  let ticketId: TicketId;
  let queueId: QueueId;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    access = createTicketAccessChecker(testDb.db);

    // Create users with different access paths
    const u1 = await createTestUser(testDb.db);
    const u2 = await createTestUser(testDb.db);
    const u3 = await createTestUser(testDb.db);
    const u4 = await createTestUser(testDb.db);
    assignedUser = u1.id;
    queueMember = u2.id;
    watcherUser = u3.id;
    outsiderUser = u4.id;

    // Create a queue and ticket
    const queue = await createTestQueue(testDb.db);
    queueId = queue.id;

    const fixture = await createTestTicketFixture(testDb.db, { queueId });
    ticketId = fixture.ticketId;

    // Assign the ticket to assignedUser
    await testDb.db
      .updateTable("tickets")
      .set({ assigned_to: assignedUser })
      .where("id", "=", ticketId)
      .execute();

    // Add queueMember to the queue
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: queueMember })
      .execute();

    // Add watcherUser as a ticket watcher
    await testDb.db
      .insertInto("ticket_watchers")
      .values({ ticket_id: ticketId, user_id: watcherUser })
      .execute();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("assigned volunteer can access their ticket", async () => {
    expect(await access.canAccess(assignedUser, ticketId)).toBe(true);
  });

  it("CC watcher can access the ticket they watch", async () => {
    expect(await access.canAccess(watcherUser, ticketId)).toBe(true);
  });

  it("queue member can access tickets in their queue", async () => {
    expect(await access.canAccess(queueMember, ticketId)).toBe(true);
  });

  it("volunteer NOT assigned, NOT CC'd, NOT in queue is denied", async () => {
    expect(await access.canAccess(outsiderUser, ticketId)).toBe(false);
  });

  it("nonexistent ticket returns false (not a throw)", async () => {
    expect(await access.canAccess(assignedUser, newTicketId())).toBe(false);
  });

  it("assertAccess succeeds for assigned volunteer", async () => {
    await expect(
      access.assertAccess(assignedUser, ticketId),
    ).resolves.toBeUndefined();
  });

  it("assertAccess throws ForbiddenError for outsider", async () => {
    await expect(
      access.assertAccess(outsiderUser, ticketId),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("assertAccess throws ForbiddenError for nonexistent ticket", async () => {
    await expect(
      access.assertAccess(assignedUser, newTicketId()),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("error message is generic (no ticket ID or user ID)", async () => {
    try {
      await access.assertAccess(outsiderUser, ticketId);
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenError);
      const msg = (err as ForbiddenError).message;
      expect(msg).not.toContain(outsiderUser);
      expect(msg).not.toContain(ticketId);
      expect(msg).toBe("INSUFFICIENT_PERMISSIONS");
    }
  });

  it("assigned volunteer retains access after queue removal", async () => {
    // assignedUser is NOT in queue_assignments, but is assigned_to on the ticket
    const inQueue = await testDb.db
      .selectFrom("queue_assignments")
      .select("user_id")
      .where("user_id", "=", assignedUser)
      .where("queue_id", "=", queueId)
      .executeTakeFirst();
    expect(inQueue).toBeUndefined();

    // Still has access via direct assignment
    expect(await access.canAccess(assignedUser, ticketId)).toBe(true);
  });
});

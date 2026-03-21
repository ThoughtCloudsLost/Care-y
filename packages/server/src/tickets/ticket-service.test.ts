import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  createTestClientFixture,
  type TestDb,
} from "../test-utils.js";
import { createTicketService, type TicketService } from "./ticket-service.js";
import {
  createTicketAccessChecker,
  type TicketAccessChecker,
} from "./access.js";
import { createDependencyService } from "./dependency-service.js";
import {
  NotFoundError,
  ForbiddenError,
  TicketError,
  MergeError,
} from "../errors.js";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)("TicketService (DB)", () => {
  let testDb: TestDb;
  let access: TicketAccessChecker;
  let svc: TicketService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    access = createTicketAccessChecker(testDb.db);
    svc = createTicketService(testDb.db, access);
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

  async function createClientFixture() {
    const fix = await createTestClientFixture(testDb.db);
    return { userId: fix.userId, clientId: fix.clientId, queueId: fix.queueId };
  }

  it("create inserts a ticket with correct defaults", async () => {
    const { userId, clientId, queueId } = await createClientFixture();
    const keyGen = crypto.randomUUID();

    const ticket = await svc.create(userId, {
      clientId,
      queueId,
      encryptedTitle: Buffer.from("title"),
      encryptedDescription: Buffer.from("desc"),
      priority: "normal",
      keyGeneration: keyGen,
    });

    expect(ticket.status).toBe("open");
    expect(ticket.priority).toBe("normal");
    expect(ticket.onHold).toBe(false);
    expect(ticket.assignedTo).toBeNull();
    expect(ticket.clientId).toBe(clientId);
    expect(ticket.queueId).toBe(queueId);
    expect(ticket.keyGeneration).toBe(keyGen);
    expect(ticket.id).toBeTruthy();
    expect(ticket.createdAt).toBeInstanceOf(Date);
  });

  it("create rejects if queue does not exist", async () => {
    const { userId, clientId } = await createClientFixture();

    await expect(
      svc.create(userId, {
        clientId,
        queueId: crypto.randomUUID(),
        encryptedTitle: Buffer.from("t"),
        encryptedDescription: Buffer.from("d"),
        priority: "normal",
        keyGeneration: crypto.randomUUID(),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("create rejects if client is merged", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    // Create another client to serve as the merge target
    const mergePrimary = await createTestTicketFixture(testDb.db);

    // Mark client as merged
    await testDb.db
      .updateTable("clients")
      .set({ merged_into: mergePrimary.clientId })
      .where("id", "=", clientId)
      .execute();

    await expect(
      svc.create(userId, {
        clientId,
        queueId,
        encryptedTitle: Buffer.from("t"),
        encryptedDescription: Buffer.from("d"),
        priority: "normal",
        keyGeneration: crypto.randomUUID(),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("create with existing closed ticket reopens it", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    // Create and close a ticket
    const first = await svc.create(userId, {
      clientId,
      queueId,
      encryptedTitle: Buffer.from("old-title"),
      encryptedDescription: Buffer.from("old-desc"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
    });
    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", first.id)
      .execute();

    // Create again for the same client
    const newKeyGen = crypto.randomUUID();
    const reopened = await svc.create(userId, {
      clientId,
      queueId,
      encryptedTitle: Buffer.from("new-title"),
      encryptedDescription: Buffer.from("new-desc"),
      priority: "high",
      keyGeneration: newKeyGen,
    });

    expect(reopened.id).toBe(first.id);
    expect(reopened.status).toBe("open");
    expect(reopened.keyGeneration).toBe(newKeyGen);
    expect(reopened.priority).toBe("high");
  });

  it("create with existing open ticket returns the existing ticket", async () => {
    const { userId, clientId, queueId } = await createClientFixture();

    const first = await svc.create(userId, {
      clientId,
      queueId,
      encryptedTitle: Buffer.from("title"),
      encryptedDescription: Buffer.from("desc"),
      priority: "normal",
      keyGeneration: crypto.randomUUID(),
    });

    const second = await svc.create(userId, {
      clientId,
      queueId,
      encryptedTitle: Buffer.from("other-title"),
      encryptedDescription: Buffer.from("other-desc"),
      priority: "high",
      keyGeneration: crypto.randomUUID(),
    });

    expect(second.id).toBe(first.id);
    expect(second.status).toBe("open");
  });

  it("findById returns ticket with all fields mapped to camelCase", async () => {
    const { userId, ticketId, clientId, queueId } = await createTicketFixture();

    const ticket = await svc.findById(ticketId, userId);

    expect(ticket.id).toBe(ticketId);
    expect(ticket.clientId).toBe(clientId);
    expect(ticket.queueId).toBe(queueId);
    expect(ticket.status).toBe("open");
    expect(ticket.priority).toBe("normal");
    expect(ticket.onHold).toBe(false);
    expect(ticket.assignedTo).toBeNull();
    expect(Buffer.isBuffer(ticket.encryptedTitle)).toBe(true);
    expect(Buffer.isBuffer(ticket.encryptedDescription)).toBe(true);
    expect(ticket.keyGeneration).toBeTruthy();
    expect(ticket.createdAt).toBeInstanceOf(Date);
  });

  it("findById throws ForbiddenError for non-existent ticket", async () => {
    const user = await createTestUser(testDb.db);

    await expect(
      svc.findById(crypto.randomUUID(), user.id),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("list returns tickets with keyset pagination", async () => {
    // Create 3 tickets in the same queue
    const queue = await createTestQueue(testDb.db, {
      name: "Paginate-Q-" + crypto.randomUUID().slice(0, 8),
    });

    const ticketIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const fix = await createTestTicketFixture(testDb.db, {
        queueId: queue.id,
      });
      ticketIds.push(fix.ticketId);
    }

    // First page: limit 2
    const page1 = await svc.list({ queueId: queue.id, limit: 2 });
    expect(page1).toHaveLength(2);

    // Second page: cursor from last item of page1
    const page2 = await svc.list({
      queueId: queue.id,
      limit: 2,
      cursor: page1[1]!.id,
    });
    expect(page2).toHaveLength(1);

    // All 3 IDs covered with no duplicates
    const allIds = [...page1.map((t) => t.id), ...page2.map((t) => t.id)];
    expect(new Set(allIds).size).toBe(3);
    expect(new Set(allIds)).toEqual(new Set(ticketIds));
  });

  it("list filters by queue and status", async () => {
    const { queueId, ticketId } = await createTicketFixture();

    // Open tickets in this queue
    const openInQueue = await svc.list({
      queueId,
      status: "open",
      limit: 100,
    });
    expect(openInQueue.some((t) => t.id === ticketId)).toBe(true);

    // Closed tickets in this queue (should not contain our ticket)
    const closedInQueue = await svc.list({
      queueId,
      status: "closed",
      limit: 100,
    });
    expect(closedInQueue.some((t) => t.id === ticketId)).toBe(false);
  });

  it("close sets status to closed and creates system follow-up", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const closed = await svc.close(userId, ticketId);
    expect(closed.status).toBe("closed");

    // Verify system follow-up was created
    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "status_change")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });

  it("close throws TicketError when unresolved dependencies exist", async () => {
    const fixture1 = await createTicketFixture();
    const fixture2 = await createTicketFixture();

    // Add an unresolved dependency (fixture2's ticket is still open)
    const depService = createDependencyService(testDb.db);
    await depService.add(fixture1.ticketId, fixture2.ticketId);

    await expect(
      svc.close(fixture1.userId, fixture1.ticketId),
    ).rejects.toBeInstanceOf(TicketError);
  });

  it("reopen sets status to open and updates key_generation", async () => {
    const { userId, ticketId } = await createTicketFixture();

    // Close first
    await svc.close(userId, ticketId);

    const newKeyGen = crypto.randomUUID();
    const reopened = await svc.reopen(userId, ticketId, newKeyGen);

    expect(reopened.status).toBe("open");
    expect(reopened.keyGeneration).toBe(newKeyGen);
  });

  it("update with onHold: true sets on_hold and creates system follow-up", async () => {
    const { userId, ticketId } = await createTicketFixture();

    const updated = await svc.update(userId, {
      ticketId,
      onHold: true,
    });

    expect(updated.onHold).toBe(true);

    // Verify hold_change system follow-up
    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "hold_change")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });
});

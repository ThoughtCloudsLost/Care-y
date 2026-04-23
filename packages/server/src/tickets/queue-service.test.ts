import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  createTestUser,
  type TestDb,
} from "../test-utils.js";
import { createQueueService, type QueueService } from "./queue-service.js";
import { NotFoundError, ValidationError } from "../errors.js";
import * as crypto from "node:crypto";

/** Helper: create a Buffer from a label string (test-only, not real org-key encryption). */
function encName(label: string): Buffer {
  return Buffer.from(label);
}

describe.skipIf(!process.env.DATABASE_URL)("QueueService (DB)", () => {
  let testDb: TestDb;
  let svc: QueueService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    svc = createQueueService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("create inserts a queue with defaults", async () => {
    const q = await svc.create({ encryptedName: encName("General") });
    expect(Buffer.isBuffer(q.encryptedName)).toBe(true);
    expect(q.encryptedName.toString()).toBe("General");
    expect(q.escalateDays).toBe(0);
    expect(q.isActive).toBe(true);
    expect(q.sortOrder).toBeGreaterThan(0);
    expect(q.id).toBeTruthy();
    expect(q.createdAt).toBeInstanceOf(Date);
  });

  it("create with explicit escalateDays", async () => {
    const q = await svc.create({
      encryptedName: encName("Urgent"),
      escalateDays: 3,
    });
    expect(q.escalateDays).toBe(3);
  });

  it("create auto-increments sort_order", async () => {
    const q1 = await svc.create({ encryptedName: encName("First") });
    const q2 = await svc.create({ encryptedName: encName("Second") });
    expect(q2.sortOrder).toBeGreaterThan(q1.sortOrder);
  });

  it("listActive returns only active queues", async () => {
    const q = await svc.create({ encryptedName: encName("Active Queue") });
    // Deactivate it directly
    await testDb.db
      .updateTable("queues")
      .set({ is_active: false })
      .where("id", "=", q.id)
      .execute();

    const active = await svc.listActive();
    expect(active.find((a) => a.id === q.id)).toBeUndefined();
  });

  it("listActive returns queues ordered by sort_order", async () => {
    const q1 = await svc.create({ encryptedName: encName("Earlier") });
    const q2 = await svc.create({ encryptedName: encName("Later") });
    const list = await svc.listActive();
    const ids = list.map((q) => q.id);
    expect(ids.indexOf(q1.id)).toBeLessThan(ids.indexOf(q2.id));
  });

  it("update modifies encryptedName", async () => {
    const q = await svc.create({ encryptedName: encName("Old Name") });
    const updated = await svc.update(q.id, {
      encryptedName: encName("New Name"),
    });
    expect(updated.encryptedName.toString()).toBe("New Name");
    expect(updated.id).toBe(q.id);
  });

  it("update modifies escalateDays", async () => {
    const q = await svc.create({
      encryptedName: encName("Escal"),
      escalateDays: 5,
    });
    const updated = await svc.update(q.id, { escalateDays: 10 });
    expect(updated.escalateDays).toBe(10);
  });

  it("update with no fields returns current state", async () => {
    const q = await svc.create({ encryptedName: encName("NoChange") });
    const same = await svc.update(q.id, {});
    expect(same.encryptedName.toString()).toBe("NoChange");
  });

  it("update throws NotFoundError for non-existent queue", async () => {
    await expect(
      svc.update(crypto.randomUUID(), { encryptedName: encName("x") }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("reorder swaps sort_order values", async () => {
    const q1 = await svc.create({ encryptedName: encName("ReorderA") });
    const q2 = await svc.create({ encryptedName: encName("ReorderB") });

    // Swap their sort orders
    await svc.reorder([
      { queueId: q1.id, sortOrder: q2.sortOrder },
      { queueId: q2.id, sortOrder: q1.sortOrder },
    ]);

    const list = await svc.listActive();
    const reorderedQ1 = list.find((q) => q.id === q1.id);
    const reorderedQ2 = list.find((q) => q.id === q2.id);
    expect(reorderedQ1?.sortOrder).toBe(q2.sortOrder);
    expect(reorderedQ2?.sortOrder).toBe(q1.sortOrder);
  });

  describe("listActive counts", () => {
    it("returns openCount, closedCount, holdCount, memberCount", async () => {
      const q = await createTestQueue(testDb.db, { label: "CountTest" });
      const _fixture1 = await createTestTicketFixture(testDb.db, {
        queueId: q.id,
      });
      const fixture2 = await createTestTicketFixture(testDb.db, {
        queueId: q.id,
      });
      const fixture3 = await createTestTicketFixture(testDb.db, {
        queueId: q.id,
      });

      // fixture1: open (default)
      // fixture2: closed
      await testDb.db
        .updateTable("tickets")
        .set({ status: "closed" })
        .where("id", "=", fixture2.ticketId)
        .execute();

      // fixture3: open + on_hold
      await testDb.db
        .updateTable("tickets")
        .set({ on_hold: true })
        .where("id", "=", fixture3.ticketId)
        .execute();

      // Add two members
      const user1 = await createTestUser(testDb.db);
      const user2 = await createTestUser(testDb.db);
      await testDb.db
        .insertInto("queue_assignments")
        .values([
          { queue_id: q.id, user_id: user1.id },
          { queue_id: q.id, user_id: user2.id },
        ])
        .execute();

      const list = await svc.listActive();
      const found = list.find((x) => x.id === q.id);
      expect(found).toBeDefined();
      expect(Number(found!.openCount)).toBe(2); // fixture1 + fixture3 (hold is still open)
      expect(Number(found!.closedCount)).toBe(1);
      expect(Number(found!.holdCount)).toBe(1);
      expect(Number(found!.memberCount)).toBe(2);
    });

    it("returns zero counts for a queue with no tickets or members", async () => {
      const q = await svc.create({ encryptedName: encName("EmptyCounts") });
      const list = await svc.listActive();
      const found = list.find((x) => x.id === q.id);
      expect(found).toBeDefined();
      expect(found!.openCount).toBe("0");
      expect(found!.closedCount).toBe("0");
      expect(found!.holdCount).toBe("0");
      expect(found!.memberCount).toBe("0");
    });
  });

  describe("delete", () => {
    it("deletes an empty queue", async () => {
      const q = await svc.create({ encryptedName: encName("DeleteMe") });
      await svc.delete(q.id);
      const list = await svc.listActive();
      expect(list.find((x) => x.id === q.id)).toBeUndefined();
    });

    it("throws CANNOT_DELETE_LAST_QUEUE when only one queue remains", async () => {
      const freshDb = await createTestDb();
      await seedOrgPublicKey(freshDb.db);
      const freshSvc = createQueueService(freshDb.db);
      const only = await freshSvc.create({
        encryptedName: encName("OnlyQueue"),
      });

      await expect(freshSvc.delete(only.id)).rejects.toBeInstanceOf(
        ValidationError,
      );
      await freshDb.cleanup();
    });

    it("throws QUEUE_HAS_TICKETS when tickets exist and no reassignTo", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      await expect(svc.delete(fixture.queueId)).rejects.toBeInstanceOf(
        ValidationError,
      );
    });

    it("reassigns tickets then deletes the queue", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const target = await createTestQueue(testDb.db, { label: "Target" });

      await svc.delete(fixture.queueId, target.id);

      const ticket = await testDb.db
        .selectFrom("tickets")
        .select("queue_id")
        .where("id", "=", fixture.ticketId)
        .executeTakeFirstOrThrow();
      expect(ticket.queue_id).toBe(target.id);

      const list = await svc.listActive();
      expect(list.find((x) => x.id === fixture.queueId)).toBeUndefined();
    });

    it("throws QUEUE_NOT_FOUND when reassignTo target does not exist", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      await expect(
        svc.delete(fixture.queueId, crypto.randomUUID()),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("cleans up queue_assignments on delete", async () => {
      const q = await createTestQueue(testDb.db, { label: "AssignClean" });
      await createTestTicketFixture(testDb.db, {
        queueId: q.id,
        createUser: true,
      });

      const target = await createTestQueue(testDb.db, {
        label: "AssignTarget",
      });
      await svc.delete(q.id, target.id);

      const assignments = await testDb.db
        .selectFrom("queue_assignments")
        .selectAll()
        .where("queue_id", "=", q.id)
        .execute();
      expect(assignments).toHaveLength(0);
    });

    it("throws QUEUE_NOT_FOUND when queue does not exist", async () => {
      await expect(svc.delete(crypto.randomUUID())).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it("cleans up queue_watchers on delete", async () => {
      const q = await svc.create({ encryptedName: encName("WatchClean") });
      // Watchers table is cleaned up even if empty
      await svc.delete(q.id);
      const watchers = await testDb.db
        .selectFrom("queue_watchers")
        .selectAll()
        .where("queue_id", "=", q.id)
        .execute();
      expect(watchers).toHaveLength(0);
    });
  });
});

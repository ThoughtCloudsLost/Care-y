import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestDb, seedOrgPublicKey, type TestDb } from "../test-utils.js";
import { createQueueService, type QueueService } from "./queue-service.js";
import { NotFoundError } from "../errors.js";
import * as crypto from "node:crypto";

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
    const q = await svc.create({ name: "General" });
    expect(q.name).toBe("General");
    expect(q.escalateDays).toBe(0);
    expect(q.isActive).toBe(true);
    expect(q.id).toBeTruthy();
    expect(q.createdAt).toBeInstanceOf(Date);
  });

  it("create with explicit escalateDays", async () => {
    const q = await svc.create({ name: "Urgent", escalateDays: 3 });
    expect(q.escalateDays).toBe(3);
  });

  it("listActive returns only active queues", async () => {
    const q = await svc.create({ name: "Active Queue" });
    // Deactivate it directly
    await testDb.db
      .updateTable("queues")
      .set({ is_active: false })
      .where("id", "=", q.id)
      .execute();

    const active = await svc.listActive();
    expect(active.find((a) => a.id === q.id)).toBeUndefined();
  });

  it("listActive returns queues ordered by created_at", async () => {
    const q1 = await svc.create({ name: "First" });
    const q2 = await svc.create({ name: "Second" });
    const list = await svc.listActive();
    const ids = list.map((q) => q.id);
    expect(ids.indexOf(q1.id)).toBeLessThan(ids.indexOf(q2.id));
  });

  it("update modifies name", async () => {
    const q = await svc.create({ name: "Old Name" });
    const updated = await svc.update(q.id, { name: "New Name" });
    expect(updated.name).toBe("New Name");
    expect(updated.id).toBe(q.id);
  });

  it("update modifies escalateDays", async () => {
    const q = await svc.create({ name: "Escal", escalateDays: 5 });
    const updated = await svc.update(q.id, { escalateDays: 10 });
    expect(updated.escalateDays).toBe(10);
  });

  it("update with no fields returns current state", async () => {
    const q = await svc.create({ name: "NoChange" });
    const same = await svc.update(q.id, {});
    expect(same.name).toBe("NoChange");
  });

  it("update throws NotFoundError for non-existent queue", async () => {
    await expect(
      svc.update(crypto.randomUUID(), { name: "x" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

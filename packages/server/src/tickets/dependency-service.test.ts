import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import {
  createDependencyService,
  type DependencyService,
} from "./dependency-service.js";
import { TicketError, NotFoundError, ValidationError } from "../errors.js";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)("DependencyService (DB)", () => {
  let testDb: TestDb;
  let svc: DependencyService;
  let queueId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    svc = createDependencyService(testDb.db);

    const q = await createTestQueue(testDb.db);
    queueId = q.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function createTicket(): Promise<string> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });
    return fix.ticketId;
  }

  it("add creates a dependency link", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    const dep = await svc.add(t1, t2);
    expect(dep.ticketId).toBe(t1);
    expect(dep.dependsOnTicketId).toBe(t2);
    expect(dep.createdAt).toBeInstanceOf(Date);
  });

  it("add rejects self-dependency", async () => {
    const t1 = await createTicket();
    await expect(svc.add(t1, t1)).rejects.toBeInstanceOf(ValidationError);
  });

  it("add rejects direct circular dependency", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    await svc.add(t1, t2);
    await expect(svc.add(t2, t1)).rejects.toBeInstanceOf(TicketError);
  });

  it("add throws NotFoundError for non-existent ticket", async () => {
    const t1 = await createTicket();
    await expect(svc.add(t1, crypto.randomUUID())).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("allResolved returns true when all deps are closed", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    await svc.add(t1, t2);

    // Close t2
    await testDb.db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", t2)
      .execute();

    expect(await svc.allResolved(t1)).toBe(true);
  });

  it("allResolved returns false when any dep is open", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    await svc.add(t1, t2);
    expect(await svc.allResolved(t1)).toBe(false);
  });

  it("allResolved returns true when no dependencies exist", async () => {
    const t1 = await createTicket();
    expect(await svc.allResolved(t1)).toBe(true);
  });

  it("remove is idempotent", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    // Remove something that doesn't exist - should not throw
    await expect(svc.remove(t1, t2)).resolves.toBeUndefined();
  });

  it("remove deletes existing dependency", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    await svc.add(t1, t2);
    await svc.remove(t1, t2);
    const deps = await svc.listForTicket(t1);
    expect(deps).toHaveLength(0);
  });

  it("listForTicket returns all dependencies", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    const t3 = await createTicket();
    await svc.add(t1, t2);
    await svc.add(t1, t3);
    const deps = await svc.listForTicket(t1);
    expect(deps).toHaveLength(2);
    const ids = deps.map((d) => d.dependsOnTicketId);
    expect(ids).toContain(t2);
    expect(ids).toContain(t3);
  });
});

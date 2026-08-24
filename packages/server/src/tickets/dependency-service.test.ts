import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import {
  createDependencyService,
  type DependencyService,
} from "./dependency-service.js";
import { createTicketAccessChecker } from "./access.js";
import {
  TicketError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../errors.js";
import * as crypto from "node:crypto";
import {
  newTicketId,
  type UserId,
  type TicketId,
  type QueueId,
} from "@care-y/shared";

// Dummy user ID for tests that don't exercise access control
const SYSTEM_USER = crypto.randomUUID() as UserId;

describe.skipIf(!process.env.DATABASE_URL)("DependencyService (DB)", () => {
  let testDb: TestDb;
  let svc: DependencyService;
  let queueId: QueueId;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    // No access checker: tests dependency logic in isolation
    svc = createDependencyService(testDb.db);

    const q = await createTestQueue(testDb.db);
    queueId = q.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function createTicket(): Promise<TicketId> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });
    return fix.ticketId;
  }

  it("add creates a dependency link", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    const dep = await svc.add({
      userId: SYSTEM_USER,
      ticketId: t1,
      dependsOnTicketId: t2,
    });
    expect(dep.ticketId).toBe(t1);
    expect(dep.dependsOnTicketId).toBe(t2);
    expect(dep.createdAt).toBeInstanceOf(Date);
  });

  it("add rejects self-dependency", async () => {
    const t1 = await createTicket();
    await expect(
      svc.add({ userId: SYSTEM_USER, ticketId: t1, dependsOnTicketId: t1 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("add rejects direct circular dependency", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    await svc.add({
      userId: SYSTEM_USER,
      ticketId: t1,
      dependsOnTicketId: t2,
    });
    await expect(
      svc.add({ userId: SYSTEM_USER, ticketId: t2, dependsOnTicketId: t1 }),
    ).rejects.toBeInstanceOf(TicketError);
  });

  it("add throws NotFoundError for non-existent ticket", async () => {
    const t1 = await createTicket();
    await expect(
      svc.add({
        userId: SYSTEM_USER,
        ticketId: t1,
        dependsOnTicketId: newTicketId(),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("allResolved returns true when all deps are closed", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    await svc.add({
      userId: SYSTEM_USER,
      ticketId: t1,
      dependsOnTicketId: t2,
    });

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
    await svc.add({
      userId: SYSTEM_USER,
      ticketId: t1,
      dependsOnTicketId: t2,
    });
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
    await expect(
      svc.remove({ userId: SYSTEM_USER, ticketId: t1, dependsOnTicketId: t2 }),
    ).resolves.toBeUndefined();
  });

  it("remove deletes existing dependency", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    await svc.add({
      userId: SYSTEM_USER,
      ticketId: t1,
      dependsOnTicketId: t2,
    });
    await svc.remove({
      userId: SYSTEM_USER,
      ticketId: t1,
      dependsOnTicketId: t2,
    });
    const deps = await svc.listForTicket(t1);
    expect(deps).toHaveLength(0);
  });

  it("listForTicket returns all dependencies", async () => {
    const t1 = await createTicket();
    const t2 = await createTicket();
    const t3 = await createTicket();
    await svc.add({
      userId: SYSTEM_USER,
      ticketId: t1,
      dependsOnTicketId: t2,
    });
    await svc.add({
      userId: SYSTEM_USER,
      ticketId: t1,
      dependsOnTicketId: t3,
    });
    const deps = await svc.listForTicket(t1);
    expect(deps).toHaveLength(2);
    const ids = deps.map((d) => d.dependsOnTicketId);
    expect(ids).toContain(t2);
    expect(ids).toContain(t3);
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "DependencyService access checks (DB)",
  () => {
    let testDb: TestDb;
    let svc: DependencyService;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      const access = createTicketAccessChecker(testDb.db);
      svc = createDependencyService(testDb.db, access);
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("add rejects when user has no access to source ticket", async () => {
      const fix = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const other = await createTestTicketFixture(testDb.db);
      // outsider has no queue membership for fix.queueId
      const outsider = await createTestUser(testDb.db);

      await expect(
        svc.add({
          userId: outsider.id,
          ticketId: fix.ticketId,
          dependsOnTicketId: other.ticketId,
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });

    it("add succeeds when user has queue access to both tickets", async () => {
      const fix = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      // Create second ticket in the same queue (user already has access)
      const fix2 = await createTestTicketFixture(testDb.db, {
        queueId: fix.queueId,
      });

      const dep = await svc.add({
        userId: fix.userId!,
        ticketId: fix.ticketId,
        dependsOnTicketId: fix2.ticketId,
      });
      expect(dep.ticketId).toBe(fix.ticketId);
    });
  },
);

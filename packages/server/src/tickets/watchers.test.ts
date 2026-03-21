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
import { createWatchersService, type WatchersService } from "./watchers.js";

describe.skipIf(!process.env.DATABASE_URL)("WatchersService (DB)", () => {
  let testDb: TestDb;
  let access: TicketAccessChecker;
  let svc: WatchersService;
  let userA: string;
  let userB: string;
  let _outsider: string;
  let ticketId: string;
  let queueId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    access = createTicketAccessChecker(testDb.db);
    svc = createWatchersService(testDb.db, access);

    const uA = await createTestUser(testDb.db);
    const uB = await createTestUser(testDb.db);
    const uOutsider = await createTestUser(testDb.db);
    userA = uA.id;
    userB = uB.id;
    _outsider = uOutsider.id;

    const queue = await createTestQueue(testDb.db);
    queueId = queue.id;

    // Add userA and userB to the queue (needed for access checker)
    await testDb.db
      .insertInto("queue_assignments")
      .values([
        { queue_id: queueId, user_id: userA },
        { queue_id: queueId, user_id: userB },
      ])
      .execute();

    const fixture = await createTestTicketFixture(testDb.db, { queueId });
    ticketId = fixture.ticketId;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // --- Per-ticket watchers ---

  it("subscribe adds a watcher; getTicketWatchers returns the user", async () => {
    await svc.subscribe(userA, ticketId);
    const watchers = await svc.getTicketWatchers(ticketId);
    expect(watchers).toContain(userA);
  });

  it("subscribe is idempotent (calling twice does not throw or duplicate)", async () => {
    await svc.subscribe(userA, ticketId);
    await svc.subscribe(userA, ticketId);
    const watchers = await svc.getTicketWatchers(ticketId);
    const count = watchers.filter((id) => id === userA).length;
    expect(count).toBe(1);
  });

  it("isWatching returns true for subscriber, false for non-subscriber", async () => {
    expect(await svc.isWatching(userA, ticketId)).toBe(true);
    expect(await svc.isWatching(userB, ticketId)).toBe(false);
  });

  it("unsubscribe removes the watcher", async () => {
    await svc.subscribe(userB, ticketId);
    expect(await svc.isWatching(userB, ticketId)).toBe(true);

    await svc.unsubscribe(userB, ticketId);
    expect(await svc.isWatching(userB, ticketId)).toBe(false);
  });

  it("unsubscribe is idempotent (removing non-watcher does not throw)", async () => {
    await svc.unsubscribe(userB, ticketId);
    await svc.unsubscribe(userB, ticketId);
    expect(await svc.isWatching(userB, ticketId)).toBe(false);
  });

  // TODO: Re-enable when queue-based access control is implemented in the
  // TicketAccessChecker. Currently all authenticated volunteers can access all
  // tickets (access.ts checks ticket existence only). This test should be
  // restored once assertAccess enforces queue membership or assignment scope.
  //
  // it("subscribe throws ForbiddenError if user has no ticket access", async () => {
  //   await expect(svc.subscribe(outsider, ticketId)).rejects.toBeInstanceOf(
  //     ForbiddenError,
  //   );
  // });

  it("getTicketWatchers returns empty array for unwatched ticket", async () => {
    // Create a new ticket with no watchers
    const fix = await createTestTicketFixture(testDb.db, { queueId });
    const watchers = await svc.getTicketWatchers(fix.ticketId);
    expect(watchers).toEqual([]);
  });

  // --- Queue-level watchers ---

  it("addQueueWatcher / getQueueWatchers manage queue watchers", async () => {
    await svc.addQueueWatcher(queueId, userA);
    const watchers = await svc.getQueueWatchers(queueId);
    expect(watchers).toContain(userA);
  });

  it("addQueueWatcher is idempotent", async () => {
    await svc.addQueueWatcher(queueId, userA);
    await svc.addQueueWatcher(queueId, userA);
    const watchers = await svc.getQueueWatchers(queueId);
    const count = watchers.filter((id) => id === userA).length;
    expect(count).toBe(1);
  });

  it("removeQueueWatcher removes the watcher", async () => {
    await svc.addQueueWatcher(queueId, userB);
    await svc.removeQueueWatcher(queueId, userB);
    const watchers = await svc.getQueueWatchers(queueId);
    expect(watchers).not.toContain(userB);
  });

  it("removeQueueWatcher is idempotent", async () => {
    await svc.removeQueueWatcher(queueId, userB);
    await svc.removeQueueWatcher(queueId, userB);
    // No throw
  });
});

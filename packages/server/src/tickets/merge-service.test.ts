import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import { createMergeService, type MergeService } from "./merge-service.js";
import { createDependencyService } from "./dependency-service.js";
import { MergeError, NotFoundError } from "../errors.js";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)("MergeService (DB)", () => {
  let testDb: TestDb;
  let svc: MergeService;
  let queueId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    svc = createMergeService(testDb.db);

    const q = await createTestQueue(testDb.db);
    queueId = q.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function createClientWithTicket(): Promise<{
    clientId: string;
    ticketId: string;
  }> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });
    return { clientId: fix.clientId, ticketId: fix.ticketId };
  }

  it("merge creates a merge event with encrypted snapshot", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snapshot-data"),
    });

    expect(event.primaryClientId).toBe(a.clientId);
    expect(event.secondaryClientId).toBe(b.clientId);
    expect(Buffer.isBuffer(event.snapshot)).toBe(true);
    expect(event.undoLocked).toBe(false);
    expect(event.isUndone).toBe(false);
  });

  it("merge sets secondary.merged_into to primary's ID", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    const secondary = await testDb.db
      .selectFrom("clients")
      .select("merged_into")
      .where("id", "=", b.clientId)
      .executeTakeFirstOrThrow();

    expect(secondary.merged_into).toBe(a.clientId);
  });

  it("merge closes secondary's open ticket", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("status")
      .where("id", "=", b.ticketId)
      .executeTakeFirstOrThrow();

    expect(ticket.status).toBe("closed");
  });

  it("merge rejects self-merge", async () => {
    const a = await createClientWithTicket();
    await expect(
      svc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: a.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("merge rejects if secondary is already merged", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();
    const c = await createClientWithTicket();

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    await expect(
      svc.merge({
        primaryClientId: c.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap2"),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("merge rejects if secondary's ticket has unresolved dependencies", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();
    const blocker = await createClientWithTicket();

    // Add an unresolved dependency: b's ticket depends on blocker's (still open)
    const depService = createDependencyService(testDb.db);
    await depService.add(b.ticketId, blocker.ticketId);

    await expect(
      svc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: b.clientId,
        encryptedSnapshot: Buffer.from("snap"),
      }),
    ).rejects.toBeInstanceOf(MergeError);

    // Verify secondary was NOT merged (transaction rolled back)
    const secondary = await testDb.db
      .selectFrom("clients")
      .select("merged_into")
      .where("id", "=", b.clientId)
      .executeTakeFirstOrThrow();
    expect(secondary.merged_into).toBeNull();
  });

  it("merge rejects if either client does not exist", async () => {
    const a = await createClientWithTicket();
    await expect(
      svc.merge({
        primaryClientId: a.clientId,
        secondaryClientId: crypto.randomUUID(),
        encryptedSnapshot: Buffer.from("snap"),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("undoMerge clears merged_into and sets is_undone", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    const undone = await svc.undoMerge({
      mergeEventId: event.id,
      encryptedSnapshot: Buffer.from("undo-snap"),
    });

    expect(undone.isUndone).toBe(true);

    const secondary = await testDb.db
      .selectFrom("clients")
      .select("merged_into")
      .where("id", "=", b.clientId)
      .executeTakeFirstOrThrow();
    expect(secondary.merged_into).toBeNull();
  });

  it("undoMerge rejects if locked", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    await svc.setUndoLock(event.id, true);

    await expect(
      svc.undoMerge({
        mergeEventId: event.id,
        encryptedSnapshot: Buffer.from("undo"),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("undoMerge rejects if already undone", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    await svc.undoMerge({
      mergeEventId: event.id,
      encryptedSnapshot: Buffer.from("undo"),
    });

    await expect(
      svc.undoMerge({
        mergeEventId: event.id,
        encryptedSnapshot: Buffer.from("undo2"),
      }),
    ).rejects.toBeInstanceOf(MergeError);
  });

  it("setUndoLock toggles the flag", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    const event = await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    await svc.setUndoLock(event.id, true);

    const locked = await testDb.db
      .selectFrom("client_merge_events")
      .select("undo_locked")
      .where("id", "=", event.id)
      .executeTakeFirstOrThrow();
    expect(locked.undo_locked).toBe(true);

    await svc.setUndoLock(event.id, false);

    const unlocked = await testDb.db
      .selectFrom("client_merge_events")
      .select("undo_locked")
      .where("id", "=", event.id)
      .executeTakeFirstOrThrow();
    expect(unlocked.undo_locked).toBe(false);
  });

  it("listByClient returns events for both primary and secondary", async () => {
    const a = await createClientWithTicket();
    const b = await createClientWithTicket();

    await svc.merge({
      primaryClientId: a.clientId,
      secondaryClientId: b.clientId,
      encryptedSnapshot: Buffer.from("snap"),
    });

    const forPrimary = await svc.listByClient(a.clientId);
    const forSecondary = await svc.listByClient(b.clientId);
    expect(forPrimary.length).toBeGreaterThan(0);
    expect(forSecondary.length).toBeGreaterThan(0);
    expect(forPrimary[0]!.id).toBe(forSecondary[0]!.id);
  });
});

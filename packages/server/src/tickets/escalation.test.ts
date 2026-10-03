import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  createTestDb,
  createTestQueue,
  createTestTicketFixture,
  seedOrgPublicKey,
  withFailingFollowUpInserts,
  FollowUpInsertFailure,
  type TestDb,
} from "../test-utils.js";
import { escalateTenantTickets } from "./escalation.js";
import type { TicketChangeListener } from "./ticket-live-events.js";
import type { QueueId, TicketId, TicketPriority } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("escalateTenantTickets (DB)", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function insertTicketWithAge(opts: {
    queueId: QueueId;
    ageDays: number;
    priority?: "low" | "normal" | "high" | "urgent";
    onHold?: boolean;
    status?: "open" | "closed";
  }): Promise<TicketId> {
    const fix = await createTestTicketFixture(testDb.db, {
      queueId: opts.queueId,
    });

    const createdAt = new Date(Date.now() - opts.ageDays * 24 * 60 * 60 * 1000);

    await testDb.db
      .updateTable("tickets")
      .set({
        created_at: createdAt,
        ...(opts.priority !== undefined ? { priority: opts.priority } : {}),
        ...(opts.onHold !== undefined ? { on_hold: opts.onHold } : {}),
        ...(opts.status !== undefined ? { status: opts.status } : {}),
      })
      .where("id", "=", fix.ticketId)
      .execute();

    return fix.ticketId;
  }

  it("escalates ticket past threshold: low -> normal", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 3 });
    const ticketId = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 5,
      priority: "low",
    });

    const result = await escalateTenantTickets(testDb.db);
    expect(result.escalatedCount).toBeGreaterThanOrEqual(1);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("priority")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.priority).toBe("normal");
  });

  it("announces each ticket it escalates and no other", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 2 });
    const stale = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 4,
      priority: "low",
    });
    const fresh = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 0,
      priority: "low",
    });
    const onTicketChanged = vi.fn<TicketChangeListener>();

    await escalateTenantTickets(testDb.db, onTicketChanged);

    const announced = onTicketChanged.mock.calls.map(([id]) => id);
    expect(announced).toContain(stale);
    expect(announced).not.toContain(fresh);
  });

  it("escalates through the full ladder: normal -> high -> urgent", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 1 });

    const ticketId = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 10,
      priority: "normal",
    });

    // First escalation: normal -> high
    await escalateTenantTickets(testDb.db);
    let ticket = await testDb.db
      .selectFrom("tickets")
      .select("priority")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.priority).toBe("high");

    // Second escalation: high -> urgent
    await escalateTenantTickets(testDb.db);
    ticket = await testDb.db
      .selectFrom("tickets")
      .select("priority")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.priority).toBe("urgent");
  });

  it("does NOT escalate held tickets", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 1 });
    const ticketId = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 10,
      priority: "low",
      onHold: true,
    });

    await escalateTenantTickets(testDb.db);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("priority")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.priority).toBe("low");
  });

  it("does NOT escalate when escalate_days = 0", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 0 });
    const ticketId = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 100,
      priority: "low",
    });

    await escalateTenantTickets(testDb.db);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("priority")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.priority).toBe("low");
  });

  it("does NOT escalate tickets already at urgent", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 1 });
    const ticketId = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 10,
      priority: "urgent",
    });

    await escalateTenantTickets(testDb.db);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("priority")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.priority).toBe("urgent");
  });

  it("does NOT escalate closed tickets", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 1 });
    const ticketId = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 10,
      priority: "low",
      status: "closed",
    });

    await escalateTenantTickets(testDb.db);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("priority")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.priority).toBe("low");
  });

  it("creates priority_changed system follow-up on escalation", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 1 });
    const ticketId = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 5,
      priority: "low",
    });

    await escalateTenantTickets(testDb.db);

    const followups = await testDb.db
      .selectFrom("followups")
      .selectAll()
      .where("ticket_id", "=", ticketId)
      .where("source", "=", "system")
      .where("type", "=", "priority_changed")
      .execute();
    expect(followups.length).toBeGreaterThanOrEqual(1);
  });

  it("fresh ticket under threshold is NOT escalated", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 30 });
    const ticketId = await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 1,
      priority: "low",
    });

    await escalateTenantTickets(testDb.db);

    const ticket = await testDb.db
      .selectFrom("tickets")
      .select("priority")
      .where("id", "=", ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.priority).toBe("low");
  });

  it("a failed follow-up insert leaves every ticket's priority as it was", async () => {
    const queue = await createTestQueue(testDb.db, { escalateDays: 3 });
    await insertTicketWithAge({
      queueId: queue.id,
      ageDays: 5,
      priority: "low",
    });
    const onTicketChanged = vi.fn<TicketChangeListener>();

    async function priorities(): Promise<
      { id: TicketId; priority: TicketPriority }[]
    > {
      return testDb.db
        .selectFrom("tickets")
        .select(["id", "priority"])
        .orderBy("id")
        .execute();
    }

    async function totalFollowUps(): Promise<number> {
      const row = await testDb.db
        .selectFrom("followups")
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirstOrThrow();
      return Number(row.count);
    }

    const before = await priorities();
    const followUpsBefore = await totalFollowUps();

    await expect(
      escalateTenantTickets(
        withFailingFollowUpInserts(testDb.db),
        onTicketChanged,
      ),
    ).rejects.toBeInstanceOf(FollowUpInsertFailure);

    expect(await priorities()).toEqual(before);
    expect(await totalFollowUps()).toBe(followUpsBefore);
    expect(onTicketChanged).not.toHaveBeenCalled();
  });
});

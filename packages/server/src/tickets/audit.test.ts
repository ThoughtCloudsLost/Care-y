import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestQueue,
  createTestTicketFixture,
  createTestUser,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import { createAuditService, type AuditService } from "./audit.js";
import * as crypto from "node:crypto";
import { newTicketId, type TicketId, type UserId } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("AuditService (DB)", () => {
  let testDb: TestDb;
  let svc: AuditService;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    svc = createAuditService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // -----------------------------------------------------------------------
  // log
  // -----------------------------------------------------------------------

  it("log inserts an audit entry", async () => {
    const user = await createTestUser(testDb.db);
    const ticketId: TicketId = newTicketId();

    await svc.log({
      eventType: "ticket_created",
      actorId: user.id,
      ticketId,
      metadata: { source: "test" },
    });

    const rows = await testDb.db
      .selectFrom("audit_log")
      .selectAll()
      .where("actor_id", "=", user.id)
      .where("ticket_id", "=", ticketId)
      .execute();

    expect(rows).toHaveLength(1);
    expect(rows[0]!.event_type).toBe("ticket_created");
    expect(rows[0]!.actor_id).toBe(user.id);
    expect(rows[0]!.ticket_id).toBe(ticketId);
    expect(rows[0]!.metadata).toEqual({ source: "test" });
    expect(rows[0]!.created_at).toBeInstanceOf(Date);
  });

  it("log silently ignores failures (best-effort)", async () => {
    // Pass a broken Kysely instance that will fail on insert.
    // The service should swallow the error, not throw.
    const brokenSvc = createAuditService(
      // A proxy that throws on any property access beyond what the service
      // needs to start building the query. We simulate a DB error by
      // providing a mock that rejects at execute time.
      {
        insertInto() {
          return {
            values() {
              return {
                execute() {
                  return Promise.reject(new Error("simulated DB failure"));
                },
              };
            },
          };
        },
      } as unknown as Parameters<typeof createAuditService>[0],
    );

    // Should not throw
    await expect(
      brokenSvc.log({
        eventType: "ticket_created",
        actorId: crypto.randomUUID() as UserId,
      }),
    ).resolves.toBeUndefined();
  });

  // -----------------------------------------------------------------------
  // query
  // -----------------------------------------------------------------------

  it("query filters by eventType", async () => {
    const user = await createTestUser(testDb.db);

    await svc.log({ eventType: "ticket_created", actorId: user.id });
    await svc.log({ eventType: "ticket_closed", actorId: user.id });

    const result = await svc.query({
      eventType: "ticket_created",
      actorId: user.id,
      page: 1,
      pageSize: 50,
    });

    expect(result.entries.length).toBeGreaterThanOrEqual(1);
    expect(result.entries.every((e) => e.eventType === "ticket_created")).toBe(
      true,
    );
  });

  it("query filters by actorId", async () => {
    const userA = await createTestUser(testDb.db);
    const userB = await createTestUser(testDb.db);

    await svc.log({ eventType: "ticket_created", actorId: userA.id });
    await svc.log({ eventType: "ticket_created", actorId: userB.id });

    const result = await svc.query({
      actorId: userA.id,
      page: 1,
      pageSize: 50,
    });

    expect(result.entries.length).toBeGreaterThanOrEqual(1);
    expect(result.entries.every((e) => e.actorId === userA.id)).toBe(true);
  });

  it("query filters by ticketId", async () => {
    const user = await createTestUser(testDb.db);
    const ticketA: TicketId = newTicketId();
    const ticketB: TicketId = newTicketId();

    await svc.log({
      eventType: "ticket_created",
      actorId: user.id,
      ticketId: ticketA,
    });
    await svc.log({
      eventType: "ticket_created",
      actorId: user.id,
      ticketId: ticketB,
    });

    const result = await svc.query({
      ticketId: ticketA,
      page: 1,
      pageSize: 50,
    });

    expect(result.entries.length).toBeGreaterThanOrEqual(1);
    expect(result.entries.every((e) => e.ticketId === ticketA)).toBe(true);
  });

  it("query paginates results", async () => {
    const user = await createTestUser(testDb.db);

    // Insert 3 entries for this user
    for (let i = 0; i < 3; i++) {
      await svc.log({ eventType: "ticket_created", actorId: user.id });
    }

    const page1 = await svc.query({
      actorId: user.id,
      page: 1,
      pageSize: 2,
    });
    expect(page1.entries).toHaveLength(2);
    expect(page1.page).toBe(1);
    expect(page1.pageSize).toBe(2);
    expect(page1.total).toBeGreaterThanOrEqual(3);

    const page2 = await svc.query({
      actorId: user.id,
      page: 2,
      pageSize: 2,
    });
    expect(page2.entries.length).toBeGreaterThanOrEqual(1);
    expect(page2.page).toBe(2);

    // No overlap between pages
    const page1Ids = new Set(page1.entries.map((e) => e.id));
    for (const e of page2.entries) {
      expect(page1Ids.has(e.id)).toBe(false);
    }
  });

  it("query filters by date range", async () => {
    const user = await createTestUser(testDb.db);

    await svc.log({ eventType: "queue_created", actorId: user.id });

    // Backdate the entry to a known timestamp
    await testDb.db
      .updateTable("audit_log")
      .set({ created_at: new Date("2025-06-15T12:00:00Z") })
      .where("actor_id", "=", user.id)
      .where("event_type", "=", "queue_created")
      .execute();

    // Range that includes the date
    const inRange = await svc.query({
      actorId: user.id,
      eventType: "queue_created",
      dateFrom: "2025-06-01T00:00:00Z",
      dateTo: "2025-07-01T00:00:00Z",
      page: 1,
      pageSize: 50,
    });
    expect(inRange.entries.length).toBeGreaterThanOrEqual(1);

    // Range that excludes the date
    const outOfRange = await svc.query({
      actorId: user.id,
      eventType: "queue_created",
      dateFrom: "2025-08-01T00:00:00Z",
      dateTo: "2025-09-01T00:00:00Z",
      page: 1,
      pageSize: 50,
    });
    expect(outOfRange.entries).toHaveLength(0);
  });

  // -----------------------------------------------------------------------
  // listRecentForQueues
  // -----------------------------------------------------------------------

  describe("listRecentForQueues", () => {
    it("returns ticket-linked events for the requested queues only", async () => {
      const user = await createTestUser(testDb.db);
      const mine = await createTestTicketFixture(testDb.db);
      const other = await createTestTicketFixture(testDb.db);

      await svc.log({
        eventType: "ticket_created",
        actorId: user.id,
        ticketId: mine.ticketId,
      });
      await svc.log({
        eventType: "ticket_created",
        actorId: user.id,
        ticketId: other.ticketId,
      });

      const rows = await svc.listRecentForQueues([mine.queueId], 10);

      expect(rows.some((r) => r.ticketId === mine.ticketId)).toBe(true);
      expect(rows.some((r) => r.ticketId === other.ticketId)).toBe(false);
    });

    it("returns the client alias and the queue name as ciphertext", async () => {
      const user = await createTestUser(testDb.db);
      const fixture = await createTestTicketFixture(testDb.db);

      await svc.log({
        eventType: "ticket_created",
        actorId: user.id,
        ticketId: fixture.ticketId,
      });

      const rows = await svc.listRecentForQueues([fixture.queueId], 10);
      const row = rows.find((r) => r.ticketId === fixture.ticketId);

      expect(row).toBeDefined();
      expect(row!.queueId).toBe(fixture.queueId);
      expect(row!.clientId).toBeDefined();
      expect(Buffer.isBuffer(row!.encryptedClientAlias)).toBe(true);
      // Queue names are encrypted at rest (ADR-030); this service hands the
      // bytes through untouched for client-side decryption.
      expect(Buffer.isBuffer(row!.encryptedQueueName)).toBe(true);
      expect(row!.createdAt).toBeInstanceOf(Date);
    });

    it("excludes events with no ticket", async () => {
      const user = await createTestUser(testDb.db);
      const fixture = await createTestTicketFixture(testDb.db);

      await svc.log({ eventType: "queue_created", actorId: user.id });

      const rows = await svc.listRecentForQueues([fixture.queueId], 50);

      expect(rows.every((r) => r.ticketId !== null)).toBe(true);
    });

    it("orders newest first and honours the limit", async () => {
      const user = await createTestUser(testDb.db);
      const queue = await createTestQueue(testDb.db);
      const first = await createTestTicketFixture(testDb.db, {
        queueId: queue.id,
      });
      const second = await createTestTicketFixture(testDb.db, {
        queueId: queue.id,
      });

      await svc.log({
        eventType: "ticket_created",
        actorId: user.id,
        ticketId: first.ticketId,
      });
      await svc.log({
        eventType: "ticket_closed",
        actorId: user.id,
        ticketId: second.ticketId,
      });

      // Force a deterministic ordering (both inserts can land in the same tick).
      await testDb.db
        .updateTable("audit_log")
        .set({ created_at: new Date("2025-01-01T00:00:00Z") })
        .where("ticket_id", "=", first.ticketId)
        .execute();
      await testDb.db
        .updateTable("audit_log")
        .set({ created_at: new Date("2025-01-02T00:00:00Z") })
        .where("ticket_id", "=", second.ticketId)
        .execute();

      const rows = await svc.listRecentForQueues([queue.id], 1);

      expect(rows).toHaveLength(1);
      expect(rows[0]!.ticketId).toBe(second.ticketId);
    });

    it("returns an empty array when given no queue IDs", async () => {
      expect(await svc.listRecentForQueues([], 10)).toEqual([]);
    });
  });
});

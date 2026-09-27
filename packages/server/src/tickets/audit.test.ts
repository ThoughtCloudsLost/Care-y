import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestQueue,
  createTestTicketFixture,
  createTestUser,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import {
  createAuditService,
  type AuditService,
  type RecentActivityEntry,
  type RecentActivityScope,
} from "./audit.js";
import { resolveFeedScope } from "./activity-feed-scope.js";
import * as crypto from "node:crypto";
import {
  Permission,
  newTicketId,
  type AuditEventType,
  type AuditLogId,
  type TicketId,
  type UserId,
} from "@care-y/shared";

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
  // listRecentActivity / countRecentActivity
  // -----------------------------------------------------------------------

  const TICKET_EVENTS: readonly AuditEventType[] = [
    "ticket_created",
    "ticket_closed",
  ];

  /** Audit row ids one actor wrote for one event type. */
  async function idsFor(
    actorId: UserId,
    eventType: AuditEventType,
  ): Promise<AuditLogId[]> {
    const rows = await testDb.db
      .selectFrom("audit_log")
      .select("id")
      .where("actor_id", "=", actorId)
      .where("event_type", "=", eventType)
      .execute();
    return rows.map((r) => r.id);
  }

  async function setCreatedAt(
    id: AuditLogId,
    at: string | Date,
  ): Promise<void> {
    await testDb.db
      .updateTable("audit_log")
      .set({ created_at: new Date(at) })
      .where("id", "=", id)
      .execute();
  }

  describe("listRecentActivity", () => {
    it("returns ticket events in the caller's queues with alias and queue ciphertext", async () => {
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

      const rows = await svc.listRecentActivity({
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: [],
        ownQueueIds: [mine.queueId],
        allQueues: false,
        limit: 500,
      });

      const row = rows
        .flatMap((r) => (r.kind === "ticket" ? [r] : []))
        .find((r) => r.ticketId === mine.ticketId);
      expect(row).toBeDefined();
      expect(row!.queueId).toBe(mine.queueId);
      expect(row!.clientId).toBe(mine.clientId);
      expect(Buffer.isBuffer(row!.encryptedClientAlias)).toBe(true);
      // Queue names are encrypted at rest (ADR-030); this service hands the
      // bytes through untouched for client-side decryption.
      expect(Buffer.isBuffer(row!.encryptedQueueName)).toBe(true);
      expect(row!.createdAt).toBeInstanceOf(Date);
    });

    it("returns no outside-queue rows without allQueues", async () => {
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

      const rows = await svc.listRecentActivity({
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: [],
        ownQueueIds: [mine.queueId],
        allQueues: false,
        limit: 500,
      });

      expect(rows.length).toBeGreaterThan(0);
      expect(
        rows.every((r) => r.kind === "ticket" && r.queueId === mine.queueId),
      ).toBe(true);
    });

    it("returns outside-queue rows without ticket, client or alias when allQueues is set", async () => {
      const user = await createTestUser(testDb.db);
      const mine = await createTestTicketFixture(testDb.db);
      const other = await createTestTicketFixture(testDb.db);

      await svc.log({
        eventType: "ticket_closed",
        actorId: user.id,
        ticketId: mine.ticketId,
      });
      await svc.log({
        eventType: "ticket_created",
        actorId: user.id,
        ticketId: other.ticketId,
      });
      const [outsideId] = await idsFor(user.id, "ticket_created");

      const rows = await svc.listRecentActivity({
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: [],
        ownQueueIds: [mine.queueId],
        allQueues: true,
        limit: 500,
      });

      const outside = rows.find((r) => r.id === outsideId);
      expect(outside).toEqual({
        kind: "ticket_outside_queues",
        id: outsideId,
        eventType: "ticket_created",
        queueId: other.queueId,
        encryptedQueueName: expect.any(Buffer),
        createdAt: expect.any(Date),
      });
      expect(outside).not.toHaveProperty("ticketId");
      expect(outside).not.toHaveProperty("clientId");
      expect(outside).not.toHaveProperty("encryptedClientAlias");

      // Rows in the caller's own queues still come back in full.
      expect(
        rows.some((r) => r.kind === "ticket" && r.ticketId === mine.ticketId),
      ).toBe(true);
    });

    it("returns org rows for the requested types only", async () => {
      const user = await createTestUser(testDb.db);

      await svc.log({ eventType: "queue_created", actorId: user.id });
      await svc.log({ eventType: "note_type_created", actorId: user.id });
      const [queueEventId] = await idsFor(user.id, "queue_created");
      const [noteTypeEventId] = await idsFor(user.id, "note_type_created");

      const rows = await svc.listRecentActivity({
        ticketEventTypes: [],
        orgEventTypes: ["queue_created"],
        ownQueueIds: [],
        allQueues: false,
        limit: 500,
      });

      expect(rows.find((r) => r.id === queueEventId)).toEqual({
        kind: "org",
        id: queueEventId,
        eventType: "queue_created",
        createdAt: expect.any(Date),
      });
      expect(rows.some((r) => r.id === noteTypeEventId)).toBe(false);
      expect(
        rows.every((r) => r.kind === "org" && r.eventType === "queue_created"),
      ).toBe(true);
    });

    it("never returns excluded event types", async () => {
      const user = await createTestUser(testDb.db);
      const fixture = await createTestTicketFixture(testDb.db);

      await svc.log({ eventType: "org_key_reseal", actorId: user.id });
      await svc.log({
        eventType: "portal_history_reseed_chunk",
        actorId: user.id,
        ticketId: fixture.ticketId,
      });

      const scope = resolveFeedScope(new Set(Object.values(Permission)));
      const rows = await svc.listRecentActivity({
        ...scope,
        ownQueueIds: [fixture.queueId],
        limit: 500,
      });

      expect(rows.some((r) => r.eventType === "org_key_reseal")).toBe(false);
      expect(
        rows.some((r) => r.eventType === "portal_history_reseed_chunk"),
      ).toBe(false);
    });

    it("merges both kinds newest first and honours the limit", async () => {
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
      await svc.log({ eventType: "queue_updated", actorId: user.id });
      await svc.log({
        eventType: "ticket_closed",
        actorId: user.id,
        ticketId: second.ticketId,
      });
      const [createdId] = await idsFor(user.id, "ticket_created");
      const [orgId] = await idsFor(user.id, "queue_updated");
      const [closedId] = await idsFor(user.id, "ticket_closed");

      // Future timestamps put these rows ahead of everything else in the
      // shared test schema, and fix their order (inserts can share a tick).
      await setCreatedAt(createdId!, "2099-01-01T00:00:00Z");
      await setCreatedAt(orgId!, "2099-01-02T00:00:00Z");
      await setCreatedAt(closedId!, "2099-01-03T00:00:00Z");

      const query = {
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: ["queue_updated"],
        ownQueueIds: [queue.id],
        allQueues: false,
      } as const;

      const three = await svc.listRecentActivity({ ...query, limit: 3 });
      expect(three.map((r) => [r.kind, r.id])).toEqual([
        ["ticket", closedId],
        ["org", orgId],
        ["ticket", createdId],
      ]);

      const two = await svc.listRecentActivity({ ...query, limit: 2 });
      expect(two.map((r) => r.id)).toEqual([closedId, orgId]);
    });

    it("returns an empty array when every list is empty", async () => {
      expect(
        await svc.listRecentActivity({
          ticketEventTypes: [],
          orgEventTypes: [],
          ownQueueIds: [],
          allQueues: true,
          limit: 10,
        }),
      ).toEqual([]);
    });

    it("returns no ticket rows when the caller has no queues and allQueues is unset", async () => {
      const rows = await svc.listRecentActivity({
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: [],
        ownQueueIds: [],
        allQueues: false,
        limit: 10,
      });
      expect(rows).toEqual([]);
    });
  });

  describe("countRecentActivity", () => {
    const HOUR_MS = 60 * 60 * 1000;

    it("counts only rows created at or after since", async () => {
      const user = await createTestUser(testDb.db);
      const queue = await createTestQueue(testDb.db);
      const fixture = await createTestTicketFixture(testDb.db, {
        queueId: queue.id,
      });

      await svc.log({
        eventType: "ticket_created",
        actorId: user.id,
        ticketId: fixture.ticketId,
      });
      await svc.log({
        eventType: "ticket_closed",
        actorId: user.id,
        ticketId: fixture.ticketId,
      });
      await svc.log({
        eventType: "ticket_closed",
        actorId: user.id,
        ticketId: fixture.ticketId,
      });
      const [createdId] = await idsFor(user.id, "ticket_created");
      const [closedId] = await idsFor(user.id, "ticket_closed");

      const since = new Date(Date.now() - HOUR_MS);
      // One row on the cutoff itself (counted), one just before it (not).
      await setCreatedAt(createdId!, since);
      await setCreatedAt(closedId!, new Date(since.getTime() - 60_000));

      const count = await svc.countRecentActivity({
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: [],
        ownQueueIds: [queue.id],
        allQueues: false,
        since,
      });
      expect(count).toBe(2);
    });

    it("counts only the caller's queues unless allQueues is set", async () => {
      const user = await createTestUser(testDb.db);
      const mineQueue = await createTestQueue(testDb.db);
      const otherQueue = await createTestQueue(testDb.db);
      const mine = await createTestTicketFixture(testDb.db, {
        queueId: mineQueue.id,
      });
      const other = await createTestTicketFixture(testDb.db, {
        queueId: otherQueue.id,
      });
      const since = new Date(Date.now() - HOUR_MS);
      const scope = {
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: [],
        ownQueueIds: [mineQueue.id],
        since,
      } as const;

      // Other tests share this schema, so measure the change across all
      // queues rather than an absolute number.
      const allBefore = await svc.countRecentActivity({
        ...scope,
        allQueues: true,
      });

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

      expect(
        await svc.countRecentActivity({ ...scope, allQueues: false }),
      ).toBe(1);
      expect(await svc.countRecentActivity({ ...scope, allQueues: true })).toBe(
        allBefore + 2,
      );
    });

    it("counts org rows of the requested types only", async () => {
      const user = await createTestUser(testDb.db);
      const since = new Date(Date.now() - HOUR_MS);
      const query = {
        ticketEventTypes: [],
        orgEventTypes: ["queue_created"],
        ownQueueIds: [],
        allQueues: false,
        since,
      } as const;
      const before = await svc.countRecentActivity(query);

      await svc.log({ eventType: "queue_created", actorId: user.id });
      await svc.log({ eventType: "queue_created", actorId: user.id });
      await svc.log({ eventType: "queue_created", actorId: user.id });
      await svc.log({ eventType: "note_type_created", actorId: user.id });
      const [olderId] = await idsFor(user.id, "queue_created");
      await setCreatedAt(olderId!, new Date(since.getTime() - HOUR_MS));

      expect(await svc.countRecentActivity(query)).toBe(before + 2);
    });

    it("never counts excluded event types", async () => {
      const user = await createTestUser(testDb.db);
      const fixture = await createTestTicketFixture(testDb.db);
      const scope = resolveFeedScope(new Set(Object.values(Permission)));
      const query = {
        ...scope,
        ownQueueIds: [fixture.queueId],
        since: new Date(Date.now() - HOUR_MS),
      };
      const before = await svc.countRecentActivity(query);

      await svc.log({ eventType: "org_key_reseal", actorId: user.id });
      await svc.log({
        eventType: "portal_history_reseed_chunk",
        actorId: user.id,
        ticketId: fixture.ticketId,
      });

      expect(await svc.countRecentActivity(query)).toBe(before);
    });

    it("counts past the feed's row limit", async () => {
      const user = await createTestUser(testDb.db);
      const queue = await createTestQueue(testDb.db);
      const fixture = await createTestTicketFixture(testDb.db, {
        queueId: queue.id,
      });

      for (let i = 0; i < 7; i++) {
        await svc.log({
          eventType: "ticket_created",
          actorId: user.id,
          ticketId: fixture.ticketId,
        });
      }

      const count = await svc.countRecentActivity({
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: [],
        ownQueueIds: [queue.id],
        allQueues: false,
        since: new Date(Date.now() - HOUR_MS),
      });
      expect(count).toBe(7);
    });

    it("returns zero when every list is empty", async () => {
      expect(
        await svc.countRecentActivity({
          ticketEventTypes: [],
          orgEventTypes: [],
          ownQueueIds: [],
          allQueues: true,
          since: new Date(0),
        }),
      ).toBe(0);
    });

    it("counts no ticket rows when the caller has no queues and allQueues is unset", async () => {
      expect(
        await svc.countRecentActivity({
          ticketEventTypes: TICKET_EVENTS,
          orgEventTypes: [],
          ownQueueIds: [],
          allQueues: false,
          since: new Date(0),
        }),
      ).toBe(0);
    });
  });

  describe("recent activity filters", () => {
    const EPOCH = new Date(0);
    const ORG_EVENTS: readonly AuditEventType[] = ["queue_created"];

    /**
     * Two fresh queues with one ticket event each, and one org event. The
     * queues are new, so ticket counts scoped to them are exact.
     */
    async function seedTwoQueues() {
      const user = await createTestUser(testDb.db);
      const queueA = await createTestQueue(testDb.db);
      const queueB = await createTestQueue(testDb.db);
      const a = await createTestTicketFixture(testDb.db, {
        queueId: queueA.id,
      });
      const b = await createTestTicketFixture(testDb.db, {
        queueId: queueB.id,
      });
      await svc.log({
        eventType: "ticket_created",
        actorId: user.id,
        ticketId: a.ticketId,
      });
      await svc.log({
        eventType: "ticket_created",
        actorId: user.id,
        ticketId: b.ticketId,
      });
      await svc.log({ eventType: "queue_created", actorId: user.id });
      const [orgId] = await idsFor(user.id, "queue_created");
      return { queueA: queueA.id, queueB: queueB.id, a, b, orgId: orgId! };
    }

    /** List (uncut) and count for one scope, which must always agree. */
    async function listAndCount(scope: RecentActivityScope): Promise<{
      rows: readonly RecentActivityEntry[];
      count: number;
    }> {
      const [rows, count] = await Promise.all([
        svc.listRecentActivity({ ...scope, limit: 500 }),
        svc.countRecentActivity({ ...scope, since: EPOCH }),
      ]);
      expect(rows).toHaveLength(count);
      return { rows, count };
    }

    it("kinds without org leaves org rows out of list and count", async () => {
      const seed = await seedTwoQueues();

      const { rows, count } = await listAndCount({
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: ORG_EVENTS,
        ownQueueIds: [seed.queueA, seed.queueB],
        allQueues: false,
        kinds: ["ticket"],
      });

      expect(count).toBe(2);
      expect(rows.some((r) => r.id === seed.orgId)).toBe(false);
      expect(rows.every((r) => r.kind === "ticket")).toBe(true);
    });

    it("kinds without ticket leaves own-queue and outside-queue rows out of list and count", async () => {
      const seed = await seedTwoQueues();
      const scope = {
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: ORG_EVENTS,
        ownQueueIds: [seed.queueA],
        allQueues: true,
      } as const;

      const { rows, count } = await listAndCount({ ...scope, kinds: ["org"] });

      expect(rows.some((r) => r.id === seed.orgId)).toBe(true);
      expect(rows.every((r) => r.kind === "org")).toBe(true);
      // The same as asking for no ticket event types at all.
      expect(count).toBe(
        await svc.countRecentActivity({
          ...scope,
          ticketEventTypes: [],
          since: EPOCH,
        }),
      );
    });

    it("queueIds narrows ticket rows and drops org rows from list and count", async () => {
      const seed = await seedTwoQueues();

      const { rows, count } = await listAndCount({
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: ORG_EVENTS,
        ownQueueIds: [seed.queueA, seed.queueB],
        allQueues: false,
        queueIds: [seed.queueA],
      });

      expect(count).toBe(1);
      expect(rows[0]).toMatchObject({
        kind: "ticket",
        ticketId: seed.a.ticketId,
        queueId: seed.queueA,
      });
    });

    it("queueIds narrows outside-queue rows for an all-queues caller", async () => {
      const seed = await seedTwoQueues();

      const { rows, count } = await listAndCount({
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: ORG_EVENTS,
        ownQueueIds: [seed.queueA],
        allQueues: true,
        queueIds: [seed.queueB],
      });

      expect(count).toBe(1);
      expect(rows[0]).toMatchObject({
        kind: "ticket_outside_queues",
        queueId: seed.queueB,
      });
    });

    it("a queue filter never widens the caller's scope", async () => {
      const seed = await seedTwoQueues();
      const scope = {
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: ORG_EVENTS,
        ownQueueIds: [seed.queueA],
        allQueues: false,
      } as const;

      // A queue the caller is not in matches nothing.
      expect(await listAndCount({ ...scope, queueIds: [seed.queueB] })).toEqual(
        { rows: [], count: 0 },
      );

      // Naming it beside an own queue still returns only the own queue.
      const { rows, count } = await listAndCount({
        ...scope,
        queueIds: [seed.queueA, seed.queueB],
      });
      expect(count).toBe(1);
      expect(
        rows.every((r) => r.kind === "ticket" && r.queueId === seed.queueA),
      ).toBe(true);
    });

    it("empty filter lists and every kind leave the feed unfiltered", async () => {
      const seed = await seedTwoQueues();
      const scope = {
        ticketEventTypes: TICKET_EVENTS,
        orgEventTypes: ORG_EVENTS,
        ownQueueIds: [seed.queueA, seed.queueB],
        allQueues: false,
      } as const;

      const unfiltered = await listAndCount(scope);
      expect(unfiltered.rows.some((r) => r.id === seed.orgId)).toBe(true);
      expect(await listAndCount({ ...scope, kinds: [], queueIds: [] })).toEqual(
        unfiltered,
      );
      expect(
        await listAndCount({ ...scope, kinds: ["ticket", "org"] }),
      ).toEqual(unfiltered);
    });
  });
});

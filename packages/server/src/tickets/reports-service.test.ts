// care-y-ignore db-write-no-crypto-import -- test seeds plaintext ticket metadata (status, priority, timestamps) and empty follow-up content via noopEncryptor; no PII is written.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestQueue,
  createTestTicketFixture,
  noopEncryptor,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import {
  createReportsService,
  priorityToNumeric,
  type ReportsService,
} from "./reports-service.js";
import type { QueueId, TicketId } from "@care-y/shared";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * YYYY-MM key for the month `monthsBack` months before now. Month keys are
 * part of the tRPC wire contract: the reports charts consume them as labels.
 */
function monthKey(monthsBack: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * A Date safely inside the month `monthsBack` months ago. Mid-month days at
 * noon keep a wide margin from month boundaries in any timezone, so seeded
 * rows land in the intended monthly bucket.
 */
function dateInMonth(monthsBack: number, day: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthsBack, day, 12);
}

/** The 12 month keys the trend endpoints cover, oldest first. */
function expectedMonthKeys(): string[] {
  const keys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    keys.push(monthKey(i));
  }
  return keys;
}

describe("priorityToNumeric", () => {
  it("maps each ticket priority to its ascending numeric order", () => {
    expect(priorityToNumeric("low")).toBe(0);
    expect(priorityToNumeric("normal")).toBe(1);
    expect(priorityToNumeric("high")).toBe(2);
    expect(priorityToNumeric("urgent")).toBe(3);
  });

  it("falls back to 0 for unknown priority values", () => {
    expect(priorityToNumeric("medium")).toBe(0);
    expect(priorityToNumeric("URGENT")).toBe(0);
    expect(priorityToNumeric("")).toBe(0);
  });
});

describe.skipIf(!process.env.DATABASE_URL)("ReportsService (DB)", () => {
  describe("with no tickets", () => {
    let testDb: TestDb;
    let svc: ReportsService;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      // A queue with no tickets, to pin that ticketless queues are omitted.
      await createTestQueue(testDb.db, { label: "empty-queue" });
      svc = createReportsService(testDb.db);
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("queueStats omits queues that have no tickets", async () => {
      expect(await svc.queueStats()).toEqual([]);
    });

    it("volumeTrends returns 12 months of zeros ending at the current month", async () => {
      const trends = await svc.volumeTrends();

      expect(trends).toHaveLength(12);
      for (const month of trends) {
        expect(month.created).toBe(0);
        expect(month.closed).toBe(0);
        // YYYY-MM is the wire format the reports charts consume as labels.
        expect(month.month).toMatch(/^\d{4}-\d{2}$/);
      }
      expect(trends[11]!.month).toBe(monthKey(0));
    });

    it("resolutionTrends returns 12 months with avgDays 0", async () => {
      const trends = await svc.resolutionTrends();

      expect(trends).toHaveLength(12);
      for (const month of trends) {
        expect(month.avgDays).toBe(0);
        // YYYY-MM is the wire format the reports charts consume as labels.
        expect(month.month).toMatch(/^\d{4}-\d{2}$/);
      }
      expect(trends[11]!.month).toBe(monthKey(0));
    });

    it("priorityBreakdown returns empty array", async () => {
      expect(await svc.priorityBreakdown()).toEqual([]);
    });

    it("activeCount returns 0", async () => {
      expect(await svc.activeCount()).toBe(0);
    });
  });

  describe("with a seeded ticket dataset", () => {
    let testDb: TestDb;
    let svc: ReportsService;
    let queueA: QueueId;
    let queueB: QueueId;

    async function seedTicket(opts: {
      queueId: QueueId;
      status: "open" | "closed";
      priority: "low" | "normal" | "high" | "urgent";
      createdAt?: Date;
      closingFollowupAt?: Date;
    }): Promise<void> {
      const fix = await createTestTicketFixture(testDb.db, {
        queueId: opts.queueId,
      });

      await testDb.db
        .updateTable("tickets")
        .set({
          status: opts.status,
          priority: opts.priority,
          ...(opts.createdAt !== undefined
            ? { created_at: opts.createdAt }
            : {}),
        })
        .where("id", "=", fix.ticketId)
        .execute();

      if (opts.closingFollowupAt !== undefined) {
        // Mirror the system follow-up the ticket service writes on close:
        // empty encrypted content (noop encrypt of "" is a zero-length
        // Buffer, byte-identical to production's Buffer.alloc(0)).
        await testDb.db
          .insertInto("followups")
          .values({
            ticket_id: fix.ticketId,
            source: "system",
            type: "status_closed",
            encrypted_content: noopEncryptor.encrypt(""),
            created_at: opts.closingFollowupAt,
          })
          .execute();
      }
    }

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      svc = createReportsService(testDb.db);

      // Queue B is created first with the higher sort_order to prove that
      // queueStats orders by sort_order, not by insertion order. High
      // sentinel values keep clear of any fixture-assigned sort_order.
      queueB = (
        await createTestQueue(testDb.db, { label: "QB", sortOrder: 9002 })
      ).id;
      queueA = (
        await createTestQueue(testDb.db, { label: "QA", sortOrder: 9001 })
      ).id;

      const closeA3 = dateInMonth(1, 15);
      const closeB2 = dateInMonth(1, 20);
      const closeB3 = dateInMonth(1, 12);

      // Queue A: two open low tickets (this month and last month), one
      // urgent ticket closed in exactly 40 days, one closed ticket 11
      // months back (oldest trend bucket), and one closed ticket 13 months
      // back (outside the trend window but still counted by queueStats).
      await seedTicket({ queueId: queueA, status: "open", priority: "low" });
      await seedTicket({
        queueId: queueA,
        status: "open",
        priority: "low",
        createdAt: dateInMonth(1, 15),
      });
      await seedTicket({
        queueId: queueA,
        status: "closed",
        priority: "urgent",
        createdAt: new Date(closeA3.getTime() - 40 * DAY_MS),
        closingFollowupAt: closeA3,
      });
      await seedTicket({
        queueId: queueA,
        status: "closed",
        priority: "low",
        createdAt: dateInMonth(11, 15),
      });
      await seedTicket({
        queueId: queueA,
        status: "closed",
        priority: "low",
        createdAt: dateInMonth(13, 15),
      });

      // Queue B: one open normal ticket (this month), one high ticket
      // closed in exactly 5.25 days, and one urgent ticket that was closed
      // but then reopened (status open again, stale closing follow-up).
      await seedTicket({ queueId: queueB, status: "open", priority: "normal" });
      await seedTicket({
        queueId: queueB,
        status: "closed",
        priority: "high",
        createdAt: new Date(closeB2.getTime() - 5.25 * DAY_MS),
        closingFollowupAt: closeB2,
      });
      await seedTicket({
        queueId: queueB,
        status: "open",
        priority: "urgent",
        createdAt: new Date(closeB3.getTime() - 2 * DAY_MS),
        closingFollowupAt: closeB3,
      });
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("queueStats aggregates open and closed counts per queue ordered by sort_order", async () => {
      const stats = await svc.queueStats();

      expect(stats).toEqual([
        {
          queueId: queueA,
          encryptedQueueName: Buffer.from("QA"),
          open: 2,
          closed: 3,
        },
        {
          queueId: queueB,
          encryptedQueueName: Buffer.from("QB"),
          open: 2,
          closed: 1,
        },
      ]);
    });

    it("volumeTrends counts tickets created per month across the 12-month window", async () => {
      const trends = await svc.volumeTrends();

      // The 13-month-old ticket appears in no bucket; the 11-month-old one
      // lands in the oldest bucket.
      const createdByMonth = new Map<string, number>([
        [monthKey(11), 1],
        [monthKey(2), 1],
        [monthKey(1), 3],
        [monthKey(0), 2],
      ]);
      const actual = trends.map((m) => ({
        month: m.month,
        created: m.created,
      }));
      const expected = expectedMonthKeys().map((month) => ({
        month,
        created: createdByMonth.get(month) ?? 0,
      }));
      expect(actual).toEqual(expected);
    });

    it("volumeTrends counts closures from system closing follow-ups, excluding reopened tickets", async () => {
      const trends = await svc.volumeTrends();

      // Two tickets closed last month. The reopened ticket has a closing
      // follow-up in the same month but must not count (3 would be wrong).
      const actual = trends.map((m) => ({
        month: m.month,
        closed: m.closed,
      }));
      const expected = expectedMonthKeys().map((month) => ({
        month,
        closed: month === monthKey(1) ? 2 : 0,
      }));
      expect(actual).toEqual(expected);
    });

    it("resolutionTrends averages days-to-close per month, rounded to one decimal", async () => {
      const trends = await svc.resolutionTrends();

      expect(trends).toHaveLength(12);
      const byMonth = new Map(trends.map((m) => [m.month, m.avgDays]));
      // (40 + 5.25) / 2 = 22.625 rounds to 22.6. The reopened ticket's
      // follow-up (2 days) is excluded; including it would give 15.8.
      expect(byMonth.get(monthKey(1))).toBe(22.6);
      for (let i = 0; i < 12; i++) {
        if (i === 1) continue;
        expect(byMonth.get(monthKey(i))).toBe(0);
      }
    });

    it("priorityBreakdown counts open tickets by priority in ascending numeric order", async () => {
      const breakdown = await svc.priorityBreakdown();

      // Open tickets only: two low (queue A), one normal, one urgent (the
      // reopened ticket). The closed urgent and high tickets do not count,
      // so numeric priority 2 (high) is absent entirely.
      expect(breakdown).toEqual([
        { priority: 0, count: 2 },
        { priority: 1, count: 1 },
        { priority: 3, count: 1 },
      ]);
    });

    it("activeCount returns the number of open tickets across all queues", async () => {
      // Two open in queue A, one open plus the reopened one in queue B.
      expect(await svc.activeCount()).toBe(4);
    });
  });

  describe("callLog", () => {
    let testDb: TestDb;
    let svc: ReportsService;
    let aliasBytes: Buffer;
    let ticketId: TicketId;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      svc = createReportsService(testDb.db);

      const queue = await createTestQueue(testDb.db, { label: "CL-Q" });
      const fix = await createTestTicketFixture(testDb.db, {
        queueId: queue.id,
      });
      ticketId = fix.ticketId;

      // Read the seeded alias ciphertext for later assertion.
      const clientRow = await testDb.db
        .selectFrom("clients")
        .select("encrypted_alias")
        .where("id", "=", fix.clientId)
        .executeTakeFirstOrThrow();
      aliasBytes = clientRow.encrypted_alias;

      // Seed follow-ups:
      // 1. phone_call, source client (inbound), completed, 120s
      // 2. phone_call, source volunteer (outbound), null status
      // 3. voicemail, source client
      // 4. soft-deleted phone_call (must not appear)
      // 5. message follow-up (must not appear)

      const baseDate = new Date("2026-06-15T12:00:00Z");
      const followups = [
        {
          ticket_id: ticketId,
          source: "client",
          type: "phone_call",
          call_status: "completed",
          call_duration_seconds: 120,
          encrypted_content: noopEncryptor.encrypt(""),
          created_at: new Date(baseDate.getTime() + 3000),
        },
        {
          ticket_id: ticketId,
          source: "volunteer",
          type: "phone_call",
          call_status: null,
          call_duration_seconds: null,
          encrypted_content: noopEncryptor.encrypt(""),
          created_at: new Date(baseDate.getTime() + 2000),
        },
        {
          ticket_id: ticketId,
          source: "client",
          type: "voicemail",
          call_status: null,
          call_duration_seconds: 30,
          encrypted_content: noopEncryptor.encrypt(""),
          created_at: new Date(baseDate.getTime() + 1000),
        },
        {
          ticket_id: ticketId,
          source: "client",
          type: "phone_call",
          call_status: "completed",
          call_duration_seconds: 60,
          encrypted_content: noopEncryptor.encrypt(""),
          deleted_at: new Date(),
          created_at: new Date(baseDate.getTime() + 500),
        },
        {
          ticket_id: ticketId,
          source: "volunteer",
          type: "message",
          encrypted_content: noopEncryptor.encrypt(""),
          created_at: baseDate,
        },
      ];
      for (const fu of followups) {
        await testDb.db.insertInto("followups").values(fu).execute();
      }
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("returns only live phone_call and voicemail follow-ups", async () => {
      const result = await svc.callLog({ page: 1, pageSize: 50 });

      // 3 live call rows; soft-deleted and message excluded
      expect(result.total).toBe(3);
      expect(result.entries).toHaveLength(3);
      const types = result.entries.map((e) => e.type);
      expect(types).toContain("phone_call");
      expect(types).toContain("voicemail");
    });

    it("orders results newest-first", async () => {
      const result = await svc.callLog({ page: 1, pageSize: 50 });
      const timestamps = result.entries.map((e) => e.createdAt.getTime());
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i - 1]!).toBeGreaterThanOrEqual(timestamps[i]!);
      }
    });

    it("direction filter inbound returns client-source rows only", async () => {
      const result = await svc.callLog({
        direction: "inbound",
        page: 1,
        pageSize: 50,
      });

      expect(result.total).toBe(2);
      for (const e of result.entries) {
        expect(e.source).toBe("client");
      }
    });

    it("direction filter outbound returns volunteer-source rows only", async () => {
      const result = await svc.callLog({
        direction: "outbound",
        page: 1,
        pageSize: 50,
      });

      expect(result.total).toBe(1);
      expect(result.entries[0]!.source).toBe("volunteer");
    });

    it("callStatus filter narrows correctly", async () => {
      const result = await svc.callLog({
        callStatus: "completed",
        page: 1,
        pageSize: 50,
      });

      // Only one live completed phone_call (the other is soft-deleted)
      expect(result.total).toBe(1);
      expect(result.entries[0]!.callStatus).toBe("completed");
    });

    it("date range excludes rows outside it", async () => {
      // Only the two rows created before +2500ms should match
      const result = await svc.callLog({
        dateFrom: "2026-06-15T12:00:00Z",
        dateTo: "2026-06-15T12:00:02.500Z",
        page: 1,
        pageSize: 50,
      });

      expect(result.total).toBe(2);
    });

    it("pagination returns correct total with split pages", async () => {
      const page1 = await svc.callLog({ page: 1, pageSize: 2 });
      expect(page1.total).toBe(3);
      expect(page1.entries).toHaveLength(2);
      expect(page1.page).toBe(1);
      expect(page1.pageSize).toBe(2);

      const page2 = await svc.callLog({ page: 2, pageSize: 2 });
      expect(page2.total).toBe(3);
      expect(page2.entries).toHaveLength(1);
      expect(page2.page).toBe(2);
    });

    it("encryptedClientAlias bytes equal the seeded alias ciphertext", async () => {
      const result = await svc.callLog({ page: 1, pageSize: 1 });
      expect(result.entries[0]!.encryptedClientAlias).toEqual(aliasBytes);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createReportsService } from "./reports-service.js";

function createMockDb(): Parameters<typeof createReportsService>[0] {
  const executeMock = vi.fn().mockResolvedValue([]);
  const executeTakeFirstOrThrowMock = vi.fn().mockResolvedValue({ count: 0 });

  const chainMock = {
    innerJoin: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    execute: executeMock,
    executeTakeFirstOrThrow: executeTakeFirstOrThrowMock,
  };

  return {
    selectFrom: vi.fn().mockReturnValue(chainMock),
    _executeMock: executeMock,
    _executeTakeFirstOrThrowMock: executeTakeFirstOrThrowMock,
    _chainMock: chainMock,
  } as unknown as Parameters<typeof createReportsService>[0];
}

describe("createReportsService", () => {
  let db: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    db = createMockDb();
  });

  describe("queueStats", () => {
    it("returns formatted queue statistics", async () => {
      const raw = [
        {
          queueId: "q1",
          encryptedQueueName: Buffer.from("encrypted-general"),
          open: 5,
          closed: 10,
        },
        {
          queueId: "q2",
          encryptedQueueName: Buffer.from("encrypted-evening"),
          open: 2,
          closed: 7,
        },
      ];
      (
        db as unknown as { _executeMock: ReturnType<typeof vi.fn> }
      )._executeMock.mockResolvedValueOnce(raw);

      const svc = createReportsService(db);
      const result = await svc.queueStats();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        queueId: "q1",
        encryptedQueueName: Buffer.from("encrypted-general"),
        open: 5,
        closed: 10,
      });
      expect(result[1]).toEqual({
        queueId: "q2",
        encryptedQueueName: Buffer.from("encrypted-evening"),
        open: 2,
        closed: 7,
      });
    });

    it("returns empty array when no tickets exist", async () => {
      const svc = createReportsService(db);
      const result = await svc.queueStats();
      expect(result).toEqual([]);
    });
  });

  describe("volumeTrends", () => {
    it("returns 12 months of data even when DB has no tickets", async () => {
      const svc = createReportsService(db);
      const result = await svc.volumeTrends();

      expect(result).toHaveLength(12);
      for (const month of result) {
        expect(month.created).toBe(0);
        expect(month.closed).toBe(0);
        expect(month.month).toMatch(/^\d{4}-\d{2}$/);
      }
    });

    it("includes the current month as the last entry", async () => {
      const svc = createReportsService(db);
      const result = await svc.volumeTrends();

      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      expect(result[11]!.month).toBe(expected);
    });
  });

  describe("resolutionTrends", () => {
    it("returns 12 months of data even when DB has no closed tickets", async () => {
      const svc = createReportsService(db);
      const result = await svc.resolutionTrends();

      expect(result).toHaveLength(12);
      for (const month of result) {
        expect(month.avgDays).toBe(0);
        expect(month.month).toMatch(/^\d{4}-\d{2}$/);
      }
    });
  });

  describe("priorityBreakdown", () => {
    it("maps string priorities to numeric order", async () => {
      const raw = [
        { priority: "urgent", count: 3 },
        { priority: "low", count: 7 },
        { priority: "normal", count: 5 },
      ];
      (
        db as unknown as { _executeMock: ReturnType<typeof vi.fn> }
      )._executeMock.mockResolvedValueOnce(raw);

      const svc = createReportsService(db);
      const result = await svc.priorityBreakdown();

      expect(result).toEqual([
        { priority: 0, count: 7 },
        { priority: 1, count: 5 },
        { priority: 3, count: 3 },
      ]);
    });

    it("returns empty array when no open tickets", async () => {
      const svc = createReportsService(db);
      const result = await svc.priorityBreakdown();
      expect(result).toEqual([]);
    });
  });

  describe("activeCount", () => {
    it("returns count of open tickets", async () => {
      (
        db as unknown as {
          _executeTakeFirstOrThrowMock: ReturnType<typeof vi.fn>;
        }
      )._executeTakeFirstOrThrowMock.mockResolvedValueOnce({ count: 42 });

      const svc = createReportsService(db);
      const result = await svc.activeCount();
      expect(result).toBe(42);
    });

    it("returns 0 when no open tickets", async () => {
      const svc = createReportsService(db);
      const result = await svc.activeCount();
      expect(result).toBe(0);
    });
  });
});

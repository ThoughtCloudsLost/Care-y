// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

// The filter store is a module-level singleton. Reset modules between tests
// to get a fresh instance each time.

describe("filterStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function getStore() {
    const { filterStore } = await import("./filters.svelte.ts");
    return filterStore;
  }

  describe("statuses (multi-select)", () => {
    it("starts with empty set (show all)", async () => {
      const store = await getStore();
      expect(store.statuses.size).toBe(0);
    });

    it("toggleStatus adds a status", async () => {
      const store = await getStore();
      store.toggleStatus("open");
      expect(store.statuses.has("open")).toBe(true);
      expect(store.statuses.size).toBe(1);
    });

    it("toggleStatus removes a status on second call", async () => {
      const store = await getStore();
      store.toggleStatus("open");
      store.toggleStatus("open");
      expect(store.statuses.has("open")).toBe(false);
      expect(store.statuses.size).toBe(0);
    });

    it("supports multiple selected statuses", async () => {
      const store = await getStore();
      store.toggleStatus("open");
      store.toggleStatus("hold");
      expect(store.statuses.size).toBe(2);
      expect(store.statuses.has("open")).toBe(true);
      expect(store.statuses.has("hold")).toBe(true);
    });
  });

  describe("queueIds (multi-select)", () => {
    it("toggleQueue adds and removes", async () => {
      const store = await getStore();
      store.toggleQueue("q1");
      expect(store.queueIds.has("q1")).toBe(true);
      store.toggleQueue("q1");
      expect(store.queueIds.has("q1")).toBe(false);
    });
  });

  describe("priorities (multi-select)", () => {
    it("togglePriority adds and removes", async () => {
      const store = await getStore();
      store.togglePriority("urgent");
      expect(store.priorities.has("urgent")).toBe(true);
      store.togglePriority("urgent");
      expect(store.priorities.has("urgent")).toBe(false);
    });
  });

  describe("assignee (single-select)", () => {
    it("defaults to null", async () => {
      const store = await getStore();
      expect(store.assigneeId).toBe(null);
    });

    it("setAssignee sets and clears", async () => {
      const store = await getStore();
      store.setAssignee("user-1");
      expect(store.assigneeId).toBe("user-1");
      store.setAssignee(null);
      expect(store.assigneeId).toBe(null);
    });
  });

  describe("date range", () => {
    it("defaults to null", async () => {
      const store = await getStore();
      expect(store.dateFrom).toBe(null);
      expect(store.dateTo).toBe(null);
    });

    it("setDateRange sets both bounds", async () => {
      const store = await getStore();
      const from = new Date("2026-01-01");
      const to = new Date("2026-01-31");
      store.setDateRange(from, to);
      expect(store.dateFrom).toBe(from);
      expect(store.dateTo).toBe(to);
    });
  });

  describe("sort", () => {
    it("defaults to date desc", async () => {
      const store = await getStore();
      expect(store.sort).toEqual({ field: "date", direction: "desc" });
    });

    it("setSort updates field and direction", async () => {
      const store = await getStore();
      store.setSort("priority", "asc");
      expect(store.sort).toEqual({ field: "priority", direction: "asc" });
    });
  });

  describe("activeCount", () => {
    it("is 0 when no filters are active", async () => {
      const store = await getStore();
      expect(store.activeCount).toBe(0);
    });

    it("counts active *dimensions*, not individual selections", async () => {
      const store = await getStore();
      // Two statuses = one dimension active
      store.toggleStatus("open");
      store.toggleStatus("closed");
      expect(store.activeCount).toBe(1);
    });

    it("counts each dimension independently", async () => {
      const store = await getStore();
      store.toggleStatus("open");
      store.toggleQueue("q1");
      store.togglePriority("urgent");
      store.setAssignee("user-1");
      store.setDateRange(new Date(), null);
      expect(store.activeCount).toBe(5);
    });

    it("date range counts as 1 even if only one bound is set", async () => {
      const store = await getStore();
      store.setDateRange(null, new Date());
      expect(store.activeCount).toBe(1);
    });
  });

  describe("serverParams", () => {
    it("includes sort defaults and limit when no filters active", async () => {
      const store = await getStore();
      expect(store.serverParams).toEqual({
        sortBy: "date",
        sortDirection: "desc",
        limit: 50,
      });
    });

    it("reflects sort changes in serverParams", async () => {
      const store = await getStore();
      store.setSort("last_activity", "asc");
      expect(store.serverParams.sortBy).toBe("last_activity");
      expect(store.serverParams.sortDirection).toBe("asc");
    });

    it("maps real statuses to statuses array", async () => {
      const store = await getStore();
      store.toggleStatus("open");
      expect(store.serverParams.statuses).toEqual(["open"]);
      expect(store.serverParams.onHold).toBeUndefined();
    });

    it("maps hold pseudo-status to onHold: true, not in statuses array", async () => {
      const store = await getStore();
      store.toggleStatus("hold");
      expect(store.serverParams.onHold).toBe(true);
      expect(store.serverParams.statuses).toBeUndefined();
    });

    it("splits hold from real statuses correctly", async () => {
      const store = await getStore();
      store.toggleStatus("open");
      store.toggleStatus("hold");
      expect(store.serverParams.statuses).toEqual(["open"]);
      expect(store.serverParams.onHold).toBe(true);
    });

    it("maps priorities to array", async () => {
      const store = await getStore();
      store.togglePriority("urgent");
      store.togglePriority("high");
      expect(store.serverParams.priorities).toEqual(
        expect.arrayContaining(["urgent", "high"]),
      );
      expect(store.serverParams.priorities).toHaveLength(2);
    });

    it("maps queueIds to array", async () => {
      const store = await getStore();
      store.toggleQueue("q1");
      store.toggleQueue("q2");
      expect(store.serverParams.queueIds).toEqual(
        expect.arrayContaining(["q1", "q2"]),
      );
    });

    it("maps assigneeId to assignedTo", async () => {
      const store = await getStore();
      store.setAssignee("user-1");
      expect(store.serverParams.assignedTo).toBe("user-1");
    });

    it("sets empty dimensions to undefined (stripped by JSON serialization)", async () => {
      const store = await getStore();
      const params = store.serverParams;
      expect(params.statuses).toBeUndefined();
      expect(params.onHold).toBeUndefined();
      expect(params.queueIds).toBeUndefined();
      expect(params.priorities).toBeUndefined();
      expect(params.assignedTo).toBeUndefined();
    });
  });

  describe("clearAll", () => {
    it("resets all filter state", async () => {
      const store = await getStore();
      store.toggleStatus("open");
      store.toggleQueue("q1");
      store.togglePriority("urgent");
      store.setAssignee("user-1");
      store.setDateRange(new Date(), new Date());

      store.clearAll();

      expect(store.statuses.size).toBe(0);
      expect(store.queueIds.size).toBe(0);
      expect(store.priorities.size).toBe(0);
      expect(store.assigneeId).toBe(null);
      expect(store.dateFrom).toBe(null);
      expect(store.dateTo).toBe(null);
      expect(store.activeCount).toBe(0);
    });

    it("does not reset sort", async () => {
      const store = await getStore();
      store.setSort("priority", "asc");
      store.clearAll();
      expect(store.sort).toEqual({ field: "priority", direction: "asc" });
    });
  });
});

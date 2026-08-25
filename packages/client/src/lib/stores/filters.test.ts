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
      store.toggleStatus("new");
      expect(store.statuses.has("new")).toBe(true);
      expect(store.statuses.size).toBe(1);
    });

    it("toggleStatus removes a status on second call", async () => {
      const store = await getStore();
      store.toggleStatus("active");
      store.toggleStatus("active");
      expect(store.statuses.has("active")).toBe(false);
      expect(store.statuses.size).toBe(0);
    });

    it("supports multiple selected statuses", async () => {
      const store = await getStore();
      store.toggleStatus("new");
      store.toggleStatus("hold");
      expect(store.statuses.size).toBe(2);
      expect(store.statuses.has("new")).toBe(true);
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
    it("defaults to undefined (no filter)", async () => {
      const store = await getStore();
      expect(store.assigneeId).toBeUndefined();
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
    it("defaults to recent activity desc", async () => {
      const store = await getStore();
      expect(store.sort).toEqual({
        field: "last_activity",
        direction: "desc",
      });
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
      store.toggleStatus("new");
      store.toggleStatus("closed");
      expect(store.activeCount).toBe(1);
    });

    it("counts each dimension independently", async () => {
      const store = await getStore();
      store.toggleStatus("active");
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
        sortBy: "last_activity",
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

    it("maps 'new' display status to server status 'open'", async () => {
      const store = await getStore();
      store.toggleStatus("new");
      expect(store.serverParams.statuses).toEqual(["open"]);
      expect(store.serverParams.onHold).toBeUndefined();
    });

    it("maps 'active' display status to server status 'open'", async () => {
      const store = await getStore();
      store.toggleStatus("active");
      expect(store.serverParams.statuses).toEqual(["open"]);
      expect(store.serverParams.onHold).toBeUndefined();
    });

    it("maps both 'new' and 'active' to single 'open' without duplicates", async () => {
      const store = await getStore();
      store.toggleStatus("new");
      store.toggleStatus("active");
      expect(store.serverParams.statuses).toEqual(["open"]);
    });

    it("maps hold to onHold: true, not in statuses array", async () => {
      const store = await getStore();
      store.toggleStatus("hold");
      expect(store.serverParams.onHold).toBe(true);
      expect(store.serverParams.statuses).toBeUndefined();
    });

    it("splits hold from display statuses correctly", async () => {
      const store = await getStore();
      store.toggleStatus("active");
      store.toggleStatus("hold");
      expect(store.serverParams.statuses).toEqual(["open"]);
      expect(store.serverParams.onHold).toBe(true);
    });

    it("maps 'closed' to server status 'closed'", async () => {
      const store = await getStore();
      store.toggleStatus("closed");
      expect(store.serverParams.statuses).toEqual(["closed"]);
    });

    it("combines open and closed server statuses", async () => {
      const store = await getStore();
      store.toggleStatus("new");
      store.toggleStatus("closed");
      expect(store.serverParams.statuses).toEqual(
        expect.arrayContaining(["open", "closed"]),
      );
      expect(store.serverParams.statuses).toHaveLength(2);
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

  describe("needsDisplayStatusPostFilter", () => {
    it("is false when no statuses selected", async () => {
      const store = await getStore();
      expect(store.needsDisplayStatusPostFilter).toBe(false);
    });

    it("is true when only 'new' is selected", async () => {
      const store = await getStore();
      store.toggleStatus("new");
      expect(store.needsDisplayStatusPostFilter).toBe(true);
    });

    it("is true when only 'active' is selected", async () => {
      const store = await getStore();
      store.toggleStatus("active");
      expect(store.needsDisplayStatusPostFilter).toBe(true);
    });

    it("is false when both 'new' and 'active' are selected", async () => {
      const store = await getStore();
      store.toggleStatus("new");
      store.toggleStatus("active");
      expect(store.needsDisplayStatusPostFilter).toBe(false);
    });

    it("is false when neither 'new' nor 'active' is selected (only hold)", async () => {
      const store = await getStore();
      store.toggleStatus("hold");
      expect(store.needsDisplayStatusPostFilter).toBe(false);
    });
  });

  describe("clearAll", () => {
    it("resets all filter state", async () => {
      const store = await getStore();
      store.toggleStatus("active");
      store.toggleQueue("q1");
      store.togglePriority("urgent");
      store.setAssignee("user-1");
      store.setDateRange(new Date(), new Date());

      store.clearAll();

      expect(store.statuses.size).toBe(0);
      expect(store.queueIds.size).toBe(0);
      expect(store.priorities.size).toBe(0);
      expect(store.assigneeId).toBeUndefined();
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

  describe("captureState", () => {
    it("captures all active filter dimensions", async () => {
      const store = await getStore();
      store.toggleStatus("new");
      store.toggleStatus("active");
      store.togglePriority("urgent");
      store.setAssignee("user-42");
      store.setDateRange(new Date("2026-01-01"), new Date("2026-03-01"));
      store.setSort("priority", "asc");

      const state = store.captureState();

      expect(state.statuses).toEqual(expect.arrayContaining(["new", "active"]));
      expect(state.priorities).toEqual(["urgent"]);
      expect(state.assigneeId).toBe("user-42");
      expect(state.dateFrom).toBe(new Date("2026-01-01").toISOString());
      expect(state.dateTo).toBe(new Date("2026-03-01").toISOString());
      expect(state.sortField).toBe("priority");
      expect(state.sortDirection).toBe("asc");
    });

    it("captures empty state when no filters active", async () => {
      const store = await getStore();
      const state = store.captureState();

      expect(state.statuses).toEqual([]);
      expect(state.queueIds).toEqual([]);
      expect(state.priorities).toEqual([]);
      expect(state.assigneeId).toBeUndefined();
      expect(state.dateFrom).toBeNull();
      expect(state.dateTo).toBeNull();
      expect(state.unreadOnly).toBe(false);
      expect(state.needsAttentionOnly).toBe(false);
    });

    it("captures unreadOnly when set", async () => {
      const store = await getStore();
      store.setUnreadOnly(true);
      expect(store.captureState().unreadOnly).toBe(true);
      expect(store.captureState().needsAttentionOnly).toBe(false);
    });

    it("captures needsAttentionOnly when set", async () => {
      const store = await getStore();
      store.setNeedsAttentionOnly(true);
      expect(store.captureState().needsAttentionOnly).toBe(true);
      expect(store.captureState().unreadOnly).toBe(false);
    });
  });

  describe("applyState", () => {
    it("restores all filter dimensions from a captured state", async () => {
      const store = await getStore();

      store.applyState({
        statuses: ["hold", "closed"],
        queueIds: ["q-1", "q-2"],
        priorities: ["high"],
        assigneeId: "user-99",
        dateFrom: new Date("2026-02-01").toISOString(),
        dateTo: new Date("2026-04-01").toISOString(),
        sortField: "last_activity",
        sortDirection: "asc",
        unreadOnly: false,
        needsAttentionOnly: false,
      });

      expect([...store.statuses]).toEqual(
        expect.arrayContaining(["hold", "closed"]),
      );
      expect([...store.queueIds]).toEqual(
        expect.arrayContaining(["q-1", "q-2"]),
      );
      expect([...store.priorities]).toEqual(["high"]);
      expect(store.assigneeId).toBe("user-99");
      expect(store.dateFrom).toEqual(new Date("2026-02-01"));
      expect(store.dateTo).toEqual(new Date("2026-04-01"));
      expect(store.sort).toEqual({
        field: "last_activity",
        direction: "asc",
      });
    });

    it("clears previous filter state before applying", async () => {
      const store = await getStore();
      store.toggleStatus("new");
      store.toggleQueue("q-old");

      store.applyState({
        statuses: ["closed"],
        queueIds: [],
        priorities: [],
        assigneeId: null,
        dateFrom: null,
        dateTo: null,
        sortField: "date",
        sortDirection: "desc",
        unreadOnly: false,
        needsAttentionOnly: false,
      });

      expect(store.statuses.has("new")).toBe(false);
      expect(store.queueIds.size).toBe(0);
      expect([...store.statuses]).toEqual(["closed"]);
    });

    it("restores unreadOnly and needsAttentionOnly", async () => {
      const store = await getStore();

      store.applyState({
        statuses: [],
        queueIds: [],
        priorities: [],
        assigneeId: undefined,
        dateFrom: null,
        dateTo: null,
        sortField: "date",
        sortDirection: "desc",
        unreadOnly: true,
        needsAttentionOnly: true,
      });

      expect(store.unreadOnly).toBe(true);
      expect(store.needsAttentionOnly).toBe(true);
    });
  });

  describe("clearAll", () => {
    it("resets unreadOnly and needsAttentionOnly", async () => {
      const store = await getStore();
      store.setUnreadOnly(true);
      store.setNeedsAttentionOnly(true);

      store.clearAll();

      expect(store.unreadOnly).toBe(false);
      expect(store.needsAttentionOnly).toBe(false);
    });
  });
});

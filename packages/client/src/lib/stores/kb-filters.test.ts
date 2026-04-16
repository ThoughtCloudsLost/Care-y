// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("kbFilterStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function getStore() {
    const { kbFilterStore } = await import("./kb-filters.svelte.ts");
    return kbFilterStore;
  }

  describe("categoryIds (multi-select)", () => {
    it("starts with empty set", async () => {
      const store = await getStore();
      expect(store.categoryIds.size).toBe(0);
    });

    it("toggleCategory adds a category", async () => {
      const store = await getStore();
      store.toggleCategory("cat-1");
      expect(store.categoryIds.has("cat-1")).toBe(true);
      expect(store.categoryIds.size).toBe(1);
    });

    it("toggleCategory removes on second call", async () => {
      const store = await getStore();
      store.toggleCategory("cat-1");
      store.toggleCategory("cat-1");
      expect(store.categoryIds.has("cat-1")).toBe(false);
      expect(store.categoryIds.size).toBe(0);
    });

    it("supports multiple categories", async () => {
      const store = await getStore();
      store.toggleCategory("cat-1");
      store.toggleCategory("cat-2");
      expect(store.categoryIds.size).toBe(2);
    });
  });

  describe("minRating (single-select)", () => {
    it("defaults to undefined", async () => {
      const store = await getStore();
      expect(store.minRating).toBeUndefined();
    });

    it("setMinRating sets and clears", async () => {
      const store = await getStore();
      store.setMinRating(0.5);
      expect(store.minRating).toBe(0.5);
      store.setMinRating(undefined);
      expect(store.minRating).toBeUndefined();
    });
  });

  describe("createdBy (single-select)", () => {
    it("defaults to undefined", async () => {
      const store = await getStore();
      expect(store.createdBy).toBeUndefined();
    });

    it("setCreatedBy sets and clears", async () => {
      const store = await getStore();
      store.setCreatedBy("author-1");
      expect(store.createdBy).toBe("author-1");
      store.setCreatedBy(undefined);
      expect(store.createdBy).toBeUndefined();
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
    it("defaults to created_at desc", async () => {
      const store = await getStore();
      expect(store.sort).toEqual({ field: "created_at", direction: "desc" });
    });

    it("setSort updates field and direction", async () => {
      const store = await getStore();
      store.setSort("rating", "asc");
      expect(store.sort).toEqual({ field: "rating", direction: "asc" });
    });
  });

  describe("activeCount", () => {
    it("is 0 when no filters are active", async () => {
      const store = await getStore();
      expect(store.activeCount).toBe(0);
    });

    it("counts active dimensions, not individual selections", async () => {
      const store = await getStore();
      store.toggleCategory("cat-1");
      store.toggleCategory("cat-2");
      expect(store.activeCount).toBe(1);
    });

    it("counts each dimension independently", async () => {
      const store = await getStore();
      store.toggleCategory("cat-1");
      store.setMinRating(0.3);
      store.setCreatedBy("author-1");
      store.setDateRange(new Date(), null);
      expect(store.activeCount).toBe(4);
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
        categoryId: undefined,
        sortBy: "created_at",
        sortDirection: "desc",
        minRating: undefined,
        createdBy: undefined,
        createdAfter: undefined,
        createdBefore: undefined,
        limit: 50,
      });
    });

    it("passes single categoryId for server-side filtering", async () => {
      const store = await getStore();
      store.toggleCategory("cat-1");
      expect(store.serverParams.categoryId).toBe("cat-1");
    });

    it("omits categoryId when multiple selected (post-filter client-side)", async () => {
      const store = await getStore();
      store.toggleCategory("cat-1");
      store.toggleCategory("cat-2");
      expect(store.serverParams.categoryId).toBeUndefined();
    });

    it("reflects sort changes", async () => {
      const store = await getStore();
      store.setSort("updated_at", "asc");
      expect(store.serverParams.sortBy).toBe("updated_at");
      expect(store.serverParams.sortDirection).toBe("asc");
    });

    it("includes minRating when set", async () => {
      const store = await getStore();
      store.setMinRating(0.5);
      expect(store.serverParams.minRating).toBe(0.5);
    });

    it("includes createdBy when set", async () => {
      const store = await getStore();
      store.setCreatedBy("author-1");
      expect(store.serverParams.createdBy).toBe("author-1");
    });

    it("includes date range as ISO strings", async () => {
      const store = await getStore();
      const from = new Date("2026-01-01");
      const to = new Date("2026-01-31");
      store.setDateRange(from, to);
      expect(store.serverParams.createdAfter).toBe(from.toISOString());
      expect(store.serverParams.createdBefore).toBe(to.toISOString());
    });
  });

  describe("clearAll", () => {
    it("resets all filter state", async () => {
      const store = await getStore();
      store.toggleCategory("cat-1");
      store.setMinRating(0.5);
      store.setCreatedBy("author-1");
      store.setDateRange(new Date(), new Date());

      store.clearAll();

      expect(store.categoryIds.size).toBe(0);
      expect(store.minRating).toBeUndefined();
      expect(store.createdBy).toBeUndefined();
      expect(store.dateFrom).toBe(null);
      expect(store.dateTo).toBe(null);
      expect(store.activeCount).toBe(0);
    });

    it("does not reset sort", async () => {
      const store = await getStore();
      store.setSort("rating", "asc");
      store.clearAll();
      expect(store.sort).toEqual({ field: "rating", direction: "asc" });
    });
  });

  describe("captureState", () => {
    it("captures all active filter dimensions", async () => {
      const store = await getStore();
      store.toggleCategory("cat-1");
      store.toggleCategory("cat-2");
      store.setMinRating(0.3);
      store.setCreatedBy("author-1");
      store.setDateRange(new Date("2026-01-01"), new Date("2026-03-01"));
      store.setSort("rating", "asc");

      const state = store.captureState();

      expect(state.categoryIds).toEqual(
        expect.arrayContaining(["cat-1", "cat-2"]),
      );
      expect(state.minRating).toBe(0.3);
      expect(state.createdBy).toBe("author-1");
      expect(state.dateFrom).toBe(new Date("2026-01-01").toISOString());
      expect(state.dateTo).toBe(new Date("2026-03-01").toISOString());
      expect(state.sortField).toBe("rating");
      expect(state.sortDirection).toBe("asc");
    });

    it("captures empty state when no filters active", async () => {
      const store = await getStore();
      const state = store.captureState();

      expect(state.categoryIds).toEqual([]);
      expect(state.minRating).toBeNull();
      expect(state.createdBy).toBeNull();
      expect(state.dateFrom).toBeNull();
      expect(state.dateTo).toBeNull();
    });
  });

  describe("applyState", () => {
    it("restores all filter dimensions from a captured state", async () => {
      const store = await getStore();

      store.applyState({
        categoryIds: ["cat-1", "cat-2"],
        minRating: 0.5,
        createdBy: "author-2",
        dateFrom: new Date("2026-02-01").toISOString(),
        dateTo: new Date("2026-04-01").toISOString(),
        sortField: "updated_at",
        sortDirection: "asc",
      });

      expect([...store.categoryIds]).toEqual(
        expect.arrayContaining(["cat-1", "cat-2"]),
      );
      expect(store.minRating).toBe(0.5);
      expect(store.createdBy).toBe("author-2");
      expect(store.dateFrom).toEqual(new Date("2026-02-01"));
      expect(store.dateTo).toEqual(new Date("2026-04-01"));
      expect(store.sort).toEqual({ field: "updated_at", direction: "asc" });
    });

    it("clears previous filter state before applying", async () => {
      const store = await getStore();
      store.toggleCategory("old-cat");
      store.setMinRating(0.9);

      store.applyState({
        categoryIds: ["new-cat"],
        minRating: null,
        createdBy: null,
        dateFrom: null,
        dateTo: null,
        sortField: "created_at",
        sortDirection: "desc",
      });

      expect(store.categoryIds.has("old-cat")).toBe(false);
      expect(store.minRating).toBeUndefined();
      expect([...store.categoryIds]).toEqual(["new-cat"]);
    });
  });
});

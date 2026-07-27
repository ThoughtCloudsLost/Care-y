import { describe, it, expect, beforeEach } from "vitest";
import { clientFilterStore } from "./client-filters.svelte.js";

describe("clientFilterStore", () => {
  beforeEach(() => {
    clientFilterStore.setSort("alias", "asc");
    clientFilterStore.setSearch("");
    clientFilterStore.clearAll();
  });

  describe("sort", () => {
    it("defaults to alias ascending", () => {
      expect(clientFilterStore.sort.field).toBe("alias");
      expect(clientFilterStore.sort.direction).toBe("asc");
    });

    it("updates sort field and direction", () => {
      clientFilterStore.setSort("created_at", "desc");
      expect(clientFilterStore.sort.field).toBe("created_at");
      expect(clientFilterStore.sort.direction).toBe("desc");
    });

    it("updates to ticket_count sort", () => {
      clientFilterStore.setSort("ticket_count", "asc");
      expect(clientFilterStore.sort.field).toBe("ticket_count");
      expect(clientFilterStore.sort.direction).toBe("asc");
    });
  });

  describe("search", () => {
    it("defaults to empty string", () => {
      expect(clientFilterStore.search).toBe("");
    });

    it("updates search query", () => {
      clientFilterStore.setSearch("gentle");
      expect(clientFilterStore.search).toBe("gentle");
    });

    it("clears search query", () => {
      clientFilterStore.setSearch("test");
      clientFilterStore.setSearch("");
      expect(clientFilterStore.search).toBe("");
    });
  });

  describe("hasApplications", () => {
    it("defaults to null", () => {
      expect(clientFilterStore.hasApplications).toBeNull();
    });

    it("sets to true (only with tickets)", () => {
      clientFilterStore.setHasApplications(true);
      expect(clientFilterStore.hasApplications).toBe(true);
    });

    it("sets to false (only without tickets)", () => {
      clientFilterStore.setHasApplications(false);
      expect(clientFilterStore.hasApplications).toBe(false);
    });

    it("sets back to null (no filter)", () => {
      clientFilterStore.setHasApplications(true);
      clientFilterStore.setHasApplications(null);
      expect(clientFilterStore.hasApplications).toBeNull();
    });
  });

  describe("date range", () => {
    it("defaults to null for both bounds", () => {
      expect(clientFilterStore.createdAfter).toBeNull();
      expect(clientFilterStore.createdBefore).toBeNull();
    });

    it("sets createdAfter only", () => {
      const d = new Date("2024-01-01");
      clientFilterStore.setDateRange(d, null);
      expect(clientFilterStore.createdAfter).toEqual(d);
      expect(clientFilterStore.createdBefore).toBeNull();
    });

    it("sets createdBefore only", () => {
      const d = new Date("2024-12-31");
      clientFilterStore.setDateRange(null, d);
      expect(clientFilterStore.createdAfter).toBeNull();
      expect(clientFilterStore.createdBefore).toEqual(d);
    });

    it("sets both bounds", () => {
      const from = new Date("2024-01-01");
      const to = new Date("2024-12-31");
      clientFilterStore.setDateRange(from, to);
      expect(clientFilterStore.createdAfter).toEqual(from);
      expect(clientFilterStore.createdBefore).toEqual(to);
    });
  });

  describe("includeMerged", () => {
    it("defaults to false", () => {
      expect(clientFilterStore.includeMerged).toBe(false);
    });

    it("sets to true", () => {
      clientFilterStore.setIncludeMerged(true);
      expect(clientFilterStore.includeMerged).toBe(true);
    });

    it("sets back to false", () => {
      clientFilterStore.setIncludeMerged(true);
      clientFilterStore.setIncludeMerged(false);
      expect(clientFilterStore.includeMerged).toBe(false);
    });
  });

  describe("activeCount", () => {
    it("is 0 when no filters are active", () => {
      expect(clientFilterStore.activeCount).toBe(0);
    });

    it("counts hasApplications as 1", () => {
      clientFilterStore.setHasApplications(true);
      expect(clientFilterStore.activeCount).toBe(1);
    });

    it("counts date range as 1 even with both bounds", () => {
      clientFilterStore.setDateRange(
        new Date("2024-01-01"),
        new Date("2024-12-31"),
      );
      expect(clientFilterStore.activeCount).toBe(1);
    });

    it("counts includeMerged as 1", () => {
      clientFilterStore.setIncludeMerged(true);
      expect(clientFilterStore.activeCount).toBe(1);
    });

    it("sums all active dimensions", () => {
      clientFilterStore.setHasApplications(false);
      clientFilterStore.setDateRange(new Date("2024-01-01"), null);
      clientFilterStore.setIncludeMerged(true);
      expect(clientFilterStore.activeCount).toBe(3);
    });
  });

  describe("clearAll", () => {
    it("resets all filter state", () => {
      clientFilterStore.setHasApplications(true);
      clientFilterStore.setDateRange(
        new Date("2024-01-01"),
        new Date("2024-12-31"),
      );
      clientFilterStore.setIncludeMerged(true);

      clientFilterStore.clearAll();

      expect(clientFilterStore.hasApplications).toBeNull();
      expect(clientFilterStore.createdAfter).toBeNull();
      expect(clientFilterStore.createdBefore).toBeNull();
      expect(clientFilterStore.includeMerged).toBe(false);
      expect(clientFilterStore.activeCount).toBe(0);
    });

    it("does not reset sort or search", () => {
      clientFilterStore.setSort("created_at", "desc");
      clientFilterStore.setSearch("test");
      clientFilterStore.setHasApplications(true);

      clientFilterStore.clearAll();

      expect(clientFilterStore.sort.field).toBe("created_at");
      expect(clientFilterStore.sort.direction).toBe("desc");
      expect(clientFilterStore.search).toBe("test");
    });
  });
});

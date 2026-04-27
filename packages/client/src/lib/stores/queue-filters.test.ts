// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("queueFilterStore", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function getStore() {
    const { queueFilterStore } = await import("./queue-filters.svelte.js");
    return queueFilterStore;
  }

  describe("sort", () => {
    it("defaults to order ascending", async () => {
      const store = await getStore();
      expect(store.sort).toEqual({ field: "order", direction: "asc" });
    });

    it("setSort updates field and direction", async () => {
      const store = await getStore();
      store.setSort("name", "desc");
      expect(store.sort).toEqual({ field: "name", direction: "desc" });
    });

    it("setSort works for all sort fields", async () => {
      const store = await getStore();
      const fields = [
        "order",
        "name",
        "members",
        "open",
        "closed",
        "hold",
      ] as const;
      for (const field of fields) {
        store.setSort(field, "asc");
        expect(store.sort.field).toBe(field);
      }
    });
  });
});

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("savedFilterStore", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  async function getStore() {
    const { savedFilterStore } = await import("./saved-filters.svelte.ts");
    return savedFilterStore;
  }

  function makeSavedFilter(overrides: Record<string, unknown> = {}) {
    return {
      id: crypto.randomUUID(),
      encryptedName: "dGVzdCBuYW1l", // base64 of "test name" (NOT plaintext)
      color: "blue" as const,
      icon: "tag",
      state: JSON.stringify({
        statuses: ["new", "active"],
        queueIds: [],
        priorities: [],
        assigneeId: null,
        dateFrom: null,
        dateTo: null,
        sortField: "date",
        sortDirection: "desc",
      }),
      shared: false,
      ownerId: "user-1",
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  describe("add", () => {
    it("adds a saved filter and persists to localStorage", async () => {
      const store = await getStore();
      const record = makeSavedFilter();

      store.add(record);

      expect(store.count).toBe(1);
      expect(store.filters[0]?.id).toBe(record.id);

      const stored = localStorage.getItem("care-y:saved-filters");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as unknown[];
      expect(parsed).toHaveLength(1);
    });

    it("prepends new filters (most recent first)", async () => {
      const store = await getStore();
      const first = makeSavedFilter({ color: "red" as const });
      const second = makeSavedFilter({ color: "green" as const });

      store.add(first);
      store.add(second);

      expect(store.filters[0]?.color).toBe("green");
      expect(store.filters[1]?.color).toBe("red");
    });
  });

  describe("remove", () => {
    it("removes a saved filter by ID", async () => {
      const store = await getStore();
      const record = makeSavedFilter();
      store.add(record);

      store.remove(record.id);

      expect(store.count).toBe(0);
    });

    it("persists removal to localStorage", async () => {
      const store = await getStore();
      const record = makeSavedFilter();
      store.add(record);
      store.remove(record.id);

      const stored = localStorage.getItem("care-y:saved-filters");
      const parsed = JSON.parse(stored!) as unknown[];
      expect(parsed).toHaveLength(0);
    });
  });

  describe("toggleShare", () => {
    it("toggles the shared flag", async () => {
      const store = await getStore();
      const record = makeSavedFilter({ shared: false });
      store.add(record);

      store.toggleShare(record.id);
      expect(store.filters[0]?.shared).toBe(true);

      store.toggleShare(record.id);
      expect(store.filters[0]?.shared).toBe(false);
    });
  });

  describe("persistence", () => {
    it("loads saved filters from localStorage on init", async () => {
      const record = makeSavedFilter();
      localStorage.setItem("care-y:saved-filters", JSON.stringify([record]));

      const store = await getStore();
      expect(store.count).toBe(1);
      expect(store.filters[0]?.id).toBe(record.id);
    });

    it("discards malformed entries silently", async () => {
      localStorage.setItem(
        "care-y:saved-filters",
        JSON.stringify([makeSavedFilter(), { bad: "data" }, makeSavedFilter()]),
      );

      const store = await getStore();
      expect(store.count).toBe(2);
    });

    it("returns empty list when localStorage has invalid JSON", async () => {
      localStorage.setItem("care-y:saved-filters", "not json at all");

      const store = await getStore();
      expect(store.count).toBe(0);
    });

    it("names are not stored as plaintext in localStorage", async () => {
      const store = await getStore();
      const record = makeSavedFilter({ encryptedName: "ZW5jcnlwdGVk" });
      store.add(record);

      const stored = localStorage.getItem("care-y:saved-filters")!;
      // The stored value must not contain the decrypted name.
      // "ZW5jcnlwdGVk" is base64 for "encrypted" - the store must not
      // decode it or store the plaintext "encrypted" anywhere.
      expect(stored).toContain("ZW5jcnlwdGVk");
      expect(stored).not.toContain('"name"');
    });
  });

  describe("roundtrip", () => {
    it("save then reload preserves all fields", async () => {
      const record = makeSavedFilter({
        color: "purple" as const,
        icon: "shield",
        shared: true,
      });

      // Save via one store instance.
      const store1 = await getStore();
      store1.add(record);

      // Reset modules, reload from localStorage.
      vi.resetModules();
      const store2 = await getStore();

      expect(store2.count).toBe(1);
      const loaded = store2.filters[0]!;
      expect(loaded.encryptedName).toBe(record.encryptedName);
      expect(loaded.color).toBe("purple");
      expect(loaded.icon).toBe("shield");
      expect(loaded.shared).toBe(true);

      // Filter state roundtrips.
      const state = JSON.parse(loaded.state) as Record<string, unknown>;
      expect(state.statuses).toEqual(["new", "active"]);
      expect(state.sortField).toBe("date");
    });
  });
});

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as ResealNS from "./saved-filter-reseal.js";
import * as m from "$lib/paraglide/messages.js";

const { mockToastShow, mockReseal } = vi.hoisted(() => ({
  mockToastShow: vi.fn(),
  mockReseal: vi.fn().mockResolvedValue(null),
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastNS>()),
  toastStore: { show: mockToastShow, dismiss: vi.fn(), current: null },
}));

vi.mock("./saved-filter-reseal.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ResealNS>()),
  resealSavedFilterNames: mockReseal,
}));

describe("kbSavedFilterStore", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    mockToastShow.mockClear();
  });

  async function getStore() {
    const { kbSavedFilterStore } = await import("./kb-saved-filters.svelte.ts");
    return kbSavedFilterStore;
  }

  /** Make every localStorage write throw as a full quota would. */
  function failStorageWrites() {
    return vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
  }

  function makeKbSavedFilter(overrides: Record<string, unknown> = {}) {
    return {
      id: crypto.randomUUID(),
      encryptedName: "dGVzdCBuYW1l",
      color: "blue" as const,
      icon: "tag",
      state: JSON.stringify({
        categoryIds: ["cat-1"],
        minRating: 0.3,
        createdBy: null,
        dateFrom: null,
        dateTo: null,
        sortField: "created_at",
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
      const record = makeKbSavedFilter();

      store.add(record);

      expect(store.count).toBe(1);
      expect(store.filters[0]?.id).toBe(record.id);

      const stored = localStorage.getItem("care-y:kb-saved-filters");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as unknown[];
      expect(parsed).toHaveLength(1);
    });

    it("prepends new filters (most recent first)", async () => {
      const store = await getStore();
      const first = makeKbSavedFilter({ color: "red" as const });
      const second = makeKbSavedFilter({ color: "green" as const });

      store.add(first);
      store.add(second);

      expect(store.filters[0]?.color).toBe("green");
      expect(store.filters[1]?.color).toBe("red");
    });
  });

  describe("remove", () => {
    it("removes a saved filter by ID", async () => {
      const store = await getStore();
      const record = makeKbSavedFilter();
      store.add(record);

      store.remove(record.id);
      expect(store.count).toBe(0);
    });

    it("persists removal to localStorage", async () => {
      const store = await getStore();
      const record = makeKbSavedFilter();
      store.add(record);
      store.remove(record.id);

      const stored = localStorage.getItem("care-y:kb-saved-filters");
      const parsed = JSON.parse(stored!) as unknown[];
      expect(parsed).toHaveLength(0);
    });
  });

  describe("toggleShare", () => {
    it("toggles the shared flag", async () => {
      const store = await getStore();
      const record = makeKbSavedFilter({ shared: false });
      store.add(record);

      store.toggleShare(record.id);
      expect(store.filters[0]?.shared).toBe(true);

      store.toggleShare(record.id);
      expect(store.filters[0]?.shared).toBe(false);
    });
  });

  describe("persistence", () => {
    it("loads saved filters from localStorage on init", async () => {
      const record = makeKbSavedFilter();
      localStorage.setItem("care-y:kb-saved-filters", JSON.stringify([record]));

      const store = await getStore();
      expect(store.count).toBe(1);
      expect(store.filters[0]?.id).toBe(record.id);
    });

    it("discards entries with malformed record envelope", async () => {
      localStorage.setItem(
        "care-y:kb-saved-filters",
        JSON.stringify([makeKbSavedFilter(), { bad: "data" }]),
      );

      const store = await getStore();
      expect(store.count).toBe(1);
    });

    it("discards entries with ticket state schema (wrong domain)", async () => {
      const ticketState = {
        id: crypto.randomUUID(),
        encryptedName: "dGVzdA==",
        color: "blue",
        icon: "tag",
        state: JSON.stringify({
          statuses: ["new"],
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
      };
      localStorage.setItem(
        "care-y:kb-saved-filters",
        JSON.stringify([ticketState]),
      );

      const store = await getStore();
      // Ticket state doesn't match KB state schema, so it gets discarded
      expect(store.count).toBe(0);
    });

    it("returns empty list when localStorage has invalid JSON", async () => {
      localStorage.setItem("care-y:kb-saved-filters", "not json at all");

      const store = await getStore();
      expect(store.count).toBe(0);
    });

    it("returns empty list when localStorage has non-array JSON", async () => {
      localStorage.setItem(
        "care-y:kb-saved-filters",
        JSON.stringify({ not: "an array" }),
      );

      const store = await getStore();
      expect(store.count).toBe(0);
    });

    it("returns empty list when localStorage has null", async () => {
      const store = await getStore();
      expect(store.count).toBe(0);
    });
  });

  describe("roundtrip", () => {
    it("save then reload preserves all fields", async () => {
      const record = makeKbSavedFilter({
        color: "purple" as const,
        icon: "shield",
        shared: true,
      });

      const store1 = await getStore();
      store1.add(record);

      vi.resetModules();
      const store2 = await getStore();

      expect(store2.count).toBe(1);
      const loaded = store2.filters[0]!;
      expect(loaded.encryptedName).toBe(record.encryptedName);
      expect(loaded.color).toBe("purple");
      expect(loaded.icon).toBe("shield");
      expect(loaded.shared).toBe(true);

      const state = JSON.parse(loaded.state) as Record<string, unknown>;
      expect(state.categoryIds).toEqual(["cat-1"]);
      expect(state.minRating).toBe(0.3);
      expect(state.sortField).toBe("created_at");
    });
  });

  describe("failed storage writes", () => {
    it("add throws SavedFilterStorageError and leaves the list unchanged", async () => {
      const store = await getStore();
      const { SavedFilterStorageError } = await import("$lib/errors.js");
      const existing = makeKbSavedFilter();
      store.add(existing);
      const setItem = failStorageWrites();
      try {
        expect(() => {
          store.add(makeKbSavedFilter());
        }).toThrow(SavedFilterStorageError);
        expect(store.count).toBe(1);
        expect(store.filters[0]?.id).toBe(existing.id);
      } finally {
        setItem.mockRestore();
      }
    });

    it("remove rolls back and raises a toast", async () => {
      const store = await getStore();
      const record = makeKbSavedFilter();
      store.add(record);
      const setItem = failStorageWrites();
      try {
        store.remove(record.id);
        expect(store.count).toBe(1);
        expect(store.filters[0]?.id).toBe(record.id);
        expect(mockToastShow).toHaveBeenCalledWith(
          m.saved_filter_delete_failed(),
        );
      } finally {
        setItem.mockRestore();
      }
    });

    it("toggleShare rolls back the flag and raises a toast", async () => {
      const store = await getStore();
      const record = makeKbSavedFilter({ shared: false });
      store.add(record);
      const setItem = failStorageWrites();
      try {
        store.toggleShare(record.id);
        expect(store.filters[0]?.shared).toBe(false);
        expect(mockToastShow).toHaveBeenCalledWith(
          m.saved_filter_save_failed(),
        );
      } finally {
        setItem.mockRestore();
      }
    });

    it("resealNames keeps the resealed names and raises a toast", async () => {
      const store = await getStore();
      const record = makeKbSavedFilter();
      store.add(record);
      mockReseal.mockResolvedValueOnce([{ ...record, encryptedName: "bmV3" }]);
      const setItem = failStorageWrites();
      try {
        await store.resealNames({} as never);
        expect(store.filters[0]?.encryptedName).toBe("bmV3");
        expect(mockToastShow).toHaveBeenCalledWith(
          m.saved_filter_save_failed(),
        );
      } finally {
        setItem.mockRestore();
      }
    });
  });
});

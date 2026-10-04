import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createFilterDispatch,
  filterBarHandlers,
  type FilterDispatchConfig,
} from "./create-filter-dispatch.svelte.js";
import type { SavedFilterRecord } from "@care-y/shared";
import { SavedFilterStorageError } from "$lib/errors.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";

vi.mock(
  "$lib/stores/toast.svelte.js",
  async () =>
    (await import("$mocks/toast.js")).toastMock() satisfies typeof ToastNS,
);

function makeRecord(overrides?: Partial<SavedFilterRecord>): SavedFilterRecord {
  return {
    id: crypto.randomUUID(),
    encryptedName: "enc-name",
    color: "blue",
    icon: "star",
    state: JSON.stringify({ status: ["open"] }),
    shared: false,
    ownerId: "user-1",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeConfig(
  overrides?: Partial<FilterDispatchConfig>,
): FilterDispatchConfig {
  return {
    fields: {},
    clearAll: vi.fn(),
    ...overrides,
  };
}

describe("createFilterDispatch", () => {
  describe("handlePillToggle", () => {
    it("calls toggle on a multi-toggle field", () => {
      const toggle = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          fields: { status: { type: "multi-toggle", toggle } },
        }),
      );

      d.handlePillToggle("status", "open");

      expect(toggle).toHaveBeenCalledWith("open");
    });

    it("ignores unknown pill IDs", () => {
      const d = createFilterDispatch(makeConfig());

      expect(() => {
        d.handlePillToggle("unknown", "val");
      }).not.toThrow();
    });

    it("ignores non-multi-toggle fields", () => {
      const set = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          fields: { rating: { type: "single-select", set } },
        }),
      );

      d.handlePillToggle("rating", "high");

      expect(set).not.toHaveBeenCalled();
    });

    it("fires onchange after toggle", () => {
      const onchange = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          fields: {
            status: { type: "multi-toggle", toggle: vi.fn() },
          },
          onchange,
        }),
      );

      d.handlePillToggle("status", "open");

      expect(onchange).toHaveBeenCalledOnce();
    });
  });

  describe("handlePillSelect", () => {
    it("calls set on a single-select field", () => {
      const set = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          fields: { assignee: { type: "single-select", set } },
        }),
      );

      d.handlePillSelect("assignee", "user-1");

      expect(set).toHaveBeenCalledWith("user-1");
    });

    it("passes null for clearing selection", () => {
      const set = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          fields: { assignee: { type: "single-select", set } },
        }),
      );

      d.handlePillSelect("assignee", null);

      expect(set).toHaveBeenCalledWith(null);
    });

    it("ignores non-single-select fields", () => {
      const toggle = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          fields: { status: { type: "multi-toggle", toggle } },
        }),
      );

      d.handlePillSelect("status", "open");

      expect(toggle).not.toHaveBeenCalled();
    });
  });

  describe("handlePillDateChange", () => {
    it("calls set on the date-range field", () => {
      const set = vi.fn();
      const from = new Date("2026-01-01");
      const to = new Date("2026-01-31");
      const d = createFilterDispatch(
        makeConfig({
          fields: { date: { type: "date-range", set } },
        }),
      );

      d.handlePillDateChange(from, to);

      expect(set).toHaveBeenCalledWith(from, to);
    });

    it("handles null dates for clearing", () => {
      const set = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          fields: { date: { type: "date-range", set } },
        }),
      );

      d.handlePillDateChange(null, null);

      expect(set).toHaveBeenCalledWith(null, null);
    });

    it("is a no-op when no date-range field exists", () => {
      const onchange = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          fields: {
            status: { type: "multi-toggle", toggle: vi.fn() },
          },
          onchange,
        }),
      );

      d.handlePillDateChange(new Date(), new Date());

      expect(onchange).not.toHaveBeenCalled();
    });
  });

  describe("handleSortChange", () => {
    it("calls set when field passes validation", () => {
      const set = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          sort: {
            validate: (f) => f === "date" || f === "priority",
            set,
          },
        }),
      );

      d.handleSortChange("date", "desc");

      expect(set).toHaveBeenCalledWith("date", "desc");
    });

    it("ignores invalid sort fields", () => {
      const set = vi.fn();
      const d = createFilterDispatch(
        makeConfig({
          sort: { validate: () => false, set },
        }),
      );

      d.handleSortChange("invalid", "asc");

      expect(set).not.toHaveBeenCalled();
    });

    it("is a no-op when no sort config provided", () => {
      const d = createFilterDispatch(makeConfig());

      expect(() => {
        d.handleSortChange("date", "asc");
      }).not.toThrow();
    });
  });

  describe("clearAll", () => {
    it("delegates to config.clearAll and fires onchange", () => {
      const clearAll = vi.fn();
      const onchange = vi.fn();
      const d = createFilterDispatch(makeConfig({ clearAll, onchange }));

      d.clearAll();

      expect(clearAll).toHaveBeenCalledOnce();
      expect(onchange).toHaveBeenCalledOnce();
    });

    it("clears without firing onchange when asked to skip it", () => {
      const clearAll = vi.fn();
      const onchange = vi.fn();
      const d = createFilterDispatch(makeConfig({ clearAll, onchange }));

      d.clearAll({ skipOnchange: true });

      expect(clearAll).toHaveBeenCalledOnce();
      expect(onchange).not.toHaveBeenCalled();
    });
  });

  describe("saved filters", () => {
    beforeEach(() => {
      vi.mocked(toastStore.show).mockClear();
    });

    function makeSavedConfig(): FilterDispatchConfig {
      return makeConfig({
        savedFilters: {
          store: {
            add: vi.fn(),
            remove: vi.fn(),
            toggleShare: vi.fn(),
          },
          captureState: () => ({ status: ["open"] }),
          applyState: vi.fn(),
          stateSchema: {
            safeParse: (data: unknown) => ({ success: true, data }),
          },
          getCurrentUserId: () => "user-1",
        },
      });
    }

    it("applies saved filter by parsing state and calling applyState", () => {
      const cfg = makeSavedConfig();
      const d = createFilterDispatch(cfg);
      const record = makeRecord({
        state: JSON.stringify({ status: ["closed"] }),
      });

      d.handleSavedFilterApply(record);

      expect(cfg.savedFilters!.applyState).toHaveBeenCalledWith({
        status: ["closed"],
      });
    });

    it("skips apply when schema validation fails", () => {
      const cfg = makeSavedConfig();
      cfg.savedFilters!.stateSchema.safeParse = () => ({
        success: false,
      });
      const d = createFilterDispatch(cfg);

      d.handleSavedFilterApply(makeRecord({ state: JSON.stringify("bad") }));

      expect(cfg.savedFilters!.applyState).not.toHaveBeenCalled();
    });

    it("deletes a saved filter", async () => {
      const cfg = makeSavedConfig();
      const d = createFilterDispatch(cfg);

      await d.handleSavedFilterDelete("filter-1");

      expect(cfg.savedFilters!.store.remove).toHaveBeenCalledWith("filter-1");
    });

    it("toggles share on a saved filter", async () => {
      const cfg = makeSavedConfig();
      const d = createFilterDispatch(cfg);

      await d.handleSavedFilterToggleShare("filter-1");

      expect(cfg.savedFilters!.store.toggleShare).toHaveBeenCalledWith(
        "filter-1",
      );
    });

    it("shows the delete-failed toast when the store throws SavedFilterStorageError", async () => {
      const cfg = makeSavedConfig();
      vi.mocked(cfg.savedFilters!.store.remove).mockRejectedValue(
        new SavedFilterStorageError(),
      );
      const d = createFilterDispatch(cfg);

      await d.handleSavedFilterDelete("filter-1");

      expect(toastStore.show).toHaveBeenCalledWith(
        m.saved_filter_delete_failed(),
      );
    });

    it("shows the save-failed toast when toggleShare throws SavedFilterStorageError", async () => {
      const cfg = makeSavedConfig();
      vi.mocked(cfg.savedFilters!.store.toggleShare).mockImplementation(() => {
        throw new SavedFilterStorageError();
      });
      const d = createFilterDispatch(cfg);

      await d.handleSavedFilterToggleShare("filter-1");

      expect(toastStore.show).toHaveBeenCalledWith(
        m.saved_filter_save_failed(),
      );
    });

    it("rethrows any other error from remove without a toast", async () => {
      const cfg = makeSavedConfig();
      vi.mocked(cfg.savedFilters!.store.remove).mockRejectedValue(
        new TypeError("boom"),
      );
      const d = createFilterDispatch(cfg);

      await expect(d.handleSavedFilterDelete("filter-1")).rejects.toThrow(
        TypeError,
      );
      expect(toastStore.show).not.toHaveBeenCalled();
    });

    it("rethrows any other error from toggleShare without a toast", async () => {
      const cfg = makeSavedConfig();
      vi.mocked(cfg.savedFilters!.store.toggleShare).mockRejectedValue(
        new TypeError("boom"),
      );
      const d = createFilterDispatch(cfg);

      await expect(d.handleSavedFilterToggleShare("filter-1")).rejects.toThrow(
        TypeError,
      );
      expect(toastStore.show).not.toHaveBeenCalled();
    });

    it("creates a saved filter record and adds to store", () => {
      const cfg = makeSavedConfig();
      const d = createFilterDispatch(cfg);

      const record = d.handleCreateSavedFilter({
        encryptedName: "enc-my-filter",
        color: "green",
        icon: "tag",
      });

      expect(record.encryptedName).toBe("enc-my-filter");
      expect(record.color).toBe("green");
      expect(record.icon).toBe("tag");
      expect(record.shared).toBe(false);
      expect(record.ownerId).toBe("user-1");
      expect(JSON.parse(record.state)).toEqual({ status: ["open"] });
      expect(cfg.savedFilters!.store.add).toHaveBeenCalledWith(record);
    });

    it("lets a SavedFilterStorageError from the store propagate", () => {
      const cfg = makeSavedConfig();
      vi.mocked(cfg.savedFilters!.store.add).mockImplementation(() => {
        throw new SavedFilterStorageError();
      });
      const d = createFilterDispatch(cfg);

      expect(() =>
        d.handleCreateSavedFilter({
          encryptedName: "enc-my-filter",
          color: "green",
          icon: "tag",
        }),
      ).toThrow(SavedFilterStorageError);
    });

    it("throws when creating saved filter without config", () => {
      const d = createFilterDispatch(makeConfig());

      expect(() =>
        d.handleCreateSavedFilter({
          encryptedName: "enc",
          color: "blue",
          icon: "star",
        }),
      ).toThrow("savedFilters config required");
    });

    it("is a no-op for apply/delete/toggleShare without config", async () => {
      const d = createFilterDispatch(makeConfig());

      expect(() => {
        d.handleSavedFilterApply(makeRecord());
      }).not.toThrow();
      await expect(d.handleSavedFilterDelete("id")).resolves.toBeUndefined();
      await expect(
        d.handleSavedFilterToggleShare("id"),
      ).resolves.toBeUndefined();
    });
  });
});

describe("filterBarHandlers", () => {
  it("maps the dispatch onto the filter bar's callbacks", () => {
    const dispatch = createFilterDispatch({ fields: {}, clearAll: vi.fn() });
    expect(filterBarHandlers(dispatch)).toEqual({
      ontoggle: dispatch.handlePillToggle,
      onselect: dispatch.handlePillSelect,
      ondatechange: dispatch.handlePillDateChange,
      onclearall: dispatch.clearAll,
    });
  });
});

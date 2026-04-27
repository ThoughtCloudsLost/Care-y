import { describe, it, expect, vi } from "vitest";
import {
  createFilterDispatch,
  type FilterDispatchConfig,
} from "./create-filter-dispatch.svelte.js";
import type { SavedFilterRecord } from "@care-y/shared";

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
  });

  describe("saved filters", () => {
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

    it("deletes a saved filter", () => {
      const cfg = makeSavedConfig();
      const d = createFilterDispatch(cfg);

      d.handleSavedFilterDelete("filter-1");

      expect(cfg.savedFilters!.store.remove).toHaveBeenCalledWith("filter-1");
    });

    it("toggles share on a saved filter", () => {
      const cfg = makeSavedConfig();
      const d = createFilterDispatch(cfg);

      d.handleSavedFilterToggleShare("filter-1");

      expect(cfg.savedFilters!.store.toggleShare).toHaveBeenCalledWith(
        "filter-1",
      );
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

    it("is a no-op for apply/delete/toggleShare without config", () => {
      const d = createFilterDispatch(makeConfig());

      expect(() => {
        d.handleSavedFilterApply(makeRecord());
      }).not.toThrow();
      expect(() => {
        d.handleSavedFilterDelete("id");
      }).not.toThrow();
      expect(() => {
        d.handleSavedFilterToggleShare("id");
      }).not.toThrow();
    });
  });
});

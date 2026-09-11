// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { flushSync } from "svelte";
import {
  createPortalFilters,
  type PortalFiltersConfig,
  type PortalFiltersState,
} from "./create-portal-filters.svelte.js";

const LABELS: PortalFiltersConfig["labels"] = {
  filterType: "Type",
  filterAuthor: "From",
  filterDate: "Date",
  typeMessages: "Messages",
  typeImages: "Images",
  typeFiles: "Files",
  authorYou: "You",
  authorSupport: "Support",
};

const CONFIG: PortalFiltersConfig = { labels: LABELS };

function createHarness(): {
  filters: PortalFiltersState;
  destroy: () => void;
} {
  const box: { filters?: PortalFiltersState } = {};
  const destroy = $effect.root(() => {
    box.filters = createPortalFilters(CONFIG);
  });
  flushSync();
  if (!box.filters) throw new Error("composable did not initialize");
  return { filters: box.filters, destroy };
}

describe("createPortalFilters", () => {
  let destroy: (() => void) | undefined;

  afterEach(() => {
    destroy?.();
    destroy = undefined;
  });

  describe("initial state", () => {
    it("starts with no active filters", () => {
      const h = createHarness();
      destroy = h.destroy;

      expect(h.filters.filterTypesArr).toEqual([]);
      expect(h.filters.filterAuthorsArr).toEqual([]);
      expect(h.filters.filterDateFrom).toBeNull();
      expect(h.filters.filterDateTo).toBeNull();
      expect(h.filters.activeCount).toBe(0);
    });

    it("exposes pills with expected structure", () => {
      const h = createHarness();
      destroy = h.destroy;

      const pillsConfig = h.filters.pills;
      expect(pillsConfig.pills).toHaveLength(3);
      expect(pillsConfig.pills[0]!.id).toBe("type");
      expect(pillsConfig.pills[0]!.mode).toBe("multi");
      expect(pillsConfig.pills[1]!.id).toBe("author");
      expect(pillsConfig.pills[1]!.mode).toBe("multi");
      expect(pillsConfig.pills[2]!.id).toBe("date");
      expect(pillsConfig.pills[2]!.mode).toBe("date");
    });

    it("renders type options from config labels", () => {
      const h = createHarness();
      destroy = h.destroy;

      const typeOpts = h.filters.pills.pills[0]!.options;
      expect(typeOpts).toEqual([
        { value: "message", label: "Messages" },
        { value: "__images__", label: "Images" },
        { value: "__files__", label: "Files" },
      ]);
    });

    it("renders author options from config labels", () => {
      const h = createHarness();
      destroy = h.destroy;

      const authorOpts = h.filters.pills.pills[1]!.options;
      expect(authorOpts).toEqual([
        { value: "__client__", label: "You" },
        { value: "__support__", label: "Support" },
      ]);
    });
  });

  describe("toggleFilterType via handlePillToggle", () => {
    it("adds a type filter on first toggle", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("type", "message");
      flushSync();

      expect(h.filters.filterTypesArr).toEqual(["message"]);
      expect(h.filters.activeCount).toBe(1);
    });

    it("removes a type filter on second toggle", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("type", "message");
      flushSync();
      h.filters.handlePillToggle("type", "message");
      flushSync();

      expect(h.filters.filterTypesArr).toEqual([]);
      expect(h.filters.activeCount).toBe(0);
    });

    it("supports multiple simultaneous type filters", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("type", "message");
      h.filters.handlePillToggle("type", "__images__");
      flushSync();

      expect(h.filters.filterTypesArr).toHaveLength(2);
      expect(h.filters.filterTypesArr).toContain("message");
      expect(h.filters.filterTypesArr).toContain("__images__");
      // Two type filters count as one active category
      expect(h.filters.activeCount).toBe(1);
    });
  });

  describe("toggleFilterAuthor via handlePillToggle", () => {
    it("adds an author filter on first toggle", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("author", "__client__");
      flushSync();

      expect(h.filters.filterAuthorsArr).toEqual(["__client__"]);
      expect(h.filters.activeCount).toBe(1);
    });

    it("removes an author filter on second toggle", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("author", "__client__");
      flushSync();
      h.filters.handlePillToggle("author", "__client__");
      flushSync();

      expect(h.filters.filterAuthorsArr).toEqual([]);
      expect(h.filters.activeCount).toBe(0);
    });
  });

  describe("handlePillToggle routing", () => {
    it("ignores unknown pill ids", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("unknown-pill", "anything");
      flushSync();

      expect(h.filters.filterTypesArr).toEqual([]);
      expect(h.filters.filterAuthorsArr).toEqual([]);
      expect(h.filters.activeCount).toBe(0);
    });
  });

  describe("handlePillSelect", () => {
    it("is a no-op (portal has no single-select pills)", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillSelect("type", "message");
      flushSync();

      expect(h.filters.filterTypesArr).toEqual([]);
      expect(h.filters.activeCount).toBe(0);
    });
  });

  describe("handleDateChange", () => {
    it("sets from and to dates", () => {
      const h = createHarness();
      destroy = h.destroy;

      const from = new Date("2026-07-01");
      const to = new Date("2026-07-15");
      h.filters.handleDateChange(from, to);
      flushSync();

      expect(h.filters.filterDateFrom).toBe(from);
      expect(h.filters.filterDateTo).toBe(to);
      expect(h.filters.activeCount).toBe(1);
    });

    it("counts date as one filter regardless of from-only or to-only", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handleDateChange(new Date("2026-07-01"), null);
      flushSync();
      expect(h.filters.activeCount).toBe(1);

      h.filters.handleDateChange(null, new Date("2026-07-15"));
      flushSync();
      expect(h.filters.activeCount).toBe(1);
    });

    it("clears date filter when both are null", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handleDateChange(new Date("2026-07-01"), null);
      flushSync();
      expect(h.filters.activeCount).toBe(1);

      h.filters.handleDateChange(null, null);
      flushSync();
      expect(h.filters.activeCount).toBe(0);
    });
  });

  describe("activeCount combinations", () => {
    it("counts each category independently", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("type", "message");
      h.filters.handlePillToggle("author", "__client__");
      h.filters.handleDateChange(new Date("2026-01-01"), null);
      flushSync();

      expect(h.filters.activeCount).toBe(3);
    });

    it("reflects the count through the pills config", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("type", "message");
      flushSync();

      expect(h.filters.pills.activeCount).toBe(1);
    });
  });

  describe("clearAll", () => {
    it("resets all filters to initial state", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("type", "message");
      h.filters.handlePillToggle("author", "__client__");
      h.filters.handleDateChange(
        new Date("2026-07-01"),
        new Date("2026-07-15"),
      );
      flushSync();
      expect(h.filters.activeCount).toBe(3);

      h.filters.clearAll();
      flushSync();

      expect(h.filters.filterTypesArr).toEqual([]);
      expect(h.filters.filterAuthorsArr).toEqual([]);
      expect(h.filters.filterDateFrom).toBeNull();
      expect(h.filters.filterDateTo).toBeNull();
      expect(h.filters.activeCount).toBe(0);
    });

    it("is available through pills config onclearall", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("type", "message");
      flushSync();
      expect(h.filters.activeCount).toBe(1);

      h.filters.pills.onclearall();
      flushSync();

      expect(h.filters.activeCount).toBe(0);
    });
  });

  describe("pills config date fields", () => {
    it("date strings are empty when no date filter is active", () => {
      const h = createHarness();
      destroy = h.destroy;

      expect(h.filters.pills.dateFrom).toBe("");
      expect(h.filters.pills.dateTo).toBe("");
      expect(h.filters.pills.dateActive).toBe(false);
      expect(h.filters.pills.dateLabel).toBeUndefined();
    });

    it("derives ISO date strings from filter dates", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handleDateChange(
        new Date("2026-07-01T00:00:00Z"),
        new Date("2026-07-15T00:00:00Z"),
      );
      flushSync();

      expect(h.filters.pills.dateFrom).toBe("2026-07-01");
      expect(h.filters.pills.dateTo).toBe("2026-07-15");
      expect(h.filters.pills.dateActive).toBe(true);
    });

    it("produces a date label with both from and to", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handleDateChange(
        new Date("2026-07-01T00:00:00Z"),
        new Date("2026-07-15T00:00:00Z"),
      );
      flushSync();

      const label = h.filters.pills.dateLabel;
      expect(label).toBeDefined();
      // Label format contains " - " separator between formatted dates
      expect(label).toContain(" - ");
    });

    it("produces a from-only date label ending with dash", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handleDateChange(new Date("2026-07-01T00:00:00Z"), null);
      flushSync();

      const label = h.filters.pills.dateLabel;
      expect(label).toBeDefined();
      expect(label!.endsWith("-")).toBe(true);
    });

    it("produces a to-only date label starting with dash", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handleDateChange(null, new Date("2026-07-15T00:00:00Z"));
      flushSync();

      const label = h.filters.pills.dateLabel;
      expect(label).toBeDefined();
      expect(label!.startsWith("-")).toBe(true);
    });
  });

  describe("pills selected sets reflect current state", () => {
    it("type pill selected set reflects toggled values", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("type", "message");
      h.filters.handlePillToggle("type", "__files__");
      flushSync();

      const typePill = h.filters.pills.pills[0]!;
      expect(typePill.selected).toBeInstanceOf(Set);
      expect((typePill.selected as ReadonlySet<string>).has("message")).toBe(
        true,
      );
      expect((typePill.selected as ReadonlySet<string>).has("__files__")).toBe(
        true,
      );
    });

    it("author pill selected set reflects toggled values", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.handlePillToggle("author", "__support__");
      flushSync();

      const authorPill = h.filters.pills.pills[1]!;
      expect(
        (authorPill.selected as ReadonlySet<string>).has("__support__"),
      ).toBe(true);
    });
  });

  describe("pills config callbacks", () => {
    it("ontoggle delegates to handlePillToggle", () => {
      const h = createHarness();
      destroy = h.destroy;

      h.filters.pills.ontoggle("type", "message");
      flushSync();

      expect(h.filters.filterTypesArr).toEqual(["message"]);
    });

    it("onselect delegates to handlePillSelect", () => {
      const h = createHarness();
      destroy = h.destroy;

      // No-op, but should not throw
      h.filters.pills.onselect("type", "message");
      flushSync();
      expect(h.filters.filterTypesArr).toEqual([]);
    });

    it("ondatechange delegates to handleDateChange", () => {
      const h = createHarness();
      destroy = h.destroy;

      const from = new Date("2026-08-01");
      h.filters.pills.ondatechange(from, null);
      flushSync();

      expect(h.filters.filterDateFrom).toBe(from);
    });
  });
});

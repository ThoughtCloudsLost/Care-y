import { describe, it, expect, vi } from "vitest";
import {
  createDetailFilters,
  type DetailFiltersConfig,
} from "./create-detail-filters.svelte.js";

const defaultLabels: DetailFiltersConfig["labels"] = {
  filterType: "Type",
  filterAuthor: "Author",
  filterDate: "Date",
  authorYou: (name: string) => `${name} (you)`,
  typeRecordings: "Recordings",
  typeImages: "Images",
  typeFiles: "Files",
  typeMessages: "Messages",
  typeAssignment: "Assignment",
  typeStatus: "Status",
  typePriority: "Priority",
  typeHold: "Hold",
  typeMerge: "Merge",
  typeCalls: "Calls",
};

function makeConfig(
  overrides?: Partial<DetailFiltersConfig>,
): DetailFiltersConfig {
  return {
    getNoteTypes: () => [],
    getParticipants: () => [],
    getParticipantsLoading: () => false,
    orgCache: {
      decrypt: vi.fn(() => "Decrypted"),
    } as unknown as DetailFiltersConfig["orgCache"],
    getClientAlias: () => "Alice",
    getCurrentUserId: () => "user-1",
    labels: defaultLabels,
    ...overrides,
  };
}

describe("createDetailFilters", () => {
  it("starts with no active filters", () => {
    const df = createDetailFilters(makeConfig());

    expect(df.filterTypesArr).toEqual([]);
    expect(df.filterAuthorsArr).toEqual([]);
    expect(df.filterDateFrom).toBeNull();
    expect(df.filterDateTo).toBeNull();
    expect(df.activeCount).toBe(0);
  });

  describe("handlePillToggle", () => {
    it("toggles type filters", () => {
      const df = createDetailFilters(makeConfig());

      df.handlePillToggle("type", "message");
      expect(df.filterTypesArr).toContain("message");

      df.handlePillToggle("type", "message");
      expect(df.filterTypesArr).not.toContain("message");
    });

    it("toggles author filters", () => {
      const df = createDetailFilters(makeConfig());

      df.handlePillToggle("author", "user-2");
      expect(df.filterAuthorsArr).toContain("user-2");

      df.handlePillToggle("author", "user-2");
      expect(df.filterAuthorsArr).not.toContain("user-2");
    });

    it("ignores unknown pill IDs", () => {
      const df = createDetailFilters(makeConfig());

      df.handlePillToggle("unknown", "value");

      expect(df.filterTypesArr).toEqual([]);
      expect(df.filterAuthorsArr).toEqual([]);
    });
  });

  describe("handleDateChange", () => {
    it("sets date range", () => {
      const df = createDetailFilters(makeConfig());
      const from = new Date("2026-01-01");
      const to = new Date("2026-01-31");

      df.handleDateChange(from, to);

      expect(df.filterDateFrom).toEqual(from);
      expect(df.filterDateTo).toEqual(to);
    });

    it("clears date range with nulls", () => {
      const df = createDetailFilters(makeConfig());
      df.handleDateChange(new Date(), new Date());

      df.handleDateChange(null, null);

      expect(df.filterDateFrom).toBeNull();
      expect(df.filterDateTo).toBeNull();
    });
  });

  describe("activeCount", () => {
    it("counts each active filter dimension once", () => {
      const df = createDetailFilters(makeConfig());

      df.handlePillToggle("type", "message");
      expect(df.activeCount).toBe(1);

      df.handlePillToggle("type", "__status__");
      expect(df.activeCount).toBe(1);

      df.handlePillToggle("author", "user-2");
      expect(df.activeCount).toBe(2);

      df.handleDateChange(new Date(), null);
      expect(df.activeCount).toBe(3);
    });
  });

  describe("clearAll", () => {
    it("resets all filter state", () => {
      const df = createDetailFilters(makeConfig());
      df.handlePillToggle("type", "message");
      df.handlePillToggle("author", "user-2");
      df.handleDateChange(new Date(), new Date());

      df.clearAll();

      expect(df.filterTypesArr).toEqual([]);
      expect(df.filterAuthorsArr).toEqual([]);
      expect(df.filterDateFrom).toBeNull();
      expect(df.filterDateTo).toBeNull();
      expect(df.activeCount).toBe(0);
    });
  });

  describe("pills", () => {
    it("includes type, author, and date pills", () => {
      const df = createDetailFilters(makeConfig());

      expect(df.pills.pills).toHaveLength(3);
      expect(df.pills.pills[0]?.id).toBe("type");
      expect(df.pills.pills[1]?.id).toBe("author");
      expect(df.pills.pills[2]?.id).toBe("date");
    });

    it("reflects active count in pills config", () => {
      const df = createDetailFilters(makeConfig());

      df.handlePillToggle("type", "message");

      expect(df.pills.activeCount).toBe(1);
    });

    it("type pill includes note types and built-in types", () => {
      const df = createDetailFilters(
        makeConfig({
          getNoteTypes: () => [{ id: "nt-1", encryptedName: null }],
        }),
      );

      const typePill = df.pills.pills[0];
      expect(typePill?.options.length).toBeGreaterThanOrEqual(10);
      expect(typePill?.options[0]?.value).toBe("note_type:nt-1");
    });

    it("author pill includes client alias and participants", () => {
      const df = createDetailFilters(
        makeConfig({
          getParticipants: () => [
            { volunteerId: "vol-1", encryptedDisplayName: null },
          ],
        }),
      );

      const authorPill = df.pills.pills[1];
      expect(authorPill?.options).toHaveLength(2);
      expect(authorPill?.options[0]?.label).toBe("Alice");
    });
  });
});

import { describe, it, expect } from "vitest";
import type { ReactionSummary } from "@care-y/shared";
import {
  isFilterStatus,
  isSortField,
  filterByDisplayStatus,
  reactionsForTicket,
  matchTitles,
  mergeSearchMatches,
  applySearchOrder,
  buildDateRangeLabel,
  buildFilterSummary,
  buildAssigneeOptions,
  VALID_STATUSES,
  SORT_FIELDS,
} from "./ticket-list-utils.js";

describe("isFilterStatus", () => {
  it.each(["new", "active", "hold", "closed"])("returns true for '%s'", (v) => {
    expect(isFilterStatus(v)).toBe(true);
  });

  it.each(["open", "pending", "", "NEW", "archived"])(
    "returns false for '%s'",
    (v) => {
      expect(isFilterStatus(v)).toBe(false);
    },
  );

  it("has 4 valid statuses", () => {
    expect(VALID_STATUSES.size).toBe(4);
  });
});

describe("isSortField", () => {
  it.each(["date", "priority", "last_activity", "queue"])(
    "returns true for '%s'",
    (v) => {
      expect(isSortField(v)).toBe(true);
    },
  );

  it.each(["name", "status", "", "DATE", "created_at"])(
    "returns false for '%s'",
    (v) => {
      expect(isSortField(v)).toBe(false);
    },
  );

  it("has 4 sort fields", () => {
    expect(SORT_FIELDS).toHaveLength(4);
  });
});

describe("filterByDisplayStatus", () => {
  const tickets = [
    { id: "1", status: "open", onHold: false, followUpCount: 0 },
    { id: "2", status: "open", onHold: false, followUpCount: 3 },
    { id: "3", status: "open", onHold: true, followUpCount: 1 },
    { id: "4", status: "closed", onHold: false, followUpCount: 5 },
  ];

  it("returns all tickets when needsFilter is false", () => {
    expect(filterByDisplayStatus(tickets, false, true)).toBe(tickets);
  });

  it("filters for new tickets (followUpCount === 0)", () => {
    const result = filterByDisplayStatus(tickets, true, true);
    const ids = result.map((t) => t.id);
    expect(ids).toEqual(["1", "3", "4"]);
  });

  it("filters for active tickets (followUpCount > 0)", () => {
    const result = filterByDisplayStatus(tickets, true, false);
    const ids = result.map((t) => t.id);
    expect(ids).toEqual(["2", "3", "4"]);
  });

  it("always passes through on-hold tickets", () => {
    const result = filterByDisplayStatus(tickets, true, true);
    expect(result.some((t) => t.id === "3")).toBe(true);
  });

  it("always passes through closed tickets", () => {
    const result = filterByDisplayStatus(tickets, true, true);
    expect(result.some((t) => t.id === "4")).toBe(true);
  });

  it("handles empty array", () => {
    expect(filterByDisplayStatus([], true, true)).toEqual([]);
  });
});

describe("reactionsForTicket", () => {
  it("returns undefined for undefined followUps", () => {
    expect(reactionsForTicket(undefined, new Map())).toBeUndefined();
  });

  it("returns undefined when no followUps have reactions", () => {
    const followUps = [{ id: "fu-1" }, { id: "fu-2" }];
    expect(reactionsForTicket(followUps, new Map())).toBeUndefined();
  });

  it("aggregates reactions by follow-up ID", () => {
    const reactions = [{ reaction: "acknowledge" as const, userIds: ["u1"] }];
    const followUps = [{ id: "fu-1" }, { id: "fu-2" }];
    const map = new Map([["fu-1", reactions]]);

    const result = reactionsForTicket(followUps, map);
    expect(result).toEqual({ "fu-1": reactions });
  });

  it("includes multiple follow-ups with reactions", () => {
    const r1: ReactionSummary[] = [
      { reaction: "acknowledge", userIds: ["u1"] },
    ];
    const r2: ReactionSummary[] = [{ reaction: "approve", userIds: ["u2"] }];
    const followUps = [{ id: "fu-1" }, { id: "fu-2" }, { id: "fu-3" }];
    const map = new Map<string, ReactionSummary[]>([
      ["fu-1", r1],
      ["fu-3", r2],
    ]);

    const result = reactionsForTicket(followUps, map);
    expect(result).toEqual({ "fu-1": r1, "fu-3": r2 });
  });
});

describe("matchTitles", () => {
  const mockFuzzy = (haystack: readonly string[], _query: string) => {
    return haystack
      .map((h, i) => ({ index: i, score: i }))
      .filter((_, i) => haystack[i]?.toLowerCase().includes("test"));
  };

  it("returns matching IDs", () => {
    const entries = [
      { id: "t1", title: "Test ticket", clientAlias: "Alice" },
      { id: "t2", title: "Other ticket", clientAlias: "Bob" },
      { id: "t3", title: "Another test", clientAlias: "Carol" },
    ];
    const result = matchTitles(entries, "test", mockFuzzy);
    expect(result).toEqual(["t1", "t3"]);
  });

  it("skips entries with null titles", () => {
    const entries = [
      { id: "t1", title: null, clientAlias: "Alice" },
      { id: "t2", title: "Test", clientAlias: "Bob" },
    ];
    const result = matchTitles(entries, "test", mockFuzzy);
    expect(result).toEqual(["t2"]);
  });

  it("returns empty array when no matches", () => {
    const entries = [{ id: "t1", title: "Hello", clientAlias: "Alice" }];
    const result = matchTitles(entries, "xyz", mockFuzzy);
    expect(result).toEqual([]);
  });

  it("returns empty array for empty entries", () => {
    expect(matchTitles([], "test", mockFuzzy)).toEqual([]);
  });
});

describe("mergeSearchMatches", () => {
  it("returns title matches when no content matches", () => {
    expect(mergeSearchMatches(["a", "b"], null, new Set(["a", "b"]))).toEqual([
      "a",
      "b",
    ]);
  });

  it("returns title matches when content matches is empty", () => {
    expect(
      mergeSearchMatches(["a", "b"], new Set(), new Set(["a", "b"])),
    ).toEqual(["a", "b"]);
  });

  it("appends content matches not in title matches", () => {
    const result = mergeSearchMatches(
      ["a", "b"],
      new Set(["b", "c", "d"]),
      new Set(["a", "b", "c", "d"]),
    );
    expect(result).toEqual(["a", "b", "c", "d"]);
  });

  it("skips content matches not in validIds", () => {
    const result = mergeSearchMatches(
      ["a"],
      new Set(["b", "c"]),
      new Set(["a", "b"]),
    );
    expect(result).toEqual(["a", "b"]);
  });

  it("preserves title match order first, then appends content", () => {
    const result = mergeSearchMatches(
      ["c", "a"],
      new Set(["b"]),
      new Set(["a", "b", "c"]),
    );
    expect(result).toEqual(["c", "a", "b"]);
  });
});

describe("applySearchOrder", () => {
  const tickets = [{ id: "t1" }, { id: "t2" }, { id: "t3" }, { id: "t4" }];

  it("returns all tickets when search inactive", () => {
    expect(applySearchOrder(tickets, false, null, [], true)).toEqual(tickets);
  });

  it("returns all tickets when search term is null", () => {
    expect(applySearchOrder(tickets, true, null, [], true)).toEqual(tickets);
  });

  it("returns all tickets when search term is too short", () => {
    expect(applySearchOrder(tickets, true, "a", [], true)).toEqual(tickets);
  });

  it("filters to matching tickets in match order", () => {
    const result = applySearchOrder(
      tickets,
      true,
      "search",
      ["t3", "t1"],
      true,
    );
    expect(result.map((t) => t.id)).toEqual(["t3", "t1"]);
  });

  it("filters to matching tickets in original order when useMatchOrder is false", () => {
    const result = applySearchOrder(
      tickets,
      true,
      "search",
      ["t3", "t1"],
      false,
    );
    expect(result.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  it("handles empty matches", () => {
    expect(applySearchOrder(tickets, true, "search", [], true)).toEqual([]);
  });
});

describe("buildDateRangeLabel", () => {
  const labels = { from: "From", to: "Until", range: "Date range" };
  const d1 = new Date("2026-01-15");
  const d2 = new Date("2026-03-20");

  it("returns range label when both dates null", () => {
    expect(buildDateRangeLabel(null, null, labels)).toBe("Date range");
  });

  it("returns formatted range when both dates set", () => {
    const result = buildDateRangeLabel(d1, d2, labels);
    expect(result).toContain(" - ");
    expect(result).toContain(d1.toLocaleDateString());
    expect(result).toContain(d2.toLocaleDateString());
  });

  it("returns from-only format", () => {
    const result = buildDateRangeLabel(d1, null, labels);
    expect(result).toMatch(/^From /);
    expect(result).toContain(d1.toLocaleDateString());
  });

  it("returns to-only format", () => {
    const result = buildDateRangeLabel(null, d2, labels);
    expect(result).toMatch(/^Until /);
    expect(result).toContain(d2.toLocaleDateString());
  });
});

describe("buildFilterSummary", () => {
  it("returns 'No filters' when nothing active", () => {
    expect(buildFilterSummary(new Set(), new Set(), 0, undefined, false)).toBe(
      "No filters",
    );
  });

  it("includes statuses", () => {
    expect(
      buildFilterSummary(
        new Set(["new", "active"]),
        new Set(),
        0,
        undefined,
        false,
      ),
    ).toBe("new, active");
  });

  it("includes priorities", () => {
    expect(
      buildFilterSummary(new Set(), new Set(["high"]), 0, undefined, false),
    ).toBe("high");
  });

  it("includes queue count with pluralization", () => {
    expect(buildFilterSummary(new Set(), new Set(), 1, undefined, false)).toBe(
      "1 queue",
    );
    expect(buildFilterSummary(new Set(), new Set(), 3, undefined, false)).toBe(
      "3 queues",
    );
  });

  it("includes assignee", () => {
    expect(buildFilterSummary(new Set(), new Set(), 0, "user-1", false)).toBe(
      "assigned",
    );
  });

  it("does not include assignee when null", () => {
    expect(buildFilterSummary(new Set(), new Set(), 0, null, false)).toBe(
      "No filters",
    );
  });

  it("includes date range", () => {
    expect(buildFilterSummary(new Set(), new Set(), 0, undefined, true)).toBe(
      "date range",
    );
  });

  it("joins multiple parts", () => {
    expect(
      buildFilterSummary(new Set(["new"]), new Set(["high"]), 2, "u1", true),
    ).toBe("new, high, 2 queues, assigned, date range");
  });
});

describe("buildAssigneeOptions", () => {
  const labels = {
    me: (count: string) => `Me (${count})`,
    unassigned: (count: string) => `Unassigned (${count})`,
  };

  it("includes 'me' option when currentUserId provided", () => {
    const result = buildAssigneeOptions(
      "user-1",
      { mine: 5, unassigned: 3 },
      labels,
    );
    expect(result).toEqual([
      { value: "user-1", label: "Me (5)" },
      { value: "__unassigned__", label: "Unassigned (3)" },
    ]);
  });

  it("omits 'me' option when no currentUserId", () => {
    const result = buildAssigneeOptions(
      undefined,
      { mine: 0, unassigned: 7 },
      labels,
    );
    expect(result).toEqual([
      { value: "__unassigned__", label: "Unassigned (7)" },
    ]);
  });

  it("handles undefined counts", () => {
    const result = buildAssigneeOptions("user-1", undefined, labels);
    expect(result[0]?.label).toBe("Me (0)");
    expect(result[1]?.label).toBe("Unassigned (0)");
  });
});

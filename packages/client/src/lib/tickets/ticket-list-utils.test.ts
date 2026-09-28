import { describe, it, expect, vi, afterEach } from "vitest";
import { ticketSortFieldSchema, type ReactionSummary } from "@care-y/shared";
import type * as Runtime from "$lib/paraglide/runtime.js";
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
  resolveEmptyKind,
  showCaughtUpLine,
  resolveGridColumns,
  estimateTicketCardHeight,
  GRID_CARD_MIN_WIDTH,
  VALID_STATUSES,
  SORT_FIELDS,
  LANE_GRID_CARD_MAX_WIDTH,
  resolveLaneGridColumns,
} from "./ticket-list-utils.js";
import type { DisplayStatus } from "./display-status.js";

// vi.mock required: the compiled Paraglide messages read the active locale
// through the runtime's getLocale() at call time, and there is no seam to
// spy on from the message module itself. Spreading importOriginal keeps
// every other runtime export real.
let mockLocale = "en";
vi.mock("$lib/paraglide/runtime.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Runtime>()),
  getLocale: () => mockLocale,
}));

// Restore in a hook, not at the end of the test body: a test that fails
// partway would otherwise leave the locale switched for everything after it.
afterEach(() => {
  mockLocale = "en";
});

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

  it("derives the sort field list from the shared schema", () => {
    expect(SORT_FIELDS).toEqual(ticketSortFieldSchema.options);
    expect(SORT_FIELDS.length).toBeGreaterThan(0);
  });
});

describe("filterByDisplayStatus", () => {
  // One ticket per display status, so each selection has exactly one
  // correct answer and the four are visibly mutually exclusive.
  const tickets = [
    {
      id: "new",
      status: "open" as const,
      onHold: false,
      followUpCount: 0,
      hasResponse: false,
    },
    {
      id: "active",
      status: "open" as const,
      onHold: false,
      followUpCount: 3,
      hasResponse: true,
    },
    {
      id: "hold",
      status: "open" as const,
      onHold: true,
      followUpCount: 1,
      hasResponse: true,
    },
    {
      id: "closed",
      status: "closed" as const,
      onHold: false,
      followUpCount: 5,
      hasResponse: true,
    },
  ];

  const select = (...s: DisplayStatus[]): ReadonlySet<DisplayStatus> =>
    new Set(s);
  const idsFor = (...s: DisplayStatus[]): string[] =>
    filterByDisplayStatus(tickets, select(...s)).map((t) => t.id);

  it("returns the same array when nothing is selected", () => {
    expect(filterByDisplayStatus(tickets, select())).toBe(tickets);
  });

  it("matches each display status to exactly its own ticket", () => {
    expect(idsFor("new")).toEqual(["new"]);
    expect(idsFor("active")).toEqual(["active"]);
    expect(idsFor("hold")).toEqual(["hold"]);
    expect(idsFor("closed")).toEqual(["closed"]);
  });

  it("does not leak held or closed tickets into New or Active", () => {
    // The previous implementation passed both through unconditionally,
    // so selecting New returned held and closed tickets as well.
    expect(idsFor("new")).not.toContain("hold");
    expect(idsFor("new")).not.toContain("closed");
    expect(idsFor("active")).not.toContain("hold");
  });

  it("unions the selected statuses", () => {
    expect(idsFor("new", "active")).toEqual(["new", "active"]);
    // The two selections the server params cannot express.
    expect(idsFor("new", "hold")).toEqual(["new", "hold"]);
    expect(idsFor("closed", "hold")).toEqual(["hold", "closed"]);
  });

  it("selecting all four returns every ticket", () => {
    expect(idsFor("new", "active", "hold", "closed")).toHaveLength(
      tickets.length,
    );
  });

  it("handles empty array", () => {
    expect(filterByDisplayStatus([], select("new"))).toEqual([]);
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
      .map((_, i) => ({ index: i, score: i }))
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

  it("matches against queueName", () => {
    const fuzzy = (haystack: readonly string[], _q: string) =>
      haystack
        .map((_, i) => ({ index: i, score: i }))
        .filter((_, i) => haystack[i]?.toLowerCase().includes("housing"));
    const entries = [
      {
        id: "t1",
        title: "Intake call",
        clientAlias: "Alice",
        queueName: "Housing Support",
      },
      { id: "t2", title: "Other ticket", clientAlias: "Bob", queueName: null },
    ];
    const result = matchTitles(entries, "housing", fuzzy);
    expect(result).toEqual(["t1"]);
  });

  it("matches against assignedName", () => {
    const fuzzy = (haystack: readonly string[], _q: string) =>
      haystack
        .map((_, i) => ({ index: i, score: i }))
        .filter((_, i) => haystack[i]?.toLowerCase().includes("maria"));
    const entries = [
      {
        id: "t1",
        title: "Follow up",
        clientAlias: "Bob",
        assignedName: "Maria",
      },
      {
        id: "t2",
        title: "Other ticket",
        clientAlias: "Carol",
        assignedName: null,
      },
    ];
    const result = matchTitles(entries, "maria", fuzzy);
    expect(result).toEqual(["t1"]);
  });

  it("treats missing queueName and assignedName as empty strings", () => {
    const fuzzy = (haystack: readonly string[], _q: string) =>
      haystack
        .map((_, i) => ({ index: i, score: i }))
        .filter((_, i) => haystack[i]?.toLowerCase().includes("test"));
    const entries = [{ id: "t1", title: "Test ticket", clientAlias: "Alice" }];
    const result = matchTitles(entries, "test", fuzzy);
    expect(result).toEqual(["t1"]);
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

// Labels come from the English messages, and the queue term from the
// default terminology the test setup provides.
describe("buildFilterSummary", () => {
  it("returns 'No filters' when nothing active", () => {
    expect(
      buildFilterSummary(
        new Set(),
        new Set(),
        0,
        undefined,
        false,
        false,
        false,
      ),
    ).toBe("No filters");
  });

  it("names statuses by their pill labels", () => {
    expect(
      buildFilterSummary(
        new Set(["new", "active"]),
        new Set(),
        0,
        undefined,
        false,
        false,
        false,
      ),
    ).toBe("New, Active");
  });

  it("names priorities by their labels", () => {
    expect(
      buildFilterSummary(
        new Set(),
        new Set(["high"]),
        0,
        undefined,
        false,
        false,
        false,
      ),
    ).toBe("High");
  });

  it("counts queues in the configured term, singular and plural", () => {
    expect(
      buildFilterSummary(
        new Set(),
        new Set(),
        1,
        undefined,
        false,
        false,
        false,
      ),
    ).toBe("1 queue");
    expect(
      buildFilterSummary(
        new Set(),
        new Set(),
        3,
        undefined,
        false,
        false,
        false,
      ),
    ).toBe("3 queues");
  });

  it("includes assignee", () => {
    expect(
      buildFilterSummary(
        new Set(),
        new Set(),
        0,
        "user-1",
        false,
        false,
        false,
      ),
    ).toBe("Assignee");
  });

  it("names the Unassigned filter when assignee is null", () => {
    expect(
      buildFilterSummary(new Set(), new Set(), 0, null, false, false, false),
    ).toBe("Unassigned");
  });

  it("omits assignee when there is no assignee filter", () => {
    expect(
      buildFilterSummary(
        new Set(),
        new Set(),
        0,
        undefined,
        false,
        false,
        false,
      ),
    ).toBe("No filters");
  });

  it("includes date range", () => {
    expect(
      buildFilterSummary(
        new Set(),
        new Set(),
        0,
        undefined,
        true,
        false,
        false,
      ),
    ).toBe("Date");
  });

  it("joins multiple parts", () => {
    expect(
      buildFilterSummary(
        new Set(["new"]),
        new Set(["high"]),
        2,
        "u1",
        true,
        false,
        false,
      ),
    ).toBe("New, High, 2 queues, Assignee, Date");
  });

  it("includes Unread when unreadOnly is true", () => {
    expect(
      buildFilterSummary(
        new Set(),
        new Set(),
        0,
        undefined,
        false,
        true,
        false,
      ),
    ).toBe("Unread");
  });

  it("includes Needs attention when needsAttentionOnly is true", () => {
    expect(
      buildFilterSummary(
        new Set(),
        new Set(),
        0,
        undefined,
        false,
        false,
        true,
      ),
    ).toBe("Needs attention");
  });

  it("joins toggle labels with other parts", () => {
    expect(
      buildFilterSummary(
        new Set(["new"]),
        new Set(),
        0,
        undefined,
        false,
        true,
        true,
      ),
    ).toBe("New, Unread, Needs attention");
  });

  it("reads in the active locale, the queue term still the org's own", () => {
    mockLocale = "es";
    expect(
      buildFilterSummary(
        new Set(["hold"]),
        new Set(["urgent"]),
        2,
        "u1",
        true,
        true,
        true,
      ),
    ).toBe(
      "En espera, Urgente, 2 queues, Asignado, Fecha, Sin leer, Necesita atención",
    );
    expect(
      buildFilterSummary(
        new Set(),
        new Set(),
        0,
        undefined,
        false,
        false,
        false,
      ),
    ).toBe("Sin filtros");
  });
});

describe("buildAssigneeOptions", () => {
  const labels = { me: "Me (5)", unassigned: "Unassigned (3)" };

  it("includes the 'me' option when a current user is known", () => {
    expect(buildAssigneeOptions("user-1", labels)).toEqual([
      { value: "user-1", label: "Me (5)" },
      { value: "__unassigned__", label: "Unassigned (3)" },
    ]);
  });

  it("omits the 'me' option when there is no current user", () => {
    expect(buildAssigneeOptions(undefined, labels)).toEqual([
      { value: "__unassigned__", label: "Unassigned (3)" },
    ]);
  });

  it("passes composed labels through untouched", () => {
    // The caller formats counts, floors included, so anything it hands
    // over reaches the option verbatim.
    const result = buildAssigneeOptions("user-1", {
      me: "Me (20+)",
      unassigned: "Unassigned",
    });
    expect(result[0]?.label).toBe("Me (20+)");
    expect(result[1]?.label).toBe("Unassigned");
  });
});

describe("resolveEmptyKind", () => {
  const base = {
    searchActive: false,
    unreadFilterOn: false,
    globalCaughtUp: false,
    ticketCount: 0,
    activeFilterCount: 0,
  };

  it("returns 'search' when the search overlay is active", () => {
    expect(resolveEmptyKind({ ...base, searchActive: true })).toBe("search");
  });

  it("search wins over every other branch", () => {
    expect(
      resolveEmptyKind({
        ...base,
        searchActive: true,
        unreadFilterOn: true,
        globalCaughtUp: true,
      }),
    ).toBe("search");
  });

  it("returns 'caught-up' when the unread filter is on and global unread is zero", () => {
    expect(
      resolveEmptyKind({ ...base, unreadFilterOn: true, globalCaughtUp: true }),
    ).toBe("caught-up");
  });

  it("returns 'filtered' when the unread filter is on but the sweep has not settled", () => {
    expect(
      resolveEmptyKind({
        ...base,
        unreadFilterOn: true,
        globalCaughtUp: false,
      }),
    ).toBe("filtered");
  });

  it("returns 'truly-empty' with zero tickets and no active filters", () => {
    expect(resolveEmptyKind(base)).toBe("truly-empty");
  });

  it("returns 'filtered' with zero rendered rows but active filters", () => {
    expect(resolveEmptyKind({ ...base, activeFilterCount: 2 })).toBe(
      "filtered",
    );
  });

  it("returns 'filtered' when tickets exist but none render", () => {
    expect(resolveEmptyKind({ ...base, ticketCount: 5 })).toBe("filtered");
  });

  it("returns 'filtered', never 'truly-empty', while the needs-attention filter is on", () => {
    expect(resolveEmptyKind({ ...base, needsAttentionOn: true })).toBe(
      "filtered",
    );
  });

  it("never claims 'caught-up' from the needs-attention filter alone", () => {
    expect(
      resolveEmptyKind({
        ...base,
        needsAttentionOn: true,
        globalCaughtUp: true,
      }),
    ).toBe("filtered");
  });
});

describe("showCaughtUpLine", () => {
  const base = {
    sortOn: true,
    globalCaughtUp: true,
    searchActive: false,
    listCount: 3,
  };

  it("shows above a non-empty list when sort is on and global unread is zero", () => {
    expect(showCaughtUpLine(base)).toBe(true);
  });

  it("hides when the sort toggle is off", () => {
    expect(showCaughtUpLine({ ...base, sortOn: false })).toBe(false);
  });

  it("hides until the sweep settles at zero", () => {
    expect(showCaughtUpLine({ ...base, globalCaughtUp: false })).toBe(false);
  });

  it("hides while searching", () => {
    expect(showCaughtUpLine({ ...base, searchActive: true })).toBe(false);
  });

  it("hides on an empty list (the full empty state owns that)", () => {
    expect(showCaughtUpLine({ ...base, listCount: 0 })).toBe(false);
  });
});

describe("resolveLaneGridColumns", () => {
  const GAP = 6;

  it("keeps the two column floor in a narrow lane", () => {
    expect(resolveLaneGridColumns(0, GAP)).toBe(2);
    expect(resolveLaneGridColumns(390, GAP)).toBe(2);
  });

  it("adds a column each time another capped card fits", () => {
    const perCard = LANE_GRID_CARD_MAX_WIDTH + GAP;
    expect(resolveLaneGridColumns(perCard * 3 - GAP, GAP)).toBe(3);
    expect(resolveLaneGridColumns(perCard * 3 - GAP - 1, GAP)).toBe(2);
    // A two-across lane at 1920 is about 783px wide: three cards.
    expect(resolveLaneGridColumns(783, GAP)).toBe(3);
  });
});

describe("resolveGridColumns", () => {
  it("returns 2 before the container has been measured (width 0)", () => {
    expect(resolveGridColumns(0)).toBe(2);
  });

  it("never collapses below 2 columns at phone widths", () => {
    expect(resolveGridColumns(390)).toBe(2);
    expect(resolveGridColumns(GRID_CARD_MIN_WIDTH * 2 - 1)).toBe(2);
  });

  it("grows by whole card widths past the 2 column floor", () => {
    expect(resolveGridColumns(GRID_CARD_MIN_WIDTH * 2)).toBe(2);
    expect(resolveGridColumns(GRID_CARD_MIN_WIDTH * 3)).toBe(3);
    expect(resolveGridColumns(1280)).toBe(4);
  });
});

describe("estimateTicketCardHeight", () => {
  it("guesses a short row for list mode and a tall card otherwise", () => {
    expect(estimateTicketCardHeight("list")).toBe(72);
    expect(estimateTicketCardHeight("cards")).toBe(210);
    expect(estimateTicketCardHeight("grid")).toBe(200);
  });
});

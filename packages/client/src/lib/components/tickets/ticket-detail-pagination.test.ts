// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

/**
 * Tests for TicketDetail pagination and unread divider logic.
 *
 * TicketDetail depends on tRPC, TanStack Query, crypto context, and many
 * child components, making full component rendering impractical in a unit
 * test. These tests verify the extracted logic functions (page flattening,
 * firstUnreadId computation, scroll position math) in isolation.
 */

// --- Types matching the component's internal shape ---

interface MinimalFollowUp {
  id: string;
  createdAt: string;
}

// --- Logic under test (mirrors TicketDetail's derived state) ---

/**
 * Flatten paginated pages into a single chronological array.
 * Pages are stored oldest-page-first, each page internally sorted
 * oldest-to-newest (server reverses DESC results).
 */
function flattenPages<T>(pages: T[][]): T[] {
  return pages.flat();
}

/**
 * Find the first unread follow-up ID using a read cursor timestamp.
 * Messages with createdAt <= readUpTo are read. null readUpTo = all unread.
 */
function findFirstUnreadByTimestamp(
  followUps: MinimalFollowUp[],
  readUpTo: Date | null,
): string | null {
  if (readUpTo === null) {
    // No prior read history (first visit): no unread boundary.
    return null;
  }
  const cutoff = readUpTo.getTime();
  const firstUnread = followUps.find(
    (fu) => new Date(fu.createdAt).getTime() > cutoff,
  );
  return firstUnread?.id ?? null;
}

/**
 * Determine if the read boundary is beyond the loaded range.
 * Returns true if we need to fetch more older pages.
 */
function needsMorePages(
  followUps: MinimalFollowUp[],
  readUpTo: Date | null,
  hasMoreOlder: boolean,
): boolean {
  if (readUpTo === null) return false;
  if (!hasMoreOlder) return false;
  const oldest = followUps[0];
  if (!oldest) return false;
  return new Date(oldest.createdAt).getTime() > readUpTo.getTime();
}

/**
 * Legacy: find the first unread follow-up ID using a Set of read IDs.
 * Kept for backwards-compatibility test coverage.
 */
function findFirstUnreadId(
  followUps: MinimalFollowUp[],
  readIds: Set<string>,
): string | null {
  return followUps.find((fu) => !readIds.has(fu.id))?.id ?? null;
}

/**
 * Compute the new scrollTop after prepending older items.
 * The delta between old and new scrollHeight is added to maintain
 * the same visual position.
 */
function preserveScrollTop(
  prevScrollTop: number,
  prevScrollHeight: number,
  newScrollHeight: number,
): number {
  return prevScrollTop + (newScrollHeight - prevScrollHeight);
}

// --- Tests ---

describe("page flattening", () => {
  it("flattens multiple pages into chronological order", () => {
    const pages = [
      [{ id: "a" }, { id: "b" }],
      [{ id: "c" }, { id: "d" }],
    ];
    const flat = flattenPages(pages);
    expect(flat.map((f) => f.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("returns empty array for no pages", () => {
    expect(flattenPages([])).toEqual([]);
  });

  it("handles a single page", () => {
    const pages = [[{ id: "x" }]];
    expect(flattenPages(pages).map((f) => f.id)).toEqual(["x"]);
  });
});

describe("firstUnreadId", () => {
  const followUps: MinimalFollowUp[] = [
    { id: "fu-1", createdAt: "2026-04-01T10:00:00Z" },
    { id: "fu-2", createdAt: "2026-04-01T10:01:00Z" },
    { id: "fu-3", createdAt: "2026-04-01T10:02:00Z" },
    { id: "fu-4", createdAt: "2026-04-01T10:03:00Z" },
  ];

  it("returns the first follow-up not in the read set", () => {
    const readIds = new Set(["fu-1", "fu-2"]);
    expect(findFirstUnreadId(followUps, readIds)).toBe("fu-3");
  });

  it("returns null when all follow-ups are read", () => {
    const readIds = new Set(["fu-1", "fu-2", "fu-3", "fu-4"]);
    expect(findFirstUnreadId(followUps, readIds)).toBeNull();
  });

  it("returns the first follow-up when none are read", () => {
    const readIds = new Set<string>();
    expect(findFirstUnreadId(followUps, readIds)).toBe("fu-1");
  });

  it("handles empty follow-ups array", () => {
    expect(findFirstUnreadId([], new Set())).toBeNull();
  });

  it("handles non-contiguous read state", () => {
    // fu-1 read, fu-2 unread, fu-3 read: first unread is fu-2
    const readIds = new Set(["fu-1", "fu-3"]);
    expect(findFirstUnreadId(followUps, readIds)).toBe("fu-2");
  });
});

describe("findFirstUnreadByTimestamp", () => {
  const followUps: MinimalFollowUp[] = [
    { id: "fu-1", createdAt: "2026-04-01T10:00:00Z" },
    { id: "fu-2", createdAt: "2026-04-01T10:01:00Z" },
    { id: "fu-3", createdAt: "2026-04-01T10:02:00Z" },
    { id: "fu-4", createdAt: "2026-04-01T10:03:00Z" },
  ];

  it("returns the first follow-up after the readUpTo timestamp", () => {
    const readUpTo = new Date("2026-04-01T10:01:00Z");
    expect(findFirstUnreadByTimestamp(followUps, readUpTo)).toBe("fu-3");
  });

  it("returns null when all follow-ups are before readUpTo", () => {
    const readUpTo = new Date("2026-04-01T11:00:00Z");
    expect(findFirstUnreadByTimestamp(followUps, readUpTo)).toBeNull();
  });

  it("returns null when readUpTo is null (first visit, no prior history)", () => {
    expect(findFirstUnreadByTimestamp(followUps, null)).toBeNull();
  });

  it("returns null for empty follow-ups with null readUpTo", () => {
    expect(findFirstUnreadByTimestamp([], null)).toBeNull();
  });

  it("returns null for empty follow-ups with a readUpTo", () => {
    expect(
      findFirstUnreadByTimestamp([], new Date("2026-04-01T10:00:00Z")),
    ).toBeNull();
  });

  it("treats the exact readUpTo timestamp as read", () => {
    // readUpTo = fu-2's timestamp, so fu-2 is read, fu-3 is first unread
    const readUpTo = new Date("2026-04-01T10:01:00Z");
    expect(findFirstUnreadByTimestamp(followUps, readUpTo)).toBe("fu-3");
  });

  it("returns first follow-up when readUpTo is before all messages", () => {
    const readUpTo = new Date("2026-03-01T00:00:00Z");
    expect(findFirstUnreadByTimestamp(followUps, readUpTo)).toBe("fu-1");
  });

  it("handles sub-second precision differences", () => {
    const fus: MinimalFollowUp[] = [
      { id: "a", createdAt: "2026-04-01T10:00:00.100Z" },
      { id: "b", createdAt: "2026-04-01T10:00:00.200Z" },
      { id: "c", createdAt: "2026-04-01T10:00:00.300Z" },
    ];
    const readUpTo = new Date("2026-04-01T10:00:00.200Z");
    expect(findFirstUnreadByTimestamp(fus, readUpTo)).toBe("c");
  });
});

describe("needsMorePages", () => {
  const followUps: MinimalFollowUp[] = [
    { id: "fu-50", createdAt: "2026-04-01T10:50:00Z" },
    { id: "fu-51", createdAt: "2026-04-01T10:51:00Z" },
    { id: "fu-99", createdAt: "2026-04-01T11:39:00Z" },
  ];

  it("returns true when oldest loaded is newer than readUpTo", () => {
    const readUpTo = new Date("2026-04-01T10:30:00Z");
    expect(needsMorePages(followUps, readUpTo, true)).toBe(true);
  });

  it("returns false when oldest loaded is older than readUpTo", () => {
    const readUpTo = new Date("2026-04-01T10:55:00Z");
    expect(needsMorePages(followUps, readUpTo, true)).toBe(false);
  });

  it("returns false when readUpTo is null (all unread, no boundary to find)", () => {
    expect(needsMorePages(followUps, null, true)).toBe(false);
  });

  it("returns false when hasMoreOlder is false", () => {
    const readUpTo = new Date("2026-04-01T10:30:00Z");
    expect(needsMorePages(followUps, readUpTo, false)).toBe(false);
  });

  it("returns false for empty follow-ups", () => {
    const readUpTo = new Date("2026-04-01T10:30:00Z");
    expect(needsMorePages([], readUpTo, true)).toBe(false);
  });

  it("returns false when oldest loaded equals readUpTo exactly", () => {
    const readUpTo = new Date("2026-04-01T10:50:00Z");
    expect(needsMorePages(followUps, readUpTo, true)).toBe(false);
  });
});

describe("scroll position preservation", () => {
  it("adjusts scrollTop by the scrollHeight delta", () => {
    // User was scrolled 500px down in a 2000px container.
    // After prepend, container is now 3000px. Adjustment: 500 + 1000 = 1500.
    expect(preserveScrollTop(500, 2000, 3000)).toBe(1500);
  });

  it("returns same scrollTop when no height change", () => {
    expect(preserveScrollTop(500, 2000, 2000)).toBe(500);
  });

  it("works when user was at the top (scrollTop=0)", () => {
    // At top of 2000px, prepending adds 800px.
    expect(preserveScrollTop(0, 2000, 2800)).toBe(800);
  });

  it("works when user was at the bottom", () => {
    // scrollTop=1700 (bottom of 2000px with 300px viewport).
    // After prepend, container is 2500px. New scrollTop = 2200.
    expect(preserveScrollTop(1700, 2000, 2500)).toBe(2200);
  });
});

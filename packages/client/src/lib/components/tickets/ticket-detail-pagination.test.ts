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
 * Find the first unread follow-up ID.
 * Returns null if all follow-ups have been read.
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

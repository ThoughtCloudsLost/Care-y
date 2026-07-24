/**
 * Tests for dashboard ticket filter functions.
 *
 * Tests for dashboard ticket filter functions.
 */

import { describe, it, expect } from "vitest";
import {
  isNeedsAttention,
  filterMyOpen,
  filterUnassigned,
  filterOnHold,
  bucketTickets,
  type DashboardTicket,
} from "./filters.js";

const USER_ID = "user-001";

function ticket(overrides: Partial<DashboardTicket> = {}): DashboardTicket {
  return {
    id: `t-${Math.random().toString(36).slice(2, 8)}`,
    status: "open",
    priority: "normal",
    onHold: false,
    assignedTo: null,
    followUpCount: 0,
    ...overrides,
  };
}

describe("isNeedsAttention", () => {
  const noneUnread = (): boolean => false;
  const allUnread = (): boolean => true;

  it("includes urgent unassigned tickets regardless of read state", () => {
    const t = ticket({ priority: "urgent", assignedTo: null });
    expect(isNeedsAttention(t, USER_ID, noneUnread)).toBe(true);
  });

  it("includes high-priority unassigned tickets", () => {
    const t = ticket({ priority: "high", assignedTo: null });
    expect(isNeedsAttention(t, USER_ID, noneUnread)).toBe(true);
  });

  it("includes own high-priority tickets only when unread", () => {
    const t = ticket({ priority: "high", assignedTo: USER_ID });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(true);
    expect(isNeedsAttention(t, USER_ID, noneUnread)).toBe(false);
  });

  it("excludes normal priority unassigned tickets", () => {
    const t = ticket({ priority: "normal", assignedTo: null });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(false);
  });

  it("excludes on-hold tickets even if urgent", () => {
    const t = ticket({ priority: "urgent", assignedTo: null, onHold: true });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(false);
  });

  it("excludes closed tickets even if urgent", () => {
    const t = ticket({
      priority: "urgent",
      assignedTo: null,
      status: "closed",
    });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(false);
  });

  it("excludes urgent tickets assigned to another user even when unread", () => {
    const t = ticket({ priority: "urgent", assignedTo: "other-user" });
    expect(isNeedsAttention(t, USER_ID, allUnread)).toBe(false);
  });
});

describe("filterMyOpen", () => {
  it("includes open tickets assigned to current user", () => {
    const t = ticket({ assignedTo: USER_ID, status: "open" });
    expect(filterMyOpen([t], USER_ID)).toEqual([t]);
  });

  it("excludes on-hold tickets", () => {
    const t = ticket({ assignedTo: USER_ID, onHold: true });
    expect(filterMyOpen([t], USER_ID)).toEqual([]);
  });

  it("excludes tickets assigned to other users", () => {
    const t = ticket({ assignedTo: "other-user" });
    expect(filterMyOpen([t], USER_ID)).toEqual([]);
  });

  it("excludes closed tickets", () => {
    const t = ticket({ assignedTo: USER_ID, status: "closed" });
    expect(filterMyOpen([t], USER_ID)).toEqual([]);
  });

  it("excludes unassigned tickets", () => {
    const t = ticket({ assignedTo: null });
    expect(filterMyOpen([t], USER_ID)).toEqual([]);
  });
});

describe("filterUnassigned", () => {
  it("includes open unassigned tickets", () => {
    const t = ticket({ assignedTo: null, status: "open" });
    expect(filterUnassigned([t])).toEqual([t]);
  });

  it("excludes assigned tickets", () => {
    const t = ticket({ assignedTo: USER_ID });
    expect(filterUnassigned([t])).toEqual([]);
  });

  it("excludes closed unassigned tickets", () => {
    const t = ticket({ assignedTo: null, status: "closed" });
    expect(filterUnassigned([t])).toEqual([]);
  });
});

describe("filterOnHold", () => {
  it("includes on-hold tickets", () => {
    const t = ticket({ onHold: true });
    expect(filterOnHold([t])).toEqual([t]);
  });

  it("excludes non-hold tickets", () => {
    const t = ticket({ onHold: false });
    expect(filterOnHold([t])).toEqual([]);
  });
});

describe("bucketTickets", () => {
  const noneUnread = (): boolean => false;

  it("routes on-hold tickets to onHold only", () => {
    const t = ticket({ onHold: true, assignedTo: USER_ID });
    const b = bucketTickets([t], USER_ID, noneUnread);
    expect(b.onHold).toEqual([t]);
    expect(b.myOpen).toEqual([]);
    expect(b.unassigned).toEqual([]);
    expect(b.needsAttention).toEqual([]);
  });

  it("buckets an open unassigned ticket into unassigned", () => {
    const t = ticket({ assignedTo: null });
    const b = bucketTickets([t], USER_ID, noneUnread);
    expect(b.unassigned).toEqual([t]);
    expect(b.myOpen).toEqual([]);
  });

  it("buckets an open ticket assigned to the current user into myOpen", () => {
    const t = ticket({ assignedTo: USER_ID });
    const b = bucketTickets([t], USER_ID, noneUnread);
    expect(b.myOpen).toEqual([t]);
  });

  it("adds high-priority unassigned tickets to needsAttention regardless of read state", () => {
    const t = ticket({ priority: "urgent", assignedTo: null });
    const b = bucketTickets([t], USER_ID, noneUnread);
    expect(b.needsAttention).toEqual([t]);
  });

  it("adds a high-priority own ticket to needsAttention only when it is unread", () => {
    const t = ticket({ priority: "high", assignedTo: USER_ID });

    const surfaced = bucketTickets([t], USER_ID, (id) => id === t.id);
    expect(surfaced.needsAttention).toEqual([t]);

    const quiet = bucketTickets([t], USER_ID, noneUnread);
    expect(quiet.needsAttention).toEqual([]);
  });

  it("keys the mine+high arm off read state, not followUpCount", () => {
    // The old heuristic surfaced any own high-priority ticket with
    // follow-ups; the new one requires genuinely unread replies, so a read
    // ticket with a nonzero follow-up count must stay out of needsAttention.
    const t = ticket({
      priority: "high",
      assignedTo: USER_ID,
      followUpCount: 5,
    });
    const b = bucketTickets([t], USER_ID, noneUnread);
    expect(b.needsAttention).toEqual([]);
  });

  it("skips closed tickets across every bucket", () => {
    const t = ticket({ status: "closed", assignedTo: USER_ID });
    const b = bucketTickets([t], USER_ID, noneUnread);
    expect(b.myOpen).toEqual([]);
    expect(b.unassigned).toEqual([]);
    expect(b.needsAttention).toEqual([]);
    expect(b.onHold).toEqual([]);
  });
});

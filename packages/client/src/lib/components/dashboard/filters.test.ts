/**
 * Tests for dashboard ticket filter functions.
 *
 * Tests for dashboard ticket filter functions.
 */

import { describe, it, expect } from "vitest";
import {
  filterNeedsAttention,
  filterMyOpen,
  filterUnassigned,
  filterOnHold,
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

describe("filterNeedsAttention", () => {
  it("includes urgent unassigned tickets", () => {
    const t = ticket({ priority: "urgent", assignedTo: null });
    expect(filterNeedsAttention([t], USER_ID)).toEqual([t]);
  });

  it("includes high-priority unassigned tickets", () => {
    const t = ticket({ priority: "high", assignedTo: null });
    expect(filterNeedsAttention([t], USER_ID)).toEqual([t]);
  });

  it("includes own high-priority tickets with follow-ups", () => {
    const t = ticket({
      priority: "high",
      assignedTo: USER_ID,
      followUpCount: 2,
    });
    expect(filterNeedsAttention([t], USER_ID)).toEqual([t]);
  });

  it("excludes normal priority unassigned tickets", () => {
    const t = ticket({ priority: "normal", assignedTo: null });
    expect(filterNeedsAttention([t], USER_ID)).toEqual([]);
  });

  it("excludes on-hold tickets even if urgent", () => {
    const t = ticket({ priority: "urgent", assignedTo: null, onHold: true });
    expect(filterNeedsAttention([t], USER_ID)).toEqual([]);
  });

  it("excludes closed tickets even if urgent", () => {
    const t = ticket({
      priority: "urgent",
      assignedTo: null,
      status: "closed",
    });
    expect(filterNeedsAttention([t], USER_ID)).toEqual([]);
  });

  it("excludes high-priority own tickets without follow-ups", () => {
    const t = ticket({
      priority: "high",
      assignedTo: USER_ID,
      followUpCount: 0,
    });
    expect(filterNeedsAttention([t], USER_ID)).toEqual([]);
  });

  it("excludes urgent tickets assigned to another user", () => {
    const t = ticket({
      priority: "urgent",
      assignedTo: "other-user",
      followUpCount: 0,
    });
    expect(filterNeedsAttention([t], USER_ID)).toEqual([]);
  });

  it("returns empty for empty input", () => {
    expect(filterNeedsAttention([], USER_ID)).toEqual([]);
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

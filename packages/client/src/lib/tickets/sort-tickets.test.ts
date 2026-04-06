import { describe, it, expect } from "vitest";
import { sortTickets } from "./sort-tickets.js";

function makeTicket(
  id: string,
  priority: string,
  createdAt: string,
  lastActivityAt: string | null = null,
  queueName = "Intake",
) {
  return { id, priority, createdAt, lastActivityAt, queueName };
}

describe("sortTickets", () => {
  const t1 = makeTicket("a", "normal", "2026-01-01T00:00:00Z", null, "Intake");
  const t2 = makeTicket("b", "urgent", "2026-01-02T00:00:00Z", null, "Crisis");
  const t3 = makeTicket("c", "low", "2026-01-03T00:00:00Z", null, "Housing");
  const t4 = makeTicket(
    "d",
    "high",
    "2026-01-04T00:00:00Z",
    "2026-01-10T00:00:00Z",
    "Crisis",
  );

  it("sorts by date descending (most recent first)", () => {
    const result = sortTickets([t1, t2, t3, t4], {
      field: "date",
      direction: "desc",
    });
    expect(result.map((t) => t.id)).toEqual(["d", "c", "b", "a"]);
  });

  it("sorts by date ascending (oldest first)", () => {
    const result = sortTickets([t1, t2, t3, t4], {
      field: "date",
      direction: "asc",
    });
    expect(result.map((t) => t.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("sorts by priority descending (urgent first)", () => {
    const result = sortTickets([t1, t2, t3, t4], {
      field: "priority",
      direction: "desc",
    });
    // desc = highest priority first: urgent(b), high(d), normal(a), low(c)
    expect(result.map((t) => t.id)).toEqual(["b", "d", "a", "c"]);
  });

  it("sorts by priority ascending (low first)", () => {
    const result = sortTickets([t1, t2, t3, t4], {
      field: "priority",
      direction: "asc",
    });
    // asc = lowest priority first: low(c), normal(a), high(d), urgent(b)
    expect(result.map((t) => t.id)).toEqual(["c", "a", "d", "b"]);
  });

  it("sorts by last_activity, falling back to createdAt", () => {
    const result = sortTickets([t1, t2, t3, t4], {
      field: "last_activity",
      direction: "desc",
    });
    // t4 has lastActivityAt 2026-01-10 (most recent)
    // Others use createdAt: t3=Jan3, t2=Jan2, t1=Jan1
    expect(result.map((t) => t.id)).toEqual(["d", "c", "b", "a"]);
  });

  it("returns new array without mutating input", () => {
    const input = [t1, t2, t3];
    const result = sortTickets(input, { field: "date", direction: "asc" });
    expect(result).not.toBe(input);
    expect(input.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });

  it("handles empty array", () => {
    const result = sortTickets([], { field: "date", direction: "desc" });
    expect(result).toEqual([]);
  });

  it("sorts by queue name alphabetically", () => {
    const result = sortTickets([t1, t2, t3, t4], {
      field: "queue",
      direction: "asc",
    });
    // asc alphabetical: Crisis(b), Crisis(d), Housing(c), Intake(a)
    expect(result.map((t) => t.id)).toEqual(["b", "d", "c", "a"]);
  });

  it("uses id as stable tiebreaker", () => {
    const ta = makeTicket("z", "normal", "2026-01-01T00:00:00Z");
    const tb = makeTicket("a", "normal", "2026-01-01T00:00:00Z");
    const result = sortTickets([ta, tb], {
      field: "date",
      direction: "asc",
    });
    expect(result.map((t) => t.id)).toEqual(["a", "z"]);
  });
});

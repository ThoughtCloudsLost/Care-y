import { describe, it, expect } from "vitest";
import { sortTickets, type SortableTicket } from "./sort-tickets.js";

function makeTicket(
  id: string,
  priority: string,
  createdAt: string,
  lastActivityAt: string | null = null,
  queueSortOrder = 1,
): SortableTicket {
  return { id, priority, createdAt, lastActivityAt, queueSortOrder };
}

describe("sortTickets", () => {
  const t1 = makeTicket("a", "normal", "2026-01-01T00:00:00Z", null, 3);
  const t2 = makeTicket("b", "urgent", "2026-01-02T00:00:00Z", null, 1);
  const t3 = makeTicket("c", "low", "2026-01-03T00:00:00Z", null, 2);
  const t4 = makeTicket(
    "d",
    "high",
    "2026-01-04T00:00:00Z",
    "2026-01-10T00:00:00Z",
    1,
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

  it("sorts by queue sort order (numeric)", () => {
    const result = sortTickets([t1, t2, t3, t4], {
      field: "queue",
      direction: "asc",
    });
    // asc by sortOrder: 1(b), 1(d), 2(c), 3(a). Tiebreaker by id: b < d
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

  describe("missing optional fields sort last", () => {
    it("msgs sort: missing followUpCount sorts last regardless of direction", () => {
      const withCount = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        followUpCount: 5,
      };
      const noCount = makeTicket("b", "normal", "2026-01-02T00:00:00Z");

      const asc = sortTickets([noCount, withCount], {
        field: "msgs",
        direction: "asc",
      });
      expect(asc.map((t) => t.id)).toEqual(["a", "b"]);

      const desc = sortTickets([noCount, withCount], {
        field: "msgs",
        direction: "desc",
      });
      expect(desc.map((t) => t.id)).toEqual(["a", "b"]);
    });

    it("msgs sort: all-missing tickets preserve id tiebreaker", () => {
      const noA = makeTicket("z", "normal", "2026-01-01T00:00:00Z");
      const noB = makeTicket("a", "normal", "2026-01-02T00:00:00Z");
      const result = sortTickets([noA, noB], {
        field: "msgs",
        direction: "asc",
      });
      expect(result.map((t) => t.id)).toEqual(["a", "z"]);
    });

    it("msgs sort: mixed present and missing with multiple tickets", () => {
      const has10 = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        followUpCount: 10,
      };
      const none = makeTicket("b", "normal", "2026-01-02T00:00:00Z");
      const has3 = {
        ...makeTicket("c", "normal", "2026-01-03T00:00:00Z"),
        followUpCount: 3,
      };

      const asc = sortTickets([has10, none, has3], {
        field: "msgs",
        direction: "asc",
      });
      expect(asc.map((t) => t.id)).toEqual(["c", "a", "b"]);

      const desc = sortTickets([has10, none, has3], {
        field: "msgs",
        direction: "desc",
      });
      expect(desc.map((t) => t.id)).toEqual(["a", "c", "b"]);
    });
  });

  describe("status sort", () => {
    it("sorts by status rank ascending (new first)", () => {
      const s1 = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        displayStatus: "closed",
      };
      const s2 = {
        ...makeTicket("b", "normal", "2026-01-02T00:00:00Z"),
        displayStatus: "new",
      };
      const s3 = {
        ...makeTicket("c", "normal", "2026-01-03T00:00:00Z"),
        displayStatus: "active",
      };
      const s4 = {
        ...makeTicket("d", "normal", "2026-01-04T00:00:00Z"),
        displayStatus: "hold",
      };

      const result = sortTickets([s1, s2, s3, s4], {
        field: "status",
        direction: "asc",
      });
      expect(result.map((t) => t.id)).toEqual(["b", "c", "d", "a"]);
    });

    it("sorts by status rank descending (closed first)", () => {
      const s1 = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        displayStatus: "new",
      };
      const s2 = {
        ...makeTicket("b", "normal", "2026-01-02T00:00:00Z"),
        displayStatus: "closed",
      };

      const result = sortTickets([s1, s2], {
        field: "status",
        direction: "desc",
      });
      expect(result.map((t) => t.id)).toEqual(["b", "a"]);
    });

    it("ranks unknown statuses after closed", () => {
      const known = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        displayStatus: "closed",
      };
      const unknown = {
        ...makeTicket("b", "normal", "2026-01-02T00:00:00Z"),
        displayStatus: "archived",
      };

      const result = sortTickets([unknown, known], {
        field: "status",
        direction: "asc",
      });
      expect(result.map((t) => t.id)).toEqual(["a", "b"]);
    });
  });

  describe("client sort", () => {
    it("sorts by clientAlias alphabetically", () => {
      const c1 = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        clientAlias: "Zebra",
      };
      const c2 = {
        ...makeTicket("b", "normal", "2026-01-02T00:00:00Z"),
        clientAlias: "Alpha",
      };
      const c3 = {
        ...makeTicket("c", "normal", "2026-01-03T00:00:00Z"),
        clientAlias: "Mango",
      };

      const asc = sortTickets([c1, c2, c3], {
        field: "client",
        direction: "asc",
      });
      expect(asc.map((t) => t.id)).toEqual(["b", "c", "a"]);

      const desc = sortTickets([c1, c2, c3], {
        field: "client",
        direction: "desc",
      });
      expect(desc.map((t) => t.id)).toEqual(["a", "c", "b"]);
    });

    // Pending-decrypt: null coerces to "" and sorts first in ascending
    // order, surfacing undecryptable rows rather than hiding them.
    it("sorts null clientAlias first (pending-decrypt convention)", () => {
      const present = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        clientAlias: "Beta",
      };
      const missing = {
        ...makeTicket("b", "normal", "2026-01-02T00:00:00Z"),
        clientAlias: null,
      };

      const asc = sortTickets([present, missing], {
        field: "client",
        direction: "asc",
      });
      expect(asc.map((t) => t.id)).toEqual(["b", "a"]);
    });
  });

  describe("title sort", () => {
    it("sorts by title alphabetically", () => {
      const t1x = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        title: "Zulu",
      };
      const t2x = {
        ...makeTicket("b", "normal", "2026-01-02T00:00:00Z"),
        title: "Alpha",
      };

      const asc = sortTickets([t1x, t2x], { field: "title", direction: "asc" });
      expect(asc.map((t) => t.id)).toEqual(["b", "a"]);
    });

    // Pending-decrypt: null coerces to "" and sorts first in ascending
    // order, surfacing undecryptable rows rather than hiding them.
    it("sorts null title first (pending-decrypt convention)", () => {
      const present = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        title: "Hello",
      };
      const missing = {
        ...makeTicket("b", "normal", "2026-01-02T00:00:00Z"),
        title: null,
      };

      const asc = sortTickets([present, missing], {
        field: "title",
        direction: "asc",
      });
      expect(asc.map((t) => t.id)).toEqual(["b", "a"]);
    });
  });

  describe("assignee sort", () => {
    it("sorts by assigneeName alphabetically", () => {
      const a1 = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        assigneeName: "Zara",
      };
      const a2 = {
        ...makeTicket("b", "normal", "2026-01-02T00:00:00Z"),
        assigneeName: "Amy",
      };

      const asc = sortTickets([a1, a2], {
        field: "assignee",
        direction: "asc",
      });
      expect(asc.map((t) => t.id)).toEqual(["b", "a"]);
    });

    it("sorts null assigneeName last regardless of direction", () => {
      const assigned = {
        ...makeTicket("a", "normal", "2026-01-01T00:00:00Z"),
        assigneeName: "Amy",
      };
      const unassigned = {
        ...makeTicket("b", "normal", "2026-01-02T00:00:00Z"),
        assigneeName: null,
      };

      const asc = sortTickets([unassigned, assigned], {
        field: "assignee",
        direction: "asc",
      });
      expect(asc.map((t) => t.id)).toEqual(["a", "b"]);

      const desc = sortTickets([unassigned, assigned], {
        field: "assignee",
        direction: "desc",
      });
      expect(desc.map((t) => t.id)).toEqual(["a", "b"]);
    });

    it("sorts two null assignees by id tiebreaker", () => {
      const u1 = {
        ...makeTicket("z", "normal", "2026-01-01T00:00:00Z"),
        assigneeName: null,
      };
      const u2 = {
        ...makeTicket("a", "normal", "2026-01-02T00:00:00Z"),
        assigneeName: null,
      };

      const result = sortTickets([u1, u2], {
        field: "assignee",
        direction: "asc",
      });
      expect(result.map((t) => t.id)).toEqual(["a", "z"]);
    });
  });

  describe("Date types", () => {
    it("accepts Date objects for createdAt and lastActivityAt", () => {
      const d1 = {
        id: "a",
        priority: "normal",
        createdAt: new Date("2026-01-01T00:00:00Z"),
        lastActivityAt: null,
        queueSortOrder: 1,
      };
      const d2 = {
        id: "b",
        priority: "normal",
        createdAt: new Date("2026-01-02T00:00:00Z"),
        lastActivityAt: new Date("2026-01-10T00:00:00Z"),
        queueSortOrder: 1,
      };

      const byDate = sortTickets([d2, d1], { field: "date", direction: "asc" });
      expect(byDate.map((t) => t.id)).toEqual(["a", "b"]);

      const byActivity = sortTickets([d1, d2], {
        field: "last_activity",
        direction: "desc",
      });
      expect(byActivity.map((t) => t.id)).toEqual(["b", "a"]);
    });
  });

  it("queue sort uses queueSortOrder, not queue names", () => {
    const q1 = {
      ...makeTicket("a", "normal", "2026-01-01T00:00:00Z", null, 3),
      clientAlias: "AAA",
    };
    const q2 = {
      ...makeTicket("b", "normal", "2026-01-02T00:00:00Z", null, 1),
      clientAlias: "ZZZ",
    };

    const result = sortTickets([q1, q2], { field: "queue", direction: "asc" });
    expect(result.map((t) => t.id)).toEqual(["b", "a"]);
  });
});

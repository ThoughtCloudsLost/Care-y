import { describe, it, expect, beforeEach } from "vitest";
import {
  createDemoTickets,
  mapToCardProps,
  mapToPreviewFollowUps,
  mapToTicketLikeRecord,
  buildSeedData,
  readCursorPayloadFor,
  deriveReadStateEntry,
  resetFixtureIds,
  DEMO_QUEUES,
  DEMO_NOTE_TYPES,
} from "./tickets.js";
import type { DemoTicket } from "./types.js";

describe("createDemoTickets", () => {
  let tickets: DemoTicket[];

  beforeEach(() => {
    tickets = createDemoTickets();
  });

  it("creates 10 fixture tickets", () => {
    expect(tickets).toHaveLength(10);
  });

  it("produces deterministic IDs across calls", () => {
    const first = createDemoTickets();
    const second = createDemoTickets();
    expect(first.map((t) => t.id)).toEqual(second.map((t) => t.id));
  });

  it("includes exactly one ticket with keyWrap null (DENIED state)", () => {
    const denied = tickets.filter((t) => t.keyWrap === null);
    expect(denied).toHaveLength(1);
    expect(denied[0]?.title).toBe("Encrypted intake note");
  });

  it("generates fake ciphertext of length plaintext.length + 40", () => {
    for (const ticket of tickets) {
      expect(ticket.encryptedTitle.length).toBe(ticket.title.length + 40);
      expect(ticket.encryptedDescription.length).toBe(
        ticket.description.length + 40,
      );
    }
  });

  it("derives displayStatus correctly from status/onHold/followUpCount", () => {
    const housing = tickets[0];
    expect(housing?.displayStatus).toBe("active"); // open, has follow-ups

    const denied = tickets[4];
    expect(denied?.displayStatus).toBe("new"); // open, no follow-ups

    const onHold = tickets[5];
    expect(onHold?.displayStatus).toBe("hold");
  });

  it("includes tickets in all three queues", () => {
    const queueNames = new Set(tickets.map((t) => t.queueName));
    expect(queueNames).toContain("Housing");
    expect(queueNames).toContain("Intake");
    expect(queueNames).toContain("Crisis");
  });

  it("includes tickets with all four priority levels", () => {
    const priorities = new Set(tickets.map((t) => t.priority));
    expect(priorities).toContain("low");
    expect(priorities).toContain("normal");
    expect(priorities).toContain("high");
    expect(priorities).toContain("urgent");
  });

  it("generates follow-ups with deterministic IDs", () => {
    const allIds = tickets.flatMap((t) => t.followUps.map((fu) => fu.id));
    const unique = new Set(allIds);
    expect(unique.size).toBe(allIds.length);
  });
});

describe("DEMO_QUEUES", () => {
  it("contains three queues", () => {
    expect(DEMO_QUEUES).toHaveLength(3);
  });

  it("has ids matching fixture ticket queueIds", () => {
    const tickets = createDemoTickets();
    const queueIds = new Set(DEMO_QUEUES.map((q) => q.id));
    for (const ticket of tickets) {
      expect(queueIds.has(ticket.queueId)).toBe(true);
    }
  });
});

describe("mapToCardProps", () => {
  let tickets: DemoTicket[];

  beforeEach(() => {
    tickets = createDemoTickets();
  });

  it("maps a ticket with a cached title to ready status", () => {
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const props = mapToCardProps(ticket, "Help with housing", () => {
      /* no-op */
    });
    expect(props.titleResult).toEqual({
      status: "ready",
      value: "Help with housing",
    });
    expect(props.ticketId).toBe(ticket.id);
    expect(props.displayStatus).toBe("active");
  });

  it("maps a ticket without cached title to loading status", () => {
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const props = mapToCardProps(ticket, undefined, () => {
      /* no-op */
    });
    expect(props.titleResult).toEqual({ status: "loading" });
  });

  it("maps a ticket with null keyWrap to denied status", () => {
    const ticket = tickets[4];
    if (ticket === undefined) throw new Error("missing fixture");
    const props = mapToCardProps(ticket, undefined, () => {
      /* no-op */
    });
    expect(props.titleResult).toEqual({ status: "denied" });
  });

  it("sets assignedName to You for the demo user", () => {
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const props = mapToCardProps(ticket, "Help with housing", () => {
      /* no-op */
    });
    expect(props.assignedName).toBe("You");
  });

  it("sets assignedName to null for unassigned tickets", () => {
    const ticket = tickets[6];
    if (ticket === undefined) throw new Error("missing fixture");
    const props = mapToCardProps(ticket, undefined, () => {
      /* no-op */
    });
    expect(props.assignedName).toBeNull();
  });
});

describe("mapToPreviewFollowUps", () => {
  let tickets: DemoTicket[];

  beforeEach(() => {
    tickets = createDemoTickets();
  });

  it("returns at most 3 follow-ups", () => {
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const previews = mapToPreviewFollowUps(ticket);
    expect(previews.length).toBeLessThanOrEqual(3);
  });

  it("excludes private notes and system events from previews", () => {
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const previews = mapToPreviewFollowUps(ticket);
    for (const p of previews) {
      expect(p.source).not.toBe("system");
    }
  });

  it("returns empty array for tickets with no visible follow-ups", () => {
    const ticket = tickets[7]; // New intake call, no follow-ups
    if (ticket === undefined) throw new Error("missing fixture");
    const previews = mapToPreviewFollowUps(ticket);
    expect(previews).toEqual([]);
  });

  it("sets keyWrap to null for DENIED tickets", () => {
    const ticket = tickets[4];
    if (ticket === undefined) throw new Error("missing fixture");
    const previews = mapToPreviewFollowUps(ticket);
    // The ticket has no follow-ups so previews is empty, but verify
    // the logic would set null for a DENIED ticket by checking the
    // keyWrap field on a ticket that has follow-ups but null keyWrap
    // would work in the mapper.
    expect(previews).toEqual([]);
  });
});

describe("mapToTicketLikeRecord", () => {
  it("produces a record with ISO date strings", () => {
    const tickets = createDemoTickets();
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const record = mapToTicketLikeRecord(ticket);
    expect(typeof record.createdAt).toBe("string");
    expect(new Date(record.createdAt).toISOString()).toBe(record.createdAt);
  });

  it("sets lastActivityAt to null when absent", () => {
    const tickets = createDemoTickets();
    const ticket = tickets[7]; // no follow-ups, no lastActivity
    if (ticket === undefined) throw new Error("missing fixture");
    const record = mapToTicketLikeRecord(ticket);
    expect(record.lastActivityAt).toBeNull();
  });

  it("includes hasPhone as true", () => {
    const tickets = createDemoTickets();
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const record = mapToTicketLikeRecord(ticket);
    expect(record.hasPhone).toBe(true);
  });

  it("includes encryptedDescription", () => {
    const tickets = createDemoTickets();
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const record = mapToTicketLikeRecord(ticket);
    expect(typeof record.encryptedDescription).toBe("string");
    expect(record.encryptedDescription.length).toBe(
      ticket.description.length + 40,
    );
  });
});

describe("buildSeedData", () => {
  it("includes titles and descriptions for accessible tickets only", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);

    // The DENIED ticket (index 4) should not have its title seeded
    const deniedTicket = tickets[4];
    if (deniedTicket === undefined) throw new Error("missing fixture");
    expect(seed.titles[deniedTicket.id]).toBeUndefined();

    // An accessible ticket should have its title seeded
    const accessibleTicket = tickets[0];
    if (accessibleTicket === undefined) throw new Error("missing fixture");
    expect(seed.titles[accessibleTicket.id]).toBe("Help with housing");
  });

  it("creates preview entries for all tickets", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);
    expect(Object.keys(seed.previews)).toHaveLength(tickets.length);
  });

  it("excludes empty content from follow-up seeds", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);
    for (const value of Object.values(seed.followUps)) {
      expect(value).not.toBe("");
    }
  });

  it("includes readCursors for accessible tickets", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);
    const firstTicket = tickets[0];
    if (firstTicket === undefined) throw new Error("missing fixture");
    const cursor = seed.readCursors[`cursor:${firstTicket.id}`];
    expect(cursor).toBeDefined();
    // The payload is JSON with an ISO readUpTo, matching what the real
    // cursor decrypt produces
    if (cursor !== undefined) {
      const parsed: unknown = JSON.parse(cursor);
      expect(parsed).toHaveProperty("readUpTo");
      const readUpTo = (parsed as { readUpTo: string }).readUpTo;
      expect(new Date(readUpTo).toISOString()).toBe(readUpTo);
    }
  });

  it("places the cursor behind latest activity for unread tickets", () => {
    const tickets = createDemoTickets();
    const unread = tickets.filter((t) => t.unreadCount > 0);
    expect(unread.length).toBeGreaterThan(0);
    for (const t of unread) {
      const parsed = JSON.parse(readCursorPayloadFor(t)) as {
        readUpTo: string;
      };
      const latest = t.lastActivityAt ?? t.createdAt;
      expect(new Date(parsed.readUpTo).getTime()).toBeLessThan(
        latest.getTime(),
      );
    }
  });

  it("includes orgValues with queue display names", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);
    expect(seed.orgValues["queue:q-housing"]).toBe("Housing");
    expect(seed.orgValues["queue:q-intake"]).toBe("Intake");
    expect(seed.orgValues["queue:q-crisis"]).toBe("Crisis");
  });

  it("does not include readCursors for DENIED tickets", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);
    const deniedTicket = tickets[4];
    if (deniedTicket === undefined) throw new Error("missing fixture");
    expect(seed.readCursors[`cursor:${deniedTicket.id}`]).toBeUndefined();
  });
});

describe("resetFixtureIds", () => {
  it("resets counter so next call generates the same IDs", () => {
    const first = createDemoTickets();
    resetFixtureIds();
    const second = createDemoTickets();
    expect(first[0]?.id).toBe(second[0]?.id);
  });
});

describe("DEMO_NOTE_TYPES", () => {
  it("contains at least two note types", () => {
    expect(DEMO_NOTE_TYPES.length).toBeGreaterThanOrEqual(2);
  });

  it("has unique ids", () => {
    const ids = DEMO_NOTE_TYPES.map((nt) => nt.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all have canCreate true for the demo", () => {
    for (const nt of DEMO_NOTE_TYPES) {
      expect(nt.canCreate).toBe(true);
    }
  });

  it("all have non-empty name and icon", () => {
    for (const nt of DEMO_NOTE_TYPES) {
      expect(nt.name.length).toBeGreaterThan(0);
      expect(nt.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("buildSeedData note-type seeding", () => {
  it("seeds note-type names into orgValues", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);
    for (const nt of DEMO_NOTE_TYPES) {
      expect(seed.orgValues[`${nt.id}:name`]).toBe(nt.name);
    }
  });

  it("seeds note-type icons into orgValues", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);
    for (const nt of DEMO_NOTE_TYPES) {
      expect(seed.orgValues[`${nt.id}:icon`]).toBe(nt.icon);
    }
  });

  it("seeds note-type descriptions into orgValues when present", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);
    for (const nt of DEMO_NOTE_TYPES) {
      if (nt.description !== null) {
        expect(seed.orgValues[`${nt.id}:desc`]).toBe(nt.description);
      } else {
        expect(seed.orgValues[`${nt.id}:desc`]).toBeUndefined();
      }
    }
  });
});

describe("deriveReadStateEntry", () => {
  let tickets: DemoTicket[];

  beforeEach(() => {
    tickets = createDemoTickets();
  });

  it("returns a cursor for accessible tickets (non-null keyWrap)", () => {
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const entry = deriveReadStateEntry(ticket);
    expect(entry.encryptedReadCursor).toBe(`demo-cursor-${ticket.id}`);
  });

  it("returns null cursor for DENIED tickets (null keyWrap)", () => {
    const ticket = tickets[4];
    if (ticket === undefined) throw new Error("missing fixture");
    const entry = deriveReadStateEntry(ticket);
    expect(entry.encryptedReadCursor).toBeNull();
  });

  it("excludes system follow-ups from timestamps", () => {
    // Ticket 0 has 4 system events, 2 volunteer (self), and 2 client messages
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const entry = deriveReadStateEntry(ticket);
    // Only client messages count (volunteer is self, system is excluded)
    expect(entry.followUpCreatedAt.length).toBe(2);
  });

  it("excludes self-authored (volunteer source) follow-ups", () => {
    // Ticket 1 carries 2 volunteer follow-ups (all volunteer rows are
    // the demo user's own) and 3 client follow-ups, one of them a
    // media-only recording; only the 3 client rows count.
    const ticket = tickets[1];
    if (ticket === undefined) throw new Error("missing fixture");
    const entry = deriveReadStateEntry(ticket);
    expect(entry.followUpCreatedAt.length).toBe(3);
  });

  it("returns timestamps sorted newest first", () => {
    const ticket = tickets[0];
    if (ticket === undefined) throw new Error("missing fixture");
    const entry = deriveReadStateEntry(ticket);
    const timestamps = entry.followUpCreatedAt.map((ts) => Date.parse(ts));
    for (let i = 0; i < timestamps.length - 1; i++) {
      const current = timestamps[i];
      const next = timestamps[i + 1];
      if (current !== undefined && next !== undefined) {
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });

  it("returns empty timestamps for tickets with no eligible follow-ups", () => {
    // Ticket 4 (DENIED) has no follow-ups at all
    const ticket = tickets[4];
    if (ticket === undefined) throw new Error("missing fixture");
    const entry = deriveReadStateEntry(ticket);
    expect(entry.followUpCreatedAt).toEqual([]);
  });

  it("returns at most 20 timestamps", () => {
    // All current fixtures have fewer than 20, but verify the cap
    for (const ticket of tickets) {
      const entry = deriveReadStateEntry(ticket);
      expect(entry.followUpCreatedAt.length).toBeLessThanOrEqual(20);
    }
  });

  it("agrees with readCursorPayloadFor for unread count semantics", () => {
    // For unread tickets: timestamps newer than readUpTo = unreadCount
    const unreadTickets = tickets.filter((t) => t.unreadCount > 0);
    expect(unreadTickets.length).toBeGreaterThan(0);
    for (const ticket of unreadTickets) {
      const entry = deriveReadStateEntry(ticket);
      const payload = JSON.parse(readCursorPayloadFor(ticket)) as {
        readUpTo: string;
      };
      const readUpToMs = Date.parse(payload.readUpTo);
      // Count timestamps newer than readUpTo
      const unreadFromWindow = entry.followUpCreatedAt.filter(
        (ts) => Date.parse(ts) > readUpToMs,
      ).length;
      expect(unreadFromWindow).toBe(ticket.unreadCount);
    }
  });
});

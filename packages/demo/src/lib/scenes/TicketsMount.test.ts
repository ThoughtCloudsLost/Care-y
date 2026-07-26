/**
 * Tests for the tickets mount scene and registry wiring.
 *
 * Validates: registry maps tickets to the mount component, search
 * stays null, getSceneComponent returns correct values, and fixture
 * seeding round-trips through the stub caches.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createDemoTickets,
  buildSeedData,
  mapToCardProps,
} from "../fixtures/tickets.js";
import type { DemoTicket } from "../fixtures/types.js";
import {
  demoSeed,
  demoReset,
  getTicketDecryptCache,
} from "$lib/crypto/context";
import { scenes, getSceneComponent } from "./index.js";

// ---------------------------------------------------------------------------
// Registry shape
// ---------------------------------------------------------------------------

describe("scene registry", () => {
  it("tickets entry has a non-null component", () => {
    expect(scenes.tickets.component).not.toBeNull();
    expect(scenes.tickets.label).toBe("Tickets");
  });

  it("search entry has null component (shell overlay)", () => {
    expect(scenes.search.component).toBeNull();
    expect(scenes.search.label).toBe("Search");
  });

  it("getSceneComponent returns the tickets component", () => {
    const comp = getSceneComponent("tickets");
    expect(comp).toBe(scenes.tickets.component);
  });

  it("getSceneComponent returns null for search", () => {
    expect(getSceneComponent("search")).toBeNull();
  });

  it("getSceneComponent returns null for null feature", () => {
    expect(getSceneComponent(null)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Fixture seeding round-trip
// ---------------------------------------------------------------------------

describe("fixture seeding for real routes", () => {
  let tickets: DemoTicket[];

  beforeEach(() => {
    demoReset();
    tickets = createDemoTickets();
  });

  afterEach(() => {
    demoReset();
  });

  it("buildSeedData produces titles for all non-DENIED tickets", () => {
    const seed = buildSeedData(tickets);
    const accessibleTickets = tickets.filter((t) => t.keyWrap !== null);
    expect(Object.keys(seed.titles).length).toBe(accessibleTickets.length);
  });

  it("seeding titles makes them available through ticketCache", () => {
    const seed = buildSeedData(tickets);
    demoSeed({ titles: seed.titles });

    const ticketCache = getTicketDecryptCache();
    const ticket = tickets[0]!;
    expect(ticketCache.get(ticket.id)).toBe(ticket.title);
  });

  it("seeding follow-ups populates the decrypt cache", () => {
    const seed = buildSeedData(tickets);
    demoSeed({ followUps: seed.followUps });

    const ticketCache = getTicketDecryptCache();
    const ticket = tickets[0]!;
    const fu = ticket.followUps.find(
      (f) => f.source !== "system" && f.content !== "",
    );
    expect(fu).toBeDefined();
    const key = `fu:${ticket.id}:${fu!.id}`;
    expect(ticketCache.get(key)).toBe(fu!.content);
  });

  it("demoReset clears all caches", () => {
    const seed = buildSeedData(tickets);
    demoSeed({ titles: seed.titles, followUps: seed.followUps });

    const ticketCache = getTicketDecryptCache();
    expect(ticketCache.size).toBeGreaterThan(0);

    demoReset();
    expect(ticketCache.size).toBe(0);
  });

  it("DENIED ticket renders with titleResult.status = denied", () => {
    const denied = tickets[4]!;
    const props = mapToCardProps(denied, undefined, () => {
      /* no-op */
    });
    expect(props.titleResult.status).toBe("denied");
  });
});

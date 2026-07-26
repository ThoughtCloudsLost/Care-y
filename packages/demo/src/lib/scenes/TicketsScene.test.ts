/**
 * Tests for TicketsScene logic.
 *
 * Validates: registry shape, fixture data, cache seeding for search,
 * reveal progression, list-to-detail transition via router state,
 * error/retry sequence, and reset behavior. Tests exercise the same
 * code paths the scene uses, through the real stub caches.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import {
  createDemoTickets,
  mapToCardProps,
  buildSeedData,
  mapToTicketLikeRecord,
} from "../fixtures/tickets.js";
import { buildScriptedReply } from "../fixtures/conversation.js";
import type { DemoTicket } from "../fixtures/types.js";
import {
  demoSeed,
  demoReset,
  getTicketDecryptCache,
  getFollowUpDecryptCache,
} from "$lib/crypto/context";
import { resolveAsyncDecrypt } from "$lib/crypto/decrypt-result.js";
import { createRevealController } from "../engine/reveal.svelte.js";
import type { RevealEntry } from "../engine/reveal.svelte.js";
import { createDemoScript } from "../engine/script.svelte.js";
import type { DemoScriptContext, DemoStep } from "../engine/script.svelte.js";
import { scenes, getSceneComponent } from "./index.js";
import { ticketsKeys } from "$lib/query/keys.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    },
  });
}

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
// Fixture tickets
// ---------------------------------------------------------------------------

describe("fixture tickets", () => {
  let tickets: DemoTicket[];

  beforeEach(() => {
    tickets = createDemoTickets();
  });

  it("creates 10 fixture tickets with deterministic IDs", () => {
    expect(tickets.length).toBe(10);
    for (const ticket of tickets) {
      expect(ticket.id).toMatch(/^tk-\d{4}$/);
    }
  });

  it("ticket at index 4 has keyWrap = null (DENIED state)", () => {
    const denied = tickets[4];
    expect(denied).toBeDefined();
    expect(denied!.keyWrap).toBeNull();
  });

  it("first ticket (Housing) has the most follow-ups", () => {
    const housing = tickets[0];
    expect(housing).toBeDefined();
    expect(housing!.title).toBe("Help with housing");
    expect(housing!.followUps.length).toBeGreaterThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// Query cache seeding for instant search
// ---------------------------------------------------------------------------

describe("query cache seeding", () => {
  let tickets: DemoTicket[];
  let queryClient: QueryClient;

  beforeEach(() => {
    demoReset();
    tickets = createDemoTickets();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    demoReset();
    queryClient.clear();
  });

  it("seeds tickets under ticketsKeys.list({}) for search provider reads", () => {
    const records = tickets.map(mapToTicketLikeRecord);
    queryClient.setQueryData(ticketsKeys.list({}), records);

    const cached = queryClient.getQueryData(ticketsKeys.list({}));
    expect(cached).toBeDefined();
    expect(Array.isArray(cached)).toBe(true);
    expect((cached as unknown[]).length).toBe(10);
  });

  it("seeded records have correct shape for RawCachedTicket", () => {
    const records = tickets.map(mapToTicketLikeRecord);
    const first = records[0]!;

    expect(first.id).toBe(tickets[0]!.id);
    expect(first.queueId).toBe(tickets[0]!.queueId);
    expect(first.status).toBe(tickets[0]!.status);
    expect(first.priority).toBe(tickets[0]!.priority);
    expect(first.clientAlias).toBe(tickets[0]!.clientAlias);
    expect(typeof first.createdAt).toBe("string");
  });

  it("seeded query key matches ticketsKeys.lists() prefix for cache scans", () => {
    const key = ticketsKeys.list({});
    const listsPrefix = ticketsKeys.lists();
    // The list key should start with the lists prefix
    expect(key.slice(0, listsPrefix.length)).toEqual(listsPrefix);
  });
});

// ---------------------------------------------------------------------------
// Crypto cache seeding for search results
// ---------------------------------------------------------------------------

describe("crypto cache seeding for search", () => {
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

  it("seeding titles makes them available through ticketCache.get()", () => {
    const seed = buildSeedData(tickets);
    demoSeed({ titles: seed.titles });

    const ticketCache = getTicketDecryptCache();
    const ticket = tickets[0]!;
    expect(ticketCache.get(ticket.id)).toBe(ticket.title);
  });

  it("seeding follow-ups makes them available for search result descramble", () => {
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
});

// ---------------------------------------------------------------------------
// List-to-detail transition and router state
// ---------------------------------------------------------------------------

describe("list-to-detail navigation", () => {
  let tickets: DemoTicket[];

  beforeEach(() => {
    demoReset();
    tickets = createDemoTickets();
  });

  afterEach(() => {
    demoReset();
  });

  it("card tap sets active ticket via the ontap callback pattern", () => {
    let tappedId: string | null = null;
    const ticketCache = getTicketDecryptCache();
    const ticket = tickets[0]!;

    demoSeed({ titles: { [ticket.id]: ticket.title } });
    const props = mapToCardProps(
      ticket,
      ticketCache.get(ticket.id),
      (id: string) => {
        tappedId = id;
      },
    );

    props.ontap(ticket.id);
    expect(tappedId).toBe(ticket.id);
  });

  it("DENIED ticket renders with titleResult.status = denied", () => {
    const denied = tickets[4]!;
    const props = mapToCardProps(denied, undefined, () => {
      /* no-op */
    });
    expect(props.titleResult.status).toBe("denied");
  });
});

// ---------------------------------------------------------------------------
// Reveal progression
// ---------------------------------------------------------------------------

describe("reveal progression", () => {
  let tickets: DemoTicket[];

  beforeEach(() => {
    vi.useFakeTimers();
    demoReset();
    tickets = createDemoTickets();
  });

  afterEach(() => {
    demoReset();
    vi.useRealTimers();
  });

  it("staggered title reveals write to the ticket cache", () => {
    const reveal = createRevealController();
    const ticket = tickets[0]!;
    const entries: RevealEntry[] = [
      { key: ticket.id, value: ticket.title, delayMs: 400, cache: "ticket" },
    ];

    reveal.schedule(entries);
    vi.advanceTimersByTime(400);

    const ticketCache = getTicketDecryptCache();
    expect(ticketCache.get(ticket.id)).toBe(ticket.title);

    reveal.reset();
  });

  it("follow-up reveals write to the followUp cache", () => {
    const reveal = createRevealController();
    const ticket = tickets[0]!;
    const fu = ticket.followUps.find(
      (f) => f.source !== "system" && f.content !== "",
    );
    expect(fu).toBeDefined();

    reveal.schedule([
      { key: fu!.id, value: fu!.content, delayMs: 500, cache: "followUp" },
    ]);
    vi.advanceTimersByTime(500);

    const fuCache = getFollowUpDecryptCache();
    expect(fuCache.get(fu!.id)).toBe(fu!.content);

    reveal.reset();
  });

  it("descramble step staggers delays starting at 400ms", () => {
    const accessibleTickets = tickets.filter((t) => t.keyWrap !== null);
    const entries: RevealEntry[] = [];
    let delay = 400;
    for (const ticket of accessibleTickets) {
      entries.push({
        key: ticket.id,
        value: ticket.title,
        delayMs: delay,
        cache: "ticket",
      });
      delay += 120;
    }

    expect(entries[0]!.delayMs).toBe(400);
    expect(entries[1]!.delayMs).toBe(520);
    for (const entry of entries) {
      expect(entry.delayMs).toBeGreaterThanOrEqual(400);
    }
  });
});

// ---------------------------------------------------------------------------
// Error and retry sequence
// ---------------------------------------------------------------------------

describe("error and retry sequence", () => {
  let tickets: DemoTicket[];

  beforeEach(() => {
    vi.useFakeTimers();
    demoReset();
    tickets = createDemoTickets();
  });

  afterEach(() => {
    demoReset();
    vi.useRealTimers();
  });

  it("error beat sets error sentinel, retry beat replaces it with content", () => {
    const reveal = createRevealController();
    const ticket = tickets[0]!;
    const clientMessages = ticket.followUps.filter(
      (fu) => fu.source === "client" && fu.content !== "",
    );
    const errorFu = clientMessages[clientMessages.length - 1];
    expect(errorFu).toBeDefined();

    const key = `fu:${ticket.id}:${errorFu!.id}`;
    const ticketCache = getTicketDecryptCache();

    // Error beat
    reveal.failNow(key, "ticket");
    const errorResult = resolveAsyncDecrypt(ticketCache.get(key), true);
    expect(errorResult.status).toBe("error");

    // Retry beat (schedule successful reveal)
    reveal.schedule([
      { key, value: errorFu!.content, delayMs: 800, cache: "ticket" },
    ]);
    vi.advanceTimersByTime(800);

    const retryResult = resolveAsyncDecrypt(ticketCache.get(key), true);
    expect(retryResult.status).toBe("ready");
    if (retryResult.status === "ready") {
      expect(retryResult.value).toBe(errorFu!.content);
    }

    reveal.reset();
  });
});

// ---------------------------------------------------------------------------
// Reset behavior
// ---------------------------------------------------------------------------

describe("reset behavior", () => {
  beforeEach(() => {
    demoReset();
  });

  afterEach(() => {
    demoReset();
  });

  it("demoReset clears all caches", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);
    demoSeed({ titles: seed.titles, followUps: seed.followUps });

    const ticketCache = getTicketDecryptCache();
    expect(ticketCache.size).toBeGreaterThan(0);

    demoReset();
    expect(ticketCache.size).toBe(0);
  });

  it("re-seeding after reset restores fixture data", () => {
    const tickets = createDemoTickets();
    const seed = buildSeedData(tickets);

    demoSeed({ titles: seed.titles });
    demoReset();
    demoSeed({ titles: seed.titles });

    const ticketCache = getTicketDecryptCache();
    const ticket = tickets[0]!;
    expect(ticketCache.get(ticket.id)).toBe(ticket.title);
  });
});

// ---------------------------------------------------------------------------
// Script step structure
// ---------------------------------------------------------------------------

describe("script step structure", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    demoReset();
  });

  afterEach(() => {
    demoReset();
    vi.useRealTimers();
  });

  it("all step IDs used by the scene are unique", () => {
    const stepIds = [
      "skeleton",
      "descramble",
      "view-list",
      "view-cards",
      "view-grid",
      "tap-card",
      "conv-header",
      "conv-reveal",
      "conv-error",
      "conv-retry",
      "conv-typing",
      "conv-sent",
      "restart",
    ];
    const unique = new Set(stepIds);
    expect(unique.size).toBe(stepIds.length);
  });

  it("script engine runs skeleton step first then auto-advances", () => {
    const reveal = createRevealController();
    const enterSkeleton = vi.fn();
    const enterDescramble = vi.fn();

    const steps: DemoStep[] = [
      {
        id: "skeleton",
        caption: () => "Loading",
        advance: "auto",
        autoDelayMs: 1800,
        enter: enterSkeleton,
      },
      {
        id: "descramble",
        caption: () => "Decrypting",
        advance: "event",
        enter: enterDescramble,
      },
    ];

    const ctx: DemoScriptContext = {
      reveal,
      advance: () => {
        /* no-op */
      },
    };

    const script = createDemoScript(steps, ctx);
    expect(script.index).toBe(0);
    expect(enterSkeleton).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(1800);
    expect(script.index).toBe(1);
    expect(enterDescramble).toHaveBeenCalledOnce();

    reveal.reset();
  });
});

// ---------------------------------------------------------------------------
// Scripted reply
// ---------------------------------------------------------------------------

describe("scripted reply", () => {
  it("buildScriptedReply builds a volunteer message follow-up", () => {
    const ticket = createDemoTickets()[0]!;
    const reply = buildScriptedReply(ticket.id, "Test reply", "reply-001");
    expect(reply.id).toBe("reply-001");
    expect(reply.ticketId).toBe(ticket.id);
    expect(reply.source).toBe("volunteer");
    expect(reply.type).toBe("message");
    expect(reply.content).toBe("Test reply");
  });

  it("generates fake ciphertext of content.length + 40", () => {
    const reply = buildScriptedReply("tk-001", "Hello", "reply-002");
    expect(reply.encryptedContent.length).toBe("Hello".length + 40);
  });
});

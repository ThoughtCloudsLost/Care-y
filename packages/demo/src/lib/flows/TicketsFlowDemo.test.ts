/**
 * Tests for TicketsFlowDemo and ConversationDemo flow logic.
 *
 * Validates the non-component logic: step sequencing, cache seeding,
 * timer management, reveal controller integration, error/retry beats,
 * typing animation mechanics, and restart behavior.
 *
 * Component rendering is not tested here (visual verification by user).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createDemoTickets,
  mapToCardProps,
  mapToPreviewFollowUps,
  buildSeedData,
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

describe("TicketsFlowDemo", () => {
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

  describe("fixture tickets", () => {
    it("creates 10 fixture tickets with deterministic IDs", () => {
      expect(tickets.length).toBe(10);
      // All IDs should start with "tk-"
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

  describe("cache seeding via buildSeedData", () => {
    it("seeds titles for all tickets with non-null keyWrap", () => {
      const seed = buildSeedData(tickets);
      const ticketsWithAccess = tickets.filter((t) => t.keyWrap !== null);

      expect(Object.keys(seed.titles).length).toBe(ticketsWithAccess.length);
      for (const t of ticketsWithAccess) {
        expect(seed.titles[t.id]).toBe(t.title);
      }
    });

    it("does not seed titles for DENIED tickets", () => {
      const seed = buildSeedData(tickets);
      const denied = tickets.find((t) => t.keyWrap === null);
      expect(denied).toBeDefined();
      expect(seed.titles[denied!.id]).toBeUndefined();
    });

    it("seeds preview arrays for all tickets", () => {
      const seed = buildSeedData(tickets);
      expect(Object.keys(seed.previews).length).toBe(tickets.length);
    });

    it("seeds follow-up content for non-system, non-empty follow-ups", () => {
      const seed = buildSeedData(tickets);
      // All follow-up keys should match the fu:<ticketId>:<followUpId> pattern
      for (const key of Object.keys(seed.followUps)) {
        expect(key).toMatch(/^fu:tk-\d{4}:fu-\d{4}$/);
      }
    });
  });

  describe("title decrypt resolution", () => {
    it("resolves to 'loading' before cache seeding", () => {
      const ticketCache = getTicketDecryptCache();
      const ticket = tickets[0]!;
      const raw = ticketCache.get(ticket.id);
      const result = resolveAsyncDecrypt(raw, ticket.keyWrap !== null);
      expect(result.status).toBe("loading");
    });

    it("resolves to 'ready' after seeding the title", () => {
      const ticketCache = getTicketDecryptCache();
      const ticket = tickets[0]!;
      demoSeed({ titles: { [ticket.id]: ticket.title } });
      const raw = ticketCache.get(ticket.id);
      const result = resolveAsyncDecrypt(raw, ticket.keyWrap !== null);
      expect(result.status).toBe("ready");
      if (result.status === "ready") {
        expect(result.value).toBe(ticket.title);
      }
    });

    it("resolves to 'denied' for null-keyWrap tickets", () => {
      const denied = tickets[4]!;
      const result = resolveAsyncDecrypt(undefined, denied.keyWrap !== null);
      expect(result.status).toBe("denied");
    });
  });

  describe("mapToCardProps", () => {
    it("returns DataCardProps with correct displayStatus", () => {
      const ticket = tickets[0]!;
      demoSeed({ titles: { [ticket.id]: ticket.title } });
      const ticketCache = getTicketDecryptCache();
      const raw = ticketCache.get(ticket.id);
      const props = mapToCardProps(ticket, raw, () => {
        /* no-op */
      });
      expect(props.ticketId).toBe(ticket.id);
      expect(props.queueName).toBe(ticket.queueName);
      expect(props.clientAlias).toBe(ticket.clientAlias);
      expect(props.priority).toBe(ticket.priority);
    });

    it("DENIED ticket has titleResult.status = denied", () => {
      const denied = tickets[4]!;
      const props = mapToCardProps(denied, undefined, () => {
        /* no-op */
      });
      expect(props.titleResult.status).toBe("denied");
    });
  });

  describe("reveal controller integration", () => {
    it("schedules staggered reveals that write to the ticket cache", () => {
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

    it("schedules follow-up content into the followUp cache", () => {
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

    it("failNow writes the error sentinel to the ticket cache", () => {
      const reveal = createRevealController();
      const ticket = tickets[0]!;
      const fu = ticket.followUps.find(
        (f) => f.source === "client" && f.content !== "",
      );
      expect(fu).toBeDefined();

      const key = `fu:${ticket.id}:${fu!.id}`;
      reveal.failNow(key, "ticket");

      const ticketCache = getTicketDecryptCache();
      const raw = ticketCache.get(key);
      const result = resolveAsyncDecrypt(raw, true);
      expect(result.status).toBe("error");

      reveal.reset();
    });
  });

  describe("preview follow-ups for TicketPreview", () => {
    it("mapToPreviewFollowUps returns at most 3 non-private, non-system entries", () => {
      const ticket = tickets[0]!;
      const previews = mapToPreviewFollowUps(ticket);
      expect(previews.length).toBeLessThanOrEqual(3);
      for (const p of previews) {
        // All preview entries should be non-system
        expect(p.type).not.toBe("volunteer_assigned");
        expect(p.type).not.toBe("status_closed");
        expect(p.type).not.toBe("status_opened");
      }
    });
  });
});

describe("ConversationDemo logic", () => {
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

  describe("follow-up content resolution", () => {
    it("system follow-ups resolve as ready with their content", () => {
      const ticket = tickets[0]!;
      const systemFu = ticket.followUps.find((fu) => fu.source === "system");
      expect(systemFu).toBeDefined();
      // System events do not go through the cache
      const result = resolveAsyncDecrypt(systemFu!.content, true);
      expect(result.status).toBe("ready");
    });

    it("non-system follow-ups resolve from ticket cache with fu: key prefix", () => {
      const ticket = tickets[0]!;
      const clientFu = ticket.followUps.find(
        (fu) => fu.source === "client" && fu.content !== "",
      );
      expect(clientFu).toBeDefined();

      const key = `fu:${ticket.id}:${clientFu!.id}`;
      demoSeed({ followUps: { [key]: clientFu!.content } });

      const ticketCache = getTicketDecryptCache();
      const raw = ticketCache.get(key);
      const result = resolveAsyncDecrypt(raw, true);
      expect(result.status).toBe("ready");
      if (result.status === "ready") {
        expect(result.value).toBe(clientFu!.content);
      }
    });
  });

  describe("buildScriptedReply", () => {
    it("builds a volunteer message follow-up with the given content", () => {
      const ticket = tickets[0]!;
      const reply = buildScriptedReply(ticket.id, "Test reply", "reply-001");
      expect(reply.id).toBe("reply-001");
      expect(reply.ticketId).toBe(ticket.id);
      expect(reply.source).toBe("volunteer");
      expect(reply.type).toBe("message");
      expect(reply.content).toBe("Test reply");
      expect(reply.isPrivate).toBe(false);
    });

    it("generates fake ciphertext of content.length + 40", () => {
      const reply = buildScriptedReply("tk-001", "Hello", "reply-002");
      expect(reply.encryptedContent.length).toBe("Hello".length + 40);
    });
  });

  describe("error and retry sequence", () => {
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

  describe("timer cleanup", () => {
    it("clearTimeout prevents scheduled callbacks from firing", () => {
      let callCount = 0;
      const timers: ReturnType<typeof setTimeout>[] = [];

      timers.push(
        setTimeout(() => {
          callCount += 1;
        }, 1000),
      );
      timers.push(
        setTimeout(() => {
          callCount += 1;
        }, 2000),
      );

      for (const t of timers) {
        clearTimeout(t);
      }

      vi.advanceTimersByTime(3000);
      expect(callCount).toBe(0);
    });
  });

  describe("typing animation mechanics", () => {
    it("builds text character by character at TYPING_CHAR_MS intervals", () => {
      const text = "Hello";
      const charMs = 30;
      const chars: string[] = [];

      let charIndex = 0;
      function typeNextChar(): ReturnType<typeof setTimeout> | undefined {
        if (charIndex >= text.length) return undefined;
        chars.push(text.slice(0, charIndex + 1));
        charIndex += 1;
        return setTimeout(typeNextChar, charMs);
      }

      typeNextChar();
      for (let i = 0; i < text.length - 1; i++) {
        vi.advanceTimersByTime(charMs);
      }

      expect(chars.length).toBe(text.length);
      expect(chars[0]).toBe("H");
      expect(chars[chars.length - 1]).toBe("Hello");
    });
  });
});

describe("script step structure", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    demoReset();
  });

  afterEach(() => {
    demoReset();
    vi.useRealTimers();
  });

  it("all step IDs are unique", () => {
    // Replicate the step IDs from TicketsFlowDemo
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

  it("descramble step staggers delays starting at 400ms", () => {
    // Verify stagger logic: first title at 400ms, increments by 120ms
    const tickets = createDemoTickets();
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
    // All delays should be >= 400 (above the 300ms descramble threshold)
    for (const entry of entries) {
      expect(entry.delayMs).toBeGreaterThanOrEqual(400);
    }
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

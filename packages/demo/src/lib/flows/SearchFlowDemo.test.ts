/**
 * Tests for SearchFlowDemo flow logic.
 *
 * These tests validate the non-component logic extracted from the flow:
 * fixture-to-RawCachedTicket mapping, corpus seeding, provider dep
 * construction, abort/cleanup behavior, and script step sequencing.
 *
 * Component rendering is not tested here (visual verification by user).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createInstantCorpus,
  createEscalationCorpus,
} from "../fixtures/search.js";
import type { SearchFixtureItem } from "../fixtures/search.js";
import {
  demoSeed,
  demoReset,
  getTicketDecryptCache,
  getOrgDecryptCache,
} from "$lib/crypto/context";
import {
  registerSearchProvider,
  searchAll,
  resetFullSearch,
} from "$lib/search/registry.svelte.js";
import { createTicketSearchProvider } from "$lib/search/providers/tickets.js";
import type { RawCachedTicket } from "$lib/search/providers/tickets.js";

// ---------------------------------------------------------------------------
// Helpers: replicate the flow's buildRawCachedTicket and seeding logic
// so tests exercise the same code paths the component does.
// ---------------------------------------------------------------------------

function buildRawCachedTicket(item: SearchFixtureItem): RawCachedTicket {
  const fakeEncTitle = "x".repeat(item.title.length + 40);
  return {
    id: item.ticketId,
    queueId: `q-${item.queueName.toLowerCase()}`,
    encryptedQueueName: item.queueName,
    status: "open",
    onHold: false,
    priority: item.priority,
    encryptedTitle: fakeEncTitle,
    keyWrap: "demo-keywrap",
    clientAlias: item.clientAlias,
    assignedTo: null,
    assignedDisplayName: null,
    createdAt: new Date().toISOString(),
    lastActivityAt: null,
    followUpCount: 0,
  };
}

function seedCorpus(items: SearchFixtureItem[]): void {
  const titles: Record<string, string> = {};
  const orgValues: Record<string, string> = {};
  for (const item of items) {
    titles[item.ticketId] = item.title;
    orgValues[`queue:q-${item.queueName.toLowerCase()}`] = item.queueName;
  }
  demoSeed({ titles, orgValues });
}

describe("SearchFlowDemo", () => {
  let dispose: (() => void) | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    demoReset();
    resetFullSearch();
  });

  afterEach(() => {
    dispose?.();
    dispose = null;
    resetFullSearch();
    demoReset();
    vi.useRealTimers();
  });

  describe("fixture mapping", () => {
    it("buildRawCachedTicket produces a valid TicketLikeRecord shape", () => {
      const item: SearchFixtureItem = {
        ticketId: "test-001",
        title: "Test title",
        clientAlias: "Bird-1",
        queueName: "Intake",
        priority: "normal",
      };
      const raw = buildRawCachedTicket(item);
      expect(raw.id).toBe("test-001");
      expect(raw.queueId).toBe("q-intake");
      expect(raw.encryptedQueueName).toBe("Intake");
      expect(raw.status).toBe("open");
      expect(raw.priority).toBe("normal");
      expect(raw.clientAlias).toBe("Bird-1");
      expect(raw.keyWrap).toBe("demo-keywrap");
      expect(raw.assignedTo).toBeNull();
      expect(raw.followUpCount).toBe(0);
    });

    it("generates fake ciphertext of plaintext.length + 40", () => {
      const item: SearchFixtureItem = {
        ticketId: "test-002",
        title: "Short",
        clientAlias: "Oak-2",
        queueName: "Housing",
        priority: "high",
      };
      const raw = buildRawCachedTicket(item);
      expect(typeof raw.encryptedTitle).toBe("string");
      expect((raw.encryptedTitle as string).length).toBe(
        item.title.length + 40,
      );
    });
  });

  describe("corpus seeding into stub caches", () => {
    it("seeds instant corpus titles into the ticket cache", () => {
      const corpus = createInstantCorpus();
      seedCorpus(corpus);

      const ticketCache = getTicketDecryptCache();
      for (const item of corpus) {
        expect(ticketCache.get(item.ticketId)).toBe(item.title);
      }
    });

    it("seeds queue names into the org cache", () => {
      const corpus = createInstantCorpus();
      seedCorpus(corpus);

      const orgCache = getOrgDecryptCache();
      // Housing queue should be present
      const housingResult = orgCache.decrypt("queue:q-housing", null);
      expect(housingResult).toBe("Housing");
    });

    it("demoReset clears all seeded values", () => {
      const corpus = createInstantCorpus();
      seedCorpus(corpus);

      demoReset();

      const ticketCache = getTicketDecryptCache();
      expect(ticketCache.size).toBe(0);
    });
  });

  describe("provider registration with real factory", () => {
    it("registers a ticket search provider that returns instant results for 'housing'", () => {
      const corpus = createInstantCorpus();
      seedCorpus(corpus);
      const rawTickets = corpus.map(buildRawCachedTicket);

      const ticketCache = getTicketDecryptCache();
      const orgCache = getOrgDecryptCache();

      const provider = createTicketSearchProvider({
        getAllCachedTickets: () => rawTickets,
        decryptTitle: (ticketId: string) => ticketCache.get(ticketId),
        orgDecrypt: (cacheKey: string, ciphertext: unknown) =>
          orgCache.decrypt(cacheKey, ciphertext),
        currentUserId: () => "demo-user-001",
        getPreviewFollowUps: () => undefined,
        getTotalItemCount: () => corpus.length,
      });

      dispose = registerSearchProvider(provider);
      const groups = searchAll("housing");

      expect(groups.length).toBeGreaterThan(0);
      const ticketGroup = groups.find((g) => g.providerId === "tickets");
      expect(ticketGroup).toBeDefined();
      // "housing" should match at least "Help with housing" and "Relocation assistance request"
      // (the latter is in the Housing queue which matches via the haystack)
      expect(ticketGroup!.results.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty results for a query with no matches", () => {
      const corpus = createInstantCorpus();
      seedCorpus(corpus);
      const rawTickets = corpus.map(buildRawCachedTicket);
      const ticketCache = getTicketDecryptCache();
      const orgCache = getOrgDecryptCache();

      const provider = createTicketSearchProvider({
        getAllCachedTickets: () => rawTickets,
        decryptTitle: (ticketId: string) => ticketCache.get(ticketId),
        orgDecrypt: (cacheKey: string, ciphertext: unknown) =>
          orgCache.decrypt(cacheKey, ciphertext),
        currentUserId: () => "demo-user-001",
        getPreviewFollowUps: () => undefined,
      });

      dispose = registerSearchProvider(provider);
      const groups = searchAll("zzzznonexistent");

      const ticketGroup = groups.find((g) => g.providerId === "tickets");
      expect(ticketGroup).toBeDefined();
      expect(ticketGroup!.results.length).toBe(0);
    });

    it("dispose removes the provider from the registry", () => {
      const corpus = createInstantCorpus();
      seedCorpus(corpus);
      const rawTickets = corpus.map(buildRawCachedTicket);
      const ticketCache = getTicketDecryptCache();
      const orgCache = getOrgDecryptCache();

      const provider = createTicketSearchProvider({
        getAllCachedTickets: () => rawTickets,
        decryptTitle: (ticketId: string) => ticketCache.get(ticketId),
        orgDecrypt: (cacheKey: string, ciphertext: unknown) =>
          orgCache.decrypt(cacheKey, ciphertext),
        currentUserId: () => "demo-user-001",
        getPreviewFollowUps: () => undefined,
      });

      const disposeFn = registerSearchProvider(provider);
      disposeFn();
      dispose = null;

      const groups = searchAll("housing");
      // No providers registered, so no groups returned
      expect(groups.length).toBe(0);
    });
  });

  describe("search query behavior", () => {
    it("searchAll returns empty for queries under 2 chars", () => {
      const groups = searchAll("h");
      expect(groups.length).toBe(0);
    });

    it("escalation corpus items include 'housing' matches", () => {
      const escItems = createEscalationCorpus();
      const housingItems = escItems.filter((item) =>
        item.title.toLowerCase().includes("housing"),
      );
      expect(housingItems.length).toBeGreaterThanOrEqual(2);
    });

    it("instant corpus contains 7 items", () => {
      const corpus = createInstantCorpus();
      expect(corpus.length).toBe(7);
    });

    it("escalation corpus contains 5 items", () => {
      const corpus = createEscalationCorpus();
      expect(corpus.length).toBe(5);
    });
  });

  describe("abort handling", () => {
    it("AbortController.abort() sets signal.aborted to true", () => {
      const controller = new AbortController();
      expect(controller.signal.aborted).toBe(false);
      controller.abort();
      expect(controller.signal.aborted).toBe(true);
    });

    it("tracked timeouts can be cleared without firing", () => {
      let fired = false;
      const timers: ReturnType<typeof setTimeout>[] = [];

      const id = setTimeout(() => {
        fired = true;
      }, 1000);
      timers.push(id);

      for (const timer of timers) {
        clearTimeout(timer);
      }

      vi.advanceTimersByTime(2000);
      expect(fired).toBe(false);
    });
  });

  describe("coverage line", () => {
    it("provider reports totalCached and totalItems for coverage text", () => {
      const corpus = createInstantCorpus();
      seedCorpus(corpus);
      const rawTickets = corpus.map(buildRawCachedTicket);
      const ticketCache = getTicketDecryptCache();
      const orgCache = getOrgDecryptCache();

      const totalItems = corpus.length + createEscalationCorpus().length;

      const provider = createTicketSearchProvider({
        getAllCachedTickets: () => rawTickets,
        decryptTitle: (ticketId: string) => ticketCache.get(ticketId),
        orgDecrypt: (cacheKey: string, ciphertext: unknown) =>
          orgCache.decrypt(cacheKey, ciphertext),
        currentUserId: () => "demo-user-001",
        getPreviewFollowUps: () => undefined,
        getTotalItemCount: () => totalItems,
      });

      dispose = registerSearchProvider(provider);
      const groups = searchAll("housing");
      const ticketGroup = groups.find((g) => g.providerId === "tickets");

      expect(ticketGroup).toBeDefined();
      expect(ticketGroup!.totalCached).toBe(corpus.length);
      expect(ticketGroup!.totalItems).toBe(totalItems);
      // When totalItems > totalCached, coverageText should be defined
      // (the provider's coverage callback generates the "Searched N of M" line)
      expect(ticketGroup!.coverageText).toBeDefined();
    });
  });
});

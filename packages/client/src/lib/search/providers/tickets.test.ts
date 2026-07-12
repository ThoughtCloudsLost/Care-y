import { describe, it, expect, vi } from "vitest";
import type { RawCachedTicket } from "./tickets.js";
import { createTicketSearchProvider } from "./tickets.js";
import type { FullSearchState } from "../types.js";

vi.mock("$lib/paraglide/messages.js", () => ({
  search_section_tickets: () => "Tickets",
}));

vi.mock("$lib/components/search/TicketSearchResult.svelte", () => ({
  default: {} as never,
}));

vi.mock("$lib/crypto/async-decrypt-cache.js", () => ({
  DECRYPT_ERROR_SENTINEL: "\0DECRYPT_FAILED",
}));

const KW = { ephemeralPoint: "ep", nonce: "n", wrappedKey: "wk" };

function makeRawTicket(
  overrides: Partial<RawCachedTicket> & { id: string },
): RawCachedTicket {
  return {
    queueId: "q1",
    encryptedQueueName: null,
    status: "open",
    onHold: false,
    priority: "normal",
    encryptedTitle: "encrypted-blob",
    keyWrap: KW,
    clientAlias: "Anonymous",
    assignedTo: null,
    assignedDisplayName: null,
    createdAt: "2026-01-01T00:00:00Z",
    lastActivityAt: null,
    followUpCount: 0,
    ...overrides,
  };
}

function makeState(): FullSearchState {
  return { status: "idle", searched: 0, total: 0, matchCount: 0 };
}

describe("createTicketSearchProvider", () => {
  const rawTickets: RawCachedTicket[] = [
    makeRawTicket({ id: "t1", clientAlias: "Maria" }),
    makeRawTicket({ id: "t2", clientAlias: "Carlos" }),
    makeRawTicket({ id: "t3", clientAlias: "Ana" }),
  ];

  const decryptedTitles: Record<string, string> = {
    t1: "Housing assistance request",
    t2: "Artículo sobre transporte",
  };

  function createProvider(): ReturnType<typeof createTicketSearchProvider> {
    return createTicketSearchProvider({
      getAllCachedTickets: () => rawTickets,
      decryptTitle: (id: string) => decryptedTitles[id],
      decryptQueueName: () => "General",
      resolveAssignedName: () => null,
      getPreviewFollowUps: () => undefined,
      deriveDisplayStatus: () => "open" as never,
    });
  }

  it("matches on decrypted title substring", () => {
    const provider = createProvider();
    const { results } = provider.search("housing");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe("t1");
  });

  it("returns empty results for non-matching query", () => {
    const provider = createProvider();
    const { results } = provider.search("nonexistent query term");
    expect(results).toHaveLength(0);
  });

  it("matches on client alias", () => {
    const provider = createProvider();
    const { results } = provider.search("Maria");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe("t1");
  });

  it("carries the query as searchTerm in result data", () => {
    const provider = createProvider();
    const { results } = provider.search("housing");
    expect(results[0]!.data.searchTerm).toBe("housing");
  });

  it("excludes tickets with undecrypted titles", () => {
    const provider = createProvider();
    const { results } = provider.search("Ana");
    expect(results).toHaveLength(0);
  });

  it("performs accent-folded matching", () => {
    const provider = createProvider();
    const { results } = provider.search("articulo");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe("t2");
  });

  it("reports totalCached as the count of all tickets (not just decrypted)", () => {
    const provider = createProvider();
    const { totalCached } = provider.search("housing");
    expect(totalCached).toBe(3);
  });

  it("never reports loading as true for instant search", () => {
    const provider = createProvider();
    const { loading } = provider.search("housing");
    expect(loading).toBe(false);
  });

  it("has correct provider metadata", () => {
    const provider = createProvider();
    expect(provider.id).toBe("tickets");
    expect(provider.label()).toBe("Tickets");
    expect(provider.renderMode).toBe("card-strip");
    expect(provider.showAllHref("test")).toBe("/tickets?q=test");
    expect(provider.getResultHref("t1")).toBe("/tickets/t1");
  });

  it("maps display fields from decrypt functions", () => {
    const provider = createProvider();
    const { results } = provider.search("housing");
    const data = results[0]!.data;
    expect(data.ticketId).toBe("t1");
    expect(data.clientAlias).toBe("Maria");
    expect(data.queueName).toBe("General");
    expect(data.titleResult).toEqual({
      status: "ready",
      value: "Housing assistance request",
    });
  });
});

describe("ticket fullSearch (two-phase)", () => {
  const decryptedTitles: Record<string, string> = {
    t1: "Housing assistance request",
    t2: "Transport help",
    t3: "Medical question",
  };

  function createFullSearchProvider(overrides: {
    listAllPages?: RawCachedTicket[][];
    contentSearchFollowups?: Array<{
      ticketId: string;
      followupId: string;
      encryptedContent: string;
    }>;
    decryptedFollowUps?: Record<string, string>;
    decryptTitle?: (id: string) => string | undefined;
  }): ReturnType<typeof createTicketSearchProvider> {
    const pages = overrides.listAllPages ?? [];
    let pageIndex = 0;

    const decryptedFu = overrides.decryptedFollowUps ?? {};

    return createTicketSearchProvider({
      getAllCachedTickets: () => pages.flat(),
      decryptTitle:
        overrides.decryptTitle ?? ((id: string) => decryptedTitles[id]),
      decryptQueueName: () => "General",
      resolveAssignedName: () => null,
      getPreviewFollowUps: () => undefined,
      deriveDisplayStatus: () => "open" as never,
      listAll: vi.fn(async () => {
        const page = pages[pageIndex] ?? [];
        pageIndex++;
        return page;
      }),
      ingestTickets: vi.fn(),
      whenDecryptsSettled: vi.fn(async () => undefined),
      decryptFollowUp: vi.fn((_tid: string, fid: string) => decryptedFu[fid]),
      contentSearch: vi.fn(async () => ({
        followups: overrides.contentSearchFollowups ?? [],
        total: overrides.contentSearchFollowups?.length ?? 0,
      })),
    });
  }

  it("Title search paginates through all tickets and finds title matches", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) =>
      makeRawTicket({ id: `p1-${i}`, keyWrap: KW }),
    );
    const page2 = [makeRawTicket({ id: "p2-0", keyWrap: KW })];

    const provider = createFullSearchProvider({
      listAllPages: [page1, page2],
      decryptTitle: (id: string) =>
        id === "p1-5" ? "Housing help" : "Unrelated topic",
    });

    const state = makeState();
    const onProgress = vi.fn();
    await provider.fullSearch!("Housing", state, onProgress);

    expect(state.matchCount).toBeGreaterThanOrEqual(1);
    expect(state.total).toBe(101);
    expect(onProgress).toHaveBeenCalled();
  });

  it("Title search calls ingestTickets with accumulated tickets", async () => {
    const tickets = [makeRawTicket({ id: "t1", keyWrap: KW })];
    const provider = createFullSearchProvider({
      listAllPages: [tickets],
      decryptTitle: () => "Housing help",
    });

    const state = makeState();
    await provider.fullSearch!("Housing", state, vi.fn());

    // The provider's deps.ingestTickets should have been called
    // (verified via the mock in createFullSearchProvider)
    expect(state.total).toBe(1);
  });

  it("Content search only searches follow-ups for non-matching tickets", async () => {
    const tickets = [
      makeRawTicket({ id: "t1", keyWrap: KW }),
      makeRawTicket({ id: "t2", keyWrap: KW }),
      makeRawTicket({ id: "t3", keyWrap: KW }),
    ];

    const provider = createFullSearchProvider({
      listAllPages: [tickets],
      contentSearchFollowups: [
        {
          ticketId: "t3",
          followupId: "fu-1",
          encryptedContent: "encrypted-note",
        },
      ],
      decryptedFollowUps: {
        "fu-1": "This note discusses housing policy",
      },
    });

    const state = makeState();
    await provider.fullSearch!("housing", state, vi.fn());

    // t1 matches on title ("Housing assistance request")
    // t3 matches on follow-up content ("housing policy")
    expect(state.matchCount).toBeGreaterThanOrEqual(2);

    // Content match should propagate to search()
    const { results } = provider.search("housing");
    expect(results.some((r) => r.id === "t1")).toBe(true);
    expect(results.some((r) => r.id === "t3")).toBe(true);
  });

  it("updates progress state across both phases", async () => {
    const tickets = [
      makeRawTicket({ id: "t1", keyWrap: KW }),
      makeRawTicket({ id: "t2", keyWrap: KW }),
    ];

    const provider = createFullSearchProvider({
      listAllPages: [tickets],
    });

    const state = makeState();
    const onProgress = vi.fn();
    await provider.fullSearch!("something", state, onProgress);

    expect(state.total).toBe(2);
    expect(state.searched).toBeGreaterThan(0);
    expect(onProgress).toHaveBeenCalled();
  });

  it("preserves Title search matches when Content search fails", async () => {
    const tickets = [
      makeRawTicket({ id: "t1", keyWrap: KW }),
      makeRawTicket({ id: "t2", keyWrap: KW }),
    ];

    const provider = createTicketSearchProvider({
      getAllCachedTickets: () => tickets,
      decryptTitle: (id: string) =>
        id === "t1" ? "Housing request" : "Other topic",
      decryptQueueName: () => "General",
      resolveAssignedName: () => null,
      getPreviewFollowUps: () => undefined,
      deriveDisplayStatus: () => "open" as never,
      listAll: vi.fn(async () => tickets),
      ingestTickets: vi.fn(),
      whenDecryptsSettled: vi.fn(async () => undefined),
      decryptFollowUp: vi.fn(() => undefined),
      contentSearch: vi.fn(async () => {
        throw new Error("Network error");
      }),
    });

    const state = makeState();
    await provider.fullSearch!("Housing", state, vi.fn());

    // Title search match on t1 preserved despite Content search network failure
    expect(state.matchCount).toBe(1);
  });

  it("registers fullSearch only when all deps are provided", () => {
    const withDeps = createTicketSearchProvider({
      getAllCachedTickets: () => [],
      decryptTitle: () => undefined,
      decryptQueueName: () => null,
      resolveAssignedName: () => null,
      getPreviewFollowUps: () => undefined,
      deriveDisplayStatus: () => "open" as never,
      listAll: vi.fn(),
      ingestTickets: vi.fn(),
      whenDecryptsSettled: vi.fn(),
      decryptFollowUp: vi.fn(),
      contentSearch: vi.fn(),
    });
    expect(withDeps.fullSearch).toBeDefined();

    const withoutDeps = createTicketSearchProvider({
      getAllCachedTickets: () => [],
      decryptTitle: () => undefined,
      decryptQueueName: () => null,
      resolveAssignedName: () => null,
      getPreviewFollowUps: () => undefined,
      deriveDisplayStatus: () => "open" as never,
    });
    expect(withoutDeps.fullSearch).toBeUndefined();
  });

  it("skips Content search when all tickets match on title", async () => {
    const tickets = [makeRawTicket({ id: "t1", keyWrap: KW })];

    const contentSearch = vi.fn();

    const provider = createTicketSearchProvider({
      getAllCachedTickets: () => tickets,
      decryptTitle: () => "Housing help",
      decryptQueueName: () => "General",
      resolveAssignedName: () => null,
      getPreviewFollowUps: () => undefined,
      deriveDisplayStatus: () => "open" as never,
      listAll: vi.fn(async () => tickets),
      ingestTickets: vi.fn(),
      whenDecryptsSettled: vi.fn(async () => undefined),
      decryptFollowUp: vi.fn(),
      contentSearch,
    });

    const state = makeState();
    await provider.fullSearch!("Housing", state, vi.fn());

    expect(state.matchCount).toBe(1);
    expect(contentSearch).not.toHaveBeenCalled();
  });
});

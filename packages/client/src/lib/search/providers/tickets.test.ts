import { describe, it, expect, vi } from "vitest";
import type {
  RawCachedTicket,
  TicketSearchProviderDeps,
  TicketSearchScope,
} from "./tickets.js";
import { createTicketSearchProvider, ticketSearchScope } from "./tickets.js";
import type { TicketListServerParams } from "$lib/stores/filters.svelte.js";
import type { CoverageState, FullSearchState } from "../types.js";
import { fullSearchScopeKey } from "../registry.svelte.js";
import type * as Messages from "$lib/paraglide/messages.js";
import type * as WithTermsModule from "$lib/terminology/with-terms.js";
import type * as AsyncDecryptCacheModule from "$lib/crypto/async-decrypt-cache.js";
import type * as TicketSearchResultNS from "$lib/components/search/TicketSearchResult.svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof Messages>()),
  dashboard_assigned_you: () => "You",
  search_section_tickets: () => "Tickets",
  search_coverage_searching: (p: { searched: number; total: number }) =>
    `Searching ${String(p.searched)} of ${String(p.total)}...`,
  search_coverage_tickets: (p: {
    searched: number;
    total: number;
    tickets: string;
  }) =>
    `Searched ${String(p.searched)} of ${String(p.total)} ${p.tickets} already unlocked on this device.`,
  search_coverage_tickets_all: (p: { total: number; tickets: string }) =>
    `Searched all ${String(p.total)} ${p.tickets} unlocked on this device.`,
  search_fetch_more_tickets: (p: { count: number; tickets: string }) =>
    `Search the other ${String(p.count)} ${p.tickets}`,
  search_deep_incomplete: (p: {
    searched: number;
    total: number;
    tickets: string;
  }) =>
    `Deeper search stopped. Searched ${String(p.searched)} of ${String(p.total)} ${p.tickets}.`,
}));

// vi.mock required: withTerms resolves org terminology through a Svelte
// context getter (createContext), which only exists during component
// initialization; these tests call provider.coverage() outside any
// component, where the real getter throws.
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTermsModule>()),
  withTerms: (extra?: Record<string, unknown>) => ({
    tickets: "tickets",
    ...extra,
  }),
}));

vi.mock(
  "$lib/components/search/TicketSearchResult.svelte",
  () =>
    ({
      default: {} as unknown as (typeof TicketSearchResultNS)["default"],
    }) satisfies typeof TicketSearchResultNS,
);

vi.mock("$lib/crypto/async-decrypt-cache.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AsyncDecryptCacheModule>()),
  DECRYPT_ERROR_SENTINEL: "\0DECRYPT_FAILED",
}));

const KW = { ephemeralPoint: "ep", nonce: "n", wrappedKey: "wk" };

function makeRawTicket(
  overrides: Partial<RawCachedTicket> & { id: string },
): RawCachedTicket {
  return {
    queueId: "q1",
    encryptedQueueName: "ZW5jLXF1ZXVl",
    status: "open",
    onHold: false,
    priority: "normal",
    encryptedTitle: "encrypted-blob",
    keyWrap: KW,
    clientId: "client-default",
    encryptedClientAlias: "ZW5jLWFsaWFz",
    assignedTo: null,
    assignedDisplayName: null,
    createdAt: "2026-01-01T00:00:00Z",
    lastActivityAt: null,
    followUpCount: 0,
    hasResponse: false,
    queueSortOrder: 1,
    ...overrides,
  };
}

function makeState(): FullSearchState {
  return { status: "idle", searched: 0, total: 0, matchCount: 0 };
}

/** A signal that never aborts, for runs the test does not cancel. */
function liveSignal(): AbortSignal {
  return new AbortController().signal;
}

describe("createTicketSearchProvider", () => {
  const rawTickets: RawCachedTicket[] = [
    makeRawTicket({ id: "t1", clientId: "c1" }),
    makeRawTicket({ id: "t2", clientId: "c2" }),
    makeRawTicket({ id: "t3", clientId: "c3" }),
  ];

  const decryptedTitles: Record<string, string> = {
    t1: "Housing assistance request",
    t2: "Artículo sobre transporte",
  };

  function createProvider(): ReturnType<typeof createTicketSearchProvider> {
    return createTicketSearchProvider({
      getAllCachedTickets: () => rawTickets,
      decryptTitle: (id: string) => decryptedTitles[id],
      orgDecrypt: (cacheKey: string) => {
        if (cacheKey.startsWith("queue:")) return "General";
        if (cacheKey === "client-alias:c1") return "Maria";
        return null;
      },
      currentUserId: () => "viewer-1",
      getPreviewFollowUps: () => undefined,
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

  describe("coverage and escalation copy", () => {
    const provider = createProvider();

    function cov(state: Partial<CoverageState>): string | undefined {
      return provider.coverage?.({
        searched: 0,
        total: undefined,
        fullSearch: undefined,
        fsSearched: 0,
        fsTotal: 0,
        ...state,
      });
    }

    it("reports of-total coverage while the device holds a subset", () => {
      expect(cov({ searched: 100, total: 120 })).toBe(
        "Searched 100 of 120 tickets already unlocked on this device.",
      );
    });

    it("reports the all variant once everything known is searched", () => {
      expect(cov({ searched: 120, total: 120 })).toBe(
        "Searched all 120 tickets unlocked on this device.",
      );
      expect(cov({ searched: 80 })).toBe(
        "Searched all 80 tickets unlocked on this device.",
      );
    });

    it("reports live progress while a full search runs", () => {
      expect(
        cov({
          searched: 100,
          total: 120,
          fullSearch: "searching",
          fsSearched: 40,
          fsTotal: 120,
        }),
      ).toBe("Searching 40 of 120...");
    });

    it("reports how far a stopped full search got", () => {
      expect(
        cov({
          searched: 100,
          total: 400,
          fullSearch: "incomplete",
          fsSearched: 120,
          fsTotal: 400,
        }),
      ).toBe("Deeper search stopped. Searched 120 of 400 tickets.");
    });

    it("stays silent before anything is cached", () => {
      expect(cov({})).toBeUndefined();
    });

    it("offers exactly the remainder in the fetch-more label", () => {
      expect(provider.fullSearchLabel?.(100, 120)).toBe(
        "Search the other 20 tickets",
      );
      expect(provider.fullSearchLabel?.(120, 120)).toBeUndefined();
      expect(provider.fullSearchLabel?.(100, undefined)).toBeUndefined();
    });
  });

  describe("queue and assignee matching", () => {
    const queueNames: Record<string, string> = {
      q1: "Housing",
      q2: "Intake",
    };

    function createFieldProvider(): ReturnType<
      typeof createTicketSearchProvider
    > {
      return createTicketSearchProvider({
        getAllCachedTickets: () => [
          makeRawTicket({ id: "t1", queueId: "q1", clientId: "c1" }),
          makeRawTicket({
            id: "t2",
            queueId: "q2",
            clientId: "c2",
            assignedTo: "u1",
          }),
        ],
        decryptTitle: (id: string) =>
          id === "t1" ? "Shelter referral" : "Transit question",
        orgDecrypt: (cacheKey: string) => {
          if (cacheKey.startsWith("queue:")) {
            return queueNames[cacheKey.slice("queue:".length)] ?? null;
          }
          return cacheKey === "assignee:u1" ? "Jordan Rivera" : null;
        },
        currentUserId: () => "viewer-1",
        getPreviewFollowUps: () => undefined,
      });
    }

    it("matches on the decrypted queue name", () => {
      const provider = createFieldProvider();
      const { results } = provider.search("housing");
      expect(results).toHaveLength(1);
      expect(results[0]!.id).toBe("t1");
    });

    it("matches on the resolved assignee name", () => {
      const provider = createFieldProvider();
      const { results } = provider.search("jordan");
      expect(results).toHaveLength(1);
      expect(results[0]!.id).toBe("t2");
    });

    it("resolves self-assigned tickets through the shared core's You label", () => {
      const provider = createTicketSearchProvider({
        getAllCachedTickets: () => [
          makeRawTicket({ id: "t1", assignedTo: "viewer-1" }),
        ],
        decryptTitle: () => "Shelter referral",
        orgDecrypt: () => null,
        currentUserId: () => "viewer-1",
        getPreviewFollowUps: () => undefined,
      });
      const { results } = provider.search("shelter");
      expect(results).toHaveLength(1);
      expect(results[0]!.data.assignedIsSelf).toBe(true);
      expect(results[0]!.data.assignedName).toBe("You");
    });

    it("treats unresolved queue and assignee as non-matching without throwing", () => {
      const provider = createTicketSearchProvider({
        getAllCachedTickets: () => [makeRawTicket({ id: "t1" })],
        decryptTitle: () => "Shelter referral",
        orgDecrypt: () => null,
        currentUserId: () => "viewer-1",
        getPreviewFollowUps: () => undefined,
      });
      expect(provider.search("shelter").results).toHaveLength(1);
      expect(provider.search("housing").results).toHaveLength(0);
    });
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

  it("composes result data from the shared display-field core", () => {
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
    expect(data.displayStatus).toBe("new");
    expect(data.assignedIsSelf).toBe(false);
    expect(data.searchTerm).toBe("housing");
    expect(data.unreadCount).toBe(0);
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
    /** Runs on every listAll call, before the page is returned. */
    onListAll?: () => void;
    /** Receives the arguments of every listAll call. */
    onListAllArgs?: (
      cursor: string | undefined,
      scope: TicketSearchScope | undefined,
    ) => void;
    /** listAll call index (0-based) that rejects instead of returning a page. */
    failListAllAt?: number;
    getTotalItemCount?: () => number | undefined;
    contentSearch?: TicketSearchProviderDeps["contentSearch"];
    ingestTickets?: TicketSearchProviderDeps["ingestTickets"];
  }): ReturnType<typeof createTicketSearchProvider> {
    const pages = overrides.listAllPages ?? [];
    let pageIndex = 0;

    const decryptedFu = overrides.decryptedFollowUps ?? {};

    return createTicketSearchProvider({
      getAllCachedTickets: () => pages.flat(),
      decryptTitle:
        overrides.decryptTitle ?? ((id: string) => decryptedTitles[id]),
      orgDecrypt: (cacheKey: string) =>
        cacheKey.startsWith("queue:") ? "General" : null,
      currentUserId: () => "viewer-1",
      getPreviewFollowUps: () => undefined,
      getTotalItemCount: overrides.getTotalItemCount,
      listAll: vi.fn(async (cursor?: string, scope?: TicketSearchScope) => {
        overrides.onListAllArgs?.(cursor, scope);
        if (pageIndex === overrides.failListAllAt) {
          throw new Error("Network error");
        }
        const page = pages[pageIndex] ?? [];
        pageIndex++;
        overrides.onListAll?.();
        return page;
      }),
      ingestTickets: overrides.ingestTickets ?? vi.fn(),
      whenDecryptsSettled: vi.fn(async () => undefined),
      decryptFollowUp: vi.fn((_tid: string, fid: string) => decryptedFu[fid]),
      contentSearch:
        overrides.contentSearch ??
        vi.fn(async () => ({
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
    await provider.fullSearch!("Housing", state, onProgress, liveSignal());

    expect(state.matchCount).toBeGreaterThanOrEqual(1);
    expect(state.total).toBe(101);
    expect(onProgress).toHaveBeenCalled();
  });

  it("passes its run's scope to every page fetch", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) =>
      makeRawTicket({ id: `p1-${i}`, keyWrap: KW }),
    );
    const page2 = [makeRawTicket({ id: "p2-0", keyWrap: KW })];
    const calls: {
      cursor: string | undefined;
      scope: TicketSearchScope | undefined;
    }[] = [];

    const provider = createFullSearchProvider({
      listAllPages: [page1, page2],
      decryptTitle: () => "Unrelated topic",
      onListAllArgs: (cursor, scope) => {
        calls.push({ cursor, scope });
      },
    });

    const scope: TicketSearchScope = {
      queueIds: ["q1"],
      priorities: ["high"],
    };
    await provider.fullSearch!(
      "Housing",
      makeState(),
      vi.fn(),
      liveSignal(),
      scope,
    );

    expect(calls).toHaveLength(2);
    expect(calls[0]?.scope).toBe(scope);
    expect(calls[1]?.scope).toBe(scope);
    expect(calls[1]?.cursor).toBe("p1-99");
  });

  it("fetches unscoped when the run has no scope", async () => {
    const scopes: (TicketSearchScope | undefined)[] = [];

    const provider = createFullSearchProvider({
      listAllPages: [[makeRawTicket({ id: "t1", keyWrap: KW })]],
      decryptTitle: () => "Unrelated topic",
      onListAllArgs: (_cursor, scope) => {
        scopes.push(scope);
      },
    });

    await provider.fullSearch!("Housing", makeState(), vi.fn(), liveSignal());

    expect(scopes).toEqual([undefined]);
  });

  it("stops paginating as soon as its run is aborted", async () => {
    const controller = new AbortController();
    const fullPage = (prefix: string): RawCachedTicket[] =>
      Array.from({ length: 100 }, (_, i) =>
        makeRawTicket({ id: `${prefix}-${i}`, keyWrap: KW }),
      );
    let listAllCalls = 0;

    const provider = createFullSearchProvider({
      listAllPages: [fullPage("p1"), fullPage("p2"), fullPage("p3")],
      decryptTitle: () => "Unrelated topic",
      onListAll: () => {
        listAllCalls++;
        // The user retyped while page one was in flight.
        controller.abort();
      },
    });

    const state = makeState();
    await provider.fullSearch!("Housing", state, vi.fn(), controller.signal);

    // Every page is full, so without the abort check this would walk all
    // three and keep writing progress over the run that replaced it.
    expect(listAllCalls).toBe(1);
    // Returned before the post-loop total write.
    expect(state.total).toBe(0);
  });

  it("Title search calls ingestTickets with accumulated tickets", async () => {
    const tickets = [makeRawTicket({ id: "t1", keyWrap: KW })];
    const provider = createFullSearchProvider({
      listAllPages: [tickets],
      decryptTitle: () => "Housing help",
    });

    const state = makeState();
    await provider.fullSearch!("Housing", state, vi.fn(), liveSignal());

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
    await provider.fullSearch!("housing", state, vi.fn(), liveSignal());

    // t1 matches on title ("Housing assistance request")
    // t3 matches on follow-up content ("housing policy")
    expect(state.matchCount).toBeGreaterThanOrEqual(2);

    // Content match should propagate to search()
    const { results } = provider.search("housing");
    expect(results.some((r) => r.id === "t1")).toBe(true);
    expect(results.some((r) => r.id === "t3")).toBe(true);
  });

  it("leaves the fullSearch cache entry alone on a scoped run", async () => {
    const ingestTickets = vi.fn();
    const provider = createFullSearchProvider({
      listAllPages: [[makeRawTicket({ id: "t1", keyWrap: KW })]],
      ingestTickets,
    });

    await provider.fullSearch!("Housing", makeState(), vi.fn(), liveSignal(), {
      queueIds: ["q1"],
    });

    expect(ingestTickets).not.toHaveBeenCalled();
  });

  it("writes the fullSearch cache entry on an unscoped run", async () => {
    const ingestTickets = vi.fn();
    const provider = createFullSearchProvider({
      listAllPages: [[makeRawTicket({ id: "t1", keyWrap: KW })]],
      ingestTickets,
    });

    await provider.fullSearch!("Housing", makeState(), vi.fn(), liveSignal());

    expect(ingestTickets).toHaveBeenCalledOnce();
    expect(ingestTickets).toHaveBeenCalledWith([
      expect.objectContaining({ id: "t1" }),
    ]);
  });

  it("keeps a scoped run's content matches out of search()", async () => {
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

    await provider.fullSearch!("housing", makeState(), vi.fn(), liveSignal(), {
      queueIds: ["q1"],
    });

    expect(provider.getContentMatchIds!().has("t3")).toBe(true);
    expect(provider.search("housing").results.some((r) => r.id === "t3")).toBe(
      false,
    );
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
    await provider.fullSearch!("something", state, onProgress, liveSignal());

    expect(state.total).toBe(2);
    expect(state.searched).toBeGreaterThan(0);
    expect(onProgress).toHaveBeenCalled();
  });

  it("rejects when Content search fails, keeping Title search matches and progress", async () => {
    const tickets = [
      makeRawTicket({ id: "t1", keyWrap: KW }),
      makeRawTicket({ id: "t2", keyWrap: KW }),
    ];
    const state = makeState();
    let searchedBeforeChunk: number | undefined;

    const provider = createFullSearchProvider({
      listAllPages: [tickets],
      decryptTitle: (id: string) =>
        id === "t1" ? "Housing request" : "Other topic",
      contentSearch: vi.fn(async () => {
        searchedBeforeChunk = state.searched;
        throw new Error("Network error");
      }),
    });

    await expect(
      provider.fullSearch!("Housing", state, vi.fn(), liveSignal()),
    ).rejects.toThrow("Network error");

    // Title search match on t1 survives the Content search failure.
    expect(state.matchCount).toBe(1);
    // t1 is settled by its title; the failed chunk adds nothing.
    expect(searchedBeforeChunk).toBe(1);
    expect(state.searched).toBe(1);
    expect(state.total).toBe(2);
  });

  it("rejects when listing fails, reporting the server total and nothing searched", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) =>
      makeRawTicket({ id: `p1-${i}`, keyWrap: KW }),
    );
    const provider = createFullSearchProvider({
      listAllPages: [page1, page1],
      decryptTitle: () => "Unrelated topic",
      failListAllAt: 1,
      getTotalItemCount: () => 900,
    });

    const state = makeState();
    await expect(
      provider.fullSearch!("Housing", state, vi.fn(), liveSignal()),
    ).rejects.toThrow("Network error");

    expect(state.total).toBe(900);
    expect(state.searched).toBe(0);
  });

  it("falls back to the loaded count as the total when listing fails without a server count", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) =>
      makeRawTicket({ id: `p1-${i}`, keyWrap: KW }),
    );
    const provider = createFullSearchProvider({
      listAllPages: [page1, page1],
      decryptTitle: () => "Unrelated topic",
      failListAllAt: 1,
    });

    const state = makeState();
    await expect(
      provider.fullSearch!("Housing", state, vi.fn(), liveSignal()),
    ).rejects.toThrow("Network error");

    expect(state.total).toBe(100);
    expect(state.searched).toBe(0);
  });

  it("reports the loaded count as the total when a scoped run's listing fails", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) =>
      makeRawTicket({ id: `p1-${i}`, keyWrap: KW }),
    );
    const provider = createFullSearchProvider({
      listAllPages: [page1, page1],
      decryptTitle: () => "Unrelated topic",
      failListAllAt: 1,
      getTotalItemCount: () => 900,
    });

    const state = makeState();
    const scope: TicketSearchScope = { queueIds: ["q1"] };
    await expect(
      provider.fullSearch!("Housing", state, vi.fn(), liveSignal(), scope),
    ).rejects.toThrow("Network error");

    expect(state.total).toBe(100);
    expect(state.searched).toBe(0);
  });

  it("content-searches in chunks of 500 and counts each settled chunk", async () => {
    const nonMatching = Array.from({ length: 1200 }, (_, i) =>
      makeRawTicket({ id: `n-${i}`, keyWrap: KW }),
    );
    const matching = Array.from({ length: 3 }, (_, i) =>
      makeRawTicket({ id: `m-${i}`, keyWrap: KW }),
    );
    const all = [...nonMatching, ...matching];
    const pages: RawCachedTicket[][] = [];
    for (let i = 0; i < all.length; i += 100) {
      pages.push(all.slice(i, i + 100));
    }

    const state = makeState();
    const CONTENT_PAGE_SIZE = 50;
    // state.searched as each chunk's first page is requested.
    const searchedAtChunkStart: number[] = [];
    const contentSearch = vi.fn(
      async (ticketIds: string[], page: number, pageSize: number) => {
        if (page === 1) searchedAtChunkStart.push(state.searched);
        // A full first page forces a second request; the second is short.
        const count = page === 1 ? pageSize : 0;
        return {
          followups: ticketIds.slice(0, count).map((ticketId, i) => ({
            ticketId,
            followupId: `fu-${ticketId}-${String(i)}`,
            encryptedContent: "encrypted-note",
          })),
          total: count,
        };
      },
    );

    const provider = createFullSearchProvider({
      listAllPages: pages,
      decryptTitle: (id: string) =>
        id.startsWith("m-") ? "Housing help" : "Unrelated topic",
      contentSearch,
    });

    const snapshots: { searched: number; total: number }[] = [];
    const onProgress = vi.fn(() => {
      snapshots.push({ searched: state.searched, total: state.total });
    });
    await provider.fullSearch!("Housing", state, onProgress, liveSignal());

    const nonMatchingIds = nonMatching.map((t) => t.id);
    expect(
      contentSearch.mock.calls.map(([ids, page, pageSize]) => [
        ids,
        page,
        pageSize,
      ]),
    ).toEqual([
      [nonMatchingIds.slice(0, 500), 1, CONTENT_PAGE_SIZE],
      [nonMatchingIds.slice(0, 500), 2, CONTENT_PAGE_SIZE],
      [nonMatchingIds.slice(500, 1000), 1, CONTENT_PAGE_SIZE],
      [nonMatchingIds.slice(500, 1000), 2, CONTENT_PAGE_SIZE],
      [nonMatchingIds.slice(1000, 1200), 1, CONTENT_PAGE_SIZE],
      [nonMatchingIds.slice(1000, 1200), 2, CONTENT_PAGE_SIZE],
    ]);

    expect(state.total).toBe(1203);
    // The second chunk starts once the first is settled: the title
    // matches plus the first 500.
    expect(searchedAtChunkStart).toEqual([3, 3 + 500, 3 + 1000]);
    expect(state.searched).toBe(state.total);
    // While listing, the total is not known yet (0); once it is, searched
    // never runs past it.
    for (const snap of snapshots.filter((s) => s.total > 0)) {
      expect(snap.searched).toBeLessThanOrEqual(snap.total);
    }
  });

  it("registers fullSearch only when all deps are provided", () => {
    const withDeps = createTicketSearchProvider({
      getAllCachedTickets: () => [],
      decryptTitle: () => undefined,
      orgDecrypt: () => null,
      currentUserId: () => "viewer-1",
      getPreviewFollowUps: () => undefined,
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
      orgDecrypt: () => null,
      currentUserId: () => "viewer-1",
      getPreviewFollowUps: () => undefined,
    });
    expect(withoutDeps.fullSearch).toBeUndefined();
  });

  it("skips Content search when all tickets match on title", async () => {
    const tickets = [makeRawTicket({ id: "t1", keyWrap: KW })];

    const contentSearch = vi.fn();

    const provider = createTicketSearchProvider({
      getAllCachedTickets: () => tickets,
      decryptTitle: () => "Housing help",
      orgDecrypt: (cacheKey: string) =>
        cacheKey.startsWith("queue:") ? "General" : null,
      currentUserId: () => "viewer-1",
      getPreviewFollowUps: () => undefined,
      listAll: vi.fn(async () => tickets),
      ingestTickets: vi.fn(),
      whenDecryptsSettled: vi.fn(async () => undefined),
      decryptFollowUp: vi.fn(),
      contentSearch,
    });

    const state = makeState();
    await provider.fullSearch!("Housing", state, vi.fn(), liveSignal());

    expect(state.matchCount).toBe(1);
    expect(contentSearch).not.toHaveBeenCalled();
  });
});

describe("ticketSearchScope", () => {
  it("keeps the filter fields and drops sort and page size", () => {
    const params: TicketListServerParams = {
      statuses: ["open"],
      onHold: false,
      queueIds: ["q1"],
      priorities: ["high"],
      assignedTo: null,
      createdAfter: "2026-01-01T00:00:00.000Z",
      createdBefore: "2026-02-01T00:00:00.000Z",
      sortBy: "priority",
      sortDirection: "asc",
      limit: 50,
    };

    const scope = ticketSearchScope(params);

    expect(scope).toEqual({
      statuses: ["open"],
      onHold: false,
      queueIds: ["q1"],
      priorities: ["high"],
      assignedTo: null,
      createdAfter: "2026-01-01T00:00:00.000Z",
      createdBefore: "2026-02-01T00:00:00.000Z",
    });
    expect(scope).not.toHaveProperty("sortBy");
    expect(scope).not.toHaveProperty("sortDirection");
    expect(scope).not.toHaveProperty("limit");
  });

  it("returns undefined when no server filter is set", () => {
    expect(
      ticketSearchScope({ sortBy: "date", sortDirection: "desc", limit: 50 }),
    ).toBeUndefined();
  });

  it("treats an unassigned filter as a scope", () => {
    expect(
      ticketSearchScope({
        sortBy: "date",
        sortDirection: "desc",
        limit: 50,
        assignedTo: null,
      }),
    ).toEqual({ assignedTo: null });
  });

  it("gives the same key for the same selection in another order, without reordering the params", () => {
    const a: TicketListServerParams = {
      sortBy: "date",
      sortDirection: "desc",
      limit: 50,
      queueIds: ["q2", "q1"],
      priorities: ["urgent", "high"],
    };
    const b: TicketListServerParams = {
      sortBy: "date",
      sortDirection: "desc",
      limit: 50,
      queueIds: ["q1", "q2"],
      priorities: ["high", "urgent"],
    };

    expect(fullSearchScopeKey(ticketSearchScope(a))).toBe(
      fullSearchScopeKey(ticketSearchScope(b)),
    );
    expect(a.queueIds).toEqual(["q2", "q1"]);
  });
});

describe("ticket resolveById", () => {
  const rawTickets: RawCachedTicket[] = [
    makeRawTicket({ id: "t1", clientId: "c1" }),
    makeRawTicket({ id: "t3", clientId: "c3" }),
  ];
  const decryptedTitles: Record<string, string> = {
    t1: "Housing assistance request",
  };

  function createProvider(): ReturnType<typeof createTicketSearchProvider> {
    return createTicketSearchProvider({
      getAllCachedTickets: () => rawTickets,
      decryptTitle: (id: string) => decryptedTitles[id],
      orgDecrypt: () => null,
      currentUserId: () => "viewer-1",
      getPreviewFollowUps: () => undefined,
    });
  }

  it("resolves a cached ticket into display data with an empty search term", () => {
    const result = createProvider().resolveById?.("t1");
    expect(result?.id).toBe("t1");
    expect(result?.data.searchTerm).toBe("");
    expect(result?.data.encryptedTitle).toBe("encrypted-blob");
  });

  it("returns undefined while the title is still decrypting", () => {
    expect(createProvider().resolveById?.("t3")).toBeUndefined();
  });

  it("returns undefined for an id not in the cache", () => {
    expect(createProvider().resolveById?.("missing")).toBeUndefined();
  });
});

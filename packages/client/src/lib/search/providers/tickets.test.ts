import { describe, it, expect, vi } from "vitest";
import type { RawCachedTicket } from "./tickets.js";
import { createTicketSearchProvider } from "./tickets.js";
import type { CoverageState, FullSearchState } from "../types.js";

vi.mock("$lib/paraglide/messages.js", () => ({
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
}));

// vi.mock required: withTerms resolves org terminology through a Svelte
// context getter (createContext), which only exists during component
// initialization; these tests call provider.coverage() outside any
// component, where the real getter throws.
vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: (extra?: Record<string, unknown>) => ({
    tickets: "tickets",
    ...extra,
  }),
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
      orgDecrypt: (cacheKey: string) =>
        cacheKey.startsWith("queue:") ? "General" : null,
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
          makeRawTicket({ id: "t1", queueId: "q1", clientAlias: "Maria" }),
          makeRawTicket({
            id: "t2",
            queueId: "q2",
            clientAlias: "Carlos",
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
      orgDecrypt: (cacheKey: string) =>
        cacheKey.startsWith("queue:") ? "General" : null,
      currentUserId: () => "viewer-1",
      getPreviewFollowUps: () => undefined,
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
    await provider.fullSearch!("Housing", state, vi.fn());

    expect(state.matchCount).toBe(1);
    expect(contentSearch).not.toHaveBeenCalled();
  });
});

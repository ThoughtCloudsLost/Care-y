import { describe, it, expect, vi } from "vitest";
import {
  createKbSearchProvider,
  type KBSearchProviderDeps,
  type RawKBItem,
} from "./kb.js";
import type { FullSearchState } from "../types.js";

// Mock paraglide messages
vi.mock("$lib/paraglide/messages.js", () => ({
  search_section_kb: () => "Articles",
}));

// Mock the KBResultItem component (not needed for unit tests)
vi.mock("$lib/components/search/KBResultItem.svelte", () => ({
  default: {} as never,
}));

const baseDate = new Date("2026-03-15T12:00:00Z");

function makeRawItem(
  overrides: Partial<RawKBItem> & { id: string },
): RawKBItem {
  return {
    categoryId: "cat-1",
    encryptedTitle: new Uint8Array([1, 2, 3]),
    encryptedExcerpt: new Uint8Array([4, 5, 6]),
    createdBy: "user-1",
    voteUpCount: 4,
    voteDownCount: 1,
    rating: 0.8,
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };
}

const testItems: RawKBItem[] = [
  makeRawItem({ id: "a1", rating: 0.9, voteUpCount: 9, voteDownCount: 1 }),
  makeRawItem({
    id: "a2",
    categoryId: "cat-2",
    rating: 0.6,
    voteUpCount: 3,
    voteDownCount: 2,
  }),
  makeRawItem({ id: "a3", rating: 0.75, voteUpCount: 6, voteDownCount: 2 }),
];

// Simulate decrypted content
const titleMap: Record<string, string> = {
  a1: "Intake call checklist",
  a2: "Escalation protocol",
  a3: "Safety procedures guide",
};

const excerptMap: Record<string, string> = {
  a1: "Step by step instructions for handling intake calls from new clients",
  a2: "When and how to escalate cases to supervisors or external agencies",
  a3: "General safety guidelines for volunteers and clients during visits",
};

function createDeps(
  items: readonly RawKBItem[] = testItems,
): KBSearchProviderDeps {
  return {
    fetchPage: vi.fn(async () => ({
      items,
      nextCursor: null,
    })),
    decryptOrg: (cacheKey: string, ciphertext: unknown) => {
      const match = /^kb-search:(a\d+):(title|excerpt)$/.exec(cacheKey);
      if (!match) return null;
      const [, id, field] = match;
      if (!id || !field || ciphertext === null) return null;
      if (field === "title") return titleMap[id] ?? null;
      return excerptMap[id] ?? null;
    },
    ensureCategoriesLoaded: vi.fn(async () => undefined),
    resolveCategoryName: (categoryId) =>
      categoryId === "cat-1"
        ? "Procedures"
        : categoryId === "cat-2"
          ? "Escalation"
          : null,
    resolveAuthorName: () => "Test Volunteer",
  };
}

describe("createKbSearchProvider", () => {
  it("has correct provider metadata", () => {
    const provider = createKbSearchProvider(createDeps());
    expect(provider.id).toBe("kb");
    expect(provider.label()).toBe("Articles");
    expect(provider.renderMode).toBe("card-strip");
  });

  it("showAllHref encodes the query parameter", () => {
    const provider = createKbSearchProvider(createDeps());
    expect(provider.showAllHref("intake call")).toBe(
      "/library?q=intake%20call",
    );
  });

  it("getResultHref returns flat route path with article ID", () => {
    const provider = createKbSearchProvider(createDeps());
    expect(provider.getResultHref("a1")).toBe("/library/a1");
  });

  it("returns empty results before loadAll completes", () => {
    const provider = createKbSearchProvider(createDeps());
    const { results, loading } = provider.search("intake");
    expect(results).toHaveLength(0);
    expect(loading).toBe(true);
  });

  it("search() returns matching results by title after load", async () => {
    const deps = createDeps();
    const provider = createKbSearchProvider(deps);
    provider.search("intake");
    await vi.waitFor(() => {
      const { results } = provider.search("intake");
      expect(results.length).toBeGreaterThan(0);
    });
    const { results } = provider.search("intake");
    expect(results).toHaveLength(1);
    expect(results[0]!.data.titleResult).toEqual({
      status: "ready",
      value: "Intake call checklist",
    });
  });

  it("search() returns matching results by body excerpt", async () => {
    const deps = createDeps();
    const provider = createKbSearchProvider(deps);
    provider.search("supervisor");
    await vi.waitFor(() => {
      const { results } = provider.search("supervisor");
      expect(results.length).toBeGreaterThan(0);
    });
    const { results } = provider.search("supervisor");
    expect(results).toHaveLength(1);
    expect(results[0]!.data.articleId).toBe("a2");
  });

  it("search() returns empty array for non-matching query", async () => {
    const deps = createDeps();
    const provider = createKbSearchProvider(deps);
    provider.search("xyznonexistent");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("xyznonexistent");
      expect(totalCached).toBeGreaterThan(0);
    });
    const { results } = provider.search("xyznonexistent");
    expect(results).toHaveLength(0);
  });

  it("caps results at 5 items", async () => {
    const manyItems = Array.from({ length: 10 }, (_, i) =>
      makeRawItem({ id: `a${i}`, rating: 0.5 }),
    );
    const manyTitles: Record<string, string> = {};
    const manyExcerpts: Record<string, string> = {};
    for (let i = 0; i < 10; i++) {
      manyTitles[`a${i}`] = `Guide section ${i}`;
      manyExcerpts[`a${i}`] = "Content for guide";
    }
    const deps: KBSearchProviderDeps = {
      fetchPage: vi.fn(async () => ({
        items: manyItems,
        nextCursor: null,
      })),
      decryptOrg: (cacheKey) => {
        const match = /^kb-search:(a\d+):(title|excerpt)$/.exec(cacheKey);
        if (!match) return null;
        const [, id, field] = match;
        if (!id || !field) return null;
        return field === "title"
          ? (manyTitles[id] ?? null)
          : (manyExcerpts[id] ?? null);
      },
      ensureCategoriesLoaded: vi.fn(async () => undefined),
      resolveCategoryName: () => "General",
      resolveAuthorName: () => "Author",
    };
    const provider = createKbSearchProvider(deps);
    provider.search("guide");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("guide");
      expect(totalCached).toBe(10);
    });
    const { results } = provider.search("guide");
    expect(results).toHaveLength(5);
  });

  it("reports totalCached as total items in cache", async () => {
    const deps = createDeps();
    const provider = createKbSearchProvider(deps);
    provider.search("intake");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("intake");
      expect(totalCached).toBe(3);
    });
  });

  it("resolves category name and author name in search results", async () => {
    const deps = createDeps();
    const provider = createKbSearchProvider(deps);
    provider.search("intake");
    await vi.waitFor(() => {
      const { results } = provider.search("intake");
      expect(results.length).toBeGreaterThan(0);
    });
    const { results } = provider.search("intake");
    expect(results[0]!.data.categoryName).toBe("Procedures");
    expect(results[0]!.data.authorName).toBe("Test Volunteer");
  });

  it("includes vote counts in search results", async () => {
    const deps = createDeps();
    const provider = createKbSearchProvider(deps);
    provider.search("intake");
    await vi.waitFor(() => {
      const { results } = provider.search("intake");
      expect(results.length).toBeGreaterThan(0);
    });
    const { results } = provider.search("intake");
    expect(results[0]!.data.voteUpCount).toBe(9);
    expect(results[0]!.data.voteTotalCount).toBe(10);
  });

  it("paginates through multiple pages", async () => {
    let callCount = 0;
    const deps: KBSearchProviderDeps = {
      fetchPage: vi.fn(async (cursor) => {
        callCount++;
        if (cursor === undefined) {
          return {
            items: [makeRawItem({ id: "a1", rating: 0.9 })],
            nextCursor: "page2",
          };
        }
        return {
          items: [makeRawItem({ id: "a2", categoryId: "cat-2", rating: 0.6 })],
          nextCursor: null,
        };
      }),
      decryptOrg: (cacheKey) => {
        const match = /^kb-search:(a\d+):(title|excerpt)$/.exec(cacheKey);
        if (!match) return null;
        const [, id, field] = match;
        if (!id || !field) return null;
        if (field === "title") return titleMap[id] ?? null;
        return excerptMap[id] ?? null;
      },
      ensureCategoriesLoaded: vi.fn(async () => undefined),
      resolveCategoryName: () => "Category",
      resolveAuthorName: () => "Author",
    };
    const provider = createKbSearchProvider(deps);
    provider.search("call");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("call");
      expect(totalCached).toBe(2);
    });
    expect(callCount).toBe(2);
  });

  it("skips items where title decrypt returns null", async () => {
    const deps: KBSearchProviderDeps = {
      fetchPage: vi.fn(async () => ({
        items: [makeRawItem({ id: "a1" }), makeRawItem({ id: "fail-item" })],
        nextCursor: null,
      })),
      decryptOrg: (cacheKey) => {
        const match = /^kb-search:(.+?):(title|excerpt)$/.exec(cacheKey);
        if (!match) return null;
        const [, id, field] = match;
        if (!id || !field) return null;
        if (field === "title") return titleMap[id] ?? null;
        return excerptMap[id] ?? null;
      },
      ensureCategoriesLoaded: vi.fn(async () => undefined),
      resolveCategoryName: () => null,
      resolveAuthorName: () => null,
    };
    const provider = createKbSearchProvider(deps);
    provider.search("test");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("test");
      expect(totalCached).toBe(1);
    });
  });

  it("handles null encryptedExcerpt gracefully (BF-012 not landed)", async () => {
    const deps: KBSearchProviderDeps = {
      fetchPage: vi.fn(async () => ({
        items: [makeRawItem({ id: "a1", encryptedExcerpt: null })],
        nextCursor: null,
      })),
      decryptOrg: (cacheKey, ciphertext) => {
        if (ciphertext === null) return null;
        const match = /^kb-search:(a\d+):(title|excerpt)$/.exec(cacheKey);
        if (!match) return null;
        const [, id, field] = match;
        if (!id || !field) return null;
        if (field === "title") return titleMap[id] ?? null;
        return excerptMap[id] ?? null;
      },
      ensureCategoriesLoaded: vi.fn(async () => undefined),
      resolveCategoryName: () => null,
      resolveAuthorName: () => null,
    };
    const provider = createKbSearchProvider(deps);
    provider.search("intake");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("intake");
      expect(totalCached).toBe(1);
    });
    const { results } = provider.search("intake");
    expect(results[0]!.data.excerptResult).toEqual({ status: "loading" });
  });

  it("does not call fetchPage more than once (lazy-load + dedup)", async () => {
    const deps = createDeps();
    const provider = createKbSearchProvider(deps);
    provider.search("intake");
    provider.search("escalation");
    provider.search("safety");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("intake");
      expect(totalCached).toBe(3);
    });
    expect(deps.fetchPage).toHaveBeenCalledTimes(1);
  });
});

describe("KB fullSearch (body content)", () => {
  const bodyContentMap: Record<string, string> = {
    a1: "Detailed instructions for intake call processing and documentation requirements",
    a2: "When a case involves immediate danger, escalate to the supervisor on call",
    a3: "Safety protocols require two-person teams for all field visits to ensure volunteer protection",
  };

  function makeState(): FullSearchState {
    return { status: "idle", searched: 0, total: 0, matchCount: 0 };
  }

  function createFullSearchDeps(
    items: readonly RawKBItem[] = testItems,
  ): KBSearchProviderDeps {
    return {
      ...createDeps(items),
      fetchBodies: vi.fn(async (itemIds: string[]) =>
        itemIds.map((id) => ({
          id,
          encryptedBody: new Uint8Array([99]),
        })),
      ),
      decryptOrg: (cacheKey: string, ciphertext: unknown) => {
        if (ciphertext === null) return null;
        const match = /^kb-search:(.+?):(title|excerpt|body)$/.exec(cacheKey);
        if (!match) return null;
        const [, id, field] = match;
        if (!id || !field) return null;
        if (field === "title") return titleMap[id] ?? null;
        if (field === "body") return bodyContentMap[id] ?? null;
        return excerptMap[id] ?? null;
      },
    };
  }

  it("only fetches bodies for non-matching articles", async () => {
    const deps = createFullSearchDeps();
    const provider = createKbSearchProvider(deps);

    // Trigger loadAll
    provider.search("intake");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("intake");
      expect(totalCached).toBe(3);
    });

    const state = makeState();
    await provider.fullSearch!("intake", state, vi.fn());

    // "intake" matches a1 on title/excerpt. a2 and a3 don't match.
    // fetchBodies should be called with a2 and a3 only.
    expect(deps.fetchBodies).toHaveBeenCalledOnce();
    const calledIds = (deps.fetchBodies as ReturnType<typeof vi.fn>).mock
      .calls[0]![0] as string[];
    expect(calledIds).not.toContain("a1");
    expect(calledIds).toContain("a2");
    expect(calledIds).toContain("a3");
  });

  it("adds body-matched articles to results", async () => {
    const deps = createFullSearchDeps();
    const provider = createKbSearchProvider(deps);

    provider.search("danger");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("danger");
      expect(totalCached).toBe(3);
    });

    const state = makeState();
    await provider.fullSearch!("danger", state, vi.fn());

    // "danger" doesn't match any title/excerpt, but matches a2's body content.
    // Content matches propagate through search() via contentMatchIds.
    const { results } = provider.search("danger");
    expect(results.some((r) => r.id === "a2")).toBe(true);
    expect(state.matchCount).toBeGreaterThanOrEqual(1);
  });

  it("updates progress state", async () => {
    const deps = createFullSearchDeps();
    const provider = createKbSearchProvider(deps);

    provider.search("something");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("something");
      expect(totalCached).toBe(3);
    });

    const state = makeState();
    await provider.fullSearch!("something", state, vi.fn());

    expect(state.total).toBe(3);
    expect(state.searched).toBe(3);
  });

  it("preserves title matches when fetchBodies fails", async () => {
    const deps: Omit<KBSearchProviderDeps, "fetchBodies"> & {
      fetchBodies: KBSearchProviderDeps["fetchBodies"];
    } = {
      ...createFullSearchDeps(),
      fetchBodies: vi.fn(async () => {
        throw new Error("Network error");
      }),
    };
    const provider = createKbSearchProvider(deps);

    provider.search("intake");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("intake");
      expect(totalCached).toBe(3);
    });

    const state = makeState();
    await provider.fullSearch!("intake", state, vi.fn());

    // a1 matched on title via search(), matchCount reflects title matches
    expect(state.matchCount).toBe(1);
  });

  it("registers fullSearch only when fetchBodies is provided", () => {
    const withDep = createKbSearchProvider(createFullSearchDeps());
    expect(withDep.fullSearch).toBeDefined();

    const withoutDep = createKbSearchProvider(createDeps());
    expect(withoutDep.fullSearch).toBeUndefined();
  });

  it("skips fetchBodies when all articles match on title/excerpt", async () => {
    const deps = createFullSearchDeps();
    const provider = createKbSearchProvider(deps);

    // "guide" matches all three titles/excerpts
    provider.search("guide");
    await vi.waitFor(() => {
      const { totalCached } = provider.search("guide");
      expect(totalCached).toBe(3);
    });

    // Only a3 matches "guide" in title ("Safety procedures guide")
    // but the fullSearch should still call fetchBodies for non-matching ones
    // Let's test with a query that matches all three
    const allMatchDeps: KBSearchProviderDeps = {
      ...createFullSearchDeps(),
      decryptOrg: (cacheKey: string, ciphertext: unknown) => {
        if (ciphertext === null) return null;
        const match = /^kb-search:(.+?):(title|excerpt|body)$/.exec(cacheKey);
        if (!match) return null;
        const [, , field] = match;
        if (!field) return null;
        if (field === "title") return "Common searchable title";
        if (field === "excerpt") return "Common searchable excerpt";
        return "body text";
      },
    };
    const allMatchProvider = createKbSearchProvider(allMatchDeps);
    allMatchProvider.search("common");
    await vi.waitFor(() => {
      const { totalCached } = allMatchProvider.search("common");
      expect(totalCached).toBe(3);
    });

    const state = makeState();
    await allMatchProvider.fullSearch!("common", state, vi.fn());

    expect(state.matchCount).toBe(3);
    expect(allMatchDeps.fetchBodies).not.toHaveBeenCalled();
  });
});

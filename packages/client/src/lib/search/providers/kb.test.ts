import { describe, it, expect, vi } from "vitest";
import {
  createKbSearchProvider,
  type KBSearchProviderDeps,
  type RawKBItem,
} from "./kb.js";

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

/**
 * KB search provider. Lazy-loads all articles on first search, decrypts
 * titles and body excerpts into a SvelteMap cache, then filters in-memory
 * with fuzzy matching on subsequent searches.
 *
 * Cache is registered with CacheRegistry so logout clears it.
 *
 * Design: KB is org-key encrypted (non-PII tier), so all volunteers can
 * decrypt all articles. Scale is dozens to low hundreds, making client-side
 * full-text search practical. The server cannot search encrypted content.
 *
 * KBResultItem wraps ArticleCard so search results match the library page
 * visual language exactly (category badge, title, excerpt, thumbs votes,
 * author, timestamp).
 */
import { SvelteSet } from "svelte/reactivity";
import type {
  FullSearchState,
  SearchProvider,
  SearchResult,
} from "../types.js";
import type { Component } from "svelte";
import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
import { BookOpen } from "@lucide/svelte";
import { cacheRegistry } from "$lib/crypto/cache-registry.js";
import { fuzzySearch } from "../fuzzy.js";
import * as m from "$lib/paraglide/messages.js";
import KBResultItem from "$lib/components/search/KBResultItem.svelte";

/** Display-ready data passed to KBResultItem (mirrors ArticleCard props). */
export interface KBSearchData {
  readonly articleId: string;
  readonly categoryId: string;
  readonly titleResult: DecryptResult;
  readonly excerptResult: DecryptResult;
  readonly categoryName: string | null;
  readonly authorName: string | null;
  readonly rating: number;
  readonly voteUpCount: number;
  readonly voteTotalCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Raw article record shape from the server (listItems response). */
export interface RawKBItem {
  readonly id: string;
  readonly categoryId: string;
  readonly encryptedTitle: unknown;
  readonly encryptedExcerpt: unknown;
  readonly createdBy: string;
  readonly voteUpCount: number;
  readonly voteDownCount: number;
  readonly rating: number;
  readonly createdAt: Date | string;
  readonly updatedAt: Date | string;
}

/** Cached record: decrypted text for fuzzy search + raw fields for display. */
interface CachedKBArticle {
  readonly raw: RawKBItem;
  readonly title: string;
  readonly bodyExcerpt: string;
}

/** Dependency injection for testability. */
export interface KBSearchProviderDeps {
  /** Fetch a page of articles from the server. Returns items + next cursor + total. */
  readonly fetchPage: (cursor: string | undefined) => Promise<{
    items: readonly RawKBItem[];
    nextCursor: string | null;
    total?: number;
  }>;
  /** Decrypt an org-key ciphertext. Returns plaintext string or null if key not loaded / decrypt fails. */
  readonly decryptOrg: (cacheKey: string, ciphertext: unknown) => string | null;
  /** Resolve a category name from its ID (reactive, reads OrgDecryptCache). */
  readonly resolveCategoryName: (categoryId: string) => string | null;
  /** Resolve an author display name from user ID (reactive). */
  readonly resolveAuthorName: (userId: string) => string | null;
  /** Pre-populate the categories query cache so resolveCategoryName works on first search. */
  readonly ensureCategoriesLoaded: () => Promise<void>;
  /** Fetch encrypted article bodies for full-text search. Max 200 items. */
  readonly fetchBodies?: (
    itemIds: string[],
  ) => Promise<readonly { id: string; encryptedBody: unknown }[]>;
}

const EXCERPT_MAX_CHARS = 200;

export function createKbSearchProvider(
  deps: KBSearchProviderDeps,
): SearchProvider<KBSearchData> {
  const cache = cacheRegistry.createMap<string, CachedKBArticle>("KBSearch");
  const contentMatchIds = new SvelteSet<string>();
  let lastFullSearchQuery = "";
  let deepSearchActive = false;
  let loaded = false;
  let loading = false;
  let totalItemCount: number | undefined;

  async function loadAll(): Promise<void> {
    if (loaded || loading) return;
    loading = true;
    try {
      // Pre-populate the categories cache so category names resolve
      // in search results even before the library page is visited.
      await deps.ensureCategoriesLoaded();
      let cursor: string | undefined;
      do {
        const page = await deps.fetchPage(cursor);
        if (page.total !== undefined) totalItemCount = page.total;
        for (const item of page.items) {
          if (cache.has(item.id)) continue;
          const title = deps.decryptOrg(
            `kb-search:${item.id}:title`,
            item.encryptedTitle,
          );
          const bodyRaw = deps.decryptOrg(
            `kb-search:${item.id}:excerpt`,
            item.encryptedExcerpt,
          );
          if (title === null) continue;
          cache.set(item.id, {
            raw: item,
            title,
            bodyExcerpt:
              bodyRaw !== null ? bodyRaw.slice(0, EXCERPT_MAX_CHARS) : "",
          });
        }
        cursor = page.nextCursor ?? undefined;
      } while (cursor !== undefined);
      loaded = true;
    } finally {
      loading = false;
    }
  }

  const provider: SearchProvider<KBSearchData> = {
    id: "kb",
    label: () => m.search_section_kb(),
    icon: BookOpen as Component,
    renderMode: "card-strip",
    showAllHref: (query) => `/library?q=${encodeURIComponent(query)}`,
    getResultHref: (id) => `/library/${id}`,

    search(query) {
      if (!loaded && !loading) void loadAll();
      if (cache.size === 0) {
        return { results: [], loading, totalCached: 0 };
      }

      // Build parallel arrays for fuzzy search.
      const ids: string[] = [];
      const haystack: string[] = [];
      for (const [id, cached] of cache) {
        ids.push(id);
        haystack.push(`${cached.title} ${cached.bodyExcerpt}`);
      }

      const matches = fuzzySearch(haystack, query);
      const results: SearchResult<KBSearchData>[] = [];
      const seen = new Set<string>();

      for (const match of matches) {
        const id = ids[match.index];
        if (id === undefined) continue;
        const cached = cache.get(id);
        if (cached === undefined) continue;
        seen.add(id);
        results.push({ id, data: buildSearchData(deps, cached) });
      }

      if (query === lastFullSearchQuery && contentMatchIds.size > 0) {
        for (const [id, cached] of cache) {
          if (contentMatchIds.has(id) && !seen.has(id)) {
            seen.add(id);
            results.push({ id, data: buildSearchData(deps, cached) });
          }
        }
      }

      return {
        results: deepSearchActive ? results : results.slice(0, 5),
        loading,
        totalCached: cache.size,
        totalItems: totalItemCount,
      };
    },

    ResultItem: KBResultItem as Component<{
      result: KBSearchData;
      ontap: (id: string) => void;
    }>,

    getContentMatchIds(): ReadonlySet<string> {
      return contentMatchIds;
    },

    reset() {
      contentMatchIds.clear();
      lastFullSearchQuery = "";
      deepSearchActive = false;
    },
  };

  if (deps.fetchBodies) {
    const fetchBodies = deps.fetchBodies;

    provider.fullSearch = async (
      query: string,
      state: FullSearchState,
      onProgress: () => void,
    ): Promise<void> => {
      contentMatchIds.clear();
      lastFullSearchQuery = query;

      await loadAll();

      deepSearchActive = true;
      const titleMatchIds = new Set(
        provider.search(query).results.map((r) => r.id),
      );
      deepSearchActive = false;
      state.matchCount = titleMatchIds.size;
      state.total = cache.size;
      state.searched = cache.size;
      onProgress();

      const nonMatchingIds: string[] = [];
      for (const [id] of cache) {
        if (!titleMatchIds.has(id)) nonMatchingIds.push(id);
      }

      if (nonMatchingIds.length === 0) return;

      let bodies: readonly { id: string; encryptedBody: unknown }[];
      try {
        bodies = await fetchBodies(nonMatchingIds);
      } catch {
        return;
      }

      for (const body of bodies) {
        if (contentMatchIds.has(body.id)) continue;
        const plaintext = deps.decryptOrg(
          `kb-search:${body.id}:body`,
          body.encryptedBody,
        );
        if (plaintext === null) continue;

        if (fuzzySearch([plaintext], query).length > 0) {
          contentMatchIds.add(body.id);
          state.matchCount++;
          onProgress();
        }
      }
    };
  }

  return provider;
}

function buildSearchData(
  deps: KBSearchProviderDeps,
  cached: CachedKBArticle,
): KBSearchData {
  return {
    articleId: cached.raw.id,
    categoryId: cached.raw.categoryId,
    titleResult: { status: "ready", value: cached.title },
    excerptResult:
      cached.bodyExcerpt.length > 0
        ? { status: "ready", value: cached.bodyExcerpt }
        : { status: "loading" },
    categoryName: deps.resolveCategoryName(cached.raw.categoryId),
    authorName: deps.resolveAuthorName(cached.raw.createdBy),
    rating: cached.raw.rating,
    voteUpCount: cached.raw.voteUpCount,
    voteTotalCount: cached.raw.voteUpCount + cached.raw.voteDownCount,
    createdAt: new Date(cached.raw.createdAt),
    updatedAt: new Date(cached.raw.updatedAt),
  };
}

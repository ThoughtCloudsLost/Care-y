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
import type { SearchProvider, SearchResult } from "../types.js";
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
  /** Fetch a page of articles from the server. Returns items + next cursor. */
  readonly fetchPage: (cursor: string | undefined) => Promise<{
    items: readonly RawKBItem[];
    nextCursor: string | null;
  }>;
  /** Decrypt an org-key ciphertext. Returns plaintext string or null if key not loaded / decrypt fails. */
  readonly decryptOrg: (cacheKey: string, ciphertext: unknown) => string | null;
  /** Resolve a category name from its ID (reactive, reads OrgDecryptCache). */
  readonly resolveCategoryName: (categoryId: string) => string | null;
  /** Resolve an author display name from user ID (reactive). */
  readonly resolveAuthorName: (userId: string) => string | null;
  /** Pre-populate the categories query cache so resolveCategoryName works on first search. */
  readonly ensureCategoriesLoaded: () => Promise<void>;
}

const EXCERPT_MAX_CHARS = 200;

export function createKbSearchProvider(
  deps: KBSearchProviderDeps,
): SearchProvider<KBSearchData> {
  const cache = cacheRegistry.createMap<string, CachedKBArticle>("KBSearch");
  let loaded = false;
  let loading = false;

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

  return {
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
      for (const match of matches) {
        const id = ids[match.index];
        if (id === undefined) continue;
        const cached = cache.get(id);
        if (cached === undefined) continue;

        // Resolve category name and author name reactively. These read from
        // OrgDecryptCache (SvelteMap), so $derived tracks the reads.
        const categoryName = deps.resolveCategoryName(cached.raw.categoryId);
        const authorName = deps.resolveAuthorName(cached.raw.createdBy);

        results.push({
          id,
          data: {
            articleId: cached.raw.id,
            categoryId: cached.raw.categoryId,
            titleResult: { status: "ready", value: cached.title },
            excerptResult:
              cached.bodyExcerpt.length > 0
                ? { status: "ready", value: cached.bodyExcerpt }
                : { status: "loading" },
            categoryName,
            authorName,
            rating: cached.raw.rating,
            voteUpCount: cached.raw.voteUpCount,
            voteTotalCount: cached.raw.voteUpCount + cached.raw.voteDownCount,
            createdAt: new Date(cached.raw.createdAt),
            updatedAt: new Date(cached.raw.updatedAt),
          },
        });
      }

      return { results: results.slice(0, 5), loading, totalCached: cache.size };
    },

    ResultItem: KBResultItem as Component<{
      result: KBSearchData;
      ontap: (id: string) => void;
    }>,
  };
}

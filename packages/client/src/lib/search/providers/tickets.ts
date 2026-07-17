import { SvelteSet } from "svelte/reactivity";
import type {
  FullSearchState,
  SearchProvider,
  SearchResult,
} from "../types.js";
import { fuzzySearch } from "../fuzzy.js";
import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
import {
  mapTicketDisplayFields,
  type TicketDisplayFieldDeps,
  type TicketDisplayFields,
  type TicketLikeRecord,
} from "$lib/tickets/ticket-card-props.js";
import { DECRYPT_ERROR_SENTINEL } from "$lib/crypto/async-decrypt-cache.js";
import TicketSearchResult from "$lib/components/search/TicketSearchResult.svelte";
import { Ticket } from "@lucide/svelte";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";

/**
 * Raw ticket record from the TanStack Query cache. Carries encrypted
 * fields that the provider decrypts reactively during search(). The
 * shape is the same record every ticket surface consumes, so it aliases
 * the card mapper's record type (encrypted blobs stay `unknown`; the
 * decrypt trigger functions handle the actual narrowing).
 */
export type RawCachedTicket = TicketLikeRecord;

/**
 * Display-ready ticket data for search result rendering: the shared
 * display-field core plus the provider's search-specific extras.
 */
export interface TicketSearchData extends TicketDisplayFields {
  readonly encryptedTitle: unknown;
  readonly unreadCount: number;
  readonly previewFollowUps: RawFollowUpPreview[] | undefined;
  /** The query that produced this result; renders the <mark> highlights. */
  readonly searchTerm: string;
}

interface KeyWrap {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedKey: string;
}

/**
 * Dependency injection for the ticket search provider.
 *
 * Design principle: decrypt trigger functions, not read-only getters.
 * The provider's search() calls these in a $derived context, so reactive
 * SvelteMap reads inside them are automatically tracked. When a decrypt
 * cache updates (e.g., Web Worker finishes), the $derived re-evaluates
 * and search results update.
 */
export interface TicketSearchProviderDeps {
  readonly getAllCachedTickets: () => readonly RawCachedTicket[];
  readonly decryptTitle: (
    ticketId: string,
    keyWrap: unknown,
    encryptedTitle: unknown,
  ) => string | undefined;
  /** Org-tier decrypt keyed the same way the card mapper keys it
   * (`queue:{queueId}`, `assignee:{userId}`). */
  readonly orgDecrypt: (cacheKey: string, ciphertext: unknown) => string | null;
  /** Viewer id for the shared core's self-assignment ("You") check. */
  readonly currentUserId: () => string | undefined;
  readonly getPreviewFollowUps: (
    ticketId: string,
  ) => RawFollowUpPreview[] | undefined;
  readonly getTotalItemCount?: () => number | undefined;

  // -- Full search deps --

  readonly listAll?: (cursor?: string) => Promise<readonly RawCachedTicket[]>;
  /** Set the full-search cache entry in TanStack (single key, accumulated). */
  readonly ingestTickets?: (tickets: readonly RawCachedTicket[]) => void;
  /** Resolves when all pending decrypts in TicketDecryptCache have completed. */
  readonly whenDecryptsSettled?: () => Promise<void>;
  /** Trigger + read follow-up content decryption through TicketDecryptCache. */
  readonly decryptFollowUp?: (
    ticketId: string,
    followupId: string,
    keyWrap: KeyWrap,
    ciphertext: string,
  ) => string | undefined;
  /** Clear cached decrypted follow-up content (called on search close). */
  readonly clearFollowUpCache?: () => void;
  /** Fetch encrypted follow-up content for specific tickets. */
  readonly contentSearch?: (
    ticketIds: string[],
    page: number,
    pageSize: number,
  ) => Promise<{
    followups: readonly {
      ticketId: string;
      followupId: string;
      encryptedContent: string;
    }[];
    total: number;
  }>;
}

export function createTicketSearchProvider(
  deps: TicketSearchProviderDeps,
): SearchProvider<TicketSearchData> {
  // Content matches from fullSearch content search, keyed by ticket ID.
  // SvelteSet so search() reads are tracked in $derived contexts.
  const contentMatchIds = new SvelteSet<string>();
  let lastFullSearchQuery = "";

  function composeSearchData(
    raw: RawCachedTicket,
    fields: TicketDisplayFields,
    query: string,
  ): TicketSearchData {
    return {
      ...fields,
      searchTerm: query,
      encryptedTitle: raw.encryptedTitle,
      unreadCount: 0,
      previewFollowUps: deps.getPreviewFollowUps(raw.id),
    };
  }

  const provider: SearchProvider<TicketSearchData> = {
    id: "tickets",
    label: () => m.search_section_tickets(withTerms()),
    icon: Ticket,
    renderMode: "card-strip",
    showAllHref: (query) => `/tickets?q=${encodeURIComponent(query)}`,
    getResultHref: (id: string) => `/tickets/${id}`,
    emptyText: (query: string) => m.search_empty_tickets(withTerms({ query })),
    coverage: (c) => {
      if (c.fullSearch === "searching") {
        return m.search_coverage_searching({
          searched: c.fsSearched,
          total: c.fsTotal,
        });
      }
      if (c.searched === 0 && c.total == null) return undefined;
      if (c.total != null && c.total > c.searched) {
        return m.search_coverage_tickets(
          withTerms({ searched: c.searched, total: c.total }),
        );
      }
      return m.search_coverage_tickets_all(
        withTerms({ total: c.total ?? c.searched }),
      );
    },
    fullSearchLabel: (searched, total) =>
      total != null && total > searched
        ? m.search_fetch_more_tickets(withTerms({ count: total - searched }))
        : undefined,

    search(query: string) {
      const rawTickets = deps.getAllCachedTickets();
      const fieldDeps: TicketDisplayFieldDeps = {
        orgDecrypt: deps.orgDecrypt,
        decryptTitle: deps.decryptTitle,
        currentUserId: deps.currentUserId() ?? "",
      };

      const searchable: {
        raw: RawCachedTicket;
        title: string;
        fields: TicketDisplayFields;
      }[] = [];
      for (const raw of rawTickets) {
        const title = deps.decryptTitle(
          raw.id,
          raw.keyWrap,
          raw.encryptedTitle,
        );
        if (title === undefined) continue;
        searchable.push({
          raw,
          title,
          fields: mapTicketDisplayFields(raw, fieldDeps),
        });
      }

      // Queue and assignee resolve from shared org-tier caches (one decrypt
      // per queue/user, not per ticket), so widening the match fields adds
      // no per-ticket decrypt work. Null while a decrypt settles simply
      // doesn't match until it resolves.
      const haystack = searchable.map((s) =>
        [
          s.title,
          s.raw.clientAlias,
          s.fields.queueName ?? "",
          s.fields.assignedName ?? "",
        ]
          .join(" ")
          .trim(),
      );
      const matches = fuzzySearch(haystack, query);

      const results: SearchResult<TicketSearchData>[] = [];

      const seen = new Set<string>();

      for (const match of matches) {
        const entry = searchable[match.index];
        if (!entry) continue;
        seen.add(entry.raw.id);
        results.push({
          id: entry.raw.id,
          data: composeSearchData(entry.raw, entry.fields, query),
        });
      }

      // Include content-matched tickets from fullSearch content search.
      // SvelteSet.has() is tracked in $derived, so additions from async
      // fullSearch trigger re-evaluation automatically.
      if (query === lastFullSearchQuery && contentMatchIds.size > 0) {
        for (const entry of searchable) {
          if (contentMatchIds.has(entry.raw.id) && !seen.has(entry.raw.id)) {
            seen.add(entry.raw.id);
            results.push({
              id: entry.raw.id,
              data: composeSearchData(entry.raw, entry.fields, query),
            });
          }
        }
      }

      return {
        results,
        loading: false,
        totalCached: rawTickets.length,
        totalItems: deps.getTotalItemCount?.(),
      };
    },

    ResultItem: TicketSearchResult,

    resolveById(id: string): SearchResult<TicketSearchData> | undefined {
      const raw = deps.getAllCachedTickets().find((t) => t.id === id);
      if (!raw) return undefined;
      // Same decrypt trigger as search(): undefined while the title is
      // still decrypting, and the $derived caller re-evaluates when the
      // cache settles.
      const title = deps.decryptTitle(raw.id, raw.keyWrap, raw.encryptedTitle);
      if (title === undefined) return undefined;
      const fieldDeps: TicketDisplayFieldDeps = {
        orgDecrypt: deps.orgDecrypt,
        decryptTitle: deps.decryptTitle,
        currentUserId: deps.currentUserId() ?? "",
      };
      return {
        id,
        data: composeSearchData(
          raw,
          mapTicketDisplayFields(raw, fieldDeps),
          "",
        ),
      };
    },

    getContentMatchIds(): ReadonlySet<string> {
      return contentMatchIds;
    },

    reset() {
      contentMatchIds.clear();
      lastFullSearchQuery = "";
      deps.clearFollowUpCache?.();
    },
  };

  const hasFullSearchDeps =
    deps.listAll &&
    deps.ingestTickets &&
    deps.whenDecryptsSettled &&
    deps.contentSearch &&
    deps.decryptFollowUp;

  if (hasFullSearchDeps) {
    const listAll = deps.listAll;
    const ingestTickets = deps.ingestTickets;
    const whenDecryptsSettled = deps.whenDecryptsSettled;
    const contentSearch = deps.contentSearch;
    const decryptFollowUp = deps.decryptFollowUp;

    provider.fullSearch = async (
      query: string,
      state: FullSearchState,
      onProgress: () => void,
    ): Promise<void> => {
      const PAGE_SIZE = 100;
      const CONTENT_PAGE_SIZE = 50;

      contentMatchIds.clear();
      lastFullSearchQuery = query;

      // -- title search: load all tickets into TanStack cache, decrypt titles --
      let cursor: string | undefined;
      let totalLoaded = 0;
      const allTickets: RawCachedTicket[] = [];
      const allTicketIds: string[] = [];
      const ticketKeyWraps = new Map<string, KeyWrap>();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- loop breaks on short page
      while (true) {
        let page: readonly RawCachedTicket[];
        try {
          page = await listAll(cursor);
        } catch {
          break;
        }

        totalLoaded += page.length;
        state.searched = totalLoaded;
        onProgress();

        for (const ticket of page) {
          allTickets.push(ticket);
          deps.decryptTitle(ticket.id, ticket.keyWrap, ticket.encryptedTitle);
          allTicketIds.push(ticket.id);
          const kw = asKeyWrap(ticket.keyWrap);
          if (kw) ticketKeyWraps.set(ticket.id, kw);
        }

        if (page.length < PAGE_SIZE) break;
        const lastTicket = page[page.length - 1];
        if (!lastTicket) break;
        cursor = lastTicket.id;
      }

      state.total = totalLoaded;
      onProgress();

      ingestTickets(allTickets);
      await whenDecryptsSettled();

      // Title matches come from the reactive search() pipeline.
      // No duplicated fuzzy logic here.
      const titleMatchIds = new Set(
        provider.search(query).results.map((r) => r.id),
      );
      state.matchCount = titleMatchIds.size;
      onProgress();

      // -- content search: follow-up content search for non-matching tickets --
      const nonMatchingIds = allTicketIds.filter(
        (id) => !titleMatchIds.has(id) && ticketKeyWraps.has(id),
      );
      if (nonMatchingIds.length === 0) return;

      let contentPage = 1;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- loop breaks on short page
      while (true) {
        let batch: Awaited<ReturnType<typeof contentSearch>>;
        try {
          batch = await contentSearch(
            nonMatchingIds,
            contentPage,
            CONTENT_PAGE_SIZE,
          );
        } catch {
          break;
        }

        // Trigger decrypts for all follow-ups in this batch
        const pendingFollowUps: {
          ticketId: string;
          followupId: string;
          kw: KeyWrap;
          ciphertext: string;
        }[] = [];

        for (const fu of batch.followups) {
          if (
            titleMatchIds.has(fu.ticketId) ||
            contentMatchIds.has(fu.ticketId)
          )
            continue;
          const kw = ticketKeyWraps.get(fu.ticketId);
          if (!kw) continue;
          decryptFollowUp(fu.ticketId, fu.followupId, kw, fu.encryptedContent);
          pendingFollowUps.push({
            ticketId: fu.ticketId,
            followupId: fu.followupId,
            kw,
            ciphertext: fu.encryptedContent,
          });
        }

        await whenDecryptsSettled();

        // Check decrypted content for matches
        for (const pf of pendingFollowUps) {
          if (contentMatchIds.has(pf.ticketId)) continue;
          const plaintext = decryptFollowUp(
            pf.ticketId,
            pf.followupId,
            pf.kw,
            pf.ciphertext,
          );
          if (
            plaintext !== undefined &&
            plaintext !== DECRYPT_ERROR_SENTINEL &&
            fuzzySearch([plaintext], query).length > 0
          ) {
            contentMatchIds.add(pf.ticketId);
            state.matchCount++;
            onProgress();
          }
        }

        state.searched = totalLoaded + contentPage * CONTENT_PAGE_SIZE;
        onProgress();

        if (batch.followups.length < CONTENT_PAGE_SIZE) break;
        contentPage++;
      }
    };
  }

  return provider;
}

function asKeyWrap(val: unknown): KeyWrap | null {
  if (
    typeof val === "object" &&
    val !== null &&
    "ephemeralPoint" in val &&
    "nonce" in val &&
    "wrappedKey" in val &&
    typeof (val as Record<string, unknown>).ephemeralPoint === "string" &&
    typeof (val as Record<string, unknown>).nonce === "string" &&
    typeof (val as Record<string, unknown>).wrappedKey === "string"
  ) {
    const obj: Record<string, unknown> = val;
    return {
      ephemeralPoint: String(obj.ephemeralPoint),
      nonce: String(obj.nonce),
      wrappedKey: String(obj.wrappedKey),
    };
  }
  return null;
}

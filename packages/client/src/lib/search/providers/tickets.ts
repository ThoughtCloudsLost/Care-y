import type {
  FullSearchState,
  SearchProvider,
  SearchResult,
} from "../types.js";
import { fuzzySearch } from "../fuzzy.js";
import type { DisplayStatus } from "$lib/tickets/display-status.js";
import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
import TicketSearchResult from "$lib/components/search/TicketSearchResult.svelte";
import { Ticket } from "@lucide/svelte";
import * as m from "$lib/paraglide/messages.js";

/**
 * Raw ticket record from the TanStack Query cache. Carries encrypted
 * fields that the provider decrypts reactively during search().
 *
 * Field types are intentionally loose (unknown for encrypted blobs)
 * because the query cache stores the server's response shape. The
 * decrypt trigger functions in TicketSearchProviderDeps handle the
 * actual type narrowing.
 */
export interface RawCachedTicket {
  readonly id: string;
  readonly queueId: string;
  readonly encryptedQueueName: unknown;
  readonly status: string;
  readonly onHold: boolean;
  readonly priority: "low" | "normal" | "high" | "urgent";
  readonly encryptedTitle: unknown;
  readonly keyWrap: unknown;
  readonly clientAlias: string;
  readonly assignedTo: string | null;
  readonly assignedDisplayName: unknown;
  readonly createdAt: string;
  readonly lastActivityAt: string | null;
  readonly followUpCount: number;
}

/**
 * Display-ready ticket data for search result rendering.
 * Subset of TicketCardProps (omits action callbacks, selection state).
 */
export interface TicketSearchData {
  readonly ticketId: string;
  readonly queueName: string | null;
  readonly displayStatus: DisplayStatus;
  readonly priority: "low" | "normal" | "high" | "urgent";
  readonly title: string | undefined;
  readonly encryptedTitle: unknown;
  readonly clientAlias: string;
  readonly assignedName: string | null;
  readonly createdAt: Date;
  readonly lastActivityAt: Date | null;
  readonly followUpCount: number;
  readonly unreadCount: number;
  readonly previewFollowUps: RawFollowUpPreview[] | undefined;
}

/**
 * Dependency injection for the ticket search provider.
 *
 * Design principle: decrypt trigger functions, not read-only getters.
 * The provider's search() calls these in a $derived context, so reactive
 * SvelteMap reads inside them are automatically tracked. When a decrypt
 * cache updates (e.g., Web Worker finishes), the $derived re-evaluates
 * and search results update. Future providers should follow this same
 * pattern: pass decrypt triggers as deps, call them in search().
 */
export interface TicketSearchProviderDeps {
  /** Flat, deduplicated ticket records from the query cache. */
  readonly getAllCachedTickets: () => readonly RawCachedTicket[];
  /**
   * Trigger + read title decryption. First call for a ticket fires the
   * async Worker decrypt and returns undefined. Subsequent calls return
   * the cached plaintext. Reactive: reads from TicketDecryptCache (SvelteMap).
   */
  readonly decryptTitle: (
    ticketId: string,
    keyWrap: unknown,
    encryptedTitle: unknown,
  ) => string | undefined;
  /** Org-tier decrypt for queue name. Synchronous. */
  readonly decryptQueueName: (
    queueId: string,
    ciphertext: unknown,
  ) => string | null;
  /** Resolve assigned volunteer display name. */
  readonly resolveAssignedName: (
    assignedTo: string | null,
    ciphertext: unknown,
  ) => string | null;
  /** Read preview follow-ups from the preview loader cache. */
  readonly getPreviewFollowUps: (
    ticketId: string,
  ) => RawFollowUpPreview[] | undefined;
  /** Derive display status from raw status fields. Accepts string
   *  because the query cache stores the server's string value. */
  readonly deriveDisplayStatus: (
    status: "open" | "closed",
    onHold: boolean,
    followUpCount: number,
  ) => DisplayStatus;
  /**
   * Optional: full search implementation for server-backed search.
   * Called when user taps "Search all". Omit to disable full search.
   */
  readonly fullSearch?: (
    query: string,
    state: FullSearchState<TicketSearchData>,
  ) => Promise<void>;
}

export function createTicketSearchProvider(
  deps: TicketSearchProviderDeps,
): SearchProvider<TicketSearchData> {
  const provider: SearchProvider<TicketSearchData> = {
    id: "tickets",
    label: () => m.search_section_tickets(),
    icon: Ticket,
    renderMode: "card-strip",
    showAllHref: () => "/tickets",
    getResultHref: (id: string) => `/tickets/${id}`,

    search(query: string) {
      const rawTickets = deps.getAllCachedTickets();

      // Decrypt titles and build searchable haystack.
      // decryptTitle() triggers the async Worker decrypt on first call.
      // Tickets with undefined titles (decrypt pending) are excluded.
      // When the decrypt completes, the SvelteMap update triggers
      // $derived re-evaluation and this function runs again.
      const searchable: { raw: RawCachedTicket; title: string }[] = [];
      for (const raw of rawTickets) {
        const title = deps.decryptTitle(
          raw.id,
          raw.keyWrap,
          raw.encryptedTitle,
        );
        if (title === undefined) continue;
        searchable.push({ raw, title });
      }

      // Fuzzy match on "title clientAlias".
      const haystack = searchable.map((s) => `${s.title} ${s.raw.clientAlias}`);
      const matches = fuzzySearch(haystack, query);

      // Map matched raw records to display-ready TicketSearchData.
      // All decrypt calls here are reactive (run inside $derived context).
      const results: SearchResult<TicketSearchData>[] = [];
      for (const match of matches) {
        const entry = searchable[match.index];
        if (!entry) continue;
        const { raw, title } = entry;

        results.push({
          id: raw.id,
          data: {
            ticketId: raw.id,
            queueName: deps.decryptQueueName(
              raw.queueId,
              raw.encryptedQueueName,
            ),
            displayStatus: deps.deriveDisplayStatus(
              raw.status === "closed" ? "closed" : "open",
              raw.onHold,
              raw.followUpCount,
            ),
            priority: raw.priority,
            title,
            encryptedTitle: raw.encryptedTitle,
            clientAlias: raw.clientAlias,
            assignedName: deps.resolveAssignedName(
              raw.assignedTo,
              raw.assignedDisplayName,
            ),
            createdAt: new Date(raw.createdAt),
            lastActivityAt:
              raw.lastActivityAt !== null ? new Date(raw.lastActivityAt) : null,
            followUpCount: raw.followUpCount,
            unreadCount: 0,
            previewFollowUps: deps.getPreviewFollowUps(raw.id),
          },
        });
      }

      return { results, loading: false, totalCached: rawTickets.length };
    },

    ResultItem: TicketSearchResult,
  };

  if (deps.fullSearch) {
    provider.fullSearch = deps.fullSearch;
  }

  return provider;
}

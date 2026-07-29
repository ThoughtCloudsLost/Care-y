import type { SearchProvider, SearchResult } from "../types.js";
import { fuzzySearch } from "../fuzzy.js";
import { MessageSquareText } from "@lucide/svelte";
import * as m from "$lib/paraglide/messages.js";
import ConversationSearchResult from "$lib/components/search/ConversationSearchResult.svelte";
import { followUpKind } from "$lib/tickets/follow-up-utils.js";
import { DECRYPT_ERROR_SENTINEL } from "$lib/crypto/async-decrypt-cache.js";

export interface ConversationSearchData {
  readonly followUpId: string;
  readonly source: string;
  readonly type: string;
  readonly kind: "message" | "system" | "note" | "article";
  readonly plaintext: string;
  readonly searchTerm: string;
  readonly authorName: string | undefined;
  readonly createdAt: string;
  /** Number of non-matching messages before this result (for gap indicators). */
  readonly gapBefore: number;
}

export interface ConversationSearchProviderDeps {
  readonly getFollowUps: () => readonly {
    readonly id: string;
    readonly source: string;
    readonly type: string;
    readonly encryptedContent: string;
    readonly createdBy: string | null;
    readonly createdAt: string;
  }[];
  readonly getDecryptedContent: (followUpId: string) => string | undefined;
  readonly resolveAuthorName: (
    source: string,
    createdBy: string | null,
  ) => string | undefined;
  readonly getTotalFollowUpCount: () => number;
  readonly getTicketId: () => string;
  readonly onviewall: (query: string) => void;
  readonly onresulttap: (id: string, query: string) => void;
}

const MAX_PREVIEW_RESULTS = 3;

export function createConversationSearchProvider(
  deps: ConversationSearchProviderDeps,
): SearchProvider<ConversationSearchData> {
  const provider: SearchProvider<ConversationSearchData> = {
    id: "conversation",
    label: () => m.search_section_conversation(),
    icon: MessageSquareText,
    renderMode: "list",
    showAllHref: () => `/tickets/${deps.getTicketId()}`,
    getResultHref: (id: string) => `/tickets/${deps.getTicketId()}#fu-${id}`,
    emptyText: () => m.search_conversation_no_matches(),
    coverage: (c) =>
      c.total != null
        ? m.search_conversation_scope({ searched: c.searched, total: c.total })
        : undefined,

    search(query: string) {
      const followUps = deps.getFollowUps();

      interface SearchableEntry {
        fu: (typeof followUps)[number];
        plaintext: string;
        originalIndex: number;
      }

      const searchable: SearchableEntry[] = [];
      for (let i = 0; i < followUps.length; i++) {
        const fu = followUps[i]; // eslint-disable-line security/detect-object-injection -- i is a loop counter bounded by followUps.length
        if (fu === undefined) continue;
        const plaintext = deps.getDecryptedContent(fu.id);
        if (plaintext === undefined || plaintext === DECRYPT_ERROR_SENTINEL) {
          continue;
        }
        searchable.push({ fu, plaintext, originalIndex: i });
      }

      const haystack = searchable.map((e) => e.plaintext);
      const fuzzyMatches = fuzzySearch(haystack, query);

      interface MatchWithIndex {
        result: SearchResult<ConversationSearchData>;
        originalIndex: number;
      }

      const allMatches: MatchWithIndex[] = [];
      for (const match of fuzzyMatches) {
        const entry = searchable[match.index];
        if (entry === undefined) continue;
        allMatches.push({
          result: {
            id: entry.fu.id,
            data: {
              followUpId: entry.fu.id,
              source: entry.fu.source,
              type: entry.fu.type,
              kind: followUpKind(entry.fu),
              plaintext: entry.plaintext,
              searchTerm: query,
              authorName: deps.resolveAuthorName(
                entry.fu.source,
                entry.fu.createdBy,
              ),
              createdAt: entry.fu.createdAt,
              gapBefore: 0,
            },
          },
          originalIndex: entry.originalIndex,
        });
      }

      // Sort by original conversation order (fuzzySearch returns by match quality).
      allMatches.sort((a, b) => a.originalIndex - b.originalIndex);

      const slice =
        allMatches.length > MAX_PREVIEW_RESULTS
          ? allMatches.slice(-MAX_PREVIEW_RESULTS)
          : allMatches;

      const results: SearchResult<ConversationSearchData>[] = slice.map(
        (entry, j) => {
          const prevIndex = j > 0 ? (slice[j - 1]?.originalIndex ?? -1) : -1;
          const gap = prevIndex >= 0 ? entry.originalIndex - prevIndex - 1 : 0;
          return {
            id: entry.result.id,
            data: { ...entry.result.data, gapBefore: gap },
          };
        },
      );

      return {
        results,
        loading: false,
        totalCached: searchable.length,
        totalItems: deps.getTotalFollowUpCount(),
        totalResults: allMatches.length,
      };
    },

    ResultItem: ConversationSearchResult,

    onviewall(query: string): void {
      deps.onviewall(query);
    },

    onresulttap(id: string, query: string): void {
      deps.onresulttap(id, query);
    },
  };

  return provider;
}

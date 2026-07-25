<!--
  Search flow demo: auto-types "housing" into the search field,
  shows instant results with highlight marks, a coverage line beat,
  escalation to deep search with paged progress, and descramble
  of escalation-only results.

  Uses the REAL ticket search provider factory (createTicketSearchProvider)
  with mock deps built from search fixture data. The real search registry
  handles provider registration, searchAll(), and fullSearch coordination.

  User input is NOT accepted during the scripted flow. The search field
  is readonly; the demo is watch-only. This keeps the script deterministic
  and avoids partial-query states that would confuse the caption bar.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { Page, Navbar } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { createDemoScript } from "$demo/engine/script.svelte.js";
  import type { DemoStep, DemoScript } from "$demo/engine/script.svelte.js";
  import { createRevealController } from "$demo/engine/reveal.svelte.js";
  import {
    createInstantCorpus,
    createEscalationCorpus,
  } from "$demo/fixtures/search.js";
  import type { SearchFixtureItem } from "$demo/fixtures/search.js";
  import {
    searchTyping,
    searchInstant,
    searchCoverage,
    searchEscalation,
    searchDeepResults,
  } from "$demo/fixtures/copy.js";
  import { demoSeed, demoReset } from "$lib/crypto/context";
  import {
    getTicketDecryptCache,
    getOrgDecryptCache,
  } from "$lib/crypto/context";
  import {
    registerSearchProvider,
    searchAll,
    resetFullSearch,
    runFullSearchForProvider,
  } from "$lib/search/registry.svelte.js";
  import { createTicketSearchProvider } from "$lib/search/providers/tickets.js";
  import type {
    TicketSearchProviderDeps,
    RawCachedTicket,
  } from "$lib/search/providers/tickets.js";
  import type { SearchResultGroup } from "$lib/search/types.js";
  import SearchSection from "$lib/components/search/SearchSection.svelte";
  import TicketResultStrip from "$lib/components/search/TicketResultStrip.svelte";
  import FullSearchPanel from "$lib/components/search/FullSearchPanel.svelte";
  import { Search as SearchIcon } from "@lucide/svelte";

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------

  interface Props {
    script?: DemoScript | undefined;
  }

  let { script = $bindable() }: Props = $props();

  // ---------------------------------------------------------------------------
  // Fixture data
  // ---------------------------------------------------------------------------

  const SEARCH_TERM = "housing";
  const TYPING_DELAY_MS = 100; // per-char

  function buildRawCachedTicket(item: SearchFixtureItem): RawCachedTicket {
    const fakeEncTitle = "x".repeat(item.title.length + 40);
    return {
      id: item.ticketId,
      queueId: `q-${item.queueName.toLowerCase()}`,
      encryptedQueueName: item.queueName,
      status: "open",
      onHold: false,
      priority: item.priority,
      encryptedTitle: fakeEncTitle,
      keyWrap: "demo-keywrap",
      clientAlias: item.clientAlias,
      assignedTo: null,
      assignedDisplayName: null,
      createdAt: new Date().toISOString(),
      lastActivityAt: null,
      followUpCount: 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Mutable state for the scripted flow
  // ---------------------------------------------------------------------------

  let queryText = $state("");
  let instantItems: SearchFixtureItem[] = $state([]);
  let escalationItems: SearchFixtureItem[] = $state([]);
  let allCachedTickets: RawCachedTicket[] = $state([]);
  let totalItemCount: number | undefined = $state(undefined);

  // Active abort controller for the scripted deep search simulation.
  let deepSearchAbort: AbortController | null = null;

  // Registry disposer for the current provider registration.
  let disposeProvider: (() => void) | null = null;

  // ---------------------------------------------------------------------------
  // Provider deps (mock implementation over fixture data)
  // ---------------------------------------------------------------------------

  function seedInstantCorpus(items: SearchFixtureItem[]): void {
    const titles: Record<string, string> = {};
    const orgValues: Record<string, string> = {};

    for (const item of items) {
      titles[item.ticketId] = item.title;
      orgValues[`queue:q-${item.queueName.toLowerCase()}`] = item.queueName;
    }

    demoSeed({ titles, orgValues });
  }

  function seedEscalationCorpus(items: SearchFixtureItem[]): void {
    const titles: Record<string, string> = {};
    const orgValues: Record<string, string> = {};

    for (const item of items) {
      titles[item.ticketId] = item.title;
      orgValues[`queue:q-${item.queueName.toLowerCase()}`] = item.queueName;
    }

    demoSeed({ titles, orgValues });
  }

  function buildProviderDeps(): TicketSearchProviderDeps {
    const ticketCache = getTicketDecryptCache();
    const orgCache = getOrgDecryptCache();

    return {
      getAllCachedTickets: () => allCachedTickets,

      decryptTitle: (
        ticketId: string,
        _keyWrap: unknown,
        _encryptedTitle: unknown,
      ): string | undefined => {
        return ticketCache.get(ticketId);
      },

      orgDecrypt: (cacheKey: string, _ciphertext: unknown): string | null => {
        return orgCache.decrypt(cacheKey, _ciphertext);
      },

      currentUserId: () => "demo-user-001",

      getPreviewFollowUps: (_ticketId: string) => undefined,

      getTotalItemCount: () => totalItemCount,

      // -- Full search deps --
      // Paging and 350ms progress beats live in runScriptedDeepSearch;
      // by the time the registry calls listAll the corpus is staged.
      listAll: async (
        _cursor?: string,
      ): Promise<readonly RawCachedTicket[]> => {
        // Single microtask: satisfies the async dep contract without
        // altering demo timing.
        await Promise.resolve();
        return escalationItems.map(buildRawCachedTicket);
      },

      ingestTickets: (tickets: readonly RawCachedTicket[]): void => {
        // Merge escalation tickets into the cached set
        const existingIds = new Set(allCachedTickets.map((t) => t.id));
        const newTickets = tickets.filter((t) => !existingIds.has(t.id));
        if (newTickets.length > 0) {
          allCachedTickets = [...allCachedTickets, ...newTickets];
        }
      },

      whenDecryptsSettled: async (): Promise<void> => {
        // Stub caches settle instantly
      },

      contentSearch: async (
        _ticketIds: string[],
        _page: number,
        _pageSize: number,
      ): Promise<{
        followups: readonly {
          ticketId: string;
          followupId: string;
          encryptedContent: string;
        }[];
        total: number;
      }> => {
        // No follow-up content search in the demo. The microtask await
        // satisfies the async dep contract.
        await Promise.resolve();
        return { followups: [], total: 0 };
      },

      decryptFollowUp: (
        _ticketId: string,
        _followupId: string,
        _keyWrap: { ephemeralPoint: string; nonce: string; wrappedKey: string },
        _ciphertext: string,
      ): string | undefined => {
        return undefined;
      },

      clearFollowUpCache: (): void => {
        // no-op
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Provider lifecycle
  // ---------------------------------------------------------------------------

  function registerProvider(): void {
    const deps = buildProviderDeps();
    const provider = createTicketSearchProvider(deps);
    disposeProvider = registerSearchProvider(provider);
  }

  function disposeAndClearProvider(): void {
    if (disposeProvider !== null) {
      disposeProvider();
      disposeProvider = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Reactive search results (driven by queryText changes)
  // ---------------------------------------------------------------------------

  const trimmedQuery = $derived(queryText.trim());
  const groups: readonly SearchResultGroup[] = $derived(
    searchAll(trimmedQuery),
  );
  const hasAnyResults = $derived(groups.some((g) => g.results.length > 0));

  // ---------------------------------------------------------------------------
  // Timer tracking for cleanup
  // ---------------------------------------------------------------------------

  let activeTimers: ReturnType<typeof setTimeout>[] = [];

  function trackedTimeout(
    fn: () => void,
    ms: number,
  ): ReturnType<typeof setTimeout> {
    const id = setTimeout(() => {
      activeTimers = activeTimers.filter((t) => t !== id);
      fn();
    }, ms);
    activeTimers.push(id);
    return id;
  }

  function clearAllTimers(): void {
    for (const id of activeTimers) {
      clearTimeout(id);
    }
    activeTimers = [];
  }

  // ---------------------------------------------------------------------------
  // Scripted behaviors
  // ---------------------------------------------------------------------------

  /**
   * Auto-type the search term character by character with a local timer.
   * Calls ctx.advance() when the full term has been typed.
   */
  function autoTypeSearch(ctx: { advance(): void }, signal: AbortSignal): void {
    let charIndex = 0;

    function typeNext(): void {
      if (signal.aborted) return;
      if (charIndex >= SEARCH_TERM.length) {
        ctx.advance();
        return;
      }
      charIndex += 1;
      queryText = SEARCH_TERM.slice(0, charIndex);
      trackedTimeout(typeNext, TYPING_DELAY_MS);
    }

    trackedTimeout(typeNext, TYPING_DELAY_MS);
  }

  /**
   * Run the scripted deep search: seed escalation corpus into caches,
   * add escalation tickets to the cached set, then trigger the real
   * registry's runFullSearchForProvider. Uses 350ms paged sleeps and
   * honors signal.aborted.
   */
  // Reads .aborted through a call so TS cannot narrow the property to
  // false across awaits (which would flag later checks as unreachable).
  function isAborted(signal: AbortSignal): boolean {
    return signal.aborted;
  }

  async function runScriptedDeepSearch(
    ctx: { advance(): void },
    signal: AbortSignal,
  ): Promise<void> {
    const PAGE_SLEEP_MS = 350;
    const escItems = createEscalationCorpus();
    escalationItems = escItems;

    // Update the total count to reflect all items
    totalItemCount = instantItems.length + escItems.length;

    // Simulate paged loading with sleeps
    for (let i = 0; i < escItems.length; i += 2) {
      if (isAborted(signal)) return;

      await new Promise<void>((resolve) => {
        trackedTimeout(resolve, PAGE_SLEEP_MS);
      });

      if (isAborted(signal)) return;

      // Seed each page's titles into the cache
      const pageItems = escItems.slice(i, i + 2);
      seedEscalationCorpus(pageItems);

      // Add these tickets to the cached set
      const newTickets = pageItems.map(buildRawCachedTicket);
      const existingIds = new Set(allCachedTickets.map((t) => t.id));
      const toAdd = newTickets.filter((t) => !existingIds.has(t.id));
      if (toAdd.length > 0) {
        allCachedTickets = [...allCachedTickets, ...toAdd];
      }
    }

    if (isAborted(signal)) return;

    // Trigger the real registry's full search so coverage lines update
    runFullSearchForProvider("tickets", trimmedQuery);

    // Short pause to let the UI show the searching state
    await new Promise<void>((resolve) => {
      trackedTimeout(resolve, PAGE_SLEEP_MS);
    });

    if (isAborted(signal)) return;

    ctx.advance();
  }

  // ---------------------------------------------------------------------------
  // Reset / restart
  // ---------------------------------------------------------------------------

  function resetFlow(): void {
    // Abort any in-flight deep search
    if (deepSearchAbort !== null) {
      deepSearchAbort.abort();
      deepSearchAbort = null;
    }

    clearAllTimers();
    resetFullSearch();
    disposeAndClearProvider();
    demoReset();

    // Reset mutable state
    queryText = "";
    instantItems = [];
    escalationItems = [];
    allCachedTickets = [];
    totalItemCount = undefined;
  }

  function initFlow(): void {
    // Build instant corpus and seed caches
    const corpus = createInstantCorpus();
    instantItems = corpus;
    totalItemCount = corpus.length + createEscalationCorpus().length;

    const rawTickets = corpus.map(buildRawCachedTicket);
    allCachedTickets = rawTickets;

    seedInstantCorpus(corpus);
    registerProvider();
  }

  // ---------------------------------------------------------------------------
  // Script steps
  // ---------------------------------------------------------------------------

  function buildSteps(): DemoStep[] {
    return [
      {
        id: "search-type",
        caption: searchTyping,
        advance: "event",
        enter(ctx) {
          deepSearchAbort = new AbortController();
          autoTypeSearch(ctx, deepSearchAbort.signal);
        },
      },
      {
        id: "search-instant",
        caption: searchInstant,
        advance: "auto",
        autoDelayMs: 2000,
      },
      {
        id: "search-coverage",
        caption: searchCoverage,
        advance: "tap",
        target: "coverage-line",
      },
      {
        id: "search-escalation",
        caption: searchEscalation,
        advance: "event",
        enter(ctx) {
          deepSearchAbort = new AbortController();
          void runScriptedDeepSearch(ctx, deepSearchAbort.signal);
        },
      },
      {
        id: "search-deep-results",
        caption: searchDeepResults,
        advance: "tap",
      },
      {
        id: "search-restart",
        caption: searchTyping,
        advance: "tap",
        enter() {
          // The restart step triggers a full reset and re-init
          resetFlow();
          initFlow();
        },
      },
    ];
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  onMount(() => {
    initFlow();

    const reveal = createRevealController();
    const steps = buildSteps();

    const ctx = {
      reveal,
      advance: (): void => {
        // Will be replaced by the script's own advance
      },
    };

    const demoScript = createDemoScript(steps, ctx);
    // Wire the ctx.advance to the script's advance
    ctx.advance = () => demoScript.advance();
    script = demoScript;

    return () => {
      resetFlow();
      reveal.reset();
      script = undefined;
    };
  });

  // ---------------------------------------------------------------------------
  // Noop handlers for SearchSection/SearchResults props
  // ---------------------------------------------------------------------------

  function noopDismiss(): void {
    // Demo does not dismiss the search overlay
  }

  function noopNavigate(_href: string): void {
    // Demo does not navigate
  }
</script>

<Page>
  <Navbar title={m.demo_search_label()} />

  <div class="search-demo-content">
    <!-- Scripted search input (readonly) -->
    <div class="search-input-bar">
      <SearchIcon size={16} class="search-icon" />
      <input
        type="text"
        class="search-input"
        value={queryText}
        readonly
        aria-label={m.demo_search_label()}
        placeholder={m.demo_search_placeholder()}
      />
    </div>

    <!-- Search results -->
    {#if trimmedQuery.length >= 2}
      {#each groups as group (group.providerId)}
        <SearchSection
          label={group.label}
          icon={group.icon}
          count={group.results.length}
          totalResults={group.totalResults}
          showAllHref={group.showAllHref}
          loading={group.loading}
          ondismiss={noopDismiss}
          onviewall={group.onviewall}
          onnavigate={noopNavigate}
          query={trimmedQuery}
          onFullSearch={() =>
            runFullSearchForProvider(group.providerId, trimmedQuery)}
          emptyText={group.emptyText}
          coverageText={group.coverageText}
          fetchMoreLabel={group.fetchMoreLabel}
        >
          {#if group.renderMode === "card-strip"}
            <TicketResultStrip
              results={group.results}
              providerId={group.providerId}
              ontap={(_id: string) => {
                /* Demo does not navigate on tap */
              }}
              loading={group.loading}
            />
          {/if}
        </SearchSection>
      {/each}

      <FullSearchPanel {groups} query={trimmedQuery} {hasAnyResults} />
    {:else}
      <div class="search-empty-state">
        <p>{m.demo_search_empty_hint()}</p>
      </div>
    {/if}
  </div>
</Page>

<style>
  .search-demo-content {
    padding-top: calc(var(--k-navbar-height, 44px) + env(safe-area-inset-top));
    overflow-y: auto;
    height: 100%;
  }

  .search-input-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: var(--space-md, 12px) var(--page-pad-x, 0.75rem);
    padding: 8px 12px;
    border-radius: 10px;
    background: var(--raised, #f2f2f7);
    border: 1px solid var(--hair-2, #d1d1d6);
  }

  .search-input-bar :global(.search-icon) {
    color: var(--muted, #86868b);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: var(--text-base, 0.84375rem);
    color: var(--ink, #1d1d1f);
    outline: none;
    min-width: 0;
  }

  .search-input::placeholder {
    color: var(--muted, #86868b);
  }

  .search-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xl, 24px) var(--space-md, 12px);
  }

  .search-empty-state p {
    color: var(--muted, #86868b);
    font-size: var(--text-sm, 0.875rem);
  }
</style>

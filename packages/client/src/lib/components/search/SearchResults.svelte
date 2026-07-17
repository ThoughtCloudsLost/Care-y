<script lang="ts">
  import { untrack } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    searchAll,
    getProvider,
    resetFullSearch,
    runFullSearchForProvider,
  } from "$lib/search/registry.svelte.js";
  import type { SearchResultGroup } from "$lib/search/types.js";
  import { searchRecents } from "$lib/search/recents.svelte.js";
  import { recentViews } from "$lib/search/recent-views.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import SearchSection from "./SearchSection.svelte";
  import TicketResultStrip from "./TicketResultStrip.svelte";
  import SearchRecents from "./SearchRecents.svelte";
  import RecentViews from "./RecentViews.svelte";
  import FullSearchPanel from "./FullSearchPanel.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";

  interface SearchResultsProps {
    query: string;
    promotedProviderId?: string;
    ondismiss: () => void;
    /** Emitted when a result is tapped and no group handler exists. Href is root-relative (e.g. "/tickets/abc"). */
    onnavigate: (href: string) => void;
    onselectrecent: (query: string) => void;
  }

  let {
    query,
    promotedProviderId,
    ondismiss,
    onnavigate,
    onselectrecent,
  }: SearchResultsProps = $props();

  const trimmedQuery = $derived(query.trim());
  const groups: readonly SearchResultGroup[] = $derived(
    searchAll(trimmedQuery, promotedProviderId),
  );
  const hasAnyResults = $derived(groups.some((g) => g.results.length > 0));
  const allSettled = $derived(groups.every((g) => !g.loading));

  // Each query gets its own escalation lifecycle. Without this, a done
  // state from the previous query suppressed the auto-trigger and left
  // its "Found N across M" summary standing under unrelated results.
  let lastQuery = untrack(() => trimmedQuery);
  $effect(() => {
    if (trimmedQuery === lastQuery) return;
    lastQuery = trimmedQuery;
    resetFullSearch();
  });

  // Load the recently-viewed history (server envelope) the first time
  // the empty-query surface shows. No-op before AppShell wires the store.
  $effect(() => {
    if (trimmedQuery.length < 2) recentViews.ensureHydrated();
  });

  function handleResultTap(
    id: string,
    providerId: string,
    group?: SearchResultGroup,
  ): void {
    const q = trimmedQuery;
    if (q.length >= 2) {
      searchRecents.add(q);
    }
    if (group?.onresulttap) {
      ondismiss();
      group.onresulttap(id, q);
      return;
    }
    const provider = getProvider(providerId);
    if (provider) {
      onnavigate(`/${provider.getResultHref(id).replace(/^\//, "")}`);
    }
  }

  function handleShowAllNavigate(href: string): void {
    onnavigate(`/${href.replace(/^\//, "")}`);
  }

  function handleRecentTap(recentQuery: string): void {
    onselectrecent(recentQuery);
  }
</script>

{#if trimmedQuery.length < 2}
  {#if searchRecents.items.length === 0 && recentViews.entries.length === 0}
    <!-- Truly fresh session: no queries, no viewed entities. One quiet
         hint instead of a stack of empty sections. -->
    <div class="search-hint">
      <p>{m.search_hint(withTerms())}</p>
    </div>
  {:else}
    <SearchRecents onselect={handleRecentTap} />
    <RecentViews onnavigate={handleShowAllNavigate} />
  {/if}
{:else}
  {#if !hasAnyResults && allSettled}
    <!-- Nothing anywhere: the empty room stamps its verdict (Identity
         exception recorded 2026-07-11) instead of a wall of empty sections.
         The stamp stands alone; no heading doubles it (Sky, live walk). -->
    <EmptyState
      stamp={m.search_empty_stamp()}
      subtitle={m.search_empty_body({ query: trimmedQuery })}
    />
  {:else}
    {#each groups as group (group.providerId)}
      <SearchSection
        label={group.label}
        icon={group.icon}
        count={group.results.length}
        totalResults={group.totalResults}
        showAllHref={group.showAllHref}
        loading={group.loading}
        {ondismiss}
        onviewall={group.onviewall}
        onnavigate={handleShowAllNavigate}
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
            ontap={(id: string) => handleResultTap(id, group.providerId, group)}
            loading={group.loading}
          />
        {:else if group.renderMode === "list"}
          {@const provider = getProvider(group.providerId)}
          {#if provider}
            {@const ResultItem = provider.ResultItem}
            <div role="list" class="search-list-results">
              {#each group.results as result (result.id)}
                <div role="listitem">
                  <ResultItem
                    result={result.data}
                    ontap={(id: string) =>
                      handleResultTap(id, group.providerId, group)}
                  />
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </SearchSection>
    {/each}
  {/if}

  <FullSearchPanel {groups} query={trimmedQuery} {hasAnyResults} />
{/if}

<style>
  .search-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xl) var(--space-md);
  }

  .search-hint p {
    color: var(--muted);
    font-size: var(--text-sm);
    text-align: center;
  }
</style>

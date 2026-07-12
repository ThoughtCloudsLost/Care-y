<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import {
    searchAll,
    getProvider,
    providerHasFullSearch,
    runFullSearchForProvider,
  } from "$lib/search/registry.svelte.js";
  import type { SearchResultGroup } from "$lib/search/types.js";
  import { searchRecents } from "$lib/search/recents.svelte.js";
  import SearchSection from "./SearchSection.svelte";
  import TicketResultStrip from "./TicketResultStrip.svelte";
  import SearchRecents from "./SearchRecents.svelte";
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
  <SearchRecents onselect={handleRecentTap} />
{:else}
  {#if !hasAnyResults && allSettled}
    <!-- Nothing anywhere: the empty room stamps its verdict (Identity
         exception recorded 2026-07-11) instead of a wall of empty sections. -->
    <EmptyState
      stamp={m.search_empty_stamp()}
      title={m.search_empty_title()}
      subtitle={m.search_empty_body({ query: trimmedQuery })}
    />
  {:else}
    {#each groups as group (group.providerId)}
      <SearchSection
        label={group.label}
        icon={group.icon}
        count={group.results.length}
        totalCached={group.totalCached}
        totalItems={group.totalItems}
        totalResults={group.totalResults}
        showAllHref={group.showAllHref}
        loading={group.loading}
        {ondismiss}
        onviewall={group.onviewall}
        onnavigate={handleShowAllNavigate}
        query={trimmedQuery}
        hasFullSearch={providerHasFullSearch(group.providerId)}
        onFullSearch={() =>
          runFullSearchForProvider(group.providerId, trimmedQuery)}
        providerId={group.providerId}
        emptyText={group.emptyText}
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

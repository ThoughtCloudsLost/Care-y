<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import * as m from "$lib/paraglide/messages.js";
  import { searchAll, getProvider } from "$lib/search/registry.svelte.js";
  import { searchRecents } from "$lib/search/recents.svelte.js";
  import SearchSection from "./SearchSection.svelte";
  import TicketResultStrip from "./TicketResultStrip.svelte";
  import SearchRecents from "./SearchRecents.svelte";
  import FullSearchPanel from "./FullSearchPanel.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import type { SearchResultGroup } from "$lib/search/types.js";

  interface SearchResultsProps {
    query: string;
    promotedProviderId?: string;
    ondismiss: () => void;
    onselectrecent: (query: string) => void;
  }

  let {
    query,
    promotedProviderId,
    ondismiss,
    onselectrecent,
  }: SearchResultsProps = $props();

  const trimmedQuery = $derived(query.trim());
  const groups: readonly SearchResultGroup[] = $derived(
    searchAll(trimmedQuery, promotedProviderId),
  );
  const hasAnyResults = $derived(groups.some((g) => g.results.length > 0));

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
      ondismiss();
      void goto(resolve(`/${provider.getResultHref(id).replace(/^\//, "")}`));
    }
  }

  function handleRecentTap(recentQuery: string): void {
    onselectrecent(recentQuery);
  }
</script>

{#if trimmedQuery.length < 2}
  <SearchRecents onselect={handleRecentTap} />
{:else}
  {#each groups as group, i (group.providerId)}
    {#if i > 0}
      <hr class="section-divider" />
    {/if}
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
      query={trimmedQuery}
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

  {#if !hasAnyResults && groups.every((g) => !g.loading)}
    <div role="status">
      <EmptyState message={m.search_no_results({ query: trimmedQuery })} />
    </div>
  {/if}

  <FullSearchPanel {groups} query={trimmedQuery} {hasAnyResults} />
{/if}

<style>
  .section-divider {
    border: none;
    border-top: 1px solid
      color-mix(in srgb, var(--brand-primary) 15%, transparent);
    margin: 0 var(--page-pad-x);
  }
</style>

<script lang="ts">
  import { Progressbar } from "konsta/svelte";
  import { ScanSearch } from "@lucide/svelte";
  import SoftButton from "$lib/components/SoftButton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    runFullSearch,
    getFullSearchStates,
    hasFullSearch,
  } from "$lib/search/registry.svelte.js";
  import type { SearchResultGroup } from "$lib/search/types.js";

  interface FullSearchPanelProps {
    query: string;
    groups: readonly SearchResultGroup[];
    hasAnyResults: boolean;
  }

  let { query, groups, hasAnyResults }: FullSearchPanelProps = $props();

  const states = $derived(getFullSearchStates());
  const isSearching = $derived(states.some((s) => s.status === "searching"));
  const isDone = $derived(
    states.length > 0 && states.every((s) => s.status === "done"),
  );
  const totalCachedItems = $derived(
    groups.reduce((sum, g) => sum + g.totalCached, 0),
  );

  const fullSearchAvailable = $derived(hasFullSearch());

  function handleTrigger(): void {
    runFullSearch(query);
  }

  const anyGroupLoading = $derived(groups.some((g) => g.loading));

  // Auto-trigger when no matches exist in decrypted data
  $effect(() => {
    if (
      fullSearchAvailable &&
      query.length >= 2 &&
      !hasAnyResults &&
      !anyGroupLoading &&
      !isSearching &&
      !isDone &&
      totalCachedItems > 0
    ) {
      runFullSearch(query);
    }
  });
</script>

{#if fullSearchAvailable}
  <div class="full-search-panel">
    {#if isSearching}
      <div class="progress-area">
        <p class="progress-title">{m.search_full_progress_title()}</p>
        {#each states.filter((s) => s.status !== "idle") as providerState (providerState.providerId)}
          <div class="progress-row">
            <span class="progress-label">{providerState.label}</span>
            {#if providerState.status === "done"}
              <span class="progress-done">{m.search_full_done()}</span>
            {:else}
              <Progressbar
                progress={providerState.searched /
                  Math.max(providerState.total, 1)}
              />
              <span class="progress-count">
                {m.search_full_progress({
                  searched: providerState.searched,
                  total: providerState.total,
                })}
              </span>
            {/if}
          </div>
        {/each}
      </div>
    {:else if isDone}
      <div class="done-area">
        <p class="done-text">
          {m.search_full_summary({
            found: states.reduce((sum, s) => sum + s.matchCount, 0),
            total: states.reduce((sum, s) => sum + s.total, 0),
          })}
        </p>
      </div>
    {:else}
      <SoftButton full onclick={handleTrigger}>
        <ScanSearch size={16} aria-hidden="true" />
        <span>{m.search_full_trigger()}</span>
      </SoftButton>

      {#if !hasAnyResults && totalCachedItems === 0}
        <p class="search-hint-text">
          {m.search_full_hint_no_data()}
        </p>
      {:else if !hasAnyResults}
        <p class="search-hint-text">
          {m.search_full_hint_no_results()}
        </p>
      {:else}
        <p class="search-hint-text">
          {m.search_full_hint_default()}
        </p>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .full-search-panel {
    padding: var(--space-lg, 16px) var(--page-pad-x, 0.75rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm, 8px);
  }

  .search-hint-text {
    color: var(--muted);
    font-size: var(--text-xs, 0.75rem);
    text-align: center;
    max-width: 280px;
  }

  .progress-area {
    width: 100%;
  }

  .progress-title {
    font-weight: 600;
    font-size: var(--text-base, 1rem);
    color: var(--ink);
    margin-bottom: var(--space-sm, 8px);
  }

  .progress-row {
    display: flex;
    align-items: center;
    gap: var(--space-md, 12px);
    margin-bottom: var(--space-sm, 8px);
  }

  .progress-label {
    font-size: var(--text-sm, 0.875rem);
    color: var(--ink);
    min-width: 80px;
  }

  .progress-count,
  .progress-done {
    font-size: var(--text-sm, 0.875rem);
    color: var(--muted);
    white-space: nowrap;
  }

  .done-area {
    text-align: center;
  }

  .done-text {
    color: var(--muted);
    font-size: var(--text-sm, 0.875rem);
  }
</style>

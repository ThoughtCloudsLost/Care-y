<script lang="ts">
  import { Progressbar } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    runFullSearch,
    getFullSearchStates,
    hasFullSearch,
    UNSCOPED_SCOPE_KEY,
  } from "$lib/search/registry.svelte.js";
  import type { SearchResultGroup } from "$lib/search/types.js";

  interface FullSearchPanelProps {
    query: string;
    groups: readonly SearchResultGroup[];
    hasAnyResults: boolean;
  }

  let { query, groups, hasAnyResults }: FullSearchPanelProps = $props();

  // The global search is unscoped. A run the tickets page scoped to its
  // filters covers another set, so the panel treats it as not run.
  const states = $derived(
    getFullSearchStates().filter((s) => s.scopeKey === UNSCOPED_SCOPE_KEY),
  );
  const isSearching = $derived(states.some((s) => s.status === "searching"));
  // A run on any provider, scoped or not, holds it: starting the global
  // run over a page's scoped run would abort it. The auto-trigger waits
  // until every run has settled.
  const anyRunSearching = $derived(
    getFullSearchStates().some((s) => s.status === "searching"),
  );
  const isDone = $derived(
    states.length > 0 && states.every((s) => s.status === "done"),
  );
  const anyIncomplete = $derived(states.some((s) => s.status === "incomplete"));
  const totalCachedItems = $derived(
    groups.reduce((sum, g) => sum + g.totalCached, 0),
  );

  const fullSearchAvailable = $derived(hasFullSearch());

  function handleTrigger(): void {
    runFullSearch(query);
  }

  const anyGroupLoading = $derived(groups.some((g) => g.loading));

  // Auto-trigger when no matches exist in decrypted data. An incomplete run
  // is terminal like done; re-running it automatically would retry the
  // failing provider in a loop.
  $effect(() => {
    if (
      fullSearchAvailable &&
      query.length >= 2 &&
      !hasAnyResults &&
      !anyGroupLoading &&
      !anyRunSearching &&
      !isDone &&
      !anyIncomplete &&
      totalCachedItems > 0
    ) {
      runFullSearch(query);
    }
  });
</script>

{#if fullSearchAvailable}
  <div class="full-search-panel">
    {#if isSearching || anyIncomplete}
      <div class="progress-area">
        {#if isSearching}
          <p class="progress-title">{m.search_full_progress_title()}</p>
        {/if}
        {#each states.filter((s) => s.status !== "idle") as providerState (providerState.providerId)}
          <div class="progress-row">
            <span class="progress-label">{providerState.label}</span>
            {#if providerState.status === "done"}
              <span class="progress-done">{m.search_full_done()}</span>
            {:else if providerState.status === "incomplete"}
              <span class="progress-done">{m.search_full_stopped()}</span>
            {:else}
              {#if providerState.total > 0}
                <Progressbar
                  progress={providerState.searched / providerState.total}
                />
              {/if}
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
    {/if}
    {#if isDone}
      <div class="done-area">
        <p class="done-text">
          {m.search_full_summary({
            found: states.reduce((sum, s) => sum + s.matchCount, 0),
            total: states.reduce((sum, s) => sum + s.total, 0),
          })}
        </p>
      </div>
    {:else if !isSearching}
      <button type="button" class="panel-trigger num" onclick={handleTrigger}>
        {m.search_panel_trigger()}
      </button>
      <p class="search-hint-text">
        {m.search_panel_hint()}
      </p>
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

  /* The calm escalation anatomy (never a red link, never brand fill). */
  .panel-trigger {
    display: block;
    width: 100%;
    padding: 11px;
    border: 1px solid var(--hair-2);
    border-radius: 9px;
    background: var(--raised);
    color: var(--ink-2);
    font-size: var(--text-base, 0.84375rem);
    font-weight: 700;
    text-align: center;
    cursor: pointer;
  }

  .num {
    font-variant-numeric: tabular-nums;
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

<script lang="ts">
  import { Chip } from "konsta/svelte";
  import { getProvider } from "$lib/search/registry.svelte.js";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { SearchResult } from "$lib/search/types.js";

  const MAX_STRIP_RESULTS = 10;

  interface TicketResultStripProps {
    results: readonly SearchResult[];
    providerId: string;
    ontap: (id: string) => void;
    loading: boolean;
  }

  let { results, providerId, ontap, loading }: TicketResultStripProps =
    $props();

  const provider = $derived(getProvider(providerId));
  const hiddenCount = $derived(Math.max(0, results.length - MAX_STRIP_RESULTS));
  const visibleCount = $derived(Math.min(results.length, MAX_STRIP_RESULTS));
  const useGrid = $derived(visibleCount >= 4);
</script>

<div
  class="result-strip"
  class:result-strip--grid={useGrid}
  role="list"
  aria-label={provider?.label()}
>
  {#if loading}
    {#each Array(6) as _, i (i)}
      <div class="skeleton-card card-elevated" role="listitem">
        <InlineSkeleton width="100%" />
      </div>
    {/each}
  {:else}
    {#each results.slice(0, MAX_STRIP_RESULTS) as result (result.id)}
      {#if provider?.ResultItem}
        {@const ResultItem = provider.ResultItem}
        <div role="listitem">
          <ResultItem result={result.data} {ontap} />
        </div>
      {/if}
    {/each}
    {#if hiddenCount > 0}
      <div
        class="overflow-indicator"
        role="listitem"
        aria-label={m.search_more_results({ count: hiddenCount })}
      >
        <Chip outline>+{hiddenCount}</Chip>
      </div>
    {/if}
  {/if}
</div>

<style>
  /* Single row: horizontal flex scroll for 1-2 results */
  .result-strip {
    display: flex;
    gap: var(--space-md, 12px);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-inline-start: var(--page-pad-x, 0.75rem);
    -webkit-overflow-scrolling: touch;
    padding: var(--space-sm, 8px) var(--page-pad-x, 0.75rem);
    scrollbar-width: none;
  }

  /* 2-row grid: kicks in at 3+ results */
  .result-strip--grid {
    display: grid;
    grid-template-rows: repeat(2, 1fr);
    grid-auto-flow: column;
    grid-auto-columns: 170px;
  }

  .result-strip::-webkit-scrollbar {
    display: none;
  }

  .result-strip--grid > :nth-child(odd) {
    scroll-snap-align: start;
  }

  .result-strip:not(.result-strip--grid) > * {
    scroll-snap-align: start;
  }

  .skeleton-card {
    width: 170px;
    height: 140px;
  }

  .overflow-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 170px;
    grid-row: 1 / -1;
  }
</style>

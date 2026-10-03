<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import { RotateCw } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  interface SearchSectionProps {
    label: string;
    icon: Component;
    count: number;
    totalResults?: number;
    showAllHref: string;
    loading: boolean;
    ondismiss: () => void;
    onviewall?: (query: string) => void;
    /** Show-all navigation, handled by the host (content never calls goto). */
    onnavigate?: (href: string) => void;
    query?: string;
    onFullSearch?: () => void;
    /** Quiet line rendered in place of results when the section is empty. */
    emptyText?: string;
    /** Human coverage line below the results (provider-owned copy). */
    coverageText?: string;
    /** Calm escalation button label; absent hides the button. */
    fetchMoreLabel?: string;
    /** Retry a stopped full search; renders an icon button beside the coverage line. */
    onretry?: () => void;
    children: Snippet;
  }

  let {
    label,
    icon: Icon,
    count,
    totalResults,
    showAllHref,
    loading,
    ondismiss,
    onviewall,
    onnavigate,
    query = "",
    onFullSearch,
    emptyText,
    coverageText,
    fetchMoreLabel,
    onretry,
    children,
  }: SearchSectionProps = $props();

  const displayCount = $derived(totalResults ?? count);

  function handleShowAll(): void {
    if (onviewall) {
      const q = query;
      ondismiss();
      onviewall(q);
    } else {
      onnavigate?.(showAllHref);
    }
  }
</script>

<div class="search-section">
  <div class="secline">
    <Icon size={14} aria-hidden="true" class="section-icon" />
    <h3 class="secline-eb">{label}</h3>
    <span class="secline-rule" aria-hidden="true"></span>
    <span class="secline-cnt num" aria-live="polite">
      {#if loading}
        <DecryptPlaceholder length={3} />
      {:else if displayCount === 1}
        {m.search_found_count_one({ count: 1 })}
      {:else}
        {m.search_found_count_other({ count: displayCount })}
      {/if}
    </span>
    {#if displayCount > 0}
      <span class="secline-cnt" aria-hidden="true">·</span>
      <button
        type="button"
        class="show-all num"
        aria-label={m.search_show_all_label({ section: label })}
        onclick={handleShowAll}
      >
        {m.search_show_all()}
      </button>
    {/if}
  </div>
  {#if !loading && count === 0 && emptyText != null}
    <p class="nores">{emptyText}</p>
  {:else}
    {@render children()}
  {/if}
  {#if coverageText != null}
    <div class="cover-row">
      <p class="cover num" aria-live="polite">{coverageText}</p>
      {#if onretry}
        <button
          type="button"
          class="cover-retry calm-escalation"
          aria-label={m.common_retry()}
          onclick={onretry}
        >
          <RotateCw size={16} aria-hidden="true" />
        </button>
      {/if}
    </div>
  {/if}
  {#if fetchMoreLabel != null && onFullSearch}
    <button
      type="button"
      class="fetchmore calm-escalation num"
      onclick={onFullSearch}
    >
      {fetchMoreLabel}
    </button>
  {/if}
</div>

<style>
  .search-section {
    padding-bottom: var(--space-md, 12px);
  }

  .search-section :global(.section-icon) {
    flex-shrink: 0;
    align-self: center;
    color: var(--brand-accent);
  }

  .num {
    font-variant-numeric: tabular-nums;
  }

  /* Show all is a text action, an identity slot: brand-text, not muted. */
  .show-all {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--brand-text);
    white-space: nowrap;
  }

  .nores {
    padding: 8px var(--page-pad-x, 0.75rem) 2px;
    font-size: 0.8125rem;
    color: var(--muted);
  }

  .cover-row {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
  }

  /* Honest coverage in plain words, below what it describes. */
  .cover {
    flex: 1;
    min-width: 0;
    padding: 6px var(--page-pad-x, 0.75rem) 0;
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--muted);
    margin: 0;
  }

  /* Icon-sized placement of the shared calm-escalation anatomy, the
     same retry control the search bar shows. */
  .cover-retry {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border-radius: 0.5625rem;
    flex-shrink: 0;
    margin: 6px var(--page-pad-x, 0.75rem) 0 0;
  }

  /* Full-width placement of the shared calm-escalation anatomy. */
  .fetchmore {
    display: block;
    margin: 10px var(--page-pad-x, 0.75rem) 4px;
    width: calc(100% - 2 * var(--page-pad-x, 0.75rem));
    padding: 11px;
    border-radius: 9px;
    font-size: var(--text-base, 0.84375rem);
    font-weight: 700;
    text-align: center;
  }
</style>

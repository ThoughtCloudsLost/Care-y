<script lang="ts">
  import { Progressbar } from "konsta/svelte";
  import { ScanSearch } from "@lucide/svelte";
  import type { Component, Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import { getFullSearchStateForProvider } from "$lib/search/registry.svelte.js";

  interface SearchSectionProps {
    label: string;
    icon: Component;
    count: number;
    totalCached: number;
    totalItems?: number;
    totalResults?: number;
    showAllHref: string;
    loading: boolean;
    ondismiss: () => void;
    onviewall?: (query: string) => void;
    /** Show-all navigation, handled by the host (content never calls goto). */
    onnavigate?: (href: string) => void;
    query?: string;
    hasFullSearch?: boolean;
    onFullSearch?: () => void;
    providerId?: string;
    /** Quiet line rendered in place of results when the section is empty. */
    emptyText?: string;
    children: Snippet;
  }

  let {
    label,
    icon: Icon,
    count,
    totalCached,
    totalItems,
    totalResults,
    showAllHref,
    loading,
    ondismiss,
    onviewall,
    onnavigate,
    query = "",
    hasFullSearch = false,
    onFullSearch,
    providerId,
    emptyText,
    children,
  }: SearchSectionProps = $props();

  const displayCount = $derived(totalResults ?? count);

  const fsStatus = $derived(
    providerId != null && providerId !== ""
      ? getFullSearchStateForProvider(providerId)?.status
      : undefined,
  );
  const fsSearched = $derived(
    providerId != null && providerId !== ""
      ? (getFullSearchStateForProvider(providerId)?.searched ?? 0)
      : 0,
  );
  const fsTotal = $derived(
    providerId != null && providerId !== ""
      ? (getFullSearchStateForProvider(providerId)?.total ?? 0)
      : 0,
  );

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
    <h3 class="eb">{label}</h3>
    <span class="rule" aria-hidden="true"></span>
    <span class="cnt num" aria-live="polite">
      {#if loading}
        <DecryptPlaceholder length={3} />
      {:else if displayCount === 1}
        {m.search_found_count_one({ count: 1 })}
      {:else}
        {m.search_found_count_other({ count: displayCount })}
      {/if}
    </span>
    {#if displayCount > 0}
      <span class="cnt" aria-hidden="true">·</span>
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
  <div class="scope-row">
    {#if hasFullSearch && onFullSearch}
      <span class="section-deep-search" aria-live="polite">
        {#if fsStatus === "searching"}
          <span class="section-deep-progress">
            <Progressbar progress={fsSearched / Math.max(fsTotal, 1)} />
            <span class="section-deep-count">
              {m.search_section_full_searching({
                searched: fsSearched,
                total: fsTotal,
              })}
            </span>
          </span>
        {:else if fsStatus === "done"}
          <ScanSearch size={12} aria-hidden="true" class="deep-done-icon" />
        {:else}
          <button
            type="button"
            class="section-deep-trigger"
            onclick={onFullSearch}
          >
            <ScanSearch size={12} aria-hidden="true" />
            {m.search_section_full_trigger({ section: label })}
          </button>
        {/if}
      </span>
    {/if}
    <p class="scope-hint" aria-live="polite">
      {#if totalItems != null && totalItems > totalCached}
        {#if loading}
          {m.search_scope_hint_of({
            searched: totalCached,
            total: totalItems,
          })}
        {:else}
          {m.search_scope_done_of({
            searched: totalCached,
            total: totalItems,
          })}
        {/if}
      {:else if loading}
        {m.search_scope_hint({ count: totalCached })}
      {:else}
        {m.search_scope_done({ count: totalCached })}
      {/if}
    </p>
  </div>
  {#if !loading && count === 0 && emptyText != null}
    <p class="nores">{emptyText}</p>
  {:else}
    {@render children()}
  {/if}
</div>

<style>
  .search-section {
    padding-bottom: var(--space-md, 12px);
  }

  /* Secline: the section-head anatomy shared with the Now page. The
     eyebrow names the section, the hairline rule does the layout work,
     and the count sits quiet at the end of the line. */
  .secline {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 18px var(--page-pad-x, 0.75rem) 8px;
  }

  .search-section :global(.section-icon) {
    flex-shrink: 0;
    align-self: center;
    color: var(--brand-accent);
  }

  .eb {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-2);
    white-space: nowrap;
    margin: 0;
  }

  .rule {
    flex: 1;
    height: 1px;
    background: var(--hair);
    align-self: center;
  }

  .cnt {
    font-size: 11px;
    color: var(--muted);
    white-space: nowrap;
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
    font-size: 11px;
    font-weight: 700;
    color: var(--brand-text);
    white-space: nowrap;
  }

  .nores {
    padding: 8px var(--page-pad-x, 0.75rem) 2px;
    font-size: 0.8125rem;
    color: var(--muted);
  }

  .scope-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: 0 var(--page-pad-x, 0.75rem);
    margin: 0 0 var(--space-sm, 8px);
  }

  .scope-hint {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
    margin: 0;
  }

  .section-deep-search {
    flex-shrink: 0;
  }

  .section-deep-trigger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs, 0.75rem);
    font-weight: 500;
    color: var(--brand-text);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
  }

  .section-deep-progress {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    max-width: 140px;
  }

  .section-deep-count {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
    white-space: nowrap;
  }

  :global(.deep-done-icon) {
    color: var(--brand-text);
    opacity: 0.6;
  }
</style>

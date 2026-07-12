<script lang="ts">
  import type { Component, Snippet } from "svelte";
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
  {#if !loading && count === 0 && emptyText != null}
    <p class="nores">{emptyText}</p>
  {:else}
    {@render children()}
  {/if}
  {#if coverageText != null}
    <p class="cover num" aria-live="polite">{coverageText}</p>
  {/if}
  {#if fetchMoreLabel != null && onFullSearch}
    <button type="button" class="fetchmore num" onclick={onFullSearch}>
      {fetchMoreLabel}
    </button>
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

  /* Honest coverage in plain words, below what it describes. */
  .cover {
    padding: 6px var(--page-pad-x, 0.75rem) 0;
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--muted);
    margin: 0;
  }

  /* The calm escalation: a full-width quiet button, never a red link. */
  .fetchmore {
    display: block;
    margin: 10px var(--page-pad-x, 0.75rem) 4px;
    width: calc(100% - 2 * var(--page-pad-x, 0.75rem));
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
</style>

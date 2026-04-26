<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Progressbar } from "konsta/svelte";
  import { Search } from "@lucide/svelte";
  import type { Component, Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
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
    query?: string;
    hasFullSearch?: boolean;
    onFullSearch?: () => void;
    providerId?: string;
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
    query = "",
    hasFullSearch = false,
    onFullSearch,
    providerId,
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
</script>

<div class="search-section">
  <div class="section-header">
    <div class="section-title-row">
      <h3 class="section-label">
        <Icon size={16} aria-hidden="true" class="section-icon" />
        <span class="heading-text">{label}</span>
        <span class="count-badge">{loading ? "..." : displayCount}</span>
      </h3>
      {#if displayCount > 0}
        <button
          type="button"
          class="show-all-link"
          onclick={() => {
            if (onviewall) {
              const q = query;
              ondismiss();
              onviewall(q);
            } else {
              ondismiss();
              void goto(resolve(`/${showAllHref.replace(/^\//, "")}`));
            }
          }}
        >
          {m.search_show_all({ count: displayCount })}
        </button>
      {/if}
    </div>
    <div class="scope-row">
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
      {#if hasFullSearch && onFullSearch}
        <span class="section-full-search" aria-live="polite">
          {#if fsStatus === "searching"}
            <span class="section-full-progress">
              <Progressbar progress={fsSearched / Math.max(fsTotal, 1)} />
              <span class="section-full-count">
                {m.search_section_full_searching({
                  searched: fsSearched,
                  total: fsTotal,
                })}
              </span>
            </span>
          {:else if fsStatus === "done"}
            <span class="section-full-done">
              {m.search_section_full_done({ total: fsTotal })}
            </span>
          {:else}
            <button
              type="button"
              class="section-full-trigger"
              onclick={onFullSearch}
            >
              <Search size={12} aria-hidden="true" />
              {m.search_section_full_trigger({ section: label })}
            </button>
          {/if}
        </span>
      {/if}
    </div>
  </div>
  {@render children()}
</div>

<style>
  .search-section {
    padding-top: var(--space-lg, 16px);
    padding-bottom: var(--space-md, 12px);
  }

  .section-header {
    padding: 0 var(--page-pad-x, 0.75rem);
    margin-bottom: var(--space-md, 12px);
  }

  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md, 12px);
  }

  :global(.section-icon) {
    flex-shrink: 0;
    color: var(--brand-accent);
  }

  /* Match CollapsibleSection heading style from the dashboard */
  .section-label {
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--ink);
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--space-md, 12px);
  }

  /* Match dashboard count-badge: ink-tinted background, muted text */
  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.125rem;
    height: 1.125rem;
    padding: 0 0.25rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--ink) 12%, transparent);
    font-size: 0.625rem;
    font-weight: 600;
    line-height: 1;
    color: var(--muted);
    letter-spacing: 0.01em;
  }

  .show-all-link {
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    color: var(--ink);
    opacity: 0.6;
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs, 4px) 0;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .scope-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md, 12px);
    margin: var(--space-xs, 4px) 0 0;
  }

  .scope-hint {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
    margin: 0;
  }

  .section-full-search {
    flex-shrink: 0;
  }

  .section-full-trigger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs, 0.75rem);
    font-weight: 500;
    color: var(--brand-primary);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
  }

  .section-full-progress {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    max-width: 140px;
  }

  .section-full-count {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
    white-space: nowrap;
  }

  .section-full-done {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
  }
</style>

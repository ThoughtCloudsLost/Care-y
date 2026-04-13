<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import type { Component, Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface SearchSectionProps {
    label: string;
    icon: Component;
    count: number;
    totalCached: number;
    showAllHref: string;
    loading: boolean;
    ondismiss: () => void;
    children: Snippet;
  }

  let {
    label,
    icon: Icon,
    count,
    totalCached,
    showAllHref,
    loading,
    ondismiss,
    children,
  }: SearchSectionProps = $props();
</script>

<div class="search-section">
  <div class="section-header">
    <div class="section-title-row">
      <h3 class="section-label">
        <Icon size={16} aria-hidden="true" class="section-icon" />
        <span class="heading-text">{label}</span>
        <span class="count-badge">{loading ? "..." : count}</span>
      </h3>
      {#if count > 0}
        <button
          type="button"
          class="show-all-link"
          onclick={() => {
            ondismiss();
            void goto(resolve(`/${showAllHref.replace(/^\//, "")}`));
          }}
        >
          {m.search_show_all({ count })}
        </button>
      {/if}
    </div>
    <p class="scope-hint" aria-live="polite">
      {#if loading}
        {m.search_scope_hint({ count: totalCached })}
      {:else}
        {m.search_scope_done({ count: totalCached })}
      {/if}
    </p>
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

  .scope-hint {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
    margin: var(--space-xs, 4px) 0 0;
  }
</style>

<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { searchHandbook, type SearchHit } from "./handbook-search.js";
  import { resolveStoryMessage } from "./story-messages.js";
  import { getSection, getSub } from "./scroll-sections.js";
  import type { SectionId } from "./bridge.js";

  interface Props {
    locale: string;
    onNavigate: (sectionId: SectionId, subSlug: string) => void;
    onClose?: () => void;
  }

  let { locale, onNavigate, onClose }: Props = $props();

  // -----------------------------------------------------------------------
  // Query state with debounce
  // -----------------------------------------------------------------------

  let rawQuery = $state("");
  let debouncedQuery = $state("");
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    const q = rawQuery;
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedQuery = q;
    }, 150);
    return () => {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
    };
  });

  const results: readonly SearchHit[] = $derived(
    debouncedQuery.trim().length > 0
      ? searchHandbook(debouncedQuery, locale)
      : [],
  );

  // -----------------------------------------------------------------------
  // Active result (keyboard highlight)
  // -----------------------------------------------------------------------

  let activeIdx = $state(-1);

  // Reset active index when results change
  $effect(() => {
    void results;
    activeIdx = -1;
  });

  // -----------------------------------------------------------------------
  // Breadcrumb
  // -----------------------------------------------------------------------

  function breadcrumb(hit: SearchHit): string {
    const section = getSection(hit.sectionId);
    const sectionTitle =
      section !== undefined
        ? resolveStoryMessage(section.titleKey, locale)
        : hit.sectionId;

    if (hit.subSlug === null) return sectionTitle;

    const subLookup = getSub(hit.sectionId, hit.subSlug);
    const subHeading =
      subLookup !== undefined
        ? resolveStoryMessage(subLookup.sub.headingKey, locale)
        : hit.subSlug;

    return `${sectionTitle} › ${subHeading}`;
  }

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

  function activateHit(hit: SearchHit): void {
    if (hit.subSlug !== null) {
      onNavigate(hit.sectionId as SectionId, hit.subSlug);
    }
    onClose?.();
  }

  // -----------------------------------------------------------------------
  // Keyboard
  // -----------------------------------------------------------------------

  function handleInputKeydown(e: KeyboardEvent): void {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        activeIdx = activeIdx < results.length - 1 ? activeIdx + 1 : 0;
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        activeIdx = activeIdx > 0 ? activeIdx - 1 : results.length - 1;
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < results.length) {
        const hit = results[activeIdx];
        if (hit !== undefined) activateHit(hit);
      }
    } else if (e.key === "Escape") {
      if (rawQuery.length > 0) {
        rawQuery = "";
        debouncedQuery = "";
      } else {
        onClose?.();
      }
    }
  }

  function handleResultKeydown(e: KeyboardEvent, hit: SearchHit): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activateHit(hit);
    }
  }

  let inputRef: HTMLInputElement | null = $state(null);

  // Auto-focus the input on mount
  $effect(() => {
    inputRef?.focus();
  });
</script>

<div class="hb-search">
  <input
    bind:this={inputRef}
    bind:value={rawQuery}
    class="hb-search-input"
    type="search"
    placeholder={m.demo_handbook_search_placeholder()}
    onkeydown={handleInputKeydown}
    aria-label={m.demo_handbook_search_placeholder()}
    aria-controls="hb-search-results"
    aria-activedescendant={activeIdx >= 0 ? `hb-hit-${activeIdx}` : undefined}
  />

  {#if debouncedQuery.trim().length > 0}
    <div class="hb-search-status" aria-live="polite">
      {#if results.length > 0}
        {m.demo_handbook_search_result_count({ count: String(results.length) })}
      {:else}
        {m.demo_handbook_search_no_results()}
      {/if}
    </div>

    <div id="hb-search-results" class="hb-search-results" role="listbox">
      {#each results as hit, i (hit.key + "#" + hit.lineIdx)}
        <button
          id="hb-hit-{i}"
          class="hb-hit"
          class:hb-hit--active={i === activeIdx}
          role="option"
          aria-selected={i === activeIdx}
          type="button"
          disabled={hit.subSlug === null}
          onclick={() => activateHit(hit)}
          onkeydown={(e) => handleResultKeydown(e, hit)}
        >
          <span class="hb-hit-breadcrumb">{breadcrumb(hit)}</span>
          {#if hit.label !== null}
            <span class="hb-hit-label">{hit.label}</span>
          {/if}
          <span class="hb-hit-snippet">
            <span class="hb-hit-snippet-before">{hit.snippet.before}</span>
            <strong class="hb-hit-snippet-match">{hit.snippet.match}</strong>
            <span class="hb-hit-snippet-after">{hit.snippet.after}</span>
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .hb-search {
    padding: 8px 12px 12px;
  }

  .hb-search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--hair-2, #ccc);
    border-radius: 8px;
    background: var(--raised, #fafafa);
    font-size: 0.875rem;
    color: var(--ink, #1a1a1a);
    outline: none;
  }

  .hb-search-input:focus {
    border-color: var(--demo-accent, #0066cc);
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--demo-accent, #0066cc) 20%, transparent);
  }

  .hb-search-input::placeholder {
    color: var(--muted, #888);
  }

  .hb-search-status {
    padding: 6px 4px 2px;
    font-size: 0.6875rem;
    color: var(--muted, #888);
    font-variant-numeric: tabular-nums;
  }

  .hb-search-results {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 4px;
  }

  .hb-hit {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px;
    border: 1px solid var(--hair, #ddd);
    border-radius: 8px;
    background: var(--raised, #fafafa);
    text-align: left;
    cursor: pointer;
    color: var(--ink, #1a1a1a);
    font-size: 0.8125rem;
    line-height: 1.5;
    transition: background 0.12s ease;
  }

  .hb-hit:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ink, #1a1a1a) 4%, transparent);
  }

  .hb-hit:focus-visible {
    outline: 2px solid var(--demo-accent, #0066cc);
    outline-offset: -2px;
  }

  .hb-hit:disabled {
    cursor: default;
    opacity: 0.8;
  }

  .hb-hit--active {
    background: var(--demo-accent-soft, #e6f0ff);
    border-color: var(--demo-accent, #0066cc);
  }

  .hb-hit-breadcrumb {
    font-size: 0.6875rem;
    color: var(--muted, #888);
  }

  .hb-hit-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ink, #1a1a1a);
  }

  .hb-hit-snippet {
    font-size: 0.8125rem;
    color: var(--ink-2, #444);
    overflow-wrap: break-word;
  }

  .hb-hit-snippet-match {
    color: var(--demo-accent, #0066cc);
    font-weight: 700;
  }

  @media (prefers-reduced-motion: reduce) {
    .hb-hit {
      transition: none;
    }
  }
</style>

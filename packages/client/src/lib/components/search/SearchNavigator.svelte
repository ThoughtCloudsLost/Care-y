<script lang="ts">
  import { Button, Progressbar } from "konsta/svelte";
  import { ArrowDown, ArrowUp, ScanSearch, X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    term: string;
    /** 0-based position in matches, or -1 when no active match. */
    position: number;
    total: number;
    onup: () => void;
    ondown: () => void;
    onexit: () => void;
    /** Called when the user edits the search term inline. */
    ontermchange?: (term: string) => void;
    navLabel?: string;
    /** When present, shows a deep search button. */
    ondeepsearch?: () => void;
    deepSearchStatus?: "idle" | "searching" | "done";
    deepSearchSearched?: number;
    deepSearchTotal?: number;
  }

  const {
    term,
    position,
    total,
    onup,
    ondown,
    onexit,
    ontermchange,
    navLabel,
    ondeepsearch,
    deepSearchStatus,
    deepSearchSearched = 0,
    deepSearchTotal = 0,
  }: Props = $props();

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let prevFocused: HTMLElement | null = null;

  $effect(() => {
    prevFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    return () => {
      prevFocused?.focus();
    };
  });

  function handleInput(e: Event): void {
    if (!(e.target instanceof HTMLInputElement)) return;
    const value = e.target.value;
    if (debounceTimer != null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      ontermchange?.(value);
    }, 150);
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        onup();
      } else {
        ondown();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onexit();
    }
  }
</script>

<div
  class="search-navigator"
  role="toolbar"
  aria-label={navLabel ?? m.search_conversation_nav_label()}
>
  <Button
    tonal
    rounded
    small
    inline
    class="search-close-btn"
    aria-label={m.common_cancel()}
    onclick={onexit}
  >
    <X size={16} aria-hidden="true" />
  </Button>
  <input
    class="search-input"
    type="text"
    value={term}
    oninput={handleInput}
    onkeydown={handleKeydown}
    aria-label={m.search_refine_label()}
    aria-describedby="search-nav-hints"
  />
  <span class="sr-only" id="search-nav-hints">
    {m.search_nav_shortcuts()}
  </span>
  {#if ondeepsearch != null || deepSearchStatus === "searching" || deepSearchStatus === "done"}
    <span class="deep-search-area" aria-live="polite">
      {#if deepSearchStatus === "searching"}
        <span class="deep-search-inline-progress">
          <Progressbar
            progress={deepSearchTotal > deepSearchSearched
              ? deepSearchSearched / Math.max(deepSearchTotal, 1)
              : 0}
          />
          <span class="deep-search-fraction">
            {#if deepSearchTotal > deepSearchSearched}
              {m.search_deep_nav_searching({
                searched: deepSearchSearched,
                total: deepSearchTotal,
              })}
            {:else}
              {m.search_deep_nav_loading({ count: deepSearchSearched })}
            {/if}
          </span>
        </span>
      {:else if deepSearchStatus === "done"}
        <ScanSearch size={12} aria-hidden="true" class="deep-done-icon" />
      {:else}
        <button
          type="button"
          class="deep-search-trigger"
          aria-label={m.search_deep_nav_trigger()}
          onclick={ondeepsearch}
        >
          <ScanSearch size={16} aria-hidden="true" />
        </button>
      {/if}
    </span>
  {/if}
  <span class="search-position" aria-live="polite" aria-atomic="true">
    {m.search_conversation_position({
      current: String(position >= 0 ? position + 1 : 0),
      total: String(total),
    })}
  </span>
  <div class="search-nav-buttons">
    <Button
      tonal
      rounded
      small
      inline
      class="search-nav-btn"
      aria-label={m.search_conversation_previous()}
      onclick={onup}
    >
      <ArrowUp size={16} aria-hidden="true" />
    </Button>
    <Button
      tonal
      rounded
      small
      inline
      class="search-nav-btn"
      aria-label={m.search_conversation_next()}
      onclick={ondown}
    >
      <ArrowDown size={16} aria-hidden="true" />
    </Button>
  </div>
</div>

<style>
  /* Navigator bar layout */

  .search-navigator {
    display: flex;
    align-items: center;
    padding: 0.25rem 0.25rem;
    gap: 0.25rem;
    border-top: 1px solid var(--hair, var(--divider));
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* The refine field wears the one-input-system anatomy at toolbar
     scale; 16px stays as the iOS focus-zoom floor. */
  .search-input {
    font-size: 16px;
    font-weight: 600;
    color: var(--ink);
    min-width: 0;
    flex: 1;
    background: var(--raised, color-mix(in srgb, var(--ink) 8%, transparent));
    border: 1px solid
      var(--hair-2, color-mix(in srgb, var(--ink) 15%, transparent));
    border-radius: 0.5rem;
    padding: 0.125rem 0.375rem;
    outline: none;
  }

  .search-input:focus {
    border-color: var(--brand-fill, var(--brand-accent));
    box-shadow: 0 0 0 1px var(--brand-fill, var(--brand-accent));
  }

  .search-position {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--ink);
    white-space: nowrap;
    margin-left: auto;
    margin-right: auto;
  }

  .search-nav-buttons {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .deep-search-area {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .deep-search-inline-progress {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    max-width: 100px;
  }

  .deep-search-fraction {
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
    white-space: nowrap;
  }

  /* The escalation trigger takes the calm fetch-more anatomy; searching
     the rest is an ordinary action, never a red or brand-filled one. */
  .deep-search-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    color: var(--ink-2, var(--ink));
    background: var(--raised, transparent);
    border: 1px solid var(--hair-2, currentColor);
    cursor: pointer;
    padding: 0;
    border-radius: 0.5625rem;
    flex-shrink: 0;
  }

  .deep-search-trigger:active {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }

  :global(.deep-done-icon) {
    color: var(--brand-accent, var(--brand-primary));
    opacity: 0.5;
    flex-shrink: 0;
  }

  /* Toolbar buttons are tools on the desk: quiet bordered squares in
     ink, never tinted and never red (closing a search is ordinary). */
  :global(.search-nav-btn),
  :global(.search-close-btn) {
    width: 1.75rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    background: var(--raised, transparent) !important;
    border: 1px solid var(--hair, currentColor) !important;
    border-radius: 0.5625rem !important;
    box-shadow: none !important;
  }

  :global(.search-nav-btn svg),
  :global(.search-close-btn svg) {
    color: var(--ink-2, var(--ink)) !important;
  }

  /* Search match highlight (global, active when this component is
     mounted). The highlighter pen owns matches: care tint, never brand. */

  :global(.virtual-row:has(.match-active):not([data-grid])),
  :global(.match-active-row),
  :global(.match-active) {
    background: var(
      --care-soft,
      color-mix(in srgb, var(--brand-accent) 15%, transparent)
    );
    border-radius: var(--card-radius, 0.75rem);
  }

  :global(.match-active .k-message),
  :global(.match-active .k-card),
  :global(.match-active .article-card),
  :global(.match-active .user-card),
  :global(.match-active-row .k-message),
  :global(.match-active-row .k-card),
  :global(.match-active-row .article-card),
  :global(.match-active-row .user-card) {
    outline: 2.5px solid var(--care, var(--brand-accent)) !important;
    outline-offset: -1px;
    box-shadow: inset 0 0 12px 0
      var(--care-soft, color-mix(in srgb, var(--brand-accent) 20%, transparent)) !important;
    border-radius: var(--card-radius, 0.75rem);
  }
</style>

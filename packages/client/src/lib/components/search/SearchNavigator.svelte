<script lang="ts">
  import { Button } from "konsta/svelte";
  import { ArrowDown, ArrowUp, X } from "@lucide/svelte";
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
    border-top: 1px solid
      color-mix(in srgb, var(--brand-primary) 15%, transparent);
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

  .search-input {
    font-size: 16px;
    font-weight: 600;
    color: var(--ink);
    min-width: 0;
    flex: 1;
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
    border-radius: 0.375rem;
    padding: 0.125rem 0.375rem;
    outline: none;
  }

  .search-input:focus {
    border-color: var(--brand-accent);
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

  :global(.search-nav-btn),
  :global(.search-close-btn) {
    width: 1.75rem !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    background: color-mix(
      in srgb,
      var(--brand-accent) 15%,
      transparent
    ) !important;
  }

  :global(.search-nav-btn svg) {
    color: var(--ink) !important;
  }

  :global(.search-close-btn) {
    background: color-mix(in srgb, #e53e3e 15%, transparent) !important;
  }

  :global(.search-close-btn svg) {
    color: #e53e3e !important;
  }

  /* Search match highlight (global, active when this component is mounted) */

  :global(.virtual-row:has(.match-active):not([data-grid])),
  :global(.match-active-row),
  :global(.match-active) {
    background: color-mix(in srgb, var(--brand-accent) 15%, transparent);
    border-radius: var(--card-radius, 0.75rem);
  }

  :global(.match-active .k-message),
  :global(.match-active .k-card),
  :global(.match-active-row .k-message),
  :global(.match-active-row .k-card) {
    outline: 2.5px solid var(--brand-accent) !important;
    outline-offset: -1px;
    box-shadow: inset 0 0 12px 0
      color-mix(in srgb, var(--brand-accent) 20%, transparent) !important;
    border-radius: var(--card-radius, 0.75rem);
  }
</style>

<script lang="ts">
  import { Chip } from "konsta/svelte";
  import { ChevronDown } from "@lucide/svelte";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import type { FilterOption } from "./filter-types.js";

  interface Props {
    /** Dimension label shown when nothing is selected */
    label: string;
    options: FilterOption[];
    mode: "multi" | "single";
    /** multi: Set of selected values (empty = all). single: string | null */
    selected: ReadonlySet<string> | string | null;
    /** Whether this pill's popover is currently open */
    isOpen?: boolean;
    /** Called with the anchor element when the pill is tapped */
    onopen: (anchor: HTMLElement) => void;
  }

  let {
    label,
    options,
    mode,
    selected,
    isOpen = false,
    onopen,
  }: Props = $props();

  let anchorEl: HTMLElement | undefined = $state();

  /** Type guard: selected is a Set when mode is "multi". */
  function isMultiSelected(
    sel: ReadonlySet<string> | string | null,
  ): sel is ReadonlySet<string> {
    return sel instanceof Set;
  }

  const displayLabel = $derived.by(() => {
    if (mode === "multi" && isMultiSelected(selected)) {
      if (selected.size === 0) return label;
      if (selected.size === 1) {
        const val = [...selected][0];
        return options.find((o) => o.value === val)?.label ?? label;
      }
      return `${label} (${String(selected.size)})`;
    }
    if (selected === null || isMultiSelected(selected)) return label;
    return options.find((o) => o.value === selected)?.label ?? label;
  });

  const isActive = $derived(
    mode === "multi" && isMultiSelected(selected)
      ? selected.size > 0
      : selected !== null && !isMultiSelected(selected),
  );

  function handleClick(): void {
    if (anchorEl) onopen(anchorEl);
  }

  const handleKeydown = onKeyActivate(() => {
    if (anchorEl) onopen(anchorEl);
  });
</script>

<span bind:this={anchorEl} class="pill-anchor">
  <Chip
    outline={!isActive}
    class="glass filter-pill {isActive ? 'filter-pill--active' : ''}"
    onclick={handleClick}
    onkeydown={handleKeydown}
    role="button"
    tabindex={0}
    aria-haspopup={mode === "multi" ? "true" : "listbox"}
    aria-expanded={isOpen}
  >
    <span class="pill-label">{displayLabel}</span>
    <ChevronDown
      size={14}
      aria-hidden="true"
      class="pill-chevron {isOpen ? 'pill-chevron--open' : ''}"
    />
  </Chip>
</span>

<style>
  .pill-anchor {
    display: inline-flex;
    flex-shrink: 0;
  }

  :global(.filter-pill) {
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    transition: background-color 150ms ease;
  }

  /* iOS: handled by .glass utility (shared.css) */

  /* Material: solid tonal chip */
  :global(.k-material .filter-pill) {
    background: var(--surface-1);
    color: var(--ink);
  }

  /* Active: solid opaque, override glass */
  :global(.filter-pill--active) {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: none;
  }

  :global(.k-ios .filter-pill.filter-pill--active) {
    background: color-mix(
      in srgb,
      var(--brand-accent) 40%,
      var(--glass-surface)
    ) !important;
  }

  :global(.k-material .filter-pill--active) {
    background-color: var(--brand-accent) !important;
    color: var(--paper);
  }

  /* Increased contrast: MUST come after active rules (same specificity +
     !important, so source order decides). Overrides both .glass utility
     and Konsta Chip color classes. */
  @media (prefers-contrast: more) {
    :global(.k-ios .filter-pill),
    :global(.k-material .filter-pill) {
      background: Canvas !important;
      color: CanvasText !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
      border: 1px solid CanvasText !important;
    }

    :global(.k-ios .filter-pill.filter-pill--active),
    :global(.k-material .filter-pill.filter-pill--active) {
      background: var(--brand-accent) !important;
      color: Canvas !important;
      border-color: var(--brand-accent) !important;
    }
  }

  .pill-label {
    white-space: nowrap;
    font-size: 0.8125rem;
  }

  :global(.pill-chevron) {
    margin-left: 2px;
    transition: transform 150ms ease;
    flex-shrink: 0;
  }

  :global(.pill-chevron--open) {
    transform: rotate(180deg);
  }
</style>

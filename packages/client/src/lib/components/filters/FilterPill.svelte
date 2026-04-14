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
    class="filter-pill {isActive ? 'filter-pill--active' : ''}"
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
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background-color: rgb(128 128 128 / 0.15);
    transition: background-color 150ms ease;
  }

  @media (prefers-contrast: more) {
    :global(.filter-pill) {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background-color: Canvas;
      color: CanvasText;
      border: 1px solid CanvasText;
    }
  }

  :global(.filter-pill--active) {
    background-color: var(--ink);
    color: var(--paper);
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

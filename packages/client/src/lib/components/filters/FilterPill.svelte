<script lang="ts">
  import { ChevronDown } from "@lucide/svelte";
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
    return options.find((o) => o.value === selected)?.label ?? selected;
  });

  const isActive = $derived(
    mode === "multi" && isMultiSelected(selected)
      ? selected.size > 0
      : selected !== null && !isMultiSelected(selected),
  );

  function handleClick(): void {
    if (anchorEl) onopen(anchorEl);
  }
</script>

<!-- Pinned-anatomy exemption (see inkwell-design-language.md, "Pinned-anatomy
     exemptions"): the pill is a quiet bordered capsule with the org's pen on
     active border and text, never a fill. Konsta Chip fights this anatomy. -->
<span bind:this={anchorEl} class="pill-anchor">
  <button
    type="button"
    class="pill"
    class:on={isActive}
    onclick={handleClick}
    aria-haspopup={mode === "multi" ? "true" : "listbox"}
    aria-expanded={isOpen}
  >
    <span class="pill-label">{displayLabel}</span>
    <ChevronDown
      size={14}
      aria-hidden="true"
      class="pill-chevron {isOpen ? 'pill-chevron--open' : ''}"
    />
  </button>
</span>

<style>
  .pill-anchor {
    display: inline-flex;
    flex-shrink: 0;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    padding: 6px 12px;
    border: 1px solid var(--hair-2);
    border-radius: 999px;
    background: transparent;
    font: inherit;
    font-size: var(--text-sm);
    color: var(--ink-2);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  @media (prefers-reduced-motion: no-preference) {
    .pill {
      transition: border-color 150ms ease;
    }
  }

  .pill.on {
    border-color: var(--brand-text);
    color: var(--brand-text);
    font-weight: 700;
  }

  @media (prefers-contrast: more) {
    .pill {
      background: Canvas;
      border-color: CanvasText;
      color: CanvasText;
    }

    .pill.on {
      background: CanvasText;
      border-color: CanvasText;
      color: Canvas;
    }
  }

  .pill-label {
    white-space: nowrap;
  }

  :global(.pill-chevron) {
    margin-left: 2px;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    :global(.pill-chevron) {
      transition: transform 150ms ease;
    }
  }

  :global(.pill-chevron--open) {
    transform: rotate(180deg);
  }
</style>

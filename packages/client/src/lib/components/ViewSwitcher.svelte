<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import type { ViewMode } from "$lib/stores/view-mode.svelte.js";

  interface Props {
    mode: ViewMode;
    onchange: (mode: ViewMode) => void;
    /** Group label override; defaults to the shared "View as". */
    label?: string;
  }

  let { mode, onchange, label }: Props = $props();

  // Konsta's Segmented was considered and rejected for this slot: it styles
  // itself per platform (iOS thumb animation, Material fill) while the
  // Inkwell language pins one anatomy everywhere. Icon geometry comes from the
  // approved mock (inkwell-design-language.md, view switcher anatomy).
  const groupLabel = $derived(label ?? m.view_switcher_label());
</script>

<div class="view-switcher" role="group" aria-label={groupLabel}>
  <button
    type="button"
    class:active={mode === "list"}
    aria-label={m.view_switcher_rows()}
    aria-pressed={mode === "list"}
    onclick={() => onchange("list")}
  >
    <svg width="15" height="14" viewBox="0 0 15 14" aria-hidden="true">
      <line
        x1="1.5"
        y1="2.8"
        x2="13.5"
        y2="2.8"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <line
        x1="1.5"
        y1="7"
        x2="13.5"
        y2="7"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <line
        x1="1.5"
        y1="11.2"
        x2="13.5"
        y2="11.2"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
  </button>
  <button
    type="button"
    class:active={mode === "cards"}
    aria-label={m.view_switcher_cards()}
    aria-pressed={mode === "cards"}
    onclick={() => onchange("cards")}
  >
    <svg width="15" height="14" viewBox="0 0 15 14" aria-hidden="true">
      <rect
        x="1.5"
        y="1.5"
        width="12"
        height="11"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <line
        x1="4"
        y1="9.3"
        x2="11"
        y2="9.3"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
    </svg>
  </button>
  <button
    type="button"
    class:active={mode === "grid"}
    aria-label={m.view_switcher_grid()}
    aria-pressed={mode === "grid"}
    onclick={() => onchange("grid")}
  >
    <svg width="15" height="14" viewBox="0 0 15 14" aria-hidden="true">
      <rect
        x="1.5"
        y="1.5"
        width="5.2"
        height="5.2"
        rx="1.2"
        fill="currentColor"
      />
      <rect
        x="8.3"
        y="1.5"
        width="5.2"
        height="5.2"
        rx="1.2"
        fill="currentColor"
      />
      <rect
        x="1.5"
        y="7.3"
        width="5.2"
        height="5.2"
        rx="1.2"
        fill="currentColor"
      />
      <rect
        x="8.3"
        y="7.3"
        width="5.2"
        height="5.2"
        rx="1.2"
        fill="currentColor"
      />
    </svg>
  </button>
</div>

<style>
  .view-switcher {
    display: flex;
    border: 1px solid var(--hair-2);
    border-radius: 8px;
    overflow: hidden;
  }

  .view-switcher button {
    display: grid;
    place-items: center;
    width: 32px;
    height: 28px;
    padding: 0;
    background: none;
    border: none;
    border-right: 1px solid var(--hair);
    color: var(--muted);
    cursor: pointer;
  }

  .view-switcher button:last-child {
    border-right: none;
  }

  .view-switcher button.active {
    background: var(--raised);
    color: var(--brand-text);
  }

  .view-switcher svg {
    display: block;
  }
</style>

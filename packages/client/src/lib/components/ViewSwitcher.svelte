<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { Table2, List, CreditCard, LayoutGrid, Kanban } from "@lucide/svelte";
  import type { ViewMode } from "$lib/stores/view-mode.svelte.js";

  /** The four base modes every surface shows. */
  const BASE_MODES: readonly ViewMode[] = ["table", "list", "cards", "grid"];

  interface Props {
    mode: ViewMode;
    onchange: (mode: ViewMode) => void;
    /** Group label override; defaults to the shared "View as". */
    label?: string;
    /** Which mode buttons to show, in order. Defaults to the four base modes. */
    modes?: readonly ViewMode[];
  }

  let { mode, onchange, label, modes = BASE_MODES }: Props = $props();

  const visibleModes = $derived(new Set(modes));

  const groupLabel = $derived(label ?? m.view_switcher_label());
</script>

<div class="view-switcher" role="group" aria-label={groupLabel}>
  {#if visibleModes.has("table")}
    <button
      type="button"
      class:active={mode === "table"}
      aria-label={m.view_switcher_table()}
      aria-pressed={mode === "table"}
      onclick={() => onchange("table")}
    >
      <Table2 size={15} aria-hidden="true" />
    </button>
  {/if}
  {#if visibleModes.has("list")}
    <button
      type="button"
      class:active={mode === "list"}
      aria-label={m.view_switcher_rows()}
      aria-pressed={mode === "list"}
      onclick={() => onchange("list")}
    >
      <List size={15} aria-hidden="true" />
    </button>
  {/if}
  {#if visibleModes.has("cards")}
    <button
      type="button"
      class:active={mode === "cards"}
      aria-label={m.view_switcher_cards()}
      aria-pressed={mode === "cards"}
      onclick={() => onchange("cards")}
    >
      <CreditCard size={15} aria-hidden="true" />
    </button>
  {/if}
  {#if visibleModes.has("grid")}
    <button
      type="button"
      class:active={mode === "grid"}
      aria-label={m.view_switcher_grid()}
      aria-pressed={mode === "grid"}
      onclick={() => onchange("grid")}
    >
      <LayoutGrid size={15} aria-hidden="true" />
    </button>
  {/if}
  {#if visibleModes.has("kanban")}
    <button
      type="button"
      class:active={mode === "kanban"}
      aria-label={m.view_switcher_kanban()}
      aria-pressed={mode === "kanban"}
      onclick={() => onchange("kanban")}
    >
      <Kanban size={15} aria-hidden="true" />
    </button>
  {/if}
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
</style>

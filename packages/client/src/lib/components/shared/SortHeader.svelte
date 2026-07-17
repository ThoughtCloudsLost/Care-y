<!--
  Sortable column header for the shared data-table anatomy: a <th> carrying
  aria-sort plus the sort button. The button keeps a state-suffixed
  aria-label ("Votes, ascending") on top of the th's aria-sort so keyboard
  users tabbing straight to the button hear the state without table
  navigation. Styling lives in shared.css (.sort-header); domain tables pass
  their column classes through `class`.
-->
<script lang="ts">
  import { ArrowUp, ArrowDown } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface SortHeaderProps {
    readonly label: string;
    readonly active: boolean;
    readonly direction: "asc" | "desc";
    readonly onsort: () => void;
    /** Column classes for the th (width, hide-narrow/hide-medium). */
    readonly class?: string;
  }

  let {
    label,
    active,
    direction,
    onsort,
    class: className = "",
  }: SortHeaderProps = $props();

  const stateLabel = $derived(
    active
      ? direction === "asc"
        ? m.table_sort_ascending()
        : m.table_sort_descending()
      : m.table_sort_unsorted(),
  );
</script>

<th
  class={className}
  scope="col"
  aria-sort={active
    ? direction === "asc"
      ? "ascending"
      : "descending"
    : "none"}
>
  <button
    type="button"
    class="sort-header"
    class:sort-active={active}
    onclick={onsort}
    aria-label="{label}, {stateLabel}"
  >
    {label}
    {#if active}
      {#if direction === "asc"}
        <ArrowUp size={12} aria-hidden="true" />
      {:else}
        <ArrowDown size={12} aria-hidden="true" />
      {/if}
    {/if}
  </button>
</th>

<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    headerRight?: Snippet;
    stats?: Snippet;
    sort?: unknown;
    selectLabel?: string;
    onselect?: () => void;
    savedFilters?: unknown;
    filterPills?: unknown;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { headerRight, stats, children, ...rest }: Props = $props();
</script>

<div data-testid="stub-subnavbar">
  {#if headerRight}
    {@render headerRight()}
  {/if}
  {#if stats}
    {@render stats()}
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>

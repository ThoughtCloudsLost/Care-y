<!--
  Test-only stand-in for SubNavbarFilterLayout that renders only the stats
  row, so a page spec can read its count without mounting the sort, filter
  and saved-filter controls.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    readonly stats?: Snippet;
  }

  let { stats }: Props = $props();
</script>

<div data-testid="subnavbar-stats">
  {#if stats}
    {@render stats()}
  {/if}
</div>

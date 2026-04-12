<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";

  let { lines = 3 }: { lines?: number } = $props();

  // Deterministic widths to avoid layout shift
  const widths = [85, 70, 55, 90, 60, 75, 45, 80];
</script>

<div
  class="skeleton"
  role="status"
  aria-busy="true"
  aria-label={m.shell_loading()}
>
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
  {#each Array(lines) as _, i (i)}
    <div
      class="skeleton-bar"
      data-skeleton
      style:width="{widths[i % widths.length]}%"
      style:animation-delay="{i * 80}ms"
    ></div>
  {/each}
</div>

<style>
  .skeleton {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>

<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    count: number;
  }

  let { count }: Props = $props();

  // Unread is its own channel in the approved blue (--unread), mixed 78/22
  // toward --ink so the count text (--paper) keeps 4.5:1 contrast in both
  // light and dark schemes. Zero unread means no pill.
  const label = $derived(
    count === 1
      ? m.new_pill_count_one({ count })
      : m.new_pill_count_other({ count }),
  );
</script>

{#if count > 0}
  <span class="new-pill">{label}</span>
{/if}

<style>
  .new-pill {
    display: inline-block;
    font-size: 0.65625rem; /* 10.5px */
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 2px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--unread) 78%, var(--ink) 22%);
    color: var(--paper);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
</style>

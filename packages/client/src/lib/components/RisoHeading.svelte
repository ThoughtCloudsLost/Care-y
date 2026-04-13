<script lang="ts">
  import type { Snippet } from "svelte";

  interface RisoHeadingProps {
    /** Heading level: 1-6 */
    level: 1 | 2 | 3 | 4 | 5 | 6;
    /** Use SVG filter (true) or text-shadow (false). Default: true for level 1-2, false for 3-6. */
    ink?: boolean;
    children: Snippet;
  }

  let { level, ink, children }: RisoHeadingProps = $props();
  const useInk = $derived(ink ?? level <= 2);
</script>

<svelte:element
  this={`h${String(level)}`}
  class:heading-display={useInk}
  class:heading-compact={!useInk}
  data-ink={useInk ? "" : undefined}
>
  {@render children()}
</svelte:element>

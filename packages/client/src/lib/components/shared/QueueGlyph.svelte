<!--
  QueueGlyph: a queue's icon rendered in the queue's color.

  One display component per data type: every surface that shows queue
  color/icon renders this (admin queue list, dashboard tiles, queue
  choice lists, ticket meta). The glyph is decorative: the queue name is
  always adjacent text, so it carries aria-hidden and the icon shape
  (never color alone) is what differentiates queues visually.
-->
<script lang="ts">
  import type { QueueAppearance } from "$lib/utils/queue-appearance.js";

  interface QueueGlyphProps {
    appearance: QueueAppearance;
    size?: number;
  }

  let { appearance, size = 16 }: QueueGlyphProps = $props();
</script>

<span
  class="queue-glyph"
  style="--glyph-color: {appearance.colorHex}"
  aria-hidden="true"
>
  <appearance.icon {size} />
</span>

<style>
  .queue-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--glyph-color);
    flex-shrink: 0;
    /* Baseline nudge for inline text contexts; ignored in flex parents.
       Spacing is the call site's job (flex gap or a scoped margin). */
    vertical-align: -0.125em;
  }
</style>

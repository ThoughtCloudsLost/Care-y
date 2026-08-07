<script lang="ts">
  import { MousePointerClick } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    createFrameDodge,
    type DodgeFrameRect,
  } from "./frame-dodge.svelte.js";

  interface Props {
    /** Viewport-space frame rect, so the tip clears the phone the same
     *  way the story text below it does. */
    frameRect: DodgeFrameRect;
  }

  let { frameRect }: Props = $props();

  // The tip scrolls normally (no sticky offset), unlike the section
  // header above it.
  const dodge = createFrameDodge(() => frameRect);

  let tipEl = $state<HTMLDivElement | undefined>(undefined);

  $effect(() => {
    dodge.observe(tipEl);
  });
</script>

<div class="snap-tip" bind:this={tipEl}>
  <!-- Only the content insets out from under the phone; the outer box
       keeps its full width so the measurement stays stable (the measured
       element's own box never changes as a result of the inset). -->
  <div
    class="snap-tip-inner"
    style:margin-left="{dodge.left}px"
    style:margin-right="{dodge.right}px"
  >
    <MousePointerClick size={18} class="snap-tip-icon" />
    <!-- The copy says "in the phone". A device-view toggle (phone vs
         desktop frame) would need a per-device message key rather than a
         parameter, since the phrasing shifts per locale. -->
    <p class="snap-tip-text">{m.demo_narrative_tip()}</p>
  </div>
</div>

<style>
  .snap-tip {
    padding: 1rem;
    margin: 0 -1rem;
    color: #86868b;
  }

  .snap-tip-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition:
      margin-left 0.12s ease-out,
      margin-right 0.12s ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .snap-tip-inner {
      transition: none;
    }
  }

  :global(html.dark) .snap-tip {
    color: #98989d;
  }

  .snap-tip-text {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .snap-tip :global(.snap-tip-icon) {
    flex-shrink: 0;
  }
</style>

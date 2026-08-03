<script lang="ts">
  /**
   * Presentational overlay that shows a blurred low-res still of the
   * clip frame. When `ready` flips true, the still crossfades out
   * while the blur clears in the same animation window. After the
   * outro finishes, `onfaded` fires so the consumer can unmount.
   *
   * The blur is applied to the small upscaled bitmap, not to a large
   * live subtree. CSS upscaling a tiny canvas introduces natural
   * softness, and the explicit blur filter on that small element is
   * cheap. iOS re-blurs large layers every frame while they animate;
   * this sidesteps that cost entirely.
   */

  import { prefersReducedMotion } from "svelte/motion";
  import type { CapturedStill } from "./peek-still.js";

  interface Props {
    /** The captured low-res canvas to display. */
    still: CapturedStill;
    /** True when the live app underneath is ready. Triggers the crossfade out. */
    ready: boolean;
    /** Fires after the fade-out completes (or instantly under reduced motion). */
    onfaded?: () => void;
  }

  let { still, ready, onfaded }: Props = $props();

  /**
   * Duration of the combined fade-out and blur-clear animation.
   * Long enough to hide the seam between still and live app.
   */
  const FADE_MS = 350;
  const BLUR_PX = 12;

  /**
   * Custom out transition: opacity fades from 1 to 0 while the blur
   * clears from BLUR_PX to 0 in the same window. Both properties
   * animate together so the seam between the still and live app is
   * hidden by the overlap.
   */
  function fadeAndClear(_node: Element): {
    duration: number;
    css: (t: number) => string;
  } {
    // Reduced motion: instant swap, no fade. The outroend event
    // still fires, so onfaded reaches the consumer either way.
    if (prefersReducedMotion.current) {
      return { duration: 0, css: () => "" };
    }
    return {
      duration: FADE_MS,
      css: (t: number) => {
        const currentBlur = t * BLUR_PX;
        return `opacity: ${String(t)}; filter: blur(${String(currentBlur)}px);`;
      },
    };
  }

  // Paint the still canvas into the container. An attachment rather
  // than bind:this plus an effect: it runs with the element in hand
  // (no null window to guard) and re-runs when `still` changes. The
  // canvas is a real DOM node, so we append it directly rather than
  // serializing to a data URL (avoids a synchronous toDataURL and an
  // extra decode/paint cycle).
  function paintStill(el: HTMLElement): () => void {
    still.style.width = "100%";
    still.style.height = "100%";
    still.style.display = "block";
    el.appendChild(still);
    return () => {
      still.remove();
    };
  }
</script>

{#if !ready}
  <div
    class="peek-still"
    aria-hidden="true"
    {@attach paintStill}
    out:fadeAndClear
    onoutroend={onfaded}
  ></div>
{/if}

<style>
  .peek-still {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
    /* The blur is baked into the transition's initial state via the
       CSS function. Set it here too so the first paint is blurred
       before the transition system takes over. */
    filter: blur(12px);
    /* Upscale the tiny canvas with no interpolation smoothing,
       which would fight the blur. Crisp edges under the blur
       look the same as smooth ones, and skipping the filter
       saves compositor work. */
    image-rendering: pixelated;
    pointer-events: none;
  }
</style>

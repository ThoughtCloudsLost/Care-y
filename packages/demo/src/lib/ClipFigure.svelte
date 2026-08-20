<script lang="ts">
  /**
   * Inline region clip, presented as a figure.
   *
   * Muted, looping, playsinline video. Autoplay when entering view,
   * pause when leaving (IntersectionObserver). Under prefers-reduced-
   * motion the clip stays paused. Until capture tooling produces
   * assets, the video 404s: the error handler swaps in a placeholder
   * that keeps the layout stable.
   *
   * Attaches the long-press primitive for the peek gesture. All peek
   * logic lives upstream; this component surfaces callbacks only.
   */

  import { prefersReducedMotion } from "svelte/motion";
  import HoldRing from "./HoldRing.svelte";
  import { getClip } from "./clip-registry.js";
  import { createLongPress } from "./long-press.js";
  import type { SectionId } from "./scroll-sections.js";
  import type { PeekFirePayload } from "./clip-registry.js";

  // -----------------------------------------------------------------------
  // Props
  // -----------------------------------------------------------------------

  interface Props {
    sectionId: SectionId;
    subSlug: string;
    width: number;
    height: number;
    /** Accessible label for the figure. Provided by the wiring half. */
    ariaLabel: string;
    onpeekfire?: (payload: PeekFirePayload) => void;
    onpeekdrag?: (dx: number, dy: number) => void;
    onpeeksecondarytap?: () => void;
    onpeekrelease?: () => void;
    onpeekcancel?: () => void;
    onelement?: (el: HTMLElement) => void;
  }

  let {
    sectionId,
    subSlug,
    width,
    height,
    ariaLabel,
    onpeekfire,
    onpeekdrag,
    onpeeksecondarytap,
    onpeekrelease,
    onpeekcancel,
    onelement,
  }: Props = $props();

  // -----------------------------------------------------------------------
  // Clip source
  // -----------------------------------------------------------------------

  let clip = $derived(getClip(sectionId, subSlug));
  let videoFailed = $state(false);

  // Reset the failure state when the clip URL changes (new sub).
  $effect(() => {
    void clip.url;
    videoFailed = false;
  });

  function handleVideoError(): void {
    videoFailed = true;
  }

  // -----------------------------------------------------------------------
  // Video autoplay via IntersectionObserver
  // -----------------------------------------------------------------------

  // bind:this nullifies the ref when the element leaves the DOM (for
  // the video that happens on 404, when the error handler swaps in the
  // placeholder), so both refs must model null, not just undefined.
  let containerEl = $state<HTMLDivElement | null>(null);
  let videoEl = $state<HTMLVideoElement | null>(null);

  // Report the container element upward for engine prewarm.
  $effect(() => {
    if (containerEl !== null) {
      onelement?.(containerEl);
    }
  });

  $effect(() => {
    if (videoEl === null) return;
    const v = videoEl;
    const reducedMotion = prefersReducedMotion.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !reducedMotion) {
            void v.play().catch(() => {
              // Autoplay blocked or video unavailable; not actionable.
            });
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(v);
    return () => observer.disconnect();
  });

  // -----------------------------------------------------------------------
  // Long-press gesture
  // -----------------------------------------------------------------------

  let holdProgress = $state(0);
  let isHolding = $state(false);
  let isHeld = $state(false);

  const longPress = createLongPress({
    onFire() {
      isHeld = true;
      if (onpeekfire !== undefined && containerEl !== null) {
        const rect = containerEl.getBoundingClientRect();
        const v = videoEl;
        if (v !== null) {
          onpeekfire({
            rect,
            video: v,
            sectionId,
            subSlug,
          });
        }
      }
    },
    onProgress(t: number) {
      holdProgress = t;
      isHolding = t > 0 && t < 1;
    },
    onDrag(dx: number, dy: number) {
      onpeekdrag?.(dx, dy);
    },
    onSecondaryTap() {
      onpeeksecondarytap?.();
    },
    onRelease() {
      isHeld = false;
      isHolding = false;
      holdProgress = 0;
      onpeekrelease?.();
    },
    onCancel() {
      isHeld = false;
      isHolding = false;
      holdProgress = 0;
      onpeekcancel?.();
    },
  });

  // Attach the long-press to the container element.
  $effect(() => {
    if (containerEl === null) return;
    const cleanup = longPress.attach(containerEl);
    return () => cleanup.destroy();
  });

  // -----------------------------------------------------------------------
  // Keyboard accessibility: Enter/Space triggers the peek.
  // -----------------------------------------------------------------------

  function handleKeydown(ev: KeyboardEvent): void {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    ev.preventDefault();

    if (onpeekfire !== undefined && containerEl !== null) {
      const rect = containerEl.getBoundingClientRect();
      const v = videoEl;
      if (v !== null) {
        onpeekfire({
          rect,
          video: v,
          sectionId,
          subSlug,
          viaKeyboard: true,
        });
      }
    }
  }
</script>

<div
  class="clip-figure"
  class:clip-figure--pressing={isHolding}
  class:clip-figure--held={isHeld}
  bind:this={containerEl}
  style="width: {width}px; height: {height}px;"
  role="button"
  tabindex={0}
  aria-label={ariaLabel}
  onkeydown={handleKeydown}
>
  {#if !videoFailed}
    <video
      bind:this={videoEl}
      class="clip-figure__video"
      src={clip.url}
      muted
      loop
      playsinline
      preload="metadata"
      onerror={handleVideoError}
    ></video>
  {:else}
    <!-- Quiet placeholder when the video 404s. Keeps the figure's
         layout size stable so the flow does not reflow when assets
         appear. aria-hidden because it is decoration. -->
    <div class="clip-figure__placeholder" aria-hidden="true"></div>
  {/if}

  {#if isHolding}
    <div class="clip-figure__ring">
      <HoldRing progress={holdProgress} />
    </div>
  {/if}
</div>

<style>
  .clip-figure {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    touch-action: none;
    user-select: none;
    -webkit-touch-callout: none;
    transition: transform 0.15s ease;
  }

  /* Scale-down on press (not reduced-motion exempt per the spec:
     the spec says scale-down is reduced-motion exempt, since it is
     direct feedback to the user's physical action, not animation). */
  .clip-figure--pressing {
    transform: scale(0.96);
  }

  .clip-figure:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: 2px;
  }

  .clip-figure__video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 8px;
  }

  .clip-figure__placeholder {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: color-mix(in srgb, var(--ink) 6%, transparent);
  }

  .clip-figure__ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .clip-figure {
      transition: none;
    }
    .clip-figure--pressing {
      /* Scale feedback is reduced-motion exempt: it is immediate
         response to a physical press, not decorative animation. */
      transform: scale(0.96);
    }
  }
</style>

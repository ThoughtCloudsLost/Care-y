<!--
  Route-level content wrapper for scroll and layout control.
  Does NOT render a Konsta Page (that lives in AppShell).
  lockScroll disables scrolling for chat views with a fixed input bar at the bottom.

  overlayBottomBar (requires lockScroll): renders the bottom bar as a
  position:absolute glass layer over the scroll region instead of an
  opaque flex sibling. A ResizeObserver measures the bar and writes
  --bottom-bar-h so the scroll region reserves matching padding.
-->
<script lang="ts">
  import type { PageLayoutProps } from "./types";

  let {
    lockScroll = false,
    bottomBar,
    overlayBottomBar = false,
    underChrome = false,
    touchAction = "auto",
    scrollEl = $bindable(undefined),
    children,
  }: PageLayoutProps = $props();

  let layoutEl = $state<HTMLDivElement | undefined>();
  let bottomBarEl = $state<HTMLDivElement | undefined>();

  // Measure the overlay bottom bar and publish --bottom-bar-h on the
  // layout element so the scroll region can reserve matching padding.
  $effect(() => {
    if (!overlayBottomBar) return;
    const bar = bottomBarEl;
    const layout = layoutEl;
    if (bar == null || layout == null) return;

    function setHeight(h: number): void {
      if (layout == null) return;
      layout.style.setProperty("--bottom-bar-h", `${String(Math.ceil(h))}px`);
    }

    setHeight(bar.offsetHeight);

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const box = entry.borderBoxSize[0];
      setHeight(box !== undefined ? box.blockSize : bar.offsetHeight);
    });
    observer.observe(bar);

    return () => {
      observer.disconnect();
      layout.style.removeProperty("--bottom-bar-h");
    };
  });
</script>

<div
  bind:this={layoutEl}
  class="page-layout"
  class:lock-scroll={lockScroll}
  class:overlay-mode={overlayBottomBar}
  class:under-chrome={underChrome}
>
  {#if lockScroll}
    <div
      class="scroll-region"
      class:scroll-region-overlay={overlayBottomBar}
      class:chrome-underlap={underChrome}
      style:touch-action={touchAction}
      bind:this={scrollEl}
    >
      {@render children()}
    </div>
  {:else}
    {@render children()}
  {/if}
  {#if bottomBar}
    <div
      bind:this={bottomBarEl}
      class="bottom-bar"
      class:bottom-bar-overlay={overlayBottomBar}
    >
      {@render bottomBar()}
    </div>
  {/if}
</div>

<style>
  .page-layout {
    display: contents;
  }

  .page-layout.lock-scroll {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .page-layout.overlay-mode {
    position: relative;
  }

  /* chrome-underlap pulls the scroll region above this box, into the
     chrome padding the SHELL scroll container reserves. overflow: hidden
     here would clip that overhang at the bottom edge of the subnavbar
     (an element's own padding box is never clipped, but an intermediate
     ancestor's box is). The org chat container avoids the problem by
     carrying padding and overflow on one element; this override gives
     the portal the same clip chain. Sizing does not need the hidden
     overflow: min-height: 0 plus the region's own overflow-y do that.
     KEEP IN SYNC with the org thread's assembly (TicketDetail
     .chat-container): both consume .chrome-underlap through different
     DOM shapes; the clip-chain constraint is documented on the class
     in shared.css and a structural change on either surface must be
     mirrored on the other. */
  .page-layout.lock-scroll.under-chrome {
    overflow: visible;
  }

  .scroll-region {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .scroll-region-overlay {
    padding-bottom: var(--bottom-bar-h, 0px);
    scroll-padding-bottom: var(--bottom-bar-h, 0px);
  }

  .bottom-bar {
    flex-shrink: 0;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .bottom-bar-overlay {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    z-index: 10;
  }

  /* Glass treatment for the overlay bar. Mirrors ShellMessagebar's
     .shell-messagebar-anchor::before pattern: saturate(180%) blur(20px)
     with a mask fading upward, plus a translucent paper background so
     text stays readable against scrolling content. */
  .bottom-bar-overlay::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(100% + 40px);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--paper) 85%, transparent) 60%,
      transparent
    );
    mask-image: linear-gradient(
      to top,
      transparent,
      black 4px,
      black 60%,
      transparent
    );
    -webkit-mask-image: linear-gradient(
      to top,
      transparent,
      black 4px,
      black 60%,
      transparent
    );
    pointer-events: none;
    z-index: -1;
  }

  /* Accessibility: prefers-contrast:more drops all translucency for a
     fully opaque Canvas background, matching the .glass utility in
     shared.css. */
  @media (prefers-contrast: more) {
    .bottom-bar-overlay::before {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background: Canvas !important;
      mask-image: none !important;
      -webkit-mask-image: none !important;
      height: 100%;
    }
  }
</style>

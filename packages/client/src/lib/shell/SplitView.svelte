<!--
  Shared two-pane split view for desktop layouts.

  Left pane fills remaining space (flex: 1). Right pane defaults to
  --split-detail-width (480px) but can be resized by dragging the
  divider. Handles the max-width override needed to break out of
  the global 720px content constraint in shared.css.

  The subnavbar prop controls whether the split view extends behind
  the glass-blur subnavbar (used by list+detail layouts).
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { splitNavbar } from "$lib/stores/split-navbar.svelte.js";

  let {
    left,
    right,
    subnavbar = false,
    leftRef = $bindable<HTMLElement | undefined>(undefined),
  }: {
    left: Snippet;
    right: Snippet;
    subnavbar?: boolean;
    leftRef?: HTMLElement | undefined;
  } = $props();

  /** Smallest allowed pane width, applied to both sides of the divider. */
  const MIN_PANE = 280;
  /** Keyboard resize step as a percentage of the container width. */
  const KEY_STEP_PCT = 2;

  let rightWidth = $state(0);
  let dragging = $state(false);
  let containerEl = $state<HTMLElement | undefined>();
  let containerWidth = $state(0);

  function initWidth(): void {
    if (rightWidth === 0 && containerEl) {
      const val = getComputedStyle(containerEl)
        .getPropertyValue("--split-detail-width")
        .trim();
      rightWidth = parseInt(val, 10) || 480;
    }
  }

  function syncWidth(): void {
    if (containerEl) {
      containerWidth = containerEl.getBoundingClientRect().width;
    }
  }

  /** One clamp for both input paths so keyboard and drag agree on bounds. */
  function clampRight(px: number, width: number): number {
    return Math.max(MIN_PANE, Math.min(width - MIN_PANE, px));
  }

  $effect(() => {
    if (containerEl) {
      initWidth();
      syncWidth();
    }
  });

  $effect(() => {
    window.addEventListener("resize", syncWidth);
    return () => {
      window.removeEventListener("resize", syncWidth);
    };
  });

  // APG window-splitter value: the right pane as a percentage of the
  // container, bounded by the same MIN_PANE clamp the drag path uses.
  const toPct = (px: number): number => Math.round((px / containerWidth) * 100);
  const valueNow = $derived(containerWidth > 0 ? toPct(rightWidth) : undefined);
  const valueMin = $derived(containerWidth > 0 ? toPct(MIN_PANE) : undefined);
  const valueMax = $derived(
    containerWidth > 0 ? toPct(containerWidth - MIN_PANE) : undefined,
  );

  $effect(() => {
    if (rightWidth > 0) {
      document.documentElement.style.setProperty(
        "--split-right-w",
        `${String(rightWidth)}px`,
      );
    }
    return () => {
      document.documentElement.style.removeProperty("--split-right-w");
    };
  });

  function onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    dragging = true;
    const target = e.currentTarget;
    if (target instanceof HTMLElement) {
      target.setPointerCapture(e.pointerId);
    }
    e.preventDefault();
  }

  function onPointerMove(e: PointerEvent): void {
    if (!dragging || !containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    containerWidth = rect.width;
    rightWidth = clampRight(rect.right - e.clientX, rect.width);
  }

  function onPointerUp(): void {
    dragging = false;
  }

  function onDividerKeydown(e: KeyboardEvent): void {
    if (!containerEl) return;
    const width = containerEl.getBoundingClientRect().width;
    if (width <= 0) return;
    containerWidth = width;
    let next: number;
    switch (e.key) {
      case "ArrowLeft":
        next = rightWidth + (KEY_STEP_PCT / 100) * width;
        break;
      case "ArrowRight":
        next = rightWidth - (KEY_STEP_PCT / 100) * width;
        break;
      case "Home":
        next = MIN_PANE;
        break;
      case "End":
        next = width - MIN_PANE;
        break;
      default:
        return;
    }
    e.preventDefault();
    rightWidth = clampRight(next, width);
  }
</script>

<div
  class="split-view-container"
  class:has-subnavbar={subnavbar}
  bind:this={containerEl}
  data-testid="split-view"
  style:--right-w={rightWidth > 0
    ? `${String(rightWidth)}px`
    : "var(--split-detail-width, 480px)"}
>
  <div
    class="split-left-pane"
    bind:this={leftRef}
    data-testid="split-left-pane"
  >
    {@render left()}
  </div>

  <!-- APG window-splitter: a focusable separator with keyboard resize is
       the W3C-specified pattern (WAI-ARIA APG, Window Splitter); the
       compiler's a11y check misreads focusable separators as static. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="split-divider"
    class:split-divider-active={dragging}
    role="separator"
    aria-orientation="vertical"
    aria-label={m.split_view_resize_label()}
    aria-valuenow={valueNow}
    aria-valuemin={valueMin}
    aria-valuemax={valueMax}
    tabindex="0"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    onkeydown={onDividerKeydown}
  ></div>

  <div
    class="split-right-pane"
    data-testid="split-right-pane"
    style:--subnavbar-h={splitNavbar.rightSubnavbarHeight > 0
      ? `${String(splitNavbar.rightSubnavbarHeight)}px`
      : undefined}
  >
    {@render right()}
  </div>
</div>

{#if dragging}
  <div class="split-drag-overlay"></div>
{/if}

<style>
  :global(.main-content) > .split-view-container {
    max-width: none;
    margin-inline: 0;
    padding-inline: 0;
  }

  :global(.main-content.has-subnavbar) > .split-view-container.has-subnavbar {
    margin-top: calc(-1 * var(--subnavbar-h, 0px));
  }

  .split-view-container {
    display: flex;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    width: 100%;
  }

  .split-view-container.has-subnavbar {
    height: calc(100% + var(--subnavbar-h, 0px));
  }

  .split-left-pane {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .has-subnavbar .split-left-pane {
    padding-top: var(--subnavbar-h, 0px);
  }

  .split-divider {
    width: 5px;
    margin-inline: -2px;
    flex-shrink: 0;
    background: transparent;
    cursor: col-resize;
    position: relative;
    z-index: 2;
    touch-action: none;
  }

  .split-divider::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 2px;
    width: 1px;
    background: var(--hair, var(--divider));
  }

  .split-divider:hover::after,
  .split-divider-active::after {
    background: var(--brand-text);
    width: 2px;
    left: 1.5px;
  }

  .split-divider:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 0;
  }

  .split-right-pane {
    width: var(--right-w, var(--split-detail-width, 480px));
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .has-subnavbar .split-right-pane {
    padding-top: var(--subnavbar-h, 0px);
  }

  .split-drag-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    cursor: col-resize;
  }
</style>

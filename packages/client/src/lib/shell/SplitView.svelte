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

  let rightWidth = $state(0);
  let dragging = $state(false);
  let containerEl = $state<HTMLElement | undefined>();

  function initWidth(): void {
    if (rightWidth === 0 && containerEl) {
      const val = getComputedStyle(containerEl)
        .getPropertyValue("--split-detail-width")
        .trim();
      rightWidth = parseInt(val, 10) || 480;
    }
  }

  $effect(() => {
    if (containerEl) initWidth();
  });

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
    const newRight = rect.right - e.clientX;
    const minPane = 280;
    const maxRight = rect.width - minPane;
    rightWidth = Math.max(minPane, Math.min(maxRight, newRight));
  }

  function onPointerUp(): void {
    dragging = false;
  }
</script>

<div
  class="split-view-container"
  class:has-subnavbar={subnavbar}
  bind:this={containerEl}
  style:--right-w={rightWidth > 0
    ? `${String(rightWidth)}px`
    : "var(--split-detail-width, 480px)"}
>
  <div class="split-left-pane" bind:this={leftRef}>
    {@render left()}
  </div>

  <div
    class="split-divider"
    class:split-divider-active={dragging}
    role="separator"
    aria-orientation="vertical"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></div>

  <div
    class="split-right-pane"
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

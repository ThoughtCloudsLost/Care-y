<script lang="ts">
  /**
   * Glass-morphism book-icon tab docked to a screen edge.
   *
   * Replaces the floating pill toolbar with a single 44x44 button
   * flush against one viewport edge. Draggable to any edge via
   * pointer capture; click (< 4px travel) toggles the handbook drawer.
   */

  import { BookOpen } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    type DockEdge,
    resolveTabPosition,
    edgeFromDragPosition,
    TAB_SIZE,
    TAB_MARGIN,
  } from "./fullscreen.svelte.js";

  const DRAG_SLOP = 4;

  function offsetAlongEdge(
    edge: DockEdge,
    cx: number,
    cy: number,
    winW: number,
    winH: number,
  ): number {
    const half = TAB_SIZE / 2;
    if (edge === "top" || edge === "bottom") {
      const range = winW - TAB_SIZE - TAB_MARGIN * 2;
      return range > 0
        ? Math.max(0, Math.min(1, (cx - half - TAB_MARGIN) / range))
        : 0.5;
    }
    const range = winH - TAB_SIZE - TAB_MARGIN * 2;
    return range > 0
      ? Math.max(0, Math.min(1, (cy - half - TAB_MARGIN) / range))
      : 0.5;
  }

  // -----------------------------------------------------------------------
  // Props
  // -----------------------------------------------------------------------

  interface Props {
    edge: DockEdge;
    offset: number;
    drawerOpen: boolean;
    /** Current drawer measure so the tab can extend from the drawer edge. */
    drawerMeasure: number;
    onToggleDrawer: () => void;
    onDock: (edge: DockEdge, offset: number) => void;
    /** Close drawer at drag start, reopen on release. */
    onCloseDrawer: () => void;
    onOpenDrawer: () => void;
  }

  let {
    edge,
    offset,
    drawerOpen,
    drawerMeasure,
    onToggleDrawer,
    onDock,
    onCloseDrawer,
    onOpenDrawer,
  }: Props = $props();

  let reopenOnDrop = false;

  // -----------------------------------------------------------------------
  // Window dimensions
  // -----------------------------------------------------------------------

  let windowW = $state(window.innerWidth);
  let windowH = $state(window.innerHeight);

  $effect(() => {
    function onResize(): void {
      windowW = window.innerWidth;
      windowH = window.innerHeight;
    }
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  });

  // -----------------------------------------------------------------------
  // Drag state
  // -----------------------------------------------------------------------

  let dragging = $state(false);
  let dragEdge: DockEdge = $state("right");
  let dragOffset = $state(0.5);
  let startX = 0;
  let startY = 0;
  let dragRaf = 0;
  let pendCx = 0;
  let pendCy = 0;
  let btnRef: HTMLButtonElement | null = $state(null);

  // -----------------------------------------------------------------------
  // Computed position
  // -----------------------------------------------------------------------

  const activeEdge: DockEdge = $derived(dragging ? dragEdge : edge);
  const activeOffset: number = $derived(dragging ? dragOffset : offset);
  const basePos = $derived(
    resolveTabPosition(activeEdge, activeOffset, TAB_SIZE, windowW, windowH),
  );

  // When the drawer is open, shift the tab inward so it extends from
  // the drawer's exterior edge rather than the viewport edge.
  const pos = $derived.by(() => {
    if (!drawerOpen || dragging) return basePos;
    const dm = drawerMeasure;
    switch (activeEdge) {
      case "right":
        return { top: basePos.top, left: basePos.left - dm };
      case "left":
        return { top: basePos.top, left: basePos.left + dm };
      case "top":
        return { top: basePos.top + dm, left: basePos.left };
      case "bottom":
        return { top: basePos.top - dm, left: basePos.left };
    }
  });

  // -----------------------------------------------------------------------
  // Pointer handlers
  // -----------------------------------------------------------------------

  function handlePointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    dragging = false;
    btnRef?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent): void {
    if (btnRef?.hasPointerCapture(e.pointerId) !== true) return;

    pendCx = e.clientX;
    pendCy = e.clientY;

    if (!dragging) {
      const dx = pendCx - startX;
      const dy = pendCy - startY;
      if (Math.hypot(dx, dy) < DRAG_SLOP) return;
      dragging = true;
      if (drawerOpen) {
        reopenOnDrop = true;
        onCloseDrawer();
      }
    }

    if (dragRaf === 0) {
      dragRaf = requestAnimationFrame(() => {
        dragRaf = 0;
        const newEdge = edgeFromDragPosition(pendCx, pendCy, windowW, windowH);
        dragEdge = newEdge;
        dragOffset = offsetAlongEdge(newEdge, pendCx, pendCy, windowW, windowH);
      });
    }
  }

  function handlePointerUp(e: PointerEvent): void {
    if (btnRef?.hasPointerCapture(e.pointerId) !== true) return;
    btnRef.releasePointerCapture(e.pointerId);

    if (dragRaf !== 0) {
      cancelAnimationFrame(dragRaf);
      dragRaf = 0;
    }

    if (dragging) {
      onDock(dragEdge, dragOffset);
      dragging = false;
      if (reopenOnDrop) {
        reopenOnDrop = false;
        onOpenDrawer();
      }
    } else {
      onToggleDrawer();
    }
  }

  function handlePointerCancel(e: PointerEvent): void {
    if (dragRaf !== 0) {
      cancelAnimationFrame(dragRaf);
      dragRaf = 0;
    }
    dragging = false;
    btnRef?.releasePointerCapture(e.pointerId);
  }

  // -----------------------------------------------------------------------
  // Keyboard navigation
  // -----------------------------------------------------------------------

  const ADJACENT = new Map<
    DockEdge,
    { along: [string, string]; cross: [DockEdge, DockEdge] }
  >([
    ["right", { along: ["ArrowUp", "ArrowDown"], cross: ["left", "right"] }],
    ["left", { along: ["ArrowUp", "ArrowDown"], cross: ["right", "left"] }],
    ["top", { along: ["ArrowLeft", "ArrowRight"], cross: ["bottom", "top"] }],
    [
      "bottom",
      { along: ["ArrowLeft", "ArrowRight"], cross: ["top", "bottom"] },
    ],
  ]);

  /** Opposite edge for cross-edge jumps. */
  const OPPOSITE = new Map<DockEdge, DockEdge>([
    ["right", "left"],
    ["left", "right"],
    ["top", "bottom"],
    ["bottom", "top"],
  ]);

  function handleKeydown(e: KeyboardEvent): void {
    const step = 0.1;
    const map = ADJACENT.get(edge);
    if (map === undefined) return;

    const [backward, forward] = map.along;

    if (e.key === backward) {
      e.preventDefault();
      const next = offset - step;
      if (next < 0) {
        onDock(map.cross[0], 0.5);
      } else {
        onDock(edge, Math.max(0, next));
      }
    } else if (e.key === forward) {
      e.preventDefault();
      const next = offset + step;
      if (next > 1) {
        onDock(map.cross[1], 0.5);
      } else {
        onDock(edge, Math.min(1, next));
      }
    } else if (
      (edge === "right" && e.key === "ArrowLeft") ||
      (edge === "left" && e.key === "ArrowRight") ||
      (edge === "top" && e.key === "ArrowDown") ||
      (edge === "bottom" && e.key === "ArrowUp")
    ) {
      e.preventDefault();
      const opposite = OPPOSITE.get(edge);
      if (opposite !== undefined) {
        onDock(opposite, 0.5);
      }
    }
  }
</script>

<button
  class="edge-tab edge-tab--{activeEdge}"
  class:edge-tab--active={drawerOpen}
  class:edge-tab--dragging={dragging}
  type="button"
  bind:this={btnRef}
  style:top="{pos.top}px"
  style:left="{pos.left}px"
  aria-label={drawerOpen ? m.demo_fs_drawer_close() : m.demo_fs_drawer_open()}
  aria-pressed={drawerOpen}
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerCancel}
  onkeydown={handleKeydown}
>
  <BookOpen size={20} />
</button>

<style>
  .edge-tab {
    position: fixed;
    z-index: 130;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--hair);
    background: color-mix(in srgb, var(--paper) 85%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 2px 8px var(--glass-shadow);
    color: var(--ink-2);
    cursor: pointer;
    touch-action: none;
    transition:
      box-shadow 0.15s ease,
      transform 0.15s ease,
      top 0.25s ease,
      left 0.25s ease,
      background 0.15s ease;
    padding: 0;
  }

  .edge-tab:hover {
    box-shadow: 0 4px 12px var(--glass-shadow);
    color: var(--ink);
  }

  .edge-tab:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: 2px;
  }

  .edge-tab--active {
    background: var(--paper);
    color: var(--demo-accent);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
  }

  /* Half-rounded rectangle per edge: flush side loses its border and
     radius, interior corners round to 10px. */
  .edge-tab--right {
    border-radius: 10px 0 0 10px;
    border-right: none;
  }
  .edge-tab--left {
    border-radius: 0 10px 10px 0;
    border-left: none;
  }
  .edge-tab--top {
    border-radius: 0 0 10px 10px;
    border-top: none;
  }
  .edge-tab--bottom {
    border-radius: 10px 10px 0 0;
    border-bottom: none;
  }

  .edge-tab--dragging {
    transform: scale(1.05);
    box-shadow: 0 6px 16px var(--glass-shadow);
    transition: transform 0.15s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .edge-tab {
      transition: none;
    }
  }
</style>

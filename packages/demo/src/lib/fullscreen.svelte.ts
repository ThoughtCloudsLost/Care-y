/**
 * Fullscreen mode controller for the demo simulator.
 *
 * When the simulated phone frame grows large enough to leave no usable
 * text column beside it, fullscreen mode takes the app to window size.
 * The underlying FrameGeometry keeps the pre-fullscreen snapshot so
 * exit restores the frame exactly.
 *
 * Pure functions are exported for testing; the factory owns the
 * reactive state.
 */

import { MIN_SEGMENT, HOLE_GAP, FULL_BLEED_SLIVER } from "./flow-layout.js";
import type { FrameGeometry } from "./frame-geometry.svelte.js";
import type { SavedGeometry } from "./peek-controller.svelte.js";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type DockEdge = "top" | "right" | "bottom" | "left";

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

/** Maximum prose measure inside the drawer (MAX_MEASURE precedent). */
export const DRAWER_MAX_MEASURE = 620;

/** Measure the drawer opens at, and returns to after a snap close. */
export const DRAWER_DEFAULT_MEASURE = 320;

/**
 * Resizing below this closes the drawer instead.
 *
 * Set where the drawer stops being able to show anything: the docked
 * top bar keeps 128px of controls in a row inset by 70px, so under
 * roughly 200px the bar itself overflows and the contents picker is
 * already down to nothing. A drag past that reads as "close" rather
 * than "make it tiny".
 */
export const DRAWER_SNAP_CLOSE_MEASURE = 200;

/** Duration (ms) for the frame box and toolbar FLIP animations. */
export const FULLSCREEN_ANIM_MS = 300;

/** Easing curve for the frame/toolbar fullscreen transition.
 *  A calmer ease-out (no overshoot) because a window-filling rect with
 *  bounce would look jittery. */
export const FULLSCREEN_EASE = "cubic-bezier(0.25, 1, 0.5, 1)";

/** Inset from edge ends for the tab button. */
export const TAB_MARGIN = 8;

/** The tab button's dimension (width or height depending on edge). */
export const TAB_SIZE = 44;

// -----------------------------------------------------------------------
// Pure functions
// -----------------------------------------------------------------------

/**
 * Whether the frame exerts enough pressure to warrant fullscreen.
 *
 * True when no flank of the window can host a MIN_SEGMENT line beside
 * the frame AND the vertical band gap is under FULL_BLEED_SLIVER.
 * Position-independent: uses only outer dimensions vs. window
 * dimensions, so dragging the frame around never flaps the result.
 *
 * @param outerW  Frame outer width including bezel
 * @param outerH  Frame outer height including bezel
 * @param windowW Browser viewport width
 * @param windowH Browser viewport height
 * @param chromeH Page top-chrome height (top bar + flow band when open)
 */
export function isFullscreenPressure(
  outerW: number,
  outerH: number,
  windowW: number,
  windowH: number,
  chromeH: number,
): boolean {
  const horizontalRoom = windowW - outerW - HOLE_GAP * 2;
  const horizontalBlocked = horizontalRoom < MIN_SEGMENT;

  const usableH = windowH - chromeH;
  const verticalGap = usableH - outerH;
  const verticalBlocked = verticalGap < FULL_BLEED_SLIVER;

  return horizontalBlocked && verticalBlocked;
}

/**
 * Clamp a desired drawer measure to the window dimension for the
 * active edge. Left/right edges clamp against width; top/bottom
 * clamp against height.
 */
export function clampDrawerMeasure(
  desired: number,
  windowW: number,
  windowH: number,
  edge: DockEdge,
): number {
  const max = edge === "left" || edge === "right" ? windowW : windowH;
  return Math.min(Math.max(desired, 0), Math.max(max, 0));
}

/** Convert a fractional offset (0-1) along an edge to a pixel {top, left} for the tab. */
export function resolveTabPosition(
  edge: DockEdge,
  offset: number,
  tabSize: number,
  windowW: number,
  windowH: number,
): { top: number; left: number } {
  const margin = TAB_MARGIN;
  if (edge === "top" || edge === "bottom") {
    const range = windowW - tabSize - margin * 2;
    const along =
      margin + Math.max(0, range) * Math.min(1, Math.max(0, offset));
    return {
      top: edge === "top" ? 0 : windowH - tabSize,
      left: along,
    };
  }
  // left or right
  const range = windowH - tabSize - margin * 2;
  const along = margin + Math.max(0, range) * Math.min(1, Math.max(0, offset));
  return {
    top: along,
    left: edge === "left" ? 0 : windowW - tabSize,
  };
}

/** Determine which edge is nearest to a pointer position. */
export function edgeFromDragPosition(
  x: number,
  y: number,
  windowW: number,
  windowH: number,
): DockEdge {
  const distances: [DockEdge, number][] = [
    ["top", y],
    ["bottom", windowH - y],
    ["left", x],
    ["right", windowW - x],
  ];
  distances.sort((a, b) => a[1] - b[1]);
  return distances[0]![0];
}

// -----------------------------------------------------------------------
// Controller interface
// -----------------------------------------------------------------------

export interface FullscreenController {
  /** True while fullscreen mode is active. */
  readonly active: boolean;
  /** True when fullscreen was entered automatically (pressure or narrow default). */
  readonly autoEntered: boolean;
  /** Saved geometry from before entry, for restore on exit. */
  readonly saved: SavedGeometry | null;
  /** Which window edge the tab is docked to. */
  readonly dockEdge: DockEdge;
  /** Fractional position (0-1) along the docked edge. */
  readonly dockOffset: number;
  /** Whether the handbook drawer is open. */
  readonly drawerOpen: boolean;
  /** Current drawer measure (width for L/R edge, height for T/B). */
  readonly drawerMeasure: number;

  /**
   * Enter fullscreen mode.
   * No-op when peek is not idle (checked via the injected guard).
   *
   * @param auto     True for auto-entry (pressure threshold or narrow default)
   * @param snapshot Geometry to restore on exit
   */
  enter(auto: boolean, snapshot: SavedGeometry): void;

  /** Exit fullscreen, restoring the saved snapshot into geo. */
  exit(): void;

  /**
   * Drop the fullscreen override without restoring saved geometry.
   * Used when the user drags an edge inward past the threshold
   * mid-gesture, so the frame reappears at its live dragged size.
   */
  exitIntoResize(): void;

  /** Update dock edge and fractional offset (clamped to [0, 1]). */
  setDock(edge: DockEdge, offset: number): void;

  /** Toggle the handbook drawer open/closed. */
  toggleDrawer(): void;

  /** Open the handbook drawer. */
  openDrawer(): void;

  /** Close the handbook drawer. */
  closeDrawer(): void;

  /** Set drawer measure (clamped). Never closes; see settleDrawer. */
  setDrawerMeasure(m: number): void;

  /**
   * End a resize gesture. Closes the drawer when it came to rest under
   * DRAWER_SNAP_CLOSE_MEASURE, so a drag can cross the threshold and
   * come back out without the drawer shutting mid-gesture.
   */
  settleDrawer(): void;

  /** Full reset (restart path). Clears all state. */
  reset(): void;
}

// -----------------------------------------------------------------------
// Factory
// -----------------------------------------------------------------------

/**
 * @param geo            The FrameGeometry instance to restore on exit.
 * @param isPeekIdle     Returns true when the peek controller is in its
 *                       idle phase. Fullscreen entry is gated on this.
 * @param getWindowSize  Returns the current window dimensions. Injected
 *                       so the factory stays testable without a real DOM.
 */
export function createFullscreenController(
  geo: FrameGeometry,
  isPeekIdle: () => boolean = () => true,
  getWindowSize: () => { w: number; h: number } = () => {
    if (typeof window === "undefined") return { w: 1280, h: 900 };
    return { w: window.innerWidth, h: window.innerHeight };
  },
): FullscreenController {
  let active = $state(false);
  let autoEntered = $state(false);
  let saved: SavedGeometry | null = $state(null);
  let dockEdge: DockEdge = $state("right");
  let dockOffset = $state(0.85);
  let drawerOpen = $state(false);
  let drawerMeasure = $state(DRAWER_DEFAULT_MEASURE);

  function enter(auto: boolean, snapshot: SavedGeometry): void {
    if (!isPeekIdle()) return;
    if (active) return;

    saved = snapshot;
    autoEntered = auto;
    active = true;
  }

  function exit(): void {
    if (!active) return;
    if (saved !== null) {
      geo.setFootprint(saved.footprintW, saved.footprintH);
      geo.setPosition(saved.top, saved.left);
      geo.settleShrinkAfterResize();
      geo.reanchorBand();
      geo.clampToViewport();
    }
    active = false;
    autoEntered = false;
    saved = null;
    drawerOpen = false;
  }

  function exitIntoResize(): void {
    if (!active) return;
    active = false;
    autoEntered = false;
    saved = null;
    drawerOpen = false;
  }

  function setDock(edge: DockEdge, offset: number): void {
    const wasHorizontal = dockEdge === "top" || dockEdge === "bottom";
    const isHorizontal = edge === "top" || edge === "bottom";
    dockEdge = edge;
    dockOffset = Math.min(1, Math.max(0, offset));
    if (wasHorizontal !== isHorizontal) {
      drawerMeasure = isHorizontal
        ? Math.round(getWindowSize().h * 0.75)
        : DRAWER_DEFAULT_MEASURE;
    }
  }

  function toggleDrawer(): void {
    drawerOpen = !drawerOpen;
  }

  function openDrawer(): void {
    if (drawerMeasure < DRAWER_SNAP_CLOSE_MEASURE) {
      const isHorizontal = dockEdge === "top" || dockEdge === "bottom";
      if (isHorizontal) {
        drawerMeasure = Math.round(getWindowSize().h * 0.75);
      } else {
        drawerMeasure = DRAWER_DEFAULT_MEASURE;
      }
    }
    drawerOpen = true;
  }

  function closeDrawer(): void {
    drawerOpen = false;
  }

  function setDrawerMeasure(m: number): void {
    const win = getWindowSize();
    drawerMeasure = clampDrawerMeasure(m, win.w, win.h, dockEdge);
  }

  function settleDrawer(): void {
    if (drawerMeasure < DRAWER_SNAP_CLOSE_MEASURE) {
      drawerOpen = false;
    }
  }

  function reset(): void {
    active = false;
    autoEntered = false;
    saved = null;
    dockEdge = "right";
    dockOffset = 0.85;
    drawerOpen = false;
    drawerMeasure = DRAWER_DEFAULT_MEASURE;
  }

  return {
    get active(): boolean {
      return active;
    },
    get autoEntered(): boolean {
      return autoEntered;
    },
    get saved(): SavedGeometry | null {
      return saved;
    },
    get dockEdge(): DockEdge {
      return dockEdge;
    },
    get dockOffset(): number {
      return dockOffset;
    },
    get drawerOpen(): boolean {
      return drawerOpen;
    },
    get drawerMeasure(): number {
      return drawerMeasure;
    },
    enter,
    exit,
    exitIntoResize,
    setDock,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    setDrawerMeasure,
    settleDrawer,
    reset,
  };
}

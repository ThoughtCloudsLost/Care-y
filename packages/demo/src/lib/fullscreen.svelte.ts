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
// Constants
// -----------------------------------------------------------------------

/** Thinnest readable prose column for the handbook drawer. */
export const DRAWER_MIN_W = 240;

/** Sliver of the app that must remain visible when the drawer is open. */
export const MIN_APP_STRIP = 64;

/** Maximum prose measure inside the drawer (MAX_MEASURE precedent). */
export const DRAWER_MAX_MEASURE = 620;

/** Duration (ms) for the frame box and toolbar FLIP animations. */
export const FULLSCREEN_ANIM_MS = 300;

/** Easing curve for the frame/toolbar fullscreen transition.
 *  A calmer ease-out (no overshoot) because a window-filling rect with
 *  bounce would look jittery. */
export const FULLSCREEN_EASE = "cubic-bezier(0.25, 1, 0.5, 1)";

/** Inset kept around the pill on every edge. */
const PILL_MARGIN = 8;

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
  // Horizontal: neither side can hold a MIN_SEGMENT line plus its gap
  const horizontalRoom = windowW - outerW - HOLE_GAP * 2;
  const horizontalBlocked = horizontalRoom < MIN_SEGMENT;

  // Vertical: the band gap above and below the frame is tiny
  const usableH = windowH - chromeH;
  const verticalGap = usableH - outerH;
  const verticalBlocked = verticalGap < FULL_BLEED_SLIVER;

  return horizontalBlocked && verticalBlocked;
}

/**
 * Clamp pill position so the pill stays ENTIRELY on screen with an
 * 8px margin on every edge. Unlike clampPosition's 80px-sliver rule,
 * the pill is small enough that partial visibility looks broken.
 */
export function clampPillPosition(
  top: number,
  left: number,
  pillW: number,
  pillH: number,
  windowW: number,
  windowH: number,
): { top: number; left: number } {
  // Ceiling first, floor last: when the pill is larger than the window
  // the two bounds cross, and the floor must win so the pill's top-left
  // controls stay reachable.
  return {
    top: Math.max(PILL_MARGIN, Math.min(top, windowH - pillH - PILL_MARGIN)),
    left: Math.max(PILL_MARGIN, Math.min(left, windowW - pillW - PILL_MARGIN)),
  };
}

/**
 * Clamp a desired drawer width to the allowed range.
 *
 * The drawer may grow up to windowW - MIN_APP_STRIP (leaving a sliver
 * of the app visible) but never wider than the window or narrower than
 * DRAWER_MIN_W. On tiny windows where DRAWER_MIN_W would exceed the
 * available space, MIN_APP_STRIP wins.
 */
export function clampDrawerWidth(desired: number, windowW: number): number {
  const maxW = windowW - MIN_APP_STRIP;
  return Math.min(
    Math.max(desired, DRAWER_MIN_W),
    Math.max(maxW, DRAWER_MIN_W),
  );
}

/**
 * Default pill position: top-left of the window, below the 8px
 * top-edge hot strip so resting there never triggers the reveal.
 */
export function defaultPillPosition(
  pillW: number,
  pillH: number,
  windowW: number,
  windowH: number,
): { top: number; left: number } {
  return clampPillPosition(
    PILL_MARGIN * 3,
    PILL_MARGIN,
    pillW,
    pillH,
    windowW,
    windowH,
  );
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
  /** Current pill position. */
  readonly pillPos: { top: number; left: number };
  /** Whether the handbook drawer is open. */
  readonly drawerOpen: boolean;
  /** Current drawer width. */
  readonly drawerW: number;

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

  /** Update pill position (clamped). */
  setPillPos(top: number, left: number, pillW: number, pillH: number): void;

  /** Toggle the handbook drawer open/closed. */
  toggleDrawer(): void;

  /** Close the handbook drawer. */
  closeDrawer(): void;

  /** Set drawer width (clamped). */
  setDrawerW(w: number): void;

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
  let pillPos = $state({ top: 0, left: 0 });
  let drawerOpen = $state(false);
  let drawerW = $state(320);

  function enter(auto: boolean, snapshot: SavedGeometry): void {
    if (!isPeekIdle()) return;
    if (active) return;

    saved = snapshot;
    autoEntered = auto;
    active = true;

    const win = getWindowSize();
    const defaultPos = defaultPillPosition(160, 40, win.w, win.h);
    pillPos = defaultPos;
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

  function setPillPos(
    top: number,
    left: number,
    pillW: number,
    pillH: number,
  ): void {
    const win = getWindowSize();
    pillPos = clampPillPosition(top, left, pillW, pillH, win.w, win.h);
  }

  function toggleDrawer(): void {
    drawerOpen = !drawerOpen;
  }

  function closeDrawer(): void {
    drawerOpen = false;
  }

  function setDrawerW(w: number): void {
    const win = getWindowSize();
    drawerW = clampDrawerWidth(w, win.w);
  }

  function reset(): void {
    active = false;
    autoEntered = false;
    saved = null;
    pillPos = { top: 0, left: 0 };
    drawerOpen = false;
    drawerW = 320;
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
    get pillPos(): { top: number; left: number } {
      return pillPos;
    },
    get drawerOpen(): boolean {
      return drawerOpen;
    },
    get drawerW(): number {
      return drawerW;
    },
    enter,
    exit,
    exitIntoResize,
    setPillPos,
    toggleDrawer,
    closeDrawer,
    setDrawerW,
    reset,
  };
}

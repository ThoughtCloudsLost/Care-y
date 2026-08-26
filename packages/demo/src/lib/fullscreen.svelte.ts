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

/** Maximum prose measure inside the drawer (MAX_MEASURE precedent). */
export const DRAWER_MAX_MEASURE = 620;

/** Width the drawer opens at, and returns to after a snap close. */
export const DRAWER_DEFAULT_W = 320;

/**
 * Resizing below this closes the drawer instead.
 *
 * Set where the drawer stops being able to show anything: the docked
 * top bar keeps 128px of controls in a row inset by 70px, so under
 * roughly 200px the bar itself overflows and the contents picker is
 * already down to nothing. A drag past that reads as "close" rather
 * than "make it tiny".
 */
export const DRAWER_SNAP_CLOSE_W = 200;

/** Duration (ms) for the frame box and toolbar FLIP animations. */
export const FULLSCREEN_ANIM_MS = 300;

/** Easing curve for the frame/toolbar fullscreen transition.
 *  A calmer ease-out (no overshoot) because a window-filling rect with
 *  bounce would look jittery. */
export const FULLSCREEN_EASE = "cubic-bezier(0.25, 1, 0.5, 1)";

/** Inset kept around the pill on every edge. */
const PILL_MARGIN = 8;

/**
 * Height of the TopBar reveal strip (.fs-top-hot-strip), the invisible
 * band along the window's top edge that slides the hidden TopBar into
 * view on hover. The pill rests clear of it, so reaching for the pill
 * does not pull the TopBar down on the way.
 */
const TOP_HOT_STRIP = 8;

/** Gap left between that strip and the pill's resting top. */
const PILL_TOP_CLEARANCE = 2;

/** Resting inset from the left edge. */
const PILL_REST_LEFT = 40;

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
 * Clamp a desired drawer width to the window.
 *
 * The drawer sizes freely: it may cover the window edge to edge or
 * close down to nothing. Only the physical bounds apply, so a drag
 * that runs past either side of the window stops there instead of
 * producing a negative or larger-than-window width.
 */
export function clampDrawerWidth(desired: number, windowW: number): number {
  return Math.min(Math.max(desired, 0), Math.max(windowW, 0));
}

/**
 * Default pill position: near the top-left of the window, just clear of
 * the TopBar reveal strip.
 */
export function defaultPillPosition(
  pillW: number,
  pillH: number,
  windowW: number,
  windowH: number,
): { top: number; left: number } {
  return clampPillPosition(
    TOP_HOT_STRIP + PILL_TOP_CLEARANCE,
    PILL_REST_LEFT,
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

  /** Open the handbook drawer. */
  openDrawer(): void;

  /** Close the handbook drawer. */
  closeDrawer(): void;

  /** Set drawer width (clamped). Never closes; see settleDrawer. */
  setDrawerW(w: number): void;

  /**
   * End a resize gesture. Closes the drawer when it came to rest under
   * DRAWER_SNAP_CLOSE_W, so a drag can cross the threshold and come
   * back out without the drawer shutting mid-gesture.
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
  let pillPos = $state({ top: 0, left: 0 });
  let drawerOpen = $state(false);
  let drawerW = $state(DRAWER_DEFAULT_W);

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

  function openDrawer(): void {
    // A gesture that settled shut leaves its sliver width behind.
    // Restore a usable one here, while the drawer is still off screen:
    // doing it at close time would play the resize out in full view.
    if (drawerW < DRAWER_SNAP_CLOSE_W) {
      drawerW = DRAWER_DEFAULT_W;
    }
    drawerOpen = true;
  }

  function closeDrawer(): void {
    drawerOpen = false;
  }

  function setDrawerW(w: number): void {
    const win = getWindowSize();
    drawerW = clampDrawerWidth(w, win.w);
  }

  function settleDrawer(): void {
    // The snap decision belongs to the release, not to the drag: a
    // gesture that crosses the threshold and comes back out again
    // should leave the drawer open. Only where it comes to rest counts.
    if (drawerW < DRAWER_SNAP_CLOSE_W) {
      drawerOpen = false;
    }
  }

  function reset(): void {
    active = false;
    autoEntered = false;
    saved = null;
    pillPos = { top: 0, left: 0 };
    drawerOpen = false;
    drawerW = DRAWER_DEFAULT_W;
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
    openDrawer,
    closeDrawer,
    setDrawerW,
    settleDrawer,
    reset,
  };
}

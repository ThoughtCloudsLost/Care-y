/**
 * Peek controller: manages the transition from a clip rect to a peeked
 * phone frame, and from there either back (collapse) or to a committed
 * full-screen state.
 *
 * Drives the same FrameGeometry instance App.svelte owns. Feeding an
 * animated footprint/position through setFootprint/setPosition is the
 * whole mechanism; the layout pipeline cannot tell the difference between
 * a peek and any other resize.
 *
 * No rendering, no video knowledge. Takes rects. Wiring to real clip
 * figures happens in a later wave.
 */

import { Spring, prefersReducedMotion } from "svelte/motion";
import {
  PHONE_PRESET,
  BEZEL,
  WIDE_BREAKPOINT,
  FRAME_FIT_MARGIN,
  MIN_FOOTPRINT,
  clampTopToViewport,
  type FrameGeometry,
} from "./frame-geometry.svelte.js";

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

/**
 * Drag-up threshold in px that commits the peek to full screen.
 * Negative dy means upward pointer movement.
 */
export const COMMIT_DRAG_PX = 60;

// -----------------------------------------------------------------------
// Peek target sizing
// -----------------------------------------------------------------------

/**
 * Compute the peek footprint for a given window size, fit-first.
 *
 * The frame keeps the phone aspect ratio (PHONE_PRESET). On narrow
 * viewports the peek spans nearly full width so the leftover side bands
 * fall under the layout's MIN_SEGMENT floor and text parts vertically.
 * On wide viewports the peek sits smaller so text can wrap beside it.
 *
 * The result always fits the window's available space, even on
 * degenerate window sizes. MIN_FOOTPRINT is NOT enforced here:
 * FrameGeometry.setFootprint owns that floor at apply time, because
 * fitting on screen and a 200px minimum cannot both hold on a very
 * small window, and fitting is what keeps the frame usable.
 *
 * `chromeH` is the page's top chrome height. It comes off the available
 * height because the peek is placed below the chrome: sizing against the
 * raw window would put the bottom of the frame off screen whenever the
 * data flow band is open.
 */
export function computePeekFootprint(
  windowW: number,
  windowH: number,
  chromeH = 0,
): { w: number; h: number } {
  const aspect = PHONE_PRESET.w / PHONE_PRESET.h;
  const bezelTotal = BEZEL * 2;
  const maxH = Math.max(
    1,
    windowH - chromeH - FRAME_FIT_MARGIN * 2 - bezelTotal,
  );

  if (windowW < WIDE_BREAKPOINT) {
    // Narrow: span nearly the full width. Leave a small margin for the
    // bezel so the frame does not bleed off-screen. The MIN_FOOTPRINT
    // lower bound keeps the width usable when the window barely clears
    // the bezel overhead; the height fit below still wins over it.
    const maxW = windowW - FRAME_FIT_MARGIN * 2 - bezelTotal;
    const fw = Math.min(PHONE_PRESET.w, Math.max(MIN_FOOTPRINT.w, maxW));
    const fh = Math.round(fw / aspect);
    if (fh > maxH) {
      return { w: Math.max(1, Math.round(maxH * aspect)), h: maxH };
    }
    return { w: fw, h: fh };
  }

  // Wide: a moderate peek that leaves room for text to wrap beside it.
  // Use roughly 40% of the viewport width, keeping the phone aspect.
  const targetW = Math.min(PHONE_PRESET.w, Math.round(windowW * 0.4));
  const targetH = Math.round(targetW / aspect);
  if (targetH > maxH) {
    return { w: Math.max(1, Math.round(maxH * aspect)), h: maxH };
  }
  return { w: targetW, h: targetH };
}

/** Where the peek aims to sit, as a fraction of viewport height. */
export const PEEK_TOP_FRACTION = 0.15;

/**
 * Compute the position for a peek frame centred horizontally and placed
 * in the upper portion of the viewport.
 *
 * `chromeH` is the page's top chrome height, so a peek fired while the
 * data flow band is open opens below the band rather than behind it.
 */
export function computePeekPosition(
  outerW: number,
  outerH: number,
  windowW: number,
  windowH: number,
  chromeH = 0,
): { top: number; left: number } {
  const left = Math.max(FRAME_FIT_MARGIN, Math.round((windowW - outerW) / 2));
  // Place in the upper third, but clamped so the frame fits.
  const idealTop = Math.round(windowH * PEEK_TOP_FRACTION);
  const top = clampTopToViewport(
    idealTop,
    outerH,
    windowH,
    FRAME_FIT_MARGIN,
    chromeH,
  );
  return { top, left };
}

// -----------------------------------------------------------------------
// State types
// -----------------------------------------------------------------------

export type PeekPhase =
  "idle" | "opening" | "peeking" | "collapsing" | "committed";

export interface ClipRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface SavedGeometry {
  readonly footprintW: number;
  readonly footprintH: number;
  readonly top: number;
  readonly left: number;
}

export interface PeekController {
  readonly phase: PeekPhase;
  /** Open a peek from the clip rect. */
  open(clipRect: ClipRect): void;
  /** Collapse back to the clip rect (release, or close-and-continue from committed). */
  collapse(): void;
  /** Commit to full screen (drag up or secondary tap). */
  commit(): void;
  /** Force-reset to idle without animation. Used during restart. */
  resetToIdle(): void;
  /** Get the saved geometry from before the peek opened. */
  readonly savedGeometry: SavedGeometry | null;
}

// -----------------------------------------------------------------------
// Factory
// -----------------------------------------------------------------------

/**
 * @param getChromeHeight Live height of the page's top chrome, so a peek
 * opens below the data flow band. Injected rather than imported: the
 * sizing and placement functions above stay pure and this module keeps
 * no reactive dependency of its own.
 */
export function createPeekController(
  geo: FrameGeometry,
  getChromeHeight: () => number = () => 0,
): PeekController {
  let phase: PeekPhase = $state("idle");
  let saved: SavedGeometry | null = null;
  let clipRect: ClipRect | null = null;

  // Springs mirror App.svelte's preset animation pattern
  const fpW = new Spring(0, { stiffness: 0.12, damping: 0.6 });
  const fpH = new Spring(0, { stiffness: 0.12, damping: 0.6 });
  const posTop = new Spring(0, { stiffness: 0.12, damping: 0.6 });
  const posLeft = new Spring(0, { stiffness: 0.12, damping: 0.6 });

  let animating = $state(false);

  function viewportSize(): { w: number; h: number } {
    if (typeof window === "undefined") return { w: 1280, h: 800 };
    return { w: window.innerWidth, h: window.innerHeight };
  }

  /**
   * Sync all springs to their targets and snap geometry.
   * Used for reduced motion and for final settle.
   */
  function snapTo(fw: number, fh: number, top: number, left: number): void {
    void fpW.set(fw, { instant: true });
    void fpH.set(fh, { instant: true });
    void posTop.set(top, { instant: true });
    void posLeft.set(left, { instant: true });
    geo.setFootprint(fw, fh);
    geo.setPosition(top, left);
  }

  /**
   * Start an animated transition to the given geometry. The $effect
   * below drives geo per frame until the springs settle.
   */
  function animateTo(fw: number, fh: number, top: number, left: number): void {
    // Sync springs to current geometry before retargeting
    void fpW.set(geo.footprintW, { instant: true });
    void fpH.set(geo.footprintH, { instant: true });
    void posTop.set(geo.top, { instant: true });
    void posLeft.set(geo.left, { instant: true });

    // Set targets
    void fpW.set(fw);
    void fpH.set(fh);
    void posTop.set(top);
    void posLeft.set(left);

    animating = true;
  }

  // Drive geometry from springs while animating. Settle detection
  // mirrors App.svelte's preset animation effect.
  $effect(() => {
    if (!animating) return;
    const w = fpW.current;
    const h = fpH.current;
    const t = posTop.current;
    const l = posLeft.current;

    geo.setFootprint(w, h);
    geo.setPosition(t, l);

    const wDone = Math.abs(w - fpW.target) < 0.5;
    const hDone = Math.abs(h - fpH.target) < 0.5;
    const tDone = Math.abs(t - posTop.target) < 0.5;
    const lDone = Math.abs(l - posLeft.target) < 0.5;

    if (wDone && hDone && tDone && lDone) {
      animating = false;
      // Snap to exact target
      geo.setFootprint(fpW.target, fpH.target);
      geo.setPosition(posTop.target, posLeft.target);

      if (phase === "opening") {
        phase = "peeking";
      } else if (phase === "collapsing") {
        // Restore the saved geometry and return to idle
        if (saved !== null) {
          geo.setFootprint(saved.footprintW, saved.footprintH);
          geo.setPosition(saved.top, saved.left);
        }
        saved = null;
        clipRect = null;
        phase = "idle";
      }
    }
  });

  function open(rect: ClipRect): void {
    if (phase !== "idle") return;

    // Save the current frame geometry so we can restore on collapse
    saved = {
      footprintW: geo.footprintW,
      footprintH: geo.footprintH,
      top: geo.top,
      left: geo.left,
    };
    clipRect = rect;

    const { w: windowW, h: windowH } = viewportSize();
    const chromeH = getChromeHeight();
    const peek = computePeekFootprint(windowW, windowH, chromeH);
    const outerW = peek.w + BEZEL * 2;
    const outerH = peek.h + BEZEL * 2;
    const pos = computePeekPosition(outerW, outerH, windowW, windowH, chromeH);

    phase = "opening";

    // Start from the clip rect's approximate footprint
    const clipFW = Math.max(200, rect.width - BEZEL * 2);
    const clipFH = Math.max(200, rect.height - BEZEL * 2);
    geo.setFootprint(clipFW, clipFH);
    geo.setPosition(rect.top, rect.left);

    if (prefersReducedMotion.current) {
      snapTo(peek.w, peek.h, pos.top, pos.left);
      phase = "peeking";
      return;
    }

    animateTo(peek.w, peek.h, pos.top, pos.left);
  }

  function collapse(): void {
    if (phase !== "peeking" && phase !== "opening" && phase !== "committed") {
      return;
    }

    phase = "collapsing";

    if (clipRect === null || saved === null) {
      // No clip rect to collapse to; restore immediately
      if (saved !== null) {
        snapTo(saved.footprintW, saved.footprintH, saved.top, saved.left);
      }
      saved = null;
      clipRect = null;
      phase = "idle";
      return;
    }

    const clipFW = Math.max(200, clipRect.width - BEZEL * 2);
    const clipFH = Math.max(200, clipRect.height - BEZEL * 2);

    if (prefersReducedMotion.current) {
      // Instant jump to the clip rect, then restore saved geometry.
      // saved is guaranteed non-null here: the guard at the top of
      // collapse() returns early when saved is null.
      snapTo(saved.footprintW, saved.footprintH, saved.top, saved.left);
      saved = null;
      clipRect = null;
      phase = "idle";
      return;
    }

    animateTo(clipFW, clipFH, clipRect.top, clipRect.left);
  }

  function commitPeek(): void {
    if (phase !== "peeking" && phase !== "opening") return;

    phase = "committed";
    animating = false;
    // Settle all four springs instantly so their rAF loops stop writing
    // values nobody reads. Without this, each spring runs its own rAF
    // until it converges naturally, wasting frames post-commit.
    void fpW.set(fpW.target, { instant: true });
    void fpH.set(fpH.target, { instant: true });
    void posTop.set(posTop.target, { instant: true });
    void posLeft.set(posLeft.target, { instant: true });
    // The saved geometry is kept so App.svelte can restore it if needed.
    // The controller's job ends here; the committed state is the consumer's
    // signal to switch to full-screen chrome.
    clipRect = null;
  }

  /** Snap back to idle without animation (restart path). */
  function resetToIdle(): void {
    animating = false;
    if (saved !== null) {
      snapTo(saved.footprintW, saved.footprintH, saved.top, saved.left);
    }
    saved = null;
    clipRect = null;
    phase = "idle";
  }

  return {
    get phase(): PeekPhase {
      return phase;
    },
    get savedGeometry(): SavedGeometry | null {
      return saved;
    },
    open,
    collapse,
    commit: commitPeek,
    resetToIdle,
  };
}

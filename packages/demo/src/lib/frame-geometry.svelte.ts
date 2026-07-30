/**
 * Frame geometry state for the floating demo frame.
 *
 * Owns footprint (CSS px on the outer page), position (top/left of the
 * frame), and derives zoom + viewport for the iframe element. The phone
 * app's breakpoints fire against the derived viewport, so resizing the
 * footprint IS the desktop-mode unlock.
 *
 * Sizing model (decision 3): the iframe has a minimum viewport base of
 * 390x844. zoom = min(1, fw/390, fh/844). viewport = round(fp / zoom).
 * The iframe element gets width/height = viewport and transform:
 * scale(zoom). Resize handles operate on the footprint directly; no
 * scale division anywhere.
 *
 * No persistence: every page load spawns the canonical initial state.
 */

// -----------------------------------------------------------------------
// Preset targets
// -----------------------------------------------------------------------

/** Phone preset: 1:1 with the 390x844 minimum viewport. */
export const PHONE_PRESET = { w: 390, h: 844 } as const;

/**
 * Desktop preset: a footprint that shows the desktop shell scaled down.
 * 760x475 yields zoom ~0.563, viewport ~1350x844, comfortably past the
 * 1024px desktop breakpoint.
 */
export const DESKTOP_PRESET = { w: 760, h: 475 } as const;

/** Minimum footprint dimensions (prevents collapsing to nothing). */
export const MIN_FOOTPRINT = { w: 200, h: 200 } as const;

/** Minimum viewport base for the iframe. */
export const MIN_VIEWPORT = { w: 390, h: 844 } as const;

/** Bezel ring width (px per side). */
export const BEZEL = 12;

// -----------------------------------------------------------------------
// Pure derivation functions (exported for testing)
// -----------------------------------------------------------------------

/**
 * Derive the bezel corner radius from the footprint width.
 * At phone preset (390px) the radius is 48px; above 600px it tapers
 * to 16px so rounded corners do not dominate at large footprints.
 */
export function deriveBezelRadius(footprintW: number): number {
  if (footprintW <= 390) return 48;
  if (footprintW >= 600) return 16;
  const t = (footprintW - 390) / (600 - 390);
  return Math.round(48 - t * 32);
}

export interface Viewport {
  readonly w: number;
  readonly h: number;
}

export interface ZoomResult {
  readonly zoom: number;
  readonly viewport: Viewport;
}

/**
 * Derive zoom and viewport from a footprint.
 *
 * zoom = min(1, fw / MIN_W, fh / MIN_H)
 * viewport = round(footprint / zoom)
 *
 * When the footprint is smaller than the minimum viewport, zoom < 1 and
 * the viewport stays at or above the minimum. When it is larger, zoom
 * is 1 and the viewport equals the footprint.
 */
export function deriveZoomViewport(fw: number, fh: number): ZoomResult {
  const zoom = Math.min(1, fw / MIN_VIEWPORT.w, fh / MIN_VIEWPORT.h);
  const safeZoom = Math.max(zoom, 0.01);
  return {
    zoom: safeZoom,
    viewport: {
      w: Math.round(fw / safeZoom),
      h: Math.round(fh / safeZoom),
    },
  };
}

export interface SpawnState {
  readonly footprintW: number;
  readonly footprintH: number;
  readonly top: number;
  readonly left: number;
}

/**
 * Compute the initial spawn position and footprint.
 *
 * At >= 900px window width: phone preset in the right gutter area,
 * vertically centered in the viewport below the top bar.
 * Below 900px: scaled down to fit roughly 40vh, centered horizontally.
 */
export function computeSpawn(
  windowW: number,
  windowH: number,
  topBarH: number,
): SpawnState {
  if (windowW >= 900) {
    // Wide layout: place in the right gutter area
    const fw = PHONE_PRESET.w;
    const fh = PHONE_PRESET.h;
    const availH = windowH - topBarH;
    const top = topBarH + Math.max(0, (availH - fh - BEZEL * 2) / 2);
    // Right-align with some margin
    const left = windowW - fw - BEZEL * 2 - 24;
    return { footprintW: fw, footprintH: fh, top, left };
  }

  // Small layout: scale to fit ~40vh, centered
  const targetH = windowH * 0.4;
  const aspect = PHONE_PRESET.w / PHONE_PRESET.h;
  const fh = Math.max(MIN_FOOTPRINT.h, Math.min(targetH, PHONE_PRESET.h));
  const fw = Math.max(MIN_FOOTPRINT.w, Math.round(fh * aspect));
  const top = topBarH + 16;
  const left = Math.max(0, (windowW - fw - BEZEL * 2) / 2);
  return { footprintW: fw, footprintH: fh, top, left };
}

/** Breathing room kept around a frame that a preset must fit on screen. */
export const FRAME_FIT_MARGIN = 8;

/**
 * Compute the starting `left` for a width-changing preset animation so
 * the frame grows toward the viewport center rather than off-screen.
 *
 * When the frame's center sits in the right half of the window
 * (strict >), the right edge is anchored and the frame extends
 * leftward. Otherwise the left edge is anchored (dead center
 * anchors left). The existing clamp still runs after the animation
 * applies this value, so the frame cannot be pushed off-viewport.
 */
export function presetAnchoredLeft(
  startLeft: number,
  startOuterW: number,
  targetOuterW: number,
  windowW: number,
): number {
  const center = startLeft + startOuterW / 2;
  if (center > windowW / 2) {
    // Right-anchored: keep right edge fixed, extend leftward
    return startLeft + startOuterW - targetOuterW;
  }
  return startLeft;
}

/**
 * Keep a frame of the given outer height fully on screen, with `margin`
 * of breathing room top and bottom. A frame too tall to fit is pinned to
 * the top so its toolbar and the phone's own header stay reachable.
 *
 * Distinct from clampPosition, which only guarantees that a sliver stays
 * grabbable. Height-changing presets need the whole frame visible.
 */
export function clampTopToViewport(
  top: number,
  outerH: number,
  windowH: number,
  margin = FRAME_FIT_MARGIN,
): number {
  if (outerH + margin * 2 >= windowH) return margin;
  return Math.min(Math.max(top, margin), windowH - outerH - margin);
}

/**
 * Vertical counterpart of presetAnchoredLeft, for presets that change the
 * frame's height (going back to the tall phone shape is the case that
 * matters).
 *
 * A frame whose center sits in the lower half keeps its bottom edge and
 * grows upward; otherwise the top edge is anchored and it grows downward.
 * The result is then fitted to the viewport, because the phone preset is
 * far taller than the desktop one and anchoring alone routinely leaves it
 * hanging off an edge.
 */
export function presetAnchoredTop(
  startTop: number,
  startOuterH: number,
  targetOuterH: number,
  windowH: number,
  margin = FRAME_FIT_MARGIN,
): number {
  const center = startTop + startOuterH / 2;
  const anchored =
    center > windowH / 2 ? startTop + startOuterH - targetOuterH : startTop;
  return clampTopToViewport(anchored, targetOuterH, windowH, margin);
}

/** Target height for the shrunk state, as a fraction of the viewport height. */
export const SHRINK_VH_FRACTION = 0.35;

/**
 * Compute a shrunk footprint that preserves the aspect ratio of the
 * given footprint. The longest dimension is scaled to the target
 * height (SHRINK_VH_FRACTION of viewportH), and the other dimension
 * scales proportionally. When that would put either axis below
 * MIN_FOOTPRINT, both axes scale up together so the ratio survives.
 */
export function computeShrunkFootprint(
  fw: number,
  fh: number,
  viewportH: number,
): { w: number; h: number } {
  const targetH = Math.max(MIN_FOOTPRINT.h, viewportH * SHRINK_VH_FRACTION);
  const aspect = fw / fh;

  let newH = targetH;
  let newW = Math.round(newH * aspect);

  // If the width-derived height is smaller, scale by width instead
  if (newW > targetH) {
    newW = Math.round(targetH);
    newH = Math.round(newW / aspect);
  }

  // Enforce the minimum by scaling both axes together. Clamping each
  // axis on its own would distort the aspect ratio this function exists
  // to preserve: a 390x844 phone shrinks to 146 wide, and lifting only
  // the width to 200 leaves a noticeably squatter frame.
  const scale = Math.max(1, MIN_FOOTPRINT.w / newW, MIN_FOOTPRINT.h / newH);

  return {
    w: Math.round(newW * scale),
    h: Math.round(newH * scale),
  };
}

/**
 * Clamp a position so some minimum portion of the frame stays reachable.
 * At least 80px of the frame must remain within the viewport.
 */
export function clampPosition(
  top: number,
  left: number,
  outerW: number,
  outerH: number,
  windowW: number,
  windowH: number,
): { top: number; left: number } {
  const minVisible = 80;
  return {
    top: Math.min(Math.max(top, -outerH + minVisible), windowH - minVisible),
    left: Math.min(Math.max(left, -outerW + minVisible), windowW - minVisible),
  };
}

// -----------------------------------------------------------------------
// Reactive state owner
// -----------------------------------------------------------------------

export interface FrameGeometry {
  /** Footprint width in CSS px */
  readonly footprintW: number;
  /** Footprint height in CSS px */
  readonly footprintH: number;
  /** Position: top in CSS px */
  readonly top: number;
  /** Position: left in CSS px */
  readonly left: number;
  /** Derived zoom factor (0..1] */
  readonly zoom: number;
  /** Derived iframe viewport dimensions */
  readonly viewport: Viewport;
  /** Outer element width including bezel */
  readonly outerW: number;
  /** Outer element height including bezel */
  readonly outerH: number;
  /** True when the frame is shrunk with a remembered pre-shrink size */
  readonly shrunk: boolean;
  /** Set footprint (for animation frames) */
  setFootprint(w: number, h: number): void;
  /** Set position (for drag) */
  setPosition(top: number, left: number): void;
  /** Reset to spawn state */
  reset(): void;
  /** Clamp position to keep frame reachable */
  clampToViewport(): void;
  /**
   * Remember the current footprint and return the shrunk target.
   * Returns { w, h } for the caller to animate to.
   */
  shrink(): { w: number; h: number };
  /**
   * Return the remembered pre-shrink footprint and clear it.
   * Returns null if no memory exists (already unshrunk).
   */
  grow(): { w: number; h: number } | null;
  /**
   * Clear the remembered footprint without restoring it.
   * Called when the user takes manual control (resize, preset).
   */
  clearShrinkMemory(): void;
  /**
   * Preset click while shrunk: stay shrunk but adopt the preset's
   * ratio. Rewrites the grow memory to the preset's full footprint and
   * returns the shrunk-scale target for the caller to animate to.
   */
  retargetShrunkTo(w: number, h: number): { w: number; h: number };
}

const TOP_BAR_HEIGHT = 56;

export function createFrameGeometry(): FrameGeometry {
  const spawn = computeSpawn(
    typeof window !== "undefined" ? window.innerWidth : 1280,
    typeof window !== "undefined" ? window.innerHeight : 900,
    TOP_BAR_HEIGHT,
  );

  let footprintW = $state(spawn.footprintW);
  let footprintH = $state(spawn.footprintH);
  let top = $state(spawn.top);
  let left = $state(spawn.left);

  // Shrink/grow memory: the footprint the user had before shrinking.
  // Null when the frame is at its natural size (or memory was cleared).
  let preShrinkW: number | null = null;
  let preShrinkH: number | null = null;
  let shrunk = $state(false);

  const derived_ = $derived(deriveZoomViewport(footprintW, footprintH));
  const outerW = $derived(footprintW + BEZEL * 2);
  const outerH = $derived(footprintH + BEZEL * 2);

  function setFootprint(w: number, h: number): void {
    footprintW = Math.max(MIN_FOOTPRINT.w, w);
    footprintH = Math.max(MIN_FOOTPRINT.h, h);
  }

  function setPosition(t: number, l: number): void {
    top = t;
    left = l;
  }

  function reset(): void {
    const s = computeSpawn(
      typeof window !== "undefined" ? window.innerWidth : 1280,
      typeof window !== "undefined" ? window.innerHeight : 900,
      TOP_BAR_HEIGHT,
    );
    footprintW = s.footprintW;
    footprintH = s.footprintH;
    top = s.top;
    left = s.left;
    preShrinkW = null;
    preShrinkH = null;
    shrunk = false;
  }

  function shrinkFrame(): { w: number; h: number } {
    preShrinkW = footprintW;
    preShrinkH = footprintH;
    shrunk = true;
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
    return computeShrunkFootprint(footprintW, footprintH, viewportH);
  }

  function growFrame(): { w: number; h: number } | null {
    if (preShrinkW === null || preShrinkH === null) return null;
    const target = { w: preShrinkW, h: preShrinkH };
    preShrinkW = null;
    preShrinkH = null;
    shrunk = false;
    return target;
  }

  function clearShrinkMemory(): void {
    preShrinkW = null;
    preShrinkH = null;
    shrunk = false;
  }

  function retargetShrunkTo(w: number, h: number): { w: number; h: number } {
    preShrinkW = w;
    preShrinkH = h;
    shrunk = true;
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
    return computeShrunkFootprint(w, h, viewportH);
  }

  function clampToViewport(): void {
    if (typeof window === "undefined") return;
    const clamped = clampPosition(
      top,
      left,
      outerW,
      outerH,
      window.innerWidth,
      window.innerHeight,
    );
    top = clamped.top;
    left = clamped.left;
  }

  return {
    get footprintW(): number {
      return footprintW;
    },
    get footprintH(): number {
      return footprintH;
    },
    get top(): number {
      return top;
    },
    get left(): number {
      return left;
    },
    get zoom(): number {
      return derived_.zoom;
    },
    get viewport(): Viewport {
      return derived_.viewport;
    },
    get outerW(): number {
      return outerW;
    },
    get outerH(): number {
      return outerH;
    },
    get shrunk(): boolean {
      return shrunk;
    },
    setFootprint,
    setPosition,
    reset,
    clampToViewport,
    shrink: shrinkFrame,
    grow: growFrame,
    clearShrinkMemory,
    retargetShrunkTo,
  };
}

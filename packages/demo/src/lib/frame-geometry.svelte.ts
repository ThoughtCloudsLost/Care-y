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
  /** Set footprint (for animation frames) */
  setFootprint(w: number, h: number): void;
  /** Set position (for drag) */
  setPosition(top: number, left: number): void;
  /** Reset to spawn state */
  reset(): void;
  /** Clamp position to keep frame reachable */
  clampToViewport(): void;
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
    setFootprint,
    setPosition,
    reset,
    clampToViewport,
  };
}

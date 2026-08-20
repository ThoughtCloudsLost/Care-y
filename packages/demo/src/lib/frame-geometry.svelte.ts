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

// TOOLBAR_CLEARANCE is the toolbar's height plus breathing room.
// Imported rather than redeclared so the spawn clearance and the text
// layout's clearance can never drift apart when the toolbar changes size.
import { TOOLBAR_CLEARANCE } from "./flow-layout.js";
// The default chrome height only. The live value is injected as a getter
// so the pure placement functions below stay free of module state.
import { TOP_BAR_HEIGHT } from "./flow-geometry.svelte.js";

// -----------------------------------------------------------------------
// Preset targets
// -----------------------------------------------------------------------

/** Phone preset: 1:1 with the 390x844 minimum viewport. */
export const PHONE_PRESET = { w: 390, h: 844 } as const;

/** Clear space kept around the frame when it first appears. */
export const SPAWN_MARGIN = 24;

/**
 * Desktop preset: a footprint that shows the desktop shell scaled down.
 * 760x475 yields zoom ~0.563, viewport ~1350x844, comfortably past the
 * 1024px desktop breakpoint.
 */
export const DESKTOP_PRESET = { w: 760, h: 475 } as const;

/** Minimum footprint dimensions (prevents collapsing to nothing). */
export const MIN_FOOTPRINT = { w: 200, h: 200 } as const;

/**
 * Extra breathing room per side, on top of the band's own margin, when
 * fitting the desktop preset into the frame's slot. The desktop frame
 * reads as an object sitting in its column rather than as the column
 * itself, which a preset that filled the slot edge to edge would not.
 */
export const DESKTOP_SLOT_INSET = 24;

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

// -----------------------------------------------------------------------
// Story layout metrics
//
// The frame spawns into the half of the story container the text column
// leaves for it, so it has to know where that container sits. These are
// the authoritative values: App.svelte publishes them as CSS custom
// properties and its rules read them back, so the spawn placement and
// the rendered layout cannot drift apart.
// -----------------------------------------------------------------------

/** Width of the section rail (13rem). */
export const RAIL_WIDTH = 208;

/** Gap between the rail and the story column (1.5rem). */
export const RAIL_GAP = 24;

/** Padding between the window's left edge and the story wrapper. */
export const WRAPPER_PAD_LEFT = 16;

/**
 * Padding on the right. Wider than the left, which has the rail and the
 * frame beside it: the text column ends here, and nothing in the story
 * should run up against the window edge.
 */
export const WRAPPER_PAD_RIGHT = 32;

/** Horizontal extent of the flow container in window coordinates. */
export interface ContentBand {
  readonly left: number;
  readonly width: number;
}

/**
 * Where the flow container sits for a given window width. The rail is
 * present on every wide page, so this is derivable without measuring,
 * which matters because the spawn runs before the container mounts.
 */
export function contentBandFor(windowW: number): ContentBand {
  // The wrapper's padding, then the rail track and its column gap. The
  // rail lives inside the padding, so the padding counts once.
  const rail = windowW >= WIDE_BREAKPOINT ? RAIL_WIDTH + RAIL_GAP : 0;
  const left = WRAPPER_PAD_LEFT + rail;
  return {
    left,
    width: Math.max(MIN_FOOTPRINT.w, windowW - left - WRAPPER_PAD_RIGHT),
  };
}

/**
 * The half of the container the frame occupies: the left slot, mirroring
 * the text column's right slot. Below the wide breakpoint there are no
 * slots and the frame gets the whole window.
 */
export function frameSlotFor(windowW: number): { left: number; right: number } {
  if (windowW < WIDE_BREAKPOINT) return { left: 0, right: windowW };
  const content = contentBandFor(windowW);
  return { left: content.left, right: content.left + content.width / 2 };
}

/** Space a frame has to fit into, excluding chrome and margins. */
export interface FitBand {
  readonly w: number;
  readonly h: number;
}

/**
 * The band a frame must fit inside: below the top bar and the floating
 * toolbar, above the bottom margin, and inside the side margins.
 *
 * Sizing against this rather than the raw window is what guarantees the
 * toolbar's grip and buttons stay on screen: the toolbar is absolutely
 * positioned ABOVE frameRect.top, so a frame merely "fitting the window"
 * pushes its own controls off the top.
 *
 * `halfWidth` narrows the horizontal band to the frame's own slot, which
 * is what the spawn wants. Presets pass false: by the time one is
 * clicked the frame may sit anywhere, so the only requirement is that it
 * fits the screen.
 */
export function computeFitBand(
  windowW: number,
  windowH: number,
  topBarH: number,
  halfWidth: boolean,
): FitBand {
  const bandTop = topBarH + TOOLBAR_CLEARANCE;
  const slot = frameSlotFor(windowW);
  const usableW = halfWidth ? slot.right - slot.left : windowW;
  return {
    w: Math.max(MIN_FOOTPRINT.w, usableW - SPAWN_MARGIN * 2),
    h: Math.max(MIN_FOOTPRINT.h, windowH - bandTop - SPAWN_MARGIN),
  };
}

/**
 * Scale a preset footprint down to fit the band, preserving its aspect
 * ratio. Never scales up: the presets are the intended sizes, and the
 * band only ever takes size away.
 *
 * One scale across both axes rather than clamping each on its own is
 * what keeps the phone reading as a phone instead of a squat box. The
 * MIN_FOOTPRINT floor is applied as a scale too, for the same reason.
 *
 * The derived viewport survives this untouched: zoom is footprint over
 * the minimum viewport, so scaling the footprint scales zoom with it and
 * viewport (footprint / zoom) comes out the same. A fitted desktop
 * preset still clears the desktop breakpoint inside the iframe.
 */
export function fitPreset(
  presetW: number,
  presetH: number,
  band: FitBand,
): { w: number; h: number } {
  const fitScale = Math.min(
    1,
    (band.w - BEZEL * 2) / presetW,
    (band.h - BEZEL * 2) / presetH,
  );
  const floorScale = Math.max(
    MIN_FOOTPRINT.w / presetW,
    MIN_FOOTPRINT.h / presetH,
  );
  const scale = Math.max(fitScale, floorScale);
  return {
    w: Math.round(presetW * scale),
    h: Math.round(presetH * scale),
  };
}

/**
 * Compute the initial spawn position and footprint.
 *
 * At >= 900px window width: phone preset in the left half, vertically
 * centered in the viewport below the top bar. The story text flows in
 * the right half beside it.
 * Below 900px: scaled down to fit roughly 40vh, centered horizontally.
 */
export function computeSpawn(
  windowW: number,
  windowH: number,
  topBarH: number,
): SpawnState {
  const band = computeFitBand(windowW, windowH, topBarH, true);
  const bandTop = topBarH + TOOLBAR_CLEARANCE;

  const fitted = fitPreset(PHONE_PRESET.w, PHONE_PRESET.h, band);
  const fw = fitted.w;
  const fh = fitted.h;
  const outerW = fw + BEZEL * 2;
  const outerH = fh + BEZEL * 2;

  // Centre within the slot on both axes, then clamp so an oversized
  // frame still lands on screen rather than hanging off an edge. The
  // slot starts right of the rail, so a frame centred in it clears the
  // rail instead of sitting over it.
  const top = bandTop + Math.max(0, (band.h - outerH) / 2);
  const slot = frameSlotFor(windowW);
  const centredLeft = slot.left + (slot.right - slot.left - outerW) / 2;
  const left = Math.max(
    FRAME_FIT_MARGIN,
    Math.min(centredLeft, windowW - outerW - FRAME_FIT_MARGIN),
  );

  return { footprintW: fw, footprintH: fh, top, left };
}

/** Breathing room kept around a frame that a preset must fit on screen. */
export const FRAME_FIT_MARGIN = 8;

/**
 * Window width at or above which the wide layout applies: the frame
 * spawns in the left half and the story text flows in the right half.
 * Below it the frame is centred and the layout is single-column.
 */
export const WIDE_BREAKPOINT = 900;

/**
 * Park a frame against the bottom centre of the window.
 *
 * Used for the shrunk frame on narrow layouts, where there is no side
 * gutter to hold it: docking it to the bottom keeps it clear of the text
 * without covering the section header at the top.
 */
export function bottomCentrePosition(
  outerW: number,
  outerH: number,
  windowW: number,
  windowH: number,
  margin = FRAME_FIT_MARGIN,
): { top: number; left: number } {
  return {
    top: Math.max(margin, windowH - outerH - margin),
    left: Math.max(margin, (windowW - outerW) / 2),
  };
}

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
 * of breathing room top and bottom. A frame too tall to fit is pinned
 * just below the chrome so its toolbar and the phone's own header stay
 * reachable.
 *
 * `chromeH` is the page's top chrome height: the sticky top bar plus the
 * data flow band when it is open. Computed placements start below it,
 * because the toolbar sits ABOVE the frame's top edge and the chrome
 * paints over it. Free drag deliberately ignores this and is clamped by
 * clampPosition instead, which only guarantees a grabbable sliver.
 */
export function clampTopToViewport(
  top: number,
  outerH: number,
  windowH: number,
  margin = FRAME_FIT_MARGIN,
  chromeH = 0,
): number {
  const minTop = chromeH + margin;
  if (outerH + margin + minTop >= windowH) return minTop;
  return Math.min(Math.max(top, minTop), windowH - outerH - margin);
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
  chromeH = 0,
): number {
  const center = startTop + startOuterH / 2;
  const anchored =
    center > windowH / 2 ? startTop + startOuterH - targetOuterH : startTop;
  return clampTopToViewport(anchored, targetOuterH, windowH, margin, chromeH);
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

// -----------------------------------------------------------------------
// Band-proportional rescale
// -----------------------------------------------------------------------

/**
 * Snapshot of the frame geometry against the story band it was sized in.
 *
 * The band is the vertical space the story has: from the top chrome's
 * bottom edge (bandTop) to the window's bottom (bandH tall). When the
 * band changes (flow band toggled or dragged, window height resized),
 * the frame rescales proportionally FROM THIS SNAPSHOT rather than from
 * its live geometry. Anchor-relative scaling is what keeps repeated
 * band changes exact: composing per-change ratios would accumulate
 * float drift, and the MIN_FOOTPRINT floor would ratchet (a clamped
 * shrink scales back up from the clamped size, not the original).
 */
export interface BandAnchor {
  /** Chrome height (band top edge) at anchor time. */
  readonly bandTop: number;
  /** Band height (windowH - bandTop) at anchor time. */
  readonly bandH: number;
  readonly footprintW: number;
  readonly footprintH: number;
  readonly top: number;
  readonly preShrinkW: number | null;
  readonly preShrinkH: number | null;
}

export interface BandRescaleResult {
  readonly footprintW: number;
  readonly footprintH: number;
  readonly top: number;
  readonly preShrinkW: number | null;
  readonly preShrinkH: number | null;
}

/**
 * Map the anchored geometry into a new band, preserving aspect ratio.
 *
 * factor = newBandH / anchor.bandH, applied uniformly to both footprint
 * axes and to the frame's offset within the band, so the whole scene
 * reads as zooming with the story. The MIN_FOOTPRINT floor is applied
 * as a joint scale (computeSpawn's floorScale pattern) so the ratio
 * survives it; the top offset keeps using the raw factor so placement
 * tracks the band even after the footprint bottoms out. The shrink/grow
 * memory scales by the raw factor for the same reason.
 *
 * No rounding here: this runs per animation frame while the flow band's
 * resize handle is dragged, and rounding every pass would drift.
 * Degenerate bands (zero or negative height, e.g. the flow band's
 * one-frame zero measurement while mounting) return the anchor verbatim.
 */
export function computeBandRescale(
  anchor: BandAnchor,
  newBandTop: number,
  newBandH: number,
): BandRescaleResult {
  if (anchor.bandH <= 0 || newBandH <= 0) {
    return {
      footprintW: anchor.footprintW,
      footprintH: anchor.footprintH,
      top: anchor.top,
      preShrinkW: anchor.preShrinkW,
      preShrinkH: anchor.preShrinkH,
    };
  }

  const factor = newBandH / anchor.bandH;
  const effScale = Math.max(
    factor,
    MIN_FOOTPRINT.w / anchor.footprintW,
    MIN_FOOTPRINT.h / anchor.footprintH,
  );

  return {
    footprintW: anchor.footprintW * effScale,
    footprintH: anchor.footprintH * effScale,
    top: newBandTop + (anchor.top - anchor.bandTop) * factor,
    preShrinkW: anchor.preShrinkW === null ? null : anchor.preShrinkW * factor,
    preShrinkH: anchor.preShrinkH === null ? null : anchor.preShrinkH * factor,
  };
}

// -----------------------------------------------------------------------
// Auto-shrink on manual resize
// -----------------------------------------------------------------------

/**
 * Longest footprint edge at or below which a hand-resized frame is
 * treated as shrunk.
 *
 * Calibrated against what the shrink control itself produces: at a 900px
 * viewport, computeShrunkFootprint takes a phone to roughly 200x433. A
 * frame dragged to that size by hand has to read as shrunk too, or the
 * two paths would disagree about the same footprint. Note the 200px
 * MIN_FOOTPRINT floor means the qualifying band is narrower than this
 * number alone suggests.
 */
export const AUTO_SHRINK_MAX_EDGE = 450;

/**
 * How much larger the grow control makes an auto-shrunk frame. Applied
 * to both axes, so the hand-chosen aspect ratio is what comes back.
 *
 * Doubling a shrunk phone (200x433) lands on 400x866, within a few px of
 * the 390x844 phone preset, so growing an untouched shrunk frame returns
 * it to about where it started.
 */
export const AUTO_GROW_FACTOR = 2;

/**
 * Whether a footprint is small enough to count as shrunk on its own.
 * Keyed off the longest edge so a frame dragged thin in one axis but
 * still long in the other does not qualify.
 */
export function isAutoShrinkSize(fw: number, fh: number): boolean {
  return Math.max(fw, fh) <= AUTO_SHRINK_MAX_EDGE;
}

/**
 * The grow target for a frame that shrank by hand: the same ratio,
 * AUTO_GROW_FACTOR times larger on both axes.
 */
export function computeAutoGrowTarget(
  fw: number,
  fh: number,
): { w: number; h: number } {
  return {
    w: Math.round(fw * AUTO_GROW_FACTOR),
    h: Math.round(fh * AUTO_GROW_FACTOR),
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
  /**
   * Settle the shrink state after a manual resize. A footprint that ended
   * below the auto-shrink threshold becomes the shrunk state, with a grow
   * memory AUTO_GROW_FACTOR times larger at the same ratio. Anything
   * larger clears the memory, since the user has sized the frame directly.
   */
  settleShrinkAfterResize(): void;
  /**
   * Snapshot the current geometry against the current band as the new
   * scaling basis. Call after every user-authored geometry write
   * (gesture end, preset/shrink/grow settle); spawn and reset anchor
   * themselves.
   */
  reanchorBand(): void;
  /**
   * Rescale footprint, top, and shrink memory from the band anchor to
   * the current band, then clamp on screen. No-op when the band matches
   * the anchor. Never moves the anchor: repeated calls stay exact and
   * a band that returns to its anchor height restores the anchor
   * geometry precisely.
   */
  rescaleForBand(): void;
}

/**
 * @param getChromeHeight Live height of the page's top chrome. Injected
 * rather than imported so this module owns no reactive dependency and
 * the factory stays drivable from a test.
 */
export function createFrameGeometry(
  getChromeHeight: () => number = () => TOP_BAR_HEIGHT,
): FrameGeometry {
  const spawn = computeSpawn(
    typeof window !== "undefined" ? window.innerWidth : 1280,
    typeof window !== "undefined" ? window.innerHeight : 900,
    getChromeHeight(),
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

  // Band anchor: plain, not $state. It is bookkeeping for the rescale
  // path; a reactive anchor would retrigger the App effect that calls
  // rescaleForBand (same reasoning as App's lastChromeHeight guard).
  let anchor: BandAnchor = {
    bandTop: getChromeHeight(),
    bandH:
      (typeof window !== "undefined" ? window.innerHeight : 900) -
      getChromeHeight(),
    footprintW: spawn.footprintW,
    footprintH: spawn.footprintH,
    top: spawn.top,
    preShrinkW: null,
    preShrinkH: null,
  };

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
      getChromeHeight(),
    );
    footprintW = s.footprintW;
    footprintH = s.footprintH;
    top = s.top;
    left = s.left;
    preShrinkW = null;
    preShrinkH = null;
    shrunk = false;
    reanchorBand();
  }

  function reanchorBand(): void {
    const chromeH = getChromeHeight();
    anchor = {
      bandTop: chromeH,
      bandH:
        (typeof window !== "undefined" ? window.innerHeight : 900) - chromeH,
      footprintW,
      footprintH,
      top,
      preShrinkW,
      preShrinkH,
    };
  }

  function rescaleForBand(): void {
    const bandTop = getChromeHeight();
    const bandH =
      (typeof window !== "undefined" ? window.innerHeight : 900) - bandTop;
    if (bandTop === anchor.bandTop && bandH === anchor.bandH) return;

    const scaled = computeBandRescale(anchor, bandTop, bandH);
    // computeBandRescale already holds the footprint at or above
    // MIN_FOOTPRINT jointly, so setFootprint's per-axis floor is inert
    // here and cannot distort the ratio.
    setFootprint(scaled.footprintW, scaled.footprintH);
    top = scaled.top;
    preShrinkW = scaled.preShrinkW;
    preShrinkH = scaled.preShrinkH;
    clampToViewport();
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

  function settleShrinkAfterResize(): void {
    if (isAutoShrinkSize(footprintW, footprintH)) {
      const target = computeAutoGrowTarget(footprintW, footprintH);
      preShrinkW = target.w;
      preShrinkH = target.h;
      shrunk = true;
      return;
    }
    preShrinkW = null;
    preShrinkH = null;
    shrunk = false;
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
    settleShrinkAfterResize,
    reanchorBand,
    rescaleForBand,
  };
}

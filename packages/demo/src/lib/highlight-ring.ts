/**
 * Highlight ring: the outline the phone draws around whatever the
 * current sub-section is talking about.
 *
 * The tap marker in tap-pulse.ts is a finger: a 44px dot at a control's
 * center, gone in 600ms. That works for "this button was pressed" and
 * not at all for "this region is what the paragraph you are reading
 * describes", which is frequently a whole dashboard card or settings
 * block. This module draws the second thing: an outline traced around
 * the target's bounds that holds long enough to read, then fades.
 *
 * The ring is a demo-owned overlay. It never mutates product markup,
 * never reads content, is aria-hidden, and takes no pointer events.
 *
 * DOM-dependent, no Svelte runes. One ring exists at a time.
 */

// -----------------------------------------------------------------------
// Geometry
// -----------------------------------------------------------------------

/** Breathing room between the target's bounds and the outline. */
const RING_INSET = 6;

/**
 * Floor for each axis. A target scrolled almost out of frame clamps to
 * a sliver, and a 2px-tall outline reads as a stray line rather than a
 * highlight.
 */
export const MIN_RING_SIZE = 44;

export interface RingBox {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export interface RingRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Viewport-space box for a target's rect: inflated by RING_INSET, then
 * clamped to the viewport with a MIN_RING_SIZE floor on each axis.
 *
 * The clamp is what makes the ring usable on scroll pages. A dashboard
 * section can be taller than the phone screen, and an unclamped outline
 * puts its top and bottom edges off-frame, leaving two vertical lines
 * that read as nothing. Clamped, the ring always closes on screen.
 *
 * Pure: exported for tests, and takes plain numbers so callers can pass
 * either a DOMRect or a literal.
 */
export function ringBox(
  rect: RingRect,
  viewportWidth: number,
  viewportHeight: number,
): RingBox {
  let top = Math.max(0, rect.top - RING_INSET);
  let left = Math.max(0, rect.left - RING_INSET);
  let bottom = Math.min(viewportHeight, rect.top + rect.height + RING_INSET);
  let right = Math.min(viewportWidth, rect.left + rect.width + RING_INSET);

  // Grow back to the floor, then push inside the viewport when that
  // growth overflows the far edge.
  if (bottom - top < MIN_RING_SIZE) {
    bottom = top + MIN_RING_SIZE;
    if (bottom > viewportHeight) {
      bottom = viewportHeight;
      top = Math.max(0, bottom - MIN_RING_SIZE);
    }
  }
  if (right - left < MIN_RING_SIZE) {
    right = left + MIN_RING_SIZE;
    if (right > viewportWidth) {
      right = viewportWidth;
      left = Math.max(0, right - MIN_RING_SIZE);
    }
  }

  return { top, left, width: right - left, height: bottom - top };
}

// -----------------------------------------------------------------------
// Appearance and timing
// -----------------------------------------------------------------------

const RING_RADIUS = 12;
const RING_WIDTH = 2;

/**
 * Below DemoSplash and the tap marker, which both sit at 99999, so the
 * splash still covers boot and a tap dot reads on top of its own ring.
 */
const RING_Z_INDEX = "99990";

/** How long the ring stays at full strength before fading. */
export const RING_HOLD_MS = 2500;
/** Fade-out duration. */
export const RING_FADE_MS = 400;
/** Fade-in duration. A pop reads as a glitch; this reads as a draw. */
const RING_ENTER_MS = 160;

/** Used when the theme's accent cannot be resolved from the target. */
const FALLBACK_ACCENT = "#4c6ef5";

/**
 * Resolve the handbook's selection accent from the target's own
 * computed style. Custom properties inherit, and the target always
 * lives inside the themed subtree, so this picks up the active colour
 * scheme without the ring needing to know which one is on.
 */
function resolveAccent(target: Element): string {
  const view = target.ownerDocument.defaultView;
  if (view === null) return FALLBACK_ACCENT;
  const value = view
    .getComputedStyle(target)
    .getPropertyValue("--demo-accent")
    .trim();
  return value === "" ? FALLBACK_ACCENT : value;
}

// -----------------------------------------------------------------------
// Active ring
// -----------------------------------------------------------------------

interface ActiveRing {
  readonly el: HTMLDivElement;
  readonly target: Element;
  frame: number | null;
  holdTimer: ReturnType<typeof setTimeout> | undefined;
  removeTimer: ReturnType<typeof setTimeout> | undefined;
}

let active: ActiveRing | null = null;

/**
 * Write the ring's box from the target's live rect. Returns false when
 * the target has gone (detached, or collapsed to zero size), which
 * stops the tracking loop.
 */
function positionRing(ring: ActiveRing): boolean {
  const { el, target } = ring;
  if (!target.isConnected) return false;

  const view = target.ownerDocument.defaultView;
  if (view === null) return false;

  const rect = target.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;

  const box = ringBox(rect, view.innerWidth, view.innerHeight);
  el.style.top = `${String(box.top)}px`;
  el.style.left = `${String(box.left)}px`;
  el.style.width = `${String(box.width)}px`;
  el.style.height = `${String(box.height)}px`;
  return true;
}

/**
 * Follow the target for as long as the ring is up. The phone scrolls
 * under the ring twice over: the product's own smooth scroll on entry,
 * and whatever the visitor does during the hold. Both must keep the
 * outline glued to what it is pointing at.
 */
function track(ring: ActiveRing): void {
  const view = ring.target.ownerDocument.defaultView;
  if (view === null) return;

  const step = (): void => {
    if (active !== ring) return;
    if (!positionRing(ring)) {
      clearHighlightRing();
      return;
    }
    ring.frame = view.requestAnimationFrame(step);
  };

  ring.frame = view.requestAnimationFrame(step);
}

/**
 * Draw a ring around `target`, hold it, then fade it out. Replaces any
 * ring already on screen, so scrolling quickly through sub-sections
 * never stacks outlines.
 */
export function showHighlightRing(target: Element): void {
  clearHighlightRing();

  const doc = target.ownerDocument;
  const view = doc.defaultView;
  if (view === null) return;

  const el = doc.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.dataset.demoHighlightRing = "true";

  const accent = resolveAccent(target);
  Object.assign(el.style, {
    position: "fixed",
    borderRadius: `${String(RING_RADIUS)}px`,
    border: `${String(RING_WIDTH)}px solid ${accent}`,
    boxShadow: `0 0 0 9999px transparent, 0 0 12px ${accent}`,
    pointerEvents: "none",
    zIndex: RING_Z_INDEX,
    boxSizing: "border-box",
  });

  const ring: ActiveRing = {
    el,
    target,
    frame: null,
    holdTimer: undefined,
    removeTimer: undefined,
  };

  if (!positionRing(ring)) return;

  doc.body.appendChild(el);
  active = ring;
  track(ring);

  const reducedMotion = view.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion) {
    // Appear and disappear with no transition, the convention the tap
    // marker already follows.
    ring.removeTimer = setTimeout(() => {
      if (active === ring) clearHighlightRing();
    }, RING_HOLD_MS);
    return;
  }

  el.style.opacity = "0";
  el.style.transition = `opacity ${String(RING_ENTER_MS)}ms ease-out`;
  view.requestAnimationFrame(() => {
    el.style.opacity = "1";
  });

  ring.holdTimer = setTimeout(() => {
    if (active !== ring) return;
    el.style.transition = `opacity ${String(RING_FADE_MS)}ms ease-out`;
    el.style.opacity = "0";
    ring.removeTimer = setTimeout(() => {
      if (active === ring) clearHighlightRing();
    }, RING_FADE_MS + 50);
  }, RING_HOLD_MS);
}

/** Remove the ring immediately and stop tracking. Safe to call when
 *  no ring is up. */
export function clearHighlightRing(): void {
  const ring = active;
  if (ring === null) return;
  active = null;

  const view = ring.target.ownerDocument.defaultView;
  if (ring.frame !== null && view !== null) {
    view.cancelAnimationFrame(ring.frame);
  }
  clearTimeout(ring.holdTimer);
  clearTimeout(ring.removeTimer);
  ring.el.remove();
}

/** Whether a ring is currently on screen. Exported for tests and the
 *  highlight log. */
export function hasHighlightRing(): boolean {
  return active !== null;
}

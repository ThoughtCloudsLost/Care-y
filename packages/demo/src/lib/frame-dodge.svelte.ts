/**
 * Frame dodging for ordinary DOM that sits alongside the flow text.
 *
 * The story text goes through the flow layout engine, which wraps it
 * around the floating phone. Blocks that are NOT flowed (the sticky
 * section header, the tip card) still have to clear the same frame, or
 * they would sit underneath it while the text beside them dodges.
 *
 * They cannot be flowed, so they inset instead: this asks the layout
 * engine's own segment function where a line at the element's position
 * would be allowed to sit, and returns the margins that put the element
 * in that band. Sharing computeLineSegments is what keeps these blocks
 * aligned with the body text rather than drifting on their own math.
 */

import {
  FRAME_PAD_TOP,
  FRAME_PAD_BOTTOM,
  FRAME_PAD_X,
  computeLineSegments,
  type Segment,
} from "./flow-layout.js";

export interface DodgeFrameRect {
  readonly left: number;
  readonly top: number;
  readonly outerW: number;
  readonly outerH: number;
}

export interface FrameDodge {
  /** Left inset in px. */
  readonly left: number;
  /** Right inset in px. */
  readonly right: number;
  /** Attach to the element being dodged. */
  observe(el: HTMLElement | undefined): void;
}

export interface FrameDodgeOptions {
  /**
   * Viewport offset the element sticks at, or null when it scrolls
   * normally. A sticky element's viewport top stops descending at this
   * value; a normal one keeps tracking the scroll. Getting this wrong is
   * what makes a cached measurement go stale.
   */
  stickyTop?: () => number | null;
}

export function createFrameDodge(
  getFrameRect: () => DodgeFrameRect,
  options: FrameDodgeOptions = {},
): FrameDodge {
  let el: HTMLElement | undefined = $state(undefined);
  let left = $state(0);
  let right = $state(0);

  // Cached in DOCUMENT space because that is scroll-invariant. Caching
  // the viewport rect instead would go stale every scroll frame for any
  // element that is not sticky.
  interface Box {
    docTop: number;
    left: number;
    width: number;
    height: number;
  }
  let box: Box | null = $state.raw(null);
  let scrollY = $state(0);

  $effect(() => {
    function sync(): void {
      scrollY = window.scrollY;
    }
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  });

  // Re-measure only when the element or the window resizes. Reading
  // layout on every scroll frame is what this avoids: it forces a
  // synchronous reflow, and the result is written straight back as a
  // margin on the same subtree.
  $effect(() => {
    const target = el;
    if (target === undefined) {
      box = null;
      return;
    }

    function measure(): void {
      if (target === undefined) return;
      const r = target.getBoundingClientRect();
      box = {
        docTop: r.top + window.scrollY,
        left: r.left,
        width: r.width,
        height: r.height,
      };
    }
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(target);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  });

  $effect(() => {
    const fr = getFrameRect();
    const b = box;
    if (b === null) {
      left = 0;
      right = 0;
      return;
    }

    const flowTop = b.docTop - scrollY;
    const pinned = options.stickyTop?.() ?? null;
    const viewportTop = pinned === null ? flowTop : Math.max(pinned, flowTop);

    // The padded hole in the element's own coordinate space, using the
    // same constants the flow layout applies.
    const hole = {
      left: fr.left - FRAME_PAD_X - b.left,
      top: fr.top - FRAME_PAD_TOP - viewportTop,
      right: fr.left + fr.outerW + FRAME_PAD_X - b.left,
      bottom: fr.top + fr.outerH + FRAME_PAD_BOTTOM - viewportTop,
    };

    // Ask for the bands a line spanning the element's full height would
    // get. Its whole box has to clear the frame, not one row of it.
    const segments = computeLineSegments(0, b.height, b.width, hole);

    // Two bands means the frame splits the column. These blocks are
    // single boxes and cannot flow around it, so they pick a side. The
    // flanks come back equal (they are centred on the frame), so their
    // widths cannot break the tie; decide from the room each side has.
    let chosen: Segment | undefined;
    if (segments.length > 1) {
      chosen =
        hole.left >= b.width - hole.right ? segments.at(0) : segments.at(1);
    } else {
      chosen = segments.at(0);
    }

    // No band fits: fall back to full width and let the frame overlap
    // rather than collapsing the element to a sliver.
    if (chosen === undefined) {
      left = 0;
      right = 0;
      return;
    }

    left = chosen.x;
    right = Math.max(0, b.width - (chosen.x + chosen.width));
  });

  return {
    get left(): number {
      return left;
    },
    get right(): number {
      return right;
    },
    observe(next: HTMLElement | undefined): void {
      el = next;
    },
  };
}

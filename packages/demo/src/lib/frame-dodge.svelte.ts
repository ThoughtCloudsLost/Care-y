/**
 * Frame dodging for ordinary DOM that sits alongside the flow text.
 *
 * The story text goes through the flow layout engine, which wraps it
 * around the floating phone. Blocks that are NOT flowed (the sticky
 * section header, the tip card) still have to clear the same frame, or
 * they would sit underneath it while the text beside them dodges.
 *
 * They cannot be flowed, so they inset instead. The inset aligns the
 * element's content band to the column slot (columnRect) via
 * computeColumnSegments, following the same three-stage dodge ladder
 * the flow text uses: shift, constrained-segment, full-width fallback.
 *
 * Both consumers (SectionIntro, StoryTip) cancel the flow container's
 * padding with a matching negative margin / positive padding pair
 * (CONTENT_GUTTER px each). At >= 900px width, container-space column
 * values map straight through to margins because the cancellation
 * zeroes the offset. Below 900px, SectionIntro drops its horizontal
 * padding, so the cancellation is off by CONTENT_GUTTER px; the
 * resulting misalignment with the column slot is tolerated.
 */

import {
  FRAME_PAD_TOP,
  FRAME_PAD_BOTTOM,
  FRAME_PAD_X,
  HOLE_GAP,
  SHIFT_MAX,
  MIN_SEGMENT,
  computeColumnSegments,
  type FlowHole,
  type Segment,
} from "./flow-layout.js";
import {
  columnRect,
  columnContainerLeft,
  columnContainerWidth,
} from "./flow-column.svelte.js";

/**
 * Gutter in px that both dodge consumers use for their negative-margin /
 * positive-padding cancellation pair. SectionIntro and StoryTip each
 * carry `margin: 0 -1rem; padding: ... 1rem` (1rem = 16px); changing
 * those values requires updating this constant too, or the dodge
 * alignment drifts. Exported so tests can verify the conversion.
 */
export const CONTENT_GUTTER = 16;

export interface DodgeFrameRect {
  readonly left: number;
  readonly top: number;
  readonly outerW: number;
  readonly outerH: number;
}

/** Cached document-space box for the observed element. */
export interface DodgeBox {
  /** Document-space top offset. */
  readonly docTop: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export interface FrameDodge {
  /** Left inset in px. */
  readonly left: number;
  /** Right inset in px. */
  readonly right: number;
  /** Cached document-space box, or null before first measurement. */
  readonly box: DodgeBox | null;
  /** Current scroll position tracked by this dodge instance. */
  readonly scrollY: number;
  /** Attach to the element being dodged. */
  observe(el: HTMLElement | undefined): void;
  /** Force a re-measure of the element's box. */
  remeasure(): void;
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

// -----------------------------------------------------------------------
// Pure inset computation (exported for direct unit testing)
// -----------------------------------------------------------------------

export interface DodgeInsetInput {
  /** Element box width in px. */
  readonly boxWidth: number;
  /** Element box height in px. */
  readonly boxHeight: number;
  /** Element's document-space left edge. */
  readonly boxLeft: number;
  /** Viewport-space top of the element's visible band. */
  readonly viewportTop: number;
  /** The frame rect in viewport space, or null when the frame is hidden. */
  readonly frameRect: DodgeFrameRect | null;
  /** Column rect from the slot system (container space). */
  readonly column: { readonly x: number; readonly width: number };
  /** Document-space left edge of the flow container. */
  readonly containerLeft: number;
  /** Full container width. */
  readonly containerWidth: number;
}

export interface DodgeInsetResult {
  readonly left: number;
  readonly right: number;
}

/**
 * Compute left/right insets that place the element's content band
 * inside the column slot, dodging the frame hole via the same ladder
 * the flow text uses.
 *
 * All frame coordinates are viewport-space; the column and container
 * are in container (document) space. The hole is built in container
 * space so computeColumnSegments can evaluate it directly.
 *
 * Ladder stages:
 * 1. No vertical overlap between element band and padded hole: align
 *    content to the column rect.
 * 2. Vertical overlap: try shifting the column band away from the hole
 *    by up to SHIFT_MAX, clamped so it stays inside the element.
 * 3. Fall back to computeColumnSegments for the element's full height,
 *    pick the widest segment.
 * 4. No viable segment: relax to full width (insets = 0).
 */
export function computeDodgeInsets(input: DodgeInsetInput): DodgeInsetResult {
  const {
    boxWidth,
    boxHeight,
    boxLeft,
    viewportTop,
    frameRect,
    column,
    containerLeft,
    containerWidth,
  } = input;

  // No frame: align to the column, no dodge needed.
  if (frameRect === null) {
    return columnAlignedInsets(boxWidth, boxLeft, column, containerLeft);
  }

  // Build the padded hole in CONTAINER space. The frame rect is
  // viewport-fixed (left/top in viewport px). Converting to container
  // space: subtract the container's document-space left edge.
  const holeLeft = frameRect.left - FRAME_PAD_X - containerLeft;
  const holeRight =
    frameRect.left + frameRect.outerW + FRAME_PAD_X - containerLeft;

  // Vertical extents: the element band is [viewportTop, viewportTop + boxHeight)
  // in viewport space. The hole's vertical extents are also viewport-space.
  const holeTop = frameRect.top - FRAME_PAD_TOP;
  const holeBottom = frameRect.top + frameRect.outerH + FRAME_PAD_BOTTOM;
  const elTop = viewportTop;
  const elBottom = viewportTop + boxHeight;

  // Stage 1: no vertical overlap, just align to column.
  if (elBottom <= holeTop || elTop >= holeBottom) {
    return columnAlignedInsets(boxWidth, boxLeft, column, containerLeft);
  }

  // There is vertical overlap. Build a container-space hole for segment
  // computation. The vertical range uses 0-based element-local coords.
  const hole: FlowHole = {
    left: holeLeft,
    right: holeRight,
    top: 0,
    bottom: boxHeight,
  };

  // Stage 2: try shifting the column band away from the hole.
  const colLeft = column.x;
  const colRight = column.x + column.width;
  const gapLeft = holeLeft - HOLE_GAP;
  const gapRight = holeRight + HOLE_GAP;

  // Only attempt shift when the column actually overlaps the hole horizontally.
  if (colRight > gapLeft && colLeft < gapRight) {
    // Shift direction: away from the hole center.
    const holeCenterX = (holeLeft + holeRight) / 2;
    const colCenterX = colLeft + column.width / 2;
    const dir = holeCenterX > colCenterX ? -1 : 1;

    let shift: number;
    if (dir < 0) {
      shift = colRight - gapLeft;
    } else {
      shift = gapRight - colLeft;
    }

    if (shift <= SHIFT_MAX) {
      const shiftedColX = colLeft + dir * shift;
      const shiftedColRight = shiftedColX + column.width;
      // Verify clearance after shift.
      if (shiftedColRight <= gapLeft || shiftedColX >= gapRight) {
        // Clamp the shifted column to [0, containerWidth].
        const clampedX = Math.max(
          0,
          Math.min(shiftedColX, containerWidth - column.width),
        );
        return containerToBoxInsets(
          boxWidth,
          boxLeft,
          containerLeft,
          clampedX,
          column.width,
        );
      }
    }
  } else {
    // Column does not overlap the hole horizontally: align to column.
    return columnAlignedInsets(boxWidth, boxLeft, column, containerLeft);
  }

  // Stage 3: widest constrained segment via computeColumnSegments.
  const segments = computeColumnSegments(
    0,
    boxHeight,
    containerWidth,
    column,
    hole,
  );

  let widest: Segment | undefined;
  let widestW = -1;
  for (const seg of segments) {
    if (seg.width > widestW) {
      widestW = seg.width;
      widest = seg;
    }
  }

  if (widest !== undefined && widest.width >= MIN_SEGMENT) {
    return containerToBoxInsets(
      boxWidth,
      boxLeft,
      containerLeft,
      widest.x,
      widest.width,
    );
  }

  // Stage 4: no viable segment. Relax to full width.
  return { left: 0, right: 0 };
}

/**
 * Convert a container-space content band [x, x + width) to left/right
 * insets relative to the element's box.
 */
function containerToBoxInsets(
  boxWidth: number,
  boxLeft: number,
  containerLeft: number,
  contentX: number,
  contentWidth: number,
): DodgeInsetResult {
  // Container-space x to element-box-space x. The element's left edge
  // in container space is (boxLeft - containerLeft). The content band
  // starts at contentX in container space, so the left inset within the
  // element is contentX - (boxLeft - containerLeft).
  //
  // The CONTENT_GUTTER cancellation (negative margin / positive padding
  // on each consumer) means the element's box extends CONTENT_GUTTER
  // past the container on each side at >= 900px. boxLeft already
  // reflects the expanded box, so (boxLeft - containerLeft) is
  // -CONTENT_GUTTER, making the subtraction self-correcting.
  const boxLeftInContainer = boxLeft - containerLeft;
  const leftInset = Math.max(0, contentX - boxLeftInContainer);
  const rightInset = Math.max(
    0,
    boxWidth - (contentX + contentWidth - boxLeftInContainer),
  );
  return { left: leftInset, right: rightInset };
}

/**
 * Align content to the column rect with no dodge shift. Used when the
 * hole does not vertically overlap the element or the frame is null.
 */
function columnAlignedInsets(
  boxWidth: number,
  boxLeft: number,
  column: { readonly x: number; readonly width: number },
  containerLeft: number,
): DodgeInsetResult {
  return containerToBoxInsets(
    boxWidth,
    boxLeft,
    containerLeft,
    column.x,
    column.width,
  );
}

// -----------------------------------------------------------------------
// Reactive factory
// -----------------------------------------------------------------------

export function createFrameDodge(
  getFrameRect: () => DodgeFrameRect | null,
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

  // Exposed so callers can trigger a re-measure when something outside
  // the element (e.g. the top chrome height) moves it.
  let measureFn: (() => void) | null = null;

  // Re-measure only when the element or the window resizes. Reading
  // layout on every scroll frame is what this avoids: it forces a
  // synchronous reflow, and the result is written straight back as a
  // margin on the same subtree.
  $effect(() => {
    const target = el;
    if (target === undefined) {
      box = null;
      measureFn = null;
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
    measureFn = measure;

    const ro = new ResizeObserver(measure);
    ro.observe(target);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      measureFn = null;
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

    const col = columnRect();
    const cLeft = columnContainerLeft();
    const cWidth = columnContainerWidth();

    const result = computeDodgeInsets({
      boxWidth: b.width,
      boxHeight: b.height,
      boxLeft: b.left,
      viewportTop,
      frameRect: fr,
      column: col,
      containerLeft: cLeft,
      containerWidth: cWidth,
    });

    left = result.left;
    right = result.right;
  });

  return {
    get left(): number {
      return left;
    },
    get right(): number {
      return right;
    },
    get box(): DodgeBox | null {
      return box;
    },
    get scrollY(): number {
      return scrollY;
    },
    observe(next: HTMLElement | undefined): void {
      el = next;
    },
    remeasure(): void {
      measureFn?.();
    },
  };
}

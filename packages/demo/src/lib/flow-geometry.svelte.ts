/**
 * Cross-module geometry contract for the flow story layout.
 *
 * FlowStory publishes its layout result here after every pass.
 * The scroll engine and App integration read from here to resolve
 * reading-line position, scroll targets, and readiness state.
 */

import type { SectionId } from "./scroll-sections.js";
import type { FlowBlock, FlowHole, FlowLayoutResult } from "./flow-layout.js";
import { locationAtY, scrollTargetForBlock } from "./flow-layout.js";

// -----------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------

export interface FlowLocation {
  readonly sectionId: SectionId;
  readonly subSlug: string | null;
}

/**
 * The data source published by FlowStory after each layout pass.
 * Contains everything needed to resolve positions and locations.
 */
export interface FlowGeometrySource {
  readonly layoutResult: FlowLayoutResult;
  readonly blocks: readonly FlowBlock[];
  /** Document-space top offset of the story container element. */
  readonly containerTop: number;
  /**
   * Container-space hole for a hypothetical window.scrollY.
   * Returns null when no frame is visible.
   */
  readonly holeAtScrollY: (scrollY: number) => FlowHole | null;
  /** Re-run this pass's layout with a different hole. */
  readonly layoutForHole: (hole: FlowHole | null) => FlowLayoutResult;
}

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

/** The reading line sits at 40% of the viewport height. */
export const READING_LINE_RATIO = 0.4;

/** Maximum fixed-point iterations for scroll-target convergence. */
const FIXED_POINT_CAP = 5;

/** Convergence threshold in px for the fixed-point loop. */
const FIXED_POINT_EPSILON = 1;

// -----------------------------------------------------------------------
// Module state
// -----------------------------------------------------------------------

let source: FlowGeometrySource | null = $state(null);

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

/** Set or clear the geometry source. Called by FlowStory after layout. */
export function setFlowGeometrySource(src: FlowGeometrySource | null): void {
  source = src;
}

/** Whether the flow geometry has been computed at least once. */
export function flowGeometryReady(): boolean {
  return source !== null;
}

/** The reading line's viewport Y coordinate. */
export function readingLineY(): number {
  if (typeof window === "undefined") return 0;
  return window.innerHeight * READING_LINE_RATIO;
}

/**
 * Resolve the flow location at the reading line, given the current
 * scroll position. Returns null before the first layout pass.
 */
export function locationAtReadingLine(): FlowLocation | null {
  if (source === null) return null;
  if (typeof window === "undefined") return null;

  const viewportY = readingLineY();
  // Convert viewport Y to document-space Y within the container
  const documentY = viewportY + window.scrollY;
  const containerRelativeY = documentY - source.containerTop;

  return locationAtY(containerRelativeY, source.layoutResult, source.blocks);
}

/**
 * Compute the absolute window.scrollY that places the target block's
 * first line at the reading line. Uses a bounded fixed-point iteration
 * because the frame is viewport-fixed: the hole moves with scrollY,
 * so the layout is a function of scrollY and a target computed under
 * the current layout is wrong once you scroll there.
 *
 * Returns null when the geometry is not ready, the page is stale
 * (wrong section mounted), or the target block is not found.
 */
export function scrollTargetFor(
  sectionId: SectionId,
  subSlug: string | null,
): number | null {
  if (source === null) return null;

  // Stale-page guard: the engine treats null as "page not mounted yet"
  // and retries, so this guard is load-bearing, not defensive noise.
  if (source.blocks[0]?.sectionId !== sectionId) {
    return null;
  }

  // Section target (no sub): the title/desc now live in a sticky intro
  // above the flow, so the target is the top of the page.
  if (subSlug === null) return 0;

  const rlY = readingLineY();

  // Seed from the current layout
  let candidate = scrollTargetForBlock(
    sectionId,
    subSlug,
    source.layoutResult,
    source.blocks,
    source.containerTop,
    rlY,
  );
  if (candidate === null) return null;

  // Fixed-point: re-layout with the hole at the candidate scrollY,
  // then recompute the target. Stop when the candidate stabilizes
  // (moves less than FIXED_POINT_EPSILON) or the cap is reached.
  for (let i = 0; i < FIXED_POINT_CAP; i++) {
    const hole = source.holeAtScrollY(candidate);
    const layout = source.layoutForHole(hole);
    const next = scrollTargetForBlock(
      sectionId,
      subSlug,
      layout,
      source.blocks,
      source.containerTop,
      rlY,
    );
    if (next === null) return null;
    if (Math.abs(next - candidate) < FIXED_POINT_EPSILON) {
      return next;
    }
    candidate = next;
  }

  // Cap reached; return the last candidate (residual handled by the
  // engine's suppressed-settle re-align).
  return candidate;
}

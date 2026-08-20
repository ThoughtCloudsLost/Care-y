/**
 * Column-slot state for the flow story layout.
 *
 * The text column occupies one of two container-half slots (left or right)
 * at wide widths, flipping in response to the frame's horizontal pressure.
 * Below the wide breakpoint a single degenerate centered slot is used.
 *
 * Module-level state: survives FlowStory remounts under {#key pageKey}
 * so the column does not jump when the page transitions.
 */

import { Tween, prefersReducedMotion } from "svelte/motion";
import { cubicOut } from "svelte/easing";
import { WIDE_BREAKPOINT } from "./frame-geometry.svelte.js";
import type { FlowColumn, FlowHole } from "./flow-layout.js";
import {
  MAX_MEASURE,
  SLOT_FLIP_RATIO,
  SLOT_FLIP_DEADBAND,
} from "./flow-layout.js";

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

const TWEEN_DURATION_MS = 250;

// -----------------------------------------------------------------------
// Module-level reactive state
// -----------------------------------------------------------------------

let slot: "left" | "right" = $state("left");
let containerWidth = $state(0);
let containerLeft = $state(0);
let windowWidth = $state(typeof window === "undefined" ? 0 : window.innerWidth);

// Whether the first pressure evaluation has fired. The first application
// (and every application immediately after initColumnSlot) snaps the
// tween with duration 0 instead of animating.
let firstEvaluation = $state(true);

// The tween holds the animated x position of the column. Initialized to 0;
// initColumnSlot snaps it to the correct slot position before the first
// render. The tween target represents the resting x; .current provides the
// mid-flight animated value for rendering.
const columnXTween = new Tween(0, {
  duration: TWEEN_DURATION_MS,
  easing: cubicOut,
});

// -----------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------

/** Whether slots are active (wide layout). */
function isSlotMode(): boolean {
  return windowWidth >= WIDE_BREAKPOINT;
}

/** Slot width: half the container, capped at MAX_MEASURE. */
function computeSlotW(): number {
  return Math.min(MAX_MEASURE, containerWidth / 2);
}

/** Resting x for a given slot. */
function xForSlot(s: "left" | "right"): number {
  return s === "left" ? 0 : containerWidth / 2;
}

/** Compute overlap between two horizontal intervals [aL, aR] and [bL, bR]. */
function horizontalOverlap(
  aLeft: number,
  aRight: number,
  bLeft: number,
  bRight: number,
): number {
  return Math.max(0, Math.min(aRight, bRight) - Math.max(aLeft, bLeft));
}

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

/**
 * Set the initial slot based on mode. Read mode starts left, walk mode
 * starts right. The tween snaps instantly (no animation on boot).
 */
export function initColumnSlot(mode: "read" | "walk"): void {
  slot = mode === "read" ? "left" : "right";
  firstEvaluation = true;
  const x = isSlotMode()
    ? xForSlot(slot)
    : Math.max(0, (containerWidth - MAX_MEASURE) / 2);
  // Tween.set resolves when the motion finishes; nothing awaits a snap.
  void columnXTween.set(x, { duration: 0 });
}

/**
 * Publish the container's content width and its document-space left edge.
 * Fed by FlowStory's container measurement.
 */
export function setColumnContainer(width: number, left: number): void {
  containerWidth = width;
  containerLeft = left;
}

/**
 * Publish the window width. Slots exist only at >= WIDE_BREAKPOINT;
 * below that the module reports a single degenerate centered slot.
 */
export function setColumnWindowWidth(w: number): void {
  windowWidth = w;
}

/**
 * Evaluate whether the frame's horizontal pressure warrants a slot flip.
 *
 * Reads only hole.left/right (scroll-invariant). Evaluates against the
 * resting slot rects, never the mid-flight animated x, which could
 * oscillate the decision during a flip animation.
 *
 * Flips when overlap with the current slot exceeds slotW * SLOT_FLIP_RATIO,
 * unless the other slot's would-be overlap is within SLOT_FLIP_DEADBAND
 * of the current overlap (straddling frame: lesser overlap wins).
 *
 * Null hole is a no-op (frame hidden, slot stays).
 */
export function evaluateColumnPressure(hole: FlowHole | null): void {
  if (hole === null) return;
  if (!isSlotMode()) return;

  const slotW = computeSlotW();
  const threshold = slotW * SLOT_FLIP_RATIO;

  const currentX = xForSlot(slot);
  const otherSlot: "left" | "right" = slot === "left" ? "right" : "left";
  const otherX = xForSlot(otherSlot);

  // Hole coordinates are container-space.
  const currentOverlap = horizontalOverlap(
    currentX,
    currentX + slotW,
    hole.left,
    hole.right,
  );
  const otherOverlap = horizontalOverlap(
    otherX,
    otherX + slotW,
    hole.left,
    hole.right,
  );

  if (currentOverlap <= threshold) return;

  // Dead band: only flip when the other slot is meaningfully better.
  // If the difference is within the dead band, staying put avoids
  // oscillation for frames that straddle both slots roughly equally.
  if (currentOverlap - otherOverlap < SLOT_FLIP_DEADBAND) return;

  // Equality guard: no-op when the computed slot matches the current one.
  // (Unreachable here since otherSlot !== slot by construction, but
  // documents the contract.)
  if (otherSlot === slot) return;

  slot = otherSlot;
  const targetX = xForSlot(slot);

  if (firstEvaluation) {
    firstEvaluation = false;
    void columnXTween.set(targetX, { duration: 0 });
  } else {
    const dur = prefersReducedMotion.current ? 0 : TWEEN_DURATION_MS;
    void columnXTween.set(targetX, { duration: dur, easing: cubicOut });
  }
}

/**
 * The animated column rect. The x value is the tween's current (mid-flight)
 * value; width is the slot width in slot mode, or the degenerate width.
 */
export function columnRect(): FlowColumn {
  if (!isSlotMode()) {
    const w = Math.min(MAX_MEASURE, containerWidth);
    return { x: Math.max(0, (containerWidth - MAX_MEASURE) / 2), width: w };
  }
  return { x: columnXTween.current, width: computeSlotW() };
}

/**
 * The resting (target) column rect. Used for published closures and
 * pressure math, never mid-flight transients.
 */
export function restingColumnRect(): FlowColumn {
  if (!isSlotMode()) {
    const w = Math.min(MAX_MEASURE, containerWidth);
    return { x: Math.max(0, (containerWidth - MAX_MEASURE) / 2), width: w };
  }
  return { x: xForSlot(slot), width: computeSlotW() };
}

/** Current slot assignment. */
export function columnSlot(): "left" | "right" {
  return slot;
}

/** Document-space left edge of the flow container. */
export function columnContainerLeft(): number {
  return containerLeft;
}

/** Content width of the flow container in px. */
export function columnContainerWidth(): number {
  return containerWidth;
}

/**
 * Reset all module state to initial values. Exposed so tests can isolate
 * each case without cross-contamination from module-level persistence.
 */
export function resetColumnForTests(): void {
  slot = "left";
  containerWidth = 0;
  containerLeft = 0;
  windowWidth = typeof window === "undefined" ? 0 : window.innerWidth;
  firstEvaluation = true;
  void columnXTween.set(0, { duration: 0 });
}

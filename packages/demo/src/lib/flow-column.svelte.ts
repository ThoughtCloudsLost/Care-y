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
import { MAX_MEASURE, SLOT_FLIP_RATIO } from "./flow-layout.js";

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

// The tween holds a NORMALIZED slot position: 0 is the left slot, 1 the
// right. Rendered x is that position times the right slot's offset, read
// live, so a container measured after the slot was chosen still lands the
// column correctly. Tweening absolute px instead would freeze whatever
// width was known at init: App calls initColumnSlot before FlowStory has
// measured, so the right slot would resolve to 0 and never recover.
const slotPosTween = new Tween(0, {
  duration: TWEEN_DURATION_MS,
  easing: cubicOut,
});

/** Normalized tween target for a slot. */
function posForSlot(s: "left" | "right"): number {
  return s === "left" ? 0 : 1;
}

// -----------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------

/** Whether slots are active (wide layout). */
function isSlotMode(): boolean {
  return windowWidth >= WIDE_BREAKPOINT;
}

/**
 * Slot width: a full container half, uncapped. The two slots tile the
 * container edge to edge, so the text owns one side and the frame the
 * other with no unused gutter between them.
 */
function computeSlotW(): number {
  return containerWidth / 2;
}

/** Resting x for a given slot. */
function xForSlot(s: "left" | "right"): number {
  return s === "left" ? 0 : containerWidth / 2;
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
  // Normalized, so this is correct before the container is measured.
  // Tween.set resolves when the motion finishes; nothing awaits a snap.
  void slotPosTween.set(posForSlot(slot), { duration: 0 });
}

/**
 * Move the column to a slot, animated.
 *
 * For moves the layout dictates rather than the frame's travel. Entering
 * walk mode spawns the frame centered in the left slot, on top of a
 * column that read mode left there. Nothing travelled into the column,
 * so the pressure rule correctly declines to fire, but the two still
 * cannot share a side: the mode change itself is what re-establishes
 * the arrangement.
 */
export function moveColumnToSlot(s: "left" | "right"): void {
  if (slot === s) return;
  slot = s;
  firstEvaluation = false;
  const dur = prefersReducedMotion.current ? 0 : TWEEN_DURATION_MS;
  void slotPosTween.set(posForSlot(s), { duration: dur, easing: cubicOut });
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
 * Evaluate whether the frame has pushed far enough into the column to
 * take its side.
 *
 * The frame's center crosses into the column at the edge facing the
 * other slot, and the column yields once that center is more than
 * SLOT_FLIP_RATIO of the way across. Frame width does not enter into
 * it, so every frame size behaves the same.
 *
 * Reads only hole.left/right (scroll-invariant) and the resting slot
 * rect, never the mid-flight animated x, which would let the decision
 * oscillate during a flip.
 *
 * The two trigger points sit a long way apart (at one sixth and five
 * sixths of the container), so a flip always lands the column somewhere
 * the reverse test fails, and no separate hysteresis is needed.
 *
 * Null hole is a no-op (frame hidden, slot stays).
 */
export function evaluateColumnPressure(hole: FlowHole | null): void {
  if (hole === null) return;
  if (!isSlotMode()) return;

  const slotW = computeSlotW();
  const colX = xForSlot(slot);
  const centerX = (hole.left + hole.right) / 2;

  // How far the center has reached into the column, measured from the
  // edge it enters by: the left edge for a right-hand column, the right
  // edge for a left-hand one.
  const depth = slot === "right" ? centerX - colX : colX + slotW - centerX;
  if (depth <= slotW * SLOT_FLIP_RATIO) return;

  slot = slot === "right" ? "left" : "right";
  const targetPos = posForSlot(slot);

  if (firstEvaluation) {
    firstEvaluation = false;
    void slotPosTween.set(targetPos, { duration: 0 });
  } else {
    const dur = prefersReducedMotion.current ? 0 : TWEEN_DURATION_MS;
    void slotPosTween.set(targetPos, { duration: dur, easing: cubicOut });
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
  // Interpolate between the slot offsets, both read from the live
  // container width, so a resize mid-flip stays consistent.
  return {
    x: slotPosTween.current * xForSlot("right"),
    width: computeSlotW(),
  };
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
  void slotPosTween.set(0, { duration: 0 });
}

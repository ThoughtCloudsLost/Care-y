/**
 * Session-only guide progress tracking.
 *
 * Each guide's completed steps are stored as a set of step indices.
 * Resets on demo restart (the session is transient). Uses SvelteSet
 * for reactive tracking so the UI re-renders when a step is toggled.
 */

import { SvelteSet } from "svelte/reactivity";
import { GUIDES, type GuideSlug } from "./guide-checklists.js";

// -----------------------------------------------------------------------
// Reactive state
// -----------------------------------------------------------------------

const progressMap = new Map<GuideSlug, SvelteSet<number>>();

// -----------------------------------------------------------------------
// Internal
// -----------------------------------------------------------------------

function ensureSet(slug: GuideSlug): SvelteSet<number> {
  let set = progressMap.get(slug);
  if (set === undefined) {
    set = new SvelteSet();
    progressMap.set(slug, set);
  }
  return set;
}

function totalForGuide(slug: GuideSlug): number {
  const guide = GUIDES.find((g) => g.slug === slug);
  return guide !== undefined ? guide.steps.length : 0;
}

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

/** Toggle a step's completion state. */
export function toggleStep(slug: GuideSlug, idx: number): void {
  const set = ensureSet(slug);
  if (set.has(idx)) {
    set.delete(idx);
  } else {
    set.add(idx);
  }
}

/** Whether a specific step is marked done. */
export function isStepDone(slug: GuideSlug, idx: number): boolean {
  const set = progressMap.get(slug);
  return set !== undefined && set.has(idx);
}

/** Done/total counts for a guide. */
export function guideProgress(slug: GuideSlug): {
  done: number;
  total: number;
} {
  const set = progressMap.get(slug);
  return {
    done: set !== undefined ? set.size : 0,
    total: totalForGuide(slug),
  };
}

/** Clear all progress. Called on demo restart. */
export function resetGuideProgress(): void {
  progressMap.clear();
}

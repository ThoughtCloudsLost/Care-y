/**
 * Excursion state: aggregation pages and guide checklists.
 *
 * Only one excursion is active at a time (single nullable $state).
 * Opening a guide unlinks the phone-story coupling so the reader can
 * work through steps on the phone without the handbook fighting them.
 * Opening an aggregation never touches the link state.
 *
 * Phone-tap close: aggregations close on phone-origin navigation
 * (the coupling always wins). Guides do NOT close on phone taps
 * because the reader is deliberately unlinked and working through
 * steps on the phone.
 */

import { isLinked, toggleLinked } from "./link-state.svelte.js";
import type { GuideSlug } from "./guide-checklists.js";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type AggregationPageId =
  "encryption" | "server-holds" | "who-sees" | "cannot-prove" | "searching";

type Excursion =
  | { kind: "aggregation"; page: AggregationPageId }
  | { kind: "guide"; slug: GuideSlug };

// -----------------------------------------------------------------------
// Reactive state
// -----------------------------------------------------------------------

let excursion = $state<Excursion | null>(null);

/** Whether the user was linked when the current guide opened. */
let wasLinkedOnOpen = false;

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

/** The currently active excursion, or null when none is open. */
export function activeExcursion(): Excursion | null {
  return excursion;
}

/**
 * Open an aggregation page. Closes any open guide (with link
 * restoration) first. Never touches link state itself.
 */
export function openAggregation(page: AggregationPageId): void {
  // Close any open guide, restoring the link if needed
  if (excursion !== null && excursion.kind === "guide") {
    restoreLinkIfNeeded();
  }
  wasLinkedOnOpen = false;
  excursion = { kind: "aggregation", page };
}

/**
 * Open a guide checklist. Closes any open aggregation first. If the
 * phone-story coupling is linked, unlinks it so the reader can work
 * through steps on the phone without the handbook scrolling away.
 */
export function openGuide(slug: GuideSlug): void {
  // Close any open aggregation (no link side effects for aggregations)
  if (excursion !== null && excursion.kind === "aggregation") {
    excursion = null;
  }

  if (isLinked()) {
    wasLinkedOnOpen = true;
    toggleLinked();
  } else {
    wasLinkedOnOpen = false;
  }
  excursion = { kind: "guide", slug };
}

/**
 * Close the active excursion. When closing a guide that unlinked on
 * open, re-links the coupling so the scroll-engine's relink
 * reconciliation converges the location.
 */
export function closeExcursion(_reason: "user" | "phone-tap" | "relink"): void {
  restoreLinkIfNeeded();
  excursion = null;
}

/**
 * Close an aggregation on phone-origin navigation. Guides are NOT
 * closed by phone taps: the reader is deliberately unlinked and
 * working through steps, and closing would fight them.
 */
export function closeOnPhoneNavigation(): void {
  if (excursion !== null && excursion.kind === "aggregation") {
    excursion = null;
  }
}

/**
 * Reset for demo restart. Clears the excursion without link side
 * effects (App calls resetLinked() separately on restart).
 */
export function resetExcursion(): void {
  excursion = null;
  wasLinkedOnOpen = false;
}

// -----------------------------------------------------------------------
// Internal
// -----------------------------------------------------------------------

function restoreLinkIfNeeded(): void {
  if (
    excursion !== null &&
    excursion.kind === "guide" &&
    wasLinkedOnOpen &&
    !isLinked()
  ) {
    toggleLinked();
  }
  wasLinkedOnOpen = false;
}

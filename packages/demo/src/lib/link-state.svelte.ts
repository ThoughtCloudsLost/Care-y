/**
 * Linked/unlinked state for the phone-story coupling.
 *
 * When linked (default), scrollspy settles and page clicks drive the
 * phone, and phone topic classification auto-scrolls the story.
 * When unlinked, the coupling is severed: the story navigates locally
 * (scroll-engine's local override) and the phone runs on its own.
 *
 * Progress tracking (topic seen marks) continues while unlinked;
 * only the automatic scroll/navigation coupling is suppressed.
 *
 * On re-link, whichever side moved most recently during the unlink
 * wins: the story pushes its location to the phone, or the phone's
 * stored position is presented (scroll-engine's relink reconciliation).
 */

// -----------------------------------------------------------------------
// Reactive state
// -----------------------------------------------------------------------

let linked: boolean = $state(true);

// -----------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------

/** Whether the phone and story are coupled. */
export function isLinked(): boolean {
  return linked;
}

/** Toggle the linked state. */
export function toggleLinked(): void {
  linked = !linked;
}

/**
 * Reset to the default linked state. Called on restart so a fresh
 * demo session always starts coupled.
 */
export function resetLinked(): void {
  linked = true;
}

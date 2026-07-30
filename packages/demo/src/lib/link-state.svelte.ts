/**
 * Linked/unlinked state for the phone-story coupling.
 *
 * When linked (default), scrollspy settles and page clicks drive the
 * phone, and phone topic classification auto-scrolls the story.
 * When unlinked, both directions are gated: the story stops driving
 * the phone and the phone stops driving the story.
 *
 * Progress tracking (topic seen marks) continues while unlinked;
 * only the automatic scroll/navigation coupling is suppressed.
 *
 * On re-link, nothing converges immediately. The next actor wins:
 * the next phone interaction drives the story to its topic, or the
 * next story scroll/click drives the phone.
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

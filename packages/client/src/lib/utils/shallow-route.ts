/**
 * Shallow routing utilities for modal/sheet state.
 *
 * Wraps SvelteKit's `pushState` so modals create history entries that can be
 * dismissed with the browser back button (important for mobile swipe-to-back).
 *
 * To check if a modal is open, read `page.state.yourKey` directly in the
 * template per SvelteKit convention. No wrapper needed.
 *
 * Content components should NOT call this directly. They emit events; route
 * files call `openModal()`.
 */

import { pushState } from "$app/navigation";

export function openModal(
  stateKey: string,
  data?: Record<string, unknown>,
): void {
  pushState("", { [stateKey]: true, ...data });
}

/**
 * Publish a message to one of the ARIA live regions in the root layout.
 *
 * The root layout contains two live regions:
 *  - `#live-assertive` (aria-live="assertive") for urgent announcements
 *  - `#live-polite` (aria-live="polite") for non-urgent status updates
 *
 * Screen readers pick up text changes in these containers automatically.
 */

export type LiveRegionPoliteness = "assertive" | "polite";

export function announceToLiveRegion(
  politeness: LiveRegionPoliteness,
  message: string,
): void {
  const el = document.getElementById(`live-${politeness}`);
  if (!el) return;

  // Clear first so repeated identical messages still trigger an announcement.
  el.textContent = "";
  // The rAF ensures the DOM mutation is two separate steps for the AT.
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

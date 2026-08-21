/**
 * Carries the open row across a layout-mode switch.
 *
 * The full-page detail route identifies its row through the route param
 * (`/tickets/[id]`), the desktop split view through shallow page state
 * (`page.state.ticketId` on `/tickets`). Switching between the two
 * layouts moves the id from one carrier to the other, and that move is
 * two steps: navigate, then write the state (or clear the state, then
 * navigate). `goto()` cannot carry page state, so the steps cannot be
 * merged.
 *
 * Between the steps neither carrier holds the id, so anything deriving
 * from them briefly reads "list, nothing open": the split view falls to
 * its empty placeholder, and the demo's story bridge snaps its narration
 * from the detail section back to the list section.
 *
 * A handoff registers the id for exactly that window. Consumers read it
 * as a fallback after the real carriers, so the selection stays
 * continuous through the switch.
 */

import { SvelteMap } from "svelte/reactivity";

/** Split views that hand a row between full-page and split layouts. */
export type SplitPane = "tickets" | "library";

const pending = new SvelteMap<SplitPane, string>();

/** Hold `id` for `pane` until the pairing navigation settles. */
export function beginSplitHandoff(pane: SplitPane, id: string): void {
  pending.set(pane, id);
}

/** Release the held id. Safe to call when nothing is pending. */
export function endSplitHandoff(pane: SplitPane): void {
  pending.delete(pane);
}

/** The id held for `pane`, or null when no handoff is in flight. */
export function splitHandoffId(pane: SplitPane): string | null {
  return pending.get(pane) ?? null;
}

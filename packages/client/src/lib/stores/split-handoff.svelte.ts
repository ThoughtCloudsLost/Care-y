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
 *
 * A handoff covers the gap inside ONE navigation, never a later intent.
 * Anything meaning "show the bare list" ends it, and the token returned
 * by `beginSplitHandoff` lets the interrupted navigation see that it
 * lost the pane and skip the state write that would re-open the row.
 */

import { SvelteMap } from "svelte/reactivity";

/** Split views that hand a row between full-page and split layouts. */
export type SplitPane = "tickets" | "library";

interface Handoff {
  readonly id: string;
  readonly token: number;
}

const pending = new SvelteMap<SplitPane, Handoff>();

let lastToken = 0;

/**
 * Hold `id` for `pane` until the pairing navigation settles. The
 * returned token identifies this handoff: pass it to
 * `isSplitHandoffCurrent` before writing the paired page state.
 */
export function beginSplitHandoff(pane: SplitPane, id: string): number {
  lastToken += 1;
  pending.set(pane, { id, token: lastToken });
  return lastToken;
}

/** Release the held id. Safe to call when nothing is pending. */
export function endSplitHandoff(pane: SplitPane): void {
  pending.delete(pane);
}

/** The id held for `pane`, or null when no handoff is in flight. */
export function splitHandoffId(pane: SplitPane): string | null {
  return pending.get(pane)?.id ?? null;
}

/**
 * Whether `token` still owns `pane`. False once the handoff has been
 * ended or replaced, meaning a later intent took the pane over and the
 * navigation holding `token` must not write its page state.
 */
export function isSplitHandoffCurrent(pane: SplitPane, token: number): boolean {
  return pending.get(pane)?.token === token;
}

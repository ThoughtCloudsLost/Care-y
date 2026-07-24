import { SvelteMap } from "svelte/reactivity";

/**
 * Session-only fold memory for case headers, keyed by ticket id.
 * In-memory by decision: fold state never goes to localStorage or the
 * server, so nothing about how a volunteer reads a case leaves the tab.
 * Headers start unfolded (description-first).
 */
const folded = new SvelteMap<string, boolean>();

export function isCaseFolded(ticketId: string): boolean {
  return folded.get(ticketId) ?? false;
}

export function setCaseFolded(ticketId: string, value: boolean): void {
  if (value) {
    folded.set(ticketId, value);
  } else {
    folded.delete(ticketId);
  }
}

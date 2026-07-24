import { SvelteMap } from "svelte/reactivity";
import type { ComposeMode } from "$lib/shell/types.js";

const drafts = new SvelteMap<string, string>();

// Reply mode keys by bare ticketId. The store predates compose modes
// and stored reply drafts under that key shape, so keeping it preserves
// any in-memory draft across the API migration.
function modeKey(ticketId: string, mode: ComposeMode): string {
  return mode === "reply" ? ticketId : `${ticketId}:${mode}`;
}

export function getDraftForMode(ticketId: string, mode: ComposeMode): string {
  return drafts.get(modeKey(ticketId, mode)) ?? "";
}

export function setDraftForMode(
  ticketId: string,
  mode: ComposeMode,
  text: string,
): void {
  const key = modeKey(ticketId, mode);
  if (text) {
    drafts.set(key, text);
  } else {
    drafts.delete(key);
  }
}

export function clearDraftForMode(ticketId: string, mode: ComposeMode): void {
  drafts.delete(modeKey(ticketId, mode));
}

export function hasAnyDraft(): boolean {
  return drafts.size > 0;
}

/**
 * Unsent compose text, held for the life of the tab and no longer.
 *
 * Memory only, deliberately. A draft on a client device is message content
 * on the surface whose whole design assumes the device may be looked at by
 * someone the person is hiding from, so it survives navigation within the
 * session and never outlives the tab.
 *
 * The key is any thread identity, a ticket or a portal channel, which is
 * what lets the volunteer thread and the client thread share one store
 * rather than growing two that drift.
 */

import { SvelteMap } from "svelte/reactivity";
import type { ComposeMode } from "$lib/shell/types.js";

const drafts = new SvelteMap<string, string>();

// Reply mode keys by bare threadId. The store predates compose modes
// and stored reply drafts under that key shape, so keeping it preserves
// any in-memory draft across the API migration.
function modeKey(threadId: string, mode: ComposeMode): string {
  return mode === "reply" ? threadId : `${threadId}:${mode}`;
}

export function getDraftForMode(threadId: string, mode: ComposeMode): string {
  return drafts.get(modeKey(threadId, mode)) ?? "";
}

export function setDraftForMode(
  threadId: string,
  mode: ComposeMode,
  text: string,
): void {
  const key = modeKey(threadId, mode);
  if (text) {
    drafts.set(key, text);
  } else {
    drafts.delete(key);
  }
}

export function clearDraftForMode(threadId: string, mode: ComposeMode): void {
  drafts.delete(modeKey(threadId, mode));
}

export function hasAnyDraft(): boolean {
  return drafts.size > 0;
}

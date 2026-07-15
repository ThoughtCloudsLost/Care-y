import { SvelteMap } from "svelte/reactivity";
import type { ComposeMode } from "$lib/shell/types.js";

const drafts = new SvelteMap<string, string>();

function modeKey(ticketId: string, mode: ComposeMode): string {
  return mode === "reply" ? ticketId : `${ticketId}:${mode}`;
}

export function getDraft(ticketId: string): string {
  return drafts.get(ticketId) ?? "";
}

export function setDraft(ticketId: string, text: string): void {
  if (text) {
    drafts.set(ticketId, text);
  } else {
    drafts.delete(ticketId);
  }
}

export function clearDraft(ticketId: string): void {
  drafts.delete(ticketId);
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

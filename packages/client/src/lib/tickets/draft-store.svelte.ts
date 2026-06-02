import { SvelteMap } from "svelte/reactivity";

const drafts = new SvelteMap<string, string>();

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

export function hasAnyDraft(): boolean {
  return drafts.size > 0;
}

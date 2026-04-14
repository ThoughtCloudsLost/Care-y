/**
 * Placeholder search providers for sections not yet implemented.
 * Show section headers with "(0)" to give the full search layout feel.
 * Remove each stub when the real provider is registered.
 *
 * KB articles: replaced by real provider (kb.ts).
 * Volunteers: replaced when volunteer search lands (6g).
 */
import type { Component } from "svelte";
import type { SearchProvider } from "../types.js";
import { UsersRound } from "@lucide/svelte";
import * as m from "$lib/paraglide/messages.js";

function stubProvider(
  id: string,
  label: () => string,
  icon: Component,
  href: string,
): SearchProvider {
  return {
    id,
    label,
    icon,
    renderMode: "list",
    showAllHref: () => href,
    getResultHref: () => href,
    search: () => ({ results: [], loading: false, totalCached: 0 }),
    // Stub providers return 0 results so ResultItem is never called.
    // Provide a no-op component to satisfy the interface.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- stub; ResultItem is never called (0 results)
    ResultItem: (() => undefined) as unknown as SearchProvider["ResultItem"],
  };
}

export const volunteersStubProvider = stubProvider(
  "volunteers",
  () => m.search_section_volunteers(),
  UsersRound,
  "/volunteers",
);

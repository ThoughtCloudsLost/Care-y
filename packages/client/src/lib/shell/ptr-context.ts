import { getContext, setContext } from "svelte";

/**
 * Typed context for pull-to-refresh opt-out.
 *
 * AppShell reads `getPTREnabled()` (defaults to true if no parent set it).
 * Any child route that should suppress PTR calls `setPTREnabled(false)` during init.
 *
 * Uses a typed wrapper around getContext/setContext because the opt-out flows
 * bottom-up (child signals to parent's already-read default), not top-down.
 * Svelte's createContext throws when no parent calls the setter, which makes
 * it unsuitable here since the default case is "no one opts out."
 */

const PTR_KEY = Symbol("ptr-enabled");

/** Read the PTR-enabled flag from ancestor context. Returns `true` if unset. */
export function getPTREnabled(): boolean {
  return getContext<boolean | undefined>(PTR_KEY) !== false;
}

/** Set the PTR-enabled flag for this component's children. */
export function setPTREnabled(enabled: boolean): void {
  setContext(PTR_KEY, enabled);
}

/**
 * Demo consumption mode: "read" (story-first, frame via peek) or
 * "simulate" (frame always visible with desktop chrome).
 *
 * Default derives from viewport width (narrow = read, wide = simulate).
 * A ?mode=read or ?mode=simulate URL param overrides the default. The
 * override persists across restarts (the restart path preserves
 * location.search) and is shareable as a link.
 *
 * No localStorage. The URL is the single source of the override.
 */

import { SvelteURLSearchParams } from "svelte/reactivity";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type DemoMode = "read" | "simulate";

// -----------------------------------------------------------------------
// URL param helpers (pure, exported for testing)
// -----------------------------------------------------------------------

/** Read the mode param from a search string. Returns null for absent or invalid. */
export function parseModeParam(search: string): DemoMode | null {
  const value = new SvelteURLSearchParams(search).get("mode");
  if (value === "read" || value === "simulate") return value;
  return null;
}

/**
 * Write the mode param into a search string, preserving other params.
 * Returns the new search string (with leading "?", or "" if empty).
 */
export function writeModeParam(search: string, mode: DemoMode): string {
  const params = new SvelteURLSearchParams(search);
  params.set("mode", mode);
  return "?" + params.toString();
}

// -----------------------------------------------------------------------
// Reactive store
// -----------------------------------------------------------------------

export interface DemoModeStore {
  /** The effective mode given the current override and viewport default. */
  readonly mode: DemoMode;
  /** The explicit override (from URL or toggle), or null when using the default. */
  readonly override: DemoMode | null;
  /** Toggle to the opposite of the current effective mode. Writes the URL param. */
  toggle(): void;
  /** Set a specific mode (toolbar close button). Writes the URL param. */
  set(next: DemoMode): void;
}

/**
 * Create a reactive demo mode store. The `isNarrow` getter provides
 * the live viewport-based default (narrow = read, wide = simulate).
 */
export function createDemoMode(isNarrow: () => boolean): DemoModeStore {
  let override: DemoMode | null = $state(
    typeof location !== "undefined" ? parseModeParam(location.search) : null,
  );

  const mode: DemoMode = $derived(
    override ?? (isNarrow() ? "read" : "simulate"),
  );

  function set(next: DemoMode): void {
    override = next;

    if (typeof history !== "undefined") {
      const newSearch = writeModeParam(window.location.search, next);
      history.replaceState(
        null,
        "",
        window.location.pathname + newSearch + window.location.hash,
      );
    }
  }

  function toggle(): void {
    set(mode === "read" ? "simulate" : "read");
  }

  return {
    get mode(): DemoMode {
      return mode;
    },
    get override(): DemoMode | null {
      return override;
    },
    toggle,
    set,
  };
}

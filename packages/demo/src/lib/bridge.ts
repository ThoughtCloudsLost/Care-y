/**
 * Typed bridge between the outer demo page and the phone iframe.
 *
 * The phone app assigns an implementation onto its own window as
 * window.demoBridge during mount. The outer page reads it from
 * iframe.contentWindow after the iframe loads and calls it directly
 * (same-origin, no serialization).
 */
import type { DemoFeature, DemoDetail } from "./router.svelte.js";

// -----------------------------------------------------------------------
// Topic vocabulary
// -----------------------------------------------------------------------

/**
 * Granular sub-feature topics detected from user interactions
 * inside the phone. Topics are narration-only; they never
 * navigate and never touch the router.
 */
export type DemoTopic =
  | "sort"
  | "filters"
  | "view-modes"
  | "select-mode"
  | "new-ticket"
  | "thread-filters"
  | "compose-actions"
  | "reply"
  | "notes"
  | "case-fold"
  | "language";

/** All topics in display order. */
export const DEMO_TOPICS: readonly DemoTopic[] = [
  "sort",
  "filters",
  "view-modes",
  "select-mode",
  "new-ticket",
  "thread-filters",
  "compose-actions",
  "reply",
  "notes",
  "case-fold",
  "language",
] as const;

// -----------------------------------------------------------------------
// Bridge state and interface
// -----------------------------------------------------------------------

export interface DemoBridgeState {
  readonly feature: DemoFeature | null;
  readonly detail: DemoDetail;
  readonly searchOpen: boolean;
  /** Last interacted sub-feature; null until first interaction and after reload. */
  readonly topic: DemoTopic | null;
}

export type DemoBridgeListener = (state: DemoBridgeState) => void;

export interface DemoBridge {
  /** Navigate the phone to a built feature (outer entry point). */
  navigate(feature: DemoFeature, detail?: DemoDetail): void;
  /** Open the search overlay by activating the navbar search control. */
  openSearch(): void;
  /** Apply light/dark scheme and glass classes to the phone document. */
  setDark(dark: boolean): void;
  /**
   * Subscribe to router state changes. The callback fires immediately
   * with the current state and again on every change. Returns an
   * unsubscribe function.
   */
  subscribe(listener: DemoBridgeListener): () => void;
}

declare global {
  interface Window {
    demoBridge?: DemoBridge;
  }
}

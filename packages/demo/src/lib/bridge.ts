/**
 * Typed bridge between the outer demo page and the phone iframe.
 *
 * The phone app assigns an implementation onto its own window as
 * window.demoBridge during mount. The outer page reads it from
 * iframe.contentWindow after the iframe loads and calls it directly
 * (same-origin, no serialization).
 */
import type { DemoFeature, DemoDetail } from "./router.svelte.js";

export interface DemoBridgeState {
  readonly feature: DemoFeature | null;
  readonly detail: DemoDetail;
  readonly searchOpen: boolean;
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

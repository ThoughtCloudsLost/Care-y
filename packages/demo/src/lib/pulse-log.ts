/**
 * Demo-only observability surface for tap-pulse outcomes.
 *
 * Records each pulse resolution (tapped, marked, selector fallback,
 * or missing) onto `window.__demoPulseLog` so the e2e test suite can
 * assert that the phone found and interacted with the right element.
 * No product data crosses this surface.
 */

import type { DemoTopic } from "./bridge.js";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type PulseOutcome = "tapped" | "marked" | "selector" | "missing";

export interface PulseLogEntry {
  readonly topic: DemoTopic;
  readonly outcome: PulseOutcome;
}

// -----------------------------------------------------------------------
// Global augmentation
// -----------------------------------------------------------------------

declare global {
  interface Window {
    __demoPulseLog?: PulseLogEntry[];
  }
}

// -----------------------------------------------------------------------
// Recording
// -----------------------------------------------------------------------

const LOG_CAP = 200;

/**
 * Append a pulse outcome to the window-scoped log array.
 *
 * The array is created lazily on first call and capped at 200 entries,
 * dropping the oldest when full. Safe to import in non-browser contexts
 * (vitest node/jsdom): the call is a no-op when `window` is absent.
 */
export function recordPulseOutcome(
  topic: DemoTopic,
  outcome: PulseOutcome,
): void {
  if (typeof window === "undefined") return;

  const log = (window.__demoPulseLog ??= []);

  if (log.length >= LOG_CAP) {
    log.splice(0, log.length - LOG_CAP + 1);
  }

  log.push({ topic, outcome });
}

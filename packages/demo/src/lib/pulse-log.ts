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

export interface PulseTargetRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

export interface PulseTargetInfo {
  readonly tag: string;
  readonly label: string;
  readonly inViewport: boolean;
  readonly rect: PulseTargetRect;
  readonly navChrome: boolean;
}

export interface PulseLogEntry {
  readonly topic: DemoTopic;
  readonly outcome: PulseOutcome;
  readonly target?: PulseTargetInfo;
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
// Nav-chrome check (duplicated from tap-pulse.ts isNavChrome to avoid
// pulling paraglide and other heavy transitive deps into this module)
// -----------------------------------------------------------------------

function isNavChrome(el: Element): boolean {
  return (
    el.closest('nav, [role="navigation"], [role="tablist"], .k-tabbar') !== null
  );
}

// -----------------------------------------------------------------------
// Target info builder
// -----------------------------------------------------------------------

const LABEL_MAX_LENGTH = 80;

function buildTargetInfo(el: Element): PulseTargetInfo {
  const rect = el.getBoundingClientRect();
  const view = el.ownerDocument.defaultView;

  const ariaLabel = el.getAttribute("aria-label");
  const label =
    ariaLabel !== null && ariaLabel.length > 0
      ? ariaLabel.slice(0, LABEL_MAX_LENGTH)
      : el.textContent.trim().slice(0, LABEL_MAX_LENGTH);

  const inViewport =
    view !== null &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < view.innerHeight &&
    rect.right > 0 &&
    rect.left < view.innerWidth;

  return {
    tag: el.tagName.toLowerCase(),
    label,
    inViewport,
    rect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
    navChrome: isNavChrome(el),
  };
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
 *
 * When targetEl is provided, a snapshot of the element's geometry,
 * label, and nav-chrome status is captured at call time and stored
 * as the entry's `target` field.
 */
export function recordPulseOutcome(
  topic: DemoTopic,
  outcome: PulseOutcome,
  targetEl?: Element,
): void {
  if (typeof window === "undefined") return;

  const log = (window.__demoPulseLog ??= []);

  if (log.length >= LOG_CAP) {
    log.splice(0, log.length - LOG_CAP + 1);
  }

  const entry: PulseLogEntry =
    targetEl !== undefined
      ? { topic, outcome, target: buildTargetInfo(targetEl) }
      : { topic, outcome };

  log.push(entry);
}

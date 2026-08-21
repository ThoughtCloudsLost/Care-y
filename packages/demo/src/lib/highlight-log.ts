/**
 * Demo-only observability surface for sub-section highlights.
 *
 * The pulse log (pulse-log.ts) records what a DemoTopic's pulse
 * resolved to. It cannot record these: a highlight is keyed by
 * sub-section, and several sub-sections carry no topic at all, so
 * there is no DemoTopic to file them under.
 *
 * Entries land on `window.__demoHighlightLog` for the e2e walk to
 * assert that every sub-section pointed the phone at something real.
 * Geometry and resolution path only: unlike the pulse log this
 * deliberately records no element text, because a highlight target is
 * frequently a whole content region rather than a labelled control.
 */

import type { SectionId } from "./bridge.js";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

/** How the highlight target was found. */
export type HighlightOutcome =
  | "section" // scroll-nav button tapped, `#section-<id>` ringed
  | "selector" // resolved from the sub's CSS selectors
  | "pulse" // fell through to the topic pulse's resolved element
  | "missing"; // nothing on screen to point at

export interface HighlightTargetInfo {
  readonly tag: string;
  readonly inViewport: boolean;
  readonly rect: {
    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
  };
}

export interface HighlightLogEntry {
  readonly sectionId: SectionId;
  readonly subSlug: string | null;
  readonly outcome: HighlightOutcome;
  readonly target?: HighlightTargetInfo;
}

declare global {
  interface Window {
    __demoHighlightLog?: HighlightLogEntry[];
  }
}

// -----------------------------------------------------------------------
// Target info
// -----------------------------------------------------------------------

function buildTargetInfo(el: Element): HighlightTargetInfo {
  const rect = el.getBoundingClientRect();
  const view = el.ownerDocument.defaultView;

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
    inViewport,
    rect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
  };
}

// -----------------------------------------------------------------------
// Recording
// -----------------------------------------------------------------------

const LOG_CAP = 200;

/**
 * Append a highlight outcome to the window-scoped log. The array is
 * created on first call and capped, dropping the oldest when full.
 * A no-op outside a browser so vitest node contexts can import freely.
 */
export function recordHighlightOutcome(
  sectionId: SectionId,
  subSlug: string | null,
  outcome: HighlightOutcome,
  targetEl?: Element,
): void {
  if (typeof window === "undefined") return;

  const log = (window.__demoHighlightLog ??= []);

  if (log.length >= LOG_CAP) {
    log.splice(0, log.length - LOG_CAP + 1);
  }

  const entry: HighlightLogEntry =
    targetEl !== undefined
      ? { sectionId, subSlug, outcome, target: buildTargetInfo(targetEl) }
      : { sectionId, subSlug, outcome };

  log.push(entry);
}

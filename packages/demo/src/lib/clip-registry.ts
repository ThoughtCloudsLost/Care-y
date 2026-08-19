/**
 * Clip registry: maps (sectionId, subSlug) pairs to region clip metadata.
 *
 * Asset URLs follow the convention `clips/<sectionId>/<subSlug>.webm`
 * under the app's BASE_URL. Per-sub overrides live in CLIP_OVERRIDES;
 * capture tooling fills assets later, so the absence of an override
 * means the conventional URL with the default aspect.
 */

import type { SectionId } from "./scroll-sections.js";
import { SECTIONS } from "./scroll-sections.js";

// -----------------------------------------------------------------------
// PeekFirePayload
// -----------------------------------------------------------------------

/** Payload passed to onpeekfire with the data the wiring half needs. */
export interface PeekFirePayload {
  /** Viewport rect of the figure at fire time. */
  rect: DOMRect;
  /** The HTMLVideoElement showing the clip (for still capture). */
  video: HTMLVideoElement;
  /** Section this figure belongs to. */
  sectionId: SectionId;
  /** Sub-section this figure belongs to. */
  subSlug: string;
  /**
   * True when the fire originated from a keyboard event (Enter/Space)
   * rather than the long-press pointer gesture. Keyboard fires have no
   * subsequent drag or release, so the peek commits immediately.
   */
  viaKeyboard?: boolean;
}

// -----------------------------------------------------------------------
// Default aspect ratio
// -----------------------------------------------------------------------

/**
 * Global kill switch: set to true once clip assets exist on disk.
 * While false, hasClip() returns false for every sub, suppressing
 * all figure placeholders from the flow layout.
 */
const CLIPS_ENABLED = false as boolean;

/**
 * Default region crop aspect ratio. The spec's region crops are roughly
 * 390x220, giving 390 / 220 = ~1.7727. Figures use this unless a
 * per-sub override specifies a different shape.
 */
export const DEFAULT_CLIP_ASPECT = 390 / 220;

// -----------------------------------------------------------------------
// Per-sub overrides
// -----------------------------------------------------------------------

interface ClipOverride {
  /** Override the default aspect ratio for a specific sub. */
  readonly aspectRatio?: number;
  /** When true, this sub has no clip even though its section is narrated. */
  readonly disabled?: boolean;
}

/**
 * Per-sub overrides keyed by "sectionId/subSlug". Empty for now;
 * capture tooling will populate this as crops are tuned.
 */
const CLIP_OVERRIDES: ReadonlyMap<string, ClipOverride> = new Map<
  string,
  ClipOverride
>([
  // Example (not active):
  // ["login/credentials", { aspectRatio: 16 / 9 }],
]);

// -----------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------

export interface ClipInfo {
  /** Full URL to the webm asset. */
  readonly url: string;
  /** Width / height ratio for layout. */
  readonly aspectRatio: number;
}

// -----------------------------------------------------------------------
// URL builder
// -----------------------------------------------------------------------

/**
 * Build the conventional clip URL for a given section and sub.
 * Accepts a base path so tests can inject a known prefix.
 */
export function buildClipUrl(
  sectionId: SectionId,
  subSlug: string,
  base: string,
): string {
  // Normalize: strip trailing slash from base, then append path.
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${trimmed}/clips/${sectionId}/${subSlug}.webm`;
}

// -----------------------------------------------------------------------
// Lookup functions
// -----------------------------------------------------------------------

/**
 * Whether a clip exists for the given section/sub pair.
 *
 * Currently returns true for every SECTIONS entry and false only for
 * non-SECTIONS ids (e.g. "coming-soon"). The per-sub CLIP_OVERRIDES
 * disabled flag is checked so the override seam is exercised, but no
 * overrides are populated yet, so in practice this is a section
 * membership check. Capture tooling will populate overrides as clips
 * are recorded; until then, the behavior is intentionally permissive.
 */
export function hasClip(sectionId: SectionId, subSlug: string): boolean {
  // No clip assets exist yet; suppress all figures until recordings land.
  if (!CLIPS_ENABLED) return false;

  if (!SECTIONS.some((s) => s.id === sectionId)) return false;
  const key = `${sectionId}/${subSlug}`;
  const override = CLIP_OVERRIDES.get(key);
  if (override?.disabled === true) return false;
  return true;
}

/** Get clip info for a section/sub pair. Always succeeds when hasClip is true. */
export function getClip(sectionId: SectionId, subSlug: string): ClipInfo {
  const key = `${sectionId}/${subSlug}`;
  const override = CLIP_OVERRIDES.get(key);
  const aspect = override?.aspectRatio ?? DEFAULT_CLIP_ASPECT;

  // BASE_URL is injected by Vite in both the served app and the vitest
  // projects (they run through the same Vite pipeline), so no runtime
  // fallback is needed; tests that want a specific base call
  // buildClipUrl directly.
  const base = import.meta.env.BASE_URL;

  return {
    url: buildClipUrl(sectionId, subSlug, base),
    aspectRatio: aspect,
  };
}

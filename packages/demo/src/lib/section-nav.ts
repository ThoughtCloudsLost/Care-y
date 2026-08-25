/**
 * Scroll-nav pages: reaching a section the way the product does.
 *
 * The dashboard, the admin organization and communications pages, the
 * admin hub, and the manager and volunteer pages all render a
 * SectionScrollNav in their subnavbar: a segmented control whose
 * buttons scroll to `#section-<id>` blocks and whose indicator tracks
 * the block currently under the sticky chrome.
 *
 * When a sub-section narrates one of those blocks, the phone taps that
 * segmented button rather than scrolling by itself. The product's own
 * handler (createSectionScroll's expandAndScroll) then expands a
 * collapsed section, offsets the scroll by the live navbar and
 * subnavbar heights, appends its spacer so the last section can still
 * reach the top, and slides the indicator. Reimplementing any of that
 * here would be a copy that drifts the first time the product's
 * chrome changes height.
 *
 * DOM-dependent. No Svelte runes.
 */

import { pollUntil } from "./poll.js";
import { scrollIntoViewIframeSafe } from "./tap-pulse.js";

/**
 * Wait budget for the scroll to settle. expandAndScroll holds for
 * 210ms on the expand transition, then smooth-scrolls behind a 1000ms
 * guard timer, so the settle can legitimately take past 1.2s.
 */
const SECTION_SETTLE_MS = 2000;

/** Interval between rect-stability probes. */
const SETTLE_POLL_MS = 80;

/**
 * The button in a SectionScrollNav that scrolls to `sectionId`.
 *
 * Matched on the data attribute rather than the button's aria-label:
 * the label is a translated section name, so a label match would have
 * to enumerate every locale and would still collide with content that
 * happens to use the same wording.
 */
export function findSectionNavButton(
  root: Document | Element,
  sectionId: string,
): HTMLElement | null {
  return root.querySelector<HTMLElement>(
    `.section-scroll-nav [data-section-id="${sectionId}"]`,
  );
}

/** The `#section-<id>` block a scroll-nav button scrolls to. */
export function sectionAnchor(
  doc: Document,
  sectionId: string,
): HTMLElement | null {
  return doc.getElementById(`section-${sectionId}`);
}

/** Whether two rects describe the same box. */
function rectsEqual(a: DOMRect, b: DOMRect): boolean {
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height
  );
}

/**
 * Wait until the anchor's rect stops moving. Two consecutive equal
 * rects mean the smooth scroll and any expand transition have both
 * finished, so a ring drawn now lands on the block's final position
 * instead of chasing it.
 */
async function waitForSettle(anchor: HTMLElement): Promise<HTMLElement | null> {
  let previous: DOMRect | null = null;

  return pollUntil<HTMLElement>({
    probe: (): HTMLElement | null => {
      if (!anchor.isConnected) return null;
      const rect = anchor.getBoundingClientRect();
      if (previous !== null && rectsEqual(rect, previous)) return anchor;
      previous = rect;
      return null;
    },
    timeoutMs: SECTION_SETTLE_MS,
    pollMs: SETTLE_POLL_MS,
  });
}

/**
 * Scroll a scroll-nav page to `sectionId` by tapping its nav button,
 * then wait for the motion to settle. Resolves with the section's
 * anchor element, or null when the page has no such section (hidden by
 * permissions, or not a scroll-nav page at all) so the caller can fall
 * back.
 *
 * `isStale` is checked by the settle poll, so a reader who scrolls two
 * sub-sections onward mid-scroll abandons this instead of resolving
 * late onto the wrong block.
 */
export async function tapSectionNav(
  doc: Document,
  sectionId: string,
  isStale?: () => boolean,
): Promise<HTMLElement | null> {
  const anchor = sectionAnchor(doc, sectionId);
  if (anchor === null) return null;

  const button = findSectionNavButton(doc, sectionId);
  if (button === null) {
    // The section exists but its nav button does not (a page that
    // renders section ids without a SectionScrollNav). The anchor is
    // still the right thing to point at, but a ring on an offscreen
    // block is exactly the failure this layer exists to prevent, so
    // bring it into view here (iframe-safe manual scroll, never
    // Element.scrollIntoView) and let the scroll settle.
    scrollIntoViewIframeSafe(anchor);
    if (isStale?.() === true) return null;
    const scrolled = await waitForSettle(anchor);
    if (isStale?.() === true) return null;
    return scrolled ?? (anchor.isConnected ? anchor : null);
  }

  button.click();

  if (isStale?.() === true) return null;

  const settled = await waitForSettle(anchor);
  if (isStale?.() === true) return null;

  // Settle only proves the anchor stopped moving; an anchor that never
  // moved settles instantly. The chip click can land before the page's
  // scroll handler is wired (queries still mounting right after a
  // route change), leaving the block below the fold. Ring only what
  // the reader can see: scroll it into view ourselves and re-settle.
  const target = settled ?? (anchor.isConnected ? anchor : null);
  if (target !== null && !isInViewport(target)) {
    scrollIntoViewIframeSafe(target);
    if (isStale?.() === true) return null;
    const rescrolled = await waitForSettle(target);
    if (isStale?.() === true) return null;
    return rescrolled ?? (target.isConnected ? target : null);
  }

  return target;
}

/** Whether any part of the element is inside the window viewport. */
function isInViewport(el: HTMLElement): boolean {
  const view = el.ownerDocument.defaultView;
  if (view === null) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < view.innerHeight &&
    rect.right > 0 &&
    rect.left < view.innerWidth
  );
}

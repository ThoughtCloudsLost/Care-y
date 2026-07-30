/**
 * Scroll engine: the outer page's view of the shared demo location,
 * presented through the flow layout's reading line.
 *
 * The page owns NO location state. activeSection/activeSub are derived
 * from the last bridge snapshot (a mirror of the phone-side location
 * store), so the narrative can only ever show what the store holds.
 * Page inputs (scroll settles, clicks, deep links) are intents sent
 * through bridge.setLocation; the page moves when the store echoes the
 * change back, one path for every input.
 *
 * Presentation model: a reading line sits at a fixed fraction of the
 * viewport height. The flow layout reports which block crosses that
 * line; the engine sends it as a location intent on scroll settle.
 * Programmatic moves (clicks, phone interactions, deep links) scroll
 * the page so the target block's top meets the reading line.
 *
 * DOM-dependent (listens to scroll settle, delegates geometry to
 * flow-geometry).
 */

import { tick } from "svelte";
import {
  parseHash,
  buildHash,
  loginStageTopics,
  type SectionId,
} from "./scroll-sections.js";
import type { DemoBridge, DemoBridgeState, DemoTopic } from "./bridge.js";
import {
  readingLineY,
  locationAtReadingLine,
  scrollTargetFor,
  flowGeometryReady,
  type FlowLocation,
} from "./flow-geometry.svelte.js";

// -----------------------------------------------------------------------
// Scroll engine state
// -----------------------------------------------------------------------

export interface ScrollEngine {
  /** Currently active section (mirrors the shared location) */
  readonly activeSection: SectionId;
  /** Currently active sub-section slug (null = no sub selected) */
  readonly activeSub: string | null;
  /** Select a section (top bar, intro click, next-section button) */
  selectSection(id: SectionId): void;
  /** Select a sub-section (block click) */
  selectSub(sectionId: SectionId, subSlug: string): void;
  /** Mirror a bridge snapshot and present its location transition */
  handleBridgeState(state: DemoBridgeState): void;
  /** Send the deep-link hash as an intent on first load */
  initFromHash(): void;
  /** Returns the reading line position (viewport px from the top) */
  remeasure(): number;
  /** Cleanup listeners */
  destroy(): void;
}

// Settle debounce for browsers without the scrollend event (Safari)
const SETTLE_QUIET_MS = 160;

// Distance (px) within which a scroll position counts as "at the target"
const ALIGN_TOLERANCE = 1;

// Distance (px) within which a suppressed settle is considered close
// enough to the aligned target to disarm (accounts for subpixel
// rounding and font-metric shifts between settle and alignment)
const SUPPRESS_TOLERANCE = 48;

export function createScrollEngine(
  getBridge: () => DemoBridge | undefined,
  getLinked: () => boolean = () => true,
  getPageScrollEnabled: () => boolean = () => true,
): ScrollEngine {
  // The one location the page renders: a mirror of the bridge state.
  let mirror: DemoBridgeState | undefined = $state();

  const activeSection: SectionId = $derived(
    mirror?.location.sectionId ?? "login",
  );
  const activeSub: string | null = $derived(mirror?.location.subSlug ?? null);

  // Last sub requested from a settle, so one settle sends one intent
  // while the store's echo is still in flight.
  let requestedSub: { section: SectionId; sub: string | null } | null = null;

  // Monotonic counter bumped on every alignment transition so a stale
  // retry loop can detect it has been superseded.
  let locationSeq = 0;

  // -----------------------------------------------------------------------
  // Suppression: prevent our own programmatic scrolls from feeding
  // back as page-scroll intents
  // -----------------------------------------------------------------------

  // Armed when a programmatic alignment scroll is in flight, or when
  // an init/reboot transition swaps the rendered section list.
  let suppressSettle = false;
  let alignRetries = 0;
  // The location we aligned to, for settle matching
  let alignedTarget: FlowLocation | null = null;
  // The scrollY we aligned to, for position matching
  let alignedScrollY: number | null = null;

  // -----------------------------------------------------------------------
  // Settle detection: the block at the reading line is the selection
  // -----------------------------------------------------------------------

  function onSettle(): void {
    // Entry page or other page-level gate: ignore settles entirely.
    if (!getPageScrollEnabled()) return;

    // When unlinked, the story scroll must not drive the phone.
    if (!getLinked()) return;

    if (suppressSettle) {
      handleSuppressedSettle();
      return;
    }

    if (!flowGeometryReady()) return;

    const loc = locationAtReadingLine();
    if (loc === null) return;

    // Already showing this location: clear any pending request
    if (loc.sectionId === activeSection && loc.subSlug === activeSub) {
      requestedSub = null;
      return;
    }

    // Dedup against an in-flight request
    if (
      requestedSub !== null &&
      requestedSub.section === loc.sectionId &&
      requestedSub.sub === loc.subSlug
    ) {
      return;
    }

    requestedSub = { section: loc.sectionId, sub: loc.subSlug };
    getBridge()?.setLocation(loc.sectionId, loc.subSlug, "page-scroll");
  }

  /**
   * Handle a settle that fired while suppression is armed.
   * If the reading line is at the aligned target (or scrollY is close
   * enough), disarm. Otherwise re-align once, then disarm.
   */
  function handleSuppressedSettle(): void {
    // Check position-based match: if we are close to where we scrolled,
    // the settle is our own alignment completing.
    if (
      alignedScrollY !== null &&
      Math.abs(window.scrollY - alignedScrollY) < SUPPRESS_TOLERANCE
    ) {
      suppressSettle = false;
      alignedTarget = null;
      alignedScrollY = null;
      requestedSub = null;
      return;
    }

    // Check location-based match
    const loc = locationAtReadingLine();
    if (
      loc !== null &&
      alignedTarget !== null &&
      loc.sectionId === alignedTarget.sectionId &&
      loc.subSlug === alignedTarget.subSlug
    ) {
      suppressSettle = false;
      alignedTarget = null;
      alignedScrollY = null;
      requestedSub = null;
      return;
    }

    // Mismatch: re-align once, then give up
    if (alignRetries < 1 && mirror !== undefined) {
      alignRetries += 1;
      void alignToLocation(
        mirror.location.sectionId,
        mirror.location.subSlug,
        mirror.origin,
      );
    } else {
      suppressSettle = false;
      alignedTarget = null;
      alignedScrollY = null;
    }
  }

  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  const hasScrollEnd = "onscrollend" in window;

  function onScroll(): void {
    if (hasScrollEnd) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(onSettle, SETTLE_QUIET_MS);
  }

  function onScrollEnd(): void {
    clearTimeout(settleTimer);
    onSettle();
  }

  // -----------------------------------------------------------------------
  // Mirror + presentation (the store's echo drives the page)
  // -----------------------------------------------------------------------

  function handleBridgeState(state: DemoBridgeState): void {
    // When unlinked, the phone must not auto-scroll the story.
    // The mirror stays stale so activeSection/activeSub hold position;
    // progress tracking runs upstream in App.svelte before this call.
    if (!getLinked()) return;

    const prev = mirror;
    mirror = state;

    // Only location transitions present; other state changes (topic,
    // stage, search flag) matter to progress tracking, not motion.
    if (state.locationSeq === prev?.locationSeq) return;
    requestedSub = null;

    if (state.origin === "init" && prev === undefined) {
      // First-load baseline: the page is already positioned.
      return;
    }

    if (state.origin !== "init") {
      const hash = buildHash(state.location.sectionId, state.location.subSlug);
      // eslint-disable-next-line security/detect-possible-timing-attacks -- URL hash comparison, no secret data
      if (window.location.hash !== hash) {
        history.replaceState(null, "", hash);
      }
    }

    if (state.origin === "page-scroll") {
      // The visitor scrolled here; the reading line already shows this
      // location and the highlight follows via the derived active values.
      return;
    }

    // Every programmatic transition arms settle suppression: the
    // alignment scroll must not feed back as a page-scroll intent.
    // An init-with-previous-mirror transition is a phone reboot
    // (restart, sign-out): the section swaps under the old scroll
    // position and requires the same treatment.
    suppressSettle = true;
    alignRetries = 0;

    // Section change (or init reboot): scroll to top before aligning
    // so the new page remounts at a clean scroll position. The armed
    // suppression absorbs the resulting settle.
    const sectionChanged =
      state.location.sectionId !== prev?.location.sectionId;
    if (sectionChanged) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    void alignToLocation(
      state.location.sectionId,
      state.location.subSlug,
      state.origin,
    );
  }

  // -----------------------------------------------------------------------
  // Programmatic alignment
  // -----------------------------------------------------------------------

  async function alignToLocation(
    sectionId: SectionId,
    subSlug: string | null,
    origin: DemoBridgeState["origin"],
  ): Promise<void> {
    // Capture the sequence number so a superseding transition can abort
    // this loop (the new page's alignToLocation bumps the counter).
    const mySeq = ++locationSeq;

    await tick();

    let target = scrollTargetFor(sectionId, subSlug);

    // Geometry may not be ready yet (page remount after a section
    // change, or first load before fonts render). Retry up to 10
    // times at 50ms intervals. The page swaps the FlowStory key on
    // section change, so scrollTargetFor returns null until the new
    // component publishes geometry.
    if (target === null) {
      const MAX_RETRIES = 10;
      const RETRY_DELAY_MS = 50;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (locationSeq !== mySeq) return; // superseded
        await new Promise<void>((resolve) => {
          setTimeout(resolve, RETRY_DELAY_MS);
        });
        target = scrollTargetFor(sectionId, subSlug);
        if (target !== null) break;
      }
    }

    // Superseded while waiting
    if (locationSeq !== mySeq) return;

    if (target === null) {
      // Exhausted retries: clear suppression so the engine is not
      // left wedged, and return. The next bridge state change or
      // scroll settle will pick up the location.
      suppressSettle = false;
      return;
    }

    // Record what we aligned to for suppression matching
    alignedTarget = { sectionId, subSlug };
    alignedScrollY = target;

    if (Math.abs(window.scrollY - target) < ALIGN_TOLERANCE) {
      // Already at the target: no scroll event will fire, so the
      // settle path will not clear suppression. Clear it now unless
      // this is an init/reboot transition where the browser may still
      // snap-correct.
      if (origin !== "init") {
        suppressSettle = false;
      }
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior =
      origin === "phone" && !reduced ? "smooth" : "auto";

    window.scrollTo({ top: target, behavior });
  }

  // -----------------------------------------------------------------------
  // Page inputs: everything is an intent through the bridge
  // -----------------------------------------------------------------------

  function selectSection(id: SectionId): void {
    if (!getLinked()) return;
    getBridge()?.setLocation(id, null, "page-click");
  }

  function selectSub(sectionId: SectionId, subSlug: string): void {
    if (!getLinked()) return;
    getBridge()?.setLocation(sectionId, subSlug, "page-click");
  }

  function initFromHash(): void {
    const parsed = parseHash(window.location.hash);
    if (parsed === null) return;
    if (!getLinked()) return;

    getBridge()?.setLocation(parsed.sectionId, parsed.subSlug, "deep-link");
  }

  function remeasure(): number {
    return readingLineY();
  }

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  window.addEventListener("scroll", onScroll, { passive: true });
  if (hasScrollEnd) {
    window.addEventListener("scrollend", onScrollEnd);
  }

  function destroy(): void {
    window.removeEventListener("scroll", onScroll);
    if (hasScrollEnd) {
      window.removeEventListener("scrollend", onScrollEnd);
    }
    clearTimeout(settleTimer);
  }

  return {
    get activeSection(): SectionId {
      return activeSection;
    },
    get activeSub(): string | null {
      return activeSub;
    },
    selectSection,
    selectSub,
    handleBridgeState,
    initFromHash,
    remeasure,
    destroy,
  };
}

// -----------------------------------------------------------------------
// Seen-topics accumulator (progress tracking)
// -----------------------------------------------------------------------

export interface TopicProgress {
  readonly seen: ReadonlySet<DemoTopic>;
  readonly count: number;
  readonly total: number;
  markFromState(state: DemoBridgeState): void;
  reset(): void;
}

export function createTopicProgress(
  seenSet: Set<DemoTopic>,
  totalTopics: number,
): TopicProgress {
  function markFromState(state: DemoBridgeState): void {
    if (state.topic !== null) {
      seenSet.add(state.topic);
    }
    // Infer login topics from stage transitions
    if (state.loginStage !== null) {
      for (const t of loginStageTopics(state.loginStage)) {
        seenSet.add(t);
      }
    }
  }

  function reset(): void {
    seenSet.clear();
  }

  return {
    get seen(): ReadonlySet<DemoTopic> {
      return seenSet;
    },
    get count(): number {
      return seenSet.size;
    },
    get total(): number {
      return totalTopics;
    },
    markFromState,
    reset,
  };
}

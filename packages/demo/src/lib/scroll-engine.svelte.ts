/**
 * Scroll engine: the outer page's view of the shared demo location,
 * presented through the flow layout's reading line.
 *
 * The page owns NO location state. activeSection/activeSub are derived
 * from the last bridge snapshot (a mirror of the phone-side location
 * store), so the narrative can only ever show what the store holds.
 * Page inputs (derived scroll position, clicks, deep links) are intents
 * sent through bridge.setLocation; the page moves when the store echoes
 * the change back, one path for every input.
 *
 * Selection model: which sub is selected is a $derived value computed
 * from locationWithVisibleHeading(). The geometry source is reactive
 * (republished by FlowStory on every layout pass, which runs per scroll
 * frame), so the derived recomputes automatically. Programmatic moves
 * (clicks, phone interactions, deep links) scroll the page so the
 * target block's top meets the reading line.
 *
 * DOM-dependent (delegates geometry to flow-geometry).
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
  scrollTargetFor,
  flowGeometryReady,
  locationWithVisibleHeading,
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

// Distance (px) within which a scroll position counts as "at the target"
const ALIGN_TOLERANCE = 1;

/**
 * How long after a scroll the story refuses to auto-scroll itself.
 * Covers the phone's late settles, which arrive shortly after the
 * command that caused them has already resolved.
 */
const SCROLL_GRACE_MS = 400;

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

  // Hard timeout handle for the suppression safety net. Cleared on
  // every normal disarm path so it only fires when something goes wrong.
  let suppressionTimeout: ReturnType<typeof setTimeout> | undefined;

  /** Arm suppression with a hard timeout fallback that clears it
   *  unconditionally, so a missed disarm can never latch forever. */
  function armSuppression(): void {
    suppressSettle = true;
    clearTimeout(suppressionTimeout);
    suppressionTimeout = setTimeout(() => {
      suppressSettle = false;
    }, 1000);
  }

  /** Disarm suppression and cancel the hard timeout. */
  function disarmSuppression(): void {
    suppressSettle = false;
    clearTimeout(suppressionTimeout);
  }

  // -----------------------------------------------------------------------
  // Derived selection: the sub at the band IS the selection
  //
  // locationWithVisibleHeading() reads module $state (the published
  // geometry source) plus window.scrollY. The source is reactive and
  // is republished by FlowStory on every layout pass; the layout runs
  // on every scroll frame (scrollY is a $state in FlowStory that
  // triggers a rAF-coalesced relayout, which calls
  // setFlowGeometrySource). So the derived recomputes per scroll frame
  // without needing its own scroll listener.
  // -----------------------------------------------------------------------

  // Timestamp only, no work: the align path reads it to avoid scrolling
  // the story while the visitor is scrolling it themselves.
  let lastScrollAt = 0;

  function noteUserScroll(): void {
    lastScrollAt = Date.now();
  }

  window.addEventListener("scroll", noteUserScroll, { passive: true });

  const derivedLocation = $derived(locationWithVisibleHeading());

  $effect(() => {
    const loc = derivedLocation;
    if (loc === null) return;
    if (!getPageScrollEnabled()) return;
    if (!getLinked()) return;
    if (suppressSettle) return;
    if (!flowGeometryReady()) return;

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
  });

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
      // The visitor scrolled here. Alignment is NOT re-run: bringing the
      // sub to the reading line is done by CSS scroll snapping, which
      // happens during the scroll itself. Scrolling them again here
      // would yank the page after they had already stopped.
      return;
    }

    if (state.origin === "phone-correction") {
      // A page-initiated request did not converge, so the store
      // snapped to the phone's actual screen. Mirror the state and
      // update the URL hash, but do NOT arm suppression and do NOT
      // scroll the page: corrections must never yank the reader.
      return;
    }

    // Every programmatic transition arms suppression: the alignment
    // scroll must not feed back as a page-scroll intent. The hard
    // timeout inside armSuppression guarantees it clears even if the
    // alignment path never reaches its own disarm call.
    armSuppression();

    // Section change (or init reboot): scroll to top before aligning
    // so the new page remounts at a clean scroll position. The armed
    // suppression absorbs the resulting derived update.
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
    // Never scroll the story out from under someone who is scrolling it.
    //
    // A page-scroll intent makes the phone navigate, and the phone keeps
    // settling after the command resolves. Those late settles arrive as
    // origin "phone" and would scroll the story to match, which reads as
    // the page jumping backwards mid-scroll. Only phone-origin moves are
    // gated: clicks and deep links must always align, and neither is a
    // scroll.
    if (origin === "phone" && Date.now() - lastScrollAt < SCROLL_GRACE_MS) {
      disarmSuppression();
      return;
    }

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
        if (locationSeq !== mySeq) {
          // Superseded: the new alignToLocation armed its own
          // suppression, so do not clear it here.
          return;
        }
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
      // Exhausted retries: clear suppression so the derived selection
      // is not left muted. The hard timeout would catch this too, but
      // clearing eagerly is better.
      disarmSuppression();
      return;
    }

    if (Math.abs(window.scrollY - target) < ALIGN_TOLERANCE) {
      // Already at the target: no scroll event will fire, so clear
      // suppression now unless this is an init/reboot transition
      // where the browser may still snap-correct.
      if (origin !== "init") {
        disarmSuppression();
      }
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior =
      origin === "phone" && !reduced ? "smooth" : "auto";

    window.scrollTo({ top: target, behavior });

    // For "auto" (instant) scrolls, suppression can be cleared
    // immediately since the scroll completes synchronously. Smooth
    // scrolls rely on the hard timeout to clear suppression after
    // the animation finishes.
    if (behavior === "auto") {
      disarmSuppression();
    }
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

  function destroy(): void {
    clearTimeout(suppressionTimeout);
    window.removeEventListener("scroll", noteUserScroll);
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

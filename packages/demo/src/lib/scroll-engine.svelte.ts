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
  getSection,
  loginStageTopics,
  type SectionId,
} from "./scroll-sections.js";
import type { DemoBridge, DemoBridgeState, DemoTopic } from "./bridge.js";
import { backstopDecision } from "./scroll-intent-guard.js";
import {
  readingLineY,
  scrollTargetFor,
  flowGeometryReady,
  locationWithVisibleHeading,
  setViewportScrollY,
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
  /**
   * Mute selection for the frames a top-chrome change takes to reflow.
   * Opening or closing the data flow band moves every block on the page
   * at once, and a half-applied reflow must not read as the visitor
   * having scrolled somewhere.
   */
  suppressLayoutShift(): void;
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

/**
 * How long selection stays muted after the top chrome changes height.
 * Long enough to cover the resize observation and the layout pass it
 * schedules, short enough that a visitor scrolling straight after
 * opening the band is still heard.
 */
export const LAYOUT_SHIFT_SETTLE_MS = 150;

export function createScrollEngine(
  getBridge: () => DemoBridge | undefined,
  getLinked: () => boolean = () => true,
  getPageScrollEnabled: () => boolean = () => true,
): ScrollEngine {
  // The one location the page renders: a mirror of the bridge state.
  let mirror: DemoBridgeState | undefined = $state();

  // Before the bridge exists (phone iframe still booting on a hard
  // reload), present the deep-linked section directly from the hash.
  // Falling back to the first section would show "Login and security"
  // for the whole phone boot on every deep-linked reload.
  const initialHash = parseHash(window.location.hash);

  const activeSection: SectionId = $derived(
    mirror?.location.sectionId ?? initialHash?.sectionId ?? "login",
  );
  const activeSub: string | null = $derived(
    mirror?.location.subSlug ?? initialHash?.subSlug ?? null,
  );

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

  // The location the in-flight alignment targets, so the backstop
  // timeout can check whether the page reached it before unmuting.
  let suppressionTarget: { section: SectionId; sub: string | null } | null =
    null;

  // Hard timeout handle for the suppression safety net. Cleared on
  // every normal disarm path so it only fires when something goes wrong.
  let suppressionTimeout: ReturnType<typeof setTimeout> | undefined;

  // Whether the current arming already spent its healing re-align.
  // Reset on every armSuppression so each transition gets one retry.
  let realignAttempted = false;

  /** Arm suppression for a given target location. The hard timeout is
   *  a backstop that only unmutes when the derived location matches
   *  the target, preventing a mid-animation expiry from leaking stale
   *  intents while the page is misaligned. Armed without a target
   *  (layout-shift settles), the backstop unmutes unconditionally. */
  function armSuppression(target?: {
    section: SectionId;
    sub: string | null;
  }): void {
    suppressSettle = true;
    suppressionTarget = target ?? null;
    realignAttempted = false;
    clearTimeout(suppressionTimeout);
    suppressionTimeout = setTimeout(runBackstop, 1000);
  }

  /** Backstop body. Aligned: unmute. Misaligned with a target and no
   *  retry spent: re-align once against the settled geometry. The
   *  first alignment can land short when geometry moves under it (the
   *  preset spring resizing the frame, a hole re-layout past the
   *  fixed-point cap), leaving the derived selection on a neighboring
   *  sub; unmuting then lets that stale position fire a page-scroll
   *  intent that overrides the visitor's click. Only after the retry
   *  also misses does it surrender and unmute on a short fuse. */
  function runBackstop(): void {
    const loc = derivedLocation;
    const decision = backstopDecision(
      suppressionTarget,
      loc?.sectionId ?? null,
      loc?.subSlug ?? null,
      realignAttempted,
    );

    if (decision === "unmute") {
      suppressSettle = false;
      suppressionTarget = null;
      return;
    }

    if (decision === "realign" && suppressionTarget !== null) {
      realignAttempted = true;
      void alignToLocation(
        suppressionTarget.section,
        suppressionTarget.sub,
        "page-click",
      );
      suppressionTimeout = setTimeout(runBackstop, 1000);
      return;
    }

    // Surrender: still misaligned after the re-align. Unmute on a
    // short fuse so the derived selection is not muted indefinitely;
    // the condition-based disarm still wins if alignment lands first.
    suppressionTimeout = setTimeout(() => {
      suppressSettle = false;
      suppressionTarget = null;
    }, 500);
  }

  /** Disarm suppression and cancel the hard timeout. */
  function disarmSuppression(): void {
    suppressSettle = false;
    suppressionTarget = null;
    clearTimeout(suppressionTimeout);
  }

  /**
   * Disarm only when the derived selection already matches the armed
   * target. Alignment can land with a residual (fixed-point cap, hole
   * re-layout after the scroll, browser rounding) that leaves the
   * derived selection on a NEIGHBORING sub; disarming then lets the
   * very next derived update fire a stale page-scroll intent that
   * overrides the transition being presented. Left armed, the
   * condition-based disarm in the derived-intent effect unmutes once
   * the positions agree, and the armSuppression backstop covers the
   * never-agrees case.
   */
  function disarmSuppressionIfAligned(): void {
    const loc = derivedLocation;
    if (
      loc !== null &&
      suppressionTarget !== null &&
      loc.sectionId === suppressionTarget.section &&
      loc.subSlug === suppressionTarget.sub
    ) {
      disarmSuppression();
    }
  }

  // -----------------------------------------------------------------------
  // Derived selection: the sub at the band IS the selection
  //
  // locationWithVisibleHeading() reads module $state in flow-geometry:
  // the published geometry source AND the published scroll position.
  // The source alone is not enough to keep the selection live, because
  // FlowStory's runLayout skips republishing when a pass is a no-op
  // (hole unchanged or disjoint from the content), which is the common
  // case during plain scrolling. The scroll listener below publishes
  // the position so the derived recomputes on every scroll event.
  // -----------------------------------------------------------------------

  // The align path reads the timestamp to avoid scrolling the story
  // while the visitor is scrolling it themselves.
  let lastScrollAt = 0;

  function noteUserScroll(): void {
    lastScrollAt = Date.now();
    setViewportScrollY(window.scrollY);
  }

  window.addEventListener("scroll", noteUserScroll, { passive: true });
  // Baseline for pages restored mid-scroll (bfcache, reload with a
  // remembered position) where no scroll event fires before the first
  // derived read.
  setViewportScrollY(window.scrollY);

  const derivedLocation = $derived(locationWithVisibleHeading());

  $effect(() => {
    const loc = derivedLocation;
    if (loc === null) return;
    if (!getPageScrollEnabled()) return;
    if (!getLinked()) return;
    if (!flowGeometryReady()) return;

    // Condition-based suppression disarm: the derived position has
    // reached the programmatic target, so the alignment scroll is
    // done and suppression can be lifted. This replaces the old
    // timer-only expiry that could unmute mid-animation.
    if (suppressSettle) {
      if (
        suppressionTarget !== null &&
        loc.sectionId === suppressionTarget.section &&
        loc.subSlug === suppressionTarget.sub
      ) {
        disarmSuppression();
      }
      return;
    }

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

    // Every programmatic transition arms suppression with the target
    // location so the condition-based disarm can detect when the scroll
    // reaches it. The hard timeout inside armSuppression is a backstop
    // that only unmutes when aligned.
    //
    // Section-level targets (null sub) are resolved to the section's
    // first sub before arming: the derived selection always names a
    // sub-heading, so a null-sub target could never match it and the
    // disarm would be left to the timed backstop, muting selection for
    // up to 1.5s after every section transition. At the section top the
    // derived selection IS the first sub, so the resolved target is the
    // aligned state.
    armSuppression({
      section: state.location.sectionId,
      sub:
        state.location.subSlug ??
        getSection(state.location.sectionId)?.subs[0]?.slug ??
        null,
    });

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
      // Alignment is skipped, so the page may sit misaligned with the
      // mirror. Leave suppression armed: the derived-intent effect
      // unmutes once the reading line reaches the target, and the
      // backstop unmutes within 1.5s otherwise. Disarming here would
      // let the misaligned reading line fire a stale page-scroll
      // intent back at the phone mid-transition.
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
      // Already at the target: no scroll event will fire. Clear
      // suppression only when the derived selection agrees with the
      // target (a residual can leave it on a neighbor, and disarming
      // then leaks a stale intent). Init/reboot transitions stay
      // armed regardless: the browser may still snap-correct.
      if (origin !== "init") {
        disarmSuppressionIfAligned();
      }
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior =
      origin === "phone" && !reduced ? "smooth" : "auto";

    window.scrollTo({ top: target, behavior });

    // Suppression is NOT cleared here, even for "auto" scrolls that
    // apply scrollY synchronously: the scroll EVENT arrives async, and
    // the aligned position can carry a residual that derives to a
    // neighboring sub. The derived-intent effect disarms once the
    // reading line reaches the target, with the armSuppression
    // backstop as the fallback.
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

  // Handle for the settle timer below, so a second toggle replaces the
  // first rather than disarming early.
  let layoutShiftTimeout: ReturnType<typeof setTimeout> | undefined;

  function suppressLayoutShift(): void {
    // No scroll compensation is applied on purpose. The band pushes the
    // story down by its own height, and the sticky intro (which the
    // reading line is derived from) moves down by exactly the same
    // amount, so the sub at the reading line is unchanged once the
    // reflow settles. Scrolling on top of that would move the selection
    // rather than hold it.
    armSuppression();
    clearTimeout(layoutShiftTimeout);
    layoutShiftTimeout = setTimeout(() => {
      disarmSuppression();
    }, LAYOUT_SHIFT_SETTLE_MS);
  }

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  function destroy(): void {
    clearTimeout(suppressionTimeout);
    clearTimeout(layoutShiftTimeout);
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
    suppressLayoutShift,
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

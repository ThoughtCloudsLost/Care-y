/**
 * Scroll engine: the outer page's view of the shared demo location,
 * presented as a snap slot.
 *
 * The page owns NO location state. activeSection/activeSub are derived
 * from the last bridge snapshot (a mirror of the phone-side location
 * store), so the narrative can only ever show what the store holds.
 * Page inputs (snap settles, clicks, deep links) are intents sent
 * through bridge.setLocation; the page moves when the store echoes the
 * change back, one path for every input.
 *
 * Presentation model: the selection slot sits at a fixed spot (just
 * below the pinned section intro, or below the sticky phone on small
 * screens). The sub list scrolls under it with CSS scroll snapping,
 * so some item is always aligned in the slot; whichever item settles
 * there IS the selection. A helper-tip card is the list's first snap
 * item, so "nothing selected" means the tip occupies the slot.
 * Programmatic moves (clicks, phone interactions, deep links) jump
 * the list instantly; there is no smooth scrolling.
 *
 * DOM-dependent (measures elements, listens to scroll settle).
 */

import { tick } from "svelte";
import {
  parseHash,
  buildHash,
  subElementId,
  loginStageTopics,
  type SectionId,
  type ParsedHash,
} from "./scroll-sections.js";
import type { DemoBridge, DemoBridgeState, DemoTopic } from "./bridge.js";

// -----------------------------------------------------------------------
// Scroll engine state
// -----------------------------------------------------------------------

export interface ScrollEngine {
  /** Currently active section (mirrors the shared location) */
  readonly activeSection: SectionId;
  /** Currently active sub-section slug (null = tip in the slot) */
  readonly activeSub: string | null;
  /** Select a section (top bar, intro click, next-section button) */
  selectSection(id: SectionId): void;
  /** Select a sub-section (TOC or block click) */
  selectSub(sectionId: SectionId, subSlug: string): void;
  /** Mirror a bridge snapshot and present its location transition */
  handleBridgeState(state: DemoBridgeState): void;
  /** Send the deep-link hash as an intent on first load */
  initFromHash(): void;
  /** Re-measure the slot line; returns it (viewport px from the top) */
  remeasure(): number;
  /** Cleanup listeners */
  destroy(): void;
}

// Sticky offsets of the elements the slot sits under (see App.svelte
// and StorySection.svelte CSS).
const STICKY_TOP = 64;
// Breathing room between the pinned intro (or sticky phone) and the
// selection slot.
const SLOT_GAP = 28;
// Settle debounce for browsers without the scrollend event (Safari)
const SETTLE_QUIET_MS = 160;
// An item counts as "in the slot" within this distance of the line;
// mandatory snapping normally lands it exactly on it.
const SLOT_TOLERANCE = 80;

export function createScrollEngine(
  getBridge: () => DemoBridge | undefined,
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

  // -----------------------------------------------------------------------
  // Snap geometry
  // -----------------------------------------------------------------------

  /**
   * The slot line: where snapped items rest. Desktop pins the section
   * intro, so the slot sits under it; small screens pin the phone
   * instead (the intro scrolls away), so the slot sits under that.
   * Computed from offsetHeight so the value is scroll-independent.
   */
  function measureSlotLine(): number {
    const intro = document.querySelector<HTMLElement>(".section-intro");
    if (intro !== null && getComputedStyle(intro).position === "sticky") {
      return STICKY_TOP + intro.offsetHeight + SLOT_GAP;
    }
    const phone = document.querySelector<HTMLElement>(".phone-column");
    if (phone !== null && getComputedStyle(phone).position === "sticky") {
      return STICKY_TOP + phone.offsetHeight + SLOT_GAP;
    }
    return STICKY_TOP + SLOT_GAP;
  }

  /** Publish the slot line as the root scroll-snap padding. */
  function applySlotPadding(): number {
    const line = measureSlotLine();
    document.documentElement.style.scrollPaddingTop = `${String(line)}px`;
    return line;
  }

  /**
   * Which snap item currently occupies the slot. Returns the sub slug,
   * null for the tip card, or undefined when nothing is near the line
   * (mid-gesture or teardown).
   */
  function slotOccupant(line: number): string | null | undefined {
    const items = document.querySelectorAll<HTMLElement>("[data-snap-sub]");
    let best: HTMLElement | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const el of items) {
      const dist = Math.abs(el.getBoundingClientRect().top - line);
      if (dist < bestDist) {
        bestDist = dist;
        best = el;
      }
    }
    if (best === null || bestDist > SLOT_TOLERANCE) return undefined;
    const slug = best.dataset.snapSub ?? "";
    return slug === "" ? null : slug;
  }

  // -----------------------------------------------------------------------
  // Settle detection: the snapped item is the selection
  // -----------------------------------------------------------------------

  function onSettle(): void {
    const line = applySlotPadding();
    const occupant = slotOccupant(line);
    if (occupant === undefined) return;

    if (occupant === activeSub) {
      requestedSub = null;
      return;
    }
    // The location is not page state: a settle sends an intent, and
    // the page's highlight follows when the store echoes it back.
    if (
      requestedSub !== null &&
      requestedSub.section === activeSection &&
      requestedSub.sub === occupant
    ) {
      return;
    }
    requestedSub = { section: activeSection, sub: occupant };
    getBridge()?.setLocation(activeSection, occupant, "page-scroll");
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
    const prev = mirror;
    mirror = state;

    // Only location transitions present; other state changes (topic,
    // stage, search flag) matter to progress tracking, not motion.
    if (state.locationSeq === prev?.locationSeq) return;
    requestedSub = null;

    if (state.origin === "init") {
      // Boot/restart baseline: the page is already positioned.
      return;
    }

    const hash = buildHash(state.location.sectionId, state.location.subSlug);
    // eslint-disable-next-line security/detect-possible-timing-attacks -- URL hash comparison, no secret data
    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }

    if (state.origin === "page-scroll") {
      // The visitor snapped here; the item is already in the slot and
      // the highlight follows via the derived active values.
      return;
    }

    // Click or deep link: jump the list so the selection lands in the
    // slot instantly. Phone interaction: scroll it into the slot so
    // the movement is visible (a section change still swaps the
    // rendered list first through the derived activeSection).
    void alignAfterRender(state.location, state.origin);
  }

  // -----------------------------------------------------------------------
  // Programmatic alignment
  // -----------------------------------------------------------------------

  async function alignAfterRender(
    loc: ParsedHash,
    origin: DemoBridgeState["origin"],
  ): Promise<void> {
    await tick();
    if (activeSection !== loc.sectionId || activeSub !== loc.subSlug) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior =
      origin === "phone" && !reduced ? "smooth" : "auto";

    const line = applySlotPadding();
    if (loc.subSlug === null) {
      // Tip state: the list's natural top puts the tip in the slot
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const el = document.getElementById(
      subElementId(loc.sectionId, loc.subSlug),
    );
    if (el === null) return;
    const top = el.getBoundingClientRect().top + window.scrollY - line;
    window.scrollTo({ top: Math.max(0, top), behavior });
  }

  // -----------------------------------------------------------------------
  // Page inputs: everything is an intent through the bridge
  // -----------------------------------------------------------------------

  function selectSection(id: SectionId): void {
    getBridge()?.setLocation(id, null, "page-click");
  }

  function selectSub(sectionId: SectionId, subSlug: string): void {
    getBridge()?.setLocation(sectionId, subSlug, "page-click");
  }

  function initFromHash(): void {
    const parsed = parseHash(window.location.hash);
    if (parsed === null) return;

    getBridge()?.setLocation(parsed.sectionId, parsed.subSlug, "deep-link");
  }

  function remeasure(): number {
    return applySlotPadding();
  }

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  window.addEventListener("scroll", onScroll, { passive: true });
  if (hasScrollEnd) {
    window.addEventListener("scrollend", onScrollEnd);
  }
  window.addEventListener("resize", remeasure);
  applySlotPadding();

  function destroy(): void {
    window.removeEventListener("scroll", onScroll);
    if (hasScrollEnd) {
      window.removeEventListener("scrollend", onScrollEnd);
    }
    window.removeEventListener("resize", remeasure);
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

<script lang="ts">
  import type { Snippet } from "svelte";
  import { prefersReducedMotion } from "svelte/motion";
  import { X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { SECTIONS, type Section, type SectionId } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";
  import { buildBlocks } from "./story-blocks.js";
  import {
    type FlowBlock,
    type FlowColumn,
    type FlowLayoutResult,
    DEFAULT_METRICS,
    computeFlowLayout,
  } from "./flow-layout.js";
  import {
    type PreparedState,
    prepareBlockHandles,
    createFiller,
    loadFlowFonts,
  } from "./flow-prepare.js";
  import FlowProse from "./FlowProse.svelte";
  import {
    DRAWER_MAX_MEASURE,
    DRAWER_SNAP_CLOSE_W,
  } from "./fullscreen.svelte.js";
  import { READING_LINE_RATIO } from "./flow-geometry.svelte.js";

  // -----------------------------------------------------------------------
  // Props
  // -----------------------------------------------------------------------

  interface Props {
    open: boolean;
    width: number;
    activeSection: SectionId | null;
    activeSub: string | null;
    locale: string;
    seenTopics: ReadonlySet<DemoTopic>;
    /** Prose navigation, the same handlers the page's story uses. */
    onSelectSection: (id: SectionId) => void;
    onSelectSub: (sectionId: SectionId, subSlug: string) => void;
    onClose: () => void;
    /** Reopen from the parked grip: click, drag, or ArrowLeft on it. */
    onOpen: () => void;
    onResize: (width: number) => void;
    /** End of a resize gesture, where the snap-close decision is made. */
    onSettle: () => void;
    /** Called when the drawer's scroll position crosses a sub-heading. */
    onScrollSub: (sectionId: SectionId, subSlug: string) => void;
    topbar?: Snippet;
    strip?: Snippet;
    /**
     * Docked under the strip and above the prose, the same place and the
     * same order the page gives it. In flow, so it pushes the prose down
     * rather than covering it.
     */
    band?: Snippet;
    /**
     * Covers the strip, prose, and footer when present, leaving the
     * docked TopBar (and the control that raised it) in place.
     *
     * A cover rather than a swap: the prose keeps its box, so nothing
     * re-typesets on the way in or out, and the reader comes back to the
     * scroll position and line breaks they left.
     */
    takeover?: Snippet;
    /**
     * Pinned below the prose, outside its scroll. Carries the
     * next-section pill, which has no fixed-position home in fullscreen.
     */
    footer?: Snippet;
  }

  let {
    open,
    width,
    activeSection,
    activeSub,
    locale,
    seenTopics,
    onSelectSection,
    onSelectSub,
    onClose,
    onOpen,
    onResize,
    onSettle,
    onScrollSub,
    topbar,
    strip,
    band,
    takeover,
    footer,
  }: Props = $props();

  // -----------------------------------------------------------------------
  // Entry slide
  //
  // Fullscreen entry engages the override and opens the drawer in one
  // synchronous block, so the aside is created with its open transform
  // already applied. A CSS transition has nothing to run from when the
  // open state is the element's FIRST computed style, which is why the
  // drawer used to appear rather than arrive.
  //
  // Holding the parked transform for a paint gives the transition its
  // starting point, and entry then uses the same slide the grip does
  // instead of a second animation that could drift from it.
  // -----------------------------------------------------------------------

  let entered = $state(false);

  $effect(() => {
    // Nothing to ease into, and a parked frame or two would read as a
    // flicker to exactly the people who asked not to see motion.
    if (prefersReducedMotion.current) {
      entered = true;
      return;
    }

    // Two frames, not one: the first paints the parked transform, the
    // second changes it. Flipping within the first frame would be
    // coalesced into the initial style and land back where we started.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        entered = true;
      });
    });

    return () => {
      cancelAnimationFrame(first);
      if (second !== 0) cancelAnimationFrame(second);
    };
  });

  // -----------------------------------------------------------------------
  // Escape closes
  // -----------------------------------------------------------------------

  $effect(() => {
    if (!open) return;

    function onKeydown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  const activeEntry: Section | null = $derived(
    activeSection !== null
      ? (SECTIONS.find((s) => s.id === activeSection) ?? null)
      : null,
  );

  // Kept as a derived rather than built inline in the markup: a fresh
  // array on every render would re-key the prose's sub-to-topic lookup
  // each pass, for a value that only changes with the section.
  const activeSections: Section[] = $derived(
    activeEntry !== null ? [activeEntry] : [],
  );

  // -----------------------------------------------------------------------
  // Resize handle (pointer-captured drag, rAF-coalesced)
  // -----------------------------------------------------------------------

  /** Pointer travel below this still counts as a click, not a drag. */
  const CLICK_SLOP_PX = 3;

  let resizing = $state(false);
  let resizeRafId = 0;
  let pendingResizeX = 0;
  let gestureStartX = 0;
  let gestureMoved = false;

  function flushResize(): void {
    resizeRafId = 0;
    const next = window.innerWidth - pendingResizeX;

    // A gesture off the parked grip starts at roughly zero width. Hold
    // the drawer back until the drag clears the threshold, so it never
    // appears at a width that releasing would immediately close. Width
    // first, then open: onOpen only restores a default when the stored
    // width is unusable, and by then it is the dragged one.
    if (!open) {
      if (next < DRAWER_SNAP_CLOSE_W) return;
      onResize(next);
      onOpen();
      return;
    }

    // Open, the drag is unconstrained. It may cross below the
    // threshold and come back out; onSettle decides on release.
    onResize(next);
  }

  function onResizePointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    const target = e.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    target.setPointerCapture(e.pointerId);
    resizing = true;
    gestureStartX = e.clientX;
    gestureMoved = false;
  }

  function onResizePointerMove(e: PointerEvent): void {
    if (!resizing) return;
    if (Math.abs(e.clientX - gestureStartX) > CLICK_SLOP_PX) {
      gestureMoved = true;
    }
    pendingResizeX = e.clientX;
    if (resizeRafId === 0) {
      resizeRafId = requestAnimationFrame(flushResize);
    }
  }

  function onResizePointerUp(): void {
    // pointerup, pointercancel and lostpointercapture all land here for
    // one release; only the first should settle.
    if (!resizing) return;
    resizing = false;

    // A pending frame still holds the final pointer position. Apply it
    // rather than dropping it, so the settle judges where the drag
    // actually ended instead of one frame behind.
    if (resizeRafId !== 0) {
      cancelAnimationFrame(resizeRafId);
      flushResize();
    }

    // Still parked once the gesture is over: nothing pulled the drawer
    // past the threshold, so read the release as a tap and open.
    // Deciding here rather than on the click means a tap works however
    // far the finger rolled, which a click-with-slop test would fail.
    if (!open) {
      onOpen();
      return;
    }

    if (gestureMoved) onSettle();
  }

  /**
   * Activation that never went through a pointer gesture: assistive
   * tech firing click on the parked grip's button role. Pointer taps
   * have already opened it by the time this runs, so it no-ops there.
   *
   * The guard stays because pointerup fires click even after a drag,
   * and a gesture that pulled the drawer shut would otherwise land
   * here and immediately reopen it.
   */
  function onResizeClick(): void {
    if (gestureMoved) return;
    if (!open) onOpen();
  }

  function onResizeKeydown(e: KeyboardEvent): void {
    const step = 24;

    // Parked: the grip is an open control, so widening or activating it
    // reopens rather than resizing a drawer nobody can see.
    if (!open) {
      if (e.key === "ArrowLeft" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen();
      }
      return;
    }

    // Each keypress is a complete gesture, so it settles immediately:
    // there is no release to wait for.
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onResize(width + step);
      onSettle();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onResize(width - step);
      onSettle();
    }
  }

  // -----------------------------------------------------------------------
  // Prose layout: blocks for the active section, figures filtered out
  // -----------------------------------------------------------------------

  let contentEl = $state<HTMLDivElement | undefined>(undefined);
  let contentWidth = $state(0);

  // Track content area width via ResizeObserver
  $effect(() => {
    if (contentEl === undefined) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        contentWidth = entry.contentRect.width;
      }
      scheduleProseLayout();
    });
    ro.observe(contentEl);
    return () => ro.disconnect();
  });

  // Derived content width capped at DRAWER_MAX_MEASURE
  const proseWidth: number = $derived(
    Math.min(contentWidth, DRAWER_MAX_MEASURE),
  );

  // Horizontal offset that centres the prose column when the drawer is
  // wider than the measure. Past the cap proseWidth stops changing while
  // this keeps moving, so it is a layout input in its own right.
  const proseOffsetX: number = $derived(
    contentWidth > proseWidth ? Math.floor((contentWidth - proseWidth) / 2) : 0,
  );

  // Build blocks for the active section only, filtering out figures
  let proseBlocks: FlowBlock[] = $derived.by(() => {
    if (activeEntry === null) return [];
    const all = buildBlocks([activeEntry], locale);
    return all.filter((b) => b.kind !== "figure");
  });

  // -----------------------------------------------------------------------
  // Pretext preparation
  // -----------------------------------------------------------------------

  // $state.raw for the same reason FlowStory uses it: the value is
  // swapped wholesale, and runProseLayout compares forBlocks by identity
  // against the proseBlocks derived. A deep proxy would give forBlocks a
  // different identity from the array it wraps.
  let prepared: PreparedState | null = $state.raw(null);

  $effect(() => {
    // Read synchronously BEFORE the await so the effect tracks them.
    const capturedBlocks = proseBlocks;
    const capturedLocale = locale;
    const run = new AbortController();

    async function prepareAfterFonts(): Promise<void> {
      await loadFlowFonts();
      if (run.signal.aborted) return;

      prepared = prepareBlockHandles(capturedBlocks, capturedLocale);
    }

    void prepareAfterFonts();

    return () => {
      run.abort();
    };
  });

  // -----------------------------------------------------------------------
  // Layout computation (rAF-coalesced)
  // -----------------------------------------------------------------------

  let layoutResult: FlowLayoutResult | null = $state.raw(null);
  // The column the current layoutResult was computed against, kept for
  // the same reason FlowStory keeps its own: the decorations clip against
  // the same rectangle the text did, with no one-frame disagreement.
  let layoutColumn: FlowColumn | null = $state.raw(null);
  let layoutRafId = 0;

  function scheduleProseLayout(): void {
    if (layoutRafId !== 0) return;
    layoutRafId = requestAnimationFrame(() => {
      layoutRafId = 0;
      runProseLayout();
    });
  }

  function runProseLayout(): void {
    if (
      prepared?.forBlocks !== proseBlocks ||
      prepared.handles.size === 0 ||
      proseWidth <= 0
    ) {
      layoutResult = null;
      layoutColumn = null;
      return;
    }

    const filler = createFiller(prepared.handles);
    // The centring offset goes into the column, not onto rendered
    // positions: line x then already carries it, and everything measured
    // from the column (the header tint, the heading rules) lands on the
    // prose instead of at the drawer's left edge.
    const column: FlowColumn = { x: proseOffsetX, width: proseWidth };
    layoutResult = computeFlowLayout(
      proseBlocks,
      filler,
      contentWidth,
      null,
      DEFAULT_METRICS,
      column,
    );
    layoutColumn = column;
  }

  // Trigger relayout when inputs change
  $effect(() => {
    void prepared;
    void proseWidth;
    void proseOffsetX;
    scheduleProseLayout();
  });

  // Clean up rAF handles and timers on destroy
  $effect(() => {
    return () => {
      if (layoutRafId !== 0) {
        cancelAnimationFrame(layoutRafId);
        layoutRafId = 0;
      }
      if (resizeRafId !== 0) {
        cancelAnimationFrame(resizeRafId);
        resizeRafId = 0;
      }
      if (scrollRafId !== 0) {
        cancelAnimationFrame(scrollRafId);
        scrollRafId = 0;
      }
      clearTimeout(suppressDrawerTimer);
    };
  });

  // -----------------------------------------------------------------------
  // Scroll-driven sub detection
  //
  // Mirrors the main story's reading-line selection: the first
  // sub-heading whose layout top has not yet scrolled past a reading
  // line within the container is the active sub. The reading line sits
  // at READING_LINE_RATIO of the container's visible height, matching
  // the main engine's viewport fraction.
  // -----------------------------------------------------------------------

  // Tolerance (px) a heading may sit above the reading line and still
  // count as "at" it, absorbing scroll rounding and programmatic-scroll
  // residuals. Same rationale as flow-geometry's BAND_TOLERANCE.
  const DRAWER_BAND_TOLERANCE = 4;

  // Suppression flag: armed during programmatic scrolls (scrollToSub,
  // section change resets) to prevent the scroll listener from emitting
  // a stale onScrollSub while the container is mid-scroll. Mirrors the
  // scroll-engine's suppressSettle pattern without importing its
  // window-scroll machinery.
  let suppressDrawerScroll = false;
  let suppressDrawerTimer: ReturnType<typeof setTimeout> | undefined;

  function armDrawerSuppression(): void {
    suppressDrawerScroll = true;
    clearTimeout(suppressDrawerTimer);
    suppressDrawerTimer = setTimeout(() => {
      suppressDrawerScroll = false;
    }, 300);
  }

  // rAF handle for the scroll handler
  let scrollRafId = 0;

  function handleContentScroll(): void {
    if (scrollRafId !== 0) return;
    scrollRafId = requestAnimationFrame(flushScrollDetection);
  }

  function flushScrollDetection(): void {
    scrollRafId = 0;
    if (suppressDrawerScroll) return;
    if (layoutResult === null || contentEl === undefined) return;
    if (activeSection === null) return;

    const scrollTop = contentEl.scrollTop;
    const readingLine = contentEl.clientHeight * READING_LINE_RATIO;

    // Walk sub-heading blocks and find the one at the reading line.
    // Same rule as locationWithVisibleHeading: the first sub-heading
    // whose top is >= readingLine (in container-scroll space) is the
    // selection; if every heading has scrolled past, the last one wins.
    let lastSlug: string | null = null;
    for (let bi = 0; bi < proseBlocks.length; bi++) {
      const block = proseBlocks.at(bi);
      if (block?.kind !== "sub-heading") continue;
      const geo = layoutResult.blocks.at(bi);
      if (geo === undefined) continue;

      lastSlug = block.subSlug;
      const top = geo.topY - scrollTop;
      if (top >= readingLine - DRAWER_BAND_TOLERANCE) break;
    }

    if (lastSlug !== null && lastSlug !== activeSub) {
      onScrollSub(activeSection, lastSlug);
    }
  }

  // Attach/detach the scroll listener when the content element mounts
  $effect(() => {
    if (contentEl === undefined) return;
    const el = contentEl;
    el.addEventListener("scroll", handleContentScroll, {
      passive: true,
    });
    return () => {
      el.removeEventListener("scroll", handleContentScroll);
      if (scrollRafId !== 0) {
        cancelAnimationFrame(scrollRafId);
        scrollRafId = 0;
      }
    };
  });

  // -----------------------------------------------------------------------
  // Scroll to a specific sub-section (called from App when the strip's
  // onSubClick fires, via the exported scrollToSub method)
  // -----------------------------------------------------------------------

  /**
   * Scroll the drawer's content container so that the given sub-heading
   * block sits at the reading line. Arms suppression so the scroll
   * listener does not re-fire onScrollSub for the programmatic move.
   */
  export function scrollToSub(subSlug: string): void {
    if (layoutResult === null || contentEl === undefined) return;

    const readingLine = contentEl.clientHeight * READING_LINE_RATIO;

    for (let bi = 0; bi < proseBlocks.length; bi++) {
      const block = proseBlocks.at(bi);
      if (block?.kind !== "sub-heading" || block.subSlug !== subSlug) continue;
      const geo = layoutResult.blocks.at(bi);
      if (geo === undefined) continue;

      armDrawerSuppression();
      contentEl.scrollTo({
        top: Math.max(0, geo.topY - readingLine),
        behavior: "auto",
      });
      return;
    }
  }

  // -----------------------------------------------------------------------
  // Reset scroll on section change: when the active section changes,
  // the drawer re-typesets new content. Reset scroll to top without
  // emitting a spurious scroll-driven navigation.
  // -----------------------------------------------------------------------

  let prevSection: SectionId | null = null;

  $effect(() => {
    const section = activeSection;
    if (section === prevSection) return;
    const isInit = prevSection === null;
    prevSection = section;
    if (isInit) return;

    armDrawerSuppression();
    if (contentEl !== undefined) {
      contentEl.scrollTo({ top: 0, behavior: "auto" });
    }
  });

  // Clean up suppression timer on destroy
  $effect(() => {
    return () => {
      clearTimeout(suppressDrawerTimer);
    };
  });
</script>

<aside
  class="handbook-drawer"
  class:handbook-drawer--open={open && entered}
  style="width: {width}px;"
  aria-label={m.demo_fs_drawer_close()}
>
  <!-- Resize handle (left edge) with visible grip affordance. The
       closed drawer parks with this handle still on screen, where it
       doubles as the reopen control. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="drawer-resize-handle"
    role={open ? "separator" : "button"}
    aria-orientation={open ? "vertical" : undefined}
    aria-label={open ? m.demo_fs_drawer_resize() : m.demo_fs_drawer_open()}
    tabindex={0}
    onpointerdown={onResizePointerDown}
    onpointermove={onResizePointerMove}
    onpointerup={onResizePointerUp}
    onpointercancel={onResizePointerUp}
    onlostpointercapture={onResizePointerUp}
    onclick={onResizeClick}
    onkeydown={onResizeKeydown}
  >
    <span class="drawer-grip" aria-hidden="true"></span>
  </div>

  <!-- TopBar docked at the top of the drawer when provided; the drawer
       close button sits inside the same row, over padding the TopBar
       reserves on its right edge -->
  {#if topbar}
    <div class="drawer-topbar-dock">
      {@render topbar()}
      <button
        class="drawer-close-btn drawer-close-btn--docked"
        type="button"
        onclick={onClose}
        aria-label={m.demo_fs_drawer_close()}
      >
        <X size={18} />
      </button>
    </div>
  {/if}

  <!-- Handbook body. The takeover, when present, is layered over this
       whole region rather than replacing it: inert and hidden from
       assistive tech while covered, but still laid out, so the prose
       needs no second pass when it comes back. -->
  <div class="drawer-body">
    <div
      class="drawer-body-stack"
      inert={takeover !== undefined ? true : undefined}
      aria-hidden={takeover !== undefined ? "true" : undefined}
    >
      <!-- Sub-section strip: horizontal nav for the active section's subs -->
      {#if strip}
        <div class="drawer-strip-dock">
          {@render strip()}
        </div>
      {/if}

      <!-- Data flow, docked as a sub bar when the drawer is wide enough
           to seat the swimlane. Same order as the page: under the strip,
           over the prose. -->
      {#if band}
        <div class="drawer-band-dock">
          {@render band()}
        </div>
      {/if}

      <!-- Prose content. The same component the page's story renders,
           handed a narrower column and no frame hole. The rules, the
           header tint, the tip icon, the seen marks and the headings
           that navigate on click all come with it. -->
      <div class="drawer-content" bind:this={contentEl}>
        <FlowProse
          blocks={proseBlocks}
          {layoutResult}
          {layoutColumn}
          layoutHole={null}
          containerWidth={contentWidth}
          {activeSection}
          {activeSub}
          {seenTopics}
          sections={activeSections}
          visibleRange={null}
          {onSelectSection}
          {onSelectSub}
        />
      </div>

      <!-- Pinned below the prose, outside its scroll. The dock carries no
       rule of its own: the footer may render nothing (no next section),
       and an empty bordered bar would read as a mistake. -->
      {#if footer}
        <div class="drawer-footer-dock">
          {@render footer()}
        </div>
      {/if}
    </div>

    {#if takeover}
      <div class="drawer-takeover">
        {@render takeover()}
      </div>
    {/if}
  </div>
</aside>

<style>
  /* Closed, the drawer parks with its 8px resize handle still on screen
     rather than sliding fully away: a quiet rule down the window's right
     edge that reopens on click and pulls the drawer back out on drag.
     The shadow lightens to match, so a parked drawer reads as an edge
     instead of a panel someone forgot to close. */
  .handbook-drawer {
    position: fixed;
    inset: 0 0 0 auto;
    z-index: 120;
    background: var(--paper);
    border-left: 1px solid var(--hair);
    box-shadow: -4px 0 12px color-mix(in srgb, var(--ink) 7%, transparent);
    display: flex;
    flex-direction: column;
    transform: translateX(calc(100% - 8px));
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  .handbook-drawer--open {
    transform: translateX(0);
    box-shadow: -12px 0 32px color-mix(in srgb, var(--ink) 14%, transparent);
  }

  /* A drag can settle the drawer shut from any width, down to nothing,
     and it keeps that width while parked. The floor holds the visible
     strip at the same 8px however narrow it was left: the parked
     transform is relative to the used width, so a floored drawer still
     lands with exactly its handle on screen. */
  .handbook-drawer:not(.handbook-drawer--open) {
    min-width: 8px;
  }

  @media (prefers-reduced-motion: reduce) {
    .handbook-drawer {
      transition: none;
    }
  }

  /* -----------------------------------------------------------------------
     Resize handle
     ----------------------------------------------------------------------- */

  .drawer-resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    width: 8px;
    height: 100%;
    cursor: ew-resize;
    z-index: 1;
    background: transparent;
  }

  .drawer-resize-handle:hover {
    background: color-mix(in srgb, var(--ink) 6%, transparent);
  }

  .drawer-resize-handle:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  /* Vertical grip pill centered in the handle, visible drag affordance */
  .drawer-grip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 40px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--ink) 16%, transparent);
    transition: background 0.15s ease;
    pointer-events: none;
  }

  .drawer-resize-handle:hover .drawer-grip {
    background: color-mix(in srgb, var(--ink) 28%, transparent);
  }

  .drawer-resize-handle:active .drawer-grip {
    background: color-mix(in srgb, var(--ink) 38%, transparent);
  }

  /* Parked: the handle is the only part of the drawer on screen, so it
     takes a hit area wider than its 8px strip (the extra reaches left
     over the app and stays transparent) and a taller grip to be worth
     finding. Click is the advertised way back in, hence the cursor. */
  .handbook-drawer:not(.handbook-drawer--open) .drawer-resize-handle {
    left: -12px;
    width: 20px;
    cursor: pointer;
  }

  /* Pinned to the handle's right edge instead of its centre, so the
     grip stays centred in the 8px that is actually visible. */
  .handbook-drawer:not(.handbook-drawer--open) .drawer-grip {
    left: auto;
    right: 2px;
    height: 56px;
    transform: translateY(-50%);
  }

  @media (prefers-reduced-motion: reduce) {
    .drawer-grip {
      transition: none;
    }
  }

  /* -----------------------------------------------------------------------
     TopBar dock: the TopBar renders here when passed as a snippet.
     Override the TopBar's own sticky positioning so it sits in normal
     flow within the drawer's flex column.
     ----------------------------------------------------------------------- */

  .drawer-topbar-dock {
    position: relative;
    flex-shrink: 0;
    border-bottom: 1px solid var(--hair);
    /* The bar reserves 54px of its row below for the close button. The
       contents panel hangs beneath that button rather than beside it,
       so hand the reservation back (minus the bar's own 1rem gutter)
       and let the panel rest on the drawer's edge like the row does. */
    --contents-panel-inset: -38px;
  }

  .drawer-topbar-dock :global(.top-bar) {
    position: relative;
    top: auto;
    /* Reserve room on the right for the docked close button. */
    padding-right: 54px;
  }

  /* Close button integrated into the docked TopBar row, vertically
     centred in the 56px bar. The bar keeps its z-index: 100 in the dock
     (only position and top are overridden above), so the button needs
     to sit above it or the bar's translucent backdrop paints over it.
     Stays under the popover tier at 110. */
  .drawer-close-btn--docked {
    position: absolute;
    top: 11px;
    right: 0.75rem;
    z-index: 101;
  }

  /* Gone while parked. Clipping the dock alone would still let a sliver
     of the button paint inside the 8px strip at some settled widths, and
     a close button on an already-closed drawer is nothing to preserve.
     Dropping it also takes it out of the parked tab order. */
  .handbook-drawer:not(.handbook-drawer--open) .drawer-close-btn--docked {
    display: none;
  }

  /* -----------------------------------------------------------------------
     Header (fallback when no topbar snippet is provided)
     ----------------------------------------------------------------------- */

  .drawer-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--hair);
    background: var(--raised);
    color: var(--ink-2);
    cursor: pointer;
    flex-shrink: 0;
  }

  .drawer-close-btn:hover {
    background: color-mix(in srgb, var(--ink) 6%, transparent);
  }

  .drawer-close-btn:focus-visible {
    outline: 2px solid var(--demo-accent);
    outline-offset: -2px;
  }

  /* -----------------------------------------------------------------------
     Sub-section strip dock
     ----------------------------------------------------------------------- */

  .drawer-strip-dock {
    flex-shrink: 0;
    padding: 0 1rem;
    border-bottom: 1px solid var(--hair);
  }

  /* -----------------------------------------------------------------------
     Body and takeover
     ----------------------------------------------------------------------- */

  .drawer-body {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .drawer-body-stack {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* The band brings its own bottom rule and background. */
  .drawer-band-dock {
    flex-shrink: 0;
  }

  /* Opaque and edge to edge over the body: the prose underneath is still
     laid out, and must not read through. */
  .drawer-takeover {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--paper);
  }

  /* -----------------------------------------------------------------------
     Prose content
     ----------------------------------------------------------------------- */

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    min-height: 0;
  }

  /* Clipped at every width. The pill inside is nowrap, so its
     min-content width outlives any narrow drawer, and centred overflow
     would put half of it to the LEFT of the drawer box: on screen,
     since the parked drawer's left edge is the window's right edge.
     Nothing in this dock opens a popover, so clipping costs nothing.
     .drawer-content needs no equivalent, its overflow-y: auto already
     forces overflow-x to compute to auto. */
  .drawer-footer-dock {
    flex-shrink: 0;
    overflow: hidden;
  }

  /* The same spill is possible from the two upper docks once the drawer
     is narrower than the top bar's controls. Clipped only while parked:
     open, the topbar dock has to let the contents panel hang out of it.
     Parked, no menu can be open, so there is nothing to preserve. */
  .handbook-drawer:not(.handbook-drawer--open) .drawer-topbar-dock,
  .handbook-drawer:not(.handbook-drawer--open) .drawer-strip-dock {
    overflow: hidden;
  }
</style>

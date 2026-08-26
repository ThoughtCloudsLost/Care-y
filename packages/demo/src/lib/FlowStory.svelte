<script lang="ts">
  import type { Section, SectionId } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";
  import {
    resolveStoryMessage,
    resolveParameterizedMessage,
  } from "./story-messages.js";
  import {
    type FlowBlock,
    type FlowFigureBlock,
    type FlowHole,
    type FlowLayoutResult,
    type FlowColumn,
    type FlowFigureGeometry,
    DEFAULT_METRICS,
    FRAME_PAD_TOP,
    FRAME_PAD_BOTTOM,
    FRAME_PAD_X,
    computeFlowLayout,
    extendHoleForFullBleed,
  } from "./flow-layout.js";
  import {
    type PreparedState,
    prepareBlockHandles,
    createFiller,
    loadFlowFonts,
  } from "./flow-prepare.js";
  import { type PeekFirePayload } from "./clip-registry.js";
  import { buildBlocks } from "./story-blocks.js";
  import { createFigureHysteresis } from "./figure-hysteresis.js";
  import ClipFigure from "./ClipFigure.svelte";
  import FlowProse from "./FlowProse.svelte";
  import {
    setFlowGeometrySource,
    stickyTopOffset,
  } from "./flow-geometry.svelte.js";
  import {
    setColumnContainer,
    setColumnWindowWidth,
    evaluateColumnPressure,
    columnRect,
    restingColumnRect,
  } from "./flow-column.svelte.js";

  // -----------------------------------------------------------------------
  // Props
  // -----------------------------------------------------------------------

  interface Props {
    sections: Section[];
    locale: string;
    activeSection: SectionId;
    activeSub: string | null;
    seenTopics: ReadonlySet<DemoTopic>;
    /** Viewport-space frame box the text wraps around, or null when the
     *  frame is hidden (read mode, no peek): the flow carves no hole. */
    frameRect: {
      left: number;
      top: number;
      outerW: number;
      outerH: number;
    } | null;
    /** Play the fullscreen-exit entrance (see FlowProse). Figures are
     *  the host's own layer and stay out of it. */
    entrance?: boolean;
    onSelectSection: (id: SectionId) => void;
    onSelectSub: (sectionId: SectionId, subSlug: string) => void;
    /** Peek hold completed on a figure. */
    onpeekfire?: (payload: PeekFirePayload) => void;
    /** Drag delta while peek is held. */
    onpeekdrag?: (dx: number, dy: number) => void;
    /** Secondary tap during a held peek. */
    onpeeksecondarytap?: () => void;
    /** Primary pointer released after peek fired. */
    onpeekrelease?: () => void;
    /** Peek gesture cancelled. */
    onpeekcancel?: () => void;
    /** A figure's container element is ready (for engine prewarm). */
    onelement?: (el: HTMLElement) => void;
  }

  let {
    sections,
    locale,
    activeSection,
    activeSub,
    seenTopics,
    frameRect,
    entrance = false,
    onSelectSection,
    onSelectSub,
    onpeekfire,
    onpeekdrag,
    onpeeksecondarytap,
    onpeekrelease,
    onpeekcancel,
    onelement,
  }: Props = $props();

  let blocks = $derived(buildBlocks(sections, locale));

  // -----------------------------------------------------------------------
  // Pretext preparation (font loading + prepare)
  // -----------------------------------------------------------------------

  // $state.raw, not $state: the value is swapped wholesale and never
  // mutated, and runLayout compares forBlocks by identity against the
  // blocks derived. A deep $state proxy would give forBlocks a different
  // identity from the array it wraps, so that check would always fail.
  let prepared: PreparedState | null = $state.raw(null);

  $effect(() => {
    // Read blocks and locale synchronously BEFORE any await so the effect
    // tracks them as dependencies. Without this, the effect would never
    // re-run when the page's blocks change (the reads after await are
    // untracked).
    const capturedBlocks = blocks;
    const capturedLocale = locale;

    // AbortController rather than a captured boolean: the flag is set by
    // the cleanup closure and read after awaits, which the checker cannot
    // follow, so a plain `let cancelled = false` reads as always falsy.
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
  // Container and layout state
  // -----------------------------------------------------------------------

  let containerEl = $state<HTMLDivElement | undefined>(undefined);
  let containerWidth = $state(0);
  // Document-space top and left of the container, scroll-invariant.
  // Measured in the ResizeObserver and on window resize, never per frame.
  let containerTop = $state(0);
  let containerLeft = $state(0);

  // $state.raw: replaced wholesale each pass, and a deep proxy would wrap
  // every line and block geometry object on every layout.
  let layoutResult: FlowLayoutResult | null = $state.raw(null);
  // The hole the current layoutResult was computed against. Kept so the
  // heading rules can be clipped by the same rectangle the text was,
  // instead of recomputing it and risking a one-frame disagreement.
  let layoutHole: FlowHole | null = $state.raw(null);
  // The column rect the current layoutResult was computed against, for
  // the same one-frame-disagreement reason layoutHole exists.
  let layoutColumn: FlowColumn | null = $state.raw(null);

  // Viewport height for reactive virtualization (no window reads in $derived)
  let viewportH = $state(
    typeof window !== "undefined" ? window.innerHeight : 0,
  );

  /** Re-measure the container's document-space position. Called from the
   *  ResizeObserver and window resize, not from the per-frame rAF. */
  function measureContainerPosition(): void {
    if (containerEl === undefined) return;
    const rect = containerEl.getBoundingClientRect();
    containerTop = rect.top + window.scrollY;
    containerLeft = rect.left;
    setColumnContainer(containerWidth, containerLeft);
  }

  $effect(() => {
    function onResize(): void {
      viewportH = window.innerHeight;
      setColumnWindowWidth(window.innerWidth);
      measureContainerPosition();
    }
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  });

  // Track container width and position via ResizeObserver
  $effect(() => {
    if (containerEl === undefined) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth = entry.contentRect.width;
      }
      // measureContainerPosition calls setColumnContainer, so the
      // column module receives the new width and left edge together.
      measureContainerPosition();
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
  });

  // Opening the flow band changes the container's document-space
  // position but not its own size, so neither the ResizeObserver nor
  // the resize listener fires. Re-measure when the chrome height
  // changes (stickyTopOffset tracks it).
  $effect(() => {
    void stickyTopOffset();
    measureContainerPosition();
  });

  // -----------------------------------------------------------------------
  // Hole computation: single helper for both live layout and published closure
  // -----------------------------------------------------------------------

  /**
   * Convert the viewport-fixed frameRect to a padded container-space hole
   * for a given scrollY. Both the live layout path and the published
   * holeAtScrollY closure go through this so they can never drift apart.
   * A hole outside the container is fine: computeSegments handles it.
   *
   * When the frame fills (nearly) the usable viewport height, the hole
   * is stretched to a scroll-invariant vertical span (see
   * extendHoleForFullBleed) so fast scrolls do not re-wrap the flanking
   * columns. The gaps are viewport-space and sy-independent, so callers
   * compute them once per pass and hand them in.
   */
  function rawHoleAt(
    sy: number,
    contTop: number,
    contLeft: number,
    fr: { left: number; top: number; outerW: number; outerH: number },
    cw: number,
    gapAbove: number,
    gapBelow: number,
    col: FlowColumn,
  ): FlowHole {
    // Frame rect is in viewport coordinates. Convert to document space.
    const frameDocTop = fr.top + sy;
    const frameDocLeft = fr.left;

    // Make coordinates relative to the container, then pad.
    // Round to integer px so sub-pixel scroll deltas do not defeat the
    // no-op guard. The frame is viewport-fixed, so only the document
    // translation changes during scroll; rounding collapses those
    // fractional shifts into the same cached value.
    const hole: FlowHole = {
      left: Math.round(frameDocLeft - contLeft - FRAME_PAD_X),
      top: Math.round(frameDocTop - contTop - FRAME_PAD_TOP),
      right: Math.round(frameDocLeft + fr.outerW - contLeft + FRAME_PAD_X),
      bottom: Math.round(frameDocTop + fr.outerH - contTop + FRAME_PAD_BOTTOM),
    };
    return extendHoleForFullBleed(hole, gapAbove, gapBelow, cw, col);
  }

  /**
   * Visible viewport gaps between the padded hole and the usable
   * viewport: below the top chrome, above the window bottom. Inputs to
   * the full-bleed decision in rawHoleAt.
   */
  function frameViewportGaps(
    fr: { top: number; outerH: number },
    vh: number,
    chromeBottom: number,
  ): { above: number; below: number } {
    return {
      above: fr.top - FRAME_PAD_TOP - chromeBottom,
      below: vh - (fr.top + fr.outerH + FRAME_PAD_BOTTOM),
    };
  }

  // Track scroll position for hole computation
  let scrollY = $state(typeof window !== "undefined" ? window.scrollY : 0);

  $effect(() => {
    function onScroll(): void {
      scrollY = window.scrollY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  // Coalesced layout via rAF
  let rafId = 0;

  // Previous-pass inputs for the no-op guard. When these all match the
  // current call, the layout result is already correct and we skip the
  // full recompute. Stored as plain variables (not $state) because they
  // are only read and written inside runLayout, never in reactive deriveds.
  let prevBlocks: readonly FlowBlock[] | null = null;
  let prevContainerWidth = -1;
  let prevHoleLeft = NaN;
  let prevHoleTop = NaN;
  let prevHoleRight = NaN;
  let prevHoleBottom = NaN;
  // Rounded column x and width so tween float churn does not defeat the guard.
  let prevColumnX = NaN;
  let prevColumnW = NaN;

  // Cached no-hole layout. When the padded hole is vertically disjoint
  // from [0, totalHeight] or horizontally outside [0, containerWidth],
  // every line gets an identical full-width segment, so we reuse this
  // single layout rather than re-running computeFlowLayout per frame.
  let noHoleBlocks: readonly FlowBlock[] | null = null;
  let noHoleWidth = -1;
  let noHoleColumnX = NaN;
  let noHoleColumnW = NaN;
  let noHoleResult: FlowLayoutResult | null = null;

  // When the hole does not intersect the flow content, every line gets
  // the same full-width segment. Hoisted out of runLayout to avoid a
  // fresh function allocation per rAF frame.
  function holeIntersectsContent(
    h: FlowHole,
    totalH: number,
    cw: number,
  ): boolean {
    if (h.bottom <= 0 || h.top >= totalH) return false;
    if (h.right <= 0 || h.left >= cw) return false;
    return true;
  }

  function scheduleLayout(): void {
    if (rafId !== 0) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      runLayout();
    });
  }

  function runLayout(): void {
    // Bail when the handles were prepared for a different blocks array.
    // Clearing rather than keeping the old layout is deliberate: the
    // render deriveds pair layoutResult.blocks with blocks by index, so a
    // layout from a different blocks array has no safe reading. Font prep
    // resolves within a frame or two once the fonts are cached, and both
    // locale and section changes remount this component anyway.
    if (
      prepared?.forBlocks !== blocks ||
      prepared.handles.size === 0 ||
      containerWidth <= 0
    ) {
      layoutResult = null;
      layoutHole = null;
      layoutColumn = null;
      setFlowGeometrySource(null);
      prevBlocks = null;
      return;
    }

    // Container position is measured in the ResizeObserver and on window
    // resize, not here. That avoids a forced reflow per rAF frame.

    // Compute the hole before the no-op check so we can compare against
    // the previous pass's hole edges. A hidden frame (null rect) carves
    // no hole, so the candidate is null and the no-hole paths below apply.
    const gaps =
      frameRect === null
        ? null
        : frameViewportGaps(frameRect, viewportH, stickyTopOffset());
    // Read the animated column rect once per pass. Round x to integer px
    // so tween float churn does not defeat the no-op guard.
    const col = columnRect();
    const candidateHole =
      frameRect === null || gaps === null
        ? null
        : rawHoleAt(
            window.scrollY,
            containerTop,
            containerLeft,
            frameRect,
            containerWidth,
            gaps.above,
            gaps.below,
            col,
          );

    // Evaluate slot pressure immediately after the hole is known but
    // before any guard/cache branch. runLayout executes in a rAF callback
    // (outside effect tracking), so the slot write cannot create a
    // tracked effect loop.
    evaluateColumnPressure(candidateHole);

    const roundedColX = Math.round(col.x);
    const roundedColW = Math.round(col.width);

    // Skip recompute when every layout input matches the previous pass.
    // Integer rounding in rawHoleAt collapses sub-pixel scroll deltas.
    // When the previous pass used the no-hole cache (prevHoleLeft is NaN),
    // check whether the candidate is STILL disjoint from the cached
    // totalHeight so consecutive no-hole frames skip without comparing
    // the moving hole edges.
    const prevWasNoHole = Number.isNaN(prevHoleLeft);
    if (
      prevBlocks === blocks &&
      prevContainerWidth === containerWidth &&
      prevColumnX === roundedColX &&
      prevColumnW === roundedColW
    ) {
      if (prevWasNoHole) {
        // Previous layout was hole-independent. Stay on that path if
        // there is still no hole, or it is still disjoint from the content.
        if (
          noHoleResult !== null &&
          (candidateHole === null ||
            candidateHole.bottom <= 0 ||
            candidateHole.top >= noHoleResult.totalHeight ||
            candidateHole.right <= 0 ||
            candidateHole.left >= containerWidth)
        ) {
          return;
        }
      } else if (
        candidateHole !== null &&
        prevHoleLeft === candidateHole.left &&
        prevHoleTop === candidateHole.top &&
        prevHoleRight === candidateHole.right &&
        prevHoleBottom === candidateHole.bottom
      ) {
        return;
      }
    }

    const filler = createFiller(prepared.handles);

    // Try the no-hole cache first. If blocks and width match, run a
    // no-hole layout once, then check the hole against its totalHeight.
    // The no-hole cache also keys on the column rect: a slot flip changes
    // where text wraps even without a hole.
    let result: FlowLayoutResult;
    let hole: FlowHole | null;

    if (
      noHoleBlocks === blocks &&
      noHoleWidth === containerWidth &&
      noHoleColumnX === roundedColX &&
      noHoleColumnW === roundedColW &&
      noHoleResult !== null
    ) {
      // Re-use the cached no-hole layout when there is no hole or it
      // is disjoint from the content.
      if (
        candidateHole === null ||
        !holeIntersectsContent(
          candidateHole,
          noHoleResult.totalHeight,
          containerWidth,
        )
      ) {
        result = noHoleResult;
        hole = null;
      } else {
        hole = candidateHole;
        result = computeFlowLayout(
          blocks,
          filler,
          containerWidth,
          hole,
          DEFAULT_METRICS,
          col,
        );
      }
    } else {
      // First pass with these blocks/width/column: compute no-hole layout
      const noHole = computeFlowLayout(
        blocks,
        filler,
        containerWidth,
        null,
        DEFAULT_METRICS,
        col,
      );
      noHoleBlocks = blocks;
      noHoleWidth = containerWidth;
      noHoleColumnX = roundedColX;
      noHoleColumnW = roundedColW;
      noHoleResult = noHole;

      if (
        candidateHole === null ||
        !holeIntersectsContent(
          candidateHole,
          noHole.totalHeight,
          containerWidth,
        )
      ) {
        result = noHole;
        hole = null;
      } else {
        hole = candidateHole;
        result = computeFlowLayout(
          blocks,
          filler,
          containerWidth,
          hole,
          DEFAULT_METRICS,
          col,
        );
      }
    }

    layoutResult = result;
    layoutHole = hole;
    layoutColumn = col;

    // Record inputs so the next frame can skip if nothing changed.
    prevBlocks = blocks;
    prevContainerWidth = containerWidth;
    prevHoleLeft = hole?.left ?? NaN;
    prevHoleTop = hole?.top ?? NaN;
    prevHoleRight = hole?.right ?? NaN;
    prevHoleBottom = hole?.bottom ?? NaN;
    prevColumnX = roundedColX;
    prevColumnW = roundedColW;

    // Publish geometry for cross-module consumption.
    // Capture per-pass values so closures stay self-consistent.
    // The resting column rect (not the mid-flight tween value) is used
    // inside layoutForHole so the fixed-point loop converges against
    // settled geometry.
    const passContainerTop = containerTop;
    const passContainerLeft = containerLeft;
    const passContainerWidth = containerWidth;
    const passColumn = restingColumnRect();
    const passFrameRect =
      frameRect === null
        ? null
        : {
            left: frameRect.left,
            top: frameRect.top,
            outerW: frameRect.outerW,
            outerH: frameRect.outerH,
          };
    const passBlocks = blocks;
    const passFiller = filler;
    const passGapAbove = gaps?.above ?? 0;
    const passGapBelow = gaps?.below ?? 0;

    setFlowGeometrySource({
      layoutResult: result,
      blocks: passBlocks,
      containerTop: passContainerTop,
      holeAtScrollY(sy: number): FlowHole | null {
        if (passFrameRect === null) return null;
        return rawHoleAt(
          sy,
          passContainerTop,
          passContainerLeft,
          passFrameRect,
          passContainerWidth,
          passGapAbove,
          passGapBelow,
          passColumn,
        );
      },
      layoutForHole(h: FlowHole | null): FlowLayoutResult {
        // Pure layout call: pressure must never be evaluated here.
        return computeFlowLayout(
          passBlocks,
          passFiller,
          passContainerWidth,
          h,
          DEFAULT_METRICS,
          passColumn,
        );
      },
    });
  }

  // Re-layout when dependencies change
  $effect(() => {
    // Read all reactive dependencies that should trigger relayout
    void prepared;
    void containerWidth;
    void containerTop;
    void containerLeft;
    void frameRect?.left;
    void frameRect?.top;
    void frameRect?.outerW;
    void frameRect?.outerH;
    void scrollY;
    // Full-bleed detection reads the viewport height and chrome bottom.
    void viewportH;
    void stickyTopOffset();
    // The animated column x schedules passes during a slot flip
    // animation so the text tracks the tweening column position.
    void columnRect().x;

    scheduleLayout();
  });

  // Clean up on destroy
  $effect(() => {
    return () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      setFlowGeometrySource(null);
    };
  });

  // -----------------------------------------------------------------------
  // Virtualization: only render blocks in viewport + buffer
  // -----------------------------------------------------------------------

  function isBlockVisible(
    blockGeo: { topY: number; bottomY: number },
    containerDocTop: number,
    viewportTop: number,
    viewportBottom: number,
    buffer: number,
  ): boolean {
    const blockDocTop = containerDocTop + blockGeo.topY;
    const blockDocBottom = containerDocTop + blockGeo.bottomY;
    return (
      blockDocBottom >= viewportTop - buffer &&
      blockDocTop <= viewportBottom + buffer
    );
  }

  /**
   * The band of prose worth rendering, in container space, one viewport
   * of buffer either side of the visible window. Reads only reactive
   * $state/$derived values, never window.* or getBoundingClientRect().
   *
   * Container space rather than document space because that is what the
   * renderer positions in: subtracting containerTop here means it never
   * needs to know where in the document it sits, or that it sits in a
   * document at all.
   */
  let proseRange: { top: number; bottom: number } = $derived({
    top: scrollY - containerTop - viewportH,
    bottom: scrollY - containerTop + viewportH * 2,
  });

  // -----------------------------------------------------------------------
  // Visible figures: virtualized from the layout's figures array
  // -----------------------------------------------------------------------

  interface VisibleFigure {
    blockIndex: number;
    block: FlowFigureBlock;
    geo: FlowFigureGeometry;
    /** Block geometry from the blocks array, for fade calculation. */
    blockGeo: { topY: number; bottomY: number };
  }

  // Asymmetric enter/leave margins prevent a figure oscillating across
  // the boundary from unmounting and remounting ClipFigure (which
  // destroys its video element and IntersectionObserver). Enter at 1
  // viewport; leave only after 1.5 viewports of distance.
  const FIGURE_ENTER_BUFFER_RATIO = 1;
  const FIGURE_LEAVE_BUFFER_RATIO = 1.5;

  // Track which block indices are currently mounted, so the wider leave
  // margin can keep them alive after they would have failed the enter
  // test. The tracker is scratch memory updated inside the $derived.by
  // and read only there, so it lives outside component state.
  const figureHysteresis = createFigureHysteresis();

  let visibleFigures: VisibleFigure[] = $derived.by(() => {
    if (layoutResult === null) return [];
    if (layoutResult.blocks.length !== blocks.length) return [];

    const vpTop = scrollY;
    const vpBottom = vpTop + viewportH;
    const enterBuffer = viewportH * FIGURE_ENTER_BUFFER_RATIO;
    const leaveBuffer = viewportH * FIGURE_LEAVE_BUFFER_RATIO;

    const result: VisibleFigure[] = [];
    for (const fig of layoutResult.figures) {
      const blockGeo = layoutResult.blocks.at(fig.blockIndex);
      const block = blocks.at(fig.blockIndex);
      if (blockGeo === undefined || block === undefined) continue;
      if (block.kind !== "figure") continue;

      const wasMounted = figureHysteresis.wasMounted(fig.blockIndex);
      const buffer = wasMounted ? leaveBuffer : enterBuffer;
      if (!isBlockVisible(blockGeo, containerTop, vpTop, vpBottom, buffer)) {
        continue;
      }
      figureHysteresis.keep(fig.blockIndex);
      result.push({
        blockIndex: fig.blockIndex,
        block,
        geo: fig,
        blockGeo,
      });
    }
    figureHysteresis.commit();
    return result;
  });
</script>

<FlowProse
  {blocks}
  {layoutResult}
  {layoutColumn}
  {layoutHole}
  {containerWidth}
  {activeSection}
  {activeSub}
  {seenTopics}
  {sections}
  visibleRange={proseRange}
  {entrance}
  {onSelectSection}
  {onSelectSub}
  oncontainer={(el: HTMLDivElement) => {
    containerEl = el;
  }}
>
  <!-- Figures are the page's alone: the drawer has the live app behind
       it and needs no clip of the same screens. They render here rather
       than inside FlowProse so their peek handlers stay with the host
       that owns them. -->
  {#snippet figures()}
    {#each visibleFigures as vf (vf.block.id)}
      <div
        class="flow-figure"
        style:left="{vf.geo.x}px"
        style:top="{vf.geo.y}px"
        style:width="{vf.geo.width}px"
        style:height="{vf.geo.height}px"
      >
        <ClipFigure
          sectionId={vf.block.sectionId}
          subSlug={vf.block.subSlug ?? ""}
          width={vf.geo.width}
          height={vf.geo.height}
          ariaLabel={resolveParameterizedMessage(
            "demo_figure_aria_label",
            {
              sub: resolveStoryMessage(vf.block.headingKey, locale),
            },
            locale,
          )}
          {onpeekfire}
          {onpeekdrag}
          {onpeeksecondarytap}
          {onpeekrelease}
          {onpeekcancel}
          {onelement}
        />
      </div>
    {/each}
  {/snippet}
</FlowProse>

<style>
  /* Inline clip figures. Declared here rather than in FlowProse because
     the snippet above is compiled into this component, so this is the
     scope its class resolves in. */
  .flow-figure {
    position: absolute;
    pointer-events: auto;
    transition: opacity 0.2s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .flow-figure {
      transition: none;
    }
  }
</style>

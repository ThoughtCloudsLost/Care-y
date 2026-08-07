<script module lang="ts">
  // Module-level: survives remounts (App.svelte keys this component on
  // locale + pageKey, so instance state is lost every section change).
  // pretext's locale is global, so we track what we last set it to here
  // to avoid redundant setLocale() calls that flush its measurement cache.
  let lastAppliedLocale: string | null = null;
</script>

<script lang="ts">
  import { SvelteMap } from "svelte/reactivity";
  import { Check } from "@lucide/svelte";
  import {
    prepareWithSegments,
    layoutNextLineRange,
    materializeLineRange,
    setLocale,
    type PreparedTextWithSegments,
    type LayoutCursor,
  } from "@chenglou/pretext";
  import type { Section, SectionId } from "./scroll-sections.js";
  import { getSection } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";
  import {
    resolveStoryMessage,
    resolveParameterizedMessage,
  } from "./story-messages.js";
  import {
    type FlowBlock,
    type FlowTextBlock,
    type FlowFigureBlock,
    type FlowTextKind,
    type FlowHole,
    type FlowLayoutResult,
    type FlowFigureGeometry,
    type FlowLine,
    type LineFiller,
    type LineFillerResult,
    type LineCursor,
    DEFAULT_METRICS,
    FRAME_PAD_TOP,
    FRAME_PAD_BOTTOM,
    FRAME_PAD_X,
    computeFlowLayout,
    computeLineSegments,
    hitTestBlock,
  } from "./flow-layout.js";
  import { hasClip, getClip, type PeekFirePayload } from "./clip-registry.js";
  import { createFigureHysteresis } from "./figure-hysteresis.js";
  import ClipFigure from "./ClipFigure.svelte";
  import {
    setFlowGeometrySource,
    readingLineY,
    stickyTopOffset,
  } from "./flow-geometry.svelte.js";

  // -----------------------------------------------------------------------
  // Props
  // -----------------------------------------------------------------------

  interface Props {
    sections: Section[];
    locale: string;
    activeSection: SectionId;
    activeSub: string | null;
    seenTopics: ReadonlySet<DemoTopic>;
    frameRect: {
      left: number;
      top: number;
      outerW: number;
      outerH: number;
    };
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
    onSelectSection,
    onSelectSub,
    onpeekfire,
    onpeekdrag,
    onpeeksecondarytap,
    onpeekrelease,
    onpeekcancel,
    onelement,
  }: Props = $props();

  // -----------------------------------------------------------------------
  // Font strings for canvas measurement and CSS rendering.
  // These MUST match exactly between prepare() calls and rendered spans.
  // -----------------------------------------------------------------------

  const FONT_FAMILY = '"Atkinson Hyperlegible Next"';

  const FONT_STRINGS: Record<FlowTextKind, string> = {
    "section-title": `700 24px ${FONT_FAMILY}`,
    "section-desc": `400 15px ${FONT_FAMILY}`,
    "sub-heading": `700 18px ${FONT_FAMILY}`,
    "sub-body": `400 15px ${FONT_FAMILY}`,
  };

  // Font and line-height are now in the per-kind CSS classes
  // (flow-line--title, flow-line--desc, etc.) rather than in inline
  // style strings. Only position and width vary per line per frame.

  // -----------------------------------------------------------------------
  // Block list derivation
  // -----------------------------------------------------------------------

  function buildBlocks(sects: Section[], loc: string): FlowBlock[] {
    const result: FlowBlock[] = [];
    for (const section of sects) {
      // Handbook-style numbering. Single-sub sections (the entry page,
      // the coming-soon placeholder) read as a lone statement, not as
      // step one of one, so they stay unnumbered.
      const numbered = section.subs.length > 1;
      for (let si = 0; si < section.subs.length; si++) {
        const sub = section.subs.at(si);
        if (sub === undefined) continue;
        const headingText = resolveStoryMessage(sub.headingKey, loc);
        result.push({
          id: `${section.id}--${sub.slug}--heading`,
          sectionId: section.id,
          subSlug: sub.slug,
          kind: "sub-heading",
          text: numbered ? `${String(si + 1)}. ${headingText}` : headingText,
        } satisfies FlowTextBlock);
        result.push({
          id: `${section.id}--${sub.slug}--body`,
          sectionId: section.id,
          subSlug: sub.slug,
          kind: "sub-body",
          text: resolveStoryMessage(sub.bodyKey, loc),
        } satisfies FlowTextBlock);

        // Append a figure block when a clip exists for this sub.
        if (hasClip(section.id, sub.slug)) {
          const clip = getClip(section.id, sub.slug);
          result.push({
            id: `${section.id}--${sub.slug}--figure`,
            sectionId: section.id,
            subSlug: sub.slug,
            kind: "figure",
            aspectRatio: clip.aspectRatio,
          } satisfies FlowFigureBlock);
        }
      }
    }
    return result;
  }

  let blocks = $derived(buildBlocks(sections, locale));

  // -----------------------------------------------------------------------
  // Pretext preparation (font loading + prepare)
  // -----------------------------------------------------------------------

  interface PreparedState {
    forBlocks: readonly FlowBlock[];
    handles: SvelteMap<number, PreparedTextWithSegments>;
  }

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

    /** Measure every block with the faces available right now. */
    function prepareBlocks(): void {
      // Only call setLocale when the locale actually changed. setLocale
      // flushes pretext's global two-level measurement cache, forcing a
      // full Canvas re-measure of every segment. The check uses module-
      // level state because this component remounts on every section
      // change, but pretext's locale is process-global.
      if (capturedLocale !== lastAppliedLocale) {
        setLocale(capturedLocale);
        lastAppliedLocale = capturedLocale;
      }

      const handles = new SvelteMap<number, PreparedTextWithSegments>();
      for (let i = 0; i < capturedBlocks.length; i++) {
        const block = capturedBlocks.at(i);
        if (block === undefined) continue;
        // Figure blocks have no text to measure.
        if (block.kind === "figure") continue;
        const fontStr = FONT_STRINGS[block.kind];
        handles.set(i, prepareWithSegments(block.text, fontStr));
      }
      prepared = { forBlocks: capturedBlocks, handles };
    }

    async function prepareAfterFonts(): Promise<void> {
      // allSettled because the font set includes the client app's
      // absolute-URL @font-face declarations, which do not resolve under
      // the demo's serving root. load() rejects when ANY matched face
      // fails, even though the hashed faces we actually render with load
      // fine. allSettled lets those settle as rejected without blocking.
      const fontLoadPromises = Object.values(FONT_STRINGS).map(async (f) =>
        document.fonts.load(f),
      );
      await Promise.allSettled(fontLoadPromises);
      if (run.signal.aborted) return;

      prepareBlocks();
    }

    void prepareAfterFonts();

    return () => {
      run.abort();
    };
  });

  // -----------------------------------------------------------------------
  // LineFiller implementation backed by pretext
  // -----------------------------------------------------------------------

  /** Runtime check that a LineCursor has the LayoutCursor shape. */
  function isLayoutCursor(c: LineCursor): c is LayoutCursor {
    if (typeof c !== "object" || c === null) return false;
    return (
      "segmentIndex" in c &&
      typeof c.segmentIndex === "number" &&
      "graphemeIndex" in c &&
      typeof c.graphemeIndex === "number"
    );
  }

  function createFiller(
    handles: ReadonlyMap<number, PreparedTextWithSegments>,
  ): LineFiller {
    return {
      startCursor(_blockIndex: number): LineCursor {
        return { segmentIndex: 0, graphemeIndex: 0 } satisfies LayoutCursor;
      },
      fillLine(
        blockIndex: number,
        cursor: LineCursor,
        maxWidth: number,
      ): LineFillerResult | null {
        const handle = handles.get(blockIndex);
        if (handle === undefined) return null;

        if (!isLayoutCursor(cursor)) return null;
        const range = layoutNextLineRange(handle, cursor, maxWidth);
        if (range === null) return null;

        const materialized = materializeLineRange(handle, range);
        return {
          text: materialized.text,
          width: materialized.width,
          nextCursor: range.end,
        };
      },
    };
  }

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
  }

  $effect(() => {
    function onResize(): void {
      viewportH = window.innerHeight;
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
   */
  function rawHoleAt(
    sy: number,
    contTop: number,
    contLeft: number,
    fr: { left: number; top: number; outerW: number; outerH: number },
  ): FlowHole {
    // Frame rect is in viewport coordinates. Convert to document space.
    const frameDocTop = fr.top + sy;
    const frameDocLeft = fr.left;

    // Make coordinates relative to the container, then pad.
    // Round to integer px so sub-pixel scroll deltas do not defeat the
    // no-op guard. The frame is viewport-fixed, so only the document
    // translation changes during scroll; rounding collapses those
    // fractional shifts into the same cached value.
    return {
      left: Math.round(frameDocLeft - contLeft - FRAME_PAD_X),
      top: Math.round(frameDocTop - contTop - FRAME_PAD_TOP),
      right: Math.round(frameDocLeft + fr.outerW - contLeft + FRAME_PAD_X),
      bottom: Math.round(frameDocTop + fr.outerH - contTop + FRAME_PAD_BOTTOM),
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

  // Cached no-hole layout. When the padded hole is vertically disjoint
  // from [0, totalHeight] or horizontally outside [0, containerWidth],
  // every line gets an identical full-width segment, so we reuse this
  // single layout rather than re-running computeFlowLayout per frame.
  let noHoleBlocks: readonly FlowBlock[] | null = null;
  let noHoleWidth = -1;
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
      setFlowGeometrySource(null);
      prevBlocks = null;
      return;
    }

    // Container position is measured in the ResizeObserver and on window
    // resize, not here. That avoids a forced reflow per rAF frame.

    // Compute the hole before the no-op check so we can compare against
    // the previous pass's hole edges.
    const candidateHole = rawHoleAt(
      window.scrollY,
      containerTop,
      containerLeft,
      frameRect,
    );

    // Skip recompute when every layout input matches the previous pass.
    // Integer rounding in rawHoleAt collapses sub-pixel scroll deltas.
    // When the previous pass used the no-hole cache (prevHoleLeft is NaN),
    // check whether the candidate is STILL disjoint from the cached
    // totalHeight so consecutive no-hole frames skip without comparing
    // the moving hole edges.
    const prevWasNoHole = Number.isNaN(prevHoleLeft);
    if (prevBlocks === blocks && prevContainerWidth === containerWidth) {
      if (prevWasNoHole) {
        // Previous layout was hole-independent. Stay on that path if
        // the hole is still disjoint from the content.
        if (
          noHoleResult !== null &&
          (candidateHole.bottom <= 0 ||
            candidateHole.top >= noHoleResult.totalHeight ||
            candidateHole.right <= 0 ||
            candidateHole.left >= containerWidth)
        ) {
          return;
        }
      } else if (
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
    let result: FlowLayoutResult;
    let hole: FlowHole | null;

    if (
      noHoleBlocks === blocks &&
      noHoleWidth === containerWidth &&
      noHoleResult !== null
    ) {
      // Re-use the cached no-hole layout when the hole is disjoint
      if (
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
        );
      }
    } else {
      // First pass with these blocks/width: compute no-hole layout
      const noHole = computeFlowLayout(
        blocks,
        filler,
        containerWidth,
        null,
        DEFAULT_METRICS,
      );
      noHoleBlocks = blocks;
      noHoleWidth = containerWidth;
      noHoleResult = noHole;

      if (
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
        );
      }
    }

    layoutResult = result;
    layoutHole = hole;

    // Record inputs so the next frame can skip if nothing changed.
    prevBlocks = blocks;
    prevContainerWidth = containerWidth;
    prevHoleLeft = hole?.left ?? NaN;
    prevHoleTop = hole?.top ?? NaN;
    prevHoleRight = hole?.right ?? NaN;
    prevHoleBottom = hole?.bottom ?? NaN;

    // Publish geometry for cross-module consumption.
    // Capture per-pass values so closures stay self-consistent.
    const passContainerTop = containerTop;
    const passContainerLeft = containerLeft;
    const passContainerWidth = containerWidth;
    const passFrameRect = {
      left: frameRect.left,
      top: frameRect.top,
      outerW: frameRect.outerW,
      outerH: frameRect.outerH,
    };
    const passBlocks = blocks;
    const passFiller = filler;

    setFlowGeometrySource({
      layoutResult: result,
      blocks: passBlocks,
      containerTop: passContainerTop,
      holeAtScrollY(sy: number): FlowHole | null {
        return rawHoleAt(
          sy,
          passContainerTop,
          passContainerLeft,
          passFrameRect,
        );
      },
      layoutForHole(h: FlowHole | null): FlowLayoutResult {
        return computeFlowLayout(
          passBlocks,
          passFiller,
          passContainerWidth,
          h,
          DEFAULT_METRICS,
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
    void frameRect.left;
    void frameRect.top;
    void frameRect.outerW;
    void frameRect.outerH;
    void scrollY;

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

  interface VisibleBlock {
    blockIndex: number;
    block: FlowTextBlock;
    geo: {
      topY: number;
      bottomY: number;
      firstLineIndex: number;
      lineCount: number;
    };
    /** This block's own lines, resolved once so the markup iterates a
     *  concrete list instead of indexing into the shared line array. */
    lines: FlowLine[];
  }

  // Reactive virtualization: reads only reactive $state/$derived values,
  // never window.* or getBoundingClientRect() directly.
  let visibleBlocks: VisibleBlock[] = $derived.by(() => {
    if (layoutResult === null) return [];
    // Layout geometry pairs with blocks by index, so a length mismatch
    // means this layout belongs to a different blocks array and cannot be
    // read safely. Rendering must never throw: a throw aborts the flush
    // and freezes the DOM while the rAF loop keeps computing.
    if (layoutResult.blocks.length !== blocks.length) return [];

    const vpTop = scrollY;
    const vpBottom = vpTop + viewportH;
    const buffer = viewportH;

    const result: VisibleBlock[] = [];
    for (let bi = 0; bi < layoutResult.blocks.length; bi++) {
      const geo = layoutResult.blocks.at(bi);
      const block = blocks.at(bi);
      if (geo === undefined || block === undefined) continue;
      // Figure blocks are rendered from the figures array, not here.
      if (block.kind === "figure") continue;
      if (!isBlockVisible(geo, containerTop, vpTop, vpBottom, buffer)) continue;

      const lines: FlowLine[] = [];
      const end = geo.firstLineIndex + geo.lineCount;
      for (let li = geo.firstLineIndex; li < end; li++) {
        const line = layoutResult.lines.at(li);
        if (line !== undefined) lines.push(line);
      }
      // The figure guard above narrows block to FlowTextBlock.
      result.push({
        blockIndex: bi,
        block,
        geo,
        lines,
      });
    }
    return result;
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

  // -----------------------------------------------------------------------
  // Active sub highlight geometry
  // -----------------------------------------------------------------------

  interface HighlightRect {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const HIGHLIGHT_PAD_X = 8;
  const HIGHLIGHT_PAD_Y = 2;

  let highlightRects: HighlightRect[] = $derived.by(() => {
    if (layoutResult === null || activeSub === null) return [];
    if (layoutResult.blocks.length !== blocks.length) return [];

    const rects: HighlightRect[] = [];
    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks.at(bi);
      if (block === undefined) continue;
      if (block.sectionId !== activeSection || block.subSlug !== activeSub) {
        continue;
      }

      const geo = layoutResult.blocks.at(bi);
      if (geo === undefined || geo.lineCount === 0) continue;

      const km = DEFAULT_METRICS[block.kind];

      for (
        let li = geo.firstLineIndex;
        li < geo.firstLineIndex + geo.lineCount;
        li++
      ) {
        const line = layoutResult.lines.at(li);
        if (line === undefined) continue;
        rects.push({
          x: line.x - HIGHLIGHT_PAD_X,
          y: line.y - HIGHLIGHT_PAD_Y,
          width: line.width + HIGHLIGHT_PAD_X * 2,
          height: km.lineHeight + HIGHLIGHT_PAD_Y * 2,
        });
      }
    }
    return rects;
  });

  // -----------------------------------------------------------------------
  // Seen-topic check marks: positioned at the left of each seen sub's
  // heading first line.
  // -----------------------------------------------------------------------

  interface SeenMark {
    x: number;
    y: number;
    blockIndex: number;
  }

  // Pre-built lookup so seenMarks avoids O(n) array scans per heading
  // block on every layout pass. Keyed by "sectionId--subSlug", maps to
  // the sub's DemoTopic (null-topic subs are excluded).
  let subTopicLookup: ReadonlyMap<string, DemoTopic> = $derived.by(() => {
    const map = new SvelteMap<string, DemoTopic>();
    for (const section of sections) {
      for (const sub of section.subs) {
        if (sub.topic !== null) {
          map.set(`${section.id}--${sub.slug}`, sub.topic);
        }
      }
    }
    return map;
  });

  let seenMarks: SeenMark[] = $derived.by(() => {
    if (layoutResult === null) return [];
    if (layoutResult.blocks.length !== blocks.length) return [];

    const marks: SeenMark[] = [];
    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks.at(bi);
      if (block?.kind !== "sub-heading") continue;

      const topic = subTopicLookup.get(
        `${block.sectionId}--${block.subSlug ?? ""}`,
      );
      if (topic === undefined) continue;
      if (!seenTopics.has(topic)) continue;

      const geo = layoutResult.blocks.at(bi);
      if (geo === undefined || geo.lineCount === 0) continue;

      const firstLine = layoutResult.lines.at(geo.firstLineIndex);
      if (firstLine === undefined) continue;
      marks.push({
        x: firstLine.x - 20,
        y: firstLine.y + 2,
        blockIndex: bi,
      });
    }
    return marks;
  });

  // -----------------------------------------------------------------------
  // Focus fade
  //
  // Blocks dim with distance from the reading line, bottoming out at
  // FADE_FLOOR, so whatever sits at the line reads as the focal point.
  // Restored from the pre-flow-layout story, which applied the same
  // gradient to its snap items; the constants are carried over verbatim
  // so the feel is unchanged.
  //
  // Applied per block rather than per line: a gradient within a single
  // paragraph would read as a rendering fault, not as focus.
  // -----------------------------------------------------------------------

  const FADE_DISTANCE = 600;
  const FADE_FLOOR = 0.35;

  /** Reading line in viewport space. Derived from viewportH and scrollY
   *  so it tracks the same inputs the layout does. */
  let readingLine: number = $derived.by(() => {
    // Read reactive deps so Svelte tracks them
    void viewportH;
    void scrollY;
    return readingLineY();
  });

  /** Number of discrete opacity steps. 20 steps gives 5% increments,
   *  which the 0.2s CSS transition smooths between. Most scroll frames
   *  land on the same step, so no style write occurs. */
  const FADE_STEPS = 20;

  function fadeFor(blockTopY: number, blockBottomY: number): number {
    if (readingLine <= 0) return 1;
    // Block position in viewport space. containerTop is document space,
    // so subtracting scrollY brings it back to the viewport the reading
    // line is measured in.
    const midDocY = containerTop + (blockTopY + blockBottomY) / 2;
    const dist = Math.abs(midDocY - scrollY - readingLine);
    const fade = Math.min(1, dist / FADE_DISTANCE);
    const continuous = 1 - fade * (1 - FADE_FLOOR);
    return Math.round(continuous * FADE_STEPS) / FADE_STEPS;
  }

  // -----------------------------------------------------------------------
  // Heading rules
  //
  // A hairline under each sub heading, drawn through the same segment
  // function the text uses. When the frame overlaps the rule's row the
  // segments come back split, so the rule renders as two short strokes
  // flanking the frame rather than one line running behind it.
  // -----------------------------------------------------------------------

  /** Gap between a heading's baseline row and its rule, in px. */
  const RULE_OFFSET = 7;
  const RULE_THICKNESS = 1;

  interface RuleRect {
    x: number;
    y: number;
    width: number;
    /** Stable across relayout: block index plus position within the row. */
    key: string;
    active: boolean;
    /** Matches its heading's focus fade so the pair dim together. */
    opacity: number;
  }

  let headingRules: RuleRect[] = $derived.by(() => {
    if (layoutResult === null) return [];
    if (layoutResult.blocks.length !== blocks.length) return [];

    const rects: RuleRect[] = [];
    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks.at(bi);
      if (block?.kind !== "sub-heading") continue;

      const geo = layoutResult.blocks.at(bi);
      if (geo === undefined || geo.lineCount === 0) continue;

      const lastLine = layoutResult.lines.at(
        geo.firstLineIndex + geo.lineCount - 1,
      );
      if (lastLine === undefined) continue;

      const km = DEFAULT_METRICS[block.kind];
      const ruleY = lastLine.y + km.lineHeight + RULE_OFFSET;
      const active =
        block.sectionId === activeSection && block.subSlug === activeSub;

      const segments = computeLineSegments(
        ruleY,
        RULE_THICKNESS,
        containerWidth,
        layoutHole,
      );
      for (let si = 0; si < segments.length; si++) {
        const seg = segments.at(si);
        if (seg === undefined) continue;
        rects.push({
          x: seg.x,
          y: ruleY,
          width: seg.width,
          key: `${String(bi)}:${String(si)}`,
          active,
          opacity: fadeFor(geo.topY, geo.bottomY),
        });
      }
    }
    return rects;
  });

  // -----------------------------------------------------------------------
  // Click handling
  // -----------------------------------------------------------------------

  function handleClick(ev: MouseEvent): void {
    if (layoutResult === null || containerEl === undefined) return;

    const rect = containerEl.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    // Convert to container-relative document-space coordinates
    // The lines are positioned relative to the container's content, not scroll
    const bi = hitTestBlock(x, y, layoutResult, DEFAULT_METRICS, blocks);
    if (bi === null) return;

    const block = blocks.at(bi);
    if (block === undefined) return;
    if (block.subSlug !== null) {
      onSelectSub(block.sectionId, block.subSlug);
    } else {
      onSelectSection(block.sectionId);
    }
  }

  function handleKeydown(ev: KeyboardEvent): void {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    const rawId = target.dataset.sectionId;
    const subSlug = target.dataset.subSlug;
    if (rawId === undefined) return;

    // Validate the dataset value against the real section taxonomy
    const section = getSection(rawId);
    if (section === undefined) return;

    ev.preventDefault();
    if (subSlug !== undefined && subSlug !== "") {
      onSelectSub(section.id, subSlug);
    } else {
      onSelectSection(section.id);
    }
  }

  // -----------------------------------------------------------------------
  // CSS class helpers per block kind
  // -----------------------------------------------------------------------

  /** Semantic tag for a text block. Only called for text blocks. */
  function blockTag(kind: FlowTextKind): string {
    switch (kind) {
      case "section-title":
        return "h2";
      case "sub-heading":
        return "h3";
      case "section-desc":
      case "sub-body":
        return "p";
    }
  }

  function lineColorClass(
    block: FlowTextBlock,
    activeSection_: SectionId,
    activeSub_: string | null,
  ): string {
    // Active sub heading gets accent color
    if (
      block.kind === "sub-heading" &&
      block.sectionId === activeSection_ &&
      block.subSlug === activeSub_
    ) {
      return "flow-line--active-heading";
    }
    // Style classes per kind
    switch (block.kind) {
      case "section-title":
        return "flow-line--title";
      case "section-desc":
        return "flow-line--desc";
      case "sub-heading":
        return "flow-line--sub-heading";
      case "sub-body":
        return "flow-line--sub-body";
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="flow-story"
  bind:this={containerEl}
  onclick={handleClick}
  style="height: {layoutResult !== null
    ? layoutResult.totalHeight
    : 0}px; position: relative;"
>
  {#if layoutResult !== null}
    <!-- Highlight rects behind active sub lines (unkeyed: stateless decoration) -->
    {#each highlightRects as hr, i (i)}
      <div
        class="flow-highlight"
        style="
          left: {hr.x}px;
          top: {hr.y}px;
          width: {hr.width}px;
          height: {hr.height}px;
        "
      ></div>
    {/each}

    <!-- Hairline rules under each sub heading -->
    {#each headingRules as rule (rule.key)}
      <div
        class="flow-rule"
        class:flow-rule--active={rule.active}
        style="left: {rule.x}px; top: {rule.y}px; width: {rule.width}px; opacity: {rule.opacity};"
      ></div>
    {/each}

    <!-- Seen-topic check marks -->
    {#each seenMarks as mark (mark.blockIndex)}
      <div class="flow-seen-mark" style="left: {mark.x}px; top: {mark.y}px;">
        <Check size={14} />
      </div>
    {/each}

    <!-- Visible blocks with their line spans -->
    {#each visibleBlocks as vb (vb.block.id)}
      {@const isFocusable = vb.block.kind === "sub-heading"}
      {@const tag = blockTag(vb.block.kind)}

      {#if tag === "h2"}
        <h2
          class="flow-block"
          style:top="{vb.geo.topY}px"
          style:opacity={fadeFor(vb.geo.topY, vb.geo.bottomY)}
        >
          {#each vb.lines as line, li (li)}
            <span
              class="flow-line {lineColorClass(
                vb.block,
                activeSection,
                activeSub,
              )}"
              style:left="{line.x}px"
              style:top="{line.y - vb.geo.topY}px"
              style:width="{line.width}px">{line.text}</span
            >
          {/each}
        </h2>
      {:else if tag === "h3"}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <h3
          class="flow-block"
          class:flow-block--focusable={isFocusable}
          style:top="{vb.geo.topY}px"
          style:opacity={fadeFor(vb.geo.topY, vb.geo.bottomY)}
          role={isFocusable ? "button" : undefined}
          tabindex={isFocusable ? 0 : undefined}
          data-section-id={vb.block.sectionId}
          data-sub-slug={vb.block.subSlug}
          onkeydown={isFocusable ? handleKeydown : undefined}
        >
          {#each vb.lines as line, li (li)}
            <span
              class="flow-line {lineColorClass(
                vb.block,
                activeSection,
                activeSub,
              )}"
              style:left="{line.x}px"
              style:top="{line.y - vb.geo.topY}px"
              style:width="{line.width}px">{line.text}</span
            >
          {/each}
        </h3>
      {:else}
        <p
          class="flow-block"
          style:top="{vb.geo.topY}px"
          style:opacity={fadeFor(vb.geo.topY, vb.geo.bottomY)}
        >
          {#each vb.lines as line, li (li)}
            <span
              class="flow-line {lineColorClass(
                vb.block,
                activeSection,
                activeSub,
              )}"
              style:left="{line.x}px"
              style:top="{line.y - vb.geo.topY}px"
              style:width="{line.width}px">{line.text}</span
            >
          {/each}
        </p>
      {/if}
    {/each}

    <!-- Visible figures: absolutely positioned clip elements -->
    {#each visibleFigures as vf (vf.block.id)}
      <div
        class="flow-figure"
        style:left="{vf.geo.x}px"
        style:top="{vf.geo.y}px"
        style:width="{vf.geo.width}px"
        style:height="{vf.geo.height}px"
        style:opacity={fadeFor(vf.blockGeo.topY, vf.blockGeo.bottomY)}
      >
        <ClipFigure
          sectionId={vf.block.sectionId}
          subSlug={vf.block.subSlug ?? ""}
          width={vf.geo.width}
          height={vf.geo.height}
          ariaLabel={resolveParameterizedMessage(
            "demo_figure_aria_label",
            {
              sub: resolveStoryMessage(
                `demo_narrative_topic_${vf.block.subSlug ?? "unknown"}_heading`,
                locale,
              ),
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
  {/if}
</div>

<style>
  .flow-story {
    position: relative;
    width: 100%;
  }

  .flow-block {
    position: absolute;
    left: 0;
    right: 0;
    margin: 0;
    pointer-events: auto;
    /* Smooths the distance fade, which is recomputed per scroll frame. */
    transition: opacity 0.2s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .flow-block {
      transition: none;
    }
  }

  .flow-block--focusable {
    cursor: pointer;
  }

  .flow-block--focusable:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: 2px;
    border-radius: 4px;
  }

  :global(html.dark) .flow-block--focusable:focus-visible {
    outline-color: #64d2ff;
  }

  .flow-line {
    position: absolute;
    white-space: pre;
    pointer-events: auto;
    display: block;
  }

  /* Section title: dark text, weight 700 */
  .flow-line--title {
    font: 700 24px "Atkinson Hyperlegible Next";
    line-height: 32px;
    color: #1d1d1f;
  }
  :global(html.dark) .flow-line--title {
    color: #f5f5f7;
  }

  /* Section description: muted text */
  .flow-line--desc {
    font: 400 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: #636366;
  }
  :global(html.dark) .flow-line--desc {
    color: #a1a1a6;
  }

  /* Sub heading: dark text */
  .flow-line--sub-heading {
    font: 700 18px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: #1d1d1f;
  }
  :global(html.dark) .flow-line--sub-heading {
    color: #f5f5f7;
  }

  /* Active sub heading: accent color (inherits sub-heading font) */
  .flow-line--active-heading {
    font: 700 18px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: #007aff;
  }
  :global(html.dark) .flow-line--active-heading {
    color: #64d2ff;
  }

  /* Sub body: slightly muted text */
  .flow-line--sub-body {
    font: 400 15px "Atkinson Hyperlegible Next";
    line-height: 24px;
    color: #424245;
  }
  :global(html.dark) .flow-line--sub-body {
    color: #a1a1a6;
  }

  /* Highlight rects behind active sub lines */
  .flow-highlight {
    position: absolute;
    border-radius: 6px;
    background: rgba(0, 122, 255, 0.1);
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  :global(html.dark) .flow-highlight {
    background: rgba(100, 210, 255, 0.14);
  }

  @media (prefers-reduced-motion: reduce) {
    .flow-highlight {
      transition: none;
    }
  }

  /* Hairline rule under each sub heading */
  .flow-rule {
    position: absolute;
    height: 1px;
    background: rgba(0, 0, 0, 0.12);
    pointer-events: none;
    transition:
      background 0.2s ease,
      opacity 0.2s ease;
  }

  :global(html.dark) .flow-rule {
    background: rgba(255, 255, 255, 0.14);
  }

  .flow-rule--active {
    background: rgba(0, 122, 255, 0.45);
  }

  :global(html.dark) .flow-rule--active {
    background: rgba(100, 210, 255, 0.5);
  }

  @media (prefers-reduced-motion: reduce) {
    .flow-rule {
      transition: none;
    }
  }

  /* Seen-topic check marks */
  .flow-seen-mark {
    position: absolute;
    color: #34c759;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Inline clip figures */
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

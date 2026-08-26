<script lang="ts">
  import type { Snippet } from "svelte";
  import { X } from "@lucide/svelte";
  import {
    prepareWithSegments,
    layoutNextLineRange,
    materializeLineRange,
    type PreparedTextWithSegments,
    type LayoutCursor,
  } from "@chenglou/pretext";
  import {
    prepareRichInline,
    layoutNextRichInlineLineRange,
    materializeRichInlineLineRange,
    type PreparedRichInline,
    type RichInlineCursor,
  } from "@chenglou/pretext/rich-inline";
  import * as m from "$lib/paraglide/messages.js";
  import { SECTIONS, type Section, type SectionId } from "./scroll-sections.js";
  import {
    FONT_STRINGS,
    FONT_SUB_BODY_BOLD,
    fontVarsStyle,
    applyPretextLocale,
    buildBlocks,
  } from "./story-blocks.js";
  import {
    type FlowBlock,
    type FlowTextBlock,
    type FlowLine,
    type FlowLineFragment,
    type FlowLayoutResult,
    type LineFiller,
    type LineFillerResult,
    type LineCursor,
    DEFAULT_METRICS,
    computeFlowLayout,
  } from "./flow-layout.js";
  import { DRAWER_MAX_MEASURE } from "./fullscreen.svelte.js";
  import { READING_LINE_RATIO } from "./flow-geometry.svelte.js";
  import { plainMap } from "./non-reactive.js";

  // -----------------------------------------------------------------------
  // Props
  // -----------------------------------------------------------------------

  interface Props {
    open: boolean;
    width: number;
    activeSection: SectionId | null;
    activeSub: string | null;
    locale: string;
    onClose: () => void;
    onResize: (width: number) => void;
    /** Called when the drawer's scroll position crosses a sub-heading. */
    onScrollSub: (sectionId: SectionId, subSlug: string) => void;
    topbar?: Snippet;
    strip?: Snippet;
  }

  let {
    open,
    width,
    activeSection,
    activeSub,
    locale,
    onClose,
    onResize,
    onScrollSub,
    topbar,
    strip,
  }: Props = $props();

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

  // -----------------------------------------------------------------------
  // Resize handle (pointer-captured drag, rAF-coalesced)
  // -----------------------------------------------------------------------

  let resizing = $state(false);
  let resizeRafId = 0;
  let pendingResizeX = 0;

  function flushResize(): void {
    resizeRafId = 0;
    onResize(window.innerWidth - pendingResizeX);
  }

  function onResizePointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    const target = e.currentTarget;
    if (!(target instanceof HTMLElement)) return;
    target.setPointerCapture(e.pointerId);
    resizing = true;
  }

  function onResizePointerMove(e: PointerEvent): void {
    if (!resizing) return;
    pendingResizeX = e.clientX;
    if (resizeRafId === 0) {
      resizeRafId = requestAnimationFrame(flushResize);
    }
  }

  function onResizePointerUp(): void {
    resizing = false;
    if (resizeRafId !== 0) {
      cancelAnimationFrame(resizeRafId);
      resizeRafId = 0;
    }
  }

  function onResizeKeydown(e: KeyboardEvent): void {
    const step = 24;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onResize(width + step);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onResize(width - step);
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

  // Build blocks for the active section only, filtering out figures
  let proseBlocks: FlowBlock[] = $derived.by(() => {
    if (activeEntry === null) return [];
    const all = buildBlocks([activeEntry], locale);
    return all.filter((b) => b.kind !== "figure");
  });

  // -----------------------------------------------------------------------
  // Pretext preparation (mirrors FlowStory's pattern)
  // -----------------------------------------------------------------------

  interface PlainHandle {
    readonly type: "plain";
    readonly handle: PreparedTextWithSegments;
  }

  interface RichHandle {
    readonly type: "rich";
    readonly handle: PreparedRichInline;
    readonly bold: readonly boolean[];
  }

  type BlockHandle = PlainHandle | RichHandle;

  interface PreparedState {
    forBlocks: readonly FlowBlock[];
    handles: Map<number, BlockHandle>;
  }

  let prepared: PreparedState | null = $state.raw(null);

  $effect(() => {
    const capturedBlocks = proseBlocks;
    const capturedLocale = locale;
    const run = new AbortController();

    function prepareBlocks(): void {
      applyPretextLocale(capturedLocale);

      const handles = plainMap<number, BlockHandle>();
      for (let i = 0; i < capturedBlocks.length; i++) {
        const block = capturedBlocks.at(i);
        if (block === undefined) continue;
        if (block.kind === "figure") continue;
        const fontStr = FONT_STRINGS[block.kind];
        if ("runs" in block && block.runs !== undefined) {
          handles.set(i, {
            type: "rich",
            handle: prepareRichInline(
              block.runs.map((r) => ({
                text: r.text,
                font: r.bold ? FONT_SUB_BODY_BOLD : fontStr,
              })),
            ),
            bold: block.runs.map((r) => r.bold),
          });
        } else {
          handles.set(i, {
            type: "plain",
            handle: prepareWithSegments(block.text, fontStr),
          });
        }
      }
      prepared = { forBlocks: capturedBlocks, handles };
    }

    async function prepareAfterFonts(): Promise<void> {
      const fontLoadPromises = [
        ...Object.values(FONT_STRINGS),
        FONT_SUB_BODY_BOLD,
      ].map(async (f) => document.fonts.load(f));
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
  // LineFiller backed by pretext (same as FlowStory)
  // -----------------------------------------------------------------------

  function isLayoutCursor(c: LineCursor): c is LayoutCursor {
    if (typeof c !== "object" || c === null) return false;
    return (
      "segmentIndex" in c &&
      typeof c.segmentIndex === "number" &&
      "graphemeIndex" in c &&
      typeof c.graphemeIndex === "number"
    );
  }

  function isRichCursor(c: LineCursor): c is RichInlineCursor {
    return (
      isLayoutCursor(c) && "itemIndex" in c && typeof c.itemIndex === "number"
    );
  }

  function fillRichLine(
    entry: RichHandle,
    cursor: RichInlineCursor,
    maxWidth: number,
  ): LineFillerResult | null {
    const range = layoutNextRichInlineLineRange(entry.handle, maxWidth, cursor);
    if (range === null) return null;

    const line = materializeRichInlineLineRange(entry.handle, range);
    const fragments: FlowLineFragment[] = [];
    let dx = 0;
    let text = "";
    for (const frag of line.fragments) {
      dx += frag.gapBefore;
      fragments.push({
        text: frag.text,
        bold: entry.bold.at(frag.itemIndex) ?? false,
        dx,
        width: frag.occupiedWidth,
      });
      dx += frag.occupiedWidth;
      text += frag.text;
    }
    return { text, width: line.width, nextCursor: range.end, fragments };
  }

  function createFiller(handles: ReadonlyMap<number, BlockHandle>): LineFiller {
    return {
      startCursor(blockIndex: number): LineCursor {
        if (handles.get(blockIndex)?.type === "rich") {
          return {
            itemIndex: 0,
            segmentIndex: 0,
            graphemeIndex: 0,
          } satisfies RichInlineCursor;
        }
        return { segmentIndex: 0, graphemeIndex: 0 } satisfies LayoutCursor;
      },
      fillLine(
        blockIndex: number,
        cursor: LineCursor,
        maxWidth: number,
      ): LineFillerResult | null {
        const entry = handles.get(blockIndex);
        if (entry === undefined) return null;

        if (entry.type === "rich") {
          if (!isRichCursor(cursor)) return null;
          return fillRichLine(entry, cursor, maxWidth);
        }

        if (!isLayoutCursor(cursor)) return null;
        const range = layoutNextLineRange(entry.handle, cursor, maxWidth);
        if (range === null) return null;

        const materialized = materializeLineRange(entry.handle, range);
        return {
          text: materialized.text,
          width: materialized.width,
          nextCursor: range.end,
        };
      },
    };
  }

  // -----------------------------------------------------------------------
  // Layout computation (rAF-coalesced)
  // -----------------------------------------------------------------------

  let layoutResult: FlowLayoutResult | null = $state.raw(null);
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
      return;
    }

    const filler = createFiller(prepared.handles);
    const column = { x: 0, width: proseWidth };
    layoutResult = computeFlowLayout(
      proseBlocks,
      filler,
      proseWidth,
      null,
      DEFAULT_METRICS,
      column,
    );
  }

  // Trigger relayout when inputs change
  $effect(() => {
    void prepared;
    void proseWidth;
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

  // -----------------------------------------------------------------------
  // Visible lines derived from layout (no virtualization needed here,
  // the content div handles scrolling)
  // -----------------------------------------------------------------------

  interface VisibleBlock {
    blockIndex: number;
    block: FlowTextBlock;
    geo: {
      topY: number;
      bottomY: number;
      firstLineIndex: number;
      lineCount: number;
    };
    lines: FlowLine[];
  }

  let visibleBlocks: VisibleBlock[] = $derived.by(() => {
    if (layoutResult === null) return [];
    if (layoutResult.blocks.length !== proseBlocks.length) return [];

    const result: VisibleBlock[] = [];
    for (let bi = 0; bi < layoutResult.blocks.length; bi++) {
      const geo = layoutResult.blocks.at(bi);
      const block = proseBlocks.at(bi);
      if (geo === undefined || block === undefined) continue;
      if (block.kind === "figure") continue;

      const lines: FlowLine[] = [];
      const end = geo.firstLineIndex + geo.lineCount;
      for (let li = geo.firstLineIndex; li < end; li++) {
        const line = layoutResult.lines.at(li);
        if (line !== undefined) lines.push(line);
      }
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
  // Active sub highlight geometry (mirrors FlowStory's HighlightRect)
  //
  // Yellow wash behind every line of the active sub's blocks, matching
  // the main story's highlight treatment. Driven by activeSub prop.
  // -----------------------------------------------------------------------

  interface HighlightRect {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const HIGHLIGHT_PAD_X = 8;

  let highlightRects: HighlightRect[] = $derived.by(() => {
    if (layoutResult === null || activeSub === null || activeSection === null) {
      return [];
    }
    if (layoutResult.blocks.length !== proseBlocks.length) return [];

    const rects: HighlightRect[] = [];
    for (let bi = 0; bi < proseBlocks.length; bi++) {
      const block = proseBlocks.at(bi);
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
          y: line.y,
          width: line.width + HIGHLIGHT_PAD_X * 2,
          height: km.lineHeight,
        });
      }
    }
    return rects;
  });

  // -----------------------------------------------------------------------
  // CSS class helpers (themed ink colors matching FlowStory)
  // -----------------------------------------------------------------------

  function lineColorClass(
    block: FlowTextBlock,
    section: SectionId | null,
    sub: string | null,
  ): string {
    // Active sub heading gets accent color (matches FlowStory)
    if (
      block.kind === "sub-heading" &&
      block.sectionId === section &&
      block.subSlug === sub
    ) {
      return "drawer-line--active-heading";
    }
    switch (block.kind) {
      case "section-title":
        return "drawer-line--title";
      case "section-desc":
        return "drawer-line--desc";
      case "story-tip":
        return "drawer-line--tip";
      case "sub-heading":
        return "drawer-line--sub-heading";
      case "sub-body":
        return "drawer-line--sub-body";
    }
  }

  // Horizontal offset to center the prose column when it is narrower
  // than the content div.
  const proseOffsetX: number = $derived(
    contentWidth > proseWidth ? Math.floor((contentWidth - proseWidth) / 2) : 0,
  );
</script>

<aside
  class="handbook-drawer"
  class:handbook-drawer--open={open}
  style="width: {width}px;"
  aria-label={m.demo_fs_drawer_close()}
>
  <!-- Resize handle (left edge) with visible grip affordance -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="drawer-resize-handle"
    role="separator"
    aria-orientation="vertical"
    aria-label={m.demo_fs_drawer_resize()}
    tabindex={0}
    onpointerdown={onResizePointerDown}
    onpointermove={onResizePointerMove}
    onpointerup={onResizePointerUp}
    onpointercancel={onResizePointerUp}
    onlostpointercapture={onResizePointerUp}
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

  <!-- Sub-section strip: horizontal nav for the active section's subs -->
  {#if strip}
    <div class="drawer-strip-dock">
      {@render strip()}
    </div>
  {/if}

  <!-- Prose content -->
  <div class="drawer-content" bind:this={contentEl} style={fontVarsStyle}>
    {#if layoutResult !== null}
      <div
        class="drawer-prose"
        style="height: {layoutResult.totalHeight}px; position: relative;"
      >
        <!-- Highlight rects behind active sub lines (unkeyed decoration) -->
        {#each highlightRects as hr, i (i)}
          <div
            class="drawer-highlight"
            style="
              left: {proseOffsetX + hr.x}px;
              top: {hr.y}px;
              width: {hr.width}px;
              height: {hr.height}px;
            "
          ></div>
        {/each}

        {#each visibleBlocks as vb (vb.block.id)}
          {@const firstLine = vb.lines.at(0)}
          <div class="drawer-block" style:top="{vb.geo.topY}px">
            <!-- List marker in the gutter -->
            {#if "marker" in vb.block && vb.block.marker !== undefined && firstLine !== undefined}
              <span
                class="drawer-line {lineColorClass(
                  vb.block,
                  activeSection,
                  activeSub,
                )}"
                style:left="{proseOffsetX +
                  firstLine.x -
                  (vb.block.indent ?? 0)}px"
                style:top="{firstLine.y - vb.geo.topY}px"
                >{vb.block.marker}</span
              >
            {/if}
            {#each vb.lines as line, li (li)}
              {#if line.fragments !== undefined}
                {#each line.fragments as frag, fi (fi)}
                  <span
                    class="drawer-line {lineColorClass(
                      vb.block,
                      activeSection,
                      activeSub,
                    )}"
                    class:drawer-line--bold={frag.bold}
                    style:left="{proseOffsetX + line.x + frag.dx}px"
                    style:top="{line.y - vb.geo.topY}px"
                    style:width="{frag.width}px">{frag.text}</span
                  >
                {/each}
              {:else}
                <span
                  class="drawer-line {lineColorClass(
                    vb.block,
                    activeSection,
                    activeSub,
                  )}"
                  style:left="{proseOffsetX + line.x}px"
                  style:top="{line.y - vb.geo.topY}px"
                  style:width="{line.width}px">{line.text}</span
                >
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</aside>

<style>
  .handbook-drawer {
    position: fixed;
    inset: 0 0 0 auto;
    z-index: 120;
    background: var(--paper);
    border-left: 1px solid var(--hair);
    box-shadow: -12px 0 32px color-mix(in srgb, var(--ink) 14%, transparent);
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.25s ease;
  }

  .handbook-drawer--open {
    transform: translateX(0);
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
  }

  .drawer-topbar-dock :global(.top-bar) {
    position: relative;
    top: auto;
    /* Reserve room on the right for the docked close button. */
    padding-right: 54px;
  }

  /* Close button integrated into the docked TopBar row, vertically
     centred in the 56px bar. */
  .drawer-close-btn--docked {
    position: absolute;
    top: 11px;
    right: 0.75rem;
  }

  /* Keep the contents panel anchored inside the drawer at narrow widths.
     TopBar's own @media(max-width:899px) switches it to position:fixed
     spanning the viewport, which would render behind the drawer's z-120
     stacking context. Force absolute positioning so it stays contained. */
  .drawer-topbar-dock :global(.contents-panel) {
    position: absolute;
    left: 0;
    right: 0;
    min-width: 0;
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
     Prose content
     ----------------------------------------------------------------------- */

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    min-height: 0;
  }

  .drawer-prose {
    position: relative;
    width: 100%;
  }

  .drawer-block {
    position: absolute;
    left: 0;
    right: 0;
    margin: 0;
    pointer-events: none;
  }

  .drawer-line {
    position: absolute;
    white-space: pre;
    display: block;
  }

  /* Themed ink colors matching FlowStory's line color classes */
  .drawer-line--title {
    font: var(--flow-font-title);
    line-height: var(--flow-lh-title);
    color: var(--ink);
  }

  .drawer-line--desc {
    font: var(--flow-font-desc);
    line-height: var(--flow-lh-desc);
    color: var(--muted);
  }

  .drawer-line--tip {
    font: var(--flow-font-tip);
    line-height: var(--flow-lh-tip);
    color: var(--muted);
  }

  .drawer-line--sub-heading {
    font: var(--flow-font-sub-heading);
    line-height: var(--flow-lh-sub-heading);
    color: var(--ink);
  }

  /* Active sub heading: keeps ordinary heading colour, readable through
     the yellow wash behind it (same treatment as FlowStory). */
  .drawer-line--active-heading {
    font: var(--flow-font-sub-heading);
    line-height: var(--flow-lh-sub-heading);
    color: var(--ink);
  }

  /* -----------------------------------------------------------------------
     Highlight rects: yellow wash behind active sub lines, matching
     FlowStory's highlight treatment.
     ----------------------------------------------------------------------- */

  .drawer-highlight {
    position: absolute;
    border-radius: 2px;
    background: rgba(255, 214, 10, 0.38);
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  :global(html.dark) .drawer-highlight {
    background: rgba(255, 214, 10, 0.24);
  }

  @media (prefers-reduced-motion: reduce) {
    .drawer-highlight {
      transition: none;
    }
  }

  .drawer-line--sub-body {
    font: var(--flow-font-sub-body);
    line-height: var(--flow-lh-sub-body);
    color: var(--ink-2);
  }

  .drawer-line--bold {
    font: var(--flow-font-sub-body-bold);
  }
</style>

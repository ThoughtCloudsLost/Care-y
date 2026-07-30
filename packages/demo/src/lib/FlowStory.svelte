<script lang="ts">
  import { SvelteMap } from "svelte/reactivity";
  import { Check } from "@lucide/svelte";
  import {
    prepareWithSegments,
    layoutNextLineRange,
    materializeLineRange,
    setLocale,
    clearCache,
    type PreparedTextWithSegments,
    type LayoutCursor,
  } from "@chenglou/pretext";
  import type { Section, SectionId } from "./scroll-sections.js";
  import { getSection } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";
  import { resolveStoryMessage } from "./story-messages.js";
  import {
    type FlowBlock,
    type FlowBlockKind,
    type FlowHole,
    type FlowLayoutResult,
    type FlowLine,
    type LineFiller,
    type LineFillerResult,
    type LineCursor,
    DEFAULT_METRICS,
    FRAME_PAD_TOP,
    FRAME_PAD_BOTTOM,
    FRAME_PAD_X,
    computeFlowLayout,
    hitTestBlock,
  } from "./flow-layout.js";
  import { setFlowGeometrySource } from "./flow-geometry.svelte.js";

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
  }: Props = $props();

  // -----------------------------------------------------------------------
  // Font strings for canvas measurement and CSS rendering.
  // These MUST match exactly between prepare() calls and rendered spans.
  // -----------------------------------------------------------------------

  const FONT_FAMILY = '"Atkinson Hyperlegible Next"';

  const FONT_STRINGS: Record<FlowBlockKind, string> = {
    "section-title": `700 24px ${FONT_FAMILY}`,
    "section-desc": `400 15px ${FONT_FAMILY}`,
    "sub-heading": `700 18px ${FONT_FAMILY}`,
    "sub-body": `400 15px ${FONT_FAMILY}`,
  };

  // -----------------------------------------------------------------------
  // Block list derivation
  // -----------------------------------------------------------------------

  function buildBlocks(sects: Section[], loc: string): FlowBlock[] {
    const result: FlowBlock[] = [];
    for (const section of sects) {
      for (const sub of section.subs) {
        result.push({
          id: `${section.id}--${sub.slug}--heading`,
          sectionId: section.id,
          subSlug: sub.slug,
          kind: "sub-heading",
          text: resolveStoryMessage(sub.headingKey, loc),
        });
        result.push({
          id: `${section.id}--${sub.slug}--body`,
          sectionId: section.id,
          subSlug: sub.slug,
          kind: "sub-body",
          text: resolveStoryMessage(sub.bodyKey, loc),
        });
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

    async function loadAndPrepare(): Promise<void> {
      // Load all font variants we measure with. allSettled because the
      // font set also carries the client's absolute-URL @font-face
      // declarations, which 404 under the demo's serving root; load()
      // rejects when ANY matched face fails even though the hashed
      // faces load fine and rendering falls back to them.
      const fontLoadPromises = Object.values(FONT_STRINGS).map(async (f) =>
        document.fonts.load(f),
      );
      await Promise.allSettled(fontLoadPromises);
      await document.fonts.ready;

      if (run.signal.aborted) return;

      // Set locale for pretext's Intl.Segmenter
      setLocale(capturedLocale);

      const handles = new SvelteMap<number, PreparedTextWithSegments>();
      for (let i = 0; i < capturedBlocks.length; i++) {
        const block = capturedBlocks.at(i);
        if (block === undefined) continue;
        const fontStr = FONT_STRINGS[block.kind];
        handles.set(i, prepareWithSegments(block.text, fontStr));
      }

      // No second abort check: the loop above is synchronous, so nothing
      // can abort between the check after the awaits and this assignment.
      prepared = { forBlocks: capturedBlocks, handles };
    }

    void loadAndPrepare();

    return () => {
      run.abort();
      clearCache();
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
  let containerTop = $state(0);
  // $state.raw: replaced wholesale each pass, and a deep proxy would wrap
  // every line and block geometry object on every layout.
  let layoutResult: FlowLayoutResult | null = $state.raw(null);

  // Viewport height for reactive virtualization (no window reads in $derived)
  let viewportH = $state(
    typeof window !== "undefined" ? window.innerHeight : 0,
  );

  $effect(() => {
    function onResize(): void {
      viewportH = window.innerHeight;
    }
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  });

  // Track container width via ResizeObserver
  $effect(() => {
    if (containerEl === undefined) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth = entry.contentRect.width;
      }
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
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

    // Make coordinates relative to the container
    const rawHole: FlowHole = {
      left: frameDocLeft - contLeft,
      top: frameDocTop - contTop,
      right: frameDocLeft + fr.outerW - contLeft,
      bottom: frameDocTop + fr.outerH - contTop,
    };

    // Apply padding at the single exit point
    return {
      left: rawHole.left - FRAME_PAD_X,
      top: rawHole.top - FRAME_PAD_TOP,
      right: rawHole.right + FRAME_PAD_X,
      bottom: rawHole.bottom + FRAME_PAD_BOTTOM,
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
      setFlowGeometrySource(null);
      return;
    }

    // Measure container position (the only DOM read in the layout path)
    let contLeft = 0;
    if (containerEl !== undefined) {
      const rect = containerEl.getBoundingClientRect();
      containerTop = rect.top + window.scrollY;
      contLeft = rect.left;
    }

    const filler = createFiller(prepared.handles);
    const hole = rawHoleAt(window.scrollY, containerTop, contLeft, frameRect);
    const result = computeFlowLayout(
      blocks,
      filler,
      containerWidth,
      hole,
      DEFAULT_METRICS,
    );
    layoutResult = result;

    // Publish geometry for cross-module consumption.
    // Capture per-pass values so closures stay self-consistent.
    const passContainerTop = containerTop;
    const passContainerLeft = contLeft;
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
    block: FlowBlock;
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
      if (!isBlockVisible(geo, containerTop, vpTop, vpBottom, buffer)) continue;

      const lines: FlowLine[] = [];
      const end = geo.firstLineIndex + geo.lineCount;
      for (let li = geo.firstLineIndex; li < end; li++) {
        const line = layoutResult.lines.at(li);
        if (line !== undefined) lines.push(line);
      }
      result.push({ blockIndex: bi, block, geo, lines });
    }
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

  let seenMarks: SeenMark[] = $derived.by(() => {
    if (layoutResult === null) return [];
    if (layoutResult.blocks.length !== blocks.length) return [];

    const marks: SeenMark[] = [];
    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks.at(bi);
      if (block?.kind !== "sub-heading") continue;

      // Look up the sub to check its topic
      const section = sections.find((s) => s.id === block.sectionId);
      const sub = section?.subs.find((s) => s.slug === block.subSlug);
      const topic = sub?.topic;
      if (topic === undefined || topic === null) continue;
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

  function blockTag(kind: FlowBlockKind): string {
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
    block: FlowBlock,
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
        <h2 class="flow-block" style="top: {vb.geo.topY}px;">
          {#each vb.lines as line, li (li)}
            <span
              class="flow-line {lineColorClass(
                vb.block,
                activeSection,
                activeSub,
              )}"
              style="
                left: {line.x}px;
                top: {line.y - vb.geo.topY}px;
                width: {line.width}px;
                font: {FONT_STRINGS[vb.block.kind]};
                line-height: {DEFAULT_METRICS[vb.block.kind].lineHeight}px;
              ">{line.text}</span
            >
          {/each}
        </h2>
      {:else if tag === "h3"}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <h3
          class="flow-block"
          class:flow-block--focusable={isFocusable}
          style="top: {vb.geo.topY}px;"
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
              style="
                left: {line.x}px;
                top: {line.y - vb.geo.topY}px;
                width: {line.width}px;
                font: {FONT_STRINGS[vb.block.kind]};
                line-height: {DEFAULT_METRICS[vb.block.kind].lineHeight}px;
              ">{line.text}</span
            >
          {/each}
        </h3>
      {:else}
        <p class="flow-block" style="top: {vb.geo.topY}px;">
          {#each vb.lines as line, li (li)}
            <span
              class="flow-line {lineColorClass(
                vb.block,
                activeSection,
                activeSub,
              )}"
              style="
                left: {line.x}px;
                top: {line.y - vb.geo.topY}px;
                width: {line.width}px;
                font: {FONT_STRINGS[vb.block.kind]};
                line-height: {DEFAULT_METRICS[vb.block.kind].lineHeight}px;
              ">{line.text}</span
            >
          {/each}
        </p>
      {/if}
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
    color: #1d1d1f;
  }
  :global(html.dark) .flow-line--title {
    color: #f5f5f7;
  }

  /* Section description: muted text */
  .flow-line--desc {
    color: #636366;
  }
  :global(html.dark) .flow-line--desc {
    color: #a1a1a6;
  }

  /* Sub heading: dark text */
  .flow-line--sub-heading {
    color: #1d1d1f;
  }
  :global(html.dark) .flow-line--sub-heading {
    color: #f5f5f7;
  }

  /* Active sub heading: accent color */
  .flow-line--active-heading {
    color: #007aff;
  }
  :global(html.dark) .flow-line--active-heading {
    color: #64d2ff;
  }

  /* Sub body: slightly muted text */
  .flow-line--sub-body {
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

  /* Seen-topic check marks */
  .flow-seen-mark {
    position: absolute;
    color: #34c759;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

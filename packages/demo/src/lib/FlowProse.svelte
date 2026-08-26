<script lang="ts">
  import type { Snippet } from "svelte";
  import { Check, MousePointerClick } from "@lucide/svelte";
  import type { Section, SectionId } from "./scroll-sections.js";
  import { getSection } from "./scroll-sections.js";
  import type { DemoTopic } from "./bridge.js";
  import { buildSubTopicLookup } from "./story-maps.js";
  import {
    type FlowBlock,
    type FlowTextBlock,
    type FlowTextKind,
    type FlowColumn,
    type FlowHole,
    type FlowLayoutResult,
    type FlowLine,
    LIST_INDENT,
    DEFAULT_METRICS,
    hitTestBlock,
  } from "./flow-layout.js";
  import {
    computeHighlightRects,
    computeHeadingRules,
    computeHeaderPanel,
    computeTipMark,
    computeSeenMarks,
  } from "./flow-decorations.js";
  import { fontVarsStyle } from "./story-blocks.js";

  // -----------------------------------------------------------------------
  // Props
  //
  // Everything this component needs arrives as a prop. It reads no window
  // geometry and publishes to no module singleton, which is what lets the
  // page mount it against window scroll and the handbook drawer mount it
  // inside a scrolling container without either behaving differently.
  // -----------------------------------------------------------------------

  interface Props {
    blocks: readonly FlowBlock[];
    /** The completed pass. Null renders an empty box. */
    layoutResult: FlowLayoutResult | null;
    /**
     * The column and hole the layoutResult was computed against, not the
     * live values. Decorations clip against the same inputs the text did,
     * so a rule can never disagree with the line it sits under.
     */
    layoutColumn: FlowColumn | null;
    layoutHole: FlowHole | null;
    containerWidth: number;
    activeSection: SectionId | null;
    activeSub: string | null;
    seenTopics: ReadonlySet<DemoTopic>;
    /** Sections behind the blocks, for the sub-to-topic lookup. */
    sections: readonly Section[];
    /**
     * Container-space band to render, for hosts that virtualize. Null
     * renders every block, which is right for any container short enough
     * that the cost of a block it cannot see is nil.
     */
    visibleRange: { top: number; bottom: number } | null;
    onSelectSection: (id: SectionId) => void;
    onSelectSub: (sectionId: SectionId, subSlug: string) => void;
    /** The container element, for hosts that measure or observe it. */
    oncontainer?: (el: HTMLDivElement) => void;
    /** Rendered inside the container, above the prose in stacking order. */
    figures?: Snippet;
  }

  let {
    blocks,
    layoutResult,
    layoutColumn,
    layoutHole,
    containerWidth,
    activeSection,
    activeSub,
    seenTopics,
    sections,
    visibleRange,
    onSelectSection,
    onSelectSub,
    oncontainer,
    figures,
  }: Props = $props();

  let containerEl = $state<HTMLDivElement | undefined>(undefined);

  $effect(() => {
    if (containerEl === undefined) return;
    oncontainer?.(containerEl);
  });

  // -----------------------------------------------------------------------
  // Visible blocks
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
    /** This block's own lines, resolved once so the markup iterates a
     *  concrete list instead of indexing into the shared line array. */
    lines: FlowLine[];
  }

  let visibleBlocks: VisibleBlock[] = $derived.by(() => {
    if (layoutResult === null) return [];
    // Layout geometry pairs with blocks by index, so a length mismatch
    // means this layout belongs to a different blocks array and cannot be
    // read safely. Rendering must never throw: a throw aborts the flush
    // and freezes the DOM while the host keeps computing.
    if (layoutResult.blocks.length !== blocks.length) return [];

    const range = visibleRange;

    const result: VisibleBlock[] = [];
    for (let bi = 0; bi < layoutResult.blocks.length; bi++) {
      const geo = layoutResult.blocks.at(bi);
      const block = blocks.at(bi);
      if (geo === undefined || block === undefined) continue;
      // Figure blocks are rendered by the host through the figures
      // snippet, not here.
      if (block.kind === "figure") continue;
      if (
        range !== null &&
        (geo.bottomY < range.top || geo.topY > range.bottom)
      ) {
        continue;
      }

      const lines: FlowLine[] = [];
      const end = geo.firstLineIndex + geo.lineCount;
      for (let li = geo.firstLineIndex; li < end; li++) {
        const line = layoutResult.lines.at(li);
        if (line !== undefined) lines.push(line);
      }
      // The figure guard above narrows block to FlowTextBlock.
      result.push({ blockIndex: bi, block, geo, lines });
    }
    return result;
  });

  // -----------------------------------------------------------------------
  // Decorations
  // -----------------------------------------------------------------------

  let subTopicLookup: ReadonlyMap<string, DemoTopic> = $derived(
    buildSubTopicLookup(sections),
  );

  let highlightRects = $derived(
    computeHighlightRects(
      blocks,
      layoutResult,
      activeSection,
      activeSub,
      DEFAULT_METRICS,
    ),
  );

  let headingRules = $derived(
    computeHeadingRules(
      blocks,
      layoutResult,
      layoutColumn,
      layoutHole,
      containerWidth,
      activeSection,
      activeSub,
      DEFAULT_METRICS,
    ),
  );

  let headerPanel = $derived(
    computeHeaderPanel(blocks, layoutResult, layoutColumn, DEFAULT_METRICS),
  );

  let tipMark = $derived(computeTipMark(blocks, layoutResult, LIST_INDENT));

  let seenMarks = $derived(
    computeSeenMarks(blocks, layoutResult, subTopicLookup, seenTopics),
  );

  // -----------------------------------------------------------------------
  // Click handling
  //
  // Hit-tested against the layout rather than delegated from the spans:
  // a line is a stack of absolutely-positioned fragments, so the element
  // under the pointer is a poor guide to which block was meant.
  // -----------------------------------------------------------------------

  function handleClick(ev: MouseEvent): void {
    if (layoutResult === null || containerEl === undefined) return;

    // getBoundingClientRect already accounts for whatever scrolled the
    // container, so this works the same in a page and in a drawer.
    const rect = containerEl.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

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
      case "story-tip":
      case "sub-body":
        return "p";
    }
  }

  function lineColorClass(
    block: FlowTextBlock,
    section: SectionId | null,
    sub: string | null,
  ): string {
    // Active sub heading gets accent color
    if (
      block.kind === "sub-heading" &&
      block.sectionId === section &&
      block.subSlug === sub
    ) {
      return "flow-line--active-heading";
    }
    // Style classes per kind
    switch (block.kind) {
      case "section-title":
        return "flow-line--title";
      case "section-desc":
        return "flow-line--desc";
      case "story-tip":
        return "flow-line--tip";
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
    : 0}px; position: relative; {fontVarsStyle}"
>
  {#if layoutResult !== null}
    <!-- Header tint, first so every line paints over it -->
    {#if headerPanel !== null}
      <div
        class="flow-header-panel"
        style="
          left: {headerPanel.x}px;
          top: {headerPanel.y}px;
          width: {headerPanel.width}px;
          height: {headerPanel.height}px;
        "
      ></div>
    {/if}

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
        style="left: {rule.x}px; top: {rule.y}px; width: {rule.width}px;"
      ></div>
    {/each}

    <!-- Tip icon in the gutter beside its first line -->
    {#if tipMark !== null}
      <div
        class="flow-tip-mark"
        style="left: {tipMark.x}px; top: {tipMark.y}px;"
      >
        <MousePointerClick size={16} />
      </div>
    {/if}

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
        <h2 class="flow-block" style:top="{vb.geo.topY}px">
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
        {@const firstLine = vb.lines.at(0)}
        <p class="flow-block" style:top="{vb.geo.topY}px">
          <!-- List marker in the gutter the item's indent reserved -->
          {#if vb.block.marker !== undefined && firstLine !== undefined}
            <span
              class="flow-line {lineColorClass(
                vb.block,
                activeSection,
                activeSub,
              )}"
              style:left="{firstLine.x - (vb.block.indent ?? 0)}px"
              style:top="{firstLine.y - vb.geo.topY}px">{vb.block.marker}</span
            >
          {/if}
          {#each vb.lines as line, li (li)}
            {#if line.fragments !== undefined}
              <!-- Rich line: one span per styled fragment -->
              {#each line.fragments as frag, fi (fi)}
                <span
                  class="flow-line {lineColorClass(
                    vb.block,
                    activeSection,
                    activeSub,
                  )}"
                  class:flow-line--bold={frag.bold}
                  style:left="{line.x + frag.dx}px"
                  style:top="{line.y - vb.geo.topY}px"
                  style:width="{frag.width}px">{frag.text}</span
                >
              {/each}
            {:else}
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
            {/if}
          {/each}
        </p>
      {/if}
    {/each}

    {@render figures?.()}
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
    outline: 2px solid var(--demo-accent);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .flow-line {
    position: absolute;
    white-space: pre;
    pointer-events: auto;
    display: block;
  }

  /* Section title: primary text, weight 700 */
  .flow-line--title {
    font: var(--flow-font-title);
    line-height: var(--flow-lh-title);
    color: var(--ink);
  }

  /* Section description: muted text */
  .flow-line--desc {
    font: var(--flow-font-desc);
    line-height: var(--flow-lh-desc);
    color: var(--muted);
  }

  /* Story tip: muted, same measure as body copy */
  .flow-line--tip {
    font: var(--flow-font-tip);
    line-height: var(--flow-lh-tip);
    color: var(--muted);
  }

  /* Sub heading: primary text */
  .flow-line--sub-heading {
    font: var(--flow-font-sub-heading);
    line-height: var(--flow-lh-sub-heading);
    color: var(--ink);
  }

  /* Active sub heading: the yellow wash behind it is what marks it, so
     the text keeps the ordinary heading colour and stays readable
     through the highlight. */
  .flow-line--active-heading {
    font: var(--flow-font-sub-heading);
    line-height: var(--flow-lh-sub-heading);
    color: var(--ink);
  }

  /* Sub body: slightly muted text */
  .flow-line--sub-body {
    font: var(--flow-font-sub-body);
    line-height: var(--flow-lh-sub-body);
    color: var(--ink-2);
  }

  /* Bold markup runs: same metrics as sub-body, weight 700. Declared
     after the kind classes so the font override wins on shared spans. */
  .flow-line--bold {
    font: var(--flow-font-sub-body-bold);
  }

  /* Tint behind the page title and description */
  .flow-header-panel {
    position: absolute;
    border-radius: 8px;
    background: color-mix(in srgb, var(--demo-accent) 5%, transparent);
    pointer-events: none;
  }

  /* Highlight rects behind active sub lines. Yellow rather than the
     interface blue: this marks passages the way a highlighter does,
     and it should not read as another selectable control. */
  .flow-highlight {
    position: absolute;
    /* One rect per line, stacked edge to edge, so a wider radius would
       scallop the seam between every pair of lines. */
    border-radius: 2px;
    background: rgba(255, 214, 10, 0.38);
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  :global(html.dark) .flow-highlight {
    background: rgba(255, 214, 10, 0.24);
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
    background: var(--hair-2);
    pointer-events: none;
    transition:
      background 0.2s ease,
      opacity 0.2s ease;
  }

  .flow-rule--active {
    background: color-mix(in srgb, var(--demo-accent) 45%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .flow-rule {
      transition: none;
    }
  }

  /* Tip icon */
  .flow-tip-mark {
    position: absolute;
    color: var(--muted);
    pointer-events: none;
    display: flex;
  }

  /* Seen-topic check marks */
  .flow-seen-mark {
    position: absolute;
    color: var(--meter-strong);
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

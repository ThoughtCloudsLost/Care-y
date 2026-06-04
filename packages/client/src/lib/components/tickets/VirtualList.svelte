<script lang="ts" generics="T">
  import type { Snippet } from "svelte";
  import { buildPrefixSums, computeRange } from "./virtual-list-engine.js";

  let {
    items,
    scrollContainer,
    estimateHeight = 200,
    overscan = 3,
    columns = 1,
    virtualizeThreshold = 500,
    _forceVirtualize = false,
    getKey,
    onloadmore,
    onloadprevious,
    children,
  }: {
    items: T[];
    scrollContainer?: HTMLElement;
    estimateHeight?: number;
    overscan?: number;
    columns?: number;
    /**
     * Item count before switching from flat to virtualized rendering.
     * Lower for complex items (cards with images), higher for simple items.
     * Set to 0 to virtualize immediately (not recommended outside tests).
     */
    virtualizeThreshold?: number;
    /** Test-only: skip flat mode and start virtualized immediately. */
    _forceVirtualize?: boolean;
    getKey: (item: T) => string;
    onloadmore?: () => void;
    /** Fire when user scrolls to the top (load older items). */
    onloadprevious?: () => void;
    children: Snippet<[{ item: T; index: number }]>;
  } = $props();

  // Row gap in px, read from the parent's CSS `gap` or `row-gap` property
  // at mount time. This keeps the virtualizer in sync with the parent's
  // spacing without hardcoding a value.
  let wrapperEl: HTMLDivElement | undefined = $state();
  let gap = $state(0);

  $effect(() => {
    if (!wrapperEl) return;
    const parent = wrapperEl.parentElement;
    if (!parent) return;
    const style = getComputedStyle(parent);
    const rowGap = style.rowGap || style.gap || "0";
    gap = parseFloat(rowGap) || 0;
  });

  // ── Virtualization lifecycle ──
  // Starts flat (normal document flow). ResizeObserver measures row heights
  // silently in the background. Switches to absolute positioning (virtualized
  // mode) once item count reaches virtualizeThreshold AND enough rows have
  // been measured for a reliable average height. Once virtualized, stays
  // virtualized (no flipping back).
  let virtualized = $state(false);

  // Allow tests to start in virtualized mode immediately.
  $effect(() => {
    if (_forceVirtualize) virtualized = true;
  });

  // ── Flat-mode rows ──
  // Group all items into rows for the grid layout, keyed by identity.
  const flatRows = $derived.by(() => {
    if (virtualized) return [];
    const rows: {
      row: number;
      key: string;
      items: { item: T; index: number }[];
    }[] = [];
    for (let i = 0; i < items.length; i++) {
      const row = Math.floor(i / columns);
      if (rows.length <= row) {
        rows.push({ row, key: "", items: [] });
      }
      // eslint-disable-next-line security/detect-object-injection -- i is a loop counter bounded by items.length, row is derived from i
      const rowEntry = rows[row];
      const item = items[i]; // eslint-disable-line security/detect-object-injection -- bounded loop counter
      if (rowEntry !== undefined && item !== undefined)
        rowEntry.items.push({ item, index: i });
    }
    for (const entry of rows) {
      entry.key = entry.items.map((vi) => getKey(vi.item)).join("|");
    }
    return rows;
  });

  // ── Shared measurement state (active in both modes) ──

  // Per-row measured heights (including gap). Index = row index.
  let heights: number[] = $state([]);
  let measuredCount = $state(0);
  let scrollTop = $state(0);
  let containerHeight = $state(0);

  const rowCount = $derived(Math.ceil(items.length / columns));

  // Switch to virtualized when items exceed threshold and we have enough
  // height measurements (at least 20 rows, or all rows if fewer) for
  // reliable average-height positioning of unmeasured rows.
  $effect(() => {
    const MIN_MEASURED = 20;
    if (
      !virtualized &&
      items.length >= virtualizeThreshold &&
      measuredCount >= Math.min(rowCount, MIN_MEASURED)
    ) {
      virtualized = true;
    }
  });

  // Running average of measured heights, used as fallback for unmeasured
  // rows. Falls back to estimateHeight + gap when nothing is measured yet.
  const avgHeight = $derived.by(() => {
    if (heights.length === 0) return estimateHeight + gap;
    let sum = 0;
    let count = 0;
    for (const h of heights) {
      if (h > 0) {
        sum += h;
        count++;
      }
    }
    return count > 0 ? sum / count : estimateHeight + gap;
  });

  // Prefix-sum array rebuilt when heights or rowCount changes.
  const prefixSums = $derived(
    virtualized ? buildPrefixSums(heights, rowCount, avgHeight) : [0],
  );

  const visibleRange = $derived(
    virtualized
      ? computeRange(
          scrollTop,
          containerHeight,
          prefixSums,
          items,
          overscan,
          columns,
        )
      : { items: [], startOffset: 0 },
  );

  // eslint-disable-next-line security/detect-object-injection -- rowCount is derived from items.length, always a valid index into prefixSums
  const totalHeight = $derived(prefixSums[rowCount] ?? 0);

  // --- Scroll listener with rAF coalescing (virtualized mode only) ---
  $effect(() => {
    if (!virtualized || !scrollContainer) return;
    const el = scrollContainer;
    let rafId = 0;
    let scheduled = false;

    const flush = (): void => {
      scheduled = false;
      scrollTop = el.scrollTop;
      containerHeight = el.clientHeight;
    };

    const onScroll = (): void => {
      if (!scheduled) {
        scheduled = true;
        rafId = requestAnimationFrame(flush);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    flush(); // initial measurement

    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  });

  // --- ResizeObserver (active in BOTH modes) ---
  // In flat mode it silently collects heights for the future switch.
  // In virtualized mode it updates the prefix sums for positioning.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- imperative-only map for action mount/destroy callbacks, never read reactively
  const rowElements = new Map<number, HTMLDivElement>();

  let observer: ResizeObserver | undefined = $state();
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- imperative batch buffer, flushed in rAF, never read reactively
  let pendingHeights = new Map<number, number>();
  let resizeRafId = 0;

  $effect(() => {
    pendingHeights = new Map();

    const ro = new ResizeObserver((entries) => {
      let dirty = false;
      for (const entry of entries) {
        if (!(entry.target instanceof HTMLDivElement)) continue;
        const rowStr = entry.target.dataset.virtualRow;
        if (rowStr === undefined) continue;
        const row = parseInt(rowStr, 10);
        if (Number.isNaN(row)) continue;
        const rawH =
          entry.borderBoxSize[0]?.blockSize ?? entry.target.offsetHeight;
        const h = rawH + gap; // include gap for prefix-sum math
        // eslint-disable-next-line security/detect-object-injection -- row parsed from data-attribute, validated by NaN check above
        if (heights[row] !== h) {
          pendingHeights.set(row, h);
          dirty = true;
        }
      }

      if (dirty && pendingHeights.size > 0) {
        cancelAnimationFrame(resizeRafId);
        resizeRafId = requestAnimationFrame(() => {
          if (pendingHeights.size === 0) return;

          const next = [...heights];
          const maxRow = Math.max(...pendingHeights.keys());
          while (next.length <= maxRow) next.push(0);
          let newlyMeasured = 0;
          for (const [row, h] of pendingHeights) {
            // eslint-disable-next-line security/detect-object-injection -- row is a numeric key from the pendingHeights Map, originally validated on parse
            if ((next[row] ?? 0) === 0) newlyMeasured++;
            // eslint-disable-next-line security/detect-object-injection -- same row variable
            next[row] = h;
          }
          pendingHeights.clear();
          heights = next;
          measuredCount += newlyMeasured;
        });
      }
    });
    observer = ro;

    return () => {
      ro.disconnect();
      cancelAnimationFrame(resizeRafId);
      observer = undefined;
    };
  });

  // --- Width-change remeasure trigger ---
  // When the scroll container's width changes >50px (entering/exiting
  // split view, or window resize), card text wraps differently, making
  // measured heights stale. Reset measurements to force a re-measure.
  let lastContainerWidth = $state(0);

  $effect(() => {
    if (!scrollContainer) return;
    const el = scrollContainer;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const newWidth = entry.contentRect.width;
      if (
        lastContainerWidth > 0 &&
        Math.abs(newWidth - lastContainerWidth) > 50
      ) {
        heights = [];
        measuredCount = 0;
        if (virtualized) {
          virtualized = false;
        }
      }
      lastContainerWidth = newWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // Svelte action for row elements (both modes).
  // In flat mode, rows are measured silently. In virtualized mode,
  // measurements drive absolute positioning.
  function bindRow(node: HTMLDivElement, row: number): { destroy: () => void } {
    node.dataset.virtualRow = String(row);
    rowElements.set(row, node);
    observer?.observe(node);

    return {
      destroy() {
        observer?.unobserve(node);
        rowElements.delete(row);
      },
    };
  }

  // --- Sentinels for infinite scroll (both modes) ---
  let sentinelEl: HTMLDivElement | undefined = $state();
  let topSentinelEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!sentinelEl || !onloadmore) return;
    const cb = onloadmore;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting === true) cb();
      },
      { rootMargin: "200px" },
    );
    io.observe(sentinelEl);
    return () => io.disconnect();
  });

  // Top sentinel: fires onloadprevious when user scrolls to the top.
  $effect(() => {
    if (!topSentinelEl || !onloadprevious) return;
    const cb = onloadprevious;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting === true) cb();
      },
      { rootMargin: "200px" },
    );
    io.observe(topSentinelEl);
    return () => io.disconnect();
  });

  // Group visible items by row for rendering (virtualized mode only).
  // Each row carries its absolute `top` offset from the prefix sums.
  const visibleRows = $derived.by(() => {
    if (!virtualized) return [];
    const rows: {
      row: number;
      key: string;
      top: number;
      items: { item: T; index: number }[];
    }[] = [];
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- fresh Map per derivation, never mutated after return, SvelteMap proxy overhead unnecessary
    const rowMap = new Map<number, number>();
    for (const vi of visibleRange.items) {
      const row = Math.floor(vi.index / columns);
      let pos = rowMap.get(row);
      if (pos === undefined) {
        pos = rows.length;
        rowMap.set(row, pos);
        rows.push({ row, key: "", top: vi.offset, items: [] });
      }
      // eslint-disable-next-line security/detect-object-injection -- pos is from rowMap, always a valid index into the rows array we're building
      const entry = rows[pos];
      if (entry) entry.items.push({ item: vi.item, index: vi.index });
    }
    for (const entry of rows) {
      entry.key = entry.items.map((vi) => getKey(vi.item)).join("|");
    }
    return rows;
  });
</script>

<!-- Invisible wrapper for gap measurement -->
<div bind:this={wrapperEl} class="virtual-wrapper">
  <!-- Top sentinel: fires onloadprevious when scrolled into view -->
  {#if onloadprevious}
    <div
      bind:this={topSentinelEl}
      class="scroll-sentinel scroll-sentinel--top"
      aria-hidden="true"
      data-sentinel="top"
    ></div>
  {/if}

  {#if virtualized}
    <!-- ══ VIRTUALIZED MODE ══
         Absolutely positioned rows inside a fixed-height container.
         Heights come from real measurements collected during flat mode. -->
    <div
      class="virtual-container"
      data-virtual="container"
      style:height="{totalHeight}px"
    >
      {#each visibleRows as rowData (rowData.key)}
        {@const isSingleCol = columns === 1}
        <div
          class="virtual-row virtual-row--abs"
          class:virtual-row-grid={!isSingleCol}
          data-virtual="row"
          data-grid={!isSingleCol || undefined}
          style:--virtual-columns={columns}
          style:top="{rowData.top}px"
          use:bindRow={rowData.row}
        >
          {#each rowData.items as vi (getKey(vi.item))}
            {@render children({ item: vi.item, index: vi.index })}
          {/each}
        </div>
      {/each}
    </div>
  {:else}
    <!-- ══ FLAT MODE ══
         Normal document flow. ResizeObserver measures in background. -->
    {#each flatRows as rowData (rowData.key)}
      {@const isSingleCol = columns === 1}
      <div
        class="virtual-row"
        class:virtual-row-grid={!isSingleCol}
        data-virtual="row"
        data-grid={!isSingleCol || undefined}
        style:--virtual-columns={columns}
        use:bindRow={rowData.row}
      >
        {#each rowData.items as vi (getKey(vi.item))}
          {@render children({ item: vi.item, index: vi.index })}
        {/each}
      </div>
    {/each}
  {/if}

  <!-- Infinite scroll sentinel (both modes) -->
  <div
    bind:this={sentinelEl}
    class="scroll-sentinel"
    aria-hidden="true"
    data-sentinel="bottom"
  ></div>
</div>

<style>
  .virtual-wrapper {
    display: contents;
  }

  .virtual-container {
    position: relative;
    width: 100%;
  }

  .virtual-row--abs {
    position: absolute;
    left: 0;
    right: 0;
  }

  .virtual-row-grid {
    display: grid;
    grid-template-columns: repeat(var(--virtual-columns, 1), 1fr);
    gap: var(--space-md);
  }

  .scroll-sentinel {
    height: 1px;
    width: 100%;
  }
</style>

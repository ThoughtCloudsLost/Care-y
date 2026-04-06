<script lang="ts" generics="T">
  import type { Snippet } from "svelte";
  import { buildPrefixSums, computeRange } from "./virtual-list-engine.js";

  let {
    items,
    scrollContainer,
    estimateHeight = 200,
    overscan = 3,
    columns = 1,
    onloadmore,
    children,
  }: {
    items: T[];
    scrollContainer?: HTMLElement;
    estimateHeight?: number;
    overscan?: number;
    columns?: number;
    onloadmore?: () => void;
    children: Snippet<[{ item: T; index: number }]>;
  } = $props();

  // Per-row measured heights. Index = row index.
  let heights: number[] = $state([]);
  let scrollTop = $state(0);
  let containerHeight = $state(0);

  const rowCount = $derived(Math.ceil(items.length / columns));

  // Prefix-sum array rebuilt when heights or rowCount changes.
  const prefixSums = $derived(
    buildPrefixSums(heights, rowCount, estimateHeight),
  );

  const visibleRange = $derived(
    computeRange(
      scrollTop,
      containerHeight,
      prefixSums,
      items,
      overscan,
      columns,
    ),
  );

  // eslint-disable-next-line security/detect-object-injection -- rowCount is derived from items.length, always a valid index into prefixSums
  const totalHeight = $derived(prefixSums[rowCount] ?? 0);

  // Spacer heights: space above and below the visible items to maintain
  // correct scroll position while items are in normal document flow.
  const topSpacer = $derived(visibleRange.startOffset);
  const visibleRowIndices = $derived.by(() => {
    const indices: number[] = [];
    for (const vi of visibleRange.items) {
      const row = Math.floor(vi.index / columns);
      if (indices.length === 0 || indices[indices.length - 1] !== row) {
        indices.push(row);
      }
    }
    return indices;
  });
  const bottomSpacer = $derived.by(() => {
    if (visibleRowIndices.length === 0) return 0;
    const lastVisibleRow = visibleRowIndices[visibleRowIndices.length - 1];
    if (lastVisibleRow === undefined) return 0;
    const bottomOfLastVisible = prefixSums[lastVisibleRow + 1] ?? totalHeight;
    return Math.max(0, totalHeight - bottomOfLastVisible);
  });

  // --- Scroll listener with rAF coalescing ---
  $effect(() => {
    if (!scrollContainer) return;
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

  // --- ResizeObserver with batched rAF updates ---
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
        const h =
          entry.borderBoxSize[0]?.blockSize ?? entry.target.offsetHeight;
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
          for (const [row, h] of pendingHeights) {
            // eslint-disable-next-line security/detect-object-injection -- row is a numeric key from the pendingHeights Map, originally validated on parse
            heights[row] = h;
          }
          pendingHeights.clear();
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

  // Svelte action for row elements.
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

  // --- Sentinel for infinite scroll ---
  let sentinelEl: HTMLDivElement | undefined = $state();

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

  // Group visible items by row for rendering.
  const visibleRows = $derived.by(() => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- fresh Map per derivation, never mutated after return, SvelteMap proxy overhead unnecessary
    const rows = new Map<number, { items: { item: T; index: number }[] }>();
    for (const vi of visibleRange.items) {
      const row = Math.floor(vi.index / columns);
      let entry = rows.get(row);
      if (!entry) {
        entry = { items: [] };
        rows.set(row, entry);
      }
      entry.items.push({ item: vi.item, index: vi.index });
    }
    return rows;
  });
</script>

<!-- Top spacer: represents all rows above the visible range -->
<div
  class="virtual-spacer"
  style:height="{topSpacer}px"
  aria-hidden="true"
></div>

<!-- Visible rows: rendered in normal document flow, CSS controls layout -->
{#each [...visibleRows] as [row, rowData] (row)}
  {@const isSingleCol = columns === 1}
  <div
    class="virtual-row"
    class:virtual-row-grid={!isSingleCol}
    style:--virtual-columns={columns}
    use:bindRow={row}
  >
    {#each rowData.items as vi (vi.index)}
      {@render children({ item: vi.item, index: vi.index })}
    {/each}
  </div>
{/each}

<!-- Bottom spacer: represents all rows below the visible range -->
<div
  class="virtual-spacer"
  style:height="{bottomSpacer}px"
  aria-hidden="true"
></div>

<!-- Infinite scroll sentinel -->
<div bind:this={sentinelEl} class="scroll-sentinel" aria-hidden="true"></div>

<style>
  .virtual-spacer {
    flex-shrink: 0;
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

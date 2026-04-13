/**
 * Pure computation engine for the VirtualList component.
 * Extracted to a separate .ts file for clean imports and strict linting.
 */

export interface VirtualItem<T> {
  item: T;
  index: number;
  offset: number;
}

export interface VisibleRange<T> {
  items: VirtualItem<T>[];
  /** Offset of the first rendered item (px from top of scroll content). */
  startOffset: number;
}

/** Safe array access that returns 0 for out-of-bounds indices. */
function at(arr: number[], i: number): number {
  if (i < 0 || i >= arr.length) return 0;
  // eslint-disable-next-line security/detect-object-injection -- numeric index bounded by length check above
  return arr[i] ?? 0;
}

/**
 * Build a prefix-sum array from row heights.
 * `prefixSums[r]` = total height of rows 0..r-1 (the top offset of row r).
 * `prefixSums[rowCount]` = total height of all rows.
 * Unmeasured rows use `estimateHeight`.
 */
export function buildPrefixSums(
  heights: number[],
  rowCount: number,
  estimateHeight: number,
): number[] {
  const sums = new Array<number>(rowCount + 1);
  sums[0] = 0;
  for (let r = 0; r < rowCount; r++) {
    const prev = at(sums, r);
    const measuredH = r < heights.length ? heights[r] : undefined; // eslint-disable-line security/detect-object-injection -- r is a loop counter bounded by rowCount
    sums[r + 1] = prev + (measuredH ?? estimateHeight);
  }
  return sums;
}

/**
 * Binary search: find the first row whose bottom edge is past `target`.
 * Equivalent to: smallest `r` where `prefixSums[r+1] > target`.
 * Used for startRow (first row overlapping the viewport).
 */
function lowerBound(prefixSums: number[], target: number): number {
  let lo = 0;
  let hi = prefixSums.length - 2; // last valid row index
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (at(prefixSums, mid + 1) <= target) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * Binary search: find the last row whose top edge is strictly before `target`.
 * Equivalent to: largest `r` where `prefixSums[r] < target`.
 * Used for endRow (last row overlapping the viewport).
 */
function lastBefore(prefixSums: number[], target: number): number {
  let lo = 0;
  let hi = prefixSums.length - 2;
  let result = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (at(prefixSums, mid) < target) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

/**
 * Uses prefix-sum binary search to find the visible row range in O(log n),
 * then expands by `overscan` rows in each direction.
 *
 * When `columns > 1` (grid mode), each "row" contains `columns` items.
 * The returned items array is flat (individual items), but row-based math
 * keeps the virtualizer from splitting a grid row across the render boundary.
 */
export function computeRange<T>(
  scrollTop: number,
  containerHeight: number,
  prefixSums: number[],
  items: T[],
  overscan: number,
  columns: number,
): VisibleRange<T> {
  const rowCount = prefixSums.length - 1;
  if (rowCount <= 0) return { items: [], startOffset: 0 };

  // Binary search for startRow and endRow.
  // startRow: first row whose bottom edge extends past scrollTop (partially visible).
  // endRow: last row whose top edge is strictly inside the viewport.
  const startRow = lowerBound(prefixSums, scrollTop);
  const endRow = lastBefore(prefixSums, scrollTop + containerHeight);

  // Apply overscan (row-based), clamped to boundaries.
  const overscanStart = Math.max(0, startRow - overscan);
  const overscanEnd = Math.min(rowCount - 1, endRow + overscan);

  // Build the flat items list from overscanStart..overscanEnd rows.
  const adjOffset = at(prefixSums, overscanStart);
  const result: VirtualItem<T>[] = [];
  for (let r = overscanStart; r <= overscanEnd; r++) {
    const rowOffset = at(prefixSums, r);
    for (let c = 0; c < columns; c++) {
      const idx = r * columns + c;
      if (idx >= items.length) break;
      // eslint-disable-next-line security/detect-object-injection -- idx computed from bounded loop counters, checked against items.length above
      const item = items[idx];
      if (item === undefined) break;
      result.push({ item, index: idx, offset: rowOffset });
    }
  }

  return { items: result, startOffset: adjOffset };
}

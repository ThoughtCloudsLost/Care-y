/**
 * Pure window math for TicketTable's row virtualization.
 *
 * The table's rows are uniform height by construction (.data-table td forces
 * nowrap + ellipsis, so every body row is a single line box), which reduces
 * windowing to pitch division instead of the measured prefix sums the card
 * VirtualList needs. Off-window rows are replaced by spacer segments whose
 * pixel heights keep the table's total height, the scrollbar, and the
 * load-more sentinel position exact.
 *
 * A focused row that scrolls out of the window is passed as `pinnedIndex`
 * and kept in its own single-row segment so focus never drops to body when
 * the surrounding rows unmount.
 */

export interface TableWindowParams {
  /** Scroll container scrollTop in px. */
  scrollTop: number;
  /** The tbody's top offset within the scroll content, measured once. */
  offsetTop: number;
  /** Scroll container clientHeight in px. */
  viewportHeight: number;
  /** Uniform row pitch in px (row height including collapsed border). */
  pitch: number;
  rowCount: number;
  /** Extra rows rendered beyond each edge of the visible range. */
  overscan: number;
  /** Row index kept rendered even when outside the window (focused row). */
  pinnedIndex?: number;
}

export type TableWindowSegment =
  | { kind: "gap"; px: number; key: "gap-top" | "gap-mid" | "gap-bottom" }
  | { kind: "rows"; start: number; end: number };

/**
 * Compute the rendered segments for the current scroll position: at most two
 * row ranges (the window, plus the pinned row when it sits outside) with gap
 * segments filling the space before, between, and after them.
 */
export function computeTableWindow(
  params: TableWindowParams,
): TableWindowSegment[] {
  const { scrollTop, offsetTop, viewportHeight, rowCount, overscan } = params;
  if (rowCount <= 0) return [];

  const pitch = params.pitch > 0 ? params.pitch : 1;
  const startPx = Math.max(0, scrollTop - offsetTop);

  let start = Math.floor(startPx / pitch) - overscan;
  start = Math.max(0, Math.min(start, rowCount - 1));
  let end = Math.ceil((startPx + viewportHeight) / pitch) + overscan;
  end = Math.min(rowCount, Math.max(end, start + 1));

  const ranges: [number, number][] = [];
  const pinned = params.pinnedIndex;
  if (pinned !== undefined && pinned >= 0 && pinned < rowCount) {
    if (pinned < start) {
      ranges.push([pinned, pinned + 1], [start, end]);
    } else if (pinned >= end) {
      ranges.push([start, end], [pinned, pinned + 1]);
    } else {
      ranges.push([start, end]);
    }
  } else {
    ranges.push([start, end]);
  }

  const segments: TableWindowSegment[] = [];
  let cursor = 0;
  for (const [s, e] of ranges) {
    if (s > cursor) {
      segments.push({
        kind: "gap",
        px: (s - cursor) * pitch,
        key: cursor === 0 ? "gap-top" : "gap-mid",
      });
    }
    segments.push({ kind: "rows", start: s, end: e });
    cursor = e;
  }
  if (cursor < rowCount) {
    segments.push({
      kind: "gap",
      px: (rowCount - cursor) * pitch,
      key: "gap-bottom",
    });
  }
  return segments;
}

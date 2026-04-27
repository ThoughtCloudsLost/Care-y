/**
 * Compute hidden message gap counts from server-provided fullPosition values.
 *
 * Each item's fullPosition is its 1-based index in the unfiltered sequence.
 * Gap between consecutive items = current.fullPosition - previous.fullPosition - 1.
 *
 * Returns a Map keyed by item identifier with the hidden count before that item.
 * "__before__" = hidden count before the first item.
 * "__after__" = hidden count after the last item.
 */

interface PositionedItem {
  readonly key: string;
  readonly firstPosition: number;
  readonly lastPosition: number;
}

export function computeGaps(
  entries: readonly PositionedItem[],
  totalCount: number | undefined,
): Map<string, number> {
  const gaps = new Map<string, number>();
  if (entries.length === 0) return gaps;

  const first = entries[0];
  if (first === undefined) return gaps;

  if (first.firstPosition > 1) {
    gaps.set("__before__", first.firstPosition - 1);
  }

  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i]; // eslint-disable-line security/detect-object-injection -- bounded loop counter
    if (prev === undefined || curr === undefined) continue;
    const gap = curr.firstPosition - prev.lastPosition - 1;
    if (gap > 0) gaps.set(curr.key, gap);
  }

  const last = entries[entries.length - 1];
  if (last !== undefined && totalCount !== undefined) {
    const afterGap = totalCount - last.lastPosition;
    if (afterGap > 0) gaps.set("__after__", afterGap);
  }

  return gaps;
}

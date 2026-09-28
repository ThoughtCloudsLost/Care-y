/**
 * Project convention for rendering a count that may be a known floor.
 *
 * A bare number is exact. When `isLowerBound` is true the rendered
 * string appends "+", signalling that the true value is at least this
 * high. A later task consumes this for filter option labels where the
 * read-state window caps the observable count.
 */
import * as m from "$lib/paraglide/messages.js";

export function formatCount(count: number, isLowerBound: boolean): string {
  if (isLowerBound) return m.count_at_least({ count });
  return String(count);
}

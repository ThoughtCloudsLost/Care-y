import * as m from "$lib/paraglide/messages.js";

/**
 * The one-line summary the save-filter dialog previews: the active filter
 * parts in order, or a translated "no filters" when there are none.
 */
export function joinFilterSummary(parts: readonly string[]): string {
  return parts.length > 0 ? parts.join(", ") : m.saved_filter_summary_none();
}

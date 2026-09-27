import * as m from "$lib/paraglide/messages.js";
import { joinFilterSummary } from "./filter-summary.js";

/** Which library article filters are active, as the summary needs them. */
export interface KbFilterSummaryInput {
  readonly categoryCount: number;
  readonly rated: boolean;
  readonly byAuthor: boolean;
  readonly dateRange: boolean;
}

/**
 * The save-filter dialog's preview of the active library filters. The
 * categories are counted; the other filters read as their pill labels.
 */
export function buildKbFilterSummary(filters: KbFilterSummaryInput): string {
  const parts: string[] = [];
  const count = filters.categoryCount;
  if (count > 0) {
    parts.push(
      count === 1
        ? m.library_filter_summary_categories_one({ count })
        : m.library_filter_summary_categories_other({ count }),
    );
  }
  if (filters.rated) parts.push(m.library_filter_rating());
  if (filters.byAuthor) parts.push(m.library_filter_author());
  if (filters.dateRange) parts.push(m.library_filter_date_range());
  return joinFilterSummary(parts);
}

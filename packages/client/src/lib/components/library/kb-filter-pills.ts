/**
 * Knowledge base filter pills for category and author, built from option
 * lists the caller has already decrypted. The library page and the
 * dashboard's KB section build their pills here.
 */

import type {
  FilterOption,
  NamedOptionSource,
  PillDefinition,
} from "$lib/components/filters/filter-types.js";
import * as m from "$lib/paraglide/messages.js";

/** Categories, several at once. */
export function buildKbCategoryPill(
  categories: readonly NamedOptionSource[],
  selected: ReadonlySet<string>,
  loading: boolean,
): PillDefinition {
  const options: FilterOption[] = categories.map((c) => ({
    value: c.id,
    label: c.name ?? "...",
  }));
  return {
    id: "category",
    label: m.library_filter_category(),
    mode: "multi",
    options,
    selected,
    loading,
  };
}

/** One author. Authors whose name has not decrypted are left out. */
export function buildKbAuthorPill(
  authors: readonly NamedOptionSource[],
  selected: string | null,
): PillDefinition {
  const options: FilterOption[] = [];
  for (const a of authors) {
    if (a.name !== null) options.push({ value: a.id, label: a.name });
  }
  return {
    id: "author",
    label: m.library_filter_author(),
    mode: "single",
    options,
    selected,
  };
}

/**
 * Open state for one dashboard section's filter row.
 *
 * The filter button is a plain toggle: the row shows exactly while it is
 * open. A section whose saved filters are active once they have been
 * applied starts open, so a filtered section shows its filters. After
 * that only the button opens or closes it.
 */

import { untrack } from "svelte";

export interface SectionFilterToggle {
  /** Id of the filter row, for the button's aria-controls. */
  readonly rowId: string;
  /** The filter button is open. */
  readonly open: boolean;
  /** The row is shown. Always equal to `open`. */
  readonly shown: boolean;
  toggle(): void;
}

/**
 * @param activeCount The section's active filter count.
 * @param filtersReady True once the section's saved filters have been
 *   applied, so `activeCount` counts them.
 */
export function createSectionFilterToggle(
  rowId: string,
  activeCount: () => number,
  filtersReady: () => boolean,
): SectionFilterToggle {
  let open = $state(false);
  // Plain flags: neither is read by anything reactive.
  let readySeen = false;
  let toggled = false;

  $effect(() => {
    if (readySeen || !filtersReady()) return;
    readySeen = true;
    untrack(() => {
      if (!toggled && activeCount() > 0) open = true;
    });
  });

  return {
    rowId,
    get open(): boolean {
      return open;
    },
    get shown(): boolean {
      return open;
    },
    toggle(): void {
      toggled = true;
      open = !open;
    },
  };
}

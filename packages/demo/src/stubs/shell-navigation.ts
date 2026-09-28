/**
 * Stub for $lib/shell/navigation.
 *
 * The real module uses history.back() for in-app navigation, which
 * in the iframe would navigate the OUTER page away. This stub
 * always uses goto(resolve(fallback)) through the demo router's
 * goto interception.
 */

import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { emptyLaneFilterState } from "$lib/prefs/dashboard-filters.svelte.js";
import { filterStore } from "$lib/stores/filters.svelte.js";

/**
 * No-op in the demo. The real module tracks afterNavigate calls
 * to decide whether history.back() is safe.
 */
export function markNavigated(): void {
  // No-op: the demo router handles navigation lifecycle directly
}

type AppRoute = `/${string}`;

/**
 * Navigate back via goto (never history.back in the iframe).
 * Resolved through the demo router's goto interception.
 */
export function shellBack(fallbackRoute: AppRoute = "/"): void {
  void goto(resolve(fallbackRoute));
}

/**
 * Same as the real module: opens the tickets page showing one queue,
 * with every other filter cleared and the current sort kept. It needs no
 * change for the iframe, since goto already goes through the demo router.
 */
export function openTicketsForQueue(queueId: string): void {
  filterStore.applyState({
    ...emptyLaneFilterState(),
    queueIds: [queueId],
    sortField: filterStore.sort.field,
    sortDirection: filterStore.sort.direction,
  });
  void goto(resolve("/tickets"));
}

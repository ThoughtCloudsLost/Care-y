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

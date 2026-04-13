/**
 * Centralized back navigation for shell routes.
 *
 * Uses browser history when available (user navigated within the app).
 * Falls back to a default route when this is the first page in the session
 * (deep link, bookmark, or fresh tab).
 */
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";

/**
 * Whether the user has performed at least one in-app navigation.
 * Before this is true, history.back() would exit the app (no prior
 * history entry from within the SPA).
 */
let _hasNavigated = false;

/**
 * Tracks afterNavigate calls. The first fires on initial page load
 * (no history entry to go back to). The flag is set after the second.
 */
let _afterNavigateCount = 0;

/**
 * Called from AppShell's afterNavigate on every navigation.
 * Skips the first call (initial page load) and sets the flag
 * on the second (first real in-app navigation).
 */
export function markNavigated(): void {
  _afterNavigateCount++;
  if (_afterNavigateCount > 1) {
    _hasNavigated = true;
  }
}

// Type-safe route parameter for resolve(). Accepts any string that
// starts with "/" which covers all valid app routes.
type AppRoute = `/${string}`;

/**
 * Navigate back using browser history. If no in-app history exists
 * (deep link scenario), falls back to the given route.
 *
 * @param fallbackRoute - Route path to navigate to when there is no
 *                        history (e.g., "/tickets"). Resolved via
 *                        SvelteKit's resolve() internally.
 */
export function shellBack(fallbackRoute: AppRoute = "/"): void {
  if (_hasNavigated) {
    history.back();
  } else {
    void goto(resolve(fallbackRoute));
  }
}

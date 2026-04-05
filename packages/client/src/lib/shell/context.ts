/**
 * Shell-level Svelte 5 context for app layout state.
 *
 * Set in AppShell, readable by any authenticated route.
 * Keeps DOM queries (like the scroll container) centralized
 * so routes don't depend on Konsta's internal class names.
 */

import { createContext } from "svelte";

/**
 * The Page scroll container element.
 *
 * Wrapped in a getter function because the element is resolved
 * during onMount (after child component init). The getter returns
 * undefined until mount, then the resolved element for the rest
 * of the session. Routes pass the return value to components that
 * accept `HTMLElement | undefined` (like VirtualList.scrollContainer).
 */
export const [getScrollContainer, setScrollContainer] =
  createContext<() => HTMLElement | undefined>();

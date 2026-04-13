/**
 * Shell-level Svelte 5 context for app layout state.
 *
 * Set in AppShell, readable by any authenticated route.
 * Keeps DOM queries (like the scroll container) centralized
 * so routes don't depend on Konsta's internal class names.
 */

import { createContext } from "svelte";
import type { TabbarOverride, NavbarOverride } from "./types.js";

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

/**
 * Tabbar override: any route can temporarily replace the tab bar
 * with custom actions by setting this context. AppShell renders the
 * override actions as TabbarLink items. Set to undefined to restore
 * the normal tab bar.
 *
 * Flow: AppShell (parent) creates the reactive container and calls
 * setTabbarOverrideCtx(container). Child routes call getTabbarOverrideCtx()
 * to get the container, then mutate container.current to set/clear the override.
 * AppShell reads container.current reactively to swap the tab bar.
 */
export interface TabbarOverrideContainer {
  current: TabbarOverride | undefined;
}

export const [getTabbarOverrideCtx, setTabbarOverrideCtx] =
  createContext<TabbarOverrideContainer>();

/**
 * Tabbar hidden: any route can hide the tab bar entirely by setting
 * this to true. Used by the ticket detail route to give the full
 * viewport to the chat + compose bar.
 *
 * Flow: AppShell creates the reactive container and calls setTabbarHiddenCtx().
 * Child routes call getTabbarHiddenCtx(), then mutate container.current = true
 * on mount and reset to false on unmount.
 */
export interface TabbarHiddenContainer {
  current: boolean;
}

export const [getTabbarHiddenCtx, setTabbarHiddenCtx] =
  createContext<TabbarHiddenContainer>();

/**
 * Navbar override: any route can replace the default Navbar content
 * (avatar + org name + search/new-ticket) with custom left/title/right
 * snippets. The real Konsta Navbar remains in AppShell (Glass blur,
 * safe-area handling, theme adaptation preserved). Only the slot
 * content changes.
 *
 * Flow: AppShell creates the reactive container and calls setNavbarOverrideCtx().
 * Child routes call getNavbarOverrideCtx(), then set container.current to a
 * NavbarOverride object on mount and clear to undefined on unmount.
 */
export interface NavbarOverrideContainer {
  current: NavbarOverride | undefined;
}

export const [getNavbarOverrideCtx, setNavbarOverrideCtx] =
  createContext<NavbarOverrideContainer>();

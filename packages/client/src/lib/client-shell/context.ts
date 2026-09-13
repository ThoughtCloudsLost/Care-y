/**
 * Client-portal shell context.
 *
 * The (client) layout owns the navbar, the quick-exit control, and the
 * drawer. Each client page owns its own session. This container is how a
 * page hands the layout what it needs while that page is showing: the
 * callback that zeroes its key material, the org's safe exit URL, and the
 * drawer entries it offers.
 *
 * Only a callback crosses this boundary, never key material.
 *
 * Flow mirrors the org shell (lib/shell/context.ts): the layout creates the
 * container and calls setClientShellCtx; pages call getClientShellCtx, set
 * container.current in an $effect, and clear it on cleanup.
 */

import { createContext, type Component, type Snippet } from "svelte";

/** Exit target when the org has not configured one. */
export const DEFAULT_SAFE_URL = "https://weather.gov";

export interface ClientDrawerAction {
  /** Stable key for the each block. */
  readonly id: string;
  readonly label: string;
  readonly icon?: Component;
  readonly onclick: () => void;
  /** Renders in the danger slot. Used for sign out. */
  readonly destructive?: boolean;
}

export interface ClientShellState {
  /**
   * Zero this page's key material. Quick exit calls it before navigating
   * away, and the pagehide fallback calls it on unload.
   */
  readonly ondestroy: () => void;
  /**
   * Exit target for this page, when it knows one the shell does not. The
   * portal bootstrap carries its own copy, so a channel page supplies it.
   *
   * Optional on purpose. The shell reads the org's configured URL from the
   * branding payload, so a page that publishes nothing here still exits
   * where the org chose. Making every page re-supply it would put the
   * safety property back behind something a new page can forget, which is
   * the reason quick exit itself is rendered once by the shell.
   */
  readonly safeUrl?: string;
  /** Page-specific drawer entries, listed above the standing items. */
  readonly actions: readonly ClientDrawerAction[];
  /**
   * Row rendered below the navbar while this page is showing.
   *
   * The shell owns the navbar, so a page that needs a row under it hands
   * one over rather than rendering chrome itself. In-thread search arrives
   * this way, in the same slot and through the same components four org
   * surfaces already use.
   */
  readonly subnavbar?: Snippet;
  /**
   * True for chat-shaped pages. The layout's scroll container stops
   * scrolling so a PageLayout lockScroll region inside can own the scroll
   * and pin the composer, matching how the org ticket detail works.
   */
  readonly lockScroll?: boolean;
  /**
   * Reactive getter: true while the subnavbar row should collapse.
   * The shell forwards it to ShellNavbar.
   */
  readonly subnavbarHidden?: () => boolean;
}

export interface ClientShellContainer {
  current: ClientShellState | undefined;
}

export const [getClientShellCtx, setClientShellCtx] =
  createContext<ClientShellContainer>();

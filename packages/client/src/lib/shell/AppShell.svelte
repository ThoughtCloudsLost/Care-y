<!--
  App shell: persistent navigation chrome across all routes.

  Single Konsta Page wraps everything. Navbar is sticky top. Bottom bar
  uses a Toolbar with two ToolbarPane children (Safari-style split glass
  pills): tabs pane inherits tabbar context, More pane overrides with
  tabbar={false} (patched in konsta@5.0.8.patch) to disable highlight
  and w-full.

  ARIA roles on TabbarLink (role="tab", aria-selected) are possible because
  we patch Konsta's Link.svelte to move the hardcoded role="link" BEFORE
  restProps, so our overrides take precedence. See patches/konsta@5.0.8.patch.

  Pull-to-refresh: two-phase touch listener pattern.
  - Passive touchstart on .k-page records startY; bails if scrollTop > 0.
  - { passive: false } touchmove added to window only when a downward drag from
    scrollTop === 0 is confirmed. Removed on touchend / touchcancel / upward delta.
  - This avoids attaching a blocking listener to the root scroll container globally.
  - Any child route can suppress PTR via setContext(PTR_CONTEXT_KEY, false).
-->
<script lang="ts">
  import {
    Page,
    Navbar,
    Link,
    Searchbar,
    Toolbar,
    TabbarLink,
    ToolbarPane,
  } from "konsta/svelte";
  import {
    House,
    Ticket,
    CalendarDays,
    Ellipsis,
    Search,
    TicketPlus,
  } from "@lucide/svelte";
  import { tick, onMount, getContext } from "svelte";
  import type { Component } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { TabId, AppShellProps } from "./types";
  import { PTR_CONTEXT_KEY } from "./ptr-context";
  import { themeStore } from "$lib/stores/theme.svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import {
    setScrollContainer,
    setTabbarOverrideCtx,
    setTabbarHiddenCtx,
    setNavbarOverrideCtx,
    type TabbarOverrideContainer,
    type TabbarHiddenContainer,
    type NavbarOverrideContainer,
  } from "./context";

  const SCROLL_CONTAINER_ID = "app-scroll-container";

  // Scroll container ref, resolved on mount. $state so the context
  // getter is reactive when read inside $derived or $effect.
  let scrollContainerEl = $state<HTMLElement | undefined>();
  setScrollContainer(() => scrollContainerEl);

  // Tabbar override: child routes can replace the tab bar with custom
  // actions by mutating this container. $state makes it reactive.
  const tabbarOverrideContainer: TabbarOverrideContainer = $state({
    current: undefined,
  });
  setTabbarOverrideCtx(tabbarOverrideContainer);
  const tabbarOverride = $derived(tabbarOverrideContainer.current);

  // Tabbar hidden: child routes can hide the tab bar entirely (e.g.,
  // ticket detail with its own compose bar). $state makes it reactive.
  const tabbarHiddenContainer: TabbarHiddenContainer = $state({
    current: false,
  });
  setTabbarHiddenCtx(tabbarHiddenContainer);
  const tabbarHidden = $derived(tabbarHiddenContainer.current);

  // Navbar override: child routes can replace the default Navbar slot
  // content (avatar + org name + search/new) with custom left/title/right
  // snippets. The real Konsta Navbar stays in AppShell for Glass blur +
  // safe-area + theme adaptation.
  const navbarOverrideContainer: NavbarOverrideContainer = $state({
    current: undefined,
  });
  setNavbarOverrideCtx(navbarOverrideContainer);
  const navbarOverride = $derived(navbarOverrideContainer.current);

  let {
    activeTab,
    orgName = "CARE-Y",
    ontabchange,
    children,
  }: AppShellProps = $props();

  let searchOpen = $state(false);
  let searchQuery = $state("");
  let searchContainerEl: HTMLDivElement | undefined = $state();

  async function openSearch(): Promise<void> {
    searchOpen = true;
    await tick();
    searchContainerEl
      ?.querySelector<HTMLInputElement>("input[type='text']")
      ?.focus();
  }

  function closeSearch(): void {
    searchOpen = false;
    searchQuery = "";
  }

  interface TabDef {
    readonly id: TabId;
    readonly label: () => string;
    readonly icon: Component;
  }

  const allTabs: readonly TabDef[] = [
    { id: "home", label: () => m.nav_home(), icon: House },
    { id: "tickets", label: () => m.nav_tickets(), icon: Ticket },
    { id: "calendar", label: () => m.nav_calendar(), icon: CalendarDays },
  ];

  // ── Pull-to-refresh ──────────────────────────────────────────────────

  const queryClient = useQueryClient();

  // Route opt-out: child calls setContext(PTR_CONTEXT_KEY, false)
  const ptrEnabled: boolean = getContext(PTR_CONTEXT_KEY) !== false;

  const PTR_THRESHOLD = 72; // px of overscroll to trigger refresh
  const PTR_MAX_PULL = 120; // px cap for visual travel
  const PTR_RESISTANCE = 0.4; // dampen pull distance

  type PtrPhase = "idle" | "pulling" | "releasing" | "refreshing";

  let ptrPhase = $state<PtrPhase>("idle");
  let ptrPullY = $state(0); // 0..PTR_MAX_PULL, drives indicator position
  let ptrProgress = $state(0); // 0..1, drives iOS arc fill

  let startX = 0;
  let startY = 0;
  let ptrLocked = false; // true once we confirm this is a vertical pull, not lateral scroll

  // Cleanup refs for window listeners added dynamically
  let removeMoveListener: (() => void) | null = null;
  let removeEndListener: (() => void) | null = null;

  function cleanupWindowListeners(): void {
    removeMoveListener?.();
    removeEndListener?.();
    removeMoveListener = null;
    removeEndListener = null;
  }

  function onTouchMove(e: TouchEvent): void {
    // Ignore pinch-to-zoom (multi-touch)
    if (e.touches.length > 1) {
      cleanupWindowListeners();
      ptrPhase = "idle";
      ptrPullY = 0;
      ptrProgress = 0;
      return;
    }

    const touch = e.touches[0];
    if (!touch) return;
    const dy = touch.clientY - startY;
    const dx = touch.clientX - startX;

    if (dy <= 0) {
      // Scrolling up -- bail out of PTR tracking
      cleanupWindowListeners();
      ptrPhase = "idle";
      ptrPullY = 0;
      ptrProgress = 0;
      return;
    }

    // If horizontal movement exceeds vertical, this is a lateral scroll
    // (e.g., swiping through the filter pill bar). Bail out.
    if (!ptrLocked && Math.abs(dx) > dy) {
      cleanupWindowListeners();
      ptrPhase = "idle";
      ptrPullY = 0;
      ptrProgress = 0;
      return;
    }

    // Once vertical pull exceeds a small threshold, lock into PTR mode
    if (!ptrLocked && dy > 8) {
      ptrLocked = true;
    }

    if (!ptrLocked) return;

    e.preventDefault();

    const clamped = Math.min(dy * PTR_RESISTANCE, PTR_MAX_PULL);
    ptrPullY = clamped;
    ptrProgress = Math.min(clamped / PTR_THRESHOLD, 1);
    ptrPhase = "pulling";
  }

  function onTouchEnd(): void {
    cleanupWindowListeners();

    if (ptrPhase !== "pulling") return;

    if (ptrPullY >= PTR_THRESHOLD * PTR_RESISTANCE) {
      void triggerRefresh();
    } else {
      // Didn't pull far enough -- snap back
      ptrPhase = "idle";
      ptrPullY = 0;
      ptrProgress = 0;
    }
  }

  async function triggerRefresh(): Promise<void> {
    ptrPhase = "refreshing";
    ptrPullY = PTR_THRESHOLD * PTR_RESISTANCE; // hold at threshold during spin

    await queryClient.invalidateQueries();

    // Brief hold so the spinner is visible even on fast responses
    await new Promise<void>((resolve) => setTimeout(resolve, 400));

    ptrPhase = "releasing";
    ptrPullY = 0;
    ptrProgress = 0;

    // Let the CSS transition finish before going fully idle
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    ptrPhase = "idle";
  }

  function onPageTouchStart(e: TouchEvent): void {
    if (!ptrEnabled) return;
    if (ptrPhase === "refreshing" || ptrPhase === "releasing") return;

    const scrollEl = document.getElementById(SCROLL_CONTAINER_ID);
    if (!scrollEl || scrollEl.scrollTop > 0) return;

    // Ignore multi-touch (pinch-to-zoom)
    if (e.touches.length > 1) return;

    // Suppress PTR when the touch starts inside a fixed-position overlay
    // (Popover, Sheet, Popup, Dialog, etc.). Overlays use position:fixed
    // and sit above the scroll container visually even though they may be
    // DOM descendants of it. Walk up from the touch target; if any ancestor
    // (before the scroll container) is position:fixed, this is an overlay.
    const target = e.target;
    if (target instanceof HTMLElement) {
      let el: HTMLElement | null = target;
      while (el && el !== scrollEl) {
        if (getComputedStyle(el).position === "fixed") return;
        el = el.parentElement;
      }
    }

    const touch = e.touches[0];
    if (!touch) return;
    startX = touch.clientX;
    startY = touch.clientY;
    ptrLocked = false;

    // Dynamically attach blocking listeners to window only now
    const moveOpts: AddEventListenerOptions = { passive: false };

    window.addEventListener("touchmove", onTouchMove, moveOpts);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    removeMoveListener = () =>
      window.removeEventListener("touchmove", onTouchMove, moveOpts);
    removeEndListener = () => {
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }

  onMount(() => {
    // Resolve the scroll container and store it so the context getter
    // returns the element for any route that reads it after mount.
    const el = document.getElementById(SCROLL_CONTAINER_ID);
    if (el) scrollContainerEl = el;

    if (!ptrEnabled) return;

    // Page is rendered synchronously by Konsta before onMount fires,
    // so no tick() needed. Attach passive touchstart here; the blocking
    // touchmove is added dynamically per-gesture in onPageTouchStart.
    el?.addEventListener("touchstart", onPageTouchStart, {
      passive: true,
    });

    return () => {
      el?.removeEventListener("touchstart", onPageTouchStart);
      cleanupWindowListeners();
    };
  });

  // ── iOS arc indicator helpers ────────────────────────────────────────

  const ARC_R = 11; // SVG circle radius
  const ARC_CIRCUM = 2 * Math.PI * ARC_R; // ~69.1

  // progress 0..1 -> stroke-dashoffset (full gap -> no gap)
  function arcOffset(progress: number): number {
    return ARC_CIRCUM * (1 - progress);
  }

  // Indicator sits just below the navbar (44px Konsta navbar + safe-area-inset-top).
  // Travels down slightly as the user pulls for a natural feel.
  // The idle branch is unreachable in the template ({#if ptrPhase !== "idle"}),
  // but keeping it as a string avoids a mixed number|string type.
  const NAVBAR_H = 44;
  const indicatorTop = $derived(
    ptrPhase === "idle"
      ? "-40px"
      : `calc(env(safe-area-inset-top, 0px) + ${String(NAVBAR_H + Math.round(ptrPullY * 0.2) + 8)}px)`,
  );
</script>

<Page id={SCROLL_CONTAINER_ID}>
  <Navbar role="banner">
    {#snippet left()}
      {#if navbarOverride?.left}
        {@render navbarOverride.left()}
      {:else}
        <Link iconOnly role="button" aria-label={m.nav_account()}>
          <span class="navbar-avatar" aria-hidden="true">JN</span>
        </Link>
      {/if}
    {/snippet}
    {#snippet title()}
      {#if navbarOverride?.title}
        {#if typeof navbarOverride.title === "string"}
          <span class="heading-compact">{navbarOverride.title}</span>
        {:else}
          {@render navbarOverride.title()}
        {/if}
      {:else}
        <span class="heading-compact" class:heading-hidden={searchOpen}
          >{orgName}</span
        >
      {/if}
    {/snippet}
    {#snippet right()}
      {#if navbarOverride?.right}
        {@render navbarOverride.right()}
      {:else if !searchOpen}
        <Link
          iconOnly
          role="button"
          aria-label={m.nav_search()}
          onclick={openSearch}
        >
          <Search size={22} aria-hidden="true" />
        </Link>
        <Link iconOnly role="button" aria-label={m.nav_new_ticket()}>
          <TicketPlus size={22} aria-hidden="true" />
        </Link>
      {/if}
    {/snippet}
    {#if searchOpen && !navbarOverride}
      <div
        bind:this={searchContainerEl}
        class="search-overlay search-overlay-open"
      >
        <Searchbar
          bind:value={searchQuery}
          disableButton
          onDisable={closeSearch}
          onClear={() => (searchQuery = "")}
        />
      </div>
    {/if}
  </Navbar>

  <!-- Pull-to-refresh indicator -->
  {#if ptrPhase !== "idle"}
    <div
      class="ptr-indicator"
      class:ptr-indicator-ios={themeStore.uiTheme === "ios"}
      class:ptr-indicator-material={themeStore.uiTheme === "material"}
      class:ptr-refreshing={ptrPhase === "refreshing"}
      class:ptr-releasing={ptrPhase === "releasing"}
      style:top={indicatorTop}
      aria-hidden="true"
    >
      {#if themeStore.uiTheme === "ios"}
        <!-- Circular arc that fills on pull, spins on release/refresh -->
        <svg
          class="ptr-arc"
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            class="ptr-arc-track"
            cx="14"
            cy="14"
            r={ARC_R}
            stroke-width="2.5"
          />
          <circle
            class="ptr-arc-fill"
            cx="14"
            cy="14"
            r={ARC_R}
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-dasharray={ARC_CIRCUM}
            stroke-dashoffset={ptrPhase === "pulling"
              ? arcOffset(ptrProgress)
              : 0}
            transform="rotate(-90 14 14)"
          />
        </svg>
      {:else}
        <!-- Material: simple card with a spinner -->
        <div class="ptr-material-card">
          <svg
            class="ptr-spinner"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-dasharray="56.5"
              stroke-dashoffset={ptrPhase === "pulling"
                ? 56.5 * (1 - ptrProgress)
                : 0}
            />
          </svg>
        </div>
      {/if}
    </div>
  {/if}

  {#if tabbarHidden}
    <!-- Tabbar hidden: route provides its own bottom bar (e.g., ShellMessagebar) -->
  {:else if tabbarOverride}
    {@const DismissIcon = tabbarOverride.dismiss.icon}
    <div role="toolbar" aria-label={tabbarOverride.ariaLabel}>
      <Toolbar tabbar tabbarIcons class="native-tabbar left-0 bottom-0 fixed">
        {#if themeStore.uiTheme === "ios"}
          <div
            class="backdrop-blur-[2px] fixed left-0 bottom-0 w-full h-[calc(env(safe-area-inset-bottom,0px)+48px+32px)] mask-t-to-100% mask-t-from-70% pointer-events-none bg-gradient-to-t from-ios-light-surface to-transparent dark:from-ios-dark-surface/50"
          ></div>
        {/if}
        <ToolbarPane tabbar={false}>
          {#each tabbarOverride.actions as action (action.id)}
            {@const ActionIcon = action.icon}
            <Link iconOnly onclick={action.onclick} aria-label={action.label}>
              <ActionIcon size={24} aria-hidden="true" />
            </Link>
          {/each}
        </ToolbarPane>
        <ToolbarPane tabbar={false}>
          <Link
            iconOnly
            aria-label={tabbarOverride.dismiss.ariaLabel}
            onclick={tabbarOverride.dismiss.onclick}
          >
            <DismissIcon size={24} aria-hidden="true" />
          </Link>
        </ToolbarPane>
      </Toolbar>
      <span
        class="fixed bottom-0 left-0 right-0 flex items-center justify-center pointer-events-none font-semibold text-sm h-12 z-50"
        role="status"
      >
        {tabbarOverride.label}
      </span>
    </div>
  {:else}
    <nav aria-label={m.nav_main()}>
      <Toolbar
        tabbar
        tabbarIcons
        class="native-tabbar left-0 bottom-0 fixed"
        role="tablist"
        aria-label={m.nav_main()}
      >
        <ToolbarPane>
          {#each allTabs as tab (tab.id)}
            <TabbarLink
              active={activeTab === tab.id}
              onclick={() => ontabchange(tab.id)}
              role="tab"
              aria-label={tab.label()}
              aria-selected={activeTab === tab.id}
              colors={{
                textActiveIos: "text-[var(--brand-text)]",
                textActiveMaterial: "text-[var(--brand-text)]",
              }}
            >
              {#snippet icon()}{@const Icon = tab.icon}<Icon
                  size={24}
                  aria-hidden="true"
                />{/snippet}
            </TabbarLink>
          {/each}
        </ToolbarPane>
        <ToolbarPane tabbar={false}>
          <Link iconOnly aria-label={m.nav_more()}>
            <Ellipsis size={24} aria-hidden="true" />
          </Link>
        </ToolbarPane>
      </Toolbar>
    </nav>
  {/if}

  <main
    id="main-content"
    class="main-content"
    class:tabbar-hidden={tabbarHidden}
  >
    {@render children()}
  </main>
</Page>

<style>
  /* iOS only: override Konsta's pb-safe-4 (safe-area + 16px) to match native
     iOS tab bar positioning. Native uses only the safe-area inset. */
  :global(.k-ios .native-tabbar.k-toolbar) {
    padding-bottom: var(--k-safe-area-bottom) !important;
  }

  /* iOS only: the bg layer uses calc(safe-area + 16px + 48px + 16px) = safe-area + 80px.
     Native height is safe-area + 48px (icons-only tabbar). */
  :global(.k-ios .native-tabbar.k-toolbar > div:first-child) {
    height: calc(var(--k-safe-area-bottom) + 48px) !important;
  }

  :global(.k-ios) .main-content {
    padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0px));
  }

  :global(.k-material) .main-content {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
  }

  .main-content.tabbar-hidden {
    padding-bottom: 0 !important;
  }

  .navbar-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--brand-fill, var(--brand-primary));
    color: #ffffff;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .heading-hidden {
    opacity: 0;
    transition: opacity 150ms ease;
  }

  .search-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding-inline: 8px;
    z-index: 50;
    opacity: 0;
    pointer-events: none;
    transform: scaleX(0.85);
    transform-origin: right center;
    transition:
      opacity 200ms ease,
      transform 350ms cubic-bezier(0.2, 1, 0.4, 1);
  }

  .search-overlay-open {
    opacity: 1;
    pointer-events: auto;
    transform: scaleX(1);
  }

  /* ── Pull-to-refresh indicator ──────────────────────────────────── */

  .ptr-indicator {
    position: fixed;
    left: 50%;
    translate: -50% 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  /* Animate the snap-back only, not the pull-down tracking */
  .ptr-indicator.ptr-releasing {
    transition: top 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* iOS: bare arc, no card background */
  .ptr-indicator-ios .ptr-arc {
    display: block;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.25));
  }

  .ptr-arc-track {
    stroke: color-mix(in srgb, var(--brand-primary, #888) 25%, transparent);
  }

  .ptr-arc-fill {
    stroke: var(--brand-primary, currentColor);
    transition: stroke-dashoffset 50ms linear;
  }

  /* Spin the arc when refreshing or releasing */
  .ptr-refreshing .ptr-arc,
  .ptr-releasing .ptr-arc {
    animation: ptr-spin 0.8s linear infinite;
  }

  /* Material: card shadow pill */
  .ptr-material-card {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--k-surface-1, #fff);
    box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.18),
      0 0 0 1px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(html.dark) .ptr-material-card {
    background: var(--k-surface-2, #1e1e1e);
  }

  .ptr-spinner {
    stroke: var(--brand-primary, currentColor);
    transition: stroke-dashoffset 50ms linear;
  }

  .ptr-refreshing .ptr-spinner,
  .ptr-releasing .ptr-spinner {
    animation: ptr-spin 0.8s linear infinite;
  }

  @keyframes ptr-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

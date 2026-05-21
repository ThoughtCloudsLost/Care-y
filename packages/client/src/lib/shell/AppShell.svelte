<!--
  App shell: persistent navigation chrome across all routes.

  PageShell owns the Konsta Page, Navbar height measurement, and the
  blur-through scroll container. AppShell layers authenticated features
  on top: complex Navbar, subnavbar, pull-to-refresh, tabbar, panels.

  Navbar sits at the top of the Page flex column. Bottom bar uses a
  Toolbar with two ToolbarPane children (Safari-style split glass
  pills): tabs pane inherits tabbar context, More pane overrides with
  tabbar={false} (patched in konsta@5.0.8.patch) to disable highlight
  and w-full.

  ARIA roles on TabbarLink (role="tab", aria-selected) are possible because
  we patch Konsta's Link.svelte to move the hardcoded role="link" BEFORE
  restProps, so our overrides take precedence. See patches/konsta@5.0.8.patch.

  Pull-to-refresh: two-phase touch listener pattern.
  - Passive touchstart on <main> records startY; bails if the nearest
    scrollable ancestor has scrollTop > 0.
  - { passive: false } touchmove added to window only when a downward drag from
    scrollTop === 0 is confirmed. Removed on touchend / touchcancel / upward delta.
  - This avoids attaching a blocking listener to the root scroll container globally.
  - Any child route can suppress PTR via usePTR().setEnabled(false) during init.
-->
<script lang="ts">
  import {
    Navbar,
    Link,
    Searchbar,
    Toolbar,
    TabbarLink,
    ToolbarPane,
  } from "konsta/svelte";
  import PageShell from "./PageShell.svelte";
  import {
    House,
    Ticket,
    BookOpen,
    Ellipsis,
    Search,
    User,
  } from "@lucide/svelte";
  import { getOrgLogoUrl } from "$lib/branding/logo-url.svelte.js";
  import CallIndicator from "./CallIndicator.svelte";
  import { tick, onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import type { Component } from "svelte";
  import { browser } from "$app/environment";
  import { beforeNavigate, afterNavigate, goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import type { TabId, AppShellProps } from "./types";
  import { providePTR } from "./ptr-context.svelte.js";
  import { themeStore } from "$lib/stores/theme.svelte";
  import { useQueryClient, createQuery } from "@tanstack/svelte-query";
  import { Permission } from "@care-y/shared";
  import {
    adminKeys,
    authKeys,
    ticketsKeys,
    kbKeys,
    volunteerKeys,
  } from "$lib/query/keys.js";
  import {
    setScrollContainer,
    setTabbarOverrideCtx,
    setTabbarHiddenCtx,
    setNavbarOverrideCtx,
    type TabbarOverrideContainer,
    type TabbarHiddenContainer,
    type NavbarOverrideContainer,
  } from "./context";
  import { markNavigated } from "./navigation.js";
  import ShellSheet from "./ShellSheet.svelte";
  import ShellPanel from "./ShellPanel.svelte";
  import AvatarPanel from "$lib/components/admin/AvatarPanel.svelte";
  import SearchResults from "$lib/components/search/SearchResults.svelte";
  import {
    createTicketSearchProvider,
    type RawCachedTicket,
  } from "$lib/search/providers/tickets.js";
  import { createKbSearchProvider } from "$lib/search/providers/kb.js";
  import { createVolunteerSearchProvider } from "$lib/search/providers/volunteers.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    registerSearchProvider,
    resetFullSearch,
  } from "$lib/search/registry.svelte.js";
  import {
    getTicketDecryptCache,
    getOrgDecryptCache,
    getCurrentUserId,
    getCurrentUserRoleId,
    getCurrentPermissions,
    getPreviewLoader,
  } from "$lib/crypto/context.js";
  import { deriveDisplayStatus } from "$lib/tickets/display-status.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";
  import {
    type SerializedBuffer,
    base64ToUint8Array,
  } from "$lib/utils/buffer-encoding.js";
  import LanguagePicker from "$lib/components/inputs/LanguagePicker.svelte";
  import { getLocale, setLocale, type Locale } from "$lib/paraglide/runtime.js";

  // Scroll container element, provided by PageShell via bindScrollEl.
  let mainEl = $state<HTMLElement | undefined>();

  function handleScrollEl(el: HTMLElement | undefined): void {
    mainEl = el;
  }

  const scrollContainerEl = $derived(mainEl);
  setScrollContainer(() => scrollContainerEl);

  // ── Per-route scroll position save/restore ───────────────────────────
  // The Konsta <Page> is a single scroll container shared by all routes.
  // Without intervention, navigating away and back leaks scroll positions
  // between routes. We key by pathname (not route.id) so that e.g.
  // /tickets/abc and /tickets/def each keep their own position.
  const scrollPositions = new SvelteMap<string, number>();
  const MAX_SCROLL_ENTRIES = 50;

  beforeNavigate(({ from }) => {
    const el = scrollContainerEl;
    if (!el || !from?.url) return;
    scrollPositions.set(from.url.pathname, el.scrollTop);
    // Cap the map so it doesn't grow unbounded during long sessions.
    if (scrollPositions.size > MAX_SCROLL_ENTRIES) {
      const oldest = scrollPositions.keys().next().value;
      if (oldest !== undefined) scrollPositions.delete(oldest);
    }
  });

  afterNavigate(({ to }) => {
    markNavigated();
    const el = scrollContainerEl;
    if (!el || !to?.url) return;
    const saved = scrollPositions.get(to.url.pathname);
    // Restore if we have a saved position, otherwise reset to top.
    requestAnimationFrame(() => {
      el.scrollTop = saved ?? 0;
    });
  });

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

  // ── Avatar panel ─────────────────────────────────────────────────
  const navLogoUrl = $derived(getOrgLogoUrl());
  let panelOpen = $state(false);
  const roleIdGetter = getCurrentUserRoleId();
  const permissionsGetter = getCurrentPermissions();
  const currentRoleId = $derived(roleIdGetter() ?? "");
  const currentPermissions = $derived(permissionsGetter());
  const meQuery = createQuery(() => ({
    queryKey: authKeys.me(),
    queryFn: async () => trpc.auth.me.query(),
    staleTime: Infinity,
  }));

  // Org decrypt cache + key manager are only set client-side by
  // CryptoProvider (gated behind `browser`). Access lazily so the
  // context getter isn't called during SSR where it would throw.
  const avatarOrgCache = browser ? getOrgDecryptCache() : null;

  const avatarDisplayName = $derived.by(() => {
    if (avatarOrgCache == null) return null;
    const enc = meQuery.data?.user.encryptedDisplayName;
    if (enc == null) return null;
    const ciphertext = typeof enc === "string" ? base64ToUint8Array(enc) : null;
    return avatarOrgCache.decrypt("me:display_name", ciphertext);
  });

  const userInitials = $derived.by(() => {
    if (avatarDisplayName == null) return null;
    return avatarDisplayName
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
  });

  // ── Subnavbar + Navbar height measurement.
  // ResizeObserver tracks the inner content height so we can set
  // padding-top on <main> and position the subnavbar correctly.
  let subnavbarInnerEl = $state<HTMLElement | undefined>();
  let subnavbarHeight = $state(0);
  let navbarHeight = $state(0);

  $effect(() => {
    const el = subnavbarInnerEl;
    if (el == null) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry != null) {
        subnavbarHeight = entry.borderBoxSize[0]?.blockSize ?? el.offsetHeight;
      }
    });
    ro.observe(el, { box: "border-box" });
    return () => ro.disconnect();
  });

  // Navbar DOM ref, resolved from the scroll container's parent Page.
  // PageShell measures the height via ResizeObserver; we just need the
  // element reference for the subnavbar chrome extension effect below.
  let navbarDomEl = $state<HTMLElement | undefined>();

  function handleNavbarHeight(h: number): void {
    navbarHeight = h;
  }

  $effect(() => {
    const page = mainEl?.closest(".k-page");
    if (page == null) return;
    const navbar = page.querySelector<HTMLElement>(":scope > .k-navbar");
    navbarDomEl = navbar ?? undefined;
  });

  // Extend the Navbar's blur/bg layers to cover the subnavbar region.
  // The patched NavbarClasses reads --k-navbar-chrome-h for iOS layer heights.
  // When no subnavbar is present or it's hidden, the variable is unset
  // and the default (navbar-only) height applies.
  $effect(() => {
    const el = navbarDomEl;
    if (el == null) return;
    const hasSubnavbar = navbarOverride?.subnavbar != null;
    const isHidden = navbarOverride?.subnavbarHidden?.() === true;
    // The bgBlur layer is the first child of .k-navbar (iOS only).
    // Its gradient mask fades blur too early over the extended area.
    const firstChild = el.firstElementChild;
    const bgBlur = firstChild instanceof HTMLElement ? firstChild : null;
    if (hasSubnavbar && !isHidden && subnavbarHeight > 0 && navbarHeight > 0) {
      const chromeH = navbarHeight + subnavbarHeight + 16;
      el.style.setProperty("--k-navbar-chrome-h", `${String(chromeH)}px`);
      if (bgBlur != null) {
        const mask = "linear-gradient(to bottom, black 90%, transparent)";
        bgBlur.style.setProperty("-webkit-mask-image", mask);
        bgBlur.style.setProperty("mask-image", mask);
      }
    } else {
      el.style.removeProperty("--k-navbar-chrome-h");
      if (bgBlur != null) {
        bgBlur.style.removeProperty("-webkit-mask-image");
        bgBlur.style.removeProperty("mask-image");
      }
    }
  });

  let {
    activeTab,
    orgName = "CARE-Y",
    ontabchange,
    children,
  }: AppShellProps = $props();

  let searchOpen = $state(false);
  let searchQuery = $state("");
  let searchContainerEl: HTMLDivElement | undefined = $state();

  let uiLocale = $state(getLocale());

  function handleLocaleChange(newLocale: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Locale values validated by LanguagePicker
    void setLocale(newLocale as Locale);
  }

  async function openSearch(): Promise<void> {
    resetFullSearch();
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

  // ── Search provider registration ────────────────────────────────────
  //
  // Context getters (crypto caches, currentUserId) are NOT available
  // during SSR because CryptoProvider only initializes in the browser.
  // All crypto context access happens inside $effect blocks, which
  // only run client-side.

  const promotedProviderId = $derived(
    activeTab === "tickets"
      ? "tickets"
      : activeTab === "library"
        ? "kb"
        : undefined,
  );

  // Memoized flat ticket list (raw records, no decryption).
  // Updated by the cache subscription effect. Empty during SSR.
  let flatTicketList = $state<readonly RawCachedTicket[]>([]);

  function isKeyWrap(val: unknown): val is TicketKeyWrap {
    return (
      typeof val === "object" &&
      val !== null &&
      "ephemeralPoint" in val &&
      "nonce" in val &&
      "wrappedKey" in val
    );
  }

  function isSerializedBuffer(val: unknown): val is SerializedBuffer {
    return typeof val === "object" && val !== null && "type" in val;
  }

  function isOrgCiphertext(val: unknown): val is SerializedBuffer | Uint8Array {
    return val instanceof Uint8Array || isSerializedBuffer(val);
  }

  $effect(() => {
    const ticketCache = getTicketDecryptCache();
    const orgCache = getOrgDecryptCache();
    const currentUserIdGetter = getCurrentUserId();
    const previewLoader = getPreviewLoader();

    // Flatten + deduplicate the TanStack Query cache. No decryption here.
    // Handles both regular queries (dashboard: T[]) and infinite queries
    // (ticket list: { pages: T[][] }).
    function hasPages(
      val: RawCachedTicket[] | { pages: RawCachedTicket[][] },
    ): val is { pages: RawCachedTicket[][] } {
      return "pages" in val && Array.isArray(val.pages);
    }

    function rebuildFlatList(): readonly RawCachedTicket[] {
      const entries = queryClient.getQueriesData<
        RawCachedTicket[] | { pages: RawCachedTicket[][] }
      >({ queryKey: ticketsKeys.lists() });

      // eslint-disable-next-line svelte/prefer-svelte-reactivity -- function-local dedup set, not reactive
      const seen = new Set<string>();
      const result: RawCachedTicket[] = [];
      for (const [, data] of entries) {
        if (data == null) continue;
        const tickets: RawCachedTicket[] = hasPages(data)
          ? data.pages.flat()
          : data;
        for (const t of tickets) {
          if (seen.has(t.id)) continue;
          seen.add(t.id);
          result.push(t);
        }
      }
      return result;
    }

    // Build initial list.
    flatTicketList = rebuildFlatList();

    // Rebuild when ticket queries update (new data fetched, pagination, etc.).
    const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === "updated" &&
        Array.isArray(event.query.queryKey) &&
        event.query.queryKey[0] === "tickets" &&
        event.query.queryKey[1] === "list"
      ) {
        flatTicketList = rebuildFlatList();
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- tickets router always exists when search providers are registered (post-auth)
    const ticketsRouter = trpc.tickets!;
    const unregisterProvider = registerSearchProvider(
      createTicketSearchProvider({
        getAllCachedTickets: () => flatTicketList,
        decryptTitle: (id, keyWrap, encryptedTitle) => {
          const kw = isKeyWrap(keyWrap) ? keyWrap : null;
          if (typeof encryptedTitle === "string") {
            return ticketCache.decryptTitle(id, kw, encryptedTitle);
          }
          if (isSerializedBuffer(encryptedTitle)) {
            return ticketCache.decryptTitle(id, kw, encryptedTitle);
          }
          return undefined;
        },
        decryptQueueName: (queueId, ciphertext) => {
          if (!isOrgCiphertext(ciphertext)) return null;
          return orgCache.decrypt(`queue:${queueId}`, ciphertext) ?? null;
        },
        resolveAssignedName: (assignedTo, ciphertext) => {
          if (assignedTo === null) return null;
          if (assignedTo === currentUserIdGetter()) {
            return m.dashboard_assigned_you();
          }
          if (!isOrgCiphertext(ciphertext)) return null;
          return orgCache.decrypt(`assignee:${assignedTo}`, ciphertext) ?? null;
        },
        getPreviewFollowUps: (ticketId) => previewLoader.get(ticketId),
        deriveDisplayStatus,
        getTotalItemCount: () => {
          const counts = queryClient.getQueryData<{ total?: number }>(
            ticketsKeys.counts(),
          );
          return counts?.total;
        },
        listAll: async (cursor) => {
          const result = await ticketsRouter.list.query({
            limit: 100,
            cursor,
          });
          return result;
        },
        ingestTickets: (tickets) => {
          queryClient.setQueryData(
            ticketsKeys.list({ source: "fullSearch" }),
            tickets,
          );
        },
        whenDecryptsSettled: async () => ticketCache.whenSettled(),
        decryptFollowUp: (ticketId, followupId, keyWrap, ciphertext) =>
          ticketCache.decryptFollowUp(
            ticketId,
            followupId,
            keyWrap,
            ciphertext,
          ),
        clearFollowUpCache: () => ticketCache.clearFollowUps(),
        contentSearch: async (ticketIds, page, pageSize) => {
          const cs = ticketsRouter.contentSearch;
          if (!cs) throw new TypeError("contentSearch router unavailable");
          const result = await cs.query({ ticketIds, page, pageSize });
          return result;
        },
      }),
    );

    // KB search provider: lazy-loads all articles, decrypts titles + excerpts
    // into a SvelteMap cache, then filters in-memory with fuzzy matching.
    // KBResultItem wraps ArticleCard, so the provider resolves category
    // names and author names reactively from the TanStack Query cache.
    const kbRouter = trpc.kb;
    const unregisterKb = kbRouter
      ? registerSearchProvider(
          createKbSearchProvider({
            fetchPage: async (cursor) =>
              kbRouter.listItems.query({ limit: 100, cursor }),
            decryptOrg: async (cacheKey, ciphertext) => {
              if (!isOrgCiphertext(ciphertext)) return null;
              return orgCache.decryptAsync(cacheKey, ciphertext);
            },
            ensureCategoriesLoaded: async () => {
              await queryClient.ensureQueryData({
                queryKey: kbKeys.categories(),
                queryFn: async () => kbRouter.listCategories.query(),
              });
            },
            resolveCategoryName: (categoryId) => {
              // Read from TanStack Query cache populated by the library page.
              const cats = queryClient.getQueryData<
                readonly { id: string; encryptedName: unknown }[]
              >(kbKeys.categories());
              const cat = cats?.find((c) => c.id === categoryId);
              if (!cat) return null;
              if (!isOrgCiphertext(cat.encryptedName)) return null;
              return orgCache.decrypt(
                `kb-cat:${categoryId}`,
                cat.encryptedName,
              );
            },
            resolveAuthorName: (userId) => {
              if (userId === currentUserIdGetter()) {
                return m.dashboard_assigned_you();
              }
              const volunteers = queryClient.getQueryData<
                readonly {
                  id: string;
                  encryptedDisplayName: unknown;
                }[]
              >(volunteerKeys.all);
              const vol = volunteers?.find((v) => v.id === userId);
              if (!vol) return null;
              if (!isOrgCiphertext(vol.encryptedDisplayName)) return null;
              return orgCache.decrypt(
                `volunteer:${vol.id}`,
                vol.encryptedDisplayName,
              );
            },
            fetchBodies: async (itemIds) =>
              kbRouter.listBodies.query({ itemIds }),
          }),
        )
      : () => undefined;

    // Volunteer search: admin/manager only. Reads from TanStack cache,
    // decrypts display names via OrgDecryptCache. No server-side fullSearch.
    const isAdminOrManager = currentPermissions.has(Permission.MANAGE_USERS);
    const unregisterVol = isAdminOrManager
      ? registerSearchProvider(
          createVolunteerSearchProvider({
            fetchUsers: async () =>
              queryClient.ensureQueryData({
                queryKey: adminKeys.users(),
                queryFn: async () => trpc.auth.listUsers.query(),
              }),
            decryptDisplayName: (userId, ciphertext) => {
              if (typeof ciphertext !== "string") return null;
              return orgCache.decrypt(
                `user:${userId}`,
                base64ToUint8Array(ciphertext),
              );
            },
            currentUserId: () => currentUserIdGetter(),
          }),
        )
      : () => undefined;

    return () => {
      unsubscribeCache();
      unregisterProvider();
      unregisterKb();
      unregisterVol();
    };
  });

  interface TabDef {
    readonly id: TabId;
    readonly label: () => string;
    readonly icon: Component;
  }

  const allTabs: readonly TabDef[] = [
    { id: "home", label: () => m.nav_home(), icon: House },
    { id: "tickets", label: () => m.nav_tickets(withTerms()), icon: Ticket },
    { id: "library", label: () => m.tab_library(withTerms()), icon: BookOpen },
  ];

  // ── Pull-to-refresh ──────────────────────────────────────────────────

  const queryClient = useQueryClient();

  const ptr = providePTR(true);

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
    await new Promise<void>((r) => setTimeout(r, 400));

    ptrPhase = "releasing";
    ptrPullY = 0;
    ptrProgress = 0;

    // Let the CSS transition finish before going fully idle
    await new Promise<void>((r) => setTimeout(r, 300));
    ptrPhase = "idle";
  }

  /**
   * Find the nearest scrollable ancestor of a given element, stopping
   * at the main content boundary. Returns the element with overflow-y
   * set to auto/scroll that has scrollable content, or mainEl itself.
   */
  function findScrollAncestor(target: HTMLElement): HTMLElement | undefined {
    let el: HTMLElement | null = target;
    while (el && el !== mainEl) {
      const { overflowY } = getComputedStyle(el);
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return mainEl;
  }

  function onPageTouchStart(e: TouchEvent): void {
    if (!ptr.enabled) return;
    if (ptrPhase === "refreshing" || ptrPhase === "releasing") return;
    if (!mainEl) return;

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
      while (el && el !== mainEl) {
        if (getComputedStyle(el).position === "fixed") return;
        el = el.parentElement;
      }
    }

    // Find the nearest scrollable ancestor. If it's not at the top,
    // the user is scrolling within that container, not pulling to refresh.
    if (target instanceof HTMLElement) {
      const scrollParent = findScrollAncestor(target);
      if (scrollParent && scrollParent.scrollTop > 0) return;
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
    // Always attach listener; per-event check in onPageTouchStart handles
    // the enabled flag reactively (a child route may disable PTR after mount).
    const el = mainEl;
    if (!el) return;

    // Attach passive touchstart to <main> (the scroll container).
    // The blocking touchmove is added dynamically per-gesture in
    // onPageTouchStart.
    el.addEventListener("touchstart", onPageTouchStart, {
      passive: true,
    });

    return () => {
      el.removeEventListener("touchstart", onPageTouchStart);
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

  // Indicator sits just below the navbar. navbarHeight already includes
  // safe-area padding, so no need to add env(safe-area-inset-top) again.
  // Travels down slightly as the user pulls for a natural feel.
  const indicatorTop = $derived(
    ptrPhase === "idle"
      ? "-40px"
      : `${String(navbarHeight + Math.round(ptrPullY * 0.2) + 8)}px`,
  );
</script>

<PageShell
  scrollTag="main"
  scrollClass="main-content{tabbarHidden
    ? ' tabbar-hidden'
    : ''}{navbarOverride?.subnavbar != null ? ' has-subnavbar' : ''}"
  scrollAttrs={{
    id: "main-content",
    "aria-label": m.shell_main_content(),
    style: `--subnavbar-h:${String(subnavbarHeight)}px`,
  }}
  onNavbarHeight={handleNavbarHeight}
  bindScrollEl={handleScrollEl}
>
  {#snippet navbar()}
    <Navbar role="banner">
      {#snippet left()}
        {#if navbarOverride?.left}
          {@render navbarOverride.left()}
        {:else}
          <Link
            iconOnly
            role="button"
            aria-label={m.nav_account()}
            onclick={() => (panelOpen = true)}
          >
            <span class="navbar-avatar" aria-hidden="true">
              {#if navLogoUrl}
                <img
                  src={navLogoUrl}
                  alt=""
                  class="navbar-avatar-logo"
                  loading="eager"
                />
              {:else if userInitials}
                {userInitials}
              {:else}
                <User size={18} />
              {/if}
            </span>
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
          <div class="navbar-title-group" class:heading-hidden={searchOpen}>
            <span class="heading-compact">{orgName}</span>
            <LanguagePicker value={uiLocale} onchange={handleLocaleChange} />
          </div>
        {/if}
      {/snippet}
      {#snippet right()}
        {#if !searchOpen}
          <CallIndicator />
        {/if}
        {#if !searchOpen && navbarOverride?.searchHidden !== true}
          <Link
            iconOnly
            role="button"
            aria-label={m.nav_search()}
            onclick={openSearch}
          >
            <Search size={22} aria-hidden="true" />
          </Link>
        {/if}
        {#if navbarOverride?.right && !searchOpen}
          {@render navbarOverride.right()}
        {/if}
      {/snippet}
      {#if searchOpen}
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
  {/snippet}

  {#snippet beforeScroll()}
    {#if navbarOverride?.subnavbar}
      <div
        class="shell-subnavbar"
        class:shell-subnavbar--hidden={navbarOverride.subnavbarHidden?.() ===
          true}
        style:--subnavbar-h="{subnavbarHeight}px"
        style:--navbar-h="{navbarHeight}px"
      >
        <div class="shell-subnavbar-inner" bind:this={subnavbarInnerEl}>
          {@render navbarOverride.subnavbar()}
        </div>
      </div>
    {/if}

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
  {/snippet}

  {@render children()}

  {#snippet afterScroll()}
    {#if tabbarHidden}
      <!-- Tabbar hidden: route provides its own bottom bar (e.g., ShellMessagebar) -->
    {:else if tabbarOverride}
      <div
        role="toolbar"
        aria-label={tabbarOverride.ariaLabel}
        class="tabbar-override"
      >
        <Toolbar tabbar tabbarIcons class="native-tabbar left-0 bottom-0 fixed">
          {#if themeStore.uiTheme === "ios" && tabbarOverride.middle}
            <div
              class="tabbar-override-blur fixed left-0 bottom-0 w-full h-[calc(env(safe-area-inset-bottom,0px)+48px+32px)] mask-t-to-100% mask-t-from-70% pointer-events-none bg-gradient-to-t from-ios-light-surface to-transparent dark:from-ios-dark-surface/50"
            ></div>
          {/if}
          {#if tabbarOverride.left}
            <ToolbarPane tabbar={false}>
              {@render tabbarOverride.left()}
            </ToolbarPane>
          {/if}
          {#if tabbarOverride.middle}
            <div class="tabbar-middle">
              {@render tabbarOverride.middle()}
            </div>
          {/if}
          {#if tabbarOverride.right}
            {#if !tabbarOverride.left && !tabbarOverride.middle}
              <div style:flex="1"></div>
            {/if}
            <ToolbarPane tabbar={false}>
              {@render tabbarOverride.right()}
            </ToolbarPane>
          {/if}
        </Toolbar>
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
                  textIos: "text-[var(--glass-text)]",
                  textMaterial: "text-[var(--glass-text)]",
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

    <ShellSheet
      opened={searchOpen}
      ondismiss={closeSearch}
      backdrop={false}
      trapFocus={false}
      role="search"
      ariaLabel={m.search_hint(withTerms())}
      class="search-sheet"
    >
      <SearchResults
        query={searchQuery}
        {promotedProviderId}
        ondismiss={closeSearch}
        onselectrecent={(q: string) => {
          searchQuery = q;
        }}
      />
    </ShellSheet>

    {#if browser}
      <ShellPanel
        opened={panelOpen}
        ondismiss={() => (panelOpen = false)}
        ariaLabel={m.nav_account()}
      >
        <AvatarPanel
          encryptedDisplayName={meQuery.data?.user.encryptedDisplayName}
          roleId={currentRoleId}
          permissions={currentPermissions}
          onnavigate={(path: string) => {
            panelOpen = false;
            // eslint-disable-next-line svelte/no-navigation-without-resolve -- admin routes created in later tasks
            void goto(path);
          }}
          onlogout={() => {
            panelOpen = false;
            void goto(resolve("/logout"));
          }}
        />
      </ShellPanel>
    {/if}
  {/snippet}
</PageShell>

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

  /* Tabbar override mode: Konsta Toolbar keeps safe-area layout but
     the glass/blur background is removed so it doesn't block taps on
     content behind it. Only actual slot content receives clicks. */
  .tabbar-override :global(.native-tabbar.k-toolbar) {
    pointer-events: none;
  }
  .tabbar-override :global(.native-tabbar.k-toolbar > div:first-child) {
    display: none;
  }
  .tabbar-override :global(.native-tabbar.k-toolbar > div:nth-child(2)) {
    pointer-events: auto;
  }

  /* Navbar keeps Konsta's default sticky + z-20. */

  @media (prefers-contrast: more) {
    :global(.k-navbar) {
      background: Canvas !important;
      color: CanvasText !important;
    }

    /* Remove the blur and gradient layers inside the Navbar */
    :global(.k-navbar) > :first-child,
    :global(.k-navbar) > :nth-child(2) {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background: none !important;
      mask-image: none !important;
      -webkit-mask-image: none !important;
    }

    /* Tabbar override blur overlay: solid opaque instead of blur */
    .tabbar-override-blur {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      background: Canvas !important;
      mask-image: none !important;
      -webkit-mask-image: none !important;
      opacity: 1 !important;
    }
  }

  /* PageShell owns the scroll container fundamentals (flex, overflow,
     negative-margin pull-up, base padding-top). AppShell adds layout
     and theme-specific overrides via :global (the element lives in
     PageShell's template). */
  :global(.main-content) {
    display: flex;
    flex-direction: column;
  }

  :global(.k-ios .main-content) {
    padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0px));
  }

  :global(.k-material .main-content) {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
  }

  :global(.main-content.tabbar-hidden) {
    padding-bottom: 0 !important;
    overflow: hidden;
  }

  .tabbar-override-blur {
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
  }

  .tabbar-middle {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    position: relative;
    z-index: 1;
  }

  .navbar-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: var(--brand-fill, var(--brand-primary));
    color: var(--brand-text, #fff);
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    overflow: hidden;
  }

  .navbar-avatar-logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .navbar-title-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
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

  /* ── Subnavbar (collapsible region below Navbar) ────────────────── */
  /* Absolutely positioned so it does NOT participate in flex layout.
     <main> reserves space via padding-top instead. This prevents iOS
     Safari scroll-position jumps caused by flex siblings resizing
     mid-scroll (WebKit lacks scroll anchoring in stable Safari 26). */

  .shell-subnavbar {
    position: absolute;
    top: var(--navbar-h);
    left: 0;
    right: 0;
    z-index: 21; /* above Navbar's blur/bg layers (z-20) */
  }

  /* Only clip overflow during collapse animation. When visible,
     overflow must be visible so popovers inside the subnavbar
     (e.g., filter pill dropdowns) can render outside the bounds. */
  .shell-subnavbar--hidden {
    overflow: hidden;
    pointer-events: none;
  }

  /* No background on the subnavbar itself. The Navbar's bg/blur layers
     are extended via --k-navbar-chrome-h to cover this region, creating
     one continuous glass surface regardless of theme. */

  .shell-subnavbar-inner {
    will-change: transform, opacity;
    transition:
      transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 200ms ease;
  }

  /* Konsta's --shadow-ios-light-glass includes a heavy 25px outer shadow
     designed for navbar-scale surfaces. Inside the subnavbar it creates a
     visible dark blob beneath the segmented control in light themes.
     Strip the outer shadow, keep only the inset highlights. */
  .shell-subnavbar-inner :global(.glass) {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      inset 0 0 0 0.5px rgba(255, 255, 255, 0.15) !important;
  }

  /* Material: solid elevated surface instead of iOS glass blur. */
  :global(.k-material) .shell-subnavbar-inner {
    background: var(--paper);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .shell-subnavbar--hidden .shell-subnavbar-inner {
    transform: translateY(calc(-1 * var(--subnavbar-h)));
    opacity: 0;
    pointer-events: none;
  }

  :global(.main-content.has-subnavbar) {
    padding-top: calc(var(--navbar-h, 0px) + var(--subnavbar-h));
  }

  @media (prefers-contrast: more) {
    .shell-subnavbar-inner {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      mask-image: none !important;
      -webkit-mask-image: none !important;
      background: Canvas !important;
      color: CanvasText !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shell-subnavbar-inner {
      transition: none;
    }
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

  /* Search sheet: fill from bottom up to the Navbar */
  :global(.search-sheet) {
    height: calc(100dvh - var(--navbar-h, 64px));
  }
</style>

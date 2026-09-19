<!--
  App shell: persistent navigation chrome across all routes.

  PageShell owns the Konsta Page, Navbar height measurement, and the
  blur-through scroll container. ShellNavbar owns the Navbar itself, its
  glass layers, and the subnavbar row, which is why the client shell can
  put those in the same place without copying them. AppShell layers the
  authenticated features on top, meaning pull-to-refresh, the tab bar,
  the desktop sidebar, global search, and the account panel.

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
  import { Link, Searchbar, Toolbar, ToolbarPane } from "konsta/svelte";
  import PageShell from "./PageShell.svelte";
  import ShellNavbar from "./ShellNavbar.svelte";
  import { Search, User } from "@lucide/svelte";
  import { getOrgLogoUrl } from "$lib/branding/logo-url.svelte.js";
  import CallIndicator from "./CallIndicator.svelte";
  import { onMount } from "svelte";
  import { gestureMount } from "$lib/utils/gesture-focus.js";
  import { SvelteMap } from "svelte/reactivity";
  import { browser } from "$app/environment";
  import {
    beforeNavigate,
    afterNavigate,
    goto,
    replaceState,
  } from "$app/navigation";
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import type {
    TabId,
    AppShellProps,
    SidebarSection,
    SidebarSubItem,
  } from "./types";
  import TabbarNav from "./TabbarNav.svelte";
  import { layoutMode } from "$lib/stores/layout-mode.svelte";
  import { endSplitHandoff } from "$lib/stores/split-handoff.svelte.js";
  import DesktopSidebar from "./DesktopSidebar.svelte";
  import { savedFilterStore } from "$lib/stores/saved-filters.svelte";
  import { kbSavedFilterStore } from "$lib/stores/kb-saved-filters.svelte";
  import { resealSweep } from "$lib/crypto/reseal-sweep.svelte.js";
  import Register from "$lib/components/Register.svelte";
  import { providePTR } from "./ptr-context.svelte.js";
  import { splitNavbar } from "$lib/stores/split-navbar.svelte.js";
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
    setSectionRailCtx,
    type TabbarOverrideContainer,
    type TabbarHiddenContainer,
    type NavbarOverrideContainer,
    type SectionRailContainer,
  } from "./context";
  import SectionRail from "./SectionRail.svelte";
  import { getHoverSections, findRegistryEntry } from "./section-registry.js";
  import type { HoverRevealData } from "./types";
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
    getCryptoBridge,
    getOrgKeyManager,
    getCurrentUserId,
    getCurrentUserRoleId,
    getCurrentPermissions,
    getPreviewLoader,
  } from "$lib/crypto/context.js";
  import { initRecentViews } from "$lib/search/recent-views.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";
  import { getLocale, setLocale, type Locale } from "$lib/paraglide/runtime.js";

  // Scroll container element, provided by PageShell via bindScrollEl.
  let mainEl = $state<HTMLElement | undefined>();

  function navigateToPath(path: `/${string}`): void {
    void goto(resolve(path));
  }

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
    if (searchOpen) closeSearch();
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
  // snippets. AppShell forwards them to ShellNavbar, which keeps the Konsta
  // Navbar and its Glass blur, safe-area, and theme adaptation in one place.
  const navbarOverrideContainer: NavbarOverrideContainer = $state({
    current: undefined,
  });
  setNavbarOverrideCtx(navbarOverrideContainer);
  const navbarOverride = $derived(navbarOverrideContainer.current);

  // Section rail: pages with scroll sections publish their state here.
  // AppShell reads it reactively to render the desktop SectionRail.
  const sectionRailContainer: SectionRailContainer = $state({
    current: undefined,
  });
  setSectionRailCtx(sectionRailContainer);
  const sectionRailState = $derived(sectionRailContainer.current);

  // ── Split navbar (segmented desktop view) ──
  const splitNavbarCfg = $derived(splitNavbar.config);
  const splitRight = $derived(splitNavbarCfg?.rightNavbar.current);

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
    return avatarOrgCache.decrypt("me:display_name", enc);
  });

  const userInitials = $derived.by(() => {
    if (avatarDisplayName == null) return null;
    return avatarDisplayName
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");
  });

  // ── Sidebar sub-items (desktop only) ──────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- tickets router exists post-auth (AppShell only renders inside (app) layout)
  const ticketsRouterRef = trpc.tickets!;
  const sidebarQueuesQuery = createQuery(() => ({
    queryKey: ticketsKeys.myQueues(),
    queryFn: async () => ticketsRouterRef.myQueues.query(),
    enabled: layoutMode.isDesktop,
  }));

  const MAX_SIDEBAR_FILTERS = 5;

  const sidebarSubItems = $derived.by((): readonly SidebarSection[] => {
    if (!layoutMode.isDesktop) return [];

    const sections: SidebarSection[] = [];

    // Tickets tab: queues + saved filters
    const ticketItems: SidebarSubItem[] = [];

    if (sidebarQueuesQuery.data != null && avatarOrgCache != null) {
      for (const q of sidebarQueuesQuery.data) {
        const name = avatarOrgCache.decrypt(`queue:${q.id}`, q.encryptedName);
        ticketItems.push({
          id: `queue:${q.id}`,
          label: name ?? "...",
          count: Number(q.openCount),
          icon: "queue",
          ontap: () =>
            void goto(resolve(`/tickets?queue=${encodeURIComponent(q.id)}`)),
        });
      }
    }

    for (const f of savedFilterStore.filters.slice(0, MAX_SIDEBAR_FILTERS)) {
      const name = avatarOrgCache?.decrypt(
        `saved-filter:${f.id}`,
        f.encryptedName,
      );
      ticketItems.push({
        id: `filter:${f.id}`,
        label: name ?? "...",
        icon: "filter",
        ontap: () =>
          void goto(
            resolve(`/tickets?savedFilter=${encodeURIComponent(f.id)}`),
          ),
      });
    }

    if (ticketItems.length > 0) {
      sections.push({ tabId: "tickets", items: ticketItems });
    }

    // Library tab: saved filters
    const kbItems: SidebarSubItem[] = [];
    for (const f of kbSavedFilterStore.filters.slice(0, MAX_SIDEBAR_FILTERS)) {
      const name = avatarOrgCache?.decrypt(
        `kb-saved-filter:${f.id}`,
        f.encryptedName,
      );
      kbItems.push({
        id: `kb-filter:${f.id}`,
        label: name ?? "...",
        icon: "filter",
        ontap: () =>
          void goto(
            resolve(`/library?savedFilter=${encodeURIComponent(f.id)}`),
          ),
      });
    }
    if (kbItems.length > 0) {
      sections.push({ tabId: "library", items: kbItems });
    }

    // Admin section (role-gated)
    if (currentPermissions.has(Permission.MANAGE_USERS)) {
      sections.push({
        tabId: "admin",
        items: [
          {
            id: "admin:people",
            label: m.admin_people_title(),
            ontap: () => void goto(resolve("/admin/people")),
          },
          {
            id: "admin:org",
            label: m.admin_org_title(),
            ontap: () => void goto(resolve("/admin/organization")),
          },
          {
            id: "admin:comms",
            label: m.admin_comms_title(),
            ontap: () => void goto(resolve("/admin/communications")),
          },
        ],
      });
    }

    return sections;
  });

  // ShellNavbar measures the subnavbar and reports its height back here,
  // because the scroll container reserves that space with padding-top and
  // the subnavbar itself is absolutely positioned.
  let subnavbarHeight = $state(0);
  let navbarHeight = $state(0);

  function handleNavbarHeight(h: number): void {
    navbarHeight = h;
  }

  $effect(() => {
    const pageEl = mainEl?.closest(".k-page");
    if (pageEl instanceof HTMLElement && navbarHeight > 0) {
      pageEl.style.setProperty("--navbar-h", `${String(navbarHeight)}px`);
    }
  });

  let {
    activeTab,
    activeArea,
    orgName = "CARE-Y",
    ontabchange,
    onareatap,
    onsearchtoggle,
    children,
  }: AppShellProps = $props();

  let searchOpen = $state(false);
  let searchQuery = $state("");
  let searchContainerEl: HTMLDivElement | undefined = $state();

  let uiLocale = $state(getLocale());

  function handleLocaleChange(newLocale: Locale): void {
    void setLocale(newLocale);
  }

  function openSearch(): void {
    resetFullSearch();
    gestureMount(
      () => {
        searchOpen = true;
      },
      () =>
        searchContainerEl?.querySelector<HTMLInputElement>(
          "input[type='text']",
        ),
    );
    onsearchtoggle?.(true);
  }

  function closeSearch(): void {
    searchOpen = false;
    searchQuery = "";
    onsearchtoggle?.(false);
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
    // Both "updated" (existing key refreshed) and "added" (new key, e.g.
    // recentViews prefetch on first hydration) must trigger a rebuild.
    const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
      if (
        (event.type === "updated" || event.type === "added") &&
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
          return ticketCache.decryptTitle(id, kw, encryptedTitle);
        },
        orgDecrypt: (cacheKey, ciphertext, origin) => {
          return orgCache.decrypt(cacheKey, ciphertext, origin) ?? null;
        },
        currentUserId: () => currentUserIdGetter(),
        getPreviewFollowUps: (ticketId) => previewLoader.get(ticketId),
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
        contentSearch: async (ticketIds, pageNum, pageSize) => {
          const cs = ticketsRouter.contentSearch;
          if (!cs) throw new TypeError("contentSearch router unavailable");
          const result = await cs.query({ ticketIds, page: pageNum, pageSize });
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
            decryptOrg: async (cacheKey, ciphertext, origin) => {
              return orgCache.decryptAsync(cacheKey, ciphertext, origin);
            },
            ensureCategoriesLoaded: async () => {
              await queryClient.query({
                queryKey: kbKeys.categories(),
                queryFn: async () => kbRouter.listCategories.query(),
                staleTime: "static",
              });
            },
            resolveCategoryName: (categoryId) => {
              // Read from TanStack Query cache populated by the library page.
              const cats = queryClient.getQueryData<
                readonly { id: string; encryptedName: string }[]
              >(kbKeys.categories());
              const cat = cats?.find((c) => c.id === categoryId);
              if (!cat) return null;
              return orgCache.decrypt(
                `kb-cat:${categoryId}`,
                cat.encryptedName,
                { table: "kb_categories", id: categoryId },
              );
            },
            resolveAuthorName: (userId) => {
              if (userId === currentUserIdGetter()) {
                return m.dashboard_assigned_you();
              }
              const volunteers = queryClient.getQueryData<
                readonly {
                  id: string;
                  encryptedDisplayName: string;
                }[]
              >(volunteerKeys.all);
              const vol = volunteers?.find((v) => v.id === userId);
              if (!vol) return null;
              return orgCache.decrypt(
                `volunteer:${vol.id}`,
                vol.encryptedDisplayName,
                { table: "users", id: userId },
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
              queryClient.query({
                queryKey: adminKeys.users(),
                queryFn: async () => trpc.auth.listUsers.query(),
                staleTime: "static",
              }),
            decryptDisplayName: (userId, ciphertext) => {
              return orgCache.decrypt(`user:${userId}`, ciphertext, {
                table: "users",
                id: userId,
              });
            },
            currentUserId: () => currentUserIdGetter(),
          }),
        )
      : () => undefined;

    // Recently-viewed history: session list mirrored to the per-user
    // encrypted envelope (user_recent_views), sealed and opened by the
    // crypto Worker. Missing ticket rows are fetched individually so
    // recents resolve on a fresh session; inaccessible tickets fail the
    // fetch and silently drop from display.
    const bridge = getCryptoBridge();
    initRecentViews({
      fetchEnvelope: async () => (await trpc.recentViews.get.query()).envelope,
      pushEnvelope: async (envelope) => {
        await trpc.recentViews.put.mutate(envelope);
      },
      seal: async (dataB64) => bridge.sealSelfBlob(dataB64),
      open: async (envelope) => bridge.openSelfBlob(envelope),
      prefetchTickets: async (ids) => {
        const missing = ids.filter(
          (id) => !flatTicketList.some((t) => t.id === id),
        );
        if (missing.length === 0) return;
        const fetched = await Promise.all(
          missing.map(async (id) =>
            ticketsRouter.get.query({ ticketId: id }).catch(() => null),
          ),
        );
        const rows: RawCachedTicket[] = [];
        for (const row of fetched) {
          if (row !== null) rows.push(row);
        }
        if (rows.length > 0) {
          queryClient.setQueryData(
            ticketsKeys.list({ source: "recentViews" }),
            rows,
          );
        }
      },
    });

    return () => {
      unsubscribeCache();
      unregisterProvider();
      unregisterKb();
      unregisterVol();
    };
  });

  // ── Pull-to-refresh ──────────────────────────────────────────────────

  const queryClient = useQueryClient();

  // ── Hover-reveal section helpers ────────────────────────────────────

  function buildHoverData(route: string): HoverRevealData | undefined {
    // The current page's sections are already pinned in its SectionRail,
    // so a hover copy would just cover it with the same content.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- route is a known internal path from the registry
    if (page.url.pathname === resolve(route as `/${string}`)) return undefined;
    const sections = getHoverSections(route, currentPermissions, queryClient);
    if (sections.length === 0) return undefined;
    const entry = findRegistryEntry(route);
    if (entry == null) return undefined;
    return { sections, pageLabel: entry.pageLabel() };
  }

  function handleHoverNavigate(route: string, sectionId: string): void {
    const separator = route.includes("?") ? "&" : "?";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- route is a known internal path from the registry
    void goto(resolve(`${route}${separator}tab=${sectionId}` as `/${string}`));
  }

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
    if (layoutMode.isDesktop) return;
    if (!ptr.enabled) return;
    if (ptrPhase === "refreshing" || ptrPhase === "releasing") return;
    if (!mainEl) return;

    // While the software keyboard is open the user is composing; a
    // pull-down at the top of a scroller must never arm a refresh.
    if (document.documentElement.classList.contains("keyboard-open")) return;

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

  // ── Desktop keyboard shortcuts ───────────────────────────────────────

  const TAB_SHORTCUT_KEYS: Record<string, TabId> = {
    "1": "home",
    "2": "tickets",
    "3": "library",
  };

  function isTextInput(el: Element | null): boolean {
    if (!el) return false;
    const tag = el.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      el.hasAttribute("contenteditable")
    );
  }

  function handleDesktopKeydown(e: KeyboardEvent): void {
    const mod = e.metaKey || e.ctrlKey;

    if (mod && e.key === "k") {
      e.preventDefault();
      openSearch();
      return;
    }

    if (mod && e.key === "n") {
      if (!isTextInput(document.activeElement)) {
        e.preventDefault();
        if (activeTab === "tickets" && navbarOverride?.actions?.[0]) {
          navbarOverride.actions[0].onclick(new MouseEvent("click"));
        } else {
          ontabchange("tickets");
        }
      }
      return;
    }

    if (e.key === "Escape") {
      if (searchOpen) {
        closeSearch();
        return;
      }
      const state = page.state;
      if (
        typeof state.ticketId === "string" ||
        typeof state.articleId === "string"
      ) {
        // Escape means the bare list. End both handoffs so a redirect
        // still in flight cannot push its row back a moment later.
        endSplitHandoff("tickets");
        endSplitHandoff("library");
        replaceState("", {});
      }
      return;
    }

    if (!isTextInput(document.activeElement)) {
      const tabId = TAB_SHORTCUT_KEYS[e.key];
      if (tabId) {
        e.preventDefault();
        ontabchange(tabId);
      }
    }
  }

  $effect(() => {
    if (!layoutMode.isDesktop) return;
    window.addEventListener("keydown", handleDesktopKeydown);
    return () => {
      window.removeEventListener("keydown", handleDesktopKeydown);
    };
  });

  // ── Trailing-tier reseal auto-resume (MANAGE_KEYS only) ──────────────
  // getOrgKeyManager is a Svelte context getter; safe to call here since
  // AppShell always renders inside the (app) layout.
  const _orgKeyMgr = browser ? getOrgKeyManager() : null;

  $effect(() => {
    if (!browser || _orgKeyMgr == null) return;
    if (!_orgKeyMgr.isLoaded) return;
    if (!currentPermissions.has(Permission.MANAGE_KEYS)) return;
    const bridge = getCryptoBridge();
    void resealSweep.autoResumeOnce(bridge);
  });

  // ── Device-local saved-filter name reseal (all users) ──────────────
  let _filterResealDone = false;

  $effect(() => {
    if (!browser || _orgKeyMgr == null) return;
    if (!_orgKeyMgr.isLoaded) return;
    if (_filterResealDone) return;
    _filterResealDone = true;
    const bridge = getCryptoBridge();
    void savedFilterStore.resealNames(bridge);
    void kbSavedFilterStore.resealNames(bridge);
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

<!-- Identity falls back to the volunteer's initials, then a user icon.
     ShellNavbar renders it inside the avatar when the org has no logo. -->
{#snippet orgIdentityFallback()}
  {#if userInitials}
    {userInitials}
  {:else}
    <User size={18} />
  {/if}
{/snippet}

<!-- Navbar right slot. The search overlay covers the navbar when open, so
     everything here steps aside for it. -->
{#snippet navbarActions()}
  {#if !searchOpen}
    <CallIndicator />
  {/if}
  {#if !searchOpen && navbarOverride?.searchHidden !== true}
    <Link
      iconOnly
      role="button"
      aria-label={m.nav_search()}
      onclick={openSearch}
      data-testid="shell-global-search"
    >
      <Search size={22} aria-hidden="true" />
    </Link>
  {/if}
  {#if !searchOpen && navbarOverride?.actions}
    {#each navbarOverride.actions as action (action.label)}
      <Link
        iconOnly={!layoutMode.isDesktop}
        role="button"
        aria-label={action.label}
        onclick={action.onclick}
      >
        {@const Icon = action.icon}
        <Icon size={22} aria-hidden="true" />
        {#if layoutMode.isDesktop}
          <span class="navbar-action-label">{action.label}</span>
        {/if}
      </Link>
    {/each}
  {:else if navbarOverride?.right && !searchOpen}
    {@render navbarOverride.right()}
  {/if}
{/snippet}

<div class="app-shell-layout">
  {#if layoutMode.isDesktop}
    <DesktopSidebar
      {activeTab}
      {activeArea}
      {ontabchange}
      expanded={false}
      subItems={sidebarSubItems}
      {orgName}
      userName={avatarDisplayName ?? ""}
      userInitials={userInitials ?? ""}
      roleId={currentRoleId}
      onAdmin={() => void goto(resolve("/admin"))}
      onSettings={() => void goto(resolve("/more/settings"))}
      onLogout={() => void goto(resolve("/logout"))}
      onNavigate={(path: `/${string}`) => navigateToPath(path)}
      getHoverSections={buildHoverData}
      onHoverNavigate={handleHoverNavigate}
    />
    {#if sectionRailState != null}
      <SectionRail
        sections={sectionRailState.sections}
        active={sectionRailState.active}
        onscroll={sectionRailState.scrollTo}
      />
    {/if}
  {/if}
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
      <ShellNavbar
        identity={{
          logoUrl: navLogoUrl,
          orgName,
          label: m.nav_account(),
          onIdentityTap: () => (panelOpen = true),
        }}
        identityFallback={orgIdentityFallback}
        identityHidden={layoutMode.isDesktop}
        locale={uiLocale}
        onlocalechange={handleLocaleChange}
        {navbarHeight}
        leading={navbarOverride?.left}
        title={navbarOverride?.title}
        titleHidden={searchOpen}
        actions={navbarActions}
        subnavbar={navbarOverride?.subnavbar}
        subnavbarHidden={() =>
          !layoutMode.isDesktop && navbarOverride?.subnavbarHidden?.() === true}
        onsubnavbarheight={(h: number) => {
          subnavbarHeight = h;
        }}
        subnavbarTrailing={layoutMode.isDesktop
          ? splitRight?.subnavbar
          : undefined}
        trailingWidth={layoutMode.isDesktop
          ? splitNavbarCfg?.rightWidth
          : undefined}
        ontrailingheight={(h: number) => {
          splitNavbar.setRightHeight(h);
        }}
      >
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
        <!-- Split-view detail header rendered inside the detail pane
             (SplitDetailPane), not in the shared navbar. -->
      </ShellNavbar>
    {/snippet}

    {#snippet beforeScroll()}
      <!-- Pull-to-refresh indicator -->
      {#if ptrPhase !== "idle"}
        <div
          class="ptr-indicator"
          data-testid="shell-ptr"
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

    {#if resealSweep.running}
      <div class="reseal-banner" data-testid="reseal-banner">
        <Register kind="note" role="status">
          {m.reseal_banner_progress({
            done: String(resealSweep.done),
            total: String(resealSweep.total),
          })}
        </Register>
      </div>
    {/if}

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
          <Toolbar
            tabbar
            tabbarIcons
            class="native-tabbar left-0 bottom-0 fixed"
          >
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
      {:else if !layoutMode.isDesktop}
        <TabbarNav {activeTab} {activeArea} {ontabchange} {onareatap} />
      {/if}

      {#if layoutMode.isDesktop}
        {#if searchOpen}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="search-dropdown-backdrop"
            style:top="{navbarHeight}px"
            onclick={closeSearch}
            onkeydown={undefined}
          ></div>
          <div
            class="search-dropdown"
            role="search"
            aria-label={m.search_hint(withTerms())}
            style:top="{navbarHeight}px"
            style:background-color="var(--glass-surface)"
            style:backdrop-filter="saturate(180%) blur(20px)"
            style:-webkit-backdrop-filter="saturate(180%) blur(20px)"
          >
            <SearchResults
              query={searchQuery}
              {promotedProviderId}
              ondismiss={closeSearch}
              onnavigate={(href: string) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dynamic href from search provider, always starts with /
                void goto(resolve(href as `/${string}`)).then(closeSearch);
              }}
              onselectrecent={(q: string) => {
                searchQuery = q;
              }}
            />
          </div>
        {/if}
      {:else}
        <ShellSheet
          opened={searchOpen}
          ondismiss={closeSearch}
          backdrop={false}
          trapFocus={false}
          role="search"
          ariaLabel={m.search_hint(withTerms())}
          class="search-sheet"
        >
          {#if searchOpen}
            <SearchResults
              query={searchQuery}
              {promotedProviderId}
              ondismiss={closeSearch}
              onnavigate={(href: string) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dynamic href from search provider, always starts with /
                void goto(resolve(href as `/${string}`)).then(closeSearch);
              }}
              onselectrecent={(q: string) => {
                searchQuery = q;
              }}
            />
          {/if}
        </ShellSheet>
      {/if}

      {#if browser && !layoutMode.isDesktop}
        <ShellPanel
          opened={panelOpen}
          ondismiss={() => (panelOpen = false)}
          ariaLabel={m.nav_account()}
        >
          <AvatarPanel
            encryptedDisplayName={meQuery.data?.user.encryptedDisplayName ??
              null}
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
</div>

<style>
  /* ── Desktop layout ── */
  /* Fixed 100dvh, NOT var(--app-height): the layout viewport does not
     shrink when the iOS software keyboard opens. iOS reveals a focused
     fixed-bottom input by panning the visual viewport downward inside
     the layout viewport (visualViewport.offsetTop > 0; no API exists to
     pan it back). A shell sized to the visual viewport but anchored at
     the layout viewport's top then exposes a blank band of shell
     background above the keyboard. Keeping the shell full-height means
     the pan can only ever show app content; keyboard-aware surfaces add
     their own bottom inset from --keyboard-height instead. */
  .app-shell-layout {
    display: flex;
    height: 100dvh;
  }

  .app-shell-layout > :global(:last-child) {
    flex: 1;
    min-width: 0;
    /* Must exceed the rail's z-index: 10. Both are flex items, so each
       z-index creates a stacking context, and Konsta overlays (popover
       z-40, sheet backdrops) are trapped inside the page's context by the
       k-page isolation. Without this, a popover overhanging the rail
       paints under it and its overhung edge stops receiving taps. The
       hover-rail-anchor in DesktopSidebar must stay above this value. */
    z-index: 20;
  }

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

  @media (prefers-contrast: more) {
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

  /* Children of the scroll column must keep their natural height so
     content overflows and scrolls. Without this, once a page grows
     taller than the viewport, flex shrinks its items; anything with
     overflow hidden (Konsta inset lists) has a zero automatic minimum
     size and visually collapses. */
  :global(.main-content > *) {
    flex-shrink: 0;
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

  .navbar-action-label {
    font-size: var(--text-sm);
    margin-inline-start: 0.25rem;
    white-space: nowrap;
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

  @media (min-width: 1024px) {
    .search-overlay {
      max-width: 80%;
      left: 50%;
      right: auto;
      transform: translateX(-50%) scaleX(0.85);
      transform-origin: center center;
    }

    .search-overlay-open {
      transform: translateX(-50%) scaleX(1);
    }
  }

  /* ShellNavbar owns the subnavbar row itself. The scroll container
     reserves its height here, because the row is absolutely positioned
     and does not push content down on its own. */
  :global(.main-content.has-subnavbar) {
    padding-top: calc(var(--navbar-h, 0px) + var(--subnavbar-h));
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

  /* The blanket rule in shared.css zeroes every duration under reduced
     motion. Stating it for the chrome this file owns keeps the intent
     readable here and survives a change to that blanket. The refresh
     indicator still appears, it just holds still. */
  @media (prefers-reduced-motion: reduce) {
    .search-overlay,
    .ptr-indicator.ptr-releasing,
    .ptr-arc-fill,
    .ptr-spinner {
      transition: none;
    }

    .ptr-refreshing .ptr-arc,
    .ptr-releasing .ptr-arc,
    .ptr-refreshing .ptr-spinner,
    .ptr-releasing .ptr-spinner {
      animation: none;
    }
  }

  /* ── Reseal banner ─────────────────────────────────────────────── */

  .reseal-banner {
    position: sticky;
    top: var(--navbar-h, 0px);
    z-index: 5;
    margin-bottom: var(--space-xs);
    background: var(--paper, inherit);
    padding: 0 var(--space-md);
  }

  /* Search sheet: fill from bottom up to the Navbar */
  :global(.search-sheet) {
    height: calc(100dvh - var(--navbar-h, 64px) - 8px);
  }

  :global(.search-dropdown-backdrop) {
    position: fixed;
    /* top set via inline style to sit below navbar */
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 29;
  }

  :global(.search-dropdown) {
    position: absolute;
    /* top set via inline style to match navbar height */
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    max-width: 80%;
    z-index: 30;
    max-height: calc(100vh - var(--navbar-h, 64px));
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    border-bottom: 1px solid var(--hair, var(--divider));
    border-radius: 0 0 var(--card-radius, 0.75rem) var(--card-radius, 0.75rem);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    padding-bottom: var(--space-md, 0.75rem);
  }
</style>

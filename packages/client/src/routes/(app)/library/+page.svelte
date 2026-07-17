<script lang="ts">
  import {
    createInfiniteQuery,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { DialogButton, Button } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import {
    FolderInput,
    FolderPen,
    Trash2,
    Download,
    FilePlus,
  } from "@lucide/svelte";
  import BulkActionBar from "$lib/components/BulkActionBar.svelte";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import ViewSwitcher from "$lib/components/ViewSwitcher.svelte";
  import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
  import type {
    SortConfig,
    SavedFiltersConfig,
    FilterPillsConfig,
    ManageConfig,
  } from "$lib/shell/types.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { kbKeys } from "$lib/query/keys.js";
  import {
    getOrgDecryptCache,
    getOrgKeyManager,
    getCurrentUserId,
    getCurrentPermissions,
  } from "$lib/crypto/context.js";
  import {
    getScrollContainer,
    getNavbarOverrideCtx,
  } from "$lib/shell/context.js";
  import type { NavbarAction } from "$lib/shell/types";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import { requireRouter } from "$lib/errors.js";
  import { kbFilterStore } from "$lib/stores/kb-filters.svelte.js";
  import { kbViewModeStore } from "$lib/stores/kb-view-mode.svelte.js";
  import { kbSavedFilterStore } from "$lib/stores/kb-saved-filters.svelte.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import {
    kbSavedFilterStateSchema,
    Permission,
    type KbSortField,
    type SavedFilterColor,
  } from "@care-y/shared";
  import { resolveOrgDecrypt } from "$lib/crypto/decrypt-result.js";
  import type { PillDefinition } from "$lib/components/filters/filter-types.js";
  import CreateSavedFilter from "$lib/components/filters/CreateSavedFilter.svelte";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import ArticleCard from "$lib/components/library/ArticleCard.svelte";
  import ArticleTable from "$lib/components/library/ArticleTable.svelte";
  import MoveCategorySheet from "$lib/components/library/MoveCategorySheet.svelte";
  import CategoryManageSheet from "$lib/components/library/CategoryManageSheet.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import { getBrandingTitle } from "$lib/branding/title.svelte.js";
  import { orgInitial as deriveOrgInitial } from "$lib/utils/initials.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { gestureMount } from "$lib/utils/gesture-focus.js";
  import { cachedDate } from "$lib/utils/date-cache.js";
  import { getLibraryLayoutCtx } from "./library-layout-ctx.js";
  import { createFilterDispatch } from "$lib/composables/create-filter-dispatch.svelte.js";
  import { createSearchOverlay } from "$lib/search/search-overlay.svelte.js";
  import { createDeepSearch } from "$lib/search/deep-search.svelte.js";
  import SearchNavigator from "$lib/components/search/SearchNavigator.svelte";
  import { fuzzySearch } from "$lib/search/fuzzy.js";

  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());
  const canEdit = $derived(permissions.has(Permission.EDIT_KNOWLEDGE_BASE));
  const canDelete = $derived(permissions.has(Permission.MANAGE_USERS));
  const canManageCategories = $derived(
    permissions.has(Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES),
  );
  const libraryLayout = getLibraryLayoutCtx();
  const kbRouter = requireRouter(trpc.kb, "kb");
  const queryClient = useQueryClient();

  // Shell context.
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });
  const navbarCtx = getNavbarOverrideCtx();

  // --- Grid columns (dynamic based on container width) ---

  const GRID_CARD_MIN_WIDTH = 320;
  let containerWidth = $state(0);

  $effect(() => {
    const el = scrollEl;
    if (!el) return;
    containerWidth = el.clientWidth;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) containerWidth = entry.contentRect.width;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  const gridColumns = $derived(
    kbViewModeStore.mode === "grid"
      ? Math.max(1, Math.floor(containerWidth / GRID_CARD_MIN_WIDTH))
      : 1,
  );

  // --- Categories query (for filter options and card labels) ---
  const categoriesQuery = createQuery(() => ({
    queryKey: kbKeys.categories(),
    queryFn: async () => kbRouter.listCategories.query(),
  }));

  type CategoryRecord = NonNullable<typeof categoriesQuery.data>[number];

  // Build category name lookup: id -> decrypted name.
  const categoryNameMap = $derived.by(() => {
    const map = new SvelteMap<string, string | null>();
    for (const c of categoriesQuery.data ?? []) {
      map.set(c.id, orgCache.decrypt(`kb-cat:${c.id}`, c.encryptedName));
    }
    return map;
  });

  // --- Authors query (distinct KB article authors with display names) ---
  const authorsQuery = createQuery(() => ({
    queryKey: kbKeys.authors(),
    queryFn: async () => kbRouter.listAuthors.query(),
    staleTime: 10 * 60 * 1000,
  }));

  // Build author name lookup: userId -> decrypted display name.
  const authorNameMap = $derived.by(() => {
    const map = new SvelteMap<string, string>();
    for (const a of authorsQuery.data ?? []) {
      const name = orgCache.decrypt(
        `volunteer:${a.id}`,
        a.encryptedDisplayName,
      );
      if (name !== null) map.set(a.id, name);
    }
    return map;
  });

  function resolveAuthorName(userId: string): string | null {
    if (userId === currentUserId) return m.dashboard_assigned_you();
    return authorNameMap.get(userId) ?? null;
  }

  // --- Article list with infinite scroll ---
  const articlesQuery = createInfiniteQuery(() => ({
    queryKey: kbKeys.itemList(kbFilterStore.serverParams),
    queryFn: async ({ pageParam }) =>
      kbRouter.listItems.query({
        ...kbFilterStore.serverParams,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  }));

  const allArticles = $derived(
    articlesQuery.data?.pages.flatMap((p) => p.items) ?? [],
  );

  // Client-side category post-filter: when multiple categories are selected,
  // the server receives no categoryId filter (it only supports one). We
  // filter client-side instead.
  const filteredArticles = $derived.by(() => {
    if (kbFilterStore.categoryIds.size <= 1) return allArticles;
    return allArticles.filter((a) =>
      kbFilterStore.categoryIds.has(a.categoryId),
    );
  });

  const isOrgKeyLoaded = $derived(orgKeyManager.isLoaded);

  type CardViewMode = "list" | "cards" | "grid";
  function isCardViewMode(v: string): v is CardViewMode {
    return v === "list" || v === "cards" || v === "grid";
  }
  const cardViewMode: CardViewMode = $derived(
    isCardViewMode(kbViewModeStore.mode) ? kbViewModeStore.mode : "list",
  );

  // --- Search overlay ---

  const overlay = createSearchOverlay({
    matches: () => searchMatches,
    getElementId: (id) => `article-${id}`,
    scrollContainer: () => scrollEl,
  });

  const filteredArticleIds = $derived(
    new Set(filteredArticles.map((a) => a.id)),
  );

  const titleMatchIds = $derived.by((): string[] => {
    if (overlay.term == null) return [];
    const ids: string[] = [];
    const haystack: string[] = [];
    for (const article of filteredArticles) {
      const title = orgCache.decrypt(
        `kb-item:${article.id}`,
        article.encryptedTitle,
      );
      if (title == null) continue;
      const excerpt =
        orgCache.decrypt(
          `kb-excerpt:${article.id}`,
          article.encryptedExcerpt,
        ) ?? "";
      ids.push(article.id);
      haystack.push(`${title} ${excerpt}`);
    }
    const matches = fuzzySearch(haystack, overlay.term);
    return matches
      .map((fm) => ids[fm.index])
      .filter((id): id is string => id != null);
  });

  const deepSearch = createDeepSearch({
    overlay,
    providerId: "kb",
    hasNextPage: () => articlesQuery.hasNextPage,
    isFetchingNextPage: () => articlesQuery.isFetchingNextPage,
    fetchNextPage: async () => articlesQuery.fetchNextPage(),
    isInitialLoading: () => articlesQuery.isLoading,
    loadedCount: () => allArticles.length,
    matchCount: () => titleMatchIds.length,
  });

  const searchMatches = $derived.by((): string[] => {
    const cms = deepSearch.contentMatchIds;
    if (cms == null || cms.size === 0) return titleMatchIds;

    const seen = new Set(titleMatchIds);
    const merged = [...titleMatchIds];
    for (const id of cms) {
      if (!seen.has(id) && filteredArticleIds.has(id)) {
        merged.push(id);
      }
    }
    return merged;
  });

  let useMatchOrder = $state(true);

  $effect(() => {
    if (overlay.active) {
      useMatchOrder = true;
    }
  });

  const displayItems = $derived.by(() => {
    if (!overlay.active || overlay.term == null || overlay.term.length < 2) {
      return filteredArticles;
    }
    const matchSet = new Set(searchMatches);
    if (!useMatchOrder) {
      return filteredArticles.filter((a) => matchSet.has(a.id));
    }
    const idToArticle = new Map(filteredArticles.map((a) => [a.id, a]));
    const sorted: typeof filteredArticles = [];
    for (const id of searchMatches) {
      const a = idToArticle.get(id);
      if (a != null) sorted.push(a);
    }
    return sorted;
  });

  type ArticleItem = (typeof displayItems)[number];

  $effect(() => {
    const q = page.url.searchParams.get("q");
    if (q != null && q !== "") {
      overlay.enter(q);
      deepSearch.scheduleFromNavigation();
    }
  });

  let prevViewMode = $state(kbViewModeStore.mode);
  $effect(() => {
    const mode = kbViewModeStore.mode;
    if (mode !== prevViewMode) {
      prevViewMode = mode;
      if (overlay.activeId != null) {
        overlay.requestScroll();
      }
    }
  });

  // --- Multi-select ---
  let multiSelectActive = $state(false);
  const selectedIds = new SvelteSet<string>();

  function toggleMultiSelect(): void {
    if (multiSelectActive) {
      exitMultiSelect();
    } else {
      multiSelectActive = true;
    }
  }

  function toggleSelection(articleId: string): void {
    if (selectedIds.has(articleId)) {
      selectedIds.delete(articleId);
    } else {
      selectedIds.add(articleId);
    }
  }

  function exitMultiSelect(): void {
    multiSelectActive = false;
    selectedIds.clear();
  }

  function handleLongPress(articleId: string): void {
    if (!multiSelectActive) {
      multiSelectActive = true;
    }
    toggleSelection(articleId);
  }

  // --- Bulk actions ---
  let pendingAction = $state(false);
  let moveSheetOpen = $state(false);
  let deleteDialogOpen = $state(false);
  let categorySheetOpen = $state(false);

  const urlAction = $derived(page.url.searchParams.get("action"));

  $effect(() => {
    if (urlAction === "manage-categories" && canManageCategories) {
      categorySheetOpen = true;
    }
  });

  let lastAppliedSavedFilter = "";

  $effect(() => {
    const savedFilterId = page.url.searchParams.get("savedFilter");
    if (savedFilterId === null || savedFilterId === lastAppliedSavedFilter)
      return;

    lastAppliedSavedFilter = savedFilterId;
    const record = kbSavedFilterStore.filters.find(
      (f) => f.id === savedFilterId,
    );
    if (record != null) dispatch.handleSavedFilterApply(record);
    void goto(resolve("/library"), { replaceState: true });
  });

  function handleBulkMove(): void {
    if (selectedIds.size === 0 || pendingAction) return;
    moveSheetOpen = true;
  }

  async function handleMoveToCategory(categoryId: string): Promise<void> {
    if (pendingAction) return;
    pendingAction = true;
    const ids = [...selectedIds];
    let moved = 0;

    for (const itemId of ids) {
      try {
        await kbRouter.updateItem.mutate({ itemId, categoryId });
        moved++;
      } catch {
        const msg =
          moved > 0
            ? m.library_move_success({
                moved: String(moved),
                total: String(ids.length),
              })
            : m.error_generic();
        toastStore.show(msg, 3000);
        pendingAction = false;
        exitMultiSelect();
        return;
      }
    }

    haptic();
    toastStore.show(m.library_move_all_success({ count: String(moved) }));
    pendingAction = false;
    exitMultiSelect();
    void queryClient.invalidateQueries({ queryKey: kbKeys.items() });
  }

  function handleBulkDelete(): void {
    if (selectedIds.size === 0 || pendingAction) return;
    deleteDialogOpen = true;
  }

  async function confirmBulkDelete(): Promise<void> {
    deleteDialogOpen = false;
    if (pendingAction) return;
    pendingAction = true;
    const ids = [...selectedIds];
    let deleted = 0;

    for (const itemId of ids) {
      try {
        await kbRouter.deleteItem.mutate({ itemId });
        deleted++;
      } catch {
        const msg =
          deleted > 0
            ? m.library_delete_success({
                deleted: String(deleted),
                total: String(ids.length),
              })
            : m.error_generic();
        toastStore.show(msg, 3000);
        pendingAction = false;
        exitMultiSelect();
        return;
      }
    }

    haptic();
    toastStore.show(m.library_delete_all_success({ count: String(deleted) }));
    pendingAction = false;
    exitMultiSelect();
    void queryClient.invalidateQueries({ queryKey: kbKeys.items() });
  }

  function handleBulkExport(): void {
    toastStore.show(m.feature_coming_soon());
  }

  // Subnavbar override.
  $effect(() => {
    const newArticleAction: NavbarAction = {
      icon: FilePlus,
      label: m.library_new_article(),
      onclick: () => void goto(resolve("/library/new")),
    };
    navbarCtx.current = {
      actions: canEdit ? [newArticleAction] : [],
      subnavbar: librarySubnavbar,
      subnavbarHidden: () => scrollDir.hidden && !overlay.active,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // --- SubNavbar config objects ---
  function handleViewChange(mode: ViewMode): void {
    kbViewModeStore.set(mode);
  }

  const KB_SORT_FIELDS: readonly KbSortField[] = [
    "created_at",
    "updated_at",
    "rating",
  ];

  function isKbSortField(value: string): value is KbSortField {
    return (KB_SORT_FIELDS as readonly string[]).includes(value);
  }

  const dispatch = createFilterDispatch({
    fields: {
      category: {
        type: "multi-toggle",
        toggle: (v: string) => kbFilterStore.toggleCategory(v),
      },
      rating: {
        type: "single-select",
        set: (v: string | null) => {
          if (v === "high") kbFilterStore.setMinRating(0.5);
          else if (v === "positive") kbFilterStore.setMinRating(0.01);
          else kbFilterStore.setMinRating(undefined);
        },
      },
      author: {
        type: "single-select",
        set: (v: string | null) => kbFilterStore.setCreatedBy(v ?? undefined),
      },
      date: {
        type: "date-range",
        set: (from: Date | null, to: Date | null) =>
          kbFilterStore.setDateRange(from, to),
      },
    },
    sort: {
      validate: isKbSortField,
      set: (field: string, dir: "asc" | "desc") => {
        if (isKbSortField(field)) kbFilterStore.setSort(field, dir);
      },
    },
    savedFilters: {
      store: kbSavedFilterStore,
      captureState: () => kbFilterStore.captureState(),
      applyState: (state: unknown) => {
        const result = kbSavedFilterStateSchema.safeParse(state);
        if (result.success) kbFilterStore.applyState(result.data);
      },
      stateSchema: kbSavedFilterStateSchema,
      getCurrentUserId: () => currentUserId ?? null,
    },
    clearAll: () => kbFilterStore.clearAll(),
    onchange: () => {
      if (overlay.active) useMatchOrder = false;
    },
  });

  const sortConfig: SortConfig = $derived({
    label: m.library_sort(),
    options: [
      { field: "created_at", label: m.library_sort_date() },
      { field: "updated_at", label: m.library_sort_updated() },
      { field: "rating", label: m.library_sort_rating() },
    ],
    currentField: kbFilterStore.sort.field,
    currentDirection: kbFilterStore.sort.direction,
    onchange: dispatch.handleSortChange,
  });

  const savedFiltersConfig: SavedFiltersConfig = $derived({
    filters: kbSavedFilterStore.filters,
    count: kbSavedFilterStore.count,
    onapply: dispatch.handleSavedFilterApply,
    ondelete: dispatch.handleSavedFilterDelete,
    ontoggleshare: dispatch.handleSavedFilterToggleShare,
  });

  // --- Filter pill definitions ---
  const categoryOptions = $derived(
    (categoriesQuery.data ?? []).map((c: CategoryRecord) => ({
      value: c.id,
      label: orgCache.decrypt(`kb-cat:${c.id}`, c.encryptedName) ?? "...",
    })),
  );

  const ratingOptions = [
    { value: "any", label: m.library_filter_rating_any() },
    { value: "positive", label: m.library_filter_rating_positive() },
    { value: "high", label: m.library_filter_rating_high() },
  ];

  const ratingSelected = $derived.by(() => {
    const r = kbFilterStore.minRating;
    if (r === undefined) return null;
    return r >= 0.5 ? "high" : "positive";
  });

  const authorOptions = $derived(
    [...authorNameMap.entries()].map(([id, name]) => ({
      value: id,
      label: name,
    })),
  );

  const kbPills: PillDefinition[] = $derived([
    {
      id: "category",
      label: m.library_filter_category(),
      mode: "multi",
      options: categoryOptions,
      selected: kbFilterStore.categoryIds,
      loading: categoriesQuery.isLoading,
    },
    {
      id: "rating",
      label: m.library_filter_rating(),
      mode: "single",
      options: ratingOptions,
      selected: ratingSelected,
    },
    {
      id: "author",
      label: m.library_filter_author(),
      mode: "single",
      options: authorOptions,
      selected: kbFilterStore.createdBy ?? null,
    },
    {
      id: "date",
      label: m.library_filter_date_range(),
      mode: "date",
      options: [],
      selected: null,
    },
  ]);

  const dateRangeActive = $derived(
    kbFilterStore.dateFrom !== null || kbFilterStore.dateTo !== null,
  );
  const dateFromStr = $derived(
    kbFilterStore.dateFrom?.toISOString().slice(0, 10) ?? "",
  );
  const dateToStr = $derived(
    kbFilterStore.dateTo?.toISOString().slice(0, 10) ?? "",
  );
  const dateRangeLabel = $derived.by(() => {
    const from = kbFilterStore.dateFrom;
    const to = kbFilterStore.dateTo;
    if (from !== null && to !== null)
      return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
    if (from !== null) return `From ${from.toLocaleDateString()}`;
    if (to !== null) return `To ${to.toLocaleDateString()}`;
    return m.library_filter_date_range();
  });

  const filterPillsConfig: FilterPillsConfig = $derived({
    pills: kbPills,
    activeCount: kbFilterStore.activeCount,
    filterLabel: m.library_filter(),
    dateFrom: dateFromStr,
    dateTo: dateToStr,
    dateActive: dateRangeActive,
    dateLabel: dateRangeLabel,
    ontoggle: dispatch.handlePillToggle,
    onselect: dispatch.handlePillSelect,
    ondatechange: dispatch.handlePillDateChange,
    onclearall: dispatch.clearAll,
    oncreateshortcut: () => {
      savedFilterModalOpen = true;
    },
  });

  const filterSummary = $derived.by(() => {
    const parts: string[] = [];
    if (kbFilterStore.categoryIds.size > 0) {
      const count = kbFilterStore.categoryIds.size;
      parts.push(`${String(count)} categor${count > 1 ? "ies" : "y"}`);
    }
    if (kbFilterStore.minRating !== undefined) parts.push("rated");
    if (kbFilterStore.createdBy !== undefined) parts.push("by author");
    if (kbFilterStore.dateFrom !== null || kbFilterStore.dateTo !== null)
      parts.push("date range");
    return parts.length > 0 ? parts.join(", ") : "No filters";
  });

  function handleCreateSavedFilter(meta: {
    encryptedName: string;
    color: SavedFilterColor;
    icon: string;
  }): void {
    dispatch.handleCreateSavedFilter(meta);
    toastStore.show(m.saved_filter_saved());
  }

  let savedFilterModalOpen = $state(false);

  // Stats row.
  const articleCount = $derived(filteredArticles.length);

  function handleArticleTap(articleId: string): void {
    haptic();
    libraryLayout.openArticle(articleId);
  }

  function handleArticleFullOpen(articleId: string): void {
    libraryLayout.openArticleFull(articleId);
  }

  function loadNextPage(): void {
    if (articlesQuery.hasNextPage && !articlesQuery.isFetchingNextPage) {
      void articlesQuery.fetchNextPage();
    }
  }

  // Categories for move sheet (exclude selected articles' current category).
  const moveCategoryOptions = $derived(
    (categoriesQuery.data ?? []).map((c: CategoryRecord) => ({
      id: c.id,
      name: categoryNameMap.get(c.id) ?? null,
    })),
  );

  // Categories for manage sheet (with article counts).
  // Only computed when the sheet is open to avoid re-counting on every
  // infinite scroll page load. Returns empty when closed (sheet is hidden).
  const manageCategoryOptions = $derived.by(() => {
    if (!categorySheetOpen) return [];
    const countMap = new SvelteMap<string, number>();
    for (const a of allArticles) {
      countMap.set(a.categoryId, (countMap.get(a.categoryId) ?? 0) + 1);
    }
    return (categoriesQuery.data ?? []).map((c: CategoryRecord) => ({
      id: c.id,
      name: categoryNameMap.get(c.id) ?? null,
      description: c.encryptedDescription
        ? orgCache.decrypt(`kb-cat-desc:${c.id}`, c.encryptedDescription)
        : null,
      articleCount: countMap.get(c.id) ?? 0,
    }));
  });

  const manageConfig: ManageConfig | undefined = $derived(
    canManageCategories
      ? {
          label: m.library_manage_categories(),
          icon: FolderPen,
          onclick: () => {
            categorySheetOpen = true;
          },
        }
      : undefined,
  );

  function handleTableSort(
    field: KbSortField,
    direction: "asc" | "desc",
  ): void {
    kbFilterStore.setSort(field, direction);
  }

  // tableRows remaps on every decrypt settle, so Date construction goes
  // through the memoized parser instead of allocating per row per recompute.
  const tableRows = $derived(
    displayItems.map((article) => ({
      id: article.id,
      titleResult: resolveOrgDecrypt(
        orgCache.decrypt(`kb-item:${article.id}`, article.encryptedTitle),
        isOrgKeyLoaded,
      ),
      encryptedTitle: article.encryptedTitle,
      categoryName: categoryNameMap.get(article.categoryId) ?? null,
      authorName: resolveAuthorName(article.createdBy),
      voteUpCount: article.voteUpCount,
      voteTotalCount: article.voteUpCount + article.voteDownCount,
      updatedAt: cachedDate(article.updatedAt),
    })),
  );

  function skeletonNoop(): void {
    /* skeleton card, no interaction */
  }

  // Org initial for the truly-empty room's identity seal (the tickets
  // list's welcome-room pattern; grapheme-aware for non-Latin names).
  const orgInitial = $derived(deriveOrgInitial(getBrandingTitle()));
</script>

{#snippet bulkActionsRow()}
  <BulkActionBar
    countLabel={m.library_selected({ count: selectedIds.size })}
    exitLabel={m.library_exit_multiselect()}
    onexit={exitMultiSelect}
    ariaLabel={m.library_selected({ count: selectedIds.size })}
  >
    {#snippet actions()}
      <Button
        tonal
        rounded
        small
        inline
        class="bulk-action-btn"
        onclick={handleBulkMove}
      >
        <FolderInput size={16} aria-hidden="true" />
        {m.library_action_move()}
      </Button>
      {#if canDelete}
        <Button
          tonal
          rounded
          small
          inline
          class="bulk-action-btn"
          onclick={handleBulkDelete}
        >
          <Trash2 size={16} aria-hidden="true" />
          {m.library_action_delete()}
        </Button>
      {/if}
      <Button
        tonal
        rounded
        small
        inline
        class="bulk-action-btn"
        onclick={handleBulkExport}
      >
        <Download size={16} aria-hidden="true" />
        {m.library_action_export()}
      </Button>
    {/snippet}
  </BulkActionBar>
{/snippet}

{#snippet libraryStats()}
  {#if !articlesQuery.isLoading}
    <span class="stat-item">
      {m.library_stats_count({ count: String(articleCount) })}
    </span>
  {/if}
{/snippet}

{#snippet searchNavigatorRow()}
  <SearchNavigator
    term={overlay.term ?? ""}
    position={overlay.position}
    total={overlay.matchCount}
    onup={overlay.up}
    ondown={overlay.down}
    onexit={overlay.exit}
    ontermchange={overlay.setTerm}
    ondeepsearch={deepSearch.canTrigger ? deepSearch.trigger : undefined}
    deepSearchStatus={deepSearch.status}
    deepSearchSearched={deepSearch.searched}
    deepSearchTotal={deepSearch.total}
  />
{/snippet}

{#snippet kbViewSwitcher()}
  <ViewSwitcher mode={kbViewModeStore.mode} onchange={handleViewChange} />
{/snippet}

{#snippet librarySubnavbar()}
  <SubNavbarFilterLayout
    title={m.library_title(withTerms())}
    headerRight={kbViewSwitcher}
    stats={libraryStats}
    sort={sortConfig}
    selectLabel={m.library_select_mode()}
    onselect={toggleMultiSelect}
    savedFilters={savedFiltersConfig}
    filterPills={filterPillsConfig}
    manage={manageConfig}
    searchNavigator={overlay.active ? searchNavigatorRow : undefined}
    bulkActions={multiSelectActive ? bulkActionsRow : undefined}
    onsearch={!overlay.active
      ? () => gestureMount(() => overlay.enter(""))
      : undefined}
    searchLabel={m.search_inline_trigger()}
  />
{/snippet}

<div class="library-page pb-20">
  {#if articlesQuery.isLoading}
    {#if kbViewModeStore.mode === "table"}
      <ArticleTable
        rows={[]}
        loading={true}
        sortField={kbFilterStore.sort.field}
        sortDirection={kbFilterStore.sort.direction}
        onsortchange={handleTableSort}
        ontap={skeletonNoop}
        {multiSelectActive}
      />
    {:else}
      <div
        class="article-list"
        class:article-grid={kbViewModeStore.mode === "grid"}
        class:article-compact-list={kbViewModeStore.mode === "list"}
      >
        {#each [1, 2, 3, 4] as n (n)}
          <ArticleCard
            loading={true}
            viewMode={cardViewMode}
            articleId=""
            titleResult={{ status: "loading" }}
            excerptResult={{ status: "loading" }}
            categoryName={null}
            authorName={null}
            voteUpCount={0}
            voteTotalCount={0}
            updatedAt={new Date()}
            ontap={skeletonNoop}
          />
        {/each}
      </div>
    {/if}
  {:else if articlesQuery.isError}
    <QueryError error={articlesQuery.error} />
  {:else if displayItems.length === 0}
    {#if kbFilterStore.activeCount > 0}
      <EmptyState title={m.library_empty_filter()} />
    {:else}
      <EmptyState
        stamp={m.library_empty_articles()}
        subtitle={m.library_empty_articles_body()}
      />
    {/if}
  {:else if kbViewModeStore.mode === "table"}
    <ArticleTable
      rows={tableRows}
      sortField={kbFilterStore.sort.field}
      sortDirection={kbFilterStore.sort.direction}
      onsortchange={handleTableSort}
      ontap={handleArticleTap}
      onfullopen={handleArticleFullOpen}
      {multiSelectActive}
      {selectedIds}
      onselect={toggleSelection}
      onlongpress={handleLongPress}
      activeId={overlay.activeId}
      searchTerm={overlay.term}
      onloadmore={articlesQuery.hasNextPage ? loadNextPage : undefined}
    />
  {:else}
    <div class="article-list">
      <VirtualList
        items={displayItems}
        scrollContainer={scrollEl}
        estimateHeight={kbViewModeStore.mode === "grid"
          ? 200
          : kbViewModeStore.mode === "list"
            ? 64
            : 140}
        columns={gridColumns}
        getKey={(article: ArticleItem) => article.id}
        onloadmore={articlesQuery.hasNextPage ? loadNextPage : undefined}
      >
        {#snippet children({
          item: article,
        }: {
          item: ArticleItem;
          index: number;
        })}
          <div
            id="article-{article.id}"
            class="search-target"
            class:match-active={overlay.activeId === article.id}
            class:article-card-selected={libraryLayout.selectedArticleId() ===
              article.id}
            aria-current={overlay.activeId === article.id ||
            libraryLayout.selectedArticleId() === article.id
              ? "true"
              : undefined}
          >
            <ArticleCard
              articleId={article.id}
              viewMode={cardViewMode}
              titleResult={resolveOrgDecrypt(
                orgCache.decrypt(
                  `kb-item:${article.id}`,
                  article.encryptedTitle,
                ),
                isOrgKeyLoaded,
              )}
              excerptResult={resolveOrgDecrypt(
                orgCache.decrypt(
                  `kb-excerpt:${article.id}`,
                  article.encryptedExcerpt,
                ),
                isOrgKeyLoaded,
              )}
              encryptedTitle={article.encryptedTitle}
              encryptedExcerpt={article.encryptedExcerpt}
              categoryName={categoryNameMap.get(article.categoryId) ?? null}
              authorName={resolveAuthorName(article.createdBy)}
              voteUpCount={article.voteUpCount}
              voteTotalCount={article.voteUpCount + article.voteDownCount}
              updatedAt={new Date(article.updatedAt)}
              selected={selectedIds.has(article.id)}
              {multiSelectActive}
              ontap={handleArticleTap}
              onfullopen={handleArticleFullOpen}
              onselect={toggleSelection}
              onlongpress={handleLongPress}
              searchTerm={overlay.term}
            />
          </div>
        {/snippet}
      </VirtualList>
    </div>
  {/if}
</div>

<CreateSavedFilter
  opened={savedFilterModalOpen}
  {filterSummary}
  ondismiss={() => {
    savedFilterModalOpen = false;
  }}
  onsave={handleCreateSavedFilter}
/>

<MoveCategorySheet
  opened={moveSheetOpen}
  categories={moveCategoryOptions}
  ondismiss={() => {
    moveSheetOpen = false;
  }}
  onmove={(catId: string) => void handleMoveToCategory(catId)}
/>

<CategoryManageSheet
  opened={categorySheetOpen}
  categories={manageCategoryOptions}
  ondismiss={() => {
    categorySheetOpen = false;
  }}
/>

<ShellDialog
  opened={deleteDialogOpen}
  ondismiss={() => {
    deleteDialogOpen = false;
  }}
  title={m.library_delete_confirm_title()}
>
  {#snippet content()}
    {m.library_delete_confirm_body({ count: String(selectedIds.size) })}
  {/snippet}
  {#snippet buttons()}
    <DialogButton
      onclick={() => {
        deleteDialogOpen = false;
      }}
    >
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={() => void confirmBulkDelete()}
    >
      {m.common_delete()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .library-page {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .stat-item {
    white-space: nowrap;
  }

  .article-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .article-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--space-md);
  }

  .article-compact-list {
    gap: 0;
  }

  .search-target {
    min-width: 0;
    overflow: hidden;
  }

  .article-card-selected {
    /* Split-pane selection is an identity slot: brand-soft, never a
       stronger brand fill. */
    background: var(--brand-soft, var(--brand-primary-20));
    border-radius: var(--card-radius);
  }
</style>

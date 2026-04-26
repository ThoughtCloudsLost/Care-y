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
  import { Dialog, DialogButton, Link } from "konsta/svelte";
  import {
    FolderInput,
    FolderPen,
    Trash2,
    Download,
    X,
    FilePlus,
  } from "@lucide/svelte";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import type {
    ViewToggleConfig,
    SortConfig,
    SavedFiltersConfig,
    FilterPillsConfig,
    ManageConfig,
  } from "$lib/shell/types.js";
  import * as m from "$lib/paraglide/messages.js";
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
    getTabbarOverrideCtx,
    getNavbarOverrideCtx,
  } from "$lib/shell/context.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { kbFilterStore } from "$lib/stores/kb-filters.svelte.js";
  import { kbViewModeStore } from "$lib/stores/kb-view-mode.svelte.js";
  import { kbSavedFilterStore } from "$lib/stores/kb-saved-filters.svelte.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import {
    kbSavedFilterStateSchema,
    Permission,
    type KbSortField,
    type SavedFilterRecord,
    type SavedFilterColor,
  } from "@care-y/shared";
  import { resolveOrgDecrypt } from "$lib/crypto/decrypt-result.js";
  import type { PillDefinition } from "$lib/components/filters/filter-types.js";
  import CreateSavedFilter from "$lib/components/filters/CreateSavedFilter.svelte";
  import VirtualList from "$lib/components/tickets/VirtualList.svelte";
  import ArticleCard from "$lib/components/library/ArticleCard.svelte";
  import MoveCategorySheet from "$lib/components/library/MoveCategorySheet.svelte";
  import CategoryManageSheet from "$lib/components/library/CategoryManageSheet.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import { haptic } from "$lib/utils/haptic.js";
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
  if (!trpc.kb) throw new RouterNotAvailableError("kb");
  const kbRouter = trpc.kb;
  const queryClient = useQueryClient();

  // Shell context.
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });
  const tabbarOverride = getTabbarOverrideCtx();
  const navbarCtx = getNavbarOverrideCtx();

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

  // Tabbar override for multi-select.
  $effect(() => {
    if (multiSelectActive) {
      tabbarOverride.current = {
        left: batchLeft,
        middle: batchMiddle,
        right: batchRight,
        ariaLabel: m.library_selected({ count: selectedIds.size }),
      };
    } else {
      tabbarOverride.current = undefined;
    }
  });

  $effect(() => {
    return () => {
      tabbarOverride.current = undefined;
    };
  });

  // Subnavbar override.
  $effect(() => {
    navbarCtx.current = {
      right: canEdit ? navRight : undefined,
      subnavbar: librarySubnavbar,
      subnavbarHidden: () => scrollDir.hidden && !overlay.active,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // --- SubNavbar config objects ---
  const viewConfig: ViewToggleConfig = $derived({
    mode: kbViewModeStore.mode,
    onchange: (mode: "list" | "grid") => kbViewModeStore.set(mode),
    listLabel: m.library_view_list(),
    gridLabel: m.library_view_grid(),
  });

  const KB_SORT_FIELDS: readonly KbSortField[] = [
    "created_at",
    "updated_at",
    "rating",
  ];

  function isKbSortField(value: string): value is KbSortField {
    return (KB_SORT_FIELDS as readonly string[]).includes(value);
  }

  function handleSortChange(field: string, dir: "asc" | "desc"): void {
    if (isKbSortField(field)) kbFilterStore.setSort(field, dir);
    if (overlay.active) useMatchOrder = false;
  }

  const sortConfig: SortConfig = $derived({
    label: m.library_sort(),
    options: [
      { field: "created_at", label: m.library_sort_date() },
      { field: "updated_at", label: m.library_sort_updated() },
      { field: "rating", label: m.library_sort_rating() },
    ],
    currentField: kbFilterStore.sort.field,
    currentDirection: kbFilterStore.sort.direction,
    onchange: handleSortChange,
  });

  const savedFiltersConfig: SavedFiltersConfig = $derived({
    filters: kbSavedFilterStore.filters,
    count: kbSavedFilterStore.count,
    onapply: handleSavedFilterApply,
    ondelete: handleSavedFilterDelete,
    ontoggleshare: handleSavedFilterToggleShare,
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

  function handlePillToggle(pillId: string, value: string): void {
    if (pillId === "category") {
      kbFilterStore.toggleCategory(value);
    }
  }

  function handlePillSelect(pillId: string, value: string | null): void {
    if (pillId === "rating") {
      if (value === "high") kbFilterStore.setMinRating(0.5);
      else if (value === "positive") kbFilterStore.setMinRating(0.01);
      else kbFilterStore.setMinRating(undefined);
    } else if (pillId === "author") {
      kbFilterStore.setCreatedBy(value ?? undefined);
    }
  }

  function handlePillDateChange(from: Date | null, to: Date | null): void {
    kbFilterStore.setDateRange(from, to);
  }

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
    ontoggle: handlePillToggle,
    onselect: handlePillSelect,
    ondatechange: handlePillDateChange,
    onclearall: () => kbFilterStore.clearAll(),
    oncreateshortcut: () => {
      savedFilterModalOpen = true;
    },
  });

  // --- Saved filter wiring ---
  function handleSavedFilterApply(record: SavedFilterRecord): void {
    const parsed: unknown = JSON.parse(record.state);
    const result = kbSavedFilterStateSchema.safeParse(parsed);
    if (result.success) {
      kbFilterStore.applyState(result.data);
    }
  }

  function handleSavedFilterDelete(id: string): void {
    kbSavedFilterStore.remove(id);
  }

  function handleSavedFilterToggleShare(id: string): void {
    kbSavedFilterStore.toggleShare(id);
  }

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
    const record: SavedFilterRecord = {
      id: crypto.randomUUID(),
      encryptedName: meta.encryptedName,
      color: meta.color,
      icon: meta.icon,
      state: JSON.stringify(kbFilterStore.captureState()),
      shared: false,
      ownerId: currentUserId ?? "",
      createdAt: new Date().toISOString(),
    };
    kbSavedFilterStore.add(record);
    toastStore.show(m.saved_filter_saved());
  }

  let savedFilterModalOpen = $state(false);

  // Stats row.
  const articleCount = $derived(filteredArticles.length);

  function handleArticleTap(articleId: string): void {
    haptic();
    void goto(resolve(`/library/${articleId}`));
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

  function skeletonNoop(): void {
    /* skeleton card, no interaction */
  }
</script>

{#snippet navRight()}
  <Link
    iconOnly
    onclick={() => void goto(resolve("/library/new"))}
    role="button"
    aria-label={m.library_new_article()}
  >
    <FilePlus size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet batchLeft()}
  <Link iconOnly onclick={handleBulkMove} aria-label={m.library_action_move()}>
    <FolderInput size={24} aria-hidden="true" />
  </Link>
  {#if canDelete}
    <Link
      iconOnly
      onclick={handleBulkDelete}
      aria-label={m.library_action_delete()}
    >
      <Trash2 size={24} aria-hidden="true" />
    </Link>
  {/if}
  <Link
    iconOnly
    onclick={handleBulkExport}
    aria-label={m.library_action_export()}
  >
    <Download size={24} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet batchMiddle()}
  <span class="font-semibold text-sm" role="status">
    {m.library_selected({ count: selectedIds.size })}
  </span>
{/snippet}

{#snippet batchRight()}
  <Link
    iconOnly
    aria-label={m.library_exit_multiselect()}
    onclick={exitMultiSelect}
  >
    <X size={24} aria-hidden="true" />
  </Link>
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

{#snippet librarySubnavbar()}
  <SubNavbarFilterLayout
    title={m.library_title()}
    view={viewConfig}
    stats={libraryStats}
    sort={sortConfig}
    selectLabel={m.library_select_mode()}
    onselect={toggleMultiSelect}
    savedFilters={savedFiltersConfig}
    filterPills={filterPillsConfig}
    manage={manageConfig}
    searchNavigator={overlay.active ? searchNavigatorRow : undefined}
    onsearch={!overlay.active ? () => overlay.enter("") : undefined}
    searchLabel={m.search_inline_trigger()}
  />
{/snippet}

<div class="library-page pb-20">
  {#if articlesQuery.isLoading}
    <div
      class="article-list"
      class:article-grid={kbViewModeStore.mode === "grid"}
    >
      {#each [1, 2, 3, 4] as n (n)}
        <ArticleCard
          loading={true}
          viewMode={kbViewModeStore.mode}
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
  {:else if articlesQuery.isError}
    <QueryError error={articlesQuery.error} />
  {:else if displayItems.length === 0}
    <div
      class="empty-state"
      role="status"
      aria-label={m.library_article_list_empty()}
    >
      <p>
        {kbFilterStore.activeCount > 0
          ? m.library_empty_filter()
          : m.library_empty_articles()}
      </p>
    </div>
  {:else}
    <div class="article-list">
      <VirtualList
        items={displayItems}
        scrollContainer={scrollEl}
        estimateHeight={kbViewModeStore.mode === "grid" ? 200 : 140}
        columns={kbViewModeStore.mode === "grid" ? 2 : 1}
        getKey={(article: (typeof displayItems)[number]) => article.id}
        onloadmore={articlesQuery.hasNextPage ? loadNextPage : undefined}
      >
        {#snippet children({
          item: article,
        }: {
          item: (typeof displayItems)[number];
          index: number;
        })}
          <div
            id="article-{article.id}"
            class="search-target"
            class:match-active={overlay.activeId === article.id}
            aria-current={overlay.activeId === article.id ? "true" : undefined}
          >
            <ArticleCard
              articleId={article.id}
              viewMode={kbViewModeStore.mode}
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

<Dialog
  opened={deleteDialogOpen}
  title={m.library_delete_confirm_title()}
  onBackdropClick={() => {
    deleteDialogOpen = false;
  }}
>
  {m.library_delete_confirm_body({ count: String(selectedIds.size) })}
  {#snippet buttons()}
    <DialogButton
      onclick={() => {
        deleteDialogOpen = false;
      }}
    >
      {m.common_cancel()}
    </DialogButton>
    <DialogButton strong onclick={() => void confirmBulkDelete()}>
      {m.common_delete()}
    </DialogButton>
  {/snippet}
</Dialog>

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
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--muted);
    font-size: var(--text-base);
  }

  .search-target {
    min-width: 0;
    overflow: hidden;
  }
</style>

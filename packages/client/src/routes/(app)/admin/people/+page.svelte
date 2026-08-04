<script lang="ts">
  import { untrack } from "svelte";
  import { Link, List, ListItem } from "konsta/svelte";
  import { page } from "$app/state";
  import { goto, replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createQuery, createInfiniteQuery } from "@tanstack/svelte-query";
  import { queueKeys, adminKeys, clientKeys } from "$lib/query/keys.js";
  import { Permission, RoleId } from "@care-y/shared";
  import {
    Users,
    Layers,
    HeartHandshake,
    ShieldCheck,
    UserPlus,
    LayersPlus,
    Link2,
  } from "@lucide/svelte";
  import IconTabToggle from "$lib/components/shared/IconTabToggle.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import {
    getNavbarOverrideCtx,
    getScrollContainer,
  } from "$lib/shell/context.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import {
    getCurrentPermissions,
    getOrgDecryptCache,
    getOrgKeyManager,
  } from "$lib/crypto/context.js";
  import { setPromotedOverride } from "$lib/search/registry.svelte.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { createFilterDispatch } from "$lib/composables/create-filter-dispatch.svelte.js";
  import SubNavbarFilterLayout from "$lib/shell/SubNavbarFilterLayout.svelte";
  import type {
    SortConfig,
    SavedFiltersConfig,
    FilterPillsConfig,
  } from "$lib/shell/types.js";
  import type { PillDefinition } from "$lib/components/filters/filter-types.js";
  import { userFilterStore } from "$lib/stores/user-filters.svelte.js";
  import { queueFilterStore } from "$lib/stores/queue-filters.svelte.js";
  import { clientFilterStore } from "$lib/stores/client-filters.svelte.js";
  import { buildDateRangeLabel } from "$lib/tickets/ticket-list-utils.js";
  import {
    type PeopleTab,
    isPeopleTab,
    defaultTab,
    isSortField,
    isQueueSortField,
    isClientSortField,
    isRoleId,
    isUserStatus,
    isKeyStatus,
  } from "$lib/admin/people-utils.js";
  import { createInviteFlow } from "$lib/composables/people/create-invite-flow.svelte.js";
  import { gestureMount } from "$lib/utils/gesture-focus.js";
  import { createSearchOverlay } from "$lib/search/search-overlay.svelte.js";
  import SearchNavigator from "$lib/components/search/SearchNavigator.svelte";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";
  import UsersSection from "$lib/components/admin/UsersSection.svelte";
  import QueuesSection from "$lib/components/admin/QueuesSection.svelte";
  import ClientsSection from "$lib/components/admin/ClientsSection.svelte";
  import RolePermissionsSection from "$lib/components/admin/RolePermissionsSection.svelte";

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const canManageUsers = $derived(permissions.has(Permission.MANAGE_USERS));
  const canManageQueues = $derived(permissions.has(Permission.MANAGE_QUEUES));
  const canViewClients = $derived(permissions.has(Permission.VIEW_CLIENTS));
  const canManageRoles = $derived(permissions.has(Permission.MANAGE_ROLES));
  const canInviteWithLink = $derived(canManageRoles);
  const hasAccess = $derived(
    canManageUsers || canManageQueues || canViewClients || canManageRoles,
  );

  $effect(() => {
    if (!hasAccess) void goto(resolve("/"));
  });

  // Promote volunteer search section to the top while on this page.
  $effect(() => {
    const clear = setPromotedOverride("volunteers");
    return clear;
  });

  // ── Queries for queue filter pill ──

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const orgCache = getOrgDecryptCache();

  const queuesQuery = createQuery(() => ({
    queryKey: queueKeys.all,
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  const queueAssignmentsQuery = createQuery(() => ({
    queryKey: adminKeys.queueAssignments(),
    queryFn: async () => ticketRouter.listAllQueueAssignments.query(),
  }));

  const queuePillOptions = $derived.by(() => {
    const queues = queuesQuery.data ?? [];
    return queues.map((q) => {
      const name = orgCache.decrypt(`queue:${q.id}`, q.encryptedName);
      return { value: q.id, label: name ?? q.id.slice(0, 8) };
    });
  });

  const urlTab = $derived.by(() => {
    const raw = page.url.searchParams.get("tab");
    return raw !== null && isPeopleTab(raw) ? raw : null;
  });

  const urlAction = $derived(page.url.searchParams.get("action"));
  const urlUser = $derived(page.url.searchParams.get("user"));

  let activeTab = $state<PeopleTab>(untrack(() => defaultTab(permissions)));

  $effect(() => {
    if (urlUser !== null) {
      // A user deep link always lands on the users tab; ignoring urlTab
      // here keeps the two params from re-triggering each other when a
      // link carries both (?tab=queues&user=x would otherwise oscillate).
      if (activeTab !== "users") activeTab = "users";
    } else if (urlTab !== null) {
      activeTab = urlTab;
    }
  });

  function switchTab(tab: PeopleTab): void {
    activeTab = tab;
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- shallow routing, same page query param
    replaceState(`?tab=${tab}`, {});
  }

  // Scroll direction for subnavbar collapse.
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });

  // Section refs for exported state.
  let usersSectionRef = $state<ReturnType<typeof UsersSection> | null>(null);
  let queuesSectionRef = $state<ReturnType<typeof QueuesSection> | null>(null);

  // ── Clients query ──

  // Capture filter state into a stable object for the query key so cached
  // pages invalidate when any pill changes.
  const clientFilterParams = $derived({
    query: clientFilterStore.search,
    sortBy: clientFilterStore.sort.field,
    sortDirection: clientFilterStore.sort.direction,
    hasApplications: clientFilterStore.hasApplications ?? undefined,
    createdAfter: clientFilterStore.createdAfter?.toISOString(),
    createdBefore: clientFilterStore.createdBefore?.toISOString(),
    includeMerged: clientFilterStore.includeMerged || undefined,
  });

  // Compute an alias hash for exact server-side match when the search
  // term is non-empty. Substring filtering happens page-local over
  // loaded rows; only the exact-alias lookup reaches the full roster.
  let clientAliasHash = $state<string | undefined>(undefined);
  $effect(() => {
    const q = clientFilterStore.search.trim();
    if (q.length === 0) {
      clientAliasHash = undefined;
      return;
    }
    void orgKeyManager.aliasHash(q).then((hash) => {
      clientAliasHash = hash;
    });
  });

  const clientsRouter = requireRouter(trpc.clients, "clients");

  const clientsQuery = createInfiniteQuery(() => ({
    queryKey: clientKeys.list({
      ...clientFilterParams,
      aliasHash: clientAliasHash,
    }),
    queryFn: async ({ pageParam }) =>
      clientsRouter.list.query({
        ...clientFilterParams,
        aliasHash: clientAliasHash,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length >= 25 ? lastPage[lastPage.length - 1]?.id : undefined,
    enabled: activeTab === "clients" && canViewClients,
  }));

  const allClients = $derived(clientsQuery.data?.pages.flat() ?? []);

  // ── Search overlay (SearchNavigator pattern) ──

  const searchMatches = $derived(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- bind:this ref loses exported function return types
    (usersSectionRef?.matchedUserIds() as readonly string[] | undefined) ?? [],
  );

  const overlay = createSearchOverlay({
    matches: () => searchMatches,
    getElementId: (id) => `user-${id}`,
    scrollContainer: () => scrollEl,
  });

  $effect(() => {
    const q = page.url.searchParams.get("q");
    if (q !== null && q !== "") {
      overlay.enter(q);
    }
  });

  $effect(() => {
    if (urlUser === null) return;
    usersSectionRef?.editUser(urlUser);
    const next = new URL(page.url);
    next.searchParams.delete("user");
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- shallow routing, same page
    replaceState(next.pathname + next.search, {});
  });

  // Navbar override: subnavbar always visible (tab switcher lives inside it).
  const navbarCtx = getNavbarOverrideCtx();

  $effect(() => {
    const rightSnippet =
      activeTab === "users" && canManageUsers
        ? navRight
        : activeTab === "queues" && canManageQueues
          ? navRightQueues
          : undefined;

    const subnavbarSnippet =
      activeTab === "users" && canManageUsers
        ? usersSubnavbar
        : activeTab === "clients" && canViewClients
          ? clientsSubnavbar
          : activeTab === "roles" && canManageRoles
            ? rolesSubnavbar
            : queuesSubnavbar;

    navbarCtx.current = {
      title: m.admin_people_title(),
      right: rightSnippet,
      subnavbar: subnavbarSnippet,
      subnavbarHidden: () => scrollDir.hidden && !overlay.active,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // ── SubNavbar configs ──

  const userDispatch = createFilterDispatch({
    fields: {
      role: {
        type: "multi-toggle",
        toggle: (v: string) => {
          if (isRoleId(v)) userFilterStore.toggleRole(v);
        },
      },
      status: {
        type: "multi-toggle",
        toggle: (v: string) => {
          if (isUserStatus(v)) userFilterStore.toggleStatus(v);
        },
      },
      keys: {
        type: "multi-toggle",
        toggle: (v: string) => {
          if (isKeyStatus(v)) userFilterStore.toggleKeyStatus(v);
        },
      },
      queue: {
        type: "multi-toggle",
        toggle: (v: string) => userFilterStore.toggleQueueId(v),
      },
    },
    sort: {
      validate: isSortField,
      set: (field: string, dir: "asc" | "desc") => {
        if (isSortField(field)) userFilterStore.setSort(field, dir);
      },
    },
    clearAll: () => userFilterStore.clearAll(),
  });

  const sortConfig: SortConfig = $derived({
    label: m.admin_users_sort(),
    options: [
      { field: "name", label: m.admin_users_sort_name() },
      { field: "role", label: m.admin_users_sort_role() },
      { field: "status", label: m.admin_users_sort_status() },
    ],
    currentField: userFilterStore.sort.field,
    currentDirection: userFilterStore.sort.direction,
    onchange: userDispatch.handleSortChange,
  });

  // ��─ Queue sort config ──

  const queueDispatch = createFilterDispatch({
    fields: {},
    sort: {
      validate: isQueueSortField,
      set: (field: string, dir: "asc" | "desc") => {
        if (isQueueSortField(field)) queueFilterStore.setSort(field, dir);
      },
    },
    clearAll: noop,
  });

  const queueSortConfig: SortConfig = $derived({
    label: m.admin_queues_sort(),
    options: [
      { field: "order", label: m.admin_queues_sort_order() },
      { field: "name", label: m.admin_queues_sort_name() },
      { field: "members", label: m.admin_queues_sort_members() },
      { field: "open", label: m.admin_queues_sort_open(withTerms()) },
      { field: "closed", label: m.admin_queues_sort_closed(withTerms()) },
      { field: "hold", label: m.admin_queues_sort_hold() },
    ],
    currentField: queueFilterStore.sort.field,
    currentDirection: queueFilterStore.sort.direction,
    onchange: queueDispatch.handleSortChange,
  });

  const queueSavedFiltersConfig: SavedFiltersConfig = {
    filters: [],
    count: 0,
    onapply: noop,
    ondelete: noop,
    ontoggleshare: noop,
  };

  const queueFilterPillsConfig: FilterPillsConfig = $derived({
    pills: [],
    activeCount: 0,
    ontoggle: noop,
    onselect: noop,
    ondatechange: noop,
    onclearall: noop,
  });

  // ── Clients sort + search + filter config ──

  const clientDispatch = createFilterDispatch({
    fields: {
      hasApplications: {
        type: "single-select",
        set: (v: string | null) => {
          if (v === "true") clientFilterStore.setHasApplications(true);
          else if (v === "false") clientFilterStore.setHasApplications(false);
          else clientFilterStore.setHasApplications(null);
        },
      },
      dateCreated: {
        type: "date-range",
        set: (from: Date | null, to: Date | null) => {
          clientFilterStore.setDateRange(from, to);
        },
      },
      includeMerged: {
        type: "single-select",
        set: (v: string | null) => {
          clientFilterStore.setIncludeMerged(v === "yes");
        },
      },
    },
    sort: {
      validate: isClientSortField,
      set: (field: string, dir: "asc" | "desc") => {
        if (isClientSortField(field)) clientFilterStore.setSort(field, dir);
      },
    },
    clearAll: () => clientFilterStore.clearAll(),
  });

  const clientSortConfig: SortConfig = $derived({
    label: m.clients_sort(withTerms()),
    options: [
      { field: "created_at", label: m.clients_sort_created() },
      { field: "ticket_count", label: m.clients_sort_tickets() },
    ],
    currentField: clientFilterStore.sort.field,
    currentDirection: clientFilterStore.sort.direction,
    onchange: clientDispatch.handleSortChange,
  });

  const clientSavedFiltersConfig: SavedFiltersConfig = {
    filters: [],
    count: 0,
    onapply: noop,
    ondelete: noop,
    ontoggleshare: noop,
  };

  // ── Client filter pill definitions ──

  const hasTicketsOptions = $derived([
    { value: "true", label: m.clients_filter_has_tickets_yes(withTerms()) },
    { value: "false", label: m.clients_filter_has_tickets_no(withTerms()) },
  ]);

  const includeMergedOptions = $derived([
    { value: "yes", label: m.clients_filter_include_merged_yes() },
  ]);

  const hasAppsSelected = $derived(
    clientFilterStore.hasApplications === true
      ? "true"
      : clientFilterStore.hasApplications === false
        ? "false"
        : null,
  );

  const clientPills: PillDefinition[] = $derived([
    {
      id: "hasApplications",
      label: m.clients_filter_has_tickets(withTerms()),
      mode: "single",
      options: hasTicketsOptions,
      selected: hasAppsSelected,
    },
    {
      id: "dateCreated",
      label: m.clients_filter_date_created(),
      mode: "date",
      options: [],
      selected: null,
    },
    {
      id: "includeMerged",
      label: m.clients_filter_include_merged(),
      mode: "single",
      options: includeMergedOptions,
      selected: clientFilterStore.includeMerged ? "yes" : null,
    },
  ]);

  const clientDateRangeActive = $derived(
    clientFilterStore.createdAfter !== null ||
      clientFilterStore.createdBefore !== null,
  );

  const clientDateFromStr = $derived(
    clientFilterStore.createdAfter !== null
      ? clientFilterStore.createdAfter.toISOString().slice(0, 10)
      : "",
  );

  const clientDateToStr = $derived(
    clientFilterStore.createdBefore !== null
      ? clientFilterStore.createdBefore.toISOString().slice(0, 10)
      : "",
  );

  const clientDateRangeLabel = $derived(
    buildDateRangeLabel(
      clientFilterStore.createdAfter,
      clientFilterStore.createdBefore,
      {
        from: m.tickets_filter_date_from(),
        to: m.tickets_filter_date_to(),
        range: m.clients_filter_date_created(),
      },
    ),
  );

  const clientFilterPillsConfig: FilterPillsConfig = $derived({
    pills: clientPills,
    activeCount: clientFilterStore.activeCount,
    dateFrom: clientDateFromStr,
    dateTo: clientDateToStr,
    dateActive: clientDateRangeActive,
    dateLabel: clientDateRangeLabel,
    ontoggle: clientDispatch.handlePillToggle,
    onselect: clientDispatch.handlePillSelect,
    ondatechange: clientDispatch.handlePillDateChange,
    onclearall: clientDispatch.clearAll,
  });

  const orgKeyManager = getOrgKeyManager();

  let clientSearchQuery = $state("");
  let clientSearchActive = $state(false);
  let clientSearchTimer: ReturnType<typeof setTimeout> | undefined;

  function handleClientSearch(query: string): void {
    clientSearchQuery = query;
    clearTimeout(clientSearchTimer);
    clientSearchTimer = setTimeout(() => {
      clientFilterStore.setSearch(query);
    }, 300);
  }

  function handleToggleReorderMode(): void {
    queuesSectionRef?.toggleReorderMode();
  }

  const savedFiltersConfig: SavedFiltersConfig = {
    filters: [],
    count: 0,
    onapply: noop,
    ondelete: noop,
    ontoggleshare: noop,
  };

  function noop(): void {
    // Intentionally empty: users page has no saved filters
  }

  // ── Filter pill definitions ──

  const roleOptions = $derived([
    { value: RoleId.VOLUNTEER, label: m.admin_role_volunteer(withTerms()) },
    { value: RoleId.MANAGER, label: m.admin_role_manager(withTerms()) },
    { value: RoleId.ADMIN, label: m.admin_role_admin() },
  ]);

  const statusOptions = $derived([
    { value: "active", label: m.admin_status_active() },
    { value: "inactive", label: m.admin_status_inactive() },
  ]);

  const keyStatusOptions = $derived([
    { value: "ok", label: m.admin_users_key_ok() },
    { value: "no_keys", label: m.admin_users_key_no_keys() },
    { value: "no_org_key", label: m.admin_users_key_no_org() },
  ]);

  const userPills: PillDefinition[] = $derived([
    {
      id: "role",
      label: m.admin_users_filter_role(),
      mode: "multi",
      options: roleOptions,
      selected: userFilterStore.roles as ReadonlySet<string>,
    },
    {
      id: "status",
      label: m.admin_users_filter_status(),
      mode: "multi",
      options: statusOptions,
      selected: userFilterStore.statuses as ReadonlySet<string>,
    },
    {
      id: "keys",
      label: m.admin_users_filter_keys(),
      mode: "multi",
      options: keyStatusOptions,
      selected: userFilterStore.keyStatuses as ReadonlySet<string>,
    },
    {
      id: "queue",
      label: m.admin_users_filter_queue(withTerms()),
      mode: "multi",
      options: queuePillOptions,
      selected: userFilterStore.queueIds as ReadonlySet<string>,
    },
  ]);

  const filterPillsConfig: FilterPillsConfig = $derived({
    pills: userPills,
    activeCount: userFilterStore.activeCount,
    ontoggle: userDispatch.handlePillToggle,
    onselect: noop,
    ondatechange: noop,
    onclearall: userDispatch.clearAll,
  });

  function handleToggleMultiSelect(): void {
    usersSectionRef?.toggleMultiSelect();
  }

  const inviteFlow = createInviteFlow({
    canInviteWithLink: () => canInviteWithLink,
    onInviteManual: () => {
      usersSectionRef?.openInvite();
    },
    onInviteLink: () => {
      usersSectionRef?.openInviteLink();
    },
  });

  function handleCreateQueue(): void {
    queuesSectionRef?.openEditor("new");
  }
</script>

<!-- Shared tab toggle used in both subnavbar variants -->
{#snippet tabSegmented()}
  {@const tabs = [
    ...(canManageUsers
      ? [{ id: "users", label: m.admin_tab_users(), icon: Users }]
      : []),
    ...(canManageQueues
      ? [
          {
            id: "queues",
            label: m.admin_tab_queues(withTerms()),
            icon: Layers,
          },
        ]
      : []),
    ...(canViewClients
      ? [
          {
            id: "clients",
            label: m.admin_clients_title(withTerms()),
            icon: HeartHandshake,
          },
        ]
      : []),
    ...(canManageRoles
      ? [
          {
            id: "roles",
            label: m.admin_tab_roles(),
            icon: ShieldCheck,
          },
        ]
      : []),
  ]}
  <IconTabToggle
    {tabs}
    active={activeTab}
    ariaLabel={m.admin_people_title()}
    semantics="tabs"
    onchange={(id: string) => {
      if (isPeopleTab(id)) switchTab(id);
    }}
  />
{/snippet}

{#snippet navRight()}
  <Link
    iconOnly
    onclick={(e: MouseEvent) => inviteFlow.handleInvite(e)}
    role="button"
    aria-label={m.admin_invite_button()}
  >
    <UserPlus size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet navRightQueues()}
  <Link
    iconOnly
    onclick={handleCreateQueue}
    role="button"
    aria-label={m.admin_queues_create_button(withTerms())}
  >
    <LayersPlus size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet usersStats()}
  <!-- Account states are words with bold counts (the tickets counts-line
       grammar); ticket status shapes never stand in for user states. -->
  <span class="stat-item">
    <b>{usersSectionRef?.activeCount() ?? 0}</b>
    {m.admin_users_stat_active()}
  </span>
  <span class="stat-item">
    <b>{usersSectionRef?.inactiveCount() ?? 0}</b>
    {m.admin_users_stat_inactive()}
  </span>
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
  />
{/snippet}

{#snippet usersSubnavbar()}
  <SubNavbarFilterLayout
    title={m.admin_users_title()}
    headerRight={tabSegmented}
    stats={usersStats}
    sort={sortConfig}
    selectLabel={m.admin_users_select_mode()}
    onselect={handleToggleMultiSelect}
    savedFilters={savedFiltersConfig}
    filterPills={filterPillsConfig}
    searchNavigator={overlay.active ? searchNavigatorRow : undefined}
    bulkActions={usersSectionRef?.bulkActionsSnippet()}
    onsearch={!overlay.active
      ? () => gestureMount(() => overlay.enter(""))
      : undefined}
    searchLabel={m.search_inline_trigger()}
  />
{/snippet}

{#snippet queuesStats()}
  <span class="stat-item">
    {m.admin_queues_stat_total(
      withTerms({
        count: Number(queuesSectionRef?.totalQueues() ?? 0),
      }),
    )}
  </span>
  <span class="stat-item">
    {m.admin_queues_stat_open({
      count: Number(queuesSectionRef?.totalOpenTickets() ?? 0),
    })}
  </span>
  <span class="stat-item">
    {m.admin_queues_stat_members({
      count: Number(queuesSectionRef?.totalMembers() ?? 0),
    })}
  </span>
{/snippet}

{#snippet queuesSubnavbar()}
  <SubNavbarFilterLayout
    title={m.admin_queues_title(withTerms())}
    headerRight={tabSegmented}
    stats={queuesStats}
    sort={queueSortConfig}
    selectLabel={m.admin_queues_select_mode()}
    onselect={handleToggleReorderMode}
    savedFilters={queueSavedFiltersConfig}
    filterPills={queueFilterPillsConfig}
  />
{/snippet}

{#snippet clientsSubnavbar()}
  <SubNavbarFilterLayout
    title={m.admin_clients_title(withTerms())}
    headerRight={tabSegmented}
    sort={clientSortConfig}
    selectLabel=""
    onselect={noop}
    savedFilters={clientSavedFiltersConfig}
    filterPills={clientFilterPillsConfig}
    searchNavigator={clientSearchActive ? clientSearchRow : undefined}
    onsearch={!clientSearchActive
      ? () => {
          clientSearchActive = true;
        }
      : undefined}
    searchLabel={m.clients_search_loaded_placeholder()}
  />
{/snippet}

{#snippet rolesSubnavbar()}
  <SubNavbarFilterLayout
    title={m.roles_title()}
    headerRight={tabSegmented}
    selectLabel=""
    onselect={noop}
    filterPills={{
      pills: [],
      activeCount: 0,
      ontoggle: noop,
      onselect: noop,
      ondatechange: noop,
      onclearall: noop,
    }}
  />
{/snippet}

{#snippet clientSearchRow()}
  <div class="client-search-row">
    <input
      type="search"
      class="client-search-input"
      placeholder={m.clients_search_loaded_placeholder()}
      value={clientSearchQuery}
      oninput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) {
          handleClientSearch(e.target.value);
        }
      }}
    />
    <button
      type="button"
      class="client-search-close"
      onclick={() => {
        clientSearchActive = false;
        handleClientSearch("");
      }}
      aria-label={m.shell_close()}
    >
      <span aria-hidden="true">&#x2715;</span>
    </button>
  </div>
{/snippet}

{#if activeTab === "users" && canManageUsers}
  <div role="tabpanel" id="panel-users" aria-labelledby="tab-users">
    <UsersSection
      bind:this={usersSectionRef}
      autoAction={urlAction}
      queueAssignments={queueAssignmentsQuery.data ?? []}
      searchQuery={overlay.term ?? ""}
      activeMatchId={overlay.activeId}
    />
  </div>
{:else if activeTab === "queues" && canManageQueues}
  <div role="tabpanel" id="panel-queues" aria-labelledby="tab-queues">
    <QueuesSection bind:this={queuesSectionRef} autoAction={urlAction} />
  </div>
{:else if activeTab === "clients" && canViewClients}
  <div role="tabpanel" id="panel-clients" aria-labelledby="tab-clients">
    <ClientsSection
      clients={allClients}
      isLoading={clientsQuery.isLoading}
      isError={clientsQuery.isError}
      error={clientsQuery.error}
      hasNextPage={clientsQuery.hasNextPage}
      isFetchingNextPage={clientsQuery.isFetchingNextPage}
      onfetchnext={() => void clientsQuery.fetchNextPage()}
      onretry={() => void clientsQuery.refetch()}
    />
  </div>
{:else if activeTab === "roles" && canManageRoles}
  <div role="tabpanel" id="panel-roles" aria-labelledby="tab-roles">
    <RolePermissionsSection />
  </div>
{/if}

<ShellPopover
  opened={inviteFlow.popoverOpen}
  target={inviteFlow.buttonEl}
  placement="bottom"
  ondismiss={() => inviteFlow.dismiss()}
>
  <List nested>
    <ListItem
      title={m.admin_invite_menu_link()}
      onclick={() => inviteFlow.handleOption("link")}
    >
      {#snippet media()}
        <Link2 size={20} aria-hidden="true" />
      {/snippet}
    </ListItem>
    <ListItem
      title={m.admin_invite_menu_manual()}
      onclick={() => inviteFlow.handleOption("manual")}
    >
      {#snippet media()}
        <UserPlus size={20} aria-hidden="true" />
      {/snippet}
    </ListItem>
  </List>
</ShellPopover>

<style>
  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-variant-numeric: tabular-nums;
  }

  .client-search-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 0 var(--space-md);
  }

  .client-search-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-size: var(--text-sm);
    border: 1px solid var(--hair);
    border-radius: 0.5rem;
    background: var(--paper);
    color: var(--ink);
    min-height: 44px;
  }

  .client-search-input::placeholder {
    color: var(--muted);
  }

  .client-search-close {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-size: 1.25rem;
  }
</style>

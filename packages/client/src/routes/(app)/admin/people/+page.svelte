<script lang="ts">
  import { Segmented, SegmentedButton, Link } from "konsta/svelte";
  import { page } from "$app/state";
  import { goto, replaceState } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createQuery } from "@tanstack/svelte-query";
  import { queueKeys, adminKeys } from "$lib/query/keys.js";
  import { Permission, RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import { Users, Layers, UserPlus, LayersPlus } from "@lucide/svelte";
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
  import {
    userFilterStore,
    type UserSortField,
    type UserStatus,
    type KeyStatus,
  } from "$lib/stores/user-filters.svelte.js";
  import {
    queueFilterStore,
    type QueueSortField,
  } from "$lib/stores/queue-filters.svelte.js";
  import { createSearchOverlay } from "$lib/search/search-overlay.svelte.js";
  import SearchNavigator from "$lib/components/search/SearchNavigator.svelte";
  import StatusDot from "$lib/components/StatusDot.svelte";
  import UsersSection from "$lib/components/admin/UsersSection.svelte";
  import QueuesSection from "$lib/components/admin/QueuesSection.svelte";

  type PeopleTab = "users" | "queues";

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const canManageUsers = $derived(permissions.has(Permission.MANAGE_USERS));
  const canManageQueues = $derived(permissions.has(Permission.MANAGE_QUEUES));
  const hasAccess = $derived(canManageUsers || canManageQueues);

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

  function isPeopleTab(value: string): value is PeopleTab {
    return value === "users" || value === "queues";
  }

  const urlTab = $derived.by(() => {
    const raw = page.url.searchParams.get("tab");
    return raw !== null && isPeopleTab(raw) ? raw : null;
  });

  const urlAction = $derived(page.url.searchParams.get("action"));
  const urlUser = $derived(page.url.searchParams.get("user"));

  function defaultTab(): PeopleTab {
    if (permissions.has(Permission.MANAGE_USERS)) return "users";
    return "queues";
  }

  let activeTab = $state<PeopleTab>(defaultTab());

  $effect(() => {
    if (urlUser !== null && activeTab !== "users") activeTab = "users";
    else if (urlTab !== null) activeTab = urlTab;
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

    navbarCtx.current = {
      title: m.admin_people_title(),
      right: rightSnippet,
      subnavbar:
        activeTab === "users" && canManageUsers
          ? usersSubnavbar
          : queuesSubnavbar,
      subnavbarHidden: () => scrollDir.hidden && !overlay.active,
    };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  // ── SubNavbar configs ──

  const SORT_FIELDS: readonly UserSortField[] = ["name", "role", "status"];

  function isSortField(value: string): value is UserSortField {
    return (SORT_FIELDS as readonly string[]).includes(value);
  }

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

  const QUEUE_SORT_FIELDS: readonly QueueSortField[] = [
    "order",
    "name",
    "members",
    "open",
    "closed",
    "hold",
  ];

  function isQueueSortField(value: string): value is QueueSortField {
    return (QUEUE_SORT_FIELDS as readonly string[]).includes(value);
  }

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

  const VALID_ROLES: ReadonlySet<string> = new Set([
    RoleId.VOLUNTEER,
    RoleId.MANAGER,
    RoleId.ADMIN,
  ]);
  const VALID_STATUSES: ReadonlySet<string> = new Set<UserStatus>([
    "active",
    "inactive",
  ]);
  const VALID_KEY_STATUSES: ReadonlySet<string> = new Set<KeyStatus>([
    "ok",
    "no_keys",
    "no_org_key",
  ]);

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

  function isRoleId(v: string): v is RoleIdValue {
    return VALID_ROLES.has(v);
  }

  function isUserStatus(v: string): v is UserStatus {
    return VALID_STATUSES.has(v);
  }

  function isKeyStatus(v: string): v is KeyStatus {
    return VALID_KEY_STATUSES.has(v);
  }

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

  function handleInvite(): void {
    usersSectionRef?.openInvite();
  }

  function handleCreateQueue(): void {
    queuesSectionRef?.openEditor("new");
  }
</script>

<!-- Shared tab segmented used in both subnavbar variants -->
{#snippet tabSegmented()}
  <div role="tablist" aria-label={m.admin_people_title()} class="tab-toggle">
    <Segmented strong>
      {#if canManageUsers}
        <SegmentedButton
          active={activeTab === "users"}
          onclick={() => switchTab("users")}
          aria-selected={activeTab === "users"}
          aria-controls="panel-users"
          aria-label={m.admin_tab_users()}
          id="tab-users"
        >
          <Users size={16} aria-hidden="true" />
        </SegmentedButton>
      {/if}
      {#if canManageQueues}
        <SegmentedButton
          active={activeTab === "queues"}
          onclick={() => switchTab("queues")}
          aria-selected={activeTab === "queues"}
          aria-controls="panel-queues"
          aria-label={m.admin_tab_queues(withTerms())}
          id="tab-queues"
        >
          <Layers size={16} aria-hidden="true" />
        </SegmentedButton>
      {/if}
    </Segmented>
  </div>
{/snippet}

{#snippet navRight()}
  <Link
    iconOnly
    onclick={handleInvite}
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
  <span class="stat-item">
    <StatusDot status="active" />
    {usersSectionRef?.activeCount() ?? 0}
    {m.admin_users_stat_active()}
  </span>
  <span class="stat-item">
    <StatusDot status="closed" />
    {usersSectionRef?.inactiveCount() ?? 0}
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
    onsearch={!overlay.active ? () => overlay.enter("") : undefined}
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
    <StatusDot status="active" />
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
{/if}

<style>
  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .tab-toggle {
    flex-shrink: 0;
  }

  .tab-toggle :global(.k-segmented) {
    height: 1.75rem;
  }

  .tab-toggle :global(.k-segmented-button) {
    font-size: var(--text-sm);
    min-height: unset;
  }
</style>

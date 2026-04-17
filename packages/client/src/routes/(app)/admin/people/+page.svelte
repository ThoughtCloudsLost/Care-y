<script lang="ts">
  import { BlockTitle, Segmented, SegmentedButton, Link } from "konsta/svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Permission, RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import { UserPlus } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import {
    getNavbarOverrideCtx,
    getScrollContainer,
  } from "$lib/shell/context.js";
  import { useScrollDirection } from "$lib/shell/use-scroll-direction.svelte.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
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

  function isPeopleTab(value: string): value is PeopleTab {
    return value === "users" || value === "queues";
  }

  const urlTab = $derived.by(() => {
    const raw = page.url.searchParams.get("tab");
    return raw !== null && isPeopleTab(raw) ? raw : null;
  });

  const urlAction = $derived(page.url.searchParams.get("action"));

  function defaultTab(): PeopleTab {
    if (permissions.has(Permission.MANAGE_USERS)) return "users";
    return "queues";
  }

  let activeTab = $state<PeopleTab>(urlTab ?? defaultTab());

  $effect(() => {
    if (urlTab !== null) activeTab = urlTab;
  });

  // Scroll direction for subnavbar collapse.
  const getScroll = getScrollContainer();
  const scrollEl = $derived(getScroll());
  const scrollDir = useScrollDirection({
    get scrollEl() {
      return scrollEl;
    },
  });

  // UsersSection ref for exported state.
  let usersSectionRef = $state<ReturnType<typeof UsersSection> | null>(null);

  // Navbar override: subnavbar always visible (tab switcher lives inside it).
  const navbarCtx = getNavbarOverrideCtx();

  $effect(() => {
    navbarCtx.current = {
      title: m.admin_people_title(),
      right: activeTab === "users" && canManageUsers ? navRight : undefined,
      subnavbar:
        activeTab === "users" && canManageUsers
          ? usersSubnavbar
          : queuesSubnavbar,
      subnavbarHidden: () => scrollDir.hidden,
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

  function handleSortChange(field: string, dir: "asc" | "desc"): void {
    if (isSortField(field)) userFilterStore.setSort(field, dir);
  }

  const sortConfig: SortConfig = $derived({
    label: m.admin_users_sort(),
    options: [
      { field: "name", label: m.admin_users_sort_name() },
      { field: "role", label: m.admin_users_sort_role() },
      { field: "status", label: m.admin_users_sort_status() },
    ],
    currentField: userFilterStore.sort.field,
    currentDirection: userFilterStore.sort.direction,
    onchange: handleSortChange,
  });

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
    { value: RoleId.VOLUNTEER, label: m.admin_role_volunteer() },
    { value: RoleId.MANAGER, label: m.admin_role_manager() },
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

  function handlePillToggle(pillId: string, value: string): void {
    switch (pillId) {
      case "role":
        if (isRoleId(value)) userFilterStore.toggleRole(value);
        break;
      case "status":
        if (isUserStatus(value)) userFilterStore.toggleStatus(value);
        break;
      case "keys":
        if (isKeyStatus(value)) userFilterStore.toggleKeyStatus(value);
        break;
    }
  }

  const filterPillsConfig: FilterPillsConfig = $derived({
    pills: userPills,
    activeCount: userFilterStore.activeCount,
    ontoggle: handlePillToggle,
    onselect: noop,
    ondatechange: noop,
    onclearall: () => userFilterStore.clearAll(),
  });

  function handleToggleMultiSelect(): void {
    usersSectionRef?.toggleMultiSelect();
  }

  function handleInvite(): void {
    usersSectionRef?.openInvite();
  }
</script>

<!-- Shared tab segmented used in both subnavbar variants -->
{#snippet tabSegmented()}
  <div role="tablist" aria-label={m.admin_people_title()} class="tab-toggle">
    <Segmented strong>
      {#if canManageUsers}
        <SegmentedButton
          active={activeTab === "users"}
          onclick={() => (activeTab = "users")}
          aria-selected={activeTab === "users"}
          aria-controls="panel-users"
          id="tab-users"
        >
          {m.admin_tab_users()}
        </SegmentedButton>
      {/if}
      {#if canManageQueues}
        <SegmentedButton
          active={activeTab === "queues"}
          onclick={() => (activeTab = "queues")}
          aria-selected={activeTab === "queues"}
          aria-controls="panel-queues"
          id="tab-queues"
        >
          {m.admin_tab_queues()}
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
  />
{/snippet}

{#snippet queuesSubnavbar()}
  <div class="subnavbar-filter-content">
    <div class="page-header">
      <BlockTitle large class="page-title">{m.admin_tab_queues()}</BlockTitle>
      {@render tabSegmented()}
    </div>
  </div>
{/snippet}

{#if activeTab === "users" && canManageUsers}
  <div role="tabpanel" id="panel-users" aria-labelledby="tab-users">
    <UsersSection bind:this={usersSectionRef} autoAction={urlAction} />
  </div>
{:else if activeTab === "queues" && canManageQueues}
  <div role="tabpanel" id="panel-queues" aria-labelledby="tab-queues">
    <QueuesSection autoAction={urlAction} />
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

  /* Mirror SubNavbarFilterLayout's page-header for the queues variant */
  .subnavbar-filter-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
  }

  :global(.page-title) {
    margin: 0 !important;
    padding-left: 0 !important;
  }
</style>

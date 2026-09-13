<script lang="ts">
  import { Block, BlockTitle, Toggle, DialogButton } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Lock } from "@lucide/svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { Permission, ROLE_ID_VALUES } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys, authKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import Register from "$lib/components/Register.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";

  // ── Permission grouping ──

  /** Volunteer-level permissions (all roles have these by default). */
  const VOLUNTEER_PERMISSIONS: readonly Permission[] = [
    Permission.VIEW_TICKETS,
    Permission.MANAGE_OWN_TICKETS,
    Permission.VIEW_KNOWLEDGE_BASE,
    Permission.EDIT_KNOWLEDGE_BASE,
    Permission.VIEW_OWN_SHIFTS,
  ];

  /** Manager-level permissions (managers and admins by default). */
  const MANAGER_PERMISSIONS: readonly Permission[] = [
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_USERS,
    Permission.MANAGE_QUEUES,
    Permission.MANAGE_PRESETS,
    Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
    Permission.VIEW_REPORTS,
    Permission.DELETE_CLIENTS,
    Permission.VIEW_CLIENTS,
  ];

  /** Admin-level permissions (admins only by default). */
  const ADMIN_PERMISSIONS: readonly Permission[] = [
    Permission.MANAGE_ROLES,
    Permission.MANAGE_ORG_CONFIG,
    Permission.MANAGE_KEYS,
    Permission.MANAGE_INFRASTRUCTURE,
  ];

  /** High-trust permissions (opt-in, cross-queue decrypt capability). */
  const HIGH_TRUST_PERMISSIONS: readonly Permission[] = [
    Permission.VIEW_INTAKE_RESPONSES,
  ];

  /** Locked permissions cannot be reassigned from Admin. */
  const LOCKED_PERMISSIONS: ReadonlySet<Permission> = new Set([
    Permission.MANAGE_KEYS,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_INFRASTRUCTURE,
  ]);

  // ── i18n label maps ──

  // Role labels keyed by position in ROLE_ID_VALUES (Volunteer=0, Manager=1, Admin=2).
  // Uses index mapping to avoid dot-access on RoleId constants in client code.
  const ROLE_LABEL_FNS: readonly (() => string)[] = [
    () => m.admin_role_volunteer(withTerms()),
    () => m.admin_role_manager(withTerms()),
    () => m.admin_role_admin(),
  ];

  const ROLE_LABELS: ReadonlyMap<RoleIdValue, () => string> = new Map(
    ROLE_ID_VALUES.map((id, i) => {
      const fn = ROLE_LABEL_FNS.at(i);
      return [id, fn ?? (() => id)] as const;
    }),
  );

  const PERMISSION_LABELS = new Map<Permission, () => string>([
    [Permission.VIEW_TICKETS, () => m.permission_view_tickets()],
    [Permission.MANAGE_OWN_TICKETS, () => m.permission_manage_own_tickets()],
    [Permission.VIEW_KNOWLEDGE_BASE, () => m.permission_view_knowledge_base()],
    [Permission.EDIT_KNOWLEDGE_BASE, () => m.permission_edit_knowledge_base()],
    [Permission.VIEW_OWN_SHIFTS, () => m.permission_view_own_shifts()],
    [Permission.MODERATE_CONTENT, () => m.permission_moderate_content()],
    [Permission.MANAGE_USERS, () => m.permission_manage_users()],
    [Permission.MANAGE_QUEUES, () => m.permission_manage_queues()],
    [Permission.MANAGE_PRESETS, () => m.permission_manage_presets()],
    [
      Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
      () => m.permission_manage_knowledge_base_categories(),
    ],
    [Permission.VIEW_REPORTS, () => m.permission_view_reports()],
    [Permission.DELETE_CLIENTS, () => m.permission_delete_clients()],
    [Permission.VIEW_CLIENTS, () => m.permission_view_clients()],
    [Permission.MANAGE_ROLES, () => m.permission_manage_roles()],
    [Permission.MANAGE_ORG_CONFIG, () => m.permission_manage_org_config()],
    [Permission.MANAGE_KEYS, () => m.permission_manage_keys()],
    [
      Permission.MANAGE_INFRASTRUCTURE,
      () => m.permission_manage_infrastructure(),
    ],
    [
      Permission.VIEW_INTAKE_RESPONSES,
      () => m.permission_view_intake_responses(),
    ],
  ]);

  function permissionLabel(perm: Permission): string {
    return PERMISSION_LABELS.get(perm)?.() ?? perm;
  }

  interface PermissionGroup {
    readonly key: string;
    readonly title: () => string;
    readonly permissions: readonly Permission[];
  }

  const PERMISSION_GROUPS: readonly PermissionGroup[] = [
    {
      key: "volunteer",
      title: () => m.roles_group_volunteer(),
      permissions: VOLUNTEER_PERMISSIONS,
    },
    {
      key: "manager",
      title: () => m.roles_group_manager(),
      permissions: MANAGER_PERMISSIONS,
    },
    {
      key: "admin",
      title: () => m.roles_group_admin(),
      permissions: ADMIN_PERMISSIONS,
    },
    {
      key: "high_trust",
      title: () => m.roles_group_high_trust(),
      permissions: HIGH_TRUST_PERMISSIONS,
    },
  ];

  function roleLabel(roleId: RoleIdValue): string {
    return ROLE_LABELS.get(roleId)?.() ?? roleId;
  }

  // ── Query ──

  const queryClient = useQueryClient();

  const permissionsQuery = createQuery(() => ({
    queryKey: adminKeys.rolePermissions(),
    queryFn: async () => trpc.auth.getRolePermissions.query(),
  }));

  // Build lookup sets from the query data for fast cell evaluation.
  const rolePermMap = $derived.by(() => {
    const result = new SvelteMap<string, ReadonlySet<Permission>>();
    const data = permissionsQuery.data;
    if (data === undefined) return result;
    for (const role of data.roles) {
      result.set(role.roleId, new Set(role.permissions));
    }
    return result;
  });

  const overriddenMap = $derived.by(() => {
    const result = new SvelteMap<string, ReadonlySet<Permission>>();
    const data = permissionsQuery.data;
    if (data === undefined) return result;
    for (const role of data.roles) {
      result.set(role.roleId, new Set(role.overridden));
    }
    return result;
  });

  function hasPermission(roleId: string, perm: Permission): boolean {
    return rolePermMap.get(roleId)?.has(perm) ?? false;
  }

  function isOverridden(roleId: string, perm: Permission): boolean {
    return overriddenMap.get(roleId)?.has(perm) ?? false;
  }

  function isLocked(perm: Permission): boolean {
    return LOCKED_PERMISSIONS.has(perm);
  }

  // ── Mutations ──

  const setPermissionMutation = createMutation(() => ({
    mutationFn: async (input: {
      roleId: RoleIdValue;
      permission: Permission;
      enabled: boolean;
    }) => trpc.auth.setRolePermission.mutate(input),
    onSuccess: () => {
      haptic();
      const msg = m.roles_perm_saved();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      void queryClient.invalidateQueries({
        queryKey: adminKeys.rolePermissions(),
      });
      void queryClient.invalidateQueries({
        queryKey: authKeys.me(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const resetPermissionsMutation = createMutation(() => ({
    mutationFn: async () => trpc.auth.resetRolePermissions.mutate(),
    onSuccess: () => {
      haptic();
      const msg = m.roles_perm_reset_success();
      toastStore.show(msg);
      announceToLiveRegion("assertive", msg);
      void queryClient.invalidateQueries({
        queryKey: adminKeys.rolePermissions(),
      });
      void queryClient.invalidateQueries({
        queryKey: authKeys.me(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  // ── Toggle handler ──

  function handleToggle(
    roleId: RoleIdValue,
    perm: Permission,
    currentValue: boolean,
  ): void {
    setPermissionMutation.mutate({
      roleId,
      permission: perm,
      enabled: !currentValue,
    });
  }

  // ── Reset dialog ──

  let resetDialogOpen = $state(false);

  function openResetDialog(): void {
    resetDialogOpen = true;
  }

  function confirmReset(): void {
    resetDialogOpen = false;
    resetPermissionsMutation.mutate();
  }

  // ── ARIA helpers ──

  function cellAriaLabel(perm: Permission, roleId: RoleIdValue): string {
    const pLabel = permissionLabel(perm);
    const rLabel = roleLabel(roleId);
    if (isLocked(perm)) {
      return m.roles_locked_toggle_aria({ permission: pLabel, role: rLabel });
    }
    return m.roles_toggle_aria({ permission: pLabel, role: rLabel });
  }

  const isLoading = $derived(permissionsQuery.isLoading);
  const isMutating = $derived(setPermissionMutation.isPending);
</script>

{#snippet permissionGroup(group: PermissionGroup)}
  <BlockTitle>{group.title()}</BlockTitle>
  <Block strong inset>
    <div class="matrix">
      <div class="matrix-header">
        {#each ROLE_ID_VALUES as colRole (colRole)}
          <span class="role-label">{roleLabel(colRole)}</span>
        {/each}
      </div>
      {#each group.permissions as perm (perm)}
        {@const locked = isLocked(perm)}
        {@const pLabel = permissionLabel(perm)}
        <div class="matrix-row">
          <span class="perm-label" title={pLabel}>
            {#if locked}
              <Lock size={12} aria-hidden="true" class="lock-glyph" />
            {/if}
            <span class="perm-label-text">{pLabel}</span>
          </span>
          {#each ROLE_ID_VALUES as colRole (colRole)}
            {@const checked = hasPermission(colRole, perm)}
            {@const overridden = isOverridden(colRole, perm)}
            {@const cellDisabled = locked || isMutating || isLoading}
            <span class="toggle-cell">
              <Toggle
                {checked}
                disabled={cellDisabled}
                onchange={() => {
                  if (!locked) handleToggle(colRole, perm, checked);
                }}
                aria-label={cellAriaLabel(perm, colRole)}
              />
              {#if overridden && !locked}
                <span class="override-marker">{m.roles_override_edited()}</span>
              {/if}
            </span>
          {/each}
        </div>
      {/each}
    </div>
  </Block>
{/snippet}

{#if isLoading}
  <BlockTitle>{m.roles_group_volunteer()}</BlockTitle>
  <Block strong inset>
    <div class="matrix">
      <div class="matrix-header">
        {#each ROLE_ID_VALUES as colRole (colRole)}
          <span class="role-label">{roleLabel(colRole)}</span>
        {/each}
      </div>
      {#each VOLUNTEER_PERMISSIONS as perm (perm)}
        <div class="matrix-row">
          <span class="perm-label">
            <InlineSkeleton width="80%" />
          </span>
          {#each ROLE_ID_VALUES as colRole (colRole)}
            <span class="toggle-cell">
              <Toggle disabled aria-label={cellAriaLabel(perm, colRole)} />
            </span>
          {/each}
        </div>
      {/each}
    </div>
  </Block>
{:else if permissionsQuery.isError}
  <QueryError
    error={permissionsQuery.error}
    onretry={() => void permissionsQuery.refetch()}
  />
{:else}
  {#each PERMISSION_GROUPS as group (group.key)}
    {@render permissionGroup(group)}
  {/each}

  <div class="protected-register-wrapper">
    <Register kind="careful">
      {m.permission_view_intake_responses_hint()}
    </Register>
  </div>

  <div class="protected-register-wrapper">
    <Register kind="protected">
      {m.roles_locked_explainer()}
    </Register>
  </div>

  <div class="reset-row">
    <button
      type="button"
      class="touch-feedback reset-btn"
      onclick={openResetDialog}
    >
      {m.roles_reset_defaults()}
    </button>
  </div>
{/if}

<ShellDialog
  opened={resetDialogOpen}
  ondismiss={() => (resetDialogOpen = false)}
  title={m.roles_reset_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">{m.roles_reset_confirm()}</p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (resetDialogOpen = false)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmReset}
    >
      {m.roles_reset_action()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .matrix {
    display: grid;
    grid-template-columns: 1fr repeat(3, 52px);
    gap: 0;
    align-items: center;
  }

  .matrix-header {
    display: contents;
  }

  .matrix-header::before {
    content: "";
  }

  .role-label {
    font-size: 0.75rem;
    color: var(--muted);
    text-align: center;
    padding-bottom: var(--space-sm);
    font-weight: 500;
  }

  .matrix-row {
    display: contents;
  }

  .perm-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.875rem;
    color: var(--ink);
    padding: var(--space-sm) 0;
    overflow: hidden;
    min-width: 0;
    border-top: 1px solid var(--hair);
  }

  .perm-label-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .perm-label :global(.lock-glyph) {
    flex-shrink: 0;
    color: var(--muted);
  }

  .toggle-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm) 0;
    border-top: 1px solid var(--hair);
    min-height: 44px;
  }

  .override-marker {
    font-size: 0.625rem;
    color: var(--muted);
    margin-top: 2px;
  }

  .protected-register-wrapper {
    padding: var(--space-md) var(--space-md) 0;
  }

  .reset-row {
    padding: var(--space-md);
  }

  .reset-btn {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 0.875rem;
    color: var(--danger);
    padding: var(--space-md) 0;
    background: none;
    border: none;
    cursor: pointer;
  }
</style>

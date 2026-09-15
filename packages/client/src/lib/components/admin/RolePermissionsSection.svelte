<script lang="ts">
  import { Block, BlockTitle, Toggle, DialogButton } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
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
  import ToggleMatrix from "$lib/components/ToggleMatrix.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";

  // ── Permission grouping (by capability area) ──

  const CASE_RECORD_PERMISSIONS: readonly Permission[] = [
    Permission.VIEW_CASES,
    Permission.OPEN_CASES,
    Permission.EDIT_CASE_SUMMARY,
    Permission.WRITE_CASE_NOTES,
    Permission.CHANGE_CASE_STATUS,
    Permission.LINK_CASES,
    Permission.CLAIM_CASES,
    Permission.ASSIGN_CASES,
    Permission.DELETE_OTHERS_NOTES,
    Permission.DOWNLOAD_CASE_MEDIA,
  ];

  const REACHING_CLIENT_PERMISSIONS: readonly Permission[] = [
    Permission.SEND_CLIENT_SMS,
    Permission.SEND_CLIENT_MEDIA,
    Permission.SEND_CLIENT_EMAIL,
    Permission.CALL_CLIENTS,
    Permission.MESSAGE_CLIENTS_IN_PORTAL,
  ];

  const CLIENT_ACCESS_PERMISSIONS: readonly Permission[] = [
    Permission.MANAGE_SHARE_LINKS,
    Permission.MANAGE_PORTAL_CHANNEL,
    Permission.RESET_CLIENT_LOGIN,
    Permission.REVOKE_REPLY_LINKS,
  ];

  const CLIENT_RECORDS_PERMISSIONS: readonly Permission[] = [
    Permission.VIEW_CLIENTS,
    Permission.VIEW_CLIENT_PII,
    Permission.EDIT_CLIENT_CONTACT,
    Permission.EDIT_CLIENT_ALIAS,
    Permission.MERGE_CLIENTS,
    Permission.DELETE_CLIENTS,
  ];

  const KNOWLEDGE_BASE_PERMISSIONS: readonly Permission[] = [
    Permission.VIEW_KNOWLEDGE_BASE,
    Permission.EDIT_KNOWLEDGE_BASE,
    Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
    Permission.DELETE_KNOWLEDGE_BASE_ARTICLES,
  ];

  const QUEUE_PERMISSIONS: readonly Permission[] = [
    Permission.MANAGE_QUEUES,
    Permission.MANAGE_QUEUE_MEMBERSHIP,
    Permission.MANAGE_QUEUE_NOTIFICATIONS,
  ];

  const INTAKE_PERMISSIONS: readonly Permission[] = [
    Permission.MANAGE_INTAKE_FORMS,
    Permission.VIEW_INTAKE_RESPONSES,
  ];

  const RUNNING_ORG_PERMISSIONS: readonly Permission[] = [
    Permission.MANAGE_ROLES,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ORG_IDENTITY,
    Permission.MANAGE_CHANNEL_ROUTING,
    Permission.MANAGE_RETENTION,
    Permission.MANAGE_NOTE_TYPES,
    Permission.MANAGE_KEYS,
    Permission.MANAGE_INFRASTRUCTURE,
    Permission.WRITE_CALL_GREETINGS,
    Permission.WRITE_AUTOMATIC_REPLIES,
    Permission.MANAGE_VOICEMAIL_QUARANTINE,
    Permission.MANAGE_ESCALATION,
    Permission.MANAGE_PRESETS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_AUDIT_LOG,
    Permission.VIEW_OWN_SHIFTS,
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
    // The case record
    [Permission.VIEW_CASES, () => m.permission_view_cases()],
    [Permission.OPEN_CASES, () => m.permission_open_cases()],
    [Permission.EDIT_CASE_SUMMARY, () => m.permission_edit_case_summary()],
    [Permission.WRITE_CASE_NOTES, () => m.permission_write_case_notes()],
    [Permission.CHANGE_CASE_STATUS, () => m.permission_change_case_status()],
    [Permission.LINK_CASES, () => m.permission_link_cases()],
    [Permission.CLAIM_CASES, () => m.permission_claim_cases()],
    [Permission.ASSIGN_CASES, () => m.permission_assign_cases()],
    [Permission.DELETE_OTHERS_NOTES, () => m.permission_delete_others_notes()],
    [Permission.DOWNLOAD_CASE_MEDIA, () => m.permission_download_case_media()],
    // Reaching a client
    [Permission.SEND_CLIENT_SMS, () => m.permission_send_client_sms()],
    [Permission.SEND_CLIENT_MEDIA, () => m.permission_send_client_media()],
    [Permission.SEND_CLIENT_EMAIL, () => m.permission_send_client_email()],
    [Permission.CALL_CLIENTS, () => m.permission_call_clients()],
    [
      Permission.MESSAGE_CLIENTS_IN_PORTAL,
      () => m.permission_message_clients_in_portal(),
    ],
    // The client's access to the case
    [Permission.MANAGE_SHARE_LINKS, () => m.permission_manage_share_links()],
    [
      Permission.MANAGE_PORTAL_CHANNEL,
      () => m.permission_manage_portal_channel(),
    ],
    [Permission.RESET_CLIENT_LOGIN, () => m.permission_reset_client_login()],
    [Permission.REVOKE_REPLY_LINKS, () => m.permission_revoke_reply_links()],
    // Client records
    [Permission.VIEW_CLIENTS, () => m.permission_view_clients()],
    [Permission.VIEW_CLIENT_PII, () => m.permission_view_client_pii()],
    [Permission.EDIT_CLIENT_CONTACT, () => m.permission_edit_client_contact()],
    [Permission.EDIT_CLIENT_ALIAS, () => m.permission_edit_client_alias()],
    [Permission.MERGE_CLIENTS, () => m.permission_merge_clients()],
    [Permission.DELETE_CLIENTS, () => m.permission_delete_clients()],
    // Knowledge base
    [Permission.VIEW_KNOWLEDGE_BASE, () => m.permission_view_knowledge_base()],
    [Permission.EDIT_KNOWLEDGE_BASE, () => m.permission_edit_knowledge_base()],
    [
      Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
      () => m.permission_manage_knowledge_base_categories(),
    ],
    [
      Permission.DELETE_KNOWLEDGE_BASE_ARTICLES,
      () => m.permission_delete_knowledge_base_articles(),
    ],
    // Queues
    [Permission.MANAGE_QUEUES, () => m.permission_manage_queues()],
    [
      Permission.MANAGE_QUEUE_MEMBERSHIP,
      () => m.permission_manage_queue_membership(),
    ],
    [
      Permission.MANAGE_QUEUE_NOTIFICATIONS,
      () => m.permission_manage_queue_notifications(),
    ],
    // Intake
    [Permission.MANAGE_INTAKE_FORMS, () => m.permission_manage_intake_forms()],
    [
      Permission.VIEW_INTAKE_RESPONSES,
      () => m.permission_view_intake_responses(),
    ],
    // Running the organisation
    [Permission.MANAGE_ROLES, () => m.permission_manage_roles()],
    [Permission.MANAGE_USERS, () => m.permission_manage_users()],
    [Permission.MANAGE_ORG_IDENTITY, () => m.permission_manage_org_identity()],
    [
      Permission.MANAGE_CHANNEL_ROUTING,
      () => m.permission_manage_channel_routing(),
    ],
    [Permission.MANAGE_RETENTION, () => m.permission_manage_retention()],
    [Permission.MANAGE_NOTE_TYPES, () => m.permission_manage_note_types()],
    [Permission.MANAGE_KEYS, () => m.permission_manage_keys()],
    [
      Permission.MANAGE_INFRASTRUCTURE,
      () => m.permission_manage_infrastructure(),
    ],
    [
      Permission.WRITE_CALL_GREETINGS,
      () => m.permission_write_call_greetings(),
    ],
    [
      Permission.WRITE_AUTOMATIC_REPLIES,
      () => m.permission_write_automatic_replies(),
    ],
    [
      Permission.MANAGE_VOICEMAIL_QUARANTINE,
      () => m.permission_manage_voicemail_quarantine(),
    ],
    [Permission.MANAGE_ESCALATION, () => m.permission_manage_escalation()],
    [Permission.MANAGE_PRESETS, () => m.permission_manage_presets()],
    [Permission.VIEW_REPORTS, () => m.permission_view_reports()],
    [Permission.VIEW_AUDIT_LOG, () => m.permission_view_audit_log()],
    [Permission.VIEW_OWN_SHIFTS, () => m.permission_view_own_shifts()],
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
      key: "case_record",
      title: () => m.roles_group_case_record(),
      permissions: CASE_RECORD_PERMISSIONS,
    },
    {
      key: "reaching_client",
      title: () => m.roles_group_reaching_client(),
      permissions: REACHING_CLIENT_PERMISSIONS,
    },
    {
      key: "client_access",
      title: () => m.roles_group_client_access(),
      permissions: CLIENT_ACCESS_PERMISSIONS,
    },
    {
      key: "client_records",
      title: () => m.roles_group_client_records(),
      permissions: CLIENT_RECORDS_PERMISSIONS,
    },
    {
      key: "knowledge_base",
      title: () => m.roles_group_knowledge_base(),
      permissions: KNOWLEDGE_BASE_PERMISSIONS,
    },
    {
      key: "queues",
      title: () => m.roles_group_queues(),
      permissions: QUEUE_PERMISSIONS,
    },
    {
      key: "intake",
      title: () => m.roles_group_intake(),
      permissions: INTAKE_PERMISSIONS,
    },
    {
      key: "running_org",
      title: () => m.roles_group_running_org(),
      permissions: RUNNING_ORG_PERMISSIONS,
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

  // ── ToggleMatrix column/row mapping ──

  const roleColumns = $derived(
    ROLE_ID_VALUES.map((id) => ({ id, label: roleLabel(id) })),
  );

  function buildGroupRows(group: PermissionGroup): readonly {
    id: string;
    label: string;
    locked?: boolean;
    cells: readonly {
      columnId: string;
      checked: boolean;
      overridden?: boolean;
      disabled?: boolean;
      ariaLabel?: string;
    }[];
  }[] {
    return group.permissions.map((perm) => {
      const locked = isLocked(perm);
      return {
        id: perm,
        label: permissionLabel(perm),
        locked,
        cells: ROLE_ID_VALUES.map((colRole) => ({
          columnId: colRole,
          checked: hasPermission(colRole, perm),
          overridden: isOverridden(colRole, perm) && !locked,
          disabled: locked || isMutating || isLoading,
          ariaLabel: cellAriaLabel(perm, colRole),
        })),
      };
    });
  }

  function isPermissionValue(value: string): value is Permission {
    const values: readonly string[] = Object.values(Permission);
    return values.includes(value);
  }

  function handleMatrixToggle(
    rowId: string,
    columnId: string,
    next: boolean,
  ): void {
    if (!isPermissionValue(rowId)) return;
    const colRole = ROLE_ID_VALUES.find((r) => r === columnId);
    if (colRole === undefined) return;
    if (isLocked(rowId)) return;
    handleToggle(colRole, rowId, !next);
  }
</script>

{#if isLoading}
  <BlockTitle>{m.roles_group_case_record()}</BlockTitle>
  <Block strong inset>
    <div class="matrix">
      <div class="matrix-header">
        {#each ROLE_ID_VALUES as colRole (colRole)}
          <span class="role-label">{roleLabel(colRole)}</span>
        {/each}
      </div>
      {#each CASE_RECORD_PERMISSIONS as perm (perm)}
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
    <BlockTitle>{group.title()}</BlockTitle>
    <Block strong inset>
      <ToggleMatrix
        columns={roleColumns}
        rows={buildGroupRows(group)}
        onToggle={handleMatrixToggle}
        ariaLabel={group.title()}
        overrideText={m.roles_override_edited()}
      />
    </Block>
  {/each}

  <div class="protected-register-wrapper">
    <Register kind="careful">
      {m.permission_manage_queue_membership_hint()}
    </Register>
  </div>

  <div class="protected-register-wrapper">
    <Register kind="careful">
      {m.permission_view_intake_responses_hint()}
    </Register>
  </div>

  <div class="protected-register-wrapper">
    <Register kind="careful">
      {m.permission_not_yet_built_hint()}
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
  /* Loading skeleton grid (the live grid uses ToggleMatrix). */
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

  .toggle-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm) 0;
    border-top: 1px solid var(--hair);
    min-height: 44px;
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

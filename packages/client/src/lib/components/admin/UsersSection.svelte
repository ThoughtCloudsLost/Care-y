<script lang="ts">
  import {
    Block,
    DialogButton,
    Link,
    List,
    ListInput,
    ListItem,
    Segmented,
    SegmentedButton,
    Toggle,
  } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { SvelteSet } from "svelte/reactivity";
  import { RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import { UserMinus, X, Save } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys, queueKeys } from "$lib/query/keys.js";
  import {
    getOrgDecryptCache,
    getOrgKeyManager,
    getCurrentUserId,
  } from "$lib/crypto/context.js";
  import { ErrorCode, identifierSchema } from "@care-y/shared";
  import {
    base64ToUint8Array,
    uint8ArrayToBase64,
  } from "$lib/utils/buffer-encoding.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { normalizeForSearch } from "$lib/search/normalize.js";
  import {
    userFilterStore,
    type KeyStatus,
  } from "$lib/stores/user-filters.svelte.js";
  import { getTabbarOverrideCtx } from "$lib/shell/context.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import InviteUser from "./InviteUser.svelte";
  import UserCard from "./UserCard.svelte";

  interface QueueAssignment {
    readonly queueId: string;
    readonly userId: string;
  }

  interface UsersSectionProps {
    readonly autoAction?: string | null;
    readonly queueAssignments?: readonly QueueAssignment[];
    readonly searchQuery?: string;
    readonly activeMatchId?: string | null;
  }

  let {
    autoAction = null,
    queueAssignments = [],
    searchQuery = "",
    activeMatchId = null,
  }: UsersSectionProps = $props();

  const authRouter = trpc.auth;
  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const profileRouter = trpc.profile;
  const queryClient = useQueryClient();

  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const textEncoder = new TextEncoder();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());

  const usersQuery = createQuery(() => ({
    queryKey: adminKeys.users(),
    queryFn: async () => authRouter.listUsers.query(),
  }));

  const queuesQuery = createQuery(() => ({
    queryKey: queueKeys.all,
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  const assignRoleMutation = createMutation(() => ({
    mutationFn: async (input: { userId: string; roleId: RoleIdValue }) =>
      authRouter.assignRole.mutate(input),
    onSuccess: () => {
      haptic();
      void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toastStore.show(m.admin_role_changed());
      announceToLiveRegion("polite", m.admin_role_changed());
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const adminDisplayNameMutation = createMutation(() => ({
    mutationFn: async (input: {
      userId: string;
      encryptedDisplayName: string;
    }) => profileRouter.adminUpdateDisplayName.mutate(input),
    onSuccess: (
      _data: unknown,
      variables: { userId: string; encryptedDisplayName: string },
    ) => {
      haptic();
      orgCache.delete(`user:${variables.userId}`);
      void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      const msg = m.admin_display_name_updated();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const adminUsernameMutation = createMutation(() => ({
    mutationFn: async (input: { userId: string; newIdentifier: string }) =>
      profileRouter.adminUpdateUsername.mutate(input),
    onSuccess: () => {
      haptic();
      void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      const msg = m.admin_username_updated();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
    },
    onError: (err: Error) => {
      if (err.message === ErrorCode.USERNAME_ALREADY_TAKEN) {
        toastStore.show(m.settings_username_taken());
      } else {
        toastStore.show(m.error_generic());
      }
    },
  }));

  const setActiveMutation = createMutation(() => ({
    mutationFn: async (input: { userId: string; isActive: boolean }) =>
      authRouter.setUserActive.mutate(input),
    onSuccess: (
      _data: unknown,
      variables: { userId: string; isActive: boolean },
    ) => {
      haptic();
      void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      const msg = variables.isActive
        ? m.admin_user_reactivated()
        : m.admin_user_deactivated();
      toastStore.show(msg);
      announceToLiveRegion(variables.isActive ? "polite" : "assertive", msg);
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  function decryptDisplayName(
    userId: string,
    encryptedBase64: string,
  ): string | null {
    const bytes = base64ToUint8Array(encryptedBase64);
    return orgCache.decrypt(`user:${userId}`, bytes);
  }

  // ── Client-side filtering + sorting ──

  type UserRecord = NonNullable<typeof usersQuery.data>[number];

  function deriveKeyStatus(u: UserRecord): KeyStatus {
    if (u.hasKeys && u.hasOrgKeyWrap) return "ok";
    if (!u.hasKeys) return "no_keys";
    return "no_org_key";
  }

  const ROLE_SORT_ORDER: Record<string, number> = {
    [RoleId.ADMIN]: 0,
    [RoleId.MANAGER]: 1,
    [RoleId.VOLUNTEER]: 2,
  };

  const userQueueMap = $derived.by((): Map<string, Set<string>> => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- local computation inside $derived, not reactive state
    const map = new Map<string, Set<string>>();
    for (const a of queueAssignments) {
      let set = map.get(a.userId);
      if (!set) {
        set = new Set<string>(); // eslint-disable-line svelte/prefer-svelte-reactivity
        map.set(a.userId, set);
      }
      set.add(a.queueId);
    }
    return map;
  });

  const filteredUsers = $derived.by(() => {
    const all = usersQuery.data ?? [];
    let result = all;

    if (userFilterStore.roles.size > 0) {
      result = result.filter((u) =>
        (userFilterStore.roles as ReadonlySet<string>).has(u.roleId),
      );
    }
    if (userFilterStore.statuses.size > 0) {
      result = result.filter((u) =>
        (userFilterStore.statuses as ReadonlySet<string>).has(
          u.isActive ? "active" : "inactive",
        ),
      );
    }
    if (userFilterStore.keyStatuses.size > 0) {
      result = result.filter((u) =>
        userFilterStore.keyStatuses.has(deriveKeyStatus(u)),
      );
    }
    if (userFilterStore.queueIds.size > 0) {
      result = result.filter((u) => {
        const userQueues = userQueueMap.get(u.id);
        if (!userQueues) return false;
        for (const qId of userFilterStore.queueIds) {
          if (userQueues.has(qId)) return true;
        }
        return false;
      });
    }

    if (searchQuery.length >= 2) {
      const norm = normalizeForSearch(searchQuery);
      result = result.filter((u) => {
        const name = decryptDisplayName(u.id, u.encryptedDisplayName);
        if (name === null) return false;
        return normalizeForSearch(name).includes(norm);
      });
    }

    const sorted = [...result];
    const { field, direction } = userFilterStore.sort;
    const dir = direction === "asc" ? 1 : -1;

    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- derived-local sort cache, not reactive
    const nameCache = new Map<string, string>();
    if (field === "name") {
      for (const u of sorted) {
        nameCache.set(
          u.id,
          decryptDisplayName(u.id, u.encryptedDisplayName) ?? "\uffff",
        );
      }
    }

    sorted.sort((a, b) => {
      switch (field) {
        case "name":
          return (
            dir *
            (nameCache.get(a.id) ?? "\uffff").localeCompare(
              nameCache.get(b.id) ?? "\uffff",
            )
          );
        case "role":
          return (
            dir *
            ((ROLE_SORT_ORDER[a.roleId] ?? 3) -
              (ROLE_SORT_ORDER[b.roleId] ?? 3))
          );
        case "status": {
          const aVal = a.isActive ? 0 : 1;
          const bVal = b.isActive ? 0 : 1;
          return dir * (aVal - bVal);
        }
        default:
          return 0;
      }
    });

    return sorted;
  });

  // ── Stats (exported as functions per Svelte 5 derived_invalid_export rule) ──
  const userCounts = $derived.by(() => {
    let active = 0;
    let inactive = 0;
    for (const u of usersQuery.data ?? []) {
      if (u.isActive) active++;
      else inactive++;
    }
    return { active, inactive, total: active + inactive };
  });

  export function activeCount(): number {
    return userCounts.active;
  }

  export function inactiveCount(): number {
    return userCounts.inactive;
  }

  export function matchedUserIds(): readonly string[] {
    return filteredUsers.map((u) => u.id);
  }

  // ── Edit user sheet ──
  interface SheetState {
    userId: string;
    userName: string;
    userIdentifier: string;
    roleId: string;
    isActive: boolean;
  }
  let sheetState = $state<SheetState | null>(null);
  let editRoleId = $state<RoleIdValue>(RoleId.VOLUNTEER);
  let editDisplayName = $state("");
  let editUsername = $state("");

  let memberQueueIds = new SvelteSet<string>();
  let originalQueueIds = new SvelteSet<string>();
  let queuesLoading = $state(false);

  export function editUser(userId: string): void {
    handleUserEdit(userId);
  }

  function handleUserEdit(userId: string): void {
    const user = (usersQuery.data ?? []).find((u) => u.id === userId);
    if (!user) return;
    const state: SheetState = {
      userId,
      userName:
        decryptDisplayName(userId, user.encryptedDisplayName) ??
        userId.slice(0, 8),
      userIdentifier: user.identifier,
      roleId: user.roleId,
      isActive: user.isActive,
    };
    sheetState = state;
    editDisplayName = state.userName;
    editUsername = state.userIdentifier;
    editRoleId =
      user.roleId === RoleId.ADMIN || user.roleId === RoleId.MANAGER
        ? user.roleId
        : RoleId.VOLUNTEER;

    memberQueueIds.clear();
    originalQueueIds.clear();
    queuesLoading = true;
    ticketRouter.getUserQueues
      .query({ userId })
      .then((ids: readonly string[]) => {
        for (const id of ids) {
          memberQueueIds.add(id);
          originalQueueIds.add(id);
        }
      })
      .catch(() => {
        toastStore.show(m.error_generic());
      })
      .finally(() => {
        queuesLoading = false;
      });
  }

  function closeSheet(): void {
    sheetState = null;
  }

  const roleChanged = $derived(
    sheetState !== null && editRoleId !== sheetState.roleId,
  );

  const trimmedDisplayName = $derived(editDisplayName.trim());
  const displayNameValid = $derived(
    trimmedDisplayName.length >= 1 && trimmedDisplayName.length <= 100,
  );
  const displayNameChanged = $derived(
    sheetState !== null &&
      displayNameValid &&
      trimmedDisplayName !== sheetState.userName,
  );

  const parsedUsername = $derived(identifierSchema.safeParse(editUsername));
  const trimmedUsername = $derived(
    parsedUsername.success
      ? parsedUsername.data
      : editUsername.trim().toLowerCase(),
  );
  const usernameValid = $derived(parsedUsername.success);
  const usernameChanged = $derived(
    sheetState !== null &&
      usernameValid &&
      trimmedUsername !== sheetState.userIdentifier,
  );

  const queueChanged = $derived.by(() => {
    if (memberQueueIds.size !== originalQueueIds.size) return true;
    for (const id of memberQueueIds) {
      if (!originalQueueIds.has(id)) return true;
    }
    return false;
  });

  const hasChanges = $derived(
    roleChanged || queueChanged || displayNameChanged || usernameChanged,
  );

  function toggleQueue(queueId: string): void {
    if (memberQueueIds.has(queueId)) {
      memberQueueIds.delete(queueId);
    } else {
      memberQueueIds.add(queueId);
    }
  }

  async function handleSaveUser(): Promise<void> {
    if (!sheetState || !hasChanges) return;
    const userId = sheetState.userId;

    if (displayNameChanged) {
      const plainBytes = textEncoder.encode(trimmedDisplayName);
      const cipherBytes = await orgKeyManager.encrypt(plainBytes);
      const encryptedDisplayName = uint8ArrayToBase64(cipherBytes);
      adminDisplayNameMutation.mutate({ userId, encryptedDisplayName });
    }

    if (usernameChanged) {
      adminUsernameMutation.mutate({ userId, newIdentifier: trimmedUsername });
    }

    if (roleChanged) {
      assignRoleMutation.mutate({ userId, roleId: editRoleId });
    }

    if (queueChanged) {
      const added = [...memberQueueIds].filter(
        (id) => !originalQueueIds.has(id),
      );
      const removed = [...originalQueueIds].filter(
        (id) => !memberQueueIds.has(id),
      );

      for (const queueId of added) {
        try {
          await ticketRouter.addQueueMember.mutate({ queueId, userId });
        } catch {
          toastStore.show(m.error_generic());
          break;
        }
      }
      for (const queueId of removed) {
        try {
          await ticketRouter.removeQueueMember.mutate({ queueId, userId });
        } catch {
          toastStore.show(m.error_generic());
          break;
        }
      }

      void queryClient.invalidateQueries({ queryKey: queueKeys.membersAll() });
    }

    closeSheet();
  }

  function handleSheetDeactivate(): void {
    if (!sheetState) return;
    const { userId, userName, isActive } = sheetState;
    closeSheet();
    openDeactivateDialog(userId, userName, !isActive);
  }

  // ── Deactivation dialog (single user) ──
  let dialogOpened = $state(false);
  let dialogUserId = $state<string>("");
  let dialogUserName = $state<string>("");
  let dialogIsReactivation = $state(false);

  function openDeactivateDialog(
    userId: string,
    displayName: string | null,
    isReactivation: boolean,
  ): void {
    dialogUserId = userId;
    dialogUserName = displayName ?? userId.slice(0, 8);
    dialogIsReactivation = isReactivation;
    dialogOpened = true;
  }

  function confirmActiveToggle(): void {
    dialogOpened = false;
    setActiveMutation.mutate({
      userId: dialogUserId,
      isActive: dialogIsReactivation,
    });
  }

  // ── Invite ──
  let inviteOpened = $state(false);

  export function openInvite(): void {
    inviteOpened = true;
  }

  $effect(() => {
    if (autoAction === "invite") {
      inviteOpened = true;
    }
  });

  // ── Multi-select ──
  let multiSelectActive = $state(false);
  const selectedIds = new SvelteSet<string>();

  const tabbarOverride = getTabbarOverrideCtx();

  export function toggleMultiSelect(): void {
    if (multiSelectActive) {
      exitMultiSelect();
    } else {
      multiSelectActive = true;
    }
  }

  function toggleSelection(userId: string): void {
    if (selectedIds.has(userId)) {
      selectedIds.delete(userId);
    } else {
      selectedIds.add(userId);
    }
  }

  function exitMultiSelect(): void {
    multiSelectActive = false;
    selectedIds.clear();
  }

  $effect(() => {
    if (multiSelectActive) {
      tabbarOverride.current = {
        left: batchLeft,
        middle: batchMiddle,
        right: batchRight,
        ariaLabel: m.admin_users_selected({ count: selectedIds.size }),
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

  async function handleBatchDeactivate(): Promise<void> {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    let succeeded = 0;

    for (const uid of ids) {
      try {
        await authRouter.setUserActive.mutate({ userId: uid, isActive: false });
        succeeded++;
      } catch {
        toastStore.show(m.error_generic(), 3000);
        exitMultiSelect();
        return;
      }
    }

    haptic();
    toastStore.show(m.admin_users_batch_deactivated({ count: succeeded }));
    exitMultiSelect();
    void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
  }
</script>

{#snippet batchLeft()}
  <Link
    iconOnly
    onclick={() => void handleBatchDeactivate()}
    aria-label={m.admin_users_batch_deactivate()}
  >
    <UserMinus size={24} aria-hidden="true" />
  </Link>
{/snippet}

{#snippet batchMiddle()}
  <span class="font-semibold text-sm" role="status">
    {m.admin_users_selected({ count: selectedIds.size })}
  </span>
{/snippet}

{#snippet batchRight()}
  <Link
    iconOnly
    aria-label={m.admin_users_exit_multiselect()}
    onclick={exitMultiSelect}
  >
    <X size={24} aria-hidden="true" />
  </Link>
{/snippet}

<div class="users-page pb-20">
  {#if usersQuery.isLoading}
    <div class="user-list">
      {#each { length: 4 } as _, i (i)}
        <UserCard
          viewMode="list"
          userId=""
          displayName={null}
          roleId=""
          isActive={true}
          hasKeys={true}
          hasOrgKeyWrap={true}
          isSelf={true}
          onedit={() => {
            /* skeleton: isSelf hides the button */
          }}
        />
      {/each}
    </div>
  {:else if usersQuery.isError}
    <QueryError
      error={usersQuery.error}
      onretry={() => void usersQuery.refetch()}
    />
  {:else if filteredUsers.length === 0 && userCounts.total === 0}
    <Block class="text-center text-[--muted]">
      {m.admin_no_users()}
    </Block>
  {:else}
    <div class="user-list">
      {#each filteredUsers as user (user.id)}
        {@const isSelf = user.id === currentUserId}
        {@const displayName = decryptDisplayName(
          user.id,
          user.encryptedDisplayName,
        )}
        <div id="user-{user.id}" class:match-active={activeMatchId === user.id}>
          <UserCard
            viewMode="list"
            userId={user.id}
            {displayName}
            roleId={user.roleId}
            isActive={user.isActive}
            hasKeys={user.hasKeys}
            hasOrgKeyWrap={user.hasOrgKeyWrap}
            {isSelf}
            selected={selectedIds.has(user.id)}
            {multiSelectActive}
            onedit={handleUserEdit}
            onselect={toggleSelection}
          />
        </div>
      {/each}
    </div>

    {#if filteredUsers.length === 0}
      <div class="empty-state" role="status">
        <p>{m.admin_users_empty_filter()}</p>
      </div>
    {/if}
  {/if}
</div>

<ShellSheet
  opened={sheetState !== null}
  ondismiss={closeSheet}
  title={sheetState?.userName ?? ""}
  ariaLabel={m.admin_user_edit_actions()}
>
  {#snippet headerRight()}
    <SoftButton
      onclick={() => void handleSaveUser()}
      disabled={!hasChanges ||
        assignRoleMutation.isPending ||
        adminDisplayNameMutation.isPending ||
        adminUsernameMutation.isPending}
    >
      {#if assignRoleMutation.isPending || adminDisplayNameMutation.isPending || adminUsernameMutation.isPending}
        {m.common_loading()}
      {:else}
        <Save size={16} aria-hidden="true" />
        {m.admin_user_save_changes()}
      {/if}
    </SoftButton>
  {/snippet}
  <div class="edit-user-content">
    <div class="display-name-section">
      <p class="section-label">{m.admin_display_name_label()}</p>
      <List nested>
        <ListInput
          outline
          label={m.settings_display_name()}
          type="text"
          value={editDisplayName}
          oninput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              editDisplayName = e.target.value;
          }}
          disabled={adminDisplayNameMutation.isPending}
        />
      </List>
    </div>

    <div class="username-section">
      <p class="section-label">{m.admin_username_label()}</p>
      <List nested>
        <ListInput
          outline
          label={m.settings_username()}
          type="text"
          value={editUsername}
          oninput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              editUsername = e.target.value;
          }}
          disabled={adminUsernameMutation.isPending}
        />
      </List>
      <p class="pii-warning">{m.admin_invite_identifier_pii_warning()}</p>
    </div>

    <div class="role-section">
      <p class="section-label">{m.admin_invite_role_label()}</p>
      <Segmented strong>
        <SegmentedButton
          active={editRoleId === RoleId.VOLUNTEER}
          onclick={() => (editRoleId = RoleId.VOLUNTEER)}
        >
          {m.admin_role_volunteer()}
        </SegmentedButton>
        <SegmentedButton
          active={editRoleId === RoleId.MANAGER}
          onclick={() => (editRoleId = RoleId.MANAGER)}
        >
          {m.admin_role_manager()}
        </SegmentedButton>
        <SegmentedButton
          active={editRoleId === RoleId.ADMIN}
          onclick={() => (editRoleId = RoleId.ADMIN)}
        >
          {m.admin_role_admin()}
        </SegmentedButton>
      </Segmented>
    </div>

    {#if (queuesQuery.data ?? []).length > 0}
      <div class="queue-section">
        <p class="section-label">{m.admin_user_queue_assignments()}</p>
        <List nested>
          {#if queuesLoading}
            {#each { length: 2 } as _, i (i)}
              <ListItem>
                {#snippet title()}<InlineSkeleton width="8ch" />{/snippet}
              </ListItem>
            {/each}
          {:else}
            {#each queuesQuery.data ?? [] as queue (queue.id)}
              {@const queueName =
                orgCache.decrypt(`queue:${queue.id}`, queue.encryptedName) ??
                "..."}
              <ListItem title={queueName}>
                {#snippet after()}
                  <Toggle
                    checked={memberQueueIds.has(queue.id)}
                    onchange={() => toggleQueue(queue.id)}
                  />
                {/snippet}
              </ListItem>
            {/each}
          {/if}
        </List>
      </div>
    {/if}

    <div class="deactivate-action">
      <button
        type="button"
        class="deactivate-btn"
        onclick={handleSheetDeactivate}
      >
        {sheetState?.isActive === true
          ? m.admin_deactivate()
          : m.admin_reactivate()}
      </button>
    </div>
  </div>
</ShellSheet>

<ShellDialog
  opened={dialogOpened}
  ondismiss={() => (dialogOpened = false)}
  title={dialogIsReactivation
    ? m.admin_reactivate_title({ name: dialogUserName })
    : m.admin_deactivate_title({ name: dialogUserName })}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {#if dialogIsReactivation}
        {m.admin_reactivate_body()}
      {:else}
        {m.admin_deactivate_body()}
      {/if}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (dialogOpened = false)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={dialogIsReactivation ? "" : "text-[--color-red-500] font-semibold"}
      onclick={confirmActiveToggle}
    >
      {#if dialogIsReactivation}
        {m.admin_reactivate()}
      {:else}
        {m.admin_deactivate()}
      {/if}
    </DialogButton>
  {/snippet}
</ShellDialog>

<InviteUser opened={inviteOpened} ondismiss={() => (inviteOpened = false)} />

<style>
  .users-page {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .user-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    min-width: 0;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--muted);
    font-size: var(--text-base);
  }

  .edit-user-content {
    display: flex;
    flex-direction: column;
    padding: var(--space-md) var(--space-lg);
    flex: 1;
  }

  .display-name-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .username-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
  }

  .pii-warning {
    font-size: 0.8125rem;
    color: var(--color-amber-500);
    background: color-mix(in srgb, var(--color-amber-500) 10%, transparent);
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    margin: 0;
  }

  .role-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
  }

  .section-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }

  .queue-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
  }

  .deactivate-action {
    padding: var(--space-2xl) var(--space-lg) 0;
  }

  .deactivate-btn {
    display: block;
    width: 100%;
    padding: 0.625rem;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-red-500);
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    min-height: 44px;
  }
</style>

<script lang="ts">
  import {
    Block,
    Button,
    DialogButton,
    List,
    ListInput,
    ListItem,
    Toggle,
  } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import Register from "$lib/components/Register.svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { SvelteSet } from "svelte/reactivity";
  import { RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import { UserMinus, Save } from "@lucide/svelte";
  import BulkActionBar from "$lib/components/BulkActionBar.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys, inviteKeys, queueKeys } from "$lib/query/keys.js";
  import {
    getOrgDecryptCache,
    getOrgKeyManager,
    getCurrentUserId,
  } from "$lib/crypto/context.js";
  import { ErrorCode, identifierSchema } from "@care-y/shared";
  import { encode } from "@care-y/crypto";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import { userFilterStore } from "$lib/stores/user-filters.svelte.js";
  import {
    buildUserQueueMap,
    filterUsers,
    sortUsers,
    countUsers,
    filterInvites,
    computeQueueDiff,
    hasQueueChanges,
  } from "$lib/admin/users-section-utils.js";
  import type { Snippet } from "svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import InviteUser from "./InviteUser.svelte";
  import InviteLinkSheet from "./InviteLinkSheet.svelte";
  import InvitePendingCard from "./InvitePendingCard.svelte";
  import RoleSelector from "$lib/components/shared/RoleSelector.svelte";
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
  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const profileRouter = trpc.profile;
  const onboardingRouter = requireRouter(trpc.onboarding, "onboarding");
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

  const invitesQuery = createQuery(() => ({
    queryKey: inviteKeys.pending(),
    queryFn: async () => onboardingRouter.listPendingInvites.query(),
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
    onSuccess: (
      _data: unknown,
      variables: { userId: string; newIdentifier: string },
    ) => {
      haptic();
      orgCache.delete(`user-ident:${variables.userId}`);
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
    return orgCache.decrypt(`user:${userId}`, encryptedBase64);
  }

  // Identifiers are org-key sealed like display names (ADR-052). Decrypted
  // on demand when the edit sheet opens, not during list render.
  async function decryptIdentifier(
    userId: string,
    encryptedBase64: string,
  ): Promise<string | null> {
    return orgCache.decryptAsync(`user-ident:${userId}`, encryptedBase64);
  }

  // ── Client-side filtering + sorting ──

  const userQueueMap = $derived(buildUserQueueMap(queueAssignments));

  const filteredUsers = $derived(
    sortUsers(
      filterUsers(
        usersQuery.data ?? [],
        {
          roles: userFilterStore.roles,
          statuses: userFilterStore.statuses,
          keyStatuses: userFilterStore.keyStatuses,
          queueIds: userFilterStore.queueIds,
        },
        userQueueMap,
        searchQuery,
        decryptDisplayName,
      ),
      userFilterStore.sort,
      decryptDisplayName,
    ),
  );

  // ── Stats (exported as functions per Svelte 5 derived_invalid_export rule) ──
  const userCounts = $derived(countUsers(usersQuery.data ?? []));

  export function activeCount(): number {
    return userCounts.active;
  }

  export function inactiveCount(): number {
    return userCounts.inactive;
  }

  export function matchedUserIds(): readonly string[] {
    return filteredUsers.map((u) => u.id);
  }

  export function pendingInviteCount(): number {
    return invitesQuery.data?.length ?? 0;
  }

  // ── Pending invites (filtered + revoke) ──

  const ROLE_LABEL_MAP: ReadonlyMap<string, () => string> = new Map([
    [RoleId.VOLUNTEER, () => m.admin_role_volunteer(withTerms())],
    [RoleId.MANAGER, () => m.admin_role_manager(withTerms())],
    [RoleId.ADMIN, () => m.admin_role_admin()],
  ]);

  function getRoleLabel(roleId: string): string {
    const fn = ROLE_LABEL_MAP.get(roleId);
    return fn ? fn() : m.admin_role_unknown();
  }

  const filteredInvites = $derived(
    filterInvites(
      invitesQuery.data ?? [],
      userFilterStore.roles as ReadonlySet<string>,
    ),
  );

  function lookupInviterName(invitedBy: string): string | null {
    const inviter = (usersQuery.data ?? []).find((u) => u.id === invitedBy);
    if (!inviter) return null;
    return decryptDisplayName(inviter.id, inviter.encryptedDisplayName);
  }

  const revokeMutation = createMutation(() => ({
    mutationFn: async (input: { tokenId: string }) =>
      onboardingRouter.revokeInvite.mutate(input),
    onSuccess: () => {
      haptic();
      void queryClient.invalidateQueries({ queryKey: inviteKeys.pending() });
      const msg = m.admin_invite_pending_revoked();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
    },
    onError: () => {
      toastStore.show(m.admin_invite_pending_revoke_error());
    },
  }));

  let revokeDialogOpened = $state(false);
  let revokeTokenId = $state("");

  function openRevokeDialog(tokenId: string): void {
    revokeTokenId = tokenId;
    revokeDialogOpened = true;
  }

  function confirmRevoke(): void {
    revokeDialogOpened = false;
    revokeMutation.mutate({ tokenId: revokeTokenId });
  }

  async function handleCopyInviteLink(url: string): Promise<void> {
    await navigator.clipboard.writeText(url);
    haptic();
    toastStore.show(m.admin_invite_link_copied());
  }

  // ── Edit user sheet ──
  interface SheetState {
    userId: string;
    userDisplayName: string;
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
    void handleUserEdit(userId);
  }

  async function handleUserEdit(userId: string): Promise<void> {
    const user = (usersQuery.data ?? []).find((u) => u.id === userId);
    if (!user) return;
    const identifier = await decryptIdentifier(
      userId,
      user.encryptedIdentifier,
    );
    const state: SheetState = {
      userId,
      userDisplayName:
        decryptDisplayName(userId, user.encryptedDisplayName) ??
        userId.slice(0, 8),
      userIdentifier: identifier ?? "",
      roleId: user.roleId,
      isActive: user.isActive,
    };
    sheetState = state;
    editDisplayName = state.userDisplayName;
    editUsername = state.userIdentifier;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- server roleId is always a valid RoleIdValue
    editRoleId = user.roleId as RoleIdValue;

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
      trimmedDisplayName !== sheetState.userDisplayName,
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

  const queueChanged = $derived(
    hasQueueChanges(memberQueueIds, originalQueueIds),
  );

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
      const encryptedDisplayName = encode(cipherBytes);
      adminDisplayNameMutation.mutate({ userId, encryptedDisplayName });
    }

    if (usernameChanged) {
      adminUsernameMutation.mutate({ userId, newIdentifier: trimmedUsername });
    }

    if (roleChanged) {
      assignRoleMutation.mutate({ userId, roleId: editRoleId });
    }

    if (queueChanged) {
      const { added, removed } = computeQueueDiff(
        memberQueueIds,
        originalQueueIds,
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
    const { userId, userDisplayName, isActive } = sheetState;
    closeSheet();
    openDeactivateDialog(userId, userDisplayName, !isActive);
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
  let inviteLinkOpened = $state(false);

  export function openInvite(): void {
    inviteOpened = true;
  }

  export function openInviteLink(): void {
    inviteLinkOpened = true;
  }

  $effect(() => {
    if (autoAction === "invite") {
      inviteOpened = true;
    } else if (autoAction === "invite-link") {
      inviteLinkOpened = true;
    }
  });

  // ── Multi-select ──
  let multiSelectActive = $state(false);
  const selectedIds = new SvelteSet<string>();

  export function toggleMultiSelect(): void {
    if (multiSelectActive) {
      exitMultiSelect();
    } else {
      multiSelectActive = true;
    }
  }

  export function isMultiSelectActive(): boolean {
    return multiSelectActive;
  }

  export function bulkActionsSnippet(): Snippet | undefined {
    return multiSelectActive ? bulkActionsRow : undefined;
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

{#snippet bulkActionsRow()}
  <BulkActionBar
    countLabel={m.admin_users_selected({ count: selectedIds.size })}
    exitLabel={m.admin_users_exit_multiselect()}
    onexit={exitMultiSelect}
    ariaLabel={m.admin_users_selected({ count: selectedIds.size })}
  >
    {#snippet actions()}
      <Button
        tonal
        rounded
        small
        inline
        class="bulk-action-btn"
        onclick={() => void handleBatchDeactivate()}
      >
        <UserMinus size={16} aria-hidden="true" />
        {m.admin_users_batch_deactivate()}
      </Button>
    {/snippet}
  </BulkActionBar>
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
      {m.admin_no_users(withTerms())}
    </Block>
  {:else}
    <div class="user-list">
      {#each filteredInvites as invite (invite.id)}
        <InvitePendingCard
          id={invite.id}
          roleLabel={getRoleLabel(invite.roleId)}
          inviterName={lookupInviterName(invite.invitedBy)}
          expiresAt={invite.expiresAt}
          encryptedToken={invite.encryptedToken ?? null}
          revoking={revokeMutation.isPending &&
            revokeMutation.variables.tokenId === invite.id}
          onrevoke={openRevokeDialog}
          oncopy={handleCopyInviteLink}
        />
      {/each}
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
            reachability={user.reachability}
            selected={selectedIds.has(user.id)}
            {multiSelectActive}
            onedit={(id: string) => void handleUserEdit(id)}
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
  title={sheetState?.userDisplayName ?? ""}
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
      <Register kind="careful">
        {m.user_field_login_username_pii_warning()}
      </Register>
    </div>

    <RoleSelector
      selectedRole={editRoleId}
      onselect={(r: RoleIdValue) => (editRoleId = r)}
    />

    {#if (queuesQuery.data ?? []).length > 0}
      <div class="queue-section">
        <p class="section-label">
          {m.admin_user_queue_assignments(withTerms())}
        </p>
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
                m.common_loading()}
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
      class={dialogIsReactivation ? "" : DIALOG_DESTRUCTIVE_CLASS}
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

<ShellDialog
  opened={revokeDialogOpened}
  ondismiss={() => (revokeDialogOpened = false)}
  title={m.admin_invite_pending_revoke_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_invite_pending_revoke_body()}
    </p>
  {/snippet}
  {#snippet buttons()}
    <!-- care-y-ignore-next-line no-click-without-keyboard -- DialogButton renders a native <button> -->
    <DialogButton onclick={() => (revokeDialogOpened = false)}>
      {m.common_cancel()}
    </DialogButton>
    <!-- care-y-ignore-next-line no-click-without-keyboard -- DialogButton renders a native <button> -->
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmRevoke}
    >
      {m.admin_invite_pending_revoke()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<InviteUser opened={inviteOpened} ondismiss={() => (inviteOpened = false)} />
<InviteLinkSheet
  opened={inviteLinkOpened}
  ondismiss={() => (inviteLinkOpened = false)}
/>

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
    color: var(--danger, var(--color-red-500));
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    min-height: 44px;
  }
</style>

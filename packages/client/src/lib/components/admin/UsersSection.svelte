<script lang="ts">
  import {
    Block,
    DialogButton,
    Link,
    ActionsGroup,
    ActionsButton,
    ActionsLabel,
  } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { SvelteSet } from "svelte/reactivity";
  import { RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import { UserMinus, X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache, getCurrentUserId } from "$lib/crypto/context.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import {
    userFilterStore,
    type KeyStatus,
  } from "$lib/stores/user-filters.svelte.js";
  import { getTabbarOverrideCtx } from "$lib/shell/context.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import RolePopover from "./RolePopover.svelte";
  import InviteUser from "./InviteUser.svelte";
  import UserCard from "./UserCard.svelte";

  interface UsersSectionProps {
    readonly autoAction?: string | null;
  }

  let { autoAction = null }: UsersSectionProps = $props();

  const authRouter = trpc.auth;
  const queryClient = useQueryClient();

  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());

  const usersQuery = createQuery(() => ({
    queryKey: ["admin", "users"],
    queryFn: async () => authRouter.listUsers.query(),
  }));

  const assignRoleMutation = createMutation(() => ({
    mutationFn: async (input: { userId: string; roleId: RoleIdValue }) =>
      authRouter.assignRole.mutate(input),
    onSuccess: () => {
      haptic();
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toastStore.show(m.admin_role_changed());
      announceToLiveRegion("polite", m.admin_role_changed());
    },
    onError: () => {
      toastStore.show(m.error_generic());
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
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
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

  // ── Action sheet (per-user actions) ──
  interface SheetState {
    userId: string;
    userName: string;
    roleId: string;
    isActive: boolean;
  }
  let sheetState = $state<SheetState | null>(null);
  let roleActionBtnEl = $state<HTMLElement | undefined>(undefined);

  function handleUserEdit(userId: string): void {
    const user = (usersQuery.data ?? []).find((u) => u.id === userId);
    if (!user) return;
    sheetState = {
      userId,
      userName:
        decryptDisplayName(userId, user.encryptedDisplayName) ??
        userId.slice(0, 8),
      roleId: user.roleId,
      isActive: user.isActive,
    };
  }

  function closeSheet(): void {
    sheetState = null;
  }

  function handleSheetDeactivate(): void {
    if (!sheetState) return;
    const { userId, userName, isActive } = sheetState;
    closeSheet();
    openDeactivateDialog(userId, userName, !isActive);
  }

  function handleSheetRoleChange(e: MouseEvent): void {
    const el = e.currentTarget;
    if (el instanceof HTMLElement) roleActionBtnEl = el;
    popoverOpened = true;
  }

  // ── Role popover (anchored to action sheet button) ──
  let popoverOpened = $state(false);

  function handleRoleSelect(roleId: RoleIdValue): void {
    popoverOpened = false;
    if (sheetState && roleId !== sheetState.roleId) {
      assignRoleMutation.mutate({ userId: sheetState.userId, roleId });
    }
    closeSheet();
  }

  function handlePopoverDismiss(): void {
    popoverOpened = false;
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
    void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
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
      {/each}
    </div>

    {#if filteredUsers.length === 0}
      <div class="empty-state" role="status">
        <p>{m.admin_users_empty_filter()}</p>
      </div>
    {/if}
  {/if}
</div>

<ShellActionSheet opened={sheetState !== null} ondismiss={closeSheet}>
  <ActionsGroup>
    <ActionsLabel>{sheetState?.userName ?? ""}</ActionsLabel>
    <ActionsButton onclick={handleSheetRoleChange}>
      {m.admin_role_change()}
    </ActionsButton>
    <ActionsButton
      colors={sheetState?.isActive === true
        ? { textIos: "text-red-500", textMaterial: "text-red-500" }
        : {}}
      onclick={handleSheetDeactivate}
    >
      {sheetState?.isActive === true
        ? m.admin_deactivate()
        : m.admin_reactivate()}
    </ActionsButton>
  </ActionsGroup>
  <ActionsGroup>
    <ActionsButton bold onclick={closeSheet}>
      {m.common_cancel()}
    </ActionsButton>
  </ActionsGroup>
</ShellActionSheet>

<RolePopover
  opened={popoverOpened}
  target={roleActionBtnEl}
  currentRoleId={sheetState?.roleId ?? ""}
  placement="top"
  ondismiss={handlePopoverDismiss}
  onselect={handleRoleSelect}
/>

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
</style>

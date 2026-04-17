<script lang="ts">
  import {
    List,
    ListItem,
    Block,
    Button,
    Chip,
    DialogButton,
  } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache, getCurrentUserId } from "$lib/crypto/context.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import QueryError from "$lib/components/QueryError.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import RolePopover from "./RolePopover.svelte";

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

  function roleLabelFor(roleId: string): string {
    switch (roleId) {
      case RoleId.VOLUNTEER:
        return m.admin_role_volunteer();
      case RoleId.MANAGER:
        return m.admin_role_manager();
      case RoleId.ADMIN:
        return m.admin_role_admin();
      default:
        return m.admin_role_unknown();
    }
  }

  function decryptDisplayName(
    userId: string,
    encryptedBase64: string,
  ): string | null {
    const bytes = base64ToUint8Array(encryptedBase64);
    return orgCache.decrypt(`user:${userId}`, bytes);
  }

  function keyStatusLabel(hasKeys: boolean, hasOrgKeyWrap: boolean): string {
    if (hasKeys && hasOrgKeyWrap) return m.admin_key_status_ok();
    if (!hasKeys) return m.admin_key_status_no_keys();
    return m.admin_key_status_no_org_key();
  }

  function noop(): void {
    // InviteUser popup wired in next task
  }

  let popoverOpened = $state(false);
  let popoverTarget = $state<HTMLElement | undefined>(undefined);
  let popoverUserId = $state<string>("");
  let popoverCurrentRole = $state<string>("");

  function openRolePopover(
    event: MouseEvent | KeyboardEvent,
    userId: string,
    roleId: string,
  ): void {
    const target = event.currentTarget;
    popoverTarget = target instanceof HTMLElement ? target : undefined;
    popoverUserId = userId;
    popoverCurrentRole = roleId;
    popoverOpened = true;
  }

  function handleRoleSelect(roleId: RoleIdValue): void {
    if (popoverUserId && roleId !== popoverCurrentRole) {
      assignRoleMutation.mutate({ userId: popoverUserId, roleId });
    }
  }

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
</script>

{#if usersQuery.isLoading}
  <List strong inset>
    {#each { length: 3 } as _, i (i)}
      <ListItem>
        {#snippet title()}
          <DecryptPlaceholder content={null} length={14} />
        {/snippet}
        {#snippet after()}
          <span
            class="h-5 w-16 motion-safe:animate-pulse rounded bg-[--surface-2]"
          ></span>
        {/snippet}
      </ListItem>
    {/each}
  </List>
{:else if usersQuery.isError}
  <QueryError
    error={usersQuery.error}
    onretry={() => void usersQuery.refetch()}
  />
{:else if usersQuery.data?.length === 0}
  <Block class="text-center text-[--muted]">
    {m.admin_no_users()}
  </Block>
{:else if usersQuery.data}
  <div class="flex justify-end px-[--space-md] pb-[--space-sm]">
    <Button small outline class="invite-btn" onclick={noop}>
      {m.admin_invite_button()}
    </Button>
  </div>

  <List strong inset>
    {#each usersQuery.data as user (user.id)}
      {@const isSelf = user.id === currentUserId}
      {@const displayName = decryptDisplayName(
        user.id,
        user.encryptedDisplayName,
      )}
      {@const roleLabel = roleLabelFor(user.roleId)}
      {@const keyStatus = keyStatusLabel(user.hasKeys, user.hasOrgKeyWrap)}
      <ListItem>
        {#snippet title()}
          <div class="flex items-center gap-[--space-sm]">
            <DecryptPlaceholder
              content={displayName}
              length={14}
              class="font-medium"
            />
            {#if !user.isActive}
              <span class="text-xs text-[--muted]">
                ({m.admin_status_inactive()})
              </span>
            {/if}
          </div>
        {/snippet}
        {#snippet subtitle()}
          <span class="text-xs text-[--muted]">{keyStatus}</span>
        {/snippet}
        {#snippet after()}
          <div class="flex items-center gap-[--space-sm]">
            <button
              class="touch-feedback"
              onclick={(e) => openRolePopover(e, user.id, user.roleId)}
              disabled={isSelf}
              aria-label={m.admin_role_change()}
              aria-disabled={isSelf}
            >
              <Chip class={isSelf ? "opacity-60" : ""} outline>
                {roleLabel}
              </Chip>
            </button>

            <span
              class="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              class:bg-[--color-green-500]={user.isActive}
              class:bg-[--color-red-500]={!user.isActive}
              aria-label={user.isActive
                ? m.admin_status_active()
                : m.admin_status_inactive()}
              role="img"
            ></span>

            {#if !isSelf}
              {#if user.isActive}
                <Button
                  small
                  tonal
                  class="text-[--color-red-500]"
                  onclick={() =>
                    openDeactivateDialog(user.id, displayName, false)}
                >
                  {m.admin_deactivate()}
                </Button>
              {:else}
                <Button
                  small
                  tonal
                  onclick={() =>
                    openDeactivateDialog(user.id, displayName, true)}
                >
                  {m.admin_reactivate()}
                </Button>
              {/if}
            {/if}
          </div>
        {/snippet}
      </ListItem>
    {/each}
  </List>
{/if}

<RolePopover
  opened={popoverOpened}
  target={popoverTarget}
  currentRoleId={popoverCurrentRole}
  ondismiss={() => (popoverOpened = false)}
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

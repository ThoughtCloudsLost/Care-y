<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { Check } from "@lucide/svelte";
  import { RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";

  interface RolePopoverProps {
    readonly opened: boolean;
    readonly target: HTMLElement | undefined;
    readonly currentRoleId: string;
    readonly placement?: "top" | "bottom";
    readonly ondismiss: () => void;
    readonly onselect: (roleId: RoleIdValue) => void;
  }

  let {
    opened,
    target,
    currentRoleId,
    placement,
    ondismiss,
    onselect,
  }: RolePopoverProps = $props();

  const roles: readonly { id: RoleIdValue; label: () => string }[] = [
    { id: RoleId.VOLUNTEER, label: () => m.admin_role_volunteer() },
    { id: RoleId.MANAGER, label: () => m.admin_role_manager() },
    { id: RoleId.ADMIN, label: () => m.admin_role_admin() },
  ];

  function handleSelect(roleId: RoleIdValue): void {
    if (roleId !== currentRoleId) {
      onselect(roleId);
    }
    ondismiss();
  }
</script>

<ShellPopover {opened} {ondismiss} {target} {placement}>
  <List nested class="role-popover-list">
    {#each roles as role (role.id)}
      <ListItem
        title={role.label()}
        onclick={() => handleSelect(role.id)}
        aria-current={role.id === currentRoleId ? "true" : undefined}
      >
        {#snippet after()}
          {#if role.id === currentRoleId}
            <Check size={18} class="text-[--brand-text]" aria-hidden="true" />
          {/if}
        {/snippet}
      </ListItem>
    {/each}
  </List>
</ShellPopover>

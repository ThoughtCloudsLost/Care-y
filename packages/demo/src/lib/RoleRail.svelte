<script lang="ts">
  /**
   * Account-switcher buttons for the three demo roles. Each renders a
   * circular avatar icon (CircleUserRound) with a per-role accent ring.
   * Chrome (background, border) is provided by the parent sidebar bar;
   * this component is layout-less and renders only the buttons.
   */

  import * as m from "$lib/paraglide/messages.js";
  import { CircleUserRound } from "@lucide/svelte";
  import { RoleId, type RoleIdValue } from "@care-y/shared";

  interface Props {
    /** Currently active role from the bridge snapshot. */
    activeRole: RoleIdValue;
    /** Called when the visitor picks a role. */
    onrolechange: (role: RoleIdValue) => void;
  }

  let { activeRole, onrolechange }: Props = $props();

  interface RoleOption {
    readonly id: RoleIdValue;
    readonly label: () => string;
    readonly tooltip: () => string;
    /** CSS custom property value for the role's accent color. */
    readonly accent: string;
  }

  const roles: readonly RoleOption[] = [
    {
      id: RoleId.ADMIN,
      label: () => m.demo_role_admin_label(),
      tooltip: () => m.demo_role_admin_tooltip(),
      accent: "#ff453a",
    },
    {
      id: RoleId.MANAGER,
      label: () => m.demo_role_manager_label(),
      tooltip: () => m.demo_role_manager_tooltip(),
      accent: "#ff9f0a",
    },
    {
      id: RoleId.VOLUNTEER,
      label: () => m.demo_role_volunteer_label(),
      tooltip: () => m.demo_role_volunteer_tooltip(),
      accent: "#30d158",
    },
  ];
</script>

{#each roles as role (role.id)}
  <button
    class="role-avatar"
    class:role-avatar-active={activeRole === role.id}
    type="button"
    onclick={() => onrolechange(role.id)}
    aria-label={role.label()}
    aria-pressed={activeRole === role.id}
    title={role.tooltip()}
    style:--role-accent={role.accent}
  >
    <span class="role-avatar-ring">
      <CircleUserRound size={22} />
    </span>
  </button>
{/each}

<style>
  .role-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    min-height: 44px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #98989d;
    cursor: pointer;
    transition: background 0.15s ease;
    padding: 0;
  }

  .role-avatar:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .role-avatar-ring {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--role-accent);
    transition: box-shadow 0.15s ease;
  }

  /* Selected state: blue wash background (consistent with toolbar active)
     plus a glow on the accent ring. Icon color shifts to match the active
     toolbar treatment. */
  .role-avatar-active {
    background: rgba(0, 122, 255, 0.2);
    color: #64d2ff;
  }

  .role-avatar-active:hover {
    background: rgba(0, 122, 255, 0.25);
  }

  .role-avatar-active .role-avatar-ring {
    box-shadow: 0 0 6px var(--role-accent);
  }
</style>

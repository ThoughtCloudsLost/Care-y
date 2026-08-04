<script lang="ts">
  /**
   * Account-switcher buttons for the three demo roles. Each renders a
   * brand-hued identity seal (the same stamp anatomy CARE-Y uses in the
   * product) carrying the role's localized initial. The selected role is
   * distinguished by ink weight (filled background + stronger ring), not
   * by hue: all three seals are brand-colored.
   *
   * The chrome bar is permanently dark (#1a1a1a), so the seal tokens are
   * pinned to the dark-scheme brand values to keep legibility regardless
   * of the outer page's light/dark state.
   */

  import * as m from "$lib/paraglide/messages.js";
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
    readonly initial: () => string;
  }

  const roles: readonly RoleOption[] = [
    {
      id: RoleId.ADMIN,
      label: () => m.demo_role_admin_label(),
      tooltip: () => m.demo_role_admin_tooltip(),
      initial: () => m.demo_role_admin_initial(),
    },
    {
      id: RoleId.MANAGER,
      label: () => m.demo_role_manager_label(),
      tooltip: () => m.demo_role_manager_tooltip(),
      initial: () => m.demo_role_manager_initial(),
    },
    {
      id: RoleId.VOLUNTEER,
      label: () => m.demo_role_volunteer_label(),
      tooltip: () => m.demo_role_volunteer_tooltip(),
      initial: () => m.demo_role_volunteer_initial(),
    },
  ];
</script>

{#each roles as role (role.id)}
  <button
    class="role-seal-btn"
    class:role-seal-btn--active={activeRole === role.id}
    type="button"
    onclick={() => onrolechange(role.id)}
    aria-label={role.label()}
    aria-pressed={activeRole === role.id}
    title={role.tooltip()}
  >
    <span
      class="identity-seal role-seal"
      class:role-seal--active={activeRole === role.id}
    >
      {role.initial()}
    </span>
  </button>
{/each}

<style>
  /* 44x44 touch target with the 34px seal centered inside. */
  .role-seal-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    min-height: 44px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s ease;
    padding: 0;
  }

  .role-seal-btn:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  /* Pin seal ink to dark-scheme brand values so it reads on #1a1a1a
     chrome regardless of the outer page theme. The product's default
     dark brand-text is #a89b80 and brand-fill is #6e6553. */
  .role-seal {
    --brand-text: #a89b80;
    --brand-fill: #6e6553;
    color: var(--brand-text);
  }

  /* Selected state: filled brand-soft background + stronger ring,
     matching the product's identity semantics (distinguish by ink
     weight, never by hue). */
  .role-seal--active {
    background: color-mix(in srgb, var(--brand-fill) 20%, transparent);
    border-color: color-mix(in srgb, var(--brand-fill) 80%, transparent);
    outline-color: color-mix(in srgb, var(--brand-fill) 50%, transparent);
    opacity: 1;
  }

  .role-seal-btn--active:hover {
    background: rgba(255, 255, 255, 0.12);
  }
</style>

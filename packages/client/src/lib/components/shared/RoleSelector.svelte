<script lang="ts">
  import { Segmented, SegmentedButton } from "konsta/svelte";
  import { RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";

  interface RoleSelectorProps {
    readonly selectedRole: RoleIdValue;
    readonly onselect: (role: RoleIdValue) => void;
    readonly includeAdmin?: boolean;
  }

  let {
    selectedRole,
    onselect,
    includeAdmin = true,
  }: RoleSelectorProps = $props();
</script>

<div class="role-section">
  <p class="section-label">
    {m.admin_invite_role_label()}
  </p>
  <Segmented strong>
    <SegmentedButton
      active={selectedRole === RoleId.VOLUNTEER}
      onclick={() => onselect(RoleId.VOLUNTEER)}
    >
      {m.admin_role_volunteer(withTerms())}
    </SegmentedButton>
    <SegmentedButton
      active={selectedRole === RoleId.MANAGER}
      onclick={() => onselect(RoleId.MANAGER)}
    >
      {m.admin_role_manager(withTerms())}
    </SegmentedButton>
    {#if includeAdmin}
      <SegmentedButton
        active={selectedRole === RoleId.ADMIN}
        onclick={() => onselect(RoleId.ADMIN)}
      >
        {m.admin_role_admin()}
      </SegmentedButton>
    {/if}
  </Segmented>
</div>

<style>
  .role-section {
    display: flex;
    flex-direction: column;
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin: 0 0 var(--space-sm);
  }
</style>

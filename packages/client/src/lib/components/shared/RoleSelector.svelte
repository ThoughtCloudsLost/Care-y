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
  <p class="field-label">
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
  /* The label wears the shared .field-label primitive (shared.css) */
  .role-section {
    display: flex;
    flex-direction: column;
  }
</style>

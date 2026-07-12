<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { inviteKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import RoleSelector from "$lib/components/shared/RoleSelector.svelte";
  import InviteLinkResult from "$lib/components/shared/InviteLinkResult.svelte";

  interface InviteLinkSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
  }

  let { opened, ondismiss }: InviteLinkSheetProps = $props();

  const onboarding = requireRouter(trpc.onboarding, "onboarding");
  const queryClient = useQueryClient();

  interface GeneratedInvite {
    url: string;
    expiresAt: string;
  }

  let selectedRole = $state<RoleIdValue>(RoleId.VOLUNTEER);
  let generatedInvites = $state<GeneratedInvite[]>([]);
  let error = $state("");

  const generateMut = createMutation(() => ({
    mutationFn: async (input: { roleId: RoleIdValue }) =>
      onboarding.generateInvite.mutate(input),
    onSuccess: (data) => {
      haptic();
      generatedInvites = [
        ...generatedInvites,
        {
          url: data.inviteUrl,
          expiresAt: data.expiresAt,
        },
      ];
      error = "";
      void queryClient.invalidateQueries({ queryKey: inviteKeys.pending() });
      toastStore.show(m.admin_invite_link_generated());
      announceToLiveRegion("polite", m.admin_invite_link_generated());
    },
    onError: () => {
      error = m.admin_invite_link_error();
      toastStore.show(m.admin_invite_link_error(), 3000);
      announceToLiveRegion("assertive", m.admin_invite_link_error());
    },
  }));

  function handleGenerate(): void {
    error = "";
    generateMut.mutate({ roleId: selectedRole });
  }

  async function handleCopy(url: string): Promise<void> {
    const fullUrl = `${window.location.origin}${url}`;
    await navigator.clipboard.writeText(fullUrl);
    haptic();
    toastStore.show(m.admin_invite_link_copied());
  }

  function handleDismiss(): void {
    generatedInvites = [];
    error = "";
    selectedRole = RoleId.VOLUNTEER;
    ondismiss();
  }
</script>

<ShellSheet
  {opened}
  ondismiss={handleDismiss}
  title={m.admin_invite_link_title()}
  ariaLabel={m.admin_invite_link_title()}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleGenerate} disabled={generateMut.isPending}>
      {#if generateMut.isPending}
        {m.common_loading()}
      {:else}
        {m.admin_invite_link_generate()}
      {/if}
    </SoftButton>
  {/snippet}

  <div class="sheet-content">
    <p class="subtext">{m.admin_invite_link_subtext()}</p>

    {#if error}
      <p class="error-msg" role="alert">{error}</p>
    {/if}

    <RoleSelector
      {selectedRole}
      onselect={(r: RoleIdValue) => (selectedRole = r)}
    />

    {#if generatedInvites.length > 0}
      <InviteLinkResult
        invites={generatedInvites}
        oncopy={(url: string) => void handleCopy(url)}
      />
    {/if}
  </div>
</ShellSheet>

<style>
  .sheet-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0 var(--space-lg) var(--space-lg);
  }

  .subtext {
    font-size: 0.875rem;
    color: var(--muted);
    margin: 0;
  }

  .error-msg {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--danger, var(--color-red-500));
    margin: 0;
  }
</style>

<script lang="ts">
  import {
    List,
    ListInput,
    Button,
    Segmented,
    SegmentedButton,
    Preloader,
  } from "konsta/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { inviteKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

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

  function formatExpiry(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString();
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
    {#if generatedInvites.length > 0}
      <SoftButton onclick={handleDismiss}>
        {m.admin_invite_link_done()}
      </SoftButton>
    {/if}
  {/snippet}

  <div class="sheet-content">
    <p class="subtext">{m.admin_invite_link_subtext()}</p>

    {#if error}
      <p class="error-msg" role="alert">{error}</p>
    {/if}

    <div class="role-section">
      <p class="section-label">
        {m.admin_invite_link_role_label()}
      </p>
      <Segmented strong>
        <SegmentedButton
          active={selectedRole === RoleId.VOLUNTEER}
          onclick={() => (selectedRole = RoleId.VOLUNTEER)}
        >
          {m.admin_role_volunteer(withTerms())}
        </SegmentedButton>
        <SegmentedButton
          active={selectedRole === RoleId.MANAGER}
          onclick={() => (selectedRole = RoleId.MANAGER)}
        >
          {m.admin_role_manager(withTerms())}
        </SegmentedButton>
        <SegmentedButton
          active={selectedRole === RoleId.ADMIN}
          onclick={() => (selectedRole = RoleId.ADMIN)}
        >
          {m.admin_role_admin()}
        </SegmentedButton>
      </Segmented>
    </div>

    <Button large disabled={generateMut.isPending} onclick={handleGenerate}>
      {#if generateMut.isPending}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.admin_invite_link_generate()}
      {/if}
    </Button>

    {#if generatedInvites.length > 0}
      {#each generatedInvites as invite, i (invite.url)}
        <div
          class="invite-card"
          role="group"
          aria-label={m.admin_invite_link_card_label({ index: String(i + 1) })}
        >
          <p class="invite-label">{m.admin_invite_link_url_label()}</p>
          <code class="invite-url">{window.location.origin}{invite.url}</code>
          <p class="invite-expires">
            {m.admin_invite_link_expires({
              expiresAt: formatExpiry(invite.expiresAt),
            })}
          </p>
          <Button small outline onclick={() => void handleCopy(invite.url)}>
            {m.admin_invite_link_copy()}
          </Button>
        </div>
      {/each}

      <Button
        large
        outline
        disabled={generateMut.isPending}
        onclick={handleGenerate}
      >
        {#if generateMut.isPending}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.admin_invite_link_another()}
        {/if}
      </Button>
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
    color: var(--color-red-500);
    margin: 0;
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin: 0 0 var(--space-sm);
  }

  .invite-card {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
    border-radius: 12px;
    padding: var(--space-md);
  }

  .invite-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin: 0 0 var(--space-sm);
  }

  .invite-url {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    font-size: 0.75rem;
    color: var(--ink);
    word-break: break-all;
    user-select: all;
    display: block;
    margin-bottom: var(--space-sm);
  }

  .invite-expires {
    font-size: 0.8125rem;
    color: var(--muted);
    margin: 0 0 var(--space-md);
  }
</style>

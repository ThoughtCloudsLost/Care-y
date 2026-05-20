<!--
  SetupInvite: onboarding step 8 (add team members).

  Reuses UsersSection from admin/people to display a unified list of
  pending invite links and manually created users. OnboardingCryptoBridge
  provides the contexts UsersSection needs that the onboarding layout
  does not supply (OrgDecryptCache, identity, tabbar override).

  Trigger buttons open UsersSection's built-in InviteLinkSheet and
  InviteUser sheets via exported methods.
-->
<script lang="ts">
  import { Block, BlockTitle, Preloader } from "konsta/svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { haptic } from "$lib/utils/haptic.js";
  import OnboardingCryptoBridge from "$lib/providers/OnboardingCryptoBridge.svelte";
  import UsersSection from "$lib/components/admin/UsersSection.svelte";

  interface Props {
    adminUserId: string;
    oncomplete: (data: { invitesSent: number }) => void;
  }

  let { adminUserId, oncomplete }: Props = $props();

  let finishing = $state(false);
  let usersSectionRef = $state<UsersSection>();

  /* eslint-disable @typescript-eslint/no-unsafe-assignment -- bind:this ref exposes exported functions as any */
  const hasInvites = $derived.by((): boolean => {
    const active: number = usersSectionRef?.activeCount() ?? 0;
    const pending: number = usersSectionRef?.pendingInviteCount() ?? 0;
    return active > 1 || pending > 0;
  });
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */

  function handleFinish(): void {
    finishing = true;
    haptic();
    /* eslint-disable @typescript-eslint/no-unsafe-assignment -- bind:this ref */
    const active: number = usersSectionRef?.activeCount() ?? 1;
    const pending: number = usersSectionRef?.pendingInviteCount() ?? 0;
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    oncomplete({ invitesSent: active - 1 + pending });
  }

  function handleSkip(): void {
    handleFinish();
  }
</script>

<BlockTitle medium>{m.onboarding_invite_heading(withTerms())}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_invite_subtext()}</p>
</Block>

<Block>
  <div class="action-buttons">
    <SoftButton
      full
      onclick={() => {
        usersSectionRef?.openInviteLink();
      }}
      disabled={finishing}
    >
      {m.admin_invite_link_generate()}
    </SoftButton>
    <SoftButton
      full
      onclick={() => {
        usersSectionRef?.openInvite();
      }}
      disabled={finishing}
    >
      {m.admin_invite_menu_manual()}
    </SoftButton>
  </div>
</Block>

<OnboardingCryptoBridge {adminUserId}>
  <UsersSection bind:this={usersSectionRef} />
</OnboardingCryptoBridge>

{#if hasInvites}
  <Block>
    <SoftButton full disabled={finishing} onclick={handleFinish}>
      {#if finishing}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.onboarding_invite_finish()}
      {/if}
    </SoftButton>
  </Block>
{:else}
  <Block>
    <button
      class="skip-link touch-feedback"
      onclick={handleSkip}
      disabled={finishing}
      type="button"
    >
      {m.onboarding_invite_skip(withTerms())}
    </button>
  </Block>
{/if}

<style>
  .action-buttons {
    display: flex;
    gap: var(--space-md);
  }

  .skip-link {
    background: none;
    border: none;
    color: var(--brand-primary);
    font-size: var(--text-base);
    cursor: pointer;
    padding: var(--space-lg) 0;
    text-align: center;
    width: 100%;
  }

  .skip-link:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

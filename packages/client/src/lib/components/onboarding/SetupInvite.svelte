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
  import { Button, Block, BlockTitle, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import OnboardingCryptoBridge from "$lib/providers/OnboardingCryptoBridge.svelte";
  import UsersSection from "$lib/components/admin/UsersSection.svelte";

  interface Props {
    adminUserId: string;
    oncomplete: (data: { invitesSent: number }) => void;
  }

  let { adminUserId, oncomplete }: Props = $props();

  const onboarding = requireRouter(trpc.onboarding, "onboarding");

  let finishing = $state(false);
  let error = $state("");
  let usersSectionRef = $state<UsersSection>();

  /* eslint-disable @typescript-eslint/no-unsafe-assignment -- bind:this ref exposes exported functions as any */
  const hasInvites = $derived.by((): boolean => {
    const active: number = usersSectionRef?.activeCount() ?? 0;
    const pending: number = usersSectionRef?.pendingInviteCount() ?? 0;
    return active > 1 || pending > 0;
  });
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */

  async function handleFinish(): Promise<void> {
    finishing = true;
    error = "";
    try {
      await onboarding.completeSetup.mutate();
      haptic();
      /* eslint-disable @typescript-eslint/no-unsafe-assignment -- bind:this ref */
      const active: number = usersSectionRef?.activeCount() ?? 1;
      const pending: number = usersSectionRef?.pendingInviteCount() ?? 0;
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      oncomplete({ invitesSent: active - 1 + pending });
    } catch {
      error = m.admin_invite_link_error();
      toastStore.show(m.admin_invite_link_error(), 3000);
      announceToLiveRegion("assertive", m.admin_invite_link_error());
    } finally {
      finishing = false;
    }
  }

  function handleSkip(): void {
    void handleFinish();
  }
</script>

<BlockTitle medium>{m.onboarding_invite_heading(withTerms())}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_invite_subtext()}</p>
</Block>

{#if error}
  <Block>
    <p class="step-error" role="alert">{error}</p>
  </Block>
{/if}

<Block>
  <div class="action-buttons">
    <Button
      large
      onclick={() => {
        usersSectionRef?.openInviteLink();
      }}
      disabled={finishing}
    >
      {m.admin_invite_link_generate()}
    </Button>
    <Button
      large
      outline
      onclick={() => {
        usersSectionRef?.openInvite();
      }}
      disabled={finishing}
    >
      {m.admin_invite_menu_manual()}
    </Button>
  </div>
</Block>

<OnboardingCryptoBridge {adminUserId}>
  <UsersSection bind:this={usersSectionRef} />
</OnboardingCryptoBridge>

{#if hasInvites}
  <Block>
    <Button
      large
      outline
      disabled={finishing}
      onclick={() => void handleFinish()}
    >
      {#if finishing}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.onboarding_invite_finish()}
      {/if}
    </Button>
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

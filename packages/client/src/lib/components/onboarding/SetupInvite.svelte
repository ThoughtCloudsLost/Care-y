<!--
  SetupInvite: wizard step 7 (invite volunteers).

  Generates single-use invite links via onboarding.generateInvite.
  Each link is displayed for manual copying. The admin can generate
  multiple invites or skip to finish setup.
-->
<script lang="ts">
  import {
    List,
    ListInput,
    Button,
    Block,
    BlockTitle,
    Preloader,
  } from "konsta/svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { RoleId, ROLE_ID_VALUES, type RoleIdValue } from "@care-y/shared";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RouterNotAvailableError } from "$lib/errors.js";

  interface Props {
    oncomplete: (data: { invitesSent: number }) => void;
  }

  let { oncomplete }: Props = $props();

  if (!trpc.onboarding) {
    throw new RouterNotAvailableError("onboarding");
  }
  const onboarding: NonNullable<typeof trpc.onboarding> = trpc.onboarding;

  interface GeneratedInvite {
    url: string;
    expiresAt: string;
  }

  let selectedRole = $state<RoleIdValue>(RoleId.VOLUNTEER);
  let generatedInvites = $state<GeneratedInvite[]>([]);
  let error = $state("");
  let finishing = $state(false);

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
      toastStore.show(m.onboarding_invite_generated());
      announceToLiveRegion("polite", m.onboarding_invite_generated());
    },
    onError: () => {
      error = m.onboarding_invite_error();
      toastStore.show(m.onboarding_invite_error(), 3000);
      announceToLiveRegion("assertive", m.onboarding_invite_error());
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
    toastStore.show(m.onboarding_invite_copied());
  }

  async function handleFinish(): Promise<void> {
    finishing = true;
    try {
      await onboarding.completeSetup.mutate();
      haptic();
      oncomplete({ invitesSent: generatedInvites.length });
    } catch {
      error = m.onboarding_invite_error();
      toastStore.show(m.onboarding_invite_error(), 3000);
    } finally {
      finishing = false;
    }
  }

  function handleSkip(): void {
    void handleFinish();
  }

  function formatExpiry(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString();
  }
</script>

<BlockTitle medium>{m.onboarding_invite_heading()}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_invite_subtext()}</p>
</Block>

{#if error}
  <Block>
    <p class="step-error" role="alert">{error}</p>
  </Block>
{/if}

<List strong inset>
  <ListInput
    outline
    label={m.onboarding_invite_role_label()}
    type="select"
    dropdown
    value={selectedRole}
    onChange={(e: Event) => {
      if (e.target instanceof HTMLSelectElement) {
        const val = e.target.value;
        const found = ROLE_ID_VALUES.find((r) => r === val);
        if (found) selectedRole = found;
      }
    }}
    disabled={generateMut.isPending}
  >
    {#snippet input()}
      <select value={selectedRole}>
        <option value={RoleId.VOLUNTEER}>{m.role_volunteer()}</option>
        <option value={RoleId.MANAGER}>{m.role_manager()}</option>
      </select>
    {/snippet}
  </ListInput>
</List>

<Block>
  <Button
    large
    disabled={generateMut.isPending || finishing}
    onclick={handleGenerate}
  >
    {#if generateMut.isPending}
      <Preloader class="w-5 h-5" />
    {:else}
      {m.onboarding_invite_generate()}
    {/if}
  </Button>
</Block>

{#if generatedInvites.length > 0}
  <Block>
    {#each generatedInvites as invite, i (invite.url)}
      <div
        class="card-elevated invite-card"
        role="group"
        aria-label={m.onboarding_invite_card_label({ index: String(i + 1) })}
      >
        <p class="invite-label">{m.onboarding_invite_url_label()}</p>
        <code class="invite-url">{window.location.origin}{invite.url}</code>
        <p class="invite-expires">
          {m.onboarding_invite_expires({
            expiresAt: formatExpiry(invite.expiresAt),
          })}
        </p>
        <Button
          small
          outline
          onclick={() => void handleCopy(invite.url)}
          class="copy-btn"
        >
          {m.onboarding_invite_copy()}
        </Button>
      </div>
    {/each}
  </Block>

  <Block>
    <div class="finish-buttons">
      <Button
        large
        disabled={generateMut.isPending || finishing}
        onclick={handleGenerate}
      >
        {m.onboarding_invite_another()}
      </Button>
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
    </div>
  </Block>
{:else}
  <Block>
    <button
      class="skip-link touch-feedback"
      onclick={handleSkip}
      disabled={finishing}
      type="button"
    >
      {m.onboarding_invite_skip()}
    </button>
  </Block>
{/if}

<style>
  .invite-card {
    padding: var(--card-pad-y) var(--card-pad-x);
    margin-bottom: var(--space-lg);
  }

  .invite-label {
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0 0 var(--space-sm);
  }

  .invite-url {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    font-size: var(--text-xs);
    color: var(--ink);
    word-break: break-all;
    user-select: all;
    display: block;
    margin-bottom: var(--space-sm);
  }

  .invite-expires {
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0 0 var(--space-lg);
  }

  .finish-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
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

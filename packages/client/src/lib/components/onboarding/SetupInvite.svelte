<script lang="ts">
  import {
    List,
    ListInput,
    Button,
    Block,
    BlockTitle,
    Segmented,
    SegmentedButton,
    Preloader,
  } from "konsta/svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { RoleId, PASSWORD_MIN_LENGTH } from "@care-y/shared";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import PasswordStrengthMeter from "$lib/components/inputs/PasswordStrengthMeter.svelte";
  import type { RoleIdValue } from "@care-y/shared";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { generateRandomIdentifier } from "$lib/utils/random-identifier.js";
  import RoleSelector from "$lib/components/shared/RoleSelector.svelte";
  import InviteLinkResult from "$lib/components/shared/InviteLinkResult.svelte";

  interface Props {
    oncomplete: (data: { invitesSent: number }) => void;
  }

  let { oncomplete }: Props = $props();

  const onboarding = requireRouter(trpc.onboarding, "onboarding");
  const authRouter = trpc.auth;
  const orgKeyManager = getOrgKeyManager();

  type TabId = "link" | "create";
  let activeTab = $state<TabId>("link");

  // --- Shared state ---
  let finishing = $state(false);
  let inviteCount = $state(0);

  // --- Link tab state ---
  interface GeneratedInvite {
    url: string;
    expiresAt: string;
  }

  let linkRole = $state<RoleIdValue>(RoleId.VOLUNTEER);
  let generatedInvites = $state<GeneratedInvite[]>([]);
  let linkError = $state("");

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
      linkError = "";
      inviteCount++;
      toastStore.show(m.admin_invite_link_generated());
      announceToLiveRegion("polite", m.admin_invite_link_generated());
    },
    onError: () => {
      linkError = m.admin_invite_link_error();
      toastStore.show(m.admin_invite_link_error(), 3000);
      announceToLiveRegion("assertive", m.admin_invite_link_error());
    },
  }));

  function handleGenerate(): void {
    linkError = "";
    generateMut.mutate({ roleId: linkRole });
  }

  async function handleCopy(url: string): Promise<void> {
    const fullUrl = `${window.location.origin}${url}`;
    await navigator.clipboard.writeText(fullUrl);
    haptic();
    toastStore.show(m.admin_invite_link_copied());
  }

  // --- Create tab state ---
  let createRole = $state<RoleIdValue>(RoleId.VOLUNTEER);
  let identifier = $state(generateRandomIdentifier());
  let displayName = $state("");
  let tempPassword = $state("");
  let showCredentialConfirmation = $state(false);
  let showPassword = $state(false);
  let savedIdentifier = $state("");
  let savedPassword = $state("");

  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);

  const passwordTooShort = $derived(
    tempPassword.length > 0 && tempPassword.length < PASSWORD_MIN_LENGTH,
  );

  const registerMutation = createMutation(() => ({
    mutationFn: async (input: {
      identifier: string;
      password: string;
      displayName: string;
      roleId: RoleIdValue;
    }) => authRouter.register.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_invite_success());
      announceToLiveRegion("polite", m.admin_invite_success());
      inviteCount++;
      showCredentialConfirmation = true;
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const canSubmitCreate = $derived(
    orgKeyLoaded &&
      identifier.trim().length >= 3 &&
      displayName.trim().length > 0 &&
      tempPassword.length >= PASSWORD_MIN_LENGTH &&
      !registerMutation.isPending,
  );

  function handleCreateSubmit(): void {
    if (!canSubmitCreate) return;

    savedIdentifier = identifier.trim();
    savedPassword = tempPassword;

    registerMutation.mutate({
      identifier: savedIdentifier,
      password: tempPassword,
      displayName: displayName.trim(),
      roleId: createRole,
    });
  }

  function handleCredentialDone(): void {
    showCredentialConfirmation = false;
    showPassword = false;
    savedIdentifier = "";
    savedPassword = "";
    identifier = generateRandomIdentifier();
    displayName = "";
    tempPassword = "";
  }

  // --- Wizard flow ---
  async function handleFinish(): Promise<void> {
    finishing = true;
    try {
      await onboarding.completeSetup.mutate();
      haptic();
      oncomplete({ invitesSent: inviteCount });
    } catch {
      linkError = m.admin_invite_link_error();
      toastStore.show(m.admin_invite_link_error(), 3000);
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

{#if !showCredentialConfirmation}
  <Block>
    <Segmented strong>
      <SegmentedButton
        active={activeTab === "link"}
        onclick={() => (activeTab = "link")}
      >
        {m.admin_invite_menu_link()}
      </SegmentedButton>
      <SegmentedButton
        active={activeTab === "create"}
        onclick={() => (activeTab = "create")}
      >
        {m.admin_invite_menu_manual()}
      </SegmentedButton>
    </Segmented>
  </Block>
{/if}

{#if activeTab === "link" && !showCredentialConfirmation}
  {#if linkError}
    <Block>
      <p class="step-error" role="alert">{linkError}</p>
    </Block>
  {/if}

  <Block>
    <RoleSelector
      selectedRole={linkRole}
      onselect={(r: RoleIdValue) => (linkRole = r)}
    />
  </Block>

  <Block>
    <Button
      large
      disabled={generateMut.isPending || finishing}
      onclick={handleGenerate}
    >
      {#if generateMut.isPending}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.admin_invite_link_generate()}
      {/if}
    </Button>
  </Block>

  {#if generatedInvites.length > 0}
    <Block>
      <InviteLinkResult
        invites={generatedInvites}
        oncopy={(url: string) => void handleCopy(url)}
      />
    </Block>

    <Block>
      <div class="finish-buttons">
        <Button
          large
          disabled={generateMut.isPending || finishing}
          onclick={handleGenerate}
        >
          {m.admin_invite_link_another()}
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
        {m.onboarding_invite_skip(withTerms())}
      </button>
    </Block>
  {/if}
{:else if activeTab === "create" && !showCredentialConfirmation}
  {#if !orgKeyLoaded}
    <Block>
      <p class="org-key-warning" role="alert">
        {m.admin_invite_no_org_key()}
      </p>
    </Block>
  {/if}

  <List strong inset>
    <ListInput
      outline
      label={m.admin_invite_identifier_label()}
      type="text"
      value={identifier}
      oninput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) identifier = e.target.value;
      }}
      disabled={!orgKeyLoaded}
      info={m.admin_invite_identifier_hint()}
    />
  </List>

  <Block>
    <p class="pii-warning" role="note">
      {m.admin_invite_identifier_pii_warning()}
    </p>
  </Block>

  <List strong inset>
    <ListInput
      outline
      label={m.admin_invite_display_name_label()}
      type="text"
      value={displayName}
      oninput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) displayName = e.target.value;
      }}
      disabled={!orgKeyLoaded}
      info={m.admin_invite_display_name_hint()}
    />
  </List>

  <List strong inset>
    <PasswordInput
      outline
      label={m.admin_invite_password_label()}
      bind:value={tempPassword}
      disabled={!orgKeyLoaded}
      info={passwordTooShort
        ? m.admin_invite_password_too_short()
        : m.admin_invite_password_hint(withTerms())}
    />
  </List>

  {#if tempPassword.length > 0}
    <Block>
      <PasswordStrengthMeter
        password={tempPassword}
        minLength={PASSWORD_MIN_LENGTH}
      />
    </Block>
  {/if}

  <Block>
    <RoleSelector
      selectedRole={createRole}
      onselect={(r: RoleIdValue) => (createRole = r)}
    />
  </Block>

  <Block>
    <Button
      large
      disabled={!canSubmitCreate || finishing}
      onclick={handleCreateSubmit}
    >
      {#if registerMutation.isPending}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.admin_invite_send()}
      {/if}
    </Button>
  </Block>

  {#if inviteCount === 0}
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
  {:else}
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
  {/if}
{:else if showCredentialConfirmation}
  <Block>
    <div class="credential-section">
      <p class="credential-instructions">
        {m.admin_invite_credential_instructions(withTerms())}
      </p>

      <div class="credential-card">
        <div class="credential-row">
          <span class="credential-label">
            {m.admin_invite_credential_identifier()}
          </span>
          <span class="credential-value">{savedIdentifier}</span>
        </div>
        <div class="credential-divider"></div>
        <div class="credential-row">
          <span class="credential-label">
            {m.admin_invite_credential_password()}
          </span>
          <span class="credential-value">
            {#if showPassword}
              {savedPassword}
            {:else}
              {"•".repeat(Math.min(savedPassword.length, 20))}
            {/if}
          </span>
          <button
            type="button"
            class="show-toggle"
            onclick={() => (showPassword = !showPassword)}
            aria-label={showPassword
              ? m.admin_invite_credential_hide()
              : m.admin_invite_credential_show()}
          >
            {showPassword
              ? m.admin_invite_credential_hide()
              : m.admin_invite_credential_show()}
          </button>
        </div>
      </div>

      <div class="finish-buttons">
        <Button large onclick={handleCredentialDone}>
          {m.admin_invite_credential_done()}
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
    </div>
  </Block>
{/if}

<style>
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

  .pii-warning {
    font-size: 0.8125rem;
    color: var(--color-amber-500);
    background: color-mix(in srgb, var(--color-amber-500) 10%, transparent);
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    margin: 0;
  }

  .org-key-warning {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-amber-500);
    margin: 0;
  }

  .credential-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .credential-instructions {
    font-size: 0.875rem;
    color: var(--muted);
    margin: 0;
    text-align: center;
  }

  .credential-card {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
    border-radius: 12px;
    padding: 0 var(--space-md);
  }

  .credential-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) 0;
  }

  .credential-divider {
    height: 1px;
    background: var(--surface-2, rgba(255, 255, 255, 0.08));
  }

  .credential-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    min-width: 5.5rem;
  }

  .credential-value {
    flex: 1;
    font-size: 0.9375rem;
    font-family: ui-monospace, monospace;
    color: var(--ink);
  }

  .show-toggle {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--brand-text);
    background: none;
    border: none;
    padding: var(--space-xs, 4px) var(--space-sm);
    cursor: pointer;
  }
</style>

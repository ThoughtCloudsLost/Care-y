<script lang="ts">
  import {
    List,
    ListInput,
    Block,
    Button,
    Segmented,
    SegmentedButton,
  } from "konsta/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { RoleId } from "@care-y/shared";
  import type { RoleIdValue } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { generateRandomIdentifier } from "$lib/utils/random-identifier.js";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";

  interface InviteUserProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
  }

  let { opened, ondismiss }: InviteUserProps = $props();

  const authRouter = trpc.auth;
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();

  let identifier = $state(generateRandomIdentifier());
  let displayName = $state("");
  let tempPassword = $state("");
  let selectedRole = $state<RoleIdValue>(RoleId.VOLUNTEER);
  let showCredentialConfirmation = $state(false);
  let showPassword = $state(false);

  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const identifierLooksLikeEmail = $derived(EMAIL_PATTERN.test(identifier));
  const identifierHasSpaces = $derived(identifier.includes(" "));
  const showIdentifierWarning = $derived(
    identifierLooksLikeEmail || identifierHasSpaces,
  );

  const passwordTooShort = $derived(
    tempPassword.length > 0 && tempPassword.length < 16,
  );

  // Credentials saved for the one-time confirmation display
  let savedIdentifier = $state("");
  let savedPassword = $state("");

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
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      showCredentialConfirmation = true;
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const canSubmit = $derived(
    orgKeyLoaded &&
      identifier.trim().length >= 3 &&
      displayName.trim().length > 0 &&
      tempPassword.length >= 16 &&
      !registerMutation.isPending,
  );

  function handleSubmit(): void {
    if (!canSubmit) return;

    savedIdentifier = identifier.trim();
    savedPassword = tempPassword;

    registerMutation.mutate({
      identifier: savedIdentifier,
      password: tempPassword,
      displayName: displayName.trim(),
      roleId: selectedRole,
    });
  }

  function handleDone(): void {
    showCredentialConfirmation = false;
    showPassword = false;
    savedIdentifier = "";
    savedPassword = "";
    resetForm();
    ondismiss();
  }

  function resetForm(): void {
    identifier = generateRandomIdentifier();
    displayName = "";
    tempPassword = "";
    selectedRole = RoleId.VOLUNTEER;
  }

  function handleDismiss(): void {
    if (showCredentialConfirmation) {
      handleDone();
      return;
    }
    resetForm();
    ondismiss();
  }
</script>

<ShellPopup {opened} ondismiss={handleDismiss} title={m.admin_invite_title()}>
  {#if showCredentialConfirmation}
    <Block class="text-center">
      <p class="text-lg font-semibold text-[--ink]">
        {m.admin_invite_credential_title()}
      </p>
      <p class="mt-[--space-sm] text-sm text-[--muted]">
        {m.admin_invite_credential_instructions()}
      </p>
    </Block>

    <Block class="credential-card">
      <div class="credential-row">
        <span class="credential-label"
          >{m.admin_invite_credential_identifier()}</span
        >
        <span class="credential-value">{savedIdentifier}</span>
      </div>
      <div class="credential-divider"></div>
      <div class="credential-row">
        <span class="credential-label"
          >{m.admin_invite_credential_password()}</span
        >
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
    </Block>

    <Block>
      <Button onclick={handleDone}>
        {m.admin_invite_credential_done()}
      </Button>
    </Block>
  {:else}
    {#if !orgKeyLoaded}
      <Block>
        <p class="text-sm text-[--color-amber-500] font-medium" role="alert">
          {m.admin_invite_no_org_key()}
        </p>
      </Block>
    {/if}

    <List>
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

    {#if showIdentifierWarning}
      <Block>
        <p class="pii-warning" role="alert">
          {m.admin_invite_identifier_pii_warning()}
        </p>
      </Block>
    {/if}

    <List>
      <ListInput
        outline
        label={m.admin_invite_display_name_label()}
        type="text"
        value={displayName}
        oninput={(e: Event) => {
          if (e.target instanceof HTMLInputElement)
            displayName = e.target.value;
        }}
        disabled={!orgKeyLoaded}
        info={m.admin_invite_display_name_hint()}
      />
    </List>

    <List>
      <ListInput
        outline
        label={m.admin_invite_password_label()}
        type="password"
        value={tempPassword}
        oninput={(e: Event) => {
          if (e.target instanceof HTMLInputElement)
            tempPassword = e.target.value;
        }}
        disabled={!orgKeyLoaded}
        info={passwordTooShort
          ? m.admin_invite_password_too_short()
          : m.admin_invite_password_hint()}
      />
    </List>

    <Block>
      <p
        class="text-xs font-semibold uppercase tracking-wide text-[--muted] mb-[--space-sm]"
      >
        {m.admin_invite_role_label()}
      </p>
      <Segmented strong>
        <SegmentedButton
          active={selectedRole === RoleId.VOLUNTEER}
          onclick={() => (selectedRole = RoleId.VOLUNTEER)}
        >
          {m.admin_role_volunteer()}
        </SegmentedButton>
        <SegmentedButton
          active={selectedRole === RoleId.MANAGER}
          onclick={() => (selectedRole = RoleId.MANAGER)}
        >
          {m.admin_role_manager()}
        </SegmentedButton>
        <SegmentedButton
          active={selectedRole === RoleId.ADMIN}
          onclick={() => (selectedRole = RoleId.ADMIN)}
        >
          {m.admin_role_admin()}
        </SegmentedButton>
      </Segmented>
    </Block>

    <Block>
      <Button onclick={handleSubmit} disabled={!canSubmit}>
        {#if registerMutation.isPending}
          {m.common_loading()}
        {:else}
          {m.admin_invite_send()}
        {/if}
      </Button>
    </Block>
  {/if}
</ShellPopup>

<style>
  .pii-warning {
    font-size: 0.8125rem;
    color: var(--color-amber-500);
    background: color-mix(in srgb, var(--color-amber-500) 10%, transparent);
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    margin: 0;
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

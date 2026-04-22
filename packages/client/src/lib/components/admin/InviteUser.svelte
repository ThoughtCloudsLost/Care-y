<script lang="ts">
  import {
    List,
    ListInput,
    Button,
    Segmented,
    SegmentedButton,
  } from "konsta/svelte";
  import { Save } from "@lucide/svelte";
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
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/SoftButton.svelte";

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

<ShellSheet
  {opened}
  ondismiss={handleDismiss}
  title={showCredentialConfirmation
    ? m.admin_invite_credential_title()
    : m.admin_invite_title()}
  ariaLabel={m.admin_invite_title()}
>
  {#snippet headerRight()}
    {#if !showCredentialConfirmation}
      <SoftButton onclick={handleSubmit} disabled={!canSubmit}>
        {#if registerMutation.isPending}
          {m.common_loading()}
        {:else}
          <Save size={16} aria-hidden="true" />
          {m.admin_invite_send()}
        {/if}
      </SoftButton>
    {/if}
  {/snippet}

  {#if showCredentialConfirmation}
    <div class="sheet-content">
      <div class="credential-intro">
        <p class="credential-instructions">
          {m.admin_invite_credential_instructions()}
        </p>
      </div>

      <div class="credential-card">
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
      </div>

      <Button onclick={handleDone}>
        {m.admin_invite_credential_done()}
      </Button>
    </div>
  {:else}
    <div class="sheet-content">
      {#if !orgKeyLoaded}
        <p class="org-key-warning" role="alert">
          {m.admin_invite_no_org_key()}
        </p>
      {/if}

      <List nested>
        <ListInput
          outline
          label={m.admin_invite_identifier_label()}
          type="text"
          value={identifier}
          oninput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              identifier = e.target.value;
          }}
          disabled={!orgKeyLoaded}
          info={m.admin_invite_identifier_hint()}
        />
      </List>

      <p class="pii-warning" role="note">
        {m.admin_invite_identifier_pii_warning()}
      </p>

      <List nested>
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

      <List nested>
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

      <div class="role-section">
        <p class="section-label">
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
      </div>
    </div>
  {/if}
</ShellSheet>

<style>
  .sheet-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0 var(--space-lg) var(--space-lg);
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

  .section-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    margin: 0 0 var(--space-sm);
  }

  .credential-intro {
    text-align: center;
  }

  .credential-instructions {
    font-size: 0.875rem;
    color: var(--muted);
    margin: 0;
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

<script lang="ts">
  import { List, ListInput, Button, Block } from "konsta/svelte";
  import Register from "$lib/components/Register.svelte";
  import { Save } from "@lucide/svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { adminKeys } from "$lib/query/keys.js";
  import { PASSWORD_MIN_LENGTH, RoleId } from "@care-y/shared";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import PasswordStrengthMeter from "$lib/components/inputs/PasswordStrengthMeter.svelte";
  import type { RoleIdValue } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager, getCryptoBridge } from "$lib/crypto/context.js";
  import { adminBootstrapUserCrypto } from "$lib/auth/admin-bootstrap-crypto.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { generateRandomIdentifier } from "$lib/utils/random-identifier.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import RoleSelector from "$lib/components/shared/RoleSelector.svelte";

  interface InviteUserProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
  }

  let { opened, ondismiss }: InviteUserProps = $props();

  const authRouter = trpc.auth;
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const bridge = getCryptoBridge();

  let identifier = $state(generateRandomIdentifier());
  let displayName = $state("");
  let tempPassword = $state("");
  let confirmPassword = $state("");
  let selectedRole = $state<RoleIdValue>(RoleId.VOLUNTEER);
  let showCredentialConfirmation = $state(false);
  let showPassword = $state(false);

  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);

  const passwordTooShort = $derived(
    tempPassword.length > 0 && tempPassword.length < PASSWORD_MIN_LENGTH,
  );

  const passwordsMatch = $derived(tempPassword === confirmPassword);
  const confirmError = $derived(
    confirmPassword.length > 0 && !passwordsMatch
      ? m.admin_invite_password_mismatch()
      : undefined,
  );

  let savedIdentifier = $state("");
  let savedPassword = $state("");
  let isSubmitting = $state(false);
  let cryptoStatus = $state<string>("");

  const canSubmit = $derived(
    orgKeyLoaded &&
      identifier.trim().length >= 3 &&
      displayName.trim().length > 0 &&
      tempPassword.length >= 16 &&
      passwordsMatch &&
      confirmPassword.length > 0 &&
      !isSubmitting,
  );

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) return;

    savedIdentifier = identifier.trim().toLowerCase();
    savedPassword = tempPassword;
    isSubmitting = true;
    cryptoStatus = "";

    try {
      const result = await authRouter.register.mutate({
        identifier: savedIdentifier,
        password: tempPassword,
        displayName: displayName.trim(),
        roleId: selectedRole,
      });

      cryptoStatus = m.admin_invite_crypto_deriving();

      await adminBootstrapUserCrypto(result.user.id, tempPassword, bridge, {
        onDeriveStart: () => {
          cryptoStatus = m.admin_invite_crypto_deriving();
        },
        onDeriveComplete: () => {
          cryptoStatus = m.admin_invite_crypto_wrapping();
        },
        onWrapStart: () => {
          cryptoStatus = m.admin_invite_crypto_wrapping();
        },
        onComplete: () => {
          cryptoStatus = m.admin_invite_crypto_complete();
        },
      });

      haptic();
      toastStore.show(m.admin_invite_success());
      announceToLiveRegion("polite", m.admin_invite_success());
      void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      showCredentialConfirmation = true;
    } catch (err: unknown) {
      if (cryptoStatus !== "") {
        toastStore.show(m.admin_invite_crypto_error());
      } else {
        toastStore.show(m.error_generic());
      }
      if (import.meta.env.DEV) {
        console.warn("[InviteUser] creation failed:", err);
      }
    } finally {
      isSubmitting = false;
      cryptoStatus = "";
    }
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
    confirmPassword = "";
    selectedRole = RoleId.VOLUNTEER;
  }

  function handleDismiss(): void {
    if (isSubmitting) return;
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
      <SoftButton onclick={() => void handleSubmit()} disabled={!canSubmit}>
        {#if isSubmitting}
          {cryptoStatus || m.common_loading()}
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
          {m.admin_invite_credential_instructions(withTerms())}
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
        <Register kind="careful" role="alert">
          {m.admin_invite_no_org_key()}
        </Register>
      {/if}

      <RoleSelector
        {selectedRole}
        onselect={(r: RoleIdValue) => (selectedRole = r)}
      />

      <List nested>
        <ListInput
          label={m.user_field_login_username_label()}
          type="text"
          value={identifier}
          oninput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              identifier = e.target.value;
          }}
          disabled={!orgKeyLoaded}
          autocapitalize="none"
          autocorrect="off"
          autocomplete="off"
          info={m.admin_invite_identifier_hint()}
        />
      </List>

      <Register kind="careful">
        {m.user_field_login_username_pii_warning()}
      </Register>

      <List nested>
        <ListInput
          label={m.user_field_display_name_label()}
          type="text"
          value={displayName}
          oninput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              displayName = e.target.value;
          }}
          disabled={!orgKeyLoaded}
          info={m.user_field_display_name_e2e_hint()}
        />
      </List>

      <List nested>
        <PasswordInput
          label={m.admin_invite_password_label()}
          bind:value={tempPassword}
          disabled={!orgKeyLoaded}
          info={passwordTooShort
            ? m.admin_invite_password_too_short()
            : m.admin_invite_password_hint(withTerms())}
        />
        <PasswordInput
          label={m.admin_invite_confirm_password()}
          bind:value={confirmPassword}
          disabled={!orgKeyLoaded}
          error={confirmError}
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

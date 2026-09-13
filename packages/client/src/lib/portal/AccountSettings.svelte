<!--
  Account settings body: the change-password form.

  Rendered as the contents of a ShellSheet opened from the client drawer,
  which owns the title, the dismiss affordance, and the focus trap. This
  component is the form and nothing else; it carries no disclosure of its
  own. Sign out lives in the drawer beside the entry that opens this sheet.

  Change password flow: current password + new pair, derivation via the
  OPRF pipeline, re-encrypt copies, mutation. History-loss-on-reset
  warning text.
-->
<script lang="ts">
  import { Block, Button, List } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import PasswordConfirmPair from "$lib/components/inputs/PasswordConfirmPair.svelte";

  interface AccountSettingsProps {
    /** Called with current + new password when the user submits. */
    onchangepassword: (currentPassword: string, newPassword: string) => void;
    /** Whether the change-password derivation is in progress. */
    pending: boolean;
    /** Error message from the last change-password attempt. */
    errorMessage?: string;
  }

  let { onchangepassword, pending, errorMessage }: AccountSettingsProps =
    $props();

  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmNewPassword = $state("");

  // PasswordConfirmPair owns showing the mismatch; submit gating still
  // needs to know about it.
  const newPasswordLongEnough = $derived(newPassword.length >= 8);

  const canSubmit = $derived(
    currentPassword.length > 0 &&
      newPasswordLongEnough &&
      newPassword === confirmNewPassword &&
      !pending,
  );

  function handleSubmit(): void {
    if (!canSubmit) return;
    onchangepassword(currentPassword, newPassword);
  }

  // Focus error when it appears
  $effect(() => {
    if (errorMessage !== undefined && errorMessage !== "") {
      const el = document.getElementById("account-settings-error");
      el?.focus();
    }
  });
</script>

<div class="settings-section" data-testid="account-settings">
  <Block>
    <p class="settings-heading">{m.account_change_password()}</p>

    <List nested>
      <PasswordInput
        label={m.account_change_current()}
        placeholder={m.account_change_current()}
        bind:value={currentPassword}
        autocomplete="current-password"
        disabled={pending}
      />
    </List>
    <PasswordConfirmPair
      bind:password={newPassword}
      bind:confirm={confirmNewPassword}
      passwordLabel={m.account_new_password()}
      passwordPlaceholder={m.account_new_password()}
      confirmLabel={m.account_confirm_new_password()}
      confirmPlaceholder={m.account_confirm_new_password()}
      mismatchError={m.account_create_mismatch()}
      passwordInfo={m.account_create_password_hint()}
      autocomplete="new-password"
      minLength={8}
      disabled={pending}
    />

    {#if errorMessage}
      <p
        id="account-settings-error"
        class="settings-error"
        tabindex="-1"
        data-testid="account-settings-error"
      >
        {errorMessage}
      </p>
    {/if}

    <div class="settings-action">
      <Button
        large
        disabled={!canSubmit}
        onclick={handleSubmit}
        data-testid="account-change-submit"
      >
        {#if pending}
          <span
            role="progressbar"
            aria-label={m.account_unlocking()}
            class="settings-progress"
          ></span>
          {m.account_unlocking()}
        {:else}
          {m.account_change_password()}
        {/if}
      </Button>
    </div>

    <div class="settings-warning">
      <p class="settings-warning-text">
        {m.account_change_reset_warning()}
      </p>
    </div>
  </Block>
</div>

<style>
  .settings-heading {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
    margin-bottom: var(--space-sm);
  }

  .settings-error {
    font-size: var(--text-sm);
    color: var(--danger);
    margin-top: var(--space-sm);
    outline: none;
  }

  .settings-action {
    margin-top: var(--space-lg);
  }

  .settings-warning {
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    background: var(--careful-bg, rgba(234, 179, 8, 0.08));
  }

  .settings-warning-text {
    font-size: var(--text-sm);
    color: var(--careful-text, var(--ink));
    line-height: 1.5;
    margin: 0;
  }

  .settings-progress {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .settings-progress {
      animation: none;
      opacity: 0.5;
    }
  }
</style>

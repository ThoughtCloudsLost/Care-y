<!--
  Account settings section (collapsible disclosure).
  Change password flow: current password + new pair, derivation via
  the OPRF pipeline, re-encrypt copies, mutation. Logout button.
  History-loss-on-reset warning text.
-->
<script lang="ts">
  import { Block, Button, List, ListInput } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface AccountSettingsProps {
    /** Called with current + new password when the user submits. */
    onchangepassword: (currentPassword: string, newPassword: string) => void;
    /** Called when the user taps Sign out. */
    onlogout: () => void;
    /** Whether the change-password derivation is in progress. */
    pending: boolean;
    /** Error message from the last change-password attempt. */
    errorMessage?: string;
  }

  let {
    onchangepassword,
    onlogout,
    pending,
    errorMessage,
  }: AccountSettingsProps = $props();

  let expanded = $state(false);
  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmNewPassword = $state("");

  const passwordsMatch = $derived(
    newPassword.length === 0 ||
      confirmNewPassword.length === 0 ||
      newPassword === confirmNewPassword,
  );
  const newPasswordLongEnough = $derived(newPassword.length >= 8);
  const showMismatch = $derived(
    confirmNewPassword.length > 0 && newPassword.length > 0 && !passwordsMatch,
  );

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

  function toggleExpanded(): void {
    expanded = !expanded;
  }

  // Focus first field when expanded
  $effect(() => {
    if (expanded) {
      const el = document.getElementById("account-current-password");
      el?.focus();
    }
  });

  // Focus error when it appears
  $effect(() => {
    if (errorMessage !== undefined && errorMessage !== "") {
      const el = document.getElementById("account-settings-error");
      el?.focus();
    }
  });
</script>

<div class="settings-section">
  <button
    type="button"
    class="settings-toggle"
    aria-expanded={expanded}
    onclick={toggleExpanded}
    data-testid="account-settings-toggle"
  >
    <span class="settings-toggle-icon">{expanded ? "▾" : "▸"}</span>
    {m.account_settings_title()}
  </button>

  {#if expanded}
    <Block>
      <p class="settings-heading">{m.account_change_password()}</p>

      <List strong inset class="settings-list">
        <ListInput
          type="password"
          inputId="account-current-password"
          placeholder={m.account_change_current()}
          value={currentPassword}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              currentPassword = e.target.value;
          }}
          disabled={pending}
          data-testid="account-current-password"
        >
          {#snippet label()}
            <span class="sr-only">{m.account_change_current()}</span>
          {/snippet}
        </ListInput>
        <ListInput
          type="password"
          inputId="account-new-password"
          placeholder={m.account_new_password()}
          value={newPassword}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              newPassword = e.target.value;
          }}
          disabled={pending}
          data-testid="account-new-password"
        >
          {#snippet label()}
            <span class="sr-only">{m.account_new_password()}</span>
          {/snippet}
        </ListInput>
        <ListInput
          type="password"
          inputId="account-confirm-new-password"
          placeholder={m.account_confirm_new_password()}
          value={confirmNewPassword}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              confirmNewPassword = e.target.value;
          }}
          disabled={pending}
          data-testid="account-confirm-new-password"
        >
          {#snippet label()}
            <span class="sr-only">{m.account_confirm_new_password()}</span>
          {/snippet}
        </ListInput>
      </List>

      {#if showMismatch}
        <p class="settings-mismatch" data-testid="settings-mismatch">
          {m.account_create_mismatch()}
        </p>
      {/if}

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

      <div class="settings-logout">
        <Button
          outline
          onclick={onlogout}
          disabled={pending}
          data-testid="account-logout"
        >
          {m.account_logout()}
        </Button>
      </div>
    </Block>
  {/if}
</div>

<style>
  .settings-section {
    margin-top: var(--space-md);
  }

  .settings-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 44px;
    padding: var(--space-sm) var(--page-pad-x, 16px);
    background: none;
    border: none;
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    text-align: left;
  }

  .settings-toggle:active {
    opacity: 0.6;
  }

  .settings-toggle-icon {
    font-size: 0.75em;
    color: var(--muted);
  }

  .settings-heading {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
    margin-bottom: var(--space-sm);
  }

  :global(.settings-list) {
    margin: 0 !important;
  }

  .settings-mismatch {
    font-size: var(--text-sm);
    color: var(--danger);
    margin-top: var(--space-xs);
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

  .settings-logout {
    margin-top: var(--space-lg);
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

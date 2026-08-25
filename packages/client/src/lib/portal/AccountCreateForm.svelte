<!--
  Account creation form.
  Username + password pair + both warnings (history-loss, password-loss).
  Used by the upgrade card and later by intake.
  Visually-hidden labels via the sr-only snippet technique.
  Paste allowed (WCAG 3.3.8). Min 8 chars. Inline mismatch error.
  Progressbar during Argon2id/OPRF derivation. Submit locking.
-->
<script lang="ts">
  import { Block, Button, List, ListInput } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface AccountCreateFormProps {
    /** Called with username + password when the user submits. */
    onsubmit: (username: string, password: string) => void;
    /** Whether derivation is in progress. */
    pending: boolean;
    /** Optional error message (e.g. username taken). */
    errorMessage?: string;
    /** Whether to show the "this link stops working" note (upgrade mode). */
    showLinkNote?: boolean;
    /** Submit button label override. Defaults to account_create_submit. */
    submitLabel?: string;
  }

  let {
    onsubmit,
    pending,
    errorMessage,
    showLinkNote = false,
    submitLabel,
  }: AccountCreateFormProps = $props();

  let username = $state("");
  let password = $state("");
  let confirmPassword = $state("");

  const passwordsMatch = $derived(
    password.length === 0 ||
      confirmPassword.length === 0 ||
      password === confirmPassword,
  );
  const passwordLongEnough = $derived(password.length >= 8);
  const showMismatch = $derived(
    confirmPassword.length > 0 && password.length > 0 && !passwordsMatch,
  );

  const canSubmit = $derived(
    username.trim().length >= 3 &&
      passwordLongEnough &&
      password === confirmPassword &&
      !pending,
  );

  function handleSubmit(): void {
    if (!canSubmit) return;
    onsubmit(username, password);
  }

  // Focus error when it appears
  $effect(() => {
    if (errorMessage !== undefined && errorMessage !== "") {
      const el = document.getElementById("account-create-error");
      el?.focus();
    }
  });
</script>

<Block>
  <List strong inset class="create-list">
    <ListInput
      type="text"
      inputId="account-create-username"
      placeholder={m.account_login_username()}
      value={username}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) username = e.target.value;
      }}
      disabled={pending}
      autocomplete="off"
      data-testid="account-create-username"
    >
      {#snippet label()}
        <span class="sr-only">{m.account_login_username()}</span>
      {/snippet}
    </ListInput>
    <ListInput
      type="password"
      inputId="account-create-password"
      placeholder={m.account_login_password()}
      value={password}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) password = e.target.value;
      }}
      disabled={pending}
      data-testid="account-create-password"
    >
      {#snippet label()}
        <span class="sr-only">{m.account_login_password()}</span>
      {/snippet}
    </ListInput>
    <ListInput
      type="password"
      inputId="account-create-confirm"
      placeholder={m.account_create_confirm()}
      value={confirmPassword}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement)
          confirmPassword = e.target.value;
      }}
      disabled={pending}
      data-testid="account-create-confirm"
    >
      {#snippet label()}
        <span class="sr-only">{m.account_create_confirm()}</span>
      {/snippet}
    </ListInput>
  </List>

  {#if showMismatch}
    <p class="create-mismatch" data-testid="account-mismatch">
      {m.account_create_mismatch()}
    </p>
  {/if}

  {#if errorMessage}
    <p
      id="account-create-error"
      class="create-error"
      tabindex="-1"
      data-testid="account-create-error"
    >
      {errorMessage}
    </p>
  {/if}

  <p class="create-hint">{m.account_create_username_hint()}</p>
  <p class="create-hint">{m.account_create_password_hint()}</p>

  {#if showLinkNote}
    <p class="create-link-note" data-testid="upgrade-link-note">
      {m.account_upgrade_link_note()}
    </p>
  {/if}

  <div class="create-warnings">
    <p class="create-warning" data-testid="warning-password">
      {m.account_create_warning_password()}
    </p>
    <p class="create-warning" data-testid="warning-reset">
      {m.account_create_warning_reset()}
    </p>
  </div>

  <div class="create-action">
    <Button
      large
      disabled={!canSubmit}
      onclick={handleSubmit}
      data-testid="account-create-submit"
    >
      {#if pending}
        <span
          role="progressbar"
          aria-label={m.account_unlocking()}
          class="create-progress"
        ></span>
        {m.account_unlocking()}
      {:else}
        {submitLabel ?? m.account_create_submit()}
      {/if}
    </Button>
  </div>
</Block>

<style>
  :global(.create-list) {
    margin: 0 !important;
  }

  .create-hint {
    font-size: var(--text-sm);
    color: var(--muted);
    margin-top: var(--space-sm);
    line-height: 1.5;
  }

  .create-link-note {
    font-size: var(--text-sm);
    color: var(--muted);
    margin-top: var(--space-sm);
    line-height: 1.5;
    font-style: italic;
  }

  .create-mismatch {
    font-size: var(--text-sm);
    color: var(--danger);
    margin-top: var(--space-xs);
  }

  .create-error {
    font-size: var(--text-sm);
    color: var(--danger);
    margin-top: var(--space-sm);
    outline: none;
  }

  .create-warnings {
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    background: var(--careful-bg, rgba(234, 179, 8, 0.08));
  }

  .create-warning {
    font-size: var(--text-sm);
    color: var(--careful-text, var(--ink));
    line-height: 1.5;
    margin: 0;
  }

  .create-warning + .create-warning {
    margin-top: var(--space-xs);
  }

  .create-action {
    margin-top: var(--space-lg);
  }

  .create-progress {
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
    .create-progress {
      animation: none;
      opacity: 0.5;
    }
  }
</style>

<!--
  Account login form.
  Username + password with visually-hidden labels (sr-only snippet technique),
  paste allowed (WCAG 3.3.8), one generic failure message for every cause.
  Progressbar with role="progressbar" and i18n label during Argon2id/OPRF.
  QuickExit stays enabled throughout derivation.
-->
<script lang="ts">
  import { Block, BlockTitle, Button, List, ListInput } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface AccountLoginFormProps {
    /** Called with username + password when the user submits. */
    onsubmit: (username: string, password: string) => void;
    /** Whether derivation/login is in progress. */
    pending: boolean;
    /** Whether the last attempt failed (generic message). */
    error: boolean;
    /** Optional signed-out message (idle timeout, pagehide). */
    signedOutMessage?: string;
  }

  let { onsubmit, pending, error, signedOutMessage }: AccountLoginFormProps =
    $props();

  let username = $state("");
  let password = $state("");

  const canSubmit = $derived(
    username.trim().length > 0 && password.length > 0 && !pending,
  );

  function handleSubmit(): void {
    if (!canSubmit) return;
    onsubmit(username, password);
  }

  // Focus error text when an error appears
  $effect(() => {
    if (error) {
      const el = document.getElementById("account-login-error");
      el?.focus();
    }
  });
</script>

<BlockTitle>{m.account_title()}</BlockTitle>

<Block>
  {#if signedOutMessage}
    <p class="signed-out-note" role="status" data-testid="signed-out-note">
      {signedOutMessage}
    </p>
  {/if}

  <List strong inset class="login-list">
    <ListInput
      type="text"
      inputId="account-username"
      placeholder={m.account_login_username()}
      value={username}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) username = e.target.value;
      }}
      disabled={pending}
      autocomplete="off"
      data-testid="account-username"
    >
      {#snippet label()}
        <span class="sr-only">{m.account_login_username()}</span>
      {/snippet}
    </ListInput>
    <ListInput
      type="password"
      inputId="account-password"
      placeholder={m.account_login_password()}
      value={password}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) password = e.target.value;
      }}
      disabled={pending}
      data-testid="account-password"
    >
      {#snippet label()}
        <span class="sr-only">{m.account_login_password()}</span>
      {/snippet}
    </ListInput>
  </List>

  {#if error}
    <p
      id="account-login-error"
      class="login-error"
      tabindex="-1"
      data-testid="account-login-error"
    >
      {m.account_login_failed()}
    </p>
  {/if}

  <div class="login-action">
    <Button
      large
      disabled={!canSubmit}
      onclick={handleSubmit}
      data-testid="account-login-submit"
    >
      {#if pending}
        <span
          role="progressbar"
          aria-label={m.account_unlocking()}
          class="login-progress"
        ></span>
        {m.account_unlocking()}
      {:else}
        {m.account_login_submit()}
      {/if}
    </Button>
  </div>
</Block>

<style>
  .signed-out-note {
    font-size: var(--text-sm);
    color: var(--muted);
    margin-bottom: var(--space-md);
    line-height: 1.5;
  }

  :global(.login-list) {
    margin: 0 !important;
  }

  .login-error {
    font-size: var(--text-sm);
    color: var(--danger);
    margin-top: var(--space-sm);
    outline: none;
  }

  .login-action {
    margin-top: var(--space-lg);
  }

  .login-progress {
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
    .login-progress {
      animation: none;
      opacity: 0.5;
    }
  }
</style>

<!--
  Account login form.

  Built on the same anatomy as the volunteer login: centered AuthCard, org
  icon and name above the fields, visible field labels, a real form element
  so Enter submits, and KeyDerivation phase progress during the Argon2id
  and OPRF work.

  One generic failure message for every cause (wrong username, wrong
  password, unknown account) so the page cannot be used to test whether an
  account exists. Paste is allowed (WCAG 3.3.8).

  Quick exit stays enabled throughout derivation; it lives in the navbar,
  not here.
-->
<script lang="ts">
  import { Block, Button, List, ListInput } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import AuthCard from "$lib/components/auth/AuthCard.svelte";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import KeyDerivation from "$lib/components/onboarding/KeyDerivation.svelte";
  import type { LoginPhaseId } from "$lib/components/onboarding/login-phase.js";
  import { getLoginPhaseLabel } from "$lib/auth/login-phase-label.js";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import { getBrandingTitle } from "$lib/branding/title.svelte.js";

  interface AccountLoginFormProps {
    /** Called with username + password when the user submits. */
    onsubmit: (username: string, password: string) => void;
    /** Whether derivation/login is in progress. */
    pending: boolean;
    /** Whether the last attempt failed (generic message). */
    error: boolean;
    /** Optional signed-out message (idle timeout, pagehide). */
    signedOutMessage?: string;
    /** Current key-derivation phase, when the page reports one. */
    phase?: LoginPhaseId;
  }

  let {
    onsubmit,
    pending,
    error,
    signedOutMessage,
    phase = "idle",
  }: AccountLoginFormProps = $props();

  let username = $state("");
  let password = $state("");

  const canSubmit = $derived(
    username.trim().length > 0 && password.length > 0 && !pending,
  );

  // The page may not report phases; fall back to the derive label so the
  // progress area is never an unlabeled spinner.
  const shownPhase = $derived<LoginPhaseId>(
    pending && phase === "idle" ? "derive" : phase,
  );

  const brandingQuery = createPublicBrandingQuery();
  const branding = $derived(brandingQuery.data ?? null);
  const orgName = $derived(
    branding?.orgName !== undefined && branding.orgName !== ""
      ? branding.orgName
      : getBrandingTitle(),
  );

  function handleSubmit(e: SubmitEvent): void {
    e.preventDefault();
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

<AuthCard>
  <div class="login-header">
    {#if branding?.iconUrl}
      <img
        src={branding.iconUrl}
        alt=""
        class="login-logo"
        width="48"
        height="48"
      />
    {/if}
    <h1 class="login-org-name heading-display">{orgName}</h1>
    <p class="login-subtitle">{m.account_title()}</p>
  </div>

  {#if signedOutMessage}
    <Block role="status">
      <p class="signed-out-note" data-testid="signed-out-note">
        {signedOutMessage}
      </p>
    </Block>
  {/if}

  {#if error}
    <Block role="alert">
      <p
        id="account-login-error"
        class="login-error"
        tabindex="-1"
        data-testid="account-login-error"
      >
        {m.account_login_failed()}
      </p>
    </Block>
  {/if}

  <form onsubmit={handleSubmit}>
    <List strong inset class="login-list">
      <ListInput
        label={m.account_login_username()}
        type="text"
        inputId="account-username"
        placeholder={m.account_login_username()}
        value={username}
        onInput={(e: Event) => {
          if (e.target instanceof HTMLInputElement) username = e.target.value;
        }}
        disabled={pending}
        autocomplete="off"
        autocapitalize="none"
        data-testid="account-username"
      />
      <PasswordInput
        label={m.account_login_password()}
        placeholder={m.account_login_password()}
        bind:value={password}
        autocomplete="current-password"
        disabled={pending}
      />
    </List>

    <div class="login-action">
      <Button
        large
        type="submit"
        disabled={!canSubmit}
        data-testid="account-login-submit"
      >
        {m.account_login_submit()}
      </Button>
    </div>
  </form>

  <KeyDerivation
    phase={shownPhase}
    phaseLabel={getLoginPhaseLabel(shownPhase)}
  />
</AuthCard>

<style>
  .login-header {
    text-align: center;
    margin-bottom: var(--space-lg);
  }

  .login-logo {
    margin: 0 auto var(--space-sm);
    border-radius: 8px;
    display: block;
  }

  .login-org-name {
    font-size: var(--text-xl, 1.5rem);
    font-weight: 700;
    color: var(--ink);
    margin: 0;
  }

  .login-subtitle {
    margin-top: var(--space-xs);
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .signed-out-note {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin: 0;
  }

  :global(.login-list) {
    margin: 0 !important;
  }

  .login-error {
    font-size: var(--text-sm);
    color: var(--danger);
    margin: 0;
    outline: none;
  }

  .login-action {
    margin-top: var(--space-lg);
  }
</style>

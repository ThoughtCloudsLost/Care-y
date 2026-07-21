<!--
  WizardReauth: shared reauth form for onboarding wizards.

  When a user refreshes the browser mid-wizard, their crypto keys are
  lost from memory but their session cookie survives. This component
  re-authenticates, re-derives keys in the Worker, restores the org
  key, and calls onauthenticated so the parent page can restore the
  wizard step.
-->
<script lang="ts">
  import { Block, BlockTitle, List, ListInput, Preloader } from "konsta/svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import TwoFactorChallenge from "$lib/components/auth/TwoFactorChallenge.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { loginCrypto } from "$lib/auth/login-crypto.js";
  import { fetchAndUnwrapOrgKey } from "$lib/auth/crypto-helpers.js";
  import {
    buildLoginCallbacks,
    type PhaseUpdater,
  } from "$lib/auth/crypto-callbacks.js";
  import { installCleanupHandler } from "$lib/auth/cleanup.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { getLocale, setLocale, isLocale } from "$lib/paraglide/runtime.js";

  interface Props {
    readonly onauthenticated: (data: { hasSeenBriefing: boolean }) => void;
  }

  let { onauthenticated }: Props = $props();

  const bridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();
  const onboarding = requireRouter(trpc.onboarding, "onboarding");

  let username = $state("");
  let password = $state("");
  let error = $state("");
  let submitting = $state(false);

  let twofaRequired = $state(false);
  let twofaMethods = $state<string[]>([]);
  let encryptedLocale = $state<string | null>(null);
  let hasSeenBriefing = $state(false);

  async function loadKeys(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- reauth has no UI phases to display
    const noopPhase: PhaseUpdater = () => {};
    const result = await loginCrypto(
      username,
      password,
      bridge,
      buildLoginCallbacks(noopPhase),
    );

    if (result.orgPublicKey !== null) {
      orgKeyManager.load(result.orgPublicKey);
    } else {
      const unwrapped = await fetchAndUnwrapOrgKey(bridge);
      if (unwrapped !== null) {
        orgKeyManager.load(unwrapped);
      }
    }

    installCleanupHandler(bridge, orgKeyManager);
  }

  async function finalize(): Promise<void> {
    try {
      await loadKeys();
    } catch {
      error = m.auth_login_error();
      twofaRequired = false;
      return;
    }

    if (encryptedLocale !== null) {
      try {
        const decrypted = await bridge.orgDecrypt(encryptedLocale);
        if (isLocale(decrypted) && decrypted !== getLocale()) {
          void setLocale(decrypted, { reload: true });
        }
      } catch {
        // Non-fatal: keep current cookie locale
      }
    }

    haptic();
    onauthenticated({ hasSeenBriefing });
  }

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    error = "";
    submitting = true;

    try {
      await bridge.zeroAll();

      const result = await onboarding.reauthenticate.mutate({
        identifier: username,
        password,
      });

      encryptedLocale = result.encryptedPreferredLocale ?? null;
      hasSeenBriefing = result.hasSeenBriefing;

      if (result.requiresTwoFactor) {
        twofaMethods = result.enrolledMethods;
        twofaRequired = true;
        submitting = false;
        return;
      }

      await finalize();
    } catch {
      error = m.auth_invalid_credentials();
    } finally {
      submitting = false;
    }
  }
</script>

{#if twofaRequired}
  <Block>
    <p class="step-desc">{m.onboarding_reauth_twofa_message()}</p>
  </Block>
  <TwoFactorChallenge methods={twofaMethods} onsuccess={finalize} />
{:else}
  <BlockTitle medium>{m.onboarding_reauth_heading()}</BlockTitle>
  <Block>
    <p class="step-desc">{m.onboarding_reauth_message()}</p>
  </Block>

  {#if error}
    <Block role="alert">
      <p class="step-error">{error}</p>
    </Block>
  {/if}

  <form onsubmit={handleSubmit}>
    <List strong inset>
      <ListInput
        label={m.user_field_login_username_label()}
        type="text"
        placeholder={m.onboarding_reauth_username_placeholder()}
        bind:value={username}
        autocomplete="username"
        autocapitalize="none"
        disabled={submitting}
        required
      />
      <PasswordInput
        label={m.onboarding_account_password()}
        placeholder={m.onboarding_reauth_password_placeholder()}
        bind:value={password}
        autocomplete="current-password"
        disabled={submitting}
        required
      />
    </List>
    <Block>
      <SoftButton
        full
        type="submit"
        disabled={!username || !password || submitting}
        aria-label={submitting ? m.common_loading() : undefined}
      >
        {#if submitting}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.onboarding_firstlogin_signin()}
        {/if}
      </SoftButton>
    </Block>
  </form>
{/if}

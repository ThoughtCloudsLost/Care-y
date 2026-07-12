<!--
  SetupInviteAccount: wizard step for volunteer account creation from invite.

  Chains: registerFromInvite (server, creates user + session)
    -> registerCrypto (main thread Argon2id + OPRF + key upload)
    -> loginCrypto (Worker-based re-derivation to load keys into Worker)
    -> org key loading (existing org, no keypair generation)

  Parallels SetupAccount but without org keypair generation or
  wrapped key upload. The org already exists when a volunteer joins.
-->
<script lang="ts">
  import { tick } from "svelte";
  import { List, ListInput, Block, BlockTitle } from "konsta/svelte";
  import Register from "$lib/components/Register.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getLocale } from "$lib/paraglide/runtime.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { installCleanupHandler } from "$lib/auth/cleanup.js";
  import { registerCrypto } from "$lib/auth/register-crypto.js";
  import { loginCrypto } from "$lib/auth/login-crypto.js";
  import { fetchAndUnwrapOrgKey } from "$lib/auth/crypto-helpers.js";
  import {
    buildRegisterCallbacks,
    buildLoginCallbacks,
  } from "$lib/auth/crypto-callbacks.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { haptic } from "$lib/utils/haptic.js";
  import KeyDerivation, {
    type LoginPhaseId,
  } from "$lib/components/onboarding/KeyDerivation.svelte";
  import { PASSWORD_MIN_LENGTH, ErrorCode } from "@care-y/shared";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import PasswordStrengthMeter from "$lib/components/inputs/PasswordStrengthMeter.svelte";

  interface Props {
    token: string;
    oncomplete: (data: { userId: string; identifier: string }) => void;
  }

  let { token, oncomplete }: Props = $props();

  const bridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();

  const onboarding = requireRouter(trpc.onboarding, "onboarding");

  let identifier = $state("");
  let displayName = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  /* eslint-disable @typescript-eslint/no-unsafe-assignment -- $state<union> rune proxy */
  let phase = $state<LoginPhaseId>("idle");
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  let error = $state("");

  function getPhaseLabel(p: LoginPhaseId): string {
    switch (p) {
      case "auth":
        return m.onboarding_firstlogin_creating();
      case "argon2id":
        return m.onboarding_firstlogin_deriving();
      case "oprf":
        return m.auth_phase_oprf();
      case "pow":
        return m.auth_phase_pow();
      case "derive":
        return m.auth_phase_derive();
      default:
        return "";
    }
  }

  const phaseLabel = $derived(getPhaseLabel(phase));
  const isSubmitting = $derived(phase !== "idle" && phase !== "error");

  function checkForm(): string | null {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return m.onboarding_firstlogin_error_password_length();
    }
    // eslint-disable-next-line security/detect-possible-timing-attacks -- UI form comparison, not a credential check
    if (password !== confirmPassword) {
      return m.onboarding_firstlogin_error_password_mismatch();
    }
    return null;
  }

  const passwordTooShort = $derived(
    password.length > 0 && password.length < PASSWORD_MIN_LENGTH,
  );
  const passwordMismatch = $derived(
    confirmPassword.length > 0 && password !== confirmPassword,
  );

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const validationError = checkForm();
    if (validationError !== null) {
      error = validationError;
      announceToLiveRegion("assertive", error);
      await tick();
      document
        .querySelector(".step-error")
        ?.scrollIntoView({ behavior: "instant", block: "center" });
      return;
    }

    error = "";
    phase = "auth";

    try {
      announceToLiveRegion("polite", m.onboarding_firstlogin_creating());
      const { userId } = await onboarding.registerFromInvite.mutate({
        token,
        identifier,
        password,
        displayName: displayName || undefined,
        preferredLocale: getLocale(),
      });

      /* eslint-disable @typescript-eslint/no-unsafe-assignment -- $state<union> rune proxy */
      const setPhase = (p: LoginPhaseId): void => {
        phase = p;
      };
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */

      await registerCrypto(
        userId,
        password,
        buildRegisterCallbacks(setPhase, {
          argon2id: m.onboarding_firstlogin_deriving(),
        }),
      );

      await bridge.zeroAll();

      const loginResult = await loginCrypto(
        identifier,
        password,
        bridge,
        buildLoginCallbacks(setPhase, { derive: m.auth_phase_derive() }),
      );

      if (loginResult.orgPublicKey !== null) {
        orgKeyManager.load(loginResult.orgPublicKey);
      } else {
        const unwrapped = await fetchAndUnwrapOrgKey(bridge);
        if (unwrapped !== null) {
          orgKeyManager.load(unwrapped);
        }
      }

      installCleanupHandler(bridge, orgKeyManager);

      haptic();

      oncomplete({ userId, identifier });
    } catch (caught: unknown) {
      phase = "error";
      const code = caught instanceof Error ? caught.message : String(caught);
      if (
        code.includes("INVALID_INVITE_TOKEN") ||
        code === ErrorCode.INVALID_INVITE_TOKEN
      ) {
        error = m.onboarding_firstlogin_error_invalid_token();
      } else if (code === ErrorCode.ACCOUNT_ALREADY_EXISTS) {
        error = m.error_account_already_exists();
      } else {
        error = m.onboarding_firstlogin_error_generic();
      }
      announceToLiveRegion("assertive", error);
    }
  }
</script>

{#if isSubmitting}
  <KeyDerivation {phase} {phaseLabel} />
  <p class="helper-text">{m.onboarding_firstlogin_deriving()}</p>
{:else}
  <BlockTitle medium>{m.onboarding_firstlogin_heading()}</BlockTitle>
  <Block>
    <p class="step-desc">{m.onboarding_firstlogin_subtext()}</p>
  </Block>

  {#if error !== ""}
    <Block role="alert">
      <p class="step-error">{error}</p>
    </Block>
  {/if}

  <form onsubmit={handleSubmit}>
    <List strong inset>
      <ListInput
        label={m.user_field_login_username_label()}
        type="text"
        placeholder={m.onboarding_firstlogin_username_placeholder()}
        info={m.user_field_login_username_info()}
        bind:value={identifier}
        autocomplete="username"
        autocapitalize="none"
        required
      />
    </List>

    <Block>
      <Register kind="careful">
        {m.user_field_login_username_pii_warning()}
      </Register>
    </Block>

    <List strong inset>
      <ListInput
        label={m.user_field_display_name_label()}
        type="text"
        placeholder={m.onboarding_firstlogin_display_name_placeholder()}
        info={m.user_field_display_name_info(withTerms())}
        bind:value={displayName}
      />
      <PasswordInput
        label={m.onboarding_firstlogin_password()}
        placeholder={m.onboarding_firstlogin_password_placeholder()}
        info={m.onboarding_account_password_info()}
        bind:value={password}
        autocomplete="new-password"
        required
        error={passwordTooShort
          ? m.onboarding_firstlogin_error_password_length()
          : undefined}
      />
      <PasswordInput
        label={m.onboarding_firstlogin_confirm_password()}
        placeholder={m.onboarding_firstlogin_confirm_password_placeholder()}
        bind:value={confirmPassword}
        autocomplete="new-password"
        required
        error={passwordMismatch
          ? m.onboarding_firstlogin_error_password_mismatch()
          : undefined}
      />
    </List>

    {#if password.length > 0}
      <Block>
        <PasswordStrengthMeter {password} minLength={PASSWORD_MIN_LENGTH} />
      </Block>
    {/if}

    <Block>
      <SoftButton
        full
        type="submit"
        disabled={isSubmitting || !identifier || !password || !confirmPassword}
      >
        {m.onboarding_firstlogin_submit()}
      </SoftButton>
    </Block>
  </form>
{/if}

<style>
  .helper-text {
    text-align: center;
    font-size: var(--text-sm);
    color: var(--muted);
    margin-top: var(--space-lg);
  }
</style>

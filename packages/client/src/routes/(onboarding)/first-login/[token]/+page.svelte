<!--
  Volunteer first-login: invite link landing page.

  Three states: validating (Preloader), invalid token (error),
  valid token (registration form -> registerCrypto -> success screen).

  After success the volunteer must sign in via /login to run
  loginCrypto in the Worker for session-duration key isolation.
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    Preloader,
    List,
    ListInput,
    Button,
    Block,
    BlockTitle,
  } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { onboardingKeys } from "$lib/query/keys.js";
  import { registerCrypto } from "$lib/auth/register-crypto.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import KeyDerivation, {
    type LoginPhaseId,
  } from "$lib/components/onboarding/KeyDerivation.svelte";
  import type { RegisterCryptoCallbacks } from "$lib/auth/register-crypto.js";

  const token = $derived(page.params.token ?? "");

  if (!trpc.onboarding) {
    throw new RouterNotAvailableError("onboarding");
  }
  const onboarding: NonNullable<typeof trpc.onboarding> = trpc.onboarding;

  const inviteQuery = createQuery(() => ({
    queryKey: onboardingKeys.validateInvite(token),
    queryFn: async () => onboarding.validateInvite.query({ token }),
    retry: false,
    enabled: token.length > 0,
  }));

  let identifier = $state("");
  let displayName = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  /* eslint-disable @typescript-eslint/no-unsafe-assignment -- $state<union> rune proxy */
  let phase = $state<LoginPhaseId>("idle");
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  let error = $state("");
  let registrationComplete = $state(false);

  function getPhaseLabel(p: LoginPhaseId): string {
    switch (p) {
      case "auth":
        return m.onboarding_firstlogin_creating();
      case "argon2id":
        return m.onboarding_firstlogin_deriving();
      case "oprf":
        return m.auth_phase_oprf();
      case "derive":
        return m.auth_phase_derive();
      default:
        return "";
    }
  }

  const phaseLabel = $derived(getPhaseLabel(phase));
  const isSubmitting = $derived(phase !== "idle" && phase !== "error");

  const passwordTooShort = $derived(
    password.length > 0 && password.length < 16,
  );
  const passwordMismatch = $derived(
    confirmPassword.length > 0 && password !== confirmPassword,
  );

  function validate(): string | null {
    if (password.length < 16) {
      return m.onboarding_firstlogin_error_password_length();
    }
    // eslint-disable-next-line security/detect-possible-timing-attacks -- client-side form validation, not credential check
    if (password !== confirmPassword) {
      return m.onboarding_firstlogin_error_password_mismatch();
    }
    return null;
  }

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const validationError = validate();
    if (validationError !== null) {
      error = validationError;
      announceToLiveRegion("assertive", error);
      return;
    }

    error = "";
    phase = "auth";
    announceToLiveRegion("polite", m.onboarding_firstlogin_creating());

    try {
      const { userId } = await onboarding.registerFromInvite.mutate({
        token,
        identifier,
        password,
        displayName: displayName || undefined,
      });

      const noop = (): void => {
        /* protocol-required callback */
      };
      const callbacks: RegisterCryptoCallbacks = {
        onArgon2idStart: () => {
          phase = "argon2id";
          announceToLiveRegion("polite", m.onboarding_firstlogin_deriving());
        },
        onArgon2idDone: noop,
        onOprfStart: () => {
          phase = "oprf";
        },
        onOprfDone: noop,
        onDeriveStart: () => {
          phase = "derive";
          announceToLiveRegion("polite", m.auth_phase_derive());
        },
        onDone: noop,
        onUploadStart: noop,
      };

      await registerCrypto(userId, password, callbacks);

      phase = "done";
      registrationComplete = true;

      haptic();
      toastStore.show(m.onboarding_step_complete());
      announceToLiveRegion("polite", m.onboarding_firstlogin_success_heading());
    } catch (caught: unknown) {
      phase = "error";
      const msg = caught instanceof Error ? caught.message : String(caught);
      if (msg.includes("INVALID_INVITE_TOKEN") || msg.includes("invalid")) {
        error = m.onboarding_firstlogin_error_invalid_token();
      } else {
        error = m.onboarding_firstlogin_error_generic();
      }
      announceToLiveRegion("assertive", error);
    }
  }

  function handleSignIn(): void {
    void goto(resolve("/login"));
  }
</script>

{#if inviteQuery.isLoading}
  <Block>
    <div class="loading-container">
      <Preloader />
    </div>
  </Block>
{:else if inviteQuery.data?.valid !== true}
  <Block>
    <div class="error-container" role="alert">
      <p class="step-error">
        {m.onboarding_firstlogin_error_invalid_token()}
      </p>
    </div>
  </Block>
{:else if registrationComplete}
  <BlockTitle medium>
    {m.onboarding_firstlogin_success_heading()}
  </BlockTitle>
  <Block>
    <div class="success-container">
      <p class="step-desc">
        {m.onboarding_firstlogin_success_subtext()}
      </p>
    </div>
  </Block>
  <Block>
    <Button large onclick={handleSignIn}>
      {m.onboarding_firstlogin_signin()}
    </Button>
  </Block>
{:else if isSubmitting}
  <KeyDerivation {phase} {phaseLabel} />
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
        label={m.onboarding_firstlogin_username()}
        type="text"
        placeholder={m.onboarding_firstlogin_username_placeholder()}
        info={m.onboarding_account_username_info()}
        bind:value={identifier}
        autocomplete="username"
        autocapitalize="none"
        required
      />
      <ListInput
        label={m.onboarding_firstlogin_display_name()}
        type="text"
        placeholder={m.onboarding_firstlogin_display_name_placeholder()}
        info={m.onboarding_account_display_name_info(withTerms())}
        bind:value={displayName}
      />
      <ListInput
        label={m.onboarding_firstlogin_password()}
        type="password"
        placeholder={m.onboarding_firstlogin_password_placeholder()}
        info={m.onboarding_account_password_info()}
        bind:value={password}
        autocomplete="new-password"
        required
        error={passwordTooShort
          ? m.onboarding_firstlogin_error_password_length()
          : undefined}
      />
      <ListInput
        label={m.onboarding_firstlogin_confirm_password()}
        type="password"
        placeholder={m.onboarding_firstlogin_confirm_password_placeholder()}
        bind:value={confirmPassword}
        autocomplete="new-password"
        required
        error={passwordMismatch
          ? m.onboarding_firstlogin_error_password_mismatch()
          : undefined}
      />
    </List>

    <Block>
      <Button
        large
        type="submit"
        disabled={isSubmitting || !identifier || !password || !confirmPassword}
      >
        {m.onboarding_firstlogin_submit()}
      </Button>
    </Block>
  </form>
{/if}

<style>
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .error-container {
    text-align: center;
    padding: var(--space-2xl) 0;
  }

  .success-container {
    text-align: center;
    padding: var(--space-2xl) 0;
  }
</style>

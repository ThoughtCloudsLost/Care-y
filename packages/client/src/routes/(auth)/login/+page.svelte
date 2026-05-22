<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    List,
    ListInput,
    Button,
    Block,
    BlockTitle,
    Preloader,
  } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { onboardingKeys } from "$lib/query/keys.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { setOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import { installCleanupHandler } from "$lib/auth/cleanup.js";
  import { loginCrypto } from "$lib/auth/login-crypto.js";
  import { buildLoginCallbacks } from "$lib/auth/crypto-callbacks.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import KeyDerivation, {
    type LoginPhaseId,
  } from "$lib/components/onboarding/KeyDerivation.svelte";
  import SecurityBriefing from "$lib/components/onboarding/SecurityBriefing.svelte";
  import TwoFactorEnrollment from "$lib/components/onboarding/TwoFactorEnrollment.svelte";
  import TwoFactorChallenge from "$lib/components/auth/TwoFactorChallenge.svelte";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import LanguagePicker from "$lib/components/inputs/LanguagePicker.svelte";
  import {
    getLocale,
    setLocale,
    getTextDirection,
    type Locale,
    isLocale,
  } from "$lib/paraglide/runtime.js";

  const bridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();

  let uiLocale = $state(getLocale());

  function handleLocaleChange(locale: Locale): void {
    void setLocale(locale, { reload: false });
    document.documentElement.lang = locale;
    document.documentElement.dir = getTextDirection(locale);
    uiLocale = locale;
  }

  let identifier = $state("");
  let password = $state("");
  /* eslint-disable @typescript-eslint/no-unsafe-assignment -- $state<union> rune proxy; type is correct */
  let phase = $state<LoginPhaseId>("idle");
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  let error = $state("");

  // 2FA verification: methods list and login flags preserved across
  // the inline 2FA challenge so crypto can run after verification.
  let twofaMethods = $state<string[]>([]);
  let pendingNeedsEnrollment = $state(false);
  let pendingUserId = $state("");
  let pendingEncryptedLocale = $state<string | null>(null);
  let pendingHasSeenBriefing = $state(true);

  // Volunteer first-login enrollment recovery: shown when a volunteer
  // refreshes during their initial 2FA enrollment flow.
  let enrollmentUserId = $state("");
  let enrollmentLoading = $state(false);

  function getPhaseLabel(p: LoginPhaseId): string {
    switch (p) {
      case "auth":
        return m.auth_phase_auth();
      case "argon2id":
        return m.auth_phase_argon2id();
      case "oprf":
        return m.auth_phase_oprf();
      case "pow":
        return m.auth_phase_pow();
      case "derive":
        return m.auth_phase_derive();
      case "done":
        return m.auth_phase_done();
      default:
        return "";
    }
  }

  const phaseLabel = $derived(getPhaseLabel(phase));
  const isSubmitting = $derived(
    phase !== "briefing" &&
      phase !== "idle" &&
      phase !== "error" &&
      phase !== "twofa" &&
      phase !== "twofa-verify",
  );

  // Redirect authenticated users away from /login, unless they were
  // sent here by the recovery safety net (reauth=1 means the Worker
  // has no keys and the user needs to re-enter credentials).
  if (browser) {
    const isReauth = page.url.searchParams.get("reauth") === "1";
    if (!isReauth) {
      void trpc.auth.me
        .query()
        .then(() => {
          void goto(resolve("/"));
        })
        .catch(() => {
          // 401: expected, stay on login page
        });
    }
  }

  const statusQuery = createQuery(() => ({
    queryKey: onboardingKeys.status(),
    queryFn: async () =>
      trpc.onboarding?.getStatus.query() ?? { needsSetup: false },
    retry: false,
  }));

  const needsSetup = $derived(statusQuery.data?.needsSetup === true);
  const statusResolved = $derived(statusQuery.isSuccess || statusQuery.isError);

  $effect(() => {
    if (needsSetup) {
      void goto(resolve("/setup"));
    }
  });

  const brandingQuery = createPublicBrandingQuery();
  const branding = $derived(brandingQuery.data ?? null);
  const orgName = $derived(branding?.orgName ?? "CARE-Y");

  $effect(() => {
    if (!browser || branding === null) return;
    void applyKonstaPalette({
      primary: branding.primaryColor,
      accent: branding.accentColor ?? undefined,
    });
  });

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    error = "";
    phase = "auth";

    try {
      // 0. Reset Worker to READY if it was left in KEYED state from a
      //    previous session (e.g., onboarding completed without page reload).
      await bridge.zeroAll();

      // 1. Server-side credential verification + session cookie
      const loginResult = await trpc.auth.login.mutate({
        identifier,
        password,
      });

      pendingEncryptedLocale =
        loginResult.user.encryptedPreferredLocale ?? null;
      pendingHasSeenBriefing = loginResult.user.hasSeenBriefing;

      // 1b. 2FA: show inline challenge. Credentials stay in $state so the
      //     crypto pipeline can run after verification succeeds.
      if (loginResult.requiresTwoFactor) {
        twofaMethods = loginResult.enrolledMethods;
        pendingNeedsEnrollment = loginResult.needsEnrollment;
        pendingUserId = loginResult.user.id;
        phase = "twofa-verify";
        return;
      }

      // 2. No 2FA: run crypto pipeline immediately
      await runCryptoPipeline();

      // 3. Check enrollment recovery
      if (loginResult.needsEnrollment) {
        enrollmentUserId = loginResult.user.id;
        phase = "twofa";
        return;
      }

      await applyStoredLocale();
      await navigateOrBriefing();
    } catch (caught: unknown) {
      phase = "error";
      const msg = caught instanceof Error ? caught.message : String(caught);
      if (msg.includes("Invalid") || msg.includes("credentials")) {
        error = m.auth_invalid_credentials();
      } else {
        error = m.auth_login_error();
      }
      announceToLiveRegion("assertive", error);
    }
  }

  async function runCryptoPipeline(): Promise<void> {
    const callbacks = buildLoginCallbacks(
      (p) => {
        phase = p;
      },
      {
        argon2id: m.auth_phase_argon2id(),
        derive: m.auth_phase_derive(),
        pow: m.auth_phase_pow(),
      },
    );

    const result = await loginCrypto(identifier, password, bridge, callbacks);

    if (result.orgPublicKey !== null) {
      orgKeyManager.load(result.orgPublicKey);
      setOrgKeyReady(true);
    }

    installCleanupHandler(bridge, orgKeyManager);
  }

  async function applyStoredLocale(): Promise<void> {
    if (pendingEncryptedLocale === null) return;
    try {
      const decrypted = await bridge.orgDecrypt(pendingEncryptedLocale);
      if (!isLocale(decrypted) || decrypted === getLocale()) return;
      void setLocale(decrypted, { reload: false });
      document.documentElement.lang = decrypted;
      document.documentElement.dir = getTextDirection(decrypted);
    } catch {
      // Non-fatal: keep current cookie locale if decrypt fails
    }
  }

  async function navigateOrBriefing(): Promise<void> {
    if (!pendingHasSeenBriefing) {
      phase = "briefing";
      return;
    }
    phase = "done";
    await goto(resolve("/"));
  }

  function handleBriefingConfirm(): void {
    void trpc.profile.markBriefingSeen.mutate();
    phase = "done";
    void goto(resolve("/"));
  }

  async function handleTwofaSuccess(): Promise<void> {
    error = "";

    try {
      await runCryptoPipeline();

      // Volunteer enrollment recovery after 2FA
      if (pendingNeedsEnrollment) {
        enrollmentUserId = pendingUserId;
        phase = "twofa";
        return;
      }

      await applyStoredLocale();
      await navigateOrBriefing();
    } catch (caught: unknown) {
      phase = "error";
      const msg = caught instanceof Error ? caught.message : String(caught);
      error =
        msg.includes("Invalid") || msg.includes("credentials")
          ? m.auth_invalid_credentials()
          : m.auth_login_error();
      announceToLiveRegion("assertive", error);
    }
  }

  async function handleEnrollmentComplete(): Promise<void> {
    enrollmentLoading = true;
    try {
      await trpc.twoFactor.enroll.markVerifiedOnFirstEnrollment.mutate();
      toastStore.show(m.onboarding_step_complete());
      await goto(resolve("/"));
    } catch {
      toastStore.show(m.auth_login_error(), 3000);
      enrollmentLoading = false;
    }
  }
</script>

{#if !statusResolved || needsSetup}
  <!-- Waiting for status check, or redirecting to /setup -->
{:else if phase === "twofa-verify"}
  <!-- Inline 2FA verification (crypto runs after success) -->
  {#key uiLocale}
    <div class="text-center mb-6">
      {#if branding?.iconUrl}
        <img
          src={branding.iconUrl}
          alt=""
          class="login-logo"
          width="48"
          height="48"
        />
      {/if}
      <h1 class="text-2xl font-bold">{orgName}</h1>
      <LanguagePicker value={uiLocale} onchange={handleLocaleChange} />
    </div>
    <TwoFactorChallenge
      methods={twofaMethods}
      onsuccess={() => {
        void handleTwofaSuccess();
      }}
    />
    <div class="text-center mt-6">
      <button
        type="button"
        class="back-link"
        onclick={() => {
          phase = "idle";
          error = "";
          twofaMethods = [];
        }}
      >
        {m.twofa_back_to_login()}
      </button>
    </div>
  {/key}
{:else if phase === "briefing"}
  <SecurityBriefing onconfirm={handleBriefingConfirm} />
{:else if phase === "twofa"}
  <!-- Volunteer first-login enrollment recovery -->
  <BlockTitle medium>{m.onboarding_twofa_vol_heading()}</BlockTitle>
  <Block>
    <p class="step-desc">{m.onboarding_twofa_vol_desc()}</p>
  </Block>
  {#if enrollmentLoading}
    <Block>
      <div class="enrollment-loading">
        <Preloader />
        <p class="step-desc">{m.onboarding_twofa_securing()}</p>
      </div>
    </Block>
  {:else}
    <TwoFactorEnrollment
      username={identifier}
      onenrolled={() => {
        void handleEnrollmentComplete();
      }}
    />
  {/if}
{:else if phase !== "idle" && phase !== "error"}
  <div class="text-center mb-6">
    {#if branding?.iconUrl}
      <img
        src={branding.iconUrl}
        alt=""
        class="login-logo"
        width="48"
        height="48"
      />
    {/if}
    <h1 class="text-2xl font-bold">{orgName}</h1>
  </div>
  <KeyDerivation {phase} {phaseLabel} />
{:else}
  {#key uiLocale}
    <div class="text-center mb-6">
      {#if branding?.iconUrl}
        <img
          src={branding.iconUrl}
          alt=""
          class="login-logo"
          width="48"
          height="48"
        />
      {/if}
      <h1 class="text-2xl font-bold">{orgName}</h1>
      <p class="mt-1 text-sm opacity-60">{m.auth_sign_in_continue()}</p>
      <LanguagePicker value={uiLocale} onchange={handleLocaleChange} />
    </div>

    {#if error !== ""}
      <Block role="alert">
        <p class="step-error">{error}</p>
      </Block>
    {/if}

    <form onsubmit={handleSubmit}>
      <List strong inset>
        <ListInput
          label={m.auth_username()}
          type="text"
          placeholder={m.auth_username_placeholder()}
          bind:value={identifier}
          autocomplete="username"
          autocapitalize="none"
          required
        />
        <PasswordInput
          label={m.auth_password()}
          placeholder={m.auth_password_placeholder()}
          bind:value={password}
          autocomplete="current-password"
          required
        />
      </List>

      <div class="mt-4">
        <Button
          large
          type="submit"
          disabled={isSubmitting || !identifier || !password}
        >
          {m.auth_sign_in()}
        </Button>
      </div>
    </form>
  {/key}
{/if}

<style>
  .login-logo {
    margin: 0 auto var(--space-sm);
    border-radius: 8px;
    display: block;
  }

  .enrollment-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl) 0;
    gap: var(--space-lg);
  }

  .back-link {
    background: none;
    border: none;
    color: var(--brand-primary, var(--k-color-primary, #007aff));
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.5rem;
    min-height: 44px;
  }
</style>

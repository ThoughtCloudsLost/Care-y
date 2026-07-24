<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import { List, ListInput, Button, Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { onboardingKeys } from "$lib/query/keys.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { installCleanupHandler } from "$lib/auth/cleanup.js";
  import { loginCrypto } from "$lib/auth/login-crypto.js";
  import { isValidRedirectTarget } from "$lib/auth/redirect-target.js";
  import { registerCrypto } from "$lib/auth/register-crypto.js";
  import {
    buildLoginCallbacks,
    buildRegisterCallbacks,
  } from "$lib/auth/crypto-callbacks.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { createPublicBrandingQuery } from "$lib/branding/public-branding.js";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette.js";
  import { getBrandingTitle } from "$lib/branding/title.svelte.js";
  import KeyDerivation, {
    type LoginPhaseId,
  } from "$lib/components/onboarding/KeyDerivation.svelte";
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
  let pendingHasKeys = $state(true);
  let pendingEncryptedLocale = $state<string | null>(null);
  let pendingHasSeenBriefing = $state(true);

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
    phase !== "idle" && phase !== "error" && phase !== "twofa-verify",
  );

  // Redirect authenticated users away from /login, unless they were
  // sent here by the recovery safety net (reauth=1 means the Worker
  // has no keys and the user needs to re-enter credentials).
  // Also verify twofa_verified: a session with 2FA pending should NOT
  // redirect (it would hit TWOFA_REQUIRED on every volunteerProcedure call
  // and loop back through /2fa → /login → / indefinitely).
  if (browser) {
    const isReauth = page.url.searchParams.get("reauth") === "1";
    if (!isReauth) {
      void trpc.auth.me
        .query()
        .then((result) => {
          if (!result.twofaVerified) return;
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
  const orgName = $derived(
    branding?.orgName !== undefined && branding.orgName !== ""
      ? branding.orgName
      : getBrandingTitle(),
  );

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
      pendingHasKeys = loginResult.hasKeys;
      pendingNeedsEnrollment = loginResult.needsEnrollment;
      pendingUserId = loginResult.user.id;

      // 1b. 2FA: show inline challenge. Credentials stay in $state so the
      //     crypto pipeline can run after verification succeeds.
      if (loginResult.requiresTwoFactor) {
        twofaMethods = loginResult.enrolledMethods;
        phase = "twofa-verify";
        return;
      }

      // 2. No 2FA: run crypto pipeline immediately
      await runCryptoPipeline();
      await applyStoredLocale();
      await navigateAfterAuth();
    } catch (caught: unknown) {
      phase = "error";
      const msg = caught instanceof Error ? caught.message : String(caught);
      const lower = msg.toLowerCase();
      if (lower.includes("invalid") || lower.includes("credentials")) {
        error = m.auth_invalid_credentials();
      } else {
        error = m.auth_login_error();
      }
      announceToLiveRegion("assertive", error);
    }
  }

  async function runCryptoPipeline(): Promise<void> {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment -- $state<union> rune proxy */
    const setPhase = (p: LoginPhaseId): void => {
      phase = p;
    };
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */

    // First-time key setup for manually created users (no user_keys row).
    // Mirrors the first-login invite page: registerCrypto generates salt +
    // volPublic and uploads them, then loginCrypto re-derives in the Worker.
    if (!pendingHasKeys) {
      await registerCrypto(
        pendingUserId,
        password,
        buildRegisterCallbacks(setPhase, {
          argon2id: m.auth_phase_argon2id(),
          derive: m.auth_phase_derive(),
        }),
      );
      await bridge.zeroAll();
    }

    const loginCallbacks = buildLoginCallbacks(setPhase, {
      argon2id: m.auth_phase_argon2id(),
      derive: m.auth_phase_derive(),
      pow: m.auth_phase_pow(),
    });

    const result = await loginCrypto(
      identifier,
      password,
      bridge,
      loginCallbacks,
    );

    if (result.orgPublicKey !== null) {
      orgKeyManager.load(result.orgPublicKey);
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

  async function navigateAfterAuth(): Promise<void> {
    const needsOnboarding = !pendingHasSeenBriefing || pendingNeedsEnrollment;
    phase = "done";
    if (needsOnboarding) {
      await goto(resolve("/complete"));
      return;
    }
    // Reauth carries the interrupted route in ?next. Only same-app
    // relative paths are honored; protocol-relative URLs, control
    // characters, and non-absolute paths fall through to the dashboard.
    const next = page.url.searchParams.get("next");
    if (next !== null && isValidRedirectTarget(next)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- validated same-app relative path above
      await goto(resolve(next as `/${string}`));
      return;
    }
    await goto(resolve("/"));
  }

  async function handleTwofaSuccess(): Promise<void> {
    error = "";

    try {
      await runCryptoPipeline();
      await applyStoredLocale();
      await navigateAfterAuth();
    } catch (caught: unknown) {
      phase = "error";
      const msg = caught instanceof Error ? caught.message : String(caught);
      const lower = msg.toLowerCase();
      error =
        lower.includes("invalid") || lower.includes("credentials")
          ? m.auth_invalid_credentials()
          : m.auth_login_error();
      announceToLiveRegion("assertive", error);
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
      <h1 class="text-2xl font-bold heading-display">{orgName}</h1>
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
    <h1 class="text-2xl font-bold heading-display">{orgName}</h1>
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
      <h1 class="text-2xl font-bold heading-display">{orgName}</h1>
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

  .back-link {
    background: none;
    border: none;
    color: var(--brand-text);
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.5rem;
    min-height: 44px;
  }
</style>

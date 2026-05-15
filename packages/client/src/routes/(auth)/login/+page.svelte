<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { createQuery } from "@tanstack/svelte-query";
  import { List, ListInput, Button, Block } from "konsta/svelte";
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
  import KeyDerivation, {
    type LoginPhaseId,
  } from "$lib/components/onboarding/KeyDerivation.svelte";

  const bridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();

  let identifier = $state("");
  let password = $state("");
  /* eslint-disable @typescript-eslint/no-unsafe-assignment -- $state<union> rune proxy; type is correct */
  let phase = $state<LoginPhaseId>("idle");
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  let error = $state("");

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
  const isSubmitting = $derived(phase !== "idle" && phase !== "error");

  // Redirect authenticated users away from /login
  if (browser) {
    void trpc.auth.me
      .query()
      .then(() => {
        void goto(resolve("/"));
      })
      .catch(() => {
        // 401: expected, stay on login page
      });
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
      await trpc.auth.login.mutate({ identifier, password });

      // 2. Full crypto pipeline in the Worker
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

      // 3. Load org key if available
      if (result.orgPublicKey !== null) {
        orgKeyManager.load(result.orgPublicKey);
        setOrgKeyReady(true);
      }

      // 4. Install cleanup handler for key zeroing on unload
      installCleanupHandler(bridge, orgKeyManager);

      phase = "done";

      // 5. Navigate to app
      await goto(resolve("/"));
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
</script>

{#if !statusResolved || needsSetup}
  <!-- Waiting for status check, or redirecting to /setup -->
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
      <ListInput
        label={m.auth_password()}
        type="password"
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
{/if}

<style>
  .login-logo {
    margin: 0 auto var(--space-sm);
    border-radius: 8px;
    display: block;
  }
</style>

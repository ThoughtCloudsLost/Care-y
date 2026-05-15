<!--
  SetupAccount: wizard step 1 (admin account creation).

  Chains: bootstrapAdmin (server, creates user + session + stores org public key)
    -> registerCrypto (main thread Argon2id + OPRF + key upload)
    -> loginCrypto (Worker-based re-derivation to load keys into Worker)
    -> generateOrgKeypair + wrapKey (main thread, ECIES wrap for admin)
    -> uploadOrgPublicKey (server, stores wrapped org secret key for admin)
    -> orgKeyManager.load + setOrgKeyReady

  The loginCrypto step re-derives everything in the Worker because
  registerCrypto zeros all intermediates in its finally block.
-->
<script lang="ts">
  import { tick } from "svelte";
  import { List, ListInput, Button, Block, BlockTitle } from "konsta/svelte";
  import {
    generateOrgKeypair,
    wrapKey,
    encode,
    decode,
    toRistrettoPoint,
    getSodium,
  } from "@care-y/crypto";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { setOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
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
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import KeyDerivation, {
    type LoginPhaseId,
  } from "$lib/components/onboarding/KeyDerivation.svelte";
  import { PASSWORD_MIN_LENGTH } from "@care-y/shared";

  interface Props {
    setupToken: string;
    oncomplete: (data: { userId: string; adminVolPublic: string }) => void;
  }

  let { setupToken, oncomplete }: Props = $props();

  const bridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();

  if (!trpc.onboarding) {
    throw new Error("Onboarding router not available");
  }
  const onboarding: NonNullable<typeof trpc.onboarding> = trpc.onboarding;

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
        return m.onboarding_account_creating();
      case "argon2id":
        return m.onboarding_account_deriving();
      case "oprf":
        return m.auth_phase_oprf();
      case "pow":
        return m.auth_phase_pow();
      case "derive":
        return m.auth_phase_derive();
      case "done":
        return m.onboarding_account_setting_up();
      default:
        return "";
    }
  }

  const phaseLabel = $derived(getPhaseLabel(phase));
  const isSubmitting = $derived(phase !== "idle" && phase !== "error");

  function validate(): string | null {
    if (password.length < PASSWORD_MIN_LENGTH) {
      return m.onboarding_account_error_password_length();
    }
    // eslint-disable-next-line security/detect-possible-timing-attacks -- client-side form validation, not credential check
    if (password !== confirmPassword) {
      return m.onboarding_account_error_password_mismatch();
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
    const validationError = validate();
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

    let orgSecretKey: Uint8Array | null = null;

    try {
      await getSodium();
      // 1. Generate org keypair (Curve25519) before calling bootstrapAdmin.
      //    bootstrapAdmin needs orgPublicKey to seal the display name.
      const orgKeypair = generateOrgKeypair();
      orgSecretKey = orgKeypair.secretKey;
      const orgPublicKeyB64 = encode(orgKeypair.publicKey);

      // 2. Bootstrap admin: creates user + session + stores org public key.
      announceToLiveRegion("polite", m.onboarding_account_creating());
      const { userId } = await onboarding.bootstrapAdmin.mutate({
        identifier,
        password,
        displayName,
        orgPublicKey: orgPublicKeyB64,
        setupToken,
      });

      // 3. registerCrypto: Argon2id + OPRF + upload salt + volPublic.
      //    Runs on main thread. Zeros all intermediates in finally block.
      /* eslint-disable @typescript-eslint/no-unsafe-assignment -- $state<union> rune proxy */
      const setPhase = (p: LoginPhaseId): void => {
        phase = p;
      };
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */

      await registerCrypto(
        userId,
        password,
        buildRegisterCallbacks(setPhase, {
          argon2id: m.onboarding_account_deriving(),
        }),
      );

      // 4. loginCrypto: re-derive keys in Worker (registerCrypto zeroed them).
      //    Worker retains volPrivate and masterKey for session use.
      const loginResult = await loginCrypto(
        identifier,
        password,
        bridge,
        buildLoginCallbacks(setPhase, { derive: m.auth_phase_derive() }),
      );

      // 5. Wrap org secret key for the admin using their volPublic (ECIES).
      //    wrapKey returns EciesOutput: { ephemeralPoint, nonce, ciphertext }.
      //    Map ciphertext -> wrappedKey for the server schema.
      phase = "done";
      announceToLiveRegion("polite", m.onboarding_account_setting_up());

      const adminVolPublicBytes = decode(loginResult.volPublic);
      const adminVolPublicPoint = toRistrettoPoint(adminVolPublicBytes);
      const wrapped = wrapKey(orgSecretKey, adminVolPublicPoint);

      // 6. Upload wrapped org key for admin. bootstrapAdmin already stored
      //    the org public key in org_config; this stores the per-admin
      //    wrapped secret key in wrapped_org_keys.
      await trpc.keys.uploadOrgPublicKey.mutate({
        orgPublicKey: orgPublicKeyB64,
        ephemeralPoint: encode(wrapped.ephemeralPoint),
        nonce: encode(wrapped.nonce),
        wrappedKey: encode(wrapped.ciphertext),
      });

      // 7. Now that the wrapped key exists on the server, tell the Worker
      //    to fetch and unwrap it. loginCrypto (step 4) couldn't do this
      //    because the upload hadn't happened yet.
      const unwrappedOrgPub = await fetchAndUnwrapOrgKey(bridge);
      orgKeyManager.load(unwrappedOrgPub ?? orgPublicKeyB64);
      setOrgKeyReady(true);

      // 8. Install cleanup handler for key zeroing on unload.
      installCleanupHandler(bridge, orgKeyManager);

      haptic();
      toastStore.show(m.onboarding_step_complete());
      announceToLiveRegion("polite", m.onboarding_step_complete());

      oncomplete({ userId, adminVolPublic: loginResult.volPublic });
    } catch (caught: unknown) {
      phase = "error";
      const msg = caught instanceof Error ? caught.message : String(caught);
      if (msg.includes("ORG_ALREADY_SETUP") || msg.includes("already")) {
        error = m.onboarding_setup_already_done();
      } else {
        error = m.onboarding_account_error_generic();
      }
      announceToLiveRegion("assertive", error);
    } finally {
      if (orgSecretKey) {
        orgSecretKey.fill(0);
      }
    }
  }
</script>

{#if isSubmitting}
  <KeyDerivation {phase} {phaseLabel} />
  <p class="helper-text">{m.onboarding_account_deriving()}</p>
{:else}
  <BlockTitle medium>{m.onboarding_account_heading()}</BlockTitle>
  <Block>
    <p class="step-desc">{m.onboarding_account_subtext()}</p>
  </Block>

  {#if error !== ""}
    <Block role="alert">
      <p class="step-error">{error}</p>
    </Block>
  {/if}

  <form onsubmit={handleSubmit}>
    <List strong inset>
      <ListInput
        label={m.onboarding_account_username()}
        type="text"
        placeholder={m.onboarding_account_username_placeholder()}
        info={m.onboarding_account_username_info()}
        bind:value={identifier}
        autocomplete="username"
        autocapitalize="none"
        required
      />
      <ListInput
        label={m.onboarding_account_display_name()}
        type="text"
        placeholder={m.onboarding_account_display_name_placeholder()}
        info={m.onboarding_account_display_name_info(withTerms())}
        bind:value={displayName}
        required
      />
      <ListInput
        label={m.onboarding_account_password()}
        type="password"
        placeholder={m.onboarding_account_password_placeholder()}
        info={m.onboarding_account_password_info()}
        bind:value={password}
        autocomplete="new-password"
        required
        error={passwordTooShort
          ? m.onboarding_account_error_password_length()
          : undefined}
      />
      <ListInput
        label={m.onboarding_account_confirm_password()}
        type="password"
        placeholder={m.onboarding_account_confirm_password_placeholder()}
        bind:value={confirmPassword}
        autocomplete="new-password"
        required
        error={passwordMismatch
          ? m.onboarding_account_error_password_mismatch()
          : undefined}
      />
    </List>

    <Block>
      <Button
        large
        type="submit"
        disabled={isSubmitting ||
          !identifier ||
          !displayName ||
          !password ||
          !confirmPassword}
      >
        {m.onboarding_account_submit()}
      </Button>
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

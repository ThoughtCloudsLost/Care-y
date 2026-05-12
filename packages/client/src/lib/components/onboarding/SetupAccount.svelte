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
  import { List, ListInput, Button, Block } from "konsta/svelte";
  import {
    generateOrgKeypair,
    wrapKey,
    encode,
    decode,
    toRistrettoPoint,
    getSodium,
  } from "@care-y/crypto";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { setOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import { installCleanupHandler } from "$lib/auth/cleanup.js";
  import { registerCrypto } from "$lib/auth/register-crypto.js";
  import { loginCrypto } from "$lib/auth/login-crypto.js";
  import { solveProofOfWork } from "$lib/auth/pow-solver.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import KeyDerivation, {
    type LoginPhaseId,
  } from "$lib/components/onboarding/KeyDerivation.svelte";
  import type { RegisterCryptoCallbacks } from "$lib/auth/register-crypto.js";
  import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";

  interface Props {
    oncomplete: (data: { userId: string; adminVolPublic: string }) => void;
  }

  let { oncomplete }: Props = $props();

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
    if (password.length < 16) {
      return m.onboarding_account_error_password_length();
    }
    // eslint-disable-next-line security/detect-possible-timing-attacks -- client-side form validation, not credential check
    if (password !== confirmPassword) {
      return m.onboarding_account_error_password_mismatch();
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
      });

      // 3. registerCrypto: Argon2id + OPRF + upload salt + volPublic.
      //    Runs on main thread. Zeros all intermediates in finally block.
      const noop = (): void => {
        /* protocol-required callback */
      };
      const regCallbacks: RegisterCryptoCallbacks = {
        onArgon2idStart: () => {
          phase = "argon2id";
          announceToLiveRegion("polite", m.onboarding_account_deriving());
        },
        onArgon2idDone: noop,
        onOprfStart: () => {
          phase = "oprf";
        },
        onOprfDone: noop,
        onDeriveStart: () => {
          phase = "derive";
        },
        onDone: noop,
        onUploadStart: noop,
      };

      await registerCrypto(userId, password, regCallbacks);

      // 4. loginCrypto: re-derive keys in Worker (registerCrypto zeroed them).
      //    Worker retains volPrivate and masterKey for session use.
      const loginCallbacks: LoginCryptoCallbacks = {
        onArgon2idStart: () => {
          phase = "argon2id";
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
        onPowRequired: async (challenge, difficulty) => {
          phase = "pow";
          return solveProofOfWork(challenge, difficulty);
        },
      };

      const loginResult = await loginCrypto(
        identifier,
        password,
        bridge,
        loginCallbacks,
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

      // 7. Load org key into OrgKeyManager and signal readiness.
      if (loginResult.orgPublicKey !== null) {
        orgKeyManager.load(loginResult.orgPublicKey);
        setOrgKeyReady(true);
      }

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
  <Block>
    <h2 class="step-heading">{m.onboarding_account_heading()}</h2>
    <p class="step-subtext">{m.onboarding_account_subtext()}</p>
  </Block>

  {#if error !== ""}
    <Block role="alert" class="error-block">
      <p class="error-text">{error}</p>
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
        info={m.onboarding_account_display_name_info()}
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
      />
      <ListInput
        label={m.onboarding_account_confirm_password()}
        type="password"
        placeholder={m.onboarding_account_confirm_password_placeholder()}
        bind:value={confirmPassword}
        autocomplete="new-password"
        required
      />
    </List>

    <div class="mt-4 px-4">
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
    </div>
  </form>
{/if}

<style>
  .step-heading {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink, #1f2937);
    margin: 0 0 0.25rem;
  }

  .step-subtext {
    font-size: 0.875rem;
    color: var(--muted, #6b7280);
    margin: 0;
  }

  .error-text {
    font-size: 0.875rem;
    color: var(--error, #dc2626);
    margin: 0;
  }

  .helper-text {
    text-align: center;
    font-size: 0.75rem;
    color: var(--muted, #6b7280);
    margin-top: 0.5rem;
  }
</style>

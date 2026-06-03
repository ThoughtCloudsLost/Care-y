<script lang="ts">
  import { Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { base64urlToBuffer, bufferToBase64url } from "$lib/utils/webauthn.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface PasskeyEnrollSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly onenrolled: () => void;
    readonly username: string;
  }

  let { opened, ondismiss, onenrolled, username }: PasskeyEnrollSheetProps =
    $props();

  let registering = $state(false);
  let error = $state("");
  let wasOpen = $state(false);

  $effect(() => {
    if (opened && !wasOpen) {
      error = "";
      void startRegistration();
    }
    wasOpen = opened;
  });

  function mapWebAuthnError(err: unknown): string {
    if (!(err instanceof DOMException)) return String(err);
    switch (err.name) {
      case "NotAllowedError":
        return m.twofa_error_not_allowed();
      case "SecurityError":
        return m.twofa_error_security();
      case "InvalidStateError":
        return m.twofa_error_invalid_state();
      case "AbortError":
        return m.twofa_error_abort();
      default:
        return err.message;
    }
  }

  async function startRegistration(): Promise<void> {
    registering = true;
    error = "";
    try {
      const options = await trpc.twoFactor.enroll.webauthnOptions.mutate();

      const userIdBytes = new TextEncoder().encode(options.userId);
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64urlToBuffer(options.challenge),
        rp: { id: options.rpId, name: options.rpName },
        user: {
          id: userIdBytes,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" },
        ],
        attestation: "none",
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      });

      if (
        credential === null ||
        !("response" in credential) ||
        !("rawId" in credential)
      ) {
        error = m.twofa_error_not_allowed();
        registering = false;
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- WebAuthn API narrowing after null/shape check
      const pkc = credential as PublicKeyCredential;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- attestation response from publicKey creation flow
      const ar = pkc.response as AuthenticatorAttestationResponse;
      const attachment = pkc.authenticatorAttachment;
      const typedAttachment: "platform" | "cross-platform" | undefined =
        attachment === "platform" || attachment === "cross-platform"
          ? attachment
          : undefined;

      const publicKeyBytes = ar.getPublicKey();
      const publicKeyAlgorithm = ar.getPublicKeyAlgorithm();

      const response = {
        id: pkc.id,
        rawId: bufferToBase64url(pkc.rawId),
        type: "public-key" as const,
        authenticatorAttachment: typedAttachment,
        response: {
          clientDataJSON: bufferToBase64url(ar.clientDataJSON),
          attestationObject: bufferToBase64url(ar.attestationObject),
          authenticatorData: bufferToBase64url(ar.getAuthenticatorData()),
          publicKey: publicKeyBytes ? bufferToBase64url(publicKeyBytes) : "",
          publicKeyAlgorithm,
          transports: ar.getTransports(),
        },
      };

      const result =
        await trpc.twoFactor.enroll.webauthnVerify.mutate(response);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive guard on server response
      if (result.success) {
        haptic();
        const msg = m.twofa_method_added();
        toastStore.show(msg);
        announceToLiveRegion("polite", msg);
        onenrolled();
      }
    } catch (err: unknown) {
      error = mapWebAuthnError(err);
      announceToLiveRegion("assertive", error);
    } finally {
      registering = false;
    }
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.twofa_passkey_register()}
  title={m.twofa_passkey_register()}
>
  <div class="sheet-content">
    {#if registering}
      <div class="waiting-state" role="status" aria-live="polite">
        <Preloader class="w-8 h-8" />
        <p class="waiting-text">{m.twofa_passkey_waiting()}</p>
      </div>
    {:else if error !== ""}
      <p class="error-text" role="alert">{error}</p>
      <div class="retry-action">
        <button
          type="button"
          class="retry-btn"
          onclick={() => {
            void startRegistration();
          }}
        >
          {m.twofa_passkey_register()}
        </button>
      </div>
    {/if}
  </div>
</ShellSheet>

<style>
  .sheet-content {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
  }

  .waiting-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl) 0;
  }

  .waiting-text {
    font-size: 0.9rem;
    color: var(--muted);
  }

  .error-text {
    color: var(--k-color-red, #ef4444);
    font-size: 0.85rem;
    text-align: center;
    margin-bottom: var(--space-md);
  }

  .retry-action {
    display: flex;
    justify-content: center;
  }

  .retry-btn {
    background: none;
    border: 1px solid var(--brand-primary, var(--k-color-primary, #007aff));
    color: var(--brand-primary, var(--k-color-primary, #007aff));
    border-radius: 0.5rem;
    padding: var(--space-sm) var(--space-lg);
    font-size: 0.9rem;
    cursor: pointer;
    min-height: 44px;
    min-width: 44px;
  }
</style>

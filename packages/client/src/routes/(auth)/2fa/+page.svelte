<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import {
    List,
    ListInput,
    ListItem,
    Button,
    Block,
    Preloader,
  } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { base64urlToBuffer, bufferToBase64url } from "$lib/utils/webauthn.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { TwoFactorMethod } from "@care-y/shared";

  // --- State ---

  type ActiveMethod =
    | "totp"
    | "webauthn"
    | "email"
    | "sms"
    | "push"
    | "backup"
    | null;

  const KNOWN_METHODS = new Set<string>([
    "totp",
    "webauthn",
    "email",
    "sms",
    "push",
    "backup",
  ]);

  function toActiveMethod(method: string): ActiveMethod {
    if (KNOWN_METHODS.has(method)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- validated by Set check above
      return method as ActiveMethod;
    }
    return null;
  }

  let enrolledMethods = $state<string[]>([]);
  let activeMethod = $state<ActiveMethod>(null);
  let error = $state("");
  let submitting = $state(false);

  // TOTP / Email / SMS / Backup state
  let codeInput = $state("");

  // Resend cooldown (shared by email and SMS)
  let resendCooldown = $state(0);
  let cooldownTimer: ReturnType<typeof setInterval> | null = null;

  // Push state
  let pushChallengeId = $state<string | null>(null);
  let pushPollTimer: ReturnType<typeof setInterval> | null = null;
  let pushAttempts = $state(0);
  const PUSH_MAX_ATTEMPTS = 20;

  // --- Read enrolled methods from sessionStorage ---

  if (browser) {
    let methods: string[] = [];
    try {
      const raw = sessionStorage.getItem("care-y-2fa-methods");
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every((v): v is string => typeof v === "string")
        ) {
          methods = parsed;
        }
      }
      sessionStorage.removeItem("care-y-2fa-methods");
    } catch {
      // sessionStorage unavailable or malformed JSON
    }

    if (methods.length === 0) {
      void goto(resolve("/login"));
    } else {
      enrolledMethods = methods;
    }
  }

  // Auto-select if only one method enrolled (and it's a known type)
  $effect(() => {
    const first = enrolledMethods[0];
    if (
      enrolledMethods.length === 1 &&
      activeMethod === null &&
      first !== undefined
    ) {
      activeMethod = toActiveMethod(first);
    }
  });

  const hasMultipleMethods = $derived(enrolledMethods.length > 1);

  // --- Cleanup intervals on unmount ---

  $effect(() => {
    return () => {
      if (cooldownTimer !== null) clearInterval(cooldownTimer);
      if (pushPollTimer !== null) clearInterval(pushPollTimer);
    };
  });

  // --- Method labels for the picker ---

  function getMethodLabel(method: string): string {
    switch (method) {
      case TwoFactorMethod.TOTP:
        return m.twofa_totp_label();
      case TwoFactorMethod.WEBAUTHN:
        return m.twofa_passkey_use();
      case TwoFactorMethod.EMAIL:
        return m.twofa_email_label();
      case TwoFactorMethod.SMS:
        return m.twofa_sms_label();
      case TwoFactorMethod.PUSH:
        return m.twofa_push_label();
      default:
        return method;
    }
  }

  // --- Navigation after success ---

  async function onVerified(): Promise<void> {
    await goto(resolve("/"));
  }

  // --- WebAuthn error mapping ---

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

  // --- TOTP verify ---

  async function handleTotpSubmit(): Promise<void> {
    error = "";
    submitting = true;
    try {
      const result = await trpc.twoFactor.verify.totp.mutate({
        code: codeInput,
      });
      if (result.success) {
        await onVerified();
      } else {
        error = m.twofa_error_invalid_code();
        announceToLiveRegion("assertive", error);
      }
    } catch {
      error = m.twofa_error_invalid_code();
      announceToLiveRegion("assertive", error);
    } finally {
      submitting = false;
    }
  }

  // --- WebAuthn verify ---

  async function handleWebAuthnVerify(): Promise<void> {
    error = "";
    submitting = true;
    try {
      const options = await trpc.twoFactor.verify.webauthnOptions.mutate();
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64urlToBuffer(options.challenge),
        rpId: options.rpId,
        allowCredentials: options.allowCredentials.map((c) => ({
          id: base64urlToBuffer(c.id),
          type: "public-key" as const,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- server returns string[], browser API needs branded type
          transports: c.transports as AuthenticatorTransport[],
        })),
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions,
      });

      if (
        credential === null ||
        !("response" in credential) ||
        !("rawId" in credential)
      ) {
        error = m.twofa_error_not_allowed();
        submitting = false;
        return;
      }

      // navigator.credentials.get() returns Credential after null check;
      // the publicKey option guarantees PublicKeyCredential at runtime.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- WebAuthn API narrowing
      const pkc = credential as PublicKeyCredential;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- assertion response from publicKey flow
      const ar = pkc.response as AuthenticatorAssertionResponse;
      const attachment = pkc.authenticatorAttachment;
      const typedAttachment: "platform" | "cross-platform" | undefined =
        attachment === "platform" || attachment === "cross-platform"
          ? attachment
          : undefined;
      const response = {
        id: pkc.id,
        rawId: bufferToBase64url(pkc.rawId),
        type: "public-key" as const,
        authenticatorAttachment: typedAttachment,
        response: {
          clientDataJSON: bufferToBase64url(ar.clientDataJSON),
          authenticatorData: bufferToBase64url(ar.authenticatorData),
          signature: bufferToBase64url(ar.signature),
          userHandle: ar.userHandle
            ? bufferToBase64url(ar.userHandle)
            : undefined,
        },
      };

      const result =
        await trpc.twoFactor.verify.webauthnComplete.mutate(response);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- server returns { success: true as const } but we guard defensively
      if (result.success) {
        await onVerified();
      }
    } catch (err: unknown) {
      error = mapWebAuthnError(err);
      announceToLiveRegion("assertive", error);
    } finally {
      submitting = false;
    }
  }

  // --- Email verify ---

  async function handleEmailSend(): Promise<void> {
    error = "";
    submitting = true;
    try {
      await trpc.twoFactor.verify.emailSend.mutate();
      startResendCooldown();
    } catch {
      error = m.twofa_error_invalid_code();
      announceToLiveRegion("assertive", error);
    } finally {
      submitting = false;
    }
  }

  function startResendCooldown(): void {
    resendCooldown = 60;
    if (cooldownTimer !== null) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
      resendCooldown -= 1;
      if (resendCooldown <= 0) {
        if (cooldownTimer !== null) {
          clearInterval(cooldownTimer);
          cooldownTimer = null;
        }
      }
    }, 1000);
  }

  async function handleEmailVerify(): Promise<void> {
    error = "";
    submitting = true;
    try {
      const result = await trpc.twoFactor.verify.emailComplete.mutate({
        code: codeInput,
      });
      if (result.success) {
        await onVerified();
      } else {
        error = m.twofa_error_invalid_code();
        announceToLiveRegion("assertive", error);
      }
    } catch {
      error = m.twofa_error_invalid_code();
      announceToLiveRegion("assertive", error);
    } finally {
      submitting = false;
    }
  }

  // --- SMS verify ---

  async function handleSmsSend(): Promise<void> {
    error = "";
    submitting = true;
    try {
      await trpc.twoFactor.verify.smsSend.mutate();
      startResendCooldown();
    } catch {
      error = m.twofa_error_invalid_code();
      announceToLiveRegion("assertive", error);
    } finally {
      submitting = false;
    }
  }

  async function handleSmsVerify(): Promise<void> {
    error = "";
    submitting = true;
    try {
      const result = await trpc.twoFactor.verify.smsComplete.mutate({
        code: codeInput,
      });
      if (result.success) {
        await onVerified();
      } else {
        error = m.twofa_error_invalid_code();
        announceToLiveRegion("assertive", error);
      }
    } catch {
      error = m.twofa_error_invalid_code();
      announceToLiveRegion("assertive", error);
    } finally {
      submitting = false;
    }
  }

  // --- Backup code verify ---

  async function handleBackupSubmit(): Promise<void> {
    error = "";
    submitting = true;
    try {
      const result = await trpc.twoFactor.verify.backupCode.mutate({
        code: codeInput,
      });
      if (result.success) {
        await onVerified();
      } else {
        error = m.twofa_error_invalid_code();
        announceToLiveRegion("assertive", error);
      }
    } catch {
      error = m.twofa_error_invalid_code();
      announceToLiveRegion("assertive", error);
    } finally {
      submitting = false;
    }
  }

  // --- Push verify ---

  async function handlePushSend(): Promise<void> {
    error = "";
    submitting = true;
    pushAttempts = 0;
    try {
      const result = await trpc.twoFactor.verify.pushSend.mutate();
      pushChallengeId = result.challengeId;
      startPushPoll();
    } catch {
      error = m.twofa_error_push_timeout();
      announceToLiveRegion("assertive", error);
      submitting = false;
    }
  }

  function startPushPoll(): void {
    if (pushPollTimer !== null) clearInterval(pushPollTimer);
    pushPollTimer = setInterval(() => {
      void pollPushStatus();
    }, 3000);
  }

  async function pollPushStatus(): Promise<void> {
    if (pushChallengeId === null) return;
    pushAttempts += 1;

    if (pushAttempts >= PUSH_MAX_ATTEMPTS) {
      stopPushPoll();
      error = m.twofa_error_push_timeout();
      announceToLiveRegion("assertive", error);
      submitting = false;
      return;
    }

    try {
      const result = await trpc.twoFactor.verify.pushPoll.query({
        challengeId: pushChallengeId,
      });
      if (result.status === "approved") {
        stopPushPoll();
        await onVerified();
        return;
      }
      if (result.status === "denied") {
        stopPushPoll();
        error = m.twofa_error_push_denied();
        announceToLiveRegion("assertive", error);
        submitting = false;
        return;
      }
    } catch {
      // Transient network error, skip this attempt
    }
  }

  function stopPushPoll(): void {
    if (pushPollTimer !== null) {
      clearInterval(pushPollTimer);
      pushPollTimer = null;
    }
    pushChallengeId = null;
  }

  // --- Switch method ---

  function selectMethod(method: string): void {
    activeMethod = toActiveMethod(method);
    error = "";
    codeInput = "";
    submitting = false;
    stopPushPoll();
    if (cooldownTimer !== null) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
      resendCooldown = 0;
    }
  }

  function showMethodPicker(): void {
    activeMethod = null;
    error = "";
    codeInput = "";
    submitting = false;
    stopPushPoll();
  }

  // --- Back to login ---

  function handleBackToLogin(): void {
    try {
      sessionStorage.removeItem("care-y-2fa-methods");
    } catch {
      /* ok */
    }
    void goto(resolve("/login"));
  }
</script>

<h1 class="text-xl font-bold text-center mb-4">{m.twofa_verify_title()}</h1>

{#if error !== ""}
  <p class="error-text" role="alert">{error}</p>
{/if}

{#if activeMethod === null && enrolledMethods.length > 1}
  <!-- Method picker -->
  <p class="text-sm opacity-70 text-center mb-3">
    {m.twofa_verify_method_picker()}
  </p>
  <List strong inset>
    {#each enrolledMethods as method (method)}
      <ListItem
        title={getMethodLabel(method)}
        link
        onclick={() => {
          selectMethod(method);
        }}
      />
    {/each}
    <ListItem
      title={m.twofa_backup_codes_enter()}
      link
      onclick={() => {
        selectMethod("backup");
      }}
    />
  </List>
{:else if activeMethod === "totp"}
  <!-- TOTP code entry -->
  <p class="text-sm opacity-70 text-center mb-3">{m.twofa_totp_enter_code()}</p>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      void handleTotpSubmit();
    }}
  >
    <List strong inset>
      <ListInput
        type="text"
        inputmode="numeric"
        placeholder={m.twofa_totp_code_placeholder()}
        bind:value={codeInput}
        maxlength={6}
        autocomplete="one-time-code"
      />
    </List>
    <div class="mt-4">
      <Button
        large
        type="submit"
        disabled={submitting || codeInput.length !== 6}
      >
        {#if submitting}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.twofa_verify_submit()}
        {/if}
      </Button>
    </div>
  </form>
{:else if activeMethod === "webauthn"}
  <!-- WebAuthn passkey -->
  <p class="text-sm opacity-70 text-center mb-3">{m.twofa_passkey_use()}</p>
  <div class="mt-4">
    <Button
      large
      onclick={() => {
        void handleWebAuthnVerify();
      }}
      disabled={submitting}
    >
      {#if submitting}
        <span class="flex items-center gap-2">
          <Preloader class="w-5 h-5" />
          {m.twofa_passkey_waiting()}
        </span>
      {:else}
        {m.twofa_passkey_use()}
      {/if}
    </Button>
  </div>
{:else if activeMethod === "email"}
  <!-- Email code -->
  {#if resendCooldown <= 0}
    <div class="mt-4">
      <Button
        large
        onclick={() => {
          void handleEmailSend();
        }}
        disabled={submitting}
      >
        {#if submitting}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.twofa_email_send_code()}
        {/if}
      </Button>
    </div>
  {:else}
    <p class="text-sm opacity-70 text-center mb-3">
      {m.twofa_totp_enter_code()}
    </p>
    <form
      onsubmit={(e) => {
        e.preventDefault();
        void handleEmailVerify();
      }}
    >
      <List strong inset>
        <ListInput
          type="text"
          inputmode="numeric"
          placeholder={m.twofa_totp_code_placeholder()}
          bind:value={codeInput}
          maxlength={6}
          autocomplete="one-time-code"
        />
      </List>
      <div class="mt-4">
        <Button
          large
          type="submit"
          disabled={submitting || codeInput.length !== 6}
        >
          {#if submitting}
            <Preloader class="w-5 h-5" />
          {:else}
            {m.twofa_verify_submit()}
          {/if}
        </Button>
      </div>
      <p class="text-sm opacity-50 text-center mt-2">
        {m.twofa_email_cooldown({ seconds: String(resendCooldown) })}
      </p>
    </form>
  {/if}
{:else if activeMethod === "sms"}
  <!-- SMS code -->
  {#if resendCooldown <= 0}
    <div class="mt-4">
      <Button
        large
        onclick={() => {
          void handleSmsSend();
        }}
        disabled={submitting}
      >
        {#if submitting}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.twofa_sms_send_code()}
        {/if}
      </Button>
    </div>
  {:else}
    <p class="text-sm opacity-70 text-center mb-3">
      {m.twofa_totp_enter_code()}
    </p>
    <form
      onsubmit={(e) => {
        e.preventDefault();
        void handleSmsVerify();
      }}
    >
      <List strong inset>
        <ListInput
          type="text"
          inputmode="numeric"
          placeholder={m.twofa_totp_code_placeholder()}
          bind:value={codeInput}
          maxlength={6}
          autocomplete="one-time-code"
        />
      </List>
      <div class="mt-4">
        <Button
          large
          type="submit"
          disabled={submitting || codeInput.length !== 6}
        >
          {#if submitting}
            <Preloader class="w-5 h-5" />
          {:else}
            {m.twofa_verify_submit()}
          {/if}
        </Button>
      </div>
      <p class="text-sm opacity-50 text-center mt-2">
        {m.twofa_email_cooldown({ seconds: String(resendCooldown) })}
      </p>
    </form>
  {/if}
{:else if activeMethod === "push"}
  <!-- Push notification -->
  {#if pushChallengeId !== null}
    <div class="flex flex-col items-center gap-3 mt-4">
      <Preloader class="w-8 h-8" />
      <p class="text-sm opacity-70">{m.twofa_push_waiting()}</p>
    </div>
  {:else}
    <div class="mt-4">
      <Button
        large
        onclick={() => {
          void handlePushSend();
        }}
        disabled={submitting}
      >
        {#if submitting}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.twofa_push_send()}
        {/if}
      </Button>
    </div>
  {/if}
{:else if activeMethod === "backup"}
  <!-- Backup code -->
  <p class="text-sm opacity-70 text-center mb-3">
    {m.twofa_backup_codes_enter()}
  </p>
  <form
    onsubmit={(e) => {
      e.preventDefault();
      void handleBackupSubmit();
    }}
  >
    <List strong inset>
      <ListInput
        type="text"
        placeholder={m.twofa_backup_codes_placeholder()}
        bind:value={codeInput}
        maxlength={20}
      />
    </List>
    <div class="mt-4">
      <Button
        large
        type="submit"
        disabled={submitting || codeInput.length === 0}
      >
        {#if submitting}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.twofa_verify_submit()}
        {/if}
      </Button>
    </div>
  </form>
{/if}

<!-- Alternative methods / back navigation -->
{#if activeMethod !== null && hasMultipleMethods}
  <Block>
    <div class="separator">
      <span class="text-xs opacity-50">{m.twofa_verify_method_picker()}</span>
    </div>
    <div class="flex flex-wrap justify-center gap-2 mt-3">
      {#each enrolledMethods.filter((meth) => meth !== activeMethod) as altMethod (altMethod)}
        <button
          type="button"
          class="alt-method-btn"
          onclick={() => {
            selectMethod(altMethod);
          }}
        >
          {getMethodLabel(altMethod)}
        </button>
      {/each}
      {#if activeMethod !== "backup"}
        <button
          type="button"
          class="alt-method-btn"
          onclick={() => {
            selectMethod("backup");
          }}
        >
          {m.twofa_backup_codes_enter()}
        </button>
      {/if}
    </div>
  </Block>
{:else if activeMethod !== null && !hasMultipleMethods}
  <Block>
    <button
      type="button"
      class="alt-method-btn"
      onclick={() => {
        selectMethod("backup");
      }}
    >
      {m.twofa_backup_codes_enter()}
    </button>
  </Block>
{/if}

<div class="text-center mt-6">
  <button type="button" class="back-link" onclick={handleBackToLogin}>
    {m.twofa_back_to_login()}
  </button>
</div>

<style>
  .error-text {
    color: var(--k-color-red, #ef4444);
    font-size: 0.875rem;
    text-align: center;
    margin-bottom: 0.75rem;
  }

  .separator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .separator::before,
  .separator::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid var(--k-color-border, #e5e7eb);
  }

  .alt-method-btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--k-color-border, #e5e7eb);
    background: transparent;
    font-size: 0.875rem;
    cursor: pointer;
    min-height: 44px;
    min-width: 44px;
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

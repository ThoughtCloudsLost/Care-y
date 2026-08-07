<script lang="ts">
  import {
    List,
    ListItem,
    ListInput,
    Preloader,
    Button,
    Toggle,
    DialogButton,
  } from "konsta/svelte";
  import { Save, Trash2 } from "@lucide/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { consultantKeys } from "$lib/query/keys.js";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RelayError, RateLimitError } from "$lib/errors.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import FieldError from "$lib/components/FieldError.svelte";
  import type { PreferredCallMethod } from "@care-y/shared";

  interface ConsultantPhoneSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
  }

  let { opened, ondismiss }: ConsultantPhoneSheetProps = $props();

  type Step = "entry" | "code" | "verified";

  const queryClient = useQueryClient();
  const cryptoBridge = getCryptoBridge();

  // ---- State ----

  let step = $state<Step>("entry");
  let phone = $state("");
  let callMethod = $state<PreferredCallMethod>("phone_callback");
  let wantsPings = $state(false);
  let code = $state("");
  let error = $state("");
  let submitting = $state(false);
  let verifying = $state(false);
  let resendCooldown = $state(0);
  let cooldownTimer: ReturnType<typeof setInterval> | null = null;
  let deleteDialogOpen = $state(false);
  let maskedTail = $state("");
  let wasOpen = $state(false);

  // ---- Consultant query ----

  const consultantQuery = createQuery(() => ({
    queryKey: consultantKeys.self(),
    queryFn: async () => trpc.consultant?.get.query() ?? null,
    enabled: opened,
  }));

  // Determine initial step from query data when sheet opens.
  $effect(() => {
    if (opened && !wasOpen) {
      phone = "";
      code = "";
      error = "";
      submitting = false;
      verifying = false;
      wantsPings = false;
      callMethod = "phone_callback";
      maskedTail = "";
      resendCooldown = 0;
      if (cooldownTimer !== null) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
      }

      const data = consultantQuery.data;
      if (data?.isVerified === true) {
        step = "verified";
        callMethod =
          data.preferredCallMethod === "webrtc" ? "webrtc" : "phone_callback";
        wantsPings = data.smsPingsEnabled;
        void decryptAndMask(data.encryptedPhone);
      } else if (data?.encryptedPhone != null) {
        step = "code";
        void decryptAndMask(data.encryptedPhone);
      } else {
        step = "entry";
      }
    }
    wasOpen = opened;
  });

  $effect(() => {
    return () => {
      if (cooldownTimer !== null) clearInterval(cooldownTimer);
    };
  });

  // ---- Helpers ----

  function validatePhone(input: string): boolean {
    const cleaned = input.replace(/[\s\-().]/g, "");
    return /^\+[1-9]\d{6,14}$/.test(cleaned);
  }

  function maskPhone(plaintext: string): string {
    const digits = plaintext.replace(/\D/g, "");
    return digits.length >= 2 ? digits.slice(-2) : digits;
  }

  async function decryptAndMask(encryptedPhone: string | null): Promise<void> {
    if (encryptedPhone == null) return;
    try {
      const plain = await cryptoBridge.orgDecrypt(encryptedPhone);
      maskedTail = maskPhone(plain);
    } catch {
      maskedTail = "??";
    }
  }

  function startCooldown(): void {
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

  function cleanedPhone(): string {
    return phone.replace(/[\s\-().]/g, "");
  }

  // ---- Submit: register + relay verify ----

  async function handleSubmit(): Promise<void> {
    const cleaned = cleanedPhone();
    if (!validatePhone(cleaned) || submitting) return;
    submitting = true;
    error = "";

    try {
      // Step 1: register metadata via tRPC (no phone fields).
      await trpc.consultant?.register.mutate({
        preferredCallMethod: callMethod,
        smsPingsOptIn: wantsPings,
      });

      // Step 2: send plaintext phone to the relay single-write endpoint.
      const resp = await fetch("/relay/consultant-verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned, wantsPings }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          const retryAfter = Number(resp.headers.get("Retry-After")) || 60;
          throw new RateLimitError(retryAfter);
        }
        const body: unknown = await resp
          .json()
          .catch((): unknown => ({ code: "UNKNOWN" }));
        const relayCode =
          typeof body === "object" &&
          body !== null &&
          "code" in body &&
          typeof body.code === "string"
            ? body.code
            : "PROVIDER_ERROR";
        throw new RelayError(relayCode, resp.status);
      }

      // Clear plaintext phone from component state immediately.
      maskedTail = maskPhone(cleaned);
      phone = "";

      startCooldown();
      step = "code";
      await queryClient.invalidateQueries({ queryKey: consultantKeys.self() });
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        error = m.consultant_phone_error_rate_limited();
      } else if (err instanceof RelayError && err.code === "INVALID_PHONE") {
        error = m.consultant_phone_invalid();
      } else if (err instanceof RelayError) {
        error = m.consultant_phone_error_provider();
      } else {
        error = getErrorMessage(err);
      }
      announceToLiveRegion("assertive", error);
    } finally {
      submitting = false;
    }
  }

  // ---- Verify code ----

  async function handleVerify(): Promise<void> {
    if (code.length !== 6 || verifying) return;
    verifying = true;
    error = "";

    try {
      await trpc.consultant?.verify.mutate({ code });
      haptic();
      const msg = m.consultant_phone_saved();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      step = "verified";
      code = "";
      await queryClient.invalidateQueries({ queryKey: consultantKeys.self() });
    } catch (err: unknown) {
      error = getErrorMessage(err);
      announceToLiveRegion("assertive", error);
    } finally {
      verifying = false;
    }
  }

  // ---- Resend ----

  async function handleResend(): Promise<void> {
    if (submitting || resendCooldown > 0) return;
    submitting = true;
    error = "";

    try {
      const data = consultantQuery.data;
      // Re-verify needs a phone; we no longer have the plaintext.
      // The relay endpoint supports re-request if we still have state from the
      // original submit. But since we cleared phone, prompt re-entry would be
      // needed. However, per the plan, the server handles code regeneration by
      // re-request. The resend triggers a new relay call. Since the phone was
      // cleared, we need it from the encrypted copy.
      // For resend, we decrypt the stored phone, post it again.
      if (data?.encryptedPhone == null) {
        error = m.consultant_phone_error_provider();
        return;
      }
      const plain = await cryptoBridge.orgDecrypt(data.encryptedPhone);

      const resp = await fetch("/relay/consultant-verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: plain,
          wantsPings: data.smsPingsEnabled,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          throw new RateLimitError(
            Number(resp.headers.get("Retry-After")) || 60,
          );
        }
        throw new RelayError("PROVIDER_ERROR", resp.status);
      }

      startCooldown();
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        error = m.consultant_phone_error_rate_limited();
      } else {
        error = m.consultant_phone_error_provider();
      }
      announceToLiveRegion("assertive", error);
    } finally {
      submitting = false;
    }
  }

  // ---- SMS pings toggle ----

  const pingsMut = createMutation(() => ({
    mutationFn: async (enabled: boolean) =>
      trpc.consultant?.setSmsPings.mutate({ enabled }),
    onSuccess: async (_data, enabled) => {
      haptic();
      const msg = enabled
        ? m.consultant_phone_pings_enabled()
        : m.consultant_phone_pings_disabled();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      await queryClient.invalidateQueries({ queryKey: consultantKeys.self() });
    },
    onError: (err: unknown) => {
      error = getErrorMessage(err);
      announceToLiveRegion("assertive", error);
    },
  }));

  function handlePingsToggle(checked: boolean): void {
    // Enabling again requires re-verification (server throws REVERIFICATION_REQUIRED).
    // We still attempt the mutation; the error handler surfaces the explainer.
    wantsPings = checked;
    pingsMut.mutate(checked);
  }

  // ---- Call method preference ----

  const prefMut = createMutation(() => ({
    mutationFn: async (method: PreferredCallMethod) =>
      trpc.consultant?.updatePreference.mutate({ preferredCallMethod: method }),
    onSuccess: async () => {
      haptic();
      toastStore.show(m.consultant_phone_preference_saved());
      await queryClient.invalidateQueries({ queryKey: consultantKeys.self() });
    },
    onError: (err: unknown) => {
      error = getErrorMessage(err);
    },
  }));

  function handleCallMethodChange(value: string): void {
    if (value === "phone_callback" || value === "webrtc") {
      callMethod = value;
      if (step === "verified") {
        prefMut.mutate(value);
      }
    }
  }

  // ---- Delete phone ----

  const deleteMut = createMutation(() => ({
    mutationFn: async () => trpc.consultant?.delete.mutate(),
    onSuccess: async () => {
      haptic();
      const msg = m.consultant_phone_removed();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      deleteDialogOpen = false;
      step = "entry";
      maskedTail = "";
      phone = "";
      code = "";
      error = "";
      await queryClient.invalidateQueries({ queryKey: consultantKeys.self() });
    },
    onError: (err: unknown) => {
      deleteDialogOpen = false;
      error = getErrorMessage(err);
      announceToLiveRegion("assertive", error);
    },
  }));

  function confirmDelete(): void {
    deleteMut.mutate();
  }

  // ---- Derived ----

  const canSubmit = $derived(validatePhone(cleanedPhone()) && !submitting);
  const canVerify = $derived(code.length === 6 && !verifying);
  const isPingsMutating = $derived(pingsMut.isPending);
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.consultant_phone_title()}
  title={m.consultant_phone_title()}
>
  {#snippet headerRight()}
    {#if step === "code"}
      <SoftButton
        onclick={() => {
          void handleVerify();
        }}
        disabled={!canVerify}
      >
        {#if verifying}
          {m.consultant_phone_verifying()}
        {:else}
          <Save size={16} aria-hidden="true" />
          {m.consultant_phone_verify()}
        {/if}
      </SoftButton>
    {/if}
  {/snippet}

  <div class="sheet-content">
    {#if step === "entry"}
      <List nested>
        <ListInput
          type="tel"
          label={m.consultant_phone_number_label()}
          placeholder={m.consultant_phone_number_placeholder()}
          value={phone}
          oninput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) phone = e.target.value;
          }}
          disabled={submitting}
        />
        <ListInput
          dropdown
          type="select"
          label={m.consultant_phone_call_method_label()}
          value={callMethod}
          onChange={(e: Event) => {
            if (e.target instanceof HTMLSelectElement)
              handleCallMethodChange(e.target.value);
          }}
          disabled={submitting}
        >
          <option value="phone_callback"
            >{m.consultant_phone_call_method_callback()}</option
          >
          <option value="webrtc"
            >{m.consultant_phone_call_method_webrtc()}</option
          >
        </ListInput>
      </List>

      <List nested>
        <ListItem title={m.consultant_phone_sms_pings_label()}>
          {#snippet after()}
            <Toggle
              checked={wantsPings}
              onchange={() => {
                wantsPings = !wantsPings;
              }}
              aria-label={m.consultant_phone_sms_pings_aria()}
            />
          {/snippet}
        </ListItem>
      </List>

      {#if wantsPings}
        <div class="careful-register" data-register="careful" role="note">
          <p class="careful-text">{m.consultant_phone_sms_pings_explainer()}</p>
        </div>
      {/if}

      <div class="submit-action">
        <Button
          large
          onclick={() => {
            void handleSubmit();
          }}
          disabled={!canSubmit}
        >
          {#if submitting}
            <Preloader class="w-5 h-5" />
          {:else}
            {m.consultant_phone_send_code()}
          {/if}
        </Button>
      </div>
    {:else if step === "code"}
      <p class="instruction-text">
        {m.consultant_phone_code_sent_to({ tail: maskedTail })}
      </p>
      <form
        onsubmit={(e) => {
          e.preventDefault();
          void handleVerify();
        }}
      >
        <List nested>
          <ListInput
            type="text"
            inputmode="numeric"
            label={m.consultant_phone_code_label()}
            placeholder={m.consultant_phone_code_placeholder()}
            value={code}
            oninput={(e: Event) => {
              if (e.target instanceof HTMLInputElement) code = e.target.value;
            }}
            maxlength={6}
            autocomplete="one-time-code"
            disabled={verifying}
          />
        </List>
      </form>

      {#if resendCooldown > 0}
        <p class="cooldown-text">
          {m.consultant_phone_resend_cooldown({
            seconds: String(resendCooldown),
          })}
        </p>
      {:else}
        <div class="resend-action">
          <button
            type="button"
            class="resend-btn"
            onclick={() => {
              void handleResend();
            }}
            disabled={submitting}
          >
            {m.consultant_phone_resend()}
          </button>
        </div>
      {/if}
    {:else if step === "verified"}
      <div class="verified-status">
        <p class="verified-label">
          {m.consultant_phone_verified()}
          {m.consultant_phone_verified_tail({ tail: maskedTail })}
        </p>
      </div>

      <List nested>
        <ListInput
          dropdown
          type="select"
          label={m.consultant_phone_call_method_label()}
          value={callMethod}
          onChange={(e: Event) => {
            if (e.target instanceof HTMLSelectElement)
              handleCallMethodChange(e.target.value);
          }}
        >
          <option value="phone_callback"
            >{m.consultant_phone_call_method_callback()}</option
          >
          <option value="webrtc"
            >{m.consultant_phone_call_method_webrtc()}</option
          >
        </ListInput>
      </List>

      <List nested>
        <ListItem title={m.consultant_phone_sms_pings_label()}>
          {#snippet after()}
            <Toggle
              checked={wantsPings}
              disabled={isPingsMutating}
              onchange={() => handlePingsToggle(!wantsPings)}
              aria-label={m.consultant_phone_sms_pings_aria()}
            />
          {/snippet}
        </ListItem>
      </List>

      <div class="remove-action">
        <button
          type="button"
          class="remove-btn"
          onclick={() => {
            deleteDialogOpen = true;
          }}
        >
          <Trash2 size={16} aria-hidden="true" />
          {m.consultant_phone_remove()}
        </button>
      </div>
    {/if}

    {#if error !== ""}
      <div class="error-slot">
        <FieldError message={error} />
      </div>
    {/if}
  </div>
</ShellSheet>

<ShellDialog
  opened={deleteDialogOpen}
  ondismiss={() => (deleteDialogOpen = false)}
  title={m.consultant_phone_remove_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">{m.consultant_phone_remove_confirm()}</p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => (deleteDialogOpen = false)}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmDelete}
    >
      {m.consultant_phone_remove_action()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .sheet-content {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
  }

  .instruction-text {
    font-size: 0.9rem;
    color: var(--ink);
    margin-bottom: var(--space-sm);
  }

  .submit-action {
    padding-top: var(--space-sm);
  }

  .verified-status {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
  }

  .verified-label {
    font-size: 0.95rem;
    color: var(--care);
    font-weight: 600;
  }

  .careful-register {
    margin: var(--space-sm) 0;
    padding: var(--space-sm) var(--space-md);
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--ink) 4%, transparent);
  }

  .careful-text {
    font-size: 0.8rem;
    color: var(--muted);
    line-height: 1.4;
  }

  .cooldown-text {
    font-size: 0.8rem;
    color: var(--muted);
    text-align: center;
    margin-top: var(--space-sm);
  }

  .resend-action {
    display: flex;
    justify-content: center;
    margin-top: var(--space-sm);
  }

  .resend-btn {
    background: none;
    border: none;
    color: var(--brand-text, var(--brand-primary, #007aff));
    font-size: 0.85rem;
    cursor: pointer;
    padding: var(--space-xs);
    min-height: 44px;
  }

  .resend-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .remove-action {
    display: flex;
    justify-content: center;
    margin-top: var(--space-md);
  }

  .remove-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    background: none;
    border: none;
    color: var(--danger);
    font-size: 0.85rem;
    cursor: pointer;
    padding: var(--space-xs) var(--space-sm);
    min-height: 44px;
    border-radius: 0.5rem;
  }

  .remove-btn:active {
    background: color-mix(in srgb, var(--danger) 10%, transparent);
  }

  .error-slot {
    text-align: center;
    margin-top: var(--space-sm);
  }
</style>

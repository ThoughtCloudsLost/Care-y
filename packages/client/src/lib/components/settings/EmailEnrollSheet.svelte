<script lang="ts">
  import { List, ListInput, Preloader, Button } from "konsta/svelte";
  import { Save } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  interface EmailEnrollSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly onenrolled: () => void;
  }

  let { opened, ondismiss, onenrolled }: EmailEnrollSheetProps = $props();

  let codeSent = $state(false);
  let code = $state("");
  let sending = $state(false);
  let verifying = $state(false);
  let error = $state("");
  let resendCooldown = $state(0);
  let cooldownTimer: ReturnType<typeof setInterval> | null = null;
  let wasOpen = $state(false);

  $effect(() => {
    if (opened && !wasOpen) {
      codeSent = false;
      code = "";
      error = "";
      sending = false;
      verifying = false;
      resendCooldown = 0;
      if (cooldownTimer !== null) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
      }
    }
    wasOpen = opened;
  });

  $effect(() => {
    return () => {
      if (cooldownTimer !== null) clearInterval(cooldownTimer);
    };
  });

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

  async function handleSendCode(): Promise<void> {
    sending = true;
    error = "";
    try {
      await trpc.twoFactor.enroll.emailSend.mutate();
      codeSent = true;
      startCooldown();
    } catch {
      error = m.twofa_error_invalid_code();
      announceToLiveRegion("assertive", error);
    } finally {
      sending = false;
    }
  }

  async function handleVerify(): Promise<void> {
    if (code.length !== 6 || verifying) return;
    verifying = true;
    error = "";
    try {
      const result = await trpc.twoFactor.enroll.emailVerify.mutate({ code });
      if (result.success) {
        haptic();
        const msg = m.twofa_method_added();
        toastStore.show(msg);
        announceToLiveRegion("polite", msg);
        onenrolled();
      } else {
        error = m.twofa_error_invalid_code();
        announceToLiveRegion("assertive", error);
      }
    } catch {
      error = m.twofa_error_invalid_code();
      announceToLiveRegion("assertive", error);
    } finally {
      verifying = false;
    }
  }

  const canVerify = $derived(code.length === 6 && !verifying);
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.twofa_email_label()}
  title={m.twofa_email_label()}
>
  {#snippet headerRight()}
    {#if codeSent}
      <SoftButton
        onclick={() => {
          void handleVerify();
        }}
        disabled={!canVerify}
      >
        {#if verifying}
          {m.common_loading()}
        {:else}
          <Save size={16} aria-hidden="true" />
          {m.twofa_verify_submit()}
        {/if}
      </SoftButton>
    {/if}
  {/snippet}

  <div class="sheet-content">
    {#if !codeSent}
      <div class="send-section">
        <p class="instruction-text">{m.twofa_email_desc()}</p>
        <Button
          large
          onclick={() => {
            void handleSendCode();
          }}
          disabled={sending}
        >
          {#if sending}
            <Preloader class="w-5 h-5" />
          {:else}
            {m.twofa_email_send_code()}
          {/if}
        </Button>
      </div>
    {:else}
      <form
        onsubmit={(e) => {
          e.preventDefault();
          void handleVerify();
        }}
      >
        <p class="instruction-text">{m.twofa_totp_enter_code()}</p>
        <List nested>
          <ListInput
            type="text"
            inputmode="numeric"
            placeholder={m.twofa_totp_code_placeholder()}
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
          {m.twofa_email_cooldown({ seconds: String(resendCooldown) })}
        </p>
      {:else}
        <div class="resend-action">
          <button
            type="button"
            class="resend-btn"
            onclick={() => {
              void handleSendCode();
            }}
            disabled={sending}
          >
            {m.twofa_email_resend()}
          </button>
        </div>
      {/if}
    {/if}

    {#if error !== ""}
      <p class="error-text" role="alert">{error}</p>
    {/if}
  </div>
</ShellSheet>

<style>
  .sheet-content {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
  }

  .send-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .instruction-text {
    font-size: 0.9rem;
    color: var(--ink);
    margin-bottom: var(--space-sm);
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
    color: var(--brand-primary, var(--k-color-primary, #007aff));
    font-size: 0.85rem;
    cursor: pointer;
    padding: var(--space-xs);
    min-height: 44px;
  }

  .resend-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .error-text {
    color: var(--k-color-red, #ef4444);
    font-size: 0.85rem;
    text-align: center;
    margin-top: var(--space-sm);
  }
</style>

<script lang="ts">
  import { tick } from "svelte";
  import { List, ListInput, Preloader } from "konsta/svelte";
  import { Save, Copy } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import encodeQR from "@paulmillr/qr";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";

  interface TotpEnrollSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly onenrolled: () => void;
  }

  let { opened, ondismiss, onenrolled }: TotpEnrollSheetProps = $props();

  let _otpauthUri = $state("");
  let secret = $state("");
  let svgMarkup = $state("");
  let code = $state("");
  let loading = $state(false);
  let verifying = $state(false);
  let error = $state("");
  let wasOpen = $state(false);
  let formEl = $state<HTMLFormElement | undefined>();

  $effect(() => {
    if (opened && !wasOpen) {
      _otpauthUri = "";
      secret = "";
      svgMarkup = "";
      code = "";
      error = "";
      void fetchSetup();
    }
    wasOpen = opened;
  });

  async function fetchSetup(): Promise<void> {
    loading = true;
    error = "";
    try {
      const result = await trpc.twoFactor.enroll.totpSetup.mutate();
      _otpauthUri = result.uri;
      secret = result.secret;
      svgMarkup = encodeQR(result.uri, "svg");
      await tick();
      const input = formEl?.querySelector("input");
      input?.focus();
    } catch {
      error = m.twofa_error_invalid_code();
    } finally {
      loading = false;
    }
  }

  async function handleVerify(): Promise<void> {
    if (code.length !== 6 || verifying) return;
    verifying = true;
    error = "";
    try {
      const result = await trpc.twoFactor.enroll.totpVerify.mutate({ code });
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

  async function handleCopySecret(): Promise<void> {
    try {
      await navigator.clipboard.writeText(secret);
      haptic();
      const msg = m.twofa_backup_codes_copied();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
    } catch {
      // Clipboard API unavailable
    }
  }

  const canVerify = $derived(code.length === 6 && !verifying);
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.twofa_totp_scan_qr()}
  title={m.twofa_totp_label()}
>
  {#snippet headerRight()}
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
  {/snippet}

  <div class="sheet-content">
    {#if loading}
      <div class="loading-state" role="status">
        <Preloader class="w-6 h-6" />
      </div>
    {:else if svgMarkup !== ""}
      <p class="instruction-text">{m.twofa_totp_scan_qr()}</p>

      <!-- eslint-disable svelte/no-at-html-tags -- encodeQR returns deterministic SVG from the otpauth URI, no user input -->
      <div class="qr-container" aria-hidden="true">
        {@html svgMarkup}
      </div>
      <!-- eslint-enable svelte/no-at-html-tags -->

      <p class="manual-label">{m.twofa_totp_manual_entry()}</p>
      <div class="secret-row">
        <code class="secret-text">{secret}</code>
        <button
          type="button"
          class="copy-btn"
          onclick={() => {
            void handleCopySecret();
          }}
          aria-label={m.twofa_totp_copy_secret()}
        >
          <Copy size={16} />
        </button>
      </div>

      <form
        bind:this={formEl}
        onsubmit={(e) => {
          e.preventDefault();
          void handleVerify();
        }}
      >
        <List nested>
          <ListInput
            type="text"
            inputmode="numeric"
            label={m.twofa_totp_enter_code()}
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

      {#if error !== ""}
        <p class="error-text" role="alert">{error}</p>
      {/if}
    {/if}
  </div>
</ShellSheet>

<style>
  .sheet-content {
    padding: 0 var(--space-lg) var(--space-lg);
  }

  .loading-state {
    display: flex;
    justify-content: center;
    padding: var(--space-xl) 0;
  }

  .instruction-text {
    font-size: 0.9rem;
    color: var(--ink);
    text-align: center;
    margin: var(--space-md) 0;
  }

  .qr-container {
    display: flex;
    justify-content: center;
    margin: var(--space-md) 0 var(--space-lg);
  }

  .qr-container :global(svg) {
    width: 200px;
    height: 200px;
  }

  .manual-label {
    font-size: 0.85rem;
    color: var(--muted);
    margin-bottom: var(--space-xs);
  }

  .secret-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: color-mix(in srgb, var(--ink) 5%, transparent);
    border-radius: 0.375rem;
    margin-bottom: var(--space-md);
  }

  .secret-text {
    flex: 1;
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    word-break: break-all;
  }

  .copy-btn {
    background: none;
    border: none;
    color: var(--brand-primary, var(--k-color-primary, #007aff));
    cursor: pointer;
    padding: var(--space-xs);
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .error-text {
    color: var(--k-color-red, #ef4444);
    font-size: 0.85rem;
    padding: 0 var(--space-lg);
    margin: 0;
  }
</style>

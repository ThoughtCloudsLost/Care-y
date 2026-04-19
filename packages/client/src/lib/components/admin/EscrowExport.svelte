<script lang="ts">
  import { List, ListInput, Block, Preloader } from "konsta/svelte";
  import { Download } from "@lucide/svelte";
  import SoftButton from "$lib/components/SoftButton.svelte";
  import {
    encryptWithPassphrase,
    serializeEscrowBlob,
    requireSodium,
  } from "@care-y/crypto";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import {
    assessPassphraseStrength,
    looksLikeCommonPattern,
    type PassphraseStrength,
  } from "$lib/utils/passphrase-strength.js";
  import ShellPopup from "$lib/shell/ShellPopup.svelte";

  type Step = 1 | 2 | 3;

  const orgKeyManager = getOrgKeyManager();

  let opened = $state(false);
  let step = $state<Step>(1);
  let passphrase = $state("");
  let confirmPassphrase = $state("");
  let exporting = $state(false);
  let exportError = $state("");

  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);
  const strength = $derived<PassphraseStrength>(
    assessPassphraseStrength(passphrase),
  );
  const isCommon = $derived(
    passphrase.length >= 20 && looksLikeCommonPattern(passphrase),
  );
  const mismatch = $derived(
    confirmPassphrase.length > 0 && passphrase !== confirmPassphrase,
  );
  const canExport = $derived(
    orgKeyLoaded &&
      strength !== "too-short" &&
      passphrase === confirmPassphrase &&
      !isCommon &&
      !exporting,
  );

  interface StrengthDisplay {
    label: () => string;
    color: string;
    width: string;
  }

  function getStrengthConfig(s: PassphraseStrength): StrengthDisplay {
    switch (s) {
      case "too-short":
        return {
          label: m.admin_escrow_strength_too_short,
          color: "var(--color-red-500)",
          width: "25%",
        };
      case "acceptable":
        return {
          label: m.admin_escrow_strength_acceptable,
          color: "var(--color-amber-500)",
          width: "50%",
        };
      case "good":
        return {
          label: m.admin_escrow_strength_good,
          color: "var(--color-green-500)",
          width: "75%",
        };
      case "strong":
        return {
          label: m.admin_escrow_strength_strong,
          color: "var(--color-green-500)",
          width: "100%",
        };
    }
  }

  const strengthConfig = $derived(getStrengthConfig(strength));

  export function open(): void {
    opened = true;
  }

  function dismiss(): void {
    if (exporting) return;
    opened = false;
    reset();
  }

  function reset(): void {
    step = 1;
    passphrase = "";
    confirmPassphrase = "";
    exporting = false;
    exportError = "";
  }

  function exportEscrow(): void {
    const orgSecretKey = orgKeyManager.getSecretKey();
    if (!orgSecretKey) return;

    exporting = true;
    exportError = "";

    const passBytes = new TextEncoder().encode(passphrase);

    try {
      const blob = encryptWithPassphrase(orgSecretKey, passBytes);
      const serialized = serializeEscrowBlob(blob);
      const downloadBytes = new Uint8Array(serialized.length);
      downloadBytes.set(serialized);
      const fileBlob = new Blob([downloadBytes], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `care-y-escrow-${new Date().toISOString().slice(0, 10)}.escrow`;
      a.click();
      URL.revokeObjectURL(url);

      haptic();
      toastStore.show(m.admin_escrow_success());
      announceToLiveRegion("assertive", m.admin_escrow_success());
      step = 3;
    } catch (err: unknown) {
      exportError = err instanceof Error ? err.message : String(err);
      toastStore.show(m.admin_escrow_error(), 3000);
    } finally {
      passBytes.fill(0);

      const sodium = requireSodium();
      sodium.memzero(orgSecretKey);

      passphrase = "";
      confirmPassphrase = "";
      exporting = false;
    }
  }
</script>

<ShellPopup {opened} ondismiss={dismiss} title={m.admin_escrow_title()}>
  {#if step === 1}
    <!-- Step 1: Education -->
    <Block>
      <p class="section-heading">{m.admin_escrow_step_education_heading()}</p>
      <p class="body-text">{m.admin_escrow_step_education_body()}</p>
      <p class="body-text">{m.admin_escrow_step_education_scope()}</p>
      <p class="body-text emphasis">
        {m.admin_escrow_step_education_analogy()}
      </p>
    </Block>

    <Block>
      <div class="callout warning">
        <p class="callout-heading">{m.admin_escrow_browser_safety_heading()}</p>
        <ul class="callout-list">
          <li>{m.admin_escrow_browser_safety_extensions()}</li>
          <li>{m.admin_escrow_browser_safety_tabs()}</li>
          <li>{m.admin_escrow_browser_safety_screen()}</li>
          <li>{m.admin_escrow_browser_safety_public()}</li>
        </ul>
      </div>
    </Block>

    {#if !orgKeyLoaded}
      <Block>
        <p class="org-key-warning" role="alert">
          {m.admin_escrow_no_org_key()}
        </p>
      </Block>
    {/if}

    <Block>
      <SoftButton full onclick={() => (step = 2)} disabled={!orgKeyLoaded}>
        {m.admin_escrow_continue()}
      </SoftButton>
    </Block>
  {:else if step === 2}
    <!-- Step 2: Passphrase creation -->
    <Block>
      <p class="section-heading">{m.admin_escrow_step_passphrase_heading()}</p>
      <p class="body-text">{m.admin_escrow_passphrase_guidance()}</p>
    </Block>

    <List strong inset>
      <ListInput
        label={m.admin_escrow_passphrase_label()}
        type="password"
        value={passphrase}
        oninput={(e: Event) => {
          if (e.target instanceof HTMLInputElement) passphrase = e.target.value;
        }}
      />
      <ListInput
        label={m.admin_escrow_confirm_label()}
        type="password"
        value={confirmPassphrase}
        oninput={(e: Event) => {
          if (e.target instanceof HTMLInputElement)
            confirmPassphrase = e.target.value;
        }}
        info={mismatch ? m.admin_escrow_passphrase_mismatch() : undefined}
      />
    </List>

    <!-- Strength meter -->
    {#if passphrase.length > 0}
      <Block>
        <div class="strength-meter">
          <div class="strength-track">
            <div
              class="strength-fill"
              style="width: {strengthConfig.width}; background: {strengthConfig.color}"
            ></div>
          </div>
          <span class="strength-label" style="color: {strengthConfig.color}">
            {strengthConfig.label()}
          </span>
        </div>
      </Block>
    {/if}

    {#if isCommon}
      <Block>
        <p class="common-warning" role="alert">
          {m.admin_escrow_passphrase_common()}
        </p>
      </Block>
    {/if}

    {#if exportError}
      <Block>
        <p class="export-error" role="alert">{exportError}</p>
      </Block>
    {/if}

    <Block>
      <SoftButton full onclick={exportEscrow} disabled={!canExport}>
        {#if exporting}
          <Preloader />
          {m.admin_escrow_exporting()}
        {:else}
          <Download size={18} aria-hidden="true" />
          {m.admin_escrow_export_button()}
        {/if}
      </SoftButton>
    </Block>
  {:else}
    <!-- Step 3: Storage guidance -->
    <Block>
      <p class="section-heading">{m.admin_escrow_step_storage_heading()}</p>
    </Block>

    <Block>
      <div class="callout success">
        <ul class="callout-list">
          <li>{m.admin_escrow_storage_usb()}</li>
          <li>{m.admin_escrow_storage_locked()}</li>
          <li>{m.admin_escrow_storage_separate()}</li>
          <li>{m.admin_escrow_storage_copy()}</li>
          <li>{m.admin_escrow_storage_test()}</li>
        </ul>
      </div>
    </Block>

    <Block>
      <SoftButton full onclick={dismiss}>
        {m.admin_escrow_done()}
      </SoftButton>
    </Block>
  {/if}
</ShellPopup>

<style>
  .section-heading {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
    margin-bottom: var(--space-sm);
  }

  .body-text {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
  }

  .body-text:last-child {
    margin-bottom: 0;
  }

  .body-text.emphasis {
    font-style: italic;
  }

  .callout {
    border-radius: 8px;
    padding: var(--space-md);
  }

  .callout.warning {
    background: color-mix(in srgb, var(--color-amber-500) 10%, transparent);
  }

  .callout.success {
    background: color-mix(in srgb, var(--color-green-500) 10%, transparent);
  }

  .callout-heading {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--ink);
    margin-bottom: var(--space-sm);
  }

  .callout-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .callout-list li {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.4;
    padding-left: 1.25rem;
    position: relative;
  }

  .callout-list li::before {
    content: "\2022";
    position: absolute;
    left: 0.25rem;
    color: var(--muted);
  }

  .org-key-warning {
    font-size: 0.8125rem;
    color: var(--color-amber-500);
    font-weight: 500;
  }

  .strength-meter {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .strength-track {
    height: 4px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--muted) 20%, transparent);
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    border-radius: 2px;
    transition:
      width 0.2s ease,
      background 0.2s ease;
  }

  .strength-label {
    font-size: var(--text-xs);
    font-weight: 500;
  }

  .common-warning {
    font-size: 0.8125rem;
    color: var(--color-amber-500);
    background: color-mix(in srgb, var(--color-amber-500) 10%, transparent);
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    margin: 0;
  }

  .export-error {
    font-size: 0.8125rem;
    color: var(--color-red-500);
    margin: 0;
  }
</style>

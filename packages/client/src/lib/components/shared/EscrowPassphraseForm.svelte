<script lang="ts">
  import { List, ListInput, Block, Preloader } from "konsta/svelte";
  import { Download } from "@lucide/svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import { requireSodium } from "@care-y/crypto";
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
  import {
    exportEscrowFile,
    downloadBlob,
  } from "$lib/escrow/export-escrow-file.js";

  interface Props {
    readonly onexport: (data: { sha256Hex: string }) => void;
    readonly disabled?: boolean;
  }

  let { onexport, disabled = false }: Props = $props();

  const orgKeyManager = getOrgKeyManager();

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
      !exporting &&
      !disabled,
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

  async function handleExport(): Promise<void> {
    let orgSecretKey: Uint8Array | null = null;
    let passBytes: Uint8Array | null = null;

    try {
      orgSecretKey = await orgKeyManager.getSecretKey();
      if (!orgSecretKey) return;

      exporting = true;
      exportError = "";

      passBytes = new TextEncoder().encode(passphrase);

      const result = await exportEscrowFile(orgSecretKey, passBytes);
      downloadBlob(result.fileBlob, result.filename);

      haptic();
      toastStore.show(m.admin_escrow_success());
      announceToLiveRegion("assertive", m.admin_escrow_success());
      onexport({ sha256Hex: result.sha256Hex });
    } catch (err: unknown) {
      exportError = err instanceof Error ? err.message : String(err);
      toastStore.show(m.admin_escrow_error(), 3000);
    } finally {
      if (passBytes) passBytes.fill(0);

      if (orgSecretKey) {
        const sodium = requireSodium();
        sodium.memzero(orgSecretKey);
      }

      passphrase = "";
      confirmPassphrase = "";
      exporting = false;
    }
  }
</script>

<Block>
  <p class="section-heading">{m.admin_escrow_step_passphrase_heading()}</p>
  <p class="body-text">{m.admin_escrow_passphrase_guidance()}</p>
</Block>

<List nested>
  <ListInput
    outline
    label={m.admin_escrow_passphrase_label()}
    type="password"
    value={passphrase}
    oninput={(e: Event) => {
      if (e.target instanceof HTMLInputElement) passphrase = e.target.value;
    }}
    disabled={exporting || disabled}
  />
  <ListInput
    outline
    label={m.admin_escrow_confirm_label()}
    type="password"
    value={confirmPassphrase}
    oninput={(e: Event) => {
      if (e.target instanceof HTMLInputElement)
        confirmPassphrase = e.target.value;
    }}
    info={mismatch ? m.admin_escrow_passphrase_mismatch() : undefined}
    disabled={exporting || disabled}
  />
</List>

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
  <SoftButton full onclick={() => void handleExport()} disabled={!canExport}>
    {#if exporting}
      <Preloader />
      {m.admin_escrow_exporting()}
    {:else}
      <Download size={18} aria-hidden="true" />
      {m.admin_escrow_export_button()}
    {/if}
  </SoftButton>
</Block>

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
    margin-bottom: 0;
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
  }

  @media (prefers-reduced-motion: no-preference) {
    .strength-fill {
      transition:
        width 0.2s ease,
        background 0.2s ease;
    }
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

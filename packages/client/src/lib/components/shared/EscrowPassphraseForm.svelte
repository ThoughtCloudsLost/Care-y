<script lang="ts">
  import { List, Block, Preloader } from "konsta/svelte";
  import { Download } from "@lucide/svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import { requireSodium } from "@care-y/crypto";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { looksLikeCommonPattern } from "$lib/utils/passphrase-strength.js";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import PasswordStrengthMeter from "$lib/components/inputs/PasswordStrengthMeter.svelte";
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

  const ESCROW_MIN_LENGTH = 20;

  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);
  const isCommon = $derived(
    passphrase.length >= ESCROW_MIN_LENGTH &&
      looksLikeCommonPattern(passphrase),
  );
  const mismatch = $derived(
    confirmPassphrase.length > 0 && passphrase !== confirmPassphrase,
  );
  const canExport = $derived(
    orgKeyLoaded &&
      passphrase.length >= ESCROW_MIN_LENGTH &&
      passphrase === confirmPassphrase &&
      !isCommon &&
      !exporting &&
      !disabled,
  );

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
  <PasswordInput
    outline
    label={m.admin_escrow_passphrase_label()}
    bind:value={passphrase}
    disabled={exporting || disabled}
  />
  <PasswordInput
    outline
    label={m.admin_escrow_confirm_label()}
    bind:value={confirmPassphrase}
    info={mismatch ? m.admin_escrow_passphrase_mismatch() : undefined}
    disabled={exporting || disabled}
  />
</List>

{#if passphrase.length > 0}
  <Block>
    <PasswordStrengthMeter
      password={passphrase}
      minLength={ESCROW_MIN_LENGTH}
    />
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

  .export-error {
    font-size: 0.8125rem;
    color: var(--color-red-500);
    margin: 0;
  }
</style>

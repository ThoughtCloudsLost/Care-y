<!--
  SetupEscrow: wizard step 6 (escrow key backup).

  Non-skippable. Generates an escrow file containing the org secret key
  encrypted with a passphrase via Argon2id + XSalsa20-Poly1305.
  All crypto runs client-side. The passphrase and org key never leave
  the browser. Key material is zeroed in finally blocks.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { List, ListInput, Button, Block, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { encryptWithPassphrase, serializeEscrowBlob } from "@care-y/crypto";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";

  interface Props {
    oncomplete: () => void;
  }

  let { oncomplete }: Props = $props();

  const orgKeyManager = getOrgKeyManager();
  const encoder = new TextEncoder();

  let passphrase = $state("");
  let confirmPassphrase = $state("");
  let error = $state("");
  let generating = $state(false);
  let fileHash = $state("");
  let downloaded = $state(false);
  let httpsBlocked = $state(false);

  const PASSPHRASE_MIN_CHARS = 20;
  const PASSPHRASE_MIN_WORDS = 6;

  function meetsPassphraseRequirement(value: string): boolean {
    if (value.length >= PASSPHRASE_MIN_CHARS) return true;
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    return wordCount >= PASSPHRASE_MIN_WORDS;
  }

  const passphraseValid = $derived(meetsPassphraseRequirement(passphrase));
  const confirmValid = $derived(passphrase === confirmPassphrase);
  const canGenerate = $derived(
    passphraseValid &&
      confirmValid &&
      !generating &&
      !httpsBlocked &&
      orgKeyManager.isLoaded,
  );
  onMount(() => {
    if (import.meta.env.DEV) return;
    const isSecure = window.location.protocol === "https:";
    httpsBlocked = !isSecure;
  });

  async function computeSha256Hex(data: Uint8Array): Promise<string> {
    const copy = new Uint8Array(data);
    const hashBuf = await crypto.subtle.digest("SHA-256", copy);
    const hashArr = new Uint8Array(hashBuf);
    return Array.from(hashArr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function handleGenerate(): Promise<void> {
    error = "";

    if (!passphraseValid) {
      error = m.onboarding_escrow_error_passphrase_short();
      return;
    }
    if (!confirmValid) {
      error = m.onboarding_escrow_error_passphrase_mismatch();
      return;
    }

    const orgSecretKey = await orgKeyManager.getSecretKey();
    if (!orgSecretKey) {
      error = m.onboarding_escrow_error_no_key();
      announceToLiveRegion("assertive", m.onboarding_escrow_error_no_key());
      return;
    }

    generating = true;
    announceToLiveRegion("polite", m.onboarding_escrow_generating());

    let passphraseBytes: Uint8Array | null = null;

    try {
      passphraseBytes = encoder.encode(passphrase);
      const blob = encryptWithPassphrase(orgSecretKey, passphraseBytes);
      const serialized = serializeEscrowBlob(blob);

      const envelope = {
        format: "care-y-escrow-v1",
        type: "org-key",
        created: new Date().toISOString(),
        data: Array.from(serialized),
      };

      const json = JSON.stringify(envelope, null, 2);
      const jsonBytes = encoder.encode(json);

      fileHash = await computeSha256Hex(jsonBytes);

      const fileBlob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(fileBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `care-y-escrow-${String(Date.now())}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      downloaded = true;
      haptic();
      toastStore.show(m.onboarding_escrow_downloaded());
      announceToLiveRegion("polite", m.onboarding_escrow_downloaded());
    } catch {
      error = m.onboarding_escrow_error();
      toastStore.show(m.onboarding_escrow_error(), 3000);
      announceToLiveRegion("assertive", m.onboarding_escrow_error());
    } finally {
      orgSecretKey.fill(0);
      if (passphraseBytes) passphraseBytes.fill(0);
      passphrase = "";
      confirmPassphrase = "";
      generating = false;
    }
  }
</script>

<Block>
  <h2 class="step-heading">{m.onboarding_escrow_heading()}</h2>
  <p class="step-subtext">{m.onboarding_escrow_subtext()}</p>
</Block>

{#if httpsBlocked}
  <Block>
    <p class="error-text" role="alert">{m.onboarding_escrow_https_warning()}</p>
  </Block>
{:else}
  <Block>
    <div class="warning-box" role="note">
      <p class="warning-text">{m.onboarding_escrow_warning()}</p>
    </div>
  </Block>

  {#if error}
    <Block>
      <p class="error-text" role="alert">{error}</p>
    </Block>
  {/if}

  {#if !downloaded}
    <List strong inset>
      <ListInput
        outline
        label={m.onboarding_escrow_passphrase_label()}
        type="password"
        placeholder={m.onboarding_escrow_passphrase_placeholder()}
        value={passphrase}
        onInput={(e: Event) => {
          if (e.target instanceof HTMLInputElement) passphrase = e.target.value;
        }}
        disabled={generating}
      />

      <ListInput
        outline
        label={m.onboarding_escrow_passphrase_confirm_label()}
        type="password"
        placeholder={m.onboarding_escrow_passphrase_confirm_placeholder()}
        value={confirmPassphrase}
        onInput={(e: Event) => {
          if (e.target instanceof HTMLInputElement)
            confirmPassphrase = e.target.value;
        }}
        disabled={generating}
      />
    </List>

    <Block>
      <Button
        large
        disabled={!canGenerate}
        onclick={() => void handleGenerate()}
      >
        {#if generating}
          <Preloader class="w-5 h-5" />
        {:else}
          {m.onboarding_escrow_download()}
        {/if}
      </Button>
    </Block>
  {:else}
    <Block>
      <p class="hash-label">{m.onboarding_escrow_hash_label()}</p>
      <code class="hash-value"
        >{m.onboarding_escrow_hash_value({ hash: fileHash })}</code
      >
    </Block>

    <Block>
      <Button large onclick={oncomplete}>
        {m.onboarding_escrow_continue()}
      </Button>
    </Block>
  {/if}
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
  }

  .warning-box {
    background: var(--surface-2, #fef3c7);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .warning-text {
    font-size: 0.8125rem;
    color: var(--ink, #1f2937);
    margin: 0;
    line-height: 1.5;
  }

  .hash-label {
    font-size: 0.8125rem;
    color: var(--muted, #6b7280);
    margin: 0 0 0.25rem;
  }

  .hash-value {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    font-size: 0.75rem;
    color: var(--ink, #1f2937);
    word-break: break-all;
    user-select: all;
  }
</style>

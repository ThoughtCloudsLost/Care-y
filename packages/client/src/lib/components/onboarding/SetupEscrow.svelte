<!--
  SetupEscrow: wizard step 6 (escrow key backup).

  Non-skippable. Generates an escrow file containing the org secret key
  encrypted with a passphrase via Argon2id + XSalsa20-Poly1305.
  All crypto runs client-side. The passphrase and org key never leave
  the browser. Key material is zeroed in finally blocks.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    List,
    ListInput,
    Button,
    Block,
    BlockTitle,
    Preloader,
  } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import {
    encryptWithPassphrase,
    serializeEscrowBlob,
    requireSodium,
  } from "@care-y/crypto";
  import {
    assessPassphraseStrength,
    looksLikeCommonPattern,
  } from "$lib/utils/passphrase-strength.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";

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

  const hashGroups = $derived(fileHash.match(/.{1,4}/g) ?? []);

  const strength = $derived(assessPassphraseStrength(passphrase));
  const isCommon = $derived(
    passphrase.length >= 20 && looksLikeCommonPattern(passphrase),
  );
  const passphraseValid = $derived(strength !== "too-short" && !isCommon);
  const passphraseTooShort = $derived(
    passphrase.length > 0 && strength === "too-short",
  );
  const confirmValid = $derived(passphrase === confirmPassphrase);
  const passphraseMismatch = $derived(
    confirmPassphrase.length > 0 && !confirmValid,
  );
  const canGenerate = $derived(
    passphraseValid &&
      confirmValid &&
      !generating &&
      !httpsBlocked &&
      isOrgKeyReady(),
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
      const sodium = requireSodium();
      sodium.memzero(orgSecretKey);
      if (passphraseBytes) passphraseBytes.fill(0);
      passphrase = "";
      confirmPassphrase = "";
      generating = false;
    }
  }
</script>

<BlockTitle medium>{m.onboarding_escrow_heading()}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_escrow_subtext()}</p>
</Block>

{#if httpsBlocked}
  <Block>
    <p class="step-error" role="alert">{m.onboarding_escrow_https_warning()}</p>
  </Block>
{:else}
  <Block>
    <div class="warning-box" role="note">
      <p class="warning-text">{m.onboarding_escrow_warning()}</p>
    </div>
  </Block>

  {#if error}
    <Block>
      <p class="step-error" role="alert">{error}</p>
    </Block>
  {/if}

  {#if !downloaded}
    <Block>
      <p class="step-desc">{m.onboarding_escrow_passphrase_why()}</p>
    </Block>
    <List strong inset>
      <ListInput
        outline
        label={m.onboarding_escrow_passphrase_label()}
        type="password"
        placeholder={m.onboarding_escrow_passphrase_placeholder()}
        info={m.onboarding_escrow_passphrase_hint()}
        value={passphrase}
        onInput={(e: Event) => {
          if (e.target instanceof HTMLInputElement) passphrase = e.target.value;
        }}
        disabled={generating}
        error={passphraseTooShort
          ? m.onboarding_escrow_error_passphrase_short()
          : isCommon
            ? m.onboarding_escrow_error_passphrase_common()
            : undefined}
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
        error={passphraseMismatch
          ? m.onboarding_escrow_error_passphrase_mismatch()
          : undefined}
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
      <div class="hash-grid" aria-label={fileHash}>
        {#each hashGroups as group, i (i)}
          <code class="hash-group">{group}</code>
        {/each}
      </div>
      <p class="hash-hint">{m.onboarding_escrow_hash_hint()}</p>
    </Block>

    <Block class="escrow-actions">
      <Button large onclick={oncomplete}>
        {m.onboarding_escrow_continue()}
      </Button>
      <Button
        large
        outline
        onclick={() => {
          downloaded = false;
          fileHash = "";
        }}
      >
        {m.onboarding_escrow_download_again()}
      </Button>
    </Block>
  {/if}
{/if}

<style>
  .warning-box {
    background: var(--surface-2);
    border-radius: var(--card-radius);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .warning-text {
    font-size: var(--text-base);
    color: var(--ink);
    margin: 0;
    line-height: 1.5;
  }

  .hash-label {
    font-size: var(--text-base);
    color: var(--muted);
    margin: 0 0 var(--space-sm);
  }

  .hash-grid {
    display: grid;
    grid-template-columns: repeat(4, auto);
    justify-content: start;
    gap: var(--space-sm) var(--space-lg);
    user-select: all;
  }

  .hash-group {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    font-size: var(--text-base);
    letter-spacing: 0.05em;
    color: var(--ink);
  }

  .hash-hint {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin: var(--space-lg) 0 0;
  }

  :global(.escrow-actions) {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }
</style>

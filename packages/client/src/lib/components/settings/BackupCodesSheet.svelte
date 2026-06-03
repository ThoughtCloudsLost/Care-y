<script lang="ts">
  import { Preloader, Button } from "konsta/svelte";
  import { Copy, Check } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { haptic } from "$lib/utils/haptic.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface BackupCodesSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly regenerating?: boolean;
  }

  let {
    opened,
    ondismiss,
    regenerating = false,
  }: BackupCodesSheetProps = $props();

  let codes = $state<readonly string[]>([]);
  let loading = $state(false);
  let error = $state("");
  let wasOpen = $state(false);
  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (opened && !wasOpen) {
      codes = [];
      error = "";
      copied = false;
      clearTimeout(copyTimeout);
      void fetchCodes();
    }
    wasOpen = opened;
  });

  async function fetchCodes(): Promise<void> {
    loading = true;
    error = "";
    try {
      const result = await trpc.twoFactor.enroll.backupCodes.mutate();
      codes = result.codes;
    } catch {
      error = m.twofa_error_invalid_code();
    } finally {
      loading = false;
    }
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      haptic();
      copied = true;
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copied = false;
      }, 2000);
      const msg = m.twofa_backup_codes_copied();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
    } catch {
      // Clipboard API unavailable
    }
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.twofa_backup_codes_title()}
  title={m.twofa_backup_codes_title()}
>
  <div class="sheet-content">
    {#if loading}
      <div class="loading-state" role="status">
        <Preloader class="w-6 h-6" />
      </div>
    {:else if error !== ""}
      <p class="error-text" role="alert">{error}</p>
    {:else if codes.length > 0}
      {#if regenerating}
        <div class="warning-banner regen-warning" role="alert">
          <p>{m.twofa_backup_codes_regenerated()}</p>
        </div>
      {/if}

      <div class="warning-banner" role="alert">
        <p>{m.twofa_backup_codes_warning()}</p>
      </div>

      <div
        class="codes-grid"
        role="list"
        aria-label={m.twofa_backup_codes_title()}
      >
        {#each codes as code (code)}
          <div class="code-item" role="listitem">
            <code>{code}</code>
          </div>
        {/each}
      </div>

      <div class="copy-action">
        <Button
          tonal
          large
          class={copied ? "copied-btn" : ""}
          onclick={() => {
            void handleCopy();
          }}
        >
          {#if copied}
            <Check size={16} aria-hidden="true" />
            <span class="copy-label">{m.twofa_backup_codes_copied()}</span>
          {:else}
            <Copy size={16} aria-hidden="true" />
            <span class="copy-label">{m.twofa_backup_codes_copy()}</span>
          {/if}
        </Button>
      </div>
    {/if}
  </div>
</ShellSheet>

<style>
  .sheet-content {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
  }

  .loading-state {
    display: flex;
    justify-content: center;
    padding: var(--space-xl) 0;
  }

  .warning-banner {
    background: color-mix(
      in srgb,
      var(--k-color-red, #ef4444) 10%,
      transparent
    );
    border-radius: 0.5rem;
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .warning-banner p {
    color: var(--k-color-red, #ef4444);
    font-size: 0.85rem;
    margin: 0;
  }

  .regen-warning {
    background: color-mix(
      in srgb,
      var(--k-color-orange, #ff9500) 10%,
      transparent
    );
    margin-bottom: var(--space-sm);
  }

  .regen-warning p {
    color: var(--k-color-orange, #ff9500);
  }

  .codes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }

  .code-item {
    text-align: center;
    padding: var(--space-sm);
    border-radius: 0.375rem;
    background: color-mix(in srgb, var(--ink) 5%, transparent);
  }

  .code-item code {
    font-family: "Space Mono", ui-monospace, monospace;
    font-size: 0.9rem;
    letter-spacing: 0.05em;
  }

  .copy-action {
    display: flex;
    justify-content: center;
  }

  .copy-label {
    margin-left: var(--space-xs);
  }

  :global(.copied-btn) {
    opacity: 0.85;
  }

  .error-text {
    color: var(--k-color-red, #ef4444);
    font-size: 0.85rem;
    text-align: center;
    padding: var(--space-md) 0;
  }
</style>

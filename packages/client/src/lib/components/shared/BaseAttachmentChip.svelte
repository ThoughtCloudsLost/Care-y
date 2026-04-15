<!--
  Decryption-agnostic file attachment chip.

  Renders a Konsta Chip showing filename + formatted size, with a
  download callback provided by the caller. The caller (ticket or KB
  wrapper) owns the decrypt pipeline; this component handles display
  and download state only. No crypto, tRPC, or key material imports.
-->
<script lang="ts">
  import { Chip, Preloader } from "konsta/svelte";
  import { Paperclip } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatFileSize } from "$lib/utils/time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";

  interface Props {
    /** Attachment UUID. */
    attachmentId: string;
    /** Display filename (already decrypted by parent). */
    filename: string;
    /** File size in bytes. */
    sizeBytes: number;
    /** Called when the user taps the chip. Caller handles decryption. */
    ondownload: (attachmentId: string) => Promise<void>;
    /** When true, chip is non-interactive (e.g. crypto key not yet available). */
    disabled?: boolean;
  }

  let {
    attachmentId,
    filename,
    sizeBytes,
    ondownload,
    disabled = false,
  }: Props = $props();

  let downloading = $state(false);

  async function download(): Promise<void> {
    if (downloading || disabled) return;
    downloading = true;

    try {
      await ondownload(attachmentId);
    } finally {
      downloading = false;
    }
  }
</script>

<Chip
  outline
  class="attachment-chip mt-1 {downloading
    ? 'opacity-50 pointer-events-none'
    : ''}"
  role="button"
  tabindex={downloading || disabled ? -1 : 0}
  onclick={() => void download()}
  onkeydown={onKeyActivate(() => void download())}
  aria-label={downloading
    ? m.attachment_downloading({ filename })
    : m.attachment_download({ filename })}
  aria-busy={downloading}
  aria-disabled={downloading || disabled}
>
  {#snippet media()}
    {#if downloading}
      <Preloader class="attachment-preloader" />
    {:else}
      <Paperclip size={14} aria-hidden="true" class="attachment-icon" />
    {/if}
  {/snippet}
  <span class="attachment-name">{filename}</span>
  <span class="attachment-size">{formatFileSize(sizeBytes)}</span>
</Chip>

<style>
  .attachment-name {
    font-size: 0.8125rem;
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .attachment-size {
    font-size: 0.6875rem;
    color: var(--muted);
    margin-left: 0.25rem;
    white-space: nowrap;
  }

  :global(.attachment-preloader) {
    width: 14px !important;
    height: 14px !important;
  }
</style>

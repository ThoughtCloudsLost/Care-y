<!--
  File attachment Chip for the chat timeline.

  Renders inside a Konsta Message `text` snippet. Self-fetching on tap:
  receives attachment metadata as props, decrypts on demand when tapped
  (not eagerly), triggers browser download of decrypted file.

  Security: blob URL revoked immediately after download link click.
-->
<script lang="ts">
  import { Chip, Preloader } from "konsta/svelte";
  import { Paperclip } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatFileSize } from "$lib/utils/time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

  interface Props {
    /** Attachment UUID from AttachmentRecord. */
    attachmentId: string;
    /** Ticket UUID (for tk resolution). */
    ticketId: string;
    /** ECIES key wrap for this ticket's tk. */
    keyWrap: TicketKeyWrap | null;
    /** Display filename (decrypted by parent or fallback). */
    filename: string;
    /** File size in bytes. */
    sizeBytes: number;
  }

  let { attachmentId, ticketId, keyWrap, filename, sizeBytes }: Props =
    $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const bridge = getCryptoBridge();

  let downloading = $state(false);

  async function download(): Promise<void> {
    if (keyWrap === null || downloading) return;
    downloading = true;

    try {
      const { data: encryptedBase64 } =
        await ticketRouter.downloadAttachmentBlob.query({ attachmentId });

      const decryptedBuf = await bridge.decryptBlob(
        ticketId,
        keyWrap.ephemeralPoint,
        keyWrap.nonce,
        keyWrap.wrappedKey,
        encryptedBase64,
      );

      const blob = new Blob([decryptedBuf]);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);
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
  tabindex={downloading || keyWrap === null ? -1 : 0}
  onclick={() => void download()}
  onkeydown={onKeyActivate(() => void download())}
  aria-label={downloading
    ? m.ticket_downloading_attachment({ filename })
    : m.ticket_download_attachment({ filename })}
  aria-busy={downloading}
  aria-disabled={downloading || keyWrap === null}
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

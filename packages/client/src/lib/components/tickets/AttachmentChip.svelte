<!--
  Ticket-specific attachment chip. Thin wrapper around BaseAttachmentChip
  that injects the ECIES per-ticket decryption pipeline.

  Renders inside a Konsta Message `text` snippet. Decrypts on demand
  when tapped (not eagerly), triggers browser download of decrypted file.
-->
<script lang="ts">
  import BaseAttachmentChip from "$lib/components/shared/BaseAttachmentChip.svelte";
  import { downloadDecryptedAttachment } from "$lib/tickets/attachment-download.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { requireRouter } from "$lib/errors.js";
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

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const bridge = getCryptoBridge();

  async function handleDownload(aid: string): Promise<void> {
    if (keyWrap === null) return;
    await downloadDecryptedAttachment(aid, filename, {
      ticketRouter,
      bridge,
      ticketId,
      keyWrap,
    });
  }
</script>

<BaseAttachmentChip
  {attachmentId}
  {filename}
  {sizeBytes}
  ondownload={handleDownload}
  disabled={keyWrap === null}
/>

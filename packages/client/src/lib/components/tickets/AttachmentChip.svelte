<!--
  Ticket-specific attachment chip. Thin wrapper around BaseAttachmentChip
  that injects the ECIES per-ticket decryption pipeline.

  Renders inside a Konsta Message `text` snippet. Decrypts on demand
  when tapped (not eagerly), triggers browser download of decrypted file.
-->
<script lang="ts">
  import BaseAttachmentChip from "$lib/components/shared/BaseAttachmentChip.svelte";
  import { downloadDecryptedAttachment } from "$lib/tickets/attachment-download.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

  interface Props {
    attachmentId: string;
    ticketId: string;
    keyWrap: TicketKeyWrap | null;
    filename: string;
    sizeBytes: number;
  }

  let { attachmentId, ticketId, keyWrap, filename, sizeBytes }: Props =
    $props();

  const bridge = getCryptoBridge();

  async function handleDownload(aid: string): Promise<void> {
    if (keyWrap === null) return;
    await downloadDecryptedAttachment(aid, filename, {
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

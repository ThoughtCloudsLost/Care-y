<!--
  Attachment chip for blobs encrypted under a file key (ADR-089).

  The volunteer's CryptoBridge unwraps the file key wrap and decrypts
  the blob in a single Worker round-trip, then triggers a browser
  download through the shared utility.
-->
<script lang="ts">
  import BaseAttachmentChip from "$lib/components/shared/BaseAttachmentChip.svelte";
  import { fetchBlob } from "$lib/utils/fetch-blob.js";
  import { triggerBlobDownload } from "$lib/components/shared/attachment-download.js";
  import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

  interface Props {
    attachmentId: string;
    ticketId: string;
    /** Base64url file key wrap from the attachment record. */
    fileKeyWrap: string;
    /**
     * Decrypted filename, resolved by the caller through the follow-up
     * decrypt cache, or null while the decrypt is pending or the key is
     * unavailable.
     */
    filename: string | null;
    sizeBytes: number;
    bridge: CryptoBridge;
  }

  let {
    attachmentId,
    ticketId,
    fileKeyWrap,
    filename,
    sizeBytes,
    bridge,
  }: Props = $props();

  const displayName = $derived(filename ?? "...");

  async function handleDownload(aid: string): Promise<void> {
    const ciphertext = await fetchBlob(`/api/blobs/attachments/${aid}`);
    const decryptedBuf = await bridge.decryptAttachment(
      ticketId,
      aid,
      fileKeyWrap,
      ciphertext,
    );

    triggerBlobDownload(decryptedBuf, filename ?? "attachment");
  }
</script>

<BaseAttachmentChip
  {attachmentId}
  filename={displayName}
  {sizeBytes}
  ondownload={handleDownload}
/>

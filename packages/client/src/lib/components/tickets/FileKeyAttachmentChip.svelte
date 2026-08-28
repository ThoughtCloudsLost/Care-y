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
    /** Base64url encrypted filename, or null for MMS-origin rows. */
    encryptedFilename: string | null;
    sizeBytes: number;
    bridge: CryptoBridge;
  }

  let {
    attachmentId,
    ticketId,
    fileKeyWrap,
    encryptedFilename,
    sizeBytes,
    bridge,
  }: Props = $props();

  // The encrypted filename is opaque until the file is opened. Show a
  // generic placeholder in the chip until then.
  const displayName = $derived(encryptedFilename !== null ? "..." : "file");

  async function handleDownload(aid: string): Promise<void> {
    const ciphertext = await fetchBlob(`/api/blobs/attachments/${aid}`);
    const decryptedBuf = await bridge.decryptAttachment(
      ticketId,
      aid,
      fileKeyWrap,
      ciphertext,
    );

    // The Worker returns plaintext bytes; the filename rides the wrap
    // and is recovered there. The decryptAttachment protocol does not
    // surface the filename separately, so fall back to a generic name.
    triggerBlobDownload(decryptedBuf, "attachment");
  }
</script>

<BaseAttachmentChip
  {attachmentId}
  filename={displayName}
  {sizeBytes}
  ondownload={handleDownload}
/>

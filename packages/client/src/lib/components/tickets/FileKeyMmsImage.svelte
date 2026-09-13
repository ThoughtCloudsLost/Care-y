<!--
  Image thumbnail for blobs encrypted under a file key (ADR-089).

  Thin wrapper that builds a decrypt callback from the CryptoBridge's
  decryptAttachment method and passes it to MmsImage. The bridge
  unwraps the file key and decrypts the blob in a single Worker
  round-trip.
-->
<script lang="ts">
  import MmsImage from "./MmsImage.svelte";
  import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

  interface Props {
    attachmentId: string;
    ticketId: string;
    /** Base64url file key wrap from the attachment record. */
    fileKeyWrap: string;
    /** MIME content type for the blob URL. */
    contentType: string;
    bridge: CryptoBridge;
    alt: string;
    onopen: (imageUrl: string) => void;
  }

  let {
    attachmentId,
    ticketId,
    fileKeyWrap,
    contentType,
    bridge,
    alt,
    onopen,
  }: Props = $props();

  async function decryptBlob(ciphertext: ArrayBuffer): Promise<ArrayBuffer> {
    return bridge.decryptAttachment(
      ticketId,
      attachmentId,
      fileKeyWrap,
      ciphertext,
    );
  }
</script>

<MmsImage
  {attachmentId}
  {ticketId}
  {alt}
  {onopen}
  {contentType}
  decrypt={decryptBlob}
/>

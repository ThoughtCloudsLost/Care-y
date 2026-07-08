<!--
  MMS image thumbnail for the chat timeline.

  Renders inside a Konsta Message `text` snippet. Self-fetching: receives
  attachment metadata as props, fetches encrypted blob via tRPC, decrypts
  via CryptoBridge.decryptBlob, creates a blob URL for the thumbnail.

  Thumbnail constrained to 240x180 max. Tap emits `onopen` with the image
  blob URL so the route file can open a full-size lightbox via ShellPopup.

  Security: blob URL revoked on component unmount to prevent lingering
  decrypted content in memory.
-->
<script lang="ts">
  import { blobSlot } from "@care-y/crypto";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
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
    /** Alt text for the image. */
    alt: string;
    /** Called when the thumbnail is tapped. Route file opens lightbox. */
    onopen: (imageUrl: string) => void;
  }

  let { attachmentId, ticketId, keyWrap, alt, onopen }: Props = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const bridge = getCryptoBridge();

  let thumbnailUrl: string | null = $state(null);
  let hasError = $state(false);

  // --- Fetch + decrypt + create blob URL on mount ---
  $effect(() => {
    if (keyWrap === null) {
      hasError = true;
      return;
    }

    const ac = new AbortController();
    const aborted = (): boolean => ac.signal.aborted;
    let createdUrl: string | null = null;

    void (async () => {
      try {
        const { data: encryptedBase64 } =
          await ticketRouter.downloadAttachmentBlob.query({ attachmentId });
        if (aborted()) return;

        const decryptedBuf = await bridge.decryptBlob(
          ticketId,
          blobSlot(attachmentId),
          keyWrap.ephemeralPoint,
          keyWrap.nonce,
          keyWrap.wrappedKey,
          encryptedBase64,
        );
        if (aborted()) return;

        const blob = new Blob([decryptedBuf], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        createdUrl = url;
        thumbnailUrl = url;
      } catch {
        if (!aborted()) hasError = true;
      }
    })();

    return () => {
      ac.abort();
      if (createdUrl !== null) {
        URL.revokeObjectURL(createdUrl);
      }
      thumbnailUrl = null;
    };
  });

  function handleClick(): void {
    if (thumbnailUrl !== null) {
      onopen(thumbnailUrl);
    }
  }
</script>

{#if hasError}
  <div class="mms-error" role="status">
    <span class="mms-error-text">{m.error_decryption_failed()}</span>
  </div>
{:else if thumbnailUrl !== null}
  <button
    class="mms-thumbnail"
    onclick={handleClick}
    aria-label={m.ticket_mms_open_lightbox()}
    type="button"
  >
    <img src={thumbnailUrl} {alt} class="mms-img" draggable="false" />
  </button>
{:else}
  <div class="mms-placeholder">
    <DecryptPlaceholder mode="media" block />
  </div>
{/if}

<style>
  .mms-thumbnail {
    display: block;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    border-radius: 0.5rem;
    overflow: hidden;
    max-width: 240px;
    line-height: 0;
  }

  .mms-thumbnail:active {
    opacity: 0.8;
  }

  .mms-img {
    display: block;
    max-width: 240px;
    max-height: 180px;
    min-width: 64px;
    min-height: 64px;
    width: auto;
    height: auto;
    object-fit: cover;
    border-radius: 0.5rem;
    background: var(--surface-2);
  }

  .mms-placeholder {
    width: 240px;
    height: 180px;
    border-radius: 0.5rem;
  }

  .mms-error {
    width: 240px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background: var(--surface-2);
  }

  .mms-error-text {
    font-size: 0.75rem;
    color: var(--muted);
    font-style: italic;
  }

  @media (prefers-reduced-motion: reduce) {
    .mms-thumbnail {
      transition: none;
    }
  }
</style>

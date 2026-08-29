<!--
  Image thumbnail for the chat timeline (MMS, portal, and file-key paths).

  Two modes:

  1. Bridge mode (default): receives attachment metadata as props, fetches
     encrypted blob via the blob API, decrypts via CryptoBridge.decryptBlob,
     creates a blob URL for the thumbnail. Requires a live CryptoBridge.

  2. Injected-decrypt mode: the caller provides a `decrypt` function and
     optionally a `blobUrl` path. Used by the portal thread, which has no
     Worker and decrypts on the main thread.

  Thumbnail constrained to 240x180 max. Tap emits `onopen` with the image
  blob URL so the route file can open a full-size lightbox via ShellPopup.

  Security: blob URL revoked on component unmount to prevent lingering
  decrypted content in memory.
-->
<script lang="ts">
  import { blobSlot } from "@care-y/crypto";
  import * as m from "$lib/paraglide/messages.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import { fetchBlob } from "$lib/utils/fetch-blob.js";
  import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

  interface Props {
    /** Attachment UUID from AttachmentRecord. */
    attachmentId: string;
    /** Ticket UUID (for tk resolution). */
    ticketId: string;
    /** ECIES key wrap for this ticket's tk (bridge mode). */
    keyWrap?: TicketKeyWrap | null;
    /**
     * CryptoBridge for bridge mode, resolved by the org-side caller
     * (FollowUpMedia, PanelMediaSection), which already holds it. The
     * component reads no context itself, so it mounts on the portal
     * surface unchanged. Same injection pattern as FileKeyMmsImage.
     */
    bridge?: CryptoBridge | null;
    /** Alt text for the image. */
    alt: string;
    /** Called when the thumbnail is tapped. Route file opens lightbox. */
    onopen: (imageUrl: string) => void;
    /**
     * Optional decrypt callback. When provided, the component skips the
     * CryptoBridge entirely and calls this instead. The portal thread
     * supplies one because it has no Worker.
     */
    decrypt?: (ciphertext: ArrayBuffer) => ArrayBuffer | Promise<ArrayBuffer>;
    /**
     * Override the blob fetch URL. Defaults to the volunteer attachment
     * endpoint; the portal side passes the portal-scoped path instead.
     */
    blobUrl?: string;
    /** MIME content type for the resulting blob URL. Falls back to image/png. */
    contentType?: string;
    /** Extra headers to send with the blob fetch (portal credentials). */
    fetchHeaders?: Record<string, string>;
  }

  let {
    attachmentId,
    ticketId,
    keyWrap = null,
    bridge = null,
    alt,
    onopen,
    decrypt,
    blobUrl,
    contentType,
    fetchHeaders,
  }: Props = $props();

  let thumbnailUrl: string | null = $state(null);
  let hasError = $state(false);

  /**
   * The decrypt this mount should use, or null when it cannot decrypt yet.
   *
   * Bridge mode needs a key wrap, and null there means the key has not
   * arrived rather than that something failed. Returning one callback for
   * both modes keeps the fetch path from re-deciding per attempt.
   */
  function resolveDecrypt():
    ((ciphertext: ArrayBuffer) => ArrayBuffer | Promise<ArrayBuffer>) | null {
    if (decrypt !== undefined) return decrypt;
    if (bridge == null || keyWrap === null) return null;
    const wrap = keyWrap;
    const b = bridge;
    // Annotated with the same union the prop declares. The bridge branch
    // is always a promise and the portal branch never is, and the caller
    // awaits either, so the shared shape belongs on both.
    return (ciphertext: ArrayBuffer): ArrayBuffer | Promise<ArrayBuffer> =>
      b.decryptBlob(
        ticketId,
        blobSlot(attachmentId),
        wrap.ephemeralPoint,
        wrap.nonce,
        wrap.wrappedKey,
        ciphertext,
      );
  }

  // --- Fetch + decrypt + create blob URL on mount ---
  $effect(() => {
    // Resolve which decrypt this mount uses once, up front. Narrowing here
    // rather than at the call site is what keeps the bridge branch from
    // needing a non-null assertion on both the bridge and the key wrap.
    const open = resolveDecrypt();
    if (open === null) {
      hasError = true;
      return;
    }

    const ac = new AbortController();
    const aborted = (): boolean => ac.signal.aborted;
    let createdUrl: string | null = null;

    void (async () => {
      try {
        const fetchPath = blobUrl ?? `/api/blobs/attachments/${attachmentId}`;
        const ciphertext = await fetchBlob(fetchPath, ac.signal, fetchHeaders);
        if (aborted()) return;

        const decryptedBuf = await open(ciphertext);
        if (aborted()) return;

        const mimeType = contentType ?? "image/png";
        const blob = new Blob([decryptedBuf], { type: mimeType });
        const objectUrl = URL.createObjectURL(blob);
        createdUrl = objectUrl;
        thumbnailUrl = objectUrl;
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
    background: var(--paper-deep, var(--surface-2));
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
    background: var(--paper-deep, var(--surface-2));
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

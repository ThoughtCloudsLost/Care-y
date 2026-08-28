<!--
  Shared portal message thread.
  Renders messages using the pinned ConversationBubble anatomy (the same
  bubble the volunteer ticket thread uses). Direction mapping:
  from_client = sent (right, brand-soft), to_client = received (left, raised).

  Decryption: each message is ECIES-decrypted in the main thread.
  DecryptPlaceholder with locally built DecryptResult provides the
  loading/error/ready states.

  Attachments: each message may carry zero or more attachments, grouped
  by followupId. Images render as thumbnails via MmsImage (injected-decrypt
  mode); non-images render as BaseAttachmentChip with an ondownload that
  decrypts and triggers a browser save. Failed decryptions show the same
  placeholder a failed message does.
-->
<script lang="ts">
  import { portalMessageElementId } from "$lib/portal/portal-message-ids.js";
  import * as m from "$lib/paraglide/messages.js";
  import ConversationBubble from "$lib/components/tickets/ConversationBubble.svelte";
  import DateSeparator from "$lib/components/tickets/DateSeparator.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import MmsImage from "$lib/components/tickets/MmsImage.svelte";
  import BaseAttachmentChip from "$lib/components/shared/BaseAttachmentChip.svelte";
  import { triggerBlobDownload } from "$lib/components/shared/attachment-download.js";
  import { fetchBlob } from "$lib/utils/fetch-blob.js";
  import { needsDateSeparator, formatDateSeparator } from "$lib/utils/time.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import { LOADING, ERROR } from "$lib/crypto/decrypt-result.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import {
    decryptPortalMessage,
    decryptAttachmentKey,
    decryptAttachmentBlob,
    decodeEciesTriple,
  } from "$lib/portal/portal-crypto.js";
  import type { Scalar } from "@care-y/crypto";
  import { SvelteMap } from "svelte/reactivity";
  import { splitByTerm, isHighlightable } from "$lib/search/highlight.js";
  import type { PortalAttachmentWire } from "$lib/portal/portal-attachment-types.js";

  interface PortalMessageWire {
    readonly id: string;
    readonly followupId?: string;
    readonly direction: string;
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
    readonly createdAt: string;
    readonly editedAt: string | null;
  }

  interface PortalThreadProps {
    /** Messages from the bootstrap/polling response. */
    messages: readonly PortalMessageWire[];
    /** Client private key for ECIES decryption. */
    clientPrivate: Scalar;
    /** Whether messages are still loading from the server. */
    loading?: boolean;
    /** Flat list of attachments from the bootstrap response. */
    attachments?: readonly PortalAttachmentWire[];
    /** Channel credential for portal blob downloads. */
    channelId?: string;
    /** Channel auth token (raw bytes, base64url-encoded for the header). */
    channelAuth?: string;
    /** Ticket ID for AAD binding during attachment decryption. */
    ticketId?: string;
    /**
     * Org-set name shown above messages from the organization. Org-level
     * only: never a volunteer pseudonym or any per-person identity, which
     * is why the thread still renders no speaker for sent messages. Empty
     * falls back to the built-in wording.
     */
    supportLabel?: string;
    /** Term to highlight, when in-thread search is open. */
    searchTerm?: string;
    /** Message currently stepped to, drawn as the standing match. */
    activeMatchId?: string;
    /**
     * Reports which messages contain the term, in display order.
     *
     * Matching happens here because this is where the plaintext exists:
     * the page holds ciphertext and could not find a match if it tried.
     */
    onmatches?: (ids: readonly string[]) => void;
  }

  let {
    messages,
    clientPrivate,
    loading = false,
    attachments = [],
    channelId,
    channelAuth,
    ticketId,
    supportLabel = "",
    searchTerm,
    activeMatchId,
    onmatches,
  }: PortalThreadProps = $props();

  const highlighting = $derived(isHighlightable(searchTerm ?? ""));

  const speakerName = $derived(
    supportLabel.trim() !== "" ? supportLabel : m.portal_support_team(),
  );

  interface DecryptedMessage {
    readonly id: string;
    readonly followupId: string | undefined;
    readonly direction: string;
    readonly result: DecryptResult;
    readonly createdAt: string;
    readonly editedAt: string | null;
  }

  const decryptedMessages = $derived.by((): readonly DecryptedMessage[] => {
    if (loading) return [];
    return messages.map((msg): DecryptedMessage => {
      try {
        const triple = decodeEciesTriple(msg);
        const text = decryptPortalMessage(triple, clientPrivate);
        return {
          id: msg.id,
          followupId: msg.followupId,
          direction: msg.direction,
          result: { status: "ready" as const, value: text },
          createdAt: msg.createdAt,
          editedAt: msg.editedAt,
        };
      } catch {
        return {
          id: msg.id,
          followupId: msg.followupId,
          direction: msg.direction,
          result: ERROR,
          createdAt: msg.createdAt,
          editedAt: msg.editedAt,
        };
      }
    });
  });

  /** Index attachments by followupId for O(1) lookup per message. */
  const attachmentsByFollowup = $derived.by(
    (): ReadonlyMap<string, readonly PortalAttachmentWire[]> => {
      const map = new SvelteMap<string, PortalAttachmentWire[]>();
      for (const att of attachments) {
        const existing = map.get(att.followupId);
        if (existing !== undefined) {
          existing.push(att);
        } else {
          map.set(att.followupId, [att]);
        }
      }
      return map;
    },
  );

  /** Headers for portal blob downloads. Credentials travel in headers,
   *  never in the query string (ADR-089). */
  const portalHeaders = $derived.by((): Record<string, string> | undefined => {
    if (channelId === undefined || channelAuth === undefined) return undefined;
    return {
      "x-portal-channel": channelId,
      "x-portal-auth": channelAuth,
    };
  });

  /**
   * Build a decrypt callback for a portal image attachment.
   * Unwraps the file key from the ECIES triple, then decrypts the blob.
   * The key is zeroed after one use by decryptAttachmentBlob.
   */
  function makeImageDecrypt(
    att: PortalAttachmentWire,
  ): (ciphertext: ArrayBuffer) => ArrayBuffer {
    // Not async: portal decryption is synchronous on the main thread, so
    // this resolves an already-computed value. The bytes are copied into a
    // fresh buffer rather than handing out the view's backing store, which
    // may be larger than the plaintext.
    return (ciphertext: ArrayBuffer): ArrayBuffer => {
      const wrapTriple = decodeEciesTriple(att);
      const { fileKey } = decryptAttachmentKey(wrapTriple, clientPrivate);
      const plaintext = decryptAttachmentBlob(
        new Uint8Array(ciphertext),
        fileKey,
        ticketId ?? "",
        att.attachmentId,
      );
      const out = new ArrayBuffer(plaintext.byteLength);
      // care-y-ignore-next-line no-plaintext-db-write -- TypedArray.set copying decrypted bytes into a fresh buffer for a blob URL; this component has no database access
      new Uint8Array(out).set(plaintext);
      return out;
    };
  }

  /**
   * Download handler for non-image attachments. Fetches the blob,
   * unwraps the file key, decrypts, and triggers a browser save.
   */
  async function handleAttachmentDownload(
    att: PortalAttachmentWire,
  ): Promise<void> {
    const headers = portalHeaders;
    const blobPath = `/api/blobs/portal-attachments/${att.attachmentId}`;
    const ciphertext = await fetchBlob(blobPath, undefined, headers);

    const wrapTriple = decodeEciesTriple(att);
    const { fileKey, filename } = decryptAttachmentKey(
      wrapTriple,
      clientPrivate,
    );
    const plaintext = decryptAttachmentBlob(
      new Uint8Array(ciphertext),
      fileKey,
      ticketId ?? "",
      att.attachmentId,
    );

    triggerBlobDownload(plaintext, filename);
  }

  const matchIds = $derived.by((): readonly string[] => {
    if (!highlighting) return [];
    const term = (searchTerm ?? "").toLowerCase();
    return decryptedMessages
      .filter(
        (msg) =>
          msg.result.status === "ready" &&
          msg.result.value.toLowerCase().includes(term),
      )
      .map((msg) => msg.id);
  });

  $effect(() => {
    onmatches?.(matchIds);
  });

  function bubbleDirection(dir: string): "sent" | "received" {
    return dir === "from_client" ? "sent" : "received";
  }

  function bubbleAriaLabel(msg: DecryptedMessage): string {
    const isSent = msg.direction === "from_client";
    const label = isSent ? m.portal_you() : speakerName;
    const time = formatRelativeTime(new Date(msg.createdAt));
    return `${label}, ${time}`;
  }

  /**
   * Eagerly decrypt the filename from the ECIES wrap so the chip
   * can display it. Returns an error flag when decryption fails.
   */
  function decryptAttachmentName(
    att: PortalAttachmentWire,
  ): { filename: string; error: false } | { filename: string; error: true } {
    try {
      const wrapTriple = decodeEciesTriple(att);
      const { filename } = decryptAttachmentKey(wrapTriple, clientPrivate);
      return { filename, error: false };
    } catch {
      return { filename: "", error: true };
    }
  }
</script>

<div
  role="log"
  aria-label={m.portal_title()}
  class="portal-thread"
  data-testid="portal-thread"
>
  {#if loading}
    <div class="portal-messages" data-testid="portal-loading">
      {#each [1, 2, 3] as i (i)}
        <ConversationBubble
          direction="received"
          timestamp={new Date().toISOString()}
        >
          <DecryptPlaceholder result={LOADING} length={40} />
        </ConversationBubble>
      {/each}
    </div>
  {:else if decryptedMessages.length === 0}
    <div class="empty-state" data-testid="portal-empty-state">
      <p>{m.portal_empty_thread()}</p>
    </div>
  {:else}
    <p class="expiry-note">{m.portal_expiry_note()}</p>
    <div class="portal-messages">
      <!-- Keyed by id, not index: prepending an older page renumbers every
           index, which would re-render the whole thread and lose the scroll
           anchor the paginator just measured. -->
      {#each decryptedMessages as msg, idx (msg.id)}
        {@const isSent = msg.direction === "from_client"}
        {@const prevAt =
          idx > 0 ? decryptedMessages[idx - 1]?.createdAt : undefined}
        {@const msgAttachments =
          msg.followupId !== undefined
            ? (attachmentsByFollowup.get(msg.followupId) ?? [])
            : []}
        {#if needsDateSeparator(msg.createdAt, prevAt)}
          <DateSeparator label={formatDateSeparator(msg.createdAt)} />
        {/if}
        <div
          id={portalMessageElementId(msg.id)}
          class="portal-bubble-wrapper"
          class:portal-bubble-active={msg.id === activeMatchId}
          role="article"
          aria-label={bubbleAriaLabel(msg)}
        >
          <ConversationBubble
            direction={bubbleDirection(msg.direction)}
            speaker={isSent ? undefined : speakerName}
            timestamp={msg.createdAt}
            editedAt={msg.editedAt}
          >
            {#if msg.result.status === "ready"}
              {#if highlighting}
                {#each splitByTerm(msg.result.value, searchTerm ?? "") as seg, i (i)}
                  {#if seg.highlight}<mark>{seg.text}</mark
                    >{:else}{seg.text}{/if}
                {/each}
              {:else}
                {msg.result.value}
              {/if}
            {:else}
              <DecryptPlaceholder result={msg.result} length={30} />
            {/if}

            <!-- Attachments grouped onto this message -->
            {#if msgAttachments.length > 0}
              <div class="portal-attachments" data-testid="portal-attachments">
                {#each msgAttachments as att (att.attachmentId)}
                  {#if att.contentType?.startsWith("image/")}
                    <MmsImage
                      attachmentId={att.attachmentId}
                      ticketId={ticketId ?? ""}
                      alt={m.portal_attachment_image()}
                      onopen={() => {
                        /* lightbox not yet wired on the portal side */
                      }}
                      decrypt={makeImageDecrypt(att)}
                      blobUrl={`/api/blobs/portal-attachments/${att.attachmentId}`}
                      contentType={att.contentType}
                      fetchHeaders={portalHeaders}
                    />
                  {:else}
                    {@const chipState = decryptAttachmentName(att)}
                    {#if chipState.error}
                      <div class="att-error" role="status">
                        <span class="att-error-text"
                          >{m.error_decryption_failed()}</span
                        >
                      </div>
                    {:else}
                      <BaseAttachmentChip
                        attachmentId={att.attachmentId}
                        filename={chipState.filename}
                        sizeBytes={att.sizeBytes}
                        ondownload={async () => handleAttachmentDownload(att)}
                      />
                    {/if}
                  {/if}
                {/each}
              </div>
            {/if}
          </ConversationBubble>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Grows to fill the scroll region so the empty state centers in the
     available space. Scrolling belongs to the PageLayout region above,
     not here; a second scroller would swallow it.

     There is no message-bar reservation: PortalComposer renders inline,
     in normal flow below this element, so padding for an overlaid bar
     would only add a gap. */
  .portal-thread {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .portal-messages {
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding: 16px;
    padding-left: calc(16px + env(safe-area-inset-left, 0px));
    padding-right: calc(16px + env(safe-area-inset-right, 0px));
  }

  .portal-bubble-wrapper {
    display: contents;
  }

  /* The wrapper is display:contents, so the standing match is marked on
     the bubble inside it rather than on the wrapper itself. */
  .portal-bubble-active :global(.msg) {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  .portal-bubble-wrapper :global(mark) {
    background: var(--brand-soft);
    color: inherit;
    border-radius: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .portal-bubble-active :global(.msg) {
      transition: none;
    }
  }

  .empty-state {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: var(--space-xl);
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.6;
  }

  .expiry-note {
    text-align: center;
    font-size: var(--text-xs, 0.75rem);
    color: var(--muted);
    padding: var(--space-md) var(--space-lg);
    margin: 0;
  }

  .portal-attachments {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }

  .att-error {
    padding: 6px 10px;
    border-radius: 0.5rem;
    background: var(--paper-deep, var(--surface-2));
  }

  .att-error-text {
    font-size: 0.75rem;
    color: var(--muted);
    font-style: italic;
  }
</style>

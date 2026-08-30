<!--
  Shared portal message thread.
  Renders messages using the pinned ConversationBubble anatomy (the same
  bubble the volunteer ticket thread uses). Direction mapping:
  from_client = sent (right, brand-soft), to_client = received (left, raised).

  ADR-091: decryption runs in the portal Worker via the bridge. The page
  passes decrypt/attachment callbacks rather than a private key. Plaintext
  rendering behavior is unchanged.

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
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
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

  /**
   * Bridge-backed decrypt callback. The page wires this to
   * session.decryptMessage, keeping the thread free of worker imports.
   */
  type DecryptMessageFn = (
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ) => Promise<string>;

  /**
   * Bridge-backed attachment key decrypt callback.
   */
  type DecryptAttachmentKeyFn = (
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ) => Promise<{ fileKey: string; filename: string }>;

  /**
   * Bridge-backed attachment blob decrypt callback.
   */
  type DecryptAttachmentBlobFn = (
    ciphertext: ArrayBuffer,
    fileKey: string,
    ticketId: string,
    attachmentId: string,
  ) => Promise<ArrayBuffer>;

  interface PortalThreadProps {
    /** Messages from the bootstrap/polling response. */
    messages: readonly PortalMessageWire[];
    /** Decrypt a message ECIES triple via the portal Worker bridge. */
    decryptMessage: DecryptMessageFn;
    /** Decrypt an attachment key via the portal Worker bridge. */
    decryptAttachmentKey: DecryptAttachmentKeyFn;
    /** Decrypt an attachment blob via the portal Worker bridge. */
    decryptAttachmentBlob: DecryptAttachmentBlobFn;
    /** Whether messages are still loading from the server. */
    loading?: boolean;
    /**
     * Why the message query failed, when it did. Renders a distinct state
     * in the empty-thread slot so a failed load never reads as "no
     * messages yet". "rate_limited" names the wait explicitly; the page
     * schedules the retry, this component only explains the pause.
     */
    loadError?: "rate_limited" | "generic" | null;
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
    /** Active type filter values (mirrors org thread filter contract). */
    filterTypes?: readonly string[];
    /** Active author filter values ("__client__" or "__support__"). */
    filterAuthors?: readonly string[];
    /** Date range start for message filtering. */
    filterDateFrom?: Date | null;
    /** Date range end for message filtering. */
    filterDateTo?: Date | null;
    /** Called when the user clears all filters (for the empty-filter-state). */
    onclearfilters?: () => void;
  }

  let {
    messages,
    decryptMessage,
    decryptAttachmentKey,
    decryptAttachmentBlob,
    loading = false,
    loadError = null,
    attachments = [],
    channelId,
    channelAuth,
    ticketId,
    supportLabel = "",
    searchTerm,
    activeMatchId,
    onmatches,
    filterTypes = [],
    filterAuthors = [],
    filterDateFrom = null,
    filterDateTo = null,
    onclearfilters,
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

  // Async decrypt cache: messages are decrypted via the worker bridge.
  // The SvelteMap holds results that update reactively as decryption
  // completes. Each message is decrypted at most once per identity.
  const decryptCache = new SvelteMap<string, DecryptResult>();

  // Track in-flight decrypt promises to avoid double-dispatching.
  const pendingDecrypts = new SvelteSet<string>();

  $effect(() => {
    if (loading) return;
    for (const msg of messages) {
      if (decryptCache.has(msg.id) || pendingDecrypts.has(msg.id)) continue;
      pendingDecrypts.add(msg.id);
      decryptCache.set(msg.id, LOADING);
      void decryptMessage(msg.ephemeralPoint, msg.nonce, msg.ciphertext)
        .then((text: string) => {
          decryptCache.set(msg.id, { status: "ready" as const, value: text });
        })
        .catch(() => {
          decryptCache.set(msg.id, ERROR);
        })
        .finally(() => {
          pendingDecrypts.delete(msg.id);
        });
    }
  });

  const decryptedMessages = $derived.by((): readonly DecryptedMessage[] => {
    if (loading) return [];
    return messages.map((msg): DecryptedMessage => ({
      id: msg.id,
      followupId: msg.followupId,
      direction: msg.direction,
      result: decryptCache.get(msg.id) ?? LOADING,
      createdAt: msg.createdAt,
      editedAt: msg.editedAt,
    }));
  });

  // ── Filtering ──

  /** followupIds that carry at least one image attachment. */
  const imageFollowupIds = $derived.by((): ReadonlySet<string> => {
    const ids = new SvelteSet<string>();
    for (const att of attachments) {
      if (att.contentType?.startsWith("image/") === true) {
        ids.add(att.followupId);
      }
    }
    return ids;
  });

  /** followupIds that carry at least one non-image attachment. */
  const fileFollowupIds = $derived.by((): ReadonlySet<string> => {
    const ids = new SvelteSet<string>();
    for (const att of attachments) {
      if (att.contentType !== null && !att.contentType.startsWith("image/")) {
        ids.add(att.followupId);
      }
    }
    return ids;
  });

  const hasActiveFilters = $derived(
    filterTypes.length > 0 ||
      filterAuthors.length > 0 ||
      filterDateFrom !== null ||
      filterDateTo !== null,
  );

  /** Apply type, author, and date filters to decrypted messages. */
  const filteredMessages = $derived.by((): readonly DecryptedMessage[] => {
    if (!hasActiveFilters) return decryptedMessages;

    return decryptedMessages.filter((msg): boolean => {
      // Author filter
      if (filterAuthors.length > 0) {
        const authorKey =
          msg.direction === "from_client" ? "__client__" : "__support__";
        if (!filterAuthors.includes(authorKey)) return false;
      }

      // Date filter
      if (filterDateFrom !== null || filterDateTo !== null) {
        const msgDate = new Date(msg.createdAt);
        if (filterDateFrom !== null && msgDate < filterDateFrom) return false;
        if (filterDateTo !== null) {
          // Exclusive next-midnight bound instead of a mutated 23:59:59
          // Date (svelte/prefer-svelte-reactivity forbids Date mutation).
          const nextMidnight = new Date(
            filterDateTo.getFullYear(),
            filterDateTo.getMonth(),
            filterDateTo.getDate() + 1,
          );
          if (msgDate >= nextMidnight) return false;
        }
      }

      // Type filter
      if (filterTypes.length > 0) {
        const hasImage =
          msg.followupId !== undefined && imageFollowupIds.has(msg.followupId);
        const hasFile =
          msg.followupId !== undefined && fileFollowupIds.has(msg.followupId);

        let typeMatch = false;
        for (const ft of filterTypes) {
          if (ft === "message") {
            typeMatch = true;
            break;
          }
          if (ft === "__images__" && hasImage) {
            typeMatch = true;
            break;
          }
          if (ft === "__files__" && hasFile) {
            typeMatch = true;
            break;
          }
        }
        if (!typeMatch) return false;
      }

      return true;
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
   * Unwraps the file key from the ECIES triple via the bridge, then
   * decrypts the blob. Both operations run in the portal Worker.
   */
  function makeImageDecrypt(
    att: PortalAttachmentWire,
  ): (ciphertext: ArrayBuffer) => Promise<ArrayBuffer> {
    return async (ciphertext: ArrayBuffer): Promise<ArrayBuffer> => {
      const { fileKey } = await decryptAttachmentKey(
        att.ephemeralPoint,
        att.nonce,
        att.ciphertext,
      );
      return decryptAttachmentBlob(
        ciphertext,
        fileKey,
        ticketId ?? "",
        att.attachmentId,
      );
    };
  }

  /**
   * Download handler for non-image attachments. Fetches the blob,
   * unwraps the file key via the bridge, decrypts via the bridge,
   * and triggers a browser save.
   */
  async function handleAttachmentDownload(
    att: PortalAttachmentWire,
  ): Promise<void> {
    const headers = portalHeaders;
    const blobPath = `/api/blobs/portal-attachments/${att.attachmentId}`;
    const ciphertext = await fetchBlob(blobPath, undefined, headers);

    const { fileKey, filename } = await decryptAttachmentKey(
      att.ephemeralPoint,
      att.nonce,
      att.ciphertext,
    );
    const plaintext = await decryptAttachmentBlob(
      ciphertext,
      fileKey,
      ticketId ?? "",
      att.attachmentId,
    );

    triggerBlobDownload(new Uint8Array(plaintext), filename);
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
   * Async attachment-name cache. Eagerly decrypt each attachment's
   * filename from the ECIES wrap via the bridge so the chip can
   * display it. The SvelteMap is reactive, so the template re-reads
   * as results arrive.
   */
  type AttNameResult =
    | { status: "loading" }
    | { status: "ready"; filename: string }
    | { status: "error" };

  const attNameCache = new SvelteMap<string, AttNameResult>();
  const pendingAttNames = new SvelteSet<string>();

  $effect(() => {
    for (const att of attachments) {
      if (
        att.contentType !== null &&
        !att.contentType.startsWith("image/") &&
        !attNameCache.has(att.attachmentId) &&
        !pendingAttNames.has(att.attachmentId)
      ) {
        pendingAttNames.add(att.attachmentId);
        attNameCache.set(att.attachmentId, { status: "loading" });
        void decryptAttachmentKey(att.ephemeralPoint, att.nonce, att.ciphertext)
          .then(({ filename }) => {
            attNameCache.set(att.attachmentId, {
              status: "ready",
              filename,
            });
          })
          .catch(() => {
            attNameCache.set(att.attachmentId, { status: "error" });
          })
          .finally(() => {
            pendingAttNames.delete(att.attachmentId);
          });
      }
    }
  });

  function getAttachmentName(
    attId: string,
  ): { filename: string; error: false } | { filename: string; error: true } {
    const cached = attNameCache.get(attId);
    if (cached === undefined || cached.status === "loading") {
      return { filename: "", error: false };
    }
    if (cached.status === "error") {
      return { filename: "", error: true };
    }
    return { filename: cached.filename, error: false };
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
  {:else if loadError !== null && decryptedMessages.length === 0}
    <!-- Failed load with nothing cached: never fall through to the empty
         state, which would read as "no messages yet" for a full thread. -->
    <div class="empty-state" data-testid="portal-load-error" role="status">
      <p>
        {loadError === "rate_limited"
          ? m.portal_thread_rate_limited()
          : m.portal_thread_load_error()}
      </p>
    </div>
  {:else if decryptedMessages.length === 0}
    <div class="empty-state" data-testid="portal-empty-state">
      <p>{m.portal_empty_thread()}</p>
    </div>
  {:else if hasActiveFilters && filteredMessages.length === 0}
    <div class="empty-state" data-testid="portal-filter-empty">
      <p>{m.portal_filter_empty()}</p>
      {#if onclearfilters}
        <button
          type="button"
          class="clear-filter-link"
          onclick={onclearfilters}
          data-testid="portal-filter-clear"
        >
          {m.portal_filter_clear()}
        </button>
      {/if}
    </div>
  {:else}
    <p class="expiry-note">{m.portal_expiry_note()}</p>
    <div class="portal-messages">
      <!-- Keyed by id, not index: prepending an older page renumbers every
           index, which would re-render the whole thread and lose the scroll
           anchor the paginator just measured. -->
      {#each filteredMessages as msg, idx (msg.id)}
        {@const isSent = msg.direction === "from_client"}
        {@const prevAt =
          idx > 0 ? filteredMessages[idx - 1]?.createdAt : undefined}
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
                    {@const chipState = getAttachmentName(att.attachmentId)}
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
    flex-direction: column;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    min-height: 200px;
    padding: var(--space-xl);
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.6;
  }

  .clear-filter-link {
    appearance: none;
    border: none;
    background: none;
    color: var(--brand-text);
    font-weight: 600;
    font-size: var(--text-sm);
    cursor: pointer;
    padding: 4px 8px;
    min-height: 44px;
    display: flex;
    align-items: center;
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

<!--
  Shared portal message thread.
  Renders messages using the pinned ConversationBubble anatomy (the same
  bubble the volunteer ticket thread uses). Direction mapping:
  from_client = sent (right, brand-soft), to_client = received (left, raised).

  ADR-091: decryption runs in the portal Worker via the bridge. The page
  passes decrypt/attachment callbacks rather than a private key. Plaintext
  rendering behavior is unchanged.

  ADR-092: the thread merges three entry kinds by createdAt:
  - Sealed messages (existing, with decrypt + highlight + search)
  - Voicemail recordings (ECIES-wrapped blob, played via VoicemailPlayer)
  - Plaintext call entries (rendered via CallEntry, no decryption)

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
  import VoicemailPlayer from "$lib/components/tickets/VoicemailPlayer.svelte";
  import CallEntry from "$lib/components/tickets/CallEntry.svelte";
  import CorrectionBody from "$lib/components/tickets/CorrectionBody.svelte";
  import { parseContactCorrection } from "@care-y/shared";
  import { triggerBlobDownload } from "$lib/components/shared/attachment-download.js";
  import { fetchBlob } from "$lib/utils/fetch-blob.js";
  import { needsDateSeparator, formatDateSeparator } from "$lib/utils/time.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import { LOADING, ERROR } from "$lib/crypto/decrypt-result.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { splitByTerm, isHighlightable } from "$lib/search/highlight.js";
  import { Node as PMNode, DOMSerializer } from "prosemirror-model";
  import { emailSchema } from "$lib/editor/email-schema.js";
  import { sanitizeArticleHtml } from "$lib/utils/render-article.js";
  import type {
    PortalAttachmentWire,
    PortalRecordingWire,
    PortalCallEntry,
  } from "$lib/portal/portal-attachment-types.js";

  interface PortalMessageWire {
    readonly id: string;
    readonly followupId?: string;
    readonly direction: string;
    /** Originating follow-up type (e.g. "message", "email_outbound"). */
    readonly type?: string | null;
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
    /** Voicemail recordings from the bootstrap response (ADR-092). */
    recordings?: readonly PortalRecordingWire[];
    /** Plaintext call log entries from the bootstrap response (ADR-092). */
    callEntries?: readonly PortalCallEntry[];
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
    recordings = [],
    callEntries = [],
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

  // ── Discriminated union for merged timeline entries ──

  interface MessageEntry {
    readonly kind: "message";
    readonly id: string;
    readonly followupId: string | undefined;
    readonly direction: string;
    readonly type: string | null;
    readonly result: DecryptResult;
    readonly createdAt: string;
    readonly editedAt: string | null;
  }

  interface VoicemailEntry {
    readonly kind: "voicemail";
    readonly id: string;
    readonly recordingId: string;
    readonly direction: string;
    readonly durationSeconds: number | null;
    readonly ephemeralPoint: string;
    readonly nonce: string;
    readonly ciphertext: string;
    readonly createdAt: string;
  }

  interface CallEntryItem {
    readonly kind: "call_entry";
    readonly id: string;
    readonly source: string;
    readonly callStatus: string | null;
    readonly callDurationSeconds: number | null;
    readonly createdAt: string;
  }

  type TimelineEntry = MessageEntry | VoicemailEntry | CallEntryItem;

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

  const decryptedMessages = $derived.by((): readonly MessageEntry[] => {
    if (loading) return [];
    return messages.map((msg): MessageEntry => ({
      kind: "message",
      id: msg.id,
      followupId: msg.followupId,
      direction: msg.direction,
      type: msg.type ?? null,
      result: decryptCache.get(msg.id) ?? LOADING,
      createdAt: msg.createdAt,
      editedAt: msg.editedAt,
    }));
  });

  const voicemailEntries = $derived.by((): readonly VoicemailEntry[] => {
    return recordings.map((rec): VoicemailEntry => ({
      kind: "voicemail",
      id: `recording-${rec.recordingId}`,
      recordingId: rec.recordingId,
      direction: rec.direction,
      durationSeconds: rec.durationSeconds,
      ephemeralPoint: rec.ephemeralPoint,
      nonce: rec.nonce,
      ciphertext: rec.ciphertext,
      createdAt: rec.createdAt,
    }));
  });

  const callEntryItems = $derived.by((): readonly CallEntryItem[] => {
    return callEntries.map((ce): CallEntryItem => ({
      kind: "call_entry",
      id: `call-${ce.id}`,
      source: ce.source,
      callStatus: ce.callStatus,
      callDurationSeconds: ce.callDurationSeconds,
      createdAt: ce.createdAt,
    }));
  });

  /** True when the thread has any content at all (messages, recordings, or call entries). */
  const hasAnyContent = $derived(
    decryptedMessages.length > 0 ||
      voicemailEntries.length > 0 ||
      callEntryItems.length > 0,
  );

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

  /** Apply author and date filters to any entry kind. */
  function passesAuthorDateFilter(entry: TimelineEntry): boolean {
    // Author filter
    if (filterAuthors.length > 0) {
      let authorKey: string;
      if (entry.kind === "call_entry") {
        authorKey = entry.source === "client" ? "__client__" : "__support__";
      } else {
        authorKey =
          entry.direction === "from_client" ? "__client__" : "__support__";
      }
      if (!filterAuthors.includes(authorKey)) return false;
    }

    // Date filter
    if (filterDateFrom !== null || filterDateTo !== null) {
      const entryDate = new Date(entry.createdAt);
      if (filterDateFrom !== null && entryDate < filterDateFrom) return false;
      if (filterDateTo !== null) {
        const nextMidnight = new Date(
          filterDateTo.getFullYear(),
          filterDateTo.getMonth(),
          filterDateTo.getDate() + 1,
        );
        if (entryDate >= nextMidnight) return false;
      }
    }

    return true;
  }

  /** Merged and sorted timeline of all three entry kinds, post-filter. */
  const filteredEntries = $derived.by((): readonly TimelineEntry[] => {
    // Build the merged list from all three sources
    const merged: TimelineEntry[] = [
      ...decryptedMessages,
      ...voicemailEntries,
      ...callEntryItems,
    ];

    // Sort by createdAt ascending (oldest first)
    merged.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    if (!hasActiveFilters) return merged;

    return merged.filter((entry): boolean => {
      if (!passesAuthorDateFilter(entry)) return false;

      // Type filter
      if (filterTypes.length > 0) {
        if (entry.kind === "call_entry") {
          // Call entries only show when no type filter is active
          return false;
        }

        if (entry.kind === "voicemail") {
          // Voicemail entries match "__files__"
          return filterTypes.includes("__files__");
        }

        // Message entries use the existing attachment-aware type matching
        const msg = entry;
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
   * Build a decrypt callback for a portal voicemail recording (ADR-092).
   * Same ECIES unwrap as attachments: the recording's portal wrap
   * decodes through decryptAttachmentKey (yields { fileKey, filename: "" })
   * and the blob through decryptAttachmentBlob with the recording id
   * in the attachmentId position for AAD binding.
   */
  function makeRecordingDecrypt(
    rec: VoicemailEntry,
  ): (ciphertext: ArrayBuffer) => Promise<ArrayBuffer> {
    return async (ciphertext: ArrayBuffer): Promise<ArrayBuffer> => {
      const { fileKey } = await decryptAttachmentKey(
        rec.ephemeralPoint,
        rec.nonce,
        rec.ciphertext,
      );
      return decryptAttachmentBlob(
        ciphertext,
        fileKey,
        ticketId ?? "",
        rec.recordingId,
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

  // Search matches only consider message entries (voicemail and call entries
  // have no plaintext body to search).
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

  /** Call entries side by source, not direction. */
  function callEntryDirection(source: string): "sent" | "received" {
    return source === "client" ? "sent" : "received";
  }

  function entryAriaLabel(entry: TimelineEntry): string {
    const time = formatRelativeTime(new Date(entry.createdAt));
    if (entry.kind === "call_entry") {
      const isSent = entry.source === "client";
      const label = isSent ? m.portal_you() : speakerName;
      return `${label}, ${time}`;
    }
    if (entry.kind === "voicemail") {
      return `${m.ticket_panel_voicemail_item()}, ${time}`;
    }
    const isSent = entry.direction === "from_client";
    const label = isSent ? m.portal_you() : speakerName;
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

  /**
   * Parse an email_outbound JSON payload into subject + sanitized body HTML.
   * Returns null when the payload is not valid email JSON (triggers the
   * plain-text fallback in the template). Mirrors the parsing logic in
   * FollowUpBubble for org-thread parity.
   */
  function parseEmailPayload(
    raw: string,
  ): { subject: string; bodyHtml: string } | null {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("subject" in parsed) ||
        !("doc" in parsed)
      )
        return null;
      const subject = typeof parsed.subject === "string" ? parsed.subject : "";
      const pmDoc = PMNode.fromJSON(emailSchema, parsed.doc);
      const serializer = DOMSerializer.fromSchema(emailSchema);
      const fragment = serializer.serializeFragment(pmDoc.content);
      const div = document.createElement("div");
      div.appendChild(fragment);
      const bodyHtml = sanitizeArticleHtml(div.innerHTML);
      return { subject, bodyHtml };
    } catch {
      return null;
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
  {:else if loadError !== null && !hasAnyContent}
    <!-- Failed load with nothing cached: never fall through to the empty
         state, which would read as "no messages yet" for a full thread. -->
    <div class="empty-state" data-testid="portal-load-error" role="status">
      <p>
        {loadError === "rate_limited"
          ? m.portal_thread_rate_limited()
          : m.portal_thread_load_error()}
      </p>
    </div>
  {:else if !hasAnyContent}
    <div class="empty-state" data-testid="portal-empty-state">
      <p>{m.portal_empty_thread()}</p>
    </div>
  {:else if hasActiveFilters && filteredEntries.length === 0}
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
      {#each filteredEntries as entry, idx (entry.id)}
        {@const prevAt =
          idx > 0 ? filteredEntries[idx - 1]?.createdAt : undefined}
        {#if needsDateSeparator(entry.createdAt, prevAt)}
          <DateSeparator label={formatDateSeparator(entry.createdAt)} />
        {/if}

        {#if entry.kind === "message"}
          {@const isSent = entry.direction === "from_client"}
          {@const msgAttachments =
            entry.followupId !== undefined
              ? (attachmentsByFollowup.get(entry.followupId) ?? [])
              : []}
          <div
            id={portalMessageElementId(entry.id)}
            class="portal-bubble-wrapper"
            class:portal-bubble-active={entry.id === activeMatchId}
            role="article"
            aria-label={entryAriaLabel(entry)}
          >
            <ConversationBubble
              direction={bubbleDirection(entry.direction)}
              speaker={isSent ? undefined : speakerName}
              timestamp={entry.createdAt}
              editedAt={entry.editedAt}
            >
              {#if entry.result.status === "ready"}
                {@const portalCorrectionPayload = parseContactCorrection(
                  entry.result.value,
                )}
                {@const emailContent =
                  entry.type === "email_outbound"
                    ? parseEmailPayload(entry.result.value)
                    : null}
                {#if portalCorrectionPayload !== null}
                  <CorrectionBody payload={portalCorrectionPayload} />
                {:else if entry.type === "email_outbound" && emailContent !== null}
                  <span
                    class="email-bubble-subject"
                    data-testid="portal-email-subject"
                  >
                    {m.ticket_email_subject_label({
                      subject: emailContent.subject,
                    })}
                  </span>
                  <span
                    class="email-bubble-body"
                    data-testid="portal-email-body"
                  >
                    <!-- care-y-ignore-next-line no-decrypt-in-html -- bodyHtml passes through sanitizeArticleHtml (DOMPurify with PURIFY_CONFIG allowlist) before render; same accepted pattern as FollowUpBubble.svelte -->
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized by sanitizeArticleHtml (DOMPurify with PURIFY_CONFIG allowlist) -->
                    {@html emailContent.bodyHtml}
                  </span>
                {:else if entry.type === "email_outbound"}
                  <!-- Malformed email JSON fallback: render as plain text -->
                  <span class="bubble-text">{entry.result.value}</span>
                {:else if highlighting}
                  {#each splitByTerm(entry.result.value, searchTerm ?? "") as seg, i (i)}
                    {#if seg.highlight}<mark>{seg.text}</mark
                      >{:else}{seg.text}{/if}
                  {/each}
                {:else}
                  {entry.result.value}
                {/if}
              {:else}
                <DecryptPlaceholder result={entry.result} length={30} />
              {/if}

              <!-- Attachments grouped onto this message -->
              {#if msgAttachments.length > 0}
                <div
                  class="portal-attachments"
                  data-testid="portal-attachments"
                >
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
        {:else if entry.kind === "voicemail"}
          <div
            id={portalMessageElementId(entry.id)}
            class="portal-bubble-wrapper"
            role="article"
            aria-label={entryAriaLabel(entry)}
            data-testid="portal-voicemail-entry"
          >
            <ConversationBubble
              direction={bubbleDirection(entry.direction)}
              speaker={entry.direction === "from_client"
                ? undefined
                : speakerName}
              timestamp={entry.createdAt}
            >
              <VoicemailPlayer
                blobUrl={`/api/blobs/portal-recordings/${entry.recordingId}`}
                fetchHeaders={portalHeaders}
                decrypt={makeRecordingDecrypt(entry)}
                durationSeconds={entry.durationSeconds}
              />
            </ConversationBubble>
          </div>
        {:else if entry.kind === "call_entry"}
          <div
            id={portalMessageElementId(entry.id)}
            class="portal-bubble-wrapper"
            role="article"
            aria-label={entryAriaLabel(entry)}
            data-testid="portal-call-entry"
          >
            <ConversationBubble
              direction={callEntryDirection(entry.source)}
              timestamp={entry.createdAt}
            >
              <CallEntry
                source={entry.source}
                callStatus={entry.callStatus}
                callDurationSeconds={entry.callDurationSeconds}
              />
            </ConversationBubble>
          </div>
        {/if}
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

  /* Email entry styles (parity with FollowUpBubble email_outbound) */

  .email-bubble-subject {
    display: block;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 0.25em;
    font-size: 0.8125rem;
  }

  .email-bubble-body {
    display: block;
    color: var(--ink);
  }

  .email-bubble-body :global(p) {
    margin: 0 0 0.375em;
  }

  .email-bubble-body :global(ul),
  .email-bubble-body :global(ol) {
    margin: 0.25em 0;
    padding-left: 1.5em;
  }

  .email-bubble-body :global(a) {
    color: var(--brand-accent, var(--ink));
    text-decoration: underline;
  }
</style>

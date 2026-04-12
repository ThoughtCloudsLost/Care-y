<!--
  Unified ticket panel content: ticket description, metadata, actions,
  media gallery, notes, and recent ticket history in a single view.

  Replaces the former ClientInfoContent + TicketActionsContent overlays.
  This is a CONTENT component: no Popup/Sheet shell imports.
  The route file wraps this in ShellPopup.

  Self-contained: reads ticket, attachments, recordings, and follow-ups
  from TanStack Query cache (same keys as TicketDetail, deduplicated).
  Decrypts notes and volunteer names via Svelte context caches.

  Layout follows the iOS Contacts card pattern: prominent call button,
  metadata list, state toggles, then content sections.
-->
<script lang="ts">
  import {
    Block,
    BlockTitle,
    Button,
    List,
    ListItem,
    Toggle,
  } from "konsta/svelte";
  import {
    Phone,
    StickyNote,
    Paperclip,
    FileText,
    FileArchive,
    FileSpreadsheet,
    FileHeadphone,
    FilePlay,
    File,
  } from "@lucide/svelte";
  import type { Component } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import StatusDot from "$lib/components/StatusDot.svelte";
  import MmsImage from "$lib/components/tickets/MmsImage.svelte";
  import VoicemailPlayer from "$lib/components/tickets/VoicemailPlayer.svelte";
  import LoadMore from "$lib/components/ui/LoadMore.svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { formatDuration, formatFileSize } from "$lib/utils/time.js";
  import type { DisplayStatus } from "$lib/tickets/display-status.js";
  import { createQuery } from "@tanstack/svelte-query";
  import { createPaginatedQuery } from "$lib/query/paginated.svelte.js";
  import { trpc } from "$lib/trpc/index.js";
  import { createVolunteersQuery } from "$lib/tickets/queries.js";
  import {
    getCurrentUserId,
    getCryptoBridge,
    getFollowUpDecryptCache,
    getOrgDecryptCache,
    getTicketDecryptCache,
  } from "$lib/crypto/context.js";
  import { SvelteSet } from "svelte/reactivity";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";

  export type TicketAction =
    | "call"
    | "take"
    | "release"
    | "assign"
    | "hold"
    | "unhold"
    | "close"
    | "reopen"
    | "watch"
    | "unwatch"
    | "cancel";

  interface TicketPanelContentProps {
    ticketId: string;
    onaction: (action: TicketAction) => void;
    /** Emitted when a note is tapped. Route closes panel and scrolls to it. */
    onnotetap?: (noteId: string) => void;
    /** Emitted when an image thumbnail is tapped. Route opens lightbox. */
    onlightbox?: (imageUrl: string) => void;
  }

  let { ticketId, onaction, onnotetap, onlightbox }: TicketPanelContentProps =
    $props();

  // --- Context + caches ---

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const bridge = getCryptoBridge();
  const ticketCache = getTicketDecryptCache();
  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());

  // --- TanStack queries (same keys as TicketDetail, deduplicated) ---

  const ticketQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId],
    queryFn: async () => ticketRouter.get.query({ ticketId }),
  }));

  const notesQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "followUps", "notes"],
    queryFn: async () =>
      ticketRouter.listFollowUps.query({
        ticketId,
        types: ["internal_note"],
        limit: 100,
        direction: "older",
      }),
    enabled: ticketId !== "",
  }));

  const attachmentsQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "attachments"],
    queryFn: async () =>
      ticketRouter.listAttachments.query({ ticketId, limit: 50 }),
    enabled: ticketId !== "",
  }));

  const recordingsQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "recordings"],
    queryFn: async () =>
      ticketRouter.listRecordings.query({ ticketId, limit: 50 }),
    enabled: ticketId !== "",
  }));

  const watchingQuery = createQuery(() => ({
    queryKey: ["isWatching", ticketId],
    queryFn: async () => ticketRouter.isWatching.query({ ticketId }),
    enabled: ticketId !== "",
  }));

  const volunteersQuery = createVolunteersQuery(ticketRouter);

  // --- Paginated wrappers ---

  const NOTES_LIMIT = 100;
  const RECORDINGS_LIMIT = 50;
  const ATTACHMENTS_LIMIT = 50;

  const notesPaginated = createPaginatedQuery({
    query: notesQuery,
    limit: NOTES_LIMIT,
    fetchPage: async (cursor) =>
      ticketRouter.listFollowUps.query({
        ticketId,
        types: ["internal_note"],
        limit: NOTES_LIMIT,
        direction: "older",
        cursor,
      }),
    getCursor: (note) => note.id,
  });

  const recordingsPaginated = createPaginatedQuery({
    query: recordingsQuery,
    limit: RECORDINGS_LIMIT,
    fetchPage: async (cursor) =>
      ticketRouter.listRecordings.query({
        ticketId,
        limit: RECORDINGS_LIMIT,
        cursor,
      }),
    getCursor: (rec) => rec.id,
  });

  const attachmentsPaginated = createPaginatedQuery({
    query: attachmentsQuery,
    limit: ATTACHMENTS_LIMIT,
    fetchPage: async (cursor) =>
      ticketRouter.listAttachments.query({
        ticketId,
        limit: ATTACHMENTS_LIMIT,
        cursor,
      }),
    getCursor: (att) => att.id,
  });

  // --- Derived ticket state ---

  const ticket = $derived(ticketQuery.data);
  const keyWrap = $derived(ticket?.keyWrap ?? null);
  const ticketStatus = $derived(ticket?.status ?? "open");
  const isOnHold = $derived(ticket?.onHold ?? false);
  const isAssignedToMe = $derived(
    currentUserId !== undefined && ticket?.assignedTo === currentUserId,
  );
  const isWatching = $derived(watchingQuery.data ?? false);

  const displayStatus = $derived<DisplayStatus>(
    isOnHold ? "hold" : ticketStatus === "closed" ? "closed" : "active",
  );

  const statusLabel = $derived(
    isOnHold
      ? m.ticket_action_hold()
      : ticketStatus === "closed"
        ? m.ticket_action_close()
        : m.ticket_action_open(),
  );

  // Decrypt ticket title via shared cache.
  const decryptedTitle = $derived.by(() => {
    if (ticket == null) return undefined;
    const raw = ticketCache.decryptTitle(
      ticket.id,
      ticket.keyWrap,
      ticket.encryptedTitle,
    );
    if (raw === undefined || isDecryptError(raw)) return undefined;
    return raw;
  });

  // --- Notes (internal_note follow-ups) ---

  const notes = $derived(notesPaginated.items);

  function resolveVolunteerName(userId: string | null): string | undefined {
    if (userId === null) return undefined;
    const volunteers = volunteersQuery.data;
    if (!Array.isArray(volunteers)) return undefined;
    const vol = volunteers.find((v) => v.id === userId);
    if (!vol) return undefined;
    return (
      orgCache.decrypt(`volunteer:${vol.id}`, vol.encryptedDisplayName) ??
      undefined
    );
  }

  function decryptNoteContent(
    noteId: string,
    encryptedContent: Parameters<typeof followUpCache.decryptContent>[2],
  ): string | undefined {
    if (keyWrap === null) return undefined;
    const result = followUpCache.decryptContent(
      noteId,
      keyWrap,
      encryptedContent,
    );
    if (isDecryptError(result)) return undefined;
    return result;
  }

  // --- Media: split by type ---

  const attachments = $derived(attachmentsPaginated.items);
  const recordings = $derived(recordingsPaginated.items);

  const imageAttachments = $derived(
    attachments.filter((a) => a.contentType?.startsWith("image/") === true),
  );
  const fileAttachments = $derived(
    attachments.filter((a) => a.contentType?.startsWith("image/") !== true),
  );

  // --- File type helpers ---

  /** Map MIME content type to a Lucide icon component. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function fileIcon(ct: string | null): Component<any> {
    if (ct === null || ct === "") return File;
    if (ct.startsWith("text/")) return FileText;
    if (ct === "application/pdf") return FileText;
    if (ct === "application/msword") return FileText;
    if (
      ct ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return FileText;
    if (
      ct === "application/zip" ||
      ct === "application/gzip" ||
      ct === "application/x-tar" ||
      ct === "application/x-7z-compressed" ||
      ct === "application/x-rar-compressed"
    )
      return FileArchive;
    if (
      ct === "application/vnd.ms-excel" ||
      ct ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      ct === "text/csv"
    )
      return FileSpreadsheet;
    if (ct.startsWith("audio/")) return FileHeadphone;
    if (ct.startsWith("video/")) return FilePlay;
    return Paperclip;
  }

  /** Extract short label from MIME type (e.g. "application/pdf" -> "PDF"). */
  const MIME_LABELS = new Map<string, string>([
    ["application/pdf", "PDF"],
    ["application/zip", "ZIP"],
    ["application/gzip", "GZIP"],
    ["application/x-tar", "TAR"],
    ["application/x-7z-compressed", "7Z"],
    ["application/x-rar-compressed", "RAR"],
    ["application/vnd.ms-excel", "XLS"],
    [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "XLSX",
    ],
    ["application/msword", "DOC"],
    [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "DOCX",
    ],
    ["application/vnd.ms-powerpoint", "PPT"],
    [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "PPTX",
    ],
    ["text/plain", "TXT"],
    ["text/csv", "CSV"],
    ["text/html", "HTML"],
    ["application/json", "JSON"],
    ["application/xml", "XML"],
  ]);

  function fileTypeLabel(ct: string | null): string {
    if (ct === null || ct === "") return "";
    const known = MIME_LABELS.get(ct);
    if (known !== undefined) return known;
    // Fallback: use the subtype after the slash
    const sub = ct.split("/")[1];
    if (sub === undefined || sub === "") return "";
    return sub.replace(/^x-/, "").toUpperCase();
  }

  /** Decrypt an attachment's encrypted filename. Returns the name or undefined while pending. */
  function decryptFilename(
    attId: string,
    encryptedFilename:
      | Parameters<typeof followUpCache.decryptContent>[2]
      | null,
  ): string | undefined {
    if (keyWrap === null || encryptedFilename === null) return undefined;
    const result = followUpCache.decryptContent(
      `filename:${attId}`,
      keyWrap,
      encryptedFilename,
    );
    if (isDecryptError(result)) return undefined;
    return result;
  }

  // --- File download ---

  const downloadingFiles = new SvelteSet<string>();

  async function downloadFile(
    attachmentId: string,
    filename: string,
  ): Promise<void> {
    if (keyWrap === null || downloadingFiles.has(attachmentId)) return;
    downloadingFiles.add(attachmentId);

    try {
      const { data: encryptedBase64 } =
        await ticketRouter.downloadAttachmentBlob.query({ attachmentId });

      const decryptedBuf = await bridge.decryptBlob(
        ticketId,
        keyWrap.ephemeralPoint,
        keyWrap.nonce,
        keyWrap.wrappedKey,
        encryptedBase64,
      );

      const blob = new Blob([decryptedBuf]);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      downloadingFiles.delete(attachmentId);
    }
  }
</script>

<div class="panel-content">
  <!-- Ticket title / description -->
  {#if ticketQuery.isLoading}
    <Block class="!my-0 !mt-2">
      <p class="ticket-title">
        <DecryptPlaceholder length={20} />
      </p>
    </Block>
  {:else if decryptedTitle}
    <Block class="!my-0 !mt-2">
      <p class="ticket-title">{decryptedTitle}</p>
    </Block>
  {/if}

  <!-- Call button -->
  <Block class="!my-3">
    <Button large onclick={() => onaction("call")}>
      <Phone size={18} aria-hidden="true" class="call-icon" />
      {m.ticket_panel_call()}
    </Button>
  </Block>

  <!-- Ticket metadata -->
  <List strong inset class="!my-3">
    <ListItem title={m.ticket_panel_status()}>
      {#snippet after()}
        {#if ticketQuery.isLoading}
          <InlineSkeleton width="6ch" />
        {:else}
          <span class="status-after">
            <StatusDot status={displayStatus} />
            <span class="status-label">{statusLabel}</span>
          </span>
        {/if}
      {/snippet}
    </ListItem>
    <ListItem title={m.ticket_panel_opened()}>
      {#snippet after()}
        {#if ticketQuery.isLoading}
          <InlineSkeleton width="4ch" />
        {:else if ticket?.createdAt}
          {formatRelativeTime(new Date(ticket.createdAt))}
        {/if}
      {/snippet}
    </ListItem>
  </List>

  <!-- Internal notes (only shown when notes exist) -->
  {#if notesQuery.isLoading}
    <BlockTitle class="!mt-6 !-mb-2">{m.ticket_panel_notes()}</BlockTitle>
    <List strong inset class="!my-3">
      {#each [1, 2] as n (n)}
        <ListItem>
          {#snippet title()}
            <InlineSkeleton width="8ch" />
          {/snippet}
          {#snippet subtitle()}
            <DecryptPlaceholder length={40} />
          {/snippet}
          {#snippet media()}
            <StickyNote size={18} aria-hidden="true" class="list-icon" />
          {/snippet}
        </ListItem>
      {/each}
    </List>
  {:else if notes.length > 0}
    <BlockTitle class="!mt-6 !-mb-2">{m.ticket_panel_notes()}</BlockTitle>
    <List strong inset class="!my-3">
      {#each notes as note (note.id)}
        {@const content = decryptNoteContent(note.id, note.encryptedContent)}
        {@const authorName =
          resolveVolunteerName(note.createdBy) ??
          m.ticket_private_note_author_fallback()}
        <ListItem
          link
          title={authorName}
          after={formatRelativeTime(new Date(note.createdAt))}
          onclick={() => onnotetap?.(note.id)}
          class="note-item"
        >
          {#snippet subtitle()}
            <DecryptPlaceholder
              {content}
              ciphertext={note.encryptedContent}
              length={40}
            />
          {/snippet}
          {#snippet media()}
            <StickyNote size={18} aria-hidden="true" class="list-icon" />
          {/snippet}
        </ListItem>
      {/each}
    </List>
    <LoadMore
      hasMore={notesPaginated.hasMore}
      loading={notesPaginated.loading}
      onloadmore={() => void notesPaginated.loadMore()}
    />
  {/if}

  <!-- Ticket actions -->
  <List strong inset class="!my-3">
    <ListItem title={m.ticket_action_take()}>
      {#snippet after()}
        <Toggle
          checked={isAssignedToMe}
          onChange={() => onaction(isAssignedToMe ? "release" : "take")}
        />
      {/snippet}
    </ListItem>
    <ListItem title={m.ticket_action_hold()}>
      {#snippet after()}
        <Toggle
          checked={isOnHold}
          onChange={() => onaction(isOnHold ? "unhold" : "hold")}
        />
      {/snippet}
    </ListItem>
    <ListItem title={m.ticket_action_watch()}>
      {#snippet after()}
        <Toggle
          checked={isWatching}
          onChange={() => onaction(isWatching ? "unwatch" : "watch")}
        />
      {/snippet}
    </ListItem>
  </List>

  <List strong inset class="!my-3">
    <ListItem
      link
      chevron
      title={m.ticket_action_assign()}
      onclick={() => onaction("assign")}
    />
    <ListItem
      link
      title={ticketStatus === "open"
        ? m.ticket_action_close()
        : m.ticket_action_reopen()}
      onclick={() => onaction(ticketStatus === "open" ? "close" : "reopen")}
    >
      {#snippet after()}
        <span class="destructive-text">
          {ticketStatus === "open"
            ? m.ticket_action_close()
            : m.ticket_action_reopen()}
        </span>
      {/snippet}
    </ListItem>
  </List>

  <!-- Voicemails -->
  {#if recordings.length > 0}
    <BlockTitle class="!mt-6 !-mb-2">{m.ticket_panel_voicemails()}</BlockTitle>
    <Block strong inset class="!my-3">
      {#each recordings as rec (rec.id)}
        <div class="voicemail-row">
          <VoicemailPlayer
            recordingId={rec.id}
            {ticketId}
            {keyWrap}
            durationSeconds={rec.durationSeconds}
          />
          <span class="media-time">
            {formatRelativeTime(new Date(rec.createdAt))}
          </span>
        </div>
      {/each}
    </Block>
    <LoadMore
      hasMore={recordingsPaginated.hasMore}
      loading={recordingsPaginated.loading}
      onloadmore={() => void recordingsPaginated.loadMore()}
    />
  {/if}

  <!-- Images -->
  {#if attachmentsQuery.isLoading}
    <BlockTitle class="!mt-6 !-mb-2">{m.ticket_panel_media()}</BlockTitle>
    <Block strong inset class="!my-3">
      <div class="image-grid">
        {#each [1, 2] as n (n)}
          <div class="image-cell">
            <div class="media-placeholder"></div>
          </div>
        {/each}
      </div>
    </Block>
  {:else if imageAttachments.length > 0}
    <BlockTitle class="!mt-6 !-mb-2">{m.ticket_panel_media()}</BlockTitle>
    <Block strong inset class="!my-3">
      <div class="image-grid">
        {#each imageAttachments as att (att.id)}
          <div class="image-cell">
            <MmsImage
              attachmentId={att.id}
              {ticketId}
              {keyWrap}
              alt={m.ticket_mms_image()}
              onopen={(url: string) => onlightbox?.(url)}
            />
            <span class="media-time">
              {formatRelativeTime(new Date(att.createdAt))}
            </span>
          </div>
        {/each}
      </div>
    </Block>
  {/if}

  <!-- File attachments -->
  {#if fileAttachments.length > 0}
    <BlockTitle class="!mt-6 !-mb-2">{m.ticket_panel_files()}</BlockTitle>
    <Block strong inset class="!my-3">
      <div class="file-grid">
        {#each fileAttachments as att (att.id)}
          {@const filename = decryptFilename(att.id, att.encryptedFilename)}
          {@const Icon = fileIcon(att.contentType)}
          <div class="file-cell">
            <button
              type="button"
              class="file-tile-frame"
              class:downloading={downloadingFiles.has(att.id)}
              aria-label={m.ticket_download_attachment({
                filename: filename ?? "file",
              })}
              aria-busy={downloadingFiles.has(att.id)}
              onclick={() => void downloadFile(att.id, filename ?? "file")}
            >
              <div class="file-tile-inner">
                {#if filename}
                  <span class="tile-filename" title={filename}>{filename}</span>
                {/if}
                <div class="tile-icon">
                  <Icon size={28} aria-hidden="true" />
                </div>
                <div class="tile-meta">
                  <span class="tile-label"
                    >{fileTypeLabel(att.contentType)}</span
                  >
                  <span class="tile-detail"
                    >{formatFileSize(att.sizeBytes)}</span
                  >
                </div>
              </div>
            </button>
            <span class="media-time">
              {formatRelativeTime(new Date(att.createdAt))}
            </span>
          </div>
        {/each}
      </div>
    </Block>
  {/if}

  <!-- Shared "Load more" for combined attachments (images + files) -->
  {#if imageAttachments.length > 0 || fileAttachments.length > 0}
    <LoadMore
      hasMore={attachmentsPaginated.hasMore}
      loading={attachmentsPaginated.loading}
      onloadmore={() => void attachmentsPaginated.loadMore()}
    />
  {/if}

  <!-- Empty state when no media at all -->
  {#if !attachmentsQuery.isLoading && !recordingsQuery.isLoading && imageAttachments.length === 0 && recordings.length === 0 && fileAttachments.length === 0}
    <BlockTitle class="!mt-6 !-mb-2">{m.ticket_panel_media()}</BlockTitle>
    <Block strong inset class="!my-3">
      <p class="empty-text">{m.ticket_panel_no_media()}</p>
    </Block>
  {/if}

  <!-- Recent tickets -->
  <BlockTitle class="!mt-6 !-mb-2">{m.ticket_recent_history()}</BlockTitle>
  <Block strong inset class="!my-3 !mb-8">
    <p class="empty-text">{m.ticket_panel_recent_coming_soon()}</p>
  </Block>
</div>

<style>
  .panel-content {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .ticket-title {
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--ink);
    margin: 0;
  }

  :global(.call-icon) {
    margin-right: 0.5rem;
  }

  /* Metadata helpers */
  .status-after {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .status-label {
    font-size: var(--text-sm);
    text-transform: capitalize;
  }

  .destructive-text {
    color: #ef4444;
    font-size: var(--text-sm);
  }

  :global(.list-icon) {
    color: var(--muted);
  }

  /* Notes: truncate content to 2 lines */
  :global(.note-item .text-sm) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Voicemail rows: standalone player + timestamp */
  .voicemail-row {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.25rem 0;
  }

  .voicemail-row:not(:last-child) {
    border-bottom: 1px solid var(--surface-2);
    padding-bottom: 0.5rem;
    margin-bottom: 0.25rem;
  }

  /* Shared timestamp for all media items */
  .media-time {
    font-size: 0.625rem;
    color: var(--muted);
    white-space: nowrap;
  }

  /* Image grid: 3-column with timestamps below each image */
  .image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.375rem;
  }

  .image-cell {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    align-items: center;
  }

  .media-placeholder {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 0.375rem;
    background: var(--surface-2);
  }

  /* Constrain MmsImage thumbnails within grid cells */
  .image-cell :global(.mms-thumbnail),
  .image-cell :global(.mms-img) {
    max-width: 100%;
    max-height: none;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }

  .image-cell :global(.mms-placeholder) {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }

  .image-cell :global(.mms-error) {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }

  /* File grid: same 3-column layout as images */
  .file-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.375rem;
    align-items: start;
  }

  .file-cell {
    display: flex;
    flex-direction: column;
    gap: 0.0625rem;
    align-items: center;
  }

  /* padding-bottom trick: the frame enforces a perfect square
     regardless of content. The inner div is positioned absolutely
     to fill it, so content never affects the frame height. */
  .file-tile-frame {
    width: 100%;
    padding-bottom: 100%;
    position: relative;
    border-radius: 0.5rem;
    background: var(--surface-2);
    overflow: hidden;
    border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .file-tile-frame:active {
    opacity: 0.7;
  }

  .file-tile-frame.downloading {
    opacity: 0.5;
    pointer-events: none;
  }

  .file-tile-inner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.375rem;
  }

  .tile-icon {
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tile-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.0625rem;
    width: 100%;
  }

  .tile-filename {
    font-size: 0.5625rem;
    color: var(--ink);
    max-width: 100%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tile-label {
    font-size: 0.5625rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .tile-detail {
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--ink);
  }

  .empty-text {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
    padding: 0.5rem 0;
  }
</style>

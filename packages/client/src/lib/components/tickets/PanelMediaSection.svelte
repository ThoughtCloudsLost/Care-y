<!--
  Media section for the ticket panel. Owns attachment and recording queries,
  pagination, image/file grids, voicemail players, download logic, and
  the empty state. Gets crypto caches from Svelte context.
-->
<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import MmsImage from "$lib/components/tickets/MmsImage.svelte";
  import VoicemailPlayer from "$lib/components/tickets/VoicemailPlayer.svelte";
  import LoadMore from "$lib/components/ui/LoadMore.svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { formatFileSize } from "$lib/utils/time.js";
  import { createQuery } from "@tanstack/svelte-query";
  import { createPaginatedQuery } from "$lib/query/paginated.svelte.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    downloadDecryptedAttachment,
    fileIcon,
    fileTypeLabel,
  } from "$lib/tickets/attachment-download.js";
  import {
    getCryptoBridge,
    getFollowUpDecryptCache,
  } from "$lib/crypto/context.js";
  import { SvelteSet } from "svelte/reactivity";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";

  interface PanelMediaSectionProps {
    ticketId: string;
    keyWrap: TicketKeyWrap | null;
    onlightbox?: (imageUrl: string) => void;
  }

  let { ticketId, keyWrap, onlightbox }: PanelMediaSectionProps = $props();

  // --- Context caches ---

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const bridge = getCryptoBridge();
  const followUpCache = getFollowUpDecryptCache();

  // --- Queries ---

  const attachmentsQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "attachments"],
    queryFn: async () =>
      ticketRouter.listAttachments.query({ ticketId, limit: 50 }),
    enabled: ticketId !== "" && keyWrap !== null,
  }));

  const recordingsQuery = createQuery(() => ({
    queryKey: ["ticket", ticketId, "recordings"],
    queryFn: async () =>
      ticketRouter.listRecordings.query({ ticketId, limit: 50 }),
    enabled: ticketId !== "" && keyWrap !== null,
  }));

  // --- Paginated wrappers ---

  const RECORDINGS_LIMIT = 50;
  const ATTACHMENTS_LIMIT = 50;

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

  // --- Derived state ---

  const attachments = $derived(attachmentsPaginated.items);
  const recordings = $derived(recordingsPaginated.items);

  const imageAttachments = $derived(
    attachments.filter((a) => a.contentType?.startsWith("image/") === true),
  );
  const fileAttachments = $derived(
    attachments.filter((a) => a.contentType?.startsWith("image/") !== true),
  );

  // --- Decrypt ---

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
      await downloadDecryptedAttachment(attachmentId, filename, {
        ticketRouter,
        bridge,
        ticketId,
        keyWrap,
      });
    } finally {
      downloadingFiles.delete(attachmentId);
    }
  }
</script>

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
                <span class="tile-label">{fileTypeLabel(att.contentType)}</span>
                <span class="tile-detail">{formatFileSize(att.sizeBytes)}</span>
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

<style>
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

  .media-time {
    font-size: 0.625rem;
    color: var(--muted);
    white-space: nowrap;
  }

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

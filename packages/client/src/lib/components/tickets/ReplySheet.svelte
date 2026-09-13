<!--
  Quick reply sheet opened from ticket list cards.

  Shows preview messages (from the card's already-decrypted data) and the
  shared TicketCompose bar for composing. Volunteers choose a channel
  (Reply, Text, Internal Note) from the + menu before composing.

  After send: optimistic bubble, 1.5s delay, then auto-dismiss.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { followupSlot } from "@care-y/crypto";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getCryptoBridge,
    getFollowUpDecryptCache,
    getOrgDecryptCache,
    getCurrentUserId,
  } from "$lib/crypto/context.js";
  import type { ReactionSummary, ReactionType } from "@care-y/shared";
  import { resolveAsyncDecrypt } from "$lib/crypto/decrypt-result.js";
  import { requireRouter } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { createNoteTypesQuery } from "$lib/tickets/queries.js";
  import {
    createReactionsQuery,
    writeReactionToCache,
  } from "$lib/tickets/create-reactions-query.svelte.js";
  import { createSendMessage } from "$lib/composables/ticket-detail/create-send-message.svelte.js";
  import {
    buildPendingFollowUpEntry,
    type FollowUpListEntry,
  } from "$lib/composables/ticket-detail/pending-follow-up.js";
  import { createSmsSend } from "$lib/composables/ticket-detail/create-sms-send.svelte.js";
  import { createAttachmentUpload } from "$lib/composables/ticket-detail/create-attachment-upload.svelte.js";
  import { createExposureHint } from "$lib/composables/ticket-detail/create-exposure-hint.svelte.js";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { Chip } from "konsta/svelte";
  import { X } from "@lucide/svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import FollowUpBubble from "$lib/components/tickets/FollowUpBubble.svelte";
  import TicketCompose from "$lib/components/tickets/TicketCompose.svelte";
  import type { TicketComposeHandle } from "$lib/components/tickets/ticket-compose-types.js";
  import ComposeActions from "$lib/components/tickets/ComposeActions.svelte";
  import ExposureHint from "$lib/components/tickets/ExposureHint.svelte";
  import {
    getDraftForMode,
    setDraftForMode,
    clearDraftForMode,
  } from "$lib/tickets/draft-store.svelte.js";
  import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
  import {
    groupConsecutive,
    isFollowUpGroup,
    followUpGroupKey,
  } from "$lib/tickets/follow-up-utils.js";
  import SystemEvent from "$lib/components/tickets/SystemEvent.svelte";

  interface ReplySheetProps {
    opened: boolean;
    ticketId: string;
    clientAlias: string | null;
    hasPhone: boolean;
    /** Whether the client has an active portal channel (gates in-app reply). */
    portalCapable?: boolean;
    /** Base64-encoded client public key from the active portal channel, if any. */
    clientPublic?: string | null;
    previewFollowUps: RawFollowUpPreview[] | undefined;
    followUpCount: number;
    /** When true, a contact correction is pending for this ticket. */
    hasUnacknowledgedCorrection?: boolean;
    ondismiss: () => void;
    onsent: (ticketId: string) => void;
  }

  let {
    opened,
    ticketId,
    clientAlias,
    hasPhone,
    portalCapable = false,
    clientPublic = null,
    previewFollowUps,
    followUpCount,
    hasUnacknowledgedCorrection: correctionPending = false,
    ondismiss,
    onsent,
  }: ReplySheetProps = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const cryptoBridge = getCryptoBridge();
  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const currentUserId = $derived(currentUserIdGetter());
  const queryClient = useQueryClient();

  // ── Compose (shared TicketCompose owns mode, drafts, and mentions) ──

  let compose = $state<TicketComposeHandle>();
  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Attachment upload ──

  const attachmentUpload = createAttachmentUpload({
    getTicketId: () => ticketId,
    getClientPublic: () => clientPublic ?? null,
    cryptoBridge,
    uploadMutate: async (args) => ticketRouter.uploadAttachment.mutate(args),
  });

  // ── Exposure hint ──

  const exposureHint = createExposureHint();

  // ── SMS send (composable) ──

  const sms = createSmsSend({
    getTicketId: () => ticketId,
    cryptoBridge,
    queryClient,
    getClientPublic: () => clientPublic ?? null,
    createFollowUpMutate: async (args) =>
      ticketRouter.createFollowUp.mutate(args),
    onSuccess: () => {
      haptic();
      toastStore.show(m.ticket_toast_message_sent());
      dismissTimer = setTimeout(() => {
        dismissTimer = null;
        clearDraftForMode(ticketId, "sms");
        compose?.reset();
        onsent(ticketId);
      }, 1500);
    },
  });

  // ── Reactions ──

  const replyReactions = createReactionsQuery({
    getNoteIds: () =>
      opened && previewFollowUps
        ? previewFollowUps
            .filter((fu) => fu.type === "internal_note")
            .map((fu) => fu.id)
        : [],
    fetchReactions: async (followUpIds, signal) =>
      ticketRouter.getReactions.query({ followUpIds }, { signal }),
  });

  function handleToggleReaction(
    followUpId: string,
    reaction: ReactionType,
  ): void {
    void ticketRouter.toggleReaction
      .mutate({ followUpId, reaction })
      .then((updated: ReactionSummary[]) => {
        writeReactionToCache(queryClient, followUpId, updated);
      })
      .catch((_e: unknown) => {
        /* best-effort */
      });
  }

  // ── Note types ──

  const noteTypesQuery = ticketRouter.noteTypes
    ? createNoteTypesQuery(ticketRouter.noteTypes)
    : undefined;

  function effectiveTypeId(noteTypeId: string | null): string | undefined {
    if (!noteTypesQuery?.data) return undefined;
    if (noteTypeId !== null) return noteTypeId;
    return noteTypesQuery.data.defaultNoteTypeId ?? undefined;
  }

  function resolveNoteTypeName(noteTypeId: string | null): string | undefined {
    const id = effectiveTypeId(noteTypeId);
    if (id === undefined || !noteTypesQuery?.data) return undefined;
    const nt = noteTypesQuery.data.types.find((t) => t.id === id);
    if (!nt) return undefined;
    return orgCache.decrypt(nt.id + ":name", nt.encryptedName) ?? undefined;
  }

  function resolveNoteTypeIconSlug(
    noteTypeId: string | null,
  ): string | undefined {
    const id = effectiveTypeId(noteTypeId);
    if (id === undefined || !noteTypesQuery?.data) return undefined;
    const nt = noteTypesQuery.data.types.find((t) => t.id === id);
    if (!nt) return undefined;
    return orgCache.decrypt(nt.id + ":icon", nt.encryptedIcon) ?? undefined;
  }

  $effect(() => {
    if (!opened && dismissTimer !== null) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
      optimisticMessage = null;
    }
  });

  // Collapse the compose bar when the sheet closes. The stored draft
  // survives (drafts outlive navigation); the X dismiss inside the bar
  // is the deliberate discard.
  $effect(() => {
    if (!opened) {
      compose?.reset();
    }
  });

  // Auto-activate when only one client-reply method exists.
  // Both available: auto-open the popover. One available: auto-activate
  // that mode. Neither: notes only (no auto-activation).
  let prevOpened = $state(false);
  $effect(() => {
    const justOpened = opened && !prevOpened;
    prevOpened = opened;
    if (!justOpened) return;

    const hasReply = portalCapable;
    const hasSms = hasPhone;

    if (hasReply && hasSms) {
      // Both available: open the compose actions popover so the
      // volunteer can choose between reply and SMS.
      // Defer to next tick so TicketCompose has mounted.
      requestAnimationFrame(() => {
        const anchor = document.querySelector<HTMLElement>(
          ".reply-shell-sheet [data-compose-plus]",
        );
        if (anchor) {
          composeActionsAnchor = anchor;
          composeActionsOpen = true;
        }
      });
    } else if (hasReply && !hasSms) {
      compose?.activateReply();
    }
    // SMS-only or neither: stay collapsed, volunteer taps + for options.
  });

  let optimisticMessage = $state<{
    id: string;
    text: string;
    type: string;
    createdAt: string;
  } | null>(null);

  const orderedPreviews = $derived(
    previewFollowUps ? [...previewFollowUps].reverse() : undefined,
  );

  const groupedPreviews = $derived(
    orderedPreviews !== undefined
      ? groupConsecutive(orderedPreviews)
      : undefined,
  );

  const moreCount = $derived(
    previewFollowUps ? Math.max(0, followUpCount - previewFollowUps.length) : 0,
  );

  // ── Reply send (composable) ──

  // The composable owns the whole pipeline (encrypt, portal copy,
  // attachments, mutation, draft rollback, error toasts); the sheet
  // keeps only its own optimistic bubble and the auto-dismiss timing.
  const messenger = createSendMessage<FollowUpListEntry>({
    getTicketId: () => ticketId,
    getCurrentUserId: () => currentUserId ?? null,
    getDraftText: () => getDraftForMode(ticketId, "reply"),
    setDraftText: (v: string) => {
      setDraftForMode(ticketId, "reply", v);
    },
    cryptoBridge,
    followUpCache,
    queryClient,
    buildPendingEntry: (opts) => {
      optimisticMessage = {
        id: opts.pendingId,
        text: opts.text,
        type: "message",
        createdAt: new Date().toISOString(),
      };
      return buildPendingFollowUpEntry(opts);
    },
    getClientPublic: () => clientPublic ?? null,
    getAttachmentLinks: () => attachmentUpload.links(),
    createFollowUpMutate: async (args) => {
      const result = await ticketRouter.createFollowUp.mutate(args);
      // Clear pending attachments only after the mutation resolves.
      attachmentUpload.clear();
      return result;
    },
    onSuccess: () => {
      haptic();
      toastStore.show(m.ticket_toast_message_sent());
      dismissTimer = setTimeout(() => {
        dismissTimer = null;
        optimisticMessage = null;
        onsent(ticketId);
      }, 1500);
    },
    onError: () => {
      optimisticMessage = null;
    },
  });

  // ── Compose actions popover ──

  let composeActionsOpen = $state(false);
  let composeActionsAnchor = $state<HTMLElement | undefined>();

  const sheetTitle = $derived(
    clientAlias !== null && clientAlias !== ""
      ? m.ticket_reply_sheet_title({ alias: clientAlias })
      : m.ticket_reply_sheet_title_standalone(),
  );

  function handlePlus(anchor: HTMLElement): void {
    composeActionsAnchor = anchor;
    composeActionsOpen = true;
  }
</script>

<ShellSheet {opened} {ondismiss} title={sheetTitle} class="reply-shell-sheet">
  <div class="reply-sheet-messages">
    <div class="thread">
      {#if moreCount > 0}
        <p class="thread-more">
          {m.ticket_reply_sheet_more({ count: String(moreCount) })}
        </p>
      {/if}

      {#if groupedPreviews}
        {#each groupedPreviews as entry (followUpGroupKey(entry))}
          {#if isFollowUpGroup(entry)}
            <SystemEvent
              type={entry.type}
              timestamp={entry.lastTimestamp}
              count={entry.count}
            />
            <!-- eslint-disable @typescript-eslint/no-unsafe-argument -- svelte-eslint cannot narrow GroupedFollowUp in {:else} blocks; isFollowUpGroup guard above guarantees entry is a RawFollowUpPreview here -->
          {:else}
            {@const fu = entry}
            {@const fuResult = resolveAsyncDecrypt(
              followUpCache.decryptContent(
                fu.id,
                ticketId,
                followupSlot(fu.id),
                fu.keyWrap,
                fu.encryptedContent,
              ),
              fu.keyWrap !== null,
            )}
            <FollowUpBubble
              followUp={fu}
              result={fuResult}
              {clientAlias}
              noteTypeName={resolveNoteTypeName(fu.noteTypeId)}
              noteTypeIcon={resolveNoteTypeIconSlug(fu.noteTypeId)}
              reactions={replyReactions.reactionsFor(fu.id)}
              {currentUserId}
              ontogglereaction={(reaction: ReactionType) =>
                handleToggleReaction(fu.id, reaction)}
            />
          {/if}
        {/each}
      {/if}

      {#if optimisticMessage}
        <FollowUpBubble
          followUp={{
            id: optimisticMessage.id,
            source: "volunteer",
            type: optimisticMessage.type,
            encryptedContent: "",
            createdAt: optimisticMessage.createdAt,
          }}
          result={{ status: "ready", value: optimisticMessage.text }}
          {clientAlias}
        />
      {/if}
    </div>
  </div>

  {#if attachmentUpload.pending.length > 0}
    <div
      class="pending-attachments"
      role="list"
      aria-label={m.attachment_pending_list()}
    >
      {#each attachmentUpload.pending as entry (entry.attachmentId)}
        <Chip
          class="attachment-chip"
          outline={entry.status === "failed"}
          role="listitem"
        >
          <span class="attachment-chip-name">{entry.filename}</span>
          {#if entry.status === "encrypting" || entry.status === "uploading"}
            <span class="attachment-chip-status">
              {m.attachment_uploading()}
            </span>
          {:else if entry.status === "failed"}
            <span class="attachment-chip-status attachment-chip-failed">
              {m.attachment_failed()}
            </span>
          {/if}
        </Chip>
        <button
          type="button"
          class="attachment-remove-btn"
          onclick={() => attachmentUpload.remove(entry.attachmentId)}
          aria-label={m.attachment_remove({ name: entry.filename })}
        >
          <X size={14} aria-hidden="true" />
        </button>
      {/each}
    </div>
  {/if}
  <TicketCompose
    bind:this={compose}
    {ticketId}
    inline
    sending={messenger.sending || sms.sending || attachmentUpload.busy}
    hasUnacknowledgedCorrection={correctionPending}
    onsendreply={() => void messenger.handleSend()}
    onsendsms={(text: string) => void sms.handleSmsSend(text)}
    onplus={handlePlus}
  />
</ShellSheet>

<ComposeActions
  opened={composeActionsOpen}
  ondismiss={() => {
    composeActionsOpen = false;
  }}
  target={composeActionsAnchor}
  {ticketId}
  onpresetselect={(body: string) => {
    setDraftForMode(ticketId, "reply", body);
    compose?.activateReply();
  }}
  onreply={portalCapable ? () => compose?.activateReply() : undefined}
  ontextclient={hasPhone
    ? () => {
        exposureHint.show("sms");
        compose?.activateSms();
      }
    : undefined}
  onattach={(file: File) => {
    compose?.activateReply();
    void attachmentUpload.attach(file);
  }}
/>

{#if exposureHint.type}
  <ExposureHint
    type={exposureHint.type}
    opened={exposureHint.open}
    ondismiss={() => exposureHint.dismiss()}
  />
{/if}

<style>
  :global(.reply-shell-sheet .sheet-body) {
    padding-bottom: 0;
  }

  :global(.reply-shell-sheet .shell-sheet-content) {
    min-height: auto;
  }

  .reply-sheet-messages {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0 1rem;
    max-height: 40vh;
  }

  .thread {
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding: 0 16px;
  }

  .thread-more {
    text-align: center;
    font-size: var(--text-xs);
    color: var(--muted);
    margin: 0;
  }

  .pending-attachments {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 16px;
    align-items: center;
  }

  .attachment-chip-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .attachment-chip-status {
    font-size: var(--text-xs);
    color: var(--muted);
    margin-left: 4px;
  }

  .attachment-chip-failed {
    color: var(--danger);
  }

  .attachment-remove-btn {
    appearance: none;
    border: none;
    background: none;
    padding: 6px;
    margin: -6px 0 -6px -2px;
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
  }
</style>

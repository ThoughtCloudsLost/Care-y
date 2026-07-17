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
  import { createSmsSend } from "$lib/composables/ticket-detail/create-sms-send.svelte.js";
  import { createExposureHint } from "$lib/composables/ticket-detail/create-exposure-hint.svelte.js";
  import { useQueryClient } from "@tanstack/svelte-query";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import FollowUpBubble from "$lib/components/tickets/FollowUpBubble.svelte";
  import TicketCompose from "$lib/components/tickets/TicketCompose.svelte";
  import type { TicketComposeHandle } from "$lib/components/tickets/ticket-compose-types.js";
  import ComposeActions from "$lib/components/tickets/ComposeActions.svelte";
  import ExposureHint from "$lib/components/tickets/ExposureHint.svelte";
  import {
    setDraftForMode,
    clearDraftForMode,
  } from "$lib/tickets/draft-store.svelte.js";
  import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

  interface ReplySheetProps {
    opened: boolean;
    ticketId: string;
    clientAlias: string;
    hasPhone: boolean;
    previewFollowUps: RawFollowUpPreview[] | undefined;
    followUpCount: number;
    ondismiss: () => void;
    onsent: (ticketId: string) => void;
  }

  let {
    opened,
    ticketId,
    clientAlias,
    hasPhone,
    previewFollowUps,
    followUpCount,
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
  let replySending = $state(false);
  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Exposure hint ──

  const exposureHint = createExposureHint();

  // ── SMS send (composable) ──

  const sms = createSmsSend({
    getTicketId: () => ticketId,
    cryptoBridge,
    queryClient,
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

  let replyReactions = $state<Record<string, ReactionSummary[]>>({});

  $effect(() => {
    if (!opened || !previewFollowUps) {
      replyReactions = {};
      return;
    }
    const noteIds = previewFollowUps
      .filter((fu) => fu.type === "internal_note")
      .map((fu) => fu.id);
    if (noteIds.length === 0) return;
    void ticketRouter.getReactions
      .query({ followUpIds: noteIds })
      .then((r: Record<string, ReactionSummary[]>) => {
        replyReactions = r;
      })
      .catch((_e: unknown) => {
        /* best-effort */
      });
  });

  function getReplyReactions(followUpId: string): ReactionSummary[] {
    const reactions = Object.hasOwn(replyReactions, followUpId)
      ? // eslint-disable-next-line security/detect-object-injection -- key is a UUID from our own query, not user input
        replyReactions[followUpId]
      : undefined;
    return reactions ?? [];
  }

  function handleToggleReaction(
    followUpId: string,
    reaction: ReactionType,
  ): void {
    void ticketRouter.toggleReaction
      .mutate({ followUpId, reaction })
      .then((updated: ReactionSummary[]) => {
        replyReactions = { ...replyReactions, [followUpId]: updated };
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
  // When both are available, stay collapsed and let the volunteer tap +.
  let prevOpened = $state(false);
  $effect(() => {
    const justOpened = opened && !prevOpened;
    prevOpened = opened;
    if (!justOpened) return;

    if (!hasPhone) {
      compose?.activateReply();
    }
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

  const moreCount = $derived(
    previewFollowUps ? Math.max(0, followUpCount - previewFollowUps.length) : 0,
  );

  // ── Reply send pipeline ──

  async function handleReplySend(rawText: string): Promise<void> {
    const text = rawText.trim();
    if (text === "" || replySending) return;
    replySending = true;

    // Optimistic clear, mirroring the pre-send draft wipe; the catch
    // below restores the untrimmed draft on failure.
    clearDraftForMode(ticketId, "reply");

    const followUpId = crypto.randomUUID();

    try {
      const encryptedContent = await cryptoBridge.encrypt(
        ticketId,
        followupSlot(followUpId),
        text,
      );

      optimisticMessage = {
        id: `optimistic-${String(Date.now())}`,
        text,
        type: "message",
        createdAt: new Date().toISOString(),
      };

      await ticketRouter.createFollowUp.mutate({
        id: followUpId,
        ticketId,
        encryptedContent,
        source: "volunteer",
        type: "message",
        isPrivate: false,
      });

      haptic();
      toastStore.show(m.ticket_toast_message_sent());

      dismissTimer = setTimeout(() => {
        dismissTimer = null;
        optimisticMessage = null;
        onsent(ticketId);
      }, 1500);
    } catch {
      optimisticMessage = null;
      setDraftForMode(ticketId, "reply", rawText);
      toastStore.show(m.error_generic(), 3000);
    } finally {
      replySending = false;
    }
  }

  // ── Compose actions popover ──

  let composeActionsOpen = $state(false);
  let composeActionsAnchor = $state<HTMLElement | undefined>();

  function handlePlus(anchor: HTMLElement): void {
    composeActionsAnchor = anchor;
    composeActionsOpen = true;
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  title={m.ticket_reply_sheet_title({ alias: clientAlias })}
  class="reply-shell-sheet"
>
  <div class="reply-sheet-messages">
    <div class="thread">
      {#if moreCount > 0}
        <p class="thread-more">
          {m.ticket_reply_sheet_more({ count: String(moreCount) })}
        </p>
      {/if}

      {#if orderedPreviews}
        {#each orderedPreviews as fu (fu.id)}
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
            reactions={getReplyReactions(fu.id)}
            {currentUserId}
            ontogglereaction={(reaction: ReactionType) =>
              handleToggleReaction(fu.id, reaction)}
          />
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

  <TicketCompose
    bind:this={compose}
    {ticketId}
    inline
    sending={replySending || sms.sending}
    onsendreply={(text: string) => void handleReplySend(text)}
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
  onreply={() => compose?.activateReply()}
  ontextclient={hasPhone
    ? () => exposureHint.show("sms", () => compose?.activateSms())
    : undefined}
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
    padding: 0.5rem 0;
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
</style>

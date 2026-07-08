<!--
  Quick reply sheet opened from ticket list cards.

  Shows preview messages (from the card's already-decrypted data) and an
  inline ShellMessagebar for composing. Supports reply and note modes.
  After send: optimistic bubble, 1.5s delay, then auto-dismiss.
-->
<script lang="ts">
  import { Messages, MessagesTitle } from "konsta/svelte";
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
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellMessagebar from "$lib/shell/ShellMessagebar.svelte";
  import FollowUpBubble from "$lib/components/tickets/FollowUpBubble.svelte";
  import MentionAutocomplete from "$lib/components/tickets/MentionAutocomplete.svelte";
  import ComposeActions from "$lib/components/tickets/ComposeActions.svelte";
  import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

  interface ReplySheetProps {
    opened: boolean;
    ticketId: string;
    clientAlias: string;
    previewFollowUps: RawFollowUpPreview[] | undefined;
    followUpCount: number;
    ondismiss: () => void;
    onsent: (ticketId: string) => void;
  }

  let {
    opened,
    ticketId,
    clientAlias,
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

  let draftText = $state("");
  let cursorPosition = $state(0);
  let sending = $state(false);
  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  // Clear the auto-dismiss timer when the sheet closes (manual dismiss
  // or navigation) to prevent firing onsent on a stale sheet.
  $effect(() => {
    if (!opened && dismissTimer !== null) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
      optimisticMessage = null;
    }
  });

  // Optimistic sent message (shown briefly before auto-dismiss).
  let optimisticMessage = $state<{
    id: string;
    text: string;
    type: string;
    createdAt: string;
  } | null>(null);

  // Reverse to chronological order (oldest first, matching chat convention).
  const orderedPreviews = $derived(
    previewFollowUps ? [...previewFollowUps].reverse() : undefined,
  );

  const moreCount = $derived(
    previewFollowUps ? Math.max(0, followUpCount - previewFollowUps.length) : 0,
  );

  function handleInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLTextAreaElement) {
      cursorPosition = target.selectionStart;
    }
  }

  function handleMentionSelect(_userId: string, displayName: string): void {
    const before = draftText.slice(0, cursorPosition);
    const after = draftText.slice(cursorPosition);
    const atIndex = before.lastIndexOf("@");
    if (atIndex === -1) return;
    const replacement = `@${displayName} `;
    draftText = before.slice(0, atIndex) + replacement + after;
    cursorPosition = atIndex + replacement.length;
  }

  async function handleSend(): Promise<void> {
    const text = draftText.trim();
    if (text === "" || sending) return;
    sending = true;

    const savedDraft = draftText;
    draftText = "";

    const followUpId = crypto.randomUUID();

    try {
      const encryptedContent = await cryptoBridge.encrypt(
        ticketId,
        followupSlot(followUpId),
        text,
      );

      // Show optimistic bubble.
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

      // Auto-dismiss after 1.5s so the user sees the optimistic bubble.
      dismissTimer = setTimeout(() => {
        dismissTimer = null;
        optimisticMessage = null;
        onsent(ticketId);
      }, 1500);
    } catch {
      // Rollback: restore draft, remove optimistic bubble.
      optimisticMessage = null;
      draftText = savedDraft;
      toastStore.show(m.error_generic(), 3000);
    } finally {
      sending = false;
    }
  }

  let composeActionsOpen = $state(false);
  let composeActionsAnchor = $state<HTMLElement | undefined>();

  function handlePlus(anchor: HTMLElement): void {
    composeActionsAnchor = anchor;
    composeActionsOpen = true;
  }
</script>

<ShellSheet {opened} {ondismiss}>
  <div class="reply-sheet-header">
    <span class="reply-sheet-title">
      {m.ticket_reply_sheet_title({ alias: clientAlias })}
    </span>
  </div>

  <div class="reply-sheet-messages">
    <Messages>
      {#if moreCount > 0}
        <MessagesTitle>
          {m.ticket_reply_sheet_more({ count: String(moreCount) })}
        </MessagesTitle>
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
    </Messages>
  </div>

  {#if opened}
    <div class="mention-anchor">
      <MentionAutocomplete
        {draftText}
        {cursorPosition}
        onselect={handleMentionSelect}
      />
    </div>
    <ShellMessagebar
      inline
      bind:value={draftText}
      onsend={() => void handleSend()}
      onplus={handlePlus}
      oninput={handleInput}
      sendDisabled={sending || draftText.trim() === ""}
    />
  {/if}
</ShellSheet>

<ComposeActions
  opened={composeActionsOpen}
  ondismiss={() => {
    composeActionsOpen = false;
  }}
  target={composeActionsAnchor}
  {ticketId}
  onpresetselect={(body: string) => {
    draftText = body;
  }}
/>

<style>
  .reply-sheet-header {
    padding: 0.75rem 1rem 0;
  }

  .reply-sheet-title {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .mention-anchor {
    position: relative;
  }

  .reply-sheet-messages {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
    max-height: 40vh;
  }
</style>

<!--
  Quick reply sheet opened from ticket list cards.

  Shows preview messages (from the card's already-decrypted data) and an
  inline ShellMessagebar for composing. Volunteers choose a channel
  (Reply, Text, Internal Note) from the + menu before composing.

  After send: optimistic bubble, 1.5s delay, then auto-dismiss.
-->
<script lang="ts">
  import { X } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
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
  import ShellMessagebar from "$lib/shell/ShellMessagebar.svelte";
  import FollowUpBubble from "$lib/components/tickets/FollowUpBubble.svelte";
  import MentionAutocomplete from "$lib/components/tickets/MentionAutocomplete.svelte";
  import ComposeActions from "$lib/components/tickets/ComposeActions.svelte";
  import ExposureHint from "$lib/components/tickets/ExposureHint.svelte";
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

  // ── Draft + compose mode ──

  let draftText = $state("");
  let cursorPosition = $state(0);
  let replySending = $state(false);
  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  let activeComposeMode = $state<"reply" | "sms" | null>(null);

  const SMS_CHAR_LIMIT = 1600;
  const smsCharCount = $derived(
    activeComposeMode === "sms" ? draftText.length : 0,
  );
  const smsOverLimit = $derived(smsCharCount > SMS_CHAR_LIMIT);

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
        activeComposeMode = null;
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

  const sending = $derived(replySending || sms.sending);
  const sendDisabled = $derived(
    !draftText.trim() ||
      sending ||
      (activeComposeMode === "sms" && smsOverLimit),
  );

  $effect(() => {
    if (!opened && dismissTimer !== null) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
      optimisticMessage = null;
    }
  });

  // Reset compose mode when sheet closes.
  $effect(() => {
    if (!opened) {
      activeComposeMode = null;
      draftText = "";
    }
  });

  // Auto-selection logic when sheet opens.
  let prevOpened = $state(false);
  $effect(() => {
    const justOpened = opened && !prevOpened;
    prevOpened = opened;
    if (!justOpened) return;

    if (hasPhone) {
      // Both reply + SMS available: show the popover so the volunteer picks.
      composeActionsOpen = true;
    } else {
      // Only reply available (no phone): auto-activate reply mode.
      activeComposeMode = "reply";
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

  // ── Compose mode handlers ──

  function activateReplyMode(): void {
    activeComposeMode = "reply";
  }

  function activateSmsMode(): void {
    exposureHint.show("sms", () => {
      activeComposeMode = "sms";
    });
  }

  function dismissCompose(): void {
    activeComposeMode = null;
    draftText = "";
  }

  // ── Send dispatch ──

  function handleSend(): void {
    if (activeComposeMode === "reply") {
      void handleReplySend();
    } else if (activeComposeMode === "sms") {
      if (smsOverLimit) return;
      void sms.handleSmsSend(draftText);
    }
  }

  async function handleReplySend(): Promise<void> {
    const text = draftText.trim();
    if (text === "" || replySending) return;
    replySending = true;

    const savedDraft = draftText;
    draftText = "";

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
      draftText = savedDraft;
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

{#snippet composeHeader()}
  <div class="compose-mode-indicator">
    <span class="compose-mode-label">
      {activeComposeMode === "sms"
        ? m.ticket_mode_indicator_sms(withTerms())
        : m.ticket_mode_indicator_reply()}
    </span>
    {#if activeComposeMode === "sms"}
      <span class="sms-char-counter" class:sms-over-limit={smsOverLimit}>
        {m.ticket_sms_char_count({ count: String(smsCharCount) })}
      </span>
    {/if}
    <button
      type="button"
      class="compose-mode-dismiss"
      onclick={dismissCompose}
      aria-label={m.ticket_compose_dismiss_mode()}
    >
      <X size={16} aria-hidden="true" />
    </button>
  </div>
{/snippet}

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

  {#if opened}
    {#if activeComposeMode === "reply"}
      <div class="mention-anchor">
        <MentionAutocomplete
          {draftText}
          {cursorPosition}
          onselect={handleMentionSelect}
        />
      </div>
    {/if}
    <ShellMessagebar
      inline
      bind:value={draftText}
      mode={activeComposeMode === "sms" ? "sms" : "reply"}
      collapsed={activeComposeMode === null}
      header={activeComposeMode !== null ? composeHeader : undefined}
      onsend={handleSend}
      onplus={handlePlus}
      oninput={handleInput}
      {sendDisabled}
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
    activeComposeMode = "reply";
    draftText = body;
  }}
  onreply={activateReplyMode}
  ontextclient={hasPhone ? activateSmsMode : undefined}
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

  .mention-anchor {
    position: relative;
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

  .compose-mode-indicator {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 16px;
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .compose-mode-label {
    flex: 1;
    min-width: 0;
  }

  .compose-mode-dismiss {
    appearance: none;
    border: none;
    background: none;
    padding: 4px;
    margin: -4px;
    color: var(--muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sms-char-counter {
    font-size: var(--text-xs);
    color: var(--muted);
    margin-left: auto;
    flex-shrink: 0;
  }

  .sms-char-counter.sms-over-limit {
    color: var(--danger);
    font-weight: 600;
  }
</style>

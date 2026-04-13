<!--
  Quick reply sheet opened from ticket list cards.

  Shows preview messages (from the card's already-decrypted data) and an
  inline ShellMessagebar for composing. Supports reply and note modes.
  After send: optimistic bubble, 1.5s delay, then auto-dismiss.
-->
<script lang="ts">
  import { Messages, MessagesTitle } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getCryptoBridge,
    getFollowUpDecryptCache,
  } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { ActionsGroup, ActionsButton } from "konsta/svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellActionSheet from "$lib/shell/ShellActionSheet.svelte";
  import ShellMessagebar from "$lib/shell/ShellMessagebar.svelte";
  import FollowUpBubble from "$lib/components/tickets/FollowUpBubble.svelte";
  import MentionAutocomplete from "$lib/components/tickets/MentionAutocomplete.svelte";
  import PresetReplyContent from "$lib/components/tickets/PresetReplyContent.svelte";
  import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
  import type { ComposeMode } from "$lib/shell/types.js";

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

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;
  const cryptoBridge = getCryptoBridge();
  const followUpCache = getFollowUpDecryptCache();

  let draftText = $state("");
  let composeMode = $state<ComposeMode>("reply");
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

    try {
      const encryptedContent = await cryptoBridge.encrypt(ticketId, text);

      const followUpType = composeMode === "note" ? "internal_note" : "message";

      // Show optimistic bubble.
      optimisticMessage = {
        id: `optimistic-${String(Date.now())}`,
        text,
        type: followUpType,
        createdAt: new Date().toISOString(),
      };

      await ticketRouter.createFollowUp.mutate({
        ticketId,
        encryptedContent,
        source: "volunteer",
        type: followUpType,
        isPrivate: composeMode === "note",
      });

      haptic();

      const toastMsg =
        composeMode === "note"
          ? m.ticket_note_saved()
          : m.ticket_toast_message_sent();
      toastStore.show(toastMsg);

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
  let presetSheetOpen = $state(false);

  function handlePlus(): void {
    composeActionsOpen = true;
  }

  function handleAttach(): void {
    composeActionsOpen = false;
    // Stub: file attachment wired separately.
  }

  function handlePresetFromCompose(): void {
    composeActionsOpen = false;
    presetSheetOpen = true;
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
          {@const content = followUpCache.decryptContent(
            fu.id,
            fu.keyWrap,
            fu.encryptedContent,
          )}
          <FollowUpBubble followUp={fu} {content} {clientAlias} />
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
          content={optimisticMessage.text}
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
      bind:mode={composeMode}
      onsend={() => void handleSend()}
      onplus={handlePlus}
      oninput={handleInput}
      sendDisabled={sending || draftText.trim() === ""}
    />
  {/if}
</ShellSheet>

<ShellActionSheet
  opened={composeActionsOpen}
  ondismiss={() => {
    composeActionsOpen = false;
  }}
>
  <ActionsGroup>
    <ActionsButton onclick={handleAttach}>
      {m.ticket_attach_file()}
    </ActionsButton>
    <ActionsButton onclick={handlePresetFromCompose}>
      {m.ticket_preset_replies()}
    </ActionsButton>
  </ActionsGroup>
  <ActionsGroup>
    <ActionsButton
      onclick={() => {
        composeActionsOpen = false;
      }}
      bold
    >
      {m.common_cancel()}
    </ActionsButton>
  </ActionsGroup>
</ShellActionSheet>

<ShellSheet
  opened={presetSheetOpen}
  ondismiss={() => {
    presetSheetOpen = false;
  }}
>
  <PresetReplyContent
    onselect={(body: string) => {
      draftText = body;
      presetSheetOpen = false;
    }}
  />
</ShellSheet>

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

<!--
  Private/internal note in the chat timeline.

  Uses a Konsta Card (outline) to stay visually consistent with the
  component library. A badge shows the note type icon and name. Own notes
  show a pencil icon that opens the edit sheet (managed by parent).

  Reaction UX follows iOS Messages / Signal: long-press the card to open
  the picker, pills cluster at the bottom-right corner of the card.
-->
<script lang="ts">
  import { Card, Popover } from "konsta/svelte";
  import { StickyNote, Pencil } from "@lucide/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { resolveNoteTypeIcon } from "$lib/utils/note-type-icons.js";
  import { REACTION_ENTRIES } from "$lib/utils/reaction-icons.js";
  import { haptic } from "$lib/utils/haptic.js";
  import * as m from "$lib/paraglide/messages.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import type { ReactionSummary, ReactionType } from "@care-y/shared";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import ReactionTray from "./ReactionTray.svelte";

  interface Props {
    result: DecryptResult;
    encryptedContent?: unknown;
    authorName: string | undefined;
    timestamp: string;
    isOwn: boolean;
    onopenedit?: () => void;
    searchTerm?: string | null;
    noteTypeName?: string;
    noteTypeIcon?: string;
    reactions?: ReactionSummary[];
    currentUserId?: string;
    ontogglereaction?: (reaction: ReactionType) => void;
    resolveUserName?: (userId: string) => string | undefined;
  }

  let {
    result,
    encryptedContent,
    authorName,
    timestamp,
    isOwn,
    onopenedit,
    searchTerm = null,
    noteTypeName,
    noteTypeIcon,
    reactions = [],
    currentUserId,
    ontogglereaction,
    resolveUserName,
  }: Props = $props();

  const NoteTypeIconComponent = $derived(
    noteTypeIcon !== undefined ? resolveNoteTypeIcon(noteTypeIcon) : null,
  );

  const timeLabel = $derived(formatRelativeTime(new Date(timestamp)));
  const displayAuthor = $derived(
    authorName ?? m.ticket_private_note_author_fallback(),
  );
  const hasReactions = $derived(reactions.length > 0);

  function userReacted(reaction: ReactionSummary): boolean {
    if (currentUserId === undefined) return false;
    return reaction.userIds.includes(currentUserId);
  }

  // ── Picker state ──

  let pickerOpen = $state(false);
  let cardEl = $state<HTMLElement | undefined>(undefined);
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  function openPicker(): void {
    if (!ontogglereaction || !cardEl) return;
    pickerOpen = true;
  }

  function handleToggle(type: ReactionType): void {
    ontogglereaction?.(type);
    haptic();
    pickerOpen = false;
  }

  // ── Long-press handling ──

  function handlePointerDown(e: PointerEvent): void {
    if (!ontogglereaction) return;
    const target = e.target;
    if (
      target instanceof HTMLButtonElement ||
      target instanceof HTMLAnchorElement
    )
      return;
    longPressTimer = setTimeout(() => {
      longPressTimer = null;
      openPicker();
      haptic();
    }, 500);
  }

  function cancelLongPress(): void {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }
</script>

<div
  class="private-note-wrapper"
  class:own-note={isOwn}
  class:has-reactions={hasReactions}
>
  <div
    class="note-card-wrap"
    bind:this={cardEl}
    onpointerdown={handlePointerDown}
    onpointerup={cancelLongPress}
    onpointercancel={cancelLongPress}
    onpointermove={cancelLongPress}
    oncontextmenu={(e) => {
      if (ontogglereaction) e.preventDefault();
    }}
    role="presentation"
  >
    <Card
      outline
      contentWrapPadding="py-2.5 px-3"
      class="private-note-card"
      role="article"
      aria-label={m.ticket_private_note_by({ author: displayAuthor })}
    >
      <span class="note-badge">
        {#if NoteTypeIconComponent && noteTypeName}
          <NoteTypeIconComponent
            size={11}
            class="note-icon"
            aria-hidden="true"
          />
          <span class="note-type-name">{noteTypeName}</span>
          <span class="note-badge-sep" aria-hidden="true">&middot;</span>
        {:else}
          <StickyNote size={11} class="note-icon" aria-hidden="true" />
        {/if}
        {m.ticket_note_team_only()}
        {#if isOwn && onopenedit}
          <button
            type="button"
            class="note-edit-btn"
            onclick={onopenedit}
            aria-label={m.ticket_edit_note()}
          >
            <Pencil size={11} />
          </button>
        {/if}
      </span>
      <div class="note-body">
        <DecryptPlaceholder
          {result}
          ciphertext={encryptedContent}
          length={40}
          block
          {searchTerm}
        />
      </div>
      <div class="note-meta">
        {#if authorName}
          <span class="note-author">{authorName}</span>
        {/if}
        <time class="note-time" datetime={timestamp}>{timeLabel}</time>
      </div>
    </Card>

    {#if ontogglereaction}
      <ReactionTray
        {reactions}
        {currentUserId}
        {resolveUserName}
        onopenpicker={openPicker}
      />
    {/if}
  </div>
</div>

<Popover
  opened={pickerOpen}
  target={cardEl}
  onBackdropClick={() => {
    pickerOpen = false;
  }}
>
  <div class="reaction-picker-strip">
    {#each REACTION_ENTRIES as entry (entry.type)}
      {@const EntryIcon = entry.icon}
      {@const alreadyReacted = reactions.some(
        (r) => r.reaction === entry.type && userReacted(r),
      )}
      <button
        type="button"
        class="reaction-picker-opt"
        class:reaction-picker-active={alreadyReacted}
        onclick={() => handleToggle(entry.type)}
      >
        <EntryIcon size={20} />
        <span class="reaction-picker-label">{entry.label()}</span>
      </button>
    {/each}
  </div>
</Popover>

<style>
  .private-note-wrapper {
    margin: 0.25rem 0;
    touch-action: pan-y;
  }

  .private-note-wrapper.has-reactions {
    margin-bottom: 0.75rem;
  }

  .note-card-wrap {
    position: relative;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    --k-safe-area-top: var(--navbar-h, 44px);
  }

  .note-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--brand-accent, var(--brand-primary));
    margin-bottom: 0.375rem;
  }

  :global(.note-icon) {
    color: var(--brand-accent, var(--brand-primary));
    flex-shrink: 0;
  }

  .note-type-name {
    font-weight: 600;
  }

  .note-badge-sep {
    opacity: 0.5;
  }

  .note-body {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--ink);
    word-break: break-word;
    white-space: pre-line;
  }

  .note-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.375rem;
    font-size: 0.625rem;
    color: var(--muted);
  }

  .note-author {
    font-weight: 500;
  }

  .note-time {
    font-size: 0.625rem;
    color: var(--muted);
    white-space: nowrap;
  }

  .note-edit-btn {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    border-radius: 0.25rem;
    -webkit-tap-highlight-color: transparent;
  }

  /* ── Popover picker strip ── */

  .reaction-picker-strip {
    display: flex;
    padding: 0.5rem 0.625rem;
    gap: 0.25rem;
    overflow-x: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
  }

  .reaction-picker-strip::-webkit-scrollbar {
    display: none;
  }

  .reaction-picker-opt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1875rem;
    padding: 0.5rem 0.625rem;
    border-radius: 0.625rem;
    border: none;
    background: none;
    color: var(--ink);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
  }

  .reaction-picker-opt:active {
    background: var(--surface-1);
  }

  .reaction-picker-active {
    color: var(--brand-accent, var(--brand-primary));
    background: color-mix(
      in srgb,
      var(--brand-accent, var(--brand-primary)) 10%,
      transparent
    );
  }

  .reaction-picker-label {
    font-size: 0.5625rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
</style>

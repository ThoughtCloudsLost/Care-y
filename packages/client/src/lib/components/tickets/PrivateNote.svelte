<!--
  Private/internal note in the chat timeline.

  Renders as a full-width recessed paper block (paper-deep on a hairline
  border), distinct from the conversation bubbles: notes are about the
  case, not part of the exchange. The eyebrow names the note type in
  quiet ink. Own notes show a pencil icon that opens the edit sheet
  (managed by parent).

  Reaction UX follows iOS Messages / Signal: long-press the block to open
  the picker, pills cluster at the bottom-right corner.
-->
<script lang="ts">
  import { StickyNote, Pencil } from "@lucide/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { resolveNoteTypeIcon } from "$lib/utils/note-type-icons.js";
  import { REACTION_ENTRIES } from "$lib/utils/reaction-icons.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { longPress } from "$lib/utils/long-press.js";
  import * as m from "$lib/paraglide/messages.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import type { ReactionSummary, ReactionType } from "@care-y/shared";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import ReactionTray from "./ReactionTray.svelte";
  import ShellPopover from "$lib/shell/ShellPopover.svelte";

  interface Props {
    result: DecryptResult;
    encryptedContent?: unknown;
    authorName: string | undefined;
    timestamp: string;
    isOwn: boolean;
    onopenedit?: () => void;
    onlongpress?: () => void;
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
    onlongpress,
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
  const eyebrowLabel = $derived(
    noteTypeName !== undefined
      ? m.preview_note_internal({ name: noteTypeName })
      : m.ticket_note_team_only(),
  );
  const hasReactions = $derived(reactions.length > 0);

  function userReacted(reaction: ReactionSummary): boolean {
    if (currentUserId === undefined) return false;
    return reaction.userIds.includes(currentUserId);
  }

  // ── Picker state ──

  let pickerOpen = $state(false);
  let cardEl = $state<HTMLElement | undefined>(undefined);

  function openPicker(): void {
    if (!ontogglereaction || !cardEl) return;
    pickerOpen = true;
  }

  function handleToggle(type: ReactionType): void {
    ontogglereaction?.(type);
    haptic();
    pickerOpen = false;
  }

  const pressAction = $derived(
    ontogglereaction || onlongpress
      ? longPress(
          () => {
            if (onlongpress) {
              onlongpress();
            } else {
              openPicker();
            }
            haptic();
          },
          { ignoreInteractiveTargets: true },
        )
      : null,
  );
</script>

<div
  class="private-note-wrapper"
  class:own-note={isOwn}
  class:has-reactions={hasReactions}
>
  <div
    class="note-card-wrap"
    bind:this={cardEl}
    {@attach pressAction}
    oncontextmenu={(e) => {
      if (ontogglereaction) e.preventDefault();
    }}
    role="presentation"
  >
    <div
      class="note-block recessed-note"
      role="article"
      aria-label={m.ticket_private_note_by({ author: displayAuthor })}
    >
      <span class="note-badge" data-testid="note-badge">
        {#if NoteTypeIconComponent}
          <NoteTypeIconComponent
            size={11}
            class="note-icon"
            aria-hidden="true"
          />
        {:else}
          <StickyNote size={11} class="note-icon" aria-hidden="true" />
        {/if}
        {eyebrowLabel}
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
          <span class="note-meta-sep" aria-hidden="true">·</span>
        {/if}
        <time class="note-time" datetime={timestamp}>{timeLabel}</time>
      </div>
    </div>

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

<ShellPopover
  opened={pickerOpen}
  target={cardEl}
  ondismiss={() => {
    pickerOpen = false;
  }}
  ariaLabel={m.reaction_summary()}
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
</ShellPopover>

<style>
  /* No margin of its own: the thread gap spaces it like every row. */
  .private-note-wrapper {
    touch-action: pan-y;
  }

  /* Reaction pills overhang the bottom edge; keep them off the next row. */
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

  /* Recessed paper block (shared .recessed-note): one step below the
     page, bubbles sit one above. */
  .note-block {
    border-radius: 12px;
    padding: 11px 14px;
  }

  .note-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.65625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
    margin-bottom: 0.25rem;
  }

  :global(.note-icon) {
    color: var(--muted);
    flex-shrink: 0;
  }

  .note-body {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--ink-2);
    word-break: break-word;
    white-space: pre-line;
  }

  .note-meta {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.3125rem;
    font-size: 0.6875rem;
    color: var(--muted);
  }

  .note-author {
    font-weight: 500;
  }

  .note-meta-sep {
    opacity: 0.5;
  }

  .note-time {
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
    background: var(--raised);
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

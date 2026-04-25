<!--
  Private/internal note in the chat timeline.

  Uses a Konsta Card (outline) to stay visually consistent with the
  component library. A badge shows the note type icon and name. Own notes
  show a pencil icon that opens the edit sheet (managed by parent).
-->
<script lang="ts">
  import { Card } from "konsta/svelte";
  import { StickyNote, Pencil } from "@lucide/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { resolveNoteTypeIcon } from "$lib/utils/note-type-icons.js";
  import * as m from "$lib/paraglide/messages.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

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
  }: Props = $props();

  const NoteTypeIconComponent = $derived(
    noteTypeIcon !== undefined ? resolveNoteTypeIcon(noteTypeIcon) : null,
  );

  const timeLabel = $derived(formatRelativeTime(new Date(timestamp)));
  const displayAuthor = $derived(
    authorName ?? m.ticket_private_note_author_fallback(),
  );
</script>

<div class="private-note-wrapper" class:own-note={isOwn}>
  <Card
    outline
    contentWrapPadding="py-2.5 px-3"
    class="private-note-card"
    role="article"
    aria-label={m.ticket_private_note_by({ author: displayAuthor })}
  >
    <span class="note-badge">
      {#if NoteTypeIconComponent && noteTypeName}
        <NoteTypeIconComponent size={11} class="note-icon" aria-hidden="true" />
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
</div>

<style>
  .private-note-wrapper {
    margin: 0.25rem 0;
    user-select: text;
    -webkit-user-select: text;
    touch-action: pan-y;
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
</style>

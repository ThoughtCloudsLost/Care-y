<!--
  Private/internal note in the chat timeline.

  Uses a Konsta Card (outline) to stay visually consistent with the
  component library. A Chip marks the note as team-only. The Card's
  header snippet holds the author + chip, footer holds the timestamp.

  Edit lifecycle: parent controls `editing` boolean. When editing transitions
  from false to true, this component snapshots `content` into an internal
  `editText` draft. The draft persists across re-renders and content changes
  while editing is true. Parent calls `onedit(text)` on Save, which triggers
  encryption + mutation. `saving` disables the textarea and buttons while
  the mutation is in flight. Parent sets `editing = false` only on success.
-->
<script lang="ts">
  import { Card, Button, List, ListInput } from "konsta/svelte";
  import { StickyNote } from "@lucide/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import * as m from "$lib/paraglide/messages.js";
  import {
    type DecryptResult,
    isDecryptReady,
  } from "$lib/crypto/decrypt-result.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  interface Props {
    result: DecryptResult;
    encryptedContent?: unknown;
    authorName: string | undefined;
    timestamp: string;
    isOwn: boolean;
    /** When true, note body becomes a textarea for editing. */
    editing?: boolean;
    /** When true, Save/Cancel are disabled and a saving indicator shows. */
    saving?: boolean;
    /** Called with the new plaintext when the user taps Save. */
    onedit?: (newContent: string) => void;
    /** Called when the user cancels editing. */
    oncanceledit?: () => void;
    onpointerdown?: (e: PointerEvent) => void;
    onpointerup?: (e: PointerEvent) => void;
    onpointercancel?: (e: PointerEvent) => void;
    searchTerm?: string | null;
  }

  let {
    result,
    encryptedContent,
    authorName,
    timestamp,
    isOwn,
    editing = false,
    saving = false,
    onedit,
    oncanceledit,
    onpointerdown,
    onpointerup,
    onpointercancel,
    searchTerm = null,
  }: Props = $props();

  let editText = $state("");
  let prevEditing = false;

  // Seed editText only on the false -> true transition of `editing`.
  // While editing stays true (including error-recovery re-renders),
  // the user's draft is preserved. Content changes from the decrypt
  // cache are ignored while editing.
  $effect(() => {
    if (editing && !prevEditing) {
      if (isDecryptReady(result)) {
        editText = result.value;
      }
    }
    prevEditing = editing;
  });

  function handleSave(): void {
    const trimmed = editText.trim();
    const currentValue = isDecryptReady(result) ? result.value : undefined;
    if (!trimmed || trimmed === currentValue) {
      oncanceledit?.();
      return;
    }
    onedit?.(trimmed);
  }

  function handleCancel(): void {
    oncanceledit?.();
  }

  const timeLabel = $derived(formatRelativeTime(new Date(timestamp)));
  const displayAuthor = $derived(
    authorName ?? m.ticket_private_note_author_fallback(),
  );
  const canSave = $derived(editText.trim().length > 0 && !saving);
</script>

<div class="private-note-wrapper" class:own-note={isOwn}>
  <Card
    outline
    contentWrapPadding="py-2.5 px-3"
    class="private-note-card"
    role="article"
    aria-label={m.ticket_private_note_by({ author: displayAuthor })}
    onpointerdown={editing ? undefined : onpointerdown}
    onpointerup={editing ? undefined : onpointerup}
    onpointercancel={editing ? undefined : onpointercancel}
  >
    <span class="note-badge">
      <StickyNote size={11} class="note-icon" />
      {m.ticket_note_team_only()}
    </span>
    {#if editing}
      <div class="note-edit-area">
        <List nested class="note-edit-list">
          <ListInput
            type="textarea"
            bind:value={editText}
            aria-label={m.ticket_edit_note()}
            inputClass="resize-y min-h-[3rem]"
            disabled={saving}
          />
        </List>
        <div class="note-edit-actions">
          <Button
            clear
            small
            inline
            onclick={handleCancel}
            disabled={saving}
            class="note-edit-cancel"
          >
            {m.common_cancel()}
          </Button>
          <Button
            small
            inline
            onclick={handleSave}
            disabled={!canSave}
            class="note-edit-save"
          >
            {#if saving}
              {m.common_loading()}
            {:else}
              {m.common_save()}
            {/if}
          </Button>
        </div>
      </div>
    {:else}
      <div class="note-body">
        <DecryptPlaceholder
          {result}
          ciphertext={encryptedContent}
          length={40}
          block
          {searchTerm}
        />
      </div>
    {/if}
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

  .note-body {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--ink);
    word-break: break-word;
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

  .note-edit-area {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .note-edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  :global(.note-edit-list) {
    margin: 0 !important;
  }
</style>

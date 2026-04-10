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
  import { Card, Chip, Button, List, ListInput } from "konsta/svelte";
  import { StickyNote } from "@lucide/svelte";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    content: string | undefined;
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
  }

  let {
    content,
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
  }: Props = $props();

  let editText = $state("");
  let prevEditing = false;

  // Seed editText only on the false -> true transition of `editing`.
  // While editing stays true (including error-recovery re-renders),
  // the user's draft is preserved. Content changes from the decrypt
  // cache are ignored while editing.
  $effect(() => {
    if (editing && !prevEditing) {
      if (content !== undefined && !isDecryptError(content)) {
        editText = content;
      }
    }
    prevEditing = editing;
  });

  function handleSave(): void {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === content) {
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

<div class="private-note-wrapper">
  <Card
    outline
    contentWrapPadding="pt-1 pb-3 px-3"
    class="private-note-card"
    role="article"
    aria-label={m.ticket_private_note_by({ author: displayAuthor })}
    onpointerdown={editing ? undefined : onpointerdown}
    onpointerup={editing ? undefined : onpointerup}
    onpointercancel={editing ? undefined : onpointercancel}
  >
    {#snippet header()}
      <div class="note-header">
        <div class="note-header-row">
          <Chip outline class="note-chip">
            <span class="note-chip-content">
              <StickyNote size={11} class="note-icon" />
              {m.ticket_private_note_label()}
            </span>
          </Chip>
          <time class="note-time" datetime={timestamp}>{timeLabel}</time>
        </div>
        {#if authorName}
          <span class="note-author">{authorName}</span>
        {/if}
      </div>
    {/snippet}
    {#if editing}
      <div class="note-edit-area">
        <List strong inset nested class="note-edit-list">
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
        {#if isDecryptError(content)}
          <span class="decrypt-error">{m.error_decryption_failed()}</span>
        {:else if content === undefined}
          <span class="shimmer shimmer-note" aria-busy="true"></span>
        {:else}
          {content}
        {/if}
      </div>
    {/if}
  </Card>
</div>

<style>
  .private-note-wrapper {
    margin: 0.25rem 0;
    user-select: text;
    -webkit-user-select: text;
    touch-action: pan-y;
  }

  .note-header {
    display: flex;
    flex-direction: column;
    gap: 0.1875rem;
  }

  .note-header-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .note-chip-content {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  :global(.note-icon) {
    color: var(--brand-accent, var(--brand-primary));
    flex-shrink: 0;
  }

  /* Scale down the Chip to fit inline in the header row. */
  :global(.note-chip) {
    font-size: 0.625rem !important;
    height: auto !important;
    padding-left: 0.375rem !important;
    padding-right: 0.375rem !important;
    padding-top: 0.0625rem !important;
    padding-bottom: 0.0625rem !important;
  }

  .note-time {
    margin-left: auto;
    font-size: 0.625rem;
    color: var(--muted);
    white-space: nowrap;
  }

  .note-author {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ink);
    opacity: 0.85;
  }

  .note-body {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--ink);
    word-break: break-word;
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

  .decrypt-error {
    color: var(--muted);
    font-style: italic;
  }

  .shimmer-note {
    display: block;
    width: 70%;
    height: 0.875rem;
    border-radius: 0.25rem;
    background: linear-gradient(
      90deg,
      var(--surface-1) 25%,
      var(--surface-2) 50%,
      var(--surface-1) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }

  @keyframes shimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shimmer-note {
      animation: none;
      background: var(--surface-1);
    }
  }
</style>

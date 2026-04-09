<!--
  Private/internal note in the chat timeline.

  Full-width block with distinct background and brand-colored left border.
  Shows author name, "only your team can see this" badge, and timestamp.
  Visually distinct from message bubbles so volunteers never mistake a
  private note for a client-visible message.

  Edit lifecycle: parent controls `editing` boolean. When editing transitions
  from false to true, this component snapshots `content` into an internal
  `editText` draft. The draft persists across re-renders and content changes
  while editing is true. Parent calls `onedit(text)` on Save, which triggers
  encryption + mutation. `saving` disables the textarea and buttons while
  the mutation is in flight. Parent sets `editing = false` only on success.
-->
<script lang="ts">
  import { Button, List, ListInput } from "konsta/svelte";
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
  const displayAuthor = $derived(authorName ?? m.common_loading());
  const canSave = $derived(editText.trim().length > 0 && !saving);
</script>

<div
  class="private-note"
  class:private-note-own={isOwn}
  class:private-note-editing={editing}
  role="article"
  aria-label={m.ticket_private_note_by({ author: displayAuthor })}
  onpointerdown={editing ? undefined : onpointerdown}
  onpointerup={editing ? undefined : onpointerup}
  onpointercancel={editing ? undefined : onpointercancel}
>
  <div class="note-header">
    <span class="note-author">{displayAuthor}</span>
    <span class="note-badge">{m.ticket_private_note_label()}</span>
  </div>
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
  <time class="note-time" datetime={timestamp}>{timeLabel}</time>
</div>

<style>
  .private-note {
    margin: 0.375rem 0.75rem;
    padding: 0.625rem 0.75rem;
    background: var(--surface-2);
    border-left: 3px solid var(--brand-primary);
    border-radius: 0.5rem;
    user-select: text;
    -webkit-user-select: text;
    touch-action: pan-y;
  }

  .private-note-editing {
    border-left-color: var(--brand-accent, var(--brand-primary));
  }

  .note-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .note-author {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--ink);
  }

  .note-badge {
    font-size: 0.625rem;
    font-weight: 500;
    color: var(--brand-text);
    background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
    padding: 0.0625rem 0.375rem;
    border-radius: 0.25rem;
    white-space: nowrap;
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

  .note-time {
    display: block;
    font-size: 0.625rem;
    color: var(--muted);
    text-align: right;
    margin-top: 0.25rem;
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

  @media (prefers-contrast: more) {
    .private-note {
      border-left-width: 4px;
      background: var(--surface-1);
      outline: 1px solid var(--muted);
    }
  }
</style>

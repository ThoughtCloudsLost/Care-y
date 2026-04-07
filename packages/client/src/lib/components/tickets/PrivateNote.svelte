<!--
  Private/internal note in the chat timeline.

  Full-width block with distinct background and brand-colored left border.
  Shows author name, "only your team can see this" badge, and timestamp.
  Visually distinct from message bubbles so volunteers never mistake a
  private note for a client-visible message.

  Long-press on own notes opens edit/delete menu (handled by parent).
-->
<script lang="ts">
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    content: string | undefined;
    authorName: string | undefined;
    timestamp: string;
    isOwn: boolean;
    onpointerdown?: (e: PointerEvent) => void;
    onpointerup?: (e: PointerEvent) => void;
    onpointercancel?: (e: PointerEvent) => void;
  }

  let {
    content,
    authorName,
    timestamp,
    isOwn,
    onpointerdown,
    onpointerup,
    onpointercancel,
  }: Props = $props();

  const timeLabel = $derived(formatRelativeTime(new Date(timestamp)));
  const displayAuthor = $derived(authorName ?? m.common_loading());
</script>

<div
  class="private-note"
  class:private-note-own={isOwn}
  role="article"
  aria-label={m.ticket_private_note_by({ author: displayAuthor })}
  {onpointerdown}
  {onpointerup}
  {onpointercancel}
>
  <div class="note-header">
    <span class="note-author">{displayAuthor}</span>
    <span class="note-badge">{m.ticket_private_note_label()}</span>
  </div>
  <div class="note-body">
    {#if isDecryptError(content)}
      <span class="decrypt-error">{m.error_decryption_failed()}</span>
    {:else if content === undefined}
      <span class="shimmer shimmer-note" aria-busy="true"></span>
    {:else}
      {content}
    {/if}
  </div>
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

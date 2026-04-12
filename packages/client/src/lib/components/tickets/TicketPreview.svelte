<!--
  Ticket list preview window: miniature chat bubbles matching the
  detail view's visual language.

  Shows at most 3 follow-ups (from the recentFollowUps endpoint),
  reversed into chronological order (oldest on top).
  Left-aligned mini-bubbles for client messages, right-aligned for
  volunteer messages, centered muted text for system events,
  and left-border-accented italic text for internal notes.
  Text truncated to single-line with ellipsis.
-->
<script lang="ts">
  import {
    Mic,
    Image as ImageIcon,
    Paperclip,
    StickyNote,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getFollowUpDecryptCache } from "$lib/crypto/context.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

  interface Props {
    followUps: RawFollowUpPreview[] | undefined;
    /** Allow 2-line wrapping per bubble (list mode). */
    multiline?: boolean;
    /** Known follow-up count. Limits placeholder bubbles when preview hasn't loaded. */
    followUpCount?: number;
  }

  let { followUps, multiline = false, followUpCount }: Props = $props();
  const followUpCache = getFollowUpDecryptCache();

  function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + "\u2026";
  }

  /** Classify follow-up the same way TicketDetail does. */
  function followUpKind(fu: RawFollowUpPreview): "message" | "system" | "note" {
    if (fu.source === "system") return "system";
    if (fu.type === "internal_note") return "note";
    return "message";
  }

  // Server returns newest-first; reverse so oldest is at the top
  // (matching natural chat order: oldest on top, newest on bottom).
  const ordered = $derived(
    followUps !== undefined ? [...followUps].reverse() : undefined,
  );
</script>

<div class="mini-chat" class:multiline>
  {#if ordered === undefined}
    {@const placeholderCount = Math.min(followUpCount ?? 3, 3)}
    {#each { length: placeholderCount } as _, i (i)}
      {@const isReceived = i % 2 === 0}
      {@const lengths = [24, 14, 18]}
      <div
        class="mini-bubble-row"
        class:mini-row-received={isReceived}
        class:mini-row-sent={!isReceived}
        data-direction={isReceived ? "received" : "sent"}
      >
        <div
          class="mini-bubble"
          class:mini-bubble-received={isReceived}
          class:mini-bubble-sent={!isReceived}
        >
          <DecryptPlaceholder
            length={lengths[i % 3] ?? 20}
            block={multiline}
            charsPerLine={20}
            maxLines={multiline ? 2 : 1}
          />
        </div>
      </div>
    {/each}
  {:else if ordered.length === 0}
    <p class="preview-empty" role="status">{m.tickets_preview_empty()}</p>
  {:else}
    {#each ordered as fu (fu.id)}
      {@const kind = followUpKind(fu)}
      {@const content = followUpCache.decryptContent(
        fu.id,
        fu.keyWrap,
        fu.encryptedContent,
      )}
      {#if kind === "system"}
        <div class="mini-system" data-type="system">
          <DecryptPlaceholder
            {content}
            ciphertext={fu.encryptedContent}
            length={20}
            block={multiline}
            charsPerLine={20}
            maxLines={multiline ? 2 : 1}
          >
            {truncate(content ?? "", 30)}
          </DecryptPlaceholder>
        </div>
      {:else if kind === "note"}
        <div class="mini-note">
          <StickyNote size={10} class="mini-note-icon" />
          <DecryptPlaceholder
            {content}
            ciphertext={fu.encryptedContent}
            length={20}
            block={multiline}
            charsPerLine={20}
            maxLines={multiline ? 2 : 1}
          >
            <span class="mini-text">{content}</span>
          </DecryptPlaceholder>
        </div>
      {:else}
        <div
          class="mini-bubble-row"
          class:mini-row-received={fu.source === "client"}
          class:mini-row-sent={fu.source !== "client"}
          data-direction={fu.source === "client" ? "received" : "sent"}
        >
          <div
            class="mini-bubble"
            class:mini-bubble-received={fu.source === "client"}
            class:mini-bubble-sent={fu.source !== "client"}
          >
            {#if fu.hasRecording || fu.hasImage || fu.hasFile}
              <span class="mini-media" aria-hidden="true">
                {#if fu.hasRecording}<Mic size={10} />{/if}
                {#if fu.hasImage}<ImageIcon size={10} />{/if}
                {#if fu.hasFile}<Paperclip size={10} />{/if}
              </span>
            {/if}
            <DecryptPlaceholder
              {content}
              ciphertext={fu.encryptedContent}
              length={20}
              block={multiline}
              charsPerLine={20}
            >
              {#if content}<span class="mini-text">{content}</span>{/if}
            </DecryptPlaceholder>
          </div>
        </div>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .mini-chat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0.375rem 0.5rem;
    min-height: 2rem;
  }

  .preview-empty {
    font-size: 0.625rem;
    color: var(--muted);
    margin: 0;
    text-align: center;
    padding: 0.375rem 0;
  }

  /* --- Mini bubble rows --- */

  .mini-bubble-row {
    display: flex;
  }

  .mini-row-received {
    justify-content: flex-start;
  }

  .mini-row-sent {
    justify-content: flex-end;
  }

  .mini-bubble {
    max-width: 80%;
    padding: 0.125rem 0.375rem;
    border-radius: 0.375rem;
    font-size: 0.625rem;
    line-height: 1.4;
  }

  .mini-bubble-received {
    background: var(--surface-2);
    color: var(--ink);
  }

  .mini-bubble-sent {
    background: color-mix(in srgb, var(--brand-text) 15%, var(--surface-1));
    color: var(--ink);
  }

  .mini-text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    overflow: hidden;
  }

  /* In multiline mode (list view), allow 2 lines per bubble. */
  .multiline .mini-text {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .mini-media {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    color: var(--muted);
    vertical-align: middle;
    flex-shrink: 0;
  }

  /* --- System events (centered, no bubble) --- */

  .mini-system {
    text-align: center;
    font-size: 0.5625rem;
    color: var(--muted);
    font-style: italic;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 0.25rem;
  }

  /* --- Internal notes (outline card style) --- */

  .mini-note {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.625rem;
    line-height: 1.4;
    color: var(--muted);
    font-style: italic;
    padding: 0.125rem 0.375rem;
    border: 1px solid var(--divider);
    border-radius: 0.25rem;
    overflow: hidden;
  }

  :global(.mini-note-icon) {
    color: var(--brand-accent, var(--brand-primary));
    flex-shrink: 0;
  }
</style>

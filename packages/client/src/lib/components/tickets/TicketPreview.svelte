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
  import { followupSlot } from "@care-y/crypto";
  import {
    Mic,
    Image as ImageIcon,
    Paperclip,
    StickyNote,
    type LucideIcon,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { ReactionSummary } from "@care-y/shared";
  import {
    getFollowUpDecryptCache,
    getOrgDecryptCache,
  } from "$lib/crypto/context.js";
  import {
    resolveAsyncDecrypt,
    isDecryptReady,
  } from "$lib/crypto/decrypt-result.js";
  import { trpc } from "$lib/trpc/index.js";
  import { createNoteTypesQuery } from "$lib/tickets/queries.js";
  import { resolveNoteTypeIcon as resolveNoteTypeIconComponent } from "$lib/utils/note-type-icons.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import ReactionTray from "./ReactionTray.svelte";
  import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
  import { followUpKind } from "$lib/tickets/follow-up-utils.js";
  import { systemEventLabel } from "$lib/tickets/system-event-label.js";

  interface Props {
    ticketId: string;
    followUps: RawFollowUpPreview[] | undefined;
    /** Allow 2-line wrapping per bubble (list mode). */
    multiline?: boolean;
    /** Known follow-up count. Limits placeholder bubbles when preview hasn't loaded. */
    followUpCount?: number;
    /** Reaction summaries keyed by follow-up ID (display-only). */
    reactions?: Record<string, ReactionSummary[]>;
  }

  let {
    ticketId,
    followUps,
    multiline = false,
    followUpCount,
    reactions,
  }: Props = $props();
  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();

  const noteTypesQuery = trpc.tickets?.noteTypes
    ? createNoteTypesQuery(trpc.tickets.noteTypes)
    : undefined;

  function effectiveTypeId(noteTypeId: string | null): string | undefined {
    if (!noteTypesQuery?.data) return undefined;
    if (noteTypeId !== null) return noteTypeId;
    return noteTypesQuery.data.defaultNoteTypeId ?? undefined;
  }

  function resolveIcon(noteTypeId: string | null): LucideIcon {
    const id = effectiveTypeId(noteTypeId);
    if (id === undefined || !noteTypesQuery?.data) return StickyNote;
    const nt = noteTypesQuery.data.types.find((t) => t.id === id);
    if (!nt) return StickyNote;
    const slug = orgCache.decrypt(nt.id + ":icon", nt.encryptedIcon);
    return resolveNoteTypeIconComponent(slug ?? null);
  }

  function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + "\u2026";
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
      {#if kind === "system"}
        <!-- System events carry no encrypted payload (the server creates
             them without the org key), so their label derives from the
             type field exactly like SystemEvent in the detail view.
             Pushing them through the decrypt path rendered a decrypt
             error as preview text. -->
        <div class="mini-system" data-type="system">
          {truncate(systemEventLabel(fu.type), 40)}
        </div>
      {:else}
        {@const raw = followUpCache.decryptContent(
          fu.id,
          ticketId,
          followupSlot(fu.id),
          fu.keyWrap,
          fu.encryptedContent,
        )}
        {@const result = resolveAsyncDecrypt(raw, fu.keyWrap !== null)}
        {@const content = isDecryptReady(result) ? result.value : undefined}
        {#if kind === "note"}
          {@const NoteIcon = resolveIcon(fu.noteTypeId)}
          {@const noteReactions = reactions?.[fu.id] ?? []}
          <div
            class="mini-note-wrap"
            class:has-reactions={noteReactions.length > 0}
          >
            <div class="mini-note">
              <NoteIcon size={10} class="mini-note-icon" />
              <DecryptPlaceholder
                {result}
                ciphertext={fu.encryptedContent}
                length={20}
                block={multiline}
                charsPerLine={20}
                maxLines={multiline ? 2 : 1}
              >
                <span class="mini-text">{content}</span>
              </DecryptPlaceholder>
            </div>
            <ReactionTray reactions={noteReactions} size="mini" />
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
                {result}
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

  .mini-note-wrap {
    position: relative;
  }

  .mini-note-wrap.has-reactions {
    margin-bottom: 0.625rem;
  }

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

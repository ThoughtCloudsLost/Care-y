<!--
  Ticket list preview window: miniature conversation bubbles in the
  Inkwell anatomy, mirroring the detail view at reading size.

  Shows at most 3 follow-ups (from the recentFollowUps endpoint),
  reversed into chronological order (oldest on top). Caller bubbles
  sit left on paper with a hairline; the org side sits right on the
  brand tint; internal notes span full width on recessed paper; system
  events stay centered muted lines derived from the type field. Text
  truncated to one line (two in multiline mode). In fit mode (grid's
  fixed-height window) the stack bottom-anchors at a compact scale so
  the three most recent entries fit whole; an entry that still cannot
  fit hides rather than being sliced mid-line.

  Failed bubble decrypts render a quiet "could not unlock" state with
  a retry that clears the cache entry so the Worker decrypt re-fires;
  raw crypto errors never surface as content.
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
    /** Client alias for the caller-bubble speaker eyebrow. Volunteer
     *  bubbles carry no eyebrow here: previews have no author identity,
     *  and alignment plus the brand tint already mark the org side. */
    clientAlias?: string;
    /** Whole-bubble fitting for a fixed-height window (grid cells):
     *  bottom-anchor the stack and hide entries that don't fully fit,
     *  so the window's crop never slices a bubble mid-line. */
    fit?: boolean;
  }

  let {
    ticketId,
    followUps,
    multiline = false,
    followUpCount,
    reactions,
    clientAlias,
    fit = false,
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

  /** Note-type name via the org-decrypt path; null keeps the eyebrow icon-only. */
  function resolveNoteTypeName(noteTypeId: string | null): string | null {
    const id = effectiveTypeId(noteTypeId);
    if (id === undefined || !noteTypesQuery?.data) return null;
    const nt = noteTypesQuery.data.types.find((t) => t.id === id);
    if (!nt) return null;
    return orgCache.decrypt(nt.id + ":name", nt.encryptedName);
  }

  /** Clear the cached failure so the next render re-fires the Worker decrypt. */
  function retryDecrypt(followUpId: string): void {
    followUpCache.deleteByPrefix(followUpId);
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

  let chatEl = $state<HTMLDivElement | undefined>();

  // Whole-bubble fitting: the window's overflow crop stays, but only
  // whole entries remain visible. Bottom anchoring makes overflow spill
  // off the TOP (oldest first) so the newest reply is always intact.
  // Measured rather than budgeted because entry heights vary (notes,
  // media rows, reactions, Dynamic Type). Hiding uses visibility, never
  // display: hidden entries keep their layout box, so clipping cannot
  // reflow siblings and re-trigger the observer.
  $effect(() => {
    if (!fit) return;
    const el = chatEl;
    if (!el) return;
    // Re-run when the rendered entry set changes (real or placeholder).
    void ordered;
    void followUpCount;

    const applyClipping = (): void => {
      const rootTop = el.getBoundingClientRect().top;
      for (const child of Array.from(el.children)) {
        if (!(child instanceof HTMLElement)) continue;
        if (child.getBoundingClientRect().top < rootTop - 0.5) {
          child.setAttribute("data-clipped", "");
        } else {
          child.removeAttribute("data-clipped");
        }
      }
    };

    // Decrypt settling changes entry heights; column resize changes the
    // root's width. Both re-run the pass through one observer.
    const ro = new ResizeObserver(applyClipping);
    ro.observe(el);
    for (const child of Array.from(el.children)) {
      ro.observe(child);
    }
    applyClipping();
    return () => ro.disconnect();
  });
</script>

<div class="mini-chat" class:multiline class:fit bind:this={chatEl}>
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
          {@const noteTypeName = resolveNoteTypeName(fu.noteTypeId)}
          {@const noteReactions = reactions?.[fu.id] ?? []}
          <div
            class="mini-note-wrap"
            class:has-reactions={noteReactions.length > 0}
          >
            <div class="mini-note">
              <span class="mini-who mini-note-eyebrow">
                <NoteIcon size={10} class="mini-note-icon" />
                {#if noteTypeName !== null}
                  {m.preview_note_internal({ name: noteTypeName })}
                {/if}
              </span>
              <DecryptPlaceholder
                {result}
                ciphertext={fu.encryptedContent}
                length={20}
                block={multiline}
                charsPerLine={20}
                maxLines={multiline ? 2 : 1}
                errorLabel={m.preview_unlock_failed()}
              >
                <span class="mini-text">{content}</span>
              </DecryptPlaceholder>
              {#if result.status === "error"}
                <button
                  type="button"
                  class="preview-retry"
                  onclick={(e) => {
                    e.stopPropagation();
                    retryDecrypt(fu.id);
                  }}
                >
                  {m.preview_retry()}
                </button>
              {/if}
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
              {#if fu.source === "client" && clientAlias !== undefined}
                <span class="mini-who">{clientAlias}</span>
              {/if}
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
                errorLabel={m.preview_unlock_failed()}
              >
                {#if content}<span class="mini-text">{content}</span>{/if}
              </DecryptPlaceholder>
              {#if result.status === "error"}
                <button
                  type="button"
                  class="preview-retry"
                  onclick={(e) => {
                    e.stopPropagation();
                    retryDecrypt(fu.id);
                  }}
                >
                  {m.preview_retry()}
                </button>
              {/if}
            </div>
          </div>
        {/if}
      {/if}
    {/each}
  {/if}
</div>

<style>
  /* Bubble stack: 6px gaps per the card anatomy; outer margins belong
     to the consuming card. */
  .mini-chat {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0.375rem 0.5rem;
    min-height: 2rem;
  }

  /* Whole-bubble fit (fixed-height grid window): bottom-anchored like
     the detail chat pane, so overflow spills off the top, oldest first.
     Compact scale (the pre-Inkwell mini sizing): three single-line rows
     at 10px plus gaps and padding come to ~74px against the 5rem
     window, so the three most recent follow-ups are always visible.
     The clip effect below stays only as the no-sliced-glyphs safety
     net for taller edge rows (reaction trays under notes). */
  .mini-chat.fit {
    height: 100%;
    justify-content: flex-end;
    gap: 3px;
    padding: 0.25rem 0.5rem;
  }

  /* data-clipped is set at runtime by the fit effect, so the child part
     must be :global or the compiler prunes the "unused" selector. */
  .mini-chat.fit > :global([data-clipped]) {
    visibility: hidden;
  }

  .mini-chat.fit .mini-bubble,
  .mini-chat.fit .mini-note {
    padding: 2px 7px;
    font-size: 0.625rem;
  }

  .mini-chat.fit .mini-bubble {
    border-radius: 9px;
  }

  .mini-chat.fit .mini-bubble-received {
    border-bottom-left-radius: 4px;
  }

  .mini-chat.fit .mini-bubble-sent {
    border-bottom-right-radius: 4px;
  }

  .mini-chat.fit .mini-note {
    border-radius: 6px;
  }

  /* The grid card header already names the caller. */
  .mini-chat.fit .mini-who {
    display: none;
  }

  .preview-empty {
    font-size: var(--text-xs);
    color: var(--muted);
    margin: 0;
    text-align: center;
    padding: 0.375rem 0;
  }

  /* --- Conversation bubbles (the mock's .q anatomy) --- */

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
    max-width: 86%;
    padding: 7px 11px;
    border-radius: 13px;
    font-size: var(--text-base);
    line-height: 1.4;
  }

  /* Caller: paper with a hairline, anchored bottom-left. */
  .mini-bubble-received {
    background: var(--paper);
    border: 1px solid var(--hair);
    border-bottom-left-radius: 5px;
    color: var(--ink);
  }

  /* Org side: brand tint only (never full brand fill), bottom-right anchor. */
  .mini-bubble-sent {
    background: var(--brand-soft);
    border: 1px solid transparent;
    border-bottom-right-radius: 5px;
    color: var(--ink-2);
  }

  /* Speaker eyebrow inside a bubble (callers only in previews). */
  .mini-who {
    display: block;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 2px;
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

  /* --- Internal notes: full-width recessed paper block --- */

  .mini-note-wrap {
    position: relative;
  }

  .mini-note-wrap.has-reactions {
    margin-bottom: 0.625rem;
  }

  .mini-note {
    width: 100%;
    padding: 7px 11px;
    background: var(--paper-deep);
    border: 1px solid var(--hair);
    border-radius: 10px;
    font-size: var(--text-base);
    line-height: 1.4;
    color: var(--ink-2);
    overflow: hidden;
  }

  .mini-note-eyebrow {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Icons are tools on the desk: quiet ink, never brand. */
  :global(.mini-note-icon) {
    color: var(--muted);
    flex-shrink: 0;
  }

  /* --- Quiet unlock-failure retry --- */

  /* Sits above the card's full-cover open button. */
  .preview-retry {
    position: relative;
    z-index: 1;
    margin-left: 6px;
    padding: 0;
    border: none;
    background: none;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--brand-text);
    cursor: pointer;
  }
</style>

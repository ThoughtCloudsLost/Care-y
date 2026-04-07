<!--
  Ticket list preview window: miniature chat bubbles matching the
  detail view's visual language.

  Shows at most 3 follow-ups (from the recentFollowUps endpoint).
  Left-aligned mini-bubbles for client messages, right-aligned for
  volunteer messages, centered muted text for system events.
  Text truncated to single-line with ellipsis.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { getFollowUpDecryptCache } from "$lib/crypto/context.js";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

  interface Props {
    followUps: RawFollowUpPreview[] | undefined;
  }

  let { followUps }: Props = $props();
  const followUpCache = getFollowUpDecryptCache();

  function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + "\u2026";
  }
</script>

<div class="mini-chat">
  {#if followUps === undefined}
    <div class="shimmer shimmer-preview" aria-hidden="true"></div>
    <div class="shimmer shimmer-preview short" aria-hidden="true"></div>
  {:else if followUps.length === 0}
    <p class="preview-empty">{m.tickets_preview_empty()}</p>
  {:else}
    {#each followUps as fu (fu.id)}
      {@const content = followUpCache.decryptContent(
        fu.id,
        fu.keyWrap,
        fu.encryptedContent,
      )}
      {#if fu.source === "system"}
        <div class="mini-system">
          {#if isDecryptError(content)}
            {m.error_decryption_failed()}
          {:else if content === undefined}
            <span class="shimmer shimmer-mini" aria-hidden="true"></span>
          {:else}
            {truncate(content, 30)}
          {/if}
        </div>
      {:else}
        <div
          class="mini-bubble-row"
          class:mini-row-received={fu.source === "client"}
          class:mini-row-sent={fu.source !== "client"}
        >
          <div
            class="mini-bubble"
            class:mini-bubble-received={fu.source === "client"}
            class:mini-bubble-sent={fu.source !== "client"}
          >
            {#if isDecryptError(content)}
              <span class="mini-error">{m.error_decryption_failed()}</span>
            {:else if content === undefined}
              <span class="shimmer shimmer-mini" aria-hidden="true"></span>
            {:else}
              <span class="mini-text">{truncate(content, 30)}</span>
            {/if}
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-bubble-received {
    background: color-mix(in srgb, var(--brand-text) 15%, var(--surface-1));
    color: var(--ink);
  }

  .mini-bubble-sent {
    background: var(--surface-2);
    color: var(--ink);
  }

  .mini-text {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-error {
    display: block;
    color: var(--muted);
    font-style: italic;
    font-size: 0.625rem;
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

  /* --- Shimmer --- */

  .shimmer {
    border-radius: 0.25rem;
    background: linear-gradient(
      90deg,
      var(--surface-2) 25%,
      var(--surface-1) 50%,
      var(--surface-2) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }

  .shimmer-preview {
    height: 0.75rem;
    width: 90%;
  }

  .shimmer-preview.short {
    width: 60%;
  }

  .shimmer-mini {
    display: inline-block;
    height: 0.625rem;
    width: 4rem;
    border-radius: 0.25rem;
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
    .shimmer {
      animation: none;
      background: var(--surface-2);
    }
  }
</style>

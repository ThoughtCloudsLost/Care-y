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
</script>

<div class="preview-content">
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
      <div class="preview-line" data-source={fu.source}>
        {#if isDecryptError(content)}
          <span class="preview-error">{m.error_decryption_failed()}</span>
        {:else if content === undefined}
          <span class="shimmer shimmer-line" aria-hidden="true"></span>
        {:else}
          <span class="preview-text">{content}</span>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  .preview-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    min-height: 2rem;
  }

  .preview-empty {
    font-size: 0.75rem;
    color: var(--muted);
    margin: 0;
    text-align: center;
    padding: 0.5rem 0;
  }

  .preview-line {
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--ink);
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-line[data-source="client"] {
    color: var(--brand-text);
  }

  .preview-line[data-source="system"] {
    color: var(--muted);
    font-style: italic;
  }

  .preview-text {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-error {
    display: block;
    color: var(--muted);
    font-style: italic;
    opacity: 0.6;
  }

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

  .shimmer-line {
    display: block;
    height: 0.75rem;
    width: 80%;
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

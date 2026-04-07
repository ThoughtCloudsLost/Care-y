<!--
  System event inline marker for the chat timeline.

  Renders follow-ups with source="system" as centered, muted Konsta Chips.
  These are contextual flow markers (assignment, status, hold, priority changes),
  not messages. They show what happened, not what someone said.
-->
<script lang="ts">
  import { Chip } from "konsta/svelte";
  import { isDecryptError } from "$lib/crypto/async-decrypt-cache.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import * as m from "$lib/paraglide/messages.js";

  interface Props {
    content: string | undefined;
    timestamp: string;
  }

  let { content, timestamp }: Props = $props();

  const timeLabel = $derived(formatRelativeTime(new Date(timestamp)));
</script>

<div class="system-event" role="status">
  <Chip outline class="system-chip">
    {#if content === undefined}
      <span class="shimmer shimmer-chip" aria-busy="true"></span>
    {:else if isDecryptError(content)}
      {m.error_decryption_failed()}
    {:else}
      {content}
    {/if}
  </Chip>
  <time class="system-time" datetime={timestamp}>{timeLabel}</time>
</div>

<style>
  .system-event {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    padding: 0.5rem 1rem;
  }

  .system-time {
    font-size: 0.625rem;
    color: var(--muted);
    line-height: 1;
  }

  .shimmer-chip {
    display: inline-block;
    width: 6rem;
    height: 0.75rem;
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

  @keyframes shimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shimmer-chip {
      animation: none;
      background: var(--surface-2);
    }
  }
</style>

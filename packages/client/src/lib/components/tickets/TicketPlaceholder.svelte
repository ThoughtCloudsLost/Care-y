<!--
  Skeleton placeholder for the chat view while ticket data or follow-ups
  are loading. Renders filler bubbles in a cycling pattern, followed by
  optional preview content (partially-decrypted messages from the list cache).
-->
<script lang="ts">
  import { Messages, Message } from "konsta/svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import type { Snippet } from "svelte";

  interface PlaceholderBubble {
    kind: "message" | "system";
    type: "sent" | "received";
    length: number;
  }

  const PATTERN: PlaceholderBubble[] = [
    { kind: "message", type: "received", length: 45 },
    { kind: "message", type: "sent", length: 18 },
    { kind: "message", type: "received", length: 60 },
    { kind: "system", type: "received", length: 15 },
    { kind: "message", type: "sent", length: 30 },
    { kind: "message", type: "received", length: 20 },
  ];

  interface TicketPlaceholderProps {
    fillerCount: number;
    children?: Snippet;
  }

  const { fillerCount, children }: TicketPlaceholderProps = $props();

  const bubbles = $derived.by((): PlaceholderBubble[] => {
    const result: PlaceholderBubble[] = [];
    for (let i = 0; i < fillerCount; i++) {
      const bubble = PATTERN[i % PATTERN.length];
      if (bubble) result.push(bubble);
    }
    return result;
  });
</script>

<Messages>
  {#each bubbles as bubble, i (i)}
    {#if bubble.kind === "system"}
      <div class="fu-wrapper filler-pulse">
        <div class="system-event-placeholder">
          <DecryptPlaceholder length={bubble.length} />
        </div>
      </div>
    {:else}
      <div class="fu-wrapper filler-pulse">
        <Message type={bubble.type}>
          {#snippet text()}
            <span class="bubble-text">
              <DecryptPlaceholder length={bubble.length} block />
            </span>
          {/snippet}
          {#snippet footer()}
            <span class="bubble-time">
              <InlineSkeleton width="4ch" />
            </span>
          {/snippet}
        </Message>
      </div>
    {/if}
  {/each}

  {#if children}
    {@render children()}
  {/if}
</Messages>

<style>
  .fu-wrapper {
    display: contents;
  }

  .filler-pulse > :global(.k-message),
  .filler-pulse > .system-event-placeholder {
    animation: filler-pulse 2.5s ease-in-out infinite;
  }

  @keyframes filler-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.65;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .filler-pulse > :global(.k-message),
    .filler-pulse > .system-event-placeholder {
      animation: none;
      opacity: 0.7;
    }
  }

  .system-event-placeholder {
    display: flex;
    justify-content: center;
    padding: 0.5rem 1rem;
  }

  .bubble-text {
    display: block;
    word-break: break-word;
  }

  .bubble-time {
    font-size: 0.625rem;
    color: var(--muted);
  }
</style>

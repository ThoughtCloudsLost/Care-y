<!--
  Skeleton placeholder for the chat view while ticket data or follow-ups
  are loading. Renders filler bubbles in a cycling pattern, followed by
  optional preview content (partially-decrypted messages from the list cache).

  The filler bubbles mirror ConversationBubble's anatomy at rest (raised
  paper left, brand tint right) so the loading state matches the loaded
  state; only the pulse marks them as placeholders.
-->
<script lang="ts">
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

<div class="thread">
  {#each bubbles as bubble, i (i)}
    {#if bubble.kind === "system"}
      <div class="fu-wrapper filler-pulse">
        <div class="system-event-placeholder">
          <DecryptPlaceholder length={bubble.length} />
        </div>
      </div>
    {:else}
      <div class="fu-wrapper filler-pulse">
        <div class="msg" class:msg-sent={bubble.type === "sent"}>
          <div class="msg-body">
            <span class="bubble-text">
              <DecryptPlaceholder length={bubble.length} block />
            </span>
          </div>
          <span class="msg-when">
            <InlineSkeleton width="4ch" />
          </span>
        </div>
      </div>
    {/if}
  {/each}

  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  /* Same thread container as the loaded conversation so the skeleton
     occupies identical geometry (gap, padding, compose bar clearance). */
  .thread {
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding: 16px;
    padding-left: calc(16px + env(safe-area-inset-left, 0px));
    padding-right: calc(16px + env(safe-area-inset-right, 0px));
    padding-bottom: 0;
    margin-bottom: var(
      --messagebar-height,
      calc(3.5rem + env(safe-area-inset-bottom, 0px))
    );
  }

  .fu-wrapper {
    display: contents;
  }

  .filler-pulse > .msg,
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
    .filler-pulse > .msg,
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

  /* ConversationBubble's anatomy at skeleton scale. */
  .msg {
    max-width: 86%;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-self: flex-start;
  }

  .msg-sent {
    align-self: flex-end;
    align-items: flex-end;
  }

  .msg-body {
    padding: 10px 14px;
    border-radius: 17px;
    border-bottom-left-radius: 5px;
    background: var(--raised);
    border: 1px solid var(--hair);
    color: var(--ink);
    font-size: var(--text-md);
    line-height: 1.5;
  }

  .msg-sent .msg-body {
    background: var(--brand-soft);
    border-color: transparent;
    color: var(--ink-2);
    font-size: 0.90625rem;
    border-bottom-left-radius: 17px;
    border-bottom-right-radius: 5px;
  }

  .msg-when {
    font-size: 0.6875rem;
    color: var(--muted);
    padding: 0 4px;
  }

  .bubble-text {
    display: block;
    word-break: break-word;
  }
</style>

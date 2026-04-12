<!--
  System event inline marker for the chat timeline.

  Renders follow-ups with source="system" as centered, muted Konsta Chips.
  These are contextual flow markers (assignment, status, hold, priority changes),
  not messages. They show what happened, not what someone said.
-->
<script lang="ts">
  import { Chip } from "konsta/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  interface Props {
    content: string | undefined;
    encryptedContent?: unknown;
    timestamp: string;
  }

  let { content, encryptedContent, timestamp }: Props = $props();

  const timeLabel = $derived(formatRelativeTime(new Date(timestamp)));
</script>

<div class="system-event" role="status">
  <Chip outline class="system-chip">
    <DecryptPlaceholder {content} ciphertext={encryptedContent} length={15} />
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
</style>

<!--
  System event inline marker for the chat timeline.

  Renders follow-ups with source="system" as centered, muted Konsta Chips.
  These are contextual flow markers (assignment, status, hold, priority changes),
  not messages. They show what happened, not what someone said.

  Display text is derived from the follow-up type field, not from encrypted
  content. System events carry no encrypted payload under the Proton model
  because the server (which creates them) does not hold the org private key.
-->
<script lang="ts">
  import { Chip } from "konsta/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { systemEventLabel } from "$lib/tickets/system-event-label.js";

  interface Props {
    type: string;
    timestamp: string;
  }

  let { type, timestamp }: Props = $props();

  const label = $derived(systemEventLabel(type));
  const timeLabel = $derived(formatRelativeTime(new Date(timestamp)));
</script>

<div class="system-event" role="status">
  <Chip outline class="system-chip">
    {label}
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

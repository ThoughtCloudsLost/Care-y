<!--
  System event inline marker for the chat timeline.

  Renders follow-ups with source="system" as a centered one-liner between
  hairline rules. These are contextual flow markers (assignment, status,
  hold, priority changes), not messages. They show what happened, not what
  someone said.

  Display text is derived from the follow-up type field, not from encrypted
  content. System events carry no encrypted payload under the Proton model
  because the server (which creates them) does not hold the org private key.
  No actor is shown: system rows never set created_by.
-->
<script lang="ts">
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { systemEventLabel } from "$lib/tickets/system-event-label.js";

  interface Props {
    type: string;
    timestamp: string;
    eventParams?: Record<string, unknown> | null;
    resolveUserName?: (userId: string) => string;
  }

  let { type, timestamp, eventParams, resolveUserName }: Props = $props();

  const label = $derived(systemEventLabel(type, eventParams, resolveUserName));
  const timeLabel = $derived(formatRelativeTime(new Date(timestamp)));
</script>

<div class="system-event" role="status">
  <span class="system-line"
    >{label} · <time datetime={timestamp}>{timeLabel}</time></span
  >
</div>

<style>
  /* No padding of its own: the thread gap and side padding place it. */
  .system-event {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    color: var(--muted);
    font-size: var(--text-sm);
  }

  .system-event::before,
  .system-event::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--hair);
  }

  .system-line {
    text-align: center;
  }
</style>

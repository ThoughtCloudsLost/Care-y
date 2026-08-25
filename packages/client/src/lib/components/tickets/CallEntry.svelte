<!--
  Call attempt inline marker for the chat timeline.

  Renders follow-ups with type="phone_call" as a centered one-liner
  between hairline rules, the same anatomy as SystemEvent. Call rows
  record what happened on the line (answered with duration, no answer,
  busy, failed, canceled), not what someone said, so they read as flow
  markers rather than bubbles. The label is derived from the call
  status columns, never from encrypted content.
-->
<script lang="ts">
  import { Phone } from "@lucide/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { formatCallLabel } from "$lib/tickets/call-label.js";
  import type { CallLabelInput } from "$lib/tickets/call-label.js";

  interface Props {
    source: string;
    callStatus: string | null;
    callDurationSeconds: number | null;
    timestamp: string;
  }

  let { source, callStatus, callDurationSeconds, timestamp }: Props = $props();

  const input: CallLabelInput = $derived({
    source,
    callStatus,
    callDurationSeconds,
  });
  const label = $derived(formatCallLabel(input));
  const timeLabel = $derived(formatRelativeTime(new Date(timestamp)));
</script>

<div class="call-entry" role="status">
  <span class="call-line">
    <Phone size={13} aria-hidden="true" />
    {label} · <time datetime={timestamp}>{timeLabel}</time>
  </span>
</div>

<style>
  /* No padding of its own: the thread gap and side padding place it. */
  .call-entry {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    color: var(--muted);
    font-size: var(--text-sm);
  }

  .call-entry::before,
  .call-entry::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--hair);
  }

  .call-line {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    text-align: center;
  }
</style>

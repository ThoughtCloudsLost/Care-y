<!--
  Call attempt content for a conversation bubble.

  Calls are directional events between a client and a volunteer, so
  they render inside a sided ConversationBubble like every other non
  system follow-up; only system events sit centered between hairline
  rules. This component is the bubble's content: a phone glyph plus
  the call outcome (answered with duration, no answer, busy, failed,
  canceled). The label is derived from the call status columns, never
  from encrypted content, and the bubble supplies the timestamp.
-->
<script lang="ts">
  import { Phone } from "@lucide/svelte";
  import { formatCallLabel } from "$lib/tickets/call-label.js";
  import type { CallLabelInput } from "$lib/tickets/call-label.js";

  interface Props {
    source: string;
    callStatus: string | null;
    callDurationSeconds: number | null;
  }

  let { source, callStatus, callDurationSeconds }: Props = $props();

  const input: CallLabelInput = $derived({
    source,
    callStatus,
    callDurationSeconds,
  });
  const label = $derived(formatCallLabel(input));
</script>

<span class="call-entry" role="status">
  <Phone size={14} aria-hidden="true" />
  {label}
</span>

<style>
  .call-entry {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: var(--text-sm);
  }
</style>

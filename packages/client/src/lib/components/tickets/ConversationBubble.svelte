<!--
  Conversation bubble for the ticket detail thread: the reading-size
  counterpart of TicketPreview's mini bubbles.

  The caller's words get the floor: received bubbles sit left on raised
  paper with a hairline and read at --text-md. Own replies sit right on
  the brand tint (never full brand fill) and read a step smaller. The
  5px anchor corner marks the speaker's side. The speaker eyebrow renders
  above caller bubbles only; alignment plus the brand tint already mark
  the org side.

  Presentational only: the fu-wrapper in TicketDetail carries selection,
  long-press wiring, and the aria-label, so this component adds no label
  of its own (doubling would repeat screen reader announcements).
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";

  interface Props {
    direction: "received" | "sent";
    /** Speaker eyebrow above the bubble (callers only). */
    speaker?: string;
    /** Follow-up source, exposed as data-source (E2E locator contract). */
    source?: "client" | "volunteer";
    timestamp: string;
    children: Snippet;
  }

  let { direction, speaker, source, timestamp, children }: Props = $props();
</script>

<div
  class="msg"
  class:msg-sent={direction === "sent"}
  data-direction={direction}
  data-source={source}
>
  {#if direction === "received" && speaker !== undefined}
    <span class="msg-who">{speaker}</span>
  {/if}
  <div class="msg-body">
    {@render children()}
  </div>
  <time class="msg-when" datetime={timestamp}>
    {formatRelativeTime(new Date(timestamp))}
  </time>
</div>

<style>
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

  /* Speaker attribution: quiet title-case so the conversation content
     leads. Structural eyebrows (registers, section heads) keep uppercase. */
  .msg-who {
    font-size: 0.65625rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    color: var(--muted);
    padding-left: 4px;
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
    overflow-wrap: break-word;
  }

  /* Own replies go quiet: brand tint only, one step smaller than the
     caller. 14.5px sits between the mobile tokens, so raw rem. The
     transparent border keeps box parity with caller bubbles. */
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
    font-variant-numeric: tabular-nums;
    padding: 0 4px;
  }
</style>

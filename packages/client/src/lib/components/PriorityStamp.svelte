<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import type { TicketPriority } from "@care-y/shared";

  interface Props {
    priority: TicketPriority;
  }

  let { priority }: Props = $props();

  // Inkwell rule: priority is the single hue channel in any list, and Normal
  // renders nothing at all. If everything shouts, nothing does. Map lookup
  // (not object indexing) per the lint security rules.
  const labels = new Map<TicketPriority, () => string>([
    ["urgent", m.priority_stamp_urgent],
    ["high", m.priority_stamp_high],
    ["low", m.priority_stamp_low],
  ]);

  const label = $derived(labels.get(priority)?.());
</script>

{#if label !== undefined}
  <span class="stamp stamp-{priority}" data-priority={priority}>{label}</span>
{/if}

<style>
  .stamp {
    display: inline-block;
    font-size: 0.625rem; /* 10px */
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    padding: 2.5px 7px;
    border: 1px solid currentColor;
    border-radius: 3px;
    transform: rotate(-0.5deg);
    white-space: nowrap;
  }

  .stamp-urgent {
    color: var(--urgent);
    background: var(--urgent-soft);
  }

  .stamp-high {
    color: var(--care);
    background: var(--care-soft);
  }

  .stamp-low {
    color: var(--muted);
    border-style: dashed;
    transform: none;
  }
</style>

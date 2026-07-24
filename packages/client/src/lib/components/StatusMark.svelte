<!-- care-y-ignore no-large-inline-svg -- pause-bars icon is a single cohesive SVG with path data; splitting it would add complexity for no render benefit -->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import type { DisplayStatus } from "$lib/tickets/display-status.js";

  interface Props {
    status: DisplayStatus;
    unreadHighlight?: boolean;
  }

  let { status, unreadHighlight = false }: Props = $props();

  // Inkwell rule: status is a shape, never a hue. The unread highlight is
  // a sanctioned fifth hue scoped to unread signals only (status-mark
  // highlight, unread filter and sort dots); NewPill stays ink-on-paper.
  // The four marks share one 13x13 viewBox and optical center so swapping
  // status never shifts layout. Geometry is transcribed from the approved
  // mock (inkwell-design-language.md).
  // Map lookup (not object indexing) per the lint security rules; the
  // fallback is unreachable with a valid DisplayStatus.
  const labels = new Map<DisplayStatus, () => string>([
    ["new", m.status_mark_new],
    ["active", m.status_mark_active],
    ["hold", m.status_mark_hold],
    ["closed", m.status_mark_closed],
  ]);

  const label = $derived((labels.get(status) ?? m.status_mark_new)());
</script>

<span
  class="status-mark"
  class:unread-highlight={unreadHighlight}
  role="img"
  aria-label={label}
  data-status={status}
>
  <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
    {#if status === "new"}
      <circle cx="6.5" cy="6.5" r="5.4" fill="currentColor" />
    {:else if status === "active"}
      <circle
        cx="6.5"
        cy="6.5"
        r="5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
      />
      <circle cx="6.5" cy="6.5" r="2.1" fill="currentColor" />
    {:else if status === "hold"}
      <rect
        x="3.2"
        y="2.8"
        width="2.2"
        height="7.4"
        rx="0.6"
        fill="currentColor"
      />
      <rect
        x="7.6"
        y="2.8"
        width="2.2"
        height="7.4"
        rx="0.6"
        fill="currentColor"
      />
    {:else}
      <line
        x1="3"
        y1="3"
        x2="10"
        y2="10"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <line
        x1="10"
        y1="3"
        x2="3"
        y2="10"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    {/if}
  </svg>
</span>

<style>
  .status-mark {
    display: inline-flex;
    color: var(--ink);
  }

  .unread-highlight {
    color: var(--unread);
  }

  .status-mark svg {
    display: block;
  }
</style>

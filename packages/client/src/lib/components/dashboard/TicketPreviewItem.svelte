<script lang="ts">
  import { ListItem } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface TicketPreviewItemProps {
    /** Ticket ID for navigation */
    ticketId: string;
    /** Decrypted title, or undefined if decryption is pending or key wrap is unavailable */
    title?: string;
    /** Ticket status */
    status: string;
    /** Ticket priority */
    priority: string;
    /** Whether ticket is on hold */
    onHold: boolean;
    /** Assignee user ID or null */
    assignedTo: string | null;
    /** Creation timestamp */
    createdAt: Date;
  }

  let {
    ticketId,
    title,
    status,
    priority,
    onHold,
    assignedTo,
    createdAt,
  }: TicketPreviewItemProps = $props();

  const displayTitle = $derived(title ?? m.dashboard_encrypted_ticket());
  const timeAgo = $derived(formatRelativeTime(createdAt));

  function formatRelativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return m.dashboard_time_just_now();
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return m.dashboard_time_minutes_ago({ count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return m.dashboard_time_hours_ago({ count: hours });
    const days = Math.floor(hours / 24);
    return m.dashboard_time_days_ago({ count: days });
  }
</script>

<ListItem link href="/tickets/{ticketId}" title={displayTitle} after={timeAgo}>
  {#snippet media()}
    <span
      class="status-dot"
      data-status={onHold ? "hold" : status}
      data-priority={priority}
      aria-hidden="true"
    ></span>
  {/snippet}
  {#snippet subtitle()}
    <span class="preview-meta">
      {#if onHold}
        {m.dashboard_status_on_hold()}
      {:else if status === "open"}
        {m.dashboard_status_open()}
      {:else}
        {m.dashboard_status_closed()}
      {/if}
      {#if assignedTo}
        <span class="preview-assignee">{assignedTo}</span>
      {/if}
    </span>
  {/snippet}
</ListItem>

<style>
  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot[data-status="open"] {
    background: var(--brand-text);
  }

  .status-dot[data-status="hold"] {
    background: #ff9500;
  }

  .status-dot[data-status="closed"] {
    background: var(--muted);
  }

  .preview-meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .preview-assignee {
    opacity: 0.7;
  }
</style>

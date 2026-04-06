<script lang="ts">
  import {
    Activity,
    TicketPlus,
    TicketCheck,
    TicketX,
    MessageSquare,
  } from "@lucide/svelte";
  import type { Component } from "svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import * as m from "$lib/paraglide/messages.js";
  import CollapsibleSection from "./CollapsibleSection.svelte";

  interface ActivityItem {
    id: string;
    eventType: string;
    ticketId: string | null;
    clientAlias: string;
    queueName: string;
    createdAt: Date | string;
  }

  interface ActivitySectionProps {
    activity: ActivityItem[];
    expanded: boolean;
    ontoggle: () => void;
    ontap?: (ticketId: string) => void;
  }

  let { activity, expanded, ontoggle, ontap }: ActivitySectionProps = $props();

  function eventLabel(eventType: string): string {
    switch (eventType) {
      case "ticket_created":
        return m.dashboard_activity_ticket_created();
      case "ticket_closed":
        return m.dashboard_activity_ticket_closed();
      case "ticket_reopened":
        return m.dashboard_activity_ticket_reopened();
      case "followup_added":
        return m.dashboard_activity_followup_added();
      case "mention":
        return m.dashboard_activity_mention();
      default:
        return m.dashboard_activity_unknown();
    }
  }

  function eventIcon(eventType: string): Component {
    switch (eventType) {
      case "ticket_created":
        return TicketPlus;
      case "ticket_closed":
        return TicketCheck;
      case "ticket_reopened":
        return TicketX;
      case "followup_added":
      case "mention":
        return MessageSquare;
      default:
        return Activity;
    }
  }
</script>

<CollapsibleSection
  heading={m.dashboard_activity_heading()}
  icon={Activity}
  iconColor="var(--brand-accent)"
  {expanded}
  {ontoggle}
>
  {#if activity.length > 0}
    <div class="activity-content">
      <div class="activity-summary">
        <span>{m.dashboard_activity_summary({ count: activity.length })}</span>
      </div>

      <div class="activity-surface">
        {#each activity.slice(0, 5) as item (item.id)}
          {@const EventIcon = eventIcon(item.eventType)}
          <div
            class="activity-row touch-feedback"
            role="button"
            tabindex="0"
            onclick={() => item.ticketId !== null && ontap?.(item.ticketId)}
            aria-disabled={item.ticketId === null}
            onkeydown={(e) => {
              if (
                (e.key === "Enter" || e.key === " ") &&
                item.ticketId !== null
              ) {
                if (e.key === " ") e.preventDefault();
                ontap?.(item.ticketId);
              }
            }}
          >
            <span class="activity-icon-gutter" aria-hidden="true">
              <EventIcon size={13} />
            </span>
            <span class="activity-event">{eventLabel(item.eventType)}</span>
            <span class="activity-alias">{item.clientAlias}</span>
            <span class="activity-queue"
              >{m.dashboard_activity_in_queue({ queue: item.queueName })}</span
            >
            <span class="activity-time">
              {formatRelativeTime(
                item.createdAt instanceof Date
                  ? item.createdAt
                  : new Date(item.createdAt),
              )}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <p class="no-activity">{m.dashboard_activity_no_activity()}</p>
  {/if}
</CollapsibleSection>

<style>
  .activity-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0 var(--page-pad-x) 0.25rem;
  }

  .activity-summary {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .activity-surface {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--surface-1);
    border-radius: var(--card-radius);
    overflow: hidden;
  }

  .activity-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--text-sm);
    color: var(--muted);
    padding: var(--space-lg) var(--page-pad-x);
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
  }

  .activity-row:last-child {
    border-bottom: none;
  }

  .activity-icon-gutter {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1rem;
    color: var(--muted);
    opacity: 0.55;
  }

  .activity-event {
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
  }

  .activity-alias {
    display: inline-flex;
    align-items: center;
    padding: 0.0625rem 0.3125rem;
    border-radius: 0.25rem;
    background: color-mix(in srgb, var(--ink) 10%, transparent);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--ink);
    opacity: 0.75;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .activity-queue {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    color: var(--muted);
    font-size: var(--text-xs);
  }

  .activity-time {
    flex-shrink: 0;
    margin-left: auto;
    font-size: var(--text-xs);
    opacity: 0.7;
  }

  .no-activity {
    padding: 0 1rem 0.5rem;
    font-size: var(--text-base);
    color: var(--muted);
  }
</style>

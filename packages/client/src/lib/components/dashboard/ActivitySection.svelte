<script lang="ts">
  import { Activity, MessageSquare } from "@lucide/svelte";
  import TicketPlus from "$lib/components/icons/TicketPlus.svelte";
  import TicketCheck from "$lib/components/icons/TicketCheck.svelte";
  import TicketX from "$lib/components/icons/TicketX.svelte";
  import type { Component } from "svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import CollapsibleSection from "./CollapsibleSection.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  interface ActivityItem {
    id: string;
    eventType: string;
    ticketId: string | null;
    clientAlias: string;
    queueName: string | null;
    createdAt: Date | string;
  }

  interface ActivitySectionProps {
    activity: ActivityItem[];
    loading?: boolean;
    expanded: boolean;
    ontoggle: () => void;
    ontap?: (ticketId: string) => void;
  }

  let {
    activity,
    loading = false,
    expanded,
    ontoggle,
    ontap,
  }: ActivitySectionProps = $props();

  function eventLabel(eventType: string): string {
    switch (eventType) {
      case "ticket_created":
        return m.dashboard_activity_ticket_created(withTerms());
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
  {loading}
  {expanded}
  {ontoggle}
>
  {#if loading}
    <div class="activity-content skeleton-pulse">
      <div class="activity-surface">
        {#each [1, 2, 3] as n (n)}
          <div class="activity-row">
            <span class="activity-icon-gutter" aria-hidden="true">
              <Activity size={13} />
            </span>
            <span class="activity-event"><InlineSkeleton width="8ch" /></span>
            <span class="activity-alias"><InlineSkeleton width="4ch" /></span>
            <span class="activity-queue"><DecryptPlaceholder length={6} /></span
            >
            <span class="activity-time"><InlineSkeleton width="3ch" /></span>
          </div>
        {/each}
      </div>
    </div>
  {:else if activity.length > 0}
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
            onkeydown={onKeyActivate(() => {
              if (item.ticketId !== null) ontap?.(item.ticketId);
            })}
          >
            <span class="activity-icon-gutter" aria-hidden="true">
              <EventIcon size={13} />
            </span>
            <span class="activity-event">{eventLabel(item.eventType)}</span>
            <span class="activity-alias">{item.clientAlias}</span>
            <span class="activity-queue"
              >{m.dashboard_activity_in_queue(
                withTerms({
                  queueName: item.queueName ?? "...",
                }),
              )}</span
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

  /* Ruled rows: a top hairline opens the list; each row carries its own
     bottom hairline (matches the ticket row family). */
  .activity-surface {
    display: flex;
    flex-direction: column;
    gap: 0;
    border-top: 1px solid var(--hair);
  }

  .activity-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--text-sm);
    color: var(--muted);
    padding: var(--space-lg) var(--page-pad-x);
    border-bottom: 1px solid var(--hair);
    cursor: pointer;
  }

  .activity-icon-gutter {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1rem;
    color: var(--muted);
  }

  .activity-event {
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
  }

  .activity-alias {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--muted);
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
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }

  .no-activity {
    padding: 0 1rem 0.5rem;
    font-size: var(--text-base);
    color: var(--muted);
  }
</style>

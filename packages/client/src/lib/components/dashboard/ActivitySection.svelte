<script lang="ts">
  import { Activity, Dot } from "@lucide/svelte";
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
  }

  let { activity, expanded, ontoggle }: ActivitySectionProps = $props();

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
          <div class="activity-row">
            <span class="activity-event">{eventLabel(item.eventType)}</span>
            <span class="activity-detail">
              {item.clientAlias}
              <Dot size={10} aria-hidden="true" class="inline-sep" />
              {item.queueName}
            </span>
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
    gap: 0.375rem;
    padding: 0 0.75rem 0.25rem;
  }

  .activity-summary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .activity-surface {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--surface-1);
    border-radius: var(--card-radius, 0.75rem);
    overflow: hidden;
  }

  .activity-row {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--muted);
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid color-mix(in srgb, var(--ink) 6%, transparent);
  }

  .activity-row:last-child {
    border-bottom: none;
  }

  .activity-event {
    font-weight: 500;
    color: var(--ink);
    opacity: 0.8;
    white-space: nowrap;
  }

  .activity-detail {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  :global(.inline-sep) {
    display: inline;
    vertical-align: middle;
    opacity: 0.4;
    margin: 0 -0.0625rem;
  }

  .activity-time {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 0.6875rem;
    opacity: 0.7;
  }

  .no-activity {
    padding: 0 1rem 0.5rem;
    font-size: 0.8125rem;
    color: var(--muted);
  }
</style>

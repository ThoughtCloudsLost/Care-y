<script lang="ts">
  import { Card } from "konsta/svelte";
  import { Clock, Layers, Activity, BookOpen, Dot } from "@lucide/svelte";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import * as m from "$lib/paraglide/messages.js";

  interface ShiftInfo {
    current: { start: string; end: string; label: string };
    volunteersOnShift: number;
  }

  interface QueueInfo {
    id: string;
    name: string;
  }

  interface ActivityItem {
    id: string;
    eventType: string;
    ticketId: string | null;
    clientAlias: string;
    queueName: string;
    createdAt: Date | string;
  }

  interface KBItem {
    id: string;
    encryptedTitle: unknown;
    updatedAt: Date | string;
    /** Decrypted title, set after org-key decrypt on main thread */
    decryptedTitle?: string;
  }

  interface QuickInfoBarProps {
    shift: ShiftInfo | null;
    queues: QueueInfo[];
    activity: ActivityItem[];
    kbItems: KBItem[];
  }

  let { shift, queues, activity, kbItems }: QuickInfoBarProps = $props();

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

<Card class="quick-info-bar">
  <div class="info-grid">
    {#if shift}
      <div class="info-item">
        <Clock size={14} aria-hidden="true" class="info-icon" />
        <div class="info-content">
          <span class="info-primary">
            {m.dashboard_info_shift({
              start: shift.current.start,
              end: shift.current.end,
            })}
          </span>
          <span class="info-secondary">
            {m.dashboard_info_volunteers_on_shift({
              count: shift.volunteersOnShift,
            })}
          </span>
        </div>
      </div>
    {/if}

    <div class="info-item">
      <Layers size={14} aria-hidden="true" class="info-icon" />
      <div class="info-content">
        {#if queues.length > 0}
          <span class="info-primary queue-list">
            {#each queues as q, i (q.id)}
              {#if i > 0}<Dot
                  size={12}
                  aria-hidden="true"
                  class="inline-sep"
                />{/if}
              {q.name}
            {/each}
          </span>
        {:else}
          <span class="info-secondary">{m.dashboard_info_no_queues()}</span>
        {/if}
      </div>
    </div>

    {#if activity.length > 0}
      <div class="info-item info-item-activity">
        <Activity size={14} aria-hidden="true" class="info-icon" />
        <div class="info-content">
          {#each activity.slice(0, 3) as item (item.id)}
            <span class="activity-line">
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
            </span>
          {/each}
        </div>
      </div>
    {/if}

    {#if kbItems.length > 0}
      <div class="info-item">
        <BookOpen size={14} aria-hidden="true" class="info-icon" />
        <div class="info-content">
          {#each kbItems as item (item.id)}
            <span class="info-primary">
              {item.decryptedTitle ?? m.dashboard_info_kb_encrypted_title()}
            </span>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</Card>

<style>
  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .info-item :global(.info-icon) {
    flex-shrink: 0;
    margin-top: 0.125rem;
    color: var(--muted);
  }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .info-primary {
    color: var(--ink);
  }

  .info-secondary {
    color: var(--muted);
    font-size: 0.75rem;
  }

  .queue-list {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .info-item-activity .info-content {
    gap: 0.25rem;
  }

  .activity-line {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--muted);
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

  .activity-time {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 0.6875rem;
    opacity: 0.7;
  }

  :global(.inline-sep) {
    display: inline;
    vertical-align: middle;
    opacity: 0.4;
    margin: 0 -0.0625rem;
  }
</style>

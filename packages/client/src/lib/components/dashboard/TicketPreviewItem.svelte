<script lang="ts">
  import { ListItem, Chip } from "konsta/svelte";
  import { ChevronRight, Dot } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import PriorityBadge from "$lib/components/PriorityBadge.svelte";
  import EncryptedTitle from "$lib/components/EncryptedTitle.svelte";
  import type { TicketPreviewItemProps } from "./types.js";

  let {
    ticketId,
    titleResult,
    priority,
    clientAlias,
    queueName,
    lastActivityAt,
    followUpCount,
    assignedName,
    ontap,
    onhelp,
  }: TicketPreviewItemProps = $props();

  const isEncrypted = $derived(
    titleResult.status === "denied" ||
      titleResult.status === "error" ||
      titleResult.status === "loading",
  );

  const activityDate = $derived(lastActivityAt ?? undefined);
  const timeAgo = $derived(
    activityDate ? formatRelativeTime(activityDate) : "",
  );
</script>

<ListItem
  link
  chevron={false}
  tabindex={0}
  class="touch-feedback"
  onclick={() => ontap(ticketId)}
>
  {#snippet inner()}
    <div class="item-layout">
      <div class="ticket-item">
        <div class="row-top">
          <span class="client-alias">{clientAlias}</span>
          <PriorityBadge {priority} />
        </div>

        <div class="row-title">
          {#if isEncrypted}
            <EncryptedTitle {onhelp} />
          {:else}
            <span class="title-text"
              >{titleResult.status === "ready" ? titleResult.value : ""}</span
            >
          {/if}
        </div>

        <div class="row-bottom">
          <span class="bottom-left">
            <Chip outline class="queue-badge">{queueName ?? "..."}</Chip>
            <Dot size={10} aria-hidden="true" class="meta-dot" />
            <span class="assignee"
              >{assignedName ?? m.dashboard_assigned_unassigned()}</span
            >
          </span>
          <span class="bottom-meta">
            {#if timeAgo}
              <span class="time-ago">{timeAgo}</span>
            {/if}
            {#if followUpCount > 0}
              <Dot size={10} aria-hidden="true" class="meta-dot" />
              <span class="msg-count">
                {followUpCount === 1
                  ? m.dashboard_msg_count({ count: followUpCount })
                  : m.dashboard_msgs_count({ count: followUpCount })}
              </span>
            {/if}
          </span>
        </div>
      </div>
      <ChevronRight size={16} class="item-chevron" aria-hidden="true" />
    </div>
  {/snippet}
</ListItem>

<style>
  .item-layout {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    width: 100%;
  }

  .ticket-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    min-width: 0;
    flex: 1;
    width: 100%;
  }

  .row-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .client-alias {
    font-weight: 600;
    font-size: var(--text-md);
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  :global(.item-chevron) {
    opacity: 0.2;
    flex-shrink: 0;
  }

  .row-title {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .title-text {
    font-size: var(--text-base);
    color: var(--ink);
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .bottom-left {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    min-width: 0;
    overflow: hidden;
  }

  .bottom-left :global(.meta-dot) {
    opacity: 0.4;
    flex-shrink: 0;
  }

  :global(.queue-badge) {
    height: 1.125rem !important;
    font-size: var(--text-xs) !important;
    padding-left: var(--space-md) !important;
    padding-right: var(--space-md) !important;
    flex-shrink: 0;
  }

  .assignee {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bottom-meta {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex-shrink: 0;
  }

  .bottom-meta :global(.meta-dot) {
    opacity: 0.4;
  }

  .time-ago {
    white-space: nowrap;
  }

  .msg-count {
    white-space: nowrap;
  }
</style>

<script lang="ts">
  import { ListItem } from "konsta/svelte";
  import {
    ChevronsUp,
    ChevronUp,
    ChevronRight,
    Minus,
    ChevronDown,
    CircleQuestionMark,
    Dot,
  } from "@lucide/svelte";
  import type { Component } from "svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import type { TicketPreviewItemProps } from "./types.js";

  let {
    ticketId,
    title,
    priority,
    clientAlias,
    queueName,
    lastActivityAt,
    followUpCount,
    assignedName,
    ontap,
    onhelp,
  }: TicketPreviewItemProps = $props();

  const isEncrypted = $derived(title === undefined);
  const displayTitle = $derived(title ?? m.dashboard_encrypted_ticket());

  const activityDate = $derived(lastActivityAt ?? undefined);
  const timeAgo = $derived(
    activityDate ? formatRelativeTime(activityDate) : "",
  );

  interface PriorityDef {
    icon: Component;
    label: string;
    colorClass: string;
    badge: boolean;
  }

  const normalDef: PriorityDef = {
    icon: Minus,
    label: "Normal",
    colorClass: "priority-normal",
    badge: false,
  };

  const priorityMap = new Map<string, PriorityDef>([
    [
      "urgent",
      {
        icon: ChevronsUp,
        label: "Urgent",
        colorClass: "priority-urgent",
        badge: true,
      },
    ],
    [
      "high",
      {
        icon: ChevronUp,
        label: "High",
        colorClass: "priority-high",
        badge: true,
      },
    ],
    ["normal", normalDef],
    [
      "low",
      {
        icon: ChevronDown,
        label: "Low",
        colorClass: "priority-low",
        badge: false,
      },
    ],
  ]);

  const priorityDef = $derived(priorityMap.get(priority) ?? normalDef);

  function handleHelp(e: MouseEvent): void {
    e.stopPropagation();
    e.preventDefault();
    onhelp?.();
  }
</script>

<ListItem
  link
  chevron={false}
  tabindex={0}
  role="button"
  class="touch-feedback"
  onclick={() => ontap(ticketId)}
>
  {#snippet inner()}
    {@const PriorityIcon = priorityDef.icon}
    <div class="item-layout">
      <div class="ticket-item">
        <div class="row-top">
          <span class="client-alias">{clientAlias}</span>
          <span
            class="priority-indicator {priorityDef.colorClass}"
            class:priority-badge={priorityDef.badge}
          >
            <PriorityIcon size={12} aria-hidden="true" />
            <span>{priorityDef.label}</span>
          </span>
        </div>

        <div class="row-title">
          <span class="title-text" class:encrypted={isEncrypted}
            >{displayTitle}</span
          >
          {#if isEncrypted && onhelp}
            <button
              type="button"
              class="help-icon"
              onclick={handleHelp}
              aria-label={m.dashboard_encrypted_help_label()}
              ><CircleQuestionMark size={14} aria-hidden="true" /></button
            >
          {/if}
        </div>

        <div class="row-bottom">
          <span class="bottom-left">
            <span class="queue-name">{queueName}</span>
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
    gap: 0.5rem;
    width: 100%;
  }

  .ticket-item {
    display: flex;
    flex-direction: column;
    gap: 0.1875rem;
    min-width: 0;
    flex: 1;
    width: 100%;
  }

  .row-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .client-alias {
    font-weight: 600;
    font-size: 0.9375rem;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .priority-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.1875rem;
    font-size: 0.6875rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .priority-badge {
    font-weight: 600;
    padding: 0.0625rem 0.3125rem;
    border-radius: 0.25rem;
  }

  .priority-urgent {
    color: #ff3b30;
  }
  .priority-urgent.priority-badge {
    background: rgba(255, 59, 48, 0.12);
  }

  .priority-high {
    color: #ff9500;
  }
  .priority-high.priority-badge {
    background: rgba(255, 149, 0, 0.12);
  }

  .priority-normal {
    color: var(--muted);
    opacity: 0.7;
  }

  .priority-low {
    color: var(--muted);
    opacity: 0.5;
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
    font-size: 0.8125rem;
    color: var(--ink);
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .title-text.encrypted {
    opacity: 0.45;
    font-style: italic;
  }

  .help-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.75rem;
    min-height: 2.75rem;
    margin: -0.875rem -0.75rem -0.875rem 0;
    padding: 0;
    border: none;
    background: none;
    color: var(--muted);
    cursor: pointer;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .row-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .bottom-left {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    min-width: 0;
    overflow: hidden;
  }

  .bottom-left :global(.meta-dot) {
    opacity: 0.4;
    flex-shrink: 0;
  }

  .queue-name {
    white-space: nowrap;
  }

  .assignee {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bottom-meta {
    display: flex;
    align-items: center;
    gap: 0.125rem;
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

<script lang="ts">
  import { Card, Chip, Badge, Button, Checkbox } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { getPreviewLoader } from "$lib/crypto/context.js";
  import TicketPreview from "./TicketPreview.svelte";
  import type { TicketCardProps } from "./ticket-types.js";

  let {
    ticketId,
    queueName,
    displayStatus,
    priority,
    title,
    clientAlias,
    assignedName,
    createdAt,
    lastActivityAt,
    followUpCount,
    unreadCount,
    previewFollowUps,
    selected = false,
    multiSelectActive = false,
    ontap,
    onselect,
    onaction,
  }: TicketCardProps = $props();

  const previewLoader = getPreviewLoader();
  const isEncrypted = $derived(title === undefined);

  const statusLabel = $derived.by(() => {
    switch (displayStatus) {
      case "new":
        return m.tickets_filter_new();
      case "active":
        return m.tickets_filter_active();
      case "hold":
        return m.tickets_filter_hold();
      case "closed":
        return m.tickets_filter_closed();
    }
  });

  const activityDate = $derived(lastActivityAt ?? createdAt);
  const relativeTime = $derived(formatRelativeTime(activityDate));

  // Trigger lazy preview load when this card mounts (enters virtualizer viewport).
  // Guard: skip if data is already loaded (eagerLoad covered it, or a prior mount).
  $effect(() => {
    if (previewFollowUps === undefined) {
      previewLoader.observe(ticketId);
    }
  });

  function handleCardClick(): void {
    if (multiSelectActive) {
      onselect?.(ticketId);
    } else {
      ontap(ticketId);
    }
  }
</script>

<div class="ticket-card-container">
  <Card raised contentWrap={false} class="ticket-card">
    <button
      type="button"
      class="card-inner"
      aria-label={m.tickets_open({ alias: clientAlias })}
      onclick={handleCardClick}
    >
      <div class="card-header">
        <Chip outline class="queue-badge">{queueName}</Chip>
        <span class="status-indicator" data-status={displayStatus}>
          <span class="status-dot"></span>
          {statusLabel}
        </span>
        {#if priority === "urgent" || priority === "high"}
          <Chip class="priority-chip" data-priority={priority}>
            {priority}
          </Chip>
        {/if}
        <span class="timestamp">{relativeTime}</span>
      </div>

      <div class="preview-window">
        <TicketPreview followUps={previewFollowUps} />
      </div>

      <div class="card-title-row">
        {#if multiSelectActive}
          <div
            class="checkbox-wrap"
            role="presentation"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onchange={() => onselect?.(ticketId)}
            />
          </div>
        {/if}
        {#if isEncrypted}
          <div
            class="shimmer shimmer-title"
            role="status"
            aria-label={m.tickets_decrypting()}
          ></div>
        {:else}
          <span class="card-title-text">{title}</span>
        {/if}
      </div>

      <div class="card-meta">
        <span class="client-alias">{clientAlias}</span>
        <span class="assignee">
          {assignedName ?? m.tickets_unassigned()}
        </span>
        {#if followUpCount > 0}
          <span class="msg-count">{followUpCount}</span>
        {/if}
        {#if unreadCount > 0}
          <Badge class="unread-badge">{unreadCount}</Badge>
        {/if}
      </div>

      <div class="card-actions">
        <Button
          small
          outline
          onclick={(e: MouseEvent) => {
            e.stopPropagation();
            onaction?.(ticketId, "reply");
          }}>{m.tickets_action_reply()}</Button
        >
        <Button
          small
          outline
          onclick={(e: MouseEvent) => {
            e.stopPropagation();
            onaction?.(ticketId, "call");
          }}>{m.tickets_action_call()}</Button
        >
        <Button
          small
          outline
          onclick={(e: MouseEvent) => {
            e.stopPropagation();
            onaction?.(ticketId, displayStatus === "hold" ? "unhold" : "hold");
          }}
        >
          {displayStatus === "hold"
            ? m.tickets_action_unhold()
            : m.tickets_action_hold()}
        </Button>
        <Button
          small
          outline
          onclick={(e: MouseEvent) => {
            e.stopPropagation();
            onaction?.(ticketId, assignedName !== null ? "release" : "take");
          }}
        >
          {assignedName !== null
            ? m.tickets_action_release()
            : m.tickets_action_take()}
        </Button>
      </div>
    </button>
  </Card>
</div>

<style>
  .ticket-card-container {
    container-type: inline-size;
    container-name: card;
  }

  .card-inner {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.875rem 1rem;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
  }

  .card-inner:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
    border-radius: 0.5rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  :global(.queue-badge) {
    height: 1.25rem !important;
    font-size: 0.6875rem !important;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }

  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 500;
  }

  .status-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  [data-status="new"] .status-dot {
    background: #34c759;
  }

  [data-status="active"] .status-dot {
    background: var(--brand-text);
  }

  [data-status="hold"] .status-dot {
    background: #ff9500;
  }

  [data-status="closed"] .status-dot {
    background: var(--muted);
  }

  :global(.priority-chip) {
    height: 1.25rem !important;
    font-size: 0.6875rem !important;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    font-weight: 600 !important;
  }

  :global(.priority-chip[data-priority="urgent"]) {
    color: #ff3b30 !important;
    background: rgba(255, 59, 48, 0.12) !important;
  }

  :global(.priority-chip[data-priority="high"]) {
    color: #ff9500 !important;
    background: rgba(255, 149, 0, 0.12) !important;
  }

  .timestamp {
    margin-left: auto;
    font-size: 0.6875rem;
    color: var(--muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .preview-window {
    border-radius: 0.375rem;
    background: var(--surface-1);
    overflow: hidden;
  }

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 1.25rem;
  }

  .checkbox-wrap {
    flex-shrink: 0;
  }

  .card-title-text {
    font-weight: 600;
    font-size: 0.9375rem;
    line-height: 1.3;
    color: var(--ink);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .client-alias {
    font-weight: 600;
    color: var(--ink);
    opacity: 0.8;
  }

  .assignee {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .msg-count {
    white-space: nowrap;
    opacity: 0.7;
  }

  :global(.unread-badge) {
    flex-shrink: 0;
  }

  .card-actions {
    display: flex;
    gap: 0.375rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }

  .shimmer {
    border-radius: 0.25rem;
    background: linear-gradient(
      90deg,
      var(--surface-2) 25%,
      var(--surface-1) 50%,
      var(--surface-2) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
  }

  .shimmer-title {
    height: 1rem;
    width: 70%;
  }

  @keyframes shimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shimmer {
      animation: none;
      background: var(--surface-2);
    }
  }

  /* List mode (wide): preview on right side, actions visible */
  @container card (min-width: 400px) {
    .card-inner {
      display: grid;
      grid-template-columns: 1fr 140px;
      grid-template-rows: auto 1fr auto auto;
      gap: 0.375rem;
    }

    .card-header {
      grid-column: 1;
      grid-row: 1;
    }

    .preview-window {
      grid-column: 2;
      grid-row: 1 / -1;
      border-left: 1px solid var(--surface-2);
      border-radius: 0;
      align-self: stretch;
    }

    .card-title-row {
      grid-column: 1;
      grid-row: 2;
    }

    .card-meta {
      grid-column: 1;
      grid-row: 3;
    }

    .card-actions {
      grid-column: 1;
      grid-row: 4;
      display: flex;
    }
  }

  /* Grid mode (narrow): preview above text, no actions */
  @container card (max-width: 399px) {
    .preview-window {
      width: 100%;
      max-height: 120px;
      overflow: hidden;
    }

    .card-actions {
      display: none;
    }
  }
</style>

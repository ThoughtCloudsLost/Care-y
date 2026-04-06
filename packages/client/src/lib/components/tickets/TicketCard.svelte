<script lang="ts">
  import { Card, Chip, Badge, Checkbox } from "konsta/svelte";
  import {
    Dot,
    MessageSquare,
    Phone,
    Pause,
    Play,
    UserPlus,
    UserMinus,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { getPreviewLoader } from "$lib/crypto/context.js";
  import PriorityBadge from "$lib/components/PriorityBadge.svelte";
  import TicketPreview from "./TicketPreview.svelte";
  import type { TicketCardProps } from "./ticket-types.js";

  let {
    viewMode,
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
  const isList = $derived(viewMode === "list");

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

  const msgLabel = $derived.by(() => {
    if (followUpCount === 0) return null;
    return followUpCount === 1
      ? m.dashboard_msg_count({ count: followUpCount })
      : m.dashboard_msgs_count({ count: followUpCount });
  });

  // Trigger lazy preview load when this card mounts (enters virtualizer viewport).
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

<div class="ticket-card-wrap">
  <Card raised contentWrap={false} class="ticket-card">
    <!-- Using div+role instead of <button> to avoid nested-button HTML violation
         when action icon buttons are rendered inside. -->
    <div
      class="card-inner"
      class:card-inner--list={isList}
      class:card-inner--grid={!isList}
      role="button"
      tabindex="0"
      aria-label={m.tickets_open({ alias: clientAlias })}
      onclick={handleCardClick}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div class="preview-window">
        <TicketPreview followUps={previewFollowUps} />
      </div>

      <!-- Top bar: dot (left) + priority (right). In list mode, alias is here too. -->
      <div class="row-top">
        <span class="status-indicator">
          <span class="status-dot" data-status={displayStatus}></span>
          <span class="status-label">{statusLabel}</span>
        </span>
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
        <PriorityBadge {priority} />
      </div>

      <!-- Alias + title: grouped together below the preview window in both modes -->
      <div class="content-group">
        <span class="client-alias">{clientAlias}</span>
        <div class="row-title">
          {#if isEncrypted}
            <div
              class="shimmer shimmer-title"
              role="status"
              aria-label={m.tickets_decrypting()}
            ></div>
          {:else}
            <span class="title-text">{title}</span>
          {/if}
        </div>
      </div>

      <!-- Meta: queue · assignee (left group), time · msgs (right group) -->
      <div class="row-meta">
        <span class="meta-left">
          <Chip outline class="queue-badge">{queueName}</Chip>
          <Dot size={10} aria-hidden="true" class="meta-dot" />
          <span class="assignee">
            {assignedName ?? m.tickets_unassigned()}
          </span>
        </span>
        <span class="meta-right">
          <span class="timestamp">{relativeTime}</span>
          {#if msgLabel}
            <Dot size={10} aria-hidden="true" class="meta-dot" />
            <span class="msg-count">{msgLabel}</span>
          {/if}
          {#if unreadCount > 0}
            <Badge class="unread-badge">{unreadCount}</Badge>
          {/if}
        </span>
      </div>

      {#if isList}
        <div class="card-actions">
          <button
            type="button"
            class="action-icon"
            aria-label={m.tickets_action_reply()}
            onclick={(e: MouseEvent) => {
              e.stopPropagation();
              onaction?.(ticketId, "reply");
            }}
          >
            <MessageSquare size={18} />
          </button>
          <button
            type="button"
            class="action-icon"
            aria-label={m.tickets_action_call()}
            onclick={(e: MouseEvent) => {
              e.stopPropagation();
              onaction?.(ticketId, "call");
            }}
          >
            <Phone size={18} />
          </button>
          <button
            type="button"
            class="action-icon"
            aria-label={displayStatus === "hold"
              ? m.tickets_action_unhold()
              : m.tickets_action_hold()}
            onclick={(e: MouseEvent) => {
              e.stopPropagation();
              onaction?.(
                ticketId,
                displayStatus === "hold" ? "unhold" : "hold",
              );
            }}
          >
            {#if displayStatus === "hold"}
              <Play size={18} />
            {:else}
              <Pause size={18} />
            {/if}
          </button>
          <button
            type="button"
            class="action-icon"
            aria-label={assignedName !== null
              ? m.tickets_action_release()
              : m.tickets_action_take()}
            onclick={(e: MouseEvent) => {
              e.stopPropagation();
              onaction?.(ticketId, assignedName !== null ? "release" : "take");
            }}
          >
            {#if assignedName !== null}
              <UserMinus size={18} />
            {:else}
              <UserPlus size={18} />
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </Card>
</div>

<style>
  /* ── Card wrapper ── */
  .ticket-card-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .ticket-card-wrap :global(.k-card) {
    margin: 0 !important;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* ── Card inner (base: flex column) ── */
  .card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--card-pad-y) var(--card-pad-x);
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
    border-radius: var(--card-radius);
  }

  /* ── Status dot (inline in row-top) ── */
  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot[data-status="new"] {
    background: #34c759;
  }
  .status-dot[data-status="active"] {
    background: var(--brand-text);
  }
  .status-dot[data-status="hold"] {
    background: #ff9500;
  }
  .status-dot[data-status="closed"] {
    background: var(--muted);
  }

  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .status-label {
    font-size: var(--text-xs);
    color: var(--muted);
    font-weight: 500;
  }

  /* ── Preview window ── */
  .preview-window {
    border-radius: var(--space-md);
    background: var(--surface-1);
    overflow: hidden;
  }

  /* ── Row: dot + status (left), priority (right) ── */
  .row-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
  }

  .client-alias {
    font-weight: 600;
    font-size: var(--text-md);
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1;
  }

  .checkbox-wrap {
    flex-shrink: 0;
  }

  /* ── Row: title ── */
  .title-text {
    display: block;
    font-size: var(--text-base);
    line-height: 1.3;
    color: var(--ink);
    opacity: 0.75;
  }

  /* ── Meta row ── */
  .row-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .meta-left {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    min-width: 0;
    overflow: hidden;
  }

  .meta-right {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    flex-shrink: 0;
  }

  :global(.queue-badge) {
    height: 1.125rem !important;
    font-size: var(--text-xs) !important;
    padding-left: var(--space-md) !important;
    padding-right: var(--space-md) !important;
    flex-shrink: 0;
  }

  :global(.meta-dot) {
    opacity: 0.4;
    flex-shrink: 0;
  }

  .assignee {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--text-xs);
  }

  .timestamp {
    white-space: nowrap;
    font-size: var(--text-xs);
  }

  .msg-count {
    white-space: nowrap;
  }

  :global(.unread-badge) {
    flex-shrink: 0;
  }

  /* ── Action icons ── */
  .card-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xl);
    margin-top: var(--space-xs);
  }

  .action-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border: none;
    background: none;
    color: var(--muted);
    cursor: pointer;
    border-radius: 0.25rem;
    -webkit-tap-highlight-color: transparent;
    transition: color 150ms ease;
  }

  .action-icon:active {
    color: var(--brand-text);
  }

  /* ── Shimmer ── */
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
    height: 1.125rem;
    width: 60%;
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

  /* ══════════════════════════════════════════
     LIST MODE
     Top row full width. Title + preview side-by-side.
     Meta + actions full width below preview.
     ══════════════════════════════════════════ */
  .card-inner--list {
    display: grid;
    grid-template-columns: 1fr 170px;
    grid-template-rows: auto 1fr auto auto;
    grid-template-areas:
      "header  header"
      "content preview"
      "meta    meta"
      "actions actions";
    gap: 0;
    row-gap: var(--space-md);
    column-gap: var(--space-lg);
  }

  .card-inner--list .row-top {
    grid-area: header;
  }

  .card-inner--list .content-group {
    grid-area: content;
    align-self: start;
  }

  .card-inner--list .preview-window {
    grid-area: preview;
    align-self: stretch;
    max-height: none;
    min-height: 6.5rem;
  }

  .card-inner--list .row-meta {
    grid-area: meta;
  }

  .card-inner--list .card-actions {
    grid-area: actions;
  }

  /* ══════════════════════════════════════════
     GRID MODE
     Dot + priority above window. Preview fixed height.
     Content below. Taller cards. Split meta rows.
     ══════════════════════════════════════════ */
  .card-inner--grid .row-top {
    order: -2;
  }

  .card-inner--grid .preview-window {
    order: -1;
    width: 100%;
    height: 5rem;
    flex-shrink: 0;
  }

  .content-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 0;
    overflow: hidden;
  }

  .card-inner--grid .client-alias {
    font-size: var(--text-base);
  }

  .card-inner--grid .title-text {
    font-size: var(--text-sm);
  }

  .card-inner--grid {
    flex: 1;
    min-height: 14rem;
  }

  .card-inner--grid .row-meta {
    margin-top: auto;
    font-size: var(--text-xs);
    flex-wrap: wrap;
  }

  .card-inner--grid .meta-left {
    flex: 1 0 100%;
  }

  .card-inner--grid .meta-right {
    margin-left: auto;
  }
</style>

<script lang="ts">
  import { Card, Chip, Badge, Checkbox, Link } from "konsta/svelte";
  import {
    Dot,
    MessageSquare,
    Phone,
    Pause,
    Play,
    UserPlus,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { getPreviewLoader } from "$lib/crypto/context.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import PriorityBadge from "$lib/components/PriorityBadge.svelte";
  import StatusDot from "$lib/components/StatusDot.svelte";
  import EncryptedTitle from "$lib/components/EncryptedTitle.svelte";
  import TicketPreview from "./TicketPreview.svelte";
  import type { TicketCardProps } from "./ticket-types.js";

  let {
    viewMode,
    ticketId,
    queueName,
    displayStatus,
    priority,
    titleResult,
    encryptedTitle,
    clientAlias,
    assignedName,
    createdAt,
    lastActivityAt,
    followUpCount,
    unreadCount,
    previewFollowUps,
    previewReactions,
    selected = false,
    multiSelectActive = false,
    ontap,
    onselect,
    onaction,
    onencryptedhelp,
    loading = false,
    searchTerm = null,
  }: TicketCardProps = $props();

  const previewLoader = getPreviewLoader();
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
  // Skip for loading skeleton cards: they have no ticketId to observe.
  $effect(() => {
    if (previewFollowUps === undefined && !loading) {
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

{#if loading}
  <div class="ticket-card-wrap skeleton-pulse">
    <Card raised contentWrap={false} class="ticket-card">
      <div
        class="card-inner"
        class:card-inner--list={isList}
        class:card-inner--grid={!isList}
        aria-hidden="true"
      >
        <div class="preview-window">
          <TicketPreview followUps={undefined} multiline={isList} />
        </div>

        <div class="row-top">
          <span class="status-indicator">
            <span class="skeleton-dot"></span>
            <InlineSkeleton width="5ch" />
          </span>
          <InlineSkeleton width="5ch" />
        </div>

        <div class="content-group">
          <span class="client-alias"><InlineSkeleton width="8ch" /></span>
          <div class="row-title">
            <DecryptPlaceholder length={25} />
          </div>
        </div>

        <div class="row-meta">
          <span class="meta-left">
            <DecryptPlaceholder length={8} />
            <InlineSkeleton width="6ch" />
          </span>
          <span class="meta-right">
            <InlineSkeleton width="3ch" />
          </span>
        </div>

        {#if isList}
          <div class="card-actions">
            {#each [1, 2, 3, 4] as _ (_)}
              <span class="skeleton-icon"></span>
            {/each}
          </div>
        {/if}
      </div>
    </Card>
  </div>
{:else}
  <div class="ticket-card-wrap" data-testid="ticket-card-wrap">
    <Card raised contentWrap={false} class="ticket-card">
      <!-- Using div+role instead of <button> to avoid nested-button HTML violation
           when action icon buttons are rendered inside. -->
      <div
        class="card-inner"
        class:card-inner--list={isList}
        class:card-inner--grid={!isList}
        data-testid="card-inner"
        role="button"
        tabindex="0"
        aria-label={m.tickets_open({ alias: clientAlias })}
        onclick={handleCardClick}
        onkeydown={onKeyActivate(handleCardClick)}
      >
        <div class="preview-window" data-preview>
          <TicketPreview
            followUps={previewFollowUps}
            multiline={isList}
            {followUpCount}
            reactions={previewReactions}
          />
        </div>

        <!-- Top bar: dot (left) + priority (right). In list mode, alias is here too. -->
        <div class="row-top">
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
                class="select-checkbox"
                colors={{
                  bgCheckedIos: "bg-[var(--brand-accent)]",
                  borderCheckedIos: "border-[var(--brand-accent)]",
                  bgCheckedMaterial: "bg-[var(--brand-accent)]",
                  borderCheckedMaterial: "border-[var(--brand-accent)]",
                }}
              />
            </div>
          {/if}
          <span class="status-indicator">
            <StatusDot status={displayStatus} />
            <span class="status-label" data-testid="status-label"
              >{statusLabel}</span
            >
          </span>
          <PriorityBadge {priority} />
        </div>

        <!-- Alias + title: grouped together below the preview window in both modes -->
        <div class="content-group">
          <span class="client-alias">{clientAlias}</span>
          <div class="row-title">
            {#if titleResult.status === "denied" || titleResult.status === "error"}
              <EncryptedTitle onhelp={onencryptedhelp} />
            {:else}
              <DecryptPlaceholder
                result={titleResult}
                ciphertext={encryptedTitle}
                length={25}
                {searchTerm}
              />
            {/if}
          </div>
        </div>

        <!-- Meta: queue · assignee (left group), time · msgs (right group) -->
        <div class="row-meta">
          <span class="meta-left">
            <Chip outline class="queue-badge">{queueName ?? "..."}</Chip>
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
              <Badge class="unread-badge" data-unread>{unreadCount}</Badge>
            {/if}
          </span>
        </div>

        {#if isList}
          <div class="card-actions" data-testid="card-actions">
            <Link
              iconOnly
              role="button"
              aria-label={m.tickets_action_reply()}
              onclick={(e: MouseEvent) => {
                e.stopPropagation();
                onaction?.(ticketId, "reply");
              }}
              class="action-icon p-1 -m-1"
            >
              <MessageSquare size={18} />
            </Link>
            <Link
              iconOnly
              role="button"
              aria-label={m.tickets_action_call()}
              onclick={(e: MouseEvent) => {
                e.stopPropagation();
                onaction?.(ticketId, "call");
              }}
              class="action-icon p-1 -m-1"
            >
              <Phone size={18} />
            </Link>
            <Link
              iconOnly
              role="button"
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
              class="action-icon p-1 -m-1"
            >
              {#if displayStatus === "hold"}
                <Play size={18} />
              {:else}
                <Pause size={18} />
              {/if}
            </Link>
            <Link
              iconOnly
              role="button"
              aria-label={m.tickets_action_assign()}
              onclick={(e: MouseEvent) => {
                e.stopPropagation();
                onaction?.(ticketId, "assign");
              }}
              class="action-icon p-1 -m-1"
            >
              <UserPlus size={18} />
            </Link>
          </div>
        {/if}
      </div>
    </Card>
  </div>
{/if}

<style>
  /* ── Card wrapper ── */
  .ticket-card-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-radius: var(--card-radius, 0.75rem);
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

  /* ── Row: [checkbox? + status] (left), priority (right) ── */
  .row-top {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .row-top :global(:last-child) {
    margin-left: auto;
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

  :global(.select-checkbox) {
    transform: scale(0.8);
    transform-origin: center;
  }

  /* ── Row: title ── */
  .row-title {
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

  :global(.action-icon) {
    color: var(--muted);
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

  .card-inner--grid .row-title {
    font-size: var(--text-sm);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-inner--grid {
    flex: 1;
    min-height: 14rem;
    max-height: 18rem;
    overflow: hidden;
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

  /* ── Loading skeleton shapes ── */

  .skeleton-dot {
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    vertical-align: middle;
  }

  .skeleton-dot,
  .skeleton-icon {
    background: color-mix(in srgb, var(--ink) 12%, transparent);
  }

  .skeleton-icon {
    display: block;
    width: 18px;
    height: 18px;
    border-radius: 0.25rem;
  }
</style>

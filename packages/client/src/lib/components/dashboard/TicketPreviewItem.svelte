<script lang="ts">
  import { ListItem, Toast } from "konsta/svelte";
  import { CircleQuestionMark } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { TicketPreviewItemProps } from "./types.js";

  let {
    ticketId,
    title,
    priority,
    onHold,
    clientAlias,
    queueName,
    lastActivityAt,
    followUpCount,
    ontap,
  }: TicketPreviewItemProps = $props();

  const isEncrypted = $derived(title === undefined);
  const displayTitle = $derived(title ?? m.dashboard_encrypted_ticket());

  // Use last activity if available, fall back to creation time
  const activityDate = $derived(lastActivityAt ?? undefined);
  const timeAgo = $derived(
    activityDate ? formatRelativeTime(activityDate) : "",
  );

  // Toast state for encrypted ticket explanation
  let helpOpen = $state(false);
  let helpTimer: ReturnType<typeof setTimeout> | undefined;

  function openHelp(e: MouseEvent): void {
    e.stopPropagation();
    e.preventDefault();
    helpOpen = true;
    clearTimeout(helpTimer);
    helpTimer = setTimeout(() => {
      helpOpen = false;
    }, 5000);
  }

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

{#snippet titleContent()}
  <span class="title-text">{displayTitle}</span>
  {#if isEncrypted}
    <button
      type="button"
      class="help-icon"
      onclick={openHelp}
      aria-label={m.dashboard_encrypted_help_label()}
      ><CircleQuestionMark size={14} aria-hidden="true" /></button
    >
  {/if}
{/snippet}

<ListItem
  link
  title={titleContent}
  after={timeAgo}
  onclick={() => ontap(ticketId)}
>
  {#snippet media()}
    <span
      class="priority-indicator"
      data-priority={priority}
      data-hold={onHold ? "true" : undefined}
      aria-hidden="true"
    ></span>
  {/snippet}
  {#snippet subtitle()}
    <span class="preview-meta">
      <span class="meta-alias">{clientAlias}</span>
      <span class="meta-sep" aria-hidden="true">&middot;</span>
      <span class="meta-queue">{queueName}</span>
      {#if followUpCount > 0}
        <span class="meta-sep" aria-hidden="true">&middot;</span>
        <span class="meta-count"
          >{followUpCount === 1
            ? m.dashboard_msg_count({ count: followUpCount })
            : m.dashboard_msgs_count({ count: followUpCount })}</span
        >
      {/if}
    </span>
  {/snippet}
</ListItem>

{#if isEncrypted}
  {#snippet dismissButton()}
    <button
      type="button"
      class="toast-dismiss"
      onclick={() => {
        helpOpen = false;
        clearTimeout(helpTimer);
      }}>{m.dashboard_dismiss()}</button
    >
  {/snippet}

  <Toast opened={helpOpen} position="center" button={dismissButton}>
    <div class="encrypted-help-toast">
      {m.dashboard_encrypted_help()}
    </div>
  </Toast>
{/if}

<style>
  .title-text {
    opacity: 0.6;
  }

  .help-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* 44px tap target (WCAG), visual icon is 14px via Lucide size prop */
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

  .priority-indicator {
    width: 3px;
    height: 100%;
    min-height: 2rem;
    border-radius: 1.5px;
    flex-shrink: 0;
    align-self: stretch;
  }

  .priority-indicator[data-priority="urgent"] {
    background: #ff3b30;
  }

  .priority-indicator[data-priority="high"] {
    background: #ff9500;
  }

  .priority-indicator[data-priority="normal"] {
    background: var(--brand-text);
  }

  .priority-indicator[data-priority="low"] {
    background: var(--muted);
  }

  .priority-indicator[data-hold="true"] {
    background: repeating-linear-gradient(
      0deg,
      #ff9500 0px,
      #ff9500 3px,
      transparent 3px,
      transparent 6px
    );
  }

  .preview-meta {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--muted);
    overflow: hidden;
  }

  .meta-alias {
    font-weight: 500;
    color: var(--ink);
    opacity: 0.7;
    white-space: nowrap;
  }

  .meta-queue {
    white-space: nowrap;
  }

  .meta-sep {
    opacity: 0.4;
    flex-shrink: 0;
  }

  .meta-count {
    white-space: nowrap;
  }

  .encrypted-help-toast {
    font-size: 0.8125rem;
    line-height: 1.4;
    text-align: center;
    padding: 0.25rem 0;
  }

  .toast-dismiss {
    background: none;
    border: none;
    color: var(--brand-text);
    font-weight: 600;
    font-size: 0.8125rem;
    font-family: inherit;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    -webkit-tap-highlight-color: transparent;
  }
</style>

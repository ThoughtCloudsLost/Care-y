<!--
  One ticket, three Inkwell presentations, driven by viewMode:

  - "list": a ruled row (22px / 1fr / auto grid, bottom hairline, hover
    raised). Compact scanning surface: no preview window, no inline
    actions (swipe actions and tap live on the row).
  - "cards": the work-mode card (hair-2 border, radius 12, raised, no
    shadow) with the row head, true bubble previews, and a hairline-topped
    text action row.
  - "grid": today's multi-column cell re-skinned to the card identity:
    clamped title, fixed preview window, meta footer.

  The interaction skeleton is identical in all modes: a full-cover open
  button, a checkbox island during multi-select, and stopPropagation
  islands for anything interactive above the overlay.

  Status is a shape (StatusMark), color is priority (PriorityStamp),
  unread is its own channel (bold title + NewPill). The row/card side
  column shows at most two of [stamp, pill, time], in that order.
-->
<script lang="ts">
  import { Checkbox } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { getPreviewLoader } from "$lib/crypto/context.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import PriorityStamp from "$lib/components/PriorityStamp.svelte";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import NewPill from "$lib/components/NewPill.svelte";
  import EncryptedTitle from "$lib/components/EncryptedTitle.svelte";
  import TicketPreview from "./TicketPreview.svelte";
  import type { TicketCardProps, TicketQuickAction } from "./ticket-types.js";

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
    assignedIsSelf = false,
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
  const isUnassigned = $derived(assignedName === null && !assignedIsSelf);
  const isUnread = $derived(unreadCount > 0);
  const isClosed = $derived(displayStatus === "closed");

  const activityDate = $derived(lastActivityAt ?? createdAt);
  const relativeTime = $derived(formatRelativeTime(activityDate));

  const msgLabel = $derived.by(() => {
    if (followUpCount === 0) return null;
    return followUpCount === 1
      ? m.ticket_meta_msg_count_one({ count: followUpCount })
      : m.ticket_meta_msg_count_other({ count: followUpCount });
  });

  // The side column carries AT MOST TWO marks so rows stay quiet. The
  // priority order (stamp, pill, time) is transcribed from the mock's
  // four row variants: time yields first, then the pill never does.
  type SideSlot = "stamp" | "pill" | "time";
  const sideSlots = $derived.by((): SideSlot[] => {
    const slots: SideSlot[] = [];
    if (priority !== "normal") slots.push("stamp");
    if (isUnread) slots.push("pill");
    slots.push("time");
    return slots.slice(0, 2);
  });

  // Trigger lazy preview load when a preview-bearing card mounts (enters
  // the virtualizer viewport). Rows render no preview window; skeleton
  // cards have no ticketId to observe.
  // care-y-ignore-next-line no-effect-without-cleanup -- observe() enqueues the id into the loader's batched fetch queue; the API has no unobserve and holds no per-card resource to release
  $effect(() => {
    if (viewMode !== "list" && previewFollowUps === undefined && !loading) {
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

  function fireAction(e: MouseEvent, action: TicketQuickAction): void {
    e.stopPropagation();
    onaction?.(ticketId, action);
  }
</script>

{#snippet checkboxIsland()}
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
        bgCheckedIos: "bg-[var(--brand-fill)]",
        borderCheckedIos: "border-[var(--brand-fill)]",
        bgCheckedMaterial: "bg-[var(--brand-fill)]",
        borderCheckedMaterial: "border-[var(--brand-fill)]",
      }}
    />
  </div>
{/snippet}

{#snippet titleBlock()}
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
{/snippet}

{#snippet assigneeSegment()}
  {#if assignedIsSelf}<b class="meta-you">{m.ticket_meta_you()}</b
    >{:else}{assignedName ?? m.tickets_unassigned()}{/if}
{/snippet}

{#snippet head()}
  <div class="head" class:head-select={multiSelectActive}>
    {#if multiSelectActive}
      {@render checkboxIsland()}
    {/if}
    <span class="mark"><StatusMark status={displayStatus} /></span>
    <span class="head-main">
      <span class="r-title">{@render titleBlock()}</span>
      <span class="r-meta num" data-testid="row-meta">
        {clientAlias} · {queueName ?? "…"} · {@render assigneeSegment()}{#if msgLabel}
          · {msgLabel}{/if}{#if displayStatus === "hold"}
          · {m.tickets_status_on_hold()}{/if}
      </span>
    </span>
    <span class="r-side">
      {#each sideSlots as slot (slot)}
        {#if slot === "stamp"}
          <PriorityStamp {priority} />
        {:else if slot === "pill"}
          <NewPill count={unreadCount} />
        {:else}
          <span class="r-time num">{relativeTime}</span>
        {/if}
      {/each}
    </span>
  </div>
{/snippet}

{#snippet skeletonHead()}
  <div class="head">
    <span class="mark"><span class="skeleton-dot"></span></span>
    <span class="head-main">
      <span class="r-title"><DecryptPlaceholder length={25} /></span>
      <span class="r-meta"><InlineSkeleton width="14ch" /></span>
    </span>
    <span class="r-side"><InlineSkeleton width="3ch" /></span>
  </div>
{/snippet}

{#if loading}
  <article class="tc tc--{viewMode} skeleton-pulse" aria-hidden="true">
    {#if viewMode === "grid"}
      <div class="row-top">
        <span class="skeleton-dot"></span>
        <span class="row-top-stamp"><InlineSkeleton width="5ch" /></span>
      </div>
      <div class="preview-window">
        <TicketPreview {ticketId} followUps={undefined} multiline={false} />
      </div>
      <div class="content-group">
        <span class="client-alias"><InlineSkeleton width="8ch" /></span>
        <div class="row-title"><DecryptPlaceholder length={25} /></div>
      </div>
      <div class="row-meta">
        <span class="meta-left"><InlineSkeleton width="10ch" /></span>
        <span class="meta-right"><InlineSkeleton width="3ch" /></span>
      </div>
    {:else}
      {@render skeletonHead()}
      {#if viewMode === "cards"}
        <div class="previews">
          <TicketPreview {ticketId} followUps={undefined} multiline={true} />
        </div>
      {/if}
    {/if}
  </article>
{:else}
  <article
    class="tc tc--{viewMode}"
    class:tc-unread={isUnread}
    class:tc-closed={isClosed}
    data-testid="ticket-card-wrap"
  >
    <!-- Overlay button covers the surface for click/keyboard. Interactive
         islands sit above it via z-index so their clicks don't navigate. -->
    <button
      type="button"
      class="card-open-link"
      aria-label={m.tickets_open(withTerms({ alias: clientAlias }))}
      onclick={handleCardClick}
    ></button>

    {#if viewMode === "list"}
      {@render head()}
    {:else if viewMode === "cards"}
      {@render head()}
      <div class="previews" data-preview>
        <TicketPreview
          {ticketId}
          followUps={previewFollowUps}
          multiline={true}
          {followUpCount}
          reactions={previewReactions}
          {clientAlias}
        />
      </div>
      <div class="actions" data-testid="card-actions">
        <button
          type="button"
          class="act"
          onclick={(e) => fireAction(e, "reply")}
        >
          {m.tickets_action_reply()}
        </button>
        <button
          type="button"
          class="act"
          onclick={(e) => fireAction(e, "call")}
        >
          {m.tickets_action_call()}
        </button>
        <button
          type="button"
          class="act act-quiet"
          onclick={(e) =>
            fireAction(e, displayStatus === "hold" ? "unhold" : "hold")}
        >
          {displayStatus === "hold"
            ? m.tickets_action_unhold()
            : m.tickets_action_hold()}
        </button>
        {#if isUnassigned}
          <button
            type="button"
            class="act"
            onclick={(e) => fireAction(e, "take")}
          >
            {m.tickets_action_take()}
          </button>
        {:else}
          <button
            type="button"
            class="act"
            onclick={(e) => fireAction(e, "assign")}
          >
            {m.tickets_action_assign()}
          </button>
        {/if}
      </div>
    {:else}
      <div class="row-top">
        {#if multiSelectActive}
          {@render checkboxIsland()}
        {/if}
        <StatusMark status={displayStatus} />
        <span class="row-top-stamp"><PriorityStamp {priority} /></span>
      </div>
      <div class="preview-window" data-preview>
        <TicketPreview
          {ticketId}
          followUps={previewFollowUps}
          multiline={false}
          {followUpCount}
          reactions={previewReactions}
          {clientAlias}
        />
      </div>
      <div class="content-group">
        <span class="client-alias">{clientAlias}</span>
        <div class="row-title">{@render titleBlock()}</div>
      </div>
      <div class="row-meta num">
        <span class="meta-left">
          {queueName ?? "…"} · {@render assigneeSegment()}
        </span>
        <span class="meta-right">
          <span class="r-time num">{relativeTime}</span>
          {#if msgLabel}<span class="grid-msgs">· {msgLabel}</span>{/if}
          <NewPill count={unreadCount} />
        </span>
      </div>
    {/if}
  </article>
{/if}

<style>
  /* ── Shared skeleton: overlay open button + islands ── */
  .tc {
    position: relative;
    width: 100%;
    min-width: 0;
    text-align: left;
  }

  .card-open-link {
    position: absolute;
    inset: 0;
    z-index: 0;
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  .card-open-link:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: -2px;
  }

  .checkbox-wrap {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  :global(.select-checkbox) {
    transform: scale(0.8);
    transform-origin: center;
  }

  .num {
    font-variant-numeric: tabular-nums;
  }

  /* ── Row/card head: the mock's 22px / 1fr / auto grid ── */
  .head {
    display: grid;
    grid-template-columns: 22px 1fr auto;
    column-gap: 10px;
    align-items: start;
  }

  .head-select {
    grid-template-columns: auto 22px 1fr auto;
  }

  /* Nudged down to sit on the title's cap line. */
  .mark {
    margin-top: 4px;
    display: inline-flex;
  }

  .head-main {
    min-width: 0;
  }

  .r-title {
    display: block;
    font-size: var(--text-md);
    line-height: 1.35;
    color: var(--ink);
    overflow-wrap: anywhere;
  }

  .tc-unread .r-title,
  .tc-unread .row-title {
    font-weight: 700;
  }

  .tc-closed {
    opacity: 0.52;
  }

  .tc-closed .r-title,
  .tc-closed .row-title {
    text-decoration: line-through;
    text-decoration-color: var(--hair-2);
    text-decoration-thickness: 1px;
  }

  .r-meta {
    display: block;
    margin-top: 3px;
    font-size: var(--text-sm);
    color: var(--muted);
    overflow-wrap: anywhere;
  }

  .meta-you {
    font-weight: 700;
    color: var(--ink-2);
  }

  .r-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
  }

  .r-time {
    font-size: 0.75rem;
    color: var(--muted);
    white-space: nowrap;
  }

  /* ── Rows: ruled lines, not boxes ── */
  .tc--list {
    padding: 13px 16px;
    border-bottom: 1px solid var(--hair);
  }

  .tc--list:hover {
    background: var(--raised);
  }

  /* ── Cards: the work-mode surface (no shadow) ── */
  .tc--cards {
    border: 1px solid var(--hair-2);
    border-radius: 12px;
    background: var(--raised);
    padding: 12px 14px;
    box-shadow: none;
  }

  .tc--cards .card-open-link:focus-visible {
    border-radius: 12px;
  }

  .previews {
    margin: 10px 0 2px;
  }

  .actions {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 18px;
    margin-top: 10px;
    padding-top: 9px;
    border-top: 1px solid var(--hair);
  }

  .act {
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--brand-text);
    cursor: pointer;
  }

  .act-quiet {
    color: var(--muted);
    font-weight: 400;
  }

  /* ── Grid: today's cell structure in the card identity ── */
  .tc--grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    height: 100%;
    min-height: 14rem;
    max-height: 18rem;
    overflow: hidden;
    border: 1px solid var(--hair-2);
    border-radius: 12px;
    background: var(--raised);
    padding: 12px 14px;
    box-shadow: none;
  }

  .tc--grid .card-open-link:focus-visible {
    border-radius: 12px;
  }

  .row-top {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .row-top-stamp {
    margin-left: auto;
  }

  .preview-window {
    width: 100%;
    height: 5rem;
    flex-shrink: 0;
    overflow: hidden;
  }

  .content-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 0;
    overflow: hidden;
  }

  .client-alias {
    font-weight: 600;
    font-size: var(--text-base);
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-title {
    font-size: var(--text-sm);
    line-height: 1.35;
    color: var(--ink);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .row-meta {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-xs) var(--space-md);
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .meta-left {
    flex: 1 0 100%;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .meta-right {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    flex-shrink: 0;
  }

  .grid-msgs {
    white-space: nowrap;
  }

  /* ── Split-pane selection: brand is the identity slot, always as the
     soft tint, never a full fill. The page applies the wrapper class. ── */
  :global(.ticket-card-selected) .tc {
    background: var(--brand-soft);
  }

  /* ── Loading skeleton shapes ── */
  .skeleton-dot {
    display: inline-block;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--ink) 12%, transparent);
  }
</style>

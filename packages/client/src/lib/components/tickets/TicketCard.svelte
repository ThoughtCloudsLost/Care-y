<!-- care-y-ignore no-hardcoded-user-strings -- component prop values (status=, unreadHighlight=) are not user-facing text -->
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
  unread is its own channel (bold title + NewPill). The stamp owns the
  alias line's right edge; the pill sits under it on the title line, so
  the stamp holds still whether or not the ticket is unread.
-->
<script lang="ts">
  import { Checkbox } from "konsta/svelte";
  import { CHECKBOX_BRAND_COLORS } from "$lib/components/shared/konsta-classes.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { formatRelativeTime } from "$lib/utils/format-time.js";
  import { getPreviewLoader } from "$lib/crypto/context.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import HighlightText from "$lib/components/HighlightText.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import PriorityStamp from "$lib/components/PriorityStamp.svelte";
  import StatusMark from "$lib/components/StatusMark.svelte";
  import NewPill from "$lib/components/NewPill.svelte";
  import EncryptedTitle from "$lib/components/EncryptedTitle.svelte";
  import QueueGlyph from "$lib/components/shared/QueueGlyph.svelte";
  import TicketPreview from "./TicketPreview.svelte";
  import type { TicketCardProps, TicketQuickAction } from "./ticket-types.js";

  let {
    viewMode,
    ticketId,
    queueName,
    queueAppearance,
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
    unreadCountIsFloor = false,
    previewFollowUps,
    previewReactions,
    selected = false,
    multiSelectActive = false,
    ontap,
    onfullopen,
    onselect,
    onaction,
    allowedActions = new Set<TicketQuickAction>(),
    onencryptedhelp,
    loading = false,
    searchTerm = null,
    newRepliesFirst = false,
  }: TicketCardProps = $props();

  const previewLoader = getPreviewLoader();
  const isUnassigned = $derived(assignedName === null && !assignedIsSelf);
  const isUnread = $derived(unreadCount > 0);
  const isClosed = $derived(displayStatus === "closed");

  // Each quick action renders only when the account may use it; the hold
  // and owner buttons check the action they would fire.
  const holdAction = $derived<TicketQuickAction>(
    displayStatus === "hold" ? "unhold" : "hold",
  );
  const ownerAction = $derived<TicketQuickAction>(
    isUnassigned ? "take" : "assign",
  );
  const showReply = $derived(allowedActions.has("reply"));
  const showCall = $derived(allowedActions.has("call"));
  const showHold = $derived(allowedActions.has(holdAction));
  const showOwner = $derived(allowedActions.has(ownerAction));
  const showContactGroup = $derived(showReply || showCall);
  const showCaseGroup = $derived(showHold || showOwner);

  const activityDate = $derived(lastActivityAt ?? createdAt);
  const relativeTime = $derived(formatRelativeTime(activityDate));

  const msgLabel = $derived.by(() => {
    if (followUpCount === 0) return null;
    return followUpCount === 1
      ? m.ticket_meta_followup_count_one({ count: followUpCount })
      : m.ticket_meta_followup_count_other({ count: followUpCount });
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

  function handleCardDblClick(): void {
    if (!multiSelectActive) {
      onfullopen?.(ticketId);
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
      colors={CHECKBOX_BRAND_COLORS}
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

{#snippet hl(t: string)}<HighlightText text={t} term={searchTerm} />{/snippet}

{#snippet assigneeSegment()}
  {#if assignedIsSelf}
    <b class="meta-you">{m.ticket_meta_you()}</b>
  {:else if assignedName != null}
    {@render hl(assignedName)}
  {:else}
    {m.tickets_unassigned()}
  {/if}
{/snippet}

{#snippet queueSegment()}
  {#if queueAppearance}<span class="queue-glyph-gap"
      ><QueueGlyph appearance={queueAppearance} size={12} /></span
    >{/if}{#if queueName != null}{@render hl(queueName)}{:else}…{/if}
{/snippet}

{#snippet metaRow()}
  <span class="r-meta num" data-testid="row-meta">
    <span class="meta-left">
      {@render queueSegment()} · {@render assigneeSegment()}
    </span>
    <span class="meta-right">
      <span class="r-time num">{relativeTime}</span>
      {#if msgLabel}
        <span class="meta-sep">·</span>
        <span class="r-msgs">{msgLabel}</span>
      {/if}
    </span>
  </span>
{/snippet}

{#snippet newPill()}
  {#if isUnread}<span class="r-pill"
      ><NewPill count={unreadCount} isFloor={unreadCountIsFloor} /></span
    >{/if}
{/snippet}

{#snippet head(includeMeta: boolean)}
  <div class="head" class:head-select={multiSelectActive}>
    {#if multiSelectActive}
      {@render checkboxIsland()}
    {/if}
    <span class="mark"
      ><StatusMark
        status={displayStatus}
        unreadHighlight={newRepliesFirst && isUnread}
      /></span
    >
    <span class="head-main">
      <span class="r-alias-row">
        <span class="r-alias">{@render hl(clientAlias ?? "...")}</span>
        {#if priority !== "normal"}<span class="r-side"
            ><PriorityStamp {priority} /></span
          >{/if}
      </span>
      <span class="r-title-row">
        <span class="r-title">{@render titleBlock()}</span>
        {@render newPill()}
      </span>
      {#if includeMeta}
        {@render metaRow()}
      {/if}
    </span>
  </div>
{/snippet}

{#snippet skeletonHead()}
  <div class="head">
    <span class="mark"><span class="skeleton-dot"></span></span>
    <span class="head-main">
      <span class="r-alias-row">
        <span class="r-alias"><InlineSkeleton width="8ch" /></span>
      </span>
      <span class="r-title"><DecryptPlaceholder length={25} /></span>
      <span class="r-meta">
        <span class="meta-left"><InlineSkeleton width="12ch" /></span>
        <span class="meta-right"><InlineSkeleton width="3ch" /></span>
      </span>
    </span>
  </div>
{/snippet}

{#if loading}
  <article class="tc tc--{viewMode} skeleton-pulse" aria-hidden="true">
    {#if viewMode === "grid"}
      <div class="row-top">
        <span class="skeleton-dot"></span>
        <span class="client-alias"><InlineSkeleton width="8ch" /></span>
        <span class="row-top-stamp"><InlineSkeleton width="5ch" /></span>
      </div>
      <div class="content-group">
        <div class="row-title"><DecryptPlaceholder length={25} /></div>
      </div>
      <div class="preview-window">
        <TicketPreview
          {ticketId}
          followUps={undefined}
          multiline={false}
          fit={true}
        />
      </div>
      <div class="row-meta">
        <span class="meta-left"><InlineSkeleton width="10ch" /></span>
        <span class="meta-right"><InlineSkeleton width="3ch" /></span>
      </div>
    {:else}
      {@render skeletonHead()}
      {#if viewMode === "cards"}
        <div class="previews preview-window">
          <TicketPreview {ticketId} followUps={undefined} multiline={true} />
        </div>
        <div class="card-meta">
          <span class="r-meta">
            <span class="meta-left"><InlineSkeleton width="12ch" /></span>
            <span class="meta-right"><InlineSkeleton width="5ch" /></span>
          </span>
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
    data-ticket-id={ticketId}
  >
    <!-- Overlay button covers the surface for click/keyboard. Interactive
         islands sit above it via z-index so their clicks don't navigate. -->
    <button
      type="button"
      class="card-open-link"
      aria-label={m.tickets_open(withTerms({ alias: clientAlias ?? "..." }))}
      onclick={handleCardClick}
      ondblclick={handleCardDblClick}
    ></button>

    {#if viewMode === "list"}
      {@render head(true)}
    {:else if viewMode === "cards"}
      {@render head(false)}
      <div class="previews preview-window" data-preview>
        <TicketPreview
          {ticketId}
          followUps={previewFollowUps}
          multiline={true}
          {followUpCount}
          reactions={previewReactions}
          {clientAlias}
          {searchTerm}
        />
      </div>
      <div class="card-meta">
        {@render metaRow()}
      </div>
      {#if showContactGroup || showCaseGroup}
        <div class="actions" data-testid="card-actions">
          {#if showContactGroup}
            <span class="act-group">
              {#if showReply}
                <button
                  type="button"
                  class="act"
                  onclick={(e) => fireAction(e, "reply")}
                >
                  {m.tickets_action_reply()}
                </button>
              {/if}
              {#if showCall}
                <button
                  type="button"
                  class="act"
                  onclick={(e) => fireAction(e, "call")}
                >
                  {m.tickets_action_call()}
                </button>
              {/if}
            </span>
          {/if}
          {#if showCaseGroup}
            <span class="act-group act-group-end">
              {#if showHold}
                <button
                  type="button"
                  class="act act-quiet"
                  onclick={(e) => fireAction(e, holdAction)}
                >
                  {displayStatus === "hold"
                    ? m.tickets_action_unhold()
                    : m.tickets_action_hold()}
                </button>
              {/if}
              {#if showOwner}
                <button
                  type="button"
                  class="act"
                  onclick={(e) => fireAction(e, ownerAction)}
                >
                  {isUnassigned
                    ? m.tickets_action_take()
                    : m.tickets_action_assign()}
                </button>
              {/if}
            </span>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="row-top">
        {#if multiSelectActive}
          {@render checkboxIsland()}
        {/if}
        <StatusMark
          status={displayStatus}
          unreadHighlight={newRepliesFirst && isUnread}
        />
        <span class="client-alias">{@render hl(clientAlias ?? "...")}</span>
        <span class="row-top-stamp"><PriorityStamp {priority} /></span>
      </div>
      <div class="content-group">
        <div class="r-title-row">
          <div class="row-title">{@render titleBlock()}</div>
          {@render newPill()}
        </div>
      </div>
      <div class="preview-window" data-preview>
        <TicketPreview
          {ticketId}
          followUps={previewFollowUps}
          multiline={false}
          fit={true}
          {followUpCount}
          reactions={previewReactions}
          {clientAlias}
          {searchTerm}
        />
      </div>
      <div class="row-meta num">
        <span class="meta-left">
          {@render queueSegment()} · {@render assigneeSegment()}
        </span>
        <span class="meta-right">
          <span class="r-time num">{relativeTime}</span>
          {#if msgLabel}<span class="grid-msgs">· {msgLabel}</span>{/if}
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
    pointer-events: auto;
  }

  :global(.select-checkbox) {
    transform: scale(0.8);
    transform-origin: center;
  }

  .num {
    font-variant-numeric: tabular-nums;
  }

  /* ── Row/card head: [mark 22px] [main 1fr] ── */
  .head {
    display: grid;
    grid-template-columns: 22px 1fr;
    column-gap: 10px;
    align-items: start;
    pointer-events: none;
  }

  .head-select {
    grid-template-columns: auto 22px 1fr;
  }

  .mark {
    margin-top: 4px;
    display: inline-flex;
  }

  .head-main {
    min-width: 0;
  }

  .r-alias-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    min-width: 0;
  }

  .r-alias {
    font-weight: 600;
    font-size: var(--text-md);
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1;
  }

  .r-side {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  /* The new pill sits under the priority stamp, beside the title, so an
     unread ticket never shifts the stamp. */
  .r-title-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    min-width: 0;
  }

  .r-title-row > .r-title,
  .r-title-row > .row-title {
    flex: 1;
    min-width: 0;
  }

  .r-pill {
    flex-shrink: 0;
    display: inline-flex;
    margin-top: 2px;
  }

  .r-title {
    display: block;
    font-size: var(--text-base);
    line-height: 1.35;
    color: var(--ink);
    opacity: 0.75;
    overflow-wrap: anywhere;
  }

  .tc-unread .r-title,
  .tc-unread .row-title {
    font-weight: 700;
    opacity: 1;
  }

  /* Closed is a quiet state said through the ink tokens, not a fade on
     the card: a whole-card opacity pulled the meta row and the search
     highlight under 4.5:1 on the dark surfaces. The struck title drops to
     the muted ink at full strength; the meta row already sits there. */
  .tc-closed .r-title,
  .tc-closed .row-title {
    color: var(--muted);
    opacity: 1;
    text-decoration: line-through;
    text-decoration-color: var(--hair-2);
    text-decoration-thickness: 1px;
  }

  .r-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    margin-top: 3px;
    font-size: var(--text-sm);
    color: var(--muted);
    min-width: 0;
  }

  .r-meta .meta-left {
    flex: 1 1 0%;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .r-meta .meta-right {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    white-space: nowrap;
  }

  .meta-sep {
    opacity: 0.5;
  }

  .meta-you {
    font-weight: 700;
    color: var(--ink-2);
  }

  /* A highlight sits on its own soft background, which lifts the surface
     under it; on the muted ink of the meta row and of a closed title that
     lands under 4.5:1, so the match reads in the secondary ink. */
  .r-meta :global(.search-highlight),
  .row-meta :global(.search-highlight),
  .tc-closed .r-title :global(.search-highlight),
  .tc-closed .row-title :global(.search-highlight) {
    color: var(--ink-2);
  }

  .r-time {
    font-size: var(--text-xs);
    color: var(--muted);
    white-space: nowrap;
  }

  .r-msgs {
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

  /* Etched-glass skin comes from the shared .preview-window class
     (shared.css); this rule is the cards-mode geometry: a padded,
     content-height pane around the multiline preview. */
  .previews {
    margin: 10px 0 2px;
    padding: 8px 10px;
    border-radius: 8px;
    pointer-events: none;
  }

  .card-meta {
    pointer-events: none;
    margin-top: 4px;
  }

  .actions {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 9px;
    border-top: 1px solid var(--hair);
  }

  .act-group {
    display: flex;
    gap: 18px;
  }

  /* Keeps the case group on the right when the contact group is hidden. */
  .act-group-end {
    margin-left: auto;
  }

  .act {
    position: relative;
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--brand-text);
    cursor: pointer;
    min-height: 24px;
    display: inline-flex;
    align-items: center;
  }

  /* Invisible 44px touch hit area. Horizontal reach is capped at 5px per
     side so neighbors inside the 18px .act-group gap keep 8px of effective
     separation (WCAG 2.5.8 spacing). */
  .act::after {
    content: "";
    position: absolute;
    inset: -14px -5px;
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
    pointer-events: none;
  }

  .row-top-stamp {
    margin-left: auto;
  }

  /* Grid-only geometry: fixed-height crop that fit-mode TicketPreview
     anchors against. Scoped to .tc--grid so it cannot clamp the
     content-height cards pane, which shares the .preview-window skin. */
  .tc--grid .preview-window {
    width: 100%;
    height: 5rem;
    flex-shrink: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .content-group {
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 0;
    overflow: hidden;
  }

  .client-alias {
    flex: 1;
    min-width: 0;
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
    pointer-events: none;
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

  /* ── Queue glyph spacing in the inline meta row ── */
  .queue-glyph-gap {
    display: inline-flex;
    margin-right: 0.3em;
    vertical-align: -0.125em;
  }
</style>

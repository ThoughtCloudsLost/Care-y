<script lang="ts">
  import TicketCard from "$lib/components/tickets/TicketCard.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import { resolveGridColumns } from "$lib/tickets/ticket-list-utils.js";
  import type { ViewMode } from "$lib/stores/view-mode.svelte.js";
  import type { DataCardProps } from "$lib/tickets/ticket-card-props.js";
  import * as m from "$lib/paraglide/messages.js";

  interface TicketPreviewListProps {
    /** Card props already mapped by the shared ticket-card mapper. */
    cards: DataCardProps[];
    /** Which of the three Inkwell presentations to render. */
    viewMode: ViewMode;
    /** Cap for list/cards; grid packs one extra row (see `cap`). */
    maxVisible?: number;
    /** Show skeleton cards instead of real ones. */
    loading?: boolean;
    /** Callback when "see all" is tapped. Route file handles navigation. */
    onseeall?: () => void;
    /** Total count from server (overrides cards.length in the "see all" label). */
    totalCount?: number;
  }

  let {
    cards,
    viewMode,
    maxVisible = 5,
    loading = false,
    onseeall,
    totalCount,
  }: TicketPreviewListProps = $props();

  // Grid packs an even two rows; list and cards keep the five-item preview.
  const cap = $derived(viewMode === "grid" ? 6 : maxVisible);
  const displayCount = $derived(totalCount ?? cards.length);
  const visibleCards = $derived(cards.slice(0, cap));
  const hasMore = $derived(displayCount > cap);

  // Grid columns track the section container width, floored at two so a
  // narrow desktop column still reads as a grid (matches the tickets list).
  let containerEl = $state<HTMLElement | undefined>(undefined);
  let containerWidth = $state(0);

  $effect(() => {
    const el = containerEl;
    if (!el) return;
    containerWidth = el.clientWidth;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) containerWidth = entry.contentRect.width;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  const gridColumns = $derived(
    viewMode === "grid" ? resolveGridColumns(containerWidth) : 1,
  );

  function noop(): void {
    /* skeleton cards never navigate */
  }
</script>

{#if loading}
  <div
    class="preview-list"
    class:mode-rows={viewMode === "list"}
    class:mode-cards={viewMode === "cards"}
    class:mode-grid={viewMode === "grid"}
    style:--grid-cols={gridColumns}
  >
    {#each Array(cap) as _, i (i)}
      <TicketCard
        loading={true}
        {viewMode}
        ticketId=""
        queueName={null}
        displayStatus="active"
        priority="normal"
        titleResult={{ status: "loading" }}
        clientAlias=""
        assignedName={null}
        createdAt={new Date()}
        lastActivityAt={null}
        followUpCount={0}
        unreadCount={0}
        previewFollowUps={undefined}
        ontap={noop}
      />
    {/each}
  </div>
{:else if cards.length === 0}
  <EmptyState message={m.dashboard_empty_section()} />
{:else}
  <div
    bind:this={containerEl}
    class="preview-list"
    class:mode-rows={viewMode === "list"}
    class:mode-cards={viewMode === "cards"}
    class:mode-grid={viewMode === "grid"}
    style:--grid-cols={gridColumns}
  >
    {#each visibleCards as card (card.ticketId)}
      <TicketCard {...card} {viewMode} />
    {/each}
  </div>
  {#if hasMore && onseeall !== undefined}
    <button type="button" class="see-all-link" onclick={onseeall}>
      {m.dashboard_see_all({ count: displayCount })}
    </button>
  {/if}
{/if}

<style>
  .preview-list {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* Ruled rows: a top hairline opens the list; each row carries its own
     bottom hairline (TicketCard's list mode), so the gap collapses. */
  .preview-list.mode-rows {
    gap: 0;
    border-top: 1px solid var(--hair);
  }

  .preview-list.mode-cards {
    gap: 12px;
  }

  .preview-list.mode-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols, 2), minmax(0, 1fr));
    gap: 12px;
  }

  .see-all-link {
    display: block;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--brand-text);
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }
</style>

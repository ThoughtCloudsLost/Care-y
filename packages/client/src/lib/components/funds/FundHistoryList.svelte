<!--
  A fund's ledger, newest first. Each row shows the entry type, the signed
  amount, and when and who recorded it. Entries a later correction
  cancelled carry a word badge.

  An entry whose sealed payload names a case opens that case. The row
  shows no alias, only that a case exists, and the server never reads the
  pointer: it travels inside the org-key sealed payload.
-->
<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { onKeyActivate } from "$lib/utils/a11y.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { createVolunteersQuery } from "$lib/tickets/queries.js";
  import {
    buildVolunteerMap,
    resolveVolunteerName as resolveVolName,
  } from "$lib/tickets/resolve-volunteer.js";
  import type { FundEntryType } from "@care-y/shared";
  import type { LedgerEntryView } from "$lib/funds/fund-store.svelte.js";
  import { formatAmount } from "$lib/funds/fund-display.js";

  interface FundHistoryListProps {
    entries: readonly LedgerEntryView[];
    currency: string;
    reversedIds: ReadonlySet<string>;
    /** Opens the case an entry was recorded from. */
    onticketopen: (ticketId: string) => void;
  }

  let { entries, currency, reversedIds, onticketopen }: FundHistoryListProps =
    $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const orgCache = getOrgDecryptCache();
  const volunteersQuery = createVolunteersQuery(ticketRouter);
  const volunteerMap = $derived(buildVolunteerMap(volunteersQuery.data));

  const ENTRY_LABELS = new Map<FundEntryType, () => string>([
    ["disbursement", m.fund_entry_disbursement],
    ["adjustment", m.fund_entry_adjustment],
    ["reversal", m.fund_entry_reversal],
  ]);

  function entryLabel(entry: LedgerEntryView): string {
    return (
      ENTRY_LABELS.get(entry.payload.entryType)?.() ?? m.fund_entry_adjustment()
    );
  }

  function recordedByLine(entry: LedgerEntryView): string {
    const name =
      resolveVolName(entry.payload.recordedBy, volunteerMap, orgCache) ??
      m.ticket_system_volunteer_fallback();
    const by = m.fund_entry_by({ name });
    return entry.payload.ticketId !== undefined
      ? `${by} · ${m.fund_entry_on_case(withTerms())}`
      : by;
  }

  function recordedAtLabel(entry: LedgerEntryView): string {
    return new Date(entry.payload.recordedAt).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
</script>

{#if entries.length === 0}
  <p class="history-empty">{m.fund_history_empty()}</p>
{:else}
  <List nested class="history-list">
    {#each entries as entry (entry.id)}
      {@const reversed = reversedIds.has(entry.id)}
      {@const ticketId = entry.payload.ticketId}
      {@const isActivatable = ticketId !== undefined}
      <ListItem
        title={entryLabel(entry)}
        subtitle={recordedByLine(entry)}
        class={[
          reversed ? "history-reversed" : "",
          isActivatable ? "touch-feedback" : "",
        ].join(" ")}
        onclick={isActivatable ? () => onticketopen(ticketId) : undefined}
        onkeydown={isActivatable
          ? onKeyActivate(() => onticketopen(ticketId))
          : undefined}
        role={isActivatable ? "button" : undefined}
        tabindex={isActivatable ? 0 : undefined}
      >
        {#snippet after()}
          <span class="history-after">
            <span class="history-amount num">
              {formatAmount(entry.payload.amountMinor, currency)}
            </span>
            <time class="history-date" datetime={entry.payload.recordedAt}>
              {recordedAtLabel(entry)}
            </time>
            {#if reversed}
              <span class="history-badge">{m.fund_entry_reversed()}</span>
            {/if}
          </span>
        {/snippet}
      </ListItem>
    {/each}
  </List>
{/if}

<style>
  .history-empty {
    margin: 0;
    padding: var(--space-md);
    text-align: center;
    color: var(--muted);
    font-size: var(--text-sm);
  }

  :global(.history-list) {
    margin: 0 !important;
  }

  /* A cancelled entry is a records fact, not an alarm. */
  :global(.history-reversed) {
    opacity: 0.6;
  }

  /* A reversed row already sits at touch-feedback's 0.6, so press goes lower. */
  :global(.history-reversed.touch-feedback:active) {
    opacity: 0.4;
  }

  .history-after {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
  }

  .history-amount {
    font-size: var(--text-sm);
    color: var(--ink);
  }

  .history-date {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  .history-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--muted);
  }

  .num {
    font-variant-numeric: tabular-nums;
  }
</style>

<!--
  One fund's balance, as a card. Same anatomy as the dashboard queue
  tiles (hairline-bordered card, no shadow), without the button: the
  fund's ledger sits right below it on the audit page, so there is
  nothing to open. The foot of the card says the day the fund was
  created, so the history below it has a visible start.

  The large figure is the fund's available figure, the one every other
  surface shows: the sealed running balance plus what a linked provider
  raised. The breakdown underneath sums the ledger. The raised line
  appears only once the fund is linked to a provider. A raised total the
  provider could not supply is said in words in place of a number, in
  the same muted style as below zero; it never shows as zero. A balance
  below zero is spelled out in words and set in muted italic, never in
  an alarm color.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import type { LedgerTotals } from "$lib/funds/balances.js";
  import { isBelowZero } from "$lib/funds/balances.js";
  import { formatAmount } from "$lib/funds/fund-display.js";
  import { formatShortDate } from "$lib/utils/time.js";
  import type {
    FundAvailable,
    FundRaised,
  } from "$lib/funds/fund-store.svelte.js";

  interface FundBalanceCardProps {
    /** Null while the fund itself is loading. */
    name: string | null;
    currency: string;
    /** The sealed balance plus raised, as every surface shows it. */
    available: FundAvailable;
    /** The ledger summed; null while it loads or decrypts. */
    totals: LedgerTotals | null;
    /** The linked provider fund's raised state. */
    raised: FundRaised;
    /** ISO timestamp of the fund's creation; null while the fund loads. */
    createdAt: string | null;
  }

  let {
    name,
    currency,
    available,
    totals,
    raised,
    createdAt,
  }: FundBalanceCardProps = $props();

  const belowZero = $derived(
    available.kind === "amount" && isBelowZero(available.minor),
  );
</script>

<div class="fund-tile" role="group" aria-label={name ?? undefined}>
  <span class="fund-name">
    {#if name === null}
      <DecryptPlaceholder length={10} />
    {:else}
      {name}
    {/if}
  </span>
  {#if available.kind === "pending"}
    <span class="fund-available num"><InlineSkeleton width="7ch" /></span>
  {:else if available.kind === "unavailable"}
    <span class="fund-available fund-unavailable">
      {m.fund_balance_raised_unavailable()}
    </span>
  {:else if available.kind === "amount"}
    <span class="fund-available num" class:fund-below={belowZero}>
      {formatAmount(available.minor, currency)}
    </span>
    <span class="fund-caption" class:fund-below={belowZero}>
      {belowZero ? m.fund_balance_below_zero() : m.fund_balance_available()}
    </span>
  {/if}
  {#if totals !== null}
    <span class="fund-breakdown num">
      {#if raised.kind !== "unlinked"}
        <span class="fund-line">
          <span class="fund-line-label">{m.fund_balance_raised()}</span>
          {#if raised.kind === "unavailable"}
            <span class="fund-line-value fund-unavailable">
              {m.fund_balance_raised_unavailable()}
            </span>
          {:else if raised.kind === "pending"}
            <span class="fund-line-value"><InlineSkeleton width="5ch" /></span>
          {:else}
            <span class="fund-line-value">
              {formatAmount(totals.raised, currency)}
            </span>
          {/if}
        </span>
      {/if}
      <span class="fund-line">
        <span class="fund-line-label">{m.fund_balance_adjusted()}</span>
        <span class="fund-line-value">
          {formatAmount(totals.adjusted, currency)}
        </span>
      </span>
      <span class="fund-line">
        <span class="fund-line-label">{m.fund_balance_disbursed()}</span>
        <span class="fund-line-value">
          {formatAmount(totals.disbursed, currency)}
        </span>
      </span>
    </span>
  {/if}
  {#if createdAt !== null}
    <time class="fund-caption fund-created" datetime={createdAt}>
      {m.admin_funds_created_on({ date: formatShortDate(createdAt) })}
    </time>
  {/if}
</div>

<style>
  /* Inkwell tile, as the dashboard queue tiles: hairline-bordered card,
     no shadow. */
  .fund-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    width: 100%;
    padding: 0.875rem 0.75rem;
    text-align: center;
    background: var(--raised);
    border: 1px solid var(--hair-2);
    border-radius: 12px;
    box-shadow: none;
  }

  .fund-name {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fund-available {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--ink);
  }

  .fund-caption {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  /* Below zero is distinct but neutral: muted italic, never a red alarm.
     The caption says so in words. A raised total the provider could not
     supply takes the same neutral treatment. */
  .fund-below,
  .fund-unavailable {
    color: var(--ink-2);
    font-style: italic;
  }

  .fund-breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    width: 100%;
    margin: var(--space-xs) 0 0;
    padding-top: var(--space-xs);
    border-top: 1px solid var(--hair);
  }

  /* The day the fund began: its ledger, below the card, starts here. */
  .fund-created {
    margin-top: var(--space-xs);
  }

  .fund-line {
    display: flex;
    justify-content: space-between;
    gap: var(--space-sm);
    font-size: var(--text-xs);
  }

  .fund-line-label {
    color: var(--muted);
  }

  .fund-line-value {
    color: var(--ink-2);
  }

  .num {
    font-variant-numeric: tabular-nums;
  }
</style>

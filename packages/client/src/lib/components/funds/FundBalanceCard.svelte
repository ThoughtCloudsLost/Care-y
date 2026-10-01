<!--
  One fund's balance, as a card. Same anatomy as the dashboard queue
  tiles (hairline-bordered card, no shadow), without the button: the
  fund's ledger sits right below it on the audit page, so there is
  nothing to open.

  The large figure is the fund's sealed running balance, the one every
  other surface shows. The breakdown underneath sums the ledger. The
  raised line appears only once the fund is linked to a provider. A
  balance below zero is spelled out in words and set in muted italic,
  never in an alarm color.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import type { LedgerTotals } from "$lib/funds/balances.js";
  import { isBelowZero } from "$lib/funds/balances.js";
  import { formatAmount } from "$lib/funds/fund-display.js";

  interface FundBalanceCardProps {
    /** Null while the fund itself is loading. */
    name: string | null;
    currency: string;
    /** The sealed balance; null while it decrypts. */
    balanceMinor: number | null;
    /** The ledger summed; null while it loads or decrypts. */
    totals: LedgerTotals | null;
    providerLinked: boolean;
  }

  let {
    name,
    currency,
    balanceMinor,
    totals,
    providerLinked,
  }: FundBalanceCardProps = $props();

  const belowZero = $derived(
    balanceMinor !== null && isBelowZero(balanceMinor),
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
  {#if balanceMinor === null}
    <span class="fund-available num"><InlineSkeleton width="7ch" /></span>
  {:else}
    <span class="fund-available num" class:fund-below={belowZero}>
      {formatAmount(balanceMinor, currency)}
    </span>
    <span class="fund-caption" class:fund-below={belowZero}>
      {belowZero ? m.fund_balance_below_zero() : m.fund_balance_available()}
    </span>
  {/if}
  {#if totals !== null}
    <span class="fund-breakdown num">
      {#if providerLinked}
        <span class="fund-line">
          <span class="fund-line-label">{m.fund_balance_raised()}</span>
          <span class="fund-line-value">
            {formatAmount(totals.raised, currency)}
          </span>
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
     The caption says so in words. */
  .fund-below {
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

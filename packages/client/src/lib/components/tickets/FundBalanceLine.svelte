<!--
  One line in the case panel: the fund the case's queue draws on and its
  sealed balance. Built as a panel section like PanelNotesSection and
  LinkedCasesSection (BlockTitle header, one List below it); the row is a
  Konsta ListItem with the value in the after slot.

  Renders nothing without the permission to read funds, or when the
  queue has no fund. A balance below zero is spelled out in words and
  set in muted italic, never in an alarm color.
-->
<script lang="ts">
  import { BlockTitle, List, ListItem } from "konsta/svelte";
  import { HandCoins } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import {
    createCaseFund,
    createFundStore,
  } from "$lib/funds/fund-store.svelte.js";
  import { isBelowZero } from "$lib/funds/balances.js";
  import { formatAmount } from "$lib/funds/fund-display.js";

  interface FundBalanceLineProps {
    ticketId: string;
  }

  let { ticketId }: FundBalanceLineProps = $props();

  const fundStore = createFundStore();
  const caseFund = createCaseFund(() => ticketId, fundStore);

  const fund = $derived(caseFund.fund);
  const balanceMinor = $derived(fund?.balance?.balanceMinor ?? null);
  const belowZero = $derived(
    balanceMinor !== null && isBelowZero(balanceMinor),
  );

  const balanceLabel = $derived.by((): string | undefined => {
    if (fund === undefined || balanceMinor === null) return undefined;
    const amount = formatAmount(balanceMinor, fund.currency);
    return belowZero
      ? m.fund_available_below_zero({ amount })
      : m.fund_available_amount({ amount });
  });
</script>

{#if fundStore.enabled && fund !== undefined}
  <BlockTitle class="!mt-6 !-mb-2">{m.panel_funds()}</BlockTitle>
  <List class="!my-3">
    <ListItem title={fund.name}>
      {#snippet media()}
        <HandCoins class="w-5 h-5 text-[var(--ink-2)]" aria-hidden="true" />
      {/snippet}
      {#snippet after()}
        {#if balanceLabel === undefined}
          <InlineSkeleton width="8ch" />
        {:else}
          <span class="fund-balance num" class:fund-balance-below={belowZero}>
            {balanceLabel}
          </span>
        {/if}
      {/snippet}
    </ListItem>
  </List>
{/if}

<style>
  .fund-balance {
    font-size: var(--text-sm);
    color: var(--ink);
  }

  /* Below zero is distinct but neutral: muted italic, never a red alarm.
     The words carry the meaning, so hue is not the only signal. */
  .fund-balance-below {
    color: var(--muted);
    font-style: italic;
  }

  .num {
    font-variant-numeric: tabular-nums;
  }
</style>

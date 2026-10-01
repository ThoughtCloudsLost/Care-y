<!--
  Fund ledger (audit): one balance card per active fund with that fund's
  full ledger below it. The card's figure is the sealed running balance
  every other surface shows; its breakdown sums the ledger. When the two
  disagree, a fund manager can reseal the balance from the ledger.

  Admission comes from the admin destination registry (AUDIT_FUNDS), the
  same rule that shows the hub tile. This is the only surface that
  fetches the ledger.
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { BlockTitle } from "konsta/svelte";
  import { HandCoins } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import { canCall } from "$lib/auth/procedure-gates.js";
  import { canEnterAdminRoute } from "$lib/admin/destinations.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";
  import Register from "$lib/components/Register.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import FundBalanceCard from "$lib/components/funds/FundBalanceCard.svelte";
  import FundHistoryList from "$lib/components/funds/FundHistoryList.svelte";
  import {
    createBalanceWriter,
    createFundLedger,
    createFundStore,
    invalidateFunds,
    type FundView,
  } from "$lib/funds/fund-store.svelte.js";
  import { ledgerMatchesBalance } from "$lib/funds/balances.js";
  import { formatAmount } from "$lib/funds/fund-display.js";

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());
  const hasAccess = $derived(canEnterAdminRoute(permissions, "/admin/funds"));
  const canRecompute = $derived(canCall(permissions, "funds.setBalance"));

  const fundStore = createFundStore();
  const ledger = createFundLedger();
  const balanceWriter = createBalanceWriter(fundStore);
  const queryClient = useQueryClient();
  const navbarCtx = getNavbarOverrideCtx();

  // A session without the audit key, or a server without the funds
  // router, goes home.
  $effect(() => {
    if (!hasAccess || !ledger.enabled) void goto(resolve("/"));
  });

  $effect(() => {
    navbarCtx.current = { title: m.funds_page_title() };
    return () => {
      navbarCtx.current = undefined;
    };
  });

  const loading = $derived(fundStore.isLoading || ledger.isLoading);
  const loadError = $derived(fundStore.error ?? ledger.error);
  const unreadable = $derived(
    fundStore.unreadableCount + ledger.unreadableCount,
  );
  // Totals are only trustworthy once every entry decrypted.
  const ledgerComplete = $derived(
    !ledger.isLoading && !ledger.decrypting && ledger.unreadableCount === 0,
  );

  /** The ledger's sum when it disagrees with the sealed balance. */
  function mismatchedTotal(fund: FundView): number | null {
    if (!ledgerComplete || fund.balance === null) return null;
    const totals = ledger.totals(fund.id);
    return ledgerMatchesBalance(totals, fund.balance.balanceMinor)
      ? null
      : totals.available;
  }

  let recomputingId = $state<string | null>(null);

  async function recompute(fund: FundView, ledgerSum: number): Promise<void> {
    recomputingId = fund.id;
    try {
      await balanceWriter.set(fund.id, ledgerSum, async (balance) =>
        requireRouter(trpc.funds, "funds").setBalance.mutate({ balance }),
      );
      haptic();
      toastStore.show(m.fund_recompute_done());
      announceToLiveRegion("polite", m.fund_recompute_done());
    } catch (err: unknown) {
      // A stale version means an entry landed meanwhile; the refetch
      // below shows the new figures before anyone tries again.
      toastStore.show(getErrorMessage(err), 3000);
    } finally {
      recomputingId = null;
      invalidateFunds(queryClient);
    }
  }
</script>

{#if hasAccess && ledger.enabled}
  <div class="funds-page pb-20">
    <p class="funds-intro">{m.funds_page_intro(withTerms())}</p>

    {#if loadError !== null}
      <QueryError
        error={loadError}
        onretry={() => {
          fundStore.refetch();
          ledger.refetch();
        }}
      />
    {:else if loading}
      <div class="skeleton-pulse" aria-busy="true">
        <FundBalanceCard
          name={null}
          currency=""
          balanceMinor={null}
          totals={null}
          providerLinked={false}
        />
      </div>
    {:else if fundStore.activeFunds.length === 0 && !fundStore.decrypting}
      <EmptyState icon={HandCoins} title={m.funds_empty()} />
    {:else}
      {#if unreadable > 0}
        <Register kind="careful" role="status">
          {m.funds_incomplete()}
        </Register>
      {/if}
      {#each fundStore.activeFunds as fund (fund.id)}
        {@const ledgerSum = mismatchedTotal(fund)}
        <section class="fund-block" aria-label={fund.name}>
          <FundBalanceCard
            name={fund.name}
            currency={fund.currency}
            balanceMinor={fund.balance?.balanceMinor ?? null}
            totals={ledgerComplete ? ledger.totals(fund.id) : null}
            providerLinked={fund.providerLink !== null}
          />
          {#if ledgerSum !== null}
            <Register kind="careful" role="status">
              <p class="fund-mismatch">
                {m.fund_recompute_mismatch({
                  amount: formatAmount(ledgerSum, fund.currency),
                })}
              </p>
              {#if canRecompute}
                <SoftButton
                  onclick={() => void recompute(fund, ledgerSum)}
                  disabled={recomputingId !== null}
                  full
                >
                  {recomputingId === fund.id
                    ? m.common_loading()
                    : m.fund_recompute_action()}
                </SoftButton>
              {/if}
            </Register>
          {/if}
          <BlockTitle class="!mt-2 !-mb-2">
            {m.fund_history_title({ fund: fund.name })}
          </BlockTitle>
          <FundHistoryList
            entries={ledger.entries(fund.id)}
            currency={fund.currency}
            reversedIds={ledger.reversedIds}
          />
        </section>
      {/each}
    {/if}
  </div>
{/if}

<style>
  .funds-page {
    padding: 0.25rem var(--page-pad-x) 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .funds-intro {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .fund-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .fund-mismatch {
    margin: 0 0 var(--space-sm);
  }
</style>

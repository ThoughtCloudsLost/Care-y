// @vitest-environment jsdom
/**
 * FundBalanceCard tests: the sealed balance as the headline figure, the
 * ledger breakdown underneath (raised only once linked), a balance below
 * zero said in words, and the loading states.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import { formatAmount } from "$lib/funds/fund-display.js";
import type { LedgerTotals } from "$lib/funds/balances.js";
import FundBalanceCard from "./FundBalanceCard.svelte";

vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

afterEach(cleanup);

const totals: LedgerTotals = {
  raised: 0,
  adjusted: 60_000,
  disbursed: 12_500,
  available: 47_500,
};

describe("FundBalanceCard", () => {
  it("shows the sealed balance and the ledger breakdown", () => {
    const { container } = render(FundBalanceCard, {
      props: {
        name: "Groceries",
        currency: "USD",
        balanceMinor: 47_500,
        totals,
        providerLinked: false,
      },
    });
    const text = container.textContent;

    expect(text).toContain("Groceries");
    expect(text).toContain(formatAmount(47_500, "USD"));
    expect(text).toContain(m.fund_balance_available());
    expect(text).toContain(formatAmount(60_000, "USD"));
    expect(text).toContain(formatAmount(12_500, "USD"));
    expect(text).not.toContain(m.fund_balance_raised());
  });

  it("adds the raised line once the fund is linked to a provider", () => {
    const { container } = render(FundBalanceCard, {
      props: {
        name: "Groceries",
        currency: "USD",
        balanceMinor: 47_500,
        totals,
        providerLinked: true,
      },
    });

    expect(container.textContent).toContain(m.fund_balance_raised());
  });

  it("says below zero in words", () => {
    const { container } = render(FundBalanceCard, {
      props: {
        name: "Transit",
        currency: "USD",
        balanceMinor: -2_500,
        totals: null,
        providerLinked: false,
      },
    });
    const text = container.textContent;

    expect(text).toContain(m.fund_balance_below_zero());
    expect(text).not.toContain(m.fund_balance_available());
  });

  it("leaves the breakdown out while the ledger loads", () => {
    const { container } = render(FundBalanceCard, {
      props: {
        name: "Transit",
        currency: "USD",
        balanceMinor: 1_000,
        totals: null,
        providerLinked: false,
      },
    });

    expect(container.textContent).not.toContain(m.fund_balance_adjusted());
  });

  it("names the card for assistive tech", () => {
    const { getByRole } = render(FundBalanceCard, {
      props: {
        name: "Transit",
        currency: "USD",
        balanceMinor: 1_000,
        totals,
        providerLinked: false,
      },
    });

    expect(getByRole("group", { name: "Transit" })).toBeTruthy();
  });
});

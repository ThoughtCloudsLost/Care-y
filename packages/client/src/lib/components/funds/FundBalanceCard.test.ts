// @vitest-environment jsdom
/**
 * FundBalanceCard tests: the available figure as the headline, the
 * ledger breakdown underneath (raised only once linked), a balance below
 * zero said in words, a raised total the provider could not supply said
 * in words (never zero), and the loading states.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import { formatAmount } from "$lib/funds/fund-display.js";
import { formatShortDate } from "$lib/utils/time.js";
import type { LedgerTotals } from "$lib/funds/balances.js";
import type {
  FundAvailable,
  FundRaised,
} from "$lib/funds/fund-store.svelte.js";
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

const UNLINKED: FundRaised = { kind: "unlinked" };

function amount(minor: number): FundAvailable {
  return { kind: "amount", minor };
}

describe("FundBalanceCard", () => {
  it("shows the sealed balance and the ledger breakdown", () => {
    const { container } = render(FundBalanceCard, {
      props: {
        name: "Groceries",
        currency: "USD",
        available: amount(47_500),
        totals,
        raised: UNLINKED,
        createdAt: null,
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
        available: amount(57_500),
        totals: { ...totals, raised: 10_000, available: 57_500 },
        raised: { kind: "amount", minor: 10_000 },
        createdAt: null,
      },
    });
    const text = container.textContent;

    expect(text).toContain(m.fund_balance_raised());
    expect(text).toContain(formatAmount(10_000, "USD"));
    expect(text).toContain(formatAmount(57_500, "USD"));
    expect(text).not.toContain(m.fund_balance_raised_unavailable());
  });

  it("says the raised total is unavailable in the figure and on the raised line", () => {
    const { container } = render(FundBalanceCard, {
      props: {
        name: "Groceries",
        currency: "USD",
        available: { kind: "unavailable" },
        totals,
        raised: { kind: "unavailable" },
        createdAt: null,
      },
    });
    const text = container.textContent;
    const figure = container.querySelector(".fund-available");
    const raisedLine = container.querySelector(".fund-line-value");

    expect(figure?.textContent.trim()).toBe(
      m.fund_balance_raised_unavailable(),
    );
    expect(raisedLine?.textContent.trim()).toBe(
      m.fund_balance_raised_unavailable(),
    );
    // Never a zero standing in for the missing figure, and no caption.
    expect(text).not.toContain(formatAmount(0, "USD"));
    expect(text).not.toContain(m.fund_balance_available());
    expect(text).not.toContain(m.fund_balance_below_zero());
  });

  it("says below zero in words", () => {
    const { container } = render(FundBalanceCard, {
      props: {
        name: "Transit",
        currency: "USD",
        available: amount(-2_500),
        totals: null,
        raised: UNLINKED,
        createdAt: null,
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
        available: amount(1_000),
        totals: null,
        raised: UNLINKED,
        createdAt: null,
      },
    });

    expect(container.textContent).not.toContain(m.fund_balance_adjusted());
  });

  it("names the card for assistive tech", () => {
    const { getByRole } = render(FundBalanceCard, {
      props: {
        name: "Transit",
        currency: "USD",
        available: amount(1_000),
        totals,
        raised: UNLINKED,
        createdAt: null,
      },
    });

    expect(getByRole("group", { name: "Transit" })).toBeTruthy();
  });

  it("says the day the fund was created", () => {
    const { container } = render(FundBalanceCard, {
      props: {
        name: "Groceries",
        currency: "USD",
        available: amount(47_500),
        totals,
        raised: UNLINKED,
        createdAt: "2026-09-01T12:00:00.000Z",
      },
    });

    expect(container.textContent).toContain(
      m.admin_funds_created_on({
        date: formatShortDate("2026-09-01T12:00:00.000Z"),
      }),
    );
    expect(container.querySelector("time")?.getAttribute("datetime")).toBe(
      "2026-09-01T12:00:00.000Z",
    );
  });

  it("leaves the creation line out while the fund loads", () => {
    const { container } = render(FundBalanceCard, {
      props: {
        name: null,
        currency: "",
        available: { kind: "pending" },
        totals: null,
        raised: UNLINKED,
        createdAt: null,
      },
    });

    expect(container.querySelector("time")).toBeNull();
  });
});

// @vitest-environment jsdom
/**
 * FundBalanceLine tests: the case panel's one line for the queue's fund.
 * Shows the fund's name and sealed balance, spells out a balance below
 * zero, and renders nothing without fund access or a queue fund.
 *
 * The fund cache is stubbed so no query or Worker runs.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import { fundIdSchema } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { formatAmount } from "$lib/funds/fund-display.js";
import type * as FundStoreNS from "$lib/funds/fund-store.svelte.js";
import type {
  CaseFund,
  FundStore,
  FundView,
} from "$lib/funds/fund-store.svelte.js";
import FundBalanceLine from "./FundBalanceLine.svelte";

const FUND = fundIdSchema.parse(globalThis.crypto.randomUUID());

let storeEnabled = true;
let caseFund: CaseFund = { fundId: null, fund: undefined };

vi.mock("$lib/funds/fund-store.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof FundStoreNS>()),
  createFundStore: (): Pick<FundStore, "enabled"> => ({
    get enabled() {
      return storeEnabled;
    },
  }),
  createCaseFund: (): CaseFund => caseFund,
}));

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function fund(balanceMinor: number | null): FundView {
  return {
    id: FUND,
    name: "Emergency housing",
    currency: "USD",
    providerLink: null,
    isActive: true,
    sortOrder: 0,
    orgKeyGeneration: 1,
    balance: balanceMinor === null ? null : { balanceMinor, version: 3 },
  };
}

beforeEach(() => {
  storeEnabled = true;
  caseFund = { fundId: FUND, fund: fund(42_500) };
});

afterEach(cleanup);

describe("FundBalanceLine", () => {
  it("shows the queue fund's name and sealed balance", () => {
    const { container } = render(FundBalanceLine, {
      props: { ticketId: "t-1" },
    });
    const text = container.textContent;

    expect(text).toContain(m.panel_funds());
    expect(text).toContain("Emergency housing");
    expect(text).toContain(
      m.fund_available_amount({ amount: formatAmount(42_500, "USD") }),
    );
  });

  it("says a balance below zero in words", () => {
    caseFund = { fundId: FUND, fund: fund(-1_200) };
    const { container } = render(FundBalanceLine, {
      props: { ticketId: "t-1" },
    });

    expect(container.textContent).toContain(
      m.fund_available_below_zero({ amount: formatAmount(-1_200, "USD") }),
    );
  });

  it("keeps the row while the balance decrypts", () => {
    caseFund = { fundId: FUND, fund: fund(null) };
    const { container } = render(FundBalanceLine, {
      props: { ticketId: "t-1" },
    });
    const text = container.textContent;

    expect(text).toContain("Emergency housing");
    expect(text).not.toContain("$");
  });

  it("renders nothing when the queue has no fund", () => {
    caseFund = { fundId: null, fund: undefined };
    const { container } = render(FundBalanceLine, {
      props: { ticketId: "t-1" },
    });

    expect(container.textContent.trim()).toBe("");
  });

  it("renders nothing without access to funds", () => {
    storeEnabled = false;
    const { container } = render(FundBalanceLine, {
      props: { ticketId: "t-1" },
    });

    expect(container.textContent.trim()).toBe("");
  });
});

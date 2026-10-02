import { describe, it, expect } from "vitest";
import {
  fundIdSchema,
  newFundLedgerId,
  userIdSchema,
  type FundLedgerPayload,
} from "@care-y/shared";
import {
  EMPTY_TOTALS,
  balanceAfter,
  computeLedgerTotals,
  computeLedgerTotalsByFund,
  formatMinorAmount,
  groupByFund,
  indexById,
  isBelowZero,
  ledgerMatchesBalance,
  ledgerSum,
  minorToMajorInput,
  parseMajorAmount,
  reversedEntryIds,
  type BalanceEntry,
} from "./balances.js";

const FUND_A = fundIdSchema.parse(globalThis.crypto.randomUUID());
const FUND_B = fundIdSchema.parse(globalThis.crypto.randomUUID());
const USER = userIdSchema.parse(globalThis.crypto.randomUUID());

function entry(
  amountMinor: number,
  entryType: FundLedgerPayload["entryType"],
  overrides: Partial<FundLedgerPayload> = {},
): BalanceEntry & { readonly id: ReturnType<typeof newFundLedgerId> } {
  const id = newFundLedgerId();
  return {
    id,
    payload: {
      v: 1,
      amountMinor,
      entryType,
      fundId: FUND_A,
      recordedAt: "2026-09-01T12:00:00.000Z",
      recordedBy: USER,
      ...overrides,
    },
  };
}

describe("computeLedgerTotals", () => {
  it("is empty for no entries", () => {
    expect(computeLedgerTotals([])).toEqual(EMPTY_TOTALS);
  });

  it("sums adjustments and disbursements into available", () => {
    const balance = computeLedgerTotals([
      entry(50_000, "adjustment"),
      entry(-1_250, "disbursement"),
      entry(-2_000, "adjustment"),
    ]);
    expect(balance).toEqual({
      raised: 0,
      adjusted: 48_000,
      disbursed: 1_250,
      available: 46_750,
    });
  });

  it("adds the raised term when a provider supplies one", () => {
    const balance = computeLedgerTotals([entry(-500, "disbursement")], 10_000);
    expect(balance.raised).toBe(10_000);
    expect(balance.available).toBe(9_500);
  });

  it("attributes a reversal of a disbursement to disbursed", () => {
    const original = entry(-3_000, "disbursement");
    const reversal = entry(3_000, "reversal", { reversesId: original.id });
    const corrected = entry(-2_500, "disbursement");
    const balance = computeLedgerTotals([
      entry(10_000, "adjustment"),
      original,
      reversal,
      corrected,
    ]);
    expect(balance.adjusted).toBe(10_000);
    expect(balance.disbursed).toBe(2_500);
    expect(balance.available).toBe(7_500);
  });

  it("attributes a reversal of an adjustment to adjusted", () => {
    const original = entry(4_000, "adjustment");
    const reversal = entry(-4_000, "reversal", { reversesId: original.id });
    const balance = computeLedgerTotals([original, reversal]);
    expect(balance).toEqual(EMPTY_TOTALS);
  });

  it("follows a chain of reversals to the original entry", () => {
    const original = entry(-1_000, "disbursement");
    const first = entry(1_000, "reversal", { reversesId: original.id });
    const second = entry(-1_000, "reversal", { reversesId: first.id });
    const balance = computeLedgerTotals([original, first, second]);
    expect(balance.disbursed).toBe(1_000);
    expect(balance.adjusted).toBe(0);
  });

  it("falls back to the sign when the reversed entry is missing", () => {
    const missing = newFundLedgerId();
    const giveBack = entry(700, "reversal", { reversesId: missing });
    const takeAway = entry(-300, "reversal", { reversesId: missing });
    const balance = computeLedgerTotals([giveBack, takeAway]);
    expect(balance.disbursed).toBe(-700);
    expect(balance.adjusted).toBe(-300);
    expect(balance.available).toBe(400);
  });

  it("always equals raised plus the plain sum of entries", () => {
    const original = entry(-900, "disbursement");
    const entries = [
      entry(2_000, "adjustment"),
      original,
      entry(900, "reversal", { reversesId: original.id }),
      entry(-400, "disbursement"),
    ];
    const sum = entries.reduce((acc, e) => acc + e.payload.amountMinor, 0);
    expect(computeLedgerTotals(entries, 250).available).toBe(250 + sum);
  });
});

describe("groupByFund and computeLedgerTotalsByFund", () => {
  it("groups by the fund id inside the payload", () => {
    const a1 = entry(100, "adjustment");
    const b1 = entry(200, "adjustment", { fundId: FUND_B });
    const a2 = entry(-50, "disbursement");
    const grouped = groupByFund([a1, b1, a2]);
    expect(grouped.get(FUND_A)).toEqual([a1, a2]);
    expect(grouped.get(FUND_B)).toEqual([b1]);
  });

  it("computes one total per fund", () => {
    const totals = computeLedgerTotalsByFund([
      entry(1_000, "adjustment"),
      entry(-400, "disbursement"),
      entry(300, "adjustment", { fundId: FUND_B }),
    ]);
    expect(totals.get(FUND_A)?.available).toBe(600);
    expect(totals.get(FUND_B)?.available).toBe(300);
  });

  it("gives each fund its raised figure from the map", () => {
    const totals = computeLedgerTotalsByFund(
      [
        entry(1_000, "adjustment"),
        entry(300, "adjustment", { fundId: FUND_B }),
      ],
      new Map([[FUND_A, 5_000]]),
    );
    expect(totals.get(FUND_A)?.raised).toBe(5_000);
    expect(totals.get(FUND_A)?.available).toBe(6_000);
    expect(totals.get(FUND_B)?.raised).toBe(0);
  });

  it("reports raised for a linked fund with no entries", () => {
    const totals = computeLedgerTotalsByFund(
      [entry(1_000, "adjustment")],
      new Map([[FUND_B, 2_500]]),
    );
    expect(totals.get(FUND_B)).toEqual({
      raised: 2_500,
      adjusted: 0,
      disbursed: 0,
      available: 2_500,
    });
  });
});

describe("ledgerSum", () => {
  it("is adjusted minus disbursed, without raised", () => {
    const totals = computeLedgerTotals(
      [entry(1_000, "adjustment"), entry(-250, "disbursement")],
      500,
    );
    expect(ledgerSum(totals)).toBe(750);
    expect(totals.available).toBe(1_250);
  });
});

describe("ledgerMatchesBalance", () => {
  it("agrees when the sealed balance equals the ledger sum", () => {
    const totals = computeLedgerTotals([
      entry(1_000, "adjustment"),
      entry(-250, "disbursement"),
    ]);
    expect(ledgerMatchesBalance(totals, 750)).toBe(true);
    expect(ledgerMatchesBalance(totals, 1_000)).toBe(false);
  });

  it("counts a new fund with no entries as zero", () => {
    expect(ledgerMatchesBalance(EMPTY_TOTALS, 0)).toBe(true);
  });

  it("ignores raised: the sealed balance never holds it", () => {
    const totals = computeLedgerTotals(
      [entry(1_000, "adjustment"), entry(-250, "disbursement")],
      500,
    );
    expect(ledgerMatchesBalance(totals, 750)).toBe(true);
    expect(ledgerMatchesBalance(totals, 1_250)).toBe(false);
  });
});

describe("indexById", () => {
  it("maps each row by its id", () => {
    const a = entry(1, "adjustment");
    const b = entry(2, "adjustment");
    const index = indexById([a, b]);
    expect(index.get(a.id)).toBe(a);
    expect(index.get(b.id)).toBe(b);
    expect(index.size).toBe(2);
  });
});

describe("reversedEntryIds", () => {
  it("collects the targets of reversals only", () => {
    const original = entry(-1_000, "disbursement");
    const reversal = entry(1_000, "reversal", { reversesId: original.id });
    const ids = reversedEntryIds([original, reversal, entry(5, "adjustment")]);
    expect([...ids]).toEqual([original.id]);
  });
});

describe("balanceAfter and isBelowZero", () => {
  it("applies a signed delta to the sealed balance", () => {
    expect(balanceAfter(1_000, -1_500)).toBe(-500);
    expect(isBelowZero(balanceAfter(1_000, -1_500))).toBe(true);
    expect(isBelowZero(balanceAfter(1_000, -1_000))).toBe(false);
    expect(balanceAfter(-200, 700)).toBe(500);
  });
});

describe("parseMajorAmount", () => {
  it.each([
    ["12", 1_200],
    ["12.5", 1_250],
    ["12.50", 1_250],
    ["12,05", 1_205],
    ["0.01", 1],
    [" 7.25 ", 725],
  ])('reads "%s" as %i minor units', (input, expected) => {
    expect(parseMajorAmount(input)).toBe(expected);
  });

  it.each(["", "0", "0.00", "-5", "12.345", "1,234.50", "abc", "1e3", "."])(
    'rejects "%s"',
    (input) => {
      expect(parseMajorAmount(input)).toBeNull();
    },
  );
});

describe("minorToMajorInput", () => {
  it.each([
    [1_250, "12.50"],
    [5, "0.05"],
    [-1_205, "12.05"],
    [100_000, "1000.00"],
  ])("formats %i as %s", (minor, expected) => {
    expect(minorToMajorInput(minor)).toBe(expected);
  });

  it("round-trips through parseMajorAmount", () => {
    expect(parseMajorAmount(minorToMajorInput(98_765))).toBe(98_765);
  });
});

describe("formatMinorAmount", () => {
  it("formats in the fund currency", () => {
    expect(formatMinorAmount(123_456, "USD", "en-US")).toBe("$1,234.56");
  });

  it("formats negative balances with a sign", () => {
    expect(formatMinorAmount(-500, "USD", "en-US")).toBe("-$5.00");
  });

  it("falls back to the number and code for an unknown currency", () => {
    expect(formatMinorAmount(1_050, "ZZ1", "en-US")).toBe("10.50 ZZ1");
  });
});

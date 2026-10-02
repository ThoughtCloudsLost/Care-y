// @vitest-environment jsdom
/**
 * Fund ledger page tests: admission on the audit key, one card and one
 * ledger per active fund, and the recompute action that reseals a
 * balance from the ledger when the two disagree.
 *
 * The fund cache and the ledger cache are stubbed objects, so no query
 * or Worker runs. The ledger list is replaced with a passthrough.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/svelte";
import { Permission, fundIdSchema, userIdSchema } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { setPermissions, getMockPermissions } from "$mocks/permissions.js";
import { formatAmount } from "$lib/funds/fund-display.js";
import {
  EMPTY_TOTALS,
  computeLedgerTotals,
  type LedgerTotals,
} from "$lib/funds/balances.js";
import type * as NavigationNS from "$app/navigation";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as ShellContextNS from "$lib/shell/context.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as ErrorsNS from "$lib/errors.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import type * as FundStoreNS from "$lib/funds/fund-store.svelte.js";
import type {
  BalanceWrite,
  BalanceWriter,
  FundLedger,
  FundStore,
  FundView,
} from "$lib/funds/fund-store.svelte.js";

const FUND = fundIdSchema.parse(globalThis.crypto.randomUUID());
const AUDITOR = userIdSchema.parse(globalThis.crypto.randomUUID());

const { mockGoto, mockSetBalance } = vi.hoisted(() => ({
  mockGoto: vi.fn(),
  mockSetBalance: vi
    .fn<(input: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue({ balanceVersion: 8 }),
}));

let funds: FundView[] = [];
let ledgerEnabled = true;
let ledgerTotals: LedgerTotals = EMPTY_TOTALS;

vi.mock("$app/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof NavigationNS>()),
  goto: mockGoto,
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getCurrentPermissions: () => getMockPermissions,
}));

vi.mock(
  "$lib/shell/context.js",
  async () =>
    (
      await import("$mocks/shell-context.js")
    ).shellContextMock() satisfies typeof ShellContextNS,
);

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: { funds: { setBalance: { mutate: mockSetBalance } } },
}));

vi.mock("$lib/errors.js", async (importOriginal) =>
  (await import("$mocks/errors.js")).errorsMock(
    await importOriginal<typeof ErrorsNS>(),
  ),
);

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
  (await import("$mocks/with-terms.js")).withTermsMock(
    await importOriginal<typeof WithTermsNS>(),
  ),
);

vi.mock("$lib/funds/fund-store.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof FundStoreNS>()),
  createFundStore: (): FundStore => ({
    enabled: true,
    isLoading: false,
    isError: false,
    error: null,
    decrypting: false,
    unreadableCount: 0,
    get funds() {
      return funds;
    },
    get activeFunds() {
      return funds.filter((f) => f.isActive);
    },
    fund: (id: string) => funds.find((f) => f.id === id),
    refetch: vi.fn(),
  }),
  // The writer's own sealing is covered in the store tests; here it hands
  // the write a readable balance so the recomputed figure can be checked.
  createBalanceWriter: (): BalanceWriter => ({
    write: () => Promise.reject(new Error("not used here")),
    set: async <T>(
      fundId: string,
      balanceMinor: number,
      run: (balance: BalanceWrite) => Promise<T>,
    ): Promise<T> =>
      run({
        fundId: fundIdSchema.parse(fundId),
        encryptedBalance: JSON.stringify({ v: 1, balanceMinor }),
        expectedVersion: 7,
        orgKeyGeneration: 1,
      }),
  }),
  createFundLedger: (): FundLedger => ({
    get enabled() {
      return ledgerEnabled;
    },
    isLoading: false,
    isError: false,
    error: null,
    decrypting: false,
    unreadableCount: 0,
    reversedIds: new Set<string>(),
    entries: () => [],
    totals: () => ledgerTotals,
    refetch: vi.fn(),
  }),
}));

vi.mock("$lib/components/funds/FundHistoryList.svelte", async () => {
  // Passthrough replaces the component; a surface assertion (not
  // importOriginal, which would load the real component tree) guards
  // the module shape.
  const _usedExports = null! as { default: unknown };
  return {
    default: (
      await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
    ).default,
  } satisfies typeof _usedExports;
});

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function fund(overrides: Partial<FundView> = {}): FundView {
  return {
    id: FUND,
    name: "Emergency housing",
    currency: "USD",
    providerLink: null,
    isActive: true,
    sortOrder: 0,
    orgKeyGeneration: 1,
    balance: { balanceMinor: 50_000, version: 7 },
    raised: { kind: "unlinked" },
    available: { kind: "amount", minor: 50_000 },
    ...overrides,
  };
}

/** A fund linked to a provider that raised `raisedMinor`. */
function linkedFund(raisedMinor: number): FundView {
  return fund({
    providerLink: { connectionId: "c-1", externalFundId: "gb-1" },
    raised: { kind: "amount", minor: raisedMinor },
    available: { kind: "amount", minor: 50_000 + raisedMinor },
  });
}

/** Ledger totals whose sum is the given amount, plus any raised. */
function totalsOf(ledgerSumMinor: number, raised = 0): LedgerTotals {
  return computeLedgerTotals(
    [
      {
        id: "entry-1",
        payload: {
          v: 1,
          amountMinor: ledgerSumMinor,
          entryType: "adjustment",
          fundId: FUND,
          recordedAt: "2026-09-20T10:00:00.000Z",
          recordedBy: AUDITOR,
        },
      },
    ],
    raised,
  );
}

const PageModule = await import("./+page.svelte");

beforeEach(() => {
  setPermissions(Permission.AUDIT_FUNDS);
  funds = [fund()];
  ledgerEnabled = true;
  ledgerTotals = totalsOf(50_000);
  mockGoto.mockClear();
  mockSetBalance.mockClear();
});

afterEach(cleanup);

describe("Fund ledger page", () => {
  it("sends a session without the audit key home", () => {
    setPermissions(Permission.VIEW_FUNDS, Permission.MANAGE_FUNDS);
    render(PageModule.default);

    expect(mockGoto).toHaveBeenCalledWith("/");
  });

  it("stays for an auditor and shows each active fund's sealed balance", () => {
    funds = [
      fund(),
      fund({
        id: fundIdSchema.parse(crypto.randomUUID()),
        name: "Closed fund",
        isActive: false,
      }),
    ];
    const { container } = render(PageModule.default);
    const text = container.textContent;

    expect(mockGoto).not.toHaveBeenCalled();
    expect(text).toContain("Emergency housing");
    expect(text).toContain(formatAmount(50_000, "USD"));
    expect(text).not.toContain("Closed fund");
  });

  it("says nothing about recomputing while the balance matches the ledger", () => {
    setPermissions(Permission.AUDIT_FUNDS, Permission.MANAGE_FUNDS);
    const { container } = render(PageModule.default);

    expect(container.textContent).not.toContain(m.fund_recompute_action());
  });

  it("shows the mismatch but no action to an auditor who cannot manage funds", () => {
    ledgerTotals = totalsOf(48_000);
    const { container } = render(PageModule.default);
    const text = container.textContent;

    expect(text).toContain(
      m.fund_recompute_mismatch({ amount: formatAmount(48_000, "USD") }),
    );
    expect(text).not.toContain(m.fund_recompute_action());
  });

  it("says nothing about recomputing when only raised separates the figures", () => {
    setPermissions(Permission.AUDIT_FUNDS, Permission.MANAGE_FUNDS);
    funds = [linkedFund(12_000)];
    ledgerTotals = totalsOf(50_000, 12_000);
    const { container } = render(PageModule.default);
    const text = container.textContent;

    expect(text).toContain(formatAmount(62_000, "USD"));
    expect(text).not.toContain(m.fund_recompute_action());
    expect(text).not.toContain(
      m.fund_recompute_mismatch({ amount: formatAmount(62_000, "USD") }),
    );
  });

  it("reseals the balance from the ledger at the version it read", async () => {
    setPermissions(Permission.AUDIT_FUNDS, Permission.MANAGE_FUNDS);
    ledgerTotals = totalsOf(48_000);
    const { getByText } = render(PageModule.default);

    await fireEvent.click(getByText(m.fund_recompute_action()));

    await waitFor(() => {
      expect(mockSetBalance).toHaveBeenCalledTimes(1);
    });
    const balance = mockSetBalance.mock.calls[0]?.[0].balance as
      BalanceWrite | undefined;
    expect(balance?.fundId).toBe(FUND);
    expect(balance?.expectedVersion).toBe(7);
    expect(JSON.parse(balance?.encryptedBalance ?? "null")).toEqual({
      v: 1,
      balanceMinor: 48_000,
    });
  });

  it("reseals the ledger sum without raised", async () => {
    setPermissions(Permission.AUDIT_FUNDS, Permission.MANAGE_FUNDS);
    funds = [linkedFund(12_000)];
    ledgerTotals = totalsOf(48_000, 12_000);
    const { container, getByText } = render(PageModule.default);

    expect(container.textContent).toContain(
      m.fund_recompute_mismatch({ amount: formatAmount(48_000, "USD") }),
    );

    await fireEvent.click(getByText(m.fund_recompute_action()));

    await waitFor(() => {
      expect(mockSetBalance).toHaveBeenCalledTimes(1);
    });
    const balance = mockSetBalance.mock.calls[0]?.[0].balance as
      BalanceWrite | undefined;
    expect(JSON.parse(balance?.encryptedBalance ?? "null")).toEqual({
      v: 1,
      balanceMinor: 48_000,
    });
  });
});

// @vitest-environment jsdom
/**
 * FundsSection tests: the fund list with each sealed balance, creating a
 * fund with a sealed zero balance, recording an adjustment through the
 * balance writer, and the notify toggle behind its own permission.
 *
 * The fund cache and the balance writer are stubs, so no query or Worker
 * runs. The org key "seals" by prefixing the plaintext, so the test can
 * read what would have been encrypted.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import { Permission, fundIdSchema, userIdSchema } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { setPermissions, getMockPermissions } from "$mocks/permissions.js";
import { formatAmount } from "$lib/funds/fund-display.js";
import FundsSection from "./FundsSection.svelte";
import type * as ErrorsNS from "$lib/errors.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as ShellSheetNS from "$lib/shell/ShellSheet.svelte";
import type * as FundStoreNS from "$lib/funds/fund-store.svelte.js";
import type {
  BalanceWrite,
  BalanceWriter,
  FundStore,
  FundView,
} from "$lib/funds/fund-store.svelte.js";

const FUND = fundIdSchema.parse(globalThis.crypto.randomUUID());
const USER = userIdSchema.parse(globalThis.crypto.randomUUID());

const {
  mockCreate,
  mockUpdate,
  mockAdjust,
  mockUpdateSettings,
  mockWrite,
  mockToastShow,
} = vi.hoisted(() => ({
  mockCreate: vi
    .fn<(input: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue({ id: "new" }),
  mockUpdate: vi
    .fn<(input: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue({ success: true }),
  mockAdjust: vi
    .fn<(input: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue({}),
  mockUpdateSettings: vi
    .fn<(input: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue({ success: true }),
  mockWrite: vi.fn<(fundId: string, deltaMinor: number) => void>(),
  mockToastShow: vi.fn(),
}));

let funds: FundView[] = [];

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
  createBalanceWriter: (): BalanceWriter => ({
    write: async <T>(
      fundId: string,
      deltaMinor: number,
      run: (balance: BalanceWrite) => Promise<T>,
    ): Promise<T> => {
      mockWrite(fundId, deltaMinor);
      return run({
        fundId: fundIdSchema.parse(fundId),
        encryptedBalance: "sealed-balance",
        expectedVersion: 4,
        orgKeyGeneration: 1,
      });
    },
    set: () => Promise.reject(new Error("not used here")),
  }),
  invalidateFunds: vi.fn(),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    funds: {
      create: { mutate: mockCreate },
      update: { mutate: mockUpdate },
      recordAdjustment: { mutate: mockAdjust },
      getSettings: {
        query: vi.fn().mockResolvedValue({ notifyFundManagers: true }),
      },
      updateSettings: { mutate: mockUpdateSettings },
    },
  },
}));

vi.mock("$lib/errors.js", async (importOriginal) =>
  (await import("$mocks/errors.js")).errorsMock(
    await importOriginal<typeof ErrorsNS>(),
  ),
);

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getCurrentPermissions: () => getMockPermissions,
  getCurrentUserId: () => () => USER,
  getOrgKeyManager: () => ({
    encryptText: (plaintext: string) => Promise.resolve(`sealed:${plaintext}`),
  }),
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  createQuery: (optsFn: () => Record<string, unknown>) => {
    optsFn();
    return {
      isLoading: false,
      isError: false,
      error: null,
      data: { notifyFundManagers: true },
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    return {
      isPending: false,
      mutate(input: unknown) {
        void mutationFn(input);
      },
    };
  },
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/stores/toast.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ToastNS>()),
  toastStore: { show: mockToastShow },
}));

vi.mock(
  "$lib/shell/ShellSheet.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof ShellSheetNS)["default"],
    }) satisfies typeof ShellSheetNS,
);

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
    name: "Groceries",
    currency: "USD",
    providerLink: null,
    isActive: true,
    sortOrder: 0,
    orgKeyGeneration: 1,
    balance: { balanceMinor: 35_000, version: 4 },
    ...overrides,
  };
}

beforeEach(() => {
  setPermissions(Permission.MANAGE_FUNDS, Permission.VIEW_FUNDS);
  funds = [fund()];
  mockCreate.mockClear();
  mockUpdate.mockClear();
  mockAdjust.mockClear();
  mockUpdateSettings.mockClear();
  mockWrite.mockClear();
  mockToastShow.mockClear();
});

afterEach(cleanup);

describe("FundsSection", () => {
  it("lists each fund with its sealed balance", () => {
    const { container } = render(FundsSection);
    const text = container.textContent;

    expect(text).toContain("Groceries");
    expect(text).toContain(
      m.fund_available_amount({ amount: formatAmount(35_000, "USD") }),
    );
  });

  it("marks a deactivated fund in words", () => {
    funds = [fund({ isActive: false })];
    const { container } = render(FundsSection);

    expect(container.textContent).toContain(m.admin_status_inactive());
  });

  it("creates a fund with its name, currency and a sealed zero balance", async () => {
    render(FundsSection);

    await fireEvent.click(
      screen.getByRole("button", { name: m.admin_funds_add() }),
    );
    await fireEvent.input(
      screen.getByPlaceholderText(m.admin_funds_name_placeholder()),
      { target: { value: "Emergency housing" } },
    );
    await fireEvent.input(
      screen.getByPlaceholderText(m.admin_funds_currency_placeholder()),
      { target: { value: "eur" } },
    );
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
    const input = mockCreate.mock.calls[0]?.[0] ?? {};
    expect(String(input.encryptedPayload)).toContain(
      '"name":"Emergency housing"',
    );
    expect(String(input.encryptedPayload)).toContain('"currency":"EUR"');
    expect(String(input.encryptedBalance)).toMatch(/^sealed:/);
    expect(String(input.encryptedBalance)).toContain('"balanceMinor":0');
  });

  it("records an adjustment with the fund's next sealed balance", async () => {
    render(FundsSection);

    await fireEvent.click(
      screen.getByRole("button", {
        name: m.admin_funds_record_adjustment(),
      }),
    );
    await fireEvent.input(
      screen.getByPlaceholderText(m.fund_amount_placeholder()),
      { target: { value: "120" } },
    );
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(mockAdjust).toHaveBeenCalledTimes(1);
    });
    expect(mockWrite).toHaveBeenCalledWith(FUND, 12_000);
    const input = mockAdjust.mock.calls[0]?.[0] ?? {};
    expect(input.balance).toEqual({
      fundId: FUND,
      encryptedBalance: "sealed-balance",
      expectedVersion: 4,
      orgKeyGeneration: 1,
    });
    expect(String(input.encryptedPayload)).toContain(
      '"entryType":"adjustment"',
    );
  });

  it("takes money out with a negative adjustment", async () => {
    render(FundsSection);

    await fireEvent.click(
      screen.getByRole("button", {
        name: m.admin_funds_record_adjustment(),
      }),
    );
    await fireEvent.click(screen.getByText(m.admin_funds_adjustment_remove()));
    await fireEvent.input(
      screen.getByPlaceholderText(m.fund_amount_placeholder()),
      { target: { value: "15.25" } },
    );
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalledWith(FUND, -1_525);
    });
  });

  it("shows the notify toggle to fund managers", () => {
    render(FundsSection);

    expect(screen.getByText(m.admin_funds_notify_label())).toBeTruthy();
  });

  it("hides adjustments and the notify toggle without fund management", () => {
    setPermissions(Permission.VIEW_FUNDS);
    const { container } = render(FundsSection);
    const text = container.textContent;

    expect(text).not.toContain(m.admin_funds_record_adjustment());
    expect(text).not.toContain(m.admin_funds_notify_label());
  });
});

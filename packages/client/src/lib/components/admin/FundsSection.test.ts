// @vitest-environment jsdom
/**
 * FundsSection tests: the fund list with each available figure, creating
 * a fund with a sealed zero balance, linking a fund to a provider fund,
 * recording an adjustment through the balance writer, the notify toggle
 * behind its own permission, and the donation providers block.
 *
 * The fund cache and the balance writer are stubs, so no query or Worker
 * runs. Queries answer by key from `queryData`. The org key "seals" by
 * prefixing the plaintext, so the test can read what would have been
 * encrypted.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/svelte";
import {
  Permission,
  donationConnectionIdSchema,
  fundIdSchema,
  userIdSchema,
  type DonationConnectionWire,
  type ProviderFundListWire,
} from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { setPermissions, getMockPermissions } from "$mocks/permissions.js";
import { formatAmount } from "$lib/funds/fund-display.js";
import { formatShortDate } from "$lib/utils/time.js";
import { donationKeys, fundKeys } from "$lib/query/keys.js";
import FundsSection from "./FundsSection.svelte";
import type * as ErrorsNS from "$lib/errors.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as ToastNS from "$lib/stores/toast.svelte.js";
import type * as ShellSheetNS from "$lib/shell/ShellSheet.svelte";
import type * as ShellDialogNS from "$lib/shell/ShellDialog.svelte";
import type * as FundStoreNS from "$lib/funds/fund-store.svelte.js";
import type {
  BalanceWrite,
  BalanceWriter,
  FundStore,
  FundView,
} from "$lib/funds/fund-store.svelte.js";

const FUND = fundIdSchema.parse(globalThis.crypto.randomUUID());
const USER = userIdSchema.parse(globalThis.crypto.randomUUID());
const CONN = donationConnectionIdSchema.parse(globalThis.crypto.randomUUID());
const CONN_2 = donationConnectionIdSchema.parse(globalThis.crypto.randomUUID());
const API_KEY = "not-a-real-key-0123456789abcdef";

const {
  mockCreate,
  mockUpdate,
  mockAdjust,
  mockUpdateSettings,
  mockSaveConnection,
  mockRemoveConnection,
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
  mockSaveConnection: vi
    .fn<(input: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue({}),
  mockRemoveConnection: vi
    .fn<(input: Record<string, unknown>) => Promise<unknown>>()
    .mockResolvedValue({ success: true }),
  mockWrite: vi.fn<(fundId: string, deltaMinor: number) => void>(),
  mockToastShow: vi.fn(),
}));

let funds: FundView[] = [];
// Query data by JSON-encoded query key.
const queryData = new Map<string, unknown>();

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
    donations: {
      listConnections: { query: vi.fn() },
      saveGivebutterConnection: { mutate: mockSaveConnection },
      removeConnection: { mutate: mockRemoveConnection },
      listProviderFunds: { query: vi.fn() },
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
    const opts = optsFn();
    return {
      isLoading: false,
      isError: false,
      error: null,
      data:
        opts.enabled === false
          ? undefined
          : queryData.get(JSON.stringify(opts.queryKey)),
      refetch: vi.fn(),
    };
  },
  createMutation: (optsFn: () => Record<string, unknown>) => {
    const opts = optsFn();
    const mutationFn = opts.mutationFn as (input: unknown) => Promise<unknown>;
    const onSuccess = opts.onSuccess as ((data: unknown) => void) | undefined;
    const onError = opts.onError as ((err: unknown) => void) | undefined;
    return {
      isPending: false,
      mutate(input: unknown) {
        void mutationFn(input).then(
          (data) => onSuccess?.(data),
          (err: unknown) => onError?.(err),
        );
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

vi.mock(
  "$lib/shell/ShellDialog.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/StubShellDialog.svelte"))
        .default as unknown as (typeof ShellDialogNS)["default"],
    }) satisfies typeof ShellDialogNS,
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
    createdAt: "2026-09-01T12:00:00.000Z",
    balance: { balanceMinor: 35_000, version: 4 },
    raised: { kind: "unlinked" },
    available: { kind: "amount", minor: 35_000 },
    ...overrides,
  };
}

function connection(
  overrides: Partial<DonationConnectionWire> = {},
): DonationConnectionWire {
  return {
    id: CONN,
    provider: "givebutter",
    keyHint: "a1b2",
    webhookRegistered: true,
    createdAt: "2026-10-02T09:00:00.000Z",
    ...overrides,
  };
}

function setConnections(list: DonationConnectionWire[]): void {
  queryData.set(JSON.stringify(donationKeys.connections()), {
    connections: list,
  });
}

const PROVIDER_FUNDS: ProviderFundListWire = {
  funds: [
    {
      connectionId: CONN,
      externalId: "gb-fund-1",
      code: "GAS",
      name: "Gas cards",
      raisedMinor: 120_000,
      supporters: 4,
      currency: "USD",
    },
  ],
  unavailableConnectionIds: [],
};

beforeEach(() => {
  setPermissions(Permission.MANAGE_FUNDS, Permission.VIEW_FUNDS);
  funds = [fund()];
  queryData.clear();
  queryData.set(JSON.stringify(fundKeys.settings()), {
    notifyFundManagers: true,
  });
  queryData.set(JSON.stringify(fundKeys.providerFunds()), PROVIDER_FUNDS);
  setConnections([
    connection(),
    connection({ id: CONN_2, keyHint: "z9y8", webhookRegistered: false }),
  ]);
  mockCreate.mockClear();
  mockUpdate.mockClear();
  mockAdjust.mockClear();
  mockUpdateSettings.mockClear();
  mockSaveConnection.mockClear();
  mockRemoveConnection.mockClear();
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

  it("shows the unavailable marker when a linked fund's raised total cannot be read", () => {
    funds = [
      fund({
        providerLink: { connectionId: CONN, externalFundId: "gb-fund-1" },
        raised: { kind: "unavailable" },
        available: { kind: "unavailable" },
      }),
    ];
    const { container } = render(FundsSection);

    expect(container.textContent).toContain(
      m.fund_balance_raised_unavailable(),
    );
  });

  it("marks a deactivated fund in words", () => {
    funds = [fund({ isActive: false })];
    const { container } = render(FundsSection);

    expect(container.textContent).toContain(m.admin_status_inactive());
  });

  it("shows the day a fund was created in its edit sheet", async () => {
    render(FundsSection);

    await fireEvent.click(screen.getByText("Groceries"));

    const created = screen.getByText(
      m.admin_funds_created_on({
        date: formatShortDate("2026-09-01T12:00:00.000Z"),
      }),
    );
    expect(created).toBeTruthy();
    expect(created.getAttribute("datetime")).toBe("2026-09-01T12:00:00.000Z");
  });

  it("shows no creation date while adding a fund", async () => {
    render(FundsSection);

    await fireEvent.click(
      screen.getByRole("button", { name: m.admin_funds_add() }),
    );

    expect(
      screen.queryByText(
        m.admin_funds_created_on({
          date: formatShortDate("2026-09-01T12:00:00.000Z"),
        }),
      ),
    ).toBeNull();
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

  it("writes the chosen provider fund into the sealed payload", async () => {
    render(FundsSection);

    await fireEvent.click(
      screen.getByRole("button", { name: m.admin_funds_add() }),
    );
    await fireEvent.input(
      screen.getByPlaceholderText(m.admin_funds_name_placeholder()),
      { target: { value: "Gas" } },
    );
    await fireEvent.input(
      screen.getByPlaceholderText(m.admin_funds_currency_placeholder()),
      { target: { value: "usd" } },
    );
    await fireEvent.change(screen.getByRole("combobox"), {
      target: { value: `${CONN}:gb-fund-1` },
    });
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
    const input = mockCreate.mock.calls[0]?.[0] ?? {};
    expect(String(input.encryptedPayload)).toContain(
      `"providerLink":{"connectionId":"${CONN}","externalFundId":"gb-fund-1"}`,
    );
  });

  it("unlinks a fund when Not linked is chosen", async () => {
    funds = [
      fund({
        providerLink: { connectionId: CONN, externalFundId: "gb-fund-1" },
        raised: { kind: "amount", minor: 120_000 },
        available: { kind: "amount", minor: 155_000 },
      }),
    ];
    render(FundsSection);

    await fireEvent.click(screen.getByText("Groceries"));
    await fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "" },
    });
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
    const input = mockUpdate.mock.calls[0]?.[0] ?? {};
    expect(String(input.encryptedPayload)).toContain('"providerLink":null');
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

  it("shows each donation connection with its key hint and webhook state", () => {
    const { container } = render(FundsSection);
    const text = container.textContent;

    expect(text).toContain(m.admin_donations_title());
    expect(text).toContain(m.admin_donations_key_ending({ hint: "a1b2" }));
    expect(text).toContain(m.admin_donations_key_ending({ hint: "z9y8" }));
    expect(
      screen.getByText(m.admin_donations_webhook_registered()),
    ).toBeTruthy();
    expect(
      screen.getByText(m.admin_donations_webhook_not_registered()),
    ).toBeTruthy();
    const removeNames = screen
      .getAllByRole("button", {
        name: (name) => name.startsWith(m.admin_donations_remove()),
      })
      .map((button) => button.getAttribute("aria-label"));
    expect(removeNames).toEqual([
      `${m.admin_donations_remove()} ${m.admin_donations_key_ending({ hint: "a1b2" })}`,
      `${m.admin_donations_remove()} ${m.admin_donations_key_ending({ hint: "z9y8" })}`,
    ]);
  });

  it("hides the donation providers block without fund management", () => {
    setPermissions(Permission.VIEW_FUNDS);
    const { container } = render(FundsSection);
    const text = container.textContent;

    expect(text).not.toContain(m.admin_donations_title());
    expect(text).not.toContain(m.admin_donations_connect_givebutter());
  });

  it("saves the typed API key and never shows it afterwards", async () => {
    const { container } = render(FundsSection);

    await fireEvent.click(
      screen.getByRole("button", {
        name: m.admin_donations_connect_givebutter(),
      }),
    );
    const keyInput = container.querySelector('input[type="password"]');
    expect(keyInput).toBeInstanceOf(HTMLInputElement);
    if (!(keyInput instanceof HTMLInputElement)) return;
    await fireEvent.input(keyInput, { target: { value: API_KEY } });
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(mockSaveConnection).toHaveBeenCalledWith({ apiKey: API_KEY });
    });
    await waitFor(() => {
      expect(mockToastShow).toHaveBeenCalledWith(
        m.admin_donations_connection_saved(),
      );
    });
    expect(container.textContent).not.toContain(API_KEY);
    for (const input of container.querySelectorAll("input")) {
      expect(input.value).not.toBe(API_KEY);
    }
    expect(mockToastShow.mock.calls.flat()).not.toContain(API_KEY);
  });

  it("removes a connection after the confirm", async () => {
    setConnections([connection()]);
    render(FundsSection);

    await fireEvent.click(
      screen.getByRole("button", {
        name: `${m.admin_donations_remove()} ${m.admin_donations_key_ending({ hint: "a1b2" })}`,
      }),
    );
    const dialog = screen.getByTestId("stub-dialog");
    expect(dialog.textContent).toContain(m.admin_donations_remove_confirm());
    expect(dialog.textContent).toContain(
      m.admin_donations_remove_webhook_note(),
    );
    await fireEvent.click(
      within(dialog).getByRole("button", { name: m.admin_donations_remove() }),
    );

    await waitFor(() => {
      expect(mockRemoveConnection).toHaveBeenCalledWith({ connectionId: CONN });
    });
  });

  it("keeps the connection when the confirm is cancelled", async () => {
    setConnections([connection()]);
    render(FundsSection);

    await fireEvent.click(
      screen.getByRole("button", {
        name: `${m.admin_donations_remove()} ${m.admin_donations_key_ending({ hint: "a1b2" })}`,
      }),
    );
    await fireEvent.click(
      within(screen.getByTestId("stub-dialog")).getByRole("button", {
        name: m.common_cancel(),
      }),
    );

    expect(screen.queryByTestId("stub-dialog")).toBeNull();
    expect(mockRemoveConnection).not.toHaveBeenCalled();
  });
});

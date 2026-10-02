// @vitest-environment jsdom
/**
 * DisbursementSheet tests: recording is one recordDisbursement call that
 * carries the ledger entry, the next sealed balance and the case note;
 * correcting is one reviseDisbursement call with a reversal, a
 * replacement, the balance and the rewritten note. Neither path writes
 * a reversal through recordDisbursement or edits the note separately.
 * Every sealed ledger payload names the case and its case record.
 *
 * The fund cache, the case fund and the balance writer are stubs, so no
 * query or Worker runs. The writer stub records the delta it was given
 * and hands the write a fixed balance.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/svelte";
import { followupSlot } from "@care-y/crypto";
import {
  ErrorCode,
  NOTE_ENVELOPE_MARKER,
  followupIdSchema,
  fundIdSchema,
  newFundLedgerId,
  ticketIdSchema,
  userIdSchema,
  type DisbursementNoteEnvelope,
} from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import { formatAmount } from "$lib/funds/fund-display.js";
import DisbursementSheet from "./DisbursementSheet.svelte";
import type * as ErrorsNS from "$lib/errors.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as ShellSheetNS from "$lib/shell/ShellSheet.svelte";
import type * as FundStoreNS from "$lib/funds/fund-store.svelte.js";
import type {
  BalanceWrite,
  BalanceWriter,
  CaseFund,
  FundStore,
  FundView,
} from "$lib/funds/fund-store.svelte.js";

const FUND = fundIdSchema.parse(globalThis.crypto.randomUUID());
const USER = userIdSchema.parse(globalThis.crypto.randomUUID());
const TICKET = ticketIdSchema.parse(globalThis.crypto.randomUUID());
const EDITED = followupIdSchema.parse(globalThis.crypto.randomUUID());

/** The ledger payload inside the stub sealer's `sealed:` ciphertext. */
function sealedLedger(ciphertext: unknown): Record<string, unknown> {
  const text = String(ciphertext);
  expect(text.startsWith("sealed:")).toBe(true);
  return JSON.parse(text.slice("sealed:".length)) as Record<string, unknown>;
}

const { mockEncrypt, mockRecord, mockRevise, mockWrite, mockDeleteByPrefix } =
  vi.hoisted(() => ({
    mockEncrypt: vi
      .fn<(ticketId: string, slot: string, text: string) => Promise<string>>()
      .mockResolvedValue("sealed-note"),
    mockRecord: vi
      .fn<(input: Record<string, unknown>) => Promise<unknown>>()
      .mockResolvedValue({}),
    mockRevise: vi
      .fn<(input: Record<string, unknown>) => Promise<unknown>>()
      .mockResolvedValue({}),
    mockWrite: vi.fn<(fundId: string, deltaMinor: number) => void>(),
    mockDeleteByPrefix: vi.fn<(prefix: string) => void>(),
  }));

let funds: FundView[] = [];
let caseFund: CaseFund = { fundId: null, fund: undefined };

const toastShowSpy = vi
  .spyOn(toastStore, "show")
  .mockImplementation(() => undefined);

vi.mock("$lib/funds/fund-store.svelte.js", async (importOriginal) => ({
  ...(await importOriginal<typeof FundStoreNS>()),
  createFundStore: (): Pick<FundStore, "activeFunds" | "fund"> => ({
    get activeFunds() {
      return funds.filter((f) => f.isActive);
    },
    fund: (id: string) => funds.find((f) => f.id === id),
  }),
  createCaseFund: (): CaseFund => caseFund,
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
        expectedVersion: 7,
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
      recordDisbursement: { mutate: mockRecord },
      reviseDisbursement: { mutate: mockRevise },
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
  getCryptoBridge: () => ({ encrypt: mockEncrypt }),
  getOrgKeyManager: () => ({
    encryptText: (plaintext: string) => Promise.resolve(`sealed:${plaintext}`),
  }),
  getFollowUpDecryptCache: () => ({ deleteByPrefix: mockDeleteByPrefix }),
  getCurrentUserId: () => () => USER,
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
  (await import("$mocks/with-terms.js")).withTermsMock(
    await importOriginal<typeof WithTermsNS>(),
  ),
);

vi.mock(
  "$lib/shell/ShellSheet.svelte",
  async () =>
    ({
      default: (await import("./test-helpers/PassthroughShell.svelte"))
        .default as unknown as (typeof ShellSheetNS)["default"],
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

function fund(
  balanceMinor: number,
  overrides: Partial<FundView> = {},
): FundView {
  return {
    id: FUND,
    name: "Transit and gas",
    currency: "USD",
    providerLink: null,
    isActive: true,
    sortOrder: 0,
    orgKeyGeneration: 1,
    balance: { balanceMinor, version: 7 },
    raised: { kind: "unlinked" },
    available: { kind: "amount", minor: balanceMinor },
    ...overrides,
  };
}

const LINK = { connectionId: "c-1", externalFundId: "gb-1" };

function amountInput(): HTMLElement {
  return screen.getByPlaceholderText(m.fund_amount_placeholder());
}

function noteInput(): HTMLElement {
  return screen.getByPlaceholderText(m.assist_note_placeholder());
}

beforeEach(() => {
  funds = [fund(20_000)];
  caseFund = { fundId: FUND, fund: funds[0] };
  mockEncrypt.mockClear();
  mockRecord.mockReset().mockResolvedValue({});
  mockRevise.mockReset().mockResolvedValue({});
  mockWrite.mockClear();
  mockDeleteByPrefix.mockClear();
  toastShowSpy.mockClear();
});

afterEach(cleanup);

describe("DisbursementSheet (record)", () => {
  const props = { opened: true, ondismiss: vi.fn(), ticketId: TICKET };

  it("shows the preselected fund's balance", () => {
    render(DisbursementSheet, { props });

    expect(
      screen.getByText(
        m.fund_available_amount({ amount: formatAmount(20_000, "USD") }),
      ),
    ).toBeTruthy();
  });

  it("records the entry, the balance and the case note in one call", async () => {
    const ondismiss = vi.fn();
    render(DisbursementSheet, { props: { ...props, ondismiss } });

    await fireEvent.input(amountInput(), { target: { value: "25.50" } });
    await fireEvent.input(noteInput(), { target: { value: "Bus pass" } });
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(mockRecord).toHaveBeenCalledTimes(1);
    });
    // The funds stub carries no note type procedure: the save makes no
    // call besides the record itself.
    expect(mockRevise).not.toHaveBeenCalled();
    expect(mockWrite).toHaveBeenCalledWith(FUND, -2_550);

    const input = mockRecord.mock.calls[0]?.[0] ?? {};
    expect(input.balance).toEqual({
      fundId: FUND,
      encryptedBalance: "sealed-balance",
      expectedVersion: 7,
      orgKeyGeneration: 1,
    });
    const sealedEntry = String(input.encryptedPayload);
    expect(sealedEntry).toContain('"entryType":"disbursement"');
    expect(sealedEntry).toContain('"amountMinor":-2550');

    const caseNote = input.caseNote as Record<string, unknown>;
    expect(caseNote).toMatchObject({
      ticketId: TICKET,
      encryptedContent: "sealed-note",
    });
    // The sealed entry names this case and the case record it writes.
    expect(sealedLedger(input.encryptedPayload)).toMatchObject({
      ticketId: TICKET,
      followUpId: caseNote.followUpId,
    });
    // The note is encrypted under the slot of the follow-up id sent.
    const [ticketId, slot, content] = mockEncrypt.mock.calls[0] ?? [];
    expect(ticketId).toBe(TICKET);
    expect(slot).toBe(followupSlot(String(caseNote.followUpId)));
    expect(content?.startsWith(NOTE_ENVELOPE_MARKER)).toBe(true);
    expect(content).toContain(String(input.id));
    // Plaintext never crosses the tRPC wire.
    expect(JSON.stringify(input)).not.toContain("Bus pass");

    await waitFor(() => {
      expect(ondismiss).toHaveBeenCalled();
    });
    expect(toastShowSpy).toHaveBeenCalledWith(m.assist_saved());
  });

  it("warns softly when the entry takes the fund below zero", async () => {
    funds = [fund(1_000)];
    caseFund = { fundId: FUND, fund: funds[0] };
    render(DisbursementSheet, { props });

    await fireEvent.input(amountInput(), { target: { value: "25" } });

    expect(
      screen.getByText(
        m.assist_below_zero({
          fund: "Transit and gas",
          amount: formatAmount(-1_500, "USD"),
        }),
      ),
    ).toBeTruthy();
    // A warning, never a block.
    expect(
      screen
        .getByRole("button", { name: m.common_save() })
        .hasAttribute("disabled"),
    ).toBe(false);
  });

  it("shows the available figure including what the provider raised", () => {
    funds = [
      fund(1_000, {
        providerLink: LINK,
        raised: { kind: "amount", minor: 9_000 },
        available: { kind: "amount", minor: 10_000 },
      }),
    ];
    caseFund = { fundId: FUND, fund: funds[0] };
    render(DisbursementSheet, { props });

    expect(
      screen.getByText(
        m.fund_available_amount({ amount: formatAmount(10_000, "USD") }),
      ),
    ).toBeTruthy();
  });

  it("says the raised total is unavailable and previews no dip below zero", async () => {
    funds = [
      fund(1_000, {
        providerLink: LINK,
        raised: { kind: "unavailable" },
        available: { kind: "unavailable" },
      }),
    ];
    caseFund = { fundId: FUND, fund: funds[0] };
    const { container } = render(DisbursementSheet, { props });

    expect(screen.getByText(m.fund_balance_raised_unavailable())).toBeTruthy();

    await fireEvent.input(amountInput(), { target: { value: "5000" } });

    expect(container.textContent).not.toContain(formatAmount(-499_000, "USD"));
    expect(container.querySelector(".disbursement-balance-below")).toBeNull();
    // The write path is unchanged: the delta still reaches the writer.
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );
    await waitFor(() => {
      expect(mockWrite).toHaveBeenCalledWith(FUND, -500_000);
    });
  });

  it("keeps the sheet open and says why when the write fails", async () => {
    const ondismiss = vi.fn();
    mockRecord.mockRejectedValue(new Error(ErrorCode.FUND_BALANCE_STALE));
    render(DisbursementSheet, { props: { ...props, ondismiss } });

    await fireEvent.input(amountInput(), { target: { value: "5" } });
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_save() }),
    );

    await waitFor(() => {
      expect(toastShowSpy).toHaveBeenCalledWith(
        m.error_fund_balance_stale(),
        3000,
      );
    });
    expect(ondismiss).not.toHaveBeenCalled();
  });
});

describe("DisbursementSheet (correct)", () => {
  const ledgerEntryId = newFundLedgerId();
  const envelope: DisbursementNoteEnvelope = {
    v: 1,
    kind: "disbursement",
    ledgerEntryId,
    fundId: FUND,
    amountMinor: 5_000,
    currency: "USD",
    note: "Gas card",
  };
  const props = {
    opened: true,
    ondismiss: vi.fn(),
    ticketId: TICKET,
    edit: { followUpId: EDITED, envelope },
  };

  it("prefills the amount and note", () => {
    render(DisbursementSheet, { props });

    expect((amountInput() as HTMLInputElement).value).toBe("50.00");
    expect((noteInput() as HTMLTextAreaElement).value).toBe("Gas card");
  });

  it("sends the reversal, replacement, balance and note in one call", async () => {
    render(DisbursementSheet, { props });

    await fireEvent.input(amountInput(), { target: { value: "35" } });
    await fireEvent.click(
      screen.getByRole("button", { name: m.common_update() }),
    );

    await waitFor(() => {
      expect(mockRevise).toHaveBeenCalledTimes(1);
    });
    // No reversal goes through recordDisbursement.
    expect(mockRecord).not.toHaveBeenCalled();
    // 50.00 back, 35.00 out.
    expect(mockWrite).toHaveBeenCalledWith(FUND, 1_500);

    const input = mockRevise.mock.calls[0]?.[0] ?? {};
    const reversal = input.reversal as Record<string, unknown>;
    const replacement = input.replacement as Record<string, unknown>;
    expect(String(reversal.encryptedPayload)).toContain(
      `"reversesId":"${ledgerEntryId}"`,
    );
    expect(String(reversal.encryptedPayload)).toContain('"amountMinor":5000');
    expect(String(replacement.encryptedPayload)).toContain(
      '"amountMinor":-3500',
    );
    expect(input.balance).toMatchObject({ fundId: FUND, expectedVersion: 7 });
    expect(input.caseNote).toMatchObject({
      followUpId: EDITED,
      ticketId: TICKET,
      encryptedContent: "sealed-note",
    });
    // Both sealed entries name this case and the case record revised.
    for (const row of [reversal, replacement]) {
      expect(sealedLedger(row.encryptedPayload)).toMatchObject({
        ticketId: TICKET,
        followUpId: EDITED,
      });
    }

    // The rewritten note names the replacement entry.
    const content = mockEncrypt.mock.calls[0]?.[2] ?? "";
    expect(mockEncrypt.mock.calls[0]?.[1]).toBe(followupSlot(EDITED));
    expect(content).toContain(String(replacement.id));
    expect(content).not.toContain(ledgerEntryId);

    await waitFor(() => {
      expect(mockDeleteByPrefix).toHaveBeenCalledWith(EDITED);
    });
  });

  it("keeps a correction in the entry's fund", () => {
    render(DisbursementSheet, { props });

    expect(screen.getByText(m.assist_edit_fund_fixed())).toBeTruthy();
  });
});

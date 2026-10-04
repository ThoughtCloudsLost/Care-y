// @vitest-environment jsdom
/**
 * FundHistoryList tests: one row per ledger entry with its type, signed
 * amount and recorder, a word badge on entries a correction cancelled,
 * the empty state, and activatable rows for entries whose sealed payload
 * names a case.
 *
 * The volunteers query and the org decrypt cache are stubbed so the
 * recorder's name resolves without a Worker.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import {
  followupIdSchema,
  fundIdSchema,
  newFundLedgerId,
  ticketIdSchema,
  userIdSchema,
  type FundLedgerPayload,
} from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import { formatAmount } from "$lib/funds/fund-display.js";
import { formatShortDate } from "$lib/utils/time.js";
import type { LedgerEntryView } from "$lib/funds/fund-store.svelte.js";
import FundHistoryList from "./FundHistoryList.svelte";
import type * as ErrorsNS from "$lib/errors.js";
import type * as ContextNS from "$lib/crypto/context.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as QueriesNS from "$lib/tickets/queries.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";

const FUND = fundIdSchema.parse(globalThis.crypto.randomUUID());
const KNOWN_USER = userIdSchema.parse(globalThis.crypto.randomUUID());
const UNKNOWN_USER = userIdSchema.parse(globalThis.crypto.randomUUID());
const TICKET = ticketIdSchema.parse(globalThis.crypto.randomUUID());
const FOLLOW_UP = followupIdSchema.parse(globalThis.crypto.randomUUID());
const CASE_POINTER = { ticketId: TICKET, followUpId: FOLLOW_UP };

let volunteersState: { data: unknown } = { data: undefined };

vi.mock("$lib/tickets/queries.js", async (importOriginal) => ({
  ...(await importOriginal<typeof QueriesNS>()),
  createVolunteersQuery: () => volunteersState,
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    tickets: {
      listVolunteers: { query: vi.fn().mockResolvedValue([]) },
    },
  },
}));

// vi.mock required: withTerms calls getContext, and no terminology
// context is set outside the app shell.
vi.mock("$lib/terminology/with-terms.js", async (importOriginal) => ({
  ...(await importOriginal<typeof WithTermsNS>()),
  withTerms: () => ({ ticket: "case", Ticket: "Case" }),
}));

vi.mock("$lib/errors.js", async (importOriginal) =>
  (await import("$mocks/errors.js")).errorsMock(
    await importOriginal<typeof ErrorsNS>(),
  ),
);

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ContextNS>()),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn((key: string) =>
      key === `volunteer:${KNOWN_USER}` ? "Robin" : null,
    ),
  }),
}));

function entry(
  amountMinor: number,
  entryType: FundLedgerPayload["entryType"],
  overrides: Partial<FundLedgerPayload> = {},
): LedgerEntryView {
  return {
    id: newFundLedgerId(),
    entryDate: "2026-09-15",
    payload: {
      v: 1,
      amountMinor,
      entryType,
      fundId: FUND,
      recordedAt: "2026-09-15T10:30:00.000Z",
      recordedBy: KNOWN_USER,
      ...overrides,
    },
  };
}

beforeEach(() => {
  volunteersState = {
    data: [{ id: KNOWN_USER, encryptedDisplayName: "sealed-name" }],
  };
});

afterEach(() => {
  cleanup();
});

describe("FundHistoryList", () => {
  it("shows the empty state when the fund has no entries", () => {
    render(FundHistoryList, {
      props: {
        entries: [],
        currency: "USD",
        reversedIds: new Set<string>(),
        onticketopen: vi.fn(),
      },
    });
    expect(screen.getByText(m.fund_history_empty())).toBeTruthy();
  });

  it("labels each entry by type and shows its signed amount", () => {
    const entries = [
      entry(50_000, "adjustment"),
      entry(-1_250, "disbursement"),
    ];
    render(FundHistoryList, {
      props: {
        entries,
        currency: "USD",
        reversedIds: new Set<string>(),
        onticketopen: vi.fn(),
      },
    });

    expect(screen.getByText(m.fund_entry_adjustment())).toBeTruthy();
    expect(screen.getByText(m.fund_entry_disbursement())).toBeTruthy();
    expect(screen.getByText(formatAmount(50_000, "USD"))).toBeTruthy();
    expect(screen.getByText(formatAmount(-1_250, "USD"))).toBeTruthy();
    expect(screen.queryByText(m.fund_history_empty())).toBeNull();
  });

  it("names the recorder through the volunteer list", () => {
    render(FundHistoryList, {
      props: {
        entries: [entry(-500, "disbursement")],
        currency: "USD",
        reversedIds: new Set<string>(),
        onticketopen: vi.fn(),
      },
    });
    expect(screen.getByText(m.fund_entry_by({ name: "Robin" }))).toBeTruthy();
  });

  it("falls back to the generic volunteer label for an unknown recorder", () => {
    render(FundHistoryList, {
      props: {
        entries: [entry(-500, "disbursement", { recordedBy: UNKNOWN_USER })],
        currency: "USD",
        reversedIds: new Set<string>(),
        onticketopen: vi.fn(),
      },
    });
    expect(
      screen.getByText(
        m.fund_entry_by({ name: m.ticket_system_volunteer_fallback() }),
      ),
    ).toBeTruthy();
  });

  it("badges only the entries a correction cancelled", () => {
    const cancelled = entry(-1_250, "disbursement");
    const reversal = entry(1_250, "reversal", { reversesId: cancelled.id });
    const untouched = entry(-300, "disbursement");
    render(FundHistoryList, {
      props: {
        entries: [reversal, cancelled, untouched],
        currency: "USD",
        reversedIds: new Set<string>([cancelled.id]),
        onticketopen: vi.fn(),
      },
    });

    expect(screen.getByText(m.fund_entry_reversal())).toBeTruthy();
    expect(screen.getAllByText(m.fund_entry_reversed())).toHaveLength(1);
  });

  it("stamps each row with a machine-readable time", () => {
    const { container } = render(FundHistoryList, {
      props: {
        entries: [entry(-500, "disbursement")],
        currency: "USD",
        reversedIds: new Set<string>(),
        onticketopen: vi.fn(),
      },
    });
    const time = container.querySelector("time");
    expect(time?.getAttribute("datetime")).toBe("2026-09-15T10:30:00.000Z");
    expect(time?.textContent.trim()).toBe(
      formatShortDate("2026-09-15T10:30:00.000Z"),
    );
  });

  describe("case pointer", () => {
    const onCaseLine = (): string =>
      `${m.fund_entry_by({ name: "Robin" })} · ${m.fund_entry_on_case(withTerms())}`;

    it("makes an entry that names a case an activatable row", () => {
      render(FundHistoryList, {
        props: {
          entries: [entry(-500, "disbursement", CASE_POINTER)],
          currency: "USD",
          reversedIds: new Set<string>(),
          onticketopen: vi.fn(),
        },
      });
      const row = screen.getByRole("button");
      expect(row.getAttribute("tabindex")).toBe("0");
      expect(screen.getByText(onCaseLine())).toBeTruthy();
    });

    it("opens the case on click", async () => {
      const onticketopen = vi.fn();
      render(FundHistoryList, {
        props: {
          entries: [entry(-500, "disbursement", CASE_POINTER)],
          currency: "USD",
          reversedIds: new Set<string>(),
          onticketopen,
        },
      });
      await fireEvent.click(screen.getByRole("button"));
      expect(onticketopen).toHaveBeenCalledWith(TICKET);
    });

    it("opens the case on Enter", async () => {
      const onticketopen = vi.fn();
      render(FundHistoryList, {
        props: {
          entries: [entry(-500, "disbursement", CASE_POINTER)],
          currency: "USD",
          reversedIds: new Set<string>(),
          onticketopen,
        },
      });
      await fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
      expect(onticketopen).toHaveBeenCalledWith(TICKET);
    });

    it("leaves an entry without a case inert, with no case meta", () => {
      const { container } = render(FundHistoryList, {
        props: {
          entries: [entry(50_000, "adjustment")],
          currency: "USD",
          reversedIds: new Set<string>(),
          onticketopen: vi.fn(),
        },
      });
      expect(screen.queryAllByRole("button")).toHaveLength(0);
      expect(container.querySelector("[tabindex]")).toBeNull();
      expect(
        screen.queryByText(m.fund_entry_on_case(withTerms()), {
          exact: false,
        }),
      ).toBeNull();
      expect(screen.getByText(m.fund_entry_by({ name: "Robin" }))).toBeTruthy();
    });

    it("keeps the badge and the activation on a reversed entry", async () => {
      const onticketopen = vi.fn();
      const cancelled = entry(-500, "disbursement", CASE_POINTER);
      render(FundHistoryList, {
        props: {
          entries: [cancelled],
          currency: "USD",
          reversedIds: new Set<string>([cancelled.id]),
          onticketopen,
        },
      });
      expect(screen.getByText(m.fund_entry_reversed())).toBeTruthy();
      const row = screen.getByRole("button");
      expect(row.getAttribute("tabindex")).toBe("0");
      await fireEvent.click(row);
      expect(onticketopen).toHaveBeenCalledWith(TICKET);
    });
  });
});

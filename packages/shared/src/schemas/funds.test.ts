import { describe, it, expect } from "vitest";
import {
  createFundInputSchema,
  updateFundInputSchema,
  recordDisbursementInputSchema,
  recordAdjustmentInputSchema,
  reviseDisbursementInputSchema,
  setFundBalanceInputSchema,
  updateFundSettingsInputSchema,
  currencyCodeSchema,
  fundPayloadSchema,
  fundBalancePayloadSchema,
  fundLedgerPayloadSchema,
  disbursementNoteEnvelopeSchema,
  NOTE_ENVELOPE_MARKER,
  hasNoteEnvelopeMarker,
  encodeNoteEnvelope,
  decodeNoteEnvelope,
  type DisbursementNoteEnvelope,
} from "./funds.js";
import {
  fundIdSchema,
  fundLedgerIdSchema,
  newFundLedgerId,
  userIdSchema,
} from "../ids.js";

const FUND_ID = fundIdSchema.parse("550e8400-e29b-41d4-a716-446655440000");
const USER_ID = userIdSchema.parse("660e8400-e29b-41d4-a716-446655440001");
const LEDGER_ID = fundLedgerIdSchema.parse(
  "770e8400-e29b-41d4-a716-446655440002",
);
const TICKET_ID = "880e8400-e29b-41d4-a716-446655440003";
const FOLLOWUP_ID = "990e8400-e29b-41d4-a716-446655440004";
const B64 = "AQIDBA==";
const RECORDED_AT = "2026-09-30T12:00:00.000Z";
const BALANCE = {
  fundId: FUND_ID,
  encryptedBalance: B64,
  expectedVersion: 3,
  orgKeyGeneration: 1,
};
const CASE_NOTE = {
  followUpId: FOLLOWUP_ID,
  ticketId: TICKET_ID,
  encryptedContent: B64,
};

function envelope(
  overrides: Partial<DisbursementNoteEnvelope> = {},
): DisbursementNoteEnvelope {
  return {
    v: 1,
    kind: "disbursement",
    ledgerEntryId: LEDGER_ID,
    fundId: FUND_ID,
    amountMinor: -2500,
    currency: "USD",
    note: "Bus fare for the appointment",
    ...overrides,
  };
}

describe("fund input schemas", () => {
  it("createFundInputSchema accepts a base64 payload and sealed balance", () => {
    expect(
      createFundInputSchema.safeParse({
        encryptedPayload: B64,
        encryptedBalance: B64,
      }).success,
    ).toBe(true);
  });

  it("createFundInputSchema rejects a fund without a sealed balance", () => {
    expect(
      createFundInputSchema.safeParse({ encryptedPayload: B64 }).success,
    ).toBe(false);
  });

  it("createFundInputSchema rejects a non-base64 payload", () => {
    expect(
      createFundInputSchema.safeParse({
        encryptedPayload: "not base64!",
        encryptedBalance: B64,
      }).success,
    ).toBe(false);
  });

  it("updateFundInputSchema accepts isActive alone", () => {
    expect(
      updateFundInputSchema.safeParse({ fundId: FUND_ID, isActive: false })
        .success,
    ).toBe(true);
  });

  it("updateFundInputSchema rejects a non-uuid fundId", () => {
    expect(
      updateFundInputSchema.safeParse({ fundId: "abc", isActive: true })
        .success,
    ).toBe(false);
  });

  it("recordDisbursementInputSchema accepts an entry without a case note", () => {
    expect(
      recordDisbursementInputSchema.safeParse({
        id: newFundLedgerId(),
        encryptedPayload: B64,
        balance: BALANCE,
      }).success,
    ).toBe(true);
  });

  it("recordDisbursementInputSchema accepts an entry with a case note", () => {
    expect(
      recordDisbursementInputSchema.safeParse({
        id: newFundLedgerId(),
        encryptedPayload: B64,
        balance: BALANCE,
        caseNote: CASE_NOTE,
      }).success,
    ).toBe(true);
  });

  it("recordDisbursementInputSchema rejects an entry without a balance", () => {
    expect(
      recordDisbursementInputSchema.safeParse({
        id: newFundLedgerId(),
        encryptedPayload: B64,
      }).success,
    ).toBe(false);
  });

  it("recordDisbursementInputSchema rejects a case note missing its ticket", () => {
    expect(
      recordDisbursementInputSchema.safeParse({
        id: newFundLedgerId(),
        encryptedPayload: B64,
        balance: BALANCE,
        caseNote: { followUpId: FOLLOWUP_ID, encryptedContent: B64 },
      }).success,
    ).toBe(false);
  });

  it("recordAdjustmentInputSchema requires a uuid id", () => {
    expect(
      recordAdjustmentInputSchema.safeParse({
        id: "not-a-uuid",
        encryptedPayload: B64,
        balance: BALANCE,
      }).success,
    ).toBe(false);
  });

  it("recordAdjustmentInputSchema requires a balance", () => {
    expect(
      recordAdjustmentInputSchema.safeParse({
        id: newFundLedgerId(),
        encryptedPayload: B64,
      }).success,
    ).toBe(false);
  });

  it("setFundBalanceInputSchema accepts version zero", () => {
    expect(
      setFundBalanceInputSchema.safeParse({
        balance: { ...BALANCE, expectedVersion: 0 },
      }).success,
    ).toBe(true);
  });

  it.each([-1, 1.5, "3"])(
    "setFundBalanceInputSchema rejects expectedVersion %j",
    (expectedVersion) => {
      expect(
        setFundBalanceInputSchema.safeParse({
          balance: { ...BALANCE, expectedVersion },
        }).success,
      ).toBe(false);
    },
  );

  it("setFundBalanceInputSchema rejects a bare balance without its wrapper", () => {
    expect(setFundBalanceInputSchema.safeParse(BALANCE).success).toBe(false);
  });

  it("setFundBalanceInputSchema accepts a resealed fund payload", () => {
    expect(
      setFundBalanceInputSchema.safeParse({
        balance: { ...BALANCE, orgKeyGeneration: 2, encryptedPayload: B64 },
      }).success,
    ).toBe(true);
  });

  it.each([0, 1.5, "1", undefined])(
    "setFundBalanceInputSchema rejects orgKeyGeneration %j",
    (orgKeyGeneration) => {
      expect(
        setFundBalanceInputSchema.safeParse({
          balance: { ...BALANCE, orgKeyGeneration },
        }).success,
      ).toBe(false);
    },
  );

  it("setFundBalanceInputSchema rejects a non-base64 resealed payload", () => {
    expect(
      setFundBalanceInputSchema.safeParse({
        balance: { ...BALANCE, encryptedPayload: "not base64!" },
      }).success,
    ).toBe(false);
  });

  it("reviseDisbursementInputSchema accepts two entries, a balance and a note", () => {
    expect(
      reviseDisbursementInputSchema.safeParse({
        reversal: { id: newFundLedgerId(), encryptedPayload: B64 },
        replacement: { id: newFundLedgerId(), encryptedPayload: B64 },
        balance: BALANCE,
        caseNote: CASE_NOTE,
      }).success,
    ).toBe(true);
  });

  it("reviseDisbursementInputSchema rejects a revision without its case note", () => {
    expect(
      reviseDisbursementInputSchema.safeParse({
        reversal: { id: newFundLedgerId(), encryptedPayload: B64 },
        replacement: { id: newFundLedgerId(), encryptedPayload: B64 },
        balance: BALANCE,
      }).success,
    ).toBe(false);
  });

  it("reviseDisbursementInputSchema rejects one id used for both entries", () => {
    const id = newFundLedgerId();
    expect(
      reviseDisbursementInputSchema.safeParse({
        reversal: { id, encryptedPayload: B64 },
        replacement: { id, encryptedPayload: B64 },
        balance: BALANCE,
        caseNote: CASE_NOTE,
      }).success,
    ).toBe(false);
  });

  it("updateFundSettingsInputSchema requires a boolean", () => {
    expect(
      updateFundSettingsInputSchema.safeParse({ notifyFundManagers: false })
        .success,
    ).toBe(true);
    expect(
      updateFundSettingsInputSchema.safeParse({ notifyFundManagers: "no" })
        .success,
    ).toBe(false);
  });
});

describe("fundBalancePayloadSchema", () => {
  it.each([0, 12500, -300])("accepts balanceMinor %d", (balanceMinor) => {
    expect(
      fundBalancePayloadSchema.safeParse({ v: 1, balanceMinor }).success,
    ).toBe(true);
  });

  it.each([1.5, Number.MAX_SAFE_INTEGER + 1, "100"])(
    "rejects balanceMinor %j",
    (balanceMinor) => {
      expect(
        fundBalancePayloadSchema.safeParse({ v: 1, balanceMinor }).success,
      ).toBe(false);
    },
  );

  it("rejects an unknown version", () => {
    expect(
      fundBalancePayloadSchema.safeParse({ v: 2, balanceMinor: 0 }).success,
    ).toBe(false);
  });
});

describe("currencyCodeSchema", () => {
  it.each(["USD", "EUR", "MXN"])("accepts %s", (code) => {
    expect(currencyCodeSchema.safeParse(code).success).toBe(true);
  });

  it.each(["usd", "US", "USDX", "", "U$D"])("rejects %j", (code) => {
    expect(currencyCodeSchema.safeParse(code).success).toBe(false);
  });
});

describe("fundPayloadSchema", () => {
  it("accepts an unlinked fund", () => {
    expect(
      fundPayloadSchema.safeParse({
        v: 1,
        name: "Emergency housing",
        currency: "USD",
        providerLink: null,
      }).success,
    ).toBe(true);
  });

  it("accepts a linked fund", () => {
    expect(
      fundPayloadSchema.safeParse({
        v: 1,
        name: "Transport",
        currency: "EUR",
        providerLink: { connectionId: "conn-1", externalFundId: "camp-9" },
      }).success,
    ).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(
      fundPayloadSchema.safeParse({
        v: 1,
        name: "",
        currency: "USD",
        providerLink: null,
      }).success,
    ).toBe(false);
  });

  it("rejects a missing providerLink key", () => {
    expect(
      fundPayloadSchema.safeParse({ v: 1, name: "Food", currency: "USD" })
        .success,
    ).toBe(false);
  });

  it("rejects another version", () => {
    expect(
      fundPayloadSchema.safeParse({
        v: 2,
        name: "Food",
        currency: "USD",
        providerLink: null,
      }).success,
    ).toBe(false);
  });
});

describe("fundLedgerPayloadSchema", () => {
  const base = {
    v: 1,
    fundId: FUND_ID,
    recordedAt: RECORDED_AT,
    recordedBy: USER_ID,
  };

  it("accepts a negative disbursement", () => {
    expect(
      fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor: -1500,
        entryType: "disbursement",
      }).success,
    ).toBe(true);
  });

  it("rejects a positive disbursement", () => {
    expect(
      fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor: 1500,
        entryType: "disbursement",
      }).success,
    ).toBe(false);
  });

  it.each([10_000, -300])("accepts an adjustment of %d", (amountMinor) => {
    expect(
      fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor,
        entryType: "adjustment",
      }).success,
    ).toBe(true);
  });

  it("accepts a reversal that names the reversed entry", () => {
    expect(
      fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor: 1500,
        entryType: "reversal",
        reversesId: LEDGER_ID,
      }).success,
    ).toBe(true);
  });

  it("rejects a reversal without reversesId", () => {
    expect(
      fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor: 1500,
        entryType: "reversal",
      }).success,
    ).toBe(false);
  });

  it("rejects reversesId on a non-reversal", () => {
    expect(
      fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor: 500,
        entryType: "adjustment",
        reversesId: LEDGER_ID,
      }).success,
    ).toBe(false);
  });

  it("rejects a fractional amount", () => {
    expect(
      fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor: -12.5,
        entryType: "disbursement",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown entry type", () => {
    expect(
      fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor: -100,
        entryType: "refund",
      }).success,
    ).toBe(false);
  });

  it("rejects a non-ISO recordedAt", () => {
    expect(
      fundLedgerPayloadSchema.safeParse({
        ...base,
        recordedAt: "yesterday",
        amountMinor: -100,
        entryType: "disbursement",
      }).success,
    ).toBe(false);
  });

  describe("case pointer", () => {
    it("accepts a disbursement naming its case and case record", () => {
      expect(
        fundLedgerPayloadSchema.safeParse({
          ...base,
          amountMinor: -1500,
          entryType: "disbursement",
          ticketId: TICKET_ID,
          followUpId: FOLLOWUP_ID,
        }).success,
      ).toBe(true);
    });

    it("rejects a ticketId without a followUpId, on followUpId", () => {
      const result = fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor: -1500,
        entryType: "disbursement",
        ticketId: TICKET_ID,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const followUpIdIssues = result.error.issues.filter((i) =>
          i.path.includes("followUpId"),
        );
        expect(followUpIdIssues.length).toBeGreaterThan(0);
      }
    });

    it("rejects an adjustment that names a case", () => {
      const result = fundLedgerPayloadSchema.safeParse({
        ...base,
        amountMinor: 500,
        entryType: "adjustment",
        ticketId: TICKET_ID,
        followUpId: FOLLOWUP_ID,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const ticketIdIssues = result.error.issues.filter((i) =>
          i.path.includes("ticketId"),
        );
        expect(ticketIdIssues.length).toBeGreaterThan(0);
      }
    });

    // A revision sets the pointer on both its reversal and its replacement.
    it("accepts a reversal that carries the pointer", () => {
      expect(
        fundLedgerPayloadSchema.safeParse({
          ...base,
          amountMinor: 1500,
          entryType: "reversal",
          reversesId: LEDGER_ID,
          ticketId: TICKET_ID,
          followUpId: FOLLOWUP_ID,
        }).success,
      ).toBe(true);
    });
  });
});

describe("note envelope codec", () => {
  it("encodes with the marker as the first character", () => {
    const content = encodeNoteEnvelope(envelope());
    expect(content.charAt(0)).toBe(NOTE_ENVELOPE_MARKER);
    expect(hasNoteEnvelopeMarker(content)).toBe(true);
  });

  it("round-trips an envelope", () => {
    const original = envelope();
    expect(decodeNoteEnvelope(encodeNoteEnvelope(original))).toEqual(original);
  });

  it("round-trips an empty note", () => {
    const original = envelope({ note: "" });
    expect(decodeNoteEnvelope(encodeNoteEnvelope(original))).toEqual(original);
  });

  it("returns null for a plain note", () => {
    expect(decodeNoteEnvelope("Called the client back")).toBeNull();
    expect(hasNoteEnvelopeMarker("Called the client back")).toBe(false);
  });

  it("returns null for a plain note that happens to be JSON", () => {
    expect(decodeNoteEnvelope(JSON.stringify(envelope()))).toBeNull();
  });

  it("returns null when the marker is followed by invalid JSON", () => {
    const content = `${NOTE_ENVELOPE_MARKER}{not json`;
    expect(hasNoteEnvelopeMarker(content)).toBe(true);
    expect(decodeNoteEnvelope(content)).toBeNull();
  });

  it("returns null when the marker is followed by JSON of the wrong shape", () => {
    const content = `${NOTE_ENVELOPE_MARKER}${JSON.stringify({ v: 1, kind: "other" })}`;
    expect(decodeNoteEnvelope(content)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(decodeNoteEnvelope("")).toBeNull();
  });

  it("disbursementNoteEnvelopeSchema rejects a lowercase currency", () => {
    expect(
      disbursementNoteEnvelopeSchema.safeParse(envelope({ currency: "usd" }))
        .success,
    ).toBe(false);
  });
});

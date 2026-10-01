import { describe, it, expect, vi } from "vitest";
import {
  NOTE_ENVELOPE_MARKER,
  fundIdSchema,
  hasNoteEnvelopeMarker,
  newFundLedgerId,
  userIdSchema,
} from "@care-y/shared";
import {
  FundPayloadError,
  adjustmentPayload,
  buildBalancePayload,
  buildFundPayload,
  disbursementNoteContent,
  disbursementPayload,
  disbursementRevision,
  openBalancePayload,
  openDisbursementNote,
  openFundPayload,
  openLedgerPayload,
  recorderId,
  reversalPayload,
  sealBalancePayload,
  sealFundPayload,
  sealLedgerPayload,
  type FundSealer,
} from "./fund-payloads.js";

const FUND = fundIdSchema.parse(globalThis.crypto.randomUUID());
const USER = userIdSchema.parse(globalThis.crypto.randomUUID());
const AT = new Date("2026-09-15T10:30:00.000Z");

/** A sealer that records the plaintext and returns a fixed ciphertext. */
function recordingSealer(): FundSealer & { readonly calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    encryptText: vi.fn((plaintext: string) => {
      calls.push(plaintext);
      return Promise.resolve("sealed");
    }),
  };
}

describe("fund payload", () => {
  it("trims the name and upper-cases the currency", () => {
    expect(buildFundPayload({ name: "  Gas cards ", currency: "usd" })).toEqual(
      { v: 1, name: "Gas cards", currency: "USD", providerLink: null },
    );
  });

  it("rejects a currency that is not three letters", () => {
    expect(() => buildFundPayload({ name: "Gas", currency: "US" })).toThrow(
      FundPayloadError,
    );
  });

  it("seals the validated JSON and round-trips through open", async () => {
    const sealer = recordingSealer();
    const ciphertext = await sealFundPayload(sealer, {
      name: "Housing",
      currency: "EUR",
    });
    expect(ciphertext).toBe("sealed");
    expect(sealer.calls).toHaveLength(1);
    expect(openFundPayload(sealer.calls[0] ?? null)).toEqual({
      v: 1,
      name: "Housing",
      currency: "EUR",
      providerLink: null,
    });
  });

  it.each([null, "", "not json", '{"v":1}', '{"v":2,"name":"x"}'])(
    "opens %j as unreadable",
    (plaintext) => {
      expect(openFundPayload(plaintext)).toBeNull();
    },
  );
});

describe("balance payload", () => {
  it("seals a signed balance and opens it back", async () => {
    const sealer = recordingSealer();
    await sealBalancePayload(sealer, -1_250);
    expect(openBalancePayload(sealer.calls[0] ?? null)).toEqual({
      v: 1,
      balanceMinor: -1_250,
    });
  });

  it("seals zero for a new fund", async () => {
    const sealer = recordingSealer();
    await sealBalancePayload(sealer, 0);
    expect(openBalancePayload(sealer.calls[0] ?? null)?.balanceMinor).toBe(0);
  });

  it.each([1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 2])(
    "rejects %j before sealing",
    (value) => {
      expect(() => buildBalancePayload(value)).toThrow(FundPayloadError);
    },
  );

  it.each([null, "", "{", '{"v":1}', '{"v":1,"balanceMinor":"5"}'])(
    "opens %j as unreadable",
    (plaintext) => {
      expect(openBalancePayload(plaintext)).toBeNull();
    },
  );
});

describe("recorderId", () => {
  it("accepts the signed-in user's id", () => {
    expect(recorderId(USER)).toBe(USER);
  });

  it.each([undefined, "", "not-a-uuid"])("rejects %j", (value) => {
    expect(recorderId(value)).toBeNull();
  });
});

describe("ledger payloads", () => {
  it("stores a disbursement as a negative amount", () => {
    const payload = disbursementPayload({
      fundId: FUND,
      recordedBy: USER,
      recordedAt: AT,
      amountMinor: 2_500,
    });
    expect(payload).toEqual({
      v: 1,
      amountMinor: -2_500,
      entryType: "disbursement",
      fundId: FUND,
      recordedAt: AT.toISOString(),
      recordedBy: USER,
    });
  });

  it("keeps the sign of an adjustment", () => {
    const takeOut = adjustmentPayload({
      fundId: FUND,
      recordedBy: USER,
      recordedAt: AT,
      amountMinor: -1_000,
    });
    expect(takeOut.amountMinor).toBe(-1_000);
    expect(takeOut.entryType).toBe("adjustment");
  });

  it("negates the reversed entry and points at it", () => {
    const id = newFundLedgerId();
    const original = disbursementPayload({
      fundId: FUND,
      recordedBy: USER,
      recordedAt: AT,
      amountMinor: 700,
    });
    const reversal = reversalPayload({
      reverses: { id, payload: original },
      recordedBy: USER,
      recordedAt: AT,
    });
    expect(reversal.amountMinor).toBe(700);
    expect(reversal.entryType).toBe("reversal");
    expect(reversal.fundId).toBe(FUND);
    expect(reversal.reversesId).toBe(id);
  });

  it("corrects a disbursement with a reversal and a replacement", () => {
    const ledgerEntryId = newFundLedgerId();
    const revision = disbursementRevision({
      envelope: {
        v: 1,
        kind: "disbursement",
        ledgerEntryId,
        fundId: FUND,
        amountMinor: 5_000,
        currency: "USD",
        note: "",
      },
      amountMinor: 3_500,
      recordedBy: USER,
      recordedAt: AT,
    });
    expect(revision.reversal).toEqual({
      v: 1,
      amountMinor: 5_000,
      entryType: "reversal",
      fundId: FUND,
      recordedAt: AT.toISOString(),
      recordedBy: USER,
      reversesId: ledgerEntryId,
    });
    expect(revision.replacement.amountMinor).toBe(-3_500);
    expect(revision.replacement.entryType).toBe("disbursement");
    expect(revision.replacement.fundId).toBe(FUND);
    // Money put back by the smaller correction.
    expect(revision.deltaMinor).toBe(1_500);
    expect(revision.deltaMinor).toBe(
      revision.reversal.amountMinor + revision.replacement.amountMinor,
    );
  });

  it("seals and opens a ledger payload", async () => {
    const sealer = recordingSealer();
    const payload = adjustmentPayload({
      fundId: FUND,
      recordedBy: USER,
      recordedAt: AT,
      amountMinor: 10_000,
    });
    await sealLedgerPayload(sealer, payload);
    expect(openLedgerPayload(sealer.calls[0] ?? null)).toEqual(payload);
  });

  it.each([null, "", "{", '{"v":1,"amountMinor":"5"}'])(
    "opens %j as unreadable",
    (plaintext) => {
      expect(openLedgerPayload(plaintext)).toBeNull();
    },
  );
});

describe("case note envelope", () => {
  const ledgerEntryId = newFundLedgerId();

  it("starts with the marker and opens back to the envelope", () => {
    const content = disbursementNoteContent({
      ledgerEntryId,
      fundId: FUND,
      amountMinor: -4_200,
      currency: "USD",
      note: "  Two nights at the shelter motel ",
    });
    expect(content.startsWith(NOTE_ENVELOPE_MARKER)).toBe(true);
    expect(hasNoteEnvelopeMarker(content)).toBe(true);
    expect(openDisbursementNote(content)).toEqual({
      v: 1,
      kind: "disbursement",
      ledgerEntryId,
      fundId: FUND,
      amountMinor: 4_200,
      currency: "USD",
      note: "Two nights at the shelter motel",
    });
  });

  it("treats typed text as a plain note", () => {
    expect(openDisbursementNote("Called back, no answer")).toBeNull();
  });

  it("treats a marker followed by garbage as unreadable", () => {
    expect(openDisbursementNote(`${NOTE_ENVELOPE_MARKER}{oops`)).toBeNull();
  });
});

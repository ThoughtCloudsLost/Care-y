import { describe, it, expect } from "vitest";
import {
  NOTE_ENVELOPE_MARKER,
  fundIdSchema,
  newFundLedgerId,
} from "@care-y/shared";
import {
  ERROR,
  LOADING,
  type DecryptResult,
} from "$lib/crypto/decrypt-result.js";
import { disbursementNoteContent } from "./fund-payloads.js";
import {
  disbursementNoteText,
  isEnvelopeResult,
  readableNoteResult,
  readableNoteText,
} from "./fund-display.js";

const FUND = fundIdSchema.parse(globalThis.crypto.randomUUID());

function ready(value: string): DecryptResult {
  return { status: "ready", value };
}

const envelopeContent = disbursementNoteContent({
  ledgerEntryId: newFundLedgerId(),
  fundId: FUND,
  amountMinor: 5_000,
  currency: "USD",
  note: "Bus pass for the week",
});

describe("isEnvelopeResult", () => {
  it("is true only for a ready envelope", () => {
    expect(isEnvelopeResult(ready(envelopeContent))).toBe(true);
    expect(isEnvelopeResult(ready("A typed note"))).toBe(false);
    expect(isEnvelopeResult(LOADING)).toBe(false);
  });
});

describe("readableNoteResult", () => {
  const noFund = (): undefined => undefined;

  it("passes plain notes and pending results through", () => {
    const plain = ready("Called back");
    expect(readableNoteResult(plain, noFund)).toBe(plain);
    expect(readableNoteResult(LOADING, noFund)).toBe(LOADING);
  });

  it("replaces an envelope with the amount, fund and note", () => {
    const result = readableNoteResult(ready(envelopeContent), (id) =>
      id === FUND ? "Transit" : undefined,
    );
    expect(result.status).toBe("ready");
    const text = result.status === "ready" ? result.value : "";
    expect(text).toContain("$50.00");
    expect(text).toContain("Transit");
    expect(text).toContain("Bus pass for the week");
    expect(text).not.toContain(NOTE_ENVELOPE_MARKER);
  });

  it("reads a malformed envelope as a decrypt error, never raw JSON", () => {
    const result = readableNoteResult(
      ready(`${NOTE_ENVELOPE_MARKER}{"v":1}`),
      noFund,
    );
    expect(result).toBe(ERROR);
  });
});

describe("readableNoteText", () => {
  it("returns typed notes unchanged", () => {
    expect(readableNoteText("Left a voicemail")).toBe("Left a voicemail");
  });

  it("reads an envelope without a fund name when no resolver is given", () => {
    const text = readableNoteText(envelopeContent);
    expect(text).toContain("$50.00");
    expect(text).toContain("Bus pass for the week");
    expect(text).not.toContain(NOTE_ENVELOPE_MARKER);
    expect(text).not.toContain("ledgerEntryId");
  });

  it("names the fund when the resolver knows it", () => {
    expect(readableNoteText(envelopeContent, () => "Transit")).toContain(
      "Transit",
    );
  });

  it("is null for a marker without a valid envelope", () => {
    expect(readableNoteText(`${NOTE_ENVELOPE_MARKER}not json`)).toBeNull();
  });
});

describe("disbursementNoteText", () => {
  it("omits the second line when the note is empty", () => {
    const text = disbursementNoteText(
      {
        v: 1,
        kind: "disbursement",
        ledgerEntryId: newFundLedgerId(),
        fundId: FUND,
        amountMinor: 1_000,
        currency: "USD",
        note: "",
      },
      undefined,
    );
    expect(text).toContain("$10.00");
    expect(text).not.toContain("\n");
  });
});

import { describe, expect, it } from "vitest";
import { callDirectionSchema, callLogQueryInputSchema } from "./reports.js";

const VALID_ISO = "2026-03-24T12:00:00.000Z";

describe("callDirectionSchema", () => {
  it("accepts 'inbound'", () => {
    expect(callDirectionSchema.safeParse("inbound").success).toBe(true);
  });

  it("accepts 'outbound'", () => {
    expect(callDirectionSchema.safeParse("outbound").success).toBe(true);
  });

  it("rejects unknown direction", () => {
    expect(callDirectionSchema.safeParse("both").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(callDirectionSchema.safeParse("").success).toBe(false);
  });
});

describe("callLogQueryInputSchema", () => {
  it("accepts minimal input with defaults", () => {
    const result = callLogQueryInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(50);
      expect(result.data.direction).toBeUndefined();
      expect(result.data.callStatus).toBeUndefined();
      expect(result.data.dateFrom).toBeUndefined();
      expect(result.data.dateTo).toBeUndefined();
    }
  });

  it("accepts full filter set", () => {
    const result = callLogQueryInputSchema.safeParse({
      direction: "inbound",
      callStatus: "completed",
      dateFrom: VALID_ISO,
      dateTo: VALID_ISO,
      page: 3,
      pageSize: 25,
    });
    expect(result.success).toBe(true);
  });

  it("accepts omitted filters", () => {
    const result = callLogQueryInputSchema.safeParse({ page: 2 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.direction).toBeUndefined();
      expect(result.data.callStatus).toBeUndefined();
    }
  });

  it("rejects pageSize above 100", () => {
    expect(callLogQueryInputSchema.safeParse({ pageSize: 101 }).success).toBe(
      false,
    );
  });

  it("accepts pageSize of 100", () => {
    expect(callLogQueryInputSchema.safeParse({ pageSize: 100 }).success).toBe(
      true,
    );
  });

  it("rejects page 0", () => {
    expect(callLogQueryInputSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects non-integer page", () => {
    expect(callLogQueryInputSchema.safeParse({ page: 1.5 }).success).toBe(
      false,
    );
  });

  it("rejects invalid direction", () => {
    expect(
      callLogQueryInputSchema.safeParse({ direction: "left" }).success,
    ).toBe(false);
  });

  it("rejects invalid callStatus", () => {
    expect(
      callLogQueryInputSchema.safeParse({ callStatus: "ringing" }).success,
    ).toBe(false);
  });

  it("rejects invalid dateFrom", () => {
    expect(
      callLogQueryInputSchema.safeParse({ dateFrom: "not-a-date" }).success,
    ).toBe(false);
  });

  it("rejects invalid dateTo", () => {
    expect(
      callLogQueryInputSchema.safeParse({ dateTo: "not-a-date" }).success,
    ).toBe(false);
  });
});

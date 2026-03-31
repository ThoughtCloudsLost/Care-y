import { describe, expect, it } from "vitest";
import { ErrorCode, type ErrorCodeType } from "./error-codes.js";

describe("ErrorCode", () => {
  it("has all expected members", () => {
    const expected: ErrorCodeType[] = [
      "RATE_LIMIT_COOLDOWN",
      "RATE_LIMIT_HOURLY",
      "NO_ACTIVE_CODE",
      "TOO_MANY_ATTEMPTS",
    ];
    const actual = Object.values(ErrorCode);
    expect(actual).toEqual(expect.arrayContaining(expected));
    expect(actual).toHaveLength(expected.length);
  });

  it("values match their keys (no typos)", () => {
    for (const [key, value] of Object.entries(ErrorCode)) {
      expect(key).toBe(value);
    }
  });
});

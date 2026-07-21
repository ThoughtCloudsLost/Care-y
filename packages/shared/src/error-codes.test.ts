import { describe, expect, it } from "vitest";
import { ErrorCode } from "./error-codes.js";

describe("ErrorCode", () => {
  it("defines at least 80 error codes (membership canary)", () => {
    // Canary that the enum stays populated. Exact membership is exercised
    // by the call sites that reference each code; pinning the full list
    // here would break on every added code.
    expect(Object.values(ErrorCode).length).toBeGreaterThanOrEqual(80);
  });

  it("values match their keys (no typos)", () => {
    for (const [key, value] of Object.entries(ErrorCode)) {
      expect(key).toBe(value);
    }
  });
});

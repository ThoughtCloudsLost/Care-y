import { describe, it, expect } from "vitest";
import * as m from "$lib/paraglide/messages.js";
import { getErrorMessageWithWait } from "./error-message-with-wait.js";

/** An Error shaped like a TRPCClientError carrying formatter data. */
function trpcLikeError(message: string, data: object): Error {
  return Object.assign(new Error(message), { data });
}

describe("getErrorMessageWithWait", () => {
  it("names the wait when the server sent a retry hint", () => {
    const err = trpcLikeError("TWOFA_RATE_LIMITED", {
      code: "RATE_LIMITED",
      retryAfterSeconds: 42,
    });
    expect(getErrorMessageWithWait(err)).toBe(
      m.error_retry_after_seconds({ seconds: "42" }),
    );
  });

  it("rounds a fractional hint up to whole seconds", () => {
    const err = trpcLikeError("TWOFA_RATE_LIMITED", {
      code: "RATE_LIMITED",
      retryAfterSeconds: 4.2,
    });
    expect(getErrorMessageWithWait(err)).toBe(
      m.error_retry_after_seconds({ seconds: "5" }),
    );
  });

  it("falls back to the ErrorCode mapping when a rate limit has no hint", () => {
    const err = trpcLikeError("TWOFA_RATE_LIMITED", {
      code: "TOO_MANY_REQUESTS",
    });
    expect(getErrorMessageWithWait(err)).toBe(m.error_twofa_rate_limited());
  });

  it("falls back to the ErrorCode mapping for errors that are not rate limits", () => {
    const err = trpcLikeError("NO_ACTIVE_CODE", { code: "BAD_REQUEST" });
    expect(getErrorMessageWithWait(err)).toBe(m.error_no_active_code());
  });

  it("returns the generic message for non-Error input", () => {
    expect(getErrorMessageWithWait("boom")).toBe(m.error_generic());
  });
});

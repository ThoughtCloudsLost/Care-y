import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as TrpcMod from "$lib/trpc/index.js";

const { mockEvaluate } = vi.hoisted(() => ({
  mockEvaluate:
    vi.fn<(input: Record<string, unknown>) => Promise<{ evaluated: string }>>(),
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcMod>()),
  trpc: {
    oprf: {
      evaluate: {
        mutate: (input: Record<string, unknown>) => mockEvaluate(input),
      },
    },
  },
}));

import { evaluateWithPowRetry } from "./crypto-helpers.js";

describe("evaluateWithPowRetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes kind='volunteer' through to the evaluate mutation", async () => {
    mockEvaluate.mockResolvedValue({ evaluated: "abc123" });

    await evaluateWithPowRetry("volunteer", "user-1", "blindedB64", vi.fn());

    expect(mockEvaluate).toHaveBeenCalledWith({
      kind: "volunteer",
      userId: "user-1",
      blindedElement: "blindedB64",
    });
  });

  it("passes kind='account' through to the evaluate mutation", async () => {
    mockEvaluate.mockResolvedValue({ evaluated: "def456" });

    await evaluateWithPowRetry("account", "acct-1", "blindedB64", vi.fn());

    expect(mockEvaluate).toHaveBeenCalledWith({
      kind: "account",
      userId: "acct-1",
      blindedElement: "blindedB64",
    });
  });

  it("returns the evaluated element on success", async () => {
    mockEvaluate.mockResolvedValue({ evaluated: "result-b64" });

    const result = await evaluateWithPowRetry(
      "volunteer",
      "u1",
      "blinded",
      vi.fn(),
    );

    expect(result).toBe("result-b64");
  });

  it("retries with PoW solution when server returns POW_REQUIRED", async () => {
    const powError = {
      data: { code: "POW_REQUIRED", challenge: "ch1", difficulty: 16 },
    };
    mockEvaluate
      .mockRejectedValueOnce(powError)
      .mockResolvedValueOnce({ evaluated: "after-pow" });

    const onPow = vi.fn().mockResolvedValue("solution-hex");

    const result = await evaluateWithPowRetry(
      "volunteer",
      "u1",
      "blinded",
      onPow,
    );

    expect(onPow).toHaveBeenCalledWith("ch1", 16);
    expect(result).toBe("after-pow");

    // The retry call includes kind, powChallenge, and powSolution
    expect(mockEvaluate).toHaveBeenCalledTimes(2);
    const retryCall = mockEvaluate.mock.calls[1]?.[0];
    expect(retryCall).toEqual({
      kind: "volunteer",
      userId: "u1",
      blindedElement: "blinded",
      powChallenge: "ch1",
      powSolution: "solution-hex",
    });
  });

  it("rethrows non-PoW errors without calling onPowRequired", async () => {
    const otherError = new Error("network failure");
    mockEvaluate.mockRejectedValueOnce(otherError);
    const onPow = vi.fn();

    await expect(
      evaluateWithPowRetry("account", "u1", "blinded", onPow),
    ).rejects.toThrow("network failure");

    expect(onPow).not.toHaveBeenCalled();
  });
});

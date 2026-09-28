/**
 * Tests for endStaffSession: server logout with retries, then an
 * unconditional local wipe.
 *
 * vi.mock required: $lib/trpc/index.js opens a live HTTP client.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TRPCClientError } from "@trpc/client";
import type * as TrpcMod from "$lib/trpc/index.js";
import { cacheRegistry } from "$lib/crypto/cache-registry.js";
import {
  endStaffSession,
  type EndStaffSessionDeps,
} from "./end-staff-session.js";

const { mockLogout } = vi.hoisted(() => ({
  mockLogout: vi.fn<() => Promise<unknown>>(),
}));

vi.mock("$lib/trpc/index.js", () => {
  const _usedExports = null! as { trpc: typeof TrpcMod.trpc };
  return {
    trpc: {
      auth: { logout: { mutate: mockLogout } },
    } as unknown as typeof TrpcMod.trpc,
  } satisfies typeof _usedExports;
});

function unauthorizedError(): Error {
  return TRPCClientError.from({
    error: {
      message: "Not authenticated",
      code: -32001,
      data: { code: "UNAUTHORIZED" },
    },
  });
}

function makeDeps(): {
  deps: EndStaffSessionDeps;
  clear: ReturnType<typeof vi.fn<() => void>>;
  zero: ReturnType<typeof vi.fn<() => void>>;
  zeroAll: ReturnType<typeof vi.fn<() => Promise<void>>>;
} {
  const clear = vi.fn<() => void>();
  const zero = vi.fn<() => void>();
  const zeroAll = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  return {
    deps: {
      queryClient: { clear },
      orgKeyManager: { zero },
      bridge: { zeroAll },
    },
    clear,
    zero,
    zeroAll,
  };
}

describe("endStaffSession", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockLogout.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("confirms when the first logout succeeds", async () => {
    mockLogout.mockResolvedValue({ success: true });
    const { deps } = makeDeps();

    const result = await endStaffSession(deps);

    expect(result).toEqual({ serverConfirmed: true });
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it("retries after a failure and confirms on a later attempt", async () => {
    mockLogout
      .mockRejectedValueOnce(new TypeError("network down"))
      .mockResolvedValueOnce({ success: true });
    const { deps } = makeDeps();

    const pending = endStaffSession(deps);

    // The retry waits for its backoff before the second attempt
    await vi.advanceTimersByTimeAsync(299);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(mockLogout).toHaveBeenCalledTimes(2);

    await expect(pending).resolves.toEqual({ serverConfirmed: true });
  });

  it("reports unconfirmed after three failed attempts", async () => {
    mockLogout.mockRejectedValue(new TypeError("network down"));
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const { deps } = makeDeps();

    const pending = endStaffSession(deps);
    await vi.advanceTimersByTimeAsync(1_300);

    await expect(pending).resolves.toEqual({ serverConfirmed: false });
    expect(mockLogout).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("treats UNAUTHORIZED as confirmed without retrying", async () => {
    mockLogout.mockRejectedValue(unauthorizedError());
    const { deps } = makeDeps();

    const result = await endStaffSession(deps);

    expect(result).toEqual({ serverConfirmed: true });
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it("retries a non-UNAUTHORIZED tRPC error", async () => {
    mockLogout
      .mockRejectedValueOnce(
        TRPCClientError.from({
          error: {
            message: "Internal server error",
            code: -32603,
            data: { code: "INTERNAL_SERVER_ERROR" },
          },
        }),
      )
      .mockResolvedValueOnce({ success: true });
    const { deps } = makeDeps();

    const pending = endStaffSession(deps);
    await vi.advanceTimersByTimeAsync(300);

    await expect(pending).resolves.toEqual({ serverConfirmed: true });
    expect(mockLogout).toHaveBeenCalledTimes(2);
  });

  describe("local wipe", () => {
    it.each([
      [
        "confirmed",
        (): void => {
          mockLogout.mockResolvedValue({ success: true });
        },
      ],
      [
        "unauthorized",
        (): void => {
          mockLogout.mockRejectedValue(unauthorizedError());
        },
      ],
      [
        "all attempts failed",
        (): void => {
          mockLogout.mockRejectedValue(new TypeError("network down"));
          vi.spyOn(console, "warn").mockImplementation(() => undefined);
        },
      ],
    ])(
      "runs in full when the server outcome is %s",
      async (_label, arrange) => {
        arrange();
        const resetSpy = vi.spyOn(cacheRegistry, "reset");
        const { deps, clear, zero, zeroAll } = makeDeps();

        const pending = endStaffSession(deps);
        await vi.advanceTimersByTimeAsync(1_300);
        await pending;

        expect(clear).toHaveBeenCalledOnce();
        expect(resetSpy).toHaveBeenCalled();
        expect(zero).toHaveBeenCalledOnce();
        expect(zeroAll).toHaveBeenCalledOnce();
      },
    );

    it("wipes before the server attempts settle", async () => {
      let settleLogout: (value: unknown) => void = () => undefined;
      mockLogout.mockReturnValue(
        new Promise((resolve) => {
          settleLogout = resolve;
        }),
      );
      const { deps, clear, zeroAll } = makeDeps();

      const pending = endStaffSession(deps);
      await vi.advanceTimersByTimeAsync(0);
      expect(clear).toHaveBeenCalledOnce();
      expect(zeroAll).toHaveBeenCalledOnce();

      settleLogout({ success: true });
      await expect(pending).resolves.toEqual({ serverConfirmed: true });
    });

    it("resolves only after the worker has zeroed its keys", async () => {
      mockLogout.mockResolvedValue({ success: true });
      let finishZero: () => void = () => undefined;
      const { deps, zeroAll } = makeDeps();
      zeroAll.mockReturnValue(
        new Promise<void>((resolve) => {
          finishZero = resolve;
        }),
      );

      let settled = false;
      const pending = endStaffSession(deps).then(() => {
        settled = true;
      });
      await vi.advanceTimersByTimeAsync(0);
      expect(zeroAll).toHaveBeenCalledOnce();
      expect(settled).toBe(false);

      finishZero();
      await pending;
      expect(settled).toBe(true);
    });
  });
});

/**
 * Tests for the account session renewer: activity throttling, sign-in
 * as a renewal, and failure handling.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { TRPCClientError } from "@trpc/client";
import {
  ACCOUNT_SESSION_RENEW_INTERVAL_MS,
  createAccountSessionRenewer,
  type AccountSessionRenewer,
} from "./account-session-renewal.js";

function setup(renewImpl?: () => Promise<unknown>): {
  renewer: AccountSessionRenewer;
  renew: ReturnType<typeof vi.fn<() => Promise<unknown>>>;
  onUnauthorized: ReturnType<typeof vi.fn<() => void>>;
  clock: { time: number };
} {
  const clock = { time: 1_000_000 };
  const renew = vi
    .fn<() => Promise<unknown>>()
    .mockImplementation(renewImpl ?? (async () => Promise.resolve({})));
  const onUnauthorized = vi.fn<() => void>();
  const renewer = createAccountSessionRenewer({
    renew,
    onUnauthorized,
    now: () => clock.time,
  });
  return { renewer, renew, onUnauthorized, clock };
}

/** Lets the renew promise's catch handler run. */
async function flush(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createAccountSessionRenewer", () => {
  it("renews on the first activity when no renewal was recorded", () => {
    const { renewer, renew } = setup();

    renewer.onActivity();

    expect(renew).toHaveBeenCalledOnce();
  });

  it("renews at most once per interval under continuous activity", () => {
    const { renewer, renew, clock } = setup();

    renewer.onActivity();
    for (let i = 0; i < 50; i++) {
      clock.time += 1_000;
      renewer.onActivity();
    }
    // 50 seconds of input: still only the first renewal
    expect(renew).toHaveBeenCalledOnce();

    clock.time += ACCOUNT_SESSION_RENEW_INTERVAL_MS - 50_000 - 1;
    renewer.onActivity();
    expect(renew).toHaveBeenCalledOnce();

    clock.time += 1;
    renewer.onActivity();
    expect(renew).toHaveBeenCalledTimes(2);
  });

  it("treats sign-in as a renewal", () => {
    const { renewer, renew, clock } = setup();

    renewer.markRenewed();
    renewer.onActivity();
    expect(renew).not.toHaveBeenCalled();

    clock.time += ACCOUNT_SESSION_RENEW_INTERVAL_MS;
    renewer.onActivity();
    expect(renew).toHaveBeenCalledOnce();
  });

  it("uses a two minute interval", () => {
    expect(ACCOUNT_SESSION_RENEW_INTERVAL_MS).toBe(120_000);
  });

  it("calls onUnauthorized when the server has no session", async () => {
    const { renewer, onUnauthorized } = setup(async () =>
      Promise.reject(
        TRPCClientError.from({
          error: {
            message: "Sign-in failed",
            code: -32001,
            data: { code: "UNAUTHORIZED" },
          },
        }),
      ),
    );

    renewer.onActivity();
    await flush();

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("logs other failures without the error message and does not throw", async () => {
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const { renewer, onUnauthorized } = setup(async () =>
      Promise.reject(new TypeError("fetch failed for someone@example.org")),
    );

    expect(() => {
      renewer.onActivity();
    }).not.toThrow();
    await flush();

    expect(onUnauthorized).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(JSON.stringify(warnSpy.mock.calls[0])).not.toContain(
      "someone@example.org",
    );
  });

  it("keeps throttling after a failed renewal", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { renewer, renew, clock } = setup(async () =>
      Promise.reject(new TypeError("network down")),
    );

    renewer.onActivity();
    await flush();
    clock.time += 1_000;
    renewer.onActivity();

    expect(renew).toHaveBeenCalledOnce();
  });
});

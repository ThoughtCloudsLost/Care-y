import { describe, it, expect, vi } from "vitest";
import { donationConnectionIdSchema } from "@care-y/shared";
import { createProviderFundCache } from "./fund-cache.js";
import type { ProviderFund } from "./provider.js";
import { DonationProviderError } from "../errors.js";

const CONN_A = donationConnectionIdSchema.parse(
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
);
const CONN_B = donationConnectionIdSchema.parse(
  "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
);

function funds(raisedMinor: number): readonly ProviderFund[] {
  return [
    {
      externalId: "f1",
      code: null,
      name: "General",
      raisedMinor,
      supporters: 1,
    },
  ];
}

/** A promise with its resolve function, for holding a load open. */
function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("createProviderFundCache", () => {
  it("serves a cached list within the TTL", async () => {
    let clock = 0;
    const cache = createProviderFundCache({ ttlMs: 45_000, now: () => clock });
    const loader = vi.fn(async () => funds(100));

    await cache.get(CONN_A, loader);
    clock = 44_999;
    const again = await cache.get(CONN_A, loader);

    expect(loader).toHaveBeenCalledTimes(1);
    expect(again).toEqual(funds(100));
  });

  it("reloads once the TTL has passed", async () => {
    let clock = 0;
    const cache = createProviderFundCache({ ttlMs: 45_000, now: () => clock });
    const loader = vi
      .fn<() => Promise<readonly ProviderFund[]>>()
      .mockResolvedValueOnce(funds(100))
      .mockResolvedValueOnce(funds(200));

    await cache.get(CONN_A, loader);
    clock = 45_000;
    const fresh = await cache.get(CONN_A, loader);

    expect(loader).toHaveBeenCalledTimes(2);
    expect(fresh).toEqual(funds(200));
  });

  it("shares one in-flight load between concurrent callers", async () => {
    const cache = createProviderFundCache({ ttlMs: 45_000 });
    const pending = deferred<readonly ProviderFund[]>();
    const loader = vi.fn(() => pending.promise);

    const first = cache.get(CONN_A, loader);
    const second = cache.get(CONN_A, loader);
    const third = cache.get(CONN_A, loader);
    pending.resolve(funds(300));

    expect(await Promise.all([first, second, third])).toEqual([
      funds(300),
      funds(300),
      funds(300),
    ]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("keeps connections apart", async () => {
    const cache = createProviderFundCache({ ttlMs: 45_000 });
    const loaderA = vi.fn(async () => funds(1));
    const loaderB = vi.fn(async () => funds(2));

    expect(await cache.get(CONN_A, loaderA)).toEqual(funds(1));
    expect(await cache.get(CONN_B, loaderB)).toEqual(funds(2));
    expect(loaderA).toHaveBeenCalledTimes(1);
    expect(loaderB).toHaveBeenCalledTimes(1);
  });

  it("reloads after invalidate", async () => {
    const cache = createProviderFundCache({ ttlMs: 45_000 });
    const loader = vi
      .fn<() => Promise<readonly ProviderFund[]>>()
      .mockResolvedValueOnce(funds(100))
      .mockResolvedValueOnce(funds(105));

    await cache.get(CONN_A, loader);
    cache.invalidate(CONN_A);
    const fresh = await cache.get(CONN_A, loader);

    expect(loader).toHaveBeenCalledTimes(2);
    expect(fresh).toEqual(funds(105));
  });

  it("does not store a load that an invalidate overtook", async () => {
    const cache = createProviderFundCache({ ttlMs: 45_000 });
    const stale = deferred<readonly ProviderFund[]>();
    const loader = vi
      .fn<() => Promise<readonly ProviderFund[]>>()
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce(funds(105));

    const inFlight = cache.get(CONN_A, loader);
    cache.invalidate(CONN_A);
    stale.resolve(funds(100));
    expect(await inFlight).toEqual(funds(100));

    expect(await cache.get(CONN_A, loader)).toEqual(funds(105));
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("does not cache a failed load", async () => {
    const cache = createProviderFundCache({ ttlMs: 45_000 });
    const loader = vi
      .fn<() => Promise<readonly ProviderFund[]>>()
      .mockRejectedValueOnce(new DonationProviderError("unavailable"))
      .mockResolvedValueOnce(funds(7));

    await expect(cache.get(CONN_A, loader)).rejects.toBeInstanceOf(
      DonationProviderError,
    );
    expect(await cache.get(CONN_A, loader)).toEqual(funds(7));
    expect(loader).toHaveBeenCalledTimes(2);
  });
});

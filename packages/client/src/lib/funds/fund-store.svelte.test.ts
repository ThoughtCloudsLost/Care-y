import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { ErrorCode, fundIdSchema } from "@care-y/shared";
import { fundKeys } from "$lib/query/keys.js";
import {
  decryptQueueFundId,
  fundBalanceCacheKey,
  fundCacheKey,
  invalidateFunds,
  isBalanceStale,
  ledgerCacheKey,
  queueFundCacheKey,
  setBalanceOnce,
  writeWithBalance,
  type BalanceSnapshot,
  type BalanceWrite,
  type BalanceWriterDeps,
} from "./fund-store.svelte.js";

const FUND = fundIdSchema.parse(globalThis.crypto.randomUUID());

describe("fund cache keys", () => {
  it("keys a fund by id and updatedAt so an edit decrypts fresh", () => {
    const before = fundCacheKey({ id: "f-1", updatedAt: "2026-09-01" });
    const after = fundCacheKey({ id: "f-1", updatedAt: "2026-09-02" });
    expect(before).not.toBe(after);
    expect(before.startsWith("fund:f-1:")).toBe(true);
  });

  it("keys a sealed balance by id and version so each write decrypts fresh", () => {
    expect(fundBalanceCacheKey({ id: "f-1", balanceVersion: 3 })).toBe(
      "fund-balance:f-1:3",
    );
    expect(fundBalanceCacheKey({ id: "f-1", balanceVersion: 4 })).not.toBe(
      fundBalanceCacheKey({ id: "f-1", balanceVersion: 3 }),
    );
  });

  it("keys a ledger entry by id alone", () => {
    expect(ledgerCacheKey("e-1")).toBe("fund-ledger:e-1");
  });

  it("keys a queue's fund id apart from its name, color and icon", () => {
    expect(queueFundCacheKey("q-1")).toBe("queue-fund:q-1");
  });
});

describe("decryptQueueFundId", () => {
  it("decrypts through the org cache with the queue as reseal origin", () => {
    const decrypt = vi.fn().mockReturnValue("fund-9");
    const result = decryptQueueFundId(
      { decrypt },
      { id: "q-1", encryptedFundId: "sealed" },
    );
    expect(result).toBe("fund-9");
    expect(decrypt).toHaveBeenCalledWith("queue-fund:q-1", "sealed", {
      table: "queues",
      id: "q-1",
    });
  });

  it("passes a missing mapping through as null", () => {
    const decrypt = vi.fn().mockReturnValue(null);
    expect(
      decryptQueueFundId({ decrypt }, { id: "q-2", encryptedFundId: null }),
    ).toBeNull();
  });
});

describe("invalidateFunds", () => {
  it("invalidates the whole fund family", () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    invalidateFunds(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: fundKeys.all });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

const PAYLOAD = {
  v: 1 as const,
  name: "Groceries",
  currency: "USD",
  providerLink: null,
};

/** Sealer that passes the plaintext through, so the balance is readable. */
function deps(overrides: Partial<BalanceWriterDeps> = {}): BalanceWriterDeps {
  return {
    read: () => ({
      balanceMinor: 10_000,
      version: 4,
      orgKeyGeneration: 2,
      payload: PAYLOAD,
    }),
    reload: vi.fn(() =>
      Promise.resolve<BalanceSnapshot>({
        balanceMinor: 9_000,
        version: 5,
        orgKeyGeneration: 2,
        payload: PAYLOAD,
      }),
    ),
    sealingGeneration: () => Promise.resolve(2),
    sealer: { encryptText: (plaintext: string) => Promise.resolve(plaintext) },
    ...overrides,
  };
}

function sealedMinor(write: BalanceWrite): number {
  const parsed: unknown = JSON.parse(write.encryptedBalance);
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "balanceMinor" in parsed &&
    typeof parsed.balanceMinor === "number"
  ) {
    return parsed.balanceMinor;
  }
  throw new TypeError("not a balance payload");
}

describe("isBalanceStale", () => {
  it("recognises the stale-balance refusal only", () => {
    expect(isBalanceStale(new Error(ErrorCode.FUND_BALANCE_STALE))).toBe(true);
    expect(isBalanceStale(new Error(ErrorCode.FUND_NOT_FOUND))).toBe(false);
    expect(isBalanceStale("FUND_BALANCE_STALE")).toBe(false);
  });
});

describe("writeWithBalance", () => {
  it("seals the cached balance plus the delta at the cached version", async () => {
    const write = vi.fn((_: BalanceWrite) => Promise.resolve("ok"));
    const d = deps();

    await expect(writeWithBalance(d, FUND, -2_500, write)).resolves.toBe("ok");

    expect(write).toHaveBeenCalledTimes(1);
    const sent = write.mock.calls[0]?.[0];
    expect(sent?.fundId).toBe(FUND);
    expect(sent?.expectedVersion).toBe(4);
    expect(sent?.orgKeyGeneration).toBe(2);
    expect(sent?.encryptedPayload).toBeUndefined();
    expect(sent === undefined ? null : sealedMinor(sent)).toBe(7_500);
    expect(d.reload).not.toHaveBeenCalled();
  });

  it("reseals the fund payload when the row is behind the sealing generation", async () => {
    const write = vi.fn((_: BalanceWrite) => Promise.resolve("ok"));

    await writeWithBalance(
      deps({ sealingGeneration: () => Promise.resolve(3) }),
      FUND,
      100,
      write,
    );

    const sent = write.mock.calls[0]?.[0];
    expect(sent?.orgKeyGeneration).toBe(3);
    expect(JSON.parse(sent?.encryptedPayload ?? "null")).toEqual(PAYLOAD);
  });

  it("reloads first when the cache has no readable balance", async () => {
    const write = vi.fn((_: BalanceWrite) => Promise.resolve("ok"));
    const d = deps({ read: () => null });

    await writeWithBalance(d, FUND, 1_000, write);

    const sent = write.mock.calls[0]?.[0];
    expect(sent?.expectedVersion).toBe(5);
    expect(sent === undefined ? null : sealedMinor(sent)).toBe(10_000);
  });

  it("refetches and retries once when the balance went stale", async () => {
    const write = vi
      .fn((_: BalanceWrite) => Promise.resolve("ok"))
      .mockRejectedValueOnce(new Error(ErrorCode.FUND_BALANCE_STALE));
    const d = deps();

    await expect(writeWithBalance(d, FUND, -500, write)).resolves.toBe("ok");

    expect(d.reload).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(2);
    const retry = write.mock.calls[1]?.[0];
    expect(retry?.expectedVersion).toBe(5);
    expect(retry === undefined ? null : sealedMinor(retry)).toBe(8_500);
  });

  it("surfaces a second stale refusal instead of looping", async () => {
    const stale = new Error(ErrorCode.FUND_BALANCE_STALE);
    const write = vi.fn((_: BalanceWrite) => Promise.reject(stale));

    await expect(writeWithBalance(deps(), FUND, -500, write)).rejects.toBe(
      stale,
    );
    expect(write).toHaveBeenCalledTimes(2);
  });

  it("does not retry other errors", async () => {
    const failure = new Error(ErrorCode.FUND_NOT_FOUND);
    const write = vi.fn((_: BalanceWrite) => Promise.reject(failure));
    const d = deps();

    await expect(writeWithBalance(d, FUND, -500, write)).rejects.toBe(failure);
    expect(write).toHaveBeenCalledTimes(1);
    expect(d.reload).not.toHaveBeenCalled();
  });
});

describe("setBalanceOnce", () => {
  it("seals the given figure, not a delta", async () => {
    const write = vi.fn((_: BalanceWrite) => Promise.resolve("ok"));

    await setBalanceOnce(deps(), FUND, 4_200, write);

    const sent = write.mock.calls[0]?.[0];
    expect(sent?.expectedVersion).toBe(4);
    expect(sent === undefined ? null : sealedMinor(sent)).toBe(4_200);
  });

  it("does not retry a stale refusal: the ledger sum may be out of date", async () => {
    const stale = new Error(ErrorCode.FUND_BALANCE_STALE);
    const write = vi.fn((_: BalanceWrite) => Promise.reject(stale));
    const d = deps();

    await expect(setBalanceOnce(d, FUND, 4_200, write)).rejects.toBe(stale);
    expect(write).toHaveBeenCalledTimes(1);
    expect(d.reload).not.toHaveBeenCalled();
  });
});

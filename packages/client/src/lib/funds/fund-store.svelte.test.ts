import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import {
  ErrorCode,
  donationConnectionIdSchema,
  fundIdSchema,
  type ProviderFundListWire,
} from "@care-y/shared";
import { fundKeys } from "$lib/query/keys.js";
import {
  decryptQueueFundId,
  fundAvailable,
  fundBalanceCacheKey,
  fundCacheKey,
  fundRaised,
  indexProviderFunds,
  invalidateFunds,
  isBalanceStale,
  ledgerCacheKey,
  needsProviderFunds,
  providerLinkKey,
  queueFundCacheKey,
  raisedByFund,
  setBalanceOnce,
  writeWithBalance,
  type BalanceSnapshot,
  type BalanceWrite,
  type BalanceWriterDeps,
  type FundView,
  type ProviderFundIndex,
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

// ── Provider inflow ─────────────────────────────────────────────────

const CONNECTION = donationConnectionIdSchema.parse(
  globalThis.crypto.randomUUID(),
);
const DOWN_CONNECTION = donationConnectionIdSchema.parse(
  globalThis.crypto.randomUUID(),
);

const LINK = { connectionId: CONNECTION, externalFundId: "gb-fund-1" };

function providerFund(
  externalId: string,
  raisedMinor: number,
): ProviderFundListWire["funds"][number] {
  return {
    connectionId: CONNECTION,
    externalId,
    code: null,
    name: "Rent relief",
    raisedMinor,
    supporters: 3,
    currency: "USD",
  };
}

const PROVIDER_LIST: ProviderFundListWire = {
  funds: [providerFund("gb-fund-1", 12_500), providerFund("gb-fund-2", 0)],
  unavailableConnectionIds: [DOWN_CONNECTION],
};

function fundView(overrides: Partial<FundView> = {}): FundView {
  return {
    id: FUND,
    name: "Groceries",
    currency: "USD",
    providerLink: null,
    isActive: true,
    sortOrder: 0,
    orgKeyGeneration: 1,
    balance: { balanceMinor: 10_000, version: 4 },
    raised: { kind: "unlinked" },
    available: { kind: "amount", minor: 10_000 },
    ...overrides,
  };
}

describe("providerLinkKey", () => {
  it("joins the connection id and the provider's fund id", () => {
    expect(providerLinkKey(LINK)).toBe(`${CONNECTION}:gb-fund-1`);
  });
});

describe("indexProviderFunds", () => {
  it("keys each provider fund by connection id and external id", () => {
    const index = indexProviderFunds(PROVIDER_LIST);

    expect(index.raisedByKey.get(`${CONNECTION}:gb-fund-1`)).toBe(12_500);
    expect(index.raisedByKey.get(`${CONNECTION}:gb-fund-2`)).toBe(0);
    expect(index.raisedByKey.size).toBe(2);
  });

  it("records the connections the relay could not read", () => {
    const index = indexProviderFunds(PROVIDER_LIST);

    expect(index.unavailableConnectionIds.has(DOWN_CONNECTION)).toBe(true);
    expect(index.unavailableConnectionIds.has(CONNECTION)).toBe(false);
  });
});

describe("needsProviderFunds", () => {
  // The provider query's enabled flag is built from this, so no provider
  // request runs while every fund is unlinked.
  it("is false when no fund is linked", () => {
    expect(needsProviderFunds([])).toBe(false);
    expect(
      needsProviderFunds([{ providerLink: null }, { providerLink: null }]),
    ).toBe(false);
  });

  it("is true once any fund is linked", () => {
    expect(
      needsProviderFunds([{ providerLink: null }, { providerLink: LINK }]),
    ).toBe(true);
  });
});

describe("fundRaised", () => {
  const index: ProviderFundIndex = indexProviderFunds(PROVIDER_LIST);

  it("is unlinked for a fund with no provider link", () => {
    expect(fundRaised(null, index)).toEqual({ kind: "unlinked" });
    expect(fundRaised(null, "unavailable")).toEqual({ kind: "unlinked" });
  });

  it("is pending while the provider totals load", () => {
    expect(fundRaised(LINK, "loading")).toEqual({ kind: "pending" });
  });

  it("is unavailable when the relay cannot be read at all", () => {
    expect(fundRaised(LINK, "unavailable")).toEqual({ kind: "unavailable" });
  });

  it("is the provider's figure, matched by connection and external id", () => {
    expect(fundRaised(LINK, index)).toEqual({ kind: "amount", minor: 12_500 });
  });

  it("keeps a real zero from the provider as an amount", () => {
    expect(
      fundRaised(
        { connectionId: CONNECTION, externalFundId: "gb-fund-2" },
        index,
      ),
    ).toEqual({ kind: "amount", minor: 0 });
  });

  it("is unavailable when the fund's connection could not be read", () => {
    expect(
      fundRaised(
        { connectionId: DOWN_CONNECTION, externalFundId: "gb-fund-1" },
        index,
      ),
    ).toEqual({ kind: "unavailable" });
  });

  it("is unavailable, never zero, for a linked fund the provider does not list", () => {
    expect(
      fundRaised({ connectionId: CONNECTION, externalFundId: "gone" }, index),
    ).toEqual({ kind: "unavailable" });
  });
});

describe("fundAvailable", () => {
  const balance = { balanceMinor: 10_000, version: 4 };

  it("is pending while the sealed balance decrypts", () => {
    expect(fundAvailable(null, { kind: "amount", minor: 500 })).toEqual({
      kind: "pending",
    });
  });

  it("is the sealed balance for an unlinked fund", () => {
    expect(fundAvailable(balance, { kind: "unlinked" })).toEqual({
      kind: "amount",
      minor: 10_000,
    });
  });

  it("is pending while raised loads", () => {
    expect(fundAvailable(balance, { kind: "pending" })).toEqual({
      kind: "pending",
    });
  });

  it("adds raised to the sealed balance", () => {
    expect(fundAvailable(balance, { kind: "amount", minor: 2_500 })).toEqual({
      kind: "amount",
      minor: 12_500,
    });
  });

  it("is unavailable when raised is", () => {
    expect(fundAvailable(balance, { kind: "unavailable" })).toEqual({
      kind: "unavailable",
    });
  });
});

describe("raisedByFund", () => {
  it("maps fund ids to raised for funds with a known amount only", () => {
    const linked = fundIdSchema.parse(globalThis.crypto.randomUUID());
    const down = fundIdSchema.parse(globalThis.crypto.randomUUID());
    const loading = fundIdSchema.parse(globalThis.crypto.randomUUID());

    const raised = raisedByFund([
      fundView(),
      fundView({ id: linked, raised: { kind: "amount", minor: 7_000 } }),
      fundView({ id: down, raised: { kind: "unavailable" } }),
      fundView({ id: loading, raised: { kind: "pending" } }),
    ]);

    expect([...raised]).toEqual([[linked, 7_000]]);
  });
});

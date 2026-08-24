import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { getSodium, requireSodium, encode, decode } from "@care-y/crypto";
import type { UserId } from "@care-y/shared";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type * as TrpcModule from "$lib/trpc/index.js";
import {
  wrapOrgKeyForPending,
  autoWrapPendingUsers,
  type PendingWrapUser,
} from "./org-key-wrap.js";

vi.mock("$lib/trpc/index.js", () => {
  // The real `trpc` export is a TRPCClient<AppRouter> proxy; only the two
  // procedures this module touches are stubbed, so the deep shape is cast.
  // The factory-level `satisfies` still pins the module's export names and
  // the signatures of the non-proxy exports.
  const mockTrpc = {
    keys: {
      wrapOrgKeyForUser: {
        mutate: vi.fn(async () => ({ success: true })),
      },
      listUnwrappedUsers: {
        query: vi.fn(async () => []),
      },
    },
  } as unknown as typeof TrpcModule.trpc;
  return {
    trpc: mockTrpc,
    setDevDelay: vi.fn(),
    isDevDelayEnabled: vi.fn(() => false),
  } satisfies typeof TrpcModule;
});

const { trpc } = await import("$lib/trpc/index.js");
const mutateMock = vi.mocked(trpc.keys.wrapOrgKeyForUser.mutate);
const listMock = vi.mocked(trpc.keys.listUnwrappedUsers.query);

beforeAll(async () => {
  await getSodium();
});

function createMockBridge(): CryptoBridge {
  const sodium = requireSodium();
  const orgSecret = sodium.randombytes_buf(32);

  return {
    exportOrgSecretKey: vi.fn(
      async () => orgSecret.slice().buffer as ArrayBuffer,
    ),
  } as unknown as CryptoBridge;
}

function createPendingUsers(count: number): PendingWrapUser[] {
  const sodium = requireSodium();
  return Array.from({ length: count }, (_, i) => {
    const scalar = sodium.crypto_core_ristretto255_scalar_random();
    const pk = sodium.crypto_scalarmult_ristretto255_base(scalar);
    return {
      userId: `user-${String(i)}` as UserId,
      volPublic: encode(pk),
    };
  });
}

describe("wrapOrgKeyForPending", () => {
  let bridge: CryptoBridge;

  beforeEach(() => {
    bridge = createMockBridge();
    mutateMock.mockReset().mockResolvedValue({ success: true as const });
  });

  it("returns 0 and skips Worker call when pendingUsers is empty", async () => {
    const result = await wrapOrgKeyForPending(bridge, []);
    expect(result).toBe(0);
    expect(bridge.exportOrgSecretKey).not.toHaveBeenCalled();
  });

  it("calls exportOrgSecretKey exactly once for multiple users", async () => {
    const users = createPendingUsers(3);
    await wrapOrgKeyForPending(bridge, users);
    expect(bridge.exportOrgSecretKey).toHaveBeenCalledTimes(1);
  });

  it("calls wrapOrgKeyForUser.mutate for each user", async () => {
    const users = createPendingUsers(2);
    await wrapOrgKeyForPending(bridge, users);
    expect(mutateMock).toHaveBeenCalledTimes(2);

    const args = mutateMock.mock.calls.at(0);
    expect(args).toBeDefined();
    const firstCall = args![0] as Record<string, string>;
    expect(firstCall.userId).toBe("user-0");
    expect(firstCall.wrappedKey).toBeDefined();
    expect(firstCall.ephemeralPoint).toBeDefined();
    expect(firstCall.nonce).toBeDefined();
  });

  it("returns count of successfully wrapped users", async () => {
    const users = createPendingUsers(3);
    const result = await wrapOrgKeyForPending(bridge, users);
    expect(result).toBe(3);
  });

  it("continues wrapping remaining users when one fails", async () => {
    const users = createPendingUsers(3);
    mutateMock
      .mockResolvedValueOnce({ success: true as const })
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValueOnce({ success: true as const });

    const result = await wrapOrgKeyForPending(bridge, users);
    expect(result).toBe(2);
    expect(mutateMock).toHaveBeenCalledTimes(3);
  });

  // Security contract: org secret key MUST be zeroed after use, even on failure.
  // Inspecting the buffer is intentional, not a change detector.
  it("zeros org secret key in finally block even when all wraps fail", async () => {
    const users = createPendingUsers(1);
    mutateMock.mockRejectedValue(new Error("server down"));

    await wrapOrgKeyForPending(bridge, users);

    const exportMock = vi.mocked(bridge.exportOrgSecretKey);
    const result = exportMock.mock.results.at(0);
    expect(result).toBeDefined();
    const buf = await (result!.value as Promise<ArrayBuffer>);
    const arr = new Uint8Array(buf);
    expect(arr.every((b) => b === 0)).toBe(true);
  });

  it("wraps valid ECIES output (decodable ephemeralPoint and nonce)", async () => {
    const users = createPendingUsers(1);
    await wrapOrgKeyForPending(bridge, users);

    const args = mutateMock.mock.calls.at(0);
    expect(args).toBeDefined();
    const call = args![0] as {
      ephemeralPoint: string;
      nonce: string;
      wrappedKey: string;
      userId: string;
    };
    const ep = decode(call.ephemeralPoint);
    const nonce = decode(call.nonce);
    expect(ep.length).toBe(32);
    expect(nonce.length).toBeGreaterThan(0);
  });

  it("logs warning in dev mode when wrapping fails for a user", async () => {
    const users = createPendingUsers(2);
    mutateMock.mockRejectedValue(new Error("wrap failure"));

    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    await wrapOrgKeyForPending(bridge, users);

    // import.meta.env.DEV is true in vitest by default
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[org-key-wrap] failed for user user-0"),
      expect.any(Error),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[org-key-wrap] failed for user user-1"),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it("returns partial count when some users fail and others succeed", async () => {
    const users = createPendingUsers(4);
    mutateMock
      .mockResolvedValueOnce({ success: true as const })
      .mockRejectedValueOnce(new Error("fail-1"))
      .mockRejectedValueOnce(new Error("fail-2"))
      .mockResolvedValueOnce({ success: true as const });

    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    const result = await wrapOrgKeyForPending(bridge, users);

    expect(result).toBe(2);
    expect(mutateMock).toHaveBeenCalledTimes(4);
    // All four users were attempted, none skipped
    const calledUserIds = mutateMock.mock.calls.map(
      (args) => (args[0] as Record<string, string>).userId,
    );
    expect(calledUserIds).toContain("user-0");
    expect(calledUserIds).toContain("user-1");
    expect(calledUserIds).toContain("user-2");
    expect(calledUserIds).toContain("user-3");

    warnSpy.mockRestore();
  });
});

describe("autoWrapPendingUsers", () => {
  let bridge: CryptoBridge;

  beforeEach(() => {
    bridge = createMockBridge();
    mutateMock.mockReset().mockResolvedValue({ success: true as const });
    listMock.mockClear();
  });

  it("returns 0 when no unwrapped users exist", async () => {
    listMock.mockResolvedValue([]);
    const result = await autoWrapPendingUsers(bridge);
    expect(result).toBe(0);
    expect(bridge.exportOrgSecretKey).not.toHaveBeenCalled();
  });

  it("fetches unwrapped users and wraps for each", async () => {
    const users = createPendingUsers(2);
    listMock.mockResolvedValue(users);

    const result = await autoWrapPendingUsers(bridge);
    expect(result).toBe(2);
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledTimes(2);
  });

  it("returns 0 without calling wrapOrgKeyForPending when server returns empty list", async () => {
    listMock.mockResolvedValue([]);

    const result = await autoWrapPendingUsers(bridge);

    expect(result).toBe(0);
    // exportOrgSecretKey is not called because wrapOrgKeyForPending
    // is never reached (early return after checking pending.length === 0)
    expect(bridge.exportOrgSecretKey).not.toHaveBeenCalled();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("logs summary in dev mode after wrapping users", async () => {
    const users = createPendingUsers(3);
    listMock.mockResolvedValue(users);

    const infoSpy = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);

    await autoWrapPendingUsers(bridge);

    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("[org-key-wrap] wrapped org key for 3/3 users"),
    );
    infoSpy.mockRestore();
  });

  it("logs partial count in dev mode when some wraps fail", async () => {
    const users = createPendingUsers(3);
    listMock.mockResolvedValue(users);
    mutateMock
      .mockResolvedValueOnce({ success: true as const })
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ success: true as const });

    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const infoSpy = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);

    const result = await autoWrapPendingUsers(bridge);

    expect(result).toBe(2);
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("[org-key-wrap] wrapped org key for 2/3 users"),
    );

    warnSpy.mockRestore();
    infoSpy.mockRestore();
  });
});

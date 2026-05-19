import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { getSodium, requireSodium, encode, decode } from "@care-y/crypto";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import {
  wrapOrgKeyForPending,
  autoWrapPendingUsers,
  type PendingWrapUser,
} from "./org-key-wrap.js";

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    keys: {
      wrapOrgKeyForUser: {
        mutate: vi.fn(async () => ({ success: true })),
      },
      listUnwrappedUsers: {
        query: vi.fn(async () => []),
      },
    },
  },
}));

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
      userId: `user-${String(i)}`,
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
});

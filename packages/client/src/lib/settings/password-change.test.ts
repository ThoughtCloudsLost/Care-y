/**
 * Tests for the password change orchestrator.
 *
 * Mocks the tRPC client, CryptoBridge, and OrgKeyManager to verify
 * correct sequencing, batching, and org key re-wrap behavior.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import type {
  PasswordChangeDeps,
  PasswordChangeCallbacks,
  changePassword as ChangePasswordFn,
} from "./password-change.js";

// ── Mocks ────────────────────────────────────────────────────────────

const mockMyTicketKeyWraps = vi.fn();
const mockGetWrappedOrgKey = vi.fn();
const mockChangePassword = vi.fn();
const mockOprfEvaluate = vi.fn();

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    profile: {
      myTicketKeyWraps: { query: mockMyTicketKeyWraps },
      changePassword: { mutate: mockChangePassword },
    },
    keys: {
      getWrappedOrgKey: { query: mockGetWrappedOrgKey },
    },
    oprf: {
      evaluate: { mutate: mockOprfEvaluate },
    },
  },
}));

vi.mock("@care-y/crypto", () => ({
  encode: (bytes: Uint8Array): string =>
    Buffer.from(bytes).toString("base64url"),
}));

// ── Mock CryptoBridge ────────────────────────────────────────────────

interface MockBridge {
  waitReady: ReturnType<typeof vi.fn>;
  argon2id: ReturnType<typeof vi.fn>;
  oprfBlind: ReturnType<typeof vi.fn>;
  deriveKeys: ReturnType<typeof vi.fn>;
  unwrapOrgKey: ReturnType<typeof vi.fn>;
  unwrapTk: ReturnType<typeof vi.fn>;
  rewrapTk: ReturnType<typeof vi.fn>;
  wrapWithVolPublic: ReturnType<typeof vi.fn>;
  zeroAll: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}

function createMockBridge(volPublic = "new-vol-public-b64"): MockBridge {
  return {
    waitReady: vi.fn().mockResolvedValue(undefined),
    argon2id: vi.fn().mockResolvedValue(undefined),
    oprfBlind: vi
      .fn()
      .mockResolvedValue({ blindedElement: "test-blinded-b64" }),
    deriveKeys: vi.fn().mockResolvedValue({ volPublic }),
    unwrapOrgKey: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    unwrapTk: vi.fn().mockResolvedValue(undefined),
    rewrapTk: vi.fn().mockResolvedValue({
      ephemeralPoint: "rewrap-ep",
      nonce: "rewrap-nonce",
      wrappedKey: "rewrap-wk",
    }),
    wrapWithVolPublic: vi.fn().mockResolvedValue({
      ephemeralPoint: "org-ep",
      nonce: "org-nonce",
      wrappedKey: "org-wk",
    }),
    zeroAll: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
  };
}

function asBridge(mock: MockBridge): CryptoBridge {
  return mock as unknown as CryptoBridge;
}

// ── Mock OrgKeyManager ──────────────────────────────────────────────

function createMockOrgKeyManager(): { load: ReturnType<typeof vi.fn> } {
  return { load: vi.fn() };
}

// ── Helpers ─────────────────────────────────────────────────────────

function makeWrap(
  ticketId: string,
  keyGeneration = "kg-1",
): {
  ticketId: string;
  keyGeneration: string;
  ephemeralPoint: string;
  nonce: string;
  wrappedKey: string;
} {
  return {
    ticketId,
    keyGeneration,
    ephemeralPoint: `ep-${ticketId}`,
    nonce: `n-${ticketId}`,
    wrappedKey: `wk-${ticketId}`,
  };
}

function createCallbackSpies(): {
  callbacks: PasswordChangeCallbacks;
  callOrder: string[];
} {
  const callOrder: string[] = [];
  return {
    callbacks: {
      onFetchWraps: vi.fn(() => callOrder.push("fetchWraps")),
      onDeriveNewKeys: vi.fn(() => callOrder.push("deriveNewKeys")),
      onUnwrapOrgKey: vi.fn(() => callOrder.push("unwrapOrgKey")),
      onRewrapKeys: vi.fn((_done: number, _total: number) =>
        callOrder.push("rewrapKeys"),
      ),
      onRederive: vi.fn(() => callOrder.push("rederive")),
      onRewrapOrgKey: vi.fn(() => callOrder.push("rewrapOrgKey")),
      onRotateKeys: vi.fn(() => callOrder.push("rotateKeys")),
      onReloadOrgKey: vi.fn(() => callOrder.push("reloadOrgKey")),
      onDone: vi.fn(() => callOrder.push("done")),
    },
    callOrder,
  };
}

function createDeps(overrides?: Partial<PasswordChangeDeps>): {
  deps: PasswordChangeDeps;
  primaryBridge: MockBridge;
  tempBridge: MockBridge;
  orgKeyManager: ReturnType<typeof createMockOrgKeyManager>;
  callbacks: PasswordChangeCallbacks;
  callOrder: string[];
} {
  const primaryBridge = createMockBridge("primary-new-vol-b64");
  const tempBridge = createMockBridge("temp-new-vol-b64");
  const orgKeyManager = createMockOrgKeyManager();
  const { callbacks, callOrder } = createCallbackSpies();

  const deps: PasswordChangeDeps = {
    primaryBridge: asBridge(primaryBridge),
    orgKeyManager: orgKeyManager as unknown as OrgKeyManager,
    userId: "user-uuid-1",
    currentPassword: "old-secure-password-16chars",
    newPassword: "new-secure-password-16chars",
    callbacks,
    onPowRequired: vi.fn().mockResolvedValue("pow-solution"),
    createTempBridge: vi.fn(() => asBridge(tempBridge)),
    ...overrides,
  };

  return {
    deps,
    primaryBridge,
    tempBridge,
    orgKeyManager,
    callbacks,
    callOrder,
  };
}

// ── Tests ───────────────────────────────────────────────────────────

describe("changePassword", () => {
  let changePassword: typeof ChangePasswordFn;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockMyTicketKeyWraps.mockResolvedValue([]);
    mockGetWrappedOrgKey.mockResolvedValue(null);
    mockChangePassword.mockResolvedValue({ success: true });
    mockOprfEvaluate.mockResolvedValue({
      evaluated: btoa("evaluated-bytes-here!"),
    });

    const mod = await import("./password-change.js");
    changePassword = mod.changePassword;
  });

  describe("callback ordering", () => {
    it("fires callbacks in correct sequence (no wraps, no org key)", async () => {
      const { deps, callOrder } = createDeps();

      await changePassword(deps);

      expect(callOrder).toEqual([
        "fetchWraps",
        "deriveNewKeys",
        "unwrapOrgKey",
        "rewrapKeys",
        "rotateKeys",
        "rederive",
        "reloadOrgKey",
        "done",
      ]);
    });
  });

  describe("temp bridge lifecycle", () => {
    it("creates and destroys the temp bridge", async () => {
      const { deps, tempBridge } = createDeps();

      await changePassword(deps);

      expect(tempBridge.waitReady).toHaveBeenCalledTimes(1);
      expect(tempBridge.argon2id).toHaveBeenCalledTimes(1);
      expect(tempBridge.oprfBlind).toHaveBeenCalledTimes(1);
      expect(tempBridge.deriveKeys).toHaveBeenCalledTimes(1);
      expect(tempBridge.destroy).toHaveBeenCalledTimes(1);
    });

    it("destroys temp bridge even if deriveKeys fails", async () => {
      const { deps, tempBridge } = createDeps();
      tempBridge.deriveKeys.mockRejectedValue(new Error("derive failed"));

      await expect(changePassword(deps)).rejects.toThrow("derive failed");

      expect(tempBridge.destroy).toHaveBeenCalledTimes(1);
    });
  });

  describe("org key re-wrap", () => {
    it("includes reWrappedOrgKey when org key exists", async () => {
      mockGetWrappedOrgKey.mockResolvedValue({
        wrappedKey: "org-wrapped-b64",
        ephemeralPoint: "org-ep-b64",
        nonce: "org-nonce-b64",
      });

      const { deps, primaryBridge, tempBridge } = createDeps();

      await changePassword(deps);

      // Unwrap with OLD keys via primary bridge
      expect(primaryBridge.unwrapOrgKey).toHaveBeenCalledWith(
        "org-wrapped-b64",
        "org-ep-b64",
        "org-nonce-b64",
      );

      // Re-wrap with NEW keys via temp bridge (has new volPublic)
      expect(tempBridge.wrapWithVolPublic).toHaveBeenCalledTimes(1);
      expect(primaryBridge.wrapWithVolPublic).not.toHaveBeenCalled();

      expect(mockChangePassword).toHaveBeenCalledTimes(1);
      const input = mockChangePassword.mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;
      expect(input.reWrappedOrgKey).toEqual({
        ephemeralPoint: "org-ep",
        nonce: "org-nonce",
        wrappedKey: "org-wk",
      });
    });

    it("omits reWrappedOrgKey when org not onboarded (null)", async () => {
      mockGetWrappedOrgKey.mockResolvedValue(null);

      const { deps, primaryBridge, tempBridge } = createDeps();

      await changePassword(deps);

      expect(primaryBridge.unwrapOrgKey).not.toHaveBeenCalled();
      expect(tempBridge.wrapWithVolPublic).not.toHaveBeenCalled();

      const input = mockChangePassword.mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;
      expect(input.reWrappedOrgKey).toBeUndefined();
    });

    it("reloads org key into OrgKeyManager after rotation", async () => {
      mockGetWrappedOrgKey
        .mockResolvedValueOnce({
          wrappedKey: "org-wrapped-b64",
          ephemeralPoint: "org-ep-b64",
          nonce: "org-nonce-b64",
        })
        .mockResolvedValueOnce({
          wrappedKey: "fresh-wrapped-b64", // gitleaks:allow (test fixture, not a real key)
          ephemeralPoint: "fresh-ep-b64",
          nonce: "fresh-nonce-b64",
        });

      const { deps, orgKeyManager } = createDeps();

      await changePassword(deps);

      expect(orgKeyManager.load).toHaveBeenCalledTimes(1);
      expect(orgKeyManager.load).toHaveBeenCalledWith(expect.any(ArrayBuffer));
    });
  });

  describe("ticket key re-wrapping", () => {
    it("unwraps and rewraps each ticket key", async () => {
      mockMyTicketKeyWraps.mockResolvedValue([
        makeWrap("ticket-1"),
        makeWrap("ticket-2"),
      ]);

      const { deps, primaryBridge } = createDeps();

      await changePassword(deps);

      expect(primaryBridge.unwrapTk).toHaveBeenCalledTimes(2);
      expect(primaryBridge.rewrapTk).toHaveBeenCalledTimes(2);

      expect(primaryBridge.unwrapTk).toHaveBeenCalledWith(
        "ticket-1",
        "ep-ticket-1",
        "n-ticket-1",
        "wk-ticket-1",
      );

      expect(primaryBridge.rewrapTk).toHaveBeenCalledWith(
        "ticket-1",
        "temp-new-vol-b64",
      );
    });

    it("batches ticket key processing in groups of 40", async () => {
      const wraps = Array.from({ length: 85 }, (_, i) =>
        makeWrap(`ticket-${String(i)}`),
      );
      mockMyTicketKeyWraps.mockResolvedValue(wraps);

      const { deps, callbacks } = createDeps();

      await changePassword(deps);

      const rewrapCalls = (callbacks.onRewrapKeys as ReturnType<typeof vi.fn>)
        .mock.calls as Array<[number, number]>;
      expect(rewrapCalls).toHaveLength(3);
      expect(rewrapCalls[0]).toEqual([40, 85]);
      expect(rewrapCalls[1]).toEqual([80, 85]);
      expect(rewrapCalls[2]).toEqual([85, 85]);
    });

    it("reports progress for zero wraps", async () => {
      mockMyTicketKeyWraps.mockResolvedValue([]);

      const { deps, callbacks } = createDeps();

      await changePassword(deps);

      expect(callbacks.onRewrapKeys).toHaveBeenCalledWith(0, 0);
    });
  });

  describe("atomic server call", () => {
    it("sends currentPassword, newPassword, and crypto material in one call", async () => {
      mockMyTicketKeyWraps.mockResolvedValue([makeWrap("ticket-1")]);
      mockGetWrappedOrgKey.mockResolvedValue({
        wrappedKey: "org-wrapped-b64",
        ephemeralPoint: "org-ep-b64",
        nonce: "org-nonce-b64",
      });

      const { deps } = createDeps();

      await changePassword(deps);

      expect(mockChangePassword).toHaveBeenCalledTimes(1);
      const input = mockChangePassword.mock.calls[0]?.[0] as Record<
        string,
        unknown
      >;

      expect(input.currentPassword).toBe("old-secure-password-16chars");
      expect(input.newPassword).toBe("new-secure-password-16chars");
      expect(input.saltNew).toEqual(expect.any(String));
      expect(input.volPublicNew).toBe("temp-new-vol-b64");
      expect(input.reWrappedKeys).toHaveLength(1);
      expect(input.reWrappedOrgKey).toBeDefined();
    });

    it("propagates server errors without partial state", async () => {
      mockChangePassword.mockRejectedValue(new Error("server error"));

      const { deps } = createDeps();

      await expect(changePassword(deps)).rejects.toThrow("server error");
    });
  });

  describe("primary bridge re-derivation", () => {
    it("re-derives on primary bridge after server call succeeds", async () => {
      const { deps, primaryBridge } = createDeps();
      const callOrder: string[] = [];

      const track =
        <T>(name: string, value: T) =>
        (): Promise<T> => {
          callOrder.push(name);
          return Promise.resolve(value);
        };

      /* eslint-disable @typescript-eslint/no-misused-promises -- mock bridge methods are async but vi.fn types them as void */
      primaryBridge.zeroAll.mockImplementation(track("zeroAll", undefined));
      primaryBridge.argon2id.mockImplementation(track("argon2id", undefined));
      primaryBridge.oprfBlind.mockImplementation(
        track("oprfBlind", { blindedElement: "blinded-2" }),
      );
      primaryBridge.deriveKeys.mockImplementation(
        track("deriveKeys", { volPublic: "rederived-vol" }),
      );
      /* eslint-enable @typescript-eslint/no-misused-promises */

      await changePassword(deps);

      expect(callOrder).toEqual([
        "zeroAll",
        "argon2id",
        "oprfBlind",
        "deriveKeys",
      ]);
    });

    it("does not re-derive if server call fails", async () => {
      mockChangePassword.mockRejectedValue(new Error("server error"));

      const { deps, primaryBridge } = createDeps();

      await expect(changePassword(deps)).rejects.toThrow("server error");

      expect(primaryBridge.zeroAll).not.toHaveBeenCalled();
    });
  });
});

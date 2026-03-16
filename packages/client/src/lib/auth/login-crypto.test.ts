/**
 * Tests for the login crypto flow orchestration.
 *
 * Mocks the tRPC client and CryptoBridge to verify the correct sequence
 * of calls and data flow without real crypto or network operations.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type {
  LoginCryptoCallbacks,
  loginCrypto as LoginCryptoFn,
} from "./login-crypto.js";

// ── Mocks ────────────────────────────────────────────────────────────

// Mock tRPC client
const mockGetSalt = vi.fn();
const mockOprfEvaluate = vi.fn();
const mockGetWrappedOrgKey = vi.fn();

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    auth: {
      getSalt: { query: mockGetSalt },
    },
    oprf: {
      evaluate: { mutate: mockOprfEvaluate },
    },
    keys: {
      getWrappedOrgKey: { query: mockGetWrappedOrgKey },
    },
  },
}));

// Mock @care-y/crypto decode (url-safe base64 -> Uint8Array)
vi.mock("@care-y/crypto", () => ({
  decode: (s: string): Uint8Array => {
    return new TextEncoder().encode(s);
  },
}));

// ── Mock CryptoBridge ────────────────────────────────────────────────

interface MockBridge {
  argon2id: ReturnType<typeof vi.fn>;
  oprfBlind: ReturnType<typeof vi.fn>;
  deriveKeys: ReturnType<typeof vi.fn>;
  unwrapOrgKey: ReturnType<typeof vi.fn>;
}

function createMockBridge(): MockBridge {
  return {
    argon2id: vi.fn().mockResolvedValue(undefined),
    oprfBlind: vi
      .fn()
      .mockResolvedValue({ blindedElement: "blineded-element-b64" }),
    deriveKeys: vi.fn().mockResolvedValue({ volPublic: "vol-public-b64" }),
    unwrapOrgKey: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

function createCallbackSpies(): {
  callbacks: LoginCryptoCallbacks;
  callOrder: string[];
} {
  const callOrder: string[] = [];
  return {
    callbacks: {
      onArgon2idStart: vi.fn(() => callOrder.push("argon2idStart")),
      onArgon2idDone: vi.fn(() => callOrder.push("argon2idDone")),
      onOprfStart: vi.fn(() => callOrder.push("oprfStart")),
      onOprfDone: vi.fn(() => callOrder.push("oprfDone")),
      onDeriveStart: vi.fn(() => callOrder.push("deriveStart")),
      onDone: vi.fn(() => callOrder.push("done")),
      onPowRequired: vi.fn().mockResolvedValue("pow-solution"),
    },
    callOrder,
  };
}

/** Cast mock bridge to CryptoBridge for passing to loginCrypto. */
function asBridge(mock: MockBridge): CryptoBridge {
  return mock as unknown as CryptoBridge;
}

// ── Tests ────────────────────────────────────────────────────────────

describe("loginCrypto", () => {
  let mockBridge: MockBridge;
  let loginCrypto: typeof LoginCryptoFn;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockBridge = createMockBridge();

    // Default tRPC mock responses
    mockGetSalt.mockResolvedValue({
      salt: "test-salt-b64",
      userId: "550e8400-e29b-41d4-a716-446655440000",
    });
    mockOprfEvaluate.mockResolvedValue({
      evaluated: btoa("evaluated-bytes-here!"),
    });
    mockGetWrappedOrgKey.mockResolvedValue({
      wrappedKey: "wrapped-key-b64",
      ephemeralPoint: "ephemeral-point-b64",
      nonce: "nonce-b64",
    });

    // Dynamic import to pick up mocks
    const mod = await import("./login-crypto.js");
    loginCrypto = mod.loginCrypto;
  });

  describe("happy path", () => {
    it("completes full flow and returns volPublic + orgPrivateKey", async () => {
      const { callbacks } = createCallbackSpies();

      const result = await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(result.volPublic).toBe("vol-public-b64");
      expect(result.orgPrivateKey).toBeInstanceOf(ArrayBuffer);
      expect(result.orgPrivateKey?.byteLength).toBe(32);
    });

    it("calls getSalt with the identifier", async () => {
      const { callbacks } = createCallbackSpies();

      await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(mockGetSalt).toHaveBeenCalledWith({ identifier: "testuser" });
    });

    it("transfers password and salt as ArrayBuffers to bridge.argon2id", async () => {
      const { callbacks } = createCallbackSpies();

      await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(mockBridge.argon2id).toHaveBeenCalledTimes(1);
      const [passwordArg, saltArg] = mockBridge.argon2id.mock.calls[0] as [
        ArrayBuffer,
        ArrayBuffer,
      ];
      expect(passwordArg).toBeInstanceOf(ArrayBuffer);
      expect(saltArg).toBeInstanceOf(ArrayBuffer);
    });

    it("sends userId from getSalt to OPRF evaluate", async () => {
      const { callbacks } = createCallbackSpies();

      await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(mockOprfEvaluate).toHaveBeenCalledWith({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        blindedElement: "blineded-element-b64",
      });
    });

    it("transfers evaluated bytes to bridge.deriveKeys as ArrayBuffer", async () => {
      const { callbacks } = createCallbackSpies();

      await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(mockBridge.deriveKeys).toHaveBeenCalledTimes(1);
      const [evalArg] = mockBridge.deriveKeys.mock.calls[0] as [ArrayBuffer];
      expect(evalArg).toBeInstanceOf(ArrayBuffer);
    });

    it("fetches and unwraps org key after deriveKeys", async () => {
      const { callbacks } = createCallbackSpies();

      await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(mockGetWrappedOrgKey).toHaveBeenCalledTimes(1);
      expect(mockBridge.unwrapOrgKey).toHaveBeenCalledWith(
        "wrapped-key-b64",
        "ephemeral-point-b64",
        "nonce-b64",
      );
    });
  });

  describe("callback ordering", () => {
    it("fires callbacks in correct sequence", async () => {
      const { callbacks, callOrder } = createCallbackSpies();

      await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(callOrder).toEqual([
        "argon2idStart",
        "argon2idDone",
        "oprfStart",
        "oprfDone",
        "deriveStart",
        "done",
      ]);
    });
  });

  describe("PoW challenge", () => {
    it("retries with PoW solution when OPRF returns POW_REQUIRED", async () => {
      const powError = {
        data: {
          code: "POW_REQUIRED",
          challenge: "challenge-hex",
          difficulty: 16,
        },
      };
      mockOprfEvaluate.mockRejectedValueOnce(powError).mockResolvedValueOnce({
        evaluated: btoa("evaluated-after-pow!!"),
      });

      const { callbacks } = createCallbackSpies();

      const result = await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(callbacks.onPowRequired).toHaveBeenCalledWith("challenge-hex", 16);

      expect(mockOprfEvaluate).toHaveBeenCalledTimes(2);
      expect(mockOprfEvaluate).toHaveBeenLastCalledWith({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        blindedElement: "blineded-element-b64",
        powChallenge: "challenge-hex",
        powSolution: "pow-solution",
      });

      expect(result.volPublic).toBe("vol-public-b64");
    });
  });

  describe("OPRF rate limit (non-PoW error)", () => {
    it("propagates non-PoW OPRF errors to the caller", async () => {
      const rateLimitError = new Error("Too many requests");
      mockOprfEvaluate.mockRejectedValue(rateLimitError);

      const { callbacks } = createCallbackSpies();

      await expect(
        loginCrypto(
          "testuser",
          "securepassword1234",
          asBridge(mockBridge),
          callbacks,
        ),
      ).rejects.toThrow("Too many requests");

      expect(callbacks.onPowRequired).not.toHaveBeenCalled();
    });
  });

  describe("org key unavailable", () => {
    it("returns null orgPrivateKey when getWrappedOrgKey returns null", async () => {
      mockGetWrappedOrgKey.mockResolvedValue(null);

      const { callbacks } = createCallbackSpies();

      const result = await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(result.orgPrivateKey).toBeNull();
      expect(mockBridge.unwrapOrgKey).not.toHaveBeenCalled();
    });

    it("returns null orgPrivateKey when getWrappedOrgKey throws", async () => {
      mockGetWrappedOrgKey.mockRejectedValue(new Error("Network error"));

      const { callbacks } = createCallbackSpies();

      const result = await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(result.orgPrivateKey).toBeNull();
      expect(callbacks.onDone).toHaveBeenCalled();
    });

    it("returns null orgPrivateKey when unwrapOrgKey throws", async () => {
      mockBridge.unwrapOrgKey.mockRejectedValue(new Error("Unwrap failed"));

      const { callbacks } = createCallbackSpies();

      const result = await loginCrypto(
        "testuser",
        "securepassword1234",
        asBridge(mockBridge),
        callbacks,
      );

      expect(result.orgPrivateKey).toBeNull();
      expect(callbacks.onDone).toHaveBeenCalled();
    });
  });

  describe("getSalt failure", () => {
    it("propagates getSalt errors (before any crypto work)", async () => {
      mockGetSalt.mockRejectedValue(new Error("Org not found"));

      const { callbacks } = createCallbackSpies();

      await expect(
        loginCrypto(
          "testuser",
          "securepassword1234",
          asBridge(mockBridge),
          callbacks,
        ),
      ).rejects.toThrow("Org not found");

      expect(callbacks.onArgon2idStart).not.toHaveBeenCalled();
      expect(mockBridge.argon2id).not.toHaveBeenCalled();
    });
  });

  describe("bridge failure", () => {
    it("propagates argon2id Worker errors", async () => {
      mockBridge.argon2id.mockRejectedValue(new Error("Worker crashed"));

      const { callbacks } = createCallbackSpies();

      await expect(
        loginCrypto(
          "testuser",
          "securepassword1234",
          asBridge(mockBridge),
          callbacks,
        ),
      ).rejects.toThrow("Worker crashed");
    });

    it("propagates deriveKeys Worker errors", async () => {
      mockBridge.deriveKeys.mockRejectedValue(
        new Error("OPRF finalize failed"),
      );

      const { callbacks } = createCallbackSpies();

      await expect(
        loginCrypto(
          "testuser",
          "securepassword1234",
          asBridge(mockBridge),
          callbacks,
        ),
      ).rejects.toThrow("OPRF finalize failed");
    });
  });
});

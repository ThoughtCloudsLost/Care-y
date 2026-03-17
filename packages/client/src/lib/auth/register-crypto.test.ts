/**
 * Tests for the account creation crypto flow.
 *
 * Mocks the tRPC client and @care-y/crypto to verify:
 * - Correct call sequence (generateSalt -> Argon2id -> OPRF -> derive -> upload)
 * - All intermediate key material is zeroed via memzero (4 calls)
 * - Zeroing happens even on OPRF or upload failure (try/finally)
 * - Callbacks fire in order
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  RegisterCryptoCallbacks,
  registerCrypto as RegisterCryptoFn,
} from "./register-crypto.js";

// ── Mocks ────────────────────────────────────────────────────────────

const mockOprfEvaluate = vi.fn();
const mockInitCryptoKeys = vi.fn();

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    oprf: {
      evaluate: { mutate: mockOprfEvaluate },
    },
    keys: {
      initCryptoKeys: { mutate: mockInitCryptoKeys },
    },
  },
}));

// Mock @care-y/crypto with trackable functions
const mockMemzero = vi.fn();
const mockSalt = new Uint8Array([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
]);
const mockStretched = new Uint8Array(32).fill(0xaa);
const mockBlindedElement = new Uint8Array(32).fill(0xbb);
const mockBlindState = new Uint8Array(32).fill(0xcc);
const mockOprfOutput = new Uint8Array(64).fill(0xdd);
const mockMasterKey = new Uint8Array(32).fill(0xee);
const mockVolPrivate = new Uint8Array(32).fill(0x11);
const mockVolPublic = new Uint8Array(32).fill(0x22);

vi.mock("@care-y/crypto", () => ({
  getSodium: vi.fn().mockResolvedValue({ memzero: mockMemzero }),
  generateSalt: vi.fn(() => mockSalt),
  deriveAccountKey: vi.fn(() => mockStretched),
  oprfBlind: vi.fn(() => ({
    blindedElement: mockBlindedElement,
    blindState: mockBlindState,
  })),
  oprfFinalize: vi.fn(() => mockOprfOutput),
  deriveMasterKey: vi.fn(() => mockMasterKey),
  deriveVolunteerPrivateKey: vi.fn(() => mockVolPrivate),
  deriveVolunteerPublicKey: vi.fn(() => mockVolPublic),
  toRistrettoPoint: vi.fn((buf: Uint8Array) => buf),
  encode: vi.fn((buf: Uint8Array) => {
    // Deterministic fake base64 based on first byte
    const tag = buf[0]?.toString(16) ?? "00";
    return `b64-${tag}`;
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────────

const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_PASSWORD = "securepassword1234";

function createCallbackSpies(): {
  callbacks: RegisterCryptoCallbacks;
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
      onUploadStart: vi.fn(() => callOrder.push("uploadStart")),
      onDone: vi.fn(() => callOrder.push("done")),
    },
    callOrder,
  };
}

// ── Tests ────────────────────────────────────────────────────────────

describe("registerCrypto", () => {
  let registerCrypto: typeof RegisterCryptoFn;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Default tRPC mock responses
    mockOprfEvaluate.mockResolvedValue({
      evaluated: btoa("evaluated-bytes-here!"),
    });
    mockInitCryptoKeys.mockResolvedValue({ success: true });

    // Dynamic import to pick up mocks
    const mod = await import("./register-crypto.js");
    registerCrypto = mod.registerCrypto;
  });

  describe("happy path", () => {
    it("completes full flow and returns salt + volPublic", async () => {
      const { callbacks } = createCallbackSpies();

      const result = await registerCrypto(
        TEST_USER_ID,
        TEST_PASSWORD,
        callbacks,
      );

      expect(result.salt).toBe("b64-1");
      expect(result.volPublic).toBe("b64-22");
    });

    it("calls OPRF evaluate with userId and encoded blindedElement", async () => {
      const { callbacks } = createCallbackSpies();

      await registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks);

      expect(mockOprfEvaluate).toHaveBeenCalledWith({
        userId: TEST_USER_ID,
        blindedElement: "b64-bb",
      });
    });

    it("calls initCryptoKeys with encoded salt and volPublic", async () => {
      const { callbacks } = createCallbackSpies();

      await registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks);

      expect(mockInitCryptoKeys).toHaveBeenCalledWith({
        salt: "b64-1",
        volPublic: "b64-22",
      });
    });
  });

  describe("callback ordering", () => {
    it("fires callbacks in correct sequence", async () => {
      const { callbacks, callOrder } = createCallbackSpies();

      await registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks);

      expect(callOrder).toEqual([
        "argon2idStart",
        "argon2idDone",
        "oprfStart",
        "oprfDone",
        "deriveStart",
        "uploadStart",
        "done",
      ]);
    });
  });

  describe("intermediate zeroing", () => {
    it("zeros all 4 intermediate buffers on success", async () => {
      const { callbacks } = createCallbackSpies();

      await registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks);

      expect(mockMemzero).toHaveBeenCalledTimes(4);
      expect(mockMemzero).toHaveBeenCalledWith(mockStretched);
      expect(mockMemzero).toHaveBeenCalledWith(mockOprfOutput);
      expect(mockMemzero).toHaveBeenCalledWith(mockMasterKey);
      expect(mockMemzero).toHaveBeenCalledWith(mockVolPrivate);
    });

    it("zeros stretched when OPRF evaluate fails (later intermediates not yet allocated)", async () => {
      mockOprfEvaluate.mockRejectedValue(new Error("OPRF server down"));
      const { callbacks } = createCallbackSpies();

      await expect(
        registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks),
      ).rejects.toThrow("OPRF server down");

      // OPRF evaluate fails after Argon2id but before oprfFinalize.
      // Only stretched was allocated. The finally block null-checks
      // each intermediate and only zeros what exists.
      expect(mockMemzero).toHaveBeenCalledTimes(1);
      expect(mockMemzero).toHaveBeenCalledWith(mockStretched);
    });

    it("zeros intermediates even when upload fails", async () => {
      mockInitCryptoKeys.mockRejectedValue(new Error("Upload failed"));
      const { callbacks } = createCallbackSpies();

      await expect(
        registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks),
      ).rejects.toThrow("Upload failed");

      // All 4 intermediates were created before the upload attempt.
      expect(mockMemzero).toHaveBeenCalledTimes(4);
      expect(mockMemzero).toHaveBeenCalledWith(mockStretched);
      expect(mockMemzero).toHaveBeenCalledWith(mockOprfOutput);
      expect(mockMemzero).toHaveBeenCalledWith(mockMasterKey);
      expect(mockMemzero).toHaveBeenCalledWith(mockVolPrivate);
    });
  });

  describe("error propagation", () => {
    it("propagates OPRF evaluate errors to the caller", async () => {
      mockOprfEvaluate.mockRejectedValue(new Error("Rate limited"));
      const { callbacks } = createCallbackSpies();

      await expect(
        registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks),
      ).rejects.toThrow("Rate limited");

      // Callbacks before the error still fire
      expect(callbacks.onArgon2idStart).toHaveBeenCalled();
      expect(callbacks.onArgon2idDone).toHaveBeenCalled();
      expect(callbacks.onOprfStart).toHaveBeenCalled();
      // Callbacks after the error do not fire
      expect(callbacks.onOprfDone).not.toHaveBeenCalled();
      expect(callbacks.onDeriveStart).not.toHaveBeenCalled();
    });

    it("propagates initCryptoKeys errors to the caller", async () => {
      mockInitCryptoKeys.mockRejectedValue(
        new Error("Crypto keys already initialized"),
      );
      const { callbacks } = createCallbackSpies();

      await expect(
        registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks),
      ).rejects.toThrow("Crypto keys already initialized");

      // Upload callback fires, but onDone does not
      expect(callbacks.onUploadStart).toHaveBeenCalled();
      expect(callbacks.onDone).not.toHaveBeenCalled();
    });
  });

  describe("derivation chain", () => {
    it("passes password bytes to deriveAccountKey", async () => {
      const { callbacks } = createCallbackSpies();
      const { deriveAccountKey } = await import("@care-y/crypto");

      await registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks);

      expect(deriveAccountKey).toHaveBeenCalledTimes(1);
      const [passwordArg, saltArg] = (
        deriveAccountKey as ReturnType<typeof vi.fn>
      ).mock.calls[0] as [Uint8Array, Uint8Array];
      // Password was encoded to UTF-8 bytes
      expect(passwordArg).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(passwordArg)).toBe(TEST_PASSWORD);
      // Salt is the generated salt
      expect(saltArg).toBe(mockSalt);
    });

    it("passes stretched to oprfBlind", async () => {
      const { callbacks } = createCallbackSpies();
      const { oprfBlind } = await import("@care-y/crypto");

      await registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks);

      expect(oprfBlind).toHaveBeenCalledWith(mockStretched);
    });

    it("passes blindState and evaluated to oprfFinalize", async () => {
      const { callbacks } = createCallbackSpies();
      const { oprfFinalize } = await import("@care-y/crypto");

      await registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks);

      expect(oprfFinalize).toHaveBeenCalledTimes(1);
      const [blindStateArg, , stretchedArg] = (
        oprfFinalize as ReturnType<typeof vi.fn>
      ).mock.calls[0] as [Uint8Array, Uint8Array, Uint8Array];
      expect(blindStateArg).toBe(mockBlindState);
      expect(stretchedArg).toBe(mockStretched);
    });
  });
});

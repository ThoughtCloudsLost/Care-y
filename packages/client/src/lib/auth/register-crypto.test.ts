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
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as CryptoPkg from "@care-y/crypto";

// ── Mocks ────────────────────────────────────────────────────────────

// vi.mock required: $lib/trpc/index.js resolves to a SvelteKit $lib alias
// that creates a live tRPC HTTP client on import. Without a running server
// the import fails. vi.spyOn requires a successful import first.
const mockOprfEvaluate = vi.fn();
const mockInitCryptoKeys = vi.fn();

vi.mock("$lib/trpc/index.js", () => {
  // The real `trpc` export is a TRPCClient<AppRouter> proxy; only the two
  // procedures this flow touches are stubbed, so the deep shape is cast.
  // The factory-level `satisfies` still pins the module's export names and
  // the signatures of the non-proxy exports.
  const mockTrpc = {
    oprf: {
      evaluate: { mutate: mockOprfEvaluate },
    },
    keys: {
      initCryptoKeys: { mutate: mockInitCryptoKeys },
    },
  } as unknown as typeof TrpcModule.trpc;
  return {
    trpc: mockTrpc,
    setDevDelay: vi.fn(),
    isDevDelayEnabled: vi.fn(() => false),
  } satisfies typeof TrpcModule;
});

// vi.mock required: registerCrypto binds these functions at import time,
// so vi.spyOn after import wouldn't intercept the already-bound references,
// and this test must control 10+ primitives to verify call sequence and
// zeroing. The factory spreads importOriginal so unstubbed exports (error
// classes, constants, helpers) stay real and the mock cannot drift from
// the module surface; the one-time libsodium load cost is already paid by
// org-key-wrap.test.ts, which uses the real barrel.
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

vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoPkg>()),
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
  zeroAll: vi.fn((...buffers: Array<Uint8Array | null>) => {
    for (const buf of buffers) {
      if (buf !== null) mockMemzero(buf);
    }
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
    // Ordering is a UI contract: the loading progress bar drives off these callbacks firing in this sequence. Reordering would break the UX state machine.
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
    // SEC-206/SEC-207: all intermediate key buffers must be zeroed in the finally block. Call-count and specific-buffer assertions guard against accidentally dropping a zero() call during refactors.
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

  describe("intermediate zeroing (byte-level verification)", () => {
    // SEC-206/SEC-207: beyond call-count verification, confirm the actual
    // buffer bytes are zeroed after the finally block runs. Uses fresh
    // per-test buffers so zeroing doesn't pollute module-level fixtures.

    it("zeros all intermediate buffer bytes on OPRF failure", async () => {
      // Fresh buffers so zeroing is observable without affecting other tests
      const localStretched = new Uint8Array(32).fill(0xfa);

      const { deriveAccountKey, zeroAll } = await import("@care-y/crypto");
      (deriveAccountKey as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        localStretched,
      );
      // Make zeroAll actually zero the buffers for this test. All overrides
      // in this describe use the Once variants: the file's beforeEach only
      // clears call history (vi.clearAllMocks), so a persistent override
      // would leak zeroed buffers into every later test in the file.
      (zeroAll as ReturnType<typeof vi.fn>).mockImplementationOnce(
        (...buffers: Array<Uint8Array | null>) => {
          for (const buf of buffers) {
            if (buf !== null) buf.fill(0);
          }
        },
      );

      mockOprfEvaluate.mockRejectedValue(new Error("OPRF timeout"));
      const { callbacks } = createCallbackSpies();

      await expect(
        registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks),
      ).rejects.toThrow("OPRF timeout");

      // stretched was the only allocated intermediate before the OPRF call
      expect(localStretched.every((b) => b === 0)).toBe(true);
    });

    it("zeros all four intermediate buffer bytes on upload failure", async () => {
      const localStretched = new Uint8Array(32).fill(0xf1);
      const localOprfOut = new Uint8Array(64).fill(0xf2);
      const localMaster = new Uint8Array(32).fill(0xf3);
      const localVolPriv = new Uint8Array(32).fill(0xf4);

      const {
        deriveAccountKey,
        oprfFinalize,
        deriveMasterKey,
        deriveVolunteerPrivateKey,
        zeroAll,
      } = await import("@care-y/crypto");

      (deriveAccountKey as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        localStretched,
      );
      (oprfFinalize as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        localOprfOut,
      );
      (deriveMasterKey as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        localMaster,
      );
      (
        deriveVolunteerPrivateKey as ReturnType<typeof vi.fn>
      ).mockReturnValueOnce(localVolPriv);
      (zeroAll as ReturnType<typeof vi.fn>).mockImplementationOnce(
        (...buffers: Array<Uint8Array | null>) => {
          for (const buf of buffers) {
            if (buf !== null) buf.fill(0);
          }
        },
      );

      mockInitCryptoKeys.mockRejectedValue(new Error("server rejected"));
      const { callbacks } = createCallbackSpies();

      await expect(
        registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks),
      ).rejects.toThrow("server rejected");

      expect(localStretched.every((b) => b === 0)).toBe(true);
      expect(localOprfOut.every((b) => b === 0)).toBe(true);
      expect(localMaster.every((b) => b === 0)).toBe(true);
      expect(localVolPriv.every((b) => b === 0)).toBe(true);
    });
  });

  describe("callback ordering on failure", () => {
    it("fires only argon2id + oprf-start callbacks when OPRF fails", async () => {
      mockOprfEvaluate.mockRejectedValue(new Error("OPRF down"));
      const { callbacks, callOrder } = createCallbackSpies();

      await expect(
        registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks),
      ).rejects.toThrow("OPRF down");

      expect(callOrder).toEqual(["argon2idStart", "argon2idDone", "oprfStart"]);
    });

    it("fires through uploadStart but not onDone when upload fails", async () => {
      mockInitCryptoKeys.mockRejectedValue(new Error("upload rejected"));
      const { callbacks, callOrder } = createCallbackSpies();

      await expect(
        registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks),
      ).rejects.toThrow("upload rejected");

      expect(callOrder).toEqual([
        "argon2idStart",
        "argon2idDone",
        "oprfStart",
        "oprfDone",
        "deriveStart",
        "uploadStart",
      ]);
      // onDone must NOT be in the list (it fires after the upload succeeds)
      expect(callOrder).not.toContain("done");
    });
  });

  describe("zeroAll receives exact buffer references", () => {
    // Verifies that zeroAll is called with the exact Uint8Array instances
    // produced by the derivation chain, not copies. If registerCrypto
    // accidentally passed a slice or re-encoded buffer, zeroing would
    // miss the original allocation.
    it("passes the same buffer references that the derivation chain produced", async () => {
      const { callbacks } = createCallbackSpies();
      const { zeroAll } = await import("@care-y/crypto");

      await registerCrypto(TEST_USER_ID, TEST_PASSWORD, callbacks);

      expect(zeroAll).toHaveBeenCalledTimes(1);
      const args = (zeroAll as ReturnType<typeof vi.fn>).mock
        .calls[0] as Array<Uint8Array | null>;
      // The four intermediates are passed by reference identity
      expect(args).toContain(mockStretched);
      expect(args).toContain(mockOprfOutput);
      expect(args).toContain(mockMasterKey);
      expect(args).toContain(mockVolPrivate);
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

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LoginCryptoCallbacks } from "./login-crypto.js";

// Mock the crypto-context module to avoid real Worker construction
vi.mock("./crypto-context.js", () => {
  let keyedResolved = false;
  const cachedResult = {
    volPublic: "real-vol-public-b64",
    orgPublicKey: "real-org-public-b64",
  };

  return {
    ensureKeyed: vi.fn(async () => {
      keyedResolved = true;
    }),
    getEnsureKeyedResult: vi.fn(() => {
      if (!keyedResolved) return null;
      return cachedResult;
    }),
  };
});

const { loginCrypto, setLoginCryptoStageListener } =
  await import("./login-crypto.js");

// loginCrypto does not actually use the bridge; cast null for the test
const fakeBridge = null as never;

function makeCallbacks(): {
  callbacks: LoginCryptoCallbacks;
  calls: string[];
} {
  const calls: string[] = [];
  return {
    calls,
    callbacks: {
      onArgon2idStart: () => calls.push("argon2idStart"),
      onArgon2idDone: () => calls.push("argon2idDone"),
      onOprfStart: () => calls.push("oprfStart"),
      onOprfDone: () => calls.push("oprfDone"),
      onDeriveStart: () => calls.push("deriveStart"),
      onDone: () => calls.push("done"),
      onPowRequired: vi.fn(),
    },
  };
}

describe("loginCrypto (choreography over ensureKeyed)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("calls callbacks in the correct order", async () => {
    const { callbacks, calls } = makeCallbacks();
    const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
    // Advance past all pacing delays (1500 + 1500 + 1200 = 4200ms)
    await vi.advanceTimersByTimeAsync(4200);
    await promise;
    expect(calls).toEqual([
      "argon2idStart",
      "argon2idDone",
      "oprfStart",
      "oprfDone",
      "deriveStart",
      "done",
    ]);
  });

  it("never calls onPowRequired", async () => {
    const { callbacks } = makeCallbacks();
    const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
    await vi.advanceTimersByTimeAsync(4200);
    await promise;
    expect(callbacks.onPowRequired).not.toHaveBeenCalled();
  });

  it("returns the REAL result from ensureKeyed", async () => {
    const { callbacks } = makeCallbacks();
    const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
    await vi.advanceTimersByTimeAsync(4200);
    const result = await promise;
    expect(result.volPublic).toBe("real-vol-public-b64");
    expect(result.orgPublicKey).toBe("real-org-public-b64");
  });

  it("fires the stage listener for each crypto phase", async () => {
    const stages: string[] = [];
    setLoginCryptoStageListener((s) => stages.push(s));

    const { callbacks } = makeCallbacks();
    const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
    await vi.advanceTimersByTimeAsync(4200);
    await promise;

    expect(stages).toEqual(["argon2id", "oprf", "derive", "done"]);

    setLoginCryptoStageListener(null);
  });

  it("total pacing is approximately 4.2 seconds", async () => {
    const { callbacks, calls } = makeCallbacks();
    const promise = loginCrypto("user", "pass", fakeBridge, callbacks);

    // At 3s, derive should not have started onDone
    await vi.advanceTimersByTimeAsync(3000);
    expect(calls).toContain("oprfDone");
    expect(calls).not.toContain("done");

    // At 4.2s, should be complete
    await vi.advanceTimersByTimeAsync(1200);
    await promise;
    expect(calls).toContain("done");
  });

  vi.useRealTimers();
});

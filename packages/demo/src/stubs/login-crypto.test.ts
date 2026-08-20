import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LoginCryptoCallbacks } from "./login-crypto.js";
import { resetFlowEvents, subscribeFlowEvents } from "../lib/flow-events.js";
import type { DemoFlowEvent } from "../lib/bridge.js";

/** Collect flow events via subscription into a local array. */
function collectFlowEvents(): DemoFlowEvent[] {
  const events: DemoFlowEvent[] = [];
  subscribeFlowEvents((event) => {
    events.push(event);
  });
  return events;
}

// Mock the crypto-context module to avoid real Worker construction.
// The specifier must match the stub's own import exactly
// ("./crypto-context.svelte.js"); a mismatched path lets the real
// module load and die on its circular trpc registration.
vi.mock("./crypto-context.svelte.js", () => {
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
    getDerivationRecording: vi.fn(() => [
      {
        lane: "server",
        direction: "up",
        label: "route auth.getSalt",
        seamKey: null,
        payloadPreview: null,
        durationMs: null,
      },
      {
        lane: "server",
        direction: "down",
        label: "route auth.getSalt",
        seamKey: null,
        payloadPreview: null,
        durationMs: 28,
      },
      {
        lane: "server",
        direction: "up",
        label: "route auth.oprfEvaluate",
        seamKey: null,
        payloadPreview: null,
        durationMs: null,
      },
      {
        lane: "server",
        direction: "down",
        label: "route auth.oprfEvaluate",
        seamKey: null,
        payloadPreview: null,
        durationMs: 137,
      },
      {
        lane: "server",
        direction: "up",
        label: "route keys.orgKey.get",
        seamKey: null,
        payloadPreview: null,
        durationMs: null,
      },
      {
        lane: "server",
        direction: "down",
        label: "route keys.orgKey.get",
        seamKey: null,
        payloadPreview: null,
        durationMs: 15,
      },
    ]),
  };
});

const { loginCrypto, setLoginCryptoStageListener, isPacedLoginInFlight } =
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
    resetFlowEvents();
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

  it("emits one flow event per phase under the login-pacing seam", async () => {
    const flow = collectFlowEvents();
    const { callbacks } = makeCallbacks();
    const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
    await vi.advanceTimersByTimeAsync(4200);
    await promise;

    const paced = flow.filter((e) => e.seamKey === "login-pacing");
    expect(paced.map((e) => e.label)).toEqual([
      "argon2id start",
      "argon2id done",
      "oprf start",
      "oprf done",
      "derive start",
      "derive done",
    ]);
    expect(paced.every((e) => e.lane === "crypto")).toBe(true);
    expect(paced.every((e) => e.direction === "local")).toBe(true);
  });

  it("reports paced flight from entry until the choreography settles", async () => {
    expect(isPacedLoginInFlight()).toBe(false);

    const { callbacks } = makeCallbacks();
    const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
    expect(isPacedLoginInFlight()).toBe(true);

    // Mid-pacing the flag stays set
    await vi.advanceTimersByTimeAsync(3000);
    expect(isPacedLoginInFlight()).toBe(true);

    await vi.advanceTimersByTimeAsync(1200);
    await promise;
    expect(isPacedLoginInFlight()).toBe(false);
  });

  it("clears paced flight when the choreography rejects", async () => {
    // getEnsureKeyedResult returns null until ensureKeyed resolves;
    // resolving pacing before the mocked ensureKeyed settles is not
    // reachable, so force the throw via a listener that explodes.
    setLoginCryptoStageListener(() => {
      throw new Error("listener boom");
    });

    const { callbacks } = makeCallbacks();
    await expect(
      loginCrypto("user", "pass", fakeBridge, callbacks),
    ).rejects.toThrow("listener boom");
    expect(isPacedLoginInFlight()).toBe(false);

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

  describe("recorded derivation replay", () => {
    it("replays recorded server spans under recorded-derivation seam key", async () => {
      const flow = collectFlowEvents();
      const { callbacks } = makeCallbacks();
      const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
      await vi.advanceTimersByTimeAsync(4200);
      await promise;

      const replayed = flow.filter((e) => e.seamKey === "recorded-derivation");
      expect(replayed.length).toBe(6);
      expect(replayed.every((e) => e.lane === "server")).toBe(true);
    });

    it("aligns getSalt spans to the argon2id phase", async () => {
      const flow = collectFlowEvents();
      const { callbacks } = makeCallbacks();
      const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
      await vi.advanceTimersByTimeAsync(4200);
      await promise;

      const allLabels = flow.map((e) => e.label);
      // getSalt spans should appear after "argon2id start" and before "argon2id done"
      const argonStart = allLabels.indexOf("argon2id start");
      const argonDone = allLabels.indexOf("argon2id done");
      const saltUp = allLabels.indexOf("route auth.getSalt");
      expect(saltUp).toBeGreaterThan(argonStart);
      expect(saltUp).toBeLessThan(argonDone);
    });

    it("aligns oprfEvaluate spans to the oprf phase", async () => {
      const flow = collectFlowEvents();
      const { callbacks } = makeCallbacks();
      const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
      await vi.advanceTimersByTimeAsync(4200);
      await promise;

      const allLabels = flow.map((e) => e.label);
      const oprfStart = allLabels.indexOf("oprf start");
      const oprfDone = allLabels.indexOf("oprf done");
      const oprfUp = allLabels.indexOf("route auth.oprfEvaluate");
      expect(oprfUp).toBeGreaterThan(oprfStart);
      expect(oprfUp).toBeLessThan(oprfDone);
    });

    it("aligns orgKey spans to the derive phase", async () => {
      const flow = collectFlowEvents();
      const { callbacks } = makeCallbacks();
      const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
      await vi.advanceTimersByTimeAsync(4200);
      await promise;

      const allLabels = flow.map((e) => e.label);
      const deriveStart = allLabels.indexOf("derive start");
      const deriveDone = allLabels.indexOf("derive done");
      const orgKeyUp = allLabels.indexOf("route keys.orgKey.get");
      expect(orgKeyUp).toBeGreaterThan(deriveStart);
      expect(orgKeyUp).toBeLessThan(deriveDone);
    });

    it("preserves real measured durationMs on replayed spans", async () => {
      const flow = collectFlowEvents();
      const { callbacks } = makeCallbacks();
      const promise = loginCrypto("user", "pass", fakeBridge, callbacks);
      await vi.advanceTimersByTimeAsync(4200);
      await promise;

      const replayed = flow.filter((e) => e.seamKey === "recorded-derivation");
      const saltResponse = replayed.find(
        (e) => e.label === "route auth.getSalt" && e.direction === "down",
      );
      expect(saltResponse?.durationMs).toBe(28);

      const oprfResponse = replayed.find(
        (e) => e.label === "route auth.oprfEvaluate" && e.direction === "down",
      );
      expect(oprfResponse?.durationMs).toBe(137);

      const orgKeyResponse = replayed.find(
        (e) => e.label === "route keys.orgKey.get" && e.direction === "down",
      );
      expect(orgKeyResponse?.durationMs).toBe(15);
    });
  });

  vi.useRealTimers();
});

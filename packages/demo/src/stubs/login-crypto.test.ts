import { describe, it, expect, vi } from "vitest";
import {
  loginCrypto,
  setLoginCryptoStageListener,
  type LoginCryptoCallbacks,
} from "./login-crypto.js";

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

describe("loginCrypto stub", () => {
  it("calls callbacks in the correct order", async () => {
    const { callbacks, calls } = makeCallbacks();
    await loginCrypto("user", "pass", fakeBridge, callbacks);
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
    await loginCrypto("user", "pass", fakeBridge, callbacks);
    expect(callbacks.onPowRequired).not.toHaveBeenCalled();
  });

  it("returns demo-prefixed strings for vol and org keys", async () => {
    const { callbacks } = makeCallbacks();
    const result = await loginCrypto("user", "pass", fakeBridge, callbacks);
    expect(result.volPublic).toBe("demo-vol-public");
    expect(result.orgPublicKey).toBe("demo-org-public");
  });

  it("fires the stage listener for each crypto phase", async () => {
    const stages: string[] = [];
    setLoginCryptoStageListener((s) => stages.push(s));

    const { callbacks } = makeCallbacks();
    await loginCrypto("user", "pass", fakeBridge, callbacks);

    expect(stages).toEqual(["argon2id", "oprf", "derive", "done"]);

    setLoginCryptoStageListener(null);
  });
});

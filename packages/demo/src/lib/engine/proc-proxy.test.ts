import { describe, it, expect, vi } from "vitest";
import {
  makeProcedureProxy,
  type ProcDispatch,
  type ProcedureProxy,
} from "./proc-proxy.js";

/**
 * Walk router segments with the index-signature union narrowed to a
 * node. The proxy returns a node for every non-terminal string key, so
 * the assertion states a runtime-true fact.
 */
function node(root: ProcedureProxy, ...segments: string[]): ProcedureProxy {
  let current: ProcedureProxy = root;
  for (const segment of segments) {
    current = current[segment] as ProcedureProxy;
  }
  return current;
}

describe("makeProcedureProxy", () => {
  it("dispatches a single-segment query", async () => {
    const dispatch = vi.fn<ProcDispatch>().mockResolvedValue("result");
    const proxy = makeProcedureProxy(dispatch);
    const result = await node(proxy, "tickets").query({ limit: 10 });
    expect(dispatch).toHaveBeenCalledWith(["tickets"], "query", { limit: 10 });
    expect(result).toBe("result");
  });

  it("dispatches a multi-segment mutate", async () => {
    const dispatch = vi.fn<ProcDispatch>().mockResolvedValue("ok");
    const proxy = makeProcedureProxy(dispatch);
    const result = await node(
      proxy,
      "twoFactor",
      "enroll",
      "totpSetup",
    ).mutate();
    expect(dispatch).toHaveBeenCalledWith(
      ["twoFactor", "enroll", "totpSetup"],
      "mutate",
      undefined,
    );
    expect(result).toBe("ok");
  });

  it("returns undefined for symbol properties", () => {
    const dispatch = vi.fn<ProcDispatch>();
    const proxy = makeProcedureProxy(dispatch);
    const sym = Symbol("test");
    expect((proxy as unknown as Record<symbol, unknown>)[sym]).toBeUndefined();
  });

  it("passes input through to dispatch", async () => {
    const dispatch = vi.fn<ProcDispatch>().mockResolvedValue(null);
    const proxy = makeProcedureProxy(dispatch);
    const input = { code: "123456" };
    await node(proxy, "auth", "login").mutate(input);
    expect(dispatch).toHaveBeenCalledWith(["auth", "login"], "mutate", input);
  });

  it("propagates dispatch errors", async () => {
    const dispatch = vi
      .fn<ProcDispatch>()
      .mockRejectedValue(new Error("not found"));
    const proxy = makeProcedureProxy(dispatch);
    await expect(node(proxy, "missing").query()).rejects.toThrow("not found");
  });
});

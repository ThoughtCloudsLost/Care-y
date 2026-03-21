import { describe, it, expect } from "vitest";
import type {
  BrowserCallService,
  BrowserCallState,
  BrowserCallEvents,
} from "./browser-call.js";

describe("BrowserCallService interface", () => {
  it("compiles with a conforming implementation", () => {
    // Type-level verification: a minimal stub that satisfies the interface.
    // No runtime behavior to test; the interface has no default implementation.
    const stub: BrowserCallService = {
      register: (_token: string, _events: BrowserCallEvents) =>
        Promise.resolve(),
      connect: (_clientPhone: string, _callerId: string) => Promise.resolve(),
      disconnect: () => {
        /* noop stub */
      },
      toggleMute: () => false,
      sendDtmf: (_digit: string) => {
        /* noop stub */
      },
      getState: (): BrowserCallState => "idle",
      destroy: () => {
        /* noop stub */
      },
    };

    expect(stub.getState()).toBe("idle");
    expect(stub.toggleMute()).toBe(false);
  });
});

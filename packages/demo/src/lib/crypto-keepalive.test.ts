import { describe, it, expect } from "vitest";
import { keepaliveDecision } from "./crypto-keepalive.js";

describe("keepaliveDecision", () => {
  // -----------------------------------------------------------------
  // No recovery when ping succeeds
  // -----------------------------------------------------------------

  it("returns 'none' when the ping succeeds", () => {
    expect(
      keepaliveDecision({
        pingFailed: false,
        believedKeyed: true,
        recoveryInFlight: false,
        hasEverKeyed: true,
      }),
    ).toBe("none");
  });

  it("returns 'none' when the ping succeeds even if state looks off", () => {
    expect(
      keepaliveDecision({
        pingFailed: false,
        believedKeyed: false,
        recoveryInFlight: false,
        hasEverKeyed: true,
      }),
    ).toBe("none");
  });

  // -----------------------------------------------------------------
  // No recovery before initial keying
  // -----------------------------------------------------------------

  it("returns 'none' when ping fails before the first successful keying", () => {
    expect(
      keepaliveDecision({
        pingFailed: true,
        believedKeyed: true,
        recoveryInFlight: false,
        hasEverKeyed: false,
      }),
    ).toBe("none");
  });

  // -----------------------------------------------------------------
  // No recovery when bridge already knows it is not keyed
  // -----------------------------------------------------------------

  it("returns 'none' when ping fails but bridge is not believed keyed", () => {
    expect(
      keepaliveDecision({
        pingFailed: true,
        believedKeyed: false,
        recoveryInFlight: false,
        hasEverKeyed: true,
      }),
    ).toBe("none");
  });

  // -----------------------------------------------------------------
  // Recovery fires exactly once (re-entrancy guard)
  // -----------------------------------------------------------------

  it("returns 'recover' when ping fails while believed keyed", () => {
    expect(
      keepaliveDecision({
        pingFailed: true,
        believedKeyed: true,
        recoveryInFlight: false,
        hasEverKeyed: true,
      }),
    ).toBe("recover");
  });

  it("returns 'none' when recovery is already in flight", () => {
    expect(
      keepaliveDecision({
        pingFailed: true,
        believedKeyed: true,
        recoveryInFlight: true,
        hasEverKeyed: true,
      }),
    ).toBe("none");
  });

  // -----------------------------------------------------------------
  // Combined edge: never keyed + recovery in flight
  // -----------------------------------------------------------------

  it("returns 'none' when both hasEverKeyed and recoveryInFlight block", () => {
    expect(
      keepaliveDecision({
        pingFailed: true,
        believedKeyed: true,
        recoveryInFlight: true,
        hasEverKeyed: false,
      }),
    ).toBe("none");
  });
});

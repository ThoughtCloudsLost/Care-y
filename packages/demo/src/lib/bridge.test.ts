import { describe, it, expect } from "vitest";
import { RoleId } from "@care-y/shared";
import type { DemoBridgeState, DemoBridge } from "./bridge.js";

describe("DemoBridgeState type shape", () => {
  it("carries a role field typed as RoleIdValue", () => {
    // Compile-time verification: a DemoBridgeState must accept role.
    const state: DemoBridgeState = {
      feature: "home",
      detail: null,
      searchOpen: false,
      topic: null,
      loginStage: null,
      routeId: null,
      location: { sectionId: "dashboard", subSlug: null },
      origin: "init",
      locationSeq: 0,
      restartSeq: 0,
      engineReady: false,
      dark: true,
      role: RoleId.ADMIN,
    };
    expect(state.role).toBe(RoleId.ADMIN);
  });

  it("accepts all three role values", () => {
    const base: Omit<DemoBridgeState, "role"> = {
      feature: "home",
      detail: null,
      searchOpen: false,
      topic: null,
      loginStage: null,
      routeId: null,
      location: { sectionId: "dashboard", subSlug: null },
      origin: "init",
      locationSeq: 0,
      restartSeq: 0,
      engineReady: true,
      dark: false,
    };
    expect({ ...base, role: RoleId.VOLUNTEER }.role).toBe(RoleId.VOLUNTEER);
    expect({ ...base, role: RoleId.MANAGER }.role).toBe(RoleId.MANAGER);
    expect({ ...base, role: RoleId.ADMIN }.role).toBe(RoleId.ADMIN);
  });
});

describe("DemoBridge interface", () => {
  it("requires setRole in the interface shape", () => {
    // Type-level check: a conforming object must include setRole.
    const stub: DemoBridge = {
      setLocation: () => undefined,
      setDark: () => undefined,
      setRole: () => undefined,
      setLocale: () => undefined,
      subscribe: () => () => undefined,
      subscribeFlow: () => () => undefined,
    };
    expect(typeof stub.setRole).toBe("function");
  });

  it("requires setLocale in the interface shape", () => {
    const stub: DemoBridge = {
      setLocation: () => undefined,
      setDark: () => undefined,
      setRole: () => undefined,
      setLocale: () => undefined,
      subscribe: () => () => undefined,
      subscribeFlow: () => () => undefined,
    };
    expect(typeof stub.setLocale).toBe("function");
  });
});

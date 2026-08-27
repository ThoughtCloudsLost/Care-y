import { describe, it, expect } from "vitest";
import { RoleId } from "@care-y/shared";
import type { DemoBridgeState, DemoBridge } from "./bridge.js";
import { DEMO_PORTAL_CHANNEL_ID, DEMO_SHARE_ID } from "./bridge.js";
import { matchRoute } from "./engine/route-manifest.js";

describe("client portal sentinels", () => {
  // A client feature's detail IS the URL path, so these sentinels have to
  // carry the route prefix, not just a placeholder id. Shortening either
  // to a bare id would route the phone to the 404 catch-all instead of
  // the portal, and only at story runtime.
  it("routes the portal sentinel to the parameterized portal route", () => {
    const match = matchRoute(`/${DEMO_PORTAL_CHANNEL_ID}`);
    expect(match?.routeId).toBe("/(client)/portal/[channelId]");
  });

  it("routes the share sentinel to the parameterized share route", () => {
    const match = matchRoute(`/${DEMO_SHARE_ID}`);
    expect(match?.routeId).toBe("/(client)/share/[id]");
  });

  it("keeps the sentinels distinguishable from a resolved detail", () => {
    // sentinelToReal compares by equality, so a sentinel that could also
    // be a real seeded path would never translate.
    expect(DEMO_PORTAL_CHANNEL_ID).not.toBe(DEMO_SHARE_ID);
    for (const sentinel of [DEMO_PORTAL_CHANNEL_ID, DEMO_SHARE_ID]) {
      expect(sentinel).toMatch(/^(portal|share)\/demo-/);
    }
  });
});

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
      setFullscreen: () => undefined,
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
      setFullscreen: () => undefined,
      setRole: () => undefined,
      setLocale: () => undefined,
      subscribe: () => () => undefined,
      subscribeFlow: () => () => undefined,
    };
    expect(typeof stub.setLocale).toBe("function");
  });

  it("requires setFullscreen in the interface shape", () => {
    const stub: DemoBridge = {
      setLocation: () => undefined,
      setDark: () => undefined,
      setFullscreen: () => undefined,
      setRole: () => undefined,
      setLocale: () => undefined,
      subscribe: () => () => undefined,
      subscribeFlow: () => () => undefined,
    };
    expect(typeof stub.setFullscreen).toBe("function");
  });
});

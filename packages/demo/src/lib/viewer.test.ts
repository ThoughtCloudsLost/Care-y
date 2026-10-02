import { describe, it, expect } from "vitest";
import { RoleId } from "@care-y/shared";
import type { DemoFeature, DemoLocation, SectionId } from "./bridge.js";
import {
  CLIENT_ENTRY_LOCATION,
  INITIAL_VIEWER_STATE,
  ORG_FALLBACK_LOCATION,
  abandonViewerSwitch,
  applyViewerSnapshot,
  beginViewerSwitch,
  planViewerSwitch,
  type ViewerSnapshot,
  type ViewerState,
} from "./viewer.js";

function loc(
  sectionId: SectionId,
  subSlug: string | null = null,
): DemoLocation {
  return { sectionId, subSlug };
}

function snap(
  feature: DemoFeature,
  location: DemoLocation,
  role: ViewerSnapshot["role"] = RoleId.ADMIN,
): ViewerSnapshot {
  return { feature, location, role, engineReady: true };
}

/** Fold a sequence of snapshots, as the bridge subscription does. */
function fold(
  snapshots: readonly ViewerSnapshot[],
  start: ViewerState = INITIAL_VIEWER_STATE,
): ViewerState {
  return snapshots.reduce(applyViewerSnapshot, start);
}

describe("applyViewerSnapshot", () => {
  it("shows the snapshot role on an org screen", () => {
    const state = fold([snap("settings", loc("settings"), RoleId.MANAGER)]);
    expect(state.viewer).toBe(RoleId.MANAGER);
    expect(state.lastOrgRole).toBe(RoleId.MANAGER);
  });

  it("shows the client viewer once a client page is mounted", () => {
    const state = fold([
      snap("settings", loc("settings")),
      snap("client", loc("client-intake")),
    ]);
    expect(state.viewer).toBe("client");
  });

  it("keeps the staff role untouched while the client viewer is shown", () => {
    const state = fold([
      snap("settings", loc("settings"), RoleId.VOLUNTEER),
      snap("client", loc("client-intake"), RoleId.VOLUNTEER),
      snap("client", loc("client-portal"), RoleId.VOLUNTEER),
    ]);
    expect(state.viewer).toBe("client");
    expect(state.lastOrgRole).toBe(RoleId.VOLUNTEER);
  });

  it("restores the last staff role when the phone leaves the client arc", () => {
    const state = fold([
      snap("settings", loc("settings"), RoleId.MANAGER),
      snap("client", loc("client-intake"), RoleId.MANAGER),
      snap("client", loc("client-share"), RoleId.MANAGER),
      snap("home", loc("dashboard"), RoleId.MANAGER),
    ]);
    expect(state.viewer).toBe(RoleId.MANAGER);
    expect(state.lastOrgRole).toBe(RoleId.MANAGER);
  });

  it("does not flip to client while the location leads the shell", () => {
    // The store moves the location first and the phone reconciles after,
    // so the snapshot can name a client section over a staff screen.
    const state = fold([
      snap("settings", loc("settings"), RoleId.MANAGER),
      snap("settings", loc("client-intake"), RoleId.MANAGER),
    ]);
    expect(state.viewer).toBe(RoleId.MANAGER);
  });

  it("stays client on a deep-dive read over a client page", () => {
    // deep-dive is org-group but leaves the phone where it was.
    const state = fold([
      snap("client", loc("client-share")),
      snap("client", loc("deep-dive", "what-is-care-y")),
    ]);
    expect(state.viewer).toBe("client");
  });

  it("records the last org route the phone stood on", () => {
    const state = fold([
      snap("admin", loc("admin-org", "branding")),
      snap("client", loc("client-intake")),
    ]);
    expect(state.lastOrgLocation).toEqual(loc("admin-org", "branding"));
  });

  it("never records a routeless section as the way back", () => {
    const state = fold([
      snap("settings", loc("settings", "profile")),
      snap("login", loc("login", "credentials")),
      snap("tickets", loc("search")),
      snap("settings", loc("deep-dive", "what-is-care-y")),
    ]);
    expect(state.lastOrgLocation).toEqual(loc("settings", "profile"));
  });

  it("returns the same object when a snapshot changes nothing", () => {
    const first = fold([snap("settings", loc("settings"))]);
    expect(applyViewerSnapshot(first, snap("settings", loc("settings")))).toBe(
      first,
    );
  });

  it("settles a pending client switch once a client page mounts", () => {
    const base = fold([snap("settings", loc("settings"))]);
    const pending = beginViewerSwitch(base, "client");
    const moving = applyViewerSnapshot(
      pending,
      snap("settings", loc("client-intake")),
    );
    expect(moving.pending).toBe("client");
    const landed = applyViewerSnapshot(
      moving,
      snap("client", loc("client-intake")),
    );
    expect(landed.pending).toBeNull();
    expect(landed.viewer).toBe("client");
  });

  it("settles a pending staff switch once the phone reports the role", () => {
    const base = fold([snap("settings", loc("settings"))]);
    const pending = beginViewerSwitch(base, RoleId.VOLUNTEER);
    const unchanged = applyViewerSnapshot(
      pending,
      snap("settings", loc("settings"), RoleId.ADMIN),
    );
    expect(unchanged.pending).toBe(RoleId.VOLUNTEER);
    const landed = applyViewerSnapshot(
      unchanged,
      snap("settings", loc("settings"), RoleId.VOLUNTEER),
    );
    expect(landed.pending).toBeNull();
    expect(landed.viewer).toBe(RoleId.VOLUNTEER);
  });

  it("keeps a staff switch from a client page pending until the phone leaves", () => {
    const base = fold([
      snap("settings", loc("settings")),
      snap("client", loc("client-portal")),
    ]);
    const pending = beginViewerSwitch(base, RoleId.ADMIN);
    const stillClient = applyViewerSnapshot(
      pending,
      snap("client", loc("settings")),
    );
    expect(stillClient.pending).toBe(RoleId.ADMIN);
    const back = applyViewerSnapshot(
      stillClient,
      snap("settings", loc("settings")),
    );
    expect(back.pending).toBeNull();
    expect(back.viewer).toBe(RoleId.ADMIN);
  });
});

describe("planViewerSwitch", () => {
  const onSettings = fold([
    snap("settings", loc("settings", "profile"), RoleId.MANAGER),
  ]);
  const onClient = fold(
    [snap("client", loc("client-portal"), RoleId.MANAGER)],
    onSettings,
  );

  it("sends the phone to /intake for Client, writing no role", () => {
    expect(planViewerSwitch(onSettings, "client")).toEqual({
      role: null,
      navigate: CLIENT_ENTRY_LOCATION,
    });
    expect(CLIENT_ENTRY_LOCATION).toEqual(loc("client-intake"));
  });

  it("does nothing for the viewer already shown", () => {
    expect(planViewerSwitch(onSettings, RoleId.MANAGER)).toBeNull();
    expect(planViewerSwitch(onClient, "client")).toBeNull();
  });

  it("does nothing while a switch is pending", () => {
    const pending = beginViewerSwitch(onSettings, RoleId.ADMIN);
    expect(planViewerSwitch(pending, RoleId.VOLUNTEER)).toBeNull();
    expect(planViewerSwitch(pending, "client")).toBeNull();
  });

  it("writes only the role for a staff pick on an org screen", () => {
    expect(planViewerSwitch(onSettings, RoleId.VOLUNTEER)).toEqual({
      role: RoleId.VOLUNTEER,
      navigate: null,
    });
  });

  it("returns to the last org route for the held role, without a write", () => {
    expect(planViewerSwitch(onClient, RoleId.MANAGER)).toEqual({
      role: null,
      navigate: loc("settings", "profile"),
    });
  });

  it("returns to the last org route and writes a different role", () => {
    expect(planViewerSwitch(onClient, RoleId.ADMIN)).toEqual({
      role: RoleId.ADMIN,
      navigate: loc("settings", "profile"),
    });
  });

  it("falls back to the dashboard when no org route was ever shown", () => {
    const deepLinked = fold([snap("client", loc("client-account"))]);
    expect(planViewerSwitch(deepLinked, RoleId.ADMIN)).toEqual({
      role: null,
      navigate: ORG_FALLBACK_LOCATION,
    });
  });

  it("refuses a role write before the engine boots", () => {
    const booting: ViewerState = { ...onSettings, engineReady: false };
    expect(planViewerSwitch(booting, RoleId.ADMIN)).toBeNull();
    // Client writes no role, so it does not wait on the engine.
    expect(planViewerSwitch(booting, "client")).not.toBeNull();
  });
});

describe("lastOrgRole across a client-section round trip", () => {
  it("comes back to the staff role picked before entering the arc", () => {
    // Admin at boot, the reader picks Volunteer on settings.
    let state = fold([snap("settings", loc("settings"), RoleId.ADMIN)]);
    const toVolunteer = planViewerSwitch(state, RoleId.VOLUNTEER);
    expect(toVolunteer?.role).toBe(RoleId.VOLUNTEER);
    state = beginViewerSwitch(state, RoleId.VOLUNTEER);
    state = applyViewerSnapshot(
      state,
      snap("settings", loc("settings"), RoleId.VOLUNTEER),
    );

    // The story walks into the client arc and through it.
    state = fold(
      [
        snap("settings", loc("client-intake"), RoleId.VOLUNTEER),
        snap("client", loc("client-intake"), RoleId.VOLUNTEER),
        snap("client", loc("client-account"), RoleId.VOLUNTEER),
      ],
      state,
    );
    expect(state.viewer).toBe("client");
    expect(state.lastOrgRole).toBe(RoleId.VOLUNTEER);

    // Picking the held role back from the toolbar navigates, never
    // writes, and lands on the route the reader left.
    const back = planViewerSwitch(state, RoleId.VOLUNTEER);
    expect(back).toEqual({ role: null, navigate: loc("settings") });
    state = beginViewerSwitch(state, RoleId.VOLUNTEER);
    state = applyViewerSnapshot(
      state,
      snap("settings", loc("settings"), RoleId.VOLUNTEER),
    );
    expect(state.viewer).toBe(RoleId.VOLUNTEER);
    expect(state.pending).toBeNull();
  });

  it("resets to admin on restart", () => {
    // App.svelte's restart path assigns INITIAL_VIEWER_STATE.
    expect(INITIAL_VIEWER_STATE.viewer).toBe(RoleId.ADMIN);
    expect(INITIAL_VIEWER_STATE.lastOrgRole).toBe(RoleId.ADMIN);
    expect(INITIAL_VIEWER_STATE.lastOrgLocation).toBeNull();
  });
});

describe("abandonViewerSwitch", () => {
  const base = fold([snap("settings", loc("settings"))]);

  it("drops the pending flag for the switch that timed out", () => {
    const pending = beginViewerSwitch(base, "client");
    expect(abandonViewerSwitch(pending, "client").pending).toBeNull();
  });

  it("leaves a different pending switch alone", () => {
    const pending = beginViewerSwitch(base, RoleId.VOLUNTEER);
    expect(abandonViewerSwitch(pending, "client")).toBe(pending);
  });
});

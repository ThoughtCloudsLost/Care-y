/**
 * Which sub-routers createAppRouter mounts, for a given set of deps.
 *
 * Construction only: no DB, no procedure calls. The point is the mounted
 * set itself, because an unmounted router is invisible until a caller hits
 * a missing path at runtime.
 *
 * The type system covers the omission case (every optional group is a
 * required key), so what is left to test is that a stated decision produces
 * the router set it claims.
 */

import { describe, it, expect, vi } from "vitest";
import { createAppRouter, type RouterDeps } from "./router.js";
import { createTestRouterDeps, NO_OPTIONAL_ROUTERS } from "../test-utils.js";

/** The six required deps, with every optional router declined. */
const baseDeps = createTestRouterDeps;

/**
 * Top-level names on the built router. `_def.record` is the router's own
 * record of what it mounted, so this reads the mounted set directly rather
 * than inferring it from a failed call.
 */
function mountedNames(deps: RouterDeps): Set<string> {
  return new Set(Object.keys(createAppRouter(deps)._def.record));
}

/** Built from the required deps alone; nothing can decline these. */
const ALWAYS_MOUNTED = [
  "health",
  "auth",
  "org",
  "profile",
  "twoFactor",
  "oprf",
  "keys",
  "dashboard",
  "recentViews",
];

/** One key per router a caller may decline. */
const DECLINABLE = [
  "telephonyAdmin",
  "telephonyContent",
  "consultant",
  "reports",
  "tickets",
  "kb",
  "notifications",
  "branding",
  "onboarding",
  "voicemailQuarantine",
  "clients",
  "escalation",
  "intakeForms",
  "clientPortal",
  "dev",
];

describe("createAppRouter mounting", () => {
  it("mounts only the routers built from required deps when every optional one is declined", () => {
    const mounted = mountedNames(baseDeps());

    expect([...mounted].sort()).toEqual([...ALWAYS_MOUNTED].sort());
  });

  it("declines every optional router when its key is null or false", () => {
    const mounted = mountedNames(baseDeps());

    for (const name of DECLINABLE) {
      expect(mounted).not.toContain(name);
    }
  });

  it("mounts a dep-group router once its deps are supplied", () => {
    const mounted = mountedNames({
      ...baseDeps(),
      escalationDeps: { createAuditSvc: vi.fn() },
    });

    expect(mounted).toContain("escalation");
  });

  it("mounts the dep-free routers on their booleans", () => {
    const mounted = mountedNames({
      ...baseDeps(),
      consultant: true,
      reports: true,
    });

    expect(mounted).toContain("consultant");
    expect(mounted).toContain("reports");
  });

  it("exposes no dev surface when devDeps is declined", () => {
    const router = createAppRouter(baseDeps());
    const paths = Object.keys(router._def.procedures);

    expect(paths.some((p) => p === "dev" || p.startsWith("dev."))).toBe(false);
  });

  it("covers every optional router in DECLINABLE", () => {
    // Guards the two tests above: a router added to OptionalRouterDeps
    // without a matching entry here would go unasserted.
    //
    // keysDeps is the one group that tunes an always-mounted router
    // instead of declining one: null leaves the keys router mounted with
    // its reseal fetch endpoints degraded. It is counted here, not in
    // DECLINABLE.
    const depTunedAlwaysMounted = ["keysDeps"];
    expect(DECLINABLE.length + depTunedAlwaysMounted.length).toBe(
      Object.keys(NO_OPTIONAL_ROUTERS).length,
    );
  });
});

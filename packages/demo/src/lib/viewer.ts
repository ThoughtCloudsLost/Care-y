/**
 * Who the frame toolbar says the phone is showing, and how a switch
 * between viewers is carried out.
 *
 * The viewer is derived from the bridge snapshot, never stored as a
 * field of its own. The snapshot carries the staff role the phone
 * actually holds (the DB row and permission set setRole wrote) and the
 * feature it actually mounted. A mounted client feature means the
 * client viewer; anything else means the snapshot's role. The snapshot
 * resyncs the page on every tick, so a separately stored viewer would
 * be overwritten out of step with the role and silently revert the
 * badge. Deriving both from one snapshot leaves nothing to revert.
 *
 * The client viewer follows the mounted shell rather than the story
 * location, because the two disagree on purpose in one place: a
 * deep-dive article has no screen of its own and leaves the phone where
 * it was, so after the client arc the phone still shows a client page
 * while the location names an org-group section.
 *
 * Switching to the client viewer writes no role. A help-seeker holds no
 * role and no permission set, so the staff role stays exactly as it was
 * and comes back unchanged when the reader returns to the org arc.
 *
 * Pure functions only. App.svelte holds the state and performs the
 * effects a ViewerSwitchPlan names.
 */

import { RoleId, type RoleIdValue } from "@care-y/shared";
import type { DemoBridgeState, DemoLocation, ViewerId } from "./bridge.js";
import { getSection } from "./scroll-sections.js";

// -----------------------------------------------------------------------
// Toolbar viewer list
// -----------------------------------------------------------------------

/**
 * Staff viewers in toolbar order. Admin is first because it is the boot
 * viewer (the bridge contract signs the demo user in as admin).
 */
export const TOOLBAR_STAFF_VIEWERS: readonly RoleIdValue[] = [
  RoleId.ADMIN,
  RoleId.MANAGER,
  RoleId.VOLUNTEER,
];

/**
 * Viewers listed below the toolbar separator. One entry: the tier a
 * client page shows (intake, secure link, account) follows the route,
 * not the dropdown, so the menu names the reader rather than the tier.
 */
export const TOOLBAR_CLIENT_VIEWERS: readonly ViewerId[] = ["client"];

/** Viewer at boot and after every restart. */
export const BOOT_VIEWER: RoleIdValue = RoleId.ADMIN;

// -----------------------------------------------------------------------
// State
// -----------------------------------------------------------------------

export interface ViewerState {
  /** What the toolbar badge shows. */
  readonly viewer: ViewerId;
  /**
   * The staff role the phone holds. Only a staff selection changes it,
   * through setRole. This module reads it back from the snapshot and
   * never writes it, and the client viewer calls no setRole at all.
   */
  readonly lastOrgRole: RoleIdValue;
  /**
   * Last org-group location the phone actually showed, for the way back
   * out of the client arc. Null until the phone has stood on one.
   */
  readonly lastOrgLocation: DemoLocation | null;
  /**
   * Viewer a user-triggered switch is waiting on, or null when settled.
   * The toolbar disables its menu while this is set, so a second pick
   * cannot interleave a second role write with the first.
   */
  readonly pending: ViewerId | null;
  /** Mirrors the snapshot. setRole is a no-op before the engine boots. */
  readonly engineReady: boolean;
}

export const INITIAL_VIEWER_STATE: ViewerState = {
  viewer: BOOT_VIEWER,
  lastOrgRole: BOOT_VIEWER,
  lastOrgLocation: null,
  pending: null,
  engineReady: false,
};

/** The snapshot fields the viewer is derived from. */
export type ViewerSnapshot = Pick<
  DemoBridgeState,
  "role" | "feature" | "location" | "engineReady"
>;

/** Where picking Client from an org section sends the phone (/intake). */
export const CLIENT_ENTRY_LOCATION: DemoLocation = {
  sectionId: "client-intake",
  subSlug: null,
};

/**
 * Where picking a staff role from a client section goes when the phone
 * has not yet stood on any org route, as on a deep link straight into
 * the client arc. The dashboard is the first screen a signed-in staff
 * member lands on.
 */
export const ORG_FALLBACK_LOCATION: DemoLocation = {
  sectionId: "dashboard",
  subSlug: null,
};

/**
 * Whether the phone can be sent back to this location as "the last org
 * route". Sections that own no route are excluded: login would replay
 * the sign-in screens to a signed-in user, the search section is an
 * overlay on whatever screen is under it, and a deep-dive article
 * leaves the phone where it is, which after the client arc is a client
 * page.
 */
function isOrgReturnTarget(location: DemoLocation): boolean {
  const section = getSection(location.sectionId);
  return section?.group === "org" && section.routes.length > 0;
}

function sameLocation(a: DemoLocation | null, b: DemoLocation): boolean {
  return a !== null && a.sectionId === b.sectionId && a.subSlug === b.subSlug;
}

/**
 * Fold one bridge snapshot into the viewer state.
 *
 * Returns `prev` itself when nothing changed, so a caller holding the
 * result in raw state does not notify on every snapshot tick.
 */
export function applyViewerSnapshot(
  prev: ViewerState,
  snapshot: ViewerSnapshot,
): ViewerState {
  const inClient = snapshot.feature === "client";
  const viewer: ViewerId = inClient ? "client" : snapshot.role;

  const lastOrgLocation =
    !inClient &&
    isOrgReturnTarget(snapshot.location) &&
    !sameLocation(prev.lastOrgLocation, snapshot.location)
      ? snapshot.location
      : prev.lastOrgLocation;

  let pending = prev.pending;
  if (pending === "client" && inClient) {
    pending = null;
  } else if (
    pending !== null &&
    pending !== "client" &&
    !inClient &&
    snapshot.role === pending
  ) {
    pending = null;
  }

  if (
    viewer === prev.viewer &&
    snapshot.role === prev.lastOrgRole &&
    lastOrgLocation === prev.lastOrgLocation &&
    pending === prev.pending &&
    snapshot.engineReady === prev.engineReady
  ) {
    return prev;
  }

  return {
    viewer,
    lastOrgRole: snapshot.role,
    lastOrgLocation,
    pending,
    engineReady: snapshot.engineReady,
  };
}

// -----------------------------------------------------------------------
// Switching
// -----------------------------------------------------------------------

/**
 * What App.svelte has to do to carry out one toolbar pick. Either field
 * may be null; a plan with both set is a staff pick made from a client
 * page with a different role than the one held.
 */
export interface ViewerSwitchPlan {
  /** Staff role to write through bridge.setRole, or null to leave it. */
  readonly role: RoleIdValue | null;
  /** Location to move the phone to, or null to stay. */
  readonly navigate: DemoLocation | null;
}

/**
 * Decide what a toolbar pick does, or null when it does nothing.
 *
 * Picking Client sends the phone to /intake and writes no role. Picking
 * a staff role writes that role if it differs from the one held and,
 * from a client page, returns the phone to the last org route.
 */
export function planViewerSwitch(
  state: ViewerState,
  target: ViewerId,
): ViewerSwitchPlan | null {
  if (state.pending !== null || target === state.viewer) return null;

  if (target === "client") {
    return { role: null, navigate: CLIENT_ENTRY_LOCATION };
  }

  const role = target === state.lastOrgRole ? null : target;
  // setRole is a no-op until the engine has booted, so a role write
  // asked for before then would leave the switch pending until the
  // timeout gives the menu back. Refuse it here instead, which is what
  // the bridge would have done anyway.
  if (role !== null && !state.engineReady) return null;

  const navigate =
    state.viewer === "client"
      ? (state.lastOrgLocation ?? ORG_FALLBACK_LOCATION)
      : null;

  if (role === null && navigate === null) return null;
  return { role, navigate };
}

/** Mark a switch as in flight. Call after planViewerSwitch returned a plan. */
export function beginViewerSwitch(
  state: ViewerState,
  target: ViewerId,
): ViewerState {
  return { ...state, pending: target };
}

/**
 * Give the menu back when a switch never settles. The snapshot keeps
 * reporting what the phone actually holds, so the badge already shows
 * the true viewer; only the pending flag is dropped. A no-op when the
 * pending switch is a different one or has already settled.
 */
export function abandonViewerSwitch(
  state: ViewerState,
  target: ViewerId,
): ViewerState {
  return state.pending === target ? { ...state, pending: null } : state;
}

/**
 * How long a switch may stay pending before the menu is given back.
 *
 * A staff switch settles in well under a second (one DB write). Entering
 * the client arc can take longer on a cold route chunk. The bound exists
 * for the switch that never lands: a rejected role write, or a location
 * the store snapped back from.
 */
export const VIEWER_SWITCH_TIMEOUT_MS = 20_000;

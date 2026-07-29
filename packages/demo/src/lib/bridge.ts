/**
 * Typed bridge between the outer demo page and the phone iframe.
 *
 * The phone app assigns an implementation onto its own window as
 * window.demoBridge during mount. The outer page reads it from
 * iframe.contentWindow after the iframe loads and calls it directly
 * (same-origin, no serialization).
 *
 * The bridge carries ONE canonical location (section + sub-section),
 * owned by the phone-side location store. The outer page cannot command
 * the phone's screens directly; it can only move the shared location,
 * and the store reconciles the phone to it. Phone interactions update
 * the same location, and the page renders it. Because neither surface
 * holds its own copy of "where the demo is", the two cannot drift.
 */

// -----------------------------------------------------------------------
// Feature and detail types
// -----------------------------------------------------------------------

/** Features that have a built demo scene. */
export type DemoFeature =
  "login" | "home" | "tickets" | "library" | "admin" | "schedule" | "settings";

/** Sub-state within a feature (e.g. ticket detail, conversation view). */
export type DemoDetail = string | null;

/** Login stage progression tracked by the phone side. */
export type LoginStage = "form" | "twofa-picker" | "twofa-method" | "deriving";

/**
 * Targets for the internal login-advance chain. Screen targets (form,
 * picker, a specific method) move the real UI without completing auth;
 * "done" plays the whole flow to the tickets landing.
 */
export type LoginAdvanceTarget =
  | "form"
  | "twofa-picker"
  | "method-totp"
  | "method-passkey"
  | "method-email"
  | "method-sms"
  | "method-push"
  | "method-backup"
  | "deriving"
  | "done";

// -----------------------------------------------------------------------
// Location: the canonical shared state
// -----------------------------------------------------------------------

/** Story sections of the outer page. The phone maps onto these. */
export type SectionId =
  | "login"
  | "dashboard"
  | "tickets"
  | "ticket-detail"
  | "search"
  | "library"
  | "admin"
  | "schedule"
  | "settings";

/** The one place the demo "is": a section and optional sub-section. */
export interface DemoLocation {
  readonly sectionId: SectionId;
  readonly subSlug: string | null;
}

/**
 * Who caused the last location transition. Presentation decisions key
 * off this (a page-scroll transition must not scroll the page again;
 * a phone transition must), never off timing windows.
 */
export type LocationOrigin =
  "init" | "phone" | "page-scroll" | "page-click" | "deep-link";

/** Origins the outer page is allowed to claim in setLocation. */
export type PageOrigin = "page-scroll" | "page-click" | "deep-link";

// -----------------------------------------------------------------------
// Topic vocabulary
// -----------------------------------------------------------------------

/**
 * Granular sub-feature topics detected from user interactions
 * inside the phone. A classified topic moves the shared location
 * to the sub-section that narrates it.
 */
export type DemoTopic =
  | "credentials"
  | "language"
  | "twofa"
  | "twofa-totp"
  | "twofa-passkey"
  | "twofa-email"
  | "twofa-sms"
  | "twofa-push"
  | "twofa-backup"
  | "key-derivation"
  | "sort"
  | "filters"
  | "view-modes"
  | "select-mode"
  | "new-ticket"
  | "thread-filters"
  | "compose-actions"
  | "reply"
  | "notes"
  | "case-fold"
  | "timeline"
  | "dashboard-queues"
  | "dashboard-activity"
  | "library-vote"
  | "library-categories"
  | "library-editor"
  | "admin-roster-edit"
  | "admin-greetings"
  | "admin-quarantine"
  | "settings-profile"
  | "settings-password"
  | "settings-2fa";

/** All topics in display order. */
export const DEMO_TOPICS: readonly DemoTopic[] = [
  "credentials",
  "language",
  "twofa",
  "twofa-totp",
  "twofa-passkey",
  "twofa-email",
  "twofa-sms",
  "twofa-push",
  "twofa-backup",
  "key-derivation",
  "sort",
  "filters",
  "view-modes",
  "select-mode",
  "new-ticket",
  "thread-filters",
  "compose-actions",
  "reply",
  "notes",
  "case-fold",
  "timeline",
  "dashboard-queues",
  "dashboard-activity",
  "library-vote",
  "library-categories",
  "library-editor",
  "admin-roster-edit",
  "admin-greetings",
  "admin-quarantine",
  "settings-profile",
  "settings-password",
  "settings-2fa",
] as const;

/** Ticket the ticket-detail section navigates to. tk-0001 has the richest thread. */
export const DEMO_DETAIL_TICKET_ID = "tk-0001";

/** Article the library section opens for the vote sub-section. Resolved to a real seeded ID at runtime. */
export const DEMO_DETAIL_ARTICLE_ID = "kb-0001";

// -----------------------------------------------------------------------
// Bridge state and interface
// -----------------------------------------------------------------------

export interface DemoBridgeState {
  readonly feature: DemoFeature;
  readonly detail: DemoDetail;
  readonly searchOpen: boolean;
  /** Last interacted sub-feature; null until first interaction and after reload. */
  readonly topic: DemoTopic | null;
  /** Non-null when feature is "login"; tracks login flow progression. */
  readonly loginStage: LoginStage | null;
  /** The canonical location both surfaces render. */
  readonly location: DemoLocation;
  /** Origin of the last location transition. */
  readonly origin: LocationOrigin;
  /**
   * Increments on every location transition. Re-selecting the current
   * location also counts. Lets the page distinguish "a transition
   * happened" from "some other state field changed".
   */
  readonly locationSeq: number;
  /**
   * Increments when the phone asks the outer page to restart the demo
   * (avatar-panel sign-out). The outer page runs its restart routine
   * (hash clear, iframe reload, scroll to top) when it sees a bump, so
   * a phone-initiated restart behaves exactly like the restart button.
   */
  readonly restartSeq: number;
}

export type DemoBridgeListener = (state: DemoBridgeState) => void;

export interface DemoBridge {
  /**
   * Move the shared location (the page's only way to drive the demo).
   * The phone-side store reconciles the phone to the new location and
   * snaps the location back to the phone if reconciliation fails, so
   * the two always converge.
   */
  setLocation(
    sectionId: SectionId,
    subSlug: string | null,
    origin: PageOrigin,
  ): void;
  /**
   * Play the login flow to completion (sign in, confirm a method, key
   * derivation, land on tickets). The location follows the phone
   * through each stage; the page swaps to the tickets narrative when
   * the phone actually gets there.
   */
  completeLogin(): void;
  /** Apply light/dark scheme and glass classes to the phone document. */
  setDark(dark: boolean): void;
  /**
   * Subscribe to state changes. The callback fires immediately with
   * the current state and again on every change. Returns an
   * unsubscribe function.
   */
  subscribe(listener: DemoBridgeListener): () => void;
}

declare global {
  interface Window {
    demoBridge?: DemoBridge;
  }
}

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

import type { RoleIdValue } from "@care-y/shared";
import type { Locale } from "$lib/paraglide/runtime.js";

// -----------------------------------------------------------------------
// Feature and detail types
// -----------------------------------------------------------------------

/** Features that have a built demo scene. */
export type DemoFeature =
  | "login"
  | "home"
  | "tickets"
  | "library"
  | "admin"
  | "schedule"
  | "settings"
  | "other";

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
  | "admin-people"
  | "admin-comms"
  | "admin-org"
  | "schedule"
  | "settings"
  | "coming-soon";

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
  | "init"
  | "phone"
  | "phone-correction"
  | "page-scroll"
  | "page-click"
  | "deep-link";

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
  | "dashboard-view-switcher"
  | "dashboard-getting-started"
  | "dashboard-shift"
  | "dashboard-queues"
  | "dashboard-activity"
  | "dashboard-kb"
  | "dashboard-needs-attention"
  | "dashboard-my-tickets"
  | "dashboard-unassigned"
  | "dashboard-on-hold"
  | "dashboard-create"
  | "decryption"
  | "view-modes"
  | "list-stats"
  | "sort"
  | "select-mode"
  | "page-search"
  | "saved-filters"
  | "filters"
  | "unread-badges"
  | "quick-actions"
  | "new-ticket"
  | "split-view"
  | "case-header"
  | "timeline"
  | "thread-filters"
  | "deep-search"
  | "conversation"
  | "thread-anatomy"
  | "notes"
  | "case-fold"
  | "case-panel"
  | "compose-actions"
  | "reply"
  | "message-select"
  | "message-actions"
  | "exposure-hints"
  | "close-reopen"
  | "library-vote"
  | "library-tools"
  | "library-search"
  | "library-categories"
  | "library-editor"
  | "admin-roster-edit"
  | "admin-roster-tools"
  | "admin-queues"
  | "admin-clients"
  | "admin-client-merge"
  | "admin-roles"
  | "admin-telephony-provider"
  | "admin-phone-lines"
  | "admin-greetings"
  | "admin-sms-templates"
  | "admin-blocklist"
  | "admin-quarantine"
  | "admin-general"
  | "admin-branding"
  | "admin-terminology"
  | "admin-keys"
  | "admin-retention"
  | "admin-note-types"
  | "settings-profile"
  | "settings-password"
  | "settings-appearance"
  | "settings-2fa"
  | "settings-security";

/** All topics in display order (matches taxonomy section ordering). */
export const DEMO_TOPICS: readonly DemoTopic[] = [
  "language",
  "credentials",
  "twofa",
  "twofa-passkey",
  "twofa-totp",
  "twofa-email",
  "twofa-sms",
  "twofa-push",
  "twofa-backup",
  "key-derivation",
  "dashboard-view-switcher",
  "dashboard-getting-started",
  "dashboard-shift",
  "dashboard-queues",
  "dashboard-activity",
  "dashboard-kb",
  "dashboard-needs-attention",
  "dashboard-my-tickets",
  "dashboard-unassigned",
  "dashboard-on-hold",
  "dashboard-create",
  "decryption",
  "view-modes",
  "list-stats",
  "sort",
  "select-mode",
  "page-search",
  "saved-filters",
  "filters",
  "unread-badges",
  "quick-actions",
  "new-ticket",
  "split-view",
  "case-header",
  "timeline",
  "thread-filters",
  "deep-search",
  "conversation",
  "thread-anatomy",
  "notes",
  "case-fold",
  "case-panel",
  "compose-actions",
  "reply",
  "message-select",
  "message-actions",
  "exposure-hints",
  "close-reopen",
  "library-vote",
  "library-tools",
  "library-search",
  "library-categories",
  "library-editor",
  "admin-roster-edit",
  "admin-roster-tools",
  "admin-queues",
  "admin-clients",
  "admin-client-merge",
  "admin-roles",
  "admin-telephony-provider",
  "admin-phone-lines",
  "admin-greetings",
  "admin-sms-templates",
  "admin-blocklist",
  "admin-quarantine",
  "admin-general",
  "admin-branding",
  "admin-terminology",
  "admin-keys",
  "admin-retention",
  "admin-note-types",
  "settings-profile",
  "settings-password",
  "settings-appearance",
  "settings-2fa",
  "settings-security",
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
  /**
   * The route-manifest route ID the phone currently shows. Null during
   * login (no manifest route) and when the pathname has no match.
   */
  readonly routeId: string | null;
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
  /**
   * False at boot, flips true once the PGlite engine finishes loading
   * and stays true until the iframe reloads. The outer page uses it to
   * sharpen the peek's blurred still into the live app.
   */
  readonly engineReady: boolean;
  /** The signed-in user's current role. Starts as ADMIN; tracks role
   *  switcher state. */
  readonly role: RoleIdValue;
}

export type DemoBridgeListener = (state: DemoBridgeState) => void;

// -----------------------------------------------------------------------
// Data-flow events (swimlane band)
// -----------------------------------------------------------------------

/**
 * Architecture lane an event belongs to. Lane names are rendered by the
 * outer page, which owns the localized copy; labels crossing the bridge
 * stay technical and untranslated.
 */
export type FlowLane = "db" | "server" | "trpc" | "crypto" | "ui";
export type FlowDirection = "up" | "down" | "local";
/** Seams the demo scripts rather than runs for real. */
export type DemoSeamKey =
  | "login-pacing"
  | "twofa-choreography"
  | "webauthn-authenticator"
  | "oprf-evaluator"
  | "outbox-delivery"
  | "recorded-derivation";
/**
 * How a value should be read. This is the band's E2E proof rather than
 * decoration: a row marked ciphertext in the db lane is the claim that
 * a seized database yields nothing, and a plaintext row appearing above
 * the crypto lane would be that claim failing in public.
 *
 * Kinds are assigned at the tap, where the real type is still in hand
 * (a Uint8Array bound parameter is ciphertext by construction), never
 * guessed from the rendered string.
 */
export type FlowValueKind =
  "ciphertext" | "plaintext" | "key-material" | "identifier" | "metadata";

/**
 * One field of a payload. Values arrive already rendered and truncated:
 * taps own the decision about what is safe to show, so nothing
 * downstream has to re-derive it.
 */
export interface FlowDetailRow {
  /** Technical field name, untranslated. "$1", "slot", "rows returned". */
  readonly name: string;
  /** Display value, truncated at the tap to DETAIL_VALUE_MAX_CHARS. */
  readonly value: string;
  readonly kind: FlowValueKind;
  /** Size of the underlying value where it is binary or base64. */
  readonly bytes?: number;
}

/**
 * Structured payload for one event, replacing nothing: payloadPreview
 * stays as it is, and this sits beside it. Taps opt in.
 *
 * Row counts and value lengths are capped at the tap so a single wide
 * statement cannot flood the detail panel, and so an oversized detail
 * never crosses the bridge in the first place.
 */
export interface FlowDetail {
  /** Full statement, procedure path, or operation. Rendered monospace. */
  readonly source: string | null;
  /** Going in: bound parameters, call arguments. */
  readonly input: readonly FlowDetailRow[];
  /** Coming back: row counts, byte counts, status. */
  readonly result: readonly FlowDetailRow[];
  /** Dominant kind, for the header chip. Null when mixed or unclassified. */
  readonly classification: FlowValueKind | null;
}

export interface DemoFlowEvent {
  readonly id: number;
  readonly interactionId: number;
  readonly lane: FlowLane;
  readonly direction: FlowDirection;
  readonly label: string;
  readonly seamKey: DemoSeamKey | null;
  readonly payloadPreview: string | null;
  readonly durationMs: number | null;
  /** Structured payload, or null for taps that do not supply one. */
  readonly detail: FlowDetail | null;
  /**
   * Shared by both halves of a request/response pair, and equal to the
   * request half's own id. Null for events that are not part of a span.
   */
  readonly spanId: number | null;
  /**
   * Marks an event as one of a repeated operation, so a run of them can
   * fold into a stack instead of eating a column each.
   *
   * Opt-in per tap, and deliberately not derived from the label: only
   * the tap knows whether seeing each member separately tells the reader
   * anything. Twelve decrypts of the same slot do not; three different
   * SELECTs do. Null means this event never stacks.
   */
  readonly groupKey: string | null;
  /**
   * Emission time from the flow clock, which is injectable. Used for
   * offset-from-interaction-start; never for ordering or identity,
   * which come from the monotonic id.
   */
  readonly at: number;
}
export type DemoFlowListener = (event: DemoFlowEvent) => void;

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
   * Switch the signed-in demo user's role. Mutates the DB row, updates
   * server middleware enforcement, refreshes client permission gates, and
   * invalidates role-scoped query caches. No-op before engine boot or
   * when the role is already current.
   */
  setRole(role: RoleIdValue): void;
  /**
   * Switch the phone's UI locale. Updates the reactive locale state
   * so all visible paraglide messages re-render without a reload.
   *
   * Locale flow is one-way: the outer page pushes to the phone.
   * Phone-side locale switches (LanguagePicker, avatar panel) do NOT
   * propagate back to the outer page.
   */
  setLocale(locale: Locale): void;
  /**
   * Subscribe to state changes. The callback fires immediately with
   * the current state and again on every change. Returns an
   * unsubscribe function.
   */
  subscribe(listener: DemoBridgeListener): () => void;
  /**
   * Subscribe to data-flow events emitted by the phone's taps. Delivers
   * NEW events only: the band opens empty, and a restart reloads the
   * iframe, so there is nothing to replay.
   */
  subscribeFlow(listener: DemoFlowListener): () => void;
}

declare global {
  interface Window {
    demoBridge?: DemoBridge;
  }
}

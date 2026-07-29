/**
 * Scroll-story section taxonomy: sections, sub-sections, topic mapping,
 * slug parsing, and phone-command resolution.
 *
 * Pure functions only. No DOM, no Svelte runes, no side effects.
 */

// Re-export types the outer page is allowed to import from the bridge
import type {
  DemoFeature,
  DemoTopic,
  LoginStage,
  LoginAdvanceTarget,
  SectionId,
  DemoLocation,
} from "./bridge.js";

import {
  SECTION_ROUTES,
  SUB_ROUTES,
  UNNARRATED_ROUTES,
} from "./scroll-section-routes.js";

export { SECTION_ROUTES, SUB_ROUTES, UNNARRATED_ROUTES };

// -----------------------------------------------------------------------
// Section / sub-section types
// -----------------------------------------------------------------------

// SectionId lives in bridge.ts (the shared contract); re-exported here
// so taxonomy consumers keep importing it from the taxonomy module.
export type { SectionId } from "./bridge.js";

export interface SubSection {
  /** Stable slug for deep links and element IDs */
  readonly slug: string;
  /** DemoTopic this sub-section maps to (null for intro-only subs) */
  readonly topic: DemoTopic | null;
  /** Message key suffix for the sub-section heading */
  readonly headingKey: string;
  /** Message key suffix for the sub-section body */
  readonly bodyKey: string;
  /** Route IDs this sub narrates (only present for route-specific subs). */
  readonly routes?: readonly string[];
}

export interface Section {
  readonly id: SectionId;
  /** Message key suffix for the section title */
  readonly titleKey: string;
  /** Message key suffix for the section description */
  readonly descKey: string;
  readonly subs: readonly SubSection[];
  /** All (app) route IDs this section narrates. */
  readonly routes: readonly string[];
}

// -----------------------------------------------------------------------
// Taxonomy (frozen)
// -----------------------------------------------------------------------

export const SECTIONS: readonly Section[] = [
  {
    id: "login",
    titleKey: "demo_section_login_title",
    descKey: "demo_section_login_desc",
    routes: SECTION_ROUTES.login,
    subs: [
      {
        slug: "credentials",
        topic: "credentials",
        headingKey: "demo_narrative_topic_credentials_heading",
        bodyKey: "demo_narrative_topic_credentials_body",
      },
      // Language sits with credentials: the picker is visible on the
      // sign-in form the visitor is looking at.
      {
        slug: "language",
        topic: "language",
        headingKey: "demo_narrative_topic_language_heading",
        bodyKey: "demo_narrative_topic_language_body",
      },
      {
        slug: "two-factor",
        topic: "twofa",
        headingKey: "demo_narrative_topic_twofa_heading",
        bodyKey: "demo_narrative_topic_twofa_body",
      },
      // One sub per 2FA method, in the phone picker's order
      {
        slug: "totp",
        topic: "twofa-totp",
        headingKey: "demo_narrative_topic_twofa_totp_heading",
        bodyKey: "demo_narrative_topic_twofa_totp_body",
      },
      {
        slug: "passkey",
        topic: "twofa-passkey",
        headingKey: "demo_narrative_topic_twofa_passkey_heading",
        bodyKey: "demo_narrative_topic_twofa_passkey_body",
      },
      {
        slug: "email",
        topic: "twofa-email",
        headingKey: "demo_narrative_topic_twofa_email_heading",
        bodyKey: "demo_narrative_topic_twofa_email_body",
      },
      {
        slug: "sms",
        topic: "twofa-sms",
        headingKey: "demo_narrative_topic_twofa_sms_heading",
        bodyKey: "demo_narrative_topic_twofa_sms_body",
      },
      {
        slug: "push",
        topic: "twofa-push",
        headingKey: "demo_narrative_topic_twofa_push_heading",
        bodyKey: "demo_narrative_topic_twofa_push_body",
      },
      {
        slug: "backup-codes",
        topic: "twofa-backup",
        headingKey: "demo_narrative_topic_twofa_backup_heading",
        bodyKey: "demo_narrative_topic_twofa_backup_body",
      },
      {
        slug: "key-derivation",
        topic: "key-derivation",
        headingKey: "demo_narrative_topic_key_derivation_heading",
        bodyKey: "demo_narrative_topic_key_derivation_body",
      },
    ],
  },
  {
    id: "dashboard",
    titleKey: "demo_section_dashboard_title",
    descKey: "demo_section_dashboard_desc",
    routes: SECTION_ROUTES.dashboard,
    subs: [
      {
        slug: "intro",
        topic: null,
        headingKey: "demo_narrative_dashboard_heading",
        bodyKey: "demo_narrative_dashboard_body",
      },
    ],
  },
  {
    id: "tickets",
    titleKey: "demo_section_tickets_title",
    descKey: "demo_section_tickets_desc",
    routes: SECTION_ROUTES.tickets,
    subs: [
      {
        slug: "sort",
        topic: "sort",
        headingKey: "demo_narrative_topic_sort_heading",
        bodyKey: "demo_narrative_topic_sort_body",
      },
      {
        slug: "filters",
        topic: "filters",
        headingKey: "demo_narrative_topic_filters_heading",
        bodyKey: "demo_narrative_topic_filters_body",
      },
      {
        slug: "view-modes",
        topic: "view-modes",
        headingKey: "demo_narrative_topic_view_modes_heading",
        bodyKey: "demo_narrative_topic_view_modes_body",
      },
      {
        slug: "select-mode",
        topic: "select-mode",
        headingKey: "demo_narrative_topic_select_mode_heading",
        bodyKey: "demo_narrative_topic_select_mode_body",
      },
      {
        slug: "new-ticket",
        topic: "new-ticket",
        headingKey: "demo_narrative_topic_new_ticket_heading",
        bodyKey: "demo_narrative_topic_new_ticket_body",
      },
    ],
  },
  {
    id: "ticket-detail",
    titleKey: "demo_section_ticket_detail_title",
    descKey: "demo_section_ticket_detail_desc",
    routes: SECTION_ROUTES["ticket-detail"],
    subs: [
      {
        slug: "thread-filters",
        topic: "thread-filters",
        headingKey: "demo_narrative_topic_thread_filters_heading",
        bodyKey: "demo_narrative_topic_thread_filters_body",
      },
      {
        slug: "compose-actions",
        topic: "compose-actions",
        headingKey: "demo_narrative_topic_compose_actions_heading",
        bodyKey: "demo_narrative_topic_compose_actions_body",
      },
      {
        slug: "reply",
        topic: "reply",
        headingKey: "demo_narrative_topic_reply_heading",
        bodyKey: "demo_narrative_topic_reply_body",
      },
      {
        slug: "notes",
        topic: "notes",
        headingKey: "demo_narrative_topic_notes_heading",
        bodyKey: "demo_narrative_topic_notes_body",
      },
      {
        slug: "case-fold",
        topic: "case-fold",
        headingKey: "demo_narrative_topic_case_fold_heading",
        bodyKey: "demo_narrative_topic_case_fold_body",
      },
      {
        slug: "timeline",
        topic: "timeline",
        headingKey: "demo_narrative_topic_timeline_heading",
        bodyKey: "demo_narrative_topic_timeline_body",
      },
    ],
  },
  {
    id: "search",
    titleKey: "demo_section_search_title",
    descKey: "demo_section_search_desc",
    routes: SECTION_ROUTES.search,
    subs: [
      {
        slug: "intro",
        topic: null,
        headingKey: "demo_narrative_search_heading",
        bodyKey: "demo_narrative_search_body",
      },
    ],
  },
  {
    id: "library",
    titleKey: "demo_section_library_title",
    descKey: "demo_section_library_desc",
    routes: SECTION_ROUTES.library,
    subs: [
      {
        slug: "intro",
        topic: null,
        headingKey: "demo_narrative_library_heading",
        bodyKey: "demo_narrative_library_body",
      },
    ],
  },
  {
    id: "admin",
    titleKey: "demo_section_admin_title",
    descKey: "demo_section_admin_desc",
    routes: SECTION_ROUTES.admin,
    subs: [
      {
        slug: "intro",
        topic: null,
        headingKey: "demo_narrative_admin_heading",
        bodyKey: "demo_narrative_admin_body",
      },
      {
        slug: "people-queues",
        topic: null,
        headingKey: "demo_narrative_admin_people_queues_heading",
        bodyKey: "demo_narrative_admin_people_queues_body",
        routes: SUB_ROUTES["admin/people-queues"],
      },
      {
        slug: "org-config-keys",
        topic: null,
        headingKey: "demo_narrative_admin_org_config_keys_heading",
        bodyKey: "demo_narrative_admin_org_config_keys_body",
        routes: SUB_ROUTES["admin/org-config-keys"],
      },
      {
        slug: "communications",
        topic: null,
        headingKey: "demo_narrative_admin_communications_heading",
        bodyKey: "demo_narrative_admin_communications_body",
        routes: SUB_ROUTES["admin/communications"],
      },
    ],
  },
  {
    id: "schedule",
    titleKey: "demo_section_schedule_title",
    descKey: "demo_section_schedule_desc",
    routes: SECTION_ROUTES.schedule,
    subs: [
      {
        slug: "intro",
        topic: null,
        headingKey: "demo_narrative_schedule_heading",
        bodyKey: "demo_narrative_schedule_body",
      },
    ],
  },
  {
    id: "settings",
    titleKey: "demo_section_settings_title",
    descKey: "demo_section_settings_desc",
    routes: SECTION_ROUTES.settings,
    subs: [
      {
        slug: "intro",
        topic: null,
        headingKey: "demo_narrative_settings_heading",
        bodyKey: "demo_narrative_settings_body",
      },
      {
        slug: "profile-identity",
        topic: null,
        headingKey: "demo_narrative_settings_profile_identity_heading",
        bodyKey: "demo_narrative_settings_profile_identity_body",
      },
      {
        slug: "password-keys",
        topic: null,
        headingKey: "demo_narrative_settings_password_keys_heading",
        bodyKey: "demo_narrative_settings_password_keys_body",
      },
      {
        slug: "two-factor-methods",
        topic: null,
        headingKey: "demo_narrative_settings_two_factor_methods_heading",
        bodyKey: "demo_narrative_settings_two_factor_methods_body",
      },
    ],
  },
] as const;

// -----------------------------------------------------------------------
// Lookup indexes
// -----------------------------------------------------------------------

/** Map from section ID to its definition */
const sectionById = new Map<string, Section>(SECTIONS.map((s) => [s.id, s]));

/** Map from topic to (sectionId, subSlug) */
const topicIndex = new Map<
  DemoTopic,
  { readonly sectionId: SectionId; readonly subSlug: string }
>();

/** Map from "sectionId/subSlug" to its SubSection and parent section */
const subIndex = new Map<
  string,
  { readonly section: Section; readonly sub: SubSection }
>();

for (const section of SECTIONS) {
  for (const sub of section.subs) {
    const key = `${section.id}/${sub.slug}`;
    subIndex.set(key, { section, sub });
    if (sub.topic !== null) {
      topicIndex.set(sub.topic, { sectionId: section.id, subSlug: sub.slug });
    }
  }
}

/**
 * Reverse index from route ID to its narration owner. Sub-route entries
 * are inserted first so they take priority over section-level entries
 * during lookup.
 */
const routeIndex = new Map<
  string,
  { readonly sectionId: SectionId; readonly subSlug: string | null }
>();

// Populate section-level entries first (broad matches).
for (const section of SECTIONS) {
  for (const routeId of section.routes) {
    routeIndex.set(routeId, { sectionId: section.id, subSlug: null });
  }
}

// Overwrite with sub-level entries where they exist (narrow matches
// win). The sub literals already carry their routes from SUB_ROUTES,
// so the section id and slug come typed from the taxonomy itself.
for (const section of SECTIONS) {
  for (const sub of section.subs) {
    for (const routeId of sub.routes ?? []) {
      routeIndex.set(routeId, { sectionId: section.id, subSlug: sub.slug });
    }
  }
}

// Mark unnarrated routes so the lookup can distinguish "known but
// unnarrated" from "completely unknown".
const unnarratedSet: ReadonlySet<string> = new Set(UNNARRATED_ROUTES);

// -----------------------------------------------------------------------
// Public lookup functions
// -----------------------------------------------------------------------

export function getSection(id: string): Section | undefined {
  return sectionById.get(id);
}

export function getSubByTopic(
  topic: DemoTopic,
): { readonly sectionId: SectionId; readonly subSlug: string } | undefined {
  return topicIndex.get(topic);
}

export function getSub(
  sectionId: string,
  subSlug: string,
): { readonly section: Section; readonly sub: SubSection } | undefined {
  return subIndex.get(`${sectionId}/${subSlug}`);
}

/**
 * Resolve a route ID to the story section (and optional sub-section)
 * that narrates it. A SUB_ROUTES match wins over a section-level
 * match. Unnarrated routes and unknown route IDs both return null.
 */
export function sectionForRoute(
  routeId: string,
): { sectionId: SectionId; subSlug: string | null } | null {
  if (unnarratedSet.has(routeId)) return null;
  return routeIndex.get(routeId) ?? null;
}

// -----------------------------------------------------------------------
// Slug / hash parsing
// -----------------------------------------------------------------------

/** A parsed hash is exactly a demo location. */
export type ParsedHash = DemoLocation;

/** Parse a location hash like "#login/credentials" or "#tickets" */
export function parseHash(hash: string): ParsedHash | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (raw === "") return null;

  const slashIdx = raw.indexOf("/");
  const sectionPart = slashIdx === -1 ? raw : raw.slice(0, slashIdx);
  const subPart = slashIdx === -1 ? null : raw.slice(slashIdx + 1);

  const section = sectionById.get(sectionPart);
  if (section === undefined) return null;

  // Validate sub-slug if present
  if (subPart !== null) {
    const found = section.subs.some((s) => s.slug === subPart);
    if (!found) return { sectionId: section.id, subSlug: null };
  }

  return { sectionId: section.id, subSlug: subPart ?? null };
}

/** Build a hash string from section + optional sub */
export function buildHash(
  sectionId: SectionId,
  subSlug?: string | null,
): string {
  if (subSlug !== null && subSlug !== undefined)
    return `#${sectionId}/${subSlug}`;
  return `#${sectionId}`;
}

/** DOM element ID for a section header */
export function sectionElementId(sectionId: SectionId): string {
  return `section-${sectionId}`;
}

/** DOM element ID for a sub-section */
export function subElementId(sectionId: SectionId, subSlug: string): string {
  return `sub-${sectionId}-${subSlug}`;
}

// -----------------------------------------------------------------------
// Phone command resolution
// -----------------------------------------------------------------------

export interface PhoneCommand {
  readonly feature: DemoFeature;
  readonly detail: string | null;
  readonly loginTarget: LoginAdvanceTarget | null;
  readonly openSearch: boolean;
  readonly pulseTopic: DemoTopic | null;
}

/**
 * Given a section and optional sub-section, compute what bridge commands
 * to send to the phone. The DEMO_DETAIL_TICKET_ID constant must be
 * passed in since this module cannot import it from bridge.ts at the
 * value level (it may not exist yet).
 */
export function resolvePhoneCommand(
  sectionId: SectionId,
  subSlug: string | null,
  ticketDetailId: string,
): PhoneCommand {
  // Find the topic for this sub-section
  let pulseTopic: DemoTopic | null = null;
  if (subSlug !== null) {
    const entry = subIndex.get(`${sectionId}/${subSlug}`);
    if (entry !== undefined) {
      pulseTopic = entry.sub.topic;
    }
  }

  switch (sectionId) {
    case "login": {
      // Every sub shows its screen in the phone, but none of these
      // targets COMPLETES auth: methods open without confirming, and
      // key-derivation only narrates (its screen exists only during
      // completion, which the bridge's completeLogin plays outside
      // this resolver).
      const LOGIN_SUB_TARGETS: ReadonlyMap<string, LoginAdvanceTarget> =
        new Map([
          ["credentials", "form"],
          ["language", "form"],
          ["two-factor", "twofa-picker"],
          ["totp", "method-totp"],
          ["passkey", "method-passkey"],
          ["email", "method-email"],
          ["sms", "method-sms"],
          ["push", "method-push"],
          ["backup-codes", "method-backup"],
        ]);
      const loginTarget =
        subSlug === null ? "form" : (LOGIN_SUB_TARGETS.get(subSlug) ?? null);
      return {
        feature: "login",
        detail: null,
        loginTarget,
        openSearch: false,
        pulseTopic,
      };
    }
    case "dashboard":
      return {
        feature: "home",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
      };
    case "tickets":
      return {
        feature: "tickets",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
      };
    case "ticket-detail":
      return {
        feature: "tickets",
        detail: ticketDetailId,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
      };
    case "search":
      return {
        feature: "tickets",
        detail: null,
        loginTarget: null,
        openSearch: true,
        pulseTopic,
      };
    case "library":
      return {
        feature: "library",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
      };
    case "admin":
      return {
        feature: "admin",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
      };
    case "schedule":
      return {
        feature: "schedule",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
      };
    case "settings":
      return {
        feature: "settings",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
      };
  }
}

// -----------------------------------------------------------------------
// Reverse mapping: bridge state -> nearest section/sub
// -----------------------------------------------------------------------

/**
 * Whether the phone's current screen family belongs to a story section.
 * This is the convergence predicate: the location store guarantees that
 * at rest the active section always matches the phone by this check.
 * Sub-section granularity finer than the phone screen (several subs
 * narrate one screen) is owned by topics and page selection within a
 * matching section.
 */
export function sectionMatchesPhone(
  sectionId: SectionId,
  feature: DemoFeature,
  detail: string | null,
  searchOpen: boolean,
): boolean {
  switch (sectionId) {
    case "login":
      return feature === "login";
    case "dashboard":
      return feature === "home";
    case "tickets":
      return feature === "tickets" && detail === null && !searchOpen;
    case "ticket-detail":
      return feature === "tickets" && detail !== null && !searchOpen;
    case "search":
      return searchOpen;
    case "library":
      return feature === "library";
    case "admin":
      return feature === "admin";
    case "schedule":
      return feature === "schedule";
    case "settings":
      return feature === "settings";
  }
}

/**
 * Map the phone's state to the section/sub-section that narrates it.
 * The location store adopts this whenever a phone-originated change
 * lands, so the page always renders what the phone shows.
 */
export function bridgeStateToLocation(
  feature: DemoFeature,
  detail: string | null,
  searchOpen: boolean,
  topic: DemoTopic | null,
  loginStage: LoginStage | null,
): ParsedHash {
  // The deriving screen is unmistakable and replaces the whole login
  // UI, so it outranks the last-clicked topic (the confirm tap that
  // started derivation must not pin the narrative to its 2FA method).
  if (feature === "login" && loginStage === "deriving") {
    return { sectionId: "login", subSlug: "key-derivation" };
  }

  // Topic takes priority when it is consistent with the phone's screen
  if (topic !== null) {
    const entry = topicIndex.get(topic);
    if (
      entry !== undefined &&
      sectionMatchesPhone(entry.sectionId, feature, detail, searchOpen)
    ) {
      return { sectionId: entry.sectionId, subSlug: entry.subSlug };
    }
  }

  if (searchOpen) {
    return { sectionId: "search", subSlug: "intro" };
  }

  if (feature === "login") {
    // Map login stage to sub-section (deriving handled above)
    if (loginStage === "twofa-picker" || loginStage === "twofa-method") {
      return { sectionId: "login", subSlug: "two-factor" };
    }
    // Resting form with no interaction: no sub selected, so the page
    // shows its helper tip until the visitor picks something or taps
    // the phone (a form tap classifies "credentials" and selects it).
    return { sectionId: "login", subSlug: null };
  }

  if (feature === "home") {
    return { sectionId: "dashboard", subSlug: "intro" };
  }

  if (feature === "library") {
    return { sectionId: "library", subSlug: "intro" };
  }

  if (feature === "admin") {
    return { sectionId: "admin", subSlug: "intro" };
  }

  if (feature === "schedule") {
    return { sectionId: "schedule", subSlug: "intro" };
  }

  if (feature === "settings") {
    return { sectionId: "settings", subSlug: "intro" };
  }

  if (detail !== null) {
    return { sectionId: "ticket-detail", subSlug: null };
  }

  return { sectionId: "tickets", subSlug: null };
}

// -----------------------------------------------------------------------
// Login topic / stage consistency
// -----------------------------------------------------------------------

const PICKER_AND_METHOD: ReadonlySet<LoginStage> = new Set([
  "twofa-picker",
  "twofa-method",
]);

/**
 * Which login stages each login topic's control is visible on. A
 * method topic is set by the picker tap that opens it, so method
 * topics are valid on both the picker and the open method screen.
 */
const LOGIN_TOPIC_STAGES: ReadonlyMap<
  DemoTopic,
  ReadonlySet<LoginStage>
> = new Map([
  ["credentials", new Set<LoginStage>(["form"])],
  ["language", new Set<LoginStage>(["form"])],
  ["twofa", PICKER_AND_METHOD],
  ["twofa-totp", PICKER_AND_METHOD],
  ["twofa-passkey", PICKER_AND_METHOD],
  ["twofa-email", PICKER_AND_METHOD],
  ["twofa-sms", PICKER_AND_METHOD],
  ["twofa-push", PICKER_AND_METHOD],
  ["twofa-backup", PICKER_AND_METHOD],
  ["key-derivation", new Set<LoginStage>(["deriving"])],
]);

/**
 * Whether a topic is still current for the given login stage. Login
 * topics go stale when the flow moves past their screen (a submitted
 * form's "credentials" tap must not pin the narrative once the phone
 * shows the 2FA picker). Non-login topics always pass; the section
 * check (sectionMatchesPhone) covers them.
 */
export function loginTopicMatchesStage(
  topic: DemoTopic,
  stage: LoginStage | null,
): boolean {
  const stages = LOGIN_TOPIC_STAGES.get(topic);
  if (stages === undefined) return true;
  return stage !== null && stages.has(stage);
}

// -----------------------------------------------------------------------
// Login-stage topic inference (for progress counting)
// -----------------------------------------------------------------------

/** Infer which login topics are "seen" based on loginStage transitions.
 *  A stage marks the steps the visitor has already been through, so the
 *  resting form marks nothing and each advance credits the prior step. */
export function loginStageTopics(
  stage: LoginStage | null,
): readonly DemoTopic[] {
  switch (stage) {
    case null:
    case "form":
      return [];
    case "twofa-picker":
      return ["credentials"];
    case "twofa-method":
      return ["credentials", "twofa"];
    case "deriving":
      return ["credentials", "twofa", "key-derivation"];
  }
}

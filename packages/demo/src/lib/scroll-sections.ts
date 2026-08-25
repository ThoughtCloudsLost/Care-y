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

/**
 * Where the phone should point while a sub-section is narrated.
 *
 * The pulse layer resolves its target from a DemoTopic by matching
 * translated control labels, which only ever finds CONTROLS. A
 * sub-section frequently narrates a region instead: a dashboard card,
 * an admin settings block, the search overlay. This descriptor names
 * that region directly so every sub has something to scroll to and
 * circle, topic or not.
 */
export interface SubHighlight {
  /**
   * Section id on a scroll-nav page (dashboard, admin org, admin
   * communications, manager). Drives a tap on the product's own
   * SectionScrollNav button, which expands the section, applies the
   * navbar + subnavbar offset, and moves the segmented indicator.
   * The ring then lands on `#section-<id>`.
   */
  readonly section?: string;
  /**
   * CSS selectors tried in order, for regions that are not scroll-nav
   * sections. Every selector must be traceable to product source.
   */
  readonly selectors?: readonly string[];
}

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
  /** When true, the pulse fires only at desktop width (1024px+). The
   *  phone-width pulse is skipped entirely (no log entry). */
  readonly desktopOnly?: boolean;
  /** Region the phone scrolls to and circles while this sub is read.
   *  Absent means the topic's pulse target is the region. */
  readonly highlight?: SubHighlight;
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

/**
 * Entry page section: displayed before the visitor enters the story.
 * Uses id "login" because FlowStory blocks need a legal SectionId and
 * the phone is on the login splash under the entry page. NOT added to
 * SECTIONS so TopBar, parseHash, pill math, and the 12-section invariant
 * are unaffected. While the entry page is visible, App-level gates
 * prevent these subs from reaching the location store.
 */
export const ENTRY_SECTION: Section = {
  id: "login",
  titleKey: "demo_entry_title",
  descKey: "demo_entry_desc",
  routes: [],
  subs: [
    {
      slug: "navigation",
      topic: null,
      headingKey: "demo_entry_nav_heading",
      bodyKey: "demo_entry_nav_body",
    },
    {
      slug: "simulator-controls",
      topic: null,
      headingKey: "demo_entry_controls_heading",
      bodyKey: "demo_entry_controls_body",
    },
    {
      slug: "data-flow",
      topic: null,
      headingKey: "demo_entry_flow_heading",
      bodyKey: "demo_entry_flow_body",
    },
    {
      slug: "role-switching",
      topic: null,
      headingKey: "demo_entry_roles_heading",
      bodyKey: "demo_entry_roles_body",
    },
  ],
};

export const SECTIONS: readonly Section[] = [
  {
    id: "login",
    titleKey: "demo_section_login_title",
    descKey: "demo_section_login_desc",
    routes: SECTION_ROUTES.login,
    subs: [
      {
        slug: "language",
        topic: "language",
        headingKey: "demo_narrative_topic_language_heading",
        bodyKey: "demo_narrative_topic_language_body",
      },
      {
        slug: "credentials",
        topic: "credentials",
        headingKey: "demo_narrative_topic_credentials_heading",
        bodyKey: "demo_narrative_topic_credentials_body",
      },
      {
        slug: "two-factor",
        topic: "twofa",
        headingKey: "demo_narrative_topic_twofa_heading",
        bodyKey: "demo_narrative_topic_twofa_body",
      },
      // One sub per 2FA method, in the seed's enrolled method insert
      // order (webauthn first)
      {
        slug: "passkey",
        topic: "twofa-passkey",
        headingKey: "demo_narrative_topic_twofa_passkey_heading",
        bodyKey: "demo_narrative_topic_twofa_passkey_body",
      },
      {
        slug: "totp",
        topic: "twofa-totp",
        headingKey: "demo_narrative_topic_twofa_totp_heading",
        bodyKey: "demo_narrative_topic_twofa_totp_body",
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
        // The deriving screen only exists during a completed sign-in,
        // which the demo fast-forwards off screen (the topic pulse is
        // allowlisted as missing). Circle the auth card instead: the
        // derivation this sub narrates runs inside that flow.
        highlight: { selectors: [".auth-container"] },
      },
    ],
  },
  {
    id: "dashboard",
    titleKey: "demo_section_dashboard_title",
    descKey: "demo_section_dashboard_desc",
    routes: SECTION_ROUTES.dashboard,
    subs: [
      // The dashboard is a scroll-nav page: every sub except the
      // view switcher and the create button narrates a `#section-<id>`
      // block (routes/(app)/+page.svelte, the .scroll-target divs).
      {
        slug: "getting-started",
        topic: "dashboard-getting-started",
        headingKey: "demo_narrative_dashboard_getting_started_heading",
        bodyKey: "demo_narrative_dashboard_getting_started_body",
        highlight: { section: "getting-started" },
      },
      {
        slug: "shift",
        topic: "dashboard-shift",
        headingKey: "demo_narrative_dashboard_shift_heading",
        bodyKey: "demo_narrative_dashboard_shift_body",
        highlight: { section: "shift" },
      },
      {
        slug: "queues",
        topic: "dashboard-queues",
        headingKey: "demo_narrative_dashboard_queues_heading",
        bodyKey: "demo_narrative_dashboard_queues_body",
        highlight: { section: "queues" },
      },
      {
        slug: "activity",
        topic: "dashboard-activity",
        headingKey: "demo_narrative_dashboard_activity_heading",
        bodyKey: "demo_narrative_dashboard_activity_body",
        highlight: { section: "activity" },
      },
      {
        slug: "kb",
        topic: "dashboard-kb",
        headingKey: "demo_narrative_dashboard_kb_heading",
        bodyKey: "demo_narrative_dashboard_kb_body",
        highlight: { section: "kb" },
      },
      {
        slug: "view-switcher",
        topic: "dashboard-view-switcher",
        headingKey: "demo_narrative_dashboard_view_switcher_heading",
        bodyKey: "demo_narrative_dashboard_view_switcher_body",
      },
      {
        slug: "needs-attention",
        topic: "dashboard-needs-attention",
        headingKey: "demo_narrative_dashboard_needs_attention_heading",
        bodyKey: "demo_narrative_dashboard_needs_attention_body",
        highlight: { section: "needs-attention" },
      },
      {
        slug: "my-tickets",
        topic: "dashboard-my-tickets",
        headingKey: "demo_narrative_dashboard_my_tickets_heading",
        bodyKey: "demo_narrative_dashboard_my_tickets_body",
        highlight: { section: "my-tickets" },
      },
      {
        slug: "unassigned",
        topic: "dashboard-unassigned",
        headingKey: "demo_narrative_dashboard_unassigned_heading",
        bodyKey: "demo_narrative_dashboard_unassigned_body",
        highlight: { section: "unassigned" },
      },
      {
        slug: "on-hold",
        topic: "dashboard-on-hold",
        headingKey: "demo_narrative_dashboard_on_hold_heading",
        bodyKey: "demo_narrative_dashboard_on_hold_body",
        highlight: { section: "on-hold" },
      },
      {
        slug: "create",
        topic: "dashboard-create",
        headingKey: "demo_narrative_dashboard_create_heading",
        bodyKey: "demo_narrative_dashboard_create_body",
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
        slug: "decryption",
        topic: "decryption",
        headingKey: "demo_narrative_topic_decryption_heading",
        bodyKey: "demo_narrative_topic_decryption_body",
      },
      {
        slug: "view-modes",
        topic: "view-modes",
        headingKey: "demo_narrative_topic_view_modes_heading",
        bodyKey: "demo_narrative_topic_view_modes_body",
      },
      {
        slug: "stats",
        topic: "list-stats",
        headingKey: "demo_narrative_topic_list_stats_heading",
        bodyKey: "demo_narrative_topic_list_stats_body",
      },
      {
        slug: "sort",
        topic: "sort",
        headingKey: "demo_narrative_topic_sort_heading",
        bodyKey: "demo_narrative_topic_sort_body",
      },
      {
        slug: "select-mode",
        topic: "select-mode",
        headingKey: "demo_narrative_topic_select_mode_heading",
        bodyKey: "demo_narrative_topic_select_mode_body",
      },
      {
        slug: "page-search",
        topic: "page-search",
        headingKey: "demo_narrative_topic_list_search_heading",
        bodyKey: "demo_narrative_topic_list_search_body",
      },
      {
        slug: "saved-filters",
        topic: "saved-filters",
        headingKey: "demo_narrative_topic_saved_filters_heading",
        bodyKey: "demo_narrative_topic_saved_filters_body",
      },
      {
        slug: "filters",
        topic: "filters",
        headingKey: "demo_narrative_topic_filters_heading",
        bodyKey: "demo_narrative_topic_filters_body",
      },
      {
        slug: "unread-badges",
        topic: "unread-badges",
        headingKey: "demo_narrative_topic_unread_badges_heading",
        bodyKey: "demo_narrative_topic_unread_badges_body",
      },
      {
        slug: "quick-actions",
        topic: "quick-actions",
        headingKey: "demo_narrative_topic_quick_actions_heading",
        bodyKey: "demo_narrative_topic_quick_actions_body",
      },
      {
        slug: "new-ticket",
        topic: "new-ticket",
        headingKey: "demo_narrative_topic_new_ticket_heading",
        bodyKey: "demo_narrative_topic_new_ticket_body",
      },
      {
        slug: "split-view",
        topic: "split-view",
        headingKey: "demo_narrative_topic_split_view_heading",
        bodyKey: "demo_narrative_topic_split_view_body",
        desktopOnly: true,
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
        slug: "case-header",
        topic: "case-header",
        headingKey: "demo_narrative_topic_case_header_heading",
        bodyKey: "demo_narrative_topic_case_header_body",
      },
      // The fold and the panel follow the header directly: all three
      // narrate the case record itself, before the story moves into
      // the conversation tooling.
      {
        slug: "case-fold",
        topic: "case-fold",
        headingKey: "demo_narrative_topic_case_fold_heading",
        bodyKey: "demo_narrative_topic_case_fold_body",
      },
      {
        slug: "case-panel",
        topic: "case-panel",
        headingKey: "demo_narrative_topic_case_panel_heading",
        bodyKey: "demo_narrative_topic_case_panel_body",
      },
      {
        slug: "thread-filters",
        topic: "thread-filters",
        headingKey: "demo_narrative_topic_thread_filters_heading",
        bodyKey: "demo_narrative_topic_thread_filters_body",
      },
      {
        slug: "deep-search",
        topic: "deep-search",
        headingKey: "demo_narrative_topic_deep_search_heading",
        bodyKey: "demo_narrative_topic_deep_search_body",
      },
      // The timeline sub sits directly before the conversation sub so
      // the story returns to the message view naturally after showing
      // the timeline.
      {
        slug: "timeline",
        topic: "timeline",
        headingKey: "demo_narrative_topic_timeline_heading",
        bodyKey: "demo_narrative_topic_timeline_body",
      },
      {
        slug: "conversation",
        topic: "conversation",
        headingKey: "demo_narrative_topic_conversation_heading",
        bodyKey: "demo_narrative_topic_conversation_body",
      },
      // call-log and the three media subs directly follow the
      // conversation sub: its pulse lands the thread in the message
      // view, where the call entries and the seeded media cluster
      // live near the newest end.
      {
        slug: "call-log",
        topic: null,
        headingKey: "demo_narrative_topic_call_log_heading",
        bodyKey: "demo_narrative_topic_call_log_body",
        highlight: { selectors: [".call-entry"] },
      },
      {
        slug: "voicemails",
        topic: null,
        headingKey: "demo_narrative_topic_voicemails_heading",
        bodyKey: "demo_narrative_topic_voicemails_body",
        // .audio-player is the loaded state (AudioPlayer.svelte);
        // .voicemail-player only exists on the loading and error
        // branches of VoicemailPlayer.svelte.
        highlight: { selectors: [".audio-player", ".voicemail-player"] },
      },
      {
        slug: "media-images",
        topic: null,
        headingKey: "demo_narrative_topic_media_images_heading",
        bodyKey: "demo_narrative_topic_media_images_body",
        highlight: { selectors: [".mms-thumbnail"] },
      },
      {
        slug: "files",
        topic: null,
        headingKey: "demo_narrative_topic_files_heading",
        bodyKey: "demo_narrative_topic_files_body",
        highlight: { selectors: [".attachment-chip"] },
      },
      {
        slug: "date-separators",
        topic: null,
        headingKey: "demo_narrative_topic_date_separators_heading",
        bodyKey: "demo_narrative_topic_date_separators_body",
        highlight: { selectors: [".date-separator"] },
      },
      {
        slug: "system-events",
        topic: null,
        headingKey: "demo_narrative_topic_system_events_heading",
        bodyKey: "demo_narrative_topic_system_events_body",
        highlight: { selectors: [".system-event"] },
      },
      {
        slug: "notes",
        // Highlight the seeded note already in the thread rather than
        // choreographing a new one; the notes topic stays classifiable
        // for real taps on the note sheet.
        topic: null,
        headingKey: "demo_narrative_topic_notes_heading",
        bodyKey: "demo_narrative_topic_notes_body",
        highlight: { selectors: [".private-note-wrapper"] },
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
        slug: "message-select",
        topic: "message-select",
        headingKey: "demo_narrative_topic_message_select_heading",
        bodyKey: "demo_narrative_topic_message_select_body",
      },
      {
        slug: "message-actions",
        topic: "message-actions",
        headingKey: "demo_narrative_topic_message_actions_heading",
        bodyKey: "demo_narrative_topic_message_actions_body",
      },
      {
        slug: "exposure-hints",
        topic: "exposure-hints",
        headingKey: "demo_narrative_topic_exposure_hints_heading",
        bodyKey: "demo_narrative_topic_exposure_hints_body",
      },
      {
        slug: "close-reopen",
        topic: "close-reopen",
        headingKey: "demo_narrative_topic_close_reopen_heading",
        bodyKey: "demo_narrative_topic_close_reopen_body",
      },
    ],
  },
  {
    id: "search",
    titleKey: "demo_section_search_title",
    descKey: "demo_section_search_desc",
    routes: SECTION_ROUTES.search,
    subs: [
      // The search overlay renders its entity groups and deep-search
      // panel only once the query passes two characters
      // (SearchResults.svelte:90-158), so the phone seeds
      // DEMO_SEARCH_QUERY on entry and these regions exist to circle.
      {
        slug: "overlay",
        topic: null,
        headingKey: "demo_narrative_search_overlay_heading",
        bodyKey: "demo_narrative_search_overlay_body",
        // ShellSheet at phone width (AppShell.svelte:1462), dropdown
        // at desktop width (AppShell.svelte:1437).
        highlight: { selectors: [".search-sheet", ".search-dropdown"] },
      },
      {
        slug: "entities",
        topic: null,
        headingKey: "demo_narrative_search_entities_heading",
        bodyKey: "demo_narrative_search_entities_body",
        // SearchSection root (SearchSection.svelte:59), one per
        // provider group.
        highlight: { selectors: [".search-section"] },
      },
      {
        slug: "how-it-works",
        topic: null,
        headingKey: "demo_narrative_search_how_heading",
        bodyKey: "demo_narrative_search_how_body",
        // FullSearchPanel root (FullSearchPanel.svelte:53); the
        // escalation trigger inside it (:87) is the fallback.
        highlight: { selectors: [".full-search-panel", ".panel-trigger"] },
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
        slug: "browse",
        topic: null,
        headingKey: "demo_narrative_library_browse_heading",
        bodyKey: "demo_narrative_library_browse_body",
        // Library list root (library/+page.svelte:852).
        highlight: { selectors: [".library-page"] },
      },
      {
        slug: "tools",
        topic: "library-tools",
        headingKey: "demo_narrative_topic_library_tools_heading",
        bodyKey: "demo_narrative_topic_library_tools_body",
      },
      {
        slug: "search",
        topic: "library-search",
        headingKey: "demo_narrative_topic_library_search_heading",
        bodyKey: "demo_narrative_topic_library_search_body",
      },
      {
        slug: "categories",
        topic: "library-categories",
        headingKey: "demo_narrative_topic_library_categories_heading",
        bodyKey: "demo_narrative_topic_library_categories_body",
      },
      {
        slug: "editor",
        topic: "library-editor",
        headingKey: "demo_narrative_topic_library_editor_heading",
        bodyKey: "demo_narrative_topic_library_editor_body",
        routes: SUB_ROUTES["library/editor"],
      },
      {
        slug: "detail",
        topic: null,
        headingKey: "demo_narrative_library_detail_heading",
        bodyKey: "demo_narrative_library_detail_body",
        // ArticleDetailView root (ArticleDetailView.svelte:446).
        highlight: { selectors: [".article-detail"] },
      },
      {
        slug: "attachments",
        topic: null,
        headingKey: "demo_narrative_library_attachments_heading",
        bodyKey: "demo_narrative_library_attachments_body",
        // Attachments section (ArticleDetailView.svelte:485), rendered
        // only when the article carries non-image attachments; the
        // article body stands in when the seed has none.
        highlight: { selectors: [".attachments", ".article-detail"] },
      },
      {
        slug: "vote",
        topic: "library-vote",
        headingKey: "demo_narrative_topic_library_vote_heading",
        bodyKey: "demo_narrative_topic_library_vote_body",
        routes: SUB_ROUTES["library/vote"],
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
        slug: "hub",
        topic: null,
        headingKey: "demo_narrative_admin_hub_heading",
        bodyKey: "demo_narrative_admin_hub_body",
        // Hub root (admin/+page.svelte:198). Its section ids come from
        // GROUP_ORDER and vary with permissions, so the page as a
        // whole is the region this sub narrates.
        highlight: { selectors: [".admin-hub"] },
      },
    ],
  },
  {
    id: "admin-people",
    titleKey: "demo_section_admin_people_title",
    descKey: "demo_section_admin_people_desc",
    routes: SECTION_ROUTES["admin-people"],
    subs: [
      {
        slug: "people",
        topic: "admin-roster-edit",
        headingKey: "demo_narrative_admin_people_heading",
        bodyKey: "demo_narrative_admin_people_body",
      },
      {
        slug: "roster-tools",
        topic: "admin-roster-tools",
        headingKey: "demo_narrative_admin_roster_tools_heading",
        bodyKey: "demo_narrative_admin_roster_tools_body",
      },
      {
        slug: "queues",
        topic: "admin-queues",
        headingKey: "demo_narrative_admin_queues_heading",
        bodyKey: "demo_narrative_admin_queues_body",
      },
      {
        slug: "clients",
        topic: "admin-clients",
        headingKey: "demo_narrative_admin_clients_heading",
        bodyKey: "demo_narrative_admin_clients_body",
      },
      {
        slug: "client-merge",
        topic: "admin-client-merge",
        headingKey: "demo_narrative_admin_client_merge_heading",
        bodyKey: "demo_narrative_admin_client_merge_body",
        // The merge tool is selection-gated inside a sheet, so its
        // topic pulse is allowlisted as missing. Circle the clients
        // tabpanel the merge flow operates on instead.
        highlight: { selectors: ["#panel-clients"] },
      },
      {
        slug: "roles",
        topic: "admin-roles",
        headingKey: "demo_narrative_admin_roles_heading",
        bodyKey: "demo_narrative_admin_roles_body",
        // The manager page is a scroll-nav page; "role" is its first
        // section (admin/manager/+page.svelte:82).
        highlight: { section: "role" },
      },
    ],
  },
  {
    id: "admin-comms",
    titleKey: "demo_section_admin_comms_title",
    descKey: "demo_section_admin_comms_desc",
    routes: SECTION_ROUTES["admin-comms"],
    // Scroll-nav page (CollapsibleSectionPage). Section ids come from
    // admin/communications/+page.svelte:21-49; two subs share the
    // telephony section and sms-templates maps to "templates".
    subs: [
      {
        slug: "provider",
        topic: "admin-telephony-provider",
        headingKey: "demo_narrative_admin_telephony_provider_heading",
        bodyKey: "demo_narrative_admin_telephony_provider_body",
        highlight: { section: "telephony" },
      },
      {
        slug: "phone-lines",
        topic: "admin-phone-lines",
        headingKey: "demo_narrative_admin_phone_lines_heading",
        bodyKey: "demo_narrative_admin_phone_lines_body",
        highlight: { section: "telephony" },
      },
      {
        slug: "greetings",
        topic: "admin-greetings",
        headingKey: "demo_narrative_admin_greetings_heading",
        bodyKey: "demo_narrative_admin_greetings_body",
        highlight: { section: "greetings" },
      },
      {
        slug: "sms-templates",
        topic: "admin-sms-templates",
        headingKey: "demo_narrative_admin_sms_templates_heading",
        bodyKey: "demo_narrative_admin_sms_templates_body",
        highlight: { section: "templates" },
      },
      {
        slug: "blocklist",
        topic: "admin-blocklist",
        headingKey: "demo_narrative_admin_blocklist_heading",
        bodyKey: "demo_narrative_admin_blocklist_body",
        highlight: { section: "blocklist" },
      },
      {
        slug: "quarantine",
        topic: "admin-quarantine",
        headingKey: "demo_narrative_admin_quarantine_heading",
        bodyKey: "demo_narrative_admin_quarantine_body",
        highlight: { section: "quarantine" },
      },
    ],
  },
  {
    id: "admin-org",
    titleKey: "demo_section_admin_org_title",
    descKey: "demo_section_admin_org_desc",
    routes: SECTION_ROUTES["admin-org"],
    // Scroll-nav page (CollapsibleSectionPage). Every sub slug matches
    // its section id 1:1 (admin/organization/+page.svelte:27-67).
    subs: [
      {
        slug: "general",
        topic: "admin-general",
        headingKey: "demo_narrative_admin_general_heading",
        bodyKey: "demo_narrative_admin_general_body",
        highlight: { section: "general" },
      },
      {
        slug: "branding",
        topic: "admin-branding",
        headingKey: "demo_narrative_admin_branding_heading",
        bodyKey: "demo_narrative_admin_branding_body",
        highlight: { section: "branding" },
      },
      {
        slug: "terminology",
        topic: "admin-terminology",
        headingKey: "demo_narrative_admin_terminology_heading",
        bodyKey: "demo_narrative_admin_terminology_body",
        highlight: { section: "terminology" },
      },
      {
        slug: "keys",
        topic: "admin-keys",
        headingKey: "demo_narrative_admin_keys_heading",
        bodyKey: "demo_narrative_admin_keys_body",
        highlight: { section: "keys" },
      },
      {
        slug: "retention",
        topic: "admin-retention",
        headingKey: "demo_narrative_admin_retention_heading",
        bodyKey: "demo_narrative_admin_retention_body",
        highlight: { section: "retention" },
      },
      {
        slug: "note-types",
        topic: "admin-note-types",
        headingKey: "demo_narrative_admin_note_types_heading",
        bodyKey: "demo_narrative_admin_note_types_body",
        highlight: { section: "note-types" },
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
        // Schedule placeholder (more/schedule/+page.svelte). The page
        // is styled with utility classes only, so it carries a testid.
        highlight: { selectors: ['[data-testid="schedule-placeholder"]'] },
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
        slug: "identity",
        topic: "settings-profile",
        headingKey: "demo_narrative_settings_identity_heading",
        bodyKey: "demo_narrative_settings_identity_body",
      },
      {
        slug: "password",
        topic: "settings-password",
        headingKey: "demo_narrative_settings_password_heading",
        bodyKey: "demo_narrative_settings_password_body",
      },
      {
        slug: "appearance",
        topic: "settings-appearance",
        headingKey: "demo_narrative_settings_appearance_heading",
        bodyKey: "demo_narrative_settings_appearance_body",
      },
      {
        slug: "two-factor",
        topic: "settings-2fa",
        headingKey: "demo_narrative_settings_twofa_heading",
        bodyKey: "demo_narrative_settings_twofa_body",
      },
      {
        slug: "security",
        topic: "settings-security",
        headingKey: "demo_narrative_settings_security_heading",
        bodyKey: "demo_narrative_settings_security_body",
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

/** Internal lookup; exported only for test contract validation. */
export function getSub(
  sectionId: string,
  subSlug: string,
): { readonly section: Section; readonly sub: SubSection } | undefined {
  return subIndex.get(`${sectionId}/${subSlug}`);
}

/** Exported as public contract (consumed by tests and the location store). */
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

/**
 * Convert a route ID to a navigable pathname by stripping group
 * segments (parenthesised, e.g. "(app)"). Shared by the slug builder
 * below and PhoneApp's route-slug navigation.
 */
export function pathnameForRouteId(routeId: string): string {
  return (
    routeId
      .split("/")
      .filter((s) => !(s.startsWith("(") && s.endsWith(")")))
      .join("/") || "/"
  );
}

/**
 * Produce a stable slug from a manifest route ID. Strips the leading
 * "/(app)" group prefix, drops brackets and dots from param segments,
 * removes remaining group segments, and joins what is left with "-".
 *
 * Examples:
 *   "/(app)/reports"                 -> "reports"
 *   "/(app)/a/[x]"                   -> "a-x"
 *   "/(app)/more/settings"           -> "more-settings"
 *   "/(app)/tickets/[id]"            -> "tickets-id"
 *   "/(app)/library/[articleId]/edit" -> "library-articleId-edit"
 */
export function slugForRoute(routeId: string): string {
  const parts = routeId
    .split("/")
    .filter((s) => s.length > 0)
    // Drop group segments (parenthesised, e.g. "(app)")
    .filter((s) => !(s.startsWith("(") && s.endsWith(")")))
    // Clean param brackets and rest-param dots
    .map((s) => s.replace(/[[\]\.]/g, ""));

  // The root route /(app) leaves no segments after group stripping.
  // Return "root" so every manifest route produces a non-empty slug.
  const slug = parts.join("-");
  return slug === "" ? "root" : slug;
}

/**
 * Lazily-built reverse index from slug to the first unmapped route ID.
 * Initialized on first routeForSlug call when the route manifest is
 * available (the caller passes the full route ID list).
 */
let slugToRouteId: ReadonlyMap<string, string> | null = null;
let slugToRouteIdSource: readonly string[] | null = null;

function ensureSlugIndex(
  routeIds: readonly string[],
): ReadonlyMap<string, string> {
  // Re-build only when the input changes (in practice it never does
  // after the first call, but referential equality keeps it honest).
  if (slugToRouteId !== null && slugToRouteIdSource === routeIds) {
    return slugToRouteId;
  }
  const index = new Map<string, string>();
  for (const rid of routeIds) {
    const slug = slugForRoute(rid);
    // First unmapped route wins; narrated routes are excluded.
    if (!index.has(slug) && sectionForRoute(rid) === null) {
      index.set(slug, rid);
    }
  }
  slugToRouteId = index;
  slugToRouteIdSource = routeIds;
  return index;
}

/**
 * Reverse lookup: find the first route ID whose slugForRoute matches
 * the given slug AND whose sectionForRoute is null (unmapped). Returns
 * null when no candidate qualifies.
 */
export function routeForSlug(
  slug: string,
  routeIds: readonly string[],
): string | null {
  return ensureSlugIndex(routeIds).get(slug) ?? null;
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

  // "coming-soon" is a synthesized section with no entry in sectionById.
  // A bare "#coming-soon" with no route slug is meaningless (there is no
  // generic coming-soon section), so it returns null. With a slug it
  // produces a valid location the outer page can render.
  if (sectionPart === "coming-soon") {
    if (subPart === null || subPart === "") return null;
    return { sectionId: "coming-soon", subSlug: subPart };
  }

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
// Login sub-target map (module-scope, constructed once)
// -----------------------------------------------------------------------

const LOGIN_SUB_TARGETS: ReadonlyMap<string, LoginAdvanceTarget> = new Map([
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

// -----------------------------------------------------------------------
// Phone command resolution
// -----------------------------------------------------------------------

export interface PhoneCommand {
  readonly feature: DemoFeature;
  readonly detail: string | null;
  readonly loginTarget: LoginAdvanceTarget | null;
  readonly openSearch: boolean;
  readonly pulseTopic: DemoTopic | null;
  /** When true, the pulse fires only at desktop width (1024px+).
   *  Resolved from the sub entry's desktopOnly flag (false when absent). */
  readonly pulseDesktopOnly: boolean;
  /**
   * For "coming-soon" sections: the route slug that identifies which
   * unmapped route the phone should navigate to. Null for all narrated
   * sections.
   */
  readonly routeSlug: string | null;
  /**
   * Region the phone scrolls to and circles for this sub. Null when
   * the sub names no region of its own, in which case the pulse's
   * resolved element is the region.
   */
  readonly highlight: SubHighlight | null;
}

/**
 * Given a section and optional sub-section, compute what bridge commands
 * to send to the phone. The DEMO_DETAIL_TICKET_ID constant must be
 * passed in since this module cannot import it from bridge.ts at the
 * value level (it may not exist yet). The articleDetailId serves the
 * same role for the library section's vote sub.
 */
export function resolvePhoneCommand(
  sectionId: SectionId,
  subSlug: string | null,
  ticketDetailId: string,
  articleDetailId: string,
): PhoneCommand {
  // Find the topic, desktopOnly flag, and highlight region for this
  // sub-section
  let pulseTopic: DemoTopic | null = null;
  let pulseDesktopOnly = false;
  let highlight: SubHighlight | null = null;
  if (subSlug !== null) {
    const entry = subIndex.get(`${sectionId}/${subSlug}`);
    if (entry !== undefined) {
      pulseTopic = entry.sub.topic;
      pulseDesktopOnly = entry.sub.desktopOnly === true;
      highlight = entry.sub.highlight ?? null;
    }
  }

  switch (sectionId) {
    case "login": {
      // Every sub shows its screen in the phone, but none of these
      // targets COMPLETES auth: methods open without confirming, and
      // key-derivation only narrates (its screen exists only during a
      // completed sign-in, which the demo fast-forwards behind the
      // splash instead of playing on screen).
      const loginTarget =
        subSlug === null ? "form" : (LOGIN_SUB_TARGETS.get(subSlug) ?? null);
      return {
        feature: "login",
        detail: null,
        loginTarget,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    }
    case "dashboard":
      return {
        feature: "home",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "tickets":
      return {
        feature: "tickets",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "ticket-detail":
      return {
        feature: "tickets",
        detail: ticketDetailId,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "search":
      return {
        feature: "tickets",
        detail: null,
        loginTarget: null,
        openSearch: true,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "library": {
      let libraryDetail: string | null = null;
      if (
        subSlug === "vote" ||
        subSlug === "detail" ||
        subSlug === "attachments"
      ) {
        libraryDetail = articleDetailId;
      } else if (subSlug === "editor") {
        libraryDetail = "new";
      }
      return {
        feature: "library",
        detail: libraryDetail,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    }
    case "admin":
      return {
        feature: "admin",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "admin-people":
      return {
        feature: "admin",
        detail: subSlug === "roles" ? "manager" : "people",
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "admin-comms":
      return {
        feature: "admin",
        detail: "communications",
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "admin-org":
      return {
        feature: "admin",
        detail: "organization",
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "schedule":
      return {
        feature: "schedule",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "settings":
      return {
        feature: "settings",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "coming-soon":
      return {
        feature: "other",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic: null,
        pulseDesktopOnly: false,
        routeSlug: subSlug,
        highlight: null,
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
 *
 * The routeId and subSlug parameters are needed for "coming-soon"
 * convergence: the phone shows an unmapped route, and the section
 * matches only when the route slug derived from that route ID equals
 * the sub-slug the coming-soon section was opened with. Both default
 * to null so all existing call sites remain type-correct.
 */
export function sectionMatchesPhone(
  sectionId: SectionId,
  feature: DemoFeature,
  detail: string | null,
  searchOpen: boolean,
  routeId: string | null = null,
  subSlug: string | null = null,
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
      return feature === "admin" && detail === null;
    case "admin-people":
      return (
        feature === "admin" &&
        (detail === "people" || detail === "manager" || detail === "volunteer")
      );
    case "admin-comms":
      return feature === "admin" && detail === "communications";
    case "admin-org":
      return feature === "admin" && detail === "organization";
    case "schedule":
      return feature === "schedule";
    case "settings":
      return feature === "settings";
    case "coming-soon":
      return (
        routeId !== null &&
        sectionForRoute(routeId) === null &&
        subSlug !== null &&
        slugForRoute(routeId) === subSlug
      );
  }
}

/**
 * Map the phone's state to the section/sub-section that narrates it.
 * The location store adopts this whenever a phone-originated change
 * lands, so the page always renders what the phone shows.
 *
 * The routeId parameter enables the "coming-soon" fallback: when the
 * phone is on a manifest route that no story section narrates, the
 * location falls through to coming-soon with a slug derived from the
 * route ID. Defaults to null for backwards compatibility.
 */
export function bridgeStateToLocation(
  feature: DemoFeature,
  detail: string | null,
  searchOpen: boolean,
  topic: DemoTopic | null,
  loginStage: LoginStage | null,
  routeId: string | null = null,
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
    return { sectionId: "search", subSlug: "overlay" };
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
    return { sectionId: "dashboard", subSlug: "getting-started" };
  }

  if (feature === "library") {
    if (detail === "new") {
      return { sectionId: "library", subSlug: "editor" };
    }
    if (detail !== null) {
      return { sectionId: "library", subSlug: "detail" };
    }
    return { sectionId: "library", subSlug: "browse" };
  }

  if (feature === "admin") {
    // When arriving at an admin sub-page without a topic, map the
    // detail to the section that narrates it. The first sub is selected
    // so the page highlights the card for the screen's landing state.
    if (detail === "manager" || detail === "volunteer") {
      return { sectionId: "admin-people", subSlug: "roles" };
    }
    if (detail === "people") {
      return { sectionId: "admin-people", subSlug: "people" };
    }
    if (detail === "organization") {
      return { sectionId: "admin-org", subSlug: "general" };
    }
    if (detail === "communications") {
      return { sectionId: "admin-comms", subSlug: "provider" };
    }
    return { sectionId: "admin", subSlug: "hub" };
  }

  if (feature === "schedule") {
    return { sectionId: "schedule", subSlug: "intro" };
  }

  if (feature === "settings") {
    return { sectionId: "settings", subSlug: "identity" };
  }

  // Feature "other" means the phone is on a route the manifest knows
  // but no story section narrates. Fall through to coming-soon when the
  // route ID confirms the unmapped status.
  if (
    feature === "other" &&
    routeId !== null &&
    sectionForRoute(routeId) === null
  ) {
    return { sectionId: "coming-soon", subSlug: slugForRoute(routeId) };
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

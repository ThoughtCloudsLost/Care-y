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

/**
 * Which arc a section belongs to. The two groups are two different
 * readers: "org" is a volunteer signed in to the app, "client" is a
 * help-seeker who is not a member of the org at all. They render under
 * different shells and under different viewer identities, so the
 * contents menu labels them separately rather than running one flat list.
 */
export type SectionGroup = "org" | "client";

export interface Section {
  readonly id: SectionId;
  /** Message key suffix for the section title */
  readonly titleKey: string;
  /** Message key suffix for the section description */
  readonly descKey: string;
  readonly subs: readonly SubSection[];
  /** All route IDs this section narrates, in either mounted group. */
  readonly routes: readonly string[];
  /** Arc this section belongs to. Consumed by the contents menu. */
  readonly group: SectionGroup;
}

// -----------------------------------------------------------------------
// Taxonomy (frozen)
// -----------------------------------------------------------------------

/**
 * Entry page section: displayed before the visitor enters the story.
 * Uses id "login" because FlowStory blocks need a legal SectionId and
 * the phone is on the login splash under the entry page. NOT added to
 * SECTIONS so TopBar, parseHash, and pill math are unaffected. Every
 * count derived from SECTIONS excludes it. While the entry page is
 * visible, App-level gates
 * prevent these subs from reaching the location store.
 */
export const ENTRY_SECTION: Section = {
  id: "login",
  titleKey: "demo_entry_title",
  descKey: "demo_entry_desc",
  routes: [],
  group: "org",
  subs: [
    {
      slug: "navigation",
      topic: null,
      headingKey: "demo_entry_nav_heading",
      bodyKey: "demo_entry_nav_body",
    },
    {
      slug: "search",
      topic: null,
      headingKey: "demo_entry_search_heading",
      bodyKey: "demo_entry_search_body",
    },
    {
      slug: "simulator-controls",
      topic: null,
      headingKey: "demo_entry_controls_heading",
      bodyKey: "demo_entry_controls_body",
    },
    {
      slug: "viewing-modes",
      topic: null,
      headingKey: "demo_entry_modes_heading",
      bodyKey: "demo_entry_modes_body",
    },
    {
      slug: "role-switching",
      topic: null,
      headingKey: "demo_entry_roles_heading",
      bodyKey: "demo_entry_roles_body",
    },
    {
      slug: "data-flow",
      topic: null,
      headingKey: "demo_entry_flow_heading",
      bodyKey: "demo_entry_flow_body",
    },
  ],
};

export const SECTIONS: readonly Section[] = [
  {
    id: "login",
    titleKey: "demo_section_login_title",
    descKey: "demo_section_login_desc",
    routes: SECTION_ROUTES.login,
    group: "org",
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
    group: "org",
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
        slug: "merge-candidates",
        topic: "dashboard-merge-candidates",
        headingKey: "demo_narrative_dashboard_merge_candidates_heading",
        bodyKey: "demo_narrative_dashboard_merge_candidates_body",
        // Another scroll-target block on the same page ((app)/+page.svelte,
        // #section-merge-candidates). Rendered only when the scan finds
        // candidates, which the seeded clients do produce.
        highlight: { section: "merge-candidates" },
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
    group: "org",
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
    group: "org",
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
      // The three portal-tier subs follow case-panel directly, because
      // every one of them narrates something PortalTierSection renders
      // inside the case panel (TicketPanelContent.svelte:244) and the
      // case-panel sub above is what opens it.
      //
      // Each selector list therefore reads "the real target, then the
      // region that is reachable whether or not the panel opened". That
      // degradation is deliberate and follows the voicemails sub: an
      // ordered selector list is how this taxonomy expresses a target
      // that may not have mounted. Circling the case header is honest
      // when the panel is shut; showing nothing is not.
      {
        slug: "portal-tier",
        topic: "ticket-portal-tier",
        headingKey: "demo_narrative_topic_portal_tier_heading",
        bodyKey: "demo_narrative_topic_portal_tier_body",
        highlight: { selectors: [".tier-name", ".case-header"] },
      },
      {
        slug: "secure-link",
        topic: "ticket-secure-link",
        headingKey: "demo_narrative_topic_secure_link_heading",
        bodyKey: "demo_narrative_topic_secure_link_body",
        // .tier-actions holds the tier controls (PortalTierSection.svelte);
        // .intro-text is SecureLinkSheet's own body once it opens.
        highlight: {
          selectors: [".intro-text", ".tier-actions", ".case-header"],
        },
      },
      {
        slug: "share-link",
        topic: "ticket-share-link",
        headingKey: "demo_narrative_topic_share_link_heading",
        bodyKey: "demo_narrative_topic_share_link_body",
        // ShareLinkSheet lives in TicketDetailOverlays, opened from the
        // panel's actions rather than from the thread.
        highlight: { selectors: [".share-sheet-body", ".case-header"] },
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
      // These two need no fallback: both render inline in the thread
      // (TicketDetail.svelte:1313 and :1319) and carry their own
      // testids, so the conversation sub above has already put them on
      // screen.
      {
        slug: "share-status",
        topic: "ticket-share-status",
        headingKey: "demo_narrative_topic_share_status_heading",
        bodyKey: "demo_narrative_topic_share_status_body",
        highlight: { selectors: ['[data-testid="share-status-line"]'] },
      },
      {
        slug: "correction-status",
        topic: "ticket-correction-status",
        headingKey: "demo_narrative_topic_correction_status_heading",
        bodyKey: "demo_narrative_topic_correction_status_body",
        highlight: { selectors: ['[data-testid="correction-status-line"]'] },
      },
      {
        slug: "email-thread",
        topic: "ticket-email-thread",
        headingKey: "demo_narrative_topic_email_thread_heading",
        bodyKey: "demo_narrative_topic_email_thread_body",
        // The seeded inbound email sits mid-thread (before the final
        // client SMS, so the composer's email-expected banner stays
        // off by default); the subject row and chip carry testids.
        highlight: {
          selectors: [
            '[data-testid="email-inbound-subject"]',
            '[data-testid="email-channel-chip"]',
          ],
        },
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
        slug: "outbound-edit",
        topic: "ticket-outbound-edit",
        headingKey: "demo_narrative_topic_outbound_edit_heading",
        bodyKey: "demo_narrative_topic_outbound_edit_body",
        // OutboundMessageEditSheet mounts in TicketDetailOrchestrator and
        // opens from a sent message's own actions, so the message bubble
        // is the region that is on screen either way.
        highlight: { selectors: [".char-counter", ".msg-body"] },
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
    group: "org",
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
    group: "org",
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
    group: "org",
    subs: [
      {
        slug: "hub-people",
        topic: null,
        headingKey: "demo_narrative_admin_hub_people_heading",
        bodyKey: "demo_narrative_admin_hub_people_body",
        highlight: { section: "people" },
      },
      {
        slug: "hub-comms",
        topic: null,
        headingKey: "demo_narrative_admin_hub_comms_heading",
        bodyKey: "demo_narrative_admin_hub_comms_body",
        highlight: { section: "communications" },
      },
      {
        slug: "hub-org",
        topic: null,
        headingKey: "demo_narrative_admin_hub_org_heading",
        bodyKey: "demo_narrative_admin_hub_org_body",
        highlight: { section: "organization" },
      },
      {
        slug: "hub-analytics",
        topic: null,
        headingKey: "demo_narrative_admin_hub_analytics_heading",
        bodyKey: "demo_narrative_admin_hub_analytics_body",
        highlight: { section: "analytics" },
      },
    ],
  },
  {
    id: "admin-people",
    titleKey: "demo_section_admin_people_title",
    descKey: "demo_section_admin_people_desc",
    routes: SECTION_ROUTES["admin-people"],
    group: "org",
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
      {
        slug: "role-permissions",
        topic: "admin-role-permissions",
        headingKey: "demo_narrative_admin_role_permissions_heading",
        bodyKey: "demo_narrative_admin_role_permissions_body",
        // The permission matrix is the roles tabpanel on the people page
        // (admin/people/+page.svelte:837), a different surface from the
        // manager page the roles sub above narrates. Same shape as the
        // client-merge sub: the tabpanel is the region, and reaching it
        // depends on the roles tab being the active one.
        highlight: { selectors: ["#panel-roles", ".matrix"] },
      },
    ],
  },
  {
    id: "admin-comms",
    titleKey: "demo_section_admin_comms_title",
    descKey: "demo_section_admin_comms_desc",
    routes: SECTION_ROUTES["admin-comms"],
    group: "org",
    // Scroll-nav page (CollapsibleSectionPage). Section ids come from
    // admin/communications/+page.svelte; two subs share the telephony
    // section and sms-templates maps to "templates". channel-policy
    // leads because it is the page's first section.
    subs: [
      {
        slug: "channel-policy",
        topic: "admin-channel-policy",
        headingKey: "demo_narrative_admin_channel_policy_heading",
        bodyKey: "demo_narrative_admin_channel_policy_body",
        highlight: { section: "channel-policy" },
      },
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
    group: "org",
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
      {
        slug: "intake-forms",
        topic: "admin-intake-forms",
        headingKey: "demo_narrative_admin_intake_forms_heading",
        bodyKey: "demo_narrative_admin_intake_forms_body",
        // One more section on the same scroll-nav page
        // (admin/organization/+page.svelte:73). It is the list the two
        // form sections below open their detail from.
        highlight: { section: "intake-forms" },
      },
    ],
  },
  {
    id: "admin-forms",
    titleKey: "demo_section_admin_forms_title",
    descKey: "demo_section_admin_forms_desc",
    routes: SECTION_ROUTES["admin-forms"],
    group: "org",
    // The editor has no root element of its own: it renders two snippets
    // that SplitView wraps at desktop width and that stack bare at phone
    // width (IntakeFormEditor.svelte:1718-1734). So both subs point at
    // markup inside the snippets, which exists at either width.
    subs: [
      {
        slug: "builder",
        topic: "admin-form-builder",
        headingKey: "demo_narrative_admin_form_builder_heading",
        bodyKey: "demo_narrative_admin_form_builder_body",
        // Per-field row controls (IntakeFormEditor.svelte:1415).
        highlight: { selectors: [".field-actions", ".default-hint"] },
      },
      {
        slug: "field-config",
        topic: "admin-field-config",
        headingKey: "demo_narrative_admin_field_config_heading",
        bodyKey: "demo_narrative_admin_field_config_body",
        highlight: { selectors: [".sheet-content", ".field-actions"] },
      },
      {
        slug: "locales",
        topic: "admin-form-locales",
        headingKey: "demo_narrative_admin_form_locales_heading",
        bodyKey: "demo_narrative_admin_form_locales_body",
        highlight: { selectors: [".locale-badge", ".locale-hint"] },
      },
      {
        slug: "preview",
        topic: "admin-form-preview",
        headingKey: "demo_narrative_admin_form_preview_heading",
        bodyKey: "demo_narrative_admin_form_preview_body",
        highlight: {
          selectors: [
            '[data-testid="preview-state-switcher"]',
            '[data-testid="preview-empty-state"]',
          ],
        },
      },
      {
        slug: "form-settings",
        topic: "admin-form-settings",
        headingKey: "demo_narrative_admin_form_settings_heading",
        bodyKey: "demo_narrative_admin_form_settings_body",
        highlight: { selectors: [".default-hint", ".copy-btn"] },
      },
    ],
  },
  {
    id: "admin-responses",
    titleKey: "demo_section_admin_responses_title",
    descKey: "demo_section_admin_responses_desc",
    routes: SECTION_ROUTES["admin-responses"],
    group: "org",
    subs: [
      {
        slug: "responses",
        topic: "admin-form-responses",
        headingKey: "demo_narrative_admin_form_responses_heading",
        bodyKey: "demo_narrative_admin_form_responses_body",
        // Viewer root (IntakeResponsesViewer.svelte:426).
        highlight: { selectors: [".irv-root"] },
      },
      {
        slug: "key-not-held",
        topic: "admin-response-key-not-held",
        headingKey: "demo_narrative_admin_response_key_not_held_heading",
        bodyKey: "demo_narrative_admin_response_key_not_held_body",
        // .irv-state-row is shared by the key-not-held and the decrypt-
        // failed branches (IntakeResponsesViewer.svelte:481 and :493).
        // The seed deliberately produces one key-not-held row and no
        // failed ones, so the first match is the intended example; a
        // failed row appearing here would mean the seed broke, which is
        // worth seeing rather than hiding behind a narrower selector.
        highlight: { selectors: [".irv-state-row", ".irv-card"] },
      },
      {
        slug: "export",
        topic: "admin-response-export",
        headingKey: "demo_narrative_admin_response_export_heading",
        bodyKey: "demo_narrative_admin_response_export_body",
        highlight: {
          selectors: ['[data-testid="export-csv-btn"]', ".irv-root"],
        },
      },
    ],
  },
  {
    id: "admin-logs",
    titleKey: "demo_section_admin_logs_title",
    descKey: "demo_section_admin_logs_desc",
    routes: SECTION_ROUTES["admin-logs"],
    group: "org",
    // Two tabpanels behind a segmented control (admin/logs/+page.svelte).
    // The tab is carried in the URL, so each sub navigates rather than
    // taps: see the admin-logs case in resolvePhoneCommand.
    subs: [
      {
        slug: "calls",
        topic: "admin-call-log",
        headingKey: "demo_narrative_admin_call_log_heading",
        bodyKey: "demo_narrative_admin_call_log_body",
        highlight: { selectors: ["#panel-calls"] },
      },
      {
        slug: "audit",
        topic: "admin-audit-log",
        headingKey: "demo_narrative_admin_audit_log_heading",
        bodyKey: "demo_narrative_admin_audit_log_body",
        highlight: { selectors: ["#panel-audit"] },
      },
    ],
  },
  {
    id: "schedule",
    titleKey: "demo_section_schedule_title",
    descKey: "demo_section_schedule_desc",
    routes: SECTION_ROUTES.schedule,
    group: "org",
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
    group: "org",
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
      {
        slug: "notifications",
        topic: "settings-notifications",
        headingKey: "demo_narrative_settings_notifications_heading",
        bodyKey: "demo_narrative_settings_notifications_body",
        // NotificationPreferencesSection renders inline on the settings
        // page (more/settings/+page.svelte:234), so its matrix is on
        // screen without opening anything.
        highlight: { selectors: [".matrix"] },
      },
      {
        slug: "consultant-phone",
        topic: "settings-consultant-phone",
        headingKey: "demo_narrative_settings_consultant_phone_heading",
        bodyKey: "demo_narrative_settings_consultant_phone_body",
        // ConsultantPhoneSheet is a sheet opened from a settings row, so
        // its own body only exists once opened. The settings list is the
        // region that is always there.
        highlight: { selectors: [".sheet-content", ".settings-page"] },
      },
    ],
  },
  // ---------------------------------------------------------------------
  // Client group
  // ---------------------------------------------------------------------
  {
    id: "client-intake",
    titleKey: "demo_section_client_intake_title",
    descKey: "demo_section_client_intake_desc",
    routes: SECTION_ROUTES["client-intake"],
    group: "client",
    subs: [
      {
        slug: "form",
        topic: "client-intake-form",
        headingKey: "demo_narrative_client_intake_form_heading",
        bodyKey: "demo_narrative_client_intake_form_body",
        // The intro paragraph, or the org's own rich description when
        // one is set (IntakeFormBody.svelte:1315-1322).
        highlight: { selectors: [".intake-intro"] },
      },
      {
        slug: "how-protected",
        topic: "client-intake-protection",
        headingKey: "demo_narrative_client_intake_protection_heading",
        bodyKey: "demo_narrative_client_intake_protection_body",
        // HowProtected renders a <details> disclosure (HowProtected.svelte:19).
        highlight: { selectors: [".how-protected"] },
      },
      {
        slug: "contact-method",
        topic: "client-intake-contact",
        headingKey: "demo_narrative_client_intake_contact_heading",
        bodyKey: "demo_narrative_client_intake_contact_body",
        highlight: { selectors: ['[role="radiogroup"]'] },
      },
      {
        slug: "fields",
        topic: "client-intake-fields",
        headingKey: "demo_narrative_client_intake_fields_heading",
        bodyKey: "demo_narrative_client_intake_fields_body",
        // This sub is where the seeded custom form is narrated, so it
        // carries the by-slug route rather than the default one.
        routes: SUB_ROUTES["client-intake/fields"],
        // The contact-method radiogroup is the built-in form's own
        // grouping (IntakeFormBody.svelte:1404-1410); a custom form's
        // fields render as IntakeFieldRenderer blocks above it.
        highlight: { selectors: ['[role="radiogroup"]', ".intake-intro"] },
      },
      {
        slug: "submit",
        topic: "client-intake-submit",
        headingKey: "demo_narrative_client_intake_submit_heading",
        bodyKey: "demo_narrative_client_intake_submit_body",
        // Multi-page forms show a next button instead of submit until
        // the last page (IntakeFormBody.svelte:1688, :1704).
        highlight: {
          selectors: [
            '[data-testid="intake-submit"]',
            '[data-testid="intake-page-next"]',
          ],
        },
      },
      {
        slug: "closed-form",
        topic: null,
        headingKey: "demo_narrative_client_intake_closed_heading",
        bodyKey: "demo_narrative_client_intake_closed_body",
        highlight: { selectors: [".intake-not-available"] },
      },
    ],
  },
  {
    id: "client-privacy",
    titleKey: "demo_section_client_privacy_title",
    descKey: "demo_section_client_privacy_desc",
    routes: SECTION_ROUTES["client-privacy"],
    group: "client",
    subs: [
      {
        slug: "notice",
        topic: "client-privacy-notice",
        headingKey: "demo_narrative_client_privacy_notice_heading",
        bodyKey: "demo_narrative_client_privacy_notice_body",
        // intake/privacy/+page.svelte:45.
        highlight: { selectors: [".retention-disclosure"] },
      },
    ],
  },
  {
    id: "client-portal",
    titleKey: "demo_section_client_portal_title",
    descKey: "demo_section_client_portal_desc",
    routes: SECTION_ROUTES["client-portal"],
    group: "client",
    subs: [
      {
        slug: "thread",
        topic: "client-portal-thread",
        headingKey: "demo_narrative_client_portal_thread_heading",
        bodyKey: "demo_narrative_client_portal_thread_body",
        highlight: { selectors: ['[data-testid="portal-thread"]'] },
      },
      {
        slug: "passphrase",
        topic: "client-portal-passphrase",
        headingKey: "demo_narrative_client_portal_passphrase_heading",
        bodyKey: "demo_narrative_client_portal_passphrase_body",
        highlight: {
          selectors: ['[data-testid="passphrase-input"]', ".gate-hint"],
        },
      },
      {
        slug: "composer",
        topic: "client-portal-composer",
        headingKey: "demo_narrative_client_portal_composer_heading",
        bodyKey: "demo_narrative_client_portal_composer_body",
        highlight: { selectors: ['[data-testid="portal-composer"]'] },
      },
      {
        slug: "quick-exit",
        topic: "client-quick-exit",
        headingKey: "demo_narrative_client_quick_exit_heading",
        bodyKey: "demo_narrative_client_quick_exit_body",
        // QuickExit mounts on every state of this page and the account
        // page (portal/[channelId]/+page.svelte:353). The control is
        // real and stays mounted; phone-main.ts intercepts its trigger
        // so narrating it cannot navigate the iframe off-site.
        highlight: { selectors: ['[data-testid="quick-exit"]'] },
      },
      {
        slug: "account-upgrade",
        topic: "client-portal-upgrade",
        headingKey: "demo_narrative_client_portal_upgrade_heading",
        bodyKey: "demo_narrative_client_portal_upgrade_body",
        highlight: {
          selectors: [
            '[data-testid="upgrade-body"]',
            '[data-testid="portal-thread"]',
          ],
        },
      },
    ],
  },
  {
    id: "client-account",
    titleKey: "demo_section_client_account_title",
    descKey: "demo_section_client_account_desc",
    routes: SECTION_ROUTES["client-account"],
    group: "client",
    subs: [
      {
        slug: "sign-in",
        topic: "client-account-sign-in",
        headingKey: "demo_narrative_client_account_sign_in_heading",
        bodyKey: "demo_narrative_client_account_sign_in_body",
        // AccountLoginForm renders when there is no session, which is
        // where the story arrives (account/+page.svelte:484).
        highlight: {
          selectors: ['[data-testid="account-username"]', ".login-list"],
        },
      },
      {
        slug: "thread",
        topic: "client-account-thread",
        headingKey: "demo_narrative_client_account_thread_heading",
        bodyKey: "demo_narrative_client_account_thread_body",
        // Same PortalThread component as the secure-link tier, reached
        // through a durable account instead of a URL fragment.
        highlight: { selectors: ['[data-testid="portal-thread"]'] },
      },
      {
        slug: "change-password",
        topic: "client-account-change-password",
        headingKey: "demo_narrative_client_account_password_heading",
        bodyKey: "demo_narrative_client_account_password_body",
        highlight: {
          selectors: ['[data-testid="account-settings"]', ".settings-section"],
        },
      },
      {
        slug: "settings",
        topic: "client-account-settings",
        headingKey: "demo_narrative_client_account_settings_heading",
        bodyKey: "demo_narrative_client_account_settings_body",
        highlight: {
          selectors: ['[data-testid="account-settings"]', ".settings-section"],
        },
      },
      {
        slug: "sign-out",
        topic: "client-account-sign-out",
        headingKey: "demo_narrative_client_account_sign_out_heading",
        bodyKey: "demo_narrative_client_account_sign_out_body",
        highlight: {
          selectors: [".settings-section", '[data-testid="account-settings"]'],
        },
      },
    ],
  },
  {
    id: "client-share",
    titleKey: "demo_section_client_share_title",
    descKey: "demo_section_client_share_desc",
    routes: SECTION_ROUTES["client-share"],
    group: "client",
    subs: [
      {
        slug: "view",
        topic: "client-share-view",
        headingKey: "demo_narrative_client_share_view_heading",
        bodyKey: "demo_narrative_client_share_view_body",
        // share/[id]/+page.svelte:97. The terminal states (opened,
        // expired, not found) replace this block entirely, so the
        // heading stands in when the seeded link has been consumed.
        highlight: { selectors: [".share-content-block", ".share-heading"] },
      },
      {
        slug: "one-time",
        topic: "client-share-one-time",
        headingKey: "demo_narrative_client_share_one_time_heading",
        bodyKey: "demo_narrative_client_share_one_time_body",
        highlight: {
          selectors: [".share-one-time-notice", ".link-error-body"],
        },
      },
      {
        slug: "exposure-hint",
        topic: null,
        headingKey: "demo_narrative_client_share_exposure_heading",
        bodyKey: "demo_narrative_client_share_exposure_body",
        highlight: {
          selectors: ['[data-testid="portal-hint-ok"]', ".share-content-block"],
        },
      },
    ],
  },
  // ---------------------------------------------------------------------
  // Deep-dive reference articles
  //
  // Linked from entry-page prose via [text](#deep-dive/<slug>). No
  // product route; the phone stays on its current screen while the
  // handbook presents the article. Group "org" because the deep dives
  // explain the system itself, not the client portal.
  // ---------------------------------------------------------------------
  {
    id: "deep-dive",
    titleKey: "demo_section_deepdive_title",
    descKey: "demo_section_deepdive_desc",
    routes: [],
    group: "org",
    subs: [
      {
        slug: "what-is-care-y",
        topic: null,
        headingKey: "demo_narrative_deepdive_what_is_care_y_heading",
        bodyKey: "demo_narrative_deepdive_what_is_care_y_body",
      },
      {
        slug: "how-encryption-works",
        topic: null,
        headingKey: "demo_narrative_deepdive_how_encryption_works_heading",
        bodyKey: "demo_narrative_deepdive_how_encryption_works_body",
      },
      {
        slug: "how-keys-are-derived",
        topic: null,
        headingKey: "demo_narrative_deepdive_how_keys_are_derived_heading",
        bodyKey: "demo_narrative_deepdive_how_keys_are_derived_body",
      },
      {
        slug: "the-trust-boundary",
        topic: null,
        headingKey: "demo_narrative_deepdive_trust_boundary_heading",
        bodyKey: "demo_narrative_deepdive_trust_boundary_body",
      },
      {
        slug: "the-telephony-relay",
        topic: null,
        headingKey: "demo_narrative_deepdive_telephony_relay_heading",
        bodyKey: "demo_narrative_deepdive_telephony_relay_body",
      },
      {
        slug: "the-permission-system",
        topic: null,
        headingKey: "demo_narrative_deepdive_permission_system_heading",
        bodyKey: "demo_narrative_deepdive_permission_system_body",
      },
      {
        slug: "portal-channel-lifecycle",
        topic: null,
        headingKey: "demo_narrative_deepdive_portal_channel_lifecycle_heading",
        bodyKey: "demo_narrative_deepdive_portal_channel_lifecycle_body",
      },
      {
        slug: "data-retention",
        topic: null,
        headingKey: "demo_narrative_deepdive_data_retention_heading",
        bodyKey: "demo_narrative_deepdive_data_retention_body",
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
 * Detail values the client and form sections need, which the two
 * positional ids above have no room for.
 *
 * Grouped rather than appended as four more parameters because
 * resolvePhoneCommand has thirty-odd call sites and all but a handful
 * care about none of these. Every field defaults to the sentinel, so an
 * existing caller keeps compiling and gets the same placeholder the
 * ticket and article ids already use before the engine resolves.
 */
export interface ClientDetailIds {
  /** Seeded intake form, for both /admin/forms routes. */
  readonly intakeFormId: string;
  /** That form's public slug, for /(client)/intake/[slug]. */
  readonly intakeFormSlug: string;
  /** Public slug of the closed sibling form, for /(client)/intake/[slug]. */
  readonly closedFormSlug: string;
  /** Whole path prefix for /(client)/portal/[channelId]. */
  readonly portalChannelPath: string;
  /** Whole path prefix for /(client)/share/[id]. */
  readonly sharePath: string;
}

/**
 * Sentinel defaults, restated as literals for the same reason the two
 * positional ids are passed in rather than imported: this module stays
 * free of value-level imports from bridge.ts. A test asserts these
 * equal the bridge constants, so the restatement cannot drift silently.
 */
export const DEFAULT_CLIENT_DETAIL_IDS: ClientDetailIds = {
  intakeFormId: "demo-intake-form",
  intakeFormSlug: "demo-intake-form",
  closedFormSlug: "demo-closed-form",
  portalChannelPath: "portal/demo-channel",
  sharePath: "share/demo-share",
};

/**
 * Given a section and optional sub-section, compute what bridge commands
 * to send to the phone. The DEMO_DETAIL_TICKET_ID constant must be
 * passed in since this module cannot import it from bridge.ts at the
 * value level (it may not exist yet). The articleDetailId serves the
 * same role for the library section's vote sub, and clientIds does for
 * the client arc and the two intake-form routes.
 */
export function resolvePhoneCommand(
  sectionId: SectionId,
  subSlug: string | null,
  ticketDetailId: string,
  articleDetailId: string,
  clientIds: ClientDetailIds = DEFAULT_CLIENT_DETAIL_IDS,
): PhoneCommand {
  const {
    intakeFormId,
    intakeFormSlug,
    closedFormSlug,
    portalChannelPath,
    sharePath,
  } = clientIds;
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
    // The two form sections carry their id in a query string rather than
    // a path segment, because that is where both routes read it from
    // (admin/forms/+page.svelte:73, .../responses/+page.svelte:26). The
    // router splits a detail on "?" before routing, so the query rides
    // along without either page having to be reached by a real click.
    case "admin-forms":
      return {
        feature: "admin",
        detail: `forms?id=${intakeFormId}`,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "admin-responses":
      return {
        feature: "admin",
        detail: `forms/responses?id=${intakeFormId}`,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "admin-logs":
      // The tab is URL state (switchTab writes ?tab=<id> through
      // replaceState), so each sub selects its panel by navigating.
      return {
        feature: "admin",
        detail: subSlug === "audit" ? "logs?tab=audit" : "logs?tab=calls",
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
    // Every client section resolves to feature "client" with the URL
    // path as the detail, which is the shape router.featureToPathname
    // already expects. The two parameterized pages pass a sentinel path
    // that PhoneApp swaps for the seeded one, and whose URL fragment it
    // applies at the same boundary.
    case "client-intake": {
      let intakeDetail: string;
      if (subSlug === "fields") {
        intakeDetail = `intake/${intakeFormSlug}`;
      } else if (subSlug === "closed-form") {
        intakeDetail = `intake/${closedFormSlug}`;
      } else {
        intakeDetail = "intake";
      }
      return {
        feature: "client",
        detail: intakeDetail,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    }
    case "client-privacy":
      return {
        feature: "client",
        detail: "intake/privacy",
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "client-portal":
      return {
        feature: "client",
        detail: portalChannelPath,
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "client-account":
      return {
        feature: "client",
        detail: "account",
        loginTarget: null,
        openSearch: false,
        pulseTopic,
        pulseDesktopOnly,
        routeSlug: null,
        highlight,
      };
    case "client-share":
      return {
        feature: "client",
        detail: sharePath,
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
    // Deep-dive articles have no product route. The phone stays on
    // its current screen while the handbook presents the article.
    // The detail "deep-dive" is a synthetic marker that only
    // sectionMatchesPhone("deep-dive") accepts, so the convergence
    // contract holds without claiming a real phone screen.
    case "deep-dive":
      return {
        feature: "other",
        detail: "deep-dive",
        loginTarget: null,
        openSearch: false,
        pulseTopic: null,
        pulseDesktopOnly: false,
        routeSlug: null,
        highlight: null,
      };
    // Page-side excursion sections never become a location, so no
    // phone command can be asked of them; an inert command keeps the
    // switch exhaustive without giving them a screen.
    case "search-results":
    case "aggregation-view":
      return {
        feature: "other",
        detail: null,
        loginTarget: null,
        openSearch: false,
        pulseTopic: null,
        pulseDesktopOnly: false,
        routeSlug: null,
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
    // The router strips the query before storing detail, so these match
    // on the path portion alone. Without that strip the story could
    // never converge here: the command carries "forms?id=..." while the
    // phone reports whichever id it actually landed on.
    case "admin-forms":
      return feature === "admin" && detail === "forms";
    case "admin-responses":
      return feature === "admin" && detail === "forms/responses";
    case "admin-logs":
      return feature === "admin" && detail === "logs";
    case "schedule":
      return feature === "schedule";
    case "settings":
      return feature === "settings";
    // A client feature's detail IS its URL path, so each section matches
    // the path its routes cover. The two parameterized pages match on
    // their prefix because the id is seeded and unknown here.
    case "client-intake":
      return (
        feature === "client" &&
        detail?.startsWith("intake") === true &&
        detail !== "intake/privacy"
      );
    case "client-privacy":
      return feature === "client" && detail === "intake/privacy";
    case "client-portal":
      return feature === "client" && detail?.startsWith("portal/") === true;
    case "client-account":
      return feature === "client" && detail === "account";
    case "client-share":
      return feature === "client" && detail?.startsWith("share/") === true;
    case "coming-soon":
      return (
        routeId !== null &&
        sectionForRoute(routeId) === null &&
        subSlug !== null &&
        slugForRoute(routeId) === subSlug
      );
    // Deep-dive articles have no phone screen. The synthetic detail
    // "deep-dive" from resolvePhoneCommand is what the convergence
    // contract checks.
    case "deep-dive":
      return feature === "other" && detail === "deep-dive";
    // Excursion sections are never a location, so no phone state can
    // match them.
    case "search-results":
    case "aggregation-view":
      return false;
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
    // Checked before the bare "forms" so the deeper path wins; the
    // router stores these query-free.
    if (detail === "forms/responses") {
      return { sectionId: "admin-responses", subSlug: "responses" };
    }
    if (detail === "forms") {
      return { sectionId: "admin-forms", subSlug: "builder" };
    }
    if (detail === "logs") {
      return { sectionId: "admin-logs", subSlug: "calls" };
    }
    return { sectionId: "admin", subSlug: "hub" };
  }

  // Client group. Ordered longest-path-first for the same reason as the
  // admin details above: "intake/privacy" is its own section and must
  // not be swallowed by the "intake" prefix.
  if (feature === "client") {
    if (detail === "intake/privacy") {
      return { sectionId: "client-privacy", subSlug: "notice" };
    }
    if (detail?.startsWith("portal/") === true) {
      return { sectionId: "client-portal", subSlug: "thread" };
    }
    if (detail?.startsWith("share/") === true) {
      return { sectionId: "client-share", subSlug: "view" };
    }
    if (detail === "account") {
      return { sectionId: "client-account", subSlug: "sign-in" };
    }
    // Both /intake and /intake/[slug] land on the same section; the
    // by-slug form is what the fields sub narrates.
    if (detail?.startsWith("intake/") === true) {
      return { sectionId: "client-intake", subSlug: "fields" };
    }
    return { sectionId: "client-intake", subSlug: "form" };
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

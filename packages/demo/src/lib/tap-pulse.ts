/**
 * F6 tap pulse: ShowTime-style translucent circular touch marker.
 *
 * pulse(topic) finds the element owning that topic by reverse label
 * matching and renders a semi-transparent circle at its center that
 * fades out like a finger tap. If the topic's element lives on another
 * route, navigates first, waits for it to appear, then pulses.
 *
 * Under prefers-reduced-motion, renders a static marker that appears
 * and disappears without animation.
 */

import * as m from "$lib/paraglide/messages.js";
import { locales } from "$lib/paraglide/runtime.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import type { DemoTopic, DemoFeature } from "./bridge.js";
import { DEMO_DETAIL_TICKET_ID, DEMO_DETAIL_ARTICLE_ID } from "./bridge.js";
import {
  pollUntil,
  POLL_TIMEOUT_STANDARD_MS,
  POLL_TIMEOUT_LONG_MS,
} from "./poll.js";

// -----------------------------------------------------------------------
// Topic to feature mapping
// -----------------------------------------------------------------------

const LOGIN_TOPICS: ReadonlySet<DemoTopic> = new Set([
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
]);

const LIST_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "sort",
  "filters",
  "saved-filters",
  "view-modes",
  "select-mode",
  "page-search",
  "list-stats",
  "quick-actions",
  "unread-badges",
  "decryption",
  "new-ticket",
  "split-view",
]);

const DETAIL_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "case-header",
  "conversation",
  "thread-filters",
  "compose-actions",
  "reply",
  "notes",
  "case-fold",
  "timeline",
  "deep-search",
  "thread-anatomy",
  "case-panel",
  "message-select",
  "message-actions",
  "close-reopen",
  "exposure-hints",
]);

const DASHBOARD_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "dashboard-shift",
  "dashboard-queues",
  "dashboard-activity",
  "dashboard-kb",
  "dashboard-view-switcher",
  "dashboard-getting-started",
  "dashboard-needs-attention",
  "dashboard-my-tickets",
  "dashboard-unassigned",
  "dashboard-on-hold",
  "dashboard-create",
]);

const SETTINGS_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "settings-profile",
  "settings-password",
  "settings-2fa",
  "settings-appearance",
  "settings-security",
]);

/** Resolve the feature + detail a topic's element lives on. */
export function topicFeatureTarget(topic: DemoTopic): {
  feature: DemoFeature;
  detail: string | null;
} {
  if (LOGIN_TOPICS.has(topic)) {
    return { feature: "login", detail: null };
  }
  if (LIST_TOPICS.has(topic)) {
    return { feature: "tickets", detail: null };
  }
  if (DETAIL_TOPICS.has(topic)) {
    return { feature: "tickets", detail: DEMO_DETAIL_TICKET_ID };
  }
  if (DASHBOARD_TOPICS.has(topic)) {
    return { feature: "home", detail: null };
  }
  if (topic === "library-vote") {
    return { feature: "library", detail: DEMO_DETAIL_ARTICLE_ID };
  }
  if (topic === "library-search") {
    return { feature: "library", detail: null };
  }
  if (topic === "library-tools") {
    return { feature: "library", detail: null };
  }
  if (topic === "library-categories") {
    return { feature: "library", detail: null };
  }
  if (topic === "library-editor") {
    return { feature: "library", detail: "new" };
  }
  if (
    topic === "admin-roster-edit" ||
    topic === "admin-roster-tools" ||
    topic === "admin-queues" ||
    topic === "admin-clients" ||
    topic === "admin-client-merge"
  ) {
    return { feature: "admin", detail: "people" };
  }
  if (topic === "admin-roles") {
    return { feature: "admin", detail: "manager" };
  }
  if (
    topic === "admin-greetings" ||
    topic === "admin-quarantine" ||
    topic === "admin-phone-lines" ||
    topic === "admin-telephony-provider" ||
    topic === "admin-sms-templates" ||
    topic === "admin-blocklist"
  ) {
    return { feature: "admin", detail: "communications" };
  }
  if (
    topic === "admin-general" ||
    topic === "admin-branding" ||
    topic === "admin-terminology" ||
    topic === "admin-note-types" ||
    topic === "admin-keys" ||
    topic === "admin-retention"
  ) {
    return { feature: "admin", detail: "organization" };
  }
  if (SETTINGS_TOPICS.has(topic)) {
    return { feature: "settings", detail: null };
  }
  return { feature: "tickets", detail: null };
}

// -----------------------------------------------------------------------
// Candidate string builder (mirrors classifier's message sets)
// -----------------------------------------------------------------------

// Memoization cache: keyed by `topic + "\0" + localeKey` so a locale
// switch invalidates cached candidates without manual clearing.
const candidateCache = new Map<string, Set<string>>();

function candidateCacheKey(topic: DemoTopic): string {
  return `${topic}\0${locales.join(",")}`;
}

/** Build all possible label strings for a topic across all locales. */
export function buildTopicCandidates(topic: DemoTopic): Set<string> {
  const key = candidateCacheKey(topic);
  const cached = candidateCache.get(key);
  if (cached !== undefined) return cached;

  const candidates = new Set<string>();
  for (const locale of locales) {
    const opts = { locale };
    const terms = withTerms();

    switch (topic) {
      case "credentials":
        candidates.add(m.auth_sign_in({}, opts));
        candidates.add(m.auth_username({}, opts));
        candidates.add(m.auth_password({}, opts));
        break;
      case "twofa":
        candidates.add(m.twofa_totp_label({}, opts));
        candidates.add(m.twofa_passkey_use({}, opts));
        candidates.add(m.twofa_email_label({}, opts));
        candidates.add(m.twofa_sms_label({}, opts));
        candidates.add(m.twofa_push_label({}, opts));
        candidates.add(m.twofa_backup_codes_enter({}, opts));
        candidates.add(m.twofa_verify_submit({}, opts));
        break;
      case "twofa-totp":
        candidates.add(m.twofa_totp_label({}, opts));
        // Settled TOTP screen (TwoFactorChallenge.svelte:491-512):
        // code input placeholder and verify button
        candidates.add(m.twofa_totp_code_placeholder({}, opts));
        candidates.add(m.twofa_verify_submit({}, opts));
        break;
      case "twofa-passkey":
        candidates.add(m.twofa_passkey_use({}, opts));
        break;
      case "twofa-email":
        candidates.add(m.twofa_email_label({}, opts));
        candidates.add(m.twofa_email_send_code({}, opts));
        // Post-auto-send state (TwoFactorChallenge.svelte:556-588):
        // code input placeholder and verify button
        candidates.add(m.twofa_totp_code_placeholder({}, opts));
        candidates.add(m.twofa_verify_submit({}, opts));
        break;
      case "twofa-sms":
        candidates.add(m.twofa_sms_label({}, opts));
        candidates.add(m.twofa_sms_send_code({}, opts));
        // Post-auto-send state (TwoFactorChallenge.svelte:609-643):
        // code input placeholder and verify button
        candidates.add(m.twofa_totp_code_placeholder({}, opts));
        candidates.add(m.twofa_verify_submit({}, opts));
        break;
      case "twofa-push":
        candidates.add(m.twofa_push_label({}, opts));
        candidates.add(m.twofa_push_send({}, opts));
        // Push waiting state (TwoFactorChallenge.svelte:648-652)
        candidates.add(m.twofa_push_waiting({}, opts));
        break;
      case "twofa-backup":
        candidates.add(m.twofa_backup_codes_enter({}, opts));
        // Backup code entry screen (TwoFactorChallenge.svelte:682-701):
        // backup code input placeholder and verify button
        candidates.add(m.twofa_backup_codes_placeholder({}, opts));
        candidates.add(m.twofa_verify_submit({}, opts));
        break;
      case "key-derivation":
        candidates.add(m.auth_phase_argon2id({}, opts));
        candidates.add(m.auth_phase_oprf({}, opts));
        candidates.add(m.auth_phase_derive({}, opts));
        candidates.add(m.auth_phase_auth({}, opts));
        candidates.add(m.auth_phase_done({}, opts));
        break;
      case "language":
        candidates.add(m.language_picker_label({}, opts));
        break;
      case "sort":
        candidates.add(m.tickets_sort({}, opts));
        // Composed labels the SubNavbarFilterLayout builds for the
        // sort button's aria-label (label + direction):
        candidates.add(
          m.sort_button_label(
            {
              label: m.tickets_sort({}, opts),
              direction: m.table_sort_ascending({}, opts),
            },
            opts,
          ),
        );
        candidates.add(
          m.sort_button_label(
            {
              label: m.tickets_sort({}, opts),
              direction: m.table_sort_descending({}, opts),
            },
            opts,
          ),
        );
        break;
      case "filters":
        candidates.add(m.tickets_filter(terms, opts));
        candidates.add(m.tickets_filter_status({}, opts));
        candidates.add(m.tickets_filter_queue(terms, opts));
        candidates.add(m.tickets_filter_priority({}, opts));
        candidates.add(m.tickets_filter_assignee({}, opts));
        candidates.add(m.tickets_filter_date_range({}, opts));
        break;
      case "saved-filters":
        candidates.add(m.tickets_create_shortcut({}, opts));
        candidates.add(m.saved_filter_apply({}, opts));
        candidates.add(m.saved_filter_modal_title({}, opts));
        break;
      case "quick-actions":
        candidates.add(m.tickets_action_reply({}, opts));
        candidates.add(m.tickets_action_call({}, opts));
        candidates.add(m.tickets_action_assign({}, opts));
        candidates.add(m.tickets_action_hold({}, opts));
        break;
      case "unread-badges":
        candidates.add(m.tickets_sort_new_replies_first({}, opts));
        break;
      case "decryption":
        // No label candidates; PhoneApp handles this as a first-class
        // special case (replay descramble, poll for busy placeholder)
        break;
      case "split-view":
        candidates.add(m.split_view_resize_label({}, opts));
        break;
      case "list-stats":
        candidates.add(m.tickets_status_new({}, opts));
        candidates.add(m.tickets_status_active({}, opts));
        candidates.add(m.tickets_status_on_hold({}, opts));
        break;
      case "page-search":
        candidates.add(m.search_inline_trigger({}, opts));
        break;
      case "view-modes":
        candidates.add(m.view_switcher_label({}, opts));
        candidates.add(m.view_switcher_table({}, opts));
        candidates.add(m.view_switcher_rows({}, opts));
        candidates.add(m.view_switcher_cards({}, opts));
        candidates.add(m.view_switcher_grid({}, opts));
        candidates.add(m.view_switcher_kanban({}, opts));
        break;
      case "select-mode":
        candidates.add(m.tickets_select_mode({}, opts));
        break;
      case "message-select":
        candidates.add(m.ticket_select_mode({}, opts));
        break;
      case "new-ticket":
        candidates.add(m.nav_new_ticket(terms, opts));
        break;
      case "thread-filters":
        candidates.add(m.tickets_filter(terms, opts));
        candidates.add(m.ticket_filter_type({}, opts));
        candidates.add(m.ticket_filter_author({}, opts));
        candidates.add(m.ticket_filter_date({}, opts));
        break;
      case "compose-actions":
        candidates.add(m.ticket_compose_actions({}, opts));
        break;
      case "reply":
        // The compose-actions button is the entry point for the reply
        // choreography in PhoneApp (stage 1 clicks it to open the
        // popover, stage 2 selects Reply). Also include the send
        // labels for classification of visitor taps.
        candidates.add(m.ticket_compose_actions({}, opts));
        candidates.add(m.ticket_send({}, opts));
        candidates.add(m.ticket_sms_send({}, opts));
        break;
      case "notes":
        candidates.add(m.ticket_add_internal_note({}, opts));
        candidates.add(m.ticket_edit_note({}, opts));
        candidates.add(m.ticket_save_note({}, opts));
        break;
      case "case-fold":
        candidates.add(m.ticket_case_details(terms, opts));
        candidates.add(m.ticket_fold_case_details(terms, opts));
        break;
      case "timeline":
        candidates.add(m.ticket_action_timeline({}, opts));
        break;
      case "case-header":
        candidates.add(m.ticket_more_actions({}, opts));
        break;
      case "conversation":
        candidates.add(m.ticket_action_messages({}, opts));
        break;
      case "thread-anatomy":
        candidates.add(m.ticket_new_messages({}, opts));
        break;
      case "case-panel":
        candidates.add(m.ticket_more_actions({}, opts));
        candidates.add(m.ticket_panel_call({}, opts));
        break;
      case "deep-search":
        candidates.add(m.search_inline_trigger({}, opts));
        candidates.add(m.search_refine_label({}, opts));
        candidates.add(m.search_conversation_nav_label({}, opts));
        candidates.add(m.search_deep_nav_trigger({}, opts));
        break;
      case "message-actions":
        candidates.add(m.ticket_context_menu_title({}, opts));
        break;
      case "close-reopen":
        candidates.add(m.ticket_action_close({}, opts));
        candidates.add(m.ticket_action_reopen({}, opts));
        candidates.add(m.ticket_more_actions({}, opts));
        break;
      case "exposure-hints":
        candidates.add(m.ticket_compose_actions({}, opts));
        candidates.add(m.ticket_sms_title(terms, opts));
        candidates.add(m.exposure_hint_dismiss({}, opts));
        break;
      case "dashboard-shift":
        candidates.add(m.dashboard_shift_heading({}, opts));
        break;
      case "dashboard-queues":
        candidates.add(m.dashboard_queues_heading(terms, opts));
        break;
      case "dashboard-activity":
        candidates.add(m.dashboard_activity_heading({}, opts));
        break;
      case "dashboard-kb":
        candidates.add(m.dashboard_kb_heading(terms, opts));
        break;
      case "dashboard-view-switcher":
        candidates.add(m.view_switcher_label({}, opts));
        candidates.add(m.view_switcher_table({}, opts));
        candidates.add(m.view_switcher_rows({}, opts));
        candidates.add(m.view_switcher_cards({}, opts));
        candidates.add(m.view_switcher_grid({}, opts));
        break;
      case "dashboard-needs-attention":
        candidates.add(m.dashboard_section_needs_attention({}, opts));
        break;
      case "dashboard-my-tickets":
        candidates.add(m.dashboard_section_my_tickets(terms, opts));
        break;
      case "dashboard-unassigned":
        candidates.add(m.dashboard_section_unassigned({}, opts));
        break;
      case "dashboard-on-hold":
        candidates.add(m.dashboard_section_on_hold({}, opts));
        break;
      case "dashboard-getting-started":
        candidates.add(m.getting_started_heading({}, opts));
        break;
      case "dashboard-create":
        candidates.add(m.nav_create_new({}, opts));
        break;
      case "library-vote":
        candidates.add(m.library_was_helpful({}, opts));
        candidates.add(m.library_vote_up({}, opts));
        candidates.add(m.library_vote_down({}, opts));
        break;
      case "library-categories":
        candidates.add(m.library_manage_categories({}, opts));
        break;
      case "library-search":
        candidates.add(m.search_inline_trigger({}, opts));
        candidates.add(m.search_deep_nav_trigger({}, opts));
        break;
      case "library-editor":
        candidates.add(m.library_new_article({}, opts));
        candidates.add(m.library_edit_article({}, opts));
        break;
      case "library-tools":
        candidates.add(m.view_switcher_label({}, opts));
        candidates.add(m.view_switcher_cards({}, opts));
        candidates.add(m.library_sort({}, opts));
        candidates.add(m.library_select_mode({}, opts));
        break;
      case "admin-roster-edit":
        candidates.add(m.admin_user_edit_actions({}, opts));
        candidates.add(m.settings_display_name({}, opts));
        candidates.add(m.settings_username({}, opts));
        break;
      case "admin-roster-tools":
        candidates.add(m.admin_users_sort({}, opts));
        // Composed labels the SubNavbarFilterLayout builds for the
        // sort button's aria-label (SubNavbarFilterLayout.svelte:71-79):
        candidates.add(
          m.sort_button_label(
            {
              label: m.admin_users_sort({}, opts),
              direction: m.table_sort_ascending({}, opts),
            },
            opts,
          ),
        );
        candidates.add(
          m.sort_button_label(
            {
              label: m.admin_users_sort({}, opts),
              direction: m.table_sort_descending({}, opts),
            },
            opts,
          ),
        );
        candidates.add(m.admin_users_filter_role({}, opts));
        candidates.add(m.admin_users_filter_status({}, opts));
        candidates.add(m.admin_users_filter_keys({}, opts));
        candidates.add(m.admin_users_filter_queue(terms, opts));
        break;
      case "admin-queues":
        candidates.add(m.admin_tab_queues(terms, opts));
        candidates.add(m.admin_queues_title(terms, opts));
        break;
      case "admin-clients":
        candidates.add(m.admin_clients_title(terms, opts));
        break;
      case "admin-client-merge":
        candidates.add(m.client_merge_sheet_title(terms, opts));
        candidates.add(m.client_merge_history_heading({}, opts));
        candidates.add(m.client_merge_undo({}, opts));
        candidates.add(m.client_merge_confirm_button(terms, opts));
        break;
      case "admin-roles":
        candidates.add(m.mgr_section_role({}, opts));
        candidates.add(m.mgr_section_ops({}, opts));
        candidates.add(m.mgr_section_queues({}, opts));
        candidates.add(m.mgr_section_protected({}, opts));
        break;
      case "admin-telephony-provider":
        candidates.add(m.admin_telephony_change_mode({}, opts));
        candidates.add(m.admin_tab_telephony({}, opts));
        break;
      case "admin-phone-lines":
        candidates.add(m.admin_tab_telephony({}, opts));
        break;
      case "admin-sms-templates":
        candidates.add(m.admin_tab_sms_templates({}, opts));
        candidates.add(m.admin_templates_add_button({}, opts));
        break;
      case "admin-blocklist":
        candidates.add(m.admin_tab_blocklist({}, opts));
        candidates.add(m.admin_blocklist_add_button({}, opts));
        break;
      case "admin-general":
        candidates.add(m.admin_tab_org_general({}, opts));
        candidates.add(m.admin_org_general_edit_button({}, opts));
        break;
      case "admin-branding":
        candidates.add(m.admin_tab_branding({}, opts));
        candidates.add(m.admin_branding_edit_button({}, opts));
        break;
      case "admin-terminology":
        candidates.add(m.admin_tab_terminology({}, opts));
        candidates.add(m.admin_terminology_edit_button({}, opts));
        break;
      case "admin-note-types":
        candidates.add(m.admin_tab_note_types({}, opts));
        candidates.add(m.admin_note_types_add({}, opts));
        break;
      case "admin-keys":
        candidates.add(m.admin_tab_keys({}, opts));
        break;
      case "admin-retention":
        candidates.add(m.admin_tab_retention({}, opts));
        candidates.add(m.admin_retention_days_label({}, opts));
        break;
      case "admin-greetings":
        candidates.add(m.admin_greetings_add_button({}, opts));
        candidates.add(m.admin_tab_greetings({}, opts));
        break;
      case "admin-quarantine":
        candidates.add(m.admin_quarantine_play({}, opts));
        candidates.add(m.admin_quarantine_route({}, opts));
        candidates.add(m.admin_quarantine_dismiss({}, opts));
        candidates.add(m.admin_tab_quarantine({}, opts));
        break;
      case "settings-profile":
        candidates.add(m.settings_display_name({}, opts));
        candidates.add(m.settings_username({}, opts));
        break;
      case "settings-password":
        candidates.add(m.settings_password({}, opts));
        break;
      case "settings-2fa":
        candidates.add(m.settings_2fa({}, opts));
        candidates.add(m.twofa_remove_confirm({}, opts));
        break;
      case "settings-appearance":
        candidates.add(m.settings_color_scheme({}, opts));
        break;
      case "settings-security":
        candidates.add(m.settings_review_briefing({}, opts));
        break;
    }
  }

  candidateCache.set(key, candidates);
  return candidates;
}

/**
 * Labels for the SMS entry inside the compose actions popover, across
 * locales. The exposure-hints second stage must search for this label
 * alone: the full exposure candidates also contain the compose actions
 * label, and the aria pass would resolve the still-visible compose
 * button before the popover item mounts, so the stage-two click would
 * toggle the popover instead of selecting the SMS entry.
 */
export function buildSmsTitleCandidates(): Set<string> {
  const candidates = new Set<string>();
  const terms = withTerms();
  for (const locale of locales) {
    candidates.add(m.ticket_sms_title(terms, { locale }));
  }
  return candidates;
}

/**
 * Labels for the "Reply to client" entry inside the compose actions
 * popover (ComposeActions.svelte:98-106), across locales. The reply
 * choreography's second stage searches for this label alone so the
 * still-visible compose button does not win the aria pass.
 */
export function buildReplyTitleCandidates(): Set<string> {
  const candidates = new Set<string>();
  const terms = withTerms();
  for (const locale of locales) {
    candidates.add(m.ticket_reply_to_client(terms, { locale }));
  }
  return candidates;
}

/**
 * Labels for the compose dismiss button (TicketCompose.svelte:176),
 * across locales. Used by the reply cleanup to collapse the compose
 * bar the demo opened.
 */
export function buildComposeDismissCandidates(): Set<string> {
  const candidates = new Set<string>();
  for (const locale of locales) {
    candidates.add(m.ticket_compose_dismiss_mode({}, { locale }));
  }
  return candidates;
}

/**
 * Labels for the close and reopen actions inside the more-actions
 * panel (TicketPanelContent.svelte:291-305), across locales. The
 * close-reopen choreography opens the panel and marks whichever of
 * the two actions the ticket's state renders.
 */
export function buildCloseReopenCandidates(): Set<string> {
  const candidates = new Set<string>();
  for (const locale of locales) {
    candidates.add(m.ticket_action_close({}, { locale }));
    candidates.add(m.ticket_action_reopen({}, { locale }));
  }
  return candidates;
}

// -----------------------------------------------------------------------
// Activation (real tap) vocabulary
// -----------------------------------------------------------------------

/**
 * Topics whose activation performs a real tap on the resolved element,
 * so the phone demonstrates the feature instead of only marking it.
 * The rest stay visual-only: login stages are driven by the advance
 * chain, reply would mutate the thread, and the language picker is a
 * native select that ignores synthetic clicks.
 */
export const TAP_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "sort",
  "filters",
  "view-modes",
  "select-mode",
  "page-search",
  "new-ticket",
  "thread-filters",
  "compose-actions",
  "notes",
  "case-fold",
  "case-panel",
  "message-select",
  "timeline",
  "conversation",
  "deep-search",
  "dashboard-queues",
  "dashboard-activity",
  "dashboard-kb",
  "dashboard-view-switcher",
  "dashboard-needs-attention",
  "dashboard-my-tickets",
  "dashboard-unassigned",
  "dashboard-on-hold",
  "dashboard-create",
  "library-search",
  "library-tools",
  "library-categories",
  "admin-roster-edit",
  "admin-roster-tools",
  "admin-queues",
  "admin-clients",
  "admin-phone-lines",
  "admin-sms-templates",
  "admin-blocklist",
  "admin-general",
  "admin-branding",
  "admin-terminology",
  "admin-note-types",
  "admin-keys",
  "admin-retention",
  "settings-profile",
  "settings-2fa",
  "settings-security",
]);

/**
 * Candidates for the tap target. Narrower than the pulse candidates:
 * those include group labels and sibling controls that classify clicks
 * but must not receive one (tapping the "Messages" tab would classify
 * as timeline yet close the timeline).
 */
export function buildActivationCandidates(topic: DemoTopic): Set<string> {
  const candidates = new Set<string>();
  for (const locale of locales) {
    const opts = { locale };
    const terms = withTerms();

    switch (topic) {
      case "sort":
        candidates.add(m.tickets_sort({}, opts));
        candidates.add(
          m.sort_button_label(
            {
              label: m.tickets_sort({}, opts),
              direction: m.table_sort_ascending({}, opts),
            },
            opts,
          ),
        );
        candidates.add(
          m.sort_button_label(
            {
              label: m.tickets_sort({}, opts),
              direction: m.table_sort_descending({}, opts),
            },
            opts,
          ),
        );
        break;
      case "filters":
        candidates.add(m.tickets_filter_status({}, opts));
        break;
      case "view-modes":
        candidates.add(m.view_switcher_cards({}, opts));
        break;
      case "select-mode":
        candidates.add(m.tickets_select_mode({}, opts));
        break;
      case "page-search":
        candidates.add(m.search_inline_trigger({}, opts));
        break;
      case "new-ticket":
        candidates.add(m.nav_new_ticket(terms, opts));
        break;
      case "thread-filters":
        candidates.add(m.ticket_filter_type({}, opts));
        break;
      case "compose-actions":
        candidates.add(m.ticket_compose_actions({}, opts));
        break;
      case "notes":
        candidates.add(m.ticket_add_internal_note({}, opts));
        break;
      case "case-fold":
        candidates.add(m.ticket_case_details(terms, opts));
        candidates.add(m.ticket_fold_case_details(terms, opts));
        break;
      case "case-panel":
        candidates.add(m.ticket_more_actions({}, opts));
        break;
      case "message-select":
        candidates.add(m.ticket_select_mode({}, opts));
        break;
      case "timeline":
        candidates.add(m.ticket_action_timeline({}, opts));
        break;
      case "conversation":
        candidates.add(m.ticket_action_messages({}, opts));
        break;
      case "deep-search":
        candidates.add(m.search_inline_trigger({}, opts));
        break;
      case "dashboard-queues":
        candidates.add(m.dashboard_queues_heading(terms, opts));
        break;
      case "dashboard-activity":
        candidates.add(m.dashboard_activity_heading({}, opts));
        break;
      case "dashboard-kb":
        candidates.add(m.dashboard_kb_heading(terms, opts));
        break;
      case "dashboard-view-switcher":
        candidates.add(m.view_switcher_cards({}, opts));
        break;
      case "dashboard-needs-attention":
        candidates.add(m.dashboard_section_needs_attention({}, opts));
        break;
      case "dashboard-my-tickets":
        candidates.add(m.dashboard_section_my_tickets(terms, opts));
        break;
      case "dashboard-unassigned":
        candidates.add(m.dashboard_section_unassigned({}, opts));
        break;
      case "dashboard-on-hold":
        candidates.add(m.dashboard_section_on_hold({}, opts));
        break;
      case "dashboard-create":
        candidates.add(m.nav_create_new({}, opts));
        break;
      case "library-search":
        candidates.add(m.search_inline_trigger({}, opts));
        break;
      case "library-tools":
        candidates.add(m.view_switcher_cards({}, opts));
        break;
      case "library-categories":
        candidates.add(m.library_manage_categories({}, opts));
        break;
      case "admin-roster-edit":
        candidates.add(m.admin_user_edit_actions({}, opts));
        break;
      case "admin-roster-tools":
        candidates.add(m.admin_users_sort({}, opts));
        // Composed labels matching the sort button's aria-label
        // (SubNavbarFilterLayout.svelte:71-79, people/+page.svelte:295):
        candidates.add(
          m.sort_button_label(
            {
              label: m.admin_users_sort({}, opts),
              direction: m.table_sort_ascending({}, opts),
            },
            opts,
          ),
        );
        candidates.add(
          m.sort_button_label(
            {
              label: m.admin_users_sort({}, opts),
              direction: m.table_sort_descending({}, opts),
            },
            opts,
          ),
        );
        break;
      case "admin-queues":
        candidates.add(m.admin_tab_queues(terms, opts));
        break;
      case "admin-clients":
        candidates.add(m.admin_clients_title(terms, opts));
        break;
      case "admin-phone-lines":
        candidates.add(m.admin_tab_telephony({}, opts));
        break;
      case "admin-sms-templates":
        candidates.add(m.admin_tab_sms_templates({}, opts));
        break;
      case "admin-blocklist":
        candidates.add(m.admin_tab_blocklist({}, opts));
        break;
      case "admin-general":
        candidates.add(m.admin_tab_org_general({}, opts));
        break;
      case "admin-branding":
        candidates.add(m.admin_tab_branding({}, opts));
        break;
      case "admin-terminology":
        candidates.add(m.admin_tab_terminology({}, opts));
        break;
      case "admin-note-types":
        candidates.add(m.admin_tab_note_types({}, opts));
        break;
      case "admin-keys":
        candidates.add(m.admin_tab_keys({}, opts));
        break;
      case "admin-retention":
        candidates.add(m.admin_tab_retention({}, opts));
        break;
      case "settings-profile":
        candidates.add(m.settings_display_name({}, opts));
        break;
      case "settings-2fa":
        candidates.add(m.settings_2fa({}, opts));
        break;
      case "settings-security":
        candidates.add(m.settings_review_briefing({}, opts));
        break;
      case "credentials":
      case "language":
      case "twofa":
      case "twofa-totp":
      case "twofa-passkey":
      case "twofa-email":
      case "twofa-sms":
      case "twofa-push":
      case "twofa-backup":
      case "key-derivation":
      case "reply":
      case "saved-filters":
      case "quick-actions":
      case "unread-badges":
      case "decryption":
      case "split-view":
      case "case-header":
      case "list-stats":
      case "thread-anatomy":
      case "close-reopen":
      case "message-actions":
      case "exposure-hints":
      case "settings-appearance":
      case "library-vote":
      case "library-editor":
      case "admin-client-merge":
      case "admin-roles":
      case "admin-telephony-provider":
      case "admin-greetings":
      case "admin-quarantine":
      case "settings-password":
      case "dashboard-shift":
      case "dashboard-getting-started":
        break;
    }
  }
  return candidates;
}

/** Resolve the element that should receive the tap: the match itself
 *  when interactive, else the nearest interactive descendant/ancestor. */
export function findClickableTarget(el: Element): HTMLElement | null {
  const interactiveSelector = 'button, [role="button"], a, .k-list-item';
  if (el instanceof HTMLElement && el.matches(interactiveSelector)) return el;
  const descendant = el.querySelector<HTMLElement>(interactiveSelector);
  if (descendant !== null) return descendant;
  return el.closest<HTMLElement>(interactiveSelector);
}

/**
 * Dismiss any open overlay (popover, sheet, action sheet) by clicking
 * its backdrop, so consecutive activations do not stack surfaces.
 * Overlays containing `except` are left open (the tap target may live
 * inside one).
 */
export function dismissOpenOverlays(except: Element | null): void {
  const backdrops = document.querySelectorAll<HTMLElement>(
    '[class*="backdrop"]',
  );
  for (const backdrop of backdrops) {
    if (!isVisible(backdrop)) continue;
    if (except !== null) {
      const overlay = except.closest(
        '[class*="popover"], [class*="sheet"], [class*="popup"], [class*="actions"]',
      );
      if (overlay !== null) continue;
    }
    backdrop.click();
  }
}

// -----------------------------------------------------------------------
// Mode toggles (persistent inline modes a pulse can switch ON)
// -----------------------------------------------------------------------

/**
 * Topics whose tap enables a persistent inline mode with no backdrop:
 * dismissOpenOverlays cannot close these, so a reader scrolling the
 * story would accumulate open toolbars (in-page search, selection
 * modes) sub after sub. The pulse that switches a mode on registers a
 * pending exit in PhoneApp, and the phone closes the mode when the
 * story leaves the sub. Only pulse-opened modes are ever closed; a
 * visitor's own toggles stand.
 */
export const MODE_TOGGLE_TOPICS: ReadonlySet<DemoTopic> = new Set([
  "select-mode",
  "message-select",
  "page-search",
  "deep-search",
]);

/** Labels of the controls that exit a selection mode, across locales. */
function selectionExitLabels(): Set<string> {
  const labels = new Set<string>();
  for (const locale of locales) {
    labels.add(m.ticket_select_cancel({}, { locale }));
    labels.add(m.admin_users_exit_multiselect({}, { locale }));
  }
  return labels;
}

/**
 * Close the mode a pulse opened for `topic`. Returns whether an exit
 * control was found and clicked; false when the visitor already
 * closed the mode (nothing to do).
 */
export function closeModeToggle(
  topic: DemoTopic,
  lastTapped: HTMLElement | null,
): boolean {
  // Both search navigators (in-page and in-thread) share the product's
  // close-button class, so the exit is structural and locale-proof.
  if (topic === "page-search" || topic === "deep-search") {
    let closed = false;
    for (const btn of document.querySelectorAll<HTMLElement>(
      ".search-close-btn",
    )) {
      if (!isVisible(btn)) continue;
      btn.click();
      closed = true;
    }
    return closed;
  }

  // Selection modes exit through their cancel control.
  const exitLabels = selectionExitLabels();
  for (const btn of document.querySelectorAll<HTMLElement>(
    'button, [role="button"]',
  )) {
    const text = (btn.getAttribute("aria-label") ?? btn.textContent).trim();
    if (text.length === 0 || !exitLabels.has(text)) continue;
    if (!isVisible(btn)) continue;
    btn.click();
    return true;
  }

  // Fallback: the mode control itself is a toggle; if it still reads
  // pressed, click it again.
  if (
    lastTapped !== null &&
    lastTapped.isConnected &&
    lastTapped.getAttribute("aria-pressed") === "true"
  ) {
    lastTapped.click();
    return true;
  }

  return false;
}

// -----------------------------------------------------------------------
// Visibility predicates
// -----------------------------------------------------------------------

/**
 * Strict visibility: requires non-inert ancestry, a nonzero rect, AND
 * viewport intersection. Closed Konsta sheets stay mounted but are
 * inert and translated off-screen, so the inert check excludes them.
 */
function isVisible(el: Element): boolean {
  if (el.closest("[inert]") !== null) return false;
  const rect = el.getBoundingClientRect();
  const view = el.ownerDocument.defaultView;
  if (view === null) return false;
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < view.innerHeight
  );
}

/**
 * Loose visibility: requires non-inert ancestry and a nonzero rect but
 * NOT viewport intersection. Elements scrolled below the fold pass,
 * while zero-width nav chips and closed sheets are still excluded.
 */
function isLooselyVisible(el: Element): boolean {
  if (el.closest("[inert]") !== null) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// -----------------------------------------------------------------------
// Element finder (reverse label matching)
// -----------------------------------------------------------------------

/** Selector matching all interactive container elements. */
const INTERACTIVE_SELECTOR =
  'button, [role="button"], a, label, li, .k-list-item';

/**
 * Core finder shared by the strict and loose variants. Matches a
 * topic's candidate strings against the DOM in pass order:
 * aria-label, whole-text interactive, leaf-text interactive,
 * placeholder. Text-first, visibility-second to avoid forced reflows
 * on non-matching elements.
 */
function findTopicElementWith(
  root: Document | Element,
  candidates: Set<string>,
  check: (el: Element) => boolean,
): Element | null {
  // First matching NAV-CHROME element, kept as a last resort. The
  // desktop shell duplicates content wording in its navigation (the
  // sidebar's items, the overview subnavbar), and the sidebar sits
  // before the page content in DOM order, so a naive first-match
  // would pin every colliding label to navigation. Content wins;
  // chrome is returned only when no content element matches.
  let chromeMatch: Element | null = null;
  const prefer = (el: Element): Element | null => {
    if (!isNavChrome(el)) return el;
    chromeMatch ??= el;
    return null;
  };

  // Pass 1: aria-label attributes
  const ariaLabeled = root.querySelectorAll("[aria-label]");
  for (const el of ariaLabeled) {
    const label = el.getAttribute("aria-label");
    if (label !== null && candidates.has(label) && check(el)) {
      const hit = prefer(el);
      if (hit !== null) return hit;
    }
  }

  // Pass 2: whole textContent of interactive elements
  const interactive = root.querySelectorAll(INTERACTIVE_SELECTOR);
  for (const el of interactive) {
    const text = el.textContent.trim().slice(0, 80);
    if (text !== "" && candidates.has(text) && check(el)) {
      const hit = prefer(el);
      if (hit !== null) return hit;
    }
  }

  // Pass 3: childless leaf descendants inside interactive containers.
  // Covers CollapsibleSection heading buttons (span.secline-eb carries
  // the exact label while the button's whole text includes a chevron
  // and count), bare childless LI group titles, and k-list-item leaf
  // fields. For each container, when the container itself is childless,
  // its own text is checked (covers bare LI group titles).
  for (const container of interactive) {
    if (container.childElementCount === 0) {
      // The container itself is childless; check its own text.
      const text = container.textContent.trim();
      if (
        text !== "" &&
        text.length <= 80 &&
        candidates.has(text) &&
        check(container)
      ) {
        const hit = prefer(container);
        if (hit !== null) return hit;
      }
    } else {
      for (const leaf of container.querySelectorAll("*")) {
        if (leaf.childElementCount > 0) continue;
        const text = leaf.textContent.trim();
        if (
          text !== "" &&
          text.length <= 80 &&
          candidates.has(text) &&
          check(container)
        ) {
          const hit = prefer(container);
          if (hit !== null) return hit;
        }
      }
    }
  }

  // Pass 4: placeholder attributes on inputs
  const inputs = root.querySelectorAll("[placeholder]");
  for (const el of inputs) {
    const placeholder = el.getAttribute("placeholder");
    if (placeholder !== null && candidates.has(placeholder) && check(el)) {
      const hit = prefer(el);
      if (hit !== null) return hit;
    }
  }

  return chromeMatch;
}

/**
 * Find the first strictly visible element matching a topic's candidate
 * strings. Strictly visible means in-viewport, non-inert, nonzero rect.
 */
export function findTopicElement(
  root: Document | Element,
  candidates: Set<string>,
): Element | null {
  return findTopicElementWith(root, candidates, isVisible);
}

/**
 * Find the first loosely visible element matching a topic's candidate
 * strings. Loosely visible means non-inert with a nonzero rect, but
 * not necessarily in the viewport. Zero-width nav chips and closed
 * sheets are still excluded.
 */
export function findTopicElementLoose(
  root: Document | Element,
  candidates: Set<string>,
): Element | null {
  return findTopicElementWith(root, candidates, isLooselyVisible);
}

/**
 * Whether the element sits in shell navigation chrome: the desktop
 * sidebar, tab bars, or any nav landmark. Used by the element finder
 * to prefer content matches over chrome duplicates. Includes content-
 * level tablists (IconTabToggle with semantics "tabs") because the
 * finder should still prefer a non-tablist match when available.
 */
export function isNavChrome(el: Element): boolean {
  return (
    el.closest('nav, [role="navigation"], [role="tablist"], .k-tabbar') !== null
  );
}

/**
 * Whether the element sits in strict shell navigation: the desktop
 * sidebar, Konsta tabbar, or a nav landmark. Unlike isNavChrome, this
 * excludes content-level tablists (IconTabToggle with semantics "tabs",
 * used by the admin people page). Tapping a content tablist switches a
 * tab within the narrated screen and IS the demonstration, so taps are
 * allowed. Used by handlePulse to decide whether to downgrade a tap.
 */
export function isStrictShellNav(el: Element): boolean {
  return el.closest('nav, [role="navigation"], .k-tabbar') !== null;
}

/**
 * Whether the element is or sits inside a CollapsibleSection toggle.
 */
export function isSectionToggle(el: Element): boolean {
  return el.closest(".section-toggle") !== null;
}

/**
 * Whether tapping the element would collapse an already-expanded
 * CollapsibleSection. Returns true only when the toggle's
 * aria-expanded is "true" (CollapsibleSection.svelte:59). When the
 * section is currently collapsed (aria-expanded="false"), tapping
 * EXPANDS it, which is the demonstration, so the tap is allowed.
 */
export function isSectionToggleCollapsing(el: Element): boolean {
  const toggle = el.closest(".section-toggle");
  if (toggle === null) return false;
  return toggle.getAttribute("aria-expanded") === "true";
}

// -----------------------------------------------------------------------
// CSS selector fallback for topics with no matchable message-key label
// -----------------------------------------------------------------------

/**
 * CSS selectors tried in order for topics whose target has no aria-label
 * or text content that matches a paraglide message key.
 */
export const TOPIC_SELECTORS: ReadonlyMap<DemoTopic, readonly string[]> =
  new Map([
    // SwipeableCard: data-testid="ticket-card" (SwipeableCard.svelte line 339)
    ["quick-actions", ['[data-testid="ticket-card"]']],
    // NewPill badge .new-pill (NewPill.svelte line 24), then the count badge
    ["unread-badges", [".new-pill", '[data-testid="count-new-replies"]']],
    // Stats row count badge, then the stats row container
    // (tickets/+page.svelte lines 1278-1311, data-testid="count-new-replies")
    ["list-stats", ['[data-testid="count-new-replies"]', ".stats-counts"]],
    // CaseHeader root .case-header (CaseHeader.svelte line 166)
    ["case-header", [".case-header"]],
    // Date separator line in the thread (TicketDetail.svelte line 1253)
    ["thread-anatomy", [".date-separator", ".unread-divider"]],
    // GettingStartedCard collapse toggle (CollapsibleSection.svelte line 55)
    ["dashboard-getting-started", [".collapsible-section .section-toggle"]],
  ]);

/**
 * Find the first visible element matching one of the topic's CSS
 * selectors. Uses strict-then-loose two-tier search: a strict (in-
 * viewport) hit is preferred, but a loosely visible element is returned
 * when nothing is in the viewport.
 */
export function findTopicElementBySelector(
  root: Document | Element,
  topic: DemoTopic,
): { el: Element; loose: boolean } | null {
  const selectors = TOPIC_SELECTORS.get(topic);
  if (selectors === undefined) return null;

  // Strict pass first
  for (const selector of selectors) {
    const elements = root.querySelectorAll(selector);
    for (const el of elements) {
      if (isVisible(el)) return { el, loose: false };
    }
  }

  // Loose pass
  for (const selector of selectors) {
    const elements = root.querySelectorAll(selector);
    for (const el of elements) {
      if (isLooselyVisible(el)) return { el, loose: true };
    }
  }

  return null;
}

// -----------------------------------------------------------------------
// Scrolling helper (iframe-safe)
// -----------------------------------------------------------------------

/**
 * Scroll an element into view by setting the scrollTop of its nearest
 * scrollable ancestor within the same document. Never calls
 * Element.scrollIntoView, which propagates to the parent document in
 * same-origin iframes and would fight the outer story page's scrollspy.
 */
export function scrollIntoViewIframeSafe(el: Element): void {
  const doc = el.ownerDocument;
  let scrollable: Element | null = null;
  let node = el.parentElement;
  while (node !== null && node !== doc.documentElement) {
    const style = getComputedStyle(node);
    const oy = style.overflowY;
    if (
      (oy === "auto" || oy === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      scrollable = node;
      break;
    }
    node = node.parentElement;
  }

  scrollable ??= doc.scrollingElement ?? doc.documentElement;

  // Position the element's vertical center at the viewport center of
  // the scrollable container.
  const elRect = el.getBoundingClientRect();
  const containerRect = scrollable.getBoundingClientRect();
  const elCenter = elRect.top + elRect.height / 2;
  const containerCenter = containerRect.top + containerRect.height / 2;
  const offset = elCenter - containerCenter;
  scrollable.scrollTop += offset;
}

// -----------------------------------------------------------------------
// Two-tier resolver (strict first, loose with scroll fallback)
// -----------------------------------------------------------------------

/** Interval between rect-stability polls (ms). */
const STABILITY_POLL_MS = 80;
/** Maximum wait for the element to become strictly visible after a
 *  scroll (ms). */
const SCROLL_SETTLE_MS = 1500;

/**
 * Resolve an element for a topic, polling with strict-then-loose
 * fallback. A strict (in-viewport) hit resolves immediately. A
 * loose-only hit is scrolled into view and the resolver waits until
 * the element is strictly visible with a rect stable across two
 * consecutive polls before returning it.
 */
export async function resolveTopicElement(
  root: Document | Element,
  candidates: Set<string>,
): Promise<Element | null> {
  // Topics with no label candidates (decryption) resolve through the
  // selector fallback; polling an empty set would only burn the full
  // timeout matching nothing.
  if (candidates.size === 0) return null;

  const result = await pollUntil<{ el: Element; loose: boolean }>({
    probe: (): { el: Element; loose: boolean } | null => {
      const strict = findTopicElement(root, candidates);
      if (strict !== null) return { el: strict, loose: false };
      const loose = findTopicElementLoose(root, candidates);
      if (loose !== null) return { el: loose, loose: true };
      return null;
    },
    timeoutMs: POLL_TIMEOUT_LONG_MS,
  });

  if (result === null) return null;
  if (!result.loose) return result.el;

  // Loose match: scroll it into view and wait for strict visibility
  // with a stable rect. When the settle wait lapses (a layout that
  // keeps shifting under decrypt reveals) but the element is still
  // present, return it anyway: a best-effort marker beats a false
  // "missing".
  scrollIntoViewIframeSafe(result.el);
  const settled = await waitForStrictVisibility(result.el);
  if (settled !== null) return settled;
  return result.el.isConnected && isLooselyVisible(result.el)
    ? result.el
    : null;
}

/**
 * Wait until an element passes isVisible with a rect that is stable
 * across two consecutive polls. Returns the element on success, null
 * on timeout.
 */
async function waitForStrictVisibility(el: Element): Promise<Element | null> {
  let previousRect: DOMRect | null = null;

  const settled = await pollUntil<Element>({
    probe: (): Element | null => {
      if (!isVisible(el)) {
        previousRect = null;
        return null;
      }
      const rect = el.getBoundingClientRect();
      if (previousRect !== null && rectsEqual(rect, previousRect)) {
        return el;
      }
      previousRect = rect;
      return null;
    },
    timeoutMs: SCROLL_SETTLE_MS,
    pollMs: STABILITY_POLL_MS,
  });

  return settled;
}

function rectsEqual(a: DOMRect, b: DOMRect): boolean {
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height
  );
}

/**
 * Resolve an element for a topic's CSS selector, using the same
 * strict-then-loose strategy. A loose hit is scrolled into view and
 * the resolver waits for strict visibility before returning.
 */
export async function resolveSelectorElement(
  root: Document | Element,
  topic: DemoTopic,
): Promise<Element | null> {
  const found = findTopicElementBySelector(root, topic);
  if (found === null) return null;
  if (!found.loose) return found.el;
  scrollIntoViewIframeSafe(found.el);
  return waitForStrictVisibility(found.el);
}

// -----------------------------------------------------------------------
// Pulse marker rendering
// -----------------------------------------------------------------------

const MARKER_SIZE = 44;
const MARKER_DURATION_MS = 600;

/**
 * Render a ShowTime-style tap marker at the element's center.
 * The marker is a demo-owned overlay, never mutates product markup.
 */
export function renderPulseMarker(target: Element): void {
  const rect = target.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const marker = document.createElement("div");
  marker.setAttribute("aria-hidden", "true");

  Object.assign(marker.style, {
    position: "fixed",
    left: `${String(cx - MARKER_SIZE / 2)}px`,
    top: `${String(cy - MARKER_SIZE / 2)}px`,
    width: `${String(MARKER_SIZE)}px`,
    height: `${String(MARKER_SIZE)}px`,
    borderRadius: "50%",
    background: "rgba(0, 0, 0, 0.15)",
    border: "1.5px solid rgba(0, 0, 0, 0.25)",
    pointerEvents: "none",
    zIndex: "99999",
    boxSizing: "border-box",
  });

  // Check reduced motion preference
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!reducedMotion) {
    Object.assign(marker.style, {
      opacity: "1",
      transform: "scale(1)",
      transition: `opacity ${String(MARKER_DURATION_MS)}ms ease-out, transform ${String(MARKER_DURATION_MS)}ms ease-out`,
    });
  }

  document.body.appendChild(marker);

  if (reducedMotion) {
    // Static: appear for duration, then remove
    setTimeout(() => {
      marker.remove();
    }, MARKER_DURATION_MS);
  } else {
    // Animate: trigger fade-out, then remove after transition
    requestAnimationFrame(() => {
      marker.style.opacity = "0";
      marker.style.transform = "scale(1.5)";
    });
    setTimeout(() => {
      marker.remove();
    }, MARKER_DURATION_MS + 50);
  }
}

// -----------------------------------------------------------------------
// Wait for element to appear (via pollUntil)
// -----------------------------------------------------------------------

/** Poll until the topic element appears, or timeout. */
export async function waitForElement(
  root: Document | Element,
  candidates: Set<string>,
): Promise<Element | null> {
  return pollUntil<Element>({
    probe: () => findTopicElement(root, candidates),
    timeoutMs: POLL_TIMEOUT_STANDARD_MS,
  });
}

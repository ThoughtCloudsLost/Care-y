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
import { pollUntil, POLL_TIMEOUT_STANDARD_MS } from "./poll.js";

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
        break;
      case "twofa-passkey":
        candidates.add(m.twofa_passkey_use({}, opts));
        break;
      case "twofa-email":
        candidates.add(m.twofa_email_label({}, opts));
        candidates.add(m.twofa_email_send_code({}, opts));
        break;
      case "twofa-sms":
        candidates.add(m.twofa_sms_label({}, opts));
        candidates.add(m.twofa_sms_send_code({}, opts));
        break;
      case "twofa-push":
        candidates.add(m.twofa_push_label({}, opts));
        candidates.add(m.twofa_push_send({}, opts));
        break;
      case "twofa-backup":
        candidates.add(m.twofa_backup_codes_enter({}, opts));
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
        // No label candidates; the PhoneApp special case owns this topic
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
  "dashboard-shift",
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
// Element finder (reverse label matching)
// -----------------------------------------------------------------------

/**
 * Find the first visible element matching a topic's candidate strings.
 *
 * Each pass matches the label text FIRST, then checks visibility only
 * on matches. This avoids forced reflows on non-matching elements.
 */
export function findTopicElement(
  root: Document | Element,
  candidates: Set<string>,
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

  // Check aria-label attributes (text match first, visibility only on hits)
  const ariaLabeled = root.querySelectorAll("[aria-label]");
  for (const el of ariaLabeled) {
    const label = el.getAttribute("aria-label");
    if (label !== null && candidates.has(label) && isVisible(el)) {
      const hit = prefer(el);
      if (hit !== null) return hit;
    }
  }

  // Check text content of interactive elements
  const interactive = root.querySelectorAll(
    'button, [role="button"], a, .k-list-item, label',
  );
  for (const el of interactive) {
    const text = el.textContent.trim().slice(0, 80);
    if (text !== "" && candidates.has(text) && isVisible(el)) {
      const hit = prefer(el);
      if (hit !== null) return hit;
    }
  }

  // List items carry title and value in one textContent blob, so the
  // whole-text pass above misses them. Match each childless leaf's own
  // text instead, mirroring the click classifier's list-item handling.
  const listItems = root.querySelectorAll(".k-list-item");
  for (const item of listItems) {
    for (const leaf of item.querySelectorAll("*")) {
      if (leaf.childElementCount > 0) continue;
      const text = leaf.textContent.trim();
      if (
        text !== "" &&
        text.length <= 80 &&
        candidates.has(text) &&
        isVisible(item)
      ) {
        const hit = prefer(item);
        if (hit !== null) return hit;
      }
    }
  }

  // Check placeholder attributes on inputs
  const inputs = root.querySelectorAll("[placeholder]");
  for (const el of inputs) {
    const placeholder = el.getAttribute("placeholder");
    if (placeholder !== null && candidates.has(placeholder) && isVisible(el)) {
      const hit = prefer(el);
      if (hit !== null) return hit;
    }
  }

  return chromeMatch;
}

/**
 * Whether the element sits in shell navigation chrome: the desktop
 * sidebar, tab bars, or any nav landmark. Pulse taps must never
 * activate navigation (clicking a sidebar item leaves the screen
 * being narrated), and target resolution prefers content matches.
 */
export function isNavChrome(el: Element): boolean {
  return (
    el.closest('nav, [role="navigation"], [role="tablist"], .k-tabbar') !== null
  );
}

function isVisible(el: Element): boolean {
  // Closed Konsta sheets stay mounted: their content is marked inert
  // and the sheet is translated below the viewport, so size alone
  // reports hidden elements as visible (the settings driver learned
  // the same lesson). Require viewport intersection and a non-inert
  // ancestry.
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
    // DecryptPlaceholder renders role="status" while scrambling (line 161)
    ["decryption", ['[role="status"][aria-busy="true"]']],
    // Date separator line in the thread (TicketDetail.svelte line 1253)
    ["thread-anatomy", [".date-separator", ".unread-divider"]],
    // GettingStartedCard collapse toggle (CollapsibleSection.svelte line 55)
    ["dashboard-getting-started", [".collapsible-section .section-toggle"]],
  ]);

/**
 * Find the first visible element matching one of the topic's CSS
 * selectors. Consulted by PhoneApp when label matching fails.
 */
export function findTopicElementBySelector(
  root: Document | Element,
  topic: DemoTopic,
): Element | null {
  const selectors = TOPIC_SELECTORS.get(topic);
  if (selectors === undefined) return null;
  for (const selector of selectors) {
    const elements = root.querySelectorAll(selector);
    for (const el of elements) {
      if (isVisible(el)) return el;
    }
  }
  return null;
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

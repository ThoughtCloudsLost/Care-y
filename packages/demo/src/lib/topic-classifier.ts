/**
 * Pure classifier: maps a label string from a phone-document
 * element to a DemoTopic by matching against paraglide message
 * outputs across all available locales.
 *
 * Called at event time so a locale switch mid-session does not
 * break classification. Never bakes label strings at module init.
 */

import * as m from "$lib/paraglide/messages.js";
import { locales } from "$lib/paraglide/runtime.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import type { DemoFeature, DemoTopic } from "./bridge.js";

export interface ClassifierContext {
  /** True when the phone is displaying a ticket detail view. */
  readonly inDetail: boolean;
  /** The active demo feature, used to disambiguate labels that appear on multiple surfaces. */
  readonly feature: DemoFeature;
}

/**
 * Classify a label string (aria-label, text content, or placeholder)
 * to a DemoTopic. Returns null if the label does not match any known
 * topic.
 *
 * Matches are tested against all configured locales so that a stale
 * DOM label (rendered before a locale switch) still classifies.
 */
export function classifyDemoLabel(
  label: string,
  ctx: ClassifierContext,
): DemoTopic | null {
  // Build match sets for all locales at call time
  for (const locale of locales) {
    const opts = { locale };
    const terms = withTerms();

    // --- credentials ---
    // auth_password and settings_password share the same string ("Password"),
    // so the match is gated on feature to avoid a collision on settings.
    if (
      label === m.auth_sign_in({}, opts) ||
      label === m.auth_username({}, opts) ||
      (label === m.auth_password({}, opts) && ctx.feature !== "settings")
    ) {
      return "credentials";
    }

    // --- twofa (per-method labels first, shared controls generic) ---
    // The TwoFactorSheet on settings renders the same method labels as
    // the login picker. The feature context disambiguates: on login they
    // classify to their login-specific twofa-* topics; on settings they
    // all classify as settings-2fa.
    if (label === m.twofa_totp_label({}, opts)) {
      return ctx.feature === "settings" ? "settings-2fa" : "twofa-totp";
    }
    if (label === m.twofa_passkey_use({}, opts)) {
      return ctx.feature === "settings" ? "settings-2fa" : "twofa-passkey";
    }
    if (
      label === m.twofa_email_label({}, opts) ||
      label === m.twofa_email_send_code({}, opts)
    ) {
      return ctx.feature === "settings" ? "settings-2fa" : "twofa-email";
    }
    if (
      label === m.twofa_sms_label({}, opts) ||
      label === m.twofa_sms_send_code({}, opts)
    ) {
      return ctx.feature === "settings" ? "settings-2fa" : "twofa-sms";
    }
    if (
      label === m.twofa_push_label({}, opts) ||
      label === m.twofa_push_send({}, opts)
    ) {
      return ctx.feature === "settings" ? "settings-2fa" : "twofa-push";
    }
    if (label === m.twofa_backup_codes_enter({}, opts)) {
      return ctx.feature === "settings" ? "settings-2fa" : "twofa-backup";
    }
    if (label === m.twofa_verify_submit({}, opts)) {
      return ctx.feature === "settings" ? "settings-2fa" : "twofa";
    }

    // --- twofa_remove_confirm (settings-only) ---
    if (
      ctx.feature === "settings" &&
      label === m.twofa_remove_confirm({}, opts)
    ) {
      return "settings-2fa";
    }

    // --- key-derivation ---
    if (
      label === m.auth_phase_argon2id({}, opts) ||
      label === m.auth_phase_oprf({}, opts) ||
      label === m.auth_phase_derive({}, opts) ||
      label === m.auth_phase_auth({}, opts) ||
      label === m.auth_phase_done({}, opts)
    ) {
      return "key-derivation";
    }

    // --- sort ---
    if (label === m.tickets_sort({}, opts)) {
      return "sort";
    }

    // --- filters vs thread-filters ---
    // The FilterPillBar toolbar label is shared between list and detail.
    // ctx.inDetail disambiguates.
    if (label === m.tickets_filter(terms, opts)) {
      return ctx.inDetail ? "thread-filters" : "filters";
    }
    // List filter pill popovers (only fires on list)
    if (
      !ctx.inDetail &&
      (label === m.tickets_filter_status({}, opts) ||
        label === m.tickets_filter_queue(terms, opts) ||
        label === m.tickets_filter_priority({}, opts) ||
        label === m.tickets_filter_assignee({}, opts) ||
        label === m.tickets_filter_date_range({}, opts) ||
        label === m.tickets_create_shortcut({}, opts))
    ) {
      return "filters";
    }
    // Detail thread filter pill labels
    if (
      ctx.inDetail &&
      (label === m.ticket_filter_type({}, opts) ||
        label === m.ticket_filter_author({}, opts) ||
        label === m.ticket_filter_date({}, opts))
    ) {
      return "thread-filters";
    }

    // --- view-modes ---
    if (
      label === m.view_switcher_label({}, opts) ||
      label === m.view_switcher_table({}, opts) ||
      label === m.view_switcher_rows({}, opts) ||
      label === m.view_switcher_cards({}, opts) ||
      label === m.view_switcher_grid({}, opts) ||
      label === m.view_switcher_kanban({}, opts)
    ) {
      return "view-modes";
    }

    // --- select-mode ---
    if (
      label === m.tickets_select_mode({}, opts) ||
      label === m.ticket_select_mode({}, opts)
    ) {
      return "select-mode";
    }

    // --- new-ticket ---
    if (label === m.nav_new_ticket(terms, opts)) {
      return "new-ticket";
    }

    // --- compose-actions ---
    if (label === m.ticket_compose_actions({}, opts)) {
      return "compose-actions";
    }

    // --- reply ---
    if (
      label === m.ticket_send({}, opts) ||
      label === m.ticket_sms_send({}, opts)
    ) {
      return "reply";
    }

    // --- notes ---
    if (
      label === m.ticket_add_internal_note({}, opts) ||
      label === m.ticket_edit_note({}, opts) ||
      label === m.ticket_save_note({}, opts)
    ) {
      return "notes";
    }

    // --- case-fold ---
    if (
      label === m.ticket_case_details(terms, opts) ||
      label === m.ticket_fold_case_details(terms, opts)
    ) {
      return "case-fold";
    }

    // --- timeline ---
    if (
      label === m.ticket_action_timeline({}, opts) ||
      label === m.ticket_action_messages({}, opts)
    ) {
      return "timeline";
    }

    // --- language ---
    if (label === m.language_picker_label({}, opts)) {
      return "language";
    }

    // --- dashboard-queues ---
    if (label === m.dashboard_queues_heading(terms, opts)) {
      return "dashboard-queues";
    }

    // --- dashboard-activity ---
    if (label === m.dashboard_activity_heading({}, opts)) {
      return "dashboard-activity";
    }

    // --- library-vote ---
    if (
      label === m.library_was_helpful({}, opts) ||
      label === m.library_vote_up({}, opts) ||
      label === m.library_vote_down({}, opts)
    ) {
      return "library-vote";
    }

    // --- library-categories ---
    if (label === m.library_manage_categories({}, opts)) {
      return "library-categories";
    }

    // --- library-editor ---
    if (
      label === m.library_new_article({}, opts) ||
      label === m.library_edit_article({}, opts)
    ) {
      return "library-editor";
    }

    // --- admin-roster-edit vs settings-profile ---
    // settings_display_name and settings_username label the admin user-edit
    // sheet inputs when on admin, and the profile sheet inputs on settings.
    if (label === m.settings_display_name({}, opts)) {
      return ctx.feature === "admin" ? "admin-roster-edit" : "settings-profile";
    }
    if (label === m.settings_username({}, opts)) {
      return ctx.feature === "admin" ? "admin-roster-edit" : "settings-profile";
    }

    // --- admin-roster-edit (unambiguous) ---
    if (label === m.admin_user_edit_actions({}, opts)) {
      return "admin-roster-edit";
    }

    // --- admin-greetings ---
    if (
      label === m.admin_greetings_add_button({}, opts) ||
      label === m.admin_tab_greetings({}, opts)
    ) {
      return "admin-greetings";
    }

    // --- admin-quarantine ---
    if (
      label === m.admin_quarantine_play({}, opts) ||
      label === m.admin_quarantine_route({}, opts) ||
      label === m.admin_quarantine_dismiss({}, opts) ||
      label === m.admin_tab_quarantine({}, opts)
    ) {
      return "admin-quarantine";
    }

    // --- settings-password ---
    if (label === m.settings_password({}, opts)) {
      return "settings-password";
    }

    // --- settings-2fa ---
    if (label === m.settings_2fa({}, opts)) {
      return "settings-2fa";
    }
  }

  return null;
}

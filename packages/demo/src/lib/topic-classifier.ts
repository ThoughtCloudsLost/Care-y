/**
 * Pure classifier: maps a label string from a phone-document
 * element to a DemoTopic by matching against paraglide message
 * outputs across all available locales.
 *
 * The label-to-topic lookup is built lazily on first call, cached in
 * a Map for O(1) classification, and invalidated when the locale set
 * changes (mid-session locale switches are the reason the old code
 * evaluated at call time).
 *
 * Labels that map to different topics depending on context (feature,
 * inDetail) are stored in a separate disambiguation table consulted
 * after the Map hit.
 */

import * as m from "$lib/paraglide/messages.js";
import { locales } from "$lib/paraglide/runtime.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import type { DemoFeature, DemoTopic } from "./bridge.js";

// -----------------------------------------------------------------------
// Locale type (re-exported for D4 consumers)
// -----------------------------------------------------------------------

/** A locale value from the paraglide runtime. */
export type DemoLocale = (typeof locales)[number];

// -----------------------------------------------------------------------
// Classifier context
// -----------------------------------------------------------------------

export interface ClassifierContext {
  /** True when the phone is displaying a ticket detail view. */
  readonly inDetail: boolean;
  /** The active demo feature, used to disambiguate labels that appear on multiple surfaces. */
  readonly feature: DemoFeature;
}

// -----------------------------------------------------------------------
// matchesAnyLocale (D4: shared locale-sweep label matching)
// -----------------------------------------------------------------------

/**
 * Test whether `text` matches the output of `messageFn` in any locale.
 *
 * `mode` controls comparison:
 *   "equals"   - exact match (default)
 *   "includes" - text.includes(messageFn output)
 */
export function matchesAnyLocale(
  text: string,
  messageFn: (opts: { locale: DemoLocale }) => string,
  mode: "equals" | "includes" = "equals",
): boolean {
  for (const locale of locales) {
    const label = messageFn({ locale });
    if (mode === "equals" ? text === label : text.includes(label)) {
      return true;
    }
  }
  return false;
}

// -----------------------------------------------------------------------
// Disambiguation rules
// -----------------------------------------------------------------------

/**
 * Labels that resolve to different topics depending on feature or
 * inDetail context. The Map lookup gives the "unambiguous" topic; these
 * entries override it when the context matches.
 */
interface DisambiguationRule {
  /** The topic to return. */
  readonly topic: DemoTopic;
  /** Feature(s) that must match for this override to fire. Null means "any". */
  readonly features: ReadonlySet<DemoFeature> | null;
  /** When true, only fires in a detail context. When false, only on the list. Null means either. */
  readonly inDetail: boolean | null;
}

// Keyed by label string; built alongside the label map.
let disambiguationCache: ReadonlyMap<
  string,
  readonly DisambiguationRule[]
> | null = null;

// -----------------------------------------------------------------------
// Cached label-to-topic Map
// -----------------------------------------------------------------------

let labelMapCache: ReadonlyMap<string, DemoTopic> | null = null;
let cachedLocaleKey: string | null = null;

/** A serialized key representing the current locale set, for cache invalidation. */
function localeKey(): string {
  return locales.join(",");
}

/**
 * Register a label in the label map. For unambiguous labels (no context
 * dependency), this is the only entry. Ambiguous labels also get a
 * disambiguation rule so the Map hit can be refined.
 */
function register(
  map: Map<string, DemoTopic>,
  disambig: Map<string, DisambiguationRule[]>,
  label: string,
  topic: DemoTopic,
  features: ReadonlySet<DemoFeature> | null = null,
  inDetail: boolean | null = null,
): void {
  if (features !== null || inDetail !== null) {
    // Context-gated: rules only. Gated registrations must never seed
    // the fallback map, or a label whose every registration is gated
    // classifies in contexts none of its gates allow (a settings-only
    // confirm leaking onto the login screen, an admin Dismiss falling
    // back to the dashboard topic registered first).
    const rules = disambig.get(label) ?? [];
    rules.push({ topic, features, inDetail });
    disambig.set(label, rules);
  } else {
    // Ungated: the fallback when no rule matches the context.
    if (!map.has(label)) {
      map.set(label, topic);
    }
  }
}

interface ClassifierCaches {
  readonly labels: ReadonlyMap<string, DemoTopic>;
  readonly rules: ReadonlyMap<string, readonly DisambiguationRule[]>;
}

function buildLabelMap(): ClassifierCaches {
  const map = new Map<string, DemoTopic>();
  const disambig = new Map<string, DisambiguationRule[]>();

  const settingsSet: ReadonlySet<DemoFeature> = new Set(["settings"]);
  const adminSet: ReadonlySet<DemoFeature> = new Set(["admin"]);
  const homeSet: ReadonlySet<DemoFeature> = new Set(["home"]);
  const ticketsSet: ReadonlySet<DemoFeature> = new Set(["tickets"]);
  const librarySet: ReadonlySet<DemoFeature> = new Set(["library"]);
  const notSettingsNotAdmin: ReadonlySet<DemoFeature> = new Set([
    "login",
    "home",
    "tickets",
    "library",
    "schedule",
    "other",
  ]);
  const notSettings: ReadonlySet<DemoFeature> = new Set([
    "login",
    "home",
    "tickets",
    "library",
    "admin",
    "schedule",
    "other",
  ]);

  for (const locale of locales) {
    const opts = { locale };
    const terms = withTerms();

    // --- credentials ---
    // auth_password / settings_password and auth_username / settings_username
    // share strings; feature gates avoid collisions.
    register(map, disambig, m.auth_sign_in({}, opts), "credentials");
    register(
      map,
      disambig,
      m.auth_username({}, opts),
      "credentials",
      notSettingsNotAdmin,
    );
    register(
      map,
      disambig,
      m.auth_password({}, opts),
      "credentials",
      notSettings,
    );

    // --- twofa per-method (feature-gated: login vs settings-2fa) ---
    register(
      map,
      disambig,
      m.twofa_totp_label({}, opts),
      "twofa-totp",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_totp_label({}, opts),
      "settings-2fa",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.twofa_passkey_use({}, opts),
      "twofa-passkey",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_passkey_use({}, opts),
      "settings-2fa",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.twofa_email_label({}, opts),
      "twofa-email",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_email_label({}, opts),
      "settings-2fa",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.twofa_email_send_code({}, opts),
      "twofa-email",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_email_send_code({}, opts),
      "settings-2fa",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.twofa_sms_label({}, opts),
      "twofa-sms",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_sms_label({}, opts),
      "settings-2fa",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.twofa_sms_send_code({}, opts),
      "twofa-sms",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_sms_send_code({}, opts),
      "settings-2fa",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.twofa_push_label({}, opts),
      "twofa-push",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_push_label({}, opts),
      "settings-2fa",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.twofa_push_send({}, opts),
      "twofa-push",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_push_send({}, opts),
      "settings-2fa",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.twofa_backup_codes_enter({}, opts),
      "twofa-backup",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_backup_codes_enter({}, opts),
      "settings-2fa",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.twofa_verify_submit({}, opts),
      "twofa",
      notSettings,
    );
    register(
      map,
      disambig,
      m.twofa_verify_submit({}, opts),
      "settings-2fa",
      settingsSet,
    );

    // --- twofa_remove_confirm (settings-only) ---
    register(
      map,
      disambig,
      m.twofa_remove_confirm({}, opts),
      "settings-2fa",
      settingsSet,
    );

    // --- key-derivation ---
    register(map, disambig, m.auth_phase_argon2id({}, opts), "key-derivation");
    register(map, disambig, m.auth_phase_oprf({}, opts), "key-derivation");
    register(map, disambig, m.auth_phase_derive({}, opts), "key-derivation");
    register(map, disambig, m.auth_phase_auth({}, opts), "key-derivation");
    register(map, disambig, m.auth_phase_done({}, opts), "key-derivation");

    // --- list-stats (tickets list only; no classifier disambiguation needed,
    //     the stats row elements only appear on the list) ---
    register(
      map,
      disambig,
      m.tickets_status_new({}, opts),
      "list-stats",
      ticketsSet,
      false,
    );
    register(
      map,
      disambig,
      m.tickets_status_active({}, opts),
      "list-stats",
      ticketsSet,
      false,
    );
    register(
      map,
      disambig,
      m.tickets_status_on_hold({}, opts),
      "list-stats",
      ticketsSet,
      false,
    );

    // --- sort ---
    register(map, disambig, m.tickets_sort({}, opts), "sort");

    // --- filters vs thread-filters ---
    // The FilterPillBar toolbar label is shared between list and detail.
    const filterLabel = m.tickets_filter(terms, opts);
    register(map, disambig, filterLabel, "filters", null, false);
    register(map, disambig, filterLabel, "thread-filters", null, true);

    // List filter pill popovers (only on list)
    register(
      map,
      disambig,
      m.tickets_filter_status({}, opts),
      "filters",
      null,
      false,
    );
    register(
      map,
      disambig,
      m.tickets_filter_queue(terms, opts),
      "filters",
      null,
      false,
    );
    register(
      map,
      disambig,
      m.tickets_filter_priority({}, opts),
      "filters",
      null,
      false,
    );
    register(
      map,
      disambig,
      m.tickets_filter_assignee({}, opts),
      "filters",
      null,
      false,
    );
    register(
      map,
      disambig,
      m.tickets_filter_date_range({}, opts),
      "filters",
      null,
      false,
    );
    // --- saved-filters ---
    register(
      map,
      disambig,
      m.tickets_create_shortcut({}, opts),
      "saved-filters",
    );
    register(map, disambig, m.saved_filter_apply({}, opts), "saved-filters");

    // Detail thread filter pill labels
    register(
      map,
      disambig,
      m.ticket_filter_type({}, opts),
      "thread-filters",
      null,
      true,
    );
    register(
      map,
      disambig,
      m.ticket_filter_author({}, opts),
      "thread-filters",
      null,
      true,
    );
    register(
      map,
      disambig,
      m.ticket_filter_date({}, opts),
      "thread-filters",
      null,
      true,
    );

    // --- view-modes vs dashboard-view-switcher vs library-tools ---
    // On "home" feature, view switcher labels classify as dashboard-view-switcher.
    // On "library" feature, they classify as library-tools.
    // On tickets they stay view-modes.
    const viewSwitcherLabels = [
      m.view_switcher_label({}, opts),
      m.view_switcher_table({}, opts),
      m.view_switcher_rows({}, opts),
      m.view_switcher_cards({}, opts),
      m.view_switcher_grid({}, opts),
      m.view_switcher_kanban({}, opts),
    ];
    for (const vsLabel of viewSwitcherLabels) {
      register(map, disambig, vsLabel, "view-modes", ticketsSet);
      register(map, disambig, vsLabel, "dashboard-view-switcher", homeSet);
      register(map, disambig, vsLabel, "library-tools", librarySet);
    }

    // --- select-mode (list-level only; detail select is message-select) ---
    register(map, disambig, m.tickets_select_mode({}, opts), "select-mode");
    register(
      map,
      disambig,
      m.ticket_select_mode({}, opts),
      "message-select",
      null,
      true,
    );
    register(
      map,
      disambig,
      m.ticket_select_mode({}, opts),
      "select-mode",
      null,
      false,
    );

    // --- new-ticket ---
    register(map, disambig, m.nav_new_ticket(terms, opts), "new-ticket");

    // --- compose-actions ---
    register(
      map,
      disambig,
      m.ticket_compose_actions({}, opts),
      "compose-actions",
    );

    // --- reply ---
    register(map, disambig, m.ticket_send({}, opts), "reply");
    register(map, disambig, m.ticket_sms_send({}, opts), "reply");

    // --- notes ---
    register(map, disambig, m.ticket_add_internal_note({}, opts), "notes");
    register(map, disambig, m.ticket_edit_note({}, opts), "notes");
    register(map, disambig, m.ticket_save_note({}, opts), "notes");

    // --- case-fold ---
    register(map, disambig, m.ticket_case_details(terms, opts), "case-fold");
    register(
      map,
      disambig,
      m.ticket_fold_case_details(terms, opts),
      "case-fold",
    );

    // --- timeline ---
    register(map, disambig, m.ticket_action_timeline({}, opts), "timeline");

    // --- conversation ---
    register(
      map,
      disambig,
      m.ticket_action_messages({}, opts),
      "conversation",
      null,
      true,
    );

    // --- unread-badges ---
    register(
      map,
      disambig,
      m.tickets_sort_new_replies_first({}, opts),
      "unread-badges",
    );

    // --- split-view ---
    register(map, disambig, m.split_view_resize_label({}, opts), "split-view");

    // --- case-panel (takes over ticket_more_actions from close-reopen) ---
    register(
      map,
      disambig,
      m.ticket_more_actions({}, opts),
      "case-panel",
      null,
      true,
    );
    register(
      map,
      disambig,
      m.ticket_panel_call({}, opts),
      "case-panel",
      null,
      true,
    );

    // --- close-reopen ---
    register(
      map,
      disambig,
      m.ticket_action_close({}, opts),
      "close-reopen",
      null,
      true,
    );
    register(
      map,
      disambig,
      m.ticket_action_reopen({}, opts),
      "close-reopen",
      null,
      true,
    );

    // --- message-actions ---
    register(
      map,
      disambig,
      m.ticket_context_menu_title({}, opts),
      "message-actions",
      null,
      true,
    );

    // --- exposure-hints ---
    register(
      map,
      disambig,
      m.ticket_sms_title(terms, opts),
      "exposure-hints",
      null,
      true,
    );
    register(
      map,
      disambig,
      m.exposure_hint_dismiss({}, opts),
      "exposure-hints",
      null,
      true,
    );

    // --- deep-search vs page-search vs library-search ---
    // search_inline_trigger splits three ways: tickets detail is deep-search,
    // tickets list is page-search, library is library-search.
    register(
      map,
      disambig,
      m.search_inline_trigger({}, opts),
      "deep-search",
      ticketsSet,
      true,
    );
    register(
      map,
      disambig,
      m.search_inline_trigger({}, opts),
      "page-search",
      ticketsSet,
      false,
    );
    register(
      map,
      disambig,
      m.search_inline_trigger({}, opts),
      "library-search",
      librarySet,
    );
    register(
      map,
      disambig,
      m.search_refine_label({}, opts),
      "deep-search",
      null,
      true,
    );
    register(
      map,
      disambig,
      m.search_conversation_nav_label({}, opts),
      "deep-search",
      null,
      true,
    );
    register(
      map,
      disambig,
      m.search_deep_nav_trigger({}, opts),
      "deep-search",
      ticketsSet,
      true,
    );
    register(
      map,
      disambig,
      m.search_deep_nav_trigger({}, opts),
      "library-search",
      librarySet,
    );

    // --- thread-anatomy (detail only; the unread divider's aria-label) ---
    register(
      map,
      disambig,
      m.ticket_new_messages({}, opts),
      "thread-anatomy",
      null,
      true,
    );

    // --- language ---
    register(map, disambig, m.language_picker_label({}, opts), "language");

    // --- dashboard-getting-started ---
    register(
      map,
      disambig,
      m.getting_started_heading({}, opts),
      "dashboard-getting-started",
      homeSet,
    );
    register(
      map,
      disambig,
      m.getting_started_dismiss({}, opts),
      "dashboard-getting-started",
      homeSet,
    );

    // --- dashboard-shift ---
    register(
      map,
      disambig,
      m.dashboard_shift_heading({}, opts),
      "dashboard-shift",
    );

    // --- dashboard-queues (scoped to home; admin_tab_queues goes to admin-queues) ---
    register(
      map,
      disambig,
      m.dashboard_queues_heading(terms, opts),
      "dashboard-queues",
      homeSet,
    );

    // --- dashboard-activity ---
    register(
      map,
      disambig,
      m.dashboard_activity_heading({}, opts),
      "dashboard-activity",
    );

    // --- dashboard-kb ---
    register(
      map,
      disambig,
      m.dashboard_kb_heading(terms, opts),
      "dashboard-kb",
      homeSet,
    );

    // --- dashboard-needs-attention ---
    register(
      map,
      disambig,
      m.dashboard_section_needs_attention({}, opts),
      "dashboard-needs-attention",
    );

    // --- dashboard-my-tickets ---
    register(
      map,
      disambig,
      m.dashboard_section_my_tickets(terms, opts),
      "dashboard-my-tickets",
    );

    // --- dashboard-unassigned ---
    register(
      map,
      disambig,
      m.dashboard_section_unassigned({}, opts),
      "dashboard-unassigned",
    );

    // --- dashboard-on-hold ---
    register(
      map,
      disambig,
      m.dashboard_section_on_hold({}, opts),
      "dashboard-on-hold",
    );

    // --- dashboard-create ---
    register(
      map,
      disambig,
      m.nav_create_new({}, opts),
      "dashboard-create",
      homeSet,
    );

    // --- library-vote ---
    register(map, disambig, m.library_was_helpful({}, opts), "library-vote");
    register(map, disambig, m.library_vote_up({}, opts), "library-vote");
    register(map, disambig, m.library_vote_down({}, opts), "library-vote");

    // --- library-categories ---
    register(
      map,
      disambig,
      m.library_manage_categories({}, opts),
      "library-categories",
    );

    // --- library-tools (sort and select on the library list) ---
    register(
      map,
      disambig,
      m.library_sort({}, opts),
      "library-tools",
      librarySet,
    );
    register(
      map,
      disambig,
      m.library_select_mode({}, opts),
      "library-tools",
      librarySet,
    );

    // --- library-editor ---
    register(map, disambig, m.library_new_article({}, opts), "library-editor");
    register(map, disambig, m.library_edit_article({}, opts), "library-editor");

    // --- admin-roster-edit vs settings-profile ---
    register(
      map,
      disambig,
      m.settings_display_name({}, opts),
      "admin-roster-edit",
      adminSet,
    );
    register(
      map,
      disambig,
      m.settings_display_name({}, opts),
      "settings-profile",
      settingsSet,
    );
    register(
      map,
      disambig,
      m.settings_username({}, opts),
      "admin-roster-edit",
      adminSet,
    );
    register(
      map,
      disambig,
      m.settings_username({}, opts),
      "settings-profile",
      settingsSet,
    );

    // --- admin-roster-edit (unambiguous) ---
    register(
      map,
      disambig,
      m.admin_user_edit_actions({}, opts),
      "admin-roster-edit",
    );

    // --- admin-roster-tools (sort and filter pills on the people tab) ---
    register(
      map,
      disambig,
      m.admin_users_sort({}, opts),
      "admin-roster-tools",
      adminSet,
    );
    register(
      map,
      disambig,
      m.admin_users_filter_role({}, opts),
      "admin-roster-tools",
      adminSet,
    );
    register(
      map,
      disambig,
      m.admin_users_filter_status({}, opts),
      "admin-roster-tools",
      adminSet,
    );
    register(
      map,
      disambig,
      m.admin_users_filter_keys({}, opts),
      "admin-roster-tools",
      adminSet,
    );
    register(
      map,
      disambig,
      m.admin_users_filter_queue(terms, opts),
      "admin-roster-tools",
      adminSet,
    );

    // --- admin-greetings ---
    register(
      map,
      disambig,
      m.admin_greetings_add_button({}, opts),
      "admin-greetings",
    );
    register(map, disambig, m.admin_tab_greetings({}, opts), "admin-greetings");

    // --- admin-quarantine ---
    register(
      map,
      disambig,
      m.admin_quarantine_play({}, opts),
      "admin-quarantine",
    );
    register(
      map,
      disambig,
      m.admin_quarantine_route({}, opts),
      "admin-quarantine",
    );
    register(
      map,
      disambig,
      m.admin_quarantine_dismiss({}, opts),
      "admin-quarantine",
    );
    register(
      map,
      disambig,
      m.admin_tab_quarantine({}, opts),
      "admin-quarantine",
    );

    // --- admin-queues (scoped to admin; dashboard_queues_heading goes to dashboard-queues) ---
    register(
      map,
      disambig,
      m.admin_tab_queues(terms, opts),
      "admin-queues",
      adminSet,
    );
    register(
      map,
      disambig,
      m.admin_queues_title(terms, opts),
      "admin-queues",
      adminSet,
    );
    register(
      map,
      disambig,
      m.admin_queues_create_button(terms, opts),
      "admin-queues",
      adminSet,
    );

    // --- admin-clients ---
    register(
      map,
      disambig,
      m.admin_clients_title(terms, opts),
      "admin-clients",
      adminSet,
    );

    // --- admin-client-merge (merge sheet labels; visible only when sheet is open) ---
    register(
      map,
      disambig,
      m.client_merge_sheet_title(terms, opts),
      "admin-client-merge",
      adminSet,
    );
    register(
      map,
      disambig,
      m.client_merge_history_heading({}, opts),
      "admin-client-merge",
      adminSet,
    );
    register(
      map,
      disambig,
      m.client_merge_undo({}, opts),
      "admin-client-merge",
      adminSet,
    );
    register(
      map,
      disambig,
      m.client_merge_confirm_button(terms, opts),
      "admin-client-merge",
      adminSet,
    );

    // --- admin-roles (manager page section headings) ---
    register(
      map,
      disambig,
      m.mgr_section_role({}, opts),
      "admin-roles",
      adminSet,
    );
    register(
      map,
      disambig,
      m.mgr_section_ops({}, opts),
      "admin-roles",
      adminSet,
    );
    register(
      map,
      disambig,
      m.mgr_section_queues({}, opts),
      "admin-roles",
      adminSet,
    );
    register(
      map,
      disambig,
      m.mgr_section_protected({}, opts),
      "admin-roles",
      adminSet,
    );

    // --- admin-telephony-provider ---
    register(
      map,
      disambig,
      m.admin_telephony_change_mode({}, opts),
      "admin-telephony-provider",
      adminSet,
    );

    // --- admin-phone-lines ---
    register(
      map,
      disambig,
      m.admin_tab_telephony({}, opts),
      "admin-phone-lines",
    );

    // --- admin-sms-templates ---
    register(
      map,
      disambig,
      m.admin_tab_sms_templates({}, opts),
      "admin-sms-templates",
    );
    register(
      map,
      disambig,
      m.admin_templates_add_button({}, opts),
      "admin-sms-templates",
    );

    // --- admin-blocklist ---
    register(map, disambig, m.admin_tab_blocklist({}, opts), "admin-blocklist");
    register(
      map,
      disambig,
      m.admin_blocklist_add_button({}, opts),
      "admin-blocklist",
    );

    // --- admin-general ---
    register(map, disambig, m.admin_tab_org_general({}, opts), "admin-general");
    register(
      map,
      disambig,
      m.admin_org_general_edit_button({}, opts),
      "admin-general",
    );

    // --- admin-branding ---
    register(map, disambig, m.admin_tab_branding({}, opts), "admin-branding");
    register(
      map,
      disambig,
      m.admin_branding_edit_button({}, opts),
      "admin-branding",
    );

    // --- admin-terminology ---
    register(
      map,
      disambig,
      m.admin_tab_terminology({}, opts),
      "admin-terminology",
    );
    register(
      map,
      disambig,
      m.admin_terminology_edit_button({}, opts),
      "admin-terminology",
    );

    // --- admin-note-types ---
    register(
      map,
      disambig,
      m.admin_tab_note_types({}, opts),
      "admin-note-types",
    );
    register(
      map,
      disambig,
      m.admin_note_types_add({}, opts),
      "admin-note-types",
    );

    // --- admin-keys ---
    register(map, disambig, m.admin_tab_keys({}, opts), "admin-keys");

    // --- admin-retention ---
    register(map, disambig, m.admin_tab_retention({}, opts), "admin-retention");
    register(
      map,
      disambig,
      m.admin_retention_days_label({}, opts),
      "admin-retention",
    );

    // --- settings-password ---
    register(map, disambig, m.settings_password({}, opts), "settings-password");

    // --- settings-2fa ---
    register(map, disambig, m.settings_2fa({}, opts), "settings-2fa");

    // --- settings-appearance ---
    register(
      map,
      disambig,
      m.settings_color_scheme({}, opts),
      "settings-appearance",
      settingsSet,
    );

    // --- settings-security ---
    register(
      map,
      disambig,
      m.settings_review_briefing({}, opts),
      "settings-security",
      settingsSet,
    );
  }

  labelMapCache = map;
  disambiguationCache = disambig;
  cachedLocaleKey = localeKey();
  return { labels: map, rules: disambig };
}

/** Ensure the label map is built and current. */
function ensureLabelMap(): ClassifierCaches {
  if (
    labelMapCache !== null &&
    disambiguationCache !== null &&
    cachedLocaleKey === localeKey()
  ) {
    return { labels: labelMapCache, rules: disambiguationCache };
  }
  return buildLabelMap();
}

/** Invalidate the cached label map. Primarily for testing. */
export function invalidateClassifierCache(): void {
  labelMapCache = null;
  disambiguationCache = null;
  cachedLocaleKey = null;
}

// -----------------------------------------------------------------------
// Public classifier
// -----------------------------------------------------------------------

/**
 * Classify a label string (aria-label, text content, or placeholder)
 * to a DemoTopic. Returns null if the label does not match any known
 * topic.
 *
 * The lookup table is built lazily once per locale set, making
 * classification O(1) per call instead of O(locales * messages).
 */
export function classifyDemoLabel(
  label: string,
  ctx: ClassifierContext,
): DemoTopic | null {
  const { labels, rules: ruleMap } = ensureLabelMap();

  // Check disambiguation rules for this label
  const rules = ruleMap.get(label);
  if (rules !== undefined) {
    for (const rule of rules) {
      const featureMatch =
        rule.features === null || rule.features.has(ctx.feature);
      const detailMatch =
        rule.inDetail === null || rule.inDetail === ctx.inDetail;
      if (featureMatch && detailMatch) {
        return rule.topic;
      }
    }
  }

  // No rule matched: fall back to the ungated registration, if any.
  // A label with only gated registrations yields null outside its
  // gates rather than leaking into a foreign context.
  return labels.get(label) ?? null;
}

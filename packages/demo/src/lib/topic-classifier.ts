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
    // Ambiguous: store a rule, and set the map to a "needs disambiguation"
    // sentinel topic if not already set.
    const rules = disambig.get(label) ?? [];
    rules.push({ topic, features, inDetail });
    disambig.set(label, rules);
    // The Map entry stores the first topic registered as a fallback.
    if (!map.has(label)) {
      map.set(label, topic);
    }
  } else {
    // Unambiguous
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
    register(
      map,
      disambig,
      m.tickets_create_shortcut({}, opts),
      "filters",
      null,
      false,
    );

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

    // --- view-modes ---
    register(map, disambig, m.view_switcher_label({}, opts), "view-modes");
    register(map, disambig, m.view_switcher_table({}, opts), "view-modes");
    register(map, disambig, m.view_switcher_rows({}, opts), "view-modes");
    register(map, disambig, m.view_switcher_cards({}, opts), "view-modes");
    register(map, disambig, m.view_switcher_grid({}, opts), "view-modes");
    register(map, disambig, m.view_switcher_kanban({}, opts), "view-modes");

    // --- select-mode ---
    register(map, disambig, m.tickets_select_mode({}, opts), "select-mode");
    register(map, disambig, m.ticket_select_mode({}, opts), "select-mode");

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
    register(map, disambig, m.ticket_action_messages({}, opts), "timeline");

    // --- language ---
    register(map, disambig, m.language_picker_label({}, opts), "language");

    // --- dashboard-queues ---
    register(
      map,
      disambig,
      m.dashboard_queues_heading(terms, opts),
      "dashboard-queues",
    );

    // --- dashboard-activity ---
    register(
      map,
      disambig,
      m.dashboard_activity_heading({}, opts),
      "dashboard-activity",
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

    // --- settings-password ---
    register(map, disambig, m.settings_password({}, opts), "settings-password");

    // --- settings-2fa ---
    register(map, disambig, m.settings_2fa({}, opts), "settings-2fa");
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

  // Fast path: not in the map at all
  if (!labels.has(label)) return null;

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

  // No disambiguation rule matched: return the default map entry
  return labels.get(label) ?? null;
}

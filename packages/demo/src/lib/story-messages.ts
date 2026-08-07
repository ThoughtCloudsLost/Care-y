/**
 * Message-key resolution for demo story sections.
 *
 * Extracts the paraglide message lookup from StorySection.svelte into a
 * pure function so both StorySection and FlowStory can share it. The
 * locale parameter participates in reactive dependency tracking (the
 * caller reads it so Svelte re-runs when the locale changes).
 */

import * as m from "$lib/paraglide/messages.js";

const lookup: Record<string, () => string> = {
  // Section titles and descriptions
  demo_section_login_title: () => m.demo_section_login_title(),
  demo_section_login_desc: () => m.demo_section_login_desc(),
  demo_section_tickets_title: () => m.demo_section_tickets_title(),
  demo_section_tickets_desc: () => m.demo_section_tickets_desc(),
  demo_section_ticket_detail_title: () => m.demo_section_ticket_detail_title(),
  demo_section_ticket_detail_desc: () => m.demo_section_ticket_detail_desc(),
  demo_section_search_title: () => m.demo_section_search_title(),
  demo_section_search_desc: () => m.demo_section_search_desc(),

  // Login sub-sections
  demo_narrative_topic_credentials_heading: () =>
    m.demo_narrative_topic_credentials_heading(),
  demo_narrative_topic_credentials_body: () =>
    m.demo_narrative_topic_credentials_body(),
  demo_narrative_topic_twofa_heading: () =>
    m.demo_narrative_topic_twofa_heading(),
  demo_narrative_topic_twofa_body: () => m.demo_narrative_topic_twofa_body(),
  demo_narrative_topic_twofa_totp_heading: () =>
    m.demo_narrative_topic_twofa_totp_heading(),
  demo_narrative_topic_twofa_totp_body: () =>
    m.demo_narrative_topic_twofa_totp_body(),
  demo_narrative_topic_twofa_passkey_heading: () =>
    m.demo_narrative_topic_twofa_passkey_heading(),
  demo_narrative_topic_twofa_passkey_body: () =>
    m.demo_narrative_topic_twofa_passkey_body(),
  demo_narrative_topic_twofa_email_heading: () =>
    m.demo_narrative_topic_twofa_email_heading(),
  demo_narrative_topic_twofa_email_body: () =>
    m.demo_narrative_topic_twofa_email_body(),
  demo_narrative_topic_twofa_sms_heading: () =>
    m.demo_narrative_topic_twofa_sms_heading(),
  demo_narrative_topic_twofa_sms_body: () =>
    m.demo_narrative_topic_twofa_sms_body(),
  demo_narrative_topic_twofa_push_heading: () =>
    m.demo_narrative_topic_twofa_push_heading(),
  demo_narrative_topic_twofa_push_body: () =>
    m.demo_narrative_topic_twofa_push_body(),
  demo_narrative_topic_twofa_backup_heading: () =>
    m.demo_narrative_topic_twofa_backup_heading(),
  demo_narrative_topic_twofa_backup_body: () =>
    m.demo_narrative_topic_twofa_backup_body(),
  demo_narrative_topic_key_derivation_heading: () =>
    m.demo_narrative_topic_key_derivation_heading(),
  demo_narrative_topic_key_derivation_body: () =>
    m.demo_narrative_topic_key_derivation_body(),

  // Tickets sub-sections
  demo_narrative_topic_sort_heading: () =>
    m.demo_narrative_topic_sort_heading(),
  demo_narrative_topic_sort_body: () => m.demo_narrative_topic_sort_body(),
  demo_narrative_topic_filters_heading: () =>
    m.demo_narrative_topic_filters_heading(),
  demo_narrative_topic_filters_body: () =>
    m.demo_narrative_topic_filters_body(),
  demo_narrative_topic_view_modes_heading: () =>
    m.demo_narrative_topic_view_modes_heading(),
  demo_narrative_topic_view_modes_body: () =>
    m.demo_narrative_topic_view_modes_body(),
  demo_narrative_topic_select_mode_heading: () =>
    m.demo_narrative_topic_select_mode_heading(),
  demo_narrative_topic_select_mode_body: () =>
    m.demo_narrative_topic_select_mode_body(),
  demo_narrative_topic_new_ticket_heading: () =>
    m.demo_narrative_topic_new_ticket_heading(),
  demo_narrative_topic_new_ticket_body: () =>
    m.demo_narrative_topic_new_ticket_body(),

  // Ticket detail sub-sections
  demo_narrative_topic_thread_filters_heading: () =>
    m.demo_narrative_topic_thread_filters_heading(),
  demo_narrative_topic_thread_filters_body: () =>
    m.demo_narrative_topic_thread_filters_body(),
  demo_narrative_topic_compose_actions_heading: () =>
    m.demo_narrative_topic_compose_actions_heading(),
  demo_narrative_topic_compose_actions_body: () =>
    m.demo_narrative_topic_compose_actions_body(),
  demo_narrative_topic_reply_heading: () =>
    m.demo_narrative_topic_reply_heading(),
  demo_narrative_topic_reply_body: () => m.demo_narrative_topic_reply_body(),
  demo_narrative_topic_notes_heading: () =>
    m.demo_narrative_topic_notes_heading(),
  demo_narrative_topic_notes_body: () => m.demo_narrative_topic_notes_body(),
  demo_narrative_topic_case_fold_heading: () =>
    m.demo_narrative_topic_case_fold_heading(),
  demo_narrative_topic_case_fold_body: () =>
    m.demo_narrative_topic_case_fold_body(),
  demo_narrative_topic_timeline_heading: () =>
    m.demo_narrative_topic_timeline_heading(),
  demo_narrative_topic_timeline_body: () =>
    m.demo_narrative_topic_timeline_body(),
  demo_narrative_topic_language_heading: () =>
    m.demo_narrative_topic_language_heading(),
  demo_narrative_topic_language_body: () =>
    m.demo_narrative_topic_language_body(),

  // Search
  demo_narrative_search_heading: () => m.demo_narrative_search_heading(),
  demo_narrative_search_body: () => m.demo_narrative_search_body(),

  // Dashboard
  demo_section_dashboard_title: () => m.demo_section_dashboard_title(),
  demo_section_dashboard_desc: () => m.demo_section_dashboard_desc(),
  demo_narrative_dashboard_heading: () => m.demo_narrative_dashboard_heading(),
  demo_narrative_dashboard_body: () => m.demo_narrative_dashboard_body(),
  demo_narrative_topic_dashboard_queues_heading: () =>
    m.demo_narrative_topic_dashboard_queues_heading(),
  demo_narrative_topic_dashboard_queues_body: () =>
    m.demo_narrative_topic_dashboard_queues_body(),
  demo_narrative_topic_dashboard_activity_heading: () =>
    m.demo_narrative_topic_dashboard_activity_heading(),
  demo_narrative_topic_dashboard_activity_body: () =>
    m.demo_narrative_topic_dashboard_activity_body(),

  // Library
  demo_section_library_title: () => m.demo_section_library_title(),
  demo_section_library_desc: () => m.demo_section_library_desc(),
  demo_narrative_library_heading: () => m.demo_narrative_library_heading(),
  demo_narrative_library_body: () => m.demo_narrative_library_body(),
  demo_narrative_topic_library_vote_heading: () =>
    m.demo_narrative_topic_library_vote_heading(),
  demo_narrative_topic_library_vote_body: () =>
    m.demo_narrative_topic_library_vote_body(),
  demo_narrative_topic_library_categories_heading: () =>
    m.demo_narrative_topic_library_categories_heading(),
  demo_narrative_topic_library_categories_body: () =>
    m.demo_narrative_topic_library_categories_body(),
  demo_narrative_topic_library_editor_heading: () =>
    m.demo_narrative_topic_library_editor_heading(),
  demo_narrative_topic_library_editor_body: () =>
    m.demo_narrative_topic_library_editor_body(),

  // Admin
  demo_section_admin_title: () => m.demo_section_admin_title(),
  demo_section_admin_desc: () => m.demo_section_admin_desc(),
  demo_narrative_admin_heading: () => m.demo_narrative_admin_heading(),
  demo_narrative_admin_body: () => m.demo_narrative_admin_body(),
  demo_narrative_admin_people_queues_heading: () =>
    m.demo_narrative_admin_people_queues_heading(),
  demo_narrative_admin_people_queues_body: () =>
    m.demo_narrative_admin_people_queues_body(),
  demo_narrative_admin_org_config_keys_heading: () =>
    m.demo_narrative_admin_org_config_keys_heading(),
  demo_narrative_admin_org_config_keys_body: () =>
    m.demo_narrative_admin_org_config_keys_body(),
  demo_narrative_admin_communications_heading: () =>
    m.demo_narrative_admin_communications_heading(),
  demo_narrative_admin_communications_body: () =>
    m.demo_narrative_admin_communications_body(),
  demo_narrative_topic_admin_greetings_heading: () =>
    m.demo_narrative_topic_admin_greetings_heading(),
  demo_narrative_topic_admin_greetings_body: () =>
    m.demo_narrative_topic_admin_greetings_body(),
  demo_narrative_topic_admin_quarantine_heading: () =>
    m.demo_narrative_topic_admin_quarantine_heading(),
  demo_narrative_topic_admin_quarantine_body: () =>
    m.demo_narrative_topic_admin_quarantine_body(),

  // Schedule
  demo_section_schedule_title: () => m.demo_section_schedule_title(),
  demo_section_schedule_desc: () => m.demo_section_schedule_desc(),
  demo_narrative_schedule_heading: () => m.demo_narrative_schedule_heading(),
  demo_narrative_schedule_body: () => m.demo_narrative_schedule_body(),

  // Settings
  demo_section_settings_title: () => m.demo_section_settings_title(),
  demo_section_settings_desc: () => m.demo_section_settings_desc(),
  demo_narrative_settings_heading: () => m.demo_narrative_settings_heading(),
  demo_narrative_settings_body: () => m.demo_narrative_settings_body(),
  demo_narrative_settings_profile_identity_heading: () =>
    m.demo_narrative_settings_profile_identity_heading(),
  demo_narrative_settings_profile_identity_body: () =>
    m.demo_narrative_settings_profile_identity_body(),
  demo_narrative_settings_password_keys_heading: () =>
    m.demo_narrative_settings_password_keys_heading(),
  demo_narrative_settings_password_keys_body: () =>
    m.demo_narrative_settings_password_keys_body(),
  demo_narrative_settings_two_factor_methods_heading: () =>
    m.demo_narrative_settings_two_factor_methods_heading(),
  demo_narrative_settings_two_factor_methods_body: () =>
    m.demo_narrative_settings_two_factor_methods_body(),

  // Coming-soon placeholder
  demo_coming_soon_title: () => m.demo_coming_soon_title(),
  demo_coming_soon_desc: () => m.demo_coming_soon_desc(),
  demo_coming_soon_heading: () => m.demo_coming_soon_heading(),
  demo_coming_soon_body: () => m.demo_coming_soon_body(),

  // Entry page
  demo_entry_title: () => m.demo_entry_title(),
  demo_entry_desc: () => m.demo_entry_desc(),
  demo_entry_how_heading: () => m.demo_entry_how_heading(),
  demo_entry_how_body: () => m.demo_entry_how_body(),
  demo_entry_phone_heading: () => m.demo_entry_phone_heading(),
  demo_entry_phone_body: () => m.demo_entry_phone_body(),
  demo_entry_start_heading: () => m.demo_entry_start_heading(),
  demo_entry_start_body: () => m.demo_entry_start_body(),
};

/**
 * Resolve a message key string to its translated value.
 *
 * The locale parameter exists for reactive dependency tracking: callers
 * read it so Svelte knows to re-evaluate when the locale changes (the
 * paraglide runtime switches internally, but Svelte needs a signal).
 * Returns the key itself when unknown.
 */
export function resolveStoryMessage(key: string, locale: string): string {
  void locale;
  // eslint-disable-next-line security/detect-object-injection -- key is a message key from section config, not user input
  const fn = lookup[key];
  return fn !== undefined ? fn() : key;
}

// -----------------------------------------------------------------------
// Sub-item state derivation
//
// Shared between SectionRail and SectionIntro to keep the isActive /
// isSeen logic in one place.
// -----------------------------------------------------------------------

export interface SubItemState {
  readonly isActive: boolean;
  readonly isSeen: boolean;
}

/**
 * Derive the display state for a sub-section item.
 * Used by both the rail and the intro TOC.
 */
export function deriveSubState(
  subSlug: string,
  activeSub: string | null,
  subTopic: string | null,
  seenTopics: ReadonlySet<string>,
): SubItemState {
  return {
    isActive: activeSub === subSlug,
    isSeen: subTopic !== null && seenTopics.has(subTopic),
  };
}

/**
 * Resolve a parameterized message. Used for keys that accept substitution
 * parameters (for example demo_figure_aria_label with {sub}).
 */
export function resolveParameterizedMessage(
  key: string,
  params: Record<string, string>,
  locale: string,
): string {
  void locale;
  // The paraglide messages module exports typed functions, but the story
  // system works with string keys. The typed wrapper below covers the keys
  // the peek wiring actually needs. New parameterized keys must be added
  // here as they arise.
  switch (key) {
    case "demo_figure_aria_label": {
      const sub = params.sub ?? "";
      return m.demo_figure_aria_label({ sub });
    }
    case "demo_peek_back_to": {
      const section = params.section ?? "";
      return m.demo_peek_back_to({ section });
    }
    default:
      return key;
  }
}

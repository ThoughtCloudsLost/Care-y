/**
 * Message-key resolution for demo story sections.
 *
 * Extracts the paraglide message lookup from StorySection.svelte into a
 * pure function so both StorySection and FlowStory can share it. The
 * locale parameter participates in reactive dependency tracking (the
 * caller reads it so Svelte re-runs when the locale changes).
 */

import * as m from "$lib/paraglide/messages.js";
import type { Section } from "./scroll-sections.js";

const lookup: Record<string, () => string> = {
  // Story chrome that reaches the flow as a block of its own
  demo_narrative_tip: () => m.demo_narrative_tip(),

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
  demo_narrative_topic_saved_filters_heading: () =>
    m.demo_narrative_topic_saved_filters_heading(),
  demo_narrative_topic_saved_filters_body: () =>
    m.demo_narrative_topic_saved_filters_body(),
  demo_narrative_topic_view_modes_heading: () =>
    m.demo_narrative_topic_view_modes_heading(),
  demo_narrative_topic_view_modes_body: () =>
    m.demo_narrative_topic_view_modes_body(),
  demo_narrative_topic_select_mode_heading: () =>
    m.demo_narrative_topic_select_mode_heading(),
  demo_narrative_topic_select_mode_body: () =>
    m.demo_narrative_topic_select_mode_body(),
  demo_narrative_topic_quick_actions_heading: () =>
    m.demo_narrative_topic_quick_actions_heading(),
  demo_narrative_topic_quick_actions_body: () =>
    m.demo_narrative_topic_quick_actions_body(),
  demo_narrative_topic_unread_badges_heading: () =>
    m.demo_narrative_topic_unread_badges_heading(),
  demo_narrative_topic_unread_badges_body: () =>
    m.demo_narrative_topic_unread_badges_body(),
  demo_narrative_topic_decryption_heading: () =>
    m.demo_narrative_topic_decryption_heading(),
  demo_narrative_topic_decryption_body: () =>
    m.demo_narrative_topic_decryption_body(),
  demo_narrative_topic_new_ticket_heading: () =>
    m.demo_narrative_topic_new_ticket_heading(),
  demo_narrative_topic_new_ticket_body: () =>
    m.demo_narrative_topic_new_ticket_body(),
  demo_narrative_topic_split_view_heading: () =>
    m.demo_narrative_topic_split_view_heading(),
  demo_narrative_topic_split_view_body: () =>
    m.demo_narrative_topic_split_view_body(),

  // Ticket detail sub-sections
  demo_narrative_topic_case_header_heading: () =>
    m.demo_narrative_topic_case_header_heading(),
  demo_narrative_topic_case_header_body: () =>
    m.demo_narrative_topic_case_header_body(),
  demo_narrative_topic_conversation_heading: () =>
    m.demo_narrative_topic_conversation_heading(),
  demo_narrative_topic_conversation_body: () =>
    m.demo_narrative_topic_conversation_body(),
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
  demo_narrative_topic_deep_search_heading: () =>
    m.demo_narrative_topic_deep_search_heading(),
  demo_narrative_topic_deep_search_body: () =>
    m.demo_narrative_topic_deep_search_body(),
  demo_narrative_topic_message_actions_heading: () =>
    m.demo_narrative_topic_message_actions_heading(),
  demo_narrative_topic_message_actions_body: () =>
    m.demo_narrative_topic_message_actions_body(),
  demo_narrative_topic_close_reopen_heading: () =>
    m.demo_narrative_topic_close_reopen_heading(),
  demo_narrative_topic_close_reopen_body: () =>
    m.demo_narrative_topic_close_reopen_body(),
  demo_narrative_topic_exposure_hints_heading: () =>
    m.demo_narrative_topic_exposure_hints_heading(),
  demo_narrative_topic_exposure_hints_body: () =>
    m.demo_narrative_topic_exposure_hints_body(),
  demo_narrative_topic_language_heading: () =>
    m.demo_narrative_topic_language_heading(),
  demo_narrative_topic_language_body: () =>
    m.demo_narrative_topic_language_body(),

  // Tickets (new subs)
  demo_narrative_topic_list_stats_heading: () =>
    m.demo_narrative_topic_list_stats_heading(),
  demo_narrative_topic_list_stats_body: () =>
    m.demo_narrative_topic_list_stats_body(),
  demo_narrative_topic_list_search_heading: () =>
    m.demo_narrative_topic_list_search_heading(),
  demo_narrative_topic_list_search_body: () =>
    m.demo_narrative_topic_list_search_body(),

  // Ticket detail (new subs)
  demo_narrative_topic_date_separators_heading: () =>
    m.demo_narrative_topic_date_separators_heading(),
  demo_narrative_topic_date_separators_body: () =>
    m.demo_narrative_topic_date_separators_body(),
  demo_narrative_topic_system_events_heading: () =>
    m.demo_narrative_topic_system_events_heading(),
  demo_narrative_topic_system_events_body: () =>
    m.demo_narrative_topic_system_events_body(),
  demo_narrative_topic_voicemails_heading: () =>
    m.demo_narrative_topic_voicemails_heading(),
  demo_narrative_topic_voicemails_body: () =>
    m.demo_narrative_topic_voicemails_body(),
  demo_narrative_topic_media_images_heading: () =>
    m.demo_narrative_topic_media_images_heading(),
  demo_narrative_topic_media_images_body: () =>
    m.demo_narrative_topic_media_images_body(),
  demo_narrative_topic_files_heading: () =>
    m.demo_narrative_topic_files_heading(),
  demo_narrative_topic_files_body: () => m.demo_narrative_topic_files_body(),
  demo_narrative_topic_call_log_heading: () =>
    m.demo_narrative_topic_call_log_heading(),
  demo_narrative_topic_call_log_body: () =>
    m.demo_narrative_topic_call_log_body(),
  demo_narrative_topic_case_panel_heading: () =>
    m.demo_narrative_topic_case_panel_heading(),
  demo_narrative_topic_case_panel_body: () =>
    m.demo_narrative_topic_case_panel_body(),
  demo_narrative_topic_message_select_heading: () =>
    m.demo_narrative_topic_message_select_heading(),
  demo_narrative_topic_message_select_body: () =>
    m.demo_narrative_topic_message_select_body(),

  // Search
  demo_narrative_search_overlay_heading: () =>
    m.demo_narrative_search_overlay_heading(),
  demo_narrative_search_overlay_body: () =>
    m.demo_narrative_search_overlay_body(),
  demo_narrative_search_how_heading: () =>
    m.demo_narrative_search_how_heading(),
  demo_narrative_search_how_body: () => m.demo_narrative_search_how_body(),
  demo_narrative_search_entities_heading: () =>
    m.demo_narrative_search_entities_heading(),
  demo_narrative_search_entities_body: () =>
    m.demo_narrative_search_entities_body(),

  // Dashboard
  demo_section_dashboard_title: () => m.demo_section_dashboard_title(),
  demo_section_dashboard_desc: () => m.demo_section_dashboard_desc(),
  demo_narrative_dashboard_getting_started_heading: () =>
    m.demo_narrative_dashboard_getting_started_heading(),
  demo_narrative_dashboard_getting_started_body: () =>
    m.demo_narrative_dashboard_getting_started_body(),
  demo_narrative_dashboard_shift_heading: () =>
    m.demo_narrative_dashboard_shift_heading(),
  demo_narrative_dashboard_shift_body: () =>
    m.demo_narrative_dashboard_shift_body(),
  demo_narrative_dashboard_queues_heading: () =>
    m.demo_narrative_dashboard_queues_heading(),
  demo_narrative_dashboard_queues_body: () =>
    m.demo_narrative_dashboard_queues_body(),
  demo_narrative_dashboard_activity_heading: () =>
    m.demo_narrative_dashboard_activity_heading(),
  demo_narrative_dashboard_activity_body: () =>
    m.demo_narrative_dashboard_activity_body(),
  demo_narrative_dashboard_kb_heading: () =>
    m.demo_narrative_dashboard_kb_heading(),
  demo_narrative_dashboard_kb_body: () => m.demo_narrative_dashboard_kb_body(),
  demo_narrative_dashboard_view_switcher_heading: () =>
    m.demo_narrative_dashboard_view_switcher_heading(),
  demo_narrative_dashboard_view_switcher_body: () =>
    m.demo_narrative_dashboard_view_switcher_body(),
  demo_narrative_dashboard_needs_attention_heading: () =>
    m.demo_narrative_dashboard_needs_attention_heading(),
  demo_narrative_dashboard_needs_attention_body: () =>
    m.demo_narrative_dashboard_needs_attention_body(),
  demo_narrative_dashboard_my_tickets_heading: () =>
    m.demo_narrative_dashboard_my_tickets_heading(),
  demo_narrative_dashboard_my_tickets_body: () =>
    m.demo_narrative_dashboard_my_tickets_body(),
  demo_narrative_dashboard_unassigned_heading: () =>
    m.demo_narrative_dashboard_unassigned_heading(),
  demo_narrative_dashboard_unassigned_body: () =>
    m.demo_narrative_dashboard_unassigned_body(),
  demo_narrative_dashboard_on_hold_heading: () =>
    m.demo_narrative_dashboard_on_hold_heading(),
  demo_narrative_dashboard_on_hold_body: () =>
    m.demo_narrative_dashboard_on_hold_body(),
  demo_narrative_dashboard_create_heading: () =>
    m.demo_narrative_dashboard_create_heading(),
  demo_narrative_dashboard_create_body: () =>
    m.demo_narrative_dashboard_create_body(),

  // Library
  demo_section_library_title: () => m.demo_section_library_title(),
  demo_section_library_desc: () => m.demo_section_library_desc(),
  demo_narrative_library_browse_heading: () =>
    m.demo_narrative_library_browse_heading(),
  demo_narrative_library_browse_body: () =>
    m.demo_narrative_library_browse_body(),
  demo_narrative_library_detail_heading: () =>
    m.demo_narrative_library_detail_heading(),
  demo_narrative_library_detail_body: () =>
    m.demo_narrative_library_detail_body(),
  demo_narrative_library_attachments_heading: () =>
    m.demo_narrative_library_attachments_heading(),
  demo_narrative_library_attachments_body: () =>
    m.demo_narrative_library_attachments_body(),
  demo_narrative_topic_library_vote_heading: () =>
    m.demo_narrative_topic_library_vote_heading(),
  demo_narrative_topic_library_vote_body: () =>
    m.demo_narrative_topic_library_vote_body(),
  demo_narrative_topic_library_tools_heading: () =>
    m.demo_narrative_topic_library_tools_heading(),
  demo_narrative_topic_library_tools_body: () =>
    m.demo_narrative_topic_library_tools_body(),
  demo_narrative_topic_library_search_heading: () =>
    m.demo_narrative_topic_library_search_heading(),
  demo_narrative_topic_library_search_body: () =>
    m.demo_narrative_topic_library_search_body(),
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
  demo_section_admin_people_title: () => m.demo_section_admin_people_title(),
  demo_section_admin_people_desc: () => m.demo_section_admin_people_desc(),
  demo_section_admin_comms_title: () => m.demo_section_admin_comms_title(),
  demo_section_admin_comms_desc: () => m.demo_section_admin_comms_desc(),
  demo_section_admin_org_title: () => m.demo_section_admin_org_title(),
  demo_section_admin_org_desc: () => m.demo_section_admin_org_desc(),
  demo_narrative_admin_hub_heading: () => m.demo_narrative_admin_hub_heading(),
  demo_narrative_admin_hub_body: () => m.demo_narrative_admin_hub_body(),
  demo_narrative_admin_people_heading: () =>
    m.demo_narrative_admin_people_heading(),
  demo_narrative_admin_people_body: () => m.demo_narrative_admin_people_body(),
  demo_narrative_admin_roster_tools_heading: () =>
    m.demo_narrative_admin_roster_tools_heading(),
  demo_narrative_admin_roster_tools_body: () =>
    m.demo_narrative_admin_roster_tools_body(),
  demo_narrative_admin_queues_heading: () =>
    m.demo_narrative_admin_queues_heading(),
  demo_narrative_admin_queues_body: () => m.demo_narrative_admin_queues_body(),
  demo_narrative_admin_clients_heading: () =>
    m.demo_narrative_admin_clients_heading(),
  demo_narrative_admin_clients_body: () =>
    m.demo_narrative_admin_clients_body(),
  demo_narrative_admin_client_merge_heading: () =>
    m.demo_narrative_admin_client_merge_heading(),
  demo_narrative_admin_client_merge_body: () =>
    m.demo_narrative_admin_client_merge_body(),
  demo_narrative_admin_roles_heading: () =>
    m.demo_narrative_admin_roles_heading(),
  demo_narrative_admin_roles_body: () => m.demo_narrative_admin_roles_body(),
  demo_narrative_admin_telephony_provider_heading: () =>
    m.demo_narrative_admin_telephony_provider_heading(),
  demo_narrative_admin_telephony_provider_body: () =>
    m.demo_narrative_admin_telephony_provider_body(),
  demo_narrative_admin_general_heading: () =>
    m.demo_narrative_admin_general_heading(),
  demo_narrative_admin_general_body: () =>
    m.demo_narrative_admin_general_body(),
  demo_narrative_admin_branding_heading: () =>
    m.demo_narrative_admin_branding_heading(),
  demo_narrative_admin_branding_body: () =>
    m.demo_narrative_admin_branding_body(),
  demo_narrative_admin_terminology_heading: () =>
    m.demo_narrative_admin_terminology_heading(),
  demo_narrative_admin_terminology_body: () =>
    m.demo_narrative_admin_terminology_body(),
  demo_narrative_admin_note_types_heading: () =>
    m.demo_narrative_admin_note_types_heading(),
  demo_narrative_admin_note_types_body: () =>
    m.demo_narrative_admin_note_types_body(),
  demo_narrative_admin_keys_heading: () =>
    m.demo_narrative_admin_keys_heading(),
  demo_narrative_admin_keys_body: () => m.demo_narrative_admin_keys_body(),
  demo_narrative_admin_retention_heading: () =>
    m.demo_narrative_admin_retention_heading(),
  demo_narrative_admin_retention_body: () =>
    m.demo_narrative_admin_retention_body(),
  demo_narrative_admin_phone_lines_heading: () =>
    m.demo_narrative_admin_phone_lines_heading(),
  demo_narrative_admin_phone_lines_body: () =>
    m.demo_narrative_admin_phone_lines_body(),
  demo_narrative_admin_greetings_heading: () =>
    m.demo_narrative_admin_greetings_heading(),
  demo_narrative_admin_greetings_body: () =>
    m.demo_narrative_admin_greetings_body(),
  demo_narrative_admin_sms_templates_heading: () =>
    m.demo_narrative_admin_sms_templates_heading(),
  demo_narrative_admin_sms_templates_body: () =>
    m.demo_narrative_admin_sms_templates_body(),
  demo_narrative_admin_blocklist_heading: () =>
    m.demo_narrative_admin_blocklist_heading(),
  demo_narrative_admin_blocklist_body: () =>
    m.demo_narrative_admin_blocklist_body(),
  demo_narrative_admin_quarantine_heading: () =>
    m.demo_narrative_admin_quarantine_heading(),
  demo_narrative_admin_quarantine_body: () =>
    m.demo_narrative_admin_quarantine_body(),

  // Schedule
  demo_section_schedule_title: () => m.demo_section_schedule_title(),
  demo_section_schedule_desc: () => m.demo_section_schedule_desc(),
  demo_narrative_schedule_heading: () => m.demo_narrative_schedule_heading(),
  demo_narrative_schedule_body: () => m.demo_narrative_schedule_body(),

  // Settings
  demo_section_settings_title: () => m.demo_section_settings_title(),
  demo_section_settings_desc: () => m.demo_section_settings_desc(),
  demo_narrative_settings_identity_heading: () =>
    m.demo_narrative_settings_identity_heading(),
  demo_narrative_settings_identity_body: () =>
    m.demo_narrative_settings_identity_body(),
  demo_narrative_settings_password_heading: () =>
    m.demo_narrative_settings_password_heading(),
  demo_narrative_settings_password_body: () =>
    m.demo_narrative_settings_password_body(),
  demo_narrative_settings_twofa_heading: () =>
    m.demo_narrative_settings_twofa_heading(),
  demo_narrative_settings_twofa_body: () =>
    m.demo_narrative_settings_twofa_body(),
  demo_narrative_settings_appearance_heading: () =>
    m.demo_narrative_settings_appearance_heading(),
  demo_narrative_settings_appearance_body: () =>
    m.demo_narrative_settings_appearance_body(),
  demo_narrative_settings_security_heading: () =>
    m.demo_narrative_settings_security_heading(),
  demo_narrative_settings_security_body: () =>
    m.demo_narrative_settings_security_body(),

  // Coming-soon placeholder
  demo_coming_soon_title: () => m.demo_coming_soon_title(),
  demo_coming_soon_desc: () => m.demo_coming_soon_desc(),
  demo_coming_soon_heading: () => m.demo_coming_soon_heading(),
  demo_coming_soon_body: () => m.demo_coming_soon_body(),

  // Entry page
  demo_entry_title: () => m.demo_entry_title(),
  demo_entry_desc: () => m.demo_entry_desc(),
  demo_entry_nav_heading: () => m.demo_entry_nav_heading(),
  demo_entry_nav_body: () => m.demo_entry_nav_body(),
  demo_entry_controls_heading: () => m.demo_entry_controls_heading(),
  demo_entry_controls_body: () => m.demo_entry_controls_body(),
  demo_entry_flow_heading: () => m.demo_entry_flow_heading(),
  demo_entry_flow_body: () => m.demo_entry_flow_body(),
  demo_entry_roles_heading: () => m.demo_entry_roles_heading(),
  demo_entry_roles_body: () => m.demo_entry_roles_body(),
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
  if (fn !== undefined) return fn();
  if (import.meta.env.DEV) {
    // Surface missing keys during development so they do not silently
    // render literal demo_* strings to visitors.
    console.warn(`[story-messages] missing lookup key: "${key}"`);
  }
  return key;
}

// -----------------------------------------------------------------------
// Sub-item state derivation
//
// Shared between SectionRail and SectionStrip to keep the isActive /
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

// -----------------------------------------------------------------------
// Section-level state derivation
//
// Used by TopBar's contents picker to show per-section progress.
// -----------------------------------------------------------------------

export interface SectionState {
  readonly seenCount: number;
  readonly topicCount: number;
  readonly complete: boolean;
}

/**
 * Derive the progress state for an entire section by counting its
 * topic-bearing subs against the set of seen topics.
 */
export function deriveSectionState(
  section: Section,
  seenTopics: ReadonlySet<string>,
): SectionState {
  let seenCount = 0;
  let topicCount = 0;
  for (const sub of section.subs) {
    if (sub.topic !== null) {
      topicCount++;
      if (seenTopics.has(sub.topic)) seenCount++;
    }
  }
  return {
    seenCount,
    topicCount,
    complete: topicCount > 0 && seenCount === topicCount,
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

/**
 * Aggregation page definitions: curated cross-section reference views.
 *
 * Each page collects labelled seam stretches (bold-prefixed paragraphs)
 * from across the handbook into a focused reference view. The page
 * definitions live here; the corpus that resolves refs lives in
 * handbook-corpus.ts.
 *
 * This module must not import the excursion store (circular risk).
 * The type is defined here and re-exported from excursion.svelte.ts.
 */

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type AggregationPageId =
  "encryption" | "server-holds" | "who-sees" | "cannot-prove" | "searching";

export type AggSection =
  | {
      readonly kind: "stretches";
      readonly headingKey?: string;
      readonly refs: readonly string[];
    }
  | { readonly kind: "prose"; readonly key: string }
  | { readonly kind: "matrix" }
  | { readonly kind: "search" };

export interface AggPageDef {
  readonly id: AggregationPageId;
  readonly titleKey: string;
  readonly introKey: string;
  readonly sections: readonly AggSection[];
}

// -----------------------------------------------------------------------
// Page definitions
//
// Each ref is "messageKey#lineIdx". Every ref must resolve via
// getCorpusEntry("en", key, lineIdx) to a non-null entry with a
// non-null label. The test enforces this contract.
// -----------------------------------------------------------------------

const PAGES: readonly AggPageDef[] = [
  {
    id: "encryption",
    titleKey: "demo_agg_encryption_title",
    introKey: "demo_agg_encryption_intro",
    sections: [
      {
        kind: "stretches",
        refs: [
          // Login / key derivation
          "demo_narrative_topic_key_derivation_body#1",
          // Ticket list
          "demo_narrative_topic_quick_actions_body#4",
          // Ticket detail
          "demo_narrative_topic_case_fold_body#2",
          "demo_narrative_topic_case_panel_body#4",
          "demo_narrative_topic_timeline_body#2",
          "demo_narrative_topic_share_link_body#3",
          // Dashboard
          "demo_narrative_dashboard_queues_body#3",
          "demo_narrative_dashboard_activity_body#1",
          "demo_narrative_dashboard_kb_body#1",
          // Library
          "demo_narrative_library_attachments_body#1",
          "demo_narrative_topic_library_editor_body#4",
          // Settings
          "demo_narrative_settings_consultant_phone_body#2",
          // Admin
          "demo_narrative_admin_queues_body#2",
          "demo_narrative_admin_clients_body#1",
          "demo_narrative_admin_terminology_body#2",
          "demo_narrative_admin_intake_forms_body#2",
          "demo_narrative_admin_blocklist_body#1",
          "demo_narrative_admin_quarantine_body#1",
          "demo_narrative_admin_form_builder_body#3",
          "demo_narrative_admin_form_responses_body#1",
          // Client
          "demo_narrative_client_intake_fields_body#3",
          "demo_narrative_client_portal_thread_body#1",
          "demo_narrative_client_portal_composer_body#2",
          "demo_narrative_client_portal_upgrade_body#3",
          "demo_narrative_client_account_thread_body#1",
          "demo_narrative_client_account_settings_body#1",
        ],
      },
    ],
  },
  {
    id: "server-holds",
    titleKey: "demo_agg_server_holds_title",
    introKey: "demo_agg_server_holds_intro",
    sections: [
      {
        kind: "stretches",
        refs: [
          // What the server holds
          "demo_narrative_topic_credentials_body#1",
          "demo_narrative_topic_twofa_email_body#1",
          "demo_narrative_topic_twofa_sms_body#1",
          "demo_narrative_topic_twofa_backup_body#1",
          "demo_narrative_topic_key_derivation_body#1",
          "demo_narrative_admin_branding_body#1",
          "demo_narrative_admin_telephony_provider_body#2",
          "demo_narrative_admin_audit_log_body#1",
          "demo_narrative_admin_form_settings_body#1",
          "demo_narrative_client_intake_submit_body#2",
          // Privacy (what the server never learns)
          "demo_narrative_topic_language_body#1",
          "demo_narrative_topic_deep_search_body#2",
          "demo_narrative_topic_library_search_body#2",
          "demo_narrative_topic_message_select_body#2",
          "demo_narrative_client_share_exposure_body#0",
        ],
      },
    ],
  },
  {
    id: "who-sees",
    titleKey: "demo_agg_who_sees_title",
    introKey: "demo_agg_who_sees_intro",
    sections: [
      {
        kind: "stretches",
        refs: [
          // Permissions
          "demo_narrative_topic_new_ticket_body#2",
          "demo_narrative_admin_hub_body#2",
          "demo_narrative_admin_people_body#3",
          "demo_narrative_admin_roles_body#1",
          "demo_narrative_admin_queues_body#3",
          "demo_narrative_admin_clients_body#3",
          "demo_narrative_admin_client_merge_body#3",
          "demo_narrative_admin_general_body#3",
          "demo_narrative_admin_keys_body#3",
          "demo_narrative_admin_retention_body#2",
          "demo_narrative_admin_channel_policy_body#3",
          "demo_narrative_admin_form_responses_body#2",
          // Visibility
          "demo_narrative_topic_notes_body#2",
          "demo_narrative_dashboard_getting_started_body#2",
          "demo_narrative_admin_clients_body#2",
          "demo_narrative_admin_note_types_body#3",
          "demo_narrative_dashboard_needs_attention_body#2",
          "demo_narrative_dashboard_on_hold_body#1",
        ],
      },
      {
        kind: "matrix",
      },
    ],
  },
  {
    id: "cannot-prove",
    titleKey: "demo_agg_cannot_prove_title",
    introKey: "demo_agg_cannot_prove_intro",
    sections: [
      { kind: "prose", key: "demo_agg_cannot_prove_section1" },
      { kind: "prose", key: "demo_agg_cannot_prove_section2" },
      { kind: "prose", key: "demo_agg_cannot_prove_section3" },
    ],
  },
  {
    id: "searching",
    titleKey: "demo_agg_searching_title",
    introKey: "demo_agg_searching_intro",
    sections: [
      { kind: "search" },
      {
        kind: "stretches",
        refs: [
          // Search section
          "demo_narrative_search_overlay_body#1",
          "demo_narrative_search_overlay_body#2",
          "demo_narrative_search_overlay_body#3",
          "demo_narrative_search_how_body#1",
          "demo_narrative_search_how_body#2",
          "demo_narrative_search_how_body#3",
          "demo_narrative_search_entities_body#1",
          "demo_narrative_search_entities_body#2",
          "demo_narrative_search_entities_body#3",
          // List search
          "demo_narrative_topic_list_search_body#1",
          "demo_narrative_topic_list_search_body#2",
          // Deep search in detail
          "demo_narrative_topic_deep_search_body#1",
          "demo_narrative_topic_deep_search_body#2",
          // Library search
          "demo_narrative_topic_library_search_body#1",
          "demo_narrative_topic_library_search_body#2",
        ],
      },
    ],
  },
];

// -----------------------------------------------------------------------
// Lookup
// -----------------------------------------------------------------------

const pageIndex = new Map<AggregationPageId, AggPageDef>(
  PAGES.map((p) => [p.id, p]),
);

export { PAGES };

export function getAggPage(id: AggregationPageId): AggPageDef | undefined {
  return pageIndex.get(id);
}

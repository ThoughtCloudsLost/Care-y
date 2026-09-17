/**
 * Permission grouping for the aggregation permission matrix.
 *
 * Mirrors the eight capability-area groups defined in
 * packages/shared/src/roles.ts and used by the product's
 * RolePermissionsSection.svelte. Label keys reuse the existing
 * roles_group_* paraglide messages.
 *
 * Pure data only. No DOM, no Svelte runes.
 */

import { Permission } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";

// -----------------------------------------------------------------------
// Group definitions
// -----------------------------------------------------------------------

export interface PermissionGroupDef {
  readonly labelFn: () => string;
  readonly permissions: readonly Permission[];
}

export const GROUPS: readonly PermissionGroupDef[] = [
  {
    labelFn: () => m.roles_group_case_record(),
    permissions: [
      Permission.VIEW_CASES,
      Permission.OPEN_CASES,
      Permission.EDIT_CASE_SUMMARY,
      Permission.WRITE_CASE_NOTES,
      Permission.CHANGE_CASE_STATUS,
      Permission.LINK_CASES,
      Permission.CLAIM_CASES,
      Permission.ASSIGN_CASES,
      Permission.DELETE_OTHERS_NOTES,
      Permission.DOWNLOAD_CASE_MEDIA,
    ],
  },
  {
    labelFn: () => m.roles_group_reaching_client(),
    permissions: [
      Permission.SEND_CLIENT_SMS,
      Permission.SEND_CLIENT_MEDIA,
      Permission.SEND_CLIENT_EMAIL,
      Permission.CALL_CLIENTS,
      Permission.MESSAGE_CLIENTS_IN_PORTAL,
    ],
  },
  {
    labelFn: () => m.roles_group_client_access(),
    permissions: [
      Permission.MANAGE_SHARE_LINKS,
      Permission.MANAGE_PORTAL_CHANNEL,
      Permission.RESET_CLIENT_LOGIN,
      Permission.REVOKE_REPLY_LINKS,
    ],
  },
  {
    labelFn: () => m.roles_group_client_records(),
    permissions: [
      Permission.VIEW_CLIENTS,
      Permission.VIEW_CLIENT_PII,
      Permission.EDIT_CLIENT_CONTACT,
      Permission.EDIT_CLIENT_ALIAS,
      Permission.MERGE_CLIENTS,
      Permission.DELETE_CLIENTS,
    ],
  },
  {
    labelFn: () => m.roles_group_knowledge_base(),
    permissions: [
      Permission.VIEW_KNOWLEDGE_BASE,
      Permission.EDIT_KNOWLEDGE_BASE,
      Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
      Permission.DELETE_KNOWLEDGE_BASE_ARTICLES,
    ],
  },
  {
    labelFn: () => m.roles_group_queues(),
    permissions: [
      Permission.MANAGE_QUEUES,
      Permission.MANAGE_QUEUE_MEMBERSHIP,
      Permission.MANAGE_QUEUE_NOTIFICATIONS,
    ],
  },
  {
    labelFn: () => m.roles_group_intake(),
    permissions: [
      Permission.MANAGE_INTAKE_FORMS,
      Permission.VIEW_INTAKE_RESPONSES,
    ],
  },
  {
    labelFn: () => m.roles_group_running_org(),
    permissions: [
      Permission.MANAGE_ROLES,
      Permission.MANAGE_USERS,
      Permission.MANAGE_ORG_IDENTITY,
      Permission.MANAGE_CHANNEL_ROUTING,
      Permission.MANAGE_RETENTION,
      Permission.MANAGE_NOTE_TYPES,
      Permission.MANAGE_KEYS,
      Permission.MANAGE_INFRASTRUCTURE,
      Permission.WRITE_CALL_GREETINGS,
      Permission.WRITE_AUTOMATIC_REPLIES,
      Permission.MANAGE_VOICEMAIL_QUARANTINE,
      Permission.MANAGE_ESCALATION,
      Permission.MANAGE_PRESETS,
      Permission.VIEW_REPORTS,
      Permission.VIEW_AUDIT_LOG,
      Permission.VIEW_OWN_SHIFTS,
    ],
  },
];

// -----------------------------------------------------------------------
// Permission label/hint map
//
// Static lookup so no dynamic m[key] access is needed. Each entry
// pairs a Permission enum member with its label function and an
// optional hint function (null when no _hint key exists).
// -----------------------------------------------------------------------

export interface PermissionLabelEntry {
  readonly labelFn: () => string;
  readonly hintFn: (() => string) | null;
}

export const PERMISSION_LABELS: ReadonlyMap<Permission, PermissionLabelEntry> =
  new Map<Permission, PermissionLabelEntry>([
    // The case record
    [
      Permission.VIEW_CASES,
      { labelFn: () => m.permission_view_cases(), hintFn: null },
    ],
    [
      Permission.OPEN_CASES,
      { labelFn: () => m.permission_open_cases(), hintFn: null },
    ],
    [
      Permission.EDIT_CASE_SUMMARY,
      { labelFn: () => m.permission_edit_case_summary(), hintFn: null },
    ],
    [
      Permission.WRITE_CASE_NOTES,
      { labelFn: () => m.permission_write_case_notes(), hintFn: null },
    ],
    [
      Permission.CHANGE_CASE_STATUS,
      { labelFn: () => m.permission_change_case_status(), hintFn: null },
    ],
    [
      Permission.LINK_CASES,
      { labelFn: () => m.permission_link_cases(), hintFn: null },
    ],
    [
      Permission.CLAIM_CASES,
      { labelFn: () => m.permission_claim_cases(), hintFn: null },
    ],
    [
      Permission.ASSIGN_CASES,
      { labelFn: () => m.permission_assign_cases(), hintFn: null },
    ],
    [
      Permission.DELETE_OTHERS_NOTES,
      { labelFn: () => m.permission_delete_others_notes(), hintFn: null },
    ],
    [
      Permission.DOWNLOAD_CASE_MEDIA,
      { labelFn: () => m.permission_download_case_media(), hintFn: null },
    ],
    // Reaching a client
    [
      Permission.SEND_CLIENT_SMS,
      { labelFn: () => m.permission_send_client_sms(), hintFn: null },
    ],
    [
      Permission.SEND_CLIENT_MEDIA,
      { labelFn: () => m.permission_send_client_media(), hintFn: null },
    ],
    [
      Permission.SEND_CLIENT_EMAIL,
      { labelFn: () => m.permission_send_client_email(), hintFn: null },
    ],
    [
      Permission.CALL_CLIENTS,
      { labelFn: () => m.permission_call_clients(), hintFn: null },
    ],
    [
      Permission.MESSAGE_CLIENTS_IN_PORTAL,
      { labelFn: () => m.permission_message_clients_in_portal(), hintFn: null },
    ],
    // Client's access to the case
    [
      Permission.MANAGE_SHARE_LINKS,
      { labelFn: () => m.permission_manage_share_links(), hintFn: null },
    ],
    [
      Permission.MANAGE_PORTAL_CHANNEL,
      { labelFn: () => m.permission_manage_portal_channel(), hintFn: null },
    ],
    [
      Permission.RESET_CLIENT_LOGIN,
      { labelFn: () => m.permission_reset_client_login(), hintFn: null },
    ],
    [
      Permission.REVOKE_REPLY_LINKS,
      { labelFn: () => m.permission_revoke_reply_links(), hintFn: null },
    ],
    // Client records
    [
      Permission.VIEW_CLIENTS,
      { labelFn: () => m.permission_view_clients(), hintFn: null },
    ],
    [
      Permission.VIEW_CLIENT_PII,
      { labelFn: () => m.permission_view_client_pii(), hintFn: null },
    ],
    [
      Permission.EDIT_CLIENT_CONTACT,
      { labelFn: () => m.permission_edit_client_contact(), hintFn: null },
    ],
    [
      Permission.EDIT_CLIENT_ALIAS,
      { labelFn: () => m.permission_edit_client_alias(), hintFn: null },
    ],
    [
      Permission.MERGE_CLIENTS,
      { labelFn: () => m.permission_merge_clients(), hintFn: null },
    ],
    [
      Permission.DELETE_CLIENTS,
      { labelFn: () => m.permission_delete_clients(), hintFn: null },
    ],
    // Knowledge base
    [
      Permission.VIEW_KNOWLEDGE_BASE,
      { labelFn: () => m.permission_view_knowledge_base(), hintFn: null },
    ],
    [
      Permission.EDIT_KNOWLEDGE_BASE,
      { labelFn: () => m.permission_edit_knowledge_base(), hintFn: null },
    ],
    [
      Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
      {
        labelFn: () => m.permission_manage_knowledge_base_categories(),
        hintFn: null,
      },
    ],
    [
      Permission.DELETE_KNOWLEDGE_BASE_ARTICLES,
      {
        labelFn: () => m.permission_delete_knowledge_base_articles(),
        hintFn: null,
      },
    ],
    // Queues
    [
      Permission.MANAGE_QUEUES,
      { labelFn: () => m.permission_manage_queues(), hintFn: null },
    ],
    [
      Permission.MANAGE_QUEUE_MEMBERSHIP,
      {
        labelFn: () => m.permission_manage_queue_membership(),
        hintFn: () => m.permission_manage_queue_membership_hint(),
      },
    ],
    [
      Permission.MANAGE_QUEUE_NOTIFICATIONS,
      {
        labelFn: () => m.permission_manage_queue_notifications(),
        hintFn: null,
      },
    ],
    // Intake
    [
      Permission.MANAGE_INTAKE_FORMS,
      { labelFn: () => m.permission_manage_intake_forms(), hintFn: null },
    ],
    [
      Permission.VIEW_INTAKE_RESPONSES,
      {
        labelFn: () => m.permission_view_intake_responses(),
        hintFn: () => m.permission_view_intake_responses_hint(),
      },
    ],
    // Running the organisation
    [
      Permission.MANAGE_ROLES,
      { labelFn: () => m.permission_manage_roles(), hintFn: null },
    ],
    [
      Permission.MANAGE_USERS,
      { labelFn: () => m.permission_manage_users(), hintFn: null },
    ],
    [
      Permission.MANAGE_ORG_IDENTITY,
      { labelFn: () => m.permission_manage_org_identity(), hintFn: null },
    ],
    [
      Permission.MANAGE_CHANNEL_ROUTING,
      { labelFn: () => m.permission_manage_channel_routing(), hintFn: null },
    ],
    [
      Permission.MANAGE_RETENTION,
      { labelFn: () => m.permission_manage_retention(), hintFn: null },
    ],
    [
      Permission.MANAGE_NOTE_TYPES,
      { labelFn: () => m.permission_manage_note_types(), hintFn: null },
    ],
    [
      Permission.MANAGE_KEYS,
      { labelFn: () => m.permission_manage_keys(), hintFn: null },
    ],
    [
      Permission.MANAGE_INFRASTRUCTURE,
      { labelFn: () => m.permission_manage_infrastructure(), hintFn: null },
    ],
    [
      Permission.WRITE_CALL_GREETINGS,
      { labelFn: () => m.permission_write_call_greetings(), hintFn: null },
    ],
    [
      Permission.WRITE_AUTOMATIC_REPLIES,
      { labelFn: () => m.permission_write_automatic_replies(), hintFn: null },
    ],
    [
      Permission.MANAGE_VOICEMAIL_QUARANTINE,
      {
        labelFn: () => m.permission_manage_voicemail_quarantine(),
        hintFn: null,
      },
    ],
    [
      Permission.MANAGE_ESCALATION,
      { labelFn: () => m.permission_manage_escalation(), hintFn: null },
    ],
    [
      Permission.MANAGE_PRESETS,
      { labelFn: () => m.permission_manage_presets(), hintFn: null },
    ],
    [
      Permission.VIEW_REPORTS,
      { labelFn: () => m.permission_view_reports(), hintFn: null },
    ],
    [
      Permission.VIEW_AUDIT_LOG,
      { labelFn: () => m.permission_view_audit_log(), hintFn: null },
    ],
    [
      Permission.VIEW_OWN_SHIFTS,
      { labelFn: () => m.permission_view_own_shifts(), hintFn: null },
    ],
  ]);

// -----------------------------------------------------------------------
// Locked permissions
// -----------------------------------------------------------------------

/** Permissions that cannot be reassigned from the Admin role. */
export const LOCKED_PERMISSIONS: ReadonlySet<Permission> = new Set([
  Permission.MANAGE_KEYS,
  Permission.MANAGE_ROLES,
  Permission.MANAGE_INFRASTRUCTURE,
]);

/**
 * Opaque role identifiers stored in the DB.
 * These are deliberately non-descriptive to prevent DB-only attackers
 * from inferring org structure. The mapping to permissions lives in
 * server-side config (packages/server/src/auth/roles.ts).
 *
 * IMPORTANT: Once deployed, these values must never change.
 * The crypto package will encrypt a copy for UI display names.
 */
export const RoleId = {
  VOLUNTEER: "dXwG0zR9BtJp",
  MANAGER: "In1gn8l4eAyp",
  ADMIN: "POFKWG7erXEJ",
} as const;

export type RoleIdValue = (typeof RoleId)[keyof typeof RoleId];

/** All valid role ID values, for Zod validation. */
export const ROLE_ID_VALUES: readonly RoleIdValue[] = [
  RoleId.VOLUNTEER,
  RoleId.MANAGER,
  RoleId.ADMIN,
];

/** Non-empty tuple form required by z.enum(). */
export const ROLE_ID_VALUES_TUPLE: [RoleIdValue, ...RoleIdValue[]] = [
  RoleId.VOLUNTEER,
  RoleId.MANAGER,
  RoleId.ADMIN,
];

/** Hierarchy levels for role comparison. Add new roles here. */
export const ROLE_LEVEL: ReadonlyMap<string, number> = new Map<string, number>([
  [RoleId.VOLUNTEER, 1],
  [RoleId.MANAGER, 2],
  [RoleId.ADMIN, 3],
]);

/**
 * Returns true if the user's role meets or exceeds the minimum required role.
 * Named parameters because both sides are role ids: swapping them inverts
 * the comparison and grants access instead of denying it.
 */
export function meetsRoleThreshold(params: {
  userRoleId: string;
  minRoleId: string;
}): boolean {
  const userLevel = ROLE_LEVEL.get(params.userRoleId) ?? 0;
  const minLevel = ROLE_LEVEL.get(params.minRoleId) ?? 0;
  return userLevel >= minLevel;
}

/** Returns true if the given minimum role is above the base volunteer level. */
export function isRoleRestricted(minRoleId: string): boolean {
  return (
    (ROLE_LEVEL.get(minRoleId) ?? 0) > (ROLE_LEVEL.get(RoleId.VOLUNTEER) ?? 0)
  );
}

/** Returns all role IDs at or below the given role's level (for SQL IN filtering). */
export function getAllowedRoleIds(userRoleId: string): RoleIdValue[] {
  const userLevel = ROLE_LEVEL.get(userRoleId) ?? 0;
  return ROLE_ID_VALUES.filter(
    /* v8 ignore next -- defensive fallback: ROLE_LEVEL and ROLE_ID_VALUES derive from the same enum source */
    (id) => (ROLE_LEVEL.get(id) ?? 0) <= userLevel,
  );
}

/**
 * Permissions are action-level, not resource-level.
 * The ticket system adds queue-specific permissions.
 * Append-only after deployment.
 *
 * This set was rewritten in full before any deployment existed, so no
 * per-org override rows referenced the previous names. After the first
 * deployment the append-only rule applies again: renaming a member
 * orphans every `role_permission_overrides` row that names it.
 *
 * One key, one capability. Two operations share a key only when they are
 * the same act on different data, meaning the verb and the consequence
 * match and only the record or channel differs. An operation that runs
 * only as a step inside another carries no key of its own.
 *
 * Grouped by the capability area they belong to, not by role level. Role
 * defaults live in the server's ROLE_CONFIG and are an org's to change;
 * the grouping here is about what the key governs.
 */
export enum Permission {
  // --- The case record ---
  VIEW_CASES = "view_cases",
  OPEN_CASES = "open_cases",
  EDIT_CASE_SUMMARY = "edit_case_summary",
  WRITE_CASE_NOTES = "write_case_notes",
  CHANGE_CASE_STATUS = "change_case_status",
  LINK_CASES = "link_cases",
  CLAIM_CASES = "claim_cases",
  ASSIGN_CASES = "assign_cases",
  DELETE_OTHERS_NOTES = "delete_others_notes",
  DOWNLOAD_CASE_MEDIA = "download_case_media",

  // --- Reaching a client ---
  // Split per channel: an org may staff messaging and calling differently.
  // Media is one key across channels rather than one per channel: sending
  // a file is the same act however it travels, and an org that withholds
  // photos withholds them everywhere.
  SEND_CLIENT_SMS = "send_client_sms",
  SEND_CLIENT_MEDIA = "send_client_media",
  SEND_CLIENT_EMAIL = "send_client_email",
  CALL_CLIENTS = "call_clients",
  MESSAGE_CLIENTS_IN_PORTAL = "message_clients_in_portal",

  // --- The client's own access to a case ---
  MANAGE_SHARE_LINKS = "manage_share_links",
  MANAGE_PORTAL_CHANNEL = "manage_portal_channel",
  RESET_CLIENT_LOGIN = "reset_client_login",
  REVOKE_REPLY_LINKS = "revoke_reply_links",

  // --- Client records ---
  VIEW_CLIENTS = "view_clients",
  VIEW_CLIENT_PII = "view_client_pii",
  EDIT_CLIENT_CONTACT = "edit_client_contact",
  EDIT_CLIENT_ALIAS = "edit_client_alias",
  MERGE_CLIENTS = "merge_clients",
  /** No delete-client operation exists yet. Declared so it is not reinvented. */
  DELETE_CLIENTS = "delete_clients",

  // --- Knowledge base ---
  VIEW_KNOWLEDGE_BASE = "view_knowledge_base",
  EDIT_KNOWLEDGE_BASE = "edit_knowledge_base",
  MANAGE_KNOWLEDGE_BASE_CATEGORIES = "manage_knowledge_base_categories",
  DELETE_KNOWLEDGE_BASE_ARTICLES = "delete_knowledge_base_articles",

  // --- Queues ---
  // Membership grants read access to every case in the queue (it is access
  // check 4 in tickets/access.ts). Notifications route pings and grant
  // nothing. Keeping them apart keeps the access grant visible.
  MANAGE_QUEUES = "manage_queues",
  MANAGE_QUEUE_MEMBERSHIP = "manage_queue_membership",
  MANAGE_QUEUE_NOTIFICATIONS = "manage_queue_notifications",

  // --- Intake ---
  MANAGE_INTAKE_FORMS = "manage_intake_forms",
  /**
   * Not only a gate. Holders receive ECIES wraps at submission time, so
   * revoking this does not un-wrap keys already issued.
   */
  VIEW_INTAKE_RESPONSES = "view_intake_responses",

  // --- Running the organisation ---
  MANAGE_ROLES = "manage_roles",
  MANAGE_USERS = "manage_users",
  MANAGE_ORG_IDENTITY = "manage_org_identity",
  MANAGE_CHANNEL_ROUTING = "manage_channel_routing",
  MANAGE_RETENTION = "manage_retention",
  MANAGE_NOTE_TYPES = "manage_note_types",
  MANAGE_KEYS = "manage_keys",
  MANAGE_INFRASTRUCTURE = "manage_infrastructure",
  WRITE_CALL_GREETINGS = "write_call_greetings",
  WRITE_AUTOMATIC_REPLIES = "write_automatic_replies",
  MANAGE_VOICEMAIL_QUARANTINE = "manage_voicemail_quarantine",
  MANAGE_ESCALATION = "manage_escalation",
  MANAGE_PRESETS = "manage_presets",
  VIEW_REPORTS = "view_reports",
  VIEW_AUDIT_LOG = "view_audit_log",
  /** No shifts feature exists yet. Declared so it is not reinvented. */
  VIEW_OWN_SHIFTS = "view_own_shifts",
}

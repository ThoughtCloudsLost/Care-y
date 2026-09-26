// Dashboard activity feed scope: which audit events the feed may show, and
// to whom.
//
// Every audit event type is classified here. Ticket events reach members of
// the ticket's queue. Organization events carry no ticket and reach only
// accounts holding the permission that performs them; the rest stay on the
// audit log page. VIEW_AUDIT_LOG holders can already read the whole log, so
// their feed takes every organization event and tickets from every queue.

import {
  Permission,
  auditEventTypeSchema,
  type AuditEventType,
} from "@care-y/shared";

export type FeedScope =
  | { readonly kind: "ticket" }
  | { readonly kind: "org"; readonly permission: Permission }
  | { readonly kind: "excluded" };

const TICKET: FeedScope = { kind: "ticket" };
const EXCLUDED: FeedScope = { kind: "excluded" };

function org(permission: Permission): FeedScope {
  return { kind: "org", permission };
}

/**
 * Feed classification for every audit event type. The `satisfies` clause
 * makes a new enum value without an entry here a compile error.
 */
export const FEED_SCOPE = {
  // --- Ticket events ---
  ticket_created: TICKET,
  ticket_closed: TICKET,
  ticket_reopened: TICKET,
  ticket_assigned: TICKET,
  followup_added: TICKET,
  ticket_content_updated: TICKET,
  reply_token_revoked: TICKET,
  client_tier_changed: TICKET,
  portal_channel_regenerated: TICKET,
  portal_channel_revoked: TICKET,
  client_account_reset: TICKET,
  voicemail_quarantine_routed: TICKET,

  // --- Organization events, gated by the permission that performs them ---
  queue_created: org(Permission.MANAGE_QUEUES),
  queue_updated: org(Permission.MANAGE_QUEUES),
  queue_deleted: org(Permission.MANAGE_QUEUES),
  role_permission_changed: org(Permission.MANAGE_ROLES),
  role_permissions_reset: org(Permission.MANAGE_ROLES),
  escalation_rule_created: org(Permission.MANAGE_ESCALATION),
  escalation_rule_updated: org(Permission.MANAGE_ESCALATION),
  escalation_rule_deleted: org(Permission.MANAGE_ESCALATION),
  intake_form_saved: org(Permission.MANAGE_INTAKE_FORMS),
  intake_form_deleted: org(Permission.MANAGE_INTAKE_FORMS),
  web_intake_toggled: org(Permission.MANAGE_INTAKE_FORMS),
  builtin_default_toggled: org(Permission.MANAGE_INTAKE_FORMS),
  form_asset_uploaded: org(Permission.MANAGE_INTAKE_FORMS),
  note_type_created: org(Permission.MANAGE_NOTE_TYPES),
  note_type_updated: org(Permission.MANAGE_NOTE_TYPES),
  ticket_merged: org(Permission.MERGE_CLIENTS),
  merge_undone: org(Permission.MERGE_CLIENTS),
  merge_lock_changed: org(Permission.MERGE_CLIENTS),
  client_alias_changed: org(Permission.EDIT_CLIENT_ALIAS),
  client_phone_changed: org(Permission.EDIT_CLIENT_CONTACT),
  client_email_changed: org(Permission.EDIT_CLIENT_CONTACT),
  client_deleted: org(Permission.DELETE_CLIENTS),
  voicemail_quarantined: org(Permission.MANAGE_VOICEMAIL_QUARANTINE),
  voicemail_quarantine_dismissed: org(Permission.MANAGE_VOICEMAIL_QUARANTINE),
  // Decrypted responses leaving the system, so it is shown even though
  // viewing them is not.
  intake_responses_exported: org(Permission.VIEW_INTAKE_RESPONSES),

  // --- Excluded: maintenance or high-volume events that would crowd a
  // five-row feed. They remain on the audit log page. ---
  portal_history_reseed_chunk: EXCLUDED,
  portal_reseed_blob_converted: EXCLUDED,
  org_key_reseal: EXCLUDED,
  org_key_reindex: EXCLUDED,
  intake_responses_viewed: EXCLUDED,

  // --- Also excluded because nothing writes them today. Classify each one
  // when a writer lands. ---
  ticket_escalated: EXCLUDED,
  media_soft_deleted: EXCLUDED,
  media_hard_deleted: EXCLUDED,
  preset_created: EXCLUDED,
  preset_updated: EXCLUDED,
  intake_form_bound: EXCLUDED,
  client_account_created: EXCLUDED,
  client_account_password_changed: EXCLUDED,
  pii_retention_purge: EXCLUDED,
} as const satisfies Record<AuditEventType, FeedScope>;

// Map lookup rather than bracket access keeps the
// security/detect-object-injection lint rule satisfied without a disable.
const scopeByEventType: ReadonlyMap<string, FeedScope> = new Map(
  Object.entries(FEED_SCOPE),
);

/** The feed classification of one audit event type. */
export function feedScopeFor(eventType: AuditEventType): FeedScope {
  return scopeByEventType.get(eventType) ?? EXCLUDED;
}

/**
 * How far back the dashboard's activity summary counts events. The feed
 * itself shows only the newest few rows; the summary counts every visible
 * event inside this window.
 */
export const FEED_SUMMARY_WINDOW_MS: number = 60 * 60 * 1000;

export interface ResolvedFeedScope {
  /** Ticket event types, shown for tickets in the caller's queues. */
  readonly ticketEventTypes: readonly AuditEventType[];
  /** Organization event types the caller may see. */
  readonly orgEventTypes: readonly AuditEventType[];
  /** True when ticket events come from every queue, not only the caller's. */
  readonly allQueues: boolean;
}

const TICKET_EVENT_TYPES: readonly AuditEventType[] =
  auditEventTypeSchema.options.filter(
    (type) => feedScopeFor(type).kind === "ticket",
  );

/**
 * Resolves which feed events an account may see from its effective
 * permissions. VIEW_AUDIT_LOG grants every organization event and every
 * queue; otherwise an organization event is visible only when its gating
 * permission is held.
 */
export function resolveFeedScope(
  permissions: ReadonlySet<Permission>,
): ResolvedFeedScope {
  const allQueues = permissions.has(Permission.VIEW_AUDIT_LOG);
  const orgEventTypes = auditEventTypeSchema.options.filter((type) => {
    const scope = feedScopeFor(type);
    return (
      scope.kind === "org" && (allQueues || permissions.has(scope.permission))
    );
  });
  return {
    ticketEventTypes: TICKET_EVENT_TYPES,
    orgEventTypes,
    allQueues,
  };
}

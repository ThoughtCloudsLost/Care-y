import { describe, it, expect } from "vitest";
import {
  Permission,
  auditEventTypeSchema,
  type AuditEventType,
} from "@care-y/shared";
import {
  FEED_SCOPE,
  feedScopeFor,
  resolveFeedScope,
} from "./activity-feed-scope.js";

const TICKET_EVENTS: readonly AuditEventType[] = [
  "ticket_created",
  "ticket_closed",
  "ticket_reopened",
  "ticket_assigned",
  "followup_added",
  "ticket_content_updated",
  "reply_token_revoked",
  "client_tier_changed",
  "portal_channel_regenerated",
  "portal_channel_revoked",
  "client_account_reset",
  "voicemail_quarantine_routed",
];

// Inner tuples stay mutable: it.each requires its row type to extend an array.
const ORG_EVENTS: readonly [AuditEventType, Permission][] = [
  ["queue_created", Permission.MANAGE_QUEUES],
  ["queue_updated", Permission.MANAGE_QUEUES],
  ["queue_deleted", Permission.MANAGE_QUEUES],
  ["role_permission_changed", Permission.MANAGE_ROLES],
  ["role_permissions_reset", Permission.MANAGE_ROLES],
  ["escalation_rule_created", Permission.MANAGE_ESCALATION],
  ["escalation_rule_updated", Permission.MANAGE_ESCALATION],
  ["escalation_rule_deleted", Permission.MANAGE_ESCALATION],
  ["intake_form_saved", Permission.MANAGE_INTAKE_FORMS],
  ["intake_form_deleted", Permission.MANAGE_INTAKE_FORMS],
  ["web_intake_toggled", Permission.MANAGE_INTAKE_FORMS],
  ["builtin_default_toggled", Permission.MANAGE_INTAKE_FORMS],
  ["form_asset_uploaded", Permission.MANAGE_INTAKE_FORMS],
  ["note_type_created", Permission.MANAGE_NOTE_TYPES],
  ["note_type_updated", Permission.MANAGE_NOTE_TYPES],
  ["ticket_merged", Permission.MERGE_CLIENTS],
  ["merge_undone", Permission.MERGE_CLIENTS],
  ["merge_lock_changed", Permission.MERGE_CLIENTS],
  ["client_alias_changed", Permission.EDIT_CLIENT_ALIAS],
  ["client_phone_changed", Permission.EDIT_CLIENT_CONTACT],
  ["client_email_changed", Permission.EDIT_CLIENT_CONTACT],
  ["client_deleted", Permission.DELETE_CLIENTS],
  ["voicemail_quarantined", Permission.MANAGE_VOICEMAIL_QUARANTINE],
  ["voicemail_quarantine_dismissed", Permission.MANAGE_VOICEMAIL_QUARANTINE],
  ["intake_responses_exported", Permission.VIEW_INTAKE_RESPONSES],
];

const EXCLUDED_EVENTS: readonly AuditEventType[] = [
  "portal_history_reseed_chunk",
  "portal_reseed_blob_converted",
  "org_key_reseal",
  "org_key_reindex",
  "intake_responses_viewed",
  "ticket_escalated",
  "media_soft_deleted",
  "media_hard_deleted",
  "preset_created",
  "preset_updated",
  "intake_form_bound",
  "client_account_created",
  "client_account_password_changed",
  "pii_retention_purge",
];

const ALL_PERMISSIONS: ReadonlySet<Permission> = new Set(
  Object.values(Permission),
);

describe("FEED_SCOPE", () => {
  it("classifies every audit event type and nothing else", () => {
    expect(Object.keys(FEED_SCOPE).sort()).toEqual(
      [...auditEventTypeSchema.options].sort(),
    );
  });

  it("covers every enum value across the three test lists exactly once", () => {
    const listed = [
      ...TICKET_EVENTS,
      ...ORG_EVENTS.map(([type]) => type),
      ...EXCLUDED_EVENTS,
    ];
    expect(new Set(listed).size).toBe(listed.length);
    expect([...listed].sort()).toEqual(
      [...auditEventTypeSchema.options].sort(),
    );
  });

  it.each(TICKET_EVENTS)("%s is a ticket event", (type) => {
    expect(feedScopeFor(type)).toEqual({ kind: "ticket" });
  });

  it.each(ORG_EVENTS)("%s is an org event gated by %s", (type, permission) => {
    expect(feedScopeFor(type)).toEqual({ kind: "org", permission });
  });

  it.each(EXCLUDED_EVENTS)("%s is excluded", (type) => {
    expect(feedScopeFor(type)).toEqual({ kind: "excluded" });
  });
});

describe("resolveFeedScope", () => {
  it("always returns every ticket event type", () => {
    for (const perms of [new Set<Permission>(), ALL_PERMISSIONS]) {
      expect([...resolveFeedScope(perms).ticketEventTypes].sort()).toEqual(
        [...TICKET_EVENTS].sort(),
      );
    }
  });

  it("returns no org events and own queues only with no permissions", () => {
    const scope = resolveFeedScope(new Set());
    expect(scope.orgEventTypes).toEqual([]);
    expect(scope.allQueues).toBe(false);
  });

  it.each(ORG_EVENTS)(
    "includes %s only when %s is held",
    (type, permission) => {
      expect(resolveFeedScope(new Set([permission])).orgEventTypes).toContain(
        type,
      );
      const without = new Set(ALL_PERMISSIONS);
      without.delete(permission);
      without.delete(Permission.VIEW_AUDIT_LOG);
      expect(resolveFeedScope(without).orgEventTypes).not.toContain(type);
    },
  );

  it("returns exactly the org events a single permission gates", () => {
    const scope = resolveFeedScope(new Set([Permission.MANAGE_QUEUES]));
    expect([...scope.orgEventTypes].sort()).toEqual([
      "queue_created",
      "queue_deleted",
      "queue_updated",
    ]);
    expect(scope.allQueues).toBe(false);
  });

  it("grants every org event and every queue with VIEW_AUDIT_LOG alone", () => {
    const scope = resolveFeedScope(new Set([Permission.VIEW_AUDIT_LOG]));
    expect(scope.allQueues).toBe(true);
    expect([...scope.orgEventTypes].sort()).toEqual(
      ORG_EVENTS.map(([type]) => type).sort(),
    );
  });

  it("never returns an excluded event type", () => {
    for (const perms of [
      new Set<Permission>(),
      new Set([Permission.VIEW_AUDIT_LOG]),
      ALL_PERMISSIONS,
    ]) {
      const scope = resolveFeedScope(perms);
      const returned = [...scope.ticketEventTypes, ...scope.orgEventTypes];
      for (const type of EXCLUDED_EVENTS) {
        expect(returned).not.toContain(type);
      }
    }
  });
});

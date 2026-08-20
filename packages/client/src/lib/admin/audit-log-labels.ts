import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";

/**
 * Derive a compact human-readable summary from audit metadata.
 * Returns null when no summary is applicable (the row renders with
 * just its event label and actor). Never returns raw metadata values
 * or ciphertext blobs.
 */
export function summarizeAuditMetadata(
  eventType: string,
  metadata: Record<string, unknown>,
): string | null {
  if (eventType === "ticket_content_updated") {
    const hasTitle = "previousEncryptedTitle" in metadata;
    const hasDesc = "previousEncryptedDescription" in metadata;
    if (hasTitle && hasDesc)
      return m.audit_metadata_title_and_description_changed();
    if (hasTitle) return m.audit_metadata_title_changed();
    if (hasDesc) return m.audit_metadata_description_changed();
    return null;
  }
  return null;
}

/**
 * Known audit event types to label builders. Built once at module scope:
 * auditEventLabel runs per rendered row, so rebuilding the map per call
 * would allocate 24 closures per row per render.
 */
type Terms = ReturnType<typeof withTerms> & Record<string, unknown>;

const EVENT_LABELS = new Map<string, (terms: Terms) => string>([
  ["ticket_created", (t) => m.audit_event_ticket_created(t)],
  ["ticket_closed", (t) => m.audit_event_ticket_closed(t)],
  ["ticket_reopened", (t) => m.audit_event_ticket_reopened(t)],
  ["ticket_assigned", (t) => m.audit_event_ticket_assigned(t)],
  ["ticket_escalated", (t) => m.audit_event_ticket_escalated(t)],
  ["ticket_merged", (t) => m.audit_event_ticket_merged(t)],
  ["followup_added", () => m.audit_event_followup_added()],
  ["media_soft_deleted", () => m.audit_event_media_soft_deleted()],
  ["media_hard_deleted", () => m.audit_event_media_hard_deleted()],
  ["queue_created", () => m.audit_event_queue_created()],
  ["queue_updated", () => m.audit_event_queue_updated()],
  ["queue_deleted", () => m.audit_event_queue_deleted()],
  ["preset_created", () => m.audit_event_preset_created()],
  ["preset_updated", () => m.audit_event_preset_updated()],
  ["note_type_created", () => m.audit_event_note_type_created()],
  ["note_type_updated", () => m.audit_event_note_type_updated()],
  ["merge_undone", () => m.audit_event_merge_undone()],
  ["merge_lock_changed", () => m.audit_event_merge_lock_changed()],
  ["voicemail_quarantined", () => m.audit_event_voicemail_quarantined()],
  [
    "voicemail_quarantine_routed",
    () => m.audit_event_voicemail_quarantine_routed(),
  ],
  [
    "voicemail_quarantine_dismissed",
    () => m.audit_event_voicemail_quarantine_dismissed(),
  ],
  ["client_alias_changed", (t) => m.audit_event_client_alias_changed(t)],
  ["client_phone_changed", (t) => m.audit_event_client_phone_changed(t)],
  ["ticket_content_updated", (t) => m.audit_event_ticket_content_updated(t)],
  ["intake_form_saved", () => m.audit_event_intake_form_saved()],
  ["intake_form_deleted", () => m.audit_event_intake_form_deleted()],
  ["intake_form_bound", () => m.audit_event_intake_form_bound()],
  ["web_intake_toggled", () => m.audit_event_web_intake_toggled()],
  ["client_tier_changed", (t) => m.audit_event_client_tier_changed(t)],
  [
    "portal_channel_regenerated",
    () => m.audit_event_portal_channel_regenerated(),
  ],
  ["portal_channel_revoked", () => m.audit_event_portal_channel_revoked()],
  ["client_account_created", (t) => m.audit_event_client_account_created(t)],
  [
    "client_account_password_changed",
    (t) => m.audit_event_client_account_password_changed(t),
  ],
  ["client_account_reset", (t) => m.audit_event_client_account_reset(t)],
  ["account_offer_changed", () => m.audit_event_account_offer_changed()],
]);

/**
 * Map known audit event types to i18n labels.
 * Unknown types fall through and render as the raw value.
 */
export function auditEventLabel(eventType: string): string {
  const build = EVENT_LABELS.get(eventType);
  return build !== undefined
    ? build(withTerms<Record<string, unknown>>({}))
    : eventType;
}

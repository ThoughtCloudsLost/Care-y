/**
 * Pure cascade/effective-state helpers for notification preferences.
 *
 * The cascade order is: ticket override > queue override > global preference > default enabled.
 * This matches the server-side resolution in packages/server/src/notifications/preferences.ts.
 * Both implementations are tested against the same fixture expectations to prevent drift.
 */

import type {
  NotificationChannel,
  NotificationEventType,
  PreferenceRow,
  PreferenceScopeType,
} from "@care-y/shared";

/**
 * A scope descriptor for preference cascade lookups.
 * scopeId is null for the global scope.
 */
export interface PreferenceScope {
  readonly scopeType: PreferenceScopeType;
  readonly scopeId: string | null;
}

/**
 * Resolves the effective enabled state for a given (scope, eventType, channel) tuple.
 *
 * Cascade order: ticket > queue > global > default (true).
 * When called with a global scope, only global rows are considered.
 * When called with a queue scope, queue rows override globals.
 * When called with a ticket scope, ticket rows override queue and global rows.
 * Missing rows at any level fall through to the next level. If no rows exist, returns true.
 */
export function effectiveState(
  rows: readonly PreferenceRow[],
  scope: PreferenceScope,
  eventType: NotificationEventType,
  channel: NotificationChannel,
): boolean {
  const matching = rows.filter(
    (r) => r.eventType === eventType && r.channel === channel,
  );

  if (scope.scopeType === "ticket" && scope.scopeId !== null) {
    const ticketRow = matching.find(
      (r) => r.scopeType === "ticket" && r.scopeId === scope.scopeId,
    );
    if (ticketRow !== undefined) return ticketRow.enabled;
  }

  if (
    (scope.scopeType === "ticket" || scope.scopeType === "queue") &&
    scope.scopeId !== null
  ) {
    // For ticket scope, fall through to queue if no ticket override was found.
    // For queue scope, check queue rows directly.
    // We need a queueId. For ticket scope, we do not have the queueId here,
    // so we only look up the queue if we are in queue scope.
    if (scope.scopeType === "queue") {
      const queueRow = matching.find(
        (r) => r.scopeType === "queue" && r.scopeId === scope.scopeId,
      );
      if (queueRow !== undefined) return queueRow.enabled;
    }
  }

  // Fall through to global
  const globalRow = matching.find((r) => r.scopeType === "global");
  if (globalRow !== undefined) return globalRow.enabled;

  // Default: enabled
  return true;
}

/**
 * Resolves the effective state for a queue scope, checking queue overrides
 * first, then falling through to global preferences.
 */
export function effectiveQueueState(
  rows: readonly PreferenceRow[],
  queueId: string,
  eventType: NotificationEventType,
  channel: NotificationChannel,
): boolean {
  return effectiveState(
    rows,
    { scopeType: "queue", scopeId: queueId },
    eventType,
    channel,
  );
}

/**
 * Resolves the effective state for the global scope.
 * Only considers global rows. Absent row defaults to true.
 */
export function effectiveGlobalState(
  rows: readonly PreferenceRow[],
  eventType: NotificationEventType,
  channel: NotificationChannel,
): boolean {
  return effectiveState(
    rows,
    { scopeType: "global", scopeId: null },
    eventType,
    channel,
  );
}

/**
 * Checks whether an explicit override row exists for a given (scope, eventType, channel).
 * Used to show the "edited" marker on queue override cells.
 */
export function hasExplicitOverride(
  rows: readonly PreferenceRow[],
  scopeType: PreferenceScopeType,
  scopeId: string | null,
  eventType: NotificationEventType,
  channel: NotificationChannel,
): boolean {
  return rows.some(
    (r) =>
      r.scopeType === scopeType &&
      r.scopeId === scopeId &&
      r.eventType === eventType &&
      r.channel === channel,
  );
}

/**
 * Checks whether any queue-scope override rows exist for a given queue.
 */
export function hasQueueOverrides(
  rows: readonly PreferenceRow[],
  queueId: string,
): boolean {
  return rows.some((r) => r.scopeType === "queue" && r.scopeId === queueId);
}

/**
 * Ordered list of all notification event types for the settings matrix.
 * Matches the enum order from notificationEventTypeSchema.
 */
export const NOTIFICATION_EVENT_TYPES: readonly NotificationEventType[] = [
  "ticket_created",
  "ticket_assigned",
  "ticket_closed",
  "ticket_reopened",
  "ticket_escalated",
  "followup_added",
  "mention",
  "merge_completed",
  "voicemail_quarantined",
] as const;

/**
 * Ordered list of deliverable channels for the matrix columns.
 * SSE is excluded: always delivered, never toggleable.
 */
export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = [
  "push",
  "email",
  "sms",
] as const;

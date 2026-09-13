/**
 * Audit log filter store for the admin logs page. Server-side filtering
 * via the tickets.auditLog query (eventType, actorId, dateFrom, dateTo).
 *
 * No sort state: the endpoint returns newest-first with no sort input.
 */

import type { AuditEventType } from "@care-y/shared";

function createAuditLogFilterStore(): {
  readonly eventType: AuditEventType | null;
  readonly actorId: string | null;
  readonly dateFrom: Date | null;
  readonly dateTo: Date | null;
  readonly activeCount: number;
  setEventType(v: AuditEventType | null): void;
  setActorId(v: string | null): void;
  setDateRange(from: Date | null, to: Date | null): void;
  clearAll(): void;
} {
  let eventType = $state<AuditEventType | null>(null);
  let actorId = $state<string | null>(null);
  let dateFrom = $state<Date | null>(null);
  let dateTo = $state<Date | null>(null);

  const activeCount = $derived(
    (eventType !== null ? 1 : 0) +
      (actorId !== null ? 1 : 0) +
      (dateFrom !== null || dateTo !== null ? 1 : 0),
  );

  return {
    get eventType(): AuditEventType | null {
      return eventType;
    },
    setEventType(v: AuditEventType | null): void {
      eventType = v;
    },

    get actorId(): string | null {
      return actorId;
    },
    setActorId(v: string | null): void {
      actorId = v;
    },

    get dateFrom(): Date | null {
      return dateFrom;
    },
    get dateTo(): Date | null {
      return dateTo;
    },
    setDateRange(from: Date | null, to: Date | null): void {
      dateFrom = from;
      dateTo = to;
    },

    get activeCount(): number {
      return activeCount;
    },

    clearAll(): void {
      eventType = null;
      actorId = null;
      dateFrom = null;
      dateTo = null;
    },
  };
}

export const auditLogFilterStore = createAuditLogFilterStore();

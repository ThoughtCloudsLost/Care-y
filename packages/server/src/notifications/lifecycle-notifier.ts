/**
 * Audit entry and outbox notice for a ticket lifecycle event.
 *
 * Every router that changes a case after its service call returns goes
 * through here, so a follow-up written from the funds router is audited
 * and announced exactly as one written from the tickets router.
 */

import type { NoteTypeId, QueueId, TicketId, UserId } from "@care-y/shared";
import type { OrgContext } from "../trpc/context.js";
import type { AuditEntry, AuditService } from "../tickets/audit.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import {
  enqueueNotificationDurable,
  encryptMentionedPseudonyms,
  type OutboxEventType,
} from "./outbox.js";

export interface LifecycleNotifierDeps {
  /** No-op audit when absent. */
  readonly createAuditSvc?: (tDb: OrgContext["tenantDb"]) => AuditService;
  /**
   * OPS-tier encryptor for mentioned pseudonyms; mentions are dropped
   * without it.
   */
  readonly fieldEncryptor?: FieldEncryptor;
}

/** The caller of the procedure that raised the event. */
export interface LifecycleActor {
  readonly org: OrgContext;
  readonly user: { readonly id: UserId };
}

/** The case the event is about, as the outbox routes it. */
export interface LifecycleTicket {
  readonly id: TicketId;
  readonly queueId: QueueId;
  readonly assignedTo: UserId | null;
}

/**
 * Members are function-typed properties rather than methods, so callers
 * can destructure them. None of them reads `this`.
 */
export interface LifecycleNotifier {
  /** Best-effort audit entry, never blocks. */
  readonly audit: (tDb: OrgContext["tenantDb"], entry: AuditEntry) => void;
  /**
   * Audit entry plus outbox notice. The drainer re-resolves recipients at
   * dispatch time (never stored).
   *
   * Enqueue is durable-only (not atomic with the mutation) because the
   * caller runs this after the service method returns, outside any
   * transaction the route controls. There is a residual window where the
   * mutation commits and the enqueue does not.
   */
  readonly auditAndNotify: (
    ctx: LifecycleActor,
    // Routers raise lifecycle events only. Quarantine and merge
    // notifications are dispatched from their own services, so keeping
    // this narrow means a new event type has to be handled rather than
    // coerced.
    eventType: OutboxEventType,
    ticket: LifecycleTicket,
    auditEntry: AuditEntry,
    mentionedPseudonyms?: string[],
    noteTypeId?: NoteTypeId,
  ) => void;
  /**
   * Outbox notice alone. Durable-only (not inside a transaction).
   * Mentioned pseudonyms are OPS-encrypted before storage to avoid
   * persisting a volunteer interaction graph in plaintext.
   */
  readonly enqueueLifecycleNotification: (
    ctx: LifecycleActor,
    eventType: OutboxEventType,
    ticket: LifecycleTicket,
    mentionedPseudonyms?: string[],
    noteTypeId?: NoteTypeId,
  ) => void;
}

export function createLifecycleNotifier(
  deps: LifecycleNotifierDeps,
): LifecycleNotifier {
  function audit(tDb: OrgContext["tenantDb"], entry: AuditEntry): void {
    if (!deps.createAuditSvc) return;
    const svc = deps.createAuditSvc(tDb);
    void svc.log(entry);
  }

  function enqueueLifecycleNotification(
    ctx: LifecycleActor,
    eventType: OutboxEventType,
    ticket: LifecycleTicket,
    mentionedPseudonyms: string[] = [],
    noteTypeId?: NoteTypeId,
  ): void {
    const encryptor = deps.fieldEncryptor;
    const encryptedMentions =
      encryptor !== undefined
        ? encryptMentionedPseudonyms(mentionedPseudonyms, encryptor)
        : undefined;

    void enqueueNotificationDurable(ctx.org.tenantDb, {
      eventType,
      ticketId: ticket.id,
      queueId: ticket.queueId,
      formId: null,
      actorUserId: ctx.user.id,
      noteTypeId,
      encryptedMentionedPseudonyms: encryptedMentions,
    }).catch((err: unknown) => {
      console.error(
        "Outbox enqueue failed:",
        err instanceof Error ? err.message : String(err),
      );
    });
  }

  function auditAndNotify(
    ctx: LifecycleActor,
    eventType: OutboxEventType,
    ticket: LifecycleTicket,
    auditEntry: AuditEntry,
    mentionedPseudonyms: string[] = [],
    noteTypeId?: NoteTypeId,
  ): void {
    audit(ctx.org.tenantDb, auditEntry);
    enqueueLifecycleNotification(
      ctx,
      eventType,
      ticket,
      mentionedPseudonyms,
      noteTypeId,
    );
  }

  return { audit, auditAndNotify, enqueueLifecycleNotification };
}

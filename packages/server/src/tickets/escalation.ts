/**
 * Auto-escalation job.
 *
 * Recurring job that finds open tickets past their queue's escalate_days
 * threshold and bumps priority. Held tickets and queues with
 * escalate_days = 0 are skipped.
 *
 * Priority ladder: low -> normal -> high -> urgent (stops at urgent).
 *
 * Uses the JobQueue self-enqueue pattern (same as media-cleanup).
 * Each iteration processes one tenant schema at a time via tenantDb()
 * (never raw SQL on tenant tables).
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { JobQueue } from "../jobs/queue.js";
import type { TicketPriority } from "@care-y/shared";

export const ESCALATION_QUEUE = "ticket-escalation";
export const ESCALATION_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export interface EscalationResult {
  readonly escalatedCount: number;
}

/** Priority escalation ladder. Keyed by current priority, value is next. */
const NEXT_PRIORITY: Partial<Record<TicketPriority, TicketPriority>> = {
  low: "normal",
  normal: "high",
  high: "urgent",
};

/**
 * Find and escalate stale tickets in a single tenant schema.
 *
 * A ticket is escalatable when:
 * 1. status = 'open'
 * 2. on_hold = false
 * 3. queue.escalate_days > 0
 * 4. ticket age > queue.escalate_days
 * 5. priority is not already 'urgent'
 */
export async function escalateTenantTickets(
  db: Kysely<TenantDatabase>,
): Promise<EscalationResult> {
  const staleTickets = await db
    .selectFrom("tickets")
    .innerJoin("queues", "queues.id", "tickets.queue_id")
    .select([
      "tickets.id",
      "tickets.priority",
      "tickets.created_at",
      "queues.escalate_days",
    ])
    .where("tickets.status", "=", "open")
    .where("tickets.on_hold", "=", false)
    .where("queues.escalate_days", ">", 0)
    .where("tickets.priority", "!=", "urgent")
    .execute();

  let escalatedCount = 0;

  for (const ticket of staleTickets) {
    // Check staleness in application code (clear and testable;
    // avoids Kysely date arithmetic portability issues)
    const ageMs = Date.now() - new Date(ticket.created_at).getTime();
    const thresholdMs = ticket.escalate_days * 24 * 60 * 60 * 1000;

    if (ageMs < thresholdMs) continue;

    const newPriority = NEXT_PRIORITY[ticket.priority];
    if (newPriority === undefined) continue;

    await db
      .updateTable("tickets")
      .set({ priority: newPriority })
      .where("id", "=", ticket.id)
      .execute();

    await db
      .insertInto("followups")
      .values({
        ticket_id: ticket.id,
        source: "system",
        type: "priority_changed",
        encrypted_content: Buffer.alloc(0),
        event_params: { from: ticket.priority, to: newPriority },
      })
      .execute();

    escalatedCount++;
  }

  return { escalatedCount };
}

/**
 * Register the escalation job handler. Called once at server startup.
 *
 * The runForAllTenants callback is provided by the server, which
 * iterates active org schemas and calls escalateTenantTickets for each.
 */
export function registerEscalationHandler(
  jobQueue: JobQueue,
  runForAllTenants: () => Promise<void>,
): void {
  jobQueue.process(ESCALATION_QUEUE, async () => {
    await runForAllTenants();

    // Self-enqueue for next run
    await jobQueue.enqueue(
      ESCALATION_QUEUE,
      {},
      {
        delay: ESCALATION_INTERVAL_MS,
      },
    );
  });
}

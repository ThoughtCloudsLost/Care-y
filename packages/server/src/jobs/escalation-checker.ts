/**
 * Escalation rules checker job.
 *
 * Recurring job that evaluates time-based escalation rules against
 * open tickets across all tenant schemas. Fires once per
 * (rule, ticket) pair via the firings ledger in escalation-service.
 *
 * Uses the JobQueue self-enqueue pattern (same as ticket-escalation
 * and media-cleanup). The re-enqueue sits in a finally block so the
 * self-chain survives handler errors.
 */

import type { JobQueue } from "./queue.js";

export const ESCALATION_RULES_QUEUE = "escalation-rules-check";
export const DEFAULT_ESCALATION_RULES_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Register the escalation rules checker handler. Called once at startup.
 *
 * The runForAllTenants callback iterates active org schemas and calls
 * runEscalationCheck for each. The handler re-enqueues itself with the
 * configured delay in a finally block so the chain never breaks, even
 * when a tenant run throws.
 */
export function registerEscalationRulesHandler(
  jobQueue: JobQueue,
  runForAllTenants: () => Promise<void>,
  intervalMs: number = DEFAULT_ESCALATION_RULES_INTERVAL_MS,
): void {
  jobQueue.process(ESCALATION_RULES_QUEUE, async () => {
    try {
      await runForAllTenants();
    } finally {
      // Self-chain must never die: re-enqueue even if a tenant run throws.
      await jobQueue.enqueue(ESCALATION_RULES_QUEUE, {}, { delay: intervalMs });
    }
  });
}

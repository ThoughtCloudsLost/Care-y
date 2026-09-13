/**
 * Escalation rules checker job.
 *
 * Recurring job that evaluates time-based escalation rules against
 * open tickets across all tenant schemas. Fires once per
 * (rule, ticket) pair via the firings ledger in escalation-service.
 *
 * Uses registerRecurringHandler for the self-enqueue pattern shared
 * by all recurring jobs.
 */

import type { JobQueue } from "./queue.js";
import { registerRecurringHandler } from "./ensure-recurring.js";

export const ESCALATION_RULES_QUEUE = "escalation-rules-check";
export const DEFAULT_ESCALATION_RULES_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Register the escalation rules checker handler. Called once at startup.
 *
 * The runForAllTenants callback iterates active org schemas and calls
 * runEscalationCheck for each. The handler re-enqueues itself with the
 * configured delay so the chain never breaks, even when a tenant run
 * throws.
 */
export function registerEscalationRulesHandler(
  jobQueue: JobQueue,
  runForAllTenants: () => Promise<void>,
  intervalMs: number = DEFAULT_ESCALATION_RULES_INTERVAL_MS,
): void {
  registerRecurringHandler(
    jobQueue,
    ESCALATION_RULES_QUEUE,
    runForAllTenants,
    intervalMs,
  );
}

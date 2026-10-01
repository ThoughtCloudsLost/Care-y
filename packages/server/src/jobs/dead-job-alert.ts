/**
 * Dead-job operator alert.
 *
 * The job queue marks a job dead when its retries run out and tells nobody.
 * This recurring sweep lists the jobs that died since the previous sweep and
 * sends the operator one email per sweep, however many jobs died, so a crash
 * loop produces one message every 15 minutes rather than hundreds.
 *
 * The email carries the queue name, job id, org UUID and failure time of
 * each job. Payloads and the error column are never read: an exception
 * message can quote a phone number or message text.
 */

import type { EmailMessage, EmailSender } from "../email/email-sender.js";
import { registerRecurringHandler } from "./ensure-recurring.js";
import type { DeadJobReader, DeadJobSummary, JobQueue } from "./queue.js";

export const DEAD_JOB_ALERT_QUEUE = "dead-job-alert";
export const DEAD_JOB_ALERT_INTERVAL_MS = 15 * 60 * 1000;

export interface DeadJobAlertDeps {
  /** Registers the recurring sweep and re-enqueues it. */
  readonly queue: JobQueue;
  /** Lists the jobs that died since the previous sweep. */
  readonly deadJobReader: DeadJobReader;
  /** The platform sender from createEmailSender. */
  readonly sender: EmailSender;
  /** OPERATOR_ALERT_EMAIL. */
  readonly to: string;
  /** SMTP_FROM. */
  readonly from: string;
  /** CAREY_APP_DOMAIN, so the alert names the instance it came from. */
  readonly hostLabel: string;
  readonly now: () => Date;
}

/** Subject and body of an alert; the handler adds the addresses. */
export type DeadJobAlertContent = Pick<EmailMessage, "subject" | "text">;

/**
 * Renders the alert for one sweep. Pure.
 *
 * @param jobs Dead jobs found by the sweep, at least one.
 * @param hostLabel The instance's app domain.
 * @returns Subject and plain-text body listing queue, job id, org UUID and
 *   failure time for each job, and nothing else.
 */
export function renderDeadJobAlert(
  jobs: readonly DeadJobSummary[],
  hostLabel: string,
): DeadJobAlertContent {
  const count = String(jobs.length);
  const plural = jobs.length !== 1;
  const queues = [...new Set(jobs.map((job) => job.queue))].sort();

  const subject = `CARE-Y ${hostLabel}: ${count} dead background ${plural ? "jobs" : "job"}`;

  const rows = jobs.map(
    (job) =>
      `${job.failedAt.toISOString()}  queue=${job.queue}  job=${job.id}  org=${job.orgId ?? "none"}`,
  );

  const text = [
    `${count} background ${plural ? "jobs" : "job"} on ${hostLabel} ran out of retries and ${plural ? "were" : "was"} marked dead.`,
    "",
    `Queues: ${queues.join(", ")}`,
    "",
    ...rows,
    "",
    "Payloads and error messages are left out because they can quote data. Read them from the pending_jobs table on the host.",
    "",
  ].join("\n");

  return { subject, text };
}

/**
 * Registers the 15-minute dead-job sweep. Called once at startup when
 * OPERATOR_ALERT_EMAIL is set.
 *
 * The recurring handler receives no payload, so the previous sweep time
 * lives in this closure. It starts one interval back, which means a restart
 * can report jobs that died in the last 15 minutes a second time; that
 * duplicate is accepted. A failed send leaves the sweep time unchanged, so
 * the next sweep reports the same jobs again.
 */
export function registerDeadJobAlertHandler(deps: DeadJobAlertDeps): void {
  let lastSweepAt = new Date(deps.now().getTime() - DEAD_JOB_ALERT_INTERVAL_MS);

  registerRecurringHandler(
    deps.queue,
    DEAD_JOB_ALERT_QUEUE,
    async () => {
      const sweepStartedAt = deps.now();
      const jobs = await deps.deadJobReader.listDeadSince(lastSweepAt);

      if (jobs.length > 0) {
        const content = renderDeadJobAlert(jobs, deps.hostLabel);
        await deps.sender.send({ to: deps.to, from: deps.from, ...content });
        console.log(`Dead-job alert sent for ${String(jobs.length)} jobs`);
      }

      lastSweepAt = sweepStartedAt;
    },
    DEAD_JOB_ALERT_INTERVAL_MS,
  );
}

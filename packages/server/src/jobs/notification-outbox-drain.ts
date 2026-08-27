/**
 * Notification outbox drain job.
 *
 * Recurring self-enqueue job that polls notification_outbox in every
 * active tenant schema. Follows the same pattern as escalation-checker
 * and portal-message-expiry: the handler re-enqueues itself in a
 * finally block so the chain survives a throwing tenant.
 *
 * Target interval: ~5 seconds. The outbox drainer is the single sender
 * for intake notifications. There is no parallel immediate-send path.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { JobQueue } from "./queue.js";
import type { OutboxDrainDeps } from "../notifications/outbox.js";
import { drainOutbox } from "../notifications/outbox.js";
import type { OrgId, OrgSchema, OrgSlug } from "@care-y/shared";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const OUTBOX_DRAIN_QUEUE = "notification-outbox-drain";

/** Default drain interval: 5 seconds. Fast enough for near-real-time
 *  delivery without excessive polling. */
export const DEFAULT_OUTBOX_DRAIN_INTERVAL_MS = 5_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OutboxDrainJobDeps {
  readonly listActiveOrgs: () => Promise<
    readonly { id: OrgId; schema: OrgSchema; slug: OrgSlug }[]
  >;
  readonly getTenantDb: (schema: OrgSchema) => Kysely<TenantDatabase>;
  readonly buildDrainDeps: (org: {
    id: OrgId;
    schema: OrgSchema;
    slug: OrgSlug;
  }) => OutboxDrainDeps;
}

// ---------------------------------------------------------------------------
// Handler registration
// ---------------------------------------------------------------------------

/**
 * Register the outbox drain handler. Called once at startup.
 *
 * Iterates all active org schemas and drains each tenant's outbox.
 * Errors in one tenant are logged and do not stop other tenants.
 * The handler re-enqueues itself in a finally block.
 */
export function registerOutboxDrainHandler(
  jobQueue: JobQueue,
  deps: OutboxDrainJobDeps,
  intervalMs: number = DEFAULT_OUTBOX_DRAIN_INTERVAL_MS,
): void {
  jobQueue.process(OUTBOX_DRAIN_QUEUE, async () => {
    try {
      const orgs = await deps.listActiveOrgs();
      for (const org of orgs) {
        try {
          const tDb = deps.getTenantDb(org.schema);
          const drainDeps = deps.buildDrainDeps(org);
          await drainOutbox(tDb, drainDeps);
        } catch (err: unknown) {
          console.error(
            `Outbox drain failed for schema ${org.schema}:`,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
    } finally {
      // Self-chain: re-enqueue so the loop never dies
      await jobQueue.enqueue(OUTBOX_DRAIN_QUEUE, {}, { delay: intervalMs });
    }
  });
}

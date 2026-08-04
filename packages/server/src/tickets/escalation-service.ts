/**
 * Escalation rule evaluation and CRUD repository.
 *
 * runEscalationCheck evaluates all active escalation rules for a single
 * tenant and dispatches notifications for tickets that match. The
 * escalation_rule_firings table is the idempotency ledger: each
 * (rule, ticket) pair fires at most once ever.
 *
 * The thin repository functions (listRules, createRule, updateRule,
 * deleteRule) are consumed by the escalation tRPC router.
 */

import { sql, type Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { NotificationService } from "../notifications/service.js";
import type {
  NotificationRecipient,
  NotificationRecipientList,
} from "./notification-recipients.js";
import {
  escalationActionSchema,
  escalationRuleTypeSchema,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface EscalationRule {
  readonly id: string;
  readonly queueId: string;
  readonly ruleType: "unassigned_duration" | "inactive_duration";
  readonly thresholdMinutes: number;
  readonly action: "notify_managers" | "notify_queue_watchers";
  readonly isActive: boolean;
  readonly createdAt: Date;
}

export interface EscalationServiceDeps {
  readonly notificationService: NotificationService;
  readonly getManagerIds: (tDb: Kysely<TenantDatabase>) => Promise<string[]>;
  readonly getQueueWatcherIds: (
    tDb: Kysely<TenantDatabase>,
    queueId: string,
  ) => Promise<string[]>;
}

export interface EscalationCheckResult {
  readonly rulesEvaluated: number;
  readonly firings: number;
}

// ---------------------------------------------------------------------------
// Candidate queries (one per rule, set-based)
// ---------------------------------------------------------------------------

interface CandidateTicket {
  readonly id: string;
  readonly queue_id: string;
}

async function findUnassignedCandidates(
  tDb: Kysely<TenantDatabase>,
  ruleId: string,
  queueId: string,
  thresholdMinutes: number,
): Promise<readonly CandidateTicket[]> {
  return tDb
    .selectFrom("tickets")
    .select(["tickets.id", "tickets.queue_id"])
    .where("tickets.queue_id", "=", queueId)
    .where("tickets.status", "=", "open")
    .where("tickets.on_hold", "=", false)
    .where("tickets.assigned_to", "is", null)
    .where(
      "tickets.created_at",
      "<",
      sql<Date>`now() - interval '1 minute' * ${sql.lit(thresholdMinutes)}`,
    )
    .where((eb) =>
      eb.not(
        eb.exists(
          eb
            .selectFrom("escalation_rule_firings as erf")
            .select(sql.lit(1).as("x"))
            .where("erf.rule_id", "=", ruleId)
            .whereRef("erf.ticket_id", "=", "tickets.id"),
        ),
      ),
    )
    .execute();
}

async function findInactiveCandidates(
  tDb: Kysely<TenantDatabase>,
  ruleId: string,
  queueId: string,
  thresholdMinutes: number,
): Promise<readonly CandidateTicket[]> {
  // For each ticket, compare COALESCE(max(followups.created_at), tickets.created_at)
  // against now() - threshold. The subquery in the WHERE avoids loading
  // all tickets into JS.
  return tDb
    .selectFrom("tickets")
    .leftJoin("followups", "followups.ticket_id", "tickets.id")
    .select(["tickets.id", "tickets.queue_id"])
    .where("tickets.queue_id", "=", queueId)
    .where("tickets.status", "=", "open")
    .where("tickets.on_hold", "=", false)
    .where((eb) =>
      eb.not(
        eb.exists(
          eb
            .selectFrom("escalation_rule_firings as erf")
            .select(sql.lit(1).as("x"))
            .where("erf.rule_id", "=", ruleId)
            .whereRef("erf.ticket_id", "=", "tickets.id"),
        ),
      ),
    )
    .groupBy(["tickets.id", "tickets.queue_id", "tickets.created_at"])
    .having((eb) =>
      eb(
        eb.fn.coalesce(
          eb.fn.max("followups.created_at"),
          eb.ref("tickets.created_at"),
        ),
        "<",
        sql<Date>`now() - interval '1 minute' * ${sql.lit(thresholdMinutes)}`,
      ),
    )
    .execute();
}

// ---------------------------------------------------------------------------
// Core evaluation
// ---------------------------------------------------------------------------

/** Evaluate all active rules for one tenant and execute matching actions. */
export async function runEscalationCheck(
  tDb: Kysely<TenantDatabase>,
  orgSchema: string,
  orgSlug: string,
  deps: EscalationServiceDeps,
): Promise<EscalationCheckResult> {
  const rules = await tDb
    .selectFrom("escalation_rules")
    .selectAll()
    .where("is_active", "=", true)
    .execute();

  let firings = 0;

  for (const rule of rules) {
    const candidates =
      rule.rule_type === "unassigned_duration"
        ? await findUnassignedCandidates(
            tDb,
            rule.id,
            rule.queue_id,
            rule.threshold_minutes,
          )
        : await findInactiveCandidates(
            tDb,
            rule.id,
            rule.queue_id,
            rule.threshold_minutes,
          );

    for (const ticket of candidates) {
      // Insert firing row FIRST. The onConflict doNothing makes this the
      // idempotency lock: two overlapping runs cannot double-notify.
      const insertResult = await tDb
        .insertInto("escalation_rule_firings")
        .values({
          rule_id: rule.id,
          ticket_id: ticket.id,
        })
        .onConflict((oc) => oc.columns(["rule_id", "ticket_id"]).doNothing())
        .executeTakeFirst();

      // Only dispatch when the insert actually inserted (numInsertedOrUpdatedRows > 0).
      const didInsert =
        insertResult.numInsertedOrUpdatedRows !== undefined &&
        insertResult.numInsertedOrUpdatedRows > 0n;

      if (!didInsert) continue;

      // Build recipients directly (no acting user to exclude).
      const recipientUserIds =
        rule.action === "notify_managers"
          ? await deps.getManagerIds(tDb)
          : await deps.getQueueWatcherIds(tDb, rule.queue_id);

      const source: "note_escalation" | "queue_watcher" =
        rule.action === "notify_managers" ? "note_escalation" : "queue_watcher";

      const recipients: NotificationRecipientList = {
        recipients: recipientUserIds.map((userId): NotificationRecipient => ({
          userId,
          source,
        })),
      };

      await deps.notificationService.dispatch(
        tDb,
        orgSchema,
        orgSlug,
        "ticket_escalated",
        ticket.id,
        ticket.queue_id,
        recipients,
      );

      firings++;
    }

    // Log rule ID and count only (never queue names or ticket content)
    if (candidates.length > 0) {
      console.log(
        `rule ${rule.id}: ${String(candidates.length)} candidates, ${String(firings)} firings`,
      );
    }
  }

  return { rulesEvaluated: rules.length, firings };
}

// ---------------------------------------------------------------------------
// Repository functions (thin CRUD, consumed by the escalation router)
// ---------------------------------------------------------------------------

/** List all escalation rules for a queue. */
export async function listRules(
  tDb: Kysely<TenantDatabase>,
  queueId: string,
): Promise<readonly EscalationRule[]> {
  const rows = await tDb
    .selectFrom("escalation_rules")
    .selectAll()
    .where("queue_id", "=", queueId)
    .orderBy("created_at", "asc")
    .execute();

  return rows.map(mapRow);
}

/** Create a new escalation rule. Returns the created rule. */
export async function createRule(
  tDb: Kysely<TenantDatabase>,
  input: {
    readonly queueId: string;
    readonly ruleType: "unassigned_duration" | "inactive_duration";
    readonly thresholdMinutes: number;
    readonly action: "notify_managers" | "notify_queue_watchers";
  },
): Promise<EscalationRule> {
  const row = await tDb
    .insertInto("escalation_rules")
    .values({
      queue_id: input.queueId,
      rule_type: input.ruleType,
      threshold_minutes: input.thresholdMinutes,
      action: input.action,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return mapRow(row);
}

/** Update an existing escalation rule. Returns the updated rule. */
export async function updateRule(
  tDb: Kysely<TenantDatabase>,
  ruleId: string,
  patch: {
    readonly thresholdMinutes?: number;
    readonly action?: "notify_managers" | "notify_queue_watchers";
    readonly isActive?: boolean;
  },
): Promise<EscalationRule | null> {
  const updates: Record<string, unknown> = {};
  if (patch.thresholdMinutes !== undefined) {
    updates.threshold_minutes = patch.thresholdMinutes;
  }
  if (patch.action !== undefined) {
    updates.action = patch.action;
  }
  if (patch.isActive !== undefined) {
    updates.is_active = patch.isActive;
  }

  if (Object.keys(updates).length === 0) {
    // No fields to update; return the current row.
    const existing = await tDb
      .selectFrom("escalation_rules")
      .selectAll()
      .where("id", "=", ruleId)
      .executeTakeFirst();
    return existing ? mapRow(existing) : null;
  }

  const row = await tDb
    .updateTable("escalation_rules")
    .set(updates)
    .where("id", "=", ruleId)
    .returningAll()
    .executeTakeFirst();

  return row ? mapRow(row) : null;
}

/** Delete an escalation rule. Returns true if a row was deleted. */
export async function deleteRule(
  tDb: Kysely<TenantDatabase>,
  ruleId: string,
): Promise<boolean> {
  const result = await tDb
    .deleteFrom("escalation_rules")
    .where("id", "=", ruleId)
    .executeTakeFirst();

  return result.numDeletedRows > 0n;
}

/** Check whether a queue row exists. */
export async function queueExists(
  tDb: Kysely<TenantDatabase>,
  queueId: string,
): Promise<boolean> {
  const row = await tDb
    .selectFrom("queues")
    .select("id")
    .where("id", "=", queueId)
    .executeTakeFirst();
  return row !== undefined;
}

/** Fetch a single rule by id (for pre-delete audit metadata). */
export async function getRuleById(
  tDb: Kysely<TenantDatabase>,
  ruleId: string,
): Promise<EscalationRule | null> {
  const row = await tDb
    .selectFrom("escalation_rules")
    .selectAll()
    .where("id", "=", ruleId)
    .executeTakeFirst();
  return row ? mapRow(row) : null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface EscalationRuleRow {
  readonly id: string;
  readonly queue_id: string;
  readonly rule_type: string;
  readonly threshold_minutes: number;
  readonly action: string;
  readonly is_active: boolean;
  readonly created_at: Date;
}

function mapRow(row: EscalationRuleRow): EscalationRule {
  return {
    id: row.id,
    queueId: row.queue_id,
    // DB CHECK constraints guarantee the enum columns; the Zod parse
    // narrows the string columns without unsafe assertions.
    ruleType: escalationRuleTypeSchema.parse(row.rule_type),
    thresholdMinutes: row.threshold_minutes,
    action: escalationActionSchema.parse(row.action),
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

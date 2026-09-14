/**
 * Notification outbox: transactional enqueue and durable drain.
 *
 * Enqueue runs inside the caller's transaction so notification intent
 * is atomic with the ticket mutation. When no transaction is available,
 * enqueueNotificationDurable provides durable-but-not-atomic enqueue
 * directly on the Kysely instance.
 *
 * The drainer polls for pending rows, re-resolves recipients at drain
 * time (never stores a recipient list), and calls
 * notificationService.dispatch.
 *
 * Recipient re-resolution uses buildRecipientList from
 * notification-recipients.ts for lifecycle events (followup_added,
 * mention, ticket_created, ticket_closed, ticket_reopened,
 * ticket_assigned, ticket_escalated). Escalation recipients for
 * intake-originated events are resolved from OPS-encrypted IDs on
 * intake_form_fields.
 *
 * Mentioned pseudonyms (user IDs resolved from @mentions) are
 * OPS-encrypted in the outbox row because they reveal a volunteer
 * interaction graph on the ticket. The drainer decrypts them
 * transiently at dispatch time.
 *
 * Retries use exponential backoff via computeBackoffMs from the
 * existing job queue infrastructure. After max_attempts the row is
 * marked dead. Terminal rows (completed, dead) are cleaned after
 * RETENTION_DAYS, matching the pending_jobs convention.
 */

import type { Kysely, Transaction } from "kysely";
import { sql } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { NotificationService } from "./service.js";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import type {
  NotificationRecipient,
  NotificationRecipientList,
} from "../tickets/notification-recipients.js";
import { buildRecipientList } from "../tickets/notification-recipients.js";
import { resolveValidMentionIds as resolveMentions } from "../tickets/mentions.js";
import type { TicketAccessChecker } from "../tickets/access.js";
import type { WatchersService } from "../tickets/watchers.js";
import type { NoteTypeService } from "../tickets/note-type-service.js";
import { resolveEscalationTargets } from "../tickets/notification-recipients.js";
import { computeBackoffMs } from "../jobs/postgres-queue.js";
import { z } from "zod";
import type {
  NotificationEventType,
  TicketId,
  QueueId,
  IntakeFormId,
  NoteTypeId,
  EscalationRuleId,
  UserId,
  OrgId,
  OrgSchema,
  OrgSlug,
} from "@care-y/shared";
import {
  userIdSchema,
  RoleId,
  notificationEventTypeSchema,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max rows claimed per drain cycle. Keeps each cycle short. */
const DRAIN_BATCH_SIZE = 20;

/** Days to retain terminal (completed/dead) rows before cleanup. */
export const OUTBOX_RETENTION_DAYS = 7;

/** Default max delivery attempts before a row goes dead. */
const DEFAULT_MAX_ATTEMPTS = 5;

/** Base delay for exponential backoff between retries (ms). */
const BACKOFF_BASE_MS = 30_000; // 30 seconds

/** Maximum length for last_error column (no PII, no ciphertext). */
const MAX_ERROR_LENGTH = 200;

const recipientIdsSchema = z.array(userIdSchema);

// ---------------------------------------------------------------------------
// Outbox event types (all NotificationEventTypes the outbox handles)
// ---------------------------------------------------------------------------

export type OutboxEventType =
  | "ticket_created"
  | "ticket_escalated"
  | "ticket_assigned"
  | "ticket_closed"
  | "ticket_reopened"
  | "followup_added"
  | "mention";

// ---------------------------------------------------------------------------
// Enqueue (runs inside the caller's transaction or durably outside one)
// ---------------------------------------------------------------------------

export interface OutboxEnqueueInput {
  readonly eventType: OutboxEventType;
  readonly ticketId: TicketId;
  readonly queueId: QueueId;
  readonly formId: IntakeFormId | null;
  readonly actorUserId: UserId | null;
  readonly noteTypeId?: NoteTypeId;
  readonly encryptedMentionedPseudonyms?: Buffer;
  readonly escalationRuleId?: EscalationRuleId;
}

/**
 * Insert a notification intent into the outbox. Accepts both a
 * Transaction (for atomic enqueue inside the caller's transaction)
 * and a bare Kysely instance (for durable-but-not-atomic enqueue
 * after the mutation has already committed).
 *
 * When called with a Transaction the row becomes visible to the
 * drainer only when the transaction commits, guaranteeing atomicity
 * with the ticket mutation. When called with a Kysely instance the
 * row is written immediately.
 */
export async function enqueueNotification(
  db: Kysely<TenantDatabase> | Transaction<TenantDatabase>,
  input: OutboxEnqueueInput,
): Promise<void> {
  await db
    .insertInto("notification_outbox")
    .values({
      event_type: input.eventType,
      ticket_id: input.ticketId,
      queue_id: input.queueId,
      form_id: input.formId,
      actor_user_id: input.actorUserId,
      note_type_id: input.noteTypeId ?? null,
      encrypted_mentioned_pseudonyms:
        input.encryptedMentionedPseudonyms ?? null,
      escalation_rule_id: input.escalationRuleId ?? null,
      max_attempts: DEFAULT_MAX_ATTEMPTS,
    })
    .execute();
}

/**
 * Durable (non-atomic) enqueue alias. Kept for call-site readability
 * at sites where the intent is explicitly non-transactional.
 */
export const enqueueNotificationDurable: (
  db: Kysely<TenantDatabase>,
  input: OutboxEnqueueInput,
) => Promise<void> = enqueueNotification;

/**
 * Encrypt an array of mentioned pseudonyms (user IDs) using the
 * OPS-tier FieldEncryptor. Returns a Buffer suitable for storage in
 * the encrypted_mentioned_pseudonyms column. Returns undefined when
 * the array is empty (no storage needed).
 */
export function encryptMentionedPseudonyms(
  pseudonyms: readonly string[],
  fieldEncryptor: FieldEncryptor,
): Buffer | undefined {
  if (pseudonyms.length === 0) return undefined;
  return fieldEncryptor.encrypt(JSON.stringify(pseudonyms));
}

/**
 * Decrypt OPS-encrypted mentioned pseudonyms from a stored Buffer.
 * Returns the plain string array of user IDs. Used at drain time only.
 */
export function decryptMentionedPseudonyms(
  encrypted: Buffer,
  fieldEncryptor: FieldEncryptor,
): UserId[] {
  // care-y-ignore-next-line server-no-decrypt -- OPS-tier decryption: mentioned pseudonyms are server-side operational data encrypted with OPS_SECRETS_KEY
  const json = fieldEncryptor.decrypt(encrypted);
  const parsed: unknown = JSON.parse(json);
  // Parsed through the id schema rather than as bare strings, so the
  // values carry their brand from the decrypt boundary onward.
  return recipientIdsSchema.parse(parsed);
}

// ---------------------------------------------------------------------------
// Drain (called by the recurring job)
// ---------------------------------------------------------------------------

export interface OutboxDrainDeps {
  readonly notificationService: NotificationService;
  readonly fieldEncryptor: FieldEncryptor | null;
  readonly orgId: OrgId;
  readonly orgSchema: OrgSchema;
  readonly orgSlug: OrgSlug;
  /** Factory for creating a ticket access checker (needed for buildRecipientList). */
  readonly createTicketAccess: (
    tDb: Kysely<TenantDatabase>,
  ) => TicketAccessChecker;
  /** Factory for creating a watchers service (needed for buildRecipientList). */
  readonly createWatchersSvc: (
    tDb: Kysely<TenantDatabase>,
    access: TicketAccessChecker,
  ) => WatchersService;
  /** Factory for creating a note type service (needed for note-type escalation resolution). */
  readonly createNoteTypeSvc?: (tDb: Kysely<TenantDatabase>) => NoteTypeService;
  /** Factory for creating a queue permissions service (needed for escalation target resolution). */
  readonly createQueuePermissionsSvc?: (tDb: Kysely<TenantDatabase>) => {
    getQueueMembers(queueId: QueueId): Promise<UserId[]>;
  };
  /** Factory for creating a user service (needed for escalation target resolution). */
  readonly createUserSvc?: (tDb: Kysely<TenantDatabase>) => {
    listActiveIdsByRoleId(roleId: string): Promise<Set<UserId>>;
    listActiveKeyWrapHolderIds(ticketId: TicketId): Promise<Set<UserId>>;
    filterByRoleThreshold(
      userIds: UserId[],
      minRole: string,
    ): Promise<UserId[]>;
  };
  /** Escalation rule service deps for rule-based escalation (getManagerIds, getQueueWatcherIds). */
  readonly getManagerIds?: (tDb: Kysely<TenantDatabase>) => Promise<UserId[]>;
  readonly getQueueWatcherIds?: (
    tDb: Kysely<TenantDatabase>,
    queueId: QueueId,
  ) => Promise<UserId[]>;
}

/**
 * Claim and process pending outbox rows for one tenant schema.
 *
 * Uses FOR UPDATE SKIP LOCKED so multiple server instances can drain
 * concurrently without conflicts. Each claimed row is processed
 * individually: re-resolve recipients, dispatch, mark terminal or
 * schedule retry.
 *
 * Returns the number of rows processed (for logging).
 */
export async function drainOutbox(
  db: Kysely<TenantDatabase>,
  deps: OutboxDrainDeps,
): Promise<number> {
  // One statement = one transaction: locks hold through the status flip.
  const rows = await db
    .updateTable("notification_outbox")
    .set({ status: "active" })
    .where("id", "in", (eb) =>
      eb
        .selectFrom("notification_outbox")
        .select("id")
        .where("status", "=", "pending")
        // Compared in SQL rather than against the application clock.
        // next_attempt_at is written by the database (it defaults to
        // now(), and retries schedule off it), so comparing it to a
        // Date built in this process measures two different clocks on
        // two different hosts. When the database clock runs ahead, a
        // row is not yet eligible the moment after it is enqueued and
        // the drain skips it, leaving attempt_count at 0 until some
        // later pass picks it up.
        .where("next_attempt_at", "<=", sql<Date>`now()`)
        .orderBy("next_attempt_at", "asc")
        .limit(DRAIN_BATCH_SIZE)
        .forUpdate()
        .skipLocked(),
    )
    .returningAll()
    .execute();

  let processed = 0;

  for (const row of rows) {
    try {
      // Parsed rather than asserted: the column is text, and a row written
      // by an older or newer deploy could carry a value outside the union.
      const eventType = notificationEventTypeSchema.parse(row.event_type);
      const recipients = await resolveRecipients(db, eventType, row, deps);

      if (recipients.recipients.length > 0) {
        await deps.notificationService.dispatch(
          db,
          deps.orgId,
          deps.orgSchema,
          deps.orgSlug,
          eventType,
          row.ticket_id,
          row.queue_id,
          recipients,
        );
      }

      // Success: mark completed
      await db
        .updateTable("notification_outbox")
        .set({
          status: "completed",
          completed_at: new Date(),
          attempt_count: row.attempt_count + 1,
        })
        .where("id", "=", row.id)
        .execute();
    } catch (err: unknown) {
      const nextAttempt = row.attempt_count + 1;
      const errorMsg = classifyOutboxError(err);

      if (nextAttempt >= row.max_attempts) {
        // Exhausted retries, mark dead
        await db
          .updateTable("notification_outbox")
          .set({
            status: "dead",
            failed_at: new Date(),
            attempt_count: nextAttempt,
            last_error: errorMsg,
          })
          .where("id", "=", row.id)
          .execute();
      } else {
        // Schedule retry with exponential backoff
        const delayMs = computeBackoffMs(
          "exponential",
          nextAttempt,
          BACKOFF_BASE_MS,
        );
        const nextAttemptAt = new Date(Date.now() + delayMs);

        await db
          .updateTable("notification_outbox")
          .set({
            status: "pending",
            attempt_count: nextAttempt,
            next_attempt_at: nextAttemptAt,
            last_error: errorMsg,
          })
          .where("id", "=", row.id)
          .execute();
      }
    }

    processed++;
  }

  // Retention cleanup: delete terminal rows older than RETENTION_DAYS.
  // Piggybacks on the drain cycle (same as pending_jobs cleanup).
  const cutoff = new Date(
    Date.now() - OUTBOX_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  await db
    .deleteFrom("notification_outbox")
    .where("status", "in", ["completed", "dead"])
    .where((eb) =>
      eb.or([eb("completed_at", "<", cutoff), eb("failed_at", "<", cutoff)]),
    )
    .execute();

  return processed;
}

// ---------------------------------------------------------------------------
// Outbox row type (used internally for recipient resolution dispatch)
// ---------------------------------------------------------------------------

interface OutboxRow {
  readonly ticket_id: TicketId;
  readonly queue_id: QueueId;
  readonly form_id: IntakeFormId | null;
  readonly actor_user_id: UserId | null;
  readonly note_type_id: NoteTypeId | null;
  readonly encrypted_mentioned_pseudonyms: Buffer | null;
  readonly escalation_rule_id: EscalationRuleId | null;
}

// ---------------------------------------------------------------------------
// Recipient resolution (re-resolved at drain time, never stored)
// ---------------------------------------------------------------------------

/**
 * Re-resolve notification recipients from outbox row metadata.
 * This runs at drain time, not enqueue time, so recipient lists are
 * never persisted in plaintext.
 *
 * Event type dispatch:
 * - ticket_created (intake): queue watchers only, no actor exclusion
 * - ticket_escalated (intake): OPS-encrypted escalation recipients from
 *   intake_form_fields, fallback to queue watchers
 * - ticket_escalated (rule): manager IDs or queue watchers per rule action
 * - followup_added, mention, ticket_assigned, ticket_closed,
 *   ticket_reopened: full buildRecipientList (owner, ticket watchers,
 *   queue watchers, mentions, note-type escalation targets)
 */
async function resolveRecipients(
  db: Kysely<TenantDatabase>,
  eventType: NotificationEventType,
  row: OutboxRow,
  deps: OutboxDrainDeps,
): Promise<NotificationRecipientList> {
  // Intake-originated escalation (has form_id, no escalation_rule_id)
  if (
    eventType === "ticket_escalated" &&
    row.form_id !== null &&
    row.escalation_rule_id === null
  ) {
    return resolveIntakeEscalationRecipients(
      db,
      row.form_id,
      row.queue_id,
      row.actor_user_id,
      deps.fieldEncryptor,
    );
  }

  // Rule-based escalation (has escalation_rule_id)
  if (eventType === "ticket_escalated" && row.escalation_rule_id !== null) {
    return resolveRuleEscalationRecipients(db, row.escalation_rule_id, deps);
  }

  // Intake ticket_created (no actor, no mentions, no note type)
  if (
    eventType === "ticket_created" &&
    row.actor_user_id === null &&
    row.form_id !== null
  ) {
    return resolveQueueWatcherRecipients(db, row.queue_id, null);
  }

  // Lifecycle events: use buildRecipientList for full resolution
  return resolveLifecycleRecipients(db, eventType, row, deps);
}

/**
 * Resolve recipients for lifecycle events (ticket_created by a volunteer,
 * ticket_closed, ticket_reopened, ticket_assigned, followup_added, mention)
 * using the shared buildRecipientList.
 */
async function resolveLifecycleRecipients(
  db: Kysely<TenantDatabase>,
  _eventType: NotificationEventType,
  row: OutboxRow,
  deps: OutboxDrainDeps,
): Promise<NotificationRecipientList> {
  // Resolve the ticket's assigned_to for the recipient builder
  const ticket = await db
    .selectFrom("tickets")
    .select(["id", "assigned_to", "queue_id"])
    .where("id", "=", row.ticket_id)
    .executeTakeFirst();

  if (!ticket) {
    // Ticket was deleted between enqueue and drain (cascade removes
    // the outbox row, but race windows exist). Return empty.
    return { recipients: [] };
  }

  // Decrypt mentioned pseudonyms if present
  let mentionedPseudonyms: string[] = [];
  if (
    row.encrypted_mentioned_pseudonyms !== null &&
    deps.fieldEncryptor !== null
  ) {
    mentionedPseudonyms = decryptMentionedPseudonyms(
      row.encrypted_mentioned_pseudonyms,
      deps.fieldEncryptor,
    );
  }

  // Resolve note-type escalation targets if a note_type_id is present
  const escalationUserIds = await resolveNoteTypeEscalationForDrain(
    db,
    row.note_type_id,
    row.ticket_id,
    deps,
  );

  // Build the access checker and watchers service for buildRecipientList
  const access = deps.createTicketAccess(db);
  const watchers = deps.createWatchersSvc(db, access);

  const actorUserId = row.actor_user_id;

  return buildRecipientList(
    {
      getTicketWatchers: async (ticketId) =>
        watchers.getTicketWatchers(ticketId),
      getQueueWatchers: async (queueId) => watchers.getQueueWatchers(queueId),
      resolveValidMentions: async (ids) =>
        resolveAndValidateMentionIds(db, ids),
    },
    {
      assignedTo: ticket.assigned_to,
      queueId: ticket.queue_id,
      id: ticket.id,
    },
    mentionedPseudonyms,
    actorUserId,
    escalationUserIds,
  );
}

// Mention validation delegates to the shared resolveValidMentionIds from
// tickets/mentions.ts. The outbox drain path parses the raw string IDs
// through recipientIdsSchema first (the shared function takes UserId[]).
async function resolveAndValidateMentionIds(
  db: Kysely<TenantDatabase>,
  userIds: string[],
): Promise<UserId[]> {
  if (userIds.length === 0) return [];
  const parsed = recipientIdsSchema.parse(userIds);
  return resolveMentions(db, parsed);
}

/**
 * Resolve note-type escalation targets at drain time. This is the only
 * resolution site; the router enqueues the outbox row and never
 * resolves targets itself.
 */
async function resolveNoteTypeEscalationForDrain(
  db: Kysely<TenantDatabase>,
  noteTypeId: NoteTypeId | null,
  ticketId: TicketId,
  deps: OutboxDrainDeps,
): Promise<UserId[] | undefined> {
  if (noteTypeId === null) return undefined;
  if (!deps.createNoteTypeSvc) return undefined;

  const ntSvc = deps.createNoteTypeSvc(db);
  const ctx = await ntSvc.getEscalationContext(noteTypeId);
  if (!ctx) return undefined;

  if (!deps.createQueuePermissionsSvc || !deps.createUserSvc) return undefined;

  const qp = deps.createQueuePermissionsSvc(db);
  const userSvc = deps.createUserSvc(db);

  const userIds = await resolveEscalationTargets(
    ctx.targets,
    {
      getUsersByRole: async (role) => {
        const roleId = role === "admin" ? RoleId.ADMIN : RoleId.MANAGER;
        return [...(await userSvc.listActiveIdsByRoleId(roleId))];
      },
      // eslint-disable-next-line @typescript-eslint/require-await -- stub for future permission-based targeting
      getUsersByPermission: async () => [],
      getQueueMembers: async (queueId) => qp.getQueueMembers(queueId),
      getTicketKeyWrapHolders: async (tid) => [
        ...(await userSvc.listActiveKeyWrapHolderIds(tid)),
      ],
    },
    ticketId,
  );

  if (userIds.length === 0) return undefined;

  if (ctx.minViewRole === RoleId.VOLUNTEER) return userIds;

  const filtered = await userSvc.filterByRoleThreshold(
    userIds,
    ctx.minViewRole,
  );

  return filtered.length > 0 ? [...filtered] : undefined;
}

/**
 * Resolve escalation recipients for rule-based escalation events.
 * Reads the rule's action and resolves managers or queue watchers.
 */
async function resolveRuleEscalationRecipients(
  db: Kysely<TenantDatabase>,
  ruleId: EscalationRuleId,
  deps: OutboxDrainDeps,
): Promise<NotificationRecipientList> {
  const rule = await db
    .selectFrom("escalation_rules")
    .select(["action", "queue_id"])
    .where("id", "=", ruleId)
    .executeTakeFirst();

  if (!rule) return { recipients: [] };

  const recipientUserIds =
    rule.action === "notify_managers" && deps.getManagerIds
      ? await deps.getManagerIds(db)
      : deps.getQueueWatcherIds
        ? await deps.getQueueWatcherIds(db, rule.queue_id)
        : [];

  const source: "note_escalation" | "queue_watcher" =
    rule.action === "notify_managers" ? "note_escalation" : "queue_watcher";

  const recipients: NotificationRecipient[] = recipientUserIds.map(
    (userId): NotificationRecipient => ({
      userId,
      source,
    }),
  );

  return { recipients };
}

/**
 * Build recipient list from queue watchers, excluding the actor if present.
 */
async function resolveQueueWatcherRecipients(
  db: Kysely<TenantDatabase>,
  queueId: QueueId,
  actorUserId: UserId | null,
): Promise<NotificationRecipientList> {
  const watchers = await db
    .selectFrom("queue_watchers")
    .select("user_id")
    .where("queue_id", "=", queueId)
    .execute();

  const recipients: NotificationRecipient[] = watchers
    .filter((w) => w.user_id !== actorUserId)
    .map((w): NotificationRecipient => ({
      userId: w.user_id,
      source: "queue_watcher",
    }));

  return { recipients };
}

/**
 * Resolve escalation recipients by decrypting OPS-encrypted IDs from
 * intake_form_fields. Falls back to queue watchers when no escalation
 * recipients are configured.
 *
 * This handles the intake-originated ticket_escalated event only.
 */
async function resolveIntakeEscalationRecipients(
  db: Kysely<TenantDatabase>,
  formId: IntakeFormId,
  queueId: QueueId,
  actorUserId: UserId | null,
  fieldEncryptor: FieldEncryptor | null,
): Promise<NotificationRecipientList> {
  const escalationFields = await db
    .selectFrom("intake_form_fields")
    .select("encrypted_escalation_recipient_ids")
    .where("form_id", "=", formId)
    .where("role", "=", "escalation")
    .execute();

  const recipientIds = new Set<UserId>();
  for (const field of escalationFields) {
    if (
      field.encrypted_escalation_recipient_ids !== null &&
      fieldEncryptor !== null
    ) {
      // care-y-ignore-next-line server-no-decrypt -- OPS-tier decryption: escalation recipient IDs are server-side operational data encrypted with OPS_SECRETS_KEY
      const json = fieldEncryptor.decrypt(
        field.encrypted_escalation_recipient_ids,
      );
      const parsed: unknown = JSON.parse(json);
      const ids = recipientIdsSchema.parse(parsed);
      for (const rid of ids) {
        recipientIds.add(rid);
      }
    }
  }

  if (recipientIds.size > 0) {
    const recipients: NotificationRecipient[] = [...recipientIds]
      .filter((uid) => uid !== actorUserId)
      .map((uid): NotificationRecipient => ({
        userId: uid,
        source: "escalation_recipient",
      }));
    return { recipients };
  }

  // Fallback: queue watchers
  return resolveQueueWatcherRecipients(db, queueId, actorUserId);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a content-free classification for the last_error column. Raw
 * messages never persist because driver and provider errors can echo
 * column values or phone numbers; the error name plus the Postgres
 * error code keeps the retry diagnostics without carrying content.
 */
function classifyOutboxError(err: unknown): string {
  if (!(err instanceof Error)) return "unknown";
  const maybeCode: unknown = "code" in err ? err.code : undefined;
  const classified =
    typeof maybeCode === "string" ? `${err.name}:${maybeCode}` : err.name;
  return classified.slice(0, MAX_ERROR_LENGTH);
}

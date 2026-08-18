/**
 * Intake ticket creation service.
 *
 * Accepts ciphertext-only input from the public intake form, creates a
 * client + ticket + optional follow-up + interim org-key wrap in one
 * transaction. The server never holds plaintext or key material.
 *
 * Post-commit: dispatches ticket_created notifications to queue
 * volunteers (best-effort, same as the telephony path).
 */

import crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { NotificationService } from "../notifications/service.js";
import type {
  NotificationRecipient,
  NotificationRecipientList,
} from "../tickets/notification-recipients.js";
import { generateAlias } from "../telephony/models/alias-generator.js";
import { sealString } from "../telephony/crypto-helpers.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import { ValidationError } from "../errors.js";

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

/**
 * Thrown when org_config.intake_queue_id is null, meaning the org has
 * not configured an intake queue. The route logs a warning and returns
 * a generic INTERNAL error to the client (no org internals leaked).
 */
export class IntakeQueueNotConfiguredError extends ValidationError {
  constructor() {
    super("Intake queue is not configured");
  }
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface IntakeTicketInput {
  readonly ticketId: string;
  readonly followUpId: string | null;
  readonly encryptedTitle: Buffer;
  readonly encryptedDescription: Buffer;
  readonly encryptedMessage: Buffer | null;
  readonly encryptedFormResponse: Buffer;
  readonly formId: string | null;
  readonly wrappedTk: Buffer;
}

export interface IntakeTicketResult {
  readonly ticketId: string;
  readonly clientAlias: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Creates an intake ticket from ciphertext input.
 *
 * Resolves intake_queue_id from org_config (service-layer resolution,
 * same pattern as telephony/webhook-dispatch.ts). Throws
 * IntakeQueueNotConfiguredError when null.
 *
 * All six DB writes run inside one transaction. After commit, a
 * best-effort ticket_created notification dispatches to queue
 * volunteers. Dispatch failure logs and does not roll back the ticket.
 */
export async function createIntakeTicket(
  db: Kysely<TenantDatabase>,
  deps: {
    readonly notificationService: NotificationService;
    readonly sealedBox: SealedBoxEncryptor;
    readonly orgSchema: string;
    readonly orgSlug: string;
  },
  input: IntakeTicketInput,
): Promise<IntakeTicketResult> {
  // Resolve intake queue from org_config (service-layer, no route DB access)
  const orgConfig = await db
    .selectFrom("org_config")
    .select("intake_queue_id")
    .executeTakeFirst();

  const intakeQueueId = orgConfig?.intake_queue_id ?? null;
  if (intakeQueueId === null) {
    throw new IntakeQueueNotConfiguredError();
  }

  // Run all inserts in one transaction
  const result = await db.transaction().execute(async (trx) => {
    // 1. Client with generated alias sealed under the org public key
    //    (sealString zeroes the intermediate Buffer, matching client-repo.ts).
    //    alias_hash is NULL: no browser session exists to compute it; it is
    //    lazily backfilled on first client-side unseal (same as telephony clients).
    const alias = await generateAlias(trx);
    const sealedAlias = sealString(deps.sealedBox, alias);

    const client = await trx
      // care-y-ignore-next-line no-plaintext-db-write -- writes ciphertext only, see the value list below
      .insertInto("clients")
      // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is sealed ciphertext from sealString above; alias_hash is null; phone_id is a FK, not a number
      .values({
        encrypted_alias: sealedAlias,
        alias_hash: null,
        phone_id: null,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    // 2. Ticket with client-minted id (AAD-bound)
    await trx
      .insertInto("tickets")
      .values({
        id: input.ticketId,
        client_id: client.id,
        queue_id: intakeQueueId,
        encrypted_title: input.encryptedTitle,
        encrypted_description: input.encryptedDescription,
        key_generation: crypto.randomUUID(),
        priority: "normal",
      })
      .executeTakeFirstOrThrow();

    // 3. Follow-up (only when encryptedMessage is present)
    if (input.encryptedMessage !== null && input.followUpId !== null) {
      await trx
        .insertInto("followups")
        .values({
          id: input.followUpId,
          ticket_id: input.ticketId,
          source: "client",
          type: "message",
          encrypted_content: input.encryptedMessage,
          created_by: null,
          key_generation: null,
        })
        .executeTakeFirstOrThrow();
    }

    // 4. Interim org-key wrap (algorithm defaults to "sealed-box-org-v1")
    await trx
      .insertInto("intake_key_wraps")
      .values({
        ticket_id: input.ticketId,
        wrapped_tk: input.wrappedTk,
      })
      .executeTakeFirstOrThrow();

    // 5. Form response row (only for custom forms with a non-null formId)
    if (input.formId !== null) {
      // Verify the formId matches the queue's current binding
      const binding = await trx
        .selectFrom("queue_intake_forms")
        .select("form_id")
        .where("queue_id", "=", intakeQueueId)
        .executeTakeFirst();

      if (binding?.form_id !== input.formId) {
        throw new ValidationError("Form binding is stale or invalid");
      }

      await trx
        .insertInto("intake_form_responses")
        .values({
          ticket_id: input.ticketId,
          form_id: input.formId,
          encrypted_response: input.encryptedFormResponse,
        })
        .executeTakeFirstOrThrow();
    }

    // 6. Return result
    return { ticketId: input.ticketId, clientAlias: alias };
  });

  // Post-commit: best-effort notification dispatch (no actor, same as telephony)
  dispatchTicketCreated(db, deps, intakeQueueId, result.ticketId);

  return result;
}

// ---------------------------------------------------------------------------
// Notification helper (fire-and-forget, best-effort)
// ---------------------------------------------------------------------------

/**
 * Dispatches ticket_created to queue volunteers. Best-effort: logs on
 * failure, never throws. There is no authenticated actor, so the
 * recipient list includes all queue watchers with no exclusion.
 */
function dispatchTicketCreated(
  db: Kysely<TenantDatabase>,
  deps: {
    readonly notificationService: NotificationService;
    readonly orgSchema: string;
    readonly orgSlug: string;
  },
  queueId: string,
  ticketId: string,
): void {
  void (async () => {
    try {
      // Build a minimal recipient list from queue watchers.
      // No actor to exclude; all queue watchers are notified.
      const watchers = await db
        .selectFrom("queue_watchers")
        .select("user_id")
        .where("queue_id", "=", queueId)
        .execute();

      const recipients: NotificationRecipientList = {
        recipients: watchers.map((w): NotificationRecipient => ({
          userId: w.user_id,
          source: "queue_watcher",
        })),
      };

      await deps.notificationService.dispatch(
        db,
        deps.orgSchema,
        deps.orgSlug,
        "ticket_created",
        ticketId,
        queueId,
        recipients,
      );
    } catch (err: unknown) {
      console.error(
        "Intake notification dispatch failed:",
        err instanceof Error ? err.message : String(err),
      );
    }
  })();
}

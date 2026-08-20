/**
 * Intake ticket creation service.
 *
 * Accepts ciphertext-only input from the public intake form, creates a
 * client + ticket + optional follow-up + interim org-key wrap in one
 * transaction. The server never holds plaintext or key material.
 *
 * Routing precedence (ADR-068):
 *   resolvedQueueId (validated against field allow-list) >
 *   form destination_queue_id >
 *   org_config.intake_queue_id
 *
 * Post-commit: dispatches ticket_created notifications to queue
 * volunteers (best-effort, same as the telephony path). When escalation
 * metadata is present, dispatches immediate escalation notifications to
 * configured recipients.
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
import { ErrorCode } from "@care-y/shared";
import type { FieldEncryptor } from "../crypto/field-encryptor.js";
import { z } from "zod";
import type {
  AccountRegistrationInput,
  AccountServiceDeps,
} from "./account-service.js";
import { createAccount } from "./account-service.js";
import { storeClientCopy } from "./portal-message-service.js";
import type { EciesTripleBuffers } from "./portal-message-service.js";

const recipientIdsSchema = z.array(z.uuid());

// ---------------------------------------------------------------------------
// Custom errors
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

/**
 * Thrown when org_config.web_intake_enabled is false (kill switch).
 * The route maps this to a NOT_FOUND for the client (no internals leaked).
 */
export class IntakeDisabledError extends ValidationError {
  constructor() {
    super(ErrorCode.INTAKE_DISABLED);
  }
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface IntakeAccountInput {
  readonly registration: AccountRegistrationInput;
  readonly selfCopy: EciesTripleBuffers | null;
}

export interface IntakeTicketInput {
  readonly ticketId: string;
  readonly followUpId: string | null;
  readonly encryptedTitle: Buffer;
  readonly encryptedDescription: Buffer;
  readonly encryptedMessage: Buffer | null;
  readonly encryptedFormResponse: Buffer;
  readonly formId: string | null;
  readonly wrappedTk: Buffer;
  readonly resolvedQueueId: string | null;
  readonly resolvedPriority: "low" | "normal" | "high" | "urgent" | null;
  readonly resolvedEscalationLevel: string | null;
  readonly account: IntakeAccountInput | null;
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
 * IntakeQueueNotConfiguredError when null. Throws IntakeDisabledError
 * when web_intake_enabled is false.
 *
 * Routing: resolvedQueueId (validated against field allow-list) >
 * form destination_queue_id > org_config.intake_queue_id.
 *
 * All DB writes run inside one transaction. After commit, a best-effort
 * ticket_created notification dispatches to queue volunteers. Escalation
 * notifications dispatch when resolvedEscalationLevel is present.
 */
export async function createIntakeTicket(
  db: Kysely<TenantDatabase>,
  deps: {
    readonly notificationService: NotificationService;
    readonly sealedBox: SealedBoxEncryptor;
    readonly fieldEncryptor?: FieldEncryptor;
    readonly orgSchema: string;
    readonly orgSlug: string;
    readonly accountServiceDeps?: AccountServiceDeps;
  },
  input: IntakeTicketInput,
): Promise<IntakeTicketResult> {
  // Check kill switch
  const orgConfig = await db
    .selectFrom("org_config")
    .select(["intake_queue_id", "web_intake_enabled"])
    .executeTakeFirst();

  if (orgConfig?.web_intake_enabled === false) {
    throw new IntakeDisabledError();
  }

  const orgIntakeQueueId = orgConfig?.intake_queue_id ?? null;
  if (orgIntakeQueueId === null) {
    throw new IntakeQueueNotConfiguredError();
  }

  // Resolve destination queue via routing precedence
  let destinationQueueId = orgIntakeQueueId;
  let formDestinationQueueId: string | null = null;

  // Load form metadata when a formId is provided
  if (input.formId !== null) {
    const formRow = await db
      .selectFrom("intake_forms")
      .select(["id", "is_active", "destination_queue_id"])
      .where("id", "=", input.formId)
      .executeTakeFirst();

    if (formRow?.is_active !== true) {
      throw new ValidationError("Form is not active or does not exist");
    }

    formDestinationQueueId = formRow.destination_queue_id;

    if (formDestinationQueueId !== null) {
      destinationQueueId = formDestinationQueueId;
    }
  }

  // Validate and apply field-level queue routing
  if (input.resolvedQueueId !== null) {
    // Validate against the form's field-level routing allow-list
    if (input.formId !== null) {
      const routingFields = await db
        .selectFrom("intake_form_fields")
        .select("routing_queue_ids")
        .where("form_id", "=", input.formId)
        .where("role", "=", "queue-routing")
        .execute();

      const allowedQueueIds = new Set<string>();
      for (const field of routingFields) {
        if (field.routing_queue_ids !== null) {
          for (const qid of field.routing_queue_ids) {
            allowedQueueIds.add(qid);
          }
        }
      }

      if (!allowedQueueIds.has(input.resolvedQueueId)) {
        throw new ValidationError(
          "Resolved queue id is not in the form field allow-list",
        );
      }
    } else {
      // No form context: cannot validate routing, reject
      throw new ValidationError(
        "Queue routing requires a form with a queue-routing role field",
      );
    }

    destinationQueueId = input.resolvedQueueId;
  }

  // Resolve priority
  const priority = input.resolvedPriority ?? "normal";

  // Run all inserts in one transaction
  const result = await db.transaction().execute(async (trx) => {
    // 1. Client with generated alias sealed under the org public key
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
        queue_id: destinationQueueId,
        encrypted_title: input.encryptedTitle,
        encrypted_description: input.encryptedDescription,
        key_generation: crypto.randomUUID(),
        priority,
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
      await trx
        .insertInto("intake_form_responses")
        .values({
          ticket_id: input.ticketId,
          form_id: input.formId,
          encrypted_response: input.encryptedFormResponse,
        })
        .executeTakeFirstOrThrow();
    }

    // 6. Account creation (opt-in at intake, inside the same transaction)
    if (input.account !== null && deps.accountServiceDeps != null) {
      await createAccount(
        trx,
        deps.accountServiceDeps,
        client.id,
        input.account.registration,
      );

      // Seed the account thread with the intake message when selfCopy is present
      if (input.account.selfCopy !== null) {
        // Resolve the follow-up id for the self copy: the intake message
        // follow-up when one exists (the client wrote a message),
        // otherwise no selfCopy (no follow-up to bind to).
        const selfCopyFollowUpId = input.followUpId;
        if (selfCopyFollowUpId !== null) {
          // Fetch the new account channel row id (just created by createAccount)
          const accountChannel = await trx
            .selectFrom("portal_channels")
            .select("id")
            .where("client_id", "=", client.id)
            .where("status", "=", "active")
            .where("kind", "=", "account")
            .executeTakeFirstOrThrow();

          await storeClientCopy(
            trx,
            accountChannel.id,
            selfCopyFollowUpId,
            input.account.selfCopy,
            "from_client",
          );
        }
      }
    }

    // 7. Return result
    return { ticketId: input.ticketId, clientAlias: alias };
  });

  // Post-commit: best-effort notification dispatch (no actor, same as telephony)
  dispatchTicketCreated(db, deps, destinationQueueId, result.ticketId);

  // Post-commit: escalation dispatch when escalation metadata is present
  if (input.resolvedEscalationLevel !== null && input.formId !== null) {
    dispatchEscalationAlert(
      db,
      deps,
      input.formId,
      destinationQueueId,
      result.ticketId,
      deps.fieldEncryptor ?? null,
    );
  }

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

/**
 * Dispatches escalation alert to configured recipients or destination queue
 * watchers. Best-effort: logs on failure, never throws. No PII in the
 * notification body (server never holds plaintext content).
 */
function dispatchEscalationAlert(
  db: Kysely<TenantDatabase>,
  deps: {
    readonly notificationService: NotificationService;
    readonly orgSchema: string;
    readonly orgSlug: string;
  },
  formId: string,
  queueId: string,
  ticketId: string,
  encryptor: FieldEncryptor | null,
): void {
  void (async () => {
    try {
      // Find escalation-role fields and decrypt their OPS-encrypted recipient ids
      const escalationFields = await db
        .selectFrom("intake_form_fields")
        .select("encrypted_escalation_recipient_ids")
        .where("form_id", "=", formId)
        .where("role", "=", "escalation")
        .execute();

      const recipientIds = new Set<string>();
      for (const field of escalationFields) {
        if (
          field.encrypted_escalation_recipient_ids !== null &&
          encryptor !== null
        ) {
          // care-y-ignore-next-line server-no-decrypt -- OPS-tier decryption: escalation recipient IDs are server-side operational data encrypted with OPS_SECRETS_KEY
          const json = encryptor.decrypt(
            field.encrypted_escalation_recipient_ids,
          );
          const parsed: unknown = JSON.parse(json);
          const ids = recipientIdsSchema.parse(parsed);
          for (const rid of ids) {
            recipientIds.add(rid);
          }
        }
      }

      let recipients: NotificationRecipientList;

      if (recipientIds.size > 0) {
        // Use configured escalation recipients
        recipients = {
          recipients: [...recipientIds].map((uid): NotificationRecipient => ({
            userId: uid,
            source: "escalation_recipient",
          })),
        };
      } else {
        // Fallback: destination queue's watchers
        const watchers = await db
          .selectFrom("queue_watchers")
          .select("user_id")
          .where("queue_id", "=", queueId)
          .execute();

        recipients = {
          recipients: watchers.map((w): NotificationRecipient => ({
            userId: w.user_id,
            source: "queue_watcher",
          })),
        };
      }

      await deps.notificationService.dispatch(
        db,
        deps.orgSchema,
        deps.orgSlug,
        "ticket_escalated",
        ticketId,
        queueId,
        recipients,
      );
    } catch (err: unknown) {
      console.error(
        "Intake escalation dispatch failed:",
        err instanceof Error ? err.message : String(err),
      );
    }
  })();
}

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
import type {
  TicketId,
  FollowupId,
  QueueId,
  ClientId,
  OrgId,
  OrgSchema,
  OrgSlug,
  IntakeFormId,
  UserId,
  ChannelSecret,
} from "@care-y/shared";
import { userIdSchema, newKeyGeneration } from "@care-y/shared";

const recipientIdsSchema = z.array(userIdSchema);

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

/**
 * Thrown when queue resolution produces null after exhausting the full
 * precedence chain (resolved routing queue, form destination queue,
 * org intake queue). For the built-in default form (formId null) this
 * means org_config.intake_queue_id is unset; for custom forms it means
 * neither the form nor the org configured a destination.
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

/**
 * Thrown when a form's closes_at is in the past (server clock).
 * The route maps this identically to the disabled/not-found shape
 * so the client cannot distinguish a closed form from a missing one
 * (enumeration-safe).
 */
export class IntakeFormClosedError extends ValidationError {
  constructor() {
    super(ErrorCode.INTAKE_FORM_CLOSED);
  }
}

/**
 * Thrown when the account branch is requested but AccountServiceDeps
 * were not provided. Defense-in-depth: the route builds deps via
 * requireAccountDeps when input.account is present, so this error
 * should never be reached in normal operation.
 */
export class IntakeAccountUnavailableError extends ValidationError {
  constructor() {
    super("Account registration is not available");
  }
}

/**
 * Thrown when a builtin-path submission (formId null, no active default
 * DB form) arrives while the org's builtin_default_enabled setting is
 * off. Trust boundary enforcement: the UI hides the form, but the
 * server must reject independently.
 */
export class BuiltinFormDisabledError extends ValidationError {
  constructor() {
    super(ErrorCode.BUILTIN_FORM_DISABLED);
  }
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface IntakeAccountInput {
  readonly registration: AccountRegistrationInput;
  readonly selfCopy: EciesTripleBuffers | null;
}

export interface IntakeContinuationInput {
  readonly channelId: ChannelSecret;
  readonly authHash: Buffer;
  readonly clientPublic: Buffer;
  readonly keyCheck: {
    readonly ephemeralPoint: Buffer;
    readonly nonce: Buffer;
    readonly ciphertext: Buffer;
  };
  readonly selfCopy: EciesTripleBuffers | null;
}

export interface IntakeTicketInput {
  readonly ticketId: TicketId;
  readonly followUpId: FollowupId | null;
  readonly encryptedTitle: Buffer;
  readonly encryptedDescription: Buffer;
  readonly encryptedMessage: Buffer | null;
  readonly encryptedFormResponse: Buffer;
  readonly formId: IntakeFormId | null;
  readonly wrappedTk: Buffer;
  readonly resolvedQueueId: QueueId | null;
  readonly resolvedPriority: "low" | "normal" | "high" | "urgent" | null;
  readonly resolvedEscalationLevel: string | null;
  readonly account: IntakeAccountInput | null;
  readonly continuation: IntakeContinuationInput | null;
}

export interface IntakeTicketResult {
  readonly ticketId: TicketId;
  readonly clientAlias: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Creates an intake ticket from ciphertext input.
 *
 * Queue routing precedence: resolvedQueueId (validated against field
 * allow-list) > form destination_queue_id > org_config.intake_queue_id.
 * IntakeQueueNotConfiguredError is raised only when the final resolved
 * queue is null (no level in the precedence chain produced a queue).
 * Forms with their own destination queue succeed even when the org-wide
 * intake queue is unset.
 *
 * Throws IntakeDisabledError when web_intake_enabled is false.
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
    readonly orgId: OrgId;
    readonly orgSchema: OrgSchema;
    readonly orgSlug: OrgSlug;
    readonly accountServiceDeps?: AccountServiceDeps;
  },
  input: IntakeTicketInput,
): Promise<IntakeTicketResult> {
  // Check kill switch and builtin default toggle
  const orgConfig = await db
    .selectFrom("org_config")
    .select([
      "intake_queue_id",
      "web_intake_enabled",
      "builtin_default_enabled",
    ])
    .executeTakeFirst();

  if (orgConfig?.web_intake_enabled === false) {
    throw new IntakeDisabledError();
  }

  const orgIntakeQueueId = orgConfig?.intake_queue_id ?? null;

  // Trust boundary: reject builtin-path submissions when the built-in
  // default form is disabled. A builtin-path submission has formId null
  // and no active default DB form. We check the toggle first; the
  // absence of a default DB form is implied by formId being null (the
  // client resolves formId from the server response before submitting).
  if (input.formId === null) {
    const builtinEnabled = orgConfig?.builtin_default_enabled ?? true;
    if (!builtinEnabled) {
      throw new BuiltinFormDisabledError();
    }
  }

  // Resolve destination queue via routing precedence:
  //   resolvedQueueId > form destination_queue_id > org intake_queue_id
  // The org intake queue is a fallback, not a prerequisite. Only raise
  // IntakeQueueNotConfiguredError when resolution produces null.
  let destinationQueueId: QueueId | null = orgIntakeQueueId;
  let formDestinationQueueId: QueueId | null = null;

  // Load form metadata when a formId is provided
  if (input.formId !== null) {
    const formRow = await db
      .selectFrom("intake_forms")
      .select(["id", "is_active", "destination_queue_id", "closes_at"])
      .where("id", "=", input.formId)
      .executeTakeFirst();

    if (formRow?.is_active !== true) {
      throw new ValidationError("Form is not active or does not exist");
    }

    // Reject submissions for a form whose closing date has passed
    if (
      formRow.closes_at != null &&
      formRow.closes_at.getTime() <= Date.now()
    ) {
      throw new IntakeFormClosedError();
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

      const allowedQueueIds = new Set<QueueId>();
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

  // After all resolution steps, a null destination means no queue was
  // configured anywhere in the precedence chain.
  if (destinationQueueId === null) {
    throw new IntakeQueueNotConfiguredError();
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
        key_generation: newKeyGeneration(),
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
    await handleAccountStep(trx, deps, input, client.id);

    // 7. Continuation channel (opt-in at intake, mutually exclusive with account)
    await handleContinuationStep(trx, input, client.id);

    // 8. Return result
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
// Transaction step: account creation
// ---------------------------------------------------------------------------

/**
 * Handles the optional account registration inside the intake transaction.
 * Fail-loud: when account input is present but deps are missing, throws
 * IntakeAccountUnavailableError (defense-in-depth; the route prevents this).
 */
async function handleAccountStep(
  trx: Kysely<TenantDatabase>,
  deps: {
    readonly accountServiceDeps?: AccountServiceDeps;
  },
  input: IntakeTicketInput,
  clientId: ClientId,
): Promise<void> {
  if (input.account === null) return;

  if (deps.accountServiceDeps == null) {
    throw new IntakeAccountUnavailableError();
  }

  await createAccount(
    trx,
    deps.accountServiceDeps,
    clientId,
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
        .where("client_id", "=", clientId)
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

// ---------------------------------------------------------------------------
// Transaction step: continuation channel
// ---------------------------------------------------------------------------

/**
 * Handles the optional continuation channel inside the intake transaction.
 * Only executes when account is null (account strictly dominates continuation).
 */
async function handleContinuationStep(
  trx: Kysely<TenantDatabase>,
  input: IntakeTicketInput,
  clientId: ClientId,
): Promise<void> {
  if (input.continuation === null || input.account !== null) return;

  const contChannelRow = await trx
    .insertInto("portal_channels")
    .values({
      client_id: clientId,
      channel_id: input.continuation.channelId,
      auth_hash: input.continuation.authHash,
      client_public: input.continuation.clientPublic,
      has_passphrase: false,
      key_check_ephemeral_point: input.continuation.keyCheck.ephemeralPoint,
      key_check_nonce: input.continuation.keyCheck.nonce,
      key_check_ciphertext: input.continuation.keyCheck.ciphertext,
      kind: "intake_continuation",
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  // Continuation channels behave identically to secure_link on the portal surface
  await trx
    .updateTable("clients")
    .set({ communication_tier: "secure_link" })
    .where("id", "=", clientId)
    .execute();

  // Store the self copy when a follow-up exists to bind to
  if (input.continuation.selfCopy !== null && input.followUpId !== null) {
    await storeClientCopy(
      trx,
      contChannelRow.id,
      input.followUpId,
      input.continuation.selfCopy,
      "from_client",
    );
  }
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
    readonly orgId: OrgId;
    readonly orgSchema: OrgSchema;
    readonly orgSlug: OrgSlug;
  },
  queueId: QueueId,
  ticketId: TicketId,
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
        deps.orgId,
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
    readonly orgId: OrgId;
    readonly orgSchema: OrgSchema;
    readonly orgSlug: OrgSlug;
  },
  formId: IntakeFormId,
  queueId: QueueId,
  ticketId: TicketId,
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

      const recipientIds = new Set<UserId>();
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
        deps.orgId,
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

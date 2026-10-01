/**
 * Org erasure: processes a deletion request end to end on the owner-role
 * pool. Runs only inside the org:erase CLI, never in the api process,
 * because dropping a schema and deleting platform rows need the owner role.
 *
 * Step order, each guarded by its timestamp column on the request row so a
 * rerun resumes from the first step still null:
 *
 *   1. claim       a session advisory lock on the request id, held on one
 *                  reserved connection until the run ends; then
 *                  status -> processing and orgs.is_active = false
 *   2. snapshot    the pre-deletion dump is owed until snapshot_at is set.
 *                  deploy/db/org-erase.sh takes it on the host and records
 *                  it through recordSnapshot; this service never takes it
 *                  and stops after the claim while it is owed
 *   3. blobs       every blob under the org's schema         (blobs_deleted_at)
 *   4. schema      DROP SCHEMA ... CASCADE                    (schema_dropped_at)
 *   5. rows        managed subaccount SID captured, then the org's platform
 *                  rows deleted                               (rows_deleted_at)
 *   6. subaccount  managed-mode subaccount closed            (subaccount_closed_at)
 *   7. audit       one org_erased platform audit row, status -> done
 *
 * A failing step throws ErasureStepError carrying the step name and the
 * cause's class name only. Nothing here logs.
 */

import { sql, type Kysely, type Selectable, type Updateable } from "kysely";
import {
  ErrorCode,
  orgSlugSchema,
  type DeletionRequestId,
  type OrgId,
  type OrgSchema,
  type StoredProviderId,
} from "@care-y/shared";
import type { DeletionRequestsTable, PlatformDatabase } from "../db/types.js";
import type { OrgBlobSweeper } from "../storage/store.js";
import type { SecretsEncryptor } from "../config/secrets.js";
import { twilioConfigSchema } from "../telephony/schemas.js";
import { getEnv } from "../env.js";
import { isPgUniqueViolation } from "../db/pg-errors.js";
import {
  ConflictError,
  ErasureStepError,
  InternalError,
  NotFoundError,
  TelephonyConfigError,
  ValidationError,
} from "../errors.js";

/** Step names as they appear in ErasureStepError and the CLI output. */
export type ErasureStep =
  "claim" | "snapshot" | "blobs" | "schema" | "rows" | "subaccount" | "audit";

/** Closes a managed-mode subaccount with the platform's master credentials. */
export type CloseSubaccount = (
  masterSid: string,
  masterAuthToken: string,
  subaccountSid: string,
) => Promise<void>;

export interface ErasureDeps {
  /** Owner-role pool (createAdminPool). The runtime role cannot drop a schema. */
  readonly platformDb: Kysely<PlatformDatabase>;
  /** Removes the org's blobs in step 3. */
  readonly blobSweeper: OrgBlobSweeper;
  /** Decrypts the org's telephony_config row in step 5, as telephony/factory.ts does. */
  readonly secretsEncryptor: SecretsEncryptor;
  /** closeTwilioSubaccount from telephony/twilio.ts in the CLI wiring. */
  readonly closeSubaccount: CloseSubaccount;
  readonly now: () => Date;
}

/** A request the CLI should process, with the org UUID its output lines carry. */
export interface DueErasure {
  readonly id: DeletionRequestId;
  readonly orgId: OrgId;
}

/** A request with the tenant schema the host wrapper snapshots for it. */
export interface ErasureTarget extends DueErasure {
  readonly orgSchema: OrgSchema;
}

/**
 * `erased`: every step is done and the audit row is written.
 * `busy`: the claim did not take the row. Another run holds its lock, or
 * another run finished it between listDue and the claim.
 * `snapshot-owed`: the row is claimed but snapshot_at is still null, so
 * nothing after the claim ran.
 */
export type ErasureOutcome = "erased" | "busy" | "snapshot-owed";

export interface ErasureService {
  /**
   * Pending rows whose cooling_off_until is at or before now, plus
   * processing rows a failed run left behind so they resume. Oldest
   * request first.
   */
  listDue(): Promise<DueErasure[]>;
  /**
   * The due requests (as listDue) whose snapshot_at is still null, with
   * the org's tenant schema. Oldest request first.
   */
  listSnapshotsOwed(): Promise<ErasureTarget[]>;
  /**
   * Makes the org with that slug due now, for the emergency path. A live
   * pending request is adopted: its cooling_off_until becomes now and its
   * requested_by is kept. A processing request is returned as it is. A new
   * row, with requested_by null, is inserted only when neither exists.
   * Throws ValidationError for a malformed slug and NotFoundError when no
   * org has it. No message repeats the slug.
   */
  requestImmediate(slug: string): Promise<ErasureTarget>;
  /**
   * Records that the host wrapper has stored the pre-deletion snapshot.
   * Sets snapshot_at only while it is null, so a rerun keeps the first
   * time. Throws NotFoundError when no request has that id.
   */
  recordSnapshot(requestId: DeletionRequestId): Promise<void>;
  /**
   * Runs every step whose timestamp is null, in order, updating the row
   * after each. Stops after the claim while the snapshot is still owed.
   * Throws ErasureStepError when a step fails; the row stays processing
   * and the next run resumes from that step.
   *
   * @param requestId - the deletion request to process
   * @param actor - recorded on the platform audit rows: a user id or "cli"
   */
  processRequest(
    requestId: DeletionRequestId,
    actor: string,
  ): Promise<ErasureOutcome>;
}

type RequestRow = Selectable<DeletionRequestsTable>;

interface ClaimedRequest {
  readonly row: RequestRow;
  /** Null once step 5 has deleted the orgs row. */
  readonly schema: OrgSchema | null;
}

/**
 * Runs one step and converts any failure into an ErasureStepError for that
 * step. An ErasureStepError thrown inside passes through unchanged.
 */
async function runStep<T>(step: ErasureStep, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (err instanceof ErasureStepError) throw err;
    throw ErasureStepError.fromCause(step, err);
  }
}

/** Writes a step's columns to the request row and returns the updated row. */
async function recordStep(
  db: Kysely<PlatformDatabase>,
  id: DeletionRequestId,
  patch: Updateable<DeletionRequestsTable>,
): Promise<RequestRow> {
  return db
    .updateTable("deletion_requests")
    .set(patch)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Takes the session-level advisory lock for a request on the connection
 * `conn` is bound to. Session level, not transaction level: the lock must
 * outlast the claim transaction and hold until every step has run, so a
 * timer run and a manual run never execute the same step twice.
 *
 * @returns true when the lock was obtained
 */
async function tryLockRequest(
  conn: Kysely<PlatformDatabase>,
  id: DeletionRequestId,
): Promise<boolean> {
  const result = await conn
    .selectNoFrom((eb) => [
      eb
        .fn<boolean>("pg_try_advisory_lock", [
          eb.fn<number>("hashtext", [eb.cast(eb.val(id), "text")]),
        ])
        .as("locked"),
    ])
    .executeTakeFirstOrThrow();
  return result.locked;
}

/** Releases the lock tryLockRequest took, on the same connection. */
async function unlockRequest(
  conn: Kysely<PlatformDatabase>,
  id: DeletionRequestId,
): Promise<void> {
  await conn
    .selectNoFrom((eb) => [
      eb
        .fn<boolean>("pg_advisory_unlock", [
          eb.fn<number>("hashtext", [eb.cast(eb.val(id), "text")]),
        ])
        .as("unlocked"),
    ])
    .execute();
}

/**
 * The managed-mode subaccount SID in an org's stored telephony config, or
 * null when the org brings its own account. Decrypts and validates the
 * blob the way telephony/factory.ts does and zeroes the plaintext buffer.
 * Only Twilio has a managed mode today; another provider that gains one
 * adds its own branch on the stored provider name.
 */
function managedSubaccountSid(
  provider: StoredProviderId,
  sealedConfig: Buffer,
  secretsEncryptor: SecretsEncryptor,
): string | null {
  if (provider !== "twilio") return null;

  // care-y-ignore-next-line server-no-decrypt -- operational credentials (Twilio config), not E2EE client data. Erasure reads the managed subaccount SID so it can close the subaccount after the row is deleted (OPS1 design).
  const plaintext = secretsEncryptor.decrypt(sealedConfig);
  let rawConfig: unknown;
  try {
    rawConfig = JSON.parse(plaintext.toString("utf-8"));
  } catch {
    throw new TelephonyConfigError("Telephony config blob is not valid JSON");
  } finally {
    plaintext.fill(0);
  }

  const parsed = twilioConfigSchema.safeParse(rawConfig);
  if (!parsed.success) {
    throw new TelephonyConfigError(
      "Invalid telephony config for provider twilio",
    );
  }
  return parsed.data.mode === "managed" ? parsed.data.accountSid : null;
}

/** Creates the erasure service over the owner-role pool. */
export function createErasureService(deps: ErasureDeps): ErasureService {
  const { platformDb } = deps;

  /**
   * Step 1 once the lock is held: status -> processing and the org
   * offboarded, in one transaction on the reserved connection.
   */
  async function claim(
    conn: Kysely<PlatformDatabase>,
    id: DeletionRequestId,
  ): Promise<ClaimedRequest | undefined> {
    return conn.transaction().execute(async (trx) => {
      const row = await trx
        .updateTable("deletion_requests")
        .set({ status: "processing" })
        .where("id", "=", id)
        .where("status", "in", ["pending", "processing"])
        .where("cooling_off_until", "<=", deps.now())
        .returningAll()
        .executeTakeFirst();
      if (row === undefined) return undefined;

      // Offboarding: both org lookups refuse an inactive org, so logins and
      // webhook processing stop here. The row is gone on a rerun after step 5.
      const org = await trx
        .updateTable("orgs")
        .set({ is_active: false })
        .where("id", "=", row.org_id)
        .returning("schema_name")
        .executeTakeFirst();
      return { row, schema: org?.schema_name ?? null };
    });
  }

  /**
   * Step 5 in one transaction: capture the managed subaccount SID, then
   * delete the org's platform rows. telephony_config and
   * inbound_email_domains reference orgs with ON DELETE RESTRICT, so they
   * go first. vapid_config is a platform singleton with no org rows.
   */
  async function deletePlatformRows(
    conn: Kysely<PlatformDatabase>,
    row: RequestRow,
  ): Promise<RequestRow> {
    return conn.transaction().execute(async (trx) => {
      const telephony = await trx
        .selectFrom("telephony_config")
        .select(["provider", "config"])
        .where("org_id", "=", row.org_id)
        .executeTakeFirst();
      const subaccountSid =
        telephony === undefined
          ? null
          : managedSubaccountSid(
              telephony.provider,
              telephony.config,
              deps.secretsEncryptor,
            );

      await trx
        .deleteFrom("telephony_config")
        .where("org_id", "=", row.org_id)
        .execute();
      await trx
        .deleteFrom("inbound_email_domains")
        .where("org_id", "=", row.org_id)
        .execute();
      // Jobs still queued for the org would fail against a missing org,
      // go dead and page the operator. Finished and dead rows age out on
      // the queue's own retention.
      await trx
        .deleteFrom("pending_jobs")
        .where(sql<string>`payload ->> 'orgId'`, "=", row.org_id)
        .where("status", "in", ["pending", "active"])
        .execute();
      await trx.deleteFrom("orgs").where("id", "=", row.org_id).execute();

      return recordStep(trx, row.id, {
        provider_subaccount_sid: subaccountSid,
        rows_deleted_at: deps.now(),
      });
    });
  }

  /**
   * Closes the subaccount with the master pair. The pair is read here and
   * nowhere else in erasure, and neither value is logged, stored or put in
   * an error message.
   */
  async function closeWithMasterCredentials(
    subaccountSid: string,
  ): Promise<void> {
    const env = getEnv();
    const masterSid = env.TWILIO_MASTER_SID;
    const masterAuthToken = env.TWILIO_MASTER_AUTH_TOKEN;
    if (
      masterSid === undefined ||
      masterSid === "" ||
      masterAuthToken === undefined ||
      masterAuthToken === ""
    ) {
      throw new TelephonyConfigError(
        "TWILIO_MASTER_SID and TWILIO_MASTER_AUTH_TOKEN must be set to close a managed subaccount",
      );
    }
    await deps.closeSubaccount(masterSid, masterAuthToken, subaccountSid);
  }

  /**
   * Step 6. Null SID (own account or no telephony): nothing to close. A
   * failed closure writes erasure_subaccount_failed and the error class to
   * last_error, then throws so the row stays processing for the next run.
   * Erasure of the data has already finished by this point.
   */
  async function closeSubaccount(
    conn: Kysely<PlatformDatabase>,
    row: RequestRow,
    actor: string,
  ): Promise<RequestRow> {
    const subaccountSid = row.provider_subaccount_sid;
    if (subaccountSid !== null) {
      try {
        await closeWithMasterCredentials(subaccountSid);
      } catch (err: unknown) {
        const failure = ErasureStepError.fromCause("subaccount", err);
        await conn.transaction().execute(async (trx) => {
          await trx
            .insertInto("platform_audit_log")
            .values({
              action: "erasure_subaccount_failed",
              org_id: row.org_id,
              actor,
            })
            .execute();
          await recordStep(trx, row.id, { last_error: failure.causeName });
        });
        throw failure;
      }
    }
    return recordStep(conn, row.id, { subaccount_closed_at: deps.now() });
  }

  /** Step 7: the audit row is written only when every step is recorded. */
  async function writeErasedAudit(
    conn: Kysely<PlatformDatabase>,
    row: RequestRow,
    actor: string,
  ): Promise<void> {
    const allDone =
      row.snapshot_at !== null &&
      row.blobs_deleted_at !== null &&
      row.schema_dropped_at !== null &&
      row.rows_deleted_at !== null &&
      row.subaccount_closed_at !== null;
    if (!allDone) {
      throw new InternalError(
        "erasure reached the audit step with a step unrecorded",
      );
    }
    await conn.transaction().execute(async (trx) => {
      await trx
        .insertInto("platform_audit_log")
        .values({ action: "org_erased", org_id: row.org_id, actor })
        .execute();
      await recordStep(trx, row.id, { status: "done" });
    });
  }

  /**
   * Steps 1 to 7 on the reserved connection that holds the request's
   * lock. Every statement of the run goes through that one connection.
   */
  async function runLocked(
    conn: Kysely<PlatformDatabase>,
    requestId: DeletionRequestId,
    actor: string,
  ): Promise<ErasureOutcome> {
    const claimed = await runStep("claim", async () => claim(conn, requestId));
    if (claimed === undefined) return "busy";

    let row = claimed.row;
    // The host wrapper records the snapshot before this run. Until it has,
    // nothing after the claim may happen.
    if (row.snapshot_at === null) return "snapshot-owed";

    const requireSchema = (): OrgSchema => {
      if (claimed.schema === null) {
        throw new NotFoundError("org row is gone before its schema was erased");
      }
      return claimed.schema;
    };

    if (row.blobs_deleted_at === null) {
      row = await runStep("blobs", async () => {
        await deps.blobSweeper.deleteOrg(requireSchema());
        return recordStep(conn, requestId, {
          blobs_deleted_at: deps.now(),
        });
      });
    }

    if (row.schema_dropped_at === null) {
      // DROP SCHEMA is transactional in Postgres, so the drop and its
      // timestamp commit together and a crash cannot leave one without
      // the other.
      row = await runStep("schema", async () =>
        conn.transaction().execute(async (trx) => {
          await trx.schema.dropSchema(requireSchema()).cascade().execute();
          return recordStep(trx, requestId, {
            schema_dropped_at: deps.now(),
          });
        }),
      );
    }

    if (row.rows_deleted_at === null) {
      const current = row;
      row = await runStep("rows", async () =>
        deletePlatformRows(conn, current),
      );
    }

    if (row.subaccount_closed_at === null) {
      const current = row;
      row = await runStep("subaccount", async () =>
        closeSubaccount(conn, current, actor),
      );
    }

    const finished = row;
    await runStep("audit", async () => writeErasedAudit(conn, finished, actor));
    return "erased";
  }

  return {
    async listDue() {
      const rows = await platformDb
        .selectFrom("deletion_requests")
        .select(["id", "org_id"])
        .where("status", "in", ["pending", "processing"])
        .where("cooling_off_until", "<=", deps.now())
        .orderBy("requested_at", "asc")
        .orderBy("id", "asc")
        .execute();
      return rows.map((r) => ({ id: r.id, orgId: r.org_id }));
    },

    async listSnapshotsOwed() {
      const rows = await platformDb
        .selectFrom("deletion_requests")
        .innerJoin("orgs", "orgs.id", "deletion_requests.org_id")
        .select([
          "deletion_requests.id",
          "deletion_requests.org_id",
          "orgs.schema_name",
        ])
        .where("deletion_requests.status", "in", ["pending", "processing"])
        .where("deletion_requests.cooling_off_until", "<=", deps.now())
        .where("deletion_requests.snapshot_at", "is", null)
        .orderBy("deletion_requests.requested_at", "asc")
        .orderBy("deletion_requests.id", "asc")
        .execute();
      return rows.map((r) => ({
        id: r.id,
        orgId: r.org_id,
        orgSchema: r.schema_name,
      }));
    },

    async requestImmediate(slug) {
      const parsed = orgSlugSchema.safeParse(slug);
      if (!parsed.success) {
        throw new ValidationError("not a valid org slug");
      }

      try {
        return await platformDb.transaction().execute(async (trx) => {
          const org = await trx
            .selectFrom("orgs")
            .select(["id", "schema_name"])
            .where("slug", "=", parsed.data)
            .executeTakeFirst();
          if (org === undefined) {
            throw new NotFoundError("no org has that slug");
          }
          const target = (id: DeletionRequestId): ErasureTarget => ({
            id,
            orgId: org.id,
            orgSchema: org.schema_name,
          });

          const live = await trx
            .selectFrom("deletion_requests")
            .select(["id", "status"])
            .where("org_id", "=", org.id)
            .where("status", "in", ["pending", "processing"])
            .forUpdate()
            .executeTakeFirst();

          // A processing row is already past its cooling-off.
          if (live?.status === "processing") return target(live.id);

          // An admin's pending request is adopted rather than refused, and
          // keeps requested_by, so the record of who asked first survives.
          if (live !== undefined) {
            await trx
              .updateTable("deletion_requests")
              .set({ cooling_off_until: deps.now() })
              .where("id", "=", live.id)
              .execute();
            return target(live.id);
          }

          const at = deps.now();
          const inserted = await trx
            .insertInto("deletion_requests")
            .values({
              org_id: org.id,
              requested_by: null,
              requested_at: at,
              cooling_off_until: at,
              status: "pending",
            })
            .returning("id")
            .executeTakeFirstOrThrow();
          return target(inserted.id);
        });
      } catch (err: unknown) {
        // The partial unique index allows one pending or processing row
        // per org. A violation here means another request was inserted
        // between the lookup above and this insert.
        if (isPgUniqueViolation(err)) {
          throw new ConflictError(ErrorCode.DELETION_ALREADY_REQUESTED);
        }
        throw err;
      }
    },

    async recordSnapshot(requestId) {
      const updated = await platformDb
        .updateTable("deletion_requests")
        .set({ snapshot_at: deps.now() })
        .where("id", "=", requestId)
        .where("snapshot_at", "is", null)
        .returning("id")
        .executeTakeFirst();
      if (updated !== undefined) return;

      const existing = await platformDb
        .selectFrom("deletion_requests")
        .select("id")
        .where("id", "=", requestId)
        .executeTakeFirst();
      if (existing === undefined) {
        throw new NotFoundError("no deletion request has that id");
      }
    },

    async processRequest(requestId, actor) {
      // One reserved connection for the whole run: the advisory lock is
      // held by the session, so every statement must use that session.
      return platformDb.connection().execute(async (conn) => {
        const locked = await runStep("claim", async () =>
          tryLockRequest(conn, requestId),
        );
        if (!locked) return "busy";
        try {
          return await runLocked(conn, requestId, actor);
        } finally {
          await unlockRequest(conn, requestId);
        }
      });
    },
  };
}

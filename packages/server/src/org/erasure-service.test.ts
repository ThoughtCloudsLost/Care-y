import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { Kysely, sql } from "kysely";
import {
  newOrgId,
  orgSchemaFor,
  type DeletionRequestId,
  type JobId,
  type OrgId,
  type OrgSchema,
  type OrgSlug,
} from "@care-y/shared";
import type { PlatformDatabase } from "../db/types.js";
import type { OrgBlobSweeper } from "../storage/store.js";
import { createSecretsEncryptor } from "../config/secrets.js";
import { _resetEnvCache } from "../env.js";
import { ErasureStepError, NotFoundError, TelephonyError } from "../errors.js";
import {
  SafeIntrospectionPostgresDialect,
  TEST_OPS_KEY,
} from "../test-utils.js";
import {
  createErasureService,
  type CloseSubaccount,
  type ErasureService,
} from "./erasure-service.js";

// Placeholders only: the closer is a fake and never reaches a provider.
const MASTER_SID = "ACmaster-placeholder";
const MASTER_TOKEN = "master-token-placeholder";
const SUBACCOUNT_SID = "ACsubaccount-placeholder";

/** A blob sweep failure whose message must never reach the step error. */
class SweepFailedError extends Error {}

const secretsEncryptor = createSecretsEncryptor(TEST_OPS_KEY);

/** Advances one second per call, so step timestamps are strictly ordered. */
function steppingClock(): () => Date {
  let t = Date.now();
  return () => {
    t += 1000;
    return new Date(t);
  };
}

interface Harness {
  readonly service: ErasureService;
  /** Side effects of the injected deps, in call order. */
  readonly calls: string[];
  readonly deleteOrg: Mock<OrgBlobSweeper["deleteOrg"]>;
  readonly closeSubaccount: Mock<CloseSubaccount>;
}

describe.skipIf(!process.env.DATABASE_URL)("createErasureService", () => {
  let pool: pg.Pool;
  let platformDb: Kysely<PlatformDatabase>;
  const createdOrgIds: OrgId[] = [];
  const createdJobIds: JobId[] = [];
  let savedEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
    platformDb = new Kysely<PlatformDatabase>({
      dialect: new SafeIntrospectionPostgresDialect({ pool }),
    });
  });

  afterAll(async () => {
    for (const orgId of createdOrgIds) {
      await platformDb
        .deleteFrom("platform_audit_log")
        .where("org_id", "=", orgId)
        .execute();
      await platformDb
        .deleteFrom("deletion_requests")
        .where("org_id", "=", orgId)
        .execute();
      await platformDb
        .deleteFrom("pending_jobs")
        .where(sql<string>`payload ->> 'orgId'`, "=", orgId)
        .execute();
      await platformDb
        .deleteFrom("telephony_config")
        .where("org_id", "=", orgId)
        .execute();
      await platformDb
        .deleteFrom("inbound_email_domains")
        .where("org_id", "=", orgId)
        .execute();
      await platformDb.deleteFrom("orgs").where("id", "=", orgId).execute();
      await platformDb.schema
        .dropSchema(orgSchemaFor(orgId))
        .ifExists()
        .cascade()
        .execute();
    }
    for (const jobId of createdJobIds) {
      await platformDb
        .deleteFrom("pending_jobs")
        .where("id", "=", jobId)
        .execute();
    }
    await platformDb.destroy();
  });

  beforeEach(() => {
    savedEnv = { ...process.env };
    process.env.TWILIO_MASTER_SID = MASTER_SID;
    process.env.TWILIO_MASTER_AUTH_TOKEN = MASTER_TOKEN;
    _resetEnvCache();
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in savedEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, savedEnv);
    _resetEnvCache();
  });

  function buildHarness(overrides?: {
    deleteOrg?: OrgBlobSweeper["deleteOrg"];
    closeSubaccount?: CloseSubaccount;
  }): Harness {
    const calls: string[] = [];
    const deleteOrg = vi.fn<OrgBlobSweeper["deleteOrg"]>(
      overrides?.deleteOrg ??
        (async (schema) => {
          calls.push(`blobs ${schema}`);
        }),
    );
    const closeSubaccount = vi.fn<CloseSubaccount>(
      overrides?.closeSubaccount ??
        (async (_masterSid, _masterToken, subaccountSid) => {
          calls.push(`close ${subaccountSid}`);
        }),
    );
    const service = createErasureService({
      platformDb,
      blobSweeper: { deleteOrg },
      secretsEncryptor,
      closeSubaccount,
      now: steppingClock(),
    });
    return { service, calls, deleteOrg, closeSubaccount };
  }

  /**
   * An org row with a real tenant schema holding one table, an inbound
   * email domain, a queued job for the org, and a telephony_config row in
   * the given mode (none when omitted).
   */
  async function createScratchOrg(
    telephonyMode?: "managed" | "byot",
  ): Promise<{ orgId: OrgId; schema: OrgSchema }> {
    const orgId = newOrgId();
    const schema = orgSchemaFor(orgId);
    const slug = `erase-${orgId.slice(0, 8)}` as OrgSlug;
    await platformDb
      .insertInto("orgs")
      .values({ id: orgId, slug, schema_name: schema })
      .execute();
    createdOrgIds.push(orgId);

    await platformDb.schema.createSchema(schema).execute();
    await platformDb.schema
      .withSchema(schema)
      .createTable("scratch")
      .addColumn("id", "integer")
      .execute();

    await platformDb
      .insertInto("inbound_email_domains")
      .values({ domain: `${slug}.example.test`, org_id: orgId })
      .execute();
    await platformDb
      .insertInto("pending_jobs")
      .values({ queue: `erasure-test-${randomUUID()}`, payload: { orgId } })
      .execute();

    if (telephonyMode !== undefined) {
      const config = Buffer.from(
        JSON.stringify({
          mode: telephonyMode,
          accountSid: SUBACCOUNT_SID,
          authToken: "subaccount-token-placeholder",
          phoneNumbers: [],
        }),
      );
      await platformDb
        .insertInto("telephony_config")
        .values({
          org_id: orgId,
          provider: "twilio",
          config: secretsEncryptor.encrypt(config),
        })
        .execute();
    }
    return { orgId, schema };
  }

  /**
   * A request past its cooling-off. The snapshot is recorded a little after
   * the request and before any harness clock reading, unless the test says
   * it is still owed.
   */
  async function insertDueRequest(
    orgId: OrgId,
    options?: { snapshotOwed?: boolean },
  ): Promise<DeletionRequestId> {
    const at = new Date(Date.now() - 60_000);
    const row = await platformDb
      .insertInto("deletion_requests")
      .values({
        org_id: orgId,
        requested_by: null,
        requested_at: at,
        cooling_off_until: at,
        status: "pending",
        snapshot_at:
          options?.snapshotOwed === true
            ? null
            : new Date(at.getTime() + 30_000),
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return row.id;
  }

  /** Holds the request's advisory lock on another session while fn runs. */
  async function holdingLock<T>(
    id: DeletionRequestId,
    fn: () => Promise<T>,
  ): Promise<T> {
    return platformDb.connection().execute(async (conn) => {
      await sql`SELECT pg_advisory_lock(hashtext(${id}::text))`.execute(conn);
      try {
        return await fn();
      } finally {
        await sql`SELECT pg_advisory_unlock(hashtext(${id}::text))`.execute(
          conn,
        );
      }
    });
  }

  /** True when another session can take the request's lock right now. */
  async function lockIsFree(id: DeletionRequestId): Promise<boolean> {
    return platformDb.connection().execute(async (conn) => {
      const result = await sql<{ locked: boolean }>`
        SELECT pg_try_advisory_lock(hashtext(${id}::text)) AS locked
      `.execute(conn);
      const locked = result.rows[0]?.locked === true;
      if (locked) {
        await sql`SELECT pg_advisory_unlock(hashtext(${id}::text))`.execute(
          conn,
        );
      }
      return locked;
    });
  }

  async function readRequest(id: DeletionRequestId) {
    return platformDb
      .selectFrom("deletion_requests")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
  }

  async function auditRows(orgId: OrgId) {
    return platformDb
      .selectFrom("platform_audit_log")
      .selectAll()
      .where("org_id", "=", orgId)
      .orderBy("created_at", "asc")
      .execute();
  }

  async function schemaExists(schema: OrgSchema): Promise<boolean> {
    const result = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM pg_namespace WHERE nspname = ${schema}
    `.execute(platformDb);
    return result.rows[0]?.n === 1;
  }

  async function captureStepError(
    run: () => Promise<unknown>,
  ): Promise<ErasureStepError> {
    try {
      await run();
    } catch (err: unknown) {
      if (err instanceof ErasureStepError) return err;
      throw err;
    }
    return expect.unreachable("expected an ErasureStepError");
  }

  it("a full run sets every timestamp in order and writes one org_erased row with the actor and org id only", async () => {
    const { orgId, schema } = await createScratchOrg("managed");
    const bystander = await platformDb
      .insertInto("pending_jobs")
      .values({
        queue: `erasure-test-${randomUUID()}`,
        payload: { orgId: newOrgId() },
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    createdJobIds.push(bystander.id);
    const requestId = await insertDueRequest(orgId);
    const h = buildHarness();

    await expect(h.service.processRequest(requestId, "cli")).resolves.toBe(
      "erased",
    );

    expect(h.calls).toEqual([`blobs ${schema}`, `close ${SUBACCOUNT_SID}`]);
    expect(h.closeSubaccount).toHaveBeenCalledWith(
      MASTER_SID,
      MASTER_TOKEN,
      SUBACCOUNT_SID,
    );

    const row = await readRequest(requestId);
    expect(row.status).toBe("done");
    expect(row.provider_subaccount_sid).toBe(SUBACCOUNT_SID);
    expect(row.last_error).toBeNull();
    const stamps = [
      row.snapshot_at,
      row.blobs_deleted_at,
      row.schema_dropped_at,
      row.rows_deleted_at,
      row.subaccount_closed_at,
    ].map((d) => d?.getTime() ?? Number.NaN);
    expect(stamps.every((t) => Number.isFinite(t))).toBe(true);
    expect([...stamps].sort((a, b) => a - b)).toEqual(stamps);
    expect(new Set(stamps).size).toBe(stamps.length);

    const audit = await auditRows(orgId);
    expect(audit).toHaveLength(1);
    expect(Object.keys(audit[0] ?? {}).sort()).toEqual([
      "action",
      "actor",
      "created_at",
      "id",
      "org_id",
    ]);
    expect(audit[0]).toMatchObject({
      action: "org_erased",
      actor: "cli",
      org_id: orgId,
    });

    expect(await schemaExists(schema)).toBe(false);
    const orgRow = await platformDb
      .selectFrom("orgs")
      .select("id")
      .where("id", "=", orgId)
      .executeTakeFirst();
    expect(orgRow).toBeUndefined();
    const telephony = await platformDb
      .selectFrom("telephony_config")
      .select("org_id")
      .where("org_id", "=", orgId)
      .execute();
    expect(telephony).toHaveLength(0);
    const domains = await platformDb
      .selectFrom("inbound_email_domains")
      .select("id")
      .where("org_id", "=", orgId)
      .execute();
    expect(domains).toHaveLength(0);
    const orgJobs = await platformDb
      .selectFrom("pending_jobs")
      .select("id")
      .where(sql<string>`payload ->> 'orgId'`, "=", orgId)
      .execute();
    expect(orgJobs).toHaveLength(0);
    const bystanderRow = await platformDb
      .selectFrom("pending_jobs")
      .select("id")
      .where("id", "=", bystander.id)
      .executeTakeFirst();
    expect(bystanderRow).toBeDefined();
  });

  it("defers a request whose snapshot is still owed and runs no step after the claim", async () => {
    const { orgId, schema } = await createScratchOrg("managed");
    const requestId = await insertDueRequest(orgId, { snapshotOwed: true });
    const h = buildHarness();

    await expect(h.service.processRequest(requestId, "cli")).resolves.toBe(
      "snapshot-owed",
    );

    expect(h.deleteOrg).not.toHaveBeenCalled();
    expect(h.closeSubaccount).not.toHaveBeenCalled();
    const row = await readRequest(requestId);
    expect(row).toMatchObject({
      status: "processing",
      snapshot_at: null,
      blobs_deleted_at: null,
      schema_dropped_at: null,
      rows_deleted_at: null,
      subaccount_closed_at: null,
    });
    expect(await schemaExists(schema)).toBe(true);
    const orgRow = await platformDb
      .selectFrom("orgs")
      .select("is_active")
      .where("id", "=", orgId)
      .executeTakeFirstOrThrow();
    expect(orgRow.is_active).toBe(false);
    expect(await auditRows(orgId)).toHaveLength(0);
    expect(await lockIsFree(requestId)).toBe(true);

    // Once the host wrapper records the snapshot, the next run completes.
    await h.service.recordSnapshot(requestId);
    await expect(h.service.processRequest(requestId, "cli")).resolves.toBe(
      "erased",
    );
    expect(await schemaExists(schema)).toBe(false);
  });

  it("recordSnapshot sets snapshot_at once and refuses an unknown request", async () => {
    const { orgId } = await createScratchOrg();
    const requestId = await insertDueRequest(orgId, { snapshotOwed: true });
    const h = buildHarness();

    await h.service.recordSnapshot(requestId);
    const first = (await readRequest(requestId)).snapshot_at;
    expect(first).not.toBeNull();
    await h.service.recordSnapshot(requestId);
    expect((await readRequest(requestId)).snapshot_at).toEqual(first);

    await expect(
      h.service.recordSnapshot(randomUUID() as DeletionRequestId),
    ).rejects.toThrow(NotFoundError);
  });

  it("a blob sweep that throws leaves blobs_deleted_at null and runs no later step", async () => {
    const { orgId, schema } = await createScratchOrg("managed");
    const requestId = await insertDueRequest(orgId);
    const h = buildHarness({
      deleteOrg: async () => {
        throw new SweepFailedError(`rm failed for ${schema}`);
      },
    });

    const err = await captureStepError(async () =>
      h.service.processRequest(requestId, "cli"),
    );
    expect(err.step).toBe("blobs");
    expect(err.causeName).toBe("SweepFailedError");
    // The cause's message (here naming the schema) is not carried.
    expect(err.message).not.toContain(schema);

    expect(h.closeSubaccount).not.toHaveBeenCalled();
    const row = await readRequest(requestId);
    expect(row).toMatchObject({
      status: "processing",
      blobs_deleted_at: null,
      schema_dropped_at: null,
      rows_deleted_at: null,
      subaccount_closed_at: null,
    });
    expect(await schemaExists(schema)).toBe(true);
    expect(await auditRows(orgId)).toHaveLength(0);
    // The lock is released when a step fails, so the next run can resume.
    expect(await lockIsFree(requestId)).toBe(true);
  });

  it("a failed subaccount closure writes erasure_subaccount_failed and a second run completes", async () => {
    const { orgId, schema } = await createScratchOrg("managed");
    const requestId = await insertDueRequest(orgId);
    const failing = buildHarness({
      closeSubaccount: async () => {
        throw new TelephonyError("provider returned 503");
      },
    });

    const err = await captureStepError(async () =>
      failing.service.processRequest(requestId, "cli"),
    );
    expect(err.step).toBe("subaccount");
    expect(err.causeName).toBe("TelephonyError");

    const failed = await readRequest(requestId);
    expect(failed.status).toBe("processing");
    expect(failed.subaccount_closed_at).toBeNull();
    expect(failed.rows_deleted_at).not.toBeNull();
    expect(failed.provider_subaccount_sid).toBe(SUBACCOUNT_SID);
    expect(failed.last_error).toBe("TelephonyError");
    expect(await schemaExists(schema)).toBe(false);
    expect((await auditRows(orgId)).map((r) => r.action)).toEqual([
      "erasure_subaccount_failed",
    ]);
    // The processing row stays due, so the next run picks it up.
    const due = await failing.service.listDue();
    expect(due.map((d) => d.id)).toContain(requestId);

    const retry = buildHarness();
    await expect(retry.service.processRequest(requestId, "cli")).resolves.toBe(
      "erased",
    );
    expect(retry.deleteOrg).not.toHaveBeenCalled();
    expect(retry.closeSubaccount).toHaveBeenCalledWith(
      MASTER_SID,
      MASTER_TOKEN,
      SUBACCOUNT_SID,
    );
    const done = await readRequest(requestId);
    expect(done.status).toBe("done");
    expect(done.subaccount_closed_at).not.toBeNull();
    expect((await auditRows(orgId)).map((r) => r.action)).toEqual([
      "erasure_subaccount_failed",
      "org_erased",
    ]);
  });

  it("fails the closure with TelephonyConfigError when the master credentials are unset", async () => {
    delete process.env.TWILIO_MASTER_SID;
    delete process.env.TWILIO_MASTER_AUTH_TOKEN;
    _resetEnvCache();
    const { orgId } = await createScratchOrg("managed");
    const requestId = await insertDueRequest(orgId);
    const h = buildHarness();

    const err = await captureStepError(async () =>
      h.service.processRequest(requestId, "cli"),
    );
    expect(err.step).toBe("subaccount");
    expect(err.causeName).toBe("TelephonyConfigError");
    expect(h.closeSubaccount).not.toHaveBeenCalled();
    const row = await readRequest(requestId);
    expect(row.last_error).toBe("TelephonyConfigError");
    expect(row.subaccount_closed_at).toBeNull();
  });

  it("closes nothing for an org on its own provider account", async () => {
    const { orgId } = await createScratchOrg("byot");
    const requestId = await insertDueRequest(orgId);
    const h = buildHarness();

    await expect(h.service.processRequest(requestId, "cli")).resolves.toBe(
      "erased",
    );
    expect(h.closeSubaccount).not.toHaveBeenCalled();
    const row = await readRequest(requestId);
    expect(row.provider_subaccount_sid).toBeNull();
    expect(row.subaccount_closed_at).not.toBeNull();
    expect(row.status).toBe("done");
  });

  it("closes nothing for an org with no telephony", async () => {
    const { orgId } = await createScratchOrg();
    const requestId = await insertDueRequest(orgId);
    const h = buildHarness();

    await expect(h.service.processRequest(requestId, "cli")).resolves.toBe(
      "erased",
    );
    expect(h.closeSubaccount).not.toHaveBeenCalled();
    expect((await readRequest(requestId)).provider_subaccount_sid).toBeNull();
  });

  it("reports busy and changes nothing while another run holds the request's lock", async () => {
    const { orgId } = await createScratchOrg();
    const requestId = await insertDueRequest(orgId);
    const h = buildHarness();

    await holdingLock(requestId, async () => {
      await expect(h.service.processRequest(requestId, "cli")).resolves.toBe(
        "busy",
      );
    });

    expect(h.deleteOrg).not.toHaveBeenCalled();
    const row = await readRequest(requestId);
    expect(row.status).toBe("pending");
    const orgRow = await platformDb
      .selectFrom("orgs")
      .select("is_active")
      .where("id", "=", orgId)
      .executeTakeFirstOrThrow();
    expect(orgRow.is_active).toBe(true);
  });

  it("holds the lock for the whole run, so a second run started mid-way is busy, and releases it at the end", async () => {
    const { orgId } = await createScratchOrg();
    const requestId = await insertDueRequest(orgId);
    let concurrent: string | undefined;
    let lockFreeMidRun: boolean | undefined;
    const second = buildHarness();
    const first = buildHarness({
      deleteOrg: async () => {
        // The claim transaction has committed by now; a transaction-level
        // lock would already be gone.
        lockFreeMidRun = await lockIsFree(requestId);
        concurrent = await second.service.processRequest(requestId, "cli");
      },
    });

    await expect(first.service.processRequest(requestId, "cli")).resolves.toBe(
      "erased",
    );

    expect(lockFreeMidRun).toBe(false);
    expect(concurrent).toBe("busy");
    expect(second.deleteOrg).not.toHaveBeenCalled();
    expect(await lockIsFree(requestId)).toBe(true);
    expect((await auditRows(orgId)).map((r) => r.action)).toEqual([
      "org_erased",
    ]);
  });

  it("does not claim a request whose cooling-off has not ended", async () => {
    const { orgId } = await createScratchOrg();
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const pending = await platformDb
      .insertInto("deletion_requests")
      .values({
        org_id: orgId,
        requested_by: null,
        cooling_off_until: future,
        status: "pending",
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    const h = buildHarness();

    await expect(h.service.processRequest(pending.id, "cli")).resolves.toBe(
      "busy",
    );
    expect(h.deleteOrg).not.toHaveBeenCalled();
    expect((await readRequest(pending.id)).status).toBe("pending");
  });
});

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { Kysely } from "kysely";
import {
  deletionRequestIdSchema,
  newOrgId,
  orgSchemaFor,
  userIdSchema,
  type DeletionRequestId,
  type OrgId,
  type OrgSlug,
} from "@care-y/shared";
import type { DeletionRequestStatus, PlatformDatabase } from "../db/types.js";
import type { OrgBlobSweeper } from "../storage/store.js";
import { createSecretsEncryptor } from "../config/secrets.js";
import {
  ErasureStepError,
  InternalError,
  NotFoundError,
  ValidationError,
} from "../errors.js";
import {
  SafeIntrospectionPostgresDialect,
  TEST_OPS_KEY,
} from "../test-utils.js";
import {
  createErasureService,
  type CloseSubaccount,
  type DueErasure,
  type ErasureService,
  type ErasureTarget,
} from "../org/erasure-service.js";
import {
  CLI_ACTOR,
  ORG_ERASE_USAGE,
  parseOrgEraseMode,
  runOrgErase,
} from "./org-erase.js";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const STEP = "(claim|snapshot|blobs|schema|rows|subaccount|audit)";
/** Every line the plain run prints: a keyword, an org UUID, and for a deferral a step and an error class. */
const OUTPUT_LINE = new RegExp(
  `^(?:(?:erased|busy) ${UUID}|deferred ${UUID} snapshot|deferred ${UUID} ${STEP} [A-Za-z]+)$`,
);
/** The line --due and --request-now print: a request id and an org schema. */
const TARGET_LINE = new RegExp(`^${UUID} org_${UUID}$`);

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function requestId(): DeletionRequestId {
  return deletionRequestIdSchema.parse(randomUUID());
}

function dueErasure(): DueErasure {
  return { id: requestId(), orgId: newOrgId() };
}

function erasureTarget(): ErasureTarget {
  const orgId = newOrgId();
  return { id: requestId(), orgId, orgSchema: orgSchemaFor(orgId) };
}

function fakeService(overrides: Partial<ErasureService>): ErasureService {
  return {
    listDue: vi.fn<ErasureService["listDue"]>(async () => []),
    listSnapshotsOwed: vi.fn<ErasureService["listSnapshotsOwed"]>(
      async () => [],
    ),
    requestImmediate: vi.fn<ErasureService["requestImmediate"]>(async () => {
      throw new InternalError("requestImmediate is not expected here");
    }),
    recordSnapshot: vi.fn<ErasureService["recordSnapshot"]>(async () => {
      throw new InternalError("recordSnapshot is not expected here");
    }),
    processRequest: vi.fn<ErasureService["processRequest"]>(
      async () => "erased",
    ),
    ...overrides,
  };
}

/** Awaits a promise that must reject and returns the rejection. */
async function rejectionOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (err: unknown) {
    return err;
  }
  return expect.unreachable("expected the promise to reject");
}

describe("parseOrgEraseMode", () => {
  it("returns the plain run with no arguments (the scheduled run)", () => {
    expect(parseOrgEraseMode({ positionals: [] })).toEqual({
      kind: "process",
    });
  });

  it("returns --due", () => {
    expect(parseOrgEraseMode({ positionals: ["--due"] })).toEqual({
      kind: "due",
    });
  });

  it("returns the slug after --request-now", () => {
    expect(
      parseOrgEraseMode({ positionals: ["--request-now", "acme"] }),
    ).toEqual({ kind: "request-now", slug: "acme" });
  });

  it("returns the request id after --snapshot-recorded", () => {
    const id = requestId();
    expect(
      parseOrgEraseMode({ positionals: ["--snapshot-recorded", id] }),
    ).toEqual({ kind: "snapshot-recorded", requestId: id });
  });

  it.each([
    [["--now", "acme"]],
    [["acme"]],
    [["--due", "acme"]],
    [["--request-now"]],
    [["--request-now", "acme", "extra"]],
    [["--snapshot-recorded"]],
    [["--snapshot-recorded", "not-a-uuid"]],
    [["--due", "--request-now", "acme"]],
  ])("refuses %j with the usage line", (positionals) => {
    expect(() => parseOrgEraseMode({ positionals })).toThrow(ValidationError);
    expect(() => parseOrgEraseMode({ positionals })).toThrow(ORG_ERASE_USAGE);
  });
});

describe("runOrgErase", () => {
  it("processes every due request as the cli actor and prints one line each", async () => {
    const first = dueErasure();
    const second = dueErasure();
    const third = dueErasure();
    const fourth = dueErasure();
    const processRequest = vi
      .fn<ErasureService["processRequest"]>()
      .mockResolvedValueOnce("erased")
      .mockRejectedValueOnce(new ErasureStepError("rows", "DatabaseError"))
      .mockResolvedValueOnce("busy")
      .mockResolvedValueOnce("snapshot-owed");
    const service = fakeService({
      listDue: vi.fn<ErasureService["listDue"]>(async () => [
        first,
        second,
        third,
        fourth,
      ]),
      processRequest,
    });
    const lines: string[] = [];

    await runOrgErase(service, { positionals: [] }, (line) => {
      lines.push(line);
    });

    expect(lines).toEqual([
      `erased ${first.orgId}`,
      `deferred ${second.orgId} rows DatabaseError`,
      `busy ${third.orgId}`,
      `deferred ${fourth.orgId} snapshot`,
    ]);
    for (const line of lines) expect(line).toMatch(OUTPUT_LINE);
    expect(processRequest.mock.calls).toEqual([
      [first.id, CLI_ACTOR],
      [second.id, CLI_ACTOR],
      [third.id, CLI_ACTOR],
      [fourth.id, CLI_ACTOR],
    ]);
    expect(service.listSnapshotsOwed).not.toHaveBeenCalled();
    expect(service.requestImmediate).not.toHaveBeenCalled();
    expect(service.recordSnapshot).not.toHaveBeenCalled();
  });

  it("--due prints one request id and schema line per snapshot owed and processes nothing", async () => {
    const first = erasureTarget();
    const second = erasureTarget();
    const service = fakeService({
      listSnapshotsOwed: vi.fn<ErasureService["listSnapshotsOwed"]>(
        async () => [first, second],
      ),
    });
    const lines: string[] = [];

    await runOrgErase(service, { positionals: ["--due"] }, (line) => {
      lines.push(line);
    });

    expect(lines).toEqual([
      `${first.id} ${first.orgSchema}`,
      `${second.id} ${second.orgSchema}`,
    ]);
    for (const line of lines) expect(line).toMatch(TARGET_LINE);
    expect(service.listDue).not.toHaveBeenCalled();
    expect(service.processRequest).not.toHaveBeenCalled();
  });

  it("--request-now prints the target line, and no line carries the slug", async () => {
    const target = erasureTarget();
    const requestImmediate = vi.fn<ErasureService["requestImmediate"]>(
      async () => target,
    );
    const service = fakeService({ requestImmediate });
    const lines: string[] = [];

    await runOrgErase(
      service,
      { positionals: ["--request-now", "acme-relief"] },
      (line) => {
        lines.push(line);
      },
    );

    expect(requestImmediate).toHaveBeenCalledWith("acme-relief");
    expect(lines).toEqual([`${target.id} ${target.orgSchema}`]);
    expect(lines.join("\n")).not.toContain("acme-relief");
    expect(service.listDue).not.toHaveBeenCalled();
    expect(service.processRequest).not.toHaveBeenCalled();
  });

  it("--snapshot-recorded records the snapshot and prints nothing", async () => {
    const id = requestId();
    const recordSnapshot = vi.fn<ErasureService["recordSnapshot"]>(
      async () => undefined,
    );
    const service = fakeService({ recordSnapshot });
    const print = vi.fn<(line: string) => void>();

    await runOrgErase(
      service,
      { positionals: ["--snapshot-recorded", id] },
      print,
    );

    expect(recordSnapshot).toHaveBeenCalledWith(id);
    expect(print).not.toHaveBeenCalled();
    expect(service.processRequest).not.toHaveBeenCalled();
  });

  it("rethrows an error that is not an erasure step failure", async () => {
    const service = fakeService({
      listDue: vi.fn<ErasureService["listDue"]>(async () => [dueErasure()]),
      processRequest: vi.fn<ErasureService["processRequest"]>(async () => {
        throw new InternalError("unexpected");
      }),
    });
    const print = vi.fn<(line: string) => void>();

    await expect(
      runOrgErase(service, { positionals: [] }, print),
    ).rejects.toThrow(InternalError);
    expect(print).not.toHaveBeenCalled();
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "org:erase against the database",
  () => {
    let pool: pg.Pool;
    let platformDb: Kysely<PlatformDatabase>;
    const createdOrgIds: OrgId[] = [];

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
        await platformDb.deleteFrom("orgs").where("id", "=", orgId).execute();
        await platformDb.schema
          .dropSchema(orgSchemaFor(orgId))
          .ifExists()
          .cascade()
          .execute();
      }
      await platformDb.destroy();
    });

    function buildService(): ErasureService {
      const blobSweeper: OrgBlobSweeper = {
        deleteOrg: vi.fn<OrgBlobSweeper["deleteOrg"]>(async () => undefined),
      };
      return createErasureService({
        platformDb,
        blobSweeper,
        secretsEncryptor: createSecretsEncryptor(TEST_OPS_KEY),
        closeSubaccount: vi.fn<CloseSubaccount>(async () => undefined),
        now: () => new Date(),
      });
    }

    /**
     * The service with listDue narrowed to one org, so a plain run never
     * touches requests another suite has in the shared table.
     */
    function scopedTo(service: ErasureService, orgId: OrgId): ErasureService {
      return {
        ...service,
        listDue: async () =>
          (await service.listDue()).filter((due) => due.orgId === orgId),
      };
    }

    async function run(
      service: ErasureService,
      positionals: readonly string[],
    ): Promise<string[]> {
      const lines: string[] = [];
      await runOrgErase(service, { positionals }, (line) => {
        lines.push(line);
      });
      return lines;
    }

    /** A request row for a fresh org UUID; no orgs row is needed (no FK). */
    async function insertRequest(
      requestedAt: Date,
      coolingOffUntil: Date,
      status: DeletionRequestStatus,
    ): Promise<DeletionRequestId> {
      const orgId = newOrgId();
      createdOrgIds.push(orgId);
      const row = await platformDb
        .insertInto("deletion_requests")
        .values({
          org_id: orgId,
          requested_by: null,
          requested_at: requestedAt,
          cooling_off_until: coolingOffUntil,
          status,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      return row.id;
    }

    /** An org row and an empty tenant schema; the slug passes orgSlugSchema. */
    async function createScratchOrg(): Promise<{
      orgId: OrgId;
      slug: OrgSlug;
    }> {
      const orgId = newOrgId();
      const slug = `erase-cli-${orgId.slice(0, 8)}` as OrgSlug;
      await platformDb
        .insertInto("orgs")
        .values({ id: orgId, slug, schema_name: orgSchemaFor(orgId) })
        .execute();
      createdOrgIds.push(orgId);
      await platformDb.schema.createSchema(orgSchemaFor(orgId)).execute();
      return { orgId, slug };
    }

    async function readRequestFor(orgId: OrgId) {
      return platformDb
        .selectFrom("deletion_requests")
        .selectAll()
        .where("org_id", "=", orgId)
        .executeTakeFirstOrThrow();
    }

    it("listDue returns pending and processing rows past cooling-off, oldest request first", async () => {
      const now = Date.now();
      const newer = await insertRequest(
        new Date(now - 3 * DAY_MS),
        new Date(now - HOUR_MS),
        "pending",
      );
      const older = await insertRequest(
        new Date(now - 5 * DAY_MS),
        new Date(now - 2 * HOUR_MS),
        "processing",
      );
      const notDue = await insertRequest(
        new Date(now - DAY_MS),
        new Date(now + DAY_MS),
        "pending",
      );
      const cancelled = await insertRequest(
        new Date(now - 6 * DAY_MS),
        new Date(now - 3 * HOUR_MS),
        "cancelled",
      );
      const done = await insertRequest(
        new Date(now - 7 * DAY_MS),
        new Date(now - 4 * HOUR_MS),
        "done",
      );
      const mine = new Set([newer, older, notDue, cancelled, done]);

      const listed = await buildService().listDue();

      // Other suites share the public table; only this test's rows count.
      expect(listed.map((d) => d.id).filter((id) => mine.has(id))).toEqual([
        older,
        newer,
      ]);
    });

    it("--due lists due requests whose snapshot is still owed, with the org schema", async () => {
      const owed = await createScratchOrg();
      const recorded = await createScratchOrg();
      const notDue = await createScratchOrg();
      const past = new Date(Date.now() - HOUR_MS);
      await platformDb
        .insertInto("deletion_requests")
        .values([
          {
            org_id: owed.orgId,
            requested_by: null,
            cooling_off_until: past,
            status: "pending",
          },
          {
            org_id: recorded.orgId,
            requested_by: null,
            cooling_off_until: past,
            status: "processing",
            snapshot_at: past,
          },
          {
            org_id: notDue.orgId,
            requested_by: null,
            cooling_off_until: new Date(Date.now() + DAY_MS),
            status: "pending",
          },
        ])
        .execute();
      const owedRow = await readRequestFor(owed.orgId);

      const lines = await run(buildService(), ["--due"]);

      const mine = [owed.orgId, recorded.orgId, notDue.orgId].map((orgId) =>
        orgSchemaFor(orgId),
      );
      const own = lines.filter((line) =>
        mine.some((schema) => line.endsWith(` ${schema}`)),
      );
      expect(own).toEqual([`${owedRow.id} ${orgSchemaFor(owed.orgId)}`]);
      for (const line of lines) expect(line).toMatch(TARGET_LINE);
    });

    it("--request-now inserts a due request when the org has none", async () => {
      const { orgId, slug } = await createScratchOrg();

      const lines = await run(buildService(), ["--request-now", slug]);

      const request = await readRequestFor(orgId);
      expect(lines).toEqual([`${request.id} ${orgSchemaFor(orgId)}`]);
      expect(lines.join("\n")).not.toContain(slug);
      expect(request.status).toBe("pending");
      expect(request.requested_by).toBeNull();
      expect(request.cooling_off_until.getTime()).toBeLessThanOrEqual(
        Date.now(),
      );
    });

    it("--request-now adopts an admin's pending request and keeps requested_by", async () => {
      const { orgId, slug } = await createScratchOrg();
      const admin = userIdSchema.parse(randomUUID());
      const pending = await platformDb
        .insertInto("deletion_requests")
        .values({
          org_id: orgId,
          requested_by: admin,
          cooling_off_until: new Date(Date.now() + 30 * DAY_MS),
          status: "pending",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const lines = await run(buildService(), ["--request-now", slug]);

      expect(lines).toEqual([`${pending.id} ${orgSchemaFor(orgId)}`]);
      const rows = await platformDb
        .selectFrom("deletion_requests")
        .selectAll()
        .where("org_id", "=", orgId)
        .execute();
      expect(rows).toHaveLength(1);
      expect(rows[0]?.id).toBe(pending.id);
      expect(rows[0]?.requested_by).toBe(admin);
      expect(rows[0]?.status).toBe("pending");
      expect(rows[0]?.cooling_off_until.getTime()).toBeLessThanOrEqual(
        Date.now(),
      );
    });

    it("--request-now returns a processing request as it is", async () => {
      const { orgId, slug } = await createScratchOrg();
      const coolingOffUntil = new Date(Date.now() - DAY_MS);
      const processing = await platformDb
        .insertInto("deletion_requests")
        .values({
          org_id: orgId,
          requested_by: null,
          cooling_off_until: coolingOffUntil,
          status: "processing",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const lines = await run(buildService(), ["--request-now", slug]);

      expect(lines).toEqual([`${processing.id} ${orgSchemaFor(orgId)}`]);
      const row = await readRequestFor(orgId);
      expect(row.status).toBe("processing");
      expect(row.cooling_off_until).toEqual(coolingOffUntil);
    });

    it("the host wrapper's sequence erases a scratch org only after the snapshot is recorded", async () => {
      const { orgId, slug } = await createScratchOrg();
      const service = scopedTo(buildService(), orgId);

      const [requested] = await run(service, ["--request-now", slug]);
      const request = await readRequestFor(orgId);
      expect(requested).toBe(`${request.id} ${orgSchemaFor(orgId)}`);

      const due = await run(service, ["--due"]);
      expect(due).toContain(`${request.id} ${orgSchemaFor(orgId)}`);

      // A plain run before the snapshot is recorded claims the row and
      // stops there.
      const first = await run(service, []);
      expect(first).toEqual([`deferred ${orgId} snapshot`]);
      const deferred = await readRequestFor(orgId);
      expect(deferred.status).toBe("processing");
      expect(deferred.blobs_deleted_at).toBeNull();
      const org = await platformDb
        .selectFrom("orgs")
        .select("is_active")
        .where("id", "=", orgId)
        .executeTakeFirstOrThrow();
      expect(org.is_active).toBe(false);

      await run(service, ["--snapshot-recorded", request.id]);
      expect(await run(service, ["--due"])).not.toContain(
        `${request.id} ${orgSchemaFor(orgId)}`,
      );

      const second = await run(service, []);
      expect(second).toEqual([`erased ${orgId}`]);
      const done = await readRequestFor(orgId);
      expect(done.status).toBe("done");
      expect(done.requested_by).toBeNull();
      const audit = await platformDb
        .selectFrom("platform_audit_log")
        .select(["action", "actor"])
        .where("org_id", "=", orgId)
        .execute();
      expect(audit).toEqual([{ action: "org_erased", actor: CLI_ACTOR }]);
      const orgRow = await platformDb
        .selectFrom("orgs")
        .select("id")
        .where("id", "=", orgId)
        .executeTakeFirst();
      expect(orgRow).toBeUndefined();
    });

    it("--snapshot-recorded keeps the first recorded time", async () => {
      const { orgId } = await createScratchOrg();
      const first = new Date(Date.now() - HOUR_MS);
      const row = await platformDb
        .insertInto("deletion_requests")
        .values({
          org_id: orgId,
          requested_by: null,
          cooling_off_until: first,
          status: "processing",
          snapshot_at: first,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await run(buildService(), ["--snapshot-recorded", row.id]);

      expect((await readRequestFor(orgId)).snapshot_at).toEqual(first);
    });

    it("--snapshot-recorded with an unknown request id fails", async () => {
      const err = await rejectionOf(
        run(buildService(), ["--snapshot-recorded", requestId()]),
      );

      expect(err).toBeInstanceOf(NotFoundError);
    });

    it("--request-now with an unknown slug fails without repeating the slug", async () => {
      const slug = `erase-missing-${newOrgId().slice(0, 8)}`;

      const err = await rejectionOf(
        run(buildService(), ["--request-now", slug]),
      );

      expect(err).toBeInstanceOf(NotFoundError);
      expect(err instanceof Error ? err.message : "").not.toContain(slug);
    });
  },
);

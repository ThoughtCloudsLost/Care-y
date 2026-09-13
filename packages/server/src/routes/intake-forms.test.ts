/**
 * DB integration tests for the intake forms tRPC router, focused on the
 * listResponses query and backfillWraps mutation.
 *
 * Exercises auth/permission enforcement, pagination, ciphertext-only
 * output (no plaintext in responses), and audit logging.
 */

import crypto from "node:crypto";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, UsersTable } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  seedOrgPublicKey,
  expectTrpcError,
  mockReq,
  mockRes,
  type TestDb,
} from "../test-utils.js";
import { RoleId, newTicketId, newKeyGeneration } from "@care-y/shared";
import type {
  SessionId,
  SessionToken,
  IpToken,
  UaToken,
  OrgId,
  OrgSlug,
  OrgSchema,
  QueueId,
  IntakeFormId,
  AliasHash,
  ClientId,
  BlobKey,
} from "@care-y/shared";
import {
  createIntakeFormRouter,
  type IntakeFormRouterDeps,
} from "./intake-forms.js";
import { createCallerFactory } from "../trpc/trpc.js";
import { createAuditService } from "../tickets/audit.js";
import { createIntakeFormService } from "../portal/intake-form-service.js";
import { createIntakeResponseService } from "../portal/intake-response-service.js";
import { createNoopFieldEncryptor } from "../crypto/field-encryptor.js";
import type { Context, OrgContext } from "../trpc/context.js";

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "intake forms router - responses (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgCtx: OrgContext;
    let adminUser: Selectable<UsersTable>;
    let volunteerUser: Selectable<UsersTable>;
    let queueId: QueueId;
    let formId: IntakeFormId;
    let clientId: ClientId;

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;

      orgCtx = {
        orgId: "org-intake-resp-test" as OrgId,
        orgSlug: "test-intake-resp" as OrgSlug,
        orgSchema: testDb.schemaName as OrgSchema,
        tenantDb,
        sealedBox: {} as OrgContext["sealedBox"],
      };

      await tenantDb
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(tenantDb);

      adminUser = await createTestUser(tenantDb, {
        overrides: { role_id: RoleId.ADMIN },
      });
      volunteerUser = await createTestUser(tenantDb);

      const queue = await createTestQueue(tenantDb);
      queueId = queue.id;

      // Assign users to queue
      await tenantDb
        .insertInto("queue_assignments")
        .values([
          { queue_id: queueId, user_id: adminUser.id },
          { queue_id: queueId, user_id: volunteerUser.id },
        ])
        .execute();

      // Seed user_keys with vol_public
      for (const uid of [adminUser.id, volunteerUser.id]) {
        await tenantDb
          .insertInto("user_keys")
          .values({
            user_id: uid,
            salt: Buffer.alloc(16, 0xaa),
            vol_public: Buffer.alloc(32, 0xbb),
          })
          .onConflict((oc) =>
            oc
              .column("user_id")
              .doUpdateSet({ vol_public: Buffer.alloc(32, 0xbb) }),
          )
          .execute();
      }

      // Create client
      const alias = `rt-client-${crypto.randomUUID().slice(0, 8)}`;
      const inserted = await tenantDb
        .insertInto("clients")
        .values({
          encrypted_alias: Buffer.from(alias),
          alias_hash: alias as AliasHash,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      clientId = inserted.id;

      // Create form
      // care-y-ignore-next-line ast-pii-in-db-write -- `name` is the form's admin label, not a person's name; not PII
      const formRow = await tenantDb
        .insertInto("intake_forms")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- form admin label, not PII
          name: "test-responses-form",
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      formId = formRow.id;

      // Seed a ticket + response
      const ticketId = newTicketId();
      const keyGen = newKeyGeneration();
      await tenantDb
        .insertInto("tickets")
        .values({
          id: ticketId,
          client_id: clientId,
          queue_id: queueId,
          status: "open",
          priority: "normal",
          encrypted_title: Buffer.from("ct-title"),
          encrypted_description: Buffer.from("ct-desc"),
          key_generation: keyGen,
        })
        .execute();

      await tenantDb
        .insertInto("intake_form_responses")
        .values({
          ticket_id: ticketId,
          form_id: formId,
          encrypted_response: Buffer.from("ct-response"),
        })
        .execute();

      // Give admin a key wrap
      await tenantDb
        .insertInto("ticket_key_wraps")
        .values({
          ticket_id: ticketId,
          volunteer_id: adminUser.id,
          key_generation: keyGen,
          ephemeral_point: Buffer.alloc(32, 0x01),
          nonce: Buffer.alloc(24, 0x02),
          wrapped_key: Buffer.alloc(48, 0x03),
          algorithm: "ecies-ristretto255-v1",
        })
        .execute();
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    function buildDeps(): IntakeFormRouterDeps {
      return {
        createAuditSvc: (tDb) => createAuditService(tDb),
        intakeFormService: createIntakeFormService({
          fieldEncryptor: createNoopFieldEncryptor(),
        }),
        intakeResponseService: createIntakeResponseService(),
        blobStore: {
          put: vi.fn(async () => "key" as BlobKey),
          get: vi.fn(async () => null),
          delete: vi.fn(async () => undefined),
          exists: vi.fn(async () => false),
        },
        uploadLimiter: {
          check: () => ({ allowed: true, remaining: 5, retryAfterMs: 0 }),
          reset: vi.fn(),
        },
      };
    }

    function createAuthedCaller(user: Selectable<UsersTable>) {
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgCtx,
        session: {
          id: `sess-${user.id}` as SessionId,
          token: `tok-${user.id}` as SessionToken,
          userId: user.id,
          ipToken: "ip-tok" as IpToken,
          uaToken: "ua-tok" as UaToken,
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: user.id,
          encryptedIdentifier: user.encrypted_identifier.toString("base64"),
          encryptedDisplayName: user.encrypted_display_name.toString("base64"),
          encryptedPreferredLocale: null,
          roleId: user.role_id,
          isActive: user.is_active,
          hasSeenBriefing: true,
        },
      };
      const deps = buildDeps();
      return createCallerFactory(createIntakeFormRouter(deps))(ctx);
    }

    function createUnauthenticatedCaller() {
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgCtx,
        session: null,
        user: null,
      };
      const deps = buildDeps();
      return createCallerFactory(createIntakeFormRouter(deps))(ctx);
    }

    // -----------------------------------------------------------------------
    // Auth enforcement
    // -----------------------------------------------------------------------

    describe("auth enforcement", () => {
      it("rejects unauthenticated caller on listResponses", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(caller.listResponses({ formId }), "UNAUTHORIZED");
      });

      it("rejects volunteer (no VIEW_INTAKE_RESPONSES) on listResponses", async () => {
        const caller = createAuthedCaller(volunteerUser);
        await expectTrpcError(caller.listResponses({ formId }), "FORBIDDEN");
      });

      it("allows admin (has VIEW_INTAKE_RESPONSES) on listResponses", async () => {
        const caller = createAuthedCaller(adminUser);
        const result = await caller.listResponses({ formId });
        expect(result.rows).toBeDefined();
        expect(Array.isArray(result.rows)).toBe(true);
      });

      it("rejects unauthenticated caller on backfillWraps", async () => {
        const caller = createUnauthenticatedCaller();
        const ticketId = newTicketId();
        await expectTrpcError(
          caller.backfillWraps({
            ticketId,
            wraps: [
              {
                volunteerId: volunteerUser.id,
                ephemeralPoint: Buffer.alloc(32, 0x10).toString("base64"),
                nonce: Buffer.alloc(24, 0x20).toString("base64"),
                wrappedKey: Buffer.alloc(48, 0x30).toString("base64"),
              },
            ],
          }),
          "UNAUTHORIZED",
        );
      });

      it("rejects volunteer on backfillWraps", async () => {
        const caller = createAuthedCaller(volunteerUser);
        const ticketId = newTicketId();
        await expectTrpcError(
          caller.backfillWraps({
            ticketId,
            wraps: [
              {
                volunteerId: adminUser.id,
                ephemeralPoint: Buffer.alloc(32, 0x10).toString("base64"),
                nonce: Buffer.alloc(24, 0x20).toString("base64"),
                wrappedKey: Buffer.alloc(48, 0x30).toString("base64"),
              },
            ],
          }),
          "FORBIDDEN",
        );
      });
    });

    // -----------------------------------------------------------------------
    // Response shape
    // -----------------------------------------------------------------------

    describe("response shape", () => {
      it("returns base64url strings for ciphertext, not Buffer objects", async () => {
        const caller = createAuthedCaller(adminUser);
        const result = await caller.listResponses({ formId });

        expect(result.rows.length).toBeGreaterThan(0);

        const row = result.rows[0]!;
        expect(typeof row.encryptedResponse).toBe("string");
        expect(typeof row.submittedAt).toBe("string");
        expect(typeof row.ticketId).toBe("string");

        // Verify it parses as an ISO date
        expect(Number.isNaN(Date.parse(row.submittedAt))).toBe(false);

        // callerKeyWrap fields should be strings if present
        if (row.callerKeyWrap) {
          expect(typeof row.callerKeyWrap.ephemeralPoint).toBe("string");
          expect(typeof row.callerKeyWrap.nonce).toBe("string");
          expect(typeof row.callerKeyWrap.wrappedKey).toBe("string");
        }
      });

      it("never contains plaintext response content", async () => {
        const caller = createAuthedCaller(adminUser);
        const result = await caller.listResponses({ formId });

        const json = JSON.stringify(result);
        // "ct-response" is the plaintext we seeded as the encrypted_response
        // value. Since the server treats it as opaque ciphertext, it should
        // appear base64url-encoded, not as the raw string.
        expect(json).not.toContain('"ct-response"');
      });
    });

    // -----------------------------------------------------------------------
    // Audit logging
    // -----------------------------------------------------------------------

    describe("audit logging", () => {
      it("creates an audit entry when responses are viewed", async () => {
        const caller = createAuthedCaller(adminUser);
        await caller.listResponses({ formId });

        // Check audit log for the event
        const auditRows = await tenantDb
          .selectFrom("audit_log")
          .select(["event_type", "actor_id"])
          .where("event_type", "=", "intake_responses_viewed")
          .where("actor_id", "=", adminUser.id)
          .execute();

        expect(auditRows.length).toBeGreaterThan(0);
      });

      it("creates an audit entry when responses are exported", async () => {
        const caller = createAuthedCaller(adminUser);
        await caller.logExport({
          formId,
          exportedCount: 5,
          skippedCount: 1,
        });

        const auditRows = await tenantDb
          .selectFrom("audit_log")
          .select(["event_type", "actor_id", "metadata"])
          .where("event_type", "=", "intake_responses_exported")
          .where("actor_id", "=", adminUser.id)
          .execute();

        expect(auditRows.length).toBeGreaterThan(0);
        const entry = auditRows[0]!;
        const meta = entry.metadata as Record<string, unknown>;
        expect(meta.formId).toBe(formId);
        expect(meta.exportedCount).toBe(5);
        expect(meta.skippedCount).toBe(1);
      });
    });
  },
);

// ---------------------------------------------------------------------------
// Admin CRUD procedures (list, get, save, remove, setActive,
// setWebIntakeEnabled, getWebIntakeEnabled, setBuiltinDefaultEnabled,
// getBuiltinDefaultEnabled, uploadFormAsset)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "intake forms router - admin CRUD (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgCtx: OrgContext;
    let adminUser: Selectable<UsersTable>;
    let volunteerUser: Selectable<UsersTable>;
    let seededFormId: IntakeFormId;

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;

      orgCtx = {
        orgId: "org-intake-crud-test" as OrgId,
        orgSlug: "test-intake-crud" as OrgSlug,
        orgSchema: testDb.schemaName as OrgSchema,
        tenantDb,
        sealedBox: {} as OrgContext["sealedBox"],
      };

      await tenantDb
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(tenantDb);

      adminUser = await createTestUser(tenantDb, {
        overrides: { role_id: RoleId.ADMIN },
      });
      volunteerUser = await createTestUser(tenantDb);

      // Seed a form for get/remove/setActive tests
      // care-y-ignore-next-line ast-pii-in-db-write -- form admin label, not PII
      const row = await tenantDb
        .insertInto("intake_forms")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- form admin label, not PII
          name: "test-crud-form",
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      seededFormId = row.id;
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------------
    // Helpers (mirror the responses describe's helpers)
    // -----------------------------------------------------------------------

    function buildDeps(
      overrides?: Partial<IntakeFormRouterDeps>,
    ): IntakeFormRouterDeps {
      return {
        createAuditSvc: (tDb) => createAuditService(tDb),
        intakeFormService: createIntakeFormService({
          fieldEncryptor: createNoopFieldEncryptor(),
        }),
        intakeResponseService: createIntakeResponseService(),
        blobStore: {
          // Key must end in a UUID segment: the service parses the trailing
          // segment as the FormAssetId (form-asset-service.ts).
          put: vi.fn(
            async (..._args: unknown[]) =>
              `form-asset/${crypto.randomUUID()}` as BlobKey,
          ),
          get: vi.fn(async () => null),
          delete: vi.fn(async () => undefined),
          exists: vi.fn(async () => false),
        },
        uploadLimiter: {
          check: () => ({ allowed: true, remaining: 5, retryAfterMs: 0 }),
          reset: vi.fn(),
        },
        ...overrides,
      };
    }

    function createAuthedCaller(
      user: Selectable<UsersTable>,
      depsOverrides?: Partial<IntakeFormRouterDeps>,
    ) {
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgCtx,
        session: {
          id: `sess-${user.id}` as SessionId,
          token: `tok-${user.id}` as SessionToken,
          userId: user.id,
          ipToken: "ip-tok" as IpToken,
          uaToken: "ua-tok" as UaToken,
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: true,
          webauthnChallenge: null,
        },
        user: {
          id: user.id,
          encryptedIdentifier: user.encrypted_identifier.toString("base64"),
          encryptedDisplayName: user.encrypted_display_name.toString("base64"),
          encryptedPreferredLocale: null,
          roleId: user.role_id,
          isActive: user.is_active,
          hasSeenBriefing: true,
        },
      };
      const deps = buildDeps(depsOverrides);
      return {
        caller: createCallerFactory(createIntakeFormRouter(deps))(ctx),
        deps,
      };
    }

    function createUnauthenticatedCaller(
      depsOverrides?: Partial<IntakeFormRouterDeps>,
    ) {
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgCtx,
        session: null,
        user: null,
      };
      const deps = buildDeps(depsOverrides);
      return createCallerFactory(createIntakeFormRouter(deps))(ctx);
    }

    /** Builds a valid saveIntakeFormInput for the seeded queue. */
    function validSaveInput(formId: IntakeFormId | null = null) {
      return {
        formId,
        // care-y-ignore-next-line ast-pii-in-db-write -- form admin label, not PII
        name: "test-save-form",
        fields: [
          {
            fieldKey: crypto.randomUUID(),
            fieldType: "text" as const,
            encryptedLabel: Buffer.from("ct-label-a").toString("base64"),
            encryptedConfig: Buffer.from("ct-config-a").toString("base64"),
            isRequired: true,
          },
        ],
      };
    }

    // -----------------------------------------------------------------------
    // list
    // -----------------------------------------------------------------------

    describe("list", () => {
      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(caller.list(), "UNAUTHORIZED");
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(caller.list(), "FORBIDDEN");
      });

      it("returns forms array for admin", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.list();
        expect(result).toHaveProperty("forms");
        expect(Array.isArray(result.forms)).toBe(true);
        expect(result.forms.length).toBeGreaterThan(0);
      });
    });

    // -----------------------------------------------------------------------
    // get
    // -----------------------------------------------------------------------

    describe("get", () => {
      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(
          caller.get({ formId: seededFormId }),
          "UNAUTHORIZED",
        );
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.get({ formId: seededFormId }),
          "FORBIDDEN",
        );
      });

      it("returns NOT_FOUND for a nonexistent form", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const fakeId = crypto.randomUUID() as IntakeFormId;
        await expectTrpcError(caller.get({ formId: fakeId }), "NOT_FOUND");
      });

      it("returns form detail for an existing form", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const detail = await caller.get({ formId: seededFormId });
        expect(detail.formId).toBe(seededFormId);
        expect(typeof detail.name).toBe("string");
        expect(Array.isArray(detail.fields)).toBe(true);
      });
    });

    // -----------------------------------------------------------------------
    // save
    // -----------------------------------------------------------------------

    describe("save", () => {
      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(caller.save(validSaveInput()), "UNAUTHORIZED");
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(caller.save(validSaveInput()), "FORBIDDEN");
      });

      it("creates a new form and returns formId + isActive", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.save(validSaveInput());
        expect(typeof result.formId).toBe("string");
        expect(result.formId.length).toBeGreaterThan(0);
        // New forms start inactive (setActive is a separate call)
        expect(result.isActive).toBe(false);
      });

      it("logs an intake_form_saved audit event scoped to the actor", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.save(validSaveInput());

        // audit.log is fire-and-forget (void) in the router; poll for the row
        await vi.waitFor(async () => {
          const rows = await tenantDb
            .selectFrom("audit_log")
            .select(["event_type", "actor_id", "metadata"])
            .where("event_type", "=", "intake_form_saved")
            .where("actor_id", "=", adminUser.id)
            .execute();

          const match = rows.find((r) => {
            const meta = r.metadata as Record<string, unknown>;
            return meta.formId === result.formId;
          });
          expect(match).toBeDefined();
        });
      });

      it("never contains seeded plaintext label in the response", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.save(validSaveInput());
        const json = JSON.stringify(result);
        // "ct-label-a" is the plaintext we base64-encoded into the ciphertext
        // field. The router treats it as opaque ciphertext and must not leak
        // the raw value back.
        expect(json).not.toContain('"ct-label-a"');
      });
    });

    // -----------------------------------------------------------------------
    // remove
    // -----------------------------------------------------------------------

    describe("remove", () => {
      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        const fakeId = crypto.randomUUID() as IntakeFormId;
        await expectTrpcError(
          caller.remove({ formId: fakeId }),
          "UNAUTHORIZED",
        );
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.remove({ formId: seededFormId }),
          "FORBIDDEN",
        );
      });

      it("returns NOT_FOUND for a nonexistent form", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const fakeId = crypto.randomUUID() as IntakeFormId;
        await expectTrpcError(caller.remove({ formId: fakeId }), "NOT_FOUND");
      });

      it("deletes a form without responses and returns { deleted: true }", async () => {
        // Create a disposable form to delete
        // care-y-ignore-next-line ast-pii-in-db-write -- form admin label, not PII
        const disposable = await tenantDb
          .insertInto("intake_forms")
          .values({
            // care-y-ignore-next-line ast-pii-in-db-write -- form admin label, not PII
            name: "test-delete-target",
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.remove({ formId: disposable.id });
        expect(result).toEqual({ deleted: true });
      });

      it("logs an intake_form_deleted audit event scoped to the actor", async () => {
        // Create + delete another form
        // care-y-ignore-next-line ast-pii-in-db-write -- form admin label, not PII
        const target = await tenantDb
          .insertInto("intake_forms")
          .values({
            // care-y-ignore-next-line ast-pii-in-db-write -- form admin label, not PII
            name: "test-form-to-delete",
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const { caller } = createAuthedCaller(adminUser);
        await caller.remove({ formId: target.id });

        // audit.log is fire-and-forget (void) in the router; poll for the row
        await vi.waitFor(async () => {
          const rows = await tenantDb
            .selectFrom("audit_log")
            .select(["event_type", "actor_id", "metadata"])
            .where("event_type", "=", "intake_form_deleted")
            .where("actor_id", "=", adminUser.id)
            .execute();

          const match = rows.find((r) => {
            const meta = r.metadata as Record<string, unknown>;
            return meta.formId === target.id;
          });
          expect(match).toBeDefined();
        });
      });
    });

    // -----------------------------------------------------------------------
    // setActive
    // -----------------------------------------------------------------------

    describe("setActive", () => {
      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(
          caller.setActive({ formId: seededFormId, active: true }),
          "UNAUTHORIZED",
        );
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.setActive({ formId: seededFormId, active: true }),
          "FORBIDDEN",
        );
      });

      it("returns NOT_FOUND for a nonexistent form", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const fakeId = crypto.randomUUID() as IntakeFormId;
        await expectTrpcError(
          caller.setActive({ formId: fakeId, active: true }),
          "NOT_FOUND",
        );
      });

      it("activates a form and returns { ok: true }", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.setActive({
          formId: seededFormId,
          active: true,
        });
        expect(result).toEqual({ ok: true });
      });

      it("deactivates a form and returns { ok: true }", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.setActive({
          formId: seededFormId,
          active: false,
        });
        expect(result).toEqual({ ok: true });
      });
    });

    // -----------------------------------------------------------------------
    // getWebIntakeEnabled / setWebIntakeEnabled
    // -----------------------------------------------------------------------

    describe("getWebIntakeEnabled", () => {
      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(caller.getWebIntakeEnabled(), "UNAUTHORIZED");
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(caller.getWebIntakeEnabled(), "FORBIDDEN");
      });

      it("returns { enabled } boolean for admin", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.getWebIntakeEnabled();
        expect(result).toHaveProperty("enabled");
        expect(typeof result.enabled).toBe("boolean");
      });
    });

    describe("setWebIntakeEnabled", () => {
      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(
          caller.setWebIntakeEnabled({ enabled: false }),
          "UNAUTHORIZED",
        );
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.setWebIntakeEnabled({ enabled: false }),
          "FORBIDDEN",
        );
      });

      it("toggles the flag and returns { ok: true }", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.setWebIntakeEnabled({ enabled: false });
        expect(result).toEqual({ ok: true });

        // Verify the flag took effect
        const check = await caller.getWebIntakeEnabled();
        expect(check.enabled).toBe(false);

        // Restore
        await caller.setWebIntakeEnabled({ enabled: true });
      });

      it("logs a web_intake_toggled audit event scoped to the actor", async () => {
        const { caller } = createAuthedCaller(adminUser);
        await caller.setWebIntakeEnabled({ enabled: true });

        const rows = await tenantDb
          .selectFrom("audit_log")
          .select(["event_type", "actor_id", "metadata"])
          .where("event_type", "=", "web_intake_toggled")
          .where("actor_id", "=", adminUser.id)
          .execute();

        expect(rows.length).toBeGreaterThan(0);
        const meta = rows[rows.length - 1]!.metadata as Record<string, unknown>;
        expect(meta.enabled).toBe(true);
      });
    });

    // -----------------------------------------------------------------------
    // getBuiltinDefaultEnabled / setBuiltinDefaultEnabled
    // -----------------------------------------------------------------------

    describe("getBuiltinDefaultEnabled", () => {
      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(
          caller.getBuiltinDefaultEnabled(),
          "UNAUTHORIZED",
        );
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(caller.getBuiltinDefaultEnabled(), "FORBIDDEN");
      });

      it("returns { enabled } boolean for admin", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.getBuiltinDefaultEnabled();
        expect(result).toHaveProperty("enabled");
        expect(typeof result.enabled).toBe("boolean");
      });
    });

    describe("setBuiltinDefaultEnabled", () => {
      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(
          caller.setBuiltinDefaultEnabled({ enabled: false }),
          "UNAUTHORIZED",
        );
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.setBuiltinDefaultEnabled({ enabled: false }),
          "FORBIDDEN",
        );
      });

      it("toggles the flag and returns { ok: true }", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const result = await caller.setBuiltinDefaultEnabled({
          enabled: false,
        });
        expect(result).toEqual({ ok: true });

        const check = await caller.getBuiltinDefaultEnabled();
        expect(check.enabled).toBe(false);

        // Restore
        await caller.setBuiltinDefaultEnabled({ enabled: true });
      });

      it("logs a builtin_default_toggled audit event scoped to the actor", async () => {
        const { caller } = createAuthedCaller(adminUser);
        await caller.setBuiltinDefaultEnabled({ enabled: true });

        const rows = await tenantDb
          .selectFrom("audit_log")
          .select(["event_type", "actor_id", "metadata"])
          .where("event_type", "=", "builtin_default_toggled")
          .where("actor_id", "=", adminUser.id)
          .execute();

        expect(rows.length).toBeGreaterThan(0);
        const meta = rows[rows.length - 1]!.metadata as Record<string, unknown>;
        expect(meta.enabled).toBe(true);
      });
    });

    // -----------------------------------------------------------------------
    // uploadFormAsset
    // -----------------------------------------------------------------------

    describe("uploadFormAsset", () => {
      /** Small valid base64 payload for tests that do not care about blob content. */
      const smallBlob = Buffer.from("ct-form-asset-data").toString("base64");

      it("rejects unauthenticated caller", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(
          caller.uploadFormAsset({
            blob: smallBlob,
            sizeBytes: Buffer.from(smallBlob, "base64").byteLength,
            contentType: "image/png",
          }),
          "UNAUTHORIZED",
        );
      });

      it("rejects volunteer (no MANAGE_QUEUES)", async () => {
        const { caller } = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.uploadFormAsset({
            blob: smallBlob,
            sizeBytes: Buffer.from(smallBlob, "base64").byteLength,
            contentType: "image/png",
          }),
          "FORBIDDEN",
        );
      });

      it("returns TOO_MANY_REQUESTS when uploadLimiter denies", async () => {
        const deniedLimiter = {
          check: () => ({ allowed: false, remaining: 0, retryAfterMs: 5000 }),
          reset: vi.fn(),
        };
        const { caller } = createAuthedCaller(adminUser, {
          uploadLimiter: deniedLimiter,
        });

        await expectTrpcError(
          caller.uploadFormAsset({
            blob: smallBlob,
            sizeBytes: Buffer.from(smallBlob, "base64").byteLength,
            contentType: "image/png",
          }),
          "TOO_MANY_REQUESTS",
        );
      });

      it("calls blobStore.put with the decoded buffer on success", async () => {
        const putSpy = vi.fn(
          async (..._args: unknown[]) =>
            `form-asset/${crypto.randomUUID()}` as BlobKey,
        );
        const { caller } = createAuthedCaller(adminUser, {
          blobStore: {
            put: putSpy,
            get: vi.fn(async () => null),
            delete: vi.fn(async () => undefined),
            exists: vi.fn(async () => false),
          },
        });

        const decoded = Buffer.from(smallBlob, "base64");
        await caller.uploadFormAsset({
          blob: smallBlob,
          sizeBytes: decoded.byteLength,
          contentType: "image/png",
        });

        expect(putSpy).toHaveBeenCalledTimes(1);
        // BlobStore.put(orgSchema, category, blob): the Buffer payload is arg 2
        const callArgs = putSpy.mock.calls[0]!;
        expect(Buffer.isBuffer(callArgs[2])).toBe(true);
      });

      it("returns blobKey and blobId strings on success", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const decoded = Buffer.from(smallBlob, "base64");
        const result = await caller.uploadFormAsset({
          blob: smallBlob,
          sizeBytes: decoded.byteLength,
          contentType: "image/png",
        });

        // Wire format: both fields are strings, not Buffer objects
        // (client consumes these as URL path segments and form-editor state)
        expect(typeof result.blobKey).toBe("string");
        expect(typeof result.blobId).toBe("string");
      });

      it("logs a form_asset_uploaded audit event scoped to the actor", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const decoded = Buffer.from(smallBlob, "base64");
        await caller.uploadFormAsset({
          blob: smallBlob,
          sizeBytes: decoded.byteLength,
          contentType: "image/png",
        });

        // audit.log is fire-and-forget (void) in the router; poll for the row
        await vi.waitFor(async () => {
          const rows = await tenantDb
            .selectFrom("audit_log")
            .select(["event_type", "actor_id", "metadata"])
            .where("event_type", "=", "form_asset_uploaded")
            .where("actor_id", "=", adminUser.id)
            .execute();

          expect(rows.length).toBeGreaterThan(0);
        });
      });

      it("never contains plaintext blob content in the response", async () => {
        const { caller } = createAuthedCaller(adminUser);
        const decoded = Buffer.from(smallBlob, "base64");
        const result = await caller.uploadFormAsset({
          blob: smallBlob,
          sizeBytes: decoded.byteLength,
          contentType: "image/png",
        });

        const json = JSON.stringify(result);
        // "ct-form-asset-data" is the plaintext we seeded as the blob value.
        // The response should carry keys/IDs only, never the blob content.
        expect(json).not.toContain("ct-form-asset-data");
      });
    });
  },
);

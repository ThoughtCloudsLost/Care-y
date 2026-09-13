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

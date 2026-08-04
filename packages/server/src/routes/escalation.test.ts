/**
 * DB integration tests for the escalation rules tRPC router.
 *
 * Exercises the full tRPC procedure chain against a real test schema:
 * auth enforcement (admin-only), CRUD roundtrip, queue existence
 * validation, audit row side-effects, and camelCase output shape.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely, Selectable } from "kysely";
import type { TenantDatabase, UsersTable } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  expectTrpcError,
  mockReq,
  mockRes,
  type TestDb,
} from "../test-utils.js";
import { RoleId, updateEscalationRuleInputSchema } from "@care-y/shared";
import {
  createEscalationRouter,
  type EscalationRouterDeps,
} from "./escalation.js";
import { createCallerFactory } from "../trpc/trpc.js";
import { createAuditService } from "../tickets/audit.js";
import type { Context, OrgContext } from "../trpc/context.js";

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "escalation router (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgCtx: OrgContext;
    let adminUser: Selectable<UsersTable>;
    let volunteerUser: Selectable<UsersTable>;
    let managerUser: Selectable<UsersTable>;
    let queueId: string;

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;

      orgCtx = {
        orgId: "org-escalation-test",
        orgSlug: "test-escalation",
        orgSchema: testDb.schemaName,
        tenantDb,
        sealedBox: {} as OrgContext["sealedBox"],
      };

      adminUser = await createTestUser(tenantDb, {
        overrides: { role_id: RoleId.ADMIN },
      });
      volunteerUser = await createTestUser(tenantDb);
      managerUser = await createTestUser(tenantDb, {
        overrides: { role_id: RoleId.MANAGER },
      });

      const queue = await createTestQueue(tenantDb);
      queueId = queue.id;
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    function buildDeps(): EscalationRouterDeps {
      return {
        createAuditSvc: (tDb) => createAuditService(tDb),
      };
    }

    function createAuthedCaller(user: Selectable<UsersTable>) {
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgCtx,
        session: {
          id: `sess-${user.id}`,
          token: `tok-${user.id}`,
          userId: user.id,
          ipToken: "ip-tok",
          uaToken: "ua-tok",
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
      return createCallerFactory(createEscalationRouter(deps))(ctx);
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
      return createCallerFactory(createEscalationRouter(deps))(ctx);
    }

    // -----------------------------------------------------------------------
    // Auth enforcement
    // -----------------------------------------------------------------------

    describe("auth enforcement", () => {
      it("rejects unauthenticated caller on list", async () => {
        const caller = createUnauthenticatedCaller();
        await expectTrpcError(caller.list({ queueId }), "UNAUTHORIZED");
      });

      it("rejects volunteer on list", async () => {
        const caller = createAuthedCaller(volunteerUser);
        await expectTrpcError(caller.list({ queueId }), "FORBIDDEN");
      });

      it("rejects manager on list", async () => {
        const caller = createAuthedCaller(managerUser);
        await expectTrpcError(caller.list({ queueId }), "FORBIDDEN");
      });

      it("rejects volunteer on create", async () => {
        const caller = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.create({
            queueId,
            ruleType: "unassigned_duration",
            thresholdMinutes: 60,
            action: "notify_managers",
          }),
          "FORBIDDEN",
        );
      });

      it("rejects volunteer on update", async () => {
        const caller = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.update({
            ruleId: "00000000-0000-0000-0000-000000000099",
            thresholdMinutes: 120,
          }),
          "FORBIDDEN",
        );
      });

      it("rejects volunteer on remove", async () => {
        const caller = createAuthedCaller(volunteerUser);
        await expectTrpcError(
          caller.remove({
            ruleId: "00000000-0000-0000-0000-000000000099",
          }),
          "FORBIDDEN",
        );
      });
    });

    // -----------------------------------------------------------------------
    // CRUD roundtrip
    // -----------------------------------------------------------------------

    describe("CRUD roundtrip", () => {
      let createdRuleId: string;

      it("creates a rule and returns camelCase shape", async () => {
        const caller = createAuthedCaller(adminUser);
        const result = await caller.create({
          queueId,
          ruleType: "unassigned_duration",
          thresholdMinutes: 60,
          action: "notify_managers",
        });

        expect(result.rule).toMatchObject({
          queueId,
          ruleType: "unassigned_duration",
          thresholdMinutes: 60,
          action: "notify_managers",
          isActive: true,
        });
        expect(result.rule.id).toEqual(expect.any(String));
        expect(result.rule.createdAt).toBeInstanceOf(Date);
        createdRuleId = result.rule.id;
      });

      it("lists rules for the queue", async () => {
        const caller = createAuthedCaller(adminUser);
        const result = await caller.list({ queueId });

        expect(result.rules).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: createdRuleId,
              queueId,
              ruleType: "unassigned_duration",
              thresholdMinutes: 60,
              action: "notify_managers",
              isActive: true,
            }),
          ]),
        );
      });

      it("updates threshold and action", async () => {
        const caller = createAuthedCaller(adminUser);
        const result = await caller.update({
          ruleId: createdRuleId,
          thresholdMinutes: 120,
          action: "notify_queue_watchers",
        });

        expect(result.rule).toMatchObject({
          id: createdRuleId,
          thresholdMinutes: 120,
          action: "notify_queue_watchers",
          isActive: true,
        });
      });

      it("updates isActive to false", async () => {
        const caller = createAuthedCaller(adminUser);
        const result = await caller.update({
          ruleId: createdRuleId,
          isActive: false,
        });

        expect(result.rule.isActive).toBe(false);
      });

      it("deletes the rule", async () => {
        const caller = createAuthedCaller(adminUser);
        const result = await caller.remove({ ruleId: createdRuleId });
        expect(result.deleted).toBe(true);

        const listResult = await caller.list({ queueId });
        const ids = listResult.rules.map((r) => r.id);
        expect(ids).not.toContain(createdRuleId);
      });
    });

    // -----------------------------------------------------------------------
    // Queue existence validation
    // -----------------------------------------------------------------------

    describe("queue existence validation", () => {
      it("rejects create for a nonexistent queue", async () => {
        const caller = createAuthedCaller(adminUser);
        await expectTrpcError(
          caller.create({
            queueId: "00000000-0000-0000-0000-000000000099",
            ruleType: "inactive_duration",
            thresholdMinutes: 30,
            action: "notify_managers",
          }),
          "NOT_FOUND",
          "Queue not found",
        );
      });
    });

    // -----------------------------------------------------------------------
    // NOT_FOUND on update/remove for missing rules
    // -----------------------------------------------------------------------

    describe("missing rule errors", () => {
      it("returns NOT_FOUND when updating a nonexistent rule", async () => {
        const caller = createAuthedCaller(adminUser);
        await expectTrpcError(
          caller.update({
            ruleId: "00000000-0000-0000-0000-000000000099",
            thresholdMinutes: 30,
          }),
          "NOT_FOUND",
          "Escalation rule not found",
        );
      });

      it("returns NOT_FOUND when removing a nonexistent rule", async () => {
        const caller = createAuthedCaller(adminUser);
        await expectTrpcError(
          caller.remove({
            ruleId: "00000000-0000-0000-0000-000000000099",
          }),
          "NOT_FOUND",
          "Escalation rule not found",
        );
      });
    });

    // -----------------------------------------------------------------------
    // Input validation (Zod rejects ruleType mutation on update)
    // -----------------------------------------------------------------------

    describe("input validation", () => {
      it("strips ruleType from update input (immutable field, not in schema)", () => {
        // Zod v4 objects strip unknown keys by default. Verify that
        // ruleType does not survive parsing, so it can never reach
        // the service layer.
        const parsed = updateEscalationRuleInputSchema.parse({
          ruleId: "00000000-0000-0000-0000-000000000099",
          ruleType: "inactive_duration",
          thresholdMinutes: 30,
        });

        expect(parsed).not.toHaveProperty("ruleType");
        expect(parsed).toEqual({
          ruleId: "00000000-0000-0000-0000-000000000099",
          thresholdMinutes: 30,
        });
      });
    });

    // -----------------------------------------------------------------------
    // Audit rows
    // -----------------------------------------------------------------------

    describe("audit rows", () => {
      it("writes correct audit event types and metadata without queue name", async () => {
        const caller = createAuthedCaller(adminUser);

        // Create
        const { rule } = await caller.create({
          queueId,
          ruleType: "inactive_duration",
          thresholdMinutes: 1440,
          action: "notify_queue_watchers",
        });

        // Update
        await caller.update({
          ruleId: rule.id,
          thresholdMinutes: 2880,
        });

        // Delete
        await caller.remove({ ruleId: rule.id });

        // Allow audit log writes to complete (fire-and-forget with void).
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Read audit rows for our rule (filter metadata in JS, the
        // established audit-test idiom)
        const auditRows = await tenantDb
          .selectFrom("audit_log")
          .selectAll()
          .where("event_type", "in", [
            "escalation_rule_created",
            "escalation_rule_updated",
            "escalation_rule_deleted",
          ])
          .orderBy("created_at", "asc")
          .execute();

        const ruleRows = auditRows.filter((r) => r.metadata.ruleId === rule.id);
        expect(ruleRows).toHaveLength(3);
        const [createdRow, updatedRow, deletedRow] = ruleRows;

        // Created
        expect(createdRow?.event_type).toBe("escalation_rule_created");
        expect(createdRow?.actor_id).toBe(adminUser.id);
        expect(createdRow?.metadata).toMatchObject({
          ruleId: rule.id,
          queueId,
          ruleType: "inactive_duration",
        });
        // Never store queue name in audit metadata
        expect(createdRow?.metadata).not.toHaveProperty("queueName");

        // Updated
        expect(updatedRow?.event_type).toBe("escalation_rule_updated");
        expect(updatedRow?.metadata).toMatchObject({
          ruleId: rule.id,
          queueId,
        });
        expect(updatedRow?.metadata).not.toHaveProperty("queueName");

        // Deleted
        expect(deletedRow?.event_type).toBe("escalation_rule_deleted");
        expect(deletedRow?.metadata).toMatchObject({
          ruleId: rule.id,
          queueId,
        });
        expect(deletedRow?.metadata).not.toHaveProperty("queueName");
      });
    });
  },
);

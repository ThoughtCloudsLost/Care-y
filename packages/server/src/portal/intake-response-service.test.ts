/**
 * Integration tests for the intake response listing and backfill service.
 *
 * DB tests run inside Docker via `pnpm test:server:db`. They create an
 * isolated test schema per suite and drop it in afterAll.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { TestDb } from "../test-utils.js";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestUser,
} from "../test-utils.js";
import { createIntakeResponseService } from "./intake-response-service.js";
import { ForbiddenError, NotFoundError } from "../errors.js";
import { RoleId, newTicketId, newKeyGeneration } from "@care-y/shared";
import type {
  QueueId,
  UserId,
  ClientId,
  TicketId,
  IntakeFormId,
  KeyGeneration,
  AliasHash,
  OrgSchema,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function seedForm(db: TestDb["db"]): Promise<IntakeFormId> {
  const row = await db
    .insertInto("intake_forms")
    .values({
      // care-y-ignore-next-line ast-pii-in-db-write -- `name` is the form's admin label, not a person's name; not PII
      name: `test-form-${crypto.randomUUID().slice(0, 8)}`,
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

async function seedTicketWithResponse(
  db: TestDb["db"],
  queueId: QueueId,
  clientId: ClientId,
  formId: IntakeFormId,
  opts?: { withOrgSeal?: boolean },
): Promise<{ ticketId: TicketId; keyGeneration: KeyGeneration }> {
  const ticketId = newTicketId();
  const keyGeneration = newKeyGeneration();

  await db
    .insertInto("tickets")
    .values({
      id: ticketId,
      client_id: clientId,
      queue_id: queueId,
      status: "open",
      priority: "normal",
      encrypted_title: Buffer.from("ct-title"),
      encrypted_description: Buffer.from("ct-desc"),
      key_generation: keyGeneration,
    })
    .execute();

  await db
    .insertInto("intake_form_responses")
    .values({
      ticket_id: ticketId,
      form_id: formId,
      encrypted_response: Buffer.from("ct-response"),
    })
    .execute();

  if (opts?.withOrgSeal) {
    await db
      .insertInto("intake_key_wraps")
      .values({
        ticket_id: ticketId,
        wrapped_tk: Buffer.alloc(80, 0xab),
      })
      .execute();
  }

  return { ticketId, keyGeneration };
}

async function seedKeyWrap(
  db: TestDb["db"],
  ticketId: TicketId,
  volunteerId: UserId,
  keyGeneration: KeyGeneration,
): Promise<void> {
  await db
    .insertInto("ticket_key_wraps")
    .values({
      ticket_id: ticketId,
      volunteer_id: volunteerId,
      key_generation: keyGeneration,
      ephemeral_point: Buffer.alloc(32, 0x01),
      nonce: Buffer.alloc(24, 0x02),
      wrapped_key: Buffer.alloc(48, 0x03),
      algorithm: "ecies-ristretto255-v1",
    })
    .execute();
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "intake response service (DB integration)",
  () => {
    let testDb: TestDb;
    let orgSchema: OrgSchema;
    let queueId: QueueId;
    let adminUser: { id: UserId };
    let volunteerUser: { id: UserId };
    let clientId: ClientId;
    let formId: IntakeFormId;
    const svc = createIntakeResponseService();

    beforeAll(async () => {
      testDb = await createTestDb();
      orgSchema = testDb.schemaName as OrgSchema;

      await testDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(testDb.db);

      const q = await createTestQueue(testDb.db, { label: "Responses" });
      queueId = q.id;

      // Admin user with VIEW_INTAKE_RESPONSES by default
      const admin = await createTestUser(testDb.db, {
        overrides: { role_id: RoleId.ADMIN },
      });
      adminUser = { id: admin.id };

      // Volunteer user without the permission by default
      const vol = await createTestUser(testDb.db);
      volunteerUser = { id: vol.id };

      // Assign both to the queue
      await testDb.db
        .insertInto("queue_assignments")
        .values([
          { queue_id: queueId, user_id: adminUser.id },
          { queue_id: queueId, user_id: volunteerUser.id },
        ])
        .execute();

      // Seed user_keys with vol_public for both
      for (const uid of [adminUser.id, volunteerUser.id]) {
        await testDb.db
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

      // Create a client
      const alias = `resp-client-${crypto.randomUUID().slice(0, 8)}`;
      const inserted = await testDb.db
        .insertInto("clients")
        .values({
          encrypted_alias: Buffer.from(alias),
          alias_hash: alias as AliasHash,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      clientId = inserted.id;

      formId = await seedForm(testDb.db);
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------------
    // listResponses
    // -----------------------------------------------------------------------

    describe("listResponses", () => {
      it("returns empty page for a form with no responses", async () => {
        const emptyFormId = await seedForm(testDb.db);
        const result = await svc.listResponses(
          testDb.db,
          orgSchema,
          adminUser.id,
          emptyFormId,
          { cursor: null, pageSize: 25 },
        );

        expect(result.rows).toHaveLength(0);
        expect(result.total).toBe(0);
        expect(result.nextCursor).toBeNull();
      });

      it("throws NOT_FOUND for a nonexistent form", async () => {
        const fakeFormId = crypto.randomUUID() as IntakeFormId;
        await expect(
          svc.listResponses(testDb.db, orgSchema, adminUser.id, fakeFormId, {
            cursor: null,
            pageSize: 25,
          }),
        ).rejects.toThrow(NotFoundError);
      });

      it("returns encrypted response with caller key wrap when present", async () => {
        const { ticketId, keyGeneration } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          formId,
        );
        await seedKeyWrap(testDb.db, ticketId, adminUser.id, keyGeneration);

        const result = await svc.listResponses(
          testDb.db,
          orgSchema,
          adminUser.id,
          formId,
          { cursor: null, pageSize: 25 },
        );

        const row = result.rows.find((r) => r.ticketId === ticketId);
        expect(row).toBeDefined();
        expect(row!.encryptedResponse).toBeInstanceOf(Buffer);
        expect(row!.callerKeyWrap).not.toBeNull();
        expect(row!.callerKeyWrap!.volunteerId).toBe(adminUser.id);
        expect(row!.orgSealWrap).toBeNull();
      });

      it("returns org-seal wrap when intake_key_wraps row exists", async () => {
        const { ticketId } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          formId,
          { withOrgSeal: true },
        );

        const result = await svc.listResponses(
          testDb.db,
          orgSchema,
          adminUser.id,
          formId,
          { cursor: null, pageSize: 25 },
        );

        const row = result.rows.find((r) => r.ticketId === ticketId);
        expect(row).toBeDefined();
        expect(row!.orgSealWrap).not.toBeNull();
        expect(row!.orgSealWrap!.wrappedTk).toBeInstanceOf(Buffer);
        expect(row!.callerKeyWrap).toBeNull();
      });

      it("returns null wraps when caller has no key wrap and no org seal", async () => {
        const { ticketId } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          formId,
        );
        // No key wrap seeded, no org seal

        const result = await svc.listResponses(
          testDb.db,
          orgSchema,
          adminUser.id,
          formId,
          { cursor: null, pageSize: 25 },
        );

        const row = result.rows.find((r) => r.ticketId === ticketId);
        expect(row).toBeDefined();
        expect(row!.callerKeyWrap).toBeNull();
        expect(row!.orgSealWrap).toBeNull();
      });

      it("paginates correctly", async () => {
        // Seed 3 responses for a dedicated form
        const paginateForm = await seedForm(testDb.db);
        const tickets: TicketId[] = [];
        for (let i = 0; i < 3; i++) {
          const { ticketId } = await seedTicketWithResponse(
            testDb.db,
            queueId,
            clientId,
            paginateForm,
          );
          tickets.push(ticketId);
        }

        // Page 1: get first 2
        const page1 = await svc.listResponses(
          testDb.db,
          orgSchema,
          adminUser.id,
          paginateForm,
          { cursor: null, pageSize: 2 },
        );

        expect(page1.rows).toHaveLength(2);
        expect(page1.nextCursor).not.toBeNull();
        expect(page1.total).toBe(3);

        // Page 2: get remaining
        const page2 = await svc.listResponses(
          testDb.db,
          orgSchema,
          adminUser.id,
          paginateForm,
          { cursor: page1.nextCursor, pageSize: 2 },
        );

        expect(page2.rows).toHaveLength(1);
        expect(page2.nextCursor).toBeNull();
      });

      it("reports missing principals for tickets where caller holds a wrap", async () => {
        const missingForm = await seedForm(testDb.db);
        const { ticketId, keyGeneration } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          missingForm,
        );
        // Give admin a wrap but not volunteer
        await seedKeyWrap(testDb.db, ticketId, adminUser.id, keyGeneration);

        const result = await svc.listResponses(
          testDb.db,
          orgSchema,
          adminUser.id,
          missingForm,
          { cursor: null, pageSize: 25 },
        );

        const row = result.rows.find((r) => r.ticketId === ticketId);
        expect(row).toBeDefined();
        // volunteerUser is a queue member without a wrap, should be reported
        const missing = row!.missingPrincipals;
        const volunteerMissing = missing.find(
          (p) => p.volunteerId === volunteerUser.id,
        );
        expect(volunteerMissing).toBeDefined();
        expect(typeof volunteerMissing!.volPublic).toBe("string");
      });
    });

    // -----------------------------------------------------------------------
    // backfillWraps
    // -----------------------------------------------------------------------

    describe("backfillWraps", () => {
      it("inserts wraps for missing principals", async () => {
        const bfForm = await seedForm(testDb.db);
        const { ticketId, keyGeneration } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          bfForm,
        );
        await seedKeyWrap(testDb.db, ticketId, adminUser.id, keyGeneration);

        const result = await svc.backfillWraps(
          testDb.db,
          orgSchema,
          adminUser.id,
          {
            ticketId,
            wraps: [
              {
                ticketId,
                volunteerId: volunteerUser.id,
                ephemeralPoint: Buffer.alloc(32, 0x10),
                nonce: Buffer.alloc(24, 0x20),
                wrappedKey: Buffer.alloc(48, 0x30),
              },
            ],
          },
        );

        expect(result.inserted).toBe(1);

        // Verify wrap exists
        const wrap = await testDb.db
          .selectFrom("ticket_key_wraps")
          .select("volunteer_id")
          .where("ticket_id", "=", ticketId)
          .where("volunteer_id", "=", volunteerUser.id)
          .executeTakeFirst();

        expect(wrap).toBeDefined();
      });

      it("is idempotent (skips existing wraps)", async () => {
        const idForm = await seedForm(testDb.db);
        const { ticketId, keyGeneration } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          idForm,
        );
        await seedKeyWrap(testDb.db, ticketId, adminUser.id, keyGeneration);
        await seedKeyWrap(testDb.db, ticketId, volunteerUser.id, keyGeneration);

        const result = await svc.backfillWraps(
          testDb.db,
          orgSchema,
          adminUser.id,
          {
            ticketId,
            wraps: [
              {
                ticketId,
                volunteerId: volunteerUser.id,
                ephemeralPoint: Buffer.alloc(32, 0x10),
                nonce: Buffer.alloc(24, 0x20),
                wrappedKey: Buffer.alloc(48, 0x30),
              },
            ],
          },
        );

        expect(result.inserted).toBe(0);
      });

      it("rejects when caller has no wrap for the ticket", async () => {
        const noWrapForm = await seedForm(testDb.db);
        const { ticketId } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          noWrapForm,
        );
        // No wrap seeded for volunteerUser

        await expect(
          svc.backfillWraps(testDb.db, orgSchema, volunteerUser.id, {
            ticketId,
            wraps: [
              {
                ticketId,
                volunteerId: adminUser.id,
                ephemeralPoint: Buffer.alloc(32, 0x10),
                nonce: Buffer.alloc(24, 0x20),
                wrappedKey: Buffer.alloc(48, 0x30),
              },
            ],
          }),
        ).rejects.toThrow(ForbiddenError);
      });

      it("rejects wrap for an invalid target (not a queue member or permission holder)", async () => {
        const invalidForm = await seedForm(testDb.db);
        const { ticketId, keyGeneration } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          invalidForm,
        );
        await seedKeyWrap(testDb.db, ticketId, adminUser.id, keyGeneration);

        // Create an outsider user not in queue or with the permission
        const outsider = await createTestUser(testDb.db);

        await expect(
          svc.backfillWraps(testDb.db, orgSchema, adminUser.id, {
            ticketId,
            wraps: [
              {
                ticketId,
                volunteerId: outsider.id,
                ephemeralPoint: Buffer.alloc(32, 0x10),
                nonce: Buffer.alloc(24, 0x20),
                wrappedKey: Buffer.alloc(48, 0x30),
              },
            ],
          }),
        ).rejects.toThrow();
      });

      it("returns zero inserted for empty wraps array", async () => {
        const emptyForm = await seedForm(testDb.db);
        const { ticketId } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          emptyForm,
        );

        const result = await svc.backfillWraps(
          testDb.db,
          orgSchema,
          adminUser.id,
          {
            ticketId,
            wraps: [],
          },
        );

        expect(result.inserted).toBe(0);
      });

      it("accepts backfill when caller holds org seal (unconverted ticket)", async () => {
        const sealForm = await seedForm(testDb.db);
        const { ticketId } = await seedTicketWithResponse(
          testDb.db,
          queueId,
          clientId,
          sealForm,
          { withOrgSeal: true },
        );
        // Admin has no ticket_key_wraps row, but the ticket has an org seal

        const result = await svc.backfillWraps(
          testDb.db,
          orgSchema,
          adminUser.id,
          {
            ticketId,
            wraps: [
              {
                ticketId,
                volunteerId: volunteerUser.id,
                ephemeralPoint: Buffer.alloc(32, 0x10),
                nonce: Buffer.alloc(24, 0x20),
                wrappedKey: Buffer.alloc(48, 0x30),
              },
            ],
          },
        );

        expect(result.inserted).toBe(1);
      });
    });
  },
);

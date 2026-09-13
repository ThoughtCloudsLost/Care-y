/**
 * Integration tests for the intake ticket creation service.
 *
 * DB tests run inside Docker via `pnpm test:server:db`. They create an
 * isolated test schema per suite and drop it in afterAll.
 */

import crypto from "node:crypto";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  type Mock,
} from "vitest";
import type { TestDb } from "../test-utils.js";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestUser,
  testSealedBox,
  testUnseal,
  noopEncryptor,
} from "../test-utils.js";
import type { NotificationService } from "../notifications/service.js";
import {
  createIntakeTicket,
  IntakeQueueNotConfiguredError,
  IntakeDisabledError,
  type IntakeTicketInput,
} from "./intake-service.js";
import { ValidationError } from "../errors.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockNotificationService(): NotificationService & {
  dispatch: Mock;
  dispatchTicketless: Mock;
} {
  return {
    dispatch: vi.fn().mockResolvedValue(undefined),
    dispatchTicketless: vi.fn().mockResolvedValue(undefined),
  };
}

function makeInput(overrides?: Partial<IntakeTicketInput>): IntakeTicketInput {
  return {
    ticketId: crypto.randomUUID(),
    followUpId: crypto.randomUUID(),
    encryptedTitle: Buffer.from("ct-title-bytes"),
    encryptedDescription: Buffer.from("ct-desc-bytes"),
    encryptedMessage: Buffer.from("ct-msg-bytes"),
    encryptedFormResponse: Buffer.from("ct-form-response-bytes"),
    formId: null,
    wrappedTk: Buffer.alloc(80, 0xab),
    resolvedQueueId: null,
    resolvedPriority: null,
    resolvedEscalationLevel: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "createIntakeTicket (DB integration)",
  () => {
    let testDb: TestDb;
    let intakeQueueId: string;

    beforeAll(async () => {
      // Sodium is needed for sealedBox in sealString
      const { getSodium } = await import("@care-y/crypto");
      await getSodium();

      testDb = await createTestDb();

      // Seed org_config (required by the service for intake_queue_id lookup)
      await testDb.db
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(testDb.db);

      // Create a queue to serve as the intake queue
      const q = await createTestQueue(testDb.db, { label: "Intake" });
      intakeQueueId = q.id;

      // Set intake_queue_id in org_config
      await testDb.db
        .updateTable("org_config")
        .set({ intake_queue_id: intakeQueueId })
        .execute();
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("creates client + ticket + follow-up + interim wrap in one transaction", async () => {
      const ns = createMockNotificationService();
      const input = makeInput();

      const result = await createIntakeTicket(
        testDb.db,
        {
          notificationService: ns,
          sealedBox: testSealedBox,
          orgSchema: testDb.schemaName,
          orgSlug: "test-org",
        },
        input,
      );

      expect(result.ticketId).toBe(input.ticketId);
      expect(result.clientAlias).toMatch(/^[a-z]+-[a-z]+-\d+$/);

      // Verify ticket routes to the intake queue
      const ticketRow = await testDb.db
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", input.ticketId)
        .executeTakeFirst();
      expect(ticketRow).toBeDefined();
      expect(ticketRow!.queue_id).toBe(intakeQueueId);
      expect(ticketRow!.priority).toBe("normal");

      // Verify client row
      const client = await testDb.db
        .selectFrom("clients")
        .selectAll()
        .where("id", "=", ticketRow!.client_id)
        .executeTakeFirstOrThrow();
      expect(client.phone_id).toBeNull();

      // care-y-ignore-next-line server-no-decrypt -- test-only: verifies seal round-trip with committed test keypair
      const unsealed = testUnseal(client.encrypted_alias);
      expect(unsealed).toBe(result.clientAlias);

      // Verify follow-up
      const followup = await testDb.db
        .selectFrom("followups")
        .selectAll()
        .where("id", "=", input.followUpId!)
        .executeTakeFirst();
      expect(followup).toBeDefined();
      expect(followup!.source).toBe("client");

      // Verify interim wrap
      const wrap = await testDb.db
        .selectFrom("intake_key_wraps")
        .selectAll()
        .where("ticket_id", "=", input.ticketId)
        .executeTakeFirst();
      expect(wrap).toBeDefined();
      expect(wrap!.algorithm).toBe("sealed-box-org-v1");
    });

    it("skips follow-up when encryptedMessage is null", async () => {
      const ns = createMockNotificationService();
      const input = makeInput({
        encryptedMessage: null,
        followUpId: null,
      });

      const result = await createIntakeTicket(
        testDb.db,
        {
          notificationService: ns,
          sealedBox: testSealedBox,
          orgSchema: testDb.schemaName,
          orgSlug: "test-org",
        },
        input,
      );

      const followups = await testDb.db
        .selectFrom("followups")
        .selectAll()
        .where("ticket_id", "=", result.ticketId)
        .execute();
      expect(followups).toHaveLength(0);
    });

    it("routes to form destination queue when resolvedQueueId is null", async () => {
      const ns = createMockNotificationService();
      const destQueue = await createTestQueue(testDb.db, { label: "Dest" });

      // Create a form with destination_queue_id
      const form = await testDb.db
        .insertInto("intake_forms")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- intake_forms.name is a plaintext admin-internal label, not PII
          name: "Dest Form",
          is_active: true,
          destination_queue_id: destQueue.id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const input = makeInput({ formId: form.id });

      const result = await createIntakeTicket(
        testDb.db,
        {
          notificationService: ns,
          sealedBox: testSealedBox,
          orgSchema: testDb.schemaName,
          orgSlug: "test-org",
        },
        input,
      );

      const ticket = await testDb.db
        .selectFrom("tickets")
        .select("queue_id")
        .where("id", "=", result.ticketId)
        .executeTakeFirstOrThrow();
      expect(ticket.queue_id).toBe(destQueue.id);
    });

    it("routes to resolvedQueueId when in the field allow-list", async () => {
      const ns = createMockNotificationService();
      const routeQueue = await createTestQueue(testDb.db, { label: "Route" });

      // Create a form with a queue-routing field
      const form = await testDb.db
        .insertInto("intake_forms")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
          name: "Routing Form",
          is_active: true,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("intake_form_fields")
        .values({
          form_id: form.id,
          position: 0,
          field_type: "select",
          role: "queue-routing",
          routing_queue_ids: [routeQueue.id],
          encrypted_label: Buffer.from("l"),
          encrypted_config: Buffer.from("c"),
          is_required: true,
        })
        .execute();

      const input = makeInput({
        formId: form.id,
        resolvedQueueId: routeQueue.id,
      });

      const result = await createIntakeTicket(
        testDb.db,
        {
          notificationService: ns,
          sealedBox: testSealedBox,
          orgSchema: testDb.schemaName,
          orgSlug: "test-org",
        },
        input,
      );

      const ticket = await testDb.db
        .selectFrom("tickets")
        .select("queue_id")
        .where("id", "=", result.ticketId)
        .executeTakeFirstOrThrow();
      expect(ticket.queue_id).toBe(routeQueue.id);
    });

    it("rejects resolvedQueueId not in allow-list", async () => {
      const ns = createMockNotificationService();
      const allowedQueue = await createTestQueue(testDb.db, {
        label: "Allowed",
      });

      const form = await testDb.db
        .insertInto("intake_forms")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
          name: "Reject Form",
          is_active: true,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("intake_form_fields")
        .values({
          form_id: form.id,
          position: 0,
          field_type: "select",
          role: "queue-routing",
          routing_queue_ids: [allowedQueue.id],
          encrypted_label: Buffer.from("l"),
          encrypted_config: Buffer.from("c"),
          is_required: true,
        })
        .execute();

      const input = makeInput({
        formId: form.id,
        resolvedQueueId: crypto.randomUUID(), // Not in allow-list
      });

      await expect(
        createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgSchema: testDb.schemaName,
            orgSlug: "test-org",
          },
          input,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("applies resolvedPriority to the ticket", async () => {
      const ns = createMockNotificationService();
      const input = makeInput({ resolvedPriority: "urgent" });

      const result = await createIntakeTicket(
        testDb.db,
        {
          notificationService: ns,
          sealedBox: testSealedBox,
          orgSchema: testDb.schemaName,
          orgSlug: "test-org",
        },
        input,
      );

      const ticket = await testDb.db
        .selectFrom("tickets")
        .select("priority")
        .where("id", "=", result.ticketId)
        .executeTakeFirstOrThrow();
      expect(ticket.priority).toBe("urgent");
    });

    it("dispatches escalation notification when resolvedEscalationLevel present", async () => {
      const ns = createMockNotificationService();
      const user = await createTestUser(testDb.db);
      const form = await testDb.db
        .insertInto("intake_forms")
        .values({
          // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
          name: "Escalation Form",
          is_active: true,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("intake_form_fields")
        .values({
          form_id: form.id,
          position: 0,
          field_type: "checkbox",
          role: "escalation",
          encrypted_escalation_recipient_ids: noopEncryptor.encrypt(
            JSON.stringify([user.id]),
          ),
          encrypted_label: Buffer.from("l"),
          encrypted_config: Buffer.from("c"),
          is_required: false,
        })
        .execute();

      const input = makeInput({
        formId: form.id,
        resolvedEscalationLevel: "triggered",
      });

      await createIntakeTicket(
        testDb.db,
        {
          notificationService: ns,
          sealedBox: testSealedBox,
          fieldEncryptor: noopEncryptor,
          orgSchema: testDb.schemaName,
          orgSlug: "test-org",
        },
        input,
      );

      // Give fire-and-forget dispatches a tick
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Two dispatches: ticket_created + ticket_escalated
      expect(ns.dispatch).toHaveBeenCalledTimes(2);
    });

    it("throws IntakeDisabledError when web_intake_enabled is false", async () => {
      await testDb.db
        .updateTable("org_config")
        .set({ web_intake_enabled: false })
        .execute();

      const ns = createMockNotificationService();
      const input = makeInput();

      await expect(
        createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgSchema: testDb.schemaName,
            orgSlug: "test-org",
          },
          input,
        ),
      ).rejects.toThrow(IntakeDisabledError);

      // Cleanup
      await testDb.db
        .updateTable("org_config")
        .set({ web_intake_enabled: true })
        .execute();
    });

    it("throws IntakeQueueNotConfiguredError when intake_queue_id is null", async () => {
      const freshDb = await createTestDb();
      try {
        await freshDb.db
          .insertInto("org_config")
          .values({ pii_retention_days: null, intake_queue_id: null })
          .onConflict((oc) => oc.doNothing())
          .execute();

        const ns = createMockNotificationService();
        const input = makeInput();

        await expect(
          createIntakeTicket(
            freshDb.db,
            {
              notificationService: ns,
              sealedBox: testSealedBox,
              orgSchema: freshDb.schemaName,
              orgSlug: "test-org",
            },
            input,
          ),
        ).rejects.toThrow(IntakeQueueNotConfiguredError);
      } finally {
        await freshDb.cleanup();
      }
    }, 30_000);

    it("dispatches ticket_created to queue watchers after commit", async () => {
      const ns = createMockNotificationService();

      const user = await createTestUser(testDb.db);
      await testDb.db
        .insertInto("queue_watchers")
        .values({ queue_id: intakeQueueId, user_id: user.id })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();

      const input = makeInput();
      await createIntakeTicket(
        testDb.db,
        {
          notificationService: ns,
          sealedBox: testSealedBox,
          orgSchema: testDb.schemaName,
          orgSlug: "test-org",
        },
        input,
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(ns.dispatch).toHaveBeenCalledOnce();
      expect(ns.dispatch).toHaveBeenCalledWith(
        testDb.db,
        testDb.schemaName,
        "test-org",
        "ticket_created",
        input.ticketId,
        intakeQueueId,
        expect.objectContaining({
          recipients: expect.arrayContaining([
            expect.objectContaining({
              userId: user.id,
              source: "queue_watcher",
            }),
          ]),
        }),
      );

      await testDb.db
        .deleteFrom("queue_watchers")
        .where("queue_id", "=", intakeQueueId)
        .where("user_id", "=", user.id)
        .execute();
    });

    it("default-form submissions (formId null) store no response row", async () => {
      const ns = createMockNotificationService();
      const input = makeInput({ formId: null });

      const result = await createIntakeTicket(
        testDb.db,
        {
          notificationService: ns,
          sealedBox: testSealedBox,
          orgSchema: testDb.schemaName,
          orgSlug: "test-org",
        },
        input,
      );

      const responses = await testDb.db
        .selectFrom("intake_form_responses")
        .selectAll()
        .where("ticket_id", "=", result.ticketId)
        .execute();
      expect(responses).toHaveLength(0);
    });
  },
);

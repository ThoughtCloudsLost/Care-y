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
} from "../test-utils.js";
import type { NotificationService } from "../notifications/service.js";
import {
  createIntakeTicket,
  IntakeQueueNotConfiguredError,
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

      // Verify client row: find the ticket to get client_id
      const ticket = await testDb.db
        .selectFrom("tickets")
        .select("client_id")
        .where("id", "=", input.ticketId)
        .executeTakeFirstOrThrow();

      const client = await testDb.db
        .selectFrom("clients")
        .selectAll()
        .where("id", "=", ticket.client_id)
        .executeTakeFirstOrThrow();
      expect(client.phone_id).toBeNull();

      // encrypted_alias must NOT be the raw alias bytes (it is sealed ciphertext)
      expect(client.encrypted_alias.toString("utf-8")).not.toBe(
        result.clientAlias,
      );

      // Unsealing with the test org keypair recovers the original alias
      // care-y-ignore-next-line server-no-decrypt -- test-only: verifies seal round-trip with committed test keypair
      const unsealed = testUnseal(client.encrypted_alias);
      expect(unsealed).toBe(result.clientAlias);

      // Verify ticket row (full select for queue/priority assertions)
      const ticketRow = await testDb.db
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", input.ticketId)
        .executeTakeFirst();
      expect(ticketRow).toBeDefined();
      expect(ticketRow!.client_id).toBe(client.id);
      expect(ticketRow!.queue_id).toBe(intakeQueueId);
      expect(ticketRow!.priority).toBe("normal");

      // Verify follow-up
      const followup = await testDb.db
        .selectFrom("followups")
        .selectAll()
        .where("id", "=", input.followUpId!)
        .executeTakeFirst();
      expect(followup).toBeDefined();
      expect(followup!.source).toBe("client");
      expect(followup!.type).toBe("message");
      expect(followup!.key_generation).toBeNull();
      expect(followup!.created_by).toBeNull();

      // Verify interim wrap
      const wrap = await testDb.db
        .selectFrom("intake_key_wraps")
        .selectAll()
        .where("ticket_id", "=", input.ticketId)
        .executeTakeFirst();
      expect(wrap).toBeDefined();
      expect(wrap!.algorithm).toBe("sealed-box-org-v1");
    });

    it("stores bytes identical to input (no transformation of ciphertext)", async () => {
      const ns = createMockNotificationService();
      const titleBytes = Buffer.from("exact-title-check");
      const descBytes = Buffer.from("exact-desc-check");
      const msgBytes = Buffer.from("exact-msg-check");
      const wrapBytes = Buffer.alloc(80, 0xcd);

      const input = makeInput({
        encryptedTitle: titleBytes,
        encryptedDescription: descBytes,
        encryptedMessage: msgBytes,
        wrappedTk: wrapBytes,
      });

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

      const ticket = await testDb.db
        .selectFrom("tickets")
        .select(["encrypted_title", "encrypted_description"])
        .where("id", "=", input.ticketId)
        .executeTakeFirstOrThrow();
      expect(Buffer.compare(ticket.encrypted_title, titleBytes)).toBe(0);
      expect(Buffer.compare(ticket.encrypted_description, descBytes)).toBe(0);

      const followup = await testDb.db
        .selectFrom("followups")
        .select("encrypted_content")
        .where("ticket_id", "=", input.ticketId)
        .executeTakeFirstOrThrow();
      expect(Buffer.compare(followup.encrypted_content, msgBytes)).toBe(0);

      const wrap = await testDb.db
        .selectFrom("intake_key_wraps")
        .select("wrapped_tk")
        .where("ticket_id", "=", input.ticketId)
        .executeTakeFirstOrThrow();
      expect(Buffer.compare(wrap.wrapped_tk, wrapBytes)).toBe(0);
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

    it("creates response row when formId matches queue binding", async () => {
      const ns = createMockNotificationService();

      // Create a form and bind it to the intake queue
      const form = await testDb.db
        .insertInto("intake_forms")
        // care-y-ignore-next-line ast-pii-in-db-write -- intake_forms.name is a plaintext admin-internal label (string column, not Buffer), not PII
        .values({ name: "Test Form" })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("queue_intake_forms")
        .values({ queue_id: intakeQueueId, form_id: form.id })
        .onConflict((oc) =>
          oc.column("queue_id").doUpdateSet({ form_id: form.id }),
        )
        .execute();

      const responseBytes = Buffer.from("encrypted-form-response-data");
      const input = makeInput({
        formId: form.id,
        encryptedFormResponse: responseBytes,
      });

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

      const response = await testDb.db
        .selectFrom("intake_form_responses")
        .selectAll()
        .where("ticket_id", "=", input.ticketId)
        .executeTakeFirstOrThrow();

      expect(response.form_id).toBe(form.id);
      expect(Buffer.compare(response.encrypted_response, responseBytes)).toBe(
        0,
      );

      // Clean up binding for other tests
      await testDb.db
        .deleteFrom("queue_intake_forms")
        .where("queue_id", "=", intakeQueueId)
        .execute();
    });

    it("rejects stale formId and creates nothing", async () => {
      const ns = createMockNotificationService();
      const staleFormId = crypto.randomUUID();

      const input = makeInput({ formId: staleFormId });

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

      // Verify nothing was created (transaction rolled back)
      const ticket = await testDb.db
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", input.ticketId)
        .executeTakeFirst();
      expect(ticket).toBeUndefined();

      const wrap = await testDb.db
        .selectFrom("intake_key_wraps")
        .selectAll()
        .where("ticket_id", "=", input.ticketId)
        .executeTakeFirst();
      expect(wrap).toBeUndefined();
    });

    it("throws IntakeQueueNotConfiguredError when intake_queue_id is null", async () => {
      // Use a separate test DB to avoid mutating the shared org_config
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

      // Add a queue watcher so the recipient list is non-empty
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

      // The dispatch is fire-and-forget; give the microtask a tick to settle
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

      // Clean up watcher
      await testDb.db
        .deleteFrom("queue_watchers")
        .where("queue_id", "=", intakeQueueId)
        .where("user_id", "=", user.id)
        .execute();
    });

    it("does not fail the submission when dispatch throws", async () => {
      const ns = createMockNotificationService();
      ns.dispatch.mockRejectedValueOnce(
        new Error("notification transport down"),
      );

      const warnSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

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

      // Ticket was still created successfully
      expect(result.ticketId).toBe(input.ticketId);

      // Give the fire-and-forget dispatch a tick to settle and log
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(warnSpy).toHaveBeenCalledWith(
        "Intake notification dispatch failed:",
        "notification transport down",
      );
      warnSpy.mockRestore();
    });

    it("rollback on duplicate ticket id leaves no orphan rows", async () => {
      const ns = createMockNotificationService();

      // First insertion succeeds
      const sharedTicketId = crypto.randomUUID();
      const input1 = makeInput({ ticketId: sharedTicketId });
      await createIntakeTicket(
        testDb.db,
        {
          notificationService: ns,
          sealedBox: testSealedBox,
          orgSchema: testDb.schemaName,
          orgSlug: "test-org",
        },
        input1,
      );

      // Second insertion with the same ticket id should fail (PK collision)
      const input2 = makeInput({ ticketId: sharedTicketId });
      await expect(
        createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgSchema: testDb.schemaName,
            orgSlug: "test-org",
          },
          input2,
        ),
      ).rejects.toThrow();

      // Only the original ticket and wrap exist (no orphans from the second attempt)
      const tickets = await testDb.db
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", sharedTicketId)
        .execute();
      expect(tickets).toHaveLength(1);

      const wraps = await testDb.db
        .selectFrom("intake_key_wraps")
        .selectAll()
        .where("ticket_id", "=", sharedTicketId)
        .execute();
      expect(wraps).toHaveLength(1);
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

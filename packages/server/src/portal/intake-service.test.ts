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
  testBlindIndexer,
  TEST_ORG_ID,
} from "../test-utils.js";
import type { NotificationService } from "../notifications/service.js";
import {
  createIntakeTicket,
  IntakeQueueNotConfiguredError,
  IntakeDisabledError,
  IntakeFormClosedError,
  IntakeAccountUnavailableError,
  type IntakeTicketInput,
  type IntakeAccountInput,
  type IntakeContinuationInput,
} from "./intake-service.js";
import { ValidationError } from "../errors.js";
import { UsernameTakenError } from "./portal-errors.js";
import type { AccountServiceDeps } from "./account-service.js";
import {
  newTicketId,
  newFollowupId,
  newClientAccountId,
  orgSlugIdSchema,
  channelSecretSchema,
} from "@care-y/shared";
import type { QueueId, OrgSchema, OrgSlug } from "@care-y/shared";
import { resolveAuthedChannel, revokeChannel } from "./channel-service.js";

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
    ticketId: newTicketId(),
    followUpId: newFollowupId(),
    encryptedTitle: Buffer.from("ct-title-bytes"),
    encryptedDescription: Buffer.from("ct-desc-bytes"),
    encryptedMessage: Buffer.from("ct-msg-bytes"),
    encryptedFormResponse: Buffer.from("ct-form-response-bytes"),
    formId: null,
    wrappedTk: Buffer.alloc(80, 0xab),
    resolvedQueueId: null,
    resolvedPriority: null,
    resolvedEscalationLevel: null,
    account: null,
    continuation: null,
    ...overrides,
  };
}

function makeAccountInput(usernameOverride?: string): IntakeAccountInput {
  return {
    registration: {
      accountId: newClientAccountId(),
      username:
        usernameOverride ?? `testuser-${crypto.randomUUID().slice(0, 8)}`,
      salt: crypto.randomBytes(16),
      publicKey: crypto.randomBytes(32),
      authHash: crypto.randomBytes(32),
      keyCheck: {
        ephemeralPoint: crypto.randomBytes(32),
        nonce: crypto.randomBytes(24),
        ciphertext: Buffer.from("keycheck-ciphertext"),
      },
    },
    selfCopy: null,
  };
}

function makeAccountInputWithSelfCopy(
  usernameOverride?: string,
): IntakeAccountInput {
  const base = makeAccountInput(usernameOverride);
  return {
    ...base,
    selfCopy: {
      ephemeralPoint: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      ciphertext: Buffer.from("selfcopy-ciphertext"),
    },
  };
}

function makeContinuationInput(): IntakeContinuationInput {
  return {
    channelId: channelSecretSchema.parse(
      crypto.randomBytes(24).toString("hex"),
    ),
    authHash: crypto.randomBytes(32),
    clientPublic: crypto.randomBytes(32),
    keyCheck: {
      ephemeralPoint: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      ciphertext: Buffer.from("keycheck-ciphertext"),
    },
    selfCopy: null,
  };
}

function makeContinuationInputWithSelfCopy(): IntakeContinuationInput {
  const base = makeContinuationInput();
  return {
    ...base,
    selfCopy: {
      ephemeralPoint: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      ciphertext: Buffer.from("cont-selfcopy-ciphertext"),
    },
  };
}

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "createIntakeTicket (DB integration)",
  () => {
    let testDb: TestDb;
    let intakeQueueId: QueueId;

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
          orgId: TEST_ORG_ID,
          orgSchema: testDb.schemaName as OrgSchema,
          orgSlug: orgSlugIdSchema.parse("test-org"),
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
          orgId: TEST_ORG_ID,
          orgSchema: testDb.schemaName as OrgSchema,
          orgSlug: orgSlugIdSchema.parse("test-org"),
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
          orgId: TEST_ORG_ID,
          orgSchema: testDb.schemaName as OrgSchema,
          orgSlug: orgSlugIdSchema.parse("test-org"),
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
          field_key: crypto.randomUUID(),
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
          orgId: TEST_ORG_ID,
          orgSchema: testDb.schemaName as OrgSchema,
          orgSlug: orgSlugIdSchema.parse("test-org"),
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
          field_key: crypto.randomUUID(),
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
        resolvedQueueId: crypto.randomUUID() as QueueId, // Not in allow-list
      });

      await expect(
        createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
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
          orgId: TEST_ORG_ID,
          orgSchema: testDb.schemaName as OrgSchema,
          orgSlug: orgSlugIdSchema.parse("test-org"),
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
          field_key: crypto.randomUUID(),
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
          orgId: TEST_ORG_ID,
          orgSchema: testDb.schemaName as OrgSchema,
          orgSlug: orgSlugIdSchema.parse("test-org"),
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
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
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
              orgId: TEST_ORG_ID,
              orgSchema: freshDb.schemaName as OrgSchema,
              orgSlug: orgSlugIdSchema.parse("test-org"),
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
          orgId: TEST_ORG_ID,
          orgSchema: testDb.schemaName as OrgSchema,
          orgSlug: orgSlugIdSchema.parse("test-org"),
        },
        input,
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(ns.dispatch).toHaveBeenCalledOnce();
      expect(ns.dispatch).toHaveBeenCalledWith(
        testDb.db,
        TEST_ORG_ID,
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
          orgId: TEST_ORG_ID,
          orgSchema: testDb.schemaName as OrgSchema,
          orgSlug: orgSlugIdSchema.parse("test-org"),
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

    // -----------------------------------------------------------------
    // Account branch integration tests
    // -----------------------------------------------------------------

    describe("account branch", () => {
      let accountDeps: AccountServiceDeps;

      beforeAll(async () => {
        const { deriveFakeSaltKey } = await import("../auth/salt-defense.js");
        const opsHex =
          "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe";
        const fakeSaltKey = await deriveFakeSaltKey(opsHex);
        accountDeps = {
          indexer: testBlindIndexer,
          fakeSaltKey,
          orgUuid: TEST_ORG_ID,
        };
      });

      it("creates client + ticket + account + kind-account channel + tier atomically", async () => {
        const ns = createMockNotificationService();
        const acct = makeAccountInput();
        const input = makeInput({ account: acct });

        const result = await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
            accountServiceDeps: accountDeps,
          },
          input,
        );

        expect(result.ticketId).toBe(input.ticketId);

        // Verify ticket
        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("client_id")
          .where("id", "=", input.ticketId)
          .executeTakeFirstOrThrow();

        // Verify account row
        const account = await testDb.db
          .selectFrom("client_accounts")
          .selectAll()
          .where("client_id", "=", ticket.client_id)
          .executeTakeFirst();
        expect(account).toBeDefined();
        expect(account!.id).toBe(acct.registration.accountId);

        // Verify channel with kind='account'
        const channel = await testDb.db
          .selectFrom("portal_channels")
          .selectAll()
          .where("client_id", "=", ticket.client_id)
          .where("status", "=", "active")
          .where("kind", "=", "account")
          .executeTakeFirst();
        expect(channel).toBeDefined();

        // Verify tier
        const client = await testDb.db
          .selectFrom("clients")
          .select("communication_tier")
          .where("id", "=", ticket.client_id)
          .executeTakeFirstOrThrow();
        expect(client.communication_tier).toBe("account");
      });

      it("stores selfCopy row with the correct followup_id", async () => {
        const ns = createMockNotificationService();
        const acct = makeAccountInputWithSelfCopy();
        const followUpId = newFollowupId();
        const input = makeInput({ account: acct, followUpId });

        await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
            accountServiceDeps: accountDeps,
          },
          input,
        );

        // Get the account channel
        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("client_id")
          .where("id", "=", input.ticketId)
          .executeTakeFirstOrThrow();

        const channel = await testDb.db
          .selectFrom("portal_channels")
          .select("id")
          .where("client_id", "=", ticket.client_id)
          .where("kind", "=", "account")
          .executeTakeFirstOrThrow();

        // Verify portal_messages row
        const messages = await testDb.db
          .selectFrom("portal_messages")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .execute();

        expect(messages).toHaveLength(1);
        expect(messages[0]!.followup_id).toBe(followUpId);
        expect(messages[0]!.direction).toBe("from_client");
      });

      it("rolls back everything on duplicate username", async () => {
        const ns = createMockNotificationService();
        const sharedUsername = `dup-${crypto.randomUUID().slice(0, 8)}`;

        // First submission with this username should succeed
        const acct1 = makeAccountInput(sharedUsername);
        const input1 = makeInput({ account: acct1 });
        await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
            accountServiceDeps: accountDeps,
          },
          input1,
        );

        // Second submission with the same username should fail and rollback
        const acct2 = makeAccountInput(sharedUsername);
        const input2 = makeInput({ account: acct2 });

        await expect(
          createIntakeTicket(
            testDb.db,
            {
              notificationService: ns,
              sealedBox: testSealedBox,
              orgId: TEST_ORG_ID,
              orgSchema: testDb.schemaName as OrgSchema,
              orgSlug: "test-org" as OrgSlug,
              accountServiceDeps: accountDeps,
            },
            input2,
          ),
        ).rejects.toThrow(UsernameTakenError);

        // Assert nothing persisted for the second attempt
        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("id")
          .where("id", "=", input2.ticketId)
          .executeTakeFirst();
        expect(ticket).toBeUndefined();
      });

      it("rejects with IntakeAccountUnavailableError when account input present but deps missing", async () => {
        const ns = createMockNotificationService();
        const acct = makeAccountInput();
        const input = makeInput({ account: acct });

        // Omit accountServiceDeps to trigger the fail-loud guard
        await expect(
          createIntakeTicket(
            testDb.db,
            {
              notificationService: ns,
              sealedBox: testSealedBox,
              orgId: TEST_ORG_ID,
              orgSchema: testDb.schemaName as OrgSchema,
              orgSlug: "test-org" as OrgSlug,
            },
            input,
          ),
        ).rejects.toThrow(IntakeAccountUnavailableError);

        // Verify transaction rolled back: no ticket or client rows created
        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("id")
          .where("id", "=", input.ticketId)
          .executeTakeFirst();
        expect(ticket).toBeUndefined();
      });

      it("without account branch is byte-identical to prior behavior", async () => {
        const ns = createMockNotificationService();
        const input = makeInput({ account: null });

        const result = await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
          },
          input,
        );

        expect(result.ticketId).toBe(input.ticketId);
        expect(result.clientAlias).toMatch(/^[a-z]+-[a-z]+-\d+$/);

        // No account should exist
        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("client_id")
          .where("id", "=", input.ticketId)
          .executeTakeFirstOrThrow();

        const account = await testDb.db
          .selectFrom("client_accounts")
          .select("id")
          .where("client_id", "=", ticket.client_id)
          .executeTakeFirst();
        expect(account).toBeUndefined();

        // No account channel should exist
        const channel = await testDb.db
          .selectFrom("portal_channels")
          .select("id")
          .where("client_id", "=", ticket.client_id)
          .where("kind", "=", "account")
          .executeTakeFirst();
        expect(channel).toBeUndefined();
      });
    });

    // -----------------------------------------------------------------
    // Closing date enforcement tests
    // -----------------------------------------------------------------

    describe("closing date enforcement", () => {
      it("rejects submission for a form whose closes_at is in the past", async () => {
        const ns = createMockNotificationService();
        const form = await testDb.db
          .insertInto("intake_forms")
          .values({
            // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
            name: "Closed Form",
            is_active: true,
            closes_at: new Date(Date.now() - 60_000),
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const input = makeInput({ formId: form.id });

        await expect(
          createIntakeTicket(
            testDb.db,
            {
              notificationService: ns,
              sealedBox: testSealedBox,
              orgId: TEST_ORG_ID,
              orgSchema: testDb.schemaName as OrgSchema,
              orgSlug: orgSlugIdSchema.parse("test-org"),
            },
            input,
          ),
        ).rejects.toThrow(IntakeFormClosedError);
      });

      it("accepts submission for a form whose closes_at is in the future", async () => {
        const ns = createMockNotificationService();
        const form = await testDb.db
          .insertInto("intake_forms")
          .values({
            // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
            name: "Future Close Form",
            is_active: true,
            closes_at: new Date(Date.now() + 86_400_000),
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const input = makeInput({ formId: form.id });

        const result = await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: orgSlugIdSchema.parse("test-org"),
          },
          input,
        );

        expect(result.ticketId).toBe(input.ticketId);
      });

      it("accepts submission when closes_at is null", async () => {
        const ns = createMockNotificationService();
        // Default form (formId null) has no closing date
        const input = makeInput({ formId: null });

        const result = await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: orgSlugIdSchema.parse("test-org"),
          },
          input,
        );

        expect(result.ticketId).toBe(input.ticketId);
      });

      it("rejects submission at the boundary (closes_at equals now)", async () => {
        const ns = createMockNotificationService();
        // Set closes_at to a moment ago to guarantee the server clock reads it as past
        const form = await testDb.db
          .insertInto("intake_forms")
          .values({
            // care-y-ignore-next-line ast-pii-in-db-write -- admin label, not PII
            name: "Boundary Close Form",
            is_active: true,
            closes_at: new Date(Date.now() - 1),
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const input = makeInput({ formId: form.id });

        await expect(
          createIntakeTicket(
            testDb.db,
            {
              notificationService: ns,
              sealedBox: testSealedBox,
              orgId: TEST_ORG_ID,
              orgSchema: testDb.schemaName as OrgSchema,
              orgSlug: orgSlugIdSchema.parse("test-org"),
            },
            input,
          ),
        ).rejects.toThrow(IntakeFormClosedError);
      });
    });

    // -----------------------------------------------------------------
    // Continuation branch integration tests
    // -----------------------------------------------------------------

    describe("continuation branch", () => {
      it("creates client + ticket + intake_continuation channel + tier atomically", async () => {
        const ns = createMockNotificationService();
        const cont = makeContinuationInput();
        const input = makeInput({ continuation: cont });

        const result = await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
          },
          input,
        );

        expect(result.ticketId).toBe(input.ticketId);

        // Verify ticket
        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("client_id")
          .where("id", "=", input.ticketId)
          .executeTakeFirstOrThrow();

        // Verify channel with kind='intake_continuation'
        const channel = await testDb.db
          .selectFrom("portal_channels")
          .selectAll()
          .where("client_id", "=", ticket.client_id)
          .where("status", "=", "active")
          .where("kind", "=", "intake_continuation")
          .executeTakeFirst();
        expect(channel).toBeDefined();
        expect(channel!.channel_id).toBe(cont.channelId);
        expect(channel!.has_passphrase).toBe(false);

        // Verify tier is secure_link (continuation behaves identically)
        const client = await testDb.db
          .selectFrom("clients")
          .select("communication_tier")
          .where("id", "=", ticket.client_id)
          .executeTakeFirstOrThrow();
        expect(client.communication_tier).toBe("secure_link");
      });

      it("stores selfCopy row with the correct followup_id and direction", async () => {
        const ns = createMockNotificationService();
        const cont = makeContinuationInputWithSelfCopy();
        const followUpId = newFollowupId();
        const input = makeInput({ continuation: cont, followUpId });

        await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
          },
          input,
        );

        // Get the continuation channel
        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("client_id")
          .where("id", "=", input.ticketId)
          .executeTakeFirstOrThrow();

        const channel = await testDb.db
          .selectFrom("portal_channels")
          .select("id")
          .where("client_id", "=", ticket.client_id)
          .where("kind", "=", "intake_continuation")
          .executeTakeFirstOrThrow();

        // Verify portal_messages row
        const messages = await testDb.db
          .selectFrom("portal_messages")
          .selectAll()
          .where("channel_id", "=", channel.id)
          .execute();

        expect(messages).toHaveLength(1);
        expect(messages[0]!.followup_id).toBe(followUpId);
        expect(messages[0]!.direction).toBe("from_client");
      });

      it("resolves the continuation channel via resolveAuthedChannel", async () => {
        const { hashChannelAuth: hash } = await import("@care-y/crypto");

        const ns = createMockNotificationService();
        const rawAuth = crypto.randomBytes(32);
        const authHash = Buffer.from(hash(rawAuth));

        const cont = makeContinuationInput();
        // Override with a real hash so resolveAuthedChannel can verify
        const contWithRealHash: IntakeContinuationInput = {
          ...cont,
          authHash,
        };
        const input = makeInput({ continuation: contWithRealHash });

        await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
          },
          input,
        );

        // resolveAuthedChannel should resolve this intake_continuation row
        const resolved = await resolveAuthedChannel(
          testDb.db,
          contWithRealHash.channelId,
          rawAuth,
        );
        expect(resolved).not.toBeNull();
        expect(resolved!.kind).toBe("intake_continuation");
        expect(resolved!.channel_id).toBe(contWithRealHash.channelId);
      });

      it("continuation channel returns null from resolveAuthedChannel after revocation", async () => {
        const { hashChannelAuth: hash } = await import("@care-y/crypto");

        const ns = createMockNotificationService();
        const rawAuth = crypto.randomBytes(32);
        const authHash = Buffer.from(hash(rawAuth));

        const cont: IntakeContinuationInput = {
          ...makeContinuationInput(),
          authHash,
        };
        const input = makeInput({ continuation: cont });

        await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
          },
          input,
        );

        // Get client id for revocation
        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("client_id")
          .where("id", "=", input.ticketId)
          .executeTakeFirstOrThrow();

        await revokeChannel(testDb.db, ticket.client_id);

        const resolved = await resolveAuthedChannel(
          testDb.db,
          cont.channelId,
          rawAuth,
        );
        expect(resolved).toBeNull();
      });

      it("account wins when both branches are present: account artifacts created, no continuation channel", async () => {
        const ns = createMockNotificationService();
        const { deriveFakeSaltKey } = await import("../auth/salt-defense.js");
        const opsHex =
          "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe";
        const fakeSaltKey = await deriveFakeSaltKey(opsHex);
        const accountDeps = {
          indexer: testBlindIndexer,
          fakeSaltKey,
          orgUuid: TEST_ORG_ID,
        };

        const acct = makeAccountInput();
        const cont = makeContinuationInput();
        const input = makeInput({ account: acct, continuation: cont });

        const result = await createIntakeTicket(
          testDb.db,
          {
            notificationService: ns,
            sealedBox: testSealedBox,
            orgId: TEST_ORG_ID,
            orgSchema: testDb.schemaName as OrgSchema,
            orgSlug: "test-org" as OrgSlug,
            accountServiceDeps: accountDeps,
          },
          input,
        );

        const ticket = await testDb.db
          .selectFrom("tickets")
          .select("client_id")
          .where("id", "=", result.ticketId)
          .executeTakeFirstOrThrow();

        // Account channel should exist
        const accountChannel = await testDb.db
          .selectFrom("portal_channels")
          .select(["id", "kind"])
          .where("client_id", "=", ticket.client_id)
          .where("kind", "=", "account")
          .executeTakeFirst();
        expect(accountChannel).toBeDefined();

        // Continuation channel should NOT exist
        const contChannel = await testDb.db
          .selectFrom("portal_channels")
          .select("id")
          .where("client_id", "=", ticket.client_id)
          .where("kind", "=", "intake_continuation")
          .executeTakeFirst();
        expect(contChannel).toBeUndefined();
      });
    });
  },
);

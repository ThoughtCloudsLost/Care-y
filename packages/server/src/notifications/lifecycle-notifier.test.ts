import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { OrgSchema, OrgSlug, TicketId } from "@care-y/shared";
import {
  createTestDb,
  createTestTicketFixture,
  noopEncryptor,
  seedOrgPublicKey,
  testSealedBox,
  TEST_ORG_ID,
  type TestDb,
  type TestTicketFixture,
} from "../test-utils.js";
import type { OrgContext } from "../trpc/context.js";
import { createAuditService } from "../tickets/audit.js";
import {
  createLifecycleNotifier,
  type LifecycleActor,
} from "./lifecycle-notifier.js";

describe.skipIf(!process.env.DATABASE_URL)("lifecycle notifier (DB)", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  function actorFor(fixture: TestTicketFixture): LifecycleActor {
    const org: OrgContext = {
      orgId: TEST_ORG_ID,
      orgSlug: "test-lifecycle" as OrgSlug,
      orgSchema: testDb.schemaName as OrgSchema,
      tenantDb: testDb.db,
      sealedBox: testSealedBox,
    };
    return { org, user: { id: fixture.userId! } };
  }

  function ticketOf(fixture: TestTicketFixture): {
    id: TicketId;
    queueId: TestTicketFixture["queueId"];
    assignedTo: null;
  } {
    return { id: fixture.ticketId, queueId: fixture.queueId, assignedTo: null };
  }

  async function auditRows(ticketId: TicketId) {
    return testDb.db
      .selectFrom("audit_log")
      .select(["event_type", "actor_id"])
      .where("ticket_id", "=", ticketId)
      .execute();
  }

  async function outboxRows(ticketId: TicketId) {
    return testDb.db
      .selectFrom("notification_outbox")
      .select([
        "event_type",
        "queue_id",
        "actor_user_id",
        "encrypted_mentioned_pseudonyms",
      ])
      .where("ticket_id", "=", ticketId)
      .execute();
  }

  it("auditAndNotify writes the audit entry and the outbox row", async () => {
    const fixture = await createTestTicketFixture(testDb.db, {
      createUser: true,
    });
    const notifier = createLifecycleNotifier({
      createAuditSvc: createAuditService,
    });

    notifier.auditAndNotify(
      actorFor(fixture),
      "followup_added",
      ticketOf(fixture),
      {
        eventType: "followup_added",
        actorId: fixture.userId!,
        ticketId: fixture.ticketId,
      },
    );

    await vi.waitFor(async () => {
      expect(await auditRows(fixture.ticketId)).toEqual([
        { event_type: "followup_added", actor_id: fixture.userId },
      ]);
    });
    await vi.waitFor(async () => {
      expect(await outboxRows(fixture.ticketId)).toEqual([
        {
          event_type: "followup_added",
          queue_id: fixture.queueId,
          actor_user_id: fixture.userId,
          encrypted_mentioned_pseudonyms: null,
        },
      ]);
    });
  });

  it("enqueues without auditing when no audit service is injected", async () => {
    const fixture = await createTestTicketFixture(testDb.db, {
      createUser: true,
    });
    const notifier = createLifecycleNotifier({});

    notifier.auditAndNotify(
      actorFor(fixture),
      "followup_added",
      ticketOf(fixture),
      {
        eventType: "followup_added",
        actorId: fixture.userId!,
        ticketId: fixture.ticketId,
      },
    );

    await vi.waitFor(async () => {
      expect(await outboxRows(fixture.ticketId)).toHaveLength(1);
    });
    expect(await auditRows(fixture.ticketId)).toEqual([]);
  });

  it("stores mentions only in encrypted form", async () => {
    const fixture = await createTestTicketFixture(testDb.db, {
      createUser: true,
    });
    const notifier = createLifecycleNotifier({ fieldEncryptor: noopEncryptor });

    notifier.enqueueLifecycleNotification(
      actorFor(fixture),
      "mention",
      ticketOf(fixture),
      ["pseudonym-a"],
    );

    await vi.waitFor(async () => {
      const [row] = await outboxRows(fixture.ticketId);
      expect(row?.event_type).toBe("mention");
      expect(row?.encrypted_mentioned_pseudonyms).toEqual(
        noopEncryptor.encrypt(JSON.stringify(["pseudonym-a"])),
      );
    });
  });
});

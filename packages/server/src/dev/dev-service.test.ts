import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getSodium } from "@care-y/crypto";
import {
  newFundLedgerId,
  type OrgSchema,
  type TicketId,
  type UserId,
} from "@care-y/shared";
import {
  createMemoryBlobStore,
  createTestDb,
  createTestTicketFixture,
  createTestUser,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import { ValidationError } from "../errors.js";
import { createDevService, type DevService } from "./dev-service.js";

const MINUTE = 60_000;
const BASE = new Date("2026-01-01T12:00:00Z").getTime();

describe.skipIf(!process.env.DATABASE_URL)(
  "DevService.applySeedTimeline (DB)",
  () => {
    let testDb: TestDb;
    let svc: DevService;
    let actorId: UserId;

    beforeAll(async () => {
      testDb = await createTestDb();
      svc = createDevService(testDb.db);
      actorId = (await createTestUser(testDb.db)).id;
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    async function insertFollowUp(
      ticketId: TicketId,
      type: string,
      atMinute: number,
    ): Promise<void> {
      await testDb.db
        .insertInto("followups")
        .values({
          ticket_id: ticketId,
          source: type === "phone_call" ? "client" : "volunteer",
          type,
          encrypted_content: Buffer.from(`${type}-blob`),
          created_at: new Date(BASE + atMinute * MINUTE),
        })
        .execute();
    }

    async function insertAudit(
      ticketId: TicketId,
      atMinute: number,
    ): Promise<void> {
      await testDb.db
        .insertInto("audit_log")
        .values({
          event_type: "ticket_updated",
          actor_id: actorId,
          ticket_id: ticketId,
          metadata: { atMinute },
          created_at: new Date(BASE + atMinute * MINUTE),
        })
        .execute();
    }

    async function followUpsOf(ticketId: TicketId): Promise<
      {
        type: string;
        created_at: Date;
        call_status: string | null;
        call_duration_seconds: number | null;
      }[]
    > {
      return testDb.db
        .selectFrom("followups")
        .select(["type", "created_at", "call_status", "call_duration_seconds"])
        .where("ticket_id", "=", ticketId)
        .orderBy("created_at", "asc")
        .orderBy("id", "asc")
        .execute();
    }

    async function ticketCreatedAt(ticketId: TicketId): Promise<Date> {
      const row = await testDb.db
        .selectFrom("tickets")
        .select("created_at")
        .where("id", "=", ticketId)
        .executeTakeFirstOrThrow();
      return row.created_at;
    }

    /** Asserts `at` is `minutesAgo` before a moment inside [before, after]. */
    function expectMinutesAgo(
      at: Date | undefined,
      minutesAgo: number,
      before: number,
      after: number,
    ): void {
      expect(at).toBeInstanceOf(Date);
      const t = at?.getTime() ?? 0;
      expect(t).toBeGreaterThanOrEqual(before - minutesAgo * MINUTE);
      expect(t).toBeLessThanOrEqual(after - minutesAgo * MINUTE);
    }

    it("maps each point to one follow-up and moves the ticket's creation to the earliest", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      await insertFollowUp(ticketId, "message", 0);
      await insertFollowUp(ticketId, "message", 1);
      await insertFollowUp(ticketId, "message", 2);

      const before = Date.now();
      const result = await svc.applySeedTimeline({
        ticketId,
        createdMinutesAgo: 600,
        points: [{ minutesAgo: 600 }, { minutesAgo: 300 }, { minutesAgo: 10 }],
      });
      const after = Date.now();

      expect(result).toEqual({ followUps: 3, auditRows: 0 });
      const rows = await followUpsOf(ticketId);
      expect(rows).toHaveLength(3);
      expectMinutesAgo(rows[0]?.created_at, 600, before, after);
      expectMinutesAgo(rows[1]?.created_at, 300, before, after);
      expectMinutesAgo(rows[2]?.created_at, 10, before, after);
      expect((await ticketCreatedAt(ticketId)).getTime()).toBe(
        rows[0]?.created_at.getTime(),
      );
    });

    it("sets call fields only on phone_call rows", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      await insertFollowUp(ticketId, "phone_call", 0);
      await insertFollowUp(ticketId, "sms_outbound", 1);
      await insertFollowUp(ticketId, "phone_call", 2);

      await svc.applySeedTimeline({
        ticketId,
        createdMinutesAgo: 90,
        points: [
          { minutesAgo: 90, callStatus: "completed", callDurationSeconds: 245 },
          { minutesAgo: 80, callStatus: "completed", callDurationSeconds: 60 },
          { minutesAgo: 70, callStatus: "no_answer" },
        ],
      });

      const rows = await followUpsOf(ticketId);
      expect(
        rows.map((r) => [r.type, r.call_status, r.call_duration_seconds]),
      ).toEqual([
        ["phone_call", "completed", 245],
        ["sms_outbound", null, null],
        ["phone_call", "no_answer", null],
      ]);
    });

    it("clears the author of client-sourced follow-ups only", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      for (const [source, type, atMinute] of [
        ["client", "sms_inbound", 0],
        ["volunteer", "sms_outbound", 1],
      ] as const) {
        await testDb.db
          .insertInto("followups")
          .values({
            ticket_id: ticketId,
            source,
            type,
            encrypted_content: Buffer.from(`${type}-blob`),
            created_by: actorId,
            created_at: new Date(BASE + atMinute * MINUTE),
          })
          .execute();
      }

      await svc.applySeedTimeline({
        ticketId,
        createdMinutesAgo: 20,
        points: [{ minutesAgo: 20 }, { minutesAgo: 10 }],
      });

      const rows = await testDb.db
        .selectFrom("followups")
        .select(["source", "created_by"])
        .where("ticket_id", "=", ticketId)
        .orderBy("created_at", "asc")
        .execute();
      expect(rows).toEqual([
        { source: "client", created_by: null },
        { source: "volunteer", created_by: actorId },
      ]);
    });

    it("re-stamps a volunteer follow-up's author and its reaction's user and time", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      const otherId = (await createTestUser(testDb.db)).id;
      const note = await testDb.db
        .insertInto("followups")
        .values({
          ticket_id: ticketId,
          source: "volunteer",
          type: "internal_note",
          encrypted_content: Buffer.from("internal_note-blob"),
          created_by: actorId,
          created_at: new Date(BASE),
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      await testDb.db
        .insertInto("followup_reactions")
        .values({
          followup_id: note.id,
          user_id: actorId,
          reaction: "acknowledge",
        })
        .execute();

      const before = Date.now();
      await svc.applySeedTimeline({
        ticketId,
        createdMinutesAgo: 30,
        points: [
          {
            minutesAgo: 30,
            createdBy: otherId,
            reaction: { userId: otherId, minutesAgo: 20 },
          },
        ],
      });
      const after = Date.now();

      const row = await testDb.db
        .selectFrom("followups")
        .select("created_by")
        .where("id", "=", note.id)
        .executeTakeFirstOrThrow();
      expect(row.created_by).toBe(otherId);
      const reactions = await testDb.db
        .selectFrom("followup_reactions")
        .select(["user_id", "created_at"])
        .where("followup_id", "=", note.id)
        .execute();
      expect(reactions).toHaveLength(1);
      expect(reactions[0]?.user_id).toBe(otherId);
      expectMinutesAgo(reactions[0]?.created_at, 20, before, after);
    });

    it("rejects an author on a client-sourced follow-up without writing anything", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      await testDb.db
        .insertInto("followups")
        .values({
          ticket_id: ticketId,
          source: "client",
          type: "sms_inbound",
          encrypted_content: Buffer.from("sms_inbound-blob"),
          created_at: new Date(BASE),
        })
        .execute();

      await expect(
        svc.applySeedTimeline({
          ticketId,
          createdMinutesAgo: 30,
          points: [{ minutesAgo: 30, createdBy: actorId }],
        }),
      ).rejects.toThrow(ValidationError);

      const rows = await testDb.db
        .selectFrom("followups")
        .select(["created_by", "created_at"])
        .where("ticket_id", "=", ticketId)
        .execute();
      expect(rows).toEqual([{ created_by: null, created_at: new Date(BASE) }]);
    });

    it("moves each audit row to the follow-up that preceded it", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      await insertFollowUp(ticketId, "message", 0);
      await insertFollowUp(ticketId, "message", 10);
      await insertFollowUp(ticketId, "message", 20);
      await insertAudit(ticketId, -5);
      await insertAudit(ticketId, 5);
      await insertAudit(ticketId, 15);
      await insertAudit(ticketId, 25);

      // An audit row on another ticket must not move.
      const other = await createTestTicketFixture(testDb.db);
      await insertAudit(other.ticketId, 5);

      const originalOrder = await testDb.db
        .selectFrom("followups")
        .select("id")
        .where("ticket_id", "=", ticketId)
        .orderBy("created_at", "asc")
        .execute();

      // The second follow-up gets the earliest new time, the same moment
      // the ticket was opened.
      const result = await svc.applySeedTimeline({
        ticketId,
        createdMinutesAgo: 100,
        points: [{ minutesAgo: 50 }, { minutesAgo: 100 }, { minutesAgo: 20 }],
      });
      expect(result).toEqual({ followUps: 3, auditRows: 4 });

      const retimed = await testDb.db
        .selectFrom("followups")
        .select(["id", "created_at"])
        .where("ticket_id", "=", ticketId)
        .execute();
      const newAt = new Map(retimed.map((r) => [r.id, r.created_at.getTime()]));
      const [fu0, fu1, fu2] = originalOrder.map((r) => newAt.get(r.id));
      const created = (await ticketCreatedAt(ticketId)).getTime();
      expect(created).toBe(fu1);

      const audits = await testDb.db
        .selectFrom("audit_log")
        .select(["created_at", "metadata"])
        .where("ticket_id", "=", ticketId)
        .execute();
      const byMinute = new Map(
        audits.map((a) => [a.metadata.atMinute, a.created_at.getTime()]),
      );
      expect(byMinute.get(-5)).toBe(created);
      expect(byMinute.get(5)).toBe(fu0);
      expect(byMinute.get(15)).toBe(fu1);
      expect(byMinute.get(25)).toBe(fu2);

      const untouched = await testDb.db
        .selectFrom("audit_log")
        .select("created_at")
        .where("ticket_id", "=", other.ticketId)
        .executeTakeFirstOrThrow();
      expect(untouched.created_at.getTime()).toBe(BASE + 5 * MINUTE);
    });

    it("rejects a count mismatch without writing anything", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      await insertFollowUp(ticketId, "message", 0);
      await insertFollowUp(ticketId, "message", 1);
      await insertAudit(ticketId, 2);
      const createdBefore = await ticketCreatedAt(ticketId);

      await expect(
        svc.applySeedTimeline({
          ticketId,
          createdMinutesAgo: 30,
          points: [{ minutesAgo: 30 }, { minutesAgo: 20 }, { minutesAgo: 10 }],
        }),
      ).rejects.toThrow(ValidationError);
      await expect(
        svc.applySeedTimeline({
          ticketId,
          createdMinutesAgo: 30,
          points: [{ minutesAgo: 30 }],
        }),
      ).rejects.toThrow(/2 follow-ups but 1 timeline points/);

      const rows = await followUpsOf(ticketId);
      expect(rows.map((r) => r.created_at.getTime())).toEqual([
        BASE,
        BASE + MINUTE,
      ]);
      expect((await ticketCreatedAt(ticketId)).getTime()).toBe(
        createdBefore.getTime(),
      );
      const audit = await testDb.db
        .selectFrom("audit_log")
        .select("created_at")
        .where("ticket_id", "=", ticketId)
        .executeTakeFirstOrThrow();
      expect(audit.created_at.getTime()).toBe(BASE + 2 * MINUTE);
    });

    it("backdates a ticket that has no follow-ups yet", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);

      const before = Date.now();
      const result = await svc.applySeedTimeline({
        ticketId,
        createdMinutesAgo: 45,
        points: [],
      });
      const after = Date.now();

      expect(result).toEqual({ followUps: 0, auditRows: 0 });
      expectMinutesAgo(await ticketCreatedAt(ticketId), 45, before, after);
    });

    it("rejects a follow-up placed before the ticket was created", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      await insertFollowUp(ticketId, "message", 0);

      await expect(
        svc.applySeedTimeline({
          ticketId,
          createdMinutesAgo: 10,
          points: [{ minutesAgo: 20 }],
        }),
      ).rejects.toThrow(ValidationError);
    });
  },
);

describe.skipIf(!process.env.DATABASE_URL)(
  "DevService.backdateOrgSetup (DB)",
  () => {
    const MINUTES_AGO = 43_500;
    let testDb: TestDb;
    let svc: DevService;
    let userId: UserId;

    beforeAll(async () => {
      testDb = await createTestDb();
      svc = createDevService(testDb.db);
      userId = (await createTestUser(testDb.db)).id;
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    const at = (minute: number): Date => new Date(BASE + minute * MINUTE);

    /** Asserts rows sit one second apart from a base `MINUTES_AGO` before [before, after]. */
    function expectPacked(
      times: readonly Date[],
      before: number,
      after: number,
    ): void {
      const first = times.at(0)?.getTime() ?? 0;
      expect(first).toBeGreaterThanOrEqual(before - MINUTES_AGO * MINUTE);
      expect(first).toBeLessThanOrEqual(after - MINUTES_AGO * MINUTE);
      times.forEach((t, i) => {
        expect(t.getTime() - first).toBe(i * 1_000);
      });
    }

    it("moves org setup rows to the base time, keeping each table's order", async () => {
      const db = testDb.db;
      const auditLater = await db
        .insertInto("audit_log")
        .values({
          event_type: "org_setup",
          actor_id: userId,
          ticket_id: null,
          metadata: {},
          created_at: at(10),
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      const auditEarlier = await db
        .insertInto("audit_log")
        .values({
          event_type: "org_setup",
          actor_id: userId,
          ticket_id: null,
          metadata: {},
          created_at: at(0),
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      const { ticketId } = await createTestTicketFixture(db);
      await db
        .insertInto("audit_log")
        .values({
          event_type: "ticket_updated",
          actor_id: userId,
          ticket_id: ticketId,
          metadata: {},
          created_at: at(5),
        })
        .execute();

      // Edited five minutes after creation; the gap must survive.
      const categoryEdited = await db
        .insertInto("kb_categories")
        .values({
          encrypted_name: Buffer.from("category-a"),
          sort_order: 1,
          created_at: at(0),
          updated_at: at(5),
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      await db
        .insertInto("kb_categories")
        .values({
          encrypted_name: Buffer.from("category-b"),
          sort_order: 2,
          created_at: at(1),
          updated_at: at(1),
        })
        .execute();
      await db
        .insertInto("kb_items")
        .values({
          category_id: categoryEdited.id,
          encrypted_title: Buffer.from("item-title"),
          encrypted_body: Buffer.from("item-body"),
          created_by: userId,
          created_at: at(2),
          updated_at: at(2),
        })
        .execute();
      await db
        .insertInto("note_types")
        .values({
          encrypted_name: Buffer.from("note-type"),
          encrypted_icon: Buffer.from("note-icon"),
          encrypted_escalation_targets: Buffer.from("targets"),
          created_at: at(3),
        })
        .execute();
      await db
        .insertInto("preset_replies")
        .values({
          encrypted_title: Buffer.from("preset-title"),
          encrypted_body: Buffer.from("preset-body"),
          created_by: userId,
          created_at: at(4),
        })
        .execute();

      const before = Date.now();
      const result = await svc.backdateOrgSetup({ minutesAgo: MINUTES_AGO });
      const after = Date.now();

      const orgAudits = await db
        .selectFrom("audit_log")
        .select(["id", "created_at"])
        .where("ticket_id", "is", null)
        .orderBy("created_at", "asc")
        .orderBy("id", "asc")
        .execute();
      const categories = await db
        .selectFrom("kb_categories")
        .select(["id", "created_at", "updated_at"])
        .orderBy("created_at", "asc")
        .orderBy("id", "asc")
        .execute();
      const items = await db
        .selectFrom("kb_items")
        .select("created_at")
        .orderBy("created_at", "asc")
        .execute();
      const noteTypes = await db
        .selectFrom("note_types")
        .select("created_at")
        .orderBy("created_at", "asc")
        .execute();
      const presets = await db
        .selectFrom("preset_replies")
        .select("created_at")
        .orderBy("created_at", "asc")
        .execute();

      expect(result).toEqual({
        auditRows: orgAudits.length,
        kbCategories: categories.length,
        kbItems: items.length,
        noteTypes: noteTypes.length,
        presetReplies: presets.length,
      });

      expectPacked(
        orgAudits.map((r) => r.created_at),
        before,
        after,
      );
      expectPacked(
        categories.map((r) => r.created_at),
        before,
        after,
      );
      expectPacked(
        items.map((r) => r.created_at),
        before,
        after,
      );
      expectPacked(
        noteTypes.map((r) => r.created_at),
        before,
        after,
      );
      expectPacked(
        presets.map((r) => r.created_at),
        before,
        after,
      );

      // Original order holds within a table.
      const auditIds = orgAudits.map((r) => r.id);
      expect(auditIds.indexOf(auditEarlier.id)).toBeLessThan(
        auditIds.indexOf(auditLater.id),
      );
      const edited = categories.find((r) => r.id === categoryEdited.id);
      expect(categories.at(0)?.id).toBe(categoryEdited.id);
      expect(
        (edited?.updated_at.getTime() ?? 0) -
          (edited?.created_at.getTime() ?? 0),
      ).toBe(5 * MINUTE);

      // Ticket audit rows are not org setup and stay put.
      const ticketAudit = await db
        .selectFrom("audit_log")
        .select("created_at")
        .where("ticket_id", "=", ticketId)
        .executeTakeFirstOrThrow();
      expect(ticketAudit.created_at.getTime()).toBe(at(5).getTime());
    });
  },
);

describe.skipIf(!process.env.DATABASE_URL)(
  "DevService.seedVoicemail (DB)",
  () => {
    let testDb: TestDb;
    let svc: DevService;

    beforeAll(async () => {
      await getSodium();
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      svc = createDevService(testDb.db);
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("adds one client voicemail with a stored recording of the given duration", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      const blobStore = createMemoryBlobStore();

      const { followUpId } = await svc.seedVoicemail(
        {
          ticketId,
          audio: Buffer.from("fake-m4a-bytes").toString("base64"),
          durationSeconds: 5,
        },
        { blobStore, orgSchema: testDb.schemaName as OrgSchema },
      );

      const followUps = await testDb.db
        .selectFrom("followups")
        .select(["id", "type", "source"])
        .where("ticket_id", "=", ticketId)
        .execute();
      expect(followUps).toEqual([
        { id: followUpId, type: "voicemail", source: "client" },
      ]);

      const recording = await testDb.db
        .selectFrom("recordings")
        .select(["duration_seconds", "blob_key"])
        .where("followup_id", "=", followUpId)
        .executeTakeFirstOrThrow();
      expect(recording.duration_seconds).toBe(5);
      expect(blobStore.blobs.has(recording.blob_key)).toBe(true);
    }, 30_000);

    it("rejects empty audio", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      await expect(
        svc.seedVoicemail(
          { ticketId, audio: "", durationSeconds: 5 },
          {
            blobStore: createMemoryBlobStore(),
            orgSchema: testDb.schemaName as OrgSchema,
          },
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("reopens a closed ticket as a client would, keeping its key generation", async () => {
      const { ticketId } = await createTestTicketFixture(testDb.db);
      await expect(svc.reopenAsClient({ ticketId })).rejects.toThrow(
        ValidationError,
      );

      await testDb.db
        .updateTable("tickets")
        .set({ status: "closed" })
        .where("id", "=", ticketId)
        .execute();
      const before = await testDb.db
        .selectFrom("tickets")
        .select("key_generation")
        .where("id", "=", ticketId)
        .executeTakeFirstOrThrow();

      await svc.reopenAsClient({ ticketId });

      const after = await testDb.db
        .selectFrom("tickets")
        .select(["status", "key_generation"])
        .where("id", "=", ticketId)
        .executeTakeFirstOrThrow();
      expect(after).toEqual({
        status: "open",
        key_generation: before.key_generation,
      });
      const events = await testDb.db
        .selectFrom("followups")
        .select("type")
        .where("ticket_id", "=", ticketId)
        .execute();
      expect(events.map((e) => e.type)).toContain("status_opened");
    });
  },
);

describe.skipIf(!process.env.DATABASE_URL)(
  "DevService.resetSeedData (DB)",
  () => {
    let testDb: TestDb;
    let svc: DevService;

    beforeAll(async () => {
      testDb = await createTestDb();
      svc = createDevService(testDb.db);
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    it("clears funds and the fund ledger so re-seeding does not duplicate them", async () => {
      await testDb.db
        .insertInto("funds")
        .values({
          encrypted_payload: Buffer.from("seed-fund"),
          encrypted_balance: Buffer.from("seed-balance"),
          sort_order: 1,
        })
        .execute();
      await testDb.db
        .insertInto("fund_ledger")
        .values({
          id: newFundLedgerId(),
          encrypted_payload: Buffer.from("seed-entry"),
        })
        .execute();

      await svc.resetSeedData();

      const funds = await testDb.db
        .selectFrom("funds")
        .select("id")
        .execute();
      const entries = await testDb.db
        .selectFrom("fund_ledger")
        .select("id")
        .execute();
      expect(funds).toEqual([]);
      expect(entries).toEqual([]);
    });
  },
);

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
  type Mock,
} from "vitest";
import * as crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createTestTicketFixture,
  seedOrgPublicKey,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import {
  createFundService,
  type CaseNoteTicket,
  type FundBalanceWrite,
  type FundService,
} from "./fund-service.js";
import {
  createFollowUpService,
  type FollowUpService,
} from "../tickets/followup-service.js";
import { createTicketAccessChecker } from "../tickets/access.js";
import type { NotificationService } from "../notifications/service.js";
import type { TicketChangeListener } from "../tickets/ticket-live-events.js";
import {
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "../errors.js";
import {
  ErrorCode,
  RoleId,
  fundIdSchema,
  newFollowupId,
  newFundLedgerId,
  newTicketId,
  orgSlugIdSchema,
  type FollowupId,
  type FundId,
  type FundLedgerId,
  type NoteTypeId,
  type OrgSchema,
  type QueueId,
  type TicketId,
  type UserId,
} from "@care-y/shared";

const ENTRY_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

describe.skipIf(!process.env.DATABASE_URL)("FundService (DB)", () => {
  let testDb: TestDb;
  let dispatchTicketless: Mock<NotificationService["dispatchTicketless"]>;
  let onTicketChanged: Mock<TicketChangeListener>;
  let announceCaseNote: Mock<(ticket: CaseNoteTicket) => void>;
  let svc: FundService;

  function buildFollowUps(
    db: Kysely<TenantDatabase> = testDb.db,
  ): FollowUpService {
    return createFollowUpService(db, createTicketAccessChecker(db), {
      onTicketChanged,
    });
  }

  function buildService(
    db: Kysely<TenantDatabase> = testDb.db,
    followUps: FollowUpService = buildFollowUps(db),
  ): FundService {
    const notificationService: NotificationService = {
      dispatch: vi.fn<NotificationService["dispatch"]>(),
      dispatchTicketless,
    };
    return createFundService(db, {
      org: {
        orgId: TEST_ORG_ID,
        orgSchema: testDb.schemaName as OrgSchema,
        orgSlug: orgSlugIdSchema.parse("test-org"),
      },
      followUps,
      notificationService,
      announceCaseNote,
    });
  }

  /**
   * A handle on the test schema that records every query it runs, so a
   * test can show a path never touches a table. Transactions opened on it
   * carry the recorder too.
   */
  function recordingDb(): { db: Kysely<TenantDatabase>; queries: string[] } {
    const queries: string[] = [];
    const db = testDb.db.withPlugin({
      transformQuery(args) {
        queries.push(JSON.stringify(args.node));
        return args.node;
      },
      transformResult(args) {
        return Promise.resolve(args.result);
      },
    });
    return { db, queries };
  }

  function namesTable(query: string, table: string): boolean {
    return query.includes(`"name":"${table}"`);
  }

  async function createAdmin(): Promise<UserId> {
    const admin = await createTestUser(testDb.db, {
      overrides: { role_id: RoleId.ADMIN },
    });
    return admin.id;
  }

  /** A fresh fund with its balance sealed at zero, at version 0. */
  async function newFund(label = "fund"): Promise<FundId> {
    const { id } = await svc.create({
      encryptedPayload: Buffer.from(label),
      encryptedBalance: Buffer.from("balance-0"),
      orgKeyGeneration: 1,
    });
    return id;
  }

  function balance(
    fundId: FundId,
    expectedVersion: number,
    sealed = `balance-${expectedVersion + 1}`,
  ): FundBalanceWrite {
    return {
      fundId,
      encryptedBalance: Buffer.from(sealed),
      expectedVersion,
      orgKeyGeneration: 1,
    };
  }

  async function fundRow(fundId: FundId): Promise<{
    payload: string;
    sealed: string;
    version: number;
    generation: number;
  }> {
    const row = await testDb.db
      .selectFrom("funds")
      .select([
        "encrypted_payload",
        "encrypted_balance",
        "balance_version",
        "org_key_generation",
      ])
      .where("id", "=", fundId)
      .executeTakeFirstOrThrow();
    return {
      payload: row.encrypted_payload.toString(),
      sealed: row.encrypted_balance.toString(),
      version: row.balance_version,
      generation: row.org_key_generation,
    };
  }

  async function fundBalance(
    fundId: FundId,
  ): Promise<{ sealed: string; version: number }> {
    const row = await testDb.db
      .selectFrom("funds")
      .select(["encrypted_balance", "balance_version"])
      .where("id", "=", fundId)
      .executeTakeFirstOrThrow();
    return {
      sealed: row.encrypted_balance.toString(),
      version: row.balance_version,
    };
  }

  async function ledgerRowExists(id: FundLedgerId): Promise<boolean> {
    const row = await testDb.db
      .selectFrom("fund_ledger")
      .select("id")
      .where("id", "=", id)
      .executeTakeFirst();
    return row !== undefined;
  }

  async function noteContent(id: FollowupId): Promise<string | null> {
    const row = await testDb.db
      .selectFrom("followups")
      .select("encrypted_content")
      .where("id", "=", id)
      .executeTakeFirst();
    return row === undefined ? null : row.encrypted_content.toString();
  }

  /**
   * An org note type. Ciphertext columns hold placeholder bytes the server
   * never reads.
   */
  async function insertOrdinaryNoteType(): Promise<NoteTypeId> {
    const row = await testDb.db
      .insertInto("note_types")
      .values({
        encrypted_name: Buffer.from("sealed-name"),
        encrypted_icon: Buffer.from("sealed-icon"),
        encrypted_escalation_targets: Buffer.from("sealed-targets"),
        min_view_role: RoleId.VOLUNTEER,
        min_create_role: RoleId.VOLUNTEER,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return row.id;
  }

  async function noteTypeOf(id: FollowupId): Promise<NoteTypeId | null> {
    const row = await testDb.db
      .selectFrom("followups")
      .select("note_type_id")
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
    return row.note_type_id ?? null;
  }

  async function grantQueue(userId: UserId, queueId: QueueId): Promise<void> {
    await testDb.db
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: userId })
      .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
      .execute();
  }

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    dispatchTicketless = vi
      .fn<NotificationService["dispatchTicketless"]>()
      .mockResolvedValue(undefined);
    onTicketChanged = vi.fn<TicketChangeListener>();
    announceCaseNote = vi.fn<(ticket: CaseNoteTicket) => void>();
    svc = buildService();
    await testDb.db
      .updateTable("org_config")
      .set({ notify_fund_managers: true })
      .execute();
  });

  // --- Funds ---

  describe("funds", () => {
    it("create allocates increasing sort orders and list returns them in order", async () => {
      const first = await newFund("fund-one");
      const second = await newFund("fund-two");

      const funds = await svc.list();
      const a = funds.find((f) => f.id === first);
      const b = funds.find((f) => f.id === second);
      expect(a?.encryptedPayload.toString()).toBe("fund-one");
      expect(a?.isActive).toBe(true);
      expect(a?.orgKeyGeneration).toBe(1);
      expect(b!.sortOrder).toBeGreaterThan(a!.sortOrder);
      expect(funds.indexOf(b!)).toBeGreaterThan(funds.indexOf(a!));
    });

    it("create stores the opening sealed balance at version 0 and list returns it", async () => {
      const id = await newFund();

      const [listed] = (await svc.list()).filter((f) => f.id === id);
      expect(listed!.encryptedBalance.toString()).toBe("balance-0");
      expect(listed!.balanceVersion).toBe(0);
    });

    it("updateFund replaces the payload and deactivates without deleting", async () => {
      const id = await newFund("before");
      const [before] = (await svc.list()).filter((f) => f.id === id);

      await svc.updateFund(id, {
        encryptedPayload: Buffer.from("after"),
        isActive: false,
      });

      const [after] = (await svc.list()).filter((f) => f.id === id);
      expect(after!.encryptedPayload.toString()).toBe("after");
      expect(after!.isActive).toBe(false);
      expect(after!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before!.updatedAt.getTime(),
      );
    });

    it("updateFund leaves the balance and its version alone", async () => {
      const id = await newFund();

      await svc.updateFund(id, { encryptedPayload: Buffer.from("renamed") });

      expect(await fundBalance(id)).toEqual({
        sealed: "balance-0",
        version: 0,
      });
    });

    it("updateFund with no fields resolves for an existing fund", async () => {
      const id = await newFund("steady");
      await expect(svc.updateFund(id, {})).resolves.toBeUndefined();
    });

    it("updateFund rejects an unknown fund", async () => {
      const missing = fundIdSchema.parse(crypto.randomUUID());
      await expect(
        svc.updateFund(missing, { isActive: false }),
      ).rejects.toBeInstanceOf(NotFoundError);
      await expect(svc.updateFund(missing, {})).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  // --- Ledger ---

  describe("ledger", () => {
    it("listLedger returns day-granular dates, ordered by id within a day", async () => {
      const actor = await createTestUser(testDb.db);
      const fundId = await newFund();
      const ids = [newFundLedgerId(), newFundLedgerId(), newFundLedgerId()];
      for (const [version, id] of ids.entries()) {
        await svc.recordAdjustment(actor.id, {
          id,
          encryptedPayload: Buffer.from(`entry-${id}`),
          orgKeyGeneration: 1,
          balance: balance(fundId, version),
        });
      }

      const entries = (await svc.listLedger()).filter((e) =>
        ids.includes(e.id),
      );
      expect(entries).toHaveLength(3);
      for (const e of entries) {
        expect(e.entryDate).toMatch(ENTRY_DATE_PATTERN);
        expect(e.encryptedPayload.toString()).toBe(`entry-${e.id}`);
      }
      expect(entries.map((e) => e.id)).toEqual([...ids].sort());
    });

    it("recordAdjustment returns the id, the stamped day and the new balance version", async () => {
      const actor = await createTestUser(testDb.db);
      const fundId = await newFund();
      const id = newFundLedgerId();

      const recorded = await svc.recordAdjustment(actor.id, {
        id,
        encryptedPayload: Buffer.from("adjustment"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0, "after-adjustment"),
      });

      expect(recorded.id).toBe(id);
      expect(recorded.entryDate).toMatch(ENTRY_DATE_PATTERN);
      expect(recorded.balanceVersion).toBe(1);
      expect(await ledgerRowExists(id)).toBe(true);
      expect(await fundBalance(fundId)).toEqual({
        sealed: "after-adjustment",
        version: 1,
      });
    });
  });

  // --- Balance compare-and-set ---

  describe("balance compare-and-set", () => {
    it("refuses a stale version and writes neither the entry nor the balance", async () => {
      const actor = await createTestUser(testDb.db);
      const fundId = await newFund();
      await svc.recordAdjustment(actor.id, {
        id: newFundLedgerId(),
        encryptedPayload: Buffer.from("first"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0, "after-first"),
      });
      const id = newFundLedgerId();

      await expect(
        svc.recordAdjustment(actor.id, {
          id,
          encryptedPayload: Buffer.from("second"),
          orgKeyGeneration: 1,
          balance: balance(fundId, 0, "built-on-stale"),
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(await ledgerRowExists(id)).toBe(false);
      expect(await fundBalance(fundId)).toEqual({
        sealed: "after-first",
        version: 1,
      });
    });

    it("lets exactly one of two entries built on the same version through", async () => {
      const actor = await createTestUser(testDb.db);
      const fundId = await newFund();
      const ids = [newFundLedgerId(), newFundLedgerId()];

      const results = await Promise.allSettled(
        ids.map((id) =>
          svc.recordAdjustment(actor.id, {
            id,
            encryptedPayload: Buffer.from("race"),
            orgKeyGeneration: 1,
            balance: balance(fundId, 0, `won-by-${id}`),
          }),
        ),
      );

      const won = results.filter((r) => r.status === "fulfilled");
      const lost = results.filter((r) => r.status === "rejected");
      expect(won).toHaveLength(1);
      expect(lost).toHaveLength(1);
      expect(lost[0]!.reason).toBeInstanceOf(ConflictError);
      const written = await fundBalance(fundId);
      expect(written.version).toBe(1);
      const winner = ids.find((id) => written.sealed === `won-by-${id}`);
      expect(winner).toBeDefined();
      expect(await ledgerRowExists(winner!)).toBe(true);
      expect(await ledgerRowExists(ids.find((id) => id !== winner)!)).toBe(
        false,
      );
    });

    it("answers not found for an unknown fund", async () => {
      const actor = await createTestUser(testDb.db);
      const missing = fundIdSchema.parse(crypto.randomUUID());
      const id = newFundLedgerId();

      await expect(
        svc.recordAdjustment(actor.id, {
          id,
          encryptedPayload: Buffer.from("orphan"),
          orgKeyGeneration: 1,
          balance: balance(missing, 0),
        }),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(await ledgerRowExists(id)).toBe(false);
    });

    it("setBalance writes the sealed balance and bumps the version, no ledger row", async () => {
      const fundId = await newFund();
      const before = (await svc.listLedger()).length;

      const result = await svc.setBalance(balance(fundId, 0, "recomputed"));

      expect(result).toEqual({ balanceVersion: 1 });
      expect(await fundBalance(fundId)).toEqual({
        sealed: "recomputed",
        version: 1,
      });
      expect(await svc.listLedger()).toHaveLength(before);
      expect(dispatchTicketless).not.toHaveBeenCalled();
    });

    it("setBalance refuses a stale version", async () => {
      const fundId = await newFund();
      await svc.setBalance(balance(fundId, 0, "first"));

      await expect(
        svc.setBalance(balance(fundId, 0, "stale")),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(await fundBalance(fundId)).toEqual({
        sealed: "first",
        version: 1,
      });
    });

    it("refuses a balance sealed under another generation without the resealed payload", async () => {
      const actor = await createTestUser(testDb.db);
      const fundId = await newFund("gen-1-payload");
      const id = newFundLedgerId();

      await expect(
        svc.recordAdjustment(actor.id, {
          id,
          encryptedPayload: Buffer.from("entry"),
          orgKeyGeneration: 2,
          balance: {
            ...balance(fundId, 0, "sealed-under-2"),
            orgKeyGeneration: 2,
          },
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(await ledgerRowExists(id)).toBe(false);
      expect(await fundRow(fundId)).toEqual({
        payload: "gen-1-payload",
        sealed: "balance-0",
        version: 0,
        generation: 1,
      });
    });

    it("moves the payload, the balance and the generation together when the payload is resealed", async () => {
      const fundId = await newFund("gen-1-payload");

      const result = await svc.setBalance({
        ...balance(fundId, 0, "sealed-under-2"),
        orgKeyGeneration: 2,
        encryptedPayload: Buffer.from("gen-2-payload"),
      });

      expect(result).toEqual({ balanceVersion: 1 });
      expect(await fundRow(fundId)).toEqual({
        payload: "gen-2-payload",
        sealed: "sealed-under-2",
        version: 1,
        generation: 2,
      });
    });

    it("still checks the version when the payload is resealed", async () => {
      const fundId = await newFund("gen-1-payload");
      await svc.setBalance(balance(fundId, 0, "first"));

      await expect(
        svc.setBalance({
          ...balance(fundId, 0, "sealed-under-2"),
          orgKeyGeneration: 2,
          encryptedPayload: Buffer.from("gen-2-payload"),
        }),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(await fundRow(fundId)).toEqual({
        payload: "gen-1-payload",
        sealed: "first",
        version: 1,
        generation: 1,
      });
    });
  });

  // --- recordDisbursement ---

  describe("recordDisbursement", () => {
    it("records a fund-level disbursement with no case note", async () => {
      const actor = await createTestUser(testDb.db);
      const fundId = await newFund();
      const before = await testDb.db
        .selectFrom("followups")
        .select((eb) => eb.fn.countAll<string>().as("n"))
        .executeTakeFirstOrThrow();
      const id = newFundLedgerId();

      const recorded = await svc.recordDisbursement(actor.id, {
        id,
        encryptedPayload: Buffer.from("spend"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0),
      });

      const after = await testDb.db
        .selectFrom("followups")
        .select((eb) => eb.fn.countAll<string>().as("n"))
        .executeTakeFirstOrThrow();
      expect(recorded.balanceVersion).toBe(1);
      expect(await ledgerRowExists(id)).toBe(true);
      expect(Number(after.n)).toBe(Number(before.n));
      expect(onTicketChanged).not.toHaveBeenCalled();
      expect(announceCaseNote).not.toHaveBeenCalled();
    });

    it("a disbursement leaves the fund's updated_at unchanged", async () => {
      const actor = await createTestUser(testDb.db);
      const fundId = await newFund();
      const [before] = (await svc.list()).filter((f) => f.id === fundId);

      await svc.recordDisbursement(actor.id, {
        id: newFundLedgerId(),
        encryptedPayload: Buffer.from("spend"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0),
      });

      const [after] = (await svc.list()).filter((f) => f.id === fundId);
      expect(after!.updatedAt.getTime()).toBe(before!.updatedAt.getTime());
    });

    it("writes the balance, the ledger row and a private disbursement follow-up together", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const actorId = fixture.userId!;
      const fundId = await newFund();
      const id = newFundLedgerId();
      const followUpId = newFollowupId();

      const recorded = await svc.recordDisbursement(actorId, {
        id,
        encryptedPayload: Buffer.from("spend"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0, "after-spend"),
        caseNote: {
          followUpId,
          ticketId: fixture.ticketId,
          encryptedContent: Buffer.from("envelope"),
        },
      });

      expect(recorded.id).toBe(id);
      expect(recorded.balanceVersion).toBe(1);
      expect(await ledgerRowExists(id)).toBe(true);
      expect(await fundBalance(fundId)).toEqual({
        sealed: "after-spend",
        version: 1,
      });

      const note = await testDb.db
        .selectFrom("followups")
        .select([
          "ticket_id",
          "type",
          "source",
          "is_private",
          "note_type_id",
          "created_by",
          "encrypted_content",
        ])
        .where("id", "=", followUpId)
        .executeTakeFirstOrThrow();
      expect(note.ticket_id).toBe(fixture.ticketId);
      expect(note.type).toBe("disbursement");
      expect(note.source).toBe("volunteer");
      expect(note.is_private).toBe(true);
      expect(note.note_type_id).toBeNull();
      expect(note.created_by).toBe(actorId);
      expect(note.encrypted_content.toString()).toBe("envelope");

      expect(onTicketChanged).toHaveBeenCalledWith(fixture.ticketId);
    });

    it("announces the committed case note with the case's routing", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const fundId = await newFund();

      await svc.recordDisbursement(fixture.userId!, {
        id: newFundLedgerId(),
        encryptedPayload: Buffer.from("spend"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0),
        caseNote: {
          followUpId: newFollowupId(),
          ticketId: fixture.ticketId,
          encryptedContent: Buffer.from("envelope"),
        },
      });

      expect(announceCaseNote).toHaveBeenCalledTimes(1);
      expect(announceCaseNote).toHaveBeenCalledWith(
        expect.objectContaining({
          id: fixture.ticketId,
          queueId: fixture.queueId,
        }),
      );
    });

    it("rolls back the note and the ledger row when the balance is stale", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const fundId = await newFund();
      await svc.setBalance(balance(fundId, 0, "moved-on"));
      const id = newFundLedgerId();
      const followUpId = newFollowupId();

      await expect(
        svc.recordDisbursement(fixture.userId!, {
          id,
          encryptedPayload: Buffer.from("spend"),
          orgKeyGeneration: 1,
          balance: balance(fundId, 0, "stale"),
          caseNote: {
            followUpId,
            ticketId: fixture.ticketId,
            encryptedContent: Buffer.from("envelope"),
          },
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(await ledgerRowExists(id)).toBe(false);
      expect(await noteContent(followUpId)).toBeNull();
      expect(announceCaseNote).not.toHaveBeenCalled();
    });

    it("rolls back the ledger row and the balance when the actor cannot access the case", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const outsider = await createTestUser(testDb.db);
      const fundId = await newFund();
      const id = newFundLedgerId();
      const followUpId = newFollowupId();

      await expect(
        svc.recordDisbursement(outsider.id, {
          id,
          encryptedPayload: Buffer.from("spend"),
          orgKeyGeneration: 1,
          balance: balance(fundId, 0),
          caseNote: {
            followUpId,
            ticketId: fixture.ticketId,
            encryptedContent: Buffer.from("envelope"),
          },
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);

      expect(await ledgerRowExists(id)).toBe(false);
      expect(await fundBalance(fundId)).toEqual({
        sealed: "balance-0",
        version: 0,
      });
      expect(dispatchTicketless).not.toHaveBeenCalled();
      expect(announceCaseNote).not.toHaveBeenCalled();
    });

    it("rolls back the ledger row when the case is closed", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      await testDb.db
        .updateTable("tickets")
        .set({ status: "closed" })
        .where("id", "=", fixture.ticketId)
        .execute();
      const fundId = await newFund();
      const id = newFundLedgerId();

      await expect(
        svc.recordDisbursement(fixture.userId!, {
          id,
          encryptedPayload: Buffer.from("spend"),
          orgKeyGeneration: 1,
          balance: balance(fundId, 0),
          caseNote: {
            followUpId: newFollowupId(),
            ticketId: fixture.ticketId,
            encryptedContent: Buffer.from("envelope"),
          },
        }),
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(await ledgerRowExists(id)).toBe(false);
      expect((await fundBalance(fundId)).version).toBe(0);
    });

    it("passes the disbursement type and no note type to createWithin", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const followUps = buildFollowUps();
      const createWithin = vi.spyOn(followUps, "createWithin");
      const spied = buildService(testDb.db, followUps);
      const fundId = await newFund();

      await spied.recordDisbursement(fixture.userId!, {
        id: newFundLedgerId(),
        encryptedPayload: Buffer.from("spend"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0),
        caseNote: {
          followUpId: newFollowupId(),
          ticketId: fixture.ticketId,
          encryptedContent: Buffer.from("envelope"),
        },
      });

      expect(createWithin).toHaveBeenCalledTimes(1);
      expect(createWithin).toHaveBeenCalledWith(
        expect.anything(),
        fixture.userId,
        expect.objectContaining({
          type: "disbursement",
          source: "volunteer",
          isPrivate: true,
        }),
      );
      expect(createWithin.mock.calls[0]?.[2]).not.toHaveProperty("noteTypeId");
    });

    it("records a case disbursement without querying note types", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const fundId = await newFund();
      const recording = recordingDb();
      const followUpId = newFollowupId();

      await buildService(recording.db).recordDisbursement(fixture.userId!, {
        id: newFundLedgerId(),
        encryptedPayload: Buffer.from("spend"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0),
        caseNote: {
          followUpId,
          ticketId: fixture.ticketId,
          encryptedContent: Buffer.from("envelope"),
        },
      });

      expect(recording.queries.some((q) => namesTable(q, "followups"))).toBe(
        true,
      );
      expect(recording.queries.some((q) => namesTable(q, "note_types"))).toBe(
        false,
      );
      expect(await noteContent(followUpId)).toBe("envelope");
    });
  });

  // --- reviseDisbursement ---

  describe("reviseDisbursement", () => {
    /** A disbursement with its case note, recorded by the fixture's user. */
    async function recordedDisbursement(): Promise<{
      fundId: FundId;
      followUpId: FollowupId;
      ticketId: TicketId;
      queueId: QueueId;
      authorId: UserId;
    }> {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const fundId = await newFund();
      const followUpId = newFollowupId();
      await svc.recordDisbursement(fixture.userId!, {
        id: newFundLedgerId(),
        encryptedPayload: Buffer.from("spend"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0),
        caseNote: {
          followUpId,
          ticketId: fixture.ticketId,
          encryptedContent: Buffer.from("original-envelope"),
        },
      });
      onTicketChanged.mockClear();
      dispatchTicketless.mockClear();
      return {
        fundId,
        followUpId,
        ticketId: fixture.ticketId,
        queueId: fixture.queueId,
        authorId: fixture.userId!,
      };
    }

    it("writes both entries, rewrites the note and moves the balance together", async () => {
      await createAdmin();
      const d = await recordedDisbursement();
      const reversalId = newFundLedgerId();
      const replacementId = newFundLedgerId();

      const revised = await svc.reviseDisbursement(d.authorId, {
        reversal: { id: reversalId, encryptedPayload: Buffer.from("reverse") },
        replacement: {
          id: replacementId,
          encryptedPayload: Buffer.from("replace"),
        },
        orgKeyGeneration: 1,
        balance: balance(d.fundId, 1, "after-revision"),
        caseNote: {
          followUpId: d.followUpId,
          ticketId: d.ticketId,
          encryptedContent: Buffer.from("revised-envelope"),
        },
        mayEditAnyNote: false,
      });

      expect(revised.entryDate).toMatch(ENTRY_DATE_PATTERN);
      expect(revised.balanceVersion).toBe(2);
      expect(await ledgerRowExists(reversalId)).toBe(true);
      expect(await ledgerRowExists(replacementId)).toBe(true);
      expect(await noteContent(d.followUpId)).toBe("revised-envelope");
      expect(await fundBalance(d.fundId)).toEqual({
        sealed: "after-revision",
        version: 2,
      });
      expect(onTicketChanged).toHaveBeenCalledWith(d.ticketId);
      expect(dispatchTicketless).toHaveBeenCalledTimes(1);
    });

    it("refuses another volunteer's note and leaves everything as it was", async () => {
      const d = await recordedDisbursement();
      const other = await createTestUser(testDb.db);
      await grantQueue(other.id, d.queueId);
      const reversalId = newFundLedgerId();

      await expect(
        svc.reviseDisbursement(other.id, {
          reversal: {
            id: reversalId,
            encryptedPayload: Buffer.from("reverse"),
          },
          replacement: {
            id: newFundLedgerId(),
            encryptedPayload: Buffer.from("replace"),
          },
          orgKeyGeneration: 1,
          balance: balance(d.fundId, 1),
          caseNote: {
            followUpId: d.followUpId,
            ticketId: d.ticketId,
            encryptedContent: Buffer.from("not-yours"),
          },
          mayEditAnyNote: false,
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);

      expect(await ledgerRowExists(reversalId)).toBe(false);
      expect(await noteContent(d.followUpId)).toBe("original-envelope");
      expect((await fundBalance(d.fundId)).version).toBe(1);
      expect(onTicketChanged).not.toHaveBeenCalled();
    });

    it("lets a caller allowed to edit any note correct someone else's", async () => {
      const d = await recordedDisbursement();
      const manager = await createAdmin();
      await grantQueue(manager, d.queueId);

      await svc.reviseDisbursement(manager, {
        reversal: {
          id: newFundLedgerId(),
          encryptedPayload: Buffer.from("reverse"),
        },
        replacement: {
          id: newFundLedgerId(),
          encryptedPayload: Buffer.from("replace"),
        },
        orgKeyGeneration: 1,
        balance: balance(d.fundId, 1),
        caseNote: {
          followUpId: d.followUpId,
          ticketId: d.ticketId,
          encryptedContent: Buffer.from("corrected-by-manager"),
        },
        mayEditAnyNote: true,
      });

      expect(await noteContent(d.followUpId)).toBe("corrected-by-manager");
      expect(await noteTypeOf(d.followUpId)).toBeNull();
    });

    it("rewrites the case record through updateDisbursementWithin, never the note path", async () => {
      const d = await recordedDisbursement();
      const followUps = buildFollowUps();
      const updateDisbursementWithin = vi.spyOn(
        followUps,
        "updateDisbursementWithin",
      );
      const updateInternalNoteWithin = vi.spyOn(
        followUps,
        "updateInternalNoteWithin",
      );
      const spied = buildService(testDb.db, followUps);

      await spied.reviseDisbursement(d.authorId, {
        reversal: {
          id: newFundLedgerId(),
          encryptedPayload: Buffer.from("reverse"),
        },
        replacement: {
          id: newFundLedgerId(),
          encryptedPayload: Buffer.from("replace"),
        },
        orgKeyGeneration: 1,
        balance: balance(d.fundId, 1),
        caseNote: {
          followUpId: d.followUpId,
          ticketId: d.ticketId,
          encryptedContent: Buffer.from("revised-envelope"),
        },
        mayEditAnyNote: false,
      });

      expect(updateDisbursementWithin).toHaveBeenCalledTimes(1);
      expect(updateDisbursementWithin).toHaveBeenCalledWith(
        expect.anything(),
        d.authorId,
        d.followUpId,
        expect.any(Buffer),
        { anyAuthor: false },
      );
      expect(updateInternalNoteWithin).not.toHaveBeenCalled();
      expect(await noteContent(d.followUpId)).toBe("revised-envelope");
    });

    it("revises a disbursement without querying note types", async () => {
      const d = await recordedDisbursement();
      const recording = recordingDb();

      await buildService(recording.db).reviseDisbursement(d.authorId, {
        reversal: {
          id: newFundLedgerId(),
          encryptedPayload: Buffer.from("reverse"),
        },
        replacement: {
          id: newFundLedgerId(),
          encryptedPayload: Buffer.from("replace"),
        },
        orgKeyGeneration: 1,
        balance: balance(d.fundId, 1),
        caseNote: {
          followUpId: d.followUpId,
          ticketId: d.ticketId,
          encryptedContent: Buffer.from("revised-envelope"),
        },
        mayEditAnyNote: false,
      });

      expect(recording.queries.some((q) => namesTable(q, "followups"))).toBe(
        true,
      );
      expect(recording.queries.some((q) => namesTable(q, "note_types"))).toBe(
        false,
      );
    });

    /**
     * An ordinary internal note the disbursement's author wrote on the same
     * case, optionally carrying a note type.
     */
    async function ordinaryNote(
      d: { ticketId: TicketId; authorId: UserId },
      noteTypeId?: NoteTypeId,
    ): Promise<FollowupId> {
      const id = newFollowupId();
      await createFollowUpService(
        testDb.db,
        createTicketAccessChecker(testDb.db),
      ).create(d.authorId, {
        id,
        ticketId: d.ticketId,
        encryptedContent: Buffer.from("ordinary-note"),
        source: "volunteer",
        type: "internal_note",
        isPrivate: true,
        mentionedPseudonyms: [],
        noteTypeId,
      });
      return id;
    }

    it("refuses to rewrite an untyped note through the edit-any-note override", async () => {
      const d = await recordedDisbursement();
      const noteId = await ordinaryNote(d);
      const manager = await createAdmin();
      await grantQueue(manager, d.queueId);
      onTicketChanged.mockClear();
      const reversalId = newFundLedgerId();
      const replacementId = newFundLedgerId();

      await expect(
        svc.reviseDisbursement(manager, {
          reversal: {
            id: reversalId,
            encryptedPayload: Buffer.from("reverse"),
          },
          replacement: {
            id: replacementId,
            encryptedPayload: Buffer.from("replace"),
          },
          orgKeyGeneration: 1,
          balance: balance(d.fundId, 1),
          caseNote: {
            followUpId: noteId,
            ticketId: d.ticketId,
            encryptedContent: Buffer.from("overwritten"),
          },
          mayEditAnyNote: true,
        }),
      ).rejects.toThrow(ErrorCode.FOLLOWUP_NOT_EDITABLE);

      expect(await ledgerRowExists(reversalId)).toBe(false);
      expect(await ledgerRowExists(replacementId)).toBe(false);
      expect((await fundBalance(d.fundId)).version).toBe(1);
      expect(await noteContent(noteId)).toBe("ordinary-note");
      expect(onTicketChanged).not.toHaveBeenCalled();
    });

    it("refuses to rewrite a note of another type through the edit-any-note override", async () => {
      const d = await recordedDisbursement();
      const otherTypeId = await insertOrdinaryNoteType();
      const noteId = await ordinaryNote(d, otherTypeId);
      const manager = await createAdmin();
      await grantQueue(manager, d.queueId);
      onTicketChanged.mockClear();
      const reversalId = newFundLedgerId();
      const replacementId = newFundLedgerId();

      await expect(
        svc.reviseDisbursement(manager, {
          reversal: {
            id: reversalId,
            encryptedPayload: Buffer.from("reverse"),
          },
          replacement: {
            id: replacementId,
            encryptedPayload: Buffer.from("replace"),
          },
          orgKeyGeneration: 1,
          balance: balance(d.fundId, 1),
          caseNote: {
            followUpId: noteId,
            ticketId: d.ticketId,
            encryptedContent: Buffer.from("overwritten"),
          },
          mayEditAnyNote: true,
        }),
      ).rejects.toThrow(ErrorCode.FOLLOWUP_NOT_EDITABLE);

      expect(await ledgerRowExists(reversalId)).toBe(false);
      expect(await ledgerRowExists(replacementId)).toBe(false);
      expect((await fundBalance(d.fundId)).version).toBe(1);
      expect(await noteContent(noteId)).toBe("ordinary-note");
      expect(await noteTypeOf(noteId)).toBe(otherTypeId);
      expect(onTicketChanged).not.toHaveBeenCalled();
    });

    it("rolls back when the note belongs to a different case than the one named", async () => {
      const d = await recordedDisbursement();
      const reversalId = newFundLedgerId();

      await expect(
        svc.reviseDisbursement(d.authorId, {
          reversal: {
            id: reversalId,
            encryptedPayload: Buffer.from("reverse"),
          },
          replacement: {
            id: newFundLedgerId(),
            encryptedPayload: Buffer.from("replace"),
          },
          orgKeyGeneration: 1,
          balance: balance(d.fundId, 1),
          caseNote: {
            followUpId: d.followUpId,
            ticketId: newTicketId(),
            encryptedContent: Buffer.from("wrong-case"),
          },
          mayEditAnyNote: false,
        }),
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(await ledgerRowExists(reversalId)).toBe(false);
      expect(await noteContent(d.followUpId)).toBe("original-envelope");
      expect((await fundBalance(d.fundId)).version).toBe(1);
    });

    it("rolls back the entries and the note when the balance is stale", async () => {
      const d = await recordedDisbursement();
      const reversalId = newFundLedgerId();

      await expect(
        svc.reviseDisbursement(d.authorId, {
          reversal: {
            id: reversalId,
            encryptedPayload: Buffer.from("reverse"),
          },
          replacement: {
            id: newFundLedgerId(),
            encryptedPayload: Buffer.from("replace"),
          },
          orgKeyGeneration: 1,
          balance: balance(d.fundId, 0, "stale"),
          caseNote: {
            followUpId: d.followUpId,
            ticketId: d.ticketId,
            encryptedContent: Buffer.from("revised"),
          },
          mayEditAnyNote: false,
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(await ledgerRowExists(reversalId)).toBe(false);
      expect(await noteContent(d.followUpId)).toBe("original-envelope");
    });
  });

  // --- Fund manager notice ---

  describe("fund manager notice", () => {
    it("notifies MANAGE_FUNDS holders other than the actor", async () => {
      const manager = await createAdmin();
      const actor = await createAdmin();
      const fundId = await newFund();

      await svc.recordDisbursement(actor, {
        id: newFundLedgerId(),
        encryptedPayload: Buffer.from("spend"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0),
      });

      expect(dispatchTicketless).toHaveBeenCalledTimes(1);
      const call = dispatchTicketless.mock.calls[0]!;
      expect(call[1]).toBe(TEST_ORG_ID);
      expect(call[2]).toBe(testDb.schemaName);
      expect(call[4]).toBe("fund_entry_recorded");
      expect(call[5]).toContain(manager);
      expect(call[5]).not.toContain(actor);
    });

    it("does not notify volunteers, who lack MANAGE_FUNDS by default", async () => {
      await createAdmin();
      const volunteer = await createTestUser(testDb.db);
      const actor = await createAdmin();
      const fundId = await newFund();

      await svc.recordAdjustment(actor, {
        id: newFundLedgerId(),
        encryptedPayload: Buffer.from("adjust"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0),
      });

      const recipients = dispatchTicketless.mock.calls[0]![5];
      expect(recipients).not.toContain(volunteer.id);
    });

    it("sends nothing when the org has the notice turned off", async () => {
      await createAdmin();
      await testDb.db
        .updateTable("org_config")
        .set({ notify_fund_managers: false })
        .execute();
      const fundId = await newFund();

      await svc.recordAdjustment(await createAdmin(), {
        id: newFundLedgerId(),
        encryptedPayload: Buffer.from("adjust"),
        orgKeyGeneration: 1,
        balance: balance(fundId, 0),
      });

      expect(dispatchTicketless).not.toHaveBeenCalled();
    });

    it("keeps the entry when the notice fails", async () => {
      await createAdmin();
      dispatchTicketless.mockRejectedValueOnce(
        new InternalError("notification backend down"),
      );
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const fundId = await newFund();
      const id = newFundLedgerId();

      try {
        const recorded = await svc.recordAdjustment(await createAdmin(), {
          id,
          encryptedPayload: Buffer.from("adjust"),
          orgKeyGeneration: 1,
          balance: balance(fundId, 0),
        });
        expect(recorded.id).toBe(id);
      } finally {
        consoleError.mockRestore();
      }

      expect(await ledgerRowExists(id)).toBe(true);
    });
  });
});

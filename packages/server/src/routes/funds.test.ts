/**
 * DB integration tests for the funds tRPC router.
 *
 * Exercises the gates (VIEW_FUNDS for funds and balances, AUDIT_FUNDS for
 * the ledger, RECORD_DISBURSEMENTS for recording and correcting
 * disbursements, MANAGE_FUNDS for everything else), the base64 wire shape,
 * the balance compare-and-set, and the disbursement case note landing on
 * the case with its audit entry and outbox notice.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Selectable } from "kysely";
import { encode } from "@care-y/crypto";
import { createFundsRouter, type FundsRouterDeps } from "./funds.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { UsersTable } from "../db/types.js";
import {
  ErrorCode,
  RoleId,
  Permission,
  newFollowupId,
  newFundLedgerId,
  type SessionId,
  type SessionToken,
  type IpToken,
  type UaToken,
  type OrgSlug,
  type OrgSchema,
} from "@care-y/shared";
import {
  createTestDb,
  createTestUser,
  createTestTicketFixture,
  expectTrpcError,
  mockReq,
  mockRes,
  seedOrgPublicKey,
  testSealedBox,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { createTicketAccessChecker } from "../tickets/access.js";
import { createFollowUpService } from "../tickets/followup-service.js";
import { createAuditService } from "../tickets/audit.js";
import type { NotificationService } from "../notifications/service.js";
import { invalidateRolePermissionCache } from "../auth/roles.js";

const ENC_FUND = encode(Buffer.from("sealed-fund-payload"));
const ENC_FUND_2 = encode(Buffer.from("sealed-fund-payload-2"));
const ENC_ENTRY = encode(Buffer.from("sealed-ledger-payload"));
const ENC_NOTE = encode(Buffer.from("ticket-key-envelope-note"));
const ENC_NOTE_2 = encode(Buffer.from("ticket-key-envelope-note-2"));
const ENC_BALANCE = encode(Buffer.from("sealed-balance"));

describe.skipIf(!process.env.DATABASE_URL)("funds router", () => {
  let testDb: TestDb;
  let volunteer: Selectable<UsersTable>;
  let admin: Selectable<UsersTable>;

  const deps: FundsRouterDeps = {
    createTicketAccess: (db) => createTicketAccessChecker(db),
    createFollowUpSvc: (db, access, followUpDeps) =>
      createFollowUpService(db, access, followUpDeps),
    createAuditSvc: (db) => createAuditService(db),
    notificationService: {
      dispatch: vi.fn<NotificationService["dispatch"]>(),
      dispatchTicketless: vi
        .fn<NotificationService["dispatchTicketless"]>()
        .mockResolvedValue(undefined),
    },
  };
  const factory = createCallerFactory(
    router({ funds: createFundsRouter(deps) }),
  );

  function orgContext(): OrgContext {
    return {
      orgId: TEST_ORG_ID,
      orgSlug: "test-funds" as OrgSlug,
      orgSchema: testDb.schemaName as OrgSchema,
      tenantDb: testDb.db,
      sealedBox: testSealedBox,
    };
  }

  function callerFor(
    user: Selectable<UsersTable>,
    opts?: { twofaVerified?: boolean },
  ) {
    const ctx: Context = {
      req: mockReq(),
      res: mockRes(),
      org: orgContext(),
      session: {
        id: `00000000-0000-0000-0000-${user.id.slice(-12)}` as SessionId,
        token: `tok-${user.id}` as SessionToken,
        userId: user.id,
        ipToken: "ip-tok" as IpToken,
        uaToken: "ua-tok" as UaToken,
        expiresAt: new Date(Date.now() + 3_600_000),
        twofaVerified: opts?.twofaVerified ?? true,
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
        mustChangePassword: false,
      },
    };
    return factory(ctx);
  }

  function unauthedCaller() {
    const ctx: Context = {
      req: mockReq(),
      res: mockRes(),
      org: orgContext(),
      session: null,
      user: null,
    };
    return factory(ctx);
  }

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    volunteer = await createTestUser(testDb.db);
    admin = await createTestUser(testDb.db, {
      overrides: { role_id: RoleId.ADMIN },
    });
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  /** A fund created by the admin, its balance sealed at version 0. */
  async function newFund(): Promise<string> {
    const { id } = await callerFor(admin).funds.create({
      encryptedPayload: ENC_FUND,
      encryptedBalance: ENC_BALANCE,
    });
    return id;
  }

  function balance(
    fundId: string,
    expectedVersion: number,
  ): {
    fundId: string;
    encryptedBalance: string;
    expectedVersion: number;
    orgKeyGeneration: number;
  } {
    return {
      fundId,
      encryptedBalance: ENC_BALANCE,
      expectedVersion,
      orgKeyGeneration: testSealedBox.generation,
    };
  }

  async function ledgerIds(): Promise<string[]> {
    const rows = await testDb.db
      .selectFrom("fund_ledger")
      .select("id")
      .execute();
    return rows.map((r) => r.id);
  }

  describe("gates", () => {
    it("rejects an unauthenticated list", async () => {
      await expectTrpcError(unauthedCaller().funds.list(), "UNAUTHORIZED");
    });

    it("rejects reads before the second factor", async () => {
      const caller = callerFor(volunteer, { twofaVerified: false });
      await expectTrpcError(caller.funds.list(), "UNAUTHORIZED");
    });

    it("lets a volunteer read funds through the default VIEW_FUNDS", async () => {
      const caller = callerFor(volunteer);
      await expect(caller.funds.list()).resolves.toHaveProperty("funds");
    });

    it("keeps the ledger from a volunteer, who lacks AUDIT_FUNDS by default", async () => {
      await expectTrpcError(
        callerFor(volunteer).funds.listLedger(),
        "FORBIDDEN",
      );
    });

    it("lets an admin read the ledger through the default AUDIT_FUNDS", async () => {
      await expect(callerFor(admin).funds.listLedger()).resolves.toHaveProperty(
        "entries",
      );
    });

    it("refuses the ledger to an admin once an org withholds AUDIT_FUNDS", async () => {
      const orgSchema = testDb.schemaName as OrgSchema;
      await testDb.db
        .insertInto("role_permission_overrides")
        .values({
          role_id: RoleId.ADMIN,
          permission: Permission.AUDIT_FUNDS,
          enabled: false,
        })
        .execute();
      invalidateRolePermissionCache(orgSchema);

      try {
        const caller = callerFor(admin);
        await expectTrpcError(caller.funds.listLedger(), "FORBIDDEN");
        await expect(caller.funds.list()).resolves.toHaveProperty("funds");
      } finally {
        await testDb.db
          .deleteFrom("role_permission_overrides")
          .where("role_id", "=", RoleId.ADMIN)
          .where("permission", "=", Permission.AUDIT_FUNDS)
          .execute();
        invalidateRolePermissionCache(orgSchema);
      }
    });

    it("refuses fund reads once an org withholds VIEW_FUNDS", async () => {
      const orgSchema = testDb.schemaName as OrgSchema;
      await testDb.db
        .insertInto("role_permission_overrides")
        .values({
          role_id: RoleId.VOLUNTEER,
          permission: Permission.VIEW_FUNDS,
          enabled: false,
        })
        .execute();
      invalidateRolePermissionCache(orgSchema);

      try {
        await expectTrpcError(callerFor(volunteer).funds.list(), "FORBIDDEN");
      } finally {
        await testDb.db
          .deleteFrom("role_permission_overrides")
          .where("role_id", "=", RoleId.VOLUNTEER)
          .where("permission", "=", Permission.VIEW_FUNDS)
          .execute();
        invalidateRolePermissionCache(orgSchema);
      }
    });

    it("refuses fund administration to a volunteer", async () => {
      const caller = callerFor(volunteer);
      const fundId = await newFund();
      await expectTrpcError(
        caller.funds.create({
          encryptedPayload: ENC_FUND,
          encryptedBalance: ENC_BALANCE,
        }),
        "FORBIDDEN",
      );
      await expectTrpcError(
        caller.funds.update({ fundId, isActive: false }),
        "FORBIDDEN",
      );
      await expectTrpcError(
        caller.funds.recordAdjustment({
          id: newFundLedgerId(),
          encryptedPayload: ENC_ENTRY,
          balance: balance(fundId, 0),
        }),
        "FORBIDDEN",
      );
      await expectTrpcError(
        caller.funds.setBalance({ balance: balance(fundId, 0) }),
        "FORBIDDEN",
      );
      await expectTrpcError(caller.funds.getSettings(), "FORBIDDEN");
      await expectTrpcError(
        caller.funds.updateSettings({ notifyFundManagers: false }),
        "FORBIDDEN",
      );
    });

    it("refuses a disbursement once an org withholds RECORD_DISBURSEMENTS", async () => {
      // Volunteers hold the key by default; an org override takes it away.
      const orgSchema = testDb.schemaName as OrgSchema;
      await testDb.db
        .insertInto("role_permission_overrides")
        .values({
          role_id: RoleId.VOLUNTEER,
          permission: Permission.RECORD_DISBURSEMENTS,
          enabled: false,
        })
        .execute();
      invalidateRolePermissionCache(orgSchema);

      const fundId = await newFund();
      try {
        const caller = callerFor(volunteer);
        await expectTrpcError(
          caller.funds.recordDisbursement({
            id: newFundLedgerId(),
            encryptedPayload: ENC_ENTRY,
            balance: balance(fundId, 0),
          }),
          "FORBIDDEN",
        );
        await expectTrpcError(
          caller.funds.reviseDisbursement({
            reversal: { id: newFundLedgerId(), encryptedPayload: ENC_ENTRY },
            replacement: { id: newFundLedgerId(), encryptedPayload: ENC_ENTRY },
            balance: balance(fundId, 0),
            caseNote: {
              followUpId: newFollowupId(),
              ticketId: "00000000-0000-4000-8000-00000000beef",
              encryptedContent: ENC_NOTE,
            },
          }),
          "FORBIDDEN",
        );
      } finally {
        await testDb.db
          .deleteFrom("role_permission_overrides")
          .where("role_id", "=", RoleId.VOLUNTEER)
          .where("permission", "=", Permission.RECORD_DISBURSEMENTS)
          .execute();
        invalidateRolePermissionCache(orgSchema);
      }
    });
  });

  describe("funds", () => {
    it("creates, lists and updates a fund as base64url ciphertext", async () => {
      const caller = callerFor(admin);

      const { id } = await caller.funds.create({
        encryptedPayload: ENC_FUND,
        encryptedBalance: ENC_BALANCE,
      });
      const listed = (await caller.funds.list()).funds.find((f) => f.id === id);
      expect(listed?.encryptedPayload).toBe(ENC_FUND);
      expect(listed?.encryptedBalance).toBe(ENC_BALANCE);
      expect(listed?.balanceVersion).toBe(0);
      expect(listed?.isActive).toBe(true);
      expect(listed?.orgKeyGeneration).toBe(testSealedBox.generation);
      expect(typeof listed?.createdAt).toBe("string");

      await expect(
        caller.funds.update({
          fundId: id,
          encryptedPayload: ENC_FUND_2,
          isActive: false,
        }),
      ).resolves.toEqual({ success: true });

      const updated = (await caller.funds.list()).funds.find(
        (f) => f.id === id,
      );
      expect(updated?.encryptedPayload).toBe(ENC_FUND_2);
      expect(updated?.isActive).toBe(false);
    });

    it("answers NOT_FOUND for an unknown fund", async () => {
      await expectTrpcError(
        callerFor(admin).funds.update({
          fundId: "00000000-0000-4000-8000-00000000f00d",
          isActive: false,
        }),
        "NOT_FOUND",
      );
    });
  });

  describe("ledger", () => {
    it("records an adjustment and lists it with a day-granular date", async () => {
      const caller = callerFor(admin);
      const fundId = await newFund();
      const id = newFundLedgerId();

      const recorded = await caller.funds.recordAdjustment({
        id,
        encryptedPayload: ENC_ENTRY,
        balance: balance(fundId, 0),
      });
      expect(recorded.id).toBe(id);
      expect(recorded.entryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(recorded.balanceVersion).toBe(1);

      const entry = (await caller.funds.listLedger()).entries.find(
        (e) => e.id === id,
      );
      expect(entry).toEqual({
        id,
        encryptedPayload: ENC_ENTRY,
        orgKeyGeneration: testSealedBox.generation,
        entryDate: recorded.entryDate,
      });
    });

    it("records a volunteer's disbursement with its case note", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const worker = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where("id", "=", fixture.userId!)
        .executeTakeFirstOrThrow();
      const fundId = await newFund();
      const followUpId = newFollowupId();

      const recorded = await callerFor(worker).funds.recordDisbursement({
        id: newFundLedgerId(),
        encryptedPayload: ENC_ENTRY,
        balance: balance(fundId, 0),
        caseNote: {
          followUpId,
          ticketId: fixture.ticketId,
          encryptedContent: ENC_NOTE,
        },
      });
      expect(recorded.entryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(recorded.balanceVersion).toBe(1);

      const note = await testDb.db
        .selectFrom("followups")
        .select(["type", "is_private", "encrypted_content"])
        .where("id", "=", followUpId)
        .executeTakeFirstOrThrow();
      expect(note.type).toBe("internal_note");
      expect(note.is_private).toBe(true);
      expect(encode(note.encrypted_content)).toBe(ENC_NOTE);
    });

    it("audits and enqueues the case note as followup_added", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const worker = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where("id", "=", fixture.userId!)
        .executeTakeFirstOrThrow();

      await callerFor(worker).funds.recordDisbursement({
        id: newFundLedgerId(),
        encryptedPayload: ENC_ENTRY,
        balance: balance(await newFund(), 0),
        caseNote: {
          followUpId: newFollowupId(),
          ticketId: fixture.ticketId,
          encryptedContent: ENC_NOTE,
        },
      });

      // Both writes are best-effort and run after the response resolves.
      await vi.waitFor(async () => {
        const audit = await testDb.db
          .selectFrom("audit_log")
          .select(["event_type", "actor_id"])
          .where("ticket_id", "=", fixture.ticketId)
          .execute();
        expect(audit).toEqual([
          { event_type: "followup_added", actor_id: worker.id },
        ]);
      });
      await vi.waitFor(async () => {
        const outbox = await testDb.db
          .selectFrom("notification_outbox")
          .select(["event_type", "queue_id", "actor_user_id"])
          .where("ticket_id", "=", fixture.ticketId)
          .execute();
        expect(outbox).toEqual([
          {
            event_type: "followup_added",
            queue_id: fixture.queueId,
            actor_user_id: worker.id,
          },
        ]);
      });
    });

    it("answers FUND_BALANCE_STALE when the balance moved since the caller read it", async () => {
      const caller = callerFor(admin);
      const fundId = await newFund();
      await caller.funds.setBalance({ balance: balance(fundId, 0) });
      const id = newFundLedgerId();

      await expectTrpcError(
        caller.funds.recordAdjustment({
          id,
          encryptedPayload: ENC_ENTRY,
          balance: balance(fundId, 0),
        }),
        "CONFLICT",
        ErrorCode.FUND_BALANCE_STALE,
      );

      expect(await ledgerIds()).not.toContain(id);
      const listed = (await caller.funds.list()).funds.find(
        (f) => f.id === fundId,
      );
      expect(listed?.balanceVersion).toBe(1);
    });

    it("lets the author revise a disbursement in one call", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const worker = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where("id", "=", fixture.userId!)
        .executeTakeFirstOrThrow();
      const caller = callerFor(worker);
      const fundId = await newFund();
      const followUpId = newFollowupId();
      await caller.funds.recordDisbursement({
        id: newFundLedgerId(),
        encryptedPayload: ENC_ENTRY,
        balance: balance(fundId, 0),
        caseNote: {
          followUpId,
          ticketId: fixture.ticketId,
          encryptedContent: ENC_NOTE,
        },
      });
      const reversalId = newFundLedgerId();
      const replacementId = newFundLedgerId();

      const revised = await caller.funds.reviseDisbursement({
        reversal: { id: reversalId, encryptedPayload: ENC_ENTRY },
        replacement: { id: replacementId, encryptedPayload: ENC_ENTRY },
        balance: balance(fundId, 1),
        caseNote: {
          followUpId,
          ticketId: fixture.ticketId,
          encryptedContent: ENC_NOTE_2,
        },
      });

      expect(revised.entryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(revised.balanceVersion).toBe(2);
      const ids = (await callerFor(admin).funds.listLedger()).entries.map(
        (e) => e.id,
      );
      expect(ids).toEqual(expect.arrayContaining([reversalId, replacementId]));
      const note = await testDb.db
        .selectFrom("followups")
        .select("encrypted_content")
        .where("id", "=", followUpId)
        .executeTakeFirstOrThrow();
      expect(encode(note.encrypted_content)).toBe(ENC_NOTE_2);
    });

    it("rolls the whole revision back when the note rewrite fails", async () => {
      const fixture = await createTestTicketFixture(testDb.db, {
        createUser: true,
      });
      const worker = await testDb.db
        .selectFrom("users")
        .selectAll()
        .where("id", "=", fixture.userId!)
        .executeTakeFirstOrThrow();
      const caller = callerFor(worker);
      const fundId = await newFund();
      await caller.funds.recordDisbursement({
        id: newFundLedgerId(),
        encryptedPayload: ENC_ENTRY,
        balance: balance(fundId, 0),
        caseNote: {
          followUpId: newFollowupId(),
          ticketId: fixture.ticketId,
          encryptedContent: ENC_NOTE,
        },
      });
      const reversalId = newFundLedgerId();
      const replacementId = newFundLedgerId();

      // The balance and both ledger rows are written before the note, so a
      // note that does not exist makes the last step fail.
      await expectTrpcError(
        caller.funds.reviseDisbursement({
          reversal: { id: reversalId, encryptedPayload: ENC_ENTRY },
          replacement: { id: replacementId, encryptedPayload: ENC_ENTRY },
          balance: balance(fundId, 1),
          caseNote: {
            followUpId: newFollowupId(),
            ticketId: fixture.ticketId,
            encryptedContent: ENC_NOTE_2,
          },
        }),
        "NOT_FOUND",
        ErrorCode.FOLLOWUP_NOT_FOUND,
      );

      const ids = await ledgerIds();
      expect(ids).not.toContain(reversalId);
      expect(ids).not.toContain(replacementId);
      const listed = (await caller.funds.list()).funds.find(
        (f) => f.id === fundId,
      );
      expect(listed?.balanceVersion).toBe(1);
    });

    it("lets a fund manager set a recomputed balance", async () => {
      const caller = callerFor(admin);
      const fundId = await newFund();

      await expect(
        caller.funds.setBalance({ balance: balance(fundId, 0) }),
      ).resolves.toEqual({ balanceVersion: 1 });
      await expectTrpcError(
        caller.funds.setBalance({ balance: balance(fundId, 0) }),
        "CONFLICT",
        ErrorCode.FUND_BALANCE_STALE,
      );
    });

    it("refuses a balance sealed under a newer generation without the resealed payload", async () => {
      const caller = callerFor(admin);
      const fundId = await newFund();

      await expectTrpcError(
        caller.funds.setBalance({
          balance: {
            ...balance(fundId, 0),
            orgKeyGeneration: testSealedBox.generation + 1,
          },
        }),
        "CONFLICT",
        ErrorCode.FUND_BALANCE_STALE,
      );
      await expect(
        caller.funds.setBalance({
          balance: {
            ...balance(fundId, 0),
            orgKeyGeneration: testSealedBox.generation + 1,
            encryptedPayload: ENC_FUND_2,
          },
        }),
      ).resolves.toEqual({ balanceVersion: 1 });
      const listed = (await caller.funds.list()).funds.find(
        (f) => f.id === fundId,
      );
      expect(listed?.encryptedPayload).toBe(ENC_FUND_2);
      expect(listed?.orgKeyGeneration).toBe(testSealedBox.generation + 1);
    });

    it("refuses a case note on a case the caller cannot reach", async () => {
      const fixture = await createTestTicketFixture(testDb.db);
      const id = newFundLedgerId();

      await expectTrpcError(
        callerFor(volunteer).funds.recordDisbursement({
          id,
          encryptedPayload: ENC_ENTRY,
          balance: balance(await newFund(), 0),
          caseNote: {
            followUpId: newFollowupId(),
            ticketId: fixture.ticketId,
            encryptedContent: ENC_NOTE,
          },
        }),
        "FORBIDDEN",
      );

      const entries = (await callerFor(admin).funds.listLedger()).entries;
      expect(entries.some((e) => e.id === id)).toBe(false);
    });
  });

  describe("settings", () => {
    it("reads and writes the fund manager notice toggle", async () => {
      const caller = callerFor(admin);

      await expect(caller.funds.getSettings()).resolves.toEqual({
        notifyFundManagers: true,
      });
      await caller.funds.updateSettings({ notifyFundManagers: false });
      await expect(caller.funds.getSettings()).resolves.toEqual({
        notifyFundManagers: false,
      });
      await caller.funds.updateSettings({ notifyFundManagers: true });
    });
  });
});

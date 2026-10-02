/**
 * Fund and ledger service (ADR-109). Repository folded in.
 *
 * The server stores opaque org-key ciphertext for every fund, every fund
 * balance and every ledger entry and reads none of it. The browser seals
 * each new balance; the server applies it only while the fund's
 * `balance_version` still matches the one the browser read, so two
 * entries recorded at once cannot both build on the same starting
 * balance. A disbursement recorded from a case writes the balance, the
 * ledger entry, which names no case in plaintext, and a `disbursement`
 * follow-up on the case in one transaction; the sealed contents are the
 * only link between the two. This service is the only writer of that
 * follow-up type. The server sees the ticket id and the ledger id
 * together only for the length of that request.
 */

import type { Kysely, Transaction } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type {
  FollowupId,
  FundId,
  FundLedgerId,
  OrgId,
  OrgSchema,
  OrgSlug,
  QueueId,
  TicketId,
  UserId,
} from "@care-y/shared";
import { ErrorCode, Permission } from "@care-y/shared";
import { ConflictError, NotFoundError } from "../errors.js";
import type {
  CreateWithinResult,
  FollowUpService,
  UpdateWithinResult,
} from "../tickets/followup-service.js";
import type { NotificationService } from "../notifications/service.js";
import { listActiveUserIdsWithPermission } from "../auth/roles.js";
import { createOrgConfigService } from "../org/org-config-service.js";

export interface FundRecord {
  readonly id: FundId;
  readonly encryptedPayload: Buffer;
  readonly encryptedBalance: Buffer;
  readonly balanceVersion: number;
  readonly isActive: boolean;
  readonly sortOrder: number;
  readonly orgKeyGeneration: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface FundLedgerRecord {
  readonly id: FundLedgerId;
  readonly encryptedPayload: Buffer;
  readonly orgKeyGeneration: number;
  /** Calendar day the database stamped the entry, `YYYY-MM-DD`. */
  readonly entryDate: string;
}

/**
 * A new sealed balance for a fund and the `balance_version` the caller
 * read it against.
 */
export interface FundBalanceWrite {
  readonly fundId: FundId;
  readonly encryptedBalance: Buffer;
  readonly expectedVersion: number;
  /** Org Key generation the balance was sealed under. The row moves to it. */
  readonly orgKeyGeneration: number;
  /**
   * The fund payload resealed under `orgKeyGeneration`. Required when the
   * row is stamped with another generation; the write is refused without it.
   */
  readonly encryptedPayload?: Buffer;
}

/** One ledger row as the client minted it. */
export interface LedgerRowInput {
  /** Client-minted; a case note envelope may name it. */
  readonly id: FundLedgerId;
  readonly encryptedPayload: Buffer;
}

export interface RecordEntryInput extends LedgerRowInput {
  readonly orgKeyGeneration: number;
  readonly balance: FundBalanceWrite;
}

/** The case half of a disbursement: a `disbursement` follow-up on the case. */
export interface DisbursementCaseNote {
  readonly followUpId: FollowupId;
  readonly ticketId: TicketId;
  readonly encryptedContent: Buffer;
}

export interface RecordDisbursementInput extends RecordEntryInput {
  readonly caseNote?: DisbursementCaseNote;
}

export interface ReviseDisbursementInput {
  readonly reversal: LedgerRowInput;
  readonly replacement: LedgerRowInput;
  readonly orgKeyGeneration: number;
  readonly balance: FundBalanceWrite;
  /** The existing note, rewritten in place. */
  readonly caseNote: DisbursementCaseNote;
  /**
   * The caller holds MANAGE_FUNDS and may rewrite a disbursement note
   * someone else wrote. Otherwise only the note's author may.
   */
  readonly mayEditAnyNote: boolean;
}

export interface RecordedLedgerEntry {
  readonly id: FundLedgerId;
  readonly entryDate: string;
  readonly balanceVersion: number;
}

export interface RevisedDisbursement {
  /** Day the replacement entry was stamped. */
  readonly entryDate: string;
  readonly balanceVersion: number;
}

/** The case a new note landed on, as the outbox routes it. */
export interface CaseNoteTicket {
  readonly id: TicketId;
  readonly queueId: QueueId;
  readonly assignedTo: UserId | null;
}

/** Org identity the ticketless fund-manager notice is addressed from. */
export interface FundOrgScope {
  readonly orgId: OrgId;
  readonly orgSchema: OrgSchema;
  readonly orgSlug: OrgSlug;
}

export interface FundServiceDeps {
  readonly org: FundOrgScope;
  /** Follow-up service for the same tenant, writing the case note. */
  readonly followUps: FollowUpService;
  readonly notificationService: NotificationService;
  /**
   * Audit entry and `followup_added` outbox notice for the case a new
   * note landed on. The router binds it to the same lifecycle notifier
   * the tickets router uses. Called once the note has committed.
   */
  readonly announceCaseNote: (ticket: CaseNoteTicket) => void;
}

export interface FundService {
  /** Every fund, active or not, in sort order. */
  list(): Promise<FundRecord[]>;
  /** A new fund. The client seals its opening balance at zero. */
  create(input: {
    readonly encryptedPayload: Buffer;
    readonly encryptedBalance: Buffer;
    readonly orgKeyGeneration: number;
  }): Promise<{ id: FundId }>;
  /** Replace the payload, change isActive, or both. */
  updateFund(
    fundId: FundId,
    input: {
      readonly encryptedPayload?: Buffer;
      readonly isActive?: boolean;
    },
  ): Promise<void>;
  /** All ledger entries, newest day first. */
  listLedger(): Promise<FundLedgerRecord[]>;
  /**
   * Record a disbursement and the balance it leaves, with its case note
   * when one is given. Everything commits together or not at all.
   */
  recordDisbursement(
    userId: UserId,
    input: RecordDisbursementInput,
  ): Promise<RecordedLedgerEntry>;
  /**
   * Record an adjustment or reversal and the balance it leaves. Fund-level
   * only.
   */
  recordAdjustment(
    userId: UserId,
    input: RecordEntryInput,
  ): Promise<RecordedLedgerEntry>;
  /**
   * Correct a disbursement. The reversal, the replacement, the rewritten
   * case note and the new balance commit together or not at all.
   */
  reviseDisbursement(
    userId: UserId,
    input: ReviseDisbursementInput,
  ): Promise<RevisedDisbursement>;
  /** Overwrite a fund's sealed balance, compare-and-set only. */
  setBalance(write: FundBalanceWrite): Promise<{ balanceVersion: number }>;
}

export function createFundService(
  db: Kysely<TenantDatabase>,
  deps: FundServiceDeps,
): FundService {
  /**
   * Every balance write goes through here. Applies the new sealed balance
   * only while the stored version still matches the one the caller read,
   * moves the row to the generation the balance was sealed under, and
   * returns the version it now carries. A mismatch throws, which rolls
   * back the caller's transaction.
   *
   * A write sealed under a generation other than the row's must bring the
   * fund payload resealed under it; otherwise the row would hold its two
   * columns under different generations, so the write is refused as stale.
   * Moving the whole row also makes a key-rotation reseal of the same row,
   * which only updates rows below its generation, skip it.
   *
   * A balance write does not touch `updated_at`. The ledger stores only a
   * date so a ledger row cannot be paired with the case note written in the
   * same transaction, and a per-write timestamp on the fund row would
   * re-create that pairing. Only metadata edits (`updateFund`) stamp it.
   */
  async function applyBalance(
    trx: Transaction<TenantDatabase>,
    balance: FundBalanceWrite,
  ): Promise<number> {
    const { encryptedPayload } = balance;
    let update = trx
      .updateTable("funds")
      .set((eb) => ({
        encrypted_balance: balance.encryptedBalance,
        balance_version: eb("balance_version", "+", 1),
        org_key_generation: balance.orgKeyGeneration,
        ...(encryptedPayload !== undefined
          ? { encrypted_payload: encryptedPayload }
          : {}),
      }))
      .where("id", "=", balance.fundId)
      .where("balance_version", "=", balance.expectedVersion);
    if (encryptedPayload === undefined) {
      update = update.where(
        "org_key_generation",
        "=",
        balance.orgKeyGeneration,
      );
    }
    const updated = await update
      .returning("balance_version")
      .executeTakeFirst();
    if (updated) return updated.balance_version;

    const exists = await trx
      .selectFrom("funds")
      .select("id")
      .where("id", "=", balance.fundId)
      .executeTakeFirst();
    if (!exists) throw new NotFoundError(ErrorCode.FUND_NOT_FOUND);
    throw new ConflictError(ErrorCode.FUND_BALANCE_STALE);
  }

  /** Insert one ledger row and read back the day the database stamped. */
  async function insertLedgerEntry(
    trx: Transaction<TenantDatabase>,
    row: LedgerRowInput,
    orgKeyGeneration: number,
  ): Promise<{ id: FundLedgerId; entryDate: string }> {
    const inserted = await trx
      .insertInto("fund_ledger")
      .values({
        id: row.id,
        encrypted_payload: row.encryptedPayload,
        org_key_generation: orgKeyGeneration,
      })
      .returning((eb) => [
        "id",
        eb.cast<string>("entry_date", "text").as("entry_date"),
      ])
      .executeTakeFirstOrThrow();
    return { id: inserted.id, entryDate: inserted.entry_date };
  }

  /**
   * Tell every other MANAGE_FUNDS holder an entry landed, when the org
   * has that turned on. The notice carries no ticket, fund or amount.
   * Best-effort: the entry has already committed.
   */
  async function notifyFundManagers(actorId: UserId): Promise<void> {
    try {
      const enabled = await createOrgConfigService(db).getNotifyFundManagers();
      if (!enabled) return;

      const holders = await listActiveUserIdsWithPermission(
        db,
        deps.org.orgSchema,
        Permission.MANAGE_FUNDS,
      );
      const recipients = holders.filter((id) => id !== actorId);
      if (recipients.length === 0) return;

      await deps.notificationService.dispatchTicketless(
        db,
        deps.org.orgId,
        deps.org.orgSchema,
        deps.org.orgSlug,
        "fund_entry_recorded",
        recipients,
      );
    } catch (_notifyErr: unknown) {
      // Notification failure must not fail an entry that has committed.
      console.error("Failed to notify fund managers of a ledger entry");
    }
  }

  return {
    async list() {
      const rows = await db
        .selectFrom("funds")
        .select([
          "id",
          "encrypted_payload",
          "encrypted_balance",
          "balance_version",
          "is_active",
          "sort_order",
          "org_key_generation",
          "created_at",
          "updated_at",
        ])
        .orderBy("sort_order", "asc")
        .orderBy("id", "asc")
        .execute();

      return rows.map((r) => ({
        id: r.id,
        encryptedPayload: r.encrypted_payload,
        encryptedBalance: r.encrypted_balance,
        balanceVersion: r.balance_version,
        isActive: r.is_active,
        sortOrder: r.sort_order,
        orgKeyGeneration: r.org_key_generation,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    },

    async create(input) {
      const { max } = await db
        .selectFrom("funds")
        .select((eb) =>
          eb.fn.coalesce(eb.fn.max("sort_order"), eb.lit(0)).as("max"),
        )
        .executeTakeFirstOrThrow();

      const row = await db
        .insertInto("funds")
        .values({
          encrypted_payload: input.encryptedPayload,
          encrypted_balance: input.encryptedBalance,
          sort_order: max + 1,
          org_key_generation: input.orgKeyGeneration,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      return { id: row.id };
    },

    async updateFund(fundId, input) {
      const hasPayload = input.encryptedPayload !== undefined;
      const hasActive = input.isActive !== undefined;

      if (!hasPayload && !hasActive) {
        const existing = await db
          .selectFrom("funds")
          .select("id")
          .where("id", "=", fundId)
          .executeTakeFirst();
        if (!existing) throw new NotFoundError(ErrorCode.FUND_NOT_FOUND);
        return;
      }

      const result = await db
        .updateTable("funds")
        .set({
          ...(input.encryptedPayload !== undefined
            ? { encrypted_payload: input.encryptedPayload }
            : {}),
          ...(input.isActive !== undefined
            ? { is_active: input.isActive }
            : {}),
          updated_at: new Date(),
        })
        .where("id", "=", fundId)
        .executeTakeFirst();

      if (result.numUpdatedRows === 0n) {
        throw new NotFoundError(ErrorCode.FUND_NOT_FOUND);
      }
    },

    async listLedger() {
      const rows = await db
        .selectFrom("fund_ledger")
        .select((eb) => [
          "id",
          "encrypted_payload",
          "org_key_generation",
          eb.cast<string>("entry_date", "text").as("entry_date"),
        ])
        .orderBy("fund_ledger.entry_date", "desc")
        .orderBy("id", "asc")
        .execute();

      return rows.map((r) => ({
        id: r.id,
        encryptedPayload: r.encrypted_payload,
        orgKeyGeneration: r.org_key_generation,
        entryDate: r.entry_date,
      }));
    },

    async recordDisbursement(userId, input) {
      const { caseNote, balance } = input;

      // The balance, the ledger row and the case note commit together.
      // The follow-up service checks the actor's access to the ticket
      // inside the same transaction, so a refused note leaves no ledger
      // row and no balance change either.
      const committed = await db.transaction().execute(async (trx) => {
        const balanceVersion = await applyBalance(trx, balance);
        const entry = await insertLedgerEntry(
          trx,
          input,
          input.orgKeyGeneration,
        );
        let note: CreateWithinResult | null = null;
        let ticket: CaseNoteTicket | null = null;
        if (caseNote !== undefined) {
          note = await deps.followUps.createWithin(trx, userId, {
            id: caseNote.followUpId,
            ticketId: caseNote.ticketId,
            type: "disbursement",
            source: "volunteer",
            isPrivate: true,
            encryptedContent: caseNote.encryptedContent,
            mentionedPseudonyms: [],
            attachments: [],
          });
          const row = await trx
            .selectFrom("tickets")
            .select(["id", "queue_id", "assigned_to"])
            .where("id", "=", caseNote.ticketId)
            .executeTakeFirstOrThrow();
          ticket = {
            id: row.id,
            queueId: row.queue_id,
            assignedTo: row.assigned_to,
          };
        }
        return { entry, balanceVersion, note, ticket };
      });

      if (
        caseNote !== undefined &&
        committed.note !== null &&
        committed.ticket !== null
      ) {
        deps.followUps.finishCreate(committed.note, caseNote.ticketId);
        deps.announceCaseNote(committed.ticket);
      }

      await notifyFundManagers(userId);
      return { ...committed.entry, balanceVersion: committed.balanceVersion };
    },

    async recordAdjustment(userId, input) {
      const { balance } = input;
      const committed = await db.transaction().execute(async (trx) => {
        const balanceVersion = await applyBalance(trx, balance);
        const entry = await insertLedgerEntry(
          trx,
          input,
          input.orgKeyGeneration,
        );
        return { ...entry, balanceVersion };
      });
      await notifyFundManagers(userId);
      return committed;
    },

    async reviseDisbursement(userId, input) {
      const { balance, caseNote } = input;

      // The follow-up service checks the actor's access to the note's
      // ticket and its author rule inside the same transaction, so a
      // refused edit leaves no ledger rows and no balance change. The
      // follow-up service reads the row's type itself and refuses any
      // follow-up that is not a disbursement, which rolls back the ledger
      // rows written before it.
      const committed = await db.transaction().execute(async (trx) => {
        const balanceVersion = await applyBalance(trx, balance);
        await insertLedgerEntry(trx, input.reversal, input.orgKeyGeneration);
        const replacement = await insertLedgerEntry(
          trx,
          input.replacement,
          input.orgKeyGeneration,
        );
        const note: UpdateWithinResult =
          await deps.followUps.updateDisbursementWithin(
            trx,
            userId,
            caseNote.followUpId,
            caseNote.encryptedContent,
            { anyAuthor: input.mayEditAnyNote },
          );
        // The note must belong to the case the caller named; otherwise
        // the whole revision rolls back.
        if (note.row.ticket_id !== caseNote.ticketId) {
          throw new NotFoundError(ErrorCode.FOLLOWUP_NOT_FOUND);
        }
        return { entryDate: replacement.entryDate, balanceVersion, note };
      });

      deps.followUps.finishUpdate(committed.note);
      await notifyFundManagers(userId);
      return {
        entryDate: committed.entryDate,
        balanceVersion: committed.balanceVersion,
      };
    },

    async setBalance(write) {
      const balanceVersion = await db
        .transaction()
        .execute(async (trx) => applyBalance(trx, write));
      return { balanceVersion };
    },
  };
}

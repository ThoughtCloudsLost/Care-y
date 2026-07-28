/**
 * Client management service.
 *
 * Wraps ClientRepository and PhoneRepository with business logic for
 * listing, alias editing, phone replacement, and duplicate detection.
 * All phone operations use FieldEncryptor/BlindIndexer from OPS_SECRETS_KEY.
 * Audit entries log { clientId, actorId } only, never phone numbers.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { AuditService } from "../tickets/audit.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import type {
  MergeService,
  MergeEventRecord,
} from "../tickets/merge-service.js";
import { NotFoundError, ConflictError } from "../errors.js";
import { ErrorCode } from "@care-y/shared";
import type { TicketStatus } from "@care-y/shared";
import { sanitizeLike } from "../utils/sql.js";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface ClientListRecord {
  readonly id: string;
  readonly alias: string;
  readonly encryptedNumber: Buffer;
  readonly ticketCount: number;
  readonly createdAt: Date;
  readonly mergedInto: string | null;
}

export interface ClientTicketRecord {
  readonly id: string;
  readonly encryptedTitle: Buffer;
  readonly status: TicketStatus;
  readonly priority: string;
  readonly createdAt: Date;
  readonly keyGeneration: string;
  readonly onHold: boolean;
  /** Follow-up count, needed to derive the display status shape. */
  readonly followUpCount: number;
}

export interface ClientDetailRecord extends ClientListRecord {
  readonly phoneId: string;
  readonly phoneHash: string;
  readonly tickets: readonly ClientTicketRecord[];
  readonly mergeHistory: readonly MergeEventRecord[];
}

export interface PhoneConflict {
  readonly conflictingClientId: string;
  readonly conflictingClientAlias: string;
}

export interface UpdatePhoneResult {
  readonly success: boolean;
  readonly conflict: PhoneConflict | null;
}

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface ClientService {
  list(input: {
    query: string;
    sortBy: string;
    sortDirection: string;
    limit: number;
    cursor?: string;
    hasApplications?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    includeMerged?: boolean;
  }): Promise<ClientListRecord[]>;

  getById(clientId: string): Promise<ClientDetailRecord>;

  updateAlias(clientId: string, alias: string, actorId: string): Promise<void>;

  updatePhone(
    clientId: string,
    phoneNumber: string,
    actorId: string,
  ): Promise<UpdatePhoneResult>;

  suggestDuplicates(
    phoneHash: string,
    excludeClientId?: string,
  ): Promise<PhoneConflict | null>;
}

// ---------------------------------------------------------------------------
// Unique constraint detection
// ---------------------------------------------------------------------------

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "23505"
  );
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export interface ClientServiceDeps {
  readonly db: Kysely<TenantDatabase>;
  readonly audit: AuditService;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly mergeService: MergeService;
  readonly orgId: string;
}

export function createClientService(deps: ClientServiceDeps): ClientService {
  const { db, audit, encryptor, indexer, mergeService, orgId } = deps;

  return {
    async list(input): Promise<ClientListRecord[]> {
      const sortColumn =
        input.sortBy === "alias"
          ? ("c.alias" as const)
          : input.sortBy === "created_at"
            ? ("c.created_at" as const)
            : null;
      const direction =
        input.sortDirection === "desc" ? ("desc" as const) : ("asc" as const);

      let query = db
        .selectFrom("clients as c")
        .innerJoin("phones as p", "p.id", "c.phone_id")
        .select([
          "c.id",
          "c.alias",
          "c.created_at",
          "c.merged_into",
          "p.encrypted_number",
        ])
        .select((eb) =>
          eb
            .selectFrom("tickets as t")
            .select(eb.fn.countAll<number>().as("cnt"))
            .whereRef("t.client_id", "=", "c.id")
            .as("ticketCount"),
        );
      // Exclude merged clients by default; include them only when asked
      if (input.includeMerged !== true) {
        query = query.where("c.merged_into", "is", null);
      }

      // Search filter (alias ILIKE)
      if (input.query.length > 0) {
        const escaped = sanitizeLike(input.query);
        query = query.where("c.alias", "ilike", `%${escaped}%`);
      }

      // Has-applications filter: reuses the tickets table that the count
      // subquery already references. EXISTS/NOT EXISTS is the correct SQL
      // form because ticketCount is a SELECT alias, not filterable in WHERE.
      if (input.hasApplications === true) {
        query = query.where((eb) =>
          eb.exists(
            eb
              .selectFrom("tickets as tf")
              .select(eb.lit(1).as("one"))
              .whereRef("tf.client_id", "=", "c.id"),
          ),
        );
      } else if (input.hasApplications === false) {
        query = query.where((eb) =>
          eb.not(
            eb.exists(
              eb
                .selectFrom("tickets as tf")
                .select(eb.lit(1).as("one"))
                .whereRef("tf.client_id", "=", "c.id"),
            ),
          ),
        );
      }

      // Created-date range filter
      if (input.createdAfter !== undefined) {
        query = query.where("c.created_at", ">=", new Date(input.createdAfter));
      }
      if (input.createdBefore !== undefined) {
        query = query.where(
          "c.created_at",
          "<=",
          new Date(input.createdBefore),
        );
      }

      // Cursor pagination: keyset approach on (sortColumn, id)
      if (input.cursor !== undefined) {
        const cursorRow = await db
          .selectFrom("clients")
          .select(["id", "alias", "created_at"])
          .where("id", "=", input.cursor)
          .executeTakeFirst();

        if (cursorRow) {
          if (sortColumn === "c.alias") {
            query = query.where((eb) =>
              eb.or([
                eb("c.alias", direction === "asc" ? ">" : "<", cursorRow.alias),
                eb.and([
                  eb("c.alias", "=", cursorRow.alias),
                  eb("c.id", ">", cursorRow.id),
                ]),
              ]),
            );
          } else if (sortColumn === "c.created_at") {
            query = query.where((eb) =>
              eb.or([
                eb(
                  "c.created_at",
                  direction === "asc" ? ">" : "<",
                  cursorRow.created_at,
                ),
                eb.and([
                  eb("c.created_at", "=", cursorRow.created_at),
                  eb("c.id", ">", cursorRow.id),
                ]),
              ]),
            );
          } else {
            // ticket_count sort: fall through to offset-based (subquery sort
            // columns cannot be keyset-paged), just filter by id > cursor
            query = query.where("c.id", ">", cursorRow.id);
          }
        }
      }

      // Sort
      if (sortColumn) {
        query = query.orderBy(sortColumn, direction).orderBy("c.id", "asc");
      } else {
        // ticket_count sort: order by the subquery alias
        query = query.orderBy("ticketCount", direction).orderBy("c.id", "asc");
      }

      const rows = await query.limit(input.limit).execute();

      return rows.map((r) => ({
        id: r.id,
        alias: r.alias,
        encryptedNumber: r.encrypted_number,
        ticketCount: r.ticketCount ?? 0,
        createdAt: r.created_at,
        mergedInto: r.merged_into,
      }));
    },

    async getById(clientId): Promise<ClientDetailRecord> {
      const row = await db
        .selectFrom("clients as c")
        .innerJoin("phones as p", "p.id", "c.phone_id")
        .select([
          "c.id",
          "c.alias",
          "c.created_at",
          "c.merged_into",
          "c.phone_id",
          "p.encrypted_number",
          "p.phone_hash",
        ])
        .select((eb) =>
          eb
            .selectFrom("tickets as t")
            .select(eb.fn.countAll<number>().as("cnt"))
            .whereRef("t.client_id", "=", "c.id")
            .as("ticketCount"),
        )
        .where("c.id", "=", clientId)
        .where("c.merged_into", "is", null)
        .executeTakeFirst();

      if (!row) {
        throw new NotFoundError(ErrorCode.CLIENT_NOT_FOUND);
      }

      // Fetch tickets for this client
      const tickets = await db
        .selectFrom("tickets as t")
        .select([
          "t.id",
          "t.encrypted_title",
          "t.status",
          "t.priority",
          "t.created_at",
          "t.key_generation",
          "t.on_hold",
        ])
        .select((eb) =>
          eb
            .selectFrom("followups as f")
            .select((sb) => sb.fn.countAll().as("cnt"))
            .whereRef("f.ticket_id", "=", "t.id")
            .as("followup_count"),
        )
        .where("t.client_id", "=", clientId)
        .orderBy("t.created_at", "desc")
        .execute();

      // Fetch merge history
      const mergeHistory = await mergeService.listByClient(clientId);

      return {
        id: row.id,
        alias: row.alias,
        encryptedNumber: row.encrypted_number,
        ticketCount: row.ticketCount ?? 0,
        createdAt: row.created_at,
        mergedInto: row.merged_into,
        phoneId: row.phone_id,
        phoneHash: row.phone_hash,
        tickets: tickets.map((t) => ({
          id: t.id,
          encryptedTitle: t.encrypted_title,
          status: t.status,
          priority: t.priority,
          createdAt: t.created_at,
          keyGeneration: t.key_generation,
          onHold: t.on_hold,
          followUpCount: Number(t.followup_count ?? 0),
        })),
        mergeHistory,
      };
    },

    async updateAlias(clientId, alias, actorId): Promise<void> {
      // Verify client exists and is not merged
      const existing = await db
        .selectFrom("clients")
        .select(["id", "alias", "merged_into"])
        .where("id", "=", clientId)
        .executeTakeFirst();

      if (existing?.merged_into !== null) {
        throw new NotFoundError(ErrorCode.CLIENT_NOT_FOUND);
      }

      const previousAlias = existing.alias;

      try {
        await db
          .updateTable("clients")
          .set({ alias, updated_at: new Date() })
          .where("id", "=", clientId)
          .execute();
      } catch (err: unknown) {
        if (isUniqueViolation(err)) {
          throw new ConflictError(ErrorCode.CLIENT_ALIAS_CONFLICT);
        }
        throw err;
      }

      await audit.log({
        eventType: "client_alias_changed",
        actorId,
        metadata: { clientId, previousAlias },
      });
    },

    async updatePhone(
      clientId,
      phoneNumber,
      actorId,
    ): Promise<UpdatePhoneResult> {
      // phoneNumber arrives as a JS string from the tRPC input layer and cannot
      // be zeroed. The encryptor copies it into a Buffer and zeroes that copy in
      // its own finally block; the blind indexer HMACs the string without
      // buffering. Zeroing a Buffer here would only clear a third copy nobody
      // reads, so it is left out rather than implying a guarantee that the
      // string plaintext is scrubbed. It stays live until GC.
      const encryptedNumber = encryptor.encrypt(phoneNumber);
      const phoneHash = indexer.hash(phoneNumber, orgId);

      // Check for hash collision before starting the transaction
      const conflict = await this.suggestDuplicates(phoneHash, clientId);
      if (conflict) {
        return { success: false, conflict };
      }

      await db.transaction().execute(async (trx) => {
        // Verify client exists and is not merged
        const client = await trx
          .selectFrom("clients")
          .select(["id", "phone_id", "merged_into"])
          .where("id", "=", clientId)
          .executeTakeFirst();

        if (client?.merged_into !== null) {
          throw new NotFoundError(ErrorCode.CLIENT_NOT_FOUND);
        }

        const oldPhoneId = client.phone_id;

        // 1. Insert new phone row (so phone_id FK is valid before re-pointing)
        const newPhone = await trx
          .insertInto("phones")
          .values({
            phone_hash: phoneHash,
            encrypted_number: encryptedNumber,
            locale: "en-US",
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        // 2. Re-point client to new phone
        await trx
          .updateTable("clients")
          .set({ phone_id: newPhone.id, updated_at: new Date() })
          .where("id", "=", clientId)
          .execute();

        // 3. Delete old phone row (never soft-delete; lingering phone_hash
        //    would produce false duplicate matches)
        await trx.deleteFrom("phones").where("id", "=", oldPhoneId).execute();
      });

      await audit.log({
        eventType: "client_phone_changed",
        actorId,
        metadata: { clientId },
      });

      return { success: true, conflict: null };
    },

    async suggestDuplicates(
      phoneHash,
      excludeClientId,
    ): Promise<PhoneConflict | null> {
      let query = db
        .selectFrom("phones as p")
        .innerJoin("clients as c", "c.phone_id", "p.id")
        .select(["c.id as clientId", "c.alias as clientAlias"])
        .where("p.phone_hash", "=", phoneHash)
        .where("c.merged_into", "is", null);

      if (excludeClientId !== undefined) {
        query = query.where("c.id", "!=", excludeClientId);
      }

      const row = await query.executeTakeFirst();

      if (!row) {
        return null;
      }

      return {
        conflictingClientId: row.clientId,
        conflictingClientAlias: row.clientAlias,
      };
    },
  };
}

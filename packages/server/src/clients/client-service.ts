/**
 * Client management service.
 *
 * Wraps ClientRepository and PhoneRepository with business logic for
 * listing, alias editing, phone replacement, and duplicate detection.
 * All phone operations use FieldEncryptor/BlindIndexer from OPS_SECRETS_KEY.
 * Aliases are org-key encrypted: the server stores ciphertext and a
 * browser-supplied blind index hash but never reads the alias value.
 * Audit entries log { clientId, actorId } only, never phone numbers.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import { keysetAfter } from "../db/keyset.js";
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
import type {
  ClientId,
  UserId,
  OrgId,
  PhoneHash,
  PhoneMatchHash,
  AliasHash,
  KeyGeneration,
  PhoneId,
  TicketId,
} from "@care-y/shared";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface ClientListRecord {
  readonly id: ClientId;
  readonly encryptedAlias: Buffer;
  readonly aliasHash: AliasHash | null;
  readonly encryptedNumber: Buffer | null;
  readonly phoneMatchHash: PhoneMatchHash | null;
  readonly ticketCount: number;
  readonly createdAt: Date;
  readonly mergedInto: ClientId | null;
}

export interface ClientTicketRecord {
  readonly id: TicketId;
  readonly encryptedTitle: Buffer;
  readonly status: TicketStatus;
  readonly priority: string;
  readonly createdAt: Date;
  readonly keyGeneration: KeyGeneration;
  readonly onHold: boolean;
  /** Follow-up count, needed to derive the display status shape. */
  readonly followUpCount: number;
}

export interface ClientDetailRecord extends ClientListRecord {
  readonly phoneId: PhoneId | null;
  readonly phoneHash: PhoneHash | null;
  readonly tickets: readonly ClientTicketRecord[];
  readonly mergeHistory: readonly MergeEventRecord[];
}

export interface PhoneConflict {
  readonly conflictingClientId: ClientId;
  readonly conflictingClientEncryptedAlias: Buffer;
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
    cursor?: ClientId;
    hasApplications?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    includeMerged?: boolean;
    aliasHash?: AliasHash;
  }): Promise<ClientListRecord[]>;

  getById(clientId: ClientId): Promise<ClientDetailRecord>;

  updateAlias(
    clientId: ClientId,
    encryptedAlias: string,
    aliasHash: AliasHash,
    actorId: UserId,
  ): Promise<void>;

  backfillAliasHash(clientId: ClientId, aliasHash: AliasHash): Promise<void>;

  backfillPhoneMatchHash(
    clientId: ClientId,
    phoneMatchHash: PhoneMatchHash,
  ): Promise<void>;

  updatePhone(
    clientId: ClientId,
    phoneNumber: string,
    actorId: UserId,
    phoneMatchHash?: PhoneMatchHash | null,
  ): Promise<UpdatePhoneResult>;

  suggestDuplicates(
    phoneHash: PhoneHash,
    excludeClientId?: ClientId,
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
  readonly orgId: OrgId;
}

export function createClientService(deps: ClientServiceDeps): ClientService {
  const { db, audit, encryptor, indexer, mergeService } = deps;

  return {
    async list(input): Promise<ClientListRecord[]> {
      const direction =
        input.sortDirection === "desc" ? ("desc" as const) : ("asc" as const);

      let query = db
        .selectFrom("clients as c")
        .leftJoin("phones as p", "p.id", "c.phone_id")
        .select([
          "c.id",
          "c.encrypted_alias",
          "c.alias_hash",
          "c.created_at",
          "c.merged_into",
          "p.encrypted_number",
          "p.phone_match_hash",
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

      // Exact-alias lookup via blind index hash
      if (input.aliasHash !== undefined && input.aliasHash.length > 0) {
        query = query.where("c.alias_hash", "=", input.aliasHash);
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

      // Cursor pagination: keyset on (created_at, id).
      if (input.cursor !== undefined) {
        const cursorId = input.cursor;
        if (input.sortBy === "created_at") {
          query = query.where((eb) =>
            keysetAfter(
              eb,
              direction === "asc" ? ">" : "<",
              [
                [
                  "c.created_at",
                  eb
                    .selectFrom("clients as cur")
                    .select("cur.created_at")
                    .where("cur.id", "=", cursorId),
                ],
              ],
              { column: "c.id", cursorId },
            ),
          );
        } else {
          // ticket_count sort: the sort column is a subquery and cannot be
          // keyset-paged, so this degrades to an id-ordered walk.
          query = query.where("c.id", ">", cursorId);
        }
      }

      // Sort: default is created_at, also supports ticket_count
      if (input.sortBy === "ticket_count") {
        query = query.orderBy("ticketCount", direction).orderBy("c.id", "asc");
      } else {
        // "created_at" (default)
        query = query.orderBy("c.created_at", direction).orderBy("c.id", "asc");
      }

      const rows = await query.limit(input.limit).execute();

      return rows.map((r) => ({
        id: r.id,
        encryptedAlias: r.encrypted_alias,
        aliasHash: r.alias_hash,
        encryptedNumber: r.encrypted_number ?? null,
        phoneMatchHash: r.phone_match_hash ?? null,
        ticketCount: r.ticketCount ?? 0,
        createdAt: r.created_at,
        mergedInto: r.merged_into,
      }));
    },

    async getById(clientId): Promise<ClientDetailRecord> {
      const row = await db
        .selectFrom("clients as c")
        .leftJoin("phones as p", "p.id", "c.phone_id")
        .select([
          "c.id",
          "c.encrypted_alias",
          "c.alias_hash",
          "c.created_at",
          "c.merged_into",
          "c.phone_id",
          "p.encrypted_number",
          "p.phone_hash",
          "p.phone_match_hash",
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
        encryptedAlias: row.encrypted_alias,
        aliasHash: row.alias_hash,
        encryptedNumber: row.encrypted_number ?? null,
        ticketCount: row.ticketCount ?? 0,
        createdAt: row.created_at,
        mergedInto: row.merged_into,
        phoneId: row.phone_id ?? null,
        phoneHash: row.phone_hash ?? null,
        phoneMatchHash: row.phone_match_hash ?? null,
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

    async updateAlias(
      clientId,
      encryptedAlias,
      aliasHash,
      actorId,
    ): Promise<void> {
      // Verify client exists and is not merged
      const existing = await db
        .selectFrom("clients")
        .select(["id", "merged_into"])
        .where("id", "=", clientId)
        .executeTakeFirst();

      if (existing?.merged_into !== null) {
        throw new NotFoundError(ErrorCode.CLIENT_NOT_FOUND);
      }

      try {
        await db
          .updateTable("clients")
          // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is sealed ciphertext decoded from base64; alias_hash is a browser-computed HMAC. The server cannot read either.
          .set({
            encrypted_alias: Buffer.from(encryptedAlias, "base64"),
            alias_hash: aliasHash,
            updated_at: new Date(),
          })
          .where("id", "=", clientId)
          .execute();
      } catch (err: unknown) {
        if (isUniqueViolation(err)) {
          throw new ConflictError(ErrorCode.CLIENT_ALIAS_CONFLICT);
        }
        throw err;
      }

      // Metadata carries the client id only. Aliases are operator-supplied free
      // text, so both the old and new value may name a real person, and the
      // audit log is never encrypted. Recording the previous value would
      // preserve it past the correction that was meant to remove it. Matches
      // client_phone_changed, which logs the id alone for the same reason.
      await audit.log({
        eventType: "client_alias_changed",
        actorId,
        metadata: { clientId },
      });
    },

    async backfillAliasHash(clientId, aliasHash): Promise<void> {
      // Write only when the row's hash is currently NULL (idempotent:
      // deterministic hash means concurrent backfills agree).
      try {
        await db
          .updateTable("clients")
          // care-y-ignore-next-line no-plaintext-db-write -- alias_hash is a browser-computed HMAC of the normalized alias, not the alias itself.
          .set({ alias_hash: aliasHash })
          .where("id", "=", clientId)
          .where("alias_hash", "is", null)
          .execute();
      } catch (err: unknown) {
        if (isUniqueViolation(err)) {
          // Two clients share a label. Surface it rather than swallowing.
          throw new ConflictError(ErrorCode.CLIENT_ALIAS_CONFLICT);
        }
        throw err;
      }
    },

    async backfillPhoneMatchHash(clientId, phoneMatchHash): Promise<void> {
      // Tolerate clients with null phone_id (web-intake, no phone row).
      const client = await db
        .selectFrom("clients")
        .select("phone_id")
        .where("id", "=", clientId)
        .executeTakeFirst();

      const phoneId = client?.phone_id ?? null;
      if (phoneId === null) return;

      // Write only when the row's hash is currently NULL (idempotent).
      // care-y-ignore-next-line no-plaintext-db-write -- phone_match_hash is a browser-computed HMAC blind index, not the phone number itself.
      await db
        .updateTable("phones")
        .set({ phone_match_hash: phoneMatchHash })
        .where("id", "=", phoneId)
        .where("phone_match_hash", "is", null)
        .execute();
    },

    async updatePhone(
      clientId,
      phoneNumber,
      actorId,
      phoneMatchHash,
    ): Promise<UpdatePhoneResult> {
      // phoneNumber arrives as a JS string from the tRPC input layer and cannot
      // be zeroed. The encryptor copies it into a Buffer and zeroes that copy in
      // its own finally block; the blind indexer HMACs the string without
      // buffering. Zeroing a Buffer here would only clear a third copy nobody
      // reads, so it is left out rather than implying a guarantee that the
      // string is scrubbed. It stays live until GC.
      const encryptedNumber = encryptor.encrypt(phoneNumber);
      const phoneHash = indexer.hashPhone(phoneNumber, deps.orgId);

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
            phone_match_hash: phoneMatchHash ?? null,
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
      // Inner join is correct here: phone-less clients (web intake, phone_id
      // NULL) have no phone hash to match against, so they should never appear
      // as duplicate suggestions.
      let query = db
        .selectFrom("phones as p")
        .innerJoin("clients as c", "c.phone_id", "p.id")
        .select([
          "c.id as clientId",
          "c.encrypted_alias as clientEncryptedAlias",
        ])
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
        conflictingClientEncryptedAlias: row.clientEncryptedAlias,
      };
    },
  };
}

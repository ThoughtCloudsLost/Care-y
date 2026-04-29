/**
 * Client repository: find-or-create pattern keyed by phone hash.
 *
 * When an inbound call or SMS arrives, the handler hashes the caller's
 * number and calls findOrCreateByPhoneHash. If the phone is new, a
 * phone record and client record are created together. The client gets
 * an auto-generated alias ("adjective-noun-number").
 *
 * Alias collisions (PostgreSQL unique constraint 23505) are retried
 * up to 5 times with a fresh alias each attempt.
 */

import type { Kysely, Selectable } from "kysely";
import type { ClientsTable, TenantDatabase } from "../../db/types.js";
import type { PhoneRecord, PhoneRepository } from "./phone-repo.js";
import { generateAlias } from "./alias-generator.js";
import { ConflictError } from "../../errors.js";
import { ErrorCode } from "@care-y/shared";

const MAX_ALIAS_RETRIES = 5;

export interface ClientRecord {
  readonly id: string;
  readonly alias: string;
  readonly phoneId: string;
}

export interface FindOrCreateResult {
  readonly client: ClientRecord;
  readonly phone: PhoneRecord;
  readonly isNew: boolean;
}

export interface ClientRepository {
  findOrCreateByPhoneHash(
    phoneHash: string,
    encryptedNumber: Buffer,
  ): Promise<FindOrCreateResult>;
  findById(id: string): Promise<ClientRecord | null>;
  findByPhoneId(phoneId: string): Promise<ClientRecord | null>;
}

function mapClientRow(row: Selectable<ClientsTable>): ClientRecord {
  return {
    id: row.id,
    alias: row.alias,
    phoneId: row.phone_id,
  };
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === "23505"
  );
}

/**
 * Inserts a client row with the given generated label and phone reference.
 * The label is a random pseudonym (e.g. "calm-pebble-7"), not PII.
 * Extracted to isolate the DB write from the retry loop.
 */
async function insertClientRow(
  db: Kysely<TenantDatabase>,
  generatedLabel: string,
  phoneId: string,
): Promise<Selectable<ClientsTable>> {
  return db
    .insertInto("clients")
    .values({
      alias: generatedLabel,
      phone_id: phoneId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function createClientRepository(
  db: Kysely<TenantDatabase>,
  phoneRepo: PhoneRepository,
): ClientRepository {
  return {
    async findOrCreateByPhoneHash(
      phoneHash: string,
      encryptedNumber: Buffer,
    ): Promise<FindOrCreateResult> {
      // 1. Check for existing phone
      const existingPhone = await phoneRepo.findByHash(phoneHash);

      if (existingPhone) {
        // 2. Look up client by phone_id
        const clientRow = await db
          .selectFrom("clients")
          .selectAll()
          .where("phone_id", "=", existingPhone.id)
          .executeTakeFirst();

        if (clientRow) {
          return {
            client: mapClientRow(clientRow),
            phone: existingPhone,
            isNew: false,
          };
        }
      }

      // 3. Create new phone record
      const phone = await phoneRepo.create({
        phoneHash,
        encryptedNumber,
      });

      // 4. Create client with generated pseudonym, retrying on unique constraint violation
      for (let attempt = 0; attempt < MAX_ALIAS_RETRIES; attempt++) {
        try {
          const clientRow = await insertClientRow(
            db,
            generateAlias(),
            phone.id,
          );

          return {
            client: mapClientRow(clientRow),
            phone,
            isNew: true,
          };
        } catch (err: unknown) {
          if (isUniqueViolation(err)) {
            continue;
          }
          throw err;
        }
      }

      throw new ConflictError(ErrorCode.ALIAS_GENERATION_FAILED);
    },

    async findById(id: string): Promise<ClientRecord | null> {
      const row = await db
        .selectFrom("clients")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();

      if (!row) return null;
      return mapClientRow(row);
    },

    async findByPhoneId(phoneId: string): Promise<ClientRecord | null> {
      const row = await db
        .selectFrom("clients")
        .selectAll()
        .where("phone_id", "=", phoneId)
        .where("merged_into", "is", null)
        .executeTakeFirst();

      if (!row) return null;
      return mapClientRow(row);
    },
  };
}

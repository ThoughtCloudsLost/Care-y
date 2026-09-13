/**
 * Client repository: find-or-create pattern keyed by phone hash.
 *
 * When an inbound call or SMS arrives, the handler hashes the caller's
 * number and calls findOrCreateByPhoneHash. If the phone is new, a
 * phone record and client record are created together. The client gets
 * an auto-generated alias sealed with the org public key. The alias_hash
 * is NULL because no browser session exists to compute it; it is lazily
 * backfilled on first decrypt.
 *
 * Generated aliases are structurally unique: the numeric suffix is
 * drawn from a per-org sequence so no two generated aliases can collide.
 */

import type { Kysely, Selectable } from "kysely";
import type { ClientsTable, TenantDatabase } from "../../db/types.js";
import type { PhoneRecord, PhoneRepository } from "./phone-repo.js";
import { generateAlias } from "./alias-generator.js";
import { sealString } from "../crypto-helpers.js";
import type { SealedBoxEncryptor } from "../../crypto/sealed-box.js";
import type {
  ClientId,
  PhoneId,
  PhoneHash,
  PhoneMatchHash,
  AliasHash,
} from "@care-y/shared";

export interface ClientRecord {
  readonly id: ClientId;
  readonly encryptedAlias: Buffer;
  readonly aliasHash: AliasHash | null;
  readonly phoneId: PhoneId | null;
}

export interface FindOrCreateResult {
  readonly client: ClientRecord;
  readonly phone: PhoneRecord;
  readonly isNew: boolean;
}

export interface ClientRepository {
  findOrCreateByPhoneHash(
    phoneHash: PhoneHash,
    encryptedNumber: Buffer,
    phoneMatchHash?: PhoneMatchHash | null,
  ): Promise<FindOrCreateResult>;
  findById(id: ClientId): Promise<ClientRecord | null>;
  findByPhoneId(phoneId: PhoneId): Promise<ClientRecord | null>;
}

function mapClientRow(row: Selectable<ClientsTable>): ClientRecord {
  return {
    id: row.id,
    encryptedAlias: row.encrypted_alias,
    aliasHash: row.alias_hash,
    phoneId: row.phone_id,
  };
}

export function createClientRepository(
  db: Kysely<TenantDatabase>,
  phoneRepo: PhoneRepository,
  sealedBox: SealedBoxEncryptor,
): ClientRepository {
  return {
    async findOrCreateByPhoneHash(
      phoneHash: PhoneHash,
      encryptedNumber: Buffer,
      phoneMatchHash?: PhoneMatchHash | null,
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
        phoneMatchHash: phoneMatchHash ?? null,
      });

      // 4. Seal the generated label (sealString zeroes the input Buffer).
      const sealedLabel = sealString(sealedBox, await generateAlias(db));

      // Scoped to the two lines the rule flags rather than the whole file, so
      // a future write added here is still checked.
      const clientRow = await db
        // care-y-ignore-next-line no-plaintext-db-write -- writes ciphertext only, see the value list below
        .insertInto("clients")
        // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is sealed ciphertext from sealString above; alias_hash is null; phone_id is a FK, not a number
        .values({
          encrypted_alias: sealedLabel,
          alias_hash: null,
          phone_id: phone.id,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return {
        client: mapClientRow(clientRow),
        phone,
        isNew: true,
      };
    },

    async findById(id: ClientId): Promise<ClientRecord | null> {
      const row = await db
        .selectFrom("clients")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();

      if (!row) return null;
      return mapClientRow(row);
    },

    async findByPhoneId(phoneId: PhoneId): Promise<ClientRecord | null> {
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

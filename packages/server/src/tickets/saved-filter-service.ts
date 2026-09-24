/**
 * Shared saved filter CRUD service.
 *
 * Saved filters are org-key-encrypted filter presets that volunteers can
 * share with their organization. The server holds ciphertext for name
 * and state; color and icon are plaintext display metadata.
 * The encrypted columns are org-tier sealed, subject to reseal after
 * org key rotation.
 *
 * Ownership: the creating volunteer. Only the owner may share (create)
 * or unshare (delete). Any volunteer with VIEW_CASES can list.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { SavedFilterId, UserId } from "@care-y/shared";
import { ErrorCode } from "@care-y/shared";
import { NotFoundError, ForbiddenError } from "../errors.js";

export interface SharedSavedFilterRecord {
  readonly id: SavedFilterId;
  readonly ownerId: UserId;
  readonly encryptedName: Buffer;
  readonly encryptedState: Buffer;
  readonly color: string;
  readonly icon: string;
  readonly createdAt: Date;
}

export interface SavedFilterService {
  /** List all shared saved filters (org-wide read). */
  list(): Promise<SharedSavedFilterRecord[]>;

  /** Share a filter: insert a new row owned by the caller. */
  share(input: {
    ownerId: UserId;
    encryptedName: Buffer;
    encryptedState: Buffer;
    color: string;
    icon: string;
    orgKeyGeneration: number;
  }): Promise<SharedSavedFilterRecord>;

  /** Unshare (delete) a filter. Only the owner may call this. */
  unshare(filterId: SavedFilterId, callerId: UserId): Promise<void>;
}

function toRecord(row: {
  id: SavedFilterId;
  owner_id: UserId;
  encrypted_name: Buffer;
  encrypted_state: Buffer;
  color: string;
  icon: string;
  created_at: Date;
}): SharedSavedFilterRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    encryptedName: row.encrypted_name,
    encryptedState: row.encrypted_state,
    color: row.color,
    icon: row.icon,
    createdAt: row.created_at,
  };
}

export function createSavedFilterService(
  db: Kysely<TenantDatabase>,
): SavedFilterService {
  return {
    async list(): Promise<SharedSavedFilterRecord[]> {
      const rows = await db
        .selectFrom("saved_filters")
        .select([
          "id",
          "owner_id",
          "encrypted_name",
          "encrypted_state",
          "color",
          "icon",
          "created_at",
        ])
        .orderBy("created_at", "asc")
        .execute();
      return rows.map(toRecord);
    },

    async share(input): Promise<SharedSavedFilterRecord> {
      const row = await db
        .insertInto("saved_filters")
        .values({
          owner_id: input.ownerId,
          encrypted_name: input.encryptedName,
          encrypted_state: input.encryptedState,
          color: input.color,
          icon: input.icon,
          org_key_generation: input.orgKeyGeneration,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return toRecord(row);
    },

    async unshare(filterId: SavedFilterId, callerId: UserId): Promise<void> {
      // Look up the row to distinguish not-found from not-owner.
      const existing = await db
        .selectFrom("saved_filters")
        .select(["id", "owner_id"])
        .where("id", "=", filterId)
        .executeTakeFirst();

      if (!existing) {
        throw new NotFoundError(ErrorCode.SAVED_FILTER_NOT_FOUND);
      }

      if (existing.owner_id !== callerId) {
        throw new ForbiddenError(ErrorCode.SAVED_FILTER_NOT_OWNER);
      }

      await db.deleteFrom("saved_filters").where("id", "=", filterId).execute();
    },
  };
}

/**
 * User service: read-only queries against the tenant users table.
 *
 * Created for the @mention autocomplete feature. The route
 * handler delegates to this service rather than querying the DB directly
 * (layer separation per code-standards.md).
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

export interface VolunteerListRecord {
  readonly id: string;
  readonly encryptedDisplayName: Buffer;
}

export interface AdminUserListRecord {
  readonly id: string;
  readonly encryptedIdentifier: Buffer;
  readonly encryptedDisplayName: Buffer;
  readonly roleId: string;
  readonly isActive: boolean;
  readonly hasKeys: boolean;
  readonly hasOrgKeyWrap: boolean;
  readonly volPublic: Buffer | null;
}

export interface UserService {
  listActiveVolunteers(): Promise<readonly VolunteerListRecord[]>;
  listAllForAdmin(): Promise<readonly AdminUserListRecord[]>;
  listActiveIdsByRoleId(roleId: string): Promise<readonly string[]>;
}

export function createUserService(db: Kysely<TenantDatabase>): UserService {
  return {
    async listActiveVolunteers(): Promise<readonly VolunteerListRecord[]> {
      const rows = await db
        .selectFrom("users")
        .select(["id", "encrypted_display_name"])
        .where("is_active", "=", true)
        .execute();

      return rows.map((r) => ({
        id: r.id,
        encryptedDisplayName: r.encrypted_display_name,
      }));
    },

    async listAllForAdmin(): Promise<readonly AdminUserListRecord[]> {
      const rows = await db
        .selectFrom("users")
        .select([
          "users.id",
          "users.encrypted_identifier",
          "users.encrypted_display_name",
          "users.role_id",
          "users.is_active",
        ])
        .select((eb) => [
          eb
            .selectFrom("user_keys")
            .select(eb.fn.countAll<string>().as("c"))
            .whereRef("user_keys.user_id", "=", "users.id")
            .as("key_count"),
          eb
            .selectFrom("wrapped_org_keys")
            .select(eb.fn.countAll<string>().as("c"))
            .whereRef("wrapped_org_keys.user_id", "=", "users.id")
            .as("wrap_count"),
          eb
            .selectFrom("user_keys")
            .select("user_keys.vol_public")
            .whereRef("user_keys.user_id", "=", "users.id")
            .as("vol_public"),
        ])
        .execute();

      return rows.map((r) => ({
        id: r.id,
        encryptedIdentifier: r.encrypted_identifier,
        encryptedDisplayName: r.encrypted_display_name,
        roleId: r.role_id,
        isActive: r.is_active,
        hasKeys: Number(r.key_count ?? 0) > 0,
        hasOrgKeyWrap: Number(r.wrap_count ?? 0) > 0,
        volPublic: r.vol_public ?? null,
      }));
    },

    async listActiveIdsByRoleId(roleId): Promise<readonly string[]> {
      const rows = await db
        .selectFrom("users")
        .select("id")
        .where("role_id", "=", roleId)
        .where("is_active", "=", true)
        .execute();

      return rows.map((r) => r.id);
    },
  };
}

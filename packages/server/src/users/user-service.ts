/**
 * User service: read-only queries against the tenant users table.
 *
 * Created for the @mention autocomplete feature. The route
 * handler delegates to this service rather than querying the DB directly
 * (layer separation per code-standards.md).
 */

import type { Kysely } from "kysely";
import { meetsRoleThreshold } from "@care-y/shared";
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
  /**
   * Active users holding a key wrap for a ticket.
   *
   * Distinct volunteer IDs from `ticket_key_wraps`, restricted to users who
   * are still active. Used to resolve note-type escalation targets to people
   * who can actually decrypt the ticket.
   */
  listActiveKeyWrapHolderIds(ticketId: string): Promise<readonly string[]>;
  /**
   * Narrows a set of user IDs to those whose role meets `minRoleId`.
   *
   * Role comparison uses the shared threshold helper so route and service
   * layers agree on ordering.
   */
  filterByRoleThreshold(
    userIds: readonly string[],
    minRoleId: string,
  ): Promise<readonly string[]>;
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

    async listActiveKeyWrapHolderIds(ticketId): Promise<readonly string[]> {
      const rows = await db
        .selectFrom("ticket_key_wraps as tkw")
        .innerJoin("users as u", "u.id", "tkw.volunteer_id")
        .select("tkw.volunteer_id")
        .where("tkw.ticket_id", "=", ticketId)
        .where("u.is_active", "=", true)
        .groupBy("tkw.volunteer_id")
        .execute();

      return rows.map((r) => r.volunteer_id);
    },

    async filterByRoleThreshold(
      userIds,
      minRoleId,
    ): Promise<readonly string[]> {
      // An empty `in ()` list is not valid SQL, so short-circuit before
      // building the query rather than relying on the caller to check.
      if (userIds.length === 0) return [];

      const rows = await db
        .selectFrom("users")
        .select(["id", "role_id"])
        .where("id", "in", [...userIds])
        .execute();

      return rows
        .filter((u) => meetsRoleThreshold(u.role_id, minRoleId))
        .map((u) => u.id);
    },
  };
}
